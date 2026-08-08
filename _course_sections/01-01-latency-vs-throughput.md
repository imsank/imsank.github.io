---
layout: course
title: "Latency vs Throughput"
description: "Measure TTFT, TPOT, end-to-end latency, throughput, goodput, saturation, and tail behavior for online LLM inference."
course: true
chapter_number: 1
chapter_title: "Performance Fundamentals"
section_number: "1.1"
section_order: 3
previous_url: /ai/llm-inference-engineering/foundation/transformer-inference-refresher/
previous_title: "Transformer Inference Refresher"
next_title: "GPU Architecture for ML Engineers"
permalink: /ai/llm-inference-engineering/performance-fundamentals/latency-vs-throughput/
---

<!-- Generated from G_prep_mle_course. Edit the authoritative Markdown source, then republish. -->

## Why This Section Exists

Ask whether an LLM service is “fast,” and you may receive any of these answers:

- “The first token appears in 300 ms.”
- “It generates 45 tokens per second.”
- “The server produces 8,000 tokens per second.”
- “P99 latency is under 5 seconds.”
- “We sustain 20 requests per second.”

All five can be true for the same deployment, but they describe different
properties. None is meaningful until we also know the measurement boundary,
workload, load level, percentile, and unit.

This section develops a measurement model before discussing optimization. That
order matters. If an engineer cannot state precisely what improved, for whom,
and under which workload, an apparent optimization can easily be a benchmark
artifact or a transfer of pain from one user-visible metric to another.

By the end, you should be able to turn an ambiguous statement such as “version
B is 30% faster” into a testable claim—and challenge it in an L5 interview.

## Learning Outcomes

After completing this section, you should be able to:

1. draw a timestamped streaming-request timeline;
2. derive TTFT, ITL, TPOT, end-to-end latency, and several throughput metrics;
3. distinguish per-request generation speed from aggregate server throughput;
4. explain concurrency, request rate, queueing, saturation, and goodput;
5. interpret P50, P90, P95, and P99 without hiding the tail behind an average;
6. design a representative and reproducible online-serving benchmark;
7. diagnose common TTFT/TPOT regression patterns; and
8. recommend different operating points for interactive and offline workloads.

---

{% include course_visuals/latency_throughput_lab.html %}

---

## 1.1.1 “Fast” Is a Workload-Specific Claim

An inference system has at least two stakeholders:

- **the user**, who experiences waiting time and token cadence; and
- **the operator**, who pays for enough capacity to serve the workload.

Their objectives overlap, but they are not identical.

| Workload | User-facing priority | Operator-facing priority |
|---|---|---|
| Interactive chat | Fast first token, readable token cadence, low tail latency | SLO-compliant requests per accelerator |
| Code completion | Very low TTFT and low jitter | Goodput during bursty editor traffic |
| Long-form generation | Stable token cadence and acceptable completion time | Output-token throughput and cost/token |
| Offline summarization | Deadline or job completion time | Maximum throughput within the batch window |
| Evaluation pipeline | Repeatability and completion time | Samples/hour or tokens/second at bounded cost |

For an interactive service, maximizing raw throughput can be the wrong goal. A
server might admit so much work that it produces more total tokens while every
user waits longer. For an offline job, accepting higher per-request latency may
be sensible if the batch finishes sooner.

The complete performance claim is therefore:

> **metric + boundary + workload + load + statistic + configuration**

For example:

> Client-observed P99 TTFT is 850 ms for a 1,000-token-input/200-token-output
> workload at 12 requests/second, using model M, engine E, precision P, and
> hardware H after warmup.

That sentence is longer than “850 ms TTFT,” but it is reproducible.

---

## 1.1.2 Start With a Timestamped Request

Consider one streaming request producing `N` output tokens. Define:

| Symbol | Event |
|---|---|
| `t0` | client sends the request |
| `ta` | server admits and validates it |
| `ts` | scheduler first selects it for execution |
| `f0` | first output token reaches the client |
| `f1 ... f(N-1)` | later output tokens reach the client |
| `te = f(N-1)` | final output token reaches the client |

```text
client send                                                    final token
    t0                                                              te
     │                                                               │
     ▼                                                               ▼
     ├─ network/API ─┬─ queue ─┬─ prefill + first decode ─┬─ decode ─┤
                     ta        ts                         f0          │
                                                          │ f1 f2 ...│
                                                          └ streamed ┘
```

