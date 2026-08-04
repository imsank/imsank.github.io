---
layout: course
title: "Life of an LLM Request"
description: "Trace an online LLM request from API input and scheduling through prefill, decode, streaming, termination, and cleanup."
course: true
chapter_number: 0
chapter_title: "Foundation (Prerequisites)"
section_number: "0.1"
section_order: 1
next_url: /ai/llm-inference-engineering/foundation/transformer-inference-refresher/
next_title: "Transformer Inference Refresher"
permalink: /ai/llm-inference-engineering/foundation/life-of-an-llm-request/
---

<!-- Generated from G_prep_mle_course. Edit the authoritative Markdown source, then republish. -->

## Why This Section Exists

You already know what a Transformer does mathematically. The inference-engineering
shift is to stop seeing `model.generate()` as one operation.

An online generation request crosses several boundaries:

```text
Client
  → API and validation
  → prompt rendering
  → tokenization
  → admission and scheduling
  → prefill
  → persistent KV-cache state
  → repeated decode iterations
  → sampling
  → detokenization and streaming
  → termination and cleanup
```

Each stage has different owners, resources, failure modes, and latency. A model
can be perfectly healthy while the product is slow because requests wait in a
queue. The GPU can be fast while users see broken text because incremental
detokenization is wrong. Output quality can collapse even though the weights did
not change because the serving stack used the wrong chat template.

