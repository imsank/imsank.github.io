---
layout: course
title: "Transformer Inference Refresher"
description: "Trace tensor shapes, attention, grouped-query KV reuse, memory, and logits through Transformer prefill and cached decode."
course: true
chapter_number: 0
chapter_title: "Foundation (Prerequisites)"
section_number: "0.2"
section_order: 2
previous_url: /ai/llm-inference-engineering/foundation/life-of-an-llm-request/
previous_title: "Life of an LLM Request"
next_title: "Latency vs Throughput"
permalink: /ai/llm-inference-engineering/foundation/transformer-inference-refresher/
---

<!-- Generated from G_prep_mle_course. Edit the authoritative Markdown source, then republish. -->

## Why This Section Exists

Section 0.1 treated the model runner as one box:

```text
token IDs + positions + cache metadata
                  ↓
             ModelRunner
                  ↓
       logits + updated KV cache
```

This section opens that box.

You already know the Transformer from training. The important shift is to view it
as a repeated state transition. During serving, the same fixed weights process
different amounts of new work while each request carries growing state:

```text
fixed model weights
        +
new token representation(s)
        +
request's prior K/V state
        ↓
new logits + one K/V append per layer
```

The representative model here is a Llama-style decoder-only Transformer:
pre-normalization, RMSNorm, causal self-attention, rotary positional information,
grouped-query attention (GQA), residual connections, and a gated MLP. This is a
useful modern reference, not a claim that all language models have identical
blocks. The original Transformer established scaled dot-product and multi-head
attention; later model families changed normalization, position handling,
attention-head sharing, and feed-forward design
([Attention Is All You Need](https://arxiv.org/abs/1706.03762),
[Llama 2](https://arxiv.org/abs/2307.09288),
[Llama 3](https://ai.meta.com/research/publications/the-llama-3-herd-of-models/)).

By the end, you should be able to draw a block, annotate every important shape,
and trace both a multi-token prefill and a one-token decode step without saying
“the framework handles it.”

---

{% include course_visuals/tensor_shape_explorer.html %}

---

## 0.2.1 The Inference-Only View of a Decoder-Only Model

At its simplest, a causal language model implements:

```text
token IDs [B, S]
    ↓ embedding
hidden states [B, S, D]
    ↓ L decoder blocks
final hidden states [B, S, D]
    ↓ language-model head
logits [B, S, V]
```

For ordinary autoregressive generation, the serving loop consumes only the
logits for the last new position: `[B, V]`. A sampler chooses a token ID; that ID
becomes the next model input.

### The configuration is an execution contract

Before loading weights, an engine needs architectural facts:

| Configuration field | What it determines at execution time |
| --- | --- |
| Vocabulary size `V` | Embedding rows and output-logit width |
| Hidden width `D` | Residual-stream width and most matrix dimensions |
| Layer count `L` | Number of repeated blocks and KV-cache layers |
| Query heads `Hq` | Number of independently computed query heads |
| KV heads `Hkv` | Number of key/value heads stored per token |
| Head dimension `Dh` | Width of each attention head |
| Intermediate width `M` | Expanded width inside the MLP |
| Context limit | Maximum supported or configured position range |
| Dtype | Bytes per element, supported kernels, and numerical behavior |

If a checkpoint and configuration disagree, this is not a small metadata bug:
weight shapes, cache shapes, or position logic will be wrong.

### What disappears from the training graph?

Inference normally has:

- no target labels or cross-entropy loss;
- no backward pass;
- no gradients or gradient accumulation buffers;
- no optimizer states;
- no need to retain a full activation graph for backward.

The weights remain, and forward activations still exist temporarily. Persistent
KV state is added for autoregressive reuse. This is why “inference is training
without the optimizer” is an incomplete memory model.

`model.eval()` and disabled autograd solve different problems. Evaluation mode
changes modules whose behavior differs between training and evaluation, such as
dropout. `torch.inference_mode()` disables autograd-related tracking and
additional bookkeeping. Production code commonly needs both. PyTorch also notes
that optimized multi-head-attention inference paths require conditions including
evaluation mode and disabled autograd
([PyTorch `Module.eval`](https://docs.pytorch.org/docs/stable/generated/torch.nn.Module.html),
[PyTorch MultiheadAttention](https://docs.pytorch.org/docs/stable/generated/torch.nn.MultiheadAttention.html)).

Deterministic token selection is another separate axis. Greedy decoding can
still encounter small numerical differences across kernels or devices; sampling
adds random-number state on top. “Evaluation mode” does not mean “the entire
serving system is deterministic.”

> **L5 lens:** Separate four controls in an interview: training/evaluation
> behavior, gradient tracking, numeric dtype/backend, and sampling policy.

---

## 0.2.2 Tensor-Shape Ledger

We will use batch-major notation throughout.

| Symbol | Meaning |
| --- | --- |
| `B` | Number of sequences participating in this model invocation |
| `S` | Number of **new query tokens** processed now |
| `T` | Total K/V length visible after the new positions are appended |
| `D` | Hidden width |
| `Hq` | Number of query heads |
| `Hkv` | Number of key/value heads |
| `Dh` | Dimension of one attention head; usually `D = Hq × Dh` |
| `M` | MLP intermediate width |
| `V` | Vocabulary size |
| `L` | Transformer layer count |

`S` and `T` are deliberately different:

- **Fresh prefill:** `S = prompt length`, and `T = S`.
- **Cached decode:** normally `S = 1`; if `C` positions were already cached,
  `T = C + 1` after appending the new position.
- **Chunked prefill:** `S` can be a chunk of new prompt tokens while `T` includes
  a previously cached prefix.

This distinction gives the reusable shape ledger:

| Tensor | Shape |
| --- | --- |
| Token IDs | `[B, S]` |
| Hidden/residual states | `[B, S, D]` |
| Queries | `[B, Hq, S, Dh]` |
| New keys or values | `[B, Hkv, S, Dh]` |
| Retained keys or values after append | `[B, Hkv, T, Dh]` |
| Attention scores, logically | `[B, Hq, S, T]` |
| Attention result by heads | `[B, Hq, S, Dh]` |
| Concatenated attention result | `[B, S, D]` |
| MLP intermediate | `[B, S, M]` |
| Full logits | `[B, S, V]` |
| Logits normally consumed | `[B, V]` |

The word **logically** matters. A fused attention kernel need not materialize the
entire score or probability tensor in high-bandwidth memory. FlashAttention, for
example, computes exact attention using tiling to reduce reads and writes between
HBM and on-chip SRAM
([FlashAttention](https://arxiv.org/abs/2205.14135)). The mathematical shape is
still the right conceptual shape.



---

## 0.2.3 Token Embeddings and Positional Information

### Embedding lookup

For a token ID `i`, the model selects row `i` from an embedding matrix:

```text
embedding weight E: [V, D]
token IDs:          [B, S]
output x:           [B, S, D]
```

This is a lookup, not a one-hot matrix multiplication in a normal implementation.
The result enters the residual stream. Two occurrences of the same token begin
with the same token embedding, so token identity alone cannot tell attention
whether one occurrence came first or last.

### From additive positions to RoPE

The original Transformer added positional encodings to token embeddings. Many
modern decoder-only models instead use Rotary Position Embedding (RoPE): position
dependent rotations are applied to pairs of coordinates in queries and keys.
You can hold this intuition without deriving complex numbers:

1. Split each query and key head into coordinate pairs.
2. Rotate each pair by angles determined by its absolute position and frequency.
3. Dot products between rotated queries and keys now depend on their relative
   position.

RoPE therefore injects position into the attention comparison rather than
simply adding a position vector to the residual stream. The RoFormer paper
describes this combination of absolute-position rotation and relative-position
dependency
([RoFormer](https://arxiv.org/abs/2104.09864)).

### Position IDs with a cache

Suppose four prompt positions are cached:

```text
cached positions: 0, 1, 2, 3
next input token: position 4
```

The decode token must use position 4, not restart at zero. Its new key is rotated
for position 4 and stored in the cache. Previously cached keys have already been
position-transformed; a serving implementation should not blindly rotate them
again.

This yields a powerful debugging rule:

> If uncached full-sequence execution is correct but cached decoding diverges,
> inspect position IDs, cache offsets, masks, and append order before blaming
> sampling.

Long-context RoPE scaling and extrapolation methods are deferred to Chapter 11.

---

## 0.2.4 The Residual Stream, Normalization, and Block Structure

Think of the residual stream as a `[B, S, D]` information highway. Each block
reads it, computes an update, and adds that update back:

```text
x
├─ RMSNorm → causal attention → add ───────────────┐
│                                                  ↓
└──────────────────────────────────────────────── x_attn
                                                   │
                     RMSNorm → gated MLP → add ────┤
                                                   ↓
                                                x_out
```

A representative pre-normalized block is:

```text
a = x + Attention(RMSNorm(x))
y = a + MLP(RMSNorm(a))
```

“Pre-normalized” means normalization occurs before each sublayer. The residual
addition preserves the shape: every block enters and leaves with `[B, S, D]`.

### LayerNorm versus RMSNorm

LayerNorm centers values by subtracting their mean and scales by their variance.
RMSNorm omits re-centering and normalizes using root mean square:

```text
RMS(x) = sqrt(mean(x²) + ε)
RMSNorm(x) = learned_scale ⊙ x / RMS(x)
```

The learned scale has shape `[D]`; `ε` protects numerical stability. The original
RMSNorm work proposed it as a computationally simpler normalization with
re-scaling invariance
([RMSNorm](https://arxiv.org/abs/1910.07467)).

Normalization parameters are weights, but tiny ones compared with the large
projection matrices. Their runtime can still matter because reading, reducing,
scaling, and launching kernels are not free; parameter count alone does not
predict latency.

---

## 0.2.5 Q, K, and V From First Principles

Let normalized hidden states be `z: [B, S, D]`. Learned linear projections form:

```text
Q = z Wq    → [B, S, Hq × Dh]
K = z Wk    → [B, S, Hkv × Dh]
V = z Wv    → [B, S, Hkv × Dh]
```

After reshaping and transposing:

```text
Q: [B, Hq,  S, Dh]
K: [B, Hkv, S, Dh]
V: [B, Hkv, S, Dh]
```

An intuition that survives beyond the metaphor:

- A **query** describes what a current position is looking for.
- A **key** describes how a position can be matched.
- A **value** contains the information mixed in when that position receives
  attention weight.

All three are functions of hidden states, but their roles in the operation
differ.

### MHA, MQA, and GQA

| Variant | Query heads | KV heads | KV sharing |
| --- | ---: | ---: | --- |
| Multi-head attention (MHA) | `Hq` | `Hkv = Hq` | One K/V head per query head |
| Multi-query attention (MQA) | `Hq` | `Hkv = 1` | All query heads share one K/V head |
| Grouped-query attention (GQA) | `Hq` | `1 < Hkv < Hq` | Groups of query heads share K/V heads |

For ordinary GQA, `Hq` is divisible by `Hkv`. The group size is:

```text
G = Hq / Hkv
```

Each K/V head serves `G` query heads. Conceptually it can be repeated during
attention; a good kernel avoids physically making wasteful copies.

Why this matters for inference becomes visible immediately: cached K and V use
`Hkv`, not `Hq`. Changing from 32 query/32 KV heads to 32 query/8 KV heads cuts
the K/V elements per token by 4× while preserving 32 query heads.

The GQA paper describes it as an intermediate design between MHA and MQA and
reports quality close to MHA with speed comparable to MQA in its experiments
([GQA paper](https://arxiv.org/abs/2305.13245)). This is an empirical trade-off,
not a universal guarantee.

### Production design snapshot: Llama 3

Meta reports adopting GQA for both the 8B and 70B Llama 3 models to improve
inference efficiency. Its engineering announcement says improved tokenization
and GQA helped keep the 8B model's inference efficiency comparable to Llama 2 7B
despite roughly one billion additional parameters
([Meta Llama 3 announcement](https://ai.meta.com/blog/meta-llama-3/)).

The lesson is broader than one model: an architecture decision made during model
design changes the serving system's cache capacity and memory traffic years
later. Serving efficiency is partly “baked into” the checkpoint.

---

## 0.2.6 Causal Scaled Dot-Product Attention

For one query head and its associated key/value head:

```text
scores = Q Kᵀ / sqrt(Dh)
masked_scores = scores + causal_mask
probabilities = softmax(masked_scores, over key positions)
head_output = probabilities V
```

Across the batch and heads:

```text
Q:             [B, Hq, S, Dh]
Kᵀ:            [B, Hq, Dh, T]     logically shared/broadcast for GQA
scores:        [B, Hq, S, T]
probabilities: [B, Hq, S, T]
V:             [B, Hq, T, Dh]     logically shared/broadcast for GQA
head_output:   [B, Hq, S, Dh]
```

Scaling by `sqrt(Dh)` prevents dot-product magnitudes from growing excessively
with head width, which would drive softmax toward saturated distributions.

### Causality in prefill

With a four-token prompt, the logical mask is lower triangular:

```text
key position →   0   1   2   3
query 0          ✓   ·   ·   ·
query 1          ✓   ✓   ·   ·
query 2          ✓   ✓   ✓   ·
query 3          ✓   ✓   ✓   ✓
```

All four query rows can be calculated in parallel, but row `i` cannot use future
positions. After attention, head outputs are concatenated from
`[B, Hq, S, Dh]` to `[B, S, D]` and transformed by output projection `Wo`.

### Causality in cached decode

If four positions are cached and the new token is position 4:

```text
one new query row × five key columns

query 4          ✓   ✓   ✓   ✓   ✓
```

There are no future keys in the supplied cache, so all five columns are valid.
This is where a subtle implementation error appears: a generic “lower triangular
mask” aligned to the upper-left corner of a non-square `[1, 5]` score matrix can
permit only the first key. Cache-aware masking must account for the query's
absolute offset.

PyTorch's scaled-dot-product-attention API exposes the same conceptual operation
and can dispatch to math, memory-efficient, or FlashAttention implementations;
its documentation also calls out mask semantics, GQA constraints, and backend
dependent numerical behavior
([PyTorch SDPA](https://docs.pytorch.org/docs/stable/generated/torch.nn.functional.scaled_dot_product_attention)).

> **Interview checkpoint:** Prefill is not non-causal just because its token
> positions execute in parallel. Parallel scheduling of rows and permitted
> information flow are different concepts.

---

## 0.2.7 KV Reuse Across Decode Steps

At every layer, each accepted position produces K and V for that layer. The
prefill writes prompt K/V. A decode step:

1. computes Q, K, and V for the new position;
2. appends the new K/V to that layer's cache;
3. compares the new Q with all retained keys;
4. mixes all retained values;
5. passes the resulting hidden state onward.

For one layer:

```text
before decode:
K_cache, V_cache: [B, Hkv, C,     Dh]

new projections:
Q_new:            [B, Hq,  1,     Dh]
K_new, V_new:     [B, Hkv, 1,     Dh]

after append:
K_all, V_all:     [B, Hkv, C + 1, Dh]
```

Hugging Face's cache documentation uses the same standard cache layout—batch,
KV heads, sequence length, head dimension—and distinguishes dynamically growing,
static, sliding, offloaded, and quantized cache strategies
([Transformers cache explanation](https://huggingface.co/docs/transformers/v5.3.0/en/cache_explanation),
[cache strategies](https://huggingface.co/docs/transformers/kv_cache)). Those
management choices are Chapter 2 material; the invariant here is that attention
reuses prior K/V rather than recomputing all prior layers.

### Why not cache queries?

Past queries were used to produce past hidden states. During the next-token
step, the model needs an output only for the newest position; it does not need to
recompute outputs for old query rows. Past keys and values are different: the
new query must compare against and retrieve from them. Therefore K/V are
loop-carried state; old Q is not.

### The computation avoided

Without a cache, step `t` would rerun embeddings, every Transformer layer, and
Q/K/V projections for all `t` positions merely to obtain the last logits. With a
cache, the model runs the deep network for one new position and reads prior K/V
inside attention.

Caching does **not** make attention independent of context length. The new query
still reads and scores `T` keys and mixes `T` values. It trades large redundant
recomputation for persistent memory plus growing reads.

---

## 0.2.8 The MLP/FFN Sublayer

Attention mixes information across token positions. The MLP then transforms
each position independently using the same weights:

```text
input:  [B, S, D]
expand: [B, S, M]
output: [B, S, D]
```

The original Transformer used two linear layers with an activation. A common
Llama-style gated form is SwiGLU-like:

```text
gate = SiLU(x W_gate)       [B, S, M]
up   = x W_up               [B, S, M]
mixed = gate ⊙ up           [B, S, M]
out = mixed W_down          [B, S, D]
```

The GLU-variants paper describes gated units as the elementwise product of two
projections, one transformed nonlinearly, and reports quality improvements for
several GLU variants in Transformer feed-forward layers
([GLU Variants Improve Transformer](https://arxiv.org/abs/2002.05202)).

For a gated MLP, the three main matrices contain approximately:

```text
D×M + D×M + M×D = 3DM parameters
```

Attention projections in GQA contain approximately:

```text
Wq: D(HqDh) ≈ D²
Wk: D(HkvDh)
Wv: D(HkvDh)
Wo: D²
```

For typical expansion widths, the MLP can hold a large fraction of model
parameters and perform a large fraction of dense linear work. Attention receives
more conceptual attention because it mixes tokens and creates the KV cache, not
because it must dominate compute in every model, sequence length, and phase.

---

## 0.2.9 From Final Hidden State to Vocabulary Logits

After `L` blocks, a final normalization produces `[B, S, D]`. The language-model
head maps hidden width to vocabulary width:

```text
hidden: [B, S, D]
W_lm:   [V, D]
logits: [B, S, V]
```

Some models tie `W_lm` to the token embedding matrix; others use separate
weights. Weight tying saves parameters but does not remove the need to compute
the vocabulary projection.

During a fresh prefill, logits mathematically exist for all prompt positions,
but ordinary generation requires only the final prompt position to select the
first output token. Implementations can avoid retaining unnecessary full logits.
During decode, `S = 1`, so logits are `[B, 1, V]`, usually viewed as `[B, V]`.

The Transformer ends at logits. Temperature, top-k, top-p, repetition penalties,
grammar constraints, and random sampling belong to the sampler outside the
block. Keeping this boundary prevents a common architecture-diagram error.

---

## 0.2.10 Prefill and Decode Side by Side

| Dimension | Fresh prefill | Cached decode |
| --- | --- | --- |
| New tokens processed, `S` | Whole prompt or a chunk | Usually 1 per request |
| K/V length, `T` | Usually `S` | Cached length + 1 |
| Q shape | `[B,Hq,S,Dh]` | `[B,Hq,1,Dh]` |
| K/V written per layer | `[B,Hkv,S,Dh]` | `[B,Hkv,1,Dh]` |
| K/V read per layer | Current prompt/chunk and any prefix | All retained context |
| Logical score shape | `[B,Hq,S,T]` | `[B,Hq,1,T]` |
| Within-request parallelism | High across new prompt positions | One dependent position |
| Logits normally consumed | Last new position | The single new position |
| Introductory hardware intuition | Larger matrix work; often compute-rich | Small matrix shapes plus growing cache reads; often bandwidth/launch sensitive |
| User metric influenced | Time to first token | Inter-token latency / tokens per second |

The last two descriptions are tendencies, not laws. Short prefill, huge batches,
long decode contexts, quantization, tensor parallelism, kernels, and hardware can
move bottlenecks. Chapter 1 will develop the measurement and roofline reasoning.

### Why one request remains sequential

The logits at decode step `n` determine token `n`. Token `n` determines the
embedding, position, and K/V appended at step `n+1`. That loop-carried dependency
prevents ordinary exact autoregressive generation from computing arbitrary
future tokens simultaneously.

This does not mean a GPU processes only one token globally. A scheduler can place
one new token from many independent requests in the same model invocation.



---

## 0.2.11 What Occupies Memory During Inference?

### 1. Model weights

Embeddings, attention projections, MLP projections, normalization scales, and
the language-model head. They are shared across requests on a model replica.

### 2. Persistent per-request state

Primarily KV cache in an attention-based decoder. It grows with retained tokens,
layers, KV heads, and head dimension. Cache metadata also exists.

### 3. Temporary activations

Residual states, projection outputs, MLP intermediates, normalization results,
and kernel-specific temporaries. They exist while a forward pass is executing
and can often be reused or freed layer by layer because no backward graph is
needed.

### 4. Logits and sampling buffers

The `[B, V]` output can be substantial for a large vocabulary and batch.
Logit-processing and sampling may require additional temporary buffers.

### 5. Runtime workspaces and overhead

Attention/GEMM workspaces, communication buffers, memory-pool reservations,
CUDA Graph storage, allocator metadata, loaded kernels, and framework/runtime
objects. “Free GPU memory” is not simply device capacity minus weight bytes and
KV bytes.

### What is absent compared with training?

- optimizer states, often multiple values per parameter;
- parameter gradients;
- activation storage retained specifically for backward;
- gradient-reduction buffers.

But serving replaces a static training-batch view with many stateful requests
whose cache lengths, deadlines, and lifetimes differ. Capacity planning becomes
a live-state problem.

---

## 0.2.12 Minimal Compute and Memory Reasoning

The goal is dimensional intuition, not a complete performance model.

### Weight memory

```text
weight bytes ≈ parameter count × bytes per stored parameter
```

A 7-billion-parameter model stored entirely in BF16 or FP16 is approximately:

```text
7×10⁹ × 2 bytes ≈ 14 GB
```

This excludes cache, activations, workspaces, allocator reservation, and any
replication or sharding effects. “GB” versus “GiB” also changes the displayed
number.

### Dense linear work

Multiplying `[B,S,Din]` by `[Din,Dout]` performs roughly:

```text
2 × B × S × Din × Dout floating-point operations
```

The factor 2 counts a multiply and add. It is a useful comparison estimate, not
a latency prediction.

### Logical attention work

Ignoring constants outside the two main products, QKᵀ plus probability-times-V
costs roughly:

```text
prefill:  ~4 × B × Hq × S × T × Dh
decode:   ~4 × B × Hq × 1 × T × Dh
```

For fresh prefill, `T=S`, giving quadratic score interactions in prompt length.
For cached decode, work per step grows approximately linearly with retained
length `T`.

### KV-cache growth

For one request and one retained token:

```text
KV bytes per token
= 2 × L × Hkv × Dh × bytes_per_cache_element
   ↑
   K and V
```

For `B` equal-length sequences of retained length `T`:

```text
total KV bytes
≈ B × T × 2 × L × Hkv × Dh × bytes_per_cache_element
```

Real systems add allocation granularity, metadata, fragmentation, possible
padding, hybrid attention layers, and replication/sharding choices. Chapter 2
will make this an operational capacity formula.

### Why FLOPs do not equal latency

Latency also depends on:

- bytes moved through each level of memory;
- matrix shapes and achieved hardware utilization;
- kernel launch and synchronization overhead;
- fusion and intermediate materialization;
- batch composition and padding;
- communication across devices;
- runtime scheduling and queueing.

FlashAttention is an instructive case: it computes exact attention while
improving wall-clock behavior by reducing memory traffic, demonstrating why an
algorithm's data movement matters alongside arithmetic count
([FlashAttention](https://arxiv.org/abs/2205.14135)).

---

## 0.2.13 One Tiny Transformer, Fully Traced

Use this deliberately small model:

```text
B   = 1
S   = 4 prompt tokens
D   = 8
Hq  = 2
Hkv = 1
Dh  = 4
M   = 24
L   = 2
V   = 16
cache dtype = FP16 (2 bytes)
```

The identity `D = Hq × Dh = 2 × 4 = 8` holds. Two query heads share one KV head.

### Prefill trace

| Operation, at one layer | Shape | Persistent? |
| --- | --- | --- |
| Token IDs | `[1,4]` | Request input |
| Embedding/residual | `[1,4,8]` | Temporary |
| Normalized states | `[1,4,8]` | Temporary |
| Q | `[1,2,4,4]` | No |
| New K | `[1,1,4,4]` | Yes, append to this layer's K cache |
| New V | `[1,1,4,4]` | Yes, append to this layer's V cache |
| Logical scores | `[1,2,4,4]` | Usually not materialized persistently |
| Per-head attention result | `[1,2,4,4]` | Temporary |
| Concatenated/projected result | `[1,4,8]` | Temporary |
| MLP gate and up tensors | two tensors `[1,4,24]` | Temporary |
| MLP output / block output | `[1,4,8]` | Temporary |

The same pattern repeats for layer 2, but layer 2 caches its own K/V derived from
the hidden states it receives. Caches cannot be shared across layers.

After final normalization:

```text
full prefill logits: [1,4,16]
logits consumed:     [1,16]  # position 3 only
```

Cache bytes after the four-token prefill:

```text
2 (K,V) × 2 layers × 1 KV head × 4 positions × 4 dims × 2 bytes
= 128 bytes
```

This toy number is tiny; the formula is the lesson.

### First cached decode step

Assume the sampler selected token ID 7.

```text
new input ID:        [1,1]
position ID:         [1,1] containing position 4
new hidden state:    [1,1,8]
Q_new per layer:     [1,2,1,4]
K_new/V_new:         [1,1,1,4]
K_all/V_all:         [1,1,5,4]
logical scores:      [1,2,1,5]
block output:        [1,1,8]
decode logits:       [1,1,16] → consume [1,16]
```

Cache bytes after accepting that token:

```text
2 × 2 × 1 × 5 × 4 × 2 = 160 bytes
```

One accepted token added 32 bytes, exactly the per-token formula:

```text
2 × L × Hkv × Dh × bytes = 2 × 2 × 1 × 4 × 2 = 32
```

### The state transition

```text
before: token history length 4, per-layer KV length 4
input:  token 7 at position 4
after:  token history length 5, per-layer KV length 5, next-token logits ready
```

This is the model-runner core of one decode iteration from Section 0.1.

---

## 0.2.14 Representative PyTorch Shape Trace

The code below is intentionally educational. It exposes the tensors and performs
GQA by explicitly expanding shared K/V heads; optimized kernels should avoid
physical copies. It omits RoPE arithmetic but passes positions explicitly so the
boundary is visible.

```python
from dataclasses import dataclass

import torch
import torch.nn as nn
import torch.nn.functional as F


@dataclass
class TinyConfig:
    vocab: int = 16
    d_model: int = 8
    q_heads: int = 2
    kv_heads: int = 1
    head_dim: int = 4
    mlp_dim: int = 24


class TinyGQABlock(nn.Module):
    def __init__(self, cfg: TinyConfig):
        super().__init__()
        assert cfg.d_model == cfg.q_heads * cfg.head_dim
        assert cfg.q_heads % cfg.kv_heads == 0
        self.cfg = cfg
        self.attn_norm = nn.RMSNorm(cfg.d_model)
        self.ffn_norm = nn.RMSNorm(cfg.d_model)
        self.q_proj = nn.Linear(cfg.d_model, cfg.q_heads * cfg.head_dim, bias=False)
        self.k_proj = nn.Linear(cfg.d_model, cfg.kv_heads * cfg.head_dim, bias=False)
        self.v_proj = nn.Linear(cfg.d_model, cfg.kv_heads * cfg.head_dim, bias=False)
        self.o_proj = nn.Linear(cfg.d_model, cfg.d_model, bias=False)
        self.gate = nn.Linear(cfg.d_model, cfg.mlp_dim, bias=False)
        self.up = nn.Linear(cfg.d_model, cfg.mlp_dim, bias=False)
        self.down = nn.Linear(cfg.mlp_dim, cfg.d_model, bias=False)

    def split_heads(self, x, heads):
        b, s, _ = x.shape
        return x.view(b, s, heads, self.cfg.head_dim).transpose(1, 2)

    def forward(self, x, past_k=None, past_v=None):
        b, s, _ = x.shape
        z = self.attn_norm(x)
        q = self.split_heads(self.q_proj(z), self.cfg.q_heads)
        k_new = self.split_heads(self.k_proj(z), self.cfg.kv_heads)
        v_new = self.split_heads(self.v_proj(z), self.cfg.kv_heads)

        k_all = k_new if past_k is None else torch.cat([past_k, k_new], dim=2)
        v_all = v_new if past_v is None else torch.cat([past_v, v_new], dim=2)
        cached = 0 if past_k is None else past_k.size(2)
        total = k_all.size(2)

        # Educational expansion only. A real GQA kernel shares without this copy.
        group_size = self.cfg.q_heads // self.cfg.kv_heads
        k_for_q = k_all.repeat_interleave(group_size, dim=1)
        v_for_q = v_all.repeat_interleave(group_size, dim=1)

        # Query row i has absolute position cached+i and may attend through it.
        q_pos = cached + torch.arange(s, device=x.device)[:, None]
        k_pos = torch.arange(total, device=x.device)[None, :]
        allowed = k_pos <= q_pos                    # [S, T]

        scores = q @ k_for_q.transpose(-2, -1) / (self.cfg.head_dim ** 0.5)
        scores = scores.masked_fill(~allowed, float("-inf"))
        probs = torch.softmax(scores, dim=-1)
        heads = probs @ v_for_q                     # [B, Hq, S, Dh]
        merged = heads.transpose(1, 2).contiguous().view(b, s, self.cfg.d_model)
        x = x + self.o_proj(merged)

        z = self.ffn_norm(x)
        x = x + self.down(F.silu(self.gate(z)) * self.up(z))

        print({
            "Q": tuple(q.shape),
            "K_new": tuple(k_new.shape),
            "K_all": tuple(k_all.shape),
            "scores": tuple(scores.shape),
            "block_out": tuple(x.shape),
        })
        return x, k_all, v_all


cfg = TinyConfig()
embed = nn.Embedding(cfg.vocab, cfg.d_model)
block = TinyGQABlock(cfg).eval()
lm_head = nn.Linear(cfg.d_model, cfg.vocab, bias=False).eval()

with torch.inference_mode():
    prompt = torch.tensor([[2, 5, 9, 3]])
    h, k_cache, v_cache = block(embed(prompt))
    print("prefill logits:", tuple(lm_head(h).shape))       # (1, 4, 16)

    next_id = torch.tensor([[7]])
    h, k_cache, v_cache = block(embed(next_id), k_cache, v_cache)
    print("decode logits:", tuple(lm_head(h).shape))        # (1, 1, 16)
```

Expected key shapes:

```text
prefill: Q=(1,2,4,4), K_all=(1,1,4,4), scores=(1,2,4,4)
decode:  Q=(1,2,1,4), K_all=(1,1,5,4), scores=(1,2,1,5)
```

The snippet illustrates concepts, not a production engine. It has only one
block, does not apply RoPE, allocates by concatenation, materializes attention
scores, expands K/V, and lacks fused kernels, batching metadata, cache paging,
quantization, and device placement. PyTorch's SDPA can select optimized backends,
but its API and mask behavior still require careful shape reasoning
([PyTorch SDPA](https://docs.pytorch.org/docs/stable/generated/torch.nn.functional.scaled_dot_product_attention)).

---

## 0.2.15 Training Mental Model Versus Inference Mental Model

| Training instinct | Serving-time correction |
| --- | --- |
| A batch is a fixed tensor of samples | A batch is a temporary coalition of live requests with different histories |
| Teacher forcing exposes every target token | Generation knows only tokens already accepted |
| One forward computes all sequence-position losses | One decode forward normally advances each request by one token |
| Activations are retained for backward | Most forward activations are short-lived, but KV persists across iterations |
| Optimizer/gradient memory dominates planning | Weights, live KV state, workspaces, and runtime headroom dominate |
| Throughput means training samples or tokens per step | Serving separates request throughput, input-token throughput, and output-token throughput |
| Dataset order is predetermined | Arrivals, deadlines, cancellation, and output lengths are dynamic |
| Padding/masking describe a static training batch | Schedulers and packed metadata describe changing request state |
| A high-FLOP kernel is necessarily the bottleneck | Memory traffic, shape efficiency, launch overhead, and queueing can dominate |

### Long prompt, short answer versus short prompt, long answer

Consider two requests with the same total token count:

```text
A: 4,000 prompt tokens + 20 output tokens
B:    20 prompt tokens + 4,000 output tokens
```

They are not operationally equivalent.

- A concentrates work in prefill and may have high TTFT, then finishes after a
  few sequential decode steps.
- B reaches its first token quickly but occupies KV capacity and scheduler slots
  across thousands of sequential decode iterations.
- Both eventually retain roughly 4,020 positions if no sliding/eviction applies,
  but their time profiles and interference with other requests differ.

This is why an average “tokens per request” is insufficient for capacity and SLO
reasoning.

---

## Common Misconceptions

### “The model sees chat roles directly.”

The serving input processor serializes roles and content into token IDs. The
decoder block receives numeric tensors, not application-level message objects.

### “The entire answer is produced in one forward pass.”

A forward pass produces logits for the next token at each supplied position.
Unknown future output tokens require repeated dependent decode steps.

### “The KV cache stores hidden states or every intermediate tensor.”

Standard attention caching retains per-layer keys and values for reusable past
positions. Temporary residual, score, probability, and MLP tensors need not all
persist between decode steps.

### “Decode is cheap because it processes one token.”

It still traverses every layer, reads model weights, reads growing K/V context,
runs projections and MLPs, produces vocabulary logits, and pays runtime overhead.
Small shapes can also underutilize hardware.

### “Attention always dominates compute.”

MLP and projection matrices can dominate at shorter contexts. Attention's
context-dependent work and memory traffic grow with sequence length. The answer
depends on model, phase, batch, context, kernel, and hardware.

### “Sampling happens inside the Transformer block.”

The model produces logits. The serving layer applies logit processors and token
selection policy.

### “Prefill is parallel, so it is bidirectional.”

Causal masking restricts information flow even when prompt query rows execute in
parallel.

### “FLOPs directly determine user-visible latency.”

User latency includes queueing and preprocessing, while model latency depends on
data movement, utilization, kernels, communication, and synchronization as well
as arithmetic.

---

## Exercises and L5 Interview Questions — With Solutions

### Question 1 — Derive GQA shapes

Given:

```text
B=3, S=128, D=4096, Hq=32, Hkv=8, Dh=128, L=32
```

Derive Q/K/V shapes for fresh prefill and for decode after 1,024 cached tokens.

#### Solution

Fresh prefill has `T=S=128`:

```text
Q: [3,32,128,128]
K,V new and retained: [3,8,128,128]
logical scores: [3,32,128,128]
```

Decode has `S=1`, prior cache `C=1024`, and `T=1025` after append:

```text
Q_new: [3,32,1,128]
K_new,V_new: [3,8,1,128]
K_all,V_all: [3,8,1025,128]
logical scores: [3,32,1,1025]
```

Each KV head serves `32/8=4` query heads. A weak answer often uses 32 heads in
the cache, losing GQA's main inference benefit.

**Likely follow-up:** If all three requests have different cached lengths, a
real engine may pack tokens and use length/block metadata instead of presenting
one dense padded `[3,8,1025,128]` allocation.

### Question 2 — Why can GQA improve serving scalability?

#### Solution

GQA reduces K/V heads while preserving query heads. KV bytes per token scale
linearly with `Hkv`, so fewer KV heads reduce per-request cache capacity and the
bytes read during decode attention. That can permit more concurrent sequences or
longer contexts and reduce bandwidth pressure.

It is not free by definition. The model must be trained or adapted for the head
sharing; quality can depend on architecture and training. Kernels must support
the head mapping efficiently. The GQA paper found a favorable quality/speed
trade-off in its experiments, but an interviewer should hear the mechanism and
measurement plan, not “GQA is always better.”

### Question 3 — Why is one new attention row sufficient in decode?

#### Solution

Past token hidden states and their downstream outputs were already computed.
The system needs only the newest final hidden state to obtain next-token logits.
Therefore it computes one new query row. That query still compares with every
retained key and mixes every retained value. Past Q rows do not affect the new
row; past K/V do, which explains the cache contents.

**Weak answer:** “Because the other tokens are in memory.” This does not identify
what is stored or why old queries are unnecessary.

### Question 4 — Estimate weight and KV memory

A 7B model uses BF16 weights. Its attention has `L=32`, `Hkv=8`, `Dh=128`, and
BF16 cache. Estimate weight memory and KV growth per token per request.

#### Solution

```text
weights ≈ 7e9 × 2 bytes = 14 GB

KV/token = 2 × 32 × 8 × 128 × 2 bytes
         = 131,072 bytes
         = 128 KiB per token
```

At 4,096 retained tokens, idealized KV is approximately 512 MiB per request.
The estimate excludes allocator/block granularity, metadata, non-attention state,
workspaces, activations, logits, and tensor-parallel placement. Verify the real
model configuration—“7B” alone does not determine KV size.

### Question 5 — What changes from training to inference memory?

#### Solution

Remove optimizer states, parameter gradients, and the need to retain activations
for backward. Keep weights and temporary forward activations. Add persistent
per-request KV cache, sampling/runtime buffers, and serving overhead. Dynamic
batching means memory depends on live sequence lengths and request churn rather
than one static tensor shape.

**Likely follow-up:** Quantization changes weight/cache bytes; tensor parallelism
changes their placement; CUDA Graphs and memory pools can reserve additional
memory. Do not claim the simple categories equal observed device usage exactly.

### Question 6 — Why can a one-token decode step still be slow?

#### Solution

One new token still traverses all layers, loads/uses large weight matrices,
reads K/V for all retained positions, performs MLP and attention operations,
produces `V` logits, and incurs kernel/synchronization/communication overhead.
With small `S=1` shapes, arithmetic units may be poorly utilized. Long context
increases cache reads. Low batch reduces weight reuse across requests.

A strong diagnosis asks for batch size, context distribution, achieved bandwidth
and utilization, kernel timeline, tensor-parallel communication, and scheduler
gaps before choosing an optimization.

### Question 7 — Diagnose cached/uncached mismatch

Full-sequence execution produces correct logits, but token-by-token cached
generation diverges immediately after the first generated token. What do you
inspect?

#### Solution

Prioritize the differences introduced by caching:

1. position IDs and RoPE/cache offsets;
2. whether new K/V are appended to the correct layer and sequence;
3. causal-mask alignment for non-square `[S,T]` attention;
4. cache length metadata and padding/block tables;
5. token fed into the next step and off-by-one append order;
6. dtype/backend numerical differences only after structural checks.

Sampling is less likely if comparing logits before sampling. Build a tiny test
that compares the last-position logits of a full prefix against cached incremental
execution at every step.

### Question 8 — Compare two traffic shapes

Compare a 4,000-token prompt with a 20-token answer against a 20-token prompt
with a 4,000-token answer.

#### Solution

The first request is prefill-heavy: it performs a large parallel prompt pass,
likely raising TTFT, then exits quickly. The second is decode-heavy: it has low
initial prefill but thousands of loop-carried iterations, keeps state live much
longer, and repeatedly competes for scheduler and bandwidth resources. Similar
total token counts do not imply similar latency, occupancy, or impact on other
requests.

### Question 9 — Draw ownership boundaries

Where do embeddings, cache management, attention computation, and sampling live?

#### Solution

- The model runner executes embeddings, blocks, final norm, and LM head.
- Each block produces K/V, but a cache manager/runtime owns allocation, physical
  placement, mapping, lifetime, and cleanup.
- The attention kernel reads the locations described by runtime metadata.
- The sampler consumes model logits outside the Transformer block.

Exact process boundaries vary by engine, but logical responsibilities should not
collapse into “the model.”

---

## Revision Card

### Decoder block

```text
IDs [B,S]
 → embedding [B,S,D]
 → L × {
      RMSNorm
      Q [B,Hq,S,Dh]
      new K/V [B,Hkv,S,Dh] → append cache [B,Hkv,T,Dh]
      causal attention scores [B,Hq,S,T]
      output projection + residual [B,S,D]
      RMSNorm → gated MLP [B,S,M] → [B,S,D] + residual
   }
 → final norm [B,S,D]
 → LM head [B,S,V]
 → consume final-position logits [B,V]
```

### Attention equation

```text
Attention(Q,K,V) = softmax((QKᵀ / sqrt(Dh)) + mask) V
```

### MHA versus MQA versus GQA

```text
MHA: Hkv = Hq
MQA: Hkv = 1
GQA: 1 < Hkv < Hq, usually Hq divisible by Hkv
```

Fewer KV heads reduce cache elements and decode-time K/V traffic.

### Prefill versus decode

```text
Prefill: S = prompt/chunk length; calculate many query rows; establish cache.
Decode:  S = 1 normally; read prior cache; append one K/V position per layer.
```

### KV formula

```text
bytes per retained token per request
= 2 × L × Hkv × Dh × bytes_per_element
```

### Inference memory

```text
weights
+ persistent KV/cache metadata
+ temporary forward activations
+ logits/sampling buffers
+ runtime workspaces and allocator reservation
```

No optimizer state, gradients, or stored backward graph.

### Five checks when cached decode is wrong

1. Position/RoPE offset
2. Cache append order and layer identity
3. Non-square causal-mask alignment
4. Sequence length/block metadata
5. Exact token passed to the next step

### Five interview traps

1. Confusing `S` new tokens with `T` total context
2. Using `Hq` instead of `Hkv` in cache formulas
3. Calling parallel prefill bidirectional
4. Saying one-token decode has constant cost independent of context
5. Treating logits and sampling as the same component

---

## Further Reading

### Transformer and representative modern architectures

- [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- [Llama 2: Open Foundation and Fine-Tuned Chat Models](https://arxiv.org/abs/2307.09288)
- [The Llama 3 Herd of Models](https://ai.meta.com/research/publications/the-llama-3-herd-of-models/)
- [Meta: Introducing Llama 3](https://ai.meta.com/blog/meta-llama-3/)

### Attention, positions, normalization, and MLPs

- [GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints](https://arxiv.org/abs/2305.13245)
- [RoFormer: Enhanced Transformer with Rotary Position Embedding](https://arxiv.org/abs/2104.09864)
- [Root Mean Square Layer Normalization](https://arxiv.org/abs/1910.07467)
- [GLU Variants Improve Transformer](https://arxiv.org/abs/2002.05202)
- [FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness](https://arxiv.org/abs/2205.14135)

### Current implementation references

- [PyTorch Scaled Dot-Product Attention](https://docs.pytorch.org/docs/stable/generated/torch.nn.functional.scaled_dot_product_attention)
- [PyTorch MultiheadAttention](https://docs.pytorch.org/docs/stable/generated/torch.nn.MultiheadAttention.html)
- [Hugging Face Transformers: Caching](https://huggingface.co/docs/transformers/v5.3.0/en/cache_explanation)
- [Hugging Face Transformers: Cache Strategies](https://huggingface.co/docs/transformers/kv_cache)