NVIDIA's current NIM benchmarking documentation defines TTFT from query
submission to the first non-empty token and notes that this can include network,
queueing, and prefill time. It defines end-to-end latency through the final
token. The same documentation warns that tools differ, so definitions must be
aligned before results are compared ([NVIDIA NIM metrics](https://docs.nvidia.com/nim/benchmarking/llm/latest/metrics.html)).

### Boundary A: client-observed latency

The client clock captures what the user experiences:

- request serialization;
- network travel;
- gateway and API work;
- queueing and model execution;
- response framing and network return.

This is the correct boundary for a product SLO, but it does not isolate the
model server.

### Boundary B: server-observed latency

The server can exclude part or all of the client network path. It is useful for
comparing serving-runtime behavior, but it must not be presented as the full
user experience.

### Boundary C: model-execution latency

This isolates device execution or an engine call. It is useful when comparing
kernels or engines, but it excludes queueing, tokenization, scheduling, and
transport. NVIDIA's TensorRT measurement guidance similarly distinguishes
host-side wall-clock latency from GPU compute time and emphasizes that
asynchronous GPU work requires correct synchronization
([TensorRT performance best practices](https://docs.nvidia.com/deeplearning/tensorrt/latest/performance/best-practices.html)).

An honest benchmark can report all three boundaries. It must never silently
substitute one for another.

---

## 1.1.3 Time to First Token (TTFT)

For the client timeline:

```text
TTFT = f0 - t0
```

TTFT answers:

> How long after I submit the request do I see useful model output begin?

It usually contains several components:

```text
TTFT
  = request/network time
  + API and tokenization work
  + admission and queueing
  + prefill
  + first-token selection and delivery
```

This is a decomposition, not a promise that every implementation exposes every
term separately.

### Why prompt length affects TTFT

During prefill, the model processes the prompt and creates request state needed
for later decoding. More input tokens generally imply more work and more memory
traffic, so TTFT is not comparable unless the input-length workload is also
comparable. NVIDIA's benchmarking guidance explicitly connects longer input
sequences with greater prefill requirements and TTFT
([NIM parameters and best practices](https://docs.nvidia.com/nim/benchmarking/llm/latest/parameters.html)).

### Why TTFT is not “prefill latency”

At concurrency one on a local machine, prefill may dominate TTFT. In an online
service, queueing can dominate it. A TTFT regression with unchanged model
execution is entirely possible if arrival rate increases, admission policy
changes, or a gateway becomes slow.

### Product interpretation

TTFT often controls whether an interactive application feels responsive at the
start. It does **not** tell us whether the remaining answer arrives smoothly.
That is the role of token-to-token metrics.

---

## 1.1.4 ITL and TPOT: The Decode Cadence

For token arrival timestamps `f0, f1, ..., f(N-1)`, define each inter-token gap:

```text
ITL_i = f_i - f_(i-1), for i = 1 ... N-1
```

The individual gaps expose stalls and jitter. A request-level mean is:

```text
TPOT = mean(ITL_i)
     = (te - f0) / (N - 1), for N > 1
```

NVIDIA NIM calls this average ITL and notes that it is also known as TPOT. Some
tooling makes a useful finer distinction: individual token gaps are ITLs, while
TPOT is their per-request average. The current vLLM serving benchmark computes
TPOT as `(end-to-end latency - TTFT) / (output tokens - 1)` and separately
retains individual ITLs ([vLLM benchmark implementation](https://docs.vllm.ai/en/latest/api/vllm/benchmarks/serve/)).

We will use the following convention throughout this course:

- **ITL:** one observed gap between consecutive output tokens;
- **TPOT:** the average of a request's ITLs;
- **ITL distribution:** all individual gaps, useful for finding jitter.

### The off-by-one that matters

If a request returns `N = 100` tokens, there are only `99` gaps after the first
token. The first token is already accounted for by TTFT.

```text
E2E latency = TTFT + (N - 1) × TPOT
```

This equality holds when TPOT is calculated from that request's timestamps.
Using `N` in the denominator slightly understates decode time and mixes startup
latency into the token cadence.

### Per-user token rate

Once streaming has started, a useful approximate rate is:

```text
generation rate per user ≈ 1 / TPOT
```

If TPOT is `25 ms/token`:

```text
1 / 0.025 seconds per token = 40 tokens/second
```

Do not confuse this with total server tokens/second. One user may receive 40
tokens/second while a server concurrently generates tokens for hundreds of
users.

### Mean cadence can hide pauses

These two requests can have the same TPOT:

```text
Request A ITLs: 20, 20, 20, 20, 20 ms
Request B ITLs:  5,  5, 75,  5, 10 ms
```

Both average 20 ms, but B visibly stalls. Report an ITL percentile or maximum
when smooth streaming matters.

---

## 1.1.5 End-to-End Latency

For a completed streaming request:

```text
E2E = te - t0
```

Using our convention:

```text
E2E = TTFT + (N - 1) × TPOT
```

### Worked example

Suppose a request produces 81 output tokens:

- TTFT = `0.40 s`
- TPOT = `0.025 s/token`
- number of post-first-token gaps = `80`

Then:

```text
E2E = 0.40 + 80 × 0.025
    = 0.40 + 2.00
    = 2.40 seconds
```

Sanity check: `80 × 25 ms = 2,000 ms`; plus `400 ms` gives `2,400 ms`.

### Why output length must be recorded

A five-second response is excellent for a 1,000-token answer and poor for a
ten-token answer. E2E latency depends strongly on requested and actual output
length, so comparing E2E distributions without output-length distributions is
usually misleading.

### Streaming changes perception, not completion time

Streaming lets a user begin reading before completion. It improves perceived
responsiveness when TTFT and cadence are acceptable, but the final token still
defines E2E latency.

---

## 1.1.6 Throughput Has Several Valid Units

Throughput is completed work divided by a measurement interval. The difficulty
is defining “work.” Let `T` be the steady-state benchmark duration.

### Request throughput

```text
request throughput = completed requests / T
```

This is meaningful only when requests have comparable token lengths. Ten
short-answer requests are not the same amount of inference work as ten
long-answer requests.

### Output-token throughput

```text
output throughput = Σ output tokens / T
```

This focuses on generated tokens and is especially useful for decode-heavy
workloads.

### Input-token throughput

```text
input throughput = Σ input tokens / T
```

This characterizes prompt processing and is useful for prefill-heavy use cases.

### Total-token throughput

```text
total token throughput = Σ(input tokens + output tokens) / T
```

It is convenient, but it treats input and output tokens as interchangeable
units of work even though prefill and decode execute differently. Always report
the input/output mix beside it.

The vLLM online-serving benchmark exposes request throughput, output-token
throughput, and total-token throughput separately—evidence that “tokens/second”
alone is underspecified ([vLLM `bench serve`](https://docs.vllm.ai/en/stable/cli/bench/serve/)).

### Per-user rate versus aggregate rate

Suppose 100 active users each receive 25 output tokens/second. Ignoring timing
edges, aggregate output throughput is approximately:

```text
100 users × 25 tokens/s/user = 2,500 output tokens/s
```

The first number describes experience; the second describes system capacity.
Increasing concurrency can raise the aggregate number while lowering the
per-user number.

---

## 1.1.7 Goodput: Throughput That Meets the Promise

Raw throughput counts completed work even when the result arrives too late for
the product. **Goodput** counts only requests that meet the specified service
objectives:

```text
goodput = SLO-compliant completed requests / T
```

For example, define a chat request as good only if:

```text
TTFT ≤ 1,000 ms
AND TPOT ≤ 50 ms/token
AND E2E ≤ 12 s
```

If 200 requests complete in ten seconds but only 150 satisfy all three
conditions:

```text
raw throughput = 200 / 10 = 20 requests/s
goodput        = 150 / 10 = 15 good requests/s
SLO attainment = 150 / 200 = 75%
```

vLLM supports goodput constraints on TTFT, TPOT, and E2E latency. The DistServe
paper formalizes per-GPU goodput as the maximum arrival rate served while
meeting a target level of SLO attainment
([DistServe paper](https://arxiv.org/abs/2401.09670)).

Goodput is often the best bridge between product and infrastructure:

- product defines “good” through SLOs;
- infrastructure maximizes the rate of good requests per unit cost.

---

## 1.1.8 Concurrency, Request Rate, and Offered Load

These terms are related but not interchangeable.

### Concurrency

Concurrency is the number of requests active at once. In a common closed-loop
benchmark with concurrency `C`, each virtual client sends its next request only
after its previous request finishes. The benchmark tries to keep approximately
`C` requests active.

### Request rate

Request rate is the arrival rate, often written `λ`, in requests/second. An
open-loop generator schedules arrivals independently of when earlier requests
finish. Inter-arrival times might be fixed, sampled from a Poisson process, or
replayed from a production trace.

NVIDIA's current benchmark guidance describes both modes. It also warns that
an open-loop request rate above service capacity can allow outstanding requests
to grow without bound, while a concurrency-controlled test naturally applies
backpressure ([NIM load-control guidance](https://docs.nvidia.com/nim/benchmarking/llm/latest/parameters.html)).

### Why the distinction changes the experiment

Imagine a server slows down:

- in a **closed loop**, clients wait longer before sending the next request, so
  the offered request rate falls;
- in an **open loop**, arrivals continue, so the queue grows and exposes
  overload behavior.

Closed-loop tests are convenient for concurrency sweeps. Open-loop tests better
represent externally imposed traffic and bursts. A serious evaluation often
uses both.

### Offered load versus achieved throughput

```text
offered load = work submitted per second
achieved throughput = work completed per second
```

Below capacity, they are similar after transient effects. Above capacity,
offered load can keep increasing while achieved throughput plateaus or falls.
The difference accumulates as queued or rejected work.

---

## 1.1.9 Saturation and the Latency–Throughput Curve

At low load, spare capacity keeps queues short. As load increases, batching and
parallelism may improve aggregate throughput. Eventually a limiting resource
approaches saturation:

```text
aggregate throughput
  │                         ───────── capacity region
  │                    ─────
  │                ───
  │            ───
  │        ───
  │    ───
  └──────────────────────────────────── offered load
                         ▲
                    saturation knee

latency
  │                              /
  │                           __/
  │                        __/
  │_______________________/
  └──────────────────────────────────── offered load
                         ▲
                    saturation knee
```

Before the knee, more load produces substantially more useful throughput.
After the knee, throughput gains diminish while queueing and tail latency rise
rapidly. The desired production operating point is normally **before** the
maximum-throughput point, with headroom for bursts and failures.

NVIDIA publishes benchmark sweeps where aggregate token throughput rises with
concurrency while TTFT and ITL also rise; the exact curves vary by model,
hardware, precision, and sequence shape
([example NIM performance results](https://docs.nvidia.com/nim/benchmarking/llm/1.0.0/performance.html)).
Treat such a table as evidence of the trade-off, not as a portable capacity
number.

---

## 1.1.10 Little’s Law: A Useful Queueing Sanity Check

For a stable system over a sufficiently representative interval:

```text
L = λW
```

where:

- `L` = average number of requests in the system;
- `λ` = average completed arrival rate in requests/second;
- `W` = average time in the system in seconds.

### Example

If a stable service completes `20 requests/s` and average E2E latency is `2 s`:

```text
L = 20 requests/s × 2 s = 40 requests
```

So we should observe about 40 requests in flight on average across queueing and
service. If telemetry instead shows 400, one of our boundaries, averaging
windows, stability assumptions, or measurements is wrong.

### What the equation does not say

Little's Law does not explain the cause of latency or predict percentiles. It
does not say that increasing concurrency will increase capacity indefinitely.
It is an accounting identity for a stable flow and a powerful units check.

### Near saturation

Suppose arrivals remain at `20 requests/s`, while average latency rises from
`2 s` to `5 s`:

```text
before: L = 20 × 2 = 40
after:  L = 20 × 5 = 100
```

Sixty additional requests are now resident in the system. They consume queue
slots, request metadata, and often KV-cache memory. Latency is therefore also a
capacity concern.

---

## 1.1.11 Percentiles and Tail Latency

A P99 TTFT of two seconds means approximately 99% of observed TTFT samples were
at or below two seconds and 1% were above it. It does **not** mean every 100th
request is deterministically slow, and it says nothing about how extreme the
slowest 1% is.

### Why the mean is insufficient

Consider ten TTFT samples in milliseconds:

```text
100, 105, 105, 110, 110, 115, 120, 125, 130, 2,000
```

The median is near 112.5 ms, while the mean is 292 ms. Neither number alone
communicates both the normal experience and the outlier. Production dashboards
usually need multiple percentiles plus error and traffic rates.

### Sources of an LLM serving tail

- variable prompt and output lengths;
- queueing behind large prefills or decode batches;
- scheduler decisions and head-of-line blocking;
- cache misses or prefix-cache hit variation;
- memory pressure, allocation, or request preemption;
- CPU tokenization and sampling stalls;
- network and gateway variability;
- replica heterogeneity, noisy neighbors, retries, or cold paths.

This list contains hypotheses, not diagnoses. The next step is to correlate a
slow request with queue, scheduler, CPU, GPU, and network spans.

### Tail effects grow with composition

Google's classic production-systems paper *The Tail at Scale* explains why
temporary high-latency episodes become increasingly important when a service
fans out across many components and as utilization grows
([Google Research](https://research.google/pubs/the-tail-at-scale/)). An LLM
request may not have the same fan-out shape as search, but the general lesson
transfers: user-visible latency is determined by the critical path, and large
systems amplify variability.

### Do not average percentiles

Suppose replica A and replica B each report a P99. Their average is generally
**not** the fleet P99 because:

- they may receive different request counts;
- their distributions may differ;
- a percentile cannot be reconstructed from another percentile.

Aggregate raw histograms or mergeable histogram sketches over aligned windows,
then compute the fleet percentile.

### Sample size matters

With only 100 completed requests, P99 is effectively determined by one of the
largest samples. Estimating extreme tails reliably requires enough observations
and a benchmark duration long enough to encounter realistic variability.

---

## 1.1.12 Workload Shape Controls the Result

A benchmark should describe at least:

| Dimension | Why it matters |
|---|---|
| Model and revision | Parameter count, architecture, vocabulary, kernels |
| Serving engine and version | Scheduler, memory manager, kernels, defaults |
| Hardware and topology | Compute, memory, interconnect, replica layout |
| Numeric precision | Bytes moved, supported kernels, quality constraints |
| Input-length distribution | Prefill work and TTFT |
| Requested and actual output lengths | Decode work, E2E latency, throughput |
| Arrival process | Queueing and burst behavior |
| Concurrency/request-rate sweep | Operating curve and saturation |
| Sampling configuration | Selection cost and when generation terminates |
| Streaming protocol | Token visibility and client timing |
| Prefix/cache state | Reuse and cold/warm behavior |
| SLO thresholds | Definition of useful capacity |

### Distributions beat one synthetic point

“1,000 input tokens and 100 output tokens” is a useful controlled point, but a
real application may have a multimodal distribution:

- short new chats;
- long multi-turn conversations;
- retrieval-augmented prompts;
- rare very long generations.

Report both controlled points and a representative mixture. If production
traffic is available and privacy permits, replay a sanitized trace or sample
from empirical length and arrival distributions. NVIDIA likewise recommends
using real prompts when available and keeping sampling settings consistent
([NIM benchmark parameters](https://docs.nvidia.com/nim/benchmarking/llm/latest/parameters.html)).

### Requested versus actual output length

`max_tokens=512` is a ceiling, not proof that 512 tokens were generated. EOS
can stop generation early. Record actual lengths, or deliberately ignore EOS
only in a controlled stress test and state that choice.

### Warm and cold are different questions

A steady-state capacity test normally includes warmup and excludes warmup
samples. A startup or scale-from-zero test deliberately measures cold behavior.
Mixing the two produces a number that answers neither question clearly.

---

## 1.1.13 A Trustworthy Benchmark Protocol

Use this protocol as an interview-ready checklist.

### Step 1: State the decision

Examples:

- choose an engine for interactive chat;
- size a deployment for a forecast traffic distribution;
- detect a regression after a runtime upgrade;
- compare cost at the same product SLO.

The decision determines the metric and workload.

### Step 2: Freeze controlled variables

Hold model, weights, tokenizer, output policy, precision, hardware, topology,
engine configuration, and software versions constant unless one is the
independent variable.

### Step 3: Define boundaries and clocks

Record exactly where request timing begins and ends. Use a monotonic clock.
For GPU-only timing, synchronize correctly or use device timing events. Keep
client-observed and server/model-only results labeled separately.

### Step 4: Define the workload

Specify input/output length distributions, prompts or dataset, sampling,
streaming, prefix reuse, arrival pattern, and duration.

### Step 5: Warm up deliberately

Warm model weights, kernels, memory pools, and caches as appropriate. Record the
warmup policy. If cold-start behavior matters, run it as a separate experiment.

### Step 6: Sweep load

Measure several concurrency or request-rate points from light load through
saturation. A single point cannot reveal the latency-throughput frontier.

### Step 7: Record complete outcomes

Capture:

- completed, failed, rejected, cancelled, and timed-out requests;
- TTFT, TPOT, individual ITL, and E2E distributions;
- input, output, and request throughput;
- goodput and SLO attainment;
- queue depth and queue time;
- actual token-length distributions;
- resource telemetry and configuration metadata.

Never improve reported latency by silently dropping or timing out slow work.

### Step 8: Repeat and explain variance

Use multiple trials, aligned steady-state windows, and enough samples for the
reported percentiles. Present error bars or trial ranges when material.

### Step 9: Compare at equal constraints

Useful comparisons include:

- maximum goodput at the same TTFT/TPOT SLO;
- P99 latency at the same request rate and workload;
- cost per good request at the same SLO attainment;
- throughput at the same latency budget.

Comparing one system at concurrency 1 with another at concurrency 100 is not a
fair engine comparison.

### Step 10: Preserve raw data and provenance

Store timestamp-level output, tool command, code revision, environment, and
configuration. A chart without provenance is difficult to audit and impossible
to reproduce.

MLPerf's server scenario is a useful example of a benchmark defining an online
arrival pattern together with latency constraints instead of optimizing
throughput alone ([MLCommons Llama 2 inference benchmark](https://mlcommons.org/2024/03/mlperf-llama2-70b/)).

---

## 1.1.14 Representative Python Analysis

The following dependency-light code computes client-observed metrics from
already collected token timestamps. Production benchmark tooling should also
capture failures, metadata, server spans, and clock discipline.

```python
from __future__ import annotations

from dataclasses import dataclass
from statistics import mean
from typing import Iterable


@dataclass(frozen=True)
class RequestTrace:
    request_id: str
    sent_at_s: float
    token_at_s: tuple[float, ...]
    input_tokens: int
    succeeded: bool = True

    @property
    def output_tokens(self) -> int:
        return len(self.token_at_s)


def request_metrics(trace: RequestTrace) -> dict[str, float]:
    """Compute seconds-based metrics for one successful streamed request."""
    if not trace.succeeded:
        raise ValueError("A failed request has no complete latency metrics")
    if not trace.token_at_s:
        raise ValueError("At least one non-empty output token is required")
    if any(b < a for a, b in zip(trace.token_at_s, trace.token_at_s[1:])):
        raise ValueError("Token timestamps must be monotonic")

    ttft_s = trace.token_at_s[0] - trace.sent_at_s
    e2e_s = trace.token_at_s[-1] - trace.sent_at_s
    itl_s = [
        current - previous
        for previous, current in zip(trace.token_at_s, trace.token_at_s[1:])
    ]

    # TPOT is undefined for a one-token response; do not invent a zero.
    tpot_s = mean(itl_s) if itl_s else float("nan")

    return {
        "ttft_s": ttft_s,
        "e2e_s": e2e_s,
        "tpot_s": tpot_s,
        "output_tokens": float(trace.output_tokens),
    }


def nearest_rank_percentile(values: Iterable[float], percentile: float) -> float:
    """Simple nearest-rank percentile for teaching, not a fleet aggregator."""
    ordered = sorted(values)
    if not ordered:
        raise ValueError("values cannot be empty")
    if not 0 < percentile <= 100:
        raise ValueError("percentile must be in (0, 100]")

    import math
    rank = math.ceil(percentile / 100 * len(ordered))
    return ordered[rank - 1]


def benchmark_throughput(
    traces: Iterable[RequestTrace],
    window_s: float,
    ttft_slo_s: float,
    tpot_slo_s: float,
) -> dict[str, float]:
    traces = list(traces)
    if window_s <= 0:
        raise ValueError("window_s must be positive")
    if not traces:
        raise ValueError("traces cannot be empty")

    successful = [trace for trace in traces if trace.succeeded]
    metrics = [(trace, request_metrics(trace)) for trace in successful]
    good = [
        trace
        for trace, metric in metrics
        if metric["ttft_s"] <= ttft_slo_s
        and metric["tpot_s"] <= tpot_slo_s
    ]

    return {
        "request_throughput_rps": len(successful) / window_s,
        "request_goodput_rps": len(good) / window_s,
        "output_throughput_tok_s": (
            sum(trace.output_tokens for trace in successful) / window_s
        ),
        "total_throughput_tok_s": (
            sum(trace.input_tokens + trace.output_tokens for trace in successful)
            / window_s
        ),
        "failure_rate": (len(traces) - len(successful)) / len(traces),
    }
```

### Why the code makes TPOT undefined for one token

A one-token response has no gap after the first token. Reporting TPOT as zero
would falsely imply instantaneous decode cadence. Benchmark tools sometimes use
zero internally for convenience; analysis should preserve the semantic
difference between “zero” and “not defined.”

### Why this percentile function is deliberately simple

Libraries use different quantile conventions, which can differ for small
samples. Pick one implementation, record it, and keep it consistent. For fleet
telemetry, use a mergeable histogram/sketch rather than shipping every raw
sample or averaging per-instance percentiles.

---

## 1.1.15 Worked Decision: Chat Versus Offline Generation

Suppose two deployments serve the same model, hardware count, prompt/output
distribution, and sampling policy. A controlled load sweep gives this
**synthetic teaching example** at the candidate operating point:

| Metric | Deployment A | Deployment B |
|---|---:|---:|
| Aggregate output throughput | 4,800 tok/s | 6,200 tok/s |
| P50 TTFT | 180 ms | 260 ms |
| P99 TTFT | 820 ms | 2,500 ms |
| P50 TPOT | 23 ms/token | 31 ms/token |
| P99 TPOT | 40 ms/token | 85 ms/token |
| Goodput under chat SLOs | 18 req/s | 12 req/s |

Assume the median response has 100 output tokens.

### Median E2E estimate

Deployment A:

```text
E2E_A = 0.180 + (100 - 1) × 0.023
      = 2.457 seconds
```

Deployment B:

```text
E2E_B = 0.260 + (100 - 1) × 0.031
      = 3.329 seconds
```

### Recommendation for interactive chat

Choose A at these operating points. It has lower startup delay, better token
cadence, a much better TTFT tail, and more SLO-compliant requests per second.
B's higher raw output throughput does not compensate for its worse user
experience under the stated chat SLO.

### Recommendation for offline generation

B may be preferable if:

- the batch deadline matters more than per-request latency;
- its higher throughput persists over the full workload;
- failure and quality rates are equal;
- the 29% output-throughput gain reduces time or cost materially.

The recommendation is conditional. We would still compare cost, stability,
actual length mix, and full job completion time.

### The L5 move

Do not answer “A is better” or “B is better” until the use case and constraints
are stated. The stronger answer identifies the Pareto trade-off and chooses an
operating point for a particular product objective.

---

## 1.1.16 Diagnosis From Metric Shapes

Metrics narrow the search space; they do not prove root cause.

### Pattern A: TTFT rises, TPOT stays stable

Likely regions to investigate:

- request queueing or admission delay;
- longer prompts or changed prompt-length mix;
- slower tokenization or prompt rendering;
- prefill contention or scheduling policy;
- gateway/network startup delay;
- cold paths or prefix-cache hit-rate changes.

Evidence:

- decompose TTFT into client/network, queue, prefill, and first-response spans;
- compare prompt distributions and queue depth;
- compare prefill execution time at equal prompt length;
- segment cached versus uncached and replica/version cohorts.

### Pattern B: TTFT stays stable, TPOT rises

Likely regions:

- decode batches became larger or less efficient;
- output/context lengths increased;
- memory pressure or request preemption;
- decode scheduling interference;
- kernel/runtime regression;
- token streaming or detokenization stalls.

Evidence:

- correlate ITL spikes with batch composition and scheduling events;
- segment by current context length;
- compare device traces and memory telemetry;
- distinguish server token production from client token receipt.

### Pattern C: both rise only at high load

The system is likely near or beyond a saturation knee. Determine which resource
saturates and whether queueing, batching, memory capacity, CPU work, network, or
GPU execution is the limiting stage.

Evidence:

- request-rate/concurrency sweep;
- queue depth and time;
- throughput plateau;
- CPU, GPU, memory, and network timelines;
- rejection, timeout, and cancellation rates.

### Pattern D: mean is stable, P99 worsens

A minority cohort or intermittent event is likely affected. Segment by:

- prompt/output length;
- replica, zone, hardware type, engine version;
- cache status;
- time window and concurrent workload;
- request priority or tenant.

Do not optimize the median in response to a tail-only regression.

### Pattern E: server metrics are stable, clients report worse latency

Investigate the unmeasured boundary:

- gateway, load balancer, TLS, or network;
- buffering of streamed events;
- client library behavior;
- clock or instrumentation changes.

This is why client-observed and internal spans should coexist.

---

## 1.1.17 Production and Research Evidence

### Evidence 1: production systems care about the tail

*The Tail at Scale* was written from Google's experience with large interactive
services. Its enduring lesson is not a particular millisecond threshold; it is
that variability and utilization make tail behavior a first-class design
constraint. For LLM serving, this supports measuring percentile TTFT, ITL, and
E2E latency rather than reporting only averages
([Google Research](https://research.google/pubs/the-tail-at-scale/)).

### Evidence 2: serving tools expose multiple definitions

Current vLLM benchmarking reports separate request throughput, request goodput,
output throughput, total-token throughput, TTFT, TPOT, ITL, and E2E statistics
([vLLM serving benchmark source](https://docs.vllm.ai/en/latest/api/vllm/benchmarks/serve/)).
This is practical evidence that a production-style evaluation needs a metric
vector rather than one score.

### Evidence 3: the throughput/latency frontier is measurable

NVIDIA's published NIM results sweep concurrency and show the characteristic
pattern: aggregate throughput grows, then yields diminishing returns, while
TTFT and ITL worsen. The precise values are tied to the listed model, engine,
precision, hardware, and sequence lengths
([NIM performance tables](https://docs.nvidia.com/nim/benchmarking/llm/1.0.0/performance.html)).

The general lesson is production-relevant; the numbers are not universal.

### Evidence 4: goodput changes system design

DistServe separates prefill and decode and optimizes the maximum request rate
that satisfies TTFT and TPOT objectives. Its paper reports up to 7.4× more
served requests or 12.6× tighter SLOs than its evaluated baselines, with more
than 90% SLO attainment in the stated experiments
([DistServe](https://arxiv.org/abs/2401.09670)).

These are paper results, not a guarantee for an arbitrary production workload.
The transferable idea is that optimizing raw throughput alone can select a
different architecture from optimizing goodput.

### What is fact, and what is our inference?

- **Documented fact:** the cited tools define and report the listed metrics.
- **Documented result:** the cited benchmark or paper reports values under its
  experimental configuration.
- **Engineering inference:** a similar metric pattern in our system suggests a
  region to investigate.
- **Not yet proven:** that the same root cause or improvement magnitude applies
  to our deployment.

This separation is essential when using vendor benchmarks and research papers
in a production decision.

---

## Common Misconceptions

### “Tokens per second is one universal metric.”

It may mean per-user generation rate, aggregate output throughput, input
throughput, or total-token throughput. Always name the numerator, denominator,
and aggregation boundary.

### “Higher throughput means users get answers faster.”

Aggregate throughput can rise while TTFT, TPOT, and P99 worsen. This commonly
happens as concurrency and batching increase.

### “TTFT measures model prefill.”

Client-observed TTFT can also include network, API, tokenization, queueing,
scheduling, first-token selection, and response delivery.

### “TPOT is E2E latency divided by output tokens.”

That incorrectly includes TTFT. Under our convention, TPOT is
`(E2E - TTFT) / (N - 1)` for more than one output token.

### “Average latency is sufficient when traffic is large.”

Large traffic makes the tail more operationally important, not less. A small
percentage can represent many users, and compositional critical paths amplify
variability.

### “P99 means exactly every 100th request is slow.”

It is a distribution quantile over a sample/window, not a deterministic request
schedule.

### “Average of replica P99s is fleet P99.”

Percentiles are not generally composable by averaging. Aggregate distributions
or mergeable histograms first.

### “Concurrency and request rate are equivalent.”

Closed-loop concurrency applies backpressure; open-loop arrivals can continue
through overload and grow a queue.

### “The maximum-throughput point is the production operating point.”

It often has unacceptable tail latency and too little failure headroom. Choose
the point that maximizes goodput or meets product SLOs with adequate reserve.

### “A failed request improves latency because it finishes quickly.”

Failures, timeouts, and dropped requests must be reported separately and must
not make a slow system look fast.

---

## Exercises and L5 Interview Questions — With Solutions

### Question 1 — Which metric matters for a ChatGPT-like product?

You are asked to choose the single most important metric. What do you say?

#### Solution

Reject the false premise politely: no single metric captures startup,
streaming, completion, tail behavior, and capacity.

For an interactive chat product, begin with:

- client-observed percentile TTFT for startup responsiveness;
- percentile TPOT plus ITL tails for readable, smooth streaming;
- E2E latency conditioned on output length;
- goodput under explicit TTFT/TPOT/E2E SLOs for capacity;
- failure and cancellation rates.

Then ask about workload, target users, SLOs, and cost. If forced to select one
operator metric, choose **goodput under product-defined latency SLOs**, because
it joins experience and capacity—but retain the component metrics for diagnosis.

### Question 2 — Derive E2E latency

A response has TTFT `600 ms`, TPOT `30 ms/token`, and 151 output tokens. Estimate
E2E latency.

#### Solution

There are `151 - 1 = 150` post-first-token gaps:

```text
E2E = 0.600 + 150 × 0.030
    = 0.600 + 4.500
    = 5.100 seconds
```

State that this uses the per-request TPOT convention defined in the section.

### Question 3 — Throughput improves 30%, but P99 doubles

Is the new version better?

#### Solution

Not enough information. Ask:

1. Which throughput—requests, input tokens, output tokens, or total tokens?
2. Was the workload and offered load identical?
3. Which P99—TTFT, TPOT/ITL, or E2E?
4. Does the new P99 violate the product SLO?
5. What happened to failures, timeouts, and goodput?
6. Is the use case interactive or offline?

For interactive serving, compare goodput at the same SLO or P99 at the same
offered load. For offline generation, the throughput gain may win if deadlines,
quality, reliability, and cost are satisfied.

### Question 4 — TTFT regressed but TPOT did not

How would you investigate?

#### Solution

TTFT contains pre-decode stages; stable TPOT suggests steady-state decode is
not the first suspect.

1. Verify the regression with equal prompt and load distributions.
2. Split client TTFT into network/API, tokenization, queue, prefill, first-token,
   and delivery spans.
3. Compare queue depth/time and offered load.
4. Compare prefill time conditioned on input length.
5. Segment cold/warm, cache hit/miss, replica, hardware, and version.
6. Form and test the narrowest hypothesis supported by the changed component.

Do not jump directly to GPU kernels before decomposing the timeline.

### Question 5 — Design a fair engine benchmark

Compare engine A and B for a customer-support chatbot.

#### Solution

1. Define representative prompt, output, and arrival distributions from a
   sanitized trace.
2. Fix model revision, tokenizer, precision, hardware/topology, sampling, and
   quality behavior.
3. Use client-observed streaming timestamps plus internal spans.
4. Warm each engine using a documented policy.
5. Sweep request rate or concurrency through saturation with repeated trials.
6. Report TTFT, TPOT, ITL, and E2E percentiles; all throughput units; actual
   lengths; errors; queue time; and resource telemetry.
7. Compare maximum goodput under the same product SLO and cost per good request.
8. Preserve commands, versions, configuration, and raw results.

Mention that engine-specific tuning must be fair: use competent configurations
for both, document them, and avoid tuning only the preferred engine.

### Question 6 — Closed loop hides overload

Why can a fixed-concurrency benchmark make an overloaded service look less bad
than production?

#### Solution

In a closed loop, each client waits for completion before issuing another
request. When latency rises, the generated request rate automatically falls.
This feedback prevents arrivals from continuing independently.

Production traffic may be open-loop: users continue arriving. If arrival rate
exceeds capacity, the queue grows, tails worsen, and requests may time out or be
rejected. Use an open-loop rate test or trace replay to observe that behavior,
with safeguards to bound the experiment.

### Question 7 — Apply Little's Law

A stable service completes 30 requests/second with 2.5-second average E2E
latency. Approximately how many requests are in the system? What if telemetry
shows 300?

#### Solution

```text
L = λW = 30 × 2.5 = 75 requests
```

If telemetry shows 300, investigate mismatched boundaries/windows, requests
excluded from throughput, retries, non-steady-state queue growth, or incorrect
instrumentation. Do not force the observed numbers into the equation without
checking its assumptions.

### Question 8 — Diagnose a tail-only regression

P50 TTFT is unchanged, but P99 TTFT triples after a rollout. What next?

#### Solution

Treat it as a cohort or intermittent-path problem:

1. confirm sample size and percentile method;
2. compare raw histograms, not averaged replica P99s;
3. segment by version, replica, zone, hardware, prompt length, cache status,
   tenant, and time;
4. inspect slow-request traces for queueing, cold paths, retries, and network
   delays;
5. correlate with rollout percentage and shared-resource events;
6. mitigate or roll back if the user impact breaches the SLO, then isolate the
   root cause.

### Question 9 — Interpret two tokens/second numbers

An engineer says the server generates 10,000 tokens/second, but a user sees only
25 tokens/second. Is one measurement wrong?

#### Solution

Not necessarily. The first may be aggregate output throughput across many
concurrent requests. The second may be one request's streaming generation rate,
approximately `1 / TPOT`. At 400 concurrent users, 25 tokens/s/user is
consistent with about 10,000 output tokens/s in a simplified steady-state
calculation.

Verify that both count the same token type and time window, and account for
TTFT, variable lengths, and scheduling.

### Question 10 — Find the operating point

Throughput continues to improve slightly from concurrency 64 to 128, but P99
TTFT rises from 900 ms to 4 seconds and the product SLO is 1 second. Which point
should production use?

#### Solution

Concurrency 128 is outside the valid region. Determine the highest operating
point that meets the TTFT, TPOT, E2E, error, and headroom requirements—not only
the TTFT example. It may be at or below 64.

Run finer-grained sweeps around the knee, account for burst and replica-failure
headroom, and maximize goodput/cost inside the SLO envelope.

---

## Revision Card

### Core timeline

```text
send ─ network/API ─ queue ─ prefill/first decode ─ first token ─ decode ─ final
 t0                                                   f0                 te
```

### Core formulas

For `N > 1` output tokens:

```text
TTFT = f0 - t0
ITL_i = f_i - f_(i-1)
TPOT = (te - f0) / (N - 1)
E2E = te - t0 = TTFT + (N - 1) × TPOT
per-user generation rate ≈ 1 / TPOT
```

Across a steady measurement window `T`:

```text
request throughput = completed requests / T
output throughput = Σ output tokens / T
total token throughput = Σ(input + output tokens) / T
goodput = SLO-compliant completed requests / T
Little's Law: L = λW
```

### Never report a performance number without

- boundary and units;
- model, engine/version, precision, hardware/topology;
- input and output distributions;
- load model and operating point;
- percentile/aggregation method;
- warm/cold policy;
- failures, timeouts, and cancellations;
- SLO or decision being optimized.

### Symptom map

| Symptom | First regions to inspect |
|---|---|
| TTFT ↑, TPOT stable | network/API, tokenization, queue, prefill |
| TTFT stable, TPOT ↑ | decode scheduling, context mix, memory/runtime |
| Both ↑ at high load | saturation, queueing, shared bottleneck |
| P50 stable, P99 ↑ | minority cohort, intermittent path, straggler |
| Server stable, client worse | gateway, network, buffering, instrumentation |

### Sixty-second interview answer

> LLM performance is a frontier, not one number. I define client-visible TTFT,
> per-request TPOT and ITL tails, E2E latency conditioned on output length, and
> aggregate request/output throughput. I state the workload and load generator,
> then sweep offered load through saturation. For an interactive service I
> choose the point that maximizes goodput under percentile TTFT/TPOT/E2E SLOs,
> with failure headroom. If a metric regresses, I decompose its timeline and use
> traces and resource evidence before proposing an optimization.

---

## Further Reading

### Metrics and benchmarking tools

- [NVIDIA NIM — LLM Performance Metrics](https://docs.nvidia.com/nim/benchmarking/llm/latest/metrics.html)
- [NVIDIA NIM — Parameters and Best Practices](https://docs.nvidia.com/nim/benchmarking/llm/latest/parameters.html)
- [vLLM — `bench serve` CLI](https://docs.vllm.ai/en/stable/cli/bench/serve/)
- [vLLM — Serving Benchmark Implementation and Metric Definitions](https://docs.vllm.ai/en/latest/api/vllm/benchmarks/serve/)
- [NVIDIA TensorRT — Performance Best Practices](https://docs.nvidia.com/deeplearning/tensorrt/latest/performance/best-practices.html)
- [MLCommons — Llama 2 70B Inference Benchmark](https://mlcommons.org/2024/03/mlperf-llama2-70b/)

### Systems and production perspective

- Jeffrey Dean and Luiz André Barroso,
  [*The Tail at Scale*](https://research.google/pubs/the-tail-at-scale/)
- Yinmin Zhong et al.,
  [*DistServe: Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving*](https://arxiv.org/abs/2401.09670)
- [NVIDIA NIM — Published Performance Results](https://docs.nvidia.com/nim/benchmarking/llm/1.0.0/performance.html)

---

## What Comes Next

This section defined **what** to measure. [Section 1.2 — GPU Architecture for ML
Engineers](chapter_01_section_02_gpu_architecture_for_ml_engineers.md) develops
the hardware mental model needed to explain **where** the measured time can
disappear.