Current production engines make these boundaries explicit. vLLM separates API
processing, scheduling, model execution, and output processing; TensorRT-LLM
describes an executor loop built around a scheduler, KV-cache manager, model
engine, sampler, and output handling
([vLLM architecture](https://docs.vllm.ai/en/stable/design/arch_overview/),
[TensorRT-LLM architecture](https://nvidia.github.io/TensorRT-LLM/developer-guide/overview.html)).

The goal of this section is a mental simulator: after reading it, you should be
able to pause a request at any moment and say what state exists, who owns it, and
what must happen next.

---

{% include course_visuals/request_lifecycle.html %}

---

## 0.1.1 Start With the Contract: What Did the Client Send?

Consider an illustrative request:

```json
{
  "model": "example-instruct-model",
  "messages": [
    {"role": "system", "content": "Answer in one short sentence."},
    {"role": "user", "content": "What is the capital of France?"}
  ],
  "temperature": 0.2,
  "top_p": 0.95,
  "max_new_tokens": 32,
  "stop": ["<end_of_turn>"],
  "stream": true
}
```

This payload is not the model input. It is an application-level contract.

The API layer typically owns:

- Protocol parsing and schema validation
- Authentication, authorization, quotas, and request size limits
- Model and adapter selection
- Generation parameters
- Request ID and trace context
- Deadline, cancellation, and streaming behavior
- Stable response and error formats

The model ultimately receives tensors—most importantly token IDs and position or
attention metadata. It does not receive JSON objects, HTTP headers, user roles,
or an SSE connection.

### Completion versus chat

A text-completion request already supplies a string to continue. A chat request
supplies structured messages that must first be rendered into the exact linear
format expected by the model.

```text
Chat API object              Model-facing sequence
-------------------------    ------------------------------------
role=system, content=...  ┐
role=user, content=...    ├─→ control tokens + message text + ...
generation parameters     ┘
```

Keep three token budgets distinct:

- **Input tokens:** the rendered prompt after tokenization
- **Maximum output tokens:** the allowed generation budget
- **Total context:** input plus generated tokens retained by the model

An API may expose different names, but the engineering constraint remains:

```text
retained input tokens + retained generated tokens ≤ supported context capacity
```

Whether a server rejects, truncates, chunks, or otherwise handles an oversized
request is a product policy. Silent truncation is dangerous because it changes
the meaning of the request.

> **L5 habit:** State the request contract and policy assumptions before drawing
> the GPU architecture. “Serve an LLM” is underspecified until you know context
> limits, output limits, streaming requirements, deadlines, and workload shape.

---

## 0.1.2 Prompt Construction and Chat Templates

Chat is an interface convention layered on top of next-token prediction. A chat
model still consumes one token sequence.

Suppose a model expects this illustrative format:

```text
<bos>
<system>
Answer in one short sentence.
<end_of_turn>
<user>
What is the capital of France?
<end_of_turn>
<assistant>
```

The final assistant marker tells the model which kind of continuation should
come next. Different models use different control tokens and layouts. The
template must match the format used during training; otherwise the model sees an
out-of-distribution sequence even when the visible conversation looks correct.
Hugging Face documents chat templates as the mapping from role/content
dictionaries to one model-specific tokenizable sequence and notes that an
`add_generation_prompt` can append tokens indicating the start of an assistant
response
([chat-template guide](https://huggingface.co/docs/transformers/chat_templating)).

### Special-token duplication: a quiet production bug

A template often already inserts BOS, EOS, or end-of-turn tokens. If code renders
the template to text and then invokes a tokenizer that adds those special tokens
again, the model may receive duplicates. This can degrade output without causing
an exception. Hugging Face explicitly recommends disabling additional special
tokens when separately tokenizing an already rendered template
([chat-template special-token guidance](https://huggingface.co/docs/transformers/chat_templating)).

```text
Expected: <bos> <user> ... <end_of_turn> <assistant>
Broken:   <bos> <bos> <user> ... <end_of_turn> <assistant> <eos>
```

### Tools, retrieval, and multimodal inputs

Tool definitions and retrieved documents are also serialized according to the
model's input contract; the base model still consumes tokens. For multimodal
models, the processor may place a special image or video placeholder into the
rendered sequence and expand it into modality-specific inputs later. Hugging
Face's template documentation describes this placeholder approach, while also
warning that the exact behavior is model-specific
([multimodal template guidance](https://huggingface.co/docs/transformers/en/chat_templating_writing)).

This chapter stays with text generation. The important boundary is:

> Structured application input must become the exact model input representation
> used by that model family.



---

## 0.1.3 Tokenization and Input Preparation

The tokenizer converts the rendered prompt into token IDs:

```text
"The capital of France"
       ↓
["The", " capital", " of", " France"]     illustrative tokens
       ↓
[791, 6864, 315, 9822]                    illustrative IDs
```

Token boundaries are not word boundaries. Modern tokenizers commonly use
subword algorithms such as BPE, Unigram, or WordPiece. Frequent strings may be
one token; rare strings may split into several. Byte-level approaches can
represent arbitrary text using byte-based units. The current Hugging Face
tokenizer summary explains these algorithms and why words decompose differently
under different vocabularies
([tokenization algorithms](https://huggingface.co/docs/transformers/tokenizer_summary)).

That produces operational consequences:

- Character count is a poor proxy for token count.
- Different languages can have different token-to-character ratios.
- Whitespace and capitalization can change tokenization.
- Stop strings may cross token boundaries.
- Incremental decoding may need to buffer incomplete text.
- Billing and capacity are normally based on tokens, not words.

### Model-facing inputs

For a simple decoder-only text model, input preparation commonly produces:

```text
input_ids:        [B, S]
position info:    positions for the S input tokens
attention info:   causal structure and sequence boundaries
request metadata: sequence length, cache mapping, sampling configuration
```

`B` and `S` here are logical dimensions. High-performance engines may flatten
tokens from multiple requests, use packed representations, or carry block tables
instead of a simple dense attention mask. Those layouts are implementation
details; the invariant is that tokens from different requests must keep the
correct positions, attention boundaries, and cache ownership.

### Validation before expensive work

The input processor or admission path should answer:

- Is the model and tokenizer available?
- Is the rendered prompt valid and nonempty where required?
- Does it fit the context policy?
- Are requested generation parameters supported?
- Is the deadline already expired?
- Is the request allowed by quota and safety policy?
- Can required model, adapter, or modality resources be selected?

Tokenization usually runs on the CPU, while model execution runs on accelerators.
At light load, tokenization may look negligible. At high request rates or with
very long prompts, CPU preprocessing can become a visible pipeline stage. vLLM's
current process architecture places tokenization and multimodal input processing
in the API-server process, separate from the engine core and GPU workers
([vLLM process architecture](https://docs.vllm.ai/en/stable/design/arch_overview/)).

---

## 0.1.4 Request Admission, Queueing, and Scheduling

Once the request is valid, it becomes state in a serving system.

A useful simplified state machine is:

```text
RECEIVED → VALIDATED → WAITING → RUNNING_PREFILL
                                      ↓
                               RUNNING_DECODE
                                      ↓
                   FINISHED | ABORTED | FAILED | TIMED_OUT
```

### Admission is not scheduling

These decisions are related but different:

- **Admission:** May this request enter the system or reserve resources?
- **Scheduling:** Which admitted requests should receive execution budget now?

Admission can consider context length, memory headroom, tenant quota, deadline,
priority, adapter availability, and overload policy. For example, vLLM exposes a
mode in which the scheduler checks whether the full input length fits in KV-cache
capacity before admitting the request, to avoid over-admission and cache
thrashing
([vLLM scheduler configuration](https://docs.vllm.ai/en/latest/api/vllm/config/scheduler/)).

The scheduler repeatedly decides which tokens from which requests run in the
next engine iteration. TensorRT-LLM describes each executor iteration as request
fetching, scheduling, cache-resource preparation, model execution, and output
handling
([TensorRT-LLM executor loop](https://nvidia.github.io/TensorRT-LLM/developer-guide/overview.html)).

At this point, do not reduce the scheduler to “choose a batch size.” It also has
to reconcile:

- New prompts waiting for prefill
- Existing requests waiting for their next decode step
- A token or memory budget
- Priorities and fairness
- Cancellation and finished requests
- Cache allocation and possible preemption

The algorithms belong to Chapters 3 and 8. The Chapter 0 mental model is simply:

> A request does not call the GPU whenever it wants. A scheduler grants it work
> in discrete iterations alongside other requests.

---

## 0.1.5 Prefill: Processing the Prompt

**Prefill** processes the prompt tokens and builds the initial per-request model
state.

For a prompt with tokens:

```text
x₀, x₁, x₂, ..., xₛ₋₁
```

the Transformer computes representations under a causal mask. Position `i` can
use positions `0..i`, never future positions. Although the dependency is causal,
all prompt positions are already known, so GPU kernels can process many prompt
positions in parallel within the forward pass.

Prefill produces two outputs that matter to generation:

1. **K/V tensors for all prompt positions at every attention layer**
2. **Logits from which the first generated token is selected**

The model may compute logits for every prompt position, but ordinary
autoregressive serving needs the final prompt position's distribution to choose
the next token.

```text
Prompt tokens
    ↓
Transformer prefill
    ├─→ initial KV cache for prompt positions
    └─→ final-position logits
                 ↓
          first generated token
```

### “One forward pass” is a conceptual simplification

Some engines process a long prompt in chunks rather than one monolithic call.
Chunked prefill can share an iteration with decode work and balance different
types of GPU work. vLLM's optimization guide documents chunked prefill and its
interaction with pending decode requests
([vLLM chunked prefill](https://github.com/vllm-project/vllm/blob/main/docs/configuration/optimization.md)).

The semantic outcome remains: before normal decoding can continue, the engine
must establish attention state for the retained prompt and obtain logits for the
first output token.

### Time to first token

From a client's perspective, time to first token (TTFT) is not just “prefill
kernel time.” It can include network delay, queueing, preprocessing, prefill,
sampling, detokenization, and delivery of the first nonempty response chunk.
NVIDIA's current AIPerf metric definition explicitly includes network latency,
queueing, prompt processing, and first-token generation
([AIPerf metric reference](https://docs.nvidia.com/aiperf/dev/reference/ai-perf-metrics-reference)).

Chapter 1 will analyze TTFT. Here, remember that it spans multiple owners.

---

## 0.1.6 The KV Cache as Persistent Request State

Self-attention needs keys and values from prior positions. Without reuse, each
decode step would recompute them from the entire prefix. A KV cache retains those
per-layer K/V tensors.

```text
Layer 0: K[positions 0..T-1], V[positions 0..T-1]
Layer 1: K[positions 0..T-1], V[positions 0..T-1]
...
Layer L: K[positions 0..T-1], V[positions 0..T-1]
```

The cache is:

- **Per retained sequence/request**, unless safely shared through prefix reuse
- **Per attention layer**
- **Persistent across decode iterations**
- **Growing with processed sequence positions**
- **Released or recycled when the request finishes**

It is not:

- The model's weights
- Every hidden state
- Every temporary activation
- A cache of final text
- A cache of queries in the ordinary autoregressive design

TensorRT-LLM assigns allocation, deallocation, and maintenance of this state to
its `KVCacheManager`
([TensorRT-LLM architecture](https://nvidia.github.io/TensorRT-LLM/developer-guide/overview.html)).
The PagedAttention paper emphasizes the serving challenge: KV memory grows and
shrinks dynamically per request, so poor management wastes capacity and limits
batch size
([PagedAttention paper](https://arxiv.org/abs/2309.06180)).

### A precise timing detail

Suppose prefill over a five-token prompt selects generated token `g₀`.

After prefill:

```text
known sequence: prompt + g₀
cached K/V:     prompt only
```

`g₀` was sampled from the prompt's final logits. Its own K/V does not exist until
the next model call feeds `g₀` as input. That decode call writes K/V for `g₀` and
produces logits for `g₁`.

```text
feed g₀ → append K/V(g₀) → logits → sample g₁
feed g₁ → append K/V(g₁) → logits → sample g₂
```

This one-token offset is easy to miss. It explains why the number of known token
IDs can temporarily be one greater than the number of cached positions.

Chapter 2 derives cache sizes and covers paging, prefix reuse, eviction,
offloading, and quantization.

---

## 0.1.7 The Autoregressive Decode Loop

After prefill chooses the first output token, generation becomes a repeated state
transition.

For iteration `t`:

1. The scheduler selects the request for work.
2. The engine feeds the most recently selected token at its next position.
3. The model reads prior K/V and computes the new token's K/V.
4. The model produces logits for the following token.
5. Logit processors apply constraints or penalties.
6. The sampler selects the following token.
7. The output processor updates request state and checks stopping conditions.
8. Stable decoded text may be emitted to the client.

### Why a single sequence is sequential

The next token is conditioned on all tokens selected so far:

```text
g₀ ~ P(token | prompt)
g₁ ~ P(token | prompt, g₀)
g₂ ~ P(token | prompt, g₀, g₁)
```

You cannot run the exact ordinary computation for `g₂` before knowing `g₁`.
There is a loop-carried dependency across generation steps.

That does **not** mean the GPU works on only one token globally. A serving engine
can put decode tokens from many independent requests into the same model
iteration, and it may combine decode work with prompt chunks. This is the basis
for continuous batching, covered in Chapter 3.

### Framework-neutral pseudocode

This pseudocode intentionally models one request. Production engines schedule
many request states together.

```python
def generate(request, model, tokenizer, scheduler, cache_manager):
    prompt_text = render_chat(request.messages, model.chat_template)
    prompt_ids = tokenizer.encode(prompt_text, add_special_tokens=False)
    validate_context(prompt_ids, request.max_new_tokens, model.max_context)

    state = scheduler.admit(
        request_id=request.id,
        prompt_ids=prompt_ids,
        deadline=request.deadline,
        sampling=request.sampling,
    )

    try:
        # Prefill writes KV for prompt_ids and returns final-position logits.
        cache = cache_manager.allocate(request.id, len(prompt_ids))
        logits = model.prefill(prompt_ids, cache)
        pending_token = sample(process_logits(logits, state), state.rng)

        while True:
            state.generated_ids.append(pending_token)

            finish_reason = check_stop(state, pending_token)
            text_delta = tokenizer.decode_stable_delta(state.generated_ids)
            if text_delta:
                stream(request.id, text_delta)

            if finish_reason is not None:
                return finalize(state, finish_reason)

            if request.cancelled() or deadline_expired(request.deadline):
                raise RequestAborted()

            scheduler.wait_until_selected(state)

            # Feeding pending_token creates its K/V and predicts the next token.
            logits = model.decode_one(pending_token, cache)
            pending_token = sample(process_logits(logits, state), state.rng)

    finally:
        cache_manager.release(request.id)
        scheduler.remove(request.id)
```

Real systems handle asynchronous output, multiple candidates, distributed model
execution, batched cache mappings, partial prefills, prefix reuse, and failure
propagation. The invariant is more important than the API:

> Schedule → execute model work → update state → decide whether to continue.

vLLM's scheduler interface follows this shape: add a request, schedule work,
update scheduler state from model-runner output, check finished requests, and
finish aborted or stopped requests
([vLLM scheduler interface](https://docs.vllm.ai/en/latest/api/vllm/v1/core/sched/interface/)).

---

## 0.1.8 From Logits to the Next Token

The model's final projection produces one score per vocabulary item:

```text
logits z ∈ ℝ^V
```

The sampler turns scores into a token ID. A common conceptual pipeline is:

```text
raw logits
  → masks and constraints
  → repetition or sequence penalties
  → temperature scaling
  → candidate filtering
  → normalization
  → selection or sampling
```

Exact ordering varies across libraries and configurations, so production parity
requires matching the serving stack's implementation.

### Greedy decoding

Choose the highest-scoring token:

```text
next_token = argmax(z)
```

This is deterministic for fixed logits and a stable implementation.

### Temperature

A common form is:

```text
pᵢ = softmax(zᵢ / τ)
```

- Lower `τ` sharpens the distribution.
- Higher `τ` flattens it.
- Temperature does not create knowledge; it changes selection uncertainty.

### Top-k

Keep only the `k` highest-probability candidates, mask the rest, renormalize, and
sample.

### Top-p

Sort candidates by probability and retain the smallest prefix whose cumulative
probability reaches at least `p`, then renormalize and sample.

Hugging Face's current generation configuration documents greedy decoding,
sampling, temperature, top-k, top-p, cache selection, and stopping controls
([text-generation configuration](https://huggingface.co/docs/transformers/main_classes/text_generation)).

### Reproducibility is a system property

A fixed random seed is necessary for reproducible sampling but may not be
sufficient across different stacks. Results can change with:

- Different tokenizer or template versions
- Floating-point dtype and numerical kernels
- Quantization
- Logit-processor order
- Distributed reduction behavior
- Framework or model revision

The model runner produces logits. The sampler owns token selection. Keeping this
boundary explicit makes debugging easier.

---

## 0.1.9 Detokenization and Streaming

The selected token ID must be turned back into user-visible text.

```text
token IDs → tokenizer decode → stable text delta → transport chunk
```

These units are not identical:

- One token may decode to part of a word.
- One token may include leading whitespace.
- Several tokens may be buffered before a clean text fragment is available.
- Byte-based tokens can split a multi-byte character.
- One network chunk can contain several decoded tokens.

Hugging Face's streaming utilities expose tokens through a streamer while
buffering output into displayable text; its `TextStreamer`, for example, prints
entire words rather than promising a one-token-to-one-chunk mapping
([generation utilities](https://huggingface.co/docs/transformers/internal/generation_utils)).

### Transport streaming

Server-Sent Events (SSE) are one possible HTTP streaming mechanism. The HTML
standard defines a UTF-8 `text/event-stream` format through which a server pushes
events to a client over a persistent connection
([WHATWG SSE specification](https://html.spec.whatwg.org/dev/server-sent-events.html)).
Other APIs use chunked HTTP responses, WebSockets, gRPC streams, or custom
protocols.

Streaming changes perceived responsiveness, not the model's token dependency.
The client can read early output before the final completion exists, but the
server still generates tokens sequentially for that request.

### Cancellation must flow backward

If the client disconnects:

```text
transport detects disconnect
  → request is marked cancelled
  → output producer stops
  → scheduler removes pending work
  → cache manager releases request resources
```

Continuing generation after the consumer disappears wastes GPU time and cache
capacity. vLLM's scheduler interface explicitly lists client aborts as one reason
to finish requests
([vLLM request finishing](https://docs.vllm.ai/en/latest/api/vllm/v1/core/sched/interface/)).

---

## 0.1.10 Stopping, Finalization, and Cleanup

Generation can stop for multiple reasons:

| Condition | Example finish reason |
| --- | --- |
| Model emits EOS or end-of-turn | `stop` |
| Configured stop string completes | `stop` |
| Maximum output budget reached | `length` |
| Client cancellation | `cancelled` |
| Deadline expires | `timeout` |
| Policy or safety layer interrupts | `content_filter` or product-specific |
| Model/runtime/transport fails | `error` |

Names differ by API. The system should preserve a machine-readable reason rather
than making the client infer it from partial text.

### Token stops and string stops are different

EOS is a token-level condition. A stop string is a text condition that can span
or overlap token boundaries. Hugging Face's `StopStringCriteria` documentation
shows why detecting a string such as `"stop"` must handle tokenizations like
`["st", "op"]`, `["stop"]`, or overhanging tokens
([stop-string criteria](https://huggingface.co/docs/transformers/internal/generation_utils)).

### Finalization checklist

On every terminal path—including exceptions:

1. Stop scheduling new model work.
2. Prevent additional output writes.
3. Flush only text that is valid under the protocol and stop policy.
4. Record finish reason and final usage.
5. Close or complete the output stream.
6. Release KV-cache allocations.
7. Remove request and sampler state.
8. Cancel outstanding asynchronous tasks.
9. Emit metrics and trace completion.

The cleanup must be idempotent. Cancellation can race with model output or a
timeout; releasing the same cache block twice is a correctness bug.

> **Engineering rule:** Resource ownership must have a terminal path for success,
> cancellation, timeout, and failure.

---

## 0.1.11 Worked Request: From Send to EOS

We will trace a toy request. Token IDs and text fragments are illustrative, not
from a real tokenizer.

### Step 1: API request

```json
{
  "messages": [
    {"role": "user", "content": "Capital of France?"}
  ],
  "temperature": 0,
  "max_new_tokens": 4,
  "stream": true
}
```

### Step 2: Render and tokenize

```text
Rendered prompt:
<bos><user>Capital of France?<eot><assistant>

Toy tokens:
[<bos>, <user>, Capital, of, France, ?, <eot>, <assistant>]

Toy IDs:
[1, 20, 301, 88, 744, 31, 21, 22]
```

Prompt length is eight. Positions are `0..7`.

### Step 3: Admit and prefill

The scheduler admits the request. The cache manager provides capacity. Prefill
processes the eight prompt tokens:

```text
cached positions after prefill = 8
last-position logits → greedy token "Paris"
known generated IDs = ["Paris"]
```

`"Paris"` can be streamed if its decoded text is stable, but its K/V is not yet
in the cache.

### Step 4: Decode

| Engine step | Phase | Token(s) fed to model | Cached positions after model call | Token selected from returned logits | Stable emitted text |
| --- | --- | --- | ---: | --- | --- |
| 0 | Prefill | 8 prompt tokens | 8 | `Paris` | `Paris` |
| 1 | Decode | `Paris` | 9 | `.` | `.` |
| 2 | Decode | `.` | 10 | `<eos>` | none |

After step 2, EOS is selected and the request stops. EOS does not need to be fed
into another model call, so its K/V is never required.

### Step 5: Finalize

```text
visible response: "Paris."
finish reason:    stop
input tokens:     8
output tokens:    3   # Paris, ".", EOS under this toy accounting
cache allocation: released
stream:           completed
```

Some APIs exclude special stop tokens from reported output counts or visible
content. Usage semantics must be documented and tested.

### State snapshot

```text
Request knows: prompt tokens + selected output tokens
KV cache knows: positions that have actually passed through the model
Client knows: stable text chunks delivered so far
Scheduler knows: whether the request needs more execution
```

Those four views advance at slightly different moments. Many subtle inference
bugs are state-synchronization bugs between them.



---

## 0.1.12 System Boundaries and Ownership

| Component | Primary responsibility | Typical state |
| --- | --- | --- |
| API server | Protocol, validation, auth, quotas, streaming | connection, request ID, deadline |
| Input processor | Template rendering, tokenization, input validation | prompt text, token IDs, lengths |
| Scheduler | Select requests and token work for each iteration | waiting/running queues, priorities |
| Cache manager | Allocate, map, grow, and free KV state | blocks/pages, ownership, sequence lengths |
| Model runner | Prepare tensors and execute model forward work | device tensors, execution metadata |
| Sampler | Transform logits and select token IDs | RNG, penalties, constraints |
| Output processor | Update request state, detokenize, stop, emit | generated IDs, text buffer, finish reason |
| Observability layer | Measure and correlate the lifecycle | metrics, logs, traces |

One deployment can combine several responsibilities in one process, and another
can split them across machines. Logical ownership still matters.

### Debug by walking the boundary

| Symptom | First boundaries to inspect |
| --- | --- |
| Output quality changed after deployment | template → tokenizer → model revision → sampler |
| High TTFT with low GPU time | API → tokenization → queue → scheduler |
| Good TTFT but slow ongoing text | decode scheduling → model runner → streaming |
| Memory grows after clients disconnect | transport cancellation → scheduler → cache manager |
| Garbled Unicode or delayed characters | output processor → incremental detokenizer |
| Requests exceed configured limits | validation → token accounting → admission |

The model is one component in a stateful distributed pipeline. That is the
central inference-engineering mental model.

---

## Production Case Study — LinkedIn's Request Path Evolved With Its Workload

LinkedIn has published enough first-party detail to connect this chapter's
abstract lifecycle to a real serving platform.

### Phase 1: Put a stable front door in front of changing models

LinkedIn reports that its early GenAI applications used externally hosted
models, with requests routed through a centralized GenAI proxy. The proxy
provided Trust and Responsible AI checks, model/version support, incremental
streaming, and quota management. LinkedIn later exposed one Chat Completions-style
contract across both internal and external models so application teams could
switch providers without owning routing details
([LinkedIn GenAI application stack](https://www.linkedin.com/blog/engineering/generative-ai/behind-the-platform-the-journey-to-create-the-linkedin-genai-application-tech-stack)).

Map that design to this chapter:

| Chapter concept | LinkedIn production responsibility |
| --- | --- |
| API contract | Common chat-completions interface |
| Validation and policy | Trust and Responsible AI checks |
| Admission control | Quota management and fair use |
| Model selection | Routing across model versions and internal/external models |
| Streaming | Incremental responses to reduce perceived latency |
| Prompt preparation | Centralized prompt structure, templating, and versioning |

The useful lesson is not that every company should copy one API format. It is
that the application contract and cross-cutting policies should not be entangled
with one model runtime.

LinkedIn reached a similar conclusion for prompts. Manual string interpolation
became difficult to scale, so it introduced a prompt source of truth, Jinja-based
authoring, modularization, versioning, and gradual rollout of prompt changes
([LinkedIn prompt-management account](https://www.linkedin.com/blog/engineering/generative-ai/behind-the-platform-the-journey-to-create-the-linkedin-genai-application-tech-stack)).
This is the production version of the chat-template warning earlier in this
section: prompt rendering is deployable, versioned behavior, not harmless string
concatenation.

### Phase 2: The engine interface changed when concurrency changed

LinkedIn's first reported vLLM production deployment used offline `LLM` and
`engine.step()` interfaces. That was adequate for validating accuracy and
performance on low-QPS workloads, but concurrency was limited. As demand grew,
the team moved to `AsyncLLMEngine`, reporting substantially higher concurrent
request capacity while retaining stable latency
([LinkedIn's vLLM serving evolution](https://www.linkedin.com/blog/engineering/ai/how-we-leveraged-vllm-to-power-our-genai-applications)).

This is a concrete illustration of the scheduler mental model:

```text
Low concurrency:
application invokes engine work in a relatively direct loop

Higher concurrency:
many application requests
  → asynchronous request streams
  → centralized scheduler
  → shared GPU iterations
  → independently streamed outputs
```

LinkedIn later decoupled its custom gRPC server from the vLLM engine through an
OpenAI-compatible request mapping. The server owns the organization's service
contract; the engine client owns interaction with the inference runtime. This
allows each side to evolve more independently
([LinkedIn's modular serving architecture](https://www.linkedin.com/blog/engineering/ai/how-we-leveraged-vllm-to-power-our-genai-applications)).

### Phase 3: Workload shape determined the useful optimizations

One LinkedIn hiring workload reportedly generates nearly 1,000 tokens per
candidate, fans out across hundreds or thousands of candidates, and has shared
prefixes in more than half of requests. LinkedIn describes using prefix caching
and continuous batching to make this high-fanout workload more manageable. For
AI Job Search, it reports a target below 600 ms p95 at thousands of QPS, using
server-side and client-side batching, streaming, and parallel tool execution
once relevant tool calls are recognized in the streamed output
([LinkedIn production workloads](https://www.linkedin.com/blog/engineering/ai/how-we-leveraged-vllm-to-power-our-genai-applications)).

The important inference-engineering move is to translate product behavior into
request-lifecycle pressure:

| Workload fact | Lifecycle consequence |
| --- | --- |
| Long output per candidate | Many decode iterations and long-lived KV state |
| High fan-out | High concurrency and scheduler pressure |
| Repeated prefixes | Opportunity to reuse prefill work |
| Interactive search | Tight TTFT and tail-latency requirements |
| Tool calls discovered in output | Streaming becomes a control-flow interface |

LinkedIn reports that a later engine evaluation reached roughly 1,245 tokens per
second under saturation—about 10% above its earlier vLLM version for that
workload—and avoided more than 60 GPUs. Treat these as a report about LinkedIn's
particular model, traffic, tuning, and hardware, not a universal vLLM speedup
([reported evaluation](https://www.linkedin.com/blog/engineering/ai/how-we-leveraged-vllm-to-power-our-genai-applications)).

### What generalizes

1. Stabilize the application-facing contract while runtimes evolve.
2. Treat prompt templates and versions as production artifacts.
3. Move from a direct inference loop to asynchronous scheduling when concurrency
   demands it.
4. Separate protocol/service ownership from model-engine ownership.
5. Measure the real distribution of prompt lengths, output lengths, concurrency,
   shared prefixes, and deadlines before choosing optimizations.

### What does not automatically generalize

- LinkedIn's latency target is use-case specific.
- Its prefix-reuse rate does not describe a generic chatbot.
- Its reported throughput and GPU savings depend on its model, hardware,
  software versions, traffic, and tuning.
- A standard API contract does not make different models behaviorally
  interchangeable; templates, tokenizers, output schemas, and quality still
  differ.



---

## Production Snapshot — Scale Makes Routing Part of Inference

Google Cloud reported in September 2025 that infrastructure informed by its
experience running models such as Gemini and Veo 3 was serving more than 980
trillion tokens per month to over 450 million users. Its public GKE inference
architecture emphasizes workload-aware routing, prefix locality, independent
prefill/decode scaling, and faster model loading
([Google Cloud inference report](https://cloud.google.com/blog/products/ai-machine-learning/gke-inference-gateway-and-quickstart-are-ga/)).

The report describes:

- Prefix-aware routing so related requests are more likely to reach accelerators
  holding reusable cache state
- Selection of prefill and decode nodes based on request characteristics
- Independent scaling of compute-oriented prefill and memory-oriented decode
  capacity
- Model streaming to reduce the time required to load very large weights

Google reports up to 96% lower TTFT at peak throughput for its tested
prefix-heavy workloads, up to 60% throughput improvement from disaggregated
serving, and more than 4.9× faster model loading in the documented configurations.
These are vendor-reported results for particular GKE tests, not universal
guarantees.

The Chapter 0 lesson is that at very large scale, the request lifecycle starts
before an engine scheduler sees the request:

```text
global request
  → choose region/cluster
  → choose model pool
  → choose cache-compatible or phase-specific worker
  → local engine admission and scheduling
  → prefill/decode
```

This public GKE design should **not** be presented as a diagram of Gemini's private
serving internals. Google says its platform is built from experience serving
Gemini-scale workloads; it does not publish every internal Gemini implementation
detail in this article. The distinction between sourced fact and architectural
inference matters.

Chapters 2, 7, and 8 will revisit prefix-aware routing, disaggregated serving, and
load balancing in depth.

---

## Common Misconceptions

### 1. “The model sees messages and roles.”

It sees model inputs derived from them—normally token IDs and related metadata.
The template encodes role structure.

### 2. “The answer is produced in one forward pass.”

Ordinary autoregressive generation selects one next token per sequence per decode
iteration.

### 3. “Prefill is sequential because attention is causal.”

Causality limits which positions can attend to which, but known prompt positions
can still be processed in parallel.

### 4. “The sampled token is immediately present in the KV cache.”

The token's K/V appears when that token is fed through the model on the next
decode call.

### 5. “Streaming means one token per network event.”

Token, decoded text fragment, and transport chunk are different units.

### 6. “Client disconnect only affects the network layer.”

It should cancel scheduler work and free accelerator memory.

### 7. “TTFT measures prefill.”

Client-observed TTFT can include network, queueing, preprocessing, prefill,
sampling, detokenization, and delivery.

---

## Exercises and L5 Interview Questions

### Question 1 — What happens once and what repeats?

A request has five prompt tokens and generates three visible tokens before EOS.
Which operations happen once, and which repeat?

#### Solution

Once per request:

- Parse and validate the API request.
- Render the prompt and tokenize it.
- Admit the request and initialize its state.
- Allocate or associate initial cache capacity.
- Prefill the retained prompt.
- Finalize the response and release state.

Repeated during generation:

- Scheduler selection
- Model decode work for the latest selected token
- KV-cache append
- Logit processing and sampling
- Stop checks
- Incremental detokenization and optional streaming

Nuance: prefill selects the first output token. If three visible tokens are
selected and the third causes termination, the number of subsequent decode calls
depends on whether EOS is separate and whether the final selected token must be
fed again. Do not equate “number of generated IDs” with “number of decode model
calls” without stating the timeline.

**Likely follow-up:** How does speculative decoding change the “one selected
token” assumption? Defer the mechanism to Chapter 5, but say it changes how
candidate tokens are proposed and verified, not the autoregressive probability
definition.

### Question 2 — Why is prefill parallel but decode sequential?

#### Solution

During prefill, every prompt token is already known. The causal mask restricts
information flow, but GPU operations for multiple known positions can be formed
and executed together. During decode, token `t+1` is not known until token `t`
has been selected and incorporated into the prefix. That is a loop-carried
dependency.

Across users, independent requests do not share that dependency, so their
current tokens can be batched in the same engine iteration.

**Weak answer:** “Prefill uses a batch and decode does not.” Decode is also
batched; the key distinction is known positions within one sequence.

### Question 3 — A client disconnects halfway through generation. What happens?

#### Solution

The transport detects closure and signals cancellation using the request ID. The
output producer stops writing. The scheduler removes pending work or marks it
finished. In-flight work may complete, but its output must be discarded safely.
The cache manager releases the request's allocations, request queues are closed,
and metrics record an aborted terminal state.

Design cleanup to be idempotent because disconnect, timeout, and normal finish
can race.

**Likely follow-up:** Would you interrupt an already launched GPU kernel? Usually
not for a single request in a shared batch; safely discard that request's result
and prevent future scheduling.

### Question 4 — Where should EOS checking live?

#### Solution

The model runner returns logits or selected token IDs depending on system design.
The output/scheduler state layer should own request completion because it knows
model-specific stop IDs, user stop strings, output limits, cancellation, and
protocol semantics. The scheduler must learn promptly that the request is
finished so it stops allocating execution budget. The cache manager then releases
resources.

The exact process boundary may vary, but completion policy should not be hidden
inside an attention kernel.

### Question 5 — Why might one generated token not equal one streamed chunk?

#### Solution

A token may decode to an incomplete word or partial multi-byte character.
Incremental detokenization may buffer it until stable text exists. Conversely,
the server may combine several token deltas into one transport event to reduce
overhead. Network buffering can coalesce writes further.

Therefore measure both token-level and chunk-level behavior. Do not derive
inter-token latency blindly from chunk timestamps when chunks contain multiple
tokens.

### Question 6 — Quality dropped after moving from a notebook to production

The weights and nominal sampling parameters are the same. What do you check?

#### Solution

Work from the input boundary forward:

1. Model and tokenizer revision or commit
2. Chat template and generation-prompt behavior
3. Duplicate or missing BOS/EOS/control tokens
4. Truncation and context accounting
5. Tokenizer normalization and encoding options
6. Dtype, quantization, or kernel changes
7. Logit-processor order and defaults
8. Random seed and sampling implementation

Capture and compare the exact rendered prompt, token IDs, first-step logits
within tolerance, and selected token. This binary-searches the pipeline.

**L5 signal:** Propose an offline golden-request suite that stores expected
rendered prompts, token IDs, and acceptable output properties across serving
releases.

### Question 7 — Design the component boundary

Draw a minimal streaming inference service and assign ownership for tokenization,
scheduling, cache allocation, model execution, sampling, stopping, and streaming.

#### Solution

```text
Client
  ↕ HTTP/SSE
API + Input Processor
  ↕ internal request/output messages
Engine Core: Scheduler + Request State + Cache Manager
  ↕ scheduled token work
GPU Worker: Model Runner
  → logits/token outputs
Sampler + Output Processor
  → text deltas and finish events
```

Exact placement of the sampler varies. The important properties are:

- Explicit ownership
- Stable request IDs across boundaries
- Cancellation propagation
- Bounded queues and backpressure
- Terminal cleanup on every path
- Metrics that decompose queue, prefill, decode, and stream delivery

---

## Revision Card

### Lifecycle in one line

```text
validate → render → tokenize → admit → schedule → prefill
→ sample → [decode → sample]* → detokenize/stream → stop → free
```

### Prefill versus decode

| Property | Prefill | Decode |
| --- | --- | --- |
| New model inputs | Prompt tokens, possibly chunked | Usually latest selected token |
| Within-request position parallelism | High | One next position at a time |
| KV action | Build initial state | Read prior state and append |
| Logits used | Final processed position | Current processed position |
| User-facing relation | Major contributor to first output | Drives ongoing output cadence |

### Eight-step decode loop

1. Schedule request.
2. Feed latest selected token.
3. Read old K/V.
4. Append new K/V.
5. Produce logits.
6. Process and sample.
7. Stop or continue.
8. Emit stable text.

### Terminal conditions

```text
EOS | stop string | length | cancellation | timeout | policy | error
```

### Ownership shorthand

```text
API owns protocol.
Input processor owns model-facing prompt construction.
Scheduler owns when work runs.
Cache manager owns persistent K/V memory.
Model runner owns forward execution.
Sampler owns token selection.
Output processor owns text and completion state.
```

### Five facts worth remembering

1. Chat messages become one model-specific sequence.
2. Prefill selects the first generated token.
3. A selected token's K/V is written on its next model call.
4. Token, text fragment, and network chunk are different units.
5. Cancellation is an accelerator-resource event, not merely a network event.

---

## Further Reading

### Serving architecture

- [vLLM Architecture Overview](https://docs.vllm.ai/en/stable/design/arch_overview/)
- [TensorRT-LLM Architecture Overview](https://nvidia.github.io/TensorRT-LLM/developer-guide/overview.html)
- [vLLM Scheduler Interface](https://docs.vllm.ai/en/latest/api/vllm/v1/core/sched/interface/)
- [Efficient Memory Management for Large Language Model Serving with PagedAttention](https://arxiv.org/abs/2309.06180)

### Production case studies

- [LinkedIn: Behind the GenAI Application Tech Stack](https://www.linkedin.com/blog/engineering/generative-ai/behind-the-platform-the-journey-to-create-the-linkedin-genai-application-tech-stack)
- [LinkedIn: How We Leveraged vLLM to Power GenAI Applications](https://www.linkedin.com/blog/engineering/ai/how-we-leveraged-vllm-to-power-our-genai-applications)
- [Google Cloud: Scaling High-Performance Inference Cost-Effectively](https://cloud.google.com/blog/products/ai-machine-learning/gke-inference-gateway-and-quickstart-are-ga/)

### Prompt construction and tokenization

- [Hugging Face Chat Templates](https://huggingface.co/docs/transformers/chat_templating)
- [Hugging Face: Writing a Chat Template](https://huggingface.co/docs/transformers/en/chat_templating_writing)
- [Hugging Face Tokenization Algorithms](https://huggingface.co/docs/transformers/tokenizer_summary)

### Generation and streaming

- [Hugging Face Text Generation](https://huggingface.co/docs/transformers/main_classes/text_generation)
- [Hugging Face Generation Utilities](https://huggingface.co/docs/transformers/internal/generation_utils)
- [WHATWG Server-Sent Events](https://html.spec.whatwg.org/dev/server-sent-events.html)
- [NVIDIA AIPerf Metrics Reference](https://docs.nvidia.com/aiperf/dev/reference/ai-perf-metrics-reference)
