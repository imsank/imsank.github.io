---
layout: dsa_course
title: "Graph Models, State, and Visited Sets"
description: "Model unfamiliar relationships as graphs, define complete search state, choose a representation, and prove when a visited set is safe."
course: true
dsa_course: true
chapter_number: 7
chapter_title: "Graph and State-Space Search"
section_number: "7.1"
section_order: 1
next_title: "DFS and BFS for Reachability"
permalink: /interview-prep/first-principles-dsa/graph-search/graph-models-state-and-visited-sets/
---

<!-- Generated from G_prep_course. Edit the authoritative Markdown source, then republish. -->

Most graph problems do not introduce themselves as graph problems. They talk
about servers, accounts, roads, transformations, dependencies, or permissions.
The first skill is therefore not traversal. It is recognizing when many local
relationships form a global structure, deciding what one search state means,
and proving when two routes may safely be treated as equivalent.

This section develops that model before committing to DFS, BFS, or any more
specialized algorithm.

{% include course_visuals/dsa_graph_state_lab.html %}

---

## 7.1.1 Start With an Unfamiliar Contract

### Propagation Audit

A company operates `n` processing stations numbered from `0` to `n - 1`.
Certain pairs of stations have direct synchronization links. Every link works in
both directions.

When one station receives a configuration update, it sends the update through
all of its direct links. Any station receiving the update repeats the process.

Given:

- `n`, the number of stations;
- `links`, where `[a, b]` means stations `a` and `b` have a direct link; and
- `start`, the station that initially receives the update;

return the number of distinct stations that eventually receive the update.

Constraints:

```text
1 ≤ n ≤ 200,000
0 ≤ len(links) ≤ 400,000
0 ≤ a, b, start < n
```

Duplicate links and self-links may appear. The network need not be connected.

Example:

```text
n = 7
links = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [5, 6]]
start = 0

0 ─── 1
│     │
2 ─── 3 ─── 4       5 ─── 6

answer = 5
```

Stations `0` through `4` receive the update. Stations `5` and `6` belong to a
different connected region.

> **Interview note:** The domain words do not determine the algorithm. First
> extract the objects, relationships, direction, and required guarantee.

### Clarify before modeling

A strong interview conversation checks:

1. Are links directed or bidirectional?
2. Is the answer a count, the station IDs, an order, or a path?
3. Can links repeat or point from a station to itself?
4. Can the network be disconnected?
5. Are all station IDs valid?
6. Is the network static for one query or reused across many queries?
7. Does propagation depend only on the current station, or also on how the
   update arrived?

The statement answers the first five. The last two anticipate important design
mutations.

## 7.1.2 Translate the Domain Into a Graph

A graph is a modeling decision:

| Domain idea | Graph idea |
| --- | --- |
| Station | Vertex (node) |
| Synchronization link | Edge |
| Bidirectional link | Undirected edge |
| Update can arrive eventually | Reachability |
| Separate network region | Connected component |
| Starting station | Search source |

Let `V` be the number of vertices and `E` the number of logical links. Here,
`V = n` and `E = len(links)`.

The required guarantee is only:

> Discover every station reachable from `start`, exactly once in the answer.

There is no requirement for minimum hops, lowest cost, dependency order, or a
particular visitation order. That distinction will control the algorithm choice.

> **Prerequisite connection — Contract before code:** The graph is not “found”
> by spotting a keyword. It is derived because the problem contains objects,
> pairwise relationships, and a question about transitive reachability.

### Directedness is part of the contract

If `[a, b]` instead meant “`a` sends updates to `b`,” the edge would be directed:

```text
a → b
```

Reachability could then differ by direction. A common modeling bug is to add a
reverse adjacency entry merely because many familiar practice problems use
undirected edges.

### The visible object may not be the state

For the base problem, future propagation from station `u` depends only on `u`.
It does not depend on which route reached `u`. That is why a station ID is a
candidate complete state. We will prove this more carefully after examining the
naive search.

## 7.1.3 Begin With the Simplest Search Space

Imagine following every possible sequence of links from `start`:

```text
0 → 1 → 3 → 2 → 0 → 1 → ...
0 → 2 → 3 → 1 → 0 → 2 → ...
```

In a graph with a cycle, the number of walks is unbounded because a route may
circle indefinitely. Even without cycles, two branches can merge and cause the
same downstream region to be explored repeatedly.

In the example, station `3` can be reached through both `0 → 1 → 3` and
`0 → 2 → 3`. Starting a fresh search from `3` for every route repeats exactly
the same future work.

The waste is not simply “there are many edges.” It is:

> We recompute the reachable future of a station even though that future is
> independent of the route used to reach it.

This observation suggests remembering which states have already been
discovered.

> **Shared invariant — Graph search and memoization:** A visited set is a form of
> memoization. Once the complete state has been discovered, exploring another
> path to the same state cannot reveal a different future in this problem.

## 7.1.4 Decide What the State Must Contain

State is the minimum information from the past that can change valid future
decisions.

Use the equivalence test:

> If two executions have the same proposed state, must their remaining decision
> problem be equivalent?

For the base problem, consider reaching station `3` through station `1` versus
through station `2`.

- The outgoing links from `3` are the same.
- The propagation rules are the same.
- The final reachable region from `3` is the same.

The route does not change the future. Therefore:

```text
state = station_id
```

A visited set of station IDs is safe.

### The visited invariant

We will use this precise meaning:

> Every station in `visited` has been discovered and scheduled for processing;
> no station outside `visited` has yet been scheduled.

Mark a station visited when it is added to the frontier, not later when it is
removed. Then a state is scheduled at most once.

In the diamond below, both `1` and `2` lead to `3`:

```text
    1
   / \
  0   3
   \ /
    2
```

If `3` is marked only after removal, both predecessors may schedule it before
either copy is processed. The result can remain correct with another check, but
the frontier contains redundant work. Discovery-time marking preserves the
stronger invariant.

> **Implementation note — Mark at discovery:** “Visited” means discovered and
> scheduled, not necessarily fully processed. This meaning prevents duplicate
> frontier entries and makes the complexity proof direct.

## 7.1.5 Choose a Representation From Required Operations

The search repeatedly needs one operation:

```text
neighbors(u): enumerate every station directly connected to u
```

### Edge list

The input is an edge list. If we scan all `E` links every time a vertex is
processed, exploring up to `V` vertices can cost `O(VE)`. The edge list is a
convenient transport format, not the best traversal index.

### Adjacency list

An adjacency list groups neighbor entries by source:

```text
0: [1, 2]
1: [0, 3]
2: [0, 3]
3: [1, 2, 4]
4: [3]
5: [6]
6: [5]
```

It supports enumerating `u`'s neighbors in time proportional to `degree(u)`.
For an undirected graph, each logical edge produces two adjacency entries. The
factor of two is constant, so construction and storage remain `O(V + E)`.

Initialize an empty list for every station, including isolated ones. Otherwise a
valid station with no links can disappear from the representation.

### Adjacency matrix

A `V × V` matrix supports constant-time lookup of whether one specific edge
exists, but costs `O(V²)` memory. Enumerating all neighbors of one vertex scans a
whole row in `O(V)`, so a traversal can take `O(V²)`.

At `V = 200,000`, a matrix is impossible in practice. An adjacency list matches
the sparse input limit and the required neighbor-enumeration operation.

### Implicit graph

Not every graph should be stored. In a grid, word transformation, or puzzle
state space, neighbors may be generated from the current state. The graph model
still applies even when no adjacency container exists.

| Representation | Neighbor enumeration | Edge-existence query | Space | Suitable here? |
| --- | ---: | ---: | ---: | --- |
| Raw edge list | `O(E)` per vertex | `O(E)` | `O(E)` | No |
| Adjacency list | `O(degree(u))` | Usually `O(degree(u))` | `O(V + E)` | Yes |
| Adjacency matrix | `O(V)` | `O(1)` | `O(V²)` | No at this scale |
| Implicit generator | Problem-dependent | Problem-dependent | Often avoids `O(E)` storage | Not needed here |

> **Overkill warning — Matrix representation:** Constant-time edge lookup is
> not useful when the algorithm needs to enumerate neighbors and the graph can
> be large and sparse. Choose a representation for required operations, not for
> the strongest isolated operation it offers.

## 7.1.6 The Frontier Policy Comes After the Guarantee

Once we remember discovered states, we need a frontier of discovered but not yet
processed stations.

- A stack processes the newest discovery first: depth-first order.
- A queue processes the oldest discovery first: breadth-first order.

For the base problem, either is appropriate because both can discover the full
reachable component. The output is a count, not a shortest distance or a
particular ordering.

We will use an explicit stack because it avoids Python recursion-depth limits.
Section 7.2 compares DFS and BFS traversal contracts in depth; Section 7.3 adds
the equal-cost shortest-path guarantee that makes FIFO order essential.

### Decision table

| Requirement or property | Appropriate choice | Why | Incorrect or overkill alternative |
| --- | --- | --- | --- |
| One reachability/component query | Iterative DFS or BFS | Both cover every reachable state | Dijkstra adds ordering we do not need |
| Minimum number of equal-cost links | BFS | FIFO layers process increasing hop count | Ordinary DFS's first path need not be shortest |
| Minimum positive weighted cost | Dijkstra | Priority queue processes tentative costs in order | Ordinary BFS layers count edges, not cost |
| Many static “same component?” queries | Union-find may be appropriate | Preprocess connectivity, then answer quickly | Re-running a traversal per query may repeat work |
| Dependency order | Topological ordering | Must respect directed prerequisites | Reachability alone does not produce a valid order |

Heap-based Dijkstra would return correct reachability if all links were assigned
nonnegative costs, but it is overkill here. It adds a priority queue and usually
`O(log V)` work per heap operation without providing a required guarantee.

> **Contrast — DFS/BFS vs Dijkstra:** Traversal is selected from the required
> ordering guarantee. Reachability needs no cost order; shortest hops needs FIFO
> layer order; unequal weighted distance needs priority order.

## 7.1.7 Derive the Algorithm

Visible pseudocode:

```text
build an adjacency list for all stations
visited = {start}
frontier = [start]

while frontier is not empty:
    remove one station
    for each neighbor:
        if neighbor is not visited:
            mark neighbor visited
            add neighbor to frontier

return the number of visited stations
```

Notice the reasoning order:

1. The guarantee is reachability.
2. The future depends only on the station ID.
3. A visited set safely merges repeated arrivals.
4. Neighbor enumeration is the dominant operation, so use an adjacency list.
5. Either stack or queue order is valid; choose a stack for iterative DFS.

<details>
<summary>Show the complete Python implementation</summary>

```python
def propagation_reach(n: int, links: list[list[int]], start: int) -> int:
    """Return the number of stations reachable from start.

    Links are undirected. Duplicate links and self-links are allowed.
    """
    if n <= 0:
        raise ValueError("n must be positive")
    if not 0 <= start < n:
        raise ValueError("start must be a valid station")

    adjacency: list[list[int]] = [[] for _ in range(n)]
    for a, b in links:
        if not (0 <= a < n and 0 <= b < n):
            raise ValueError("link endpoint is outside the station range")
        adjacency[a].append(b)
        adjacency[b].append(a)

    visited = {start}
    stack = [start]

    while stack:
        station = stack.pop()
        for neighbor in adjacency[station]:
            if neighbor not in visited:
                visited.add(neighbor)
                stack.append(neighbor)

    return len(visited)
```

</details>

<details>
<summary>Show executable boundary tests</summary>

```python
def test_propagation_reach() -> None:
    assert propagation_reach(1, [], 0) == 1

    links = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [5, 6]]
    assert propagation_reach(7, links, 0) == 5
    assert propagation_reach(7, links, 5) == 2

    # A cycle terminates because every station is scheduled once.
    assert propagation_reach(4, [[0, 1], [1, 2], [2, 0]], 0) == 3

    # Duplicate and self-links do not change reachability.
    assert propagation_reach(3, [[0, 0], [0, 1], [0, 1]], 0) == 2

    try:
        propagation_reach(3, [[0, 3]], 0)
    except ValueError:
        pass
    else:
        raise AssertionError("invalid endpoint should be rejected")
```

</details>

## 7.1.8 Trace State, Frontier, and Visited Separately

Assume neighbors are stored in input order and the stack removes from the end.

| Step | Removed | Newly discovered | Stack after step | Visited after step |
| ---: | ---: | --- | --- | --- |
| Start | — | `0` | `[0]` | `{0}` |
| 1 | `0` | `1, 2` | `[1, 2]` | `{0, 1, 2}` |
| 2 | `2` | `3` | `[1, 3]` | `{0, 1, 2, 3}` |
| 3 | `3` | `4` | `[1, 4]` | `{0, 1, 2, 3, 4}` |
| 4 | `4` | none | `[1]` | `{0, 1, 2, 3, 4}` |
| 5 | `1` | none; `3` is already visited | `[]` | `{0, 1, 2, 3, 4}` |

The stack and visited set mean different things:

- `visited`: discovered and scheduled states;
- `stack`: discovered but not yet processed states.

Conflating them is a common source of duplicate work and incorrect proofs.



## 7.1.9 Correctness From the Invariant

We prove that the algorithm returns exactly the stations reachable from `start`.

### Initialization

`start` is reachable from itself by a path of zero links. It is placed in both
`visited` and the stack, so the visited invariant holds initially.

### Soundness

Every station added to `visited` is reachable. The first station is `start`.
Every later station `v` is added while processing an already reachable station
`u` with a real link `[u, v]`. Appending that link to the path reaching `u`
produces a path reaching `v`.

### Completeness

Assume for contradiction that some reachable station `x` is never visited.
Choose a path from `start` to `x`. Along that path, let `(u, v)` be the first
edge whose first endpoint is visited and second endpoint is not. Such an edge
must exist because `start` is visited and `x` is not. When `u` is processed, the
algorithm examines every neighbor in `adjacency[u]`, including `v`, and would
add `v`. Contradiction.

### Termination

A station enters the stack only when it first enters `visited`. There are `V`
stations, so at most `V` stack insertions and removals occur. The loop
terminates.

Soundness and completeness show that `visited` is exactly the reachable set;
therefore `len(visited)` is the required answer.

## 7.1.10 Derive Time and Space Complexity

For an undirected adjacency list:

- initializing `V` neighbor lists costs `O(V)`;
- adding two entries per logical link costs `O(E)`;
- every reachable vertex is scheduled at most once;
- every adjacency entry of a processed vertex is examined once.

Across the whole traversal, the sum of degrees is `2E`, so:

```text
time = O(V + E)
```

This is not `O(VE)` because we do not scan all edges separately for every
vertex. The adjacency list groups exactly the relevant edges.

Traversal-only auxiliary space is `O(V)` for the visited set and stack. Total
space including the adjacency list is:

```text
space = O(V + E)
```

If the graph were directed, each edge would have one adjacency entry rather than
two; the asymptotic result remains the same.

## 7.1.11 The Critical Mutation: When Node Is Not the State

Now change the rules:

- Some links are locked.
- The update has one override token that can cross one locked link.
- The question remains whether a target can be reached.

Consider:

```text
S ── A ──locked── X ──locked── T
 \              /
  └── B ───────┘
```

One route reaches `X` after spending the token:

```text
S → A → X, token already used
```

Another reaches the same visible node with the token intact:

```text
S → B → X, token still available
```

Only the second arrival can cross `X → T`. If `visited` stores only `X`, an
unlucky traversal order can mark `X` after the worse arrival and discard the
useful one.

The state must evolve:

```text
state = (station, override_available)
visited key = (station, override_available)
```

> **Evolution trigger:** The node stops being the complete state when arriving
> with different retained resources changes future legal moves.

With a binary token flag, there are at most `2V` states. With `k + 1` possible
remaining-token values, there can be up to `(k + 1)V` states. State expansion
changes both correctness and complexity; it is not a tuple added mechanically.

Sometimes one state dominates another. If two arrivals are at the same station
and the only difference is remaining nonnegative fuel, more fuel may make the
less-fuel state unnecessary for pure reachability. That pruning requires its own
proof and may fail when another objective, such as cost, also matters.

> **Transfer — Graph search, DP, and backtracking:** All three ask whether the
> stored state makes the remaining problem equivalent. Missing history causes
> incorrect merging; irrelevant history causes state explosion.



Section 7.6 develops expanded-state search fully. The purpose here is to make
the state-sufficiency question automatic before every visited-set design.

## 7.1.12 Real-World Case Study — Git Commit Reachability

### Evidence level

**Documented production/open-source behavior.** Sources accessed 2026-08-09:

- [Git `rev-list` description](https://git-scm.com/docs/rev-list-description/2.51.0.html)
- [Git commit-graph file format](https://git-scm.com/docs/commit-graph-format.html)
- [Git commit-graph command](https://git-scm.com/docs/git-commit-graph)

Git's documentation describes `rev-list` in terms of commits reachable by
following parent links from one or more starting commits. It also describes set
operations: include commits reachable from positive starting points and exclude
commits reachable from negatively specified ones.

The commit-graph format stores commit object IDs, parent positions, generation
information, commit dates, and optional changed-path Bloom filters. The
`git commit-graph write --reachable` command constructs graph data by walking
commits reachable from references.

### Map the system to the model

| Git concept | Graph model |
| --- | --- |
| Commit object ID | Vertex identity |
| Commit → parent reference | Directed edge |
| Branch/tag tip supplied to a walk | Source state |
| Commit ancestry | Reachability through parent edges |
| Multiple branches merging into common history | Converging paths to the same vertex |
| Included/excluded reachable commits | Set operations over traversal results |

A merge commit can lead to multiple parent paths that later converge on the same
ancestor. Conceptually, remembering already discovered commit identities avoids
treating each route to the same ancestor as a different future ancestry problem.
This is the same state-equivalence idea as the classroom visited set.

### What generalizes

1. Stable identity is required before repeated arrivals can be merged.
2. Parent references are a representation optimized for ancestry navigation.
3. Several starting points naturally create a multi-source reachability set.
4. Inclusion and exclusion can be expressed as operations on reachable sets.
5. Extra metadata such as generation information can help a production system
   reason about or accelerate graph operations.

### What the classroom model omits

The public documentation describes semantics, formats, and commands, but this
lesson does not claim that every Git revision operation uses our exact Python
stack and set implementation. Real Git handles object storage, multiple command
semantics, history simplification, shallow repositories, replacement objects,
performance indexes, and other concerns absent from the toy model.

> **Production connection — Git ancestry:** The transferable idea is not “Git
> uses this classroom function.” It is that commit ancestry is reachability over
> stable identities and parent relationships, with converging paths that make
> repeated-state handling fundamental.

### Production mutation

Suppose a query asks not merely which commits are ancestors, but which commits
changed a particular path. Node identity alone still identifies ancestry state,
but the query now needs additional filtering evidence. Git's documented
commit-graph format can optionally store changed-path Bloom filters. This is an
example of augmenting the representation to accelerate a required operation,
not automatically changing the graph traversal state.

That distinction matters:

- query metadata may enrich the representation;
- history that changes future legal moves must enrich the state.

## 7.1.13 Common Mistakes and Their Mental-Model Repair

| Mistake | Why it happens | Repair |
| --- | --- | --- |
| Treat every domain object as a node | Mapping is done by nouns alone | Define identity by future-equivalent behavior |
| Add reverse edges automatically | “Graph” is confused with “undirected graph” | Derive direction from the contract |
| Omit isolated vertices | Representation is built only from edges | Initialize all `V` vertices |
| Mark visited after processing | Visited is interpreted as “finished” | Define it as “discovered and scheduled” |
| Put only node in expanded-state visited | Visible position is mistaken for complete state | Apply the equivalent-future test |
| Store the whole path as state | All history feels safer | Keep only history that changes future decisions |
| Use an adjacency matrix by default | Constant-time edge lookup sounds strongest | Optimize required operations and actual density |
| Use Dijkstra for any graph | More powerful is mistaken for more appropriate | Start from the required guarantee |
| Say traversal is `O(VE)` | Every loop is multiplied mechanically | Sum neighbor work across adjacency entries |
| Ignore disconnectedness | The picture is assumed connected | State that a source explores only its component |

## 7.1.14 Constraint Mutations

For each mutation, decide whether to change state, data structure, algorithm, or
nothing.

### Mutation A — Return the actual reachable IDs

No algorithmic change is necessary. Return `visited` or discovery order. If the
contract demands sorted IDs, add sorting and account for `O(R log R)` where `R`
is the number reached.

### Mutation B — Links become directed

Change the representation: add only `a → b`. The complete state and reachability
algorithm remain valid.

### Mutation C — Return minimum hops

Change the frontier policy to FIFO BFS and track distance. DFS reachability no
longer provides the required shortest-hop guarantee.

### Mutation D — Links have unequal positive latency

Change the algorithm to Dijkstra. FIFO layers no longer correspond to total
latency.

### Mutation E — One locked link may be crossed

Expand the state to `(station, override_available)`. Choose BFS or Dijkstra after
examining transition costs.

### Mutation F — Answer millions of static connectivity queries

Consider preprocessing connected components or union-find. Re-running a full
traversal for every query repeats work.

### Mutation G — Links are inserted online

For undirected connectivity queries, union-find may support incremental unions.
If links can also be deleted, ordinary union-find no longer solves the complete
problem; a more advanced dynamic-connectivity design may be required.

## Exercises and L5 Interview Questions

### 1. Model before solving

A document can reference other documents. Given one document ID, return how many
documents are reachable by repeatedly following references.

- What are vertices and edges?
- Are edges directed?
- Is document ID the complete state?
- What changes if references have access levels?

### 2. Find the smallest counterexample

Construct the smallest undirected graph where marking visited at removal causes
the same node to be placed in the frontier more than once.

### 3. Representation trade-off

The graph has only 2,000 vertices but nearly every pair is connected, and the
system performs billions of edge-existence checks but few traversals. Compare an
adjacency list, adjacency sets, and a bit-packed adjacency matrix.

### 4. State sufficiency

A robot moves through rooms and may collect keys. Explain why `room` may be an
insufficient state. Is the complete state the path, the set of collected keys,
or something else?

### 5. Correct, incorrect, or overkill?

Classify DFS, BFS, Dijkstra, topological sort, and union-find for one
reachability query in an undirected unweighted graph. State the guarantee or
broken assumption for each classification.

### 6. Correctness

Prove completeness without saying “DFS visits everything.” Use a path to an
assumed missed reachable vertex and identify the first unvisited edge.

### 7. Complexity

Explain why nested loops over vertices and their adjacency lists total
`O(V + E)`, not `O(VE)`.

### 8. Production transfer

Git can start a reachability walk from several refs. How does the initialization
change? When can all sources share one visited set?

## Revision Card — Build the Model Before Choosing the Traversal

```text
Problem shape:
  objects connected by local relationships; ask what is reachable

Required guarantee:
  complete reachability from one source, no ordering requirement

Exploitable structure:
  repeated arrivals at the same complete state have equivalent futures

Minimum state:
  station ID in the base problem

Invariant:
  every visited state has been discovered and scheduled exactly once

Required operations:
  enumerate neighbors; test and record discovery

Data structures:
  adjacency list + hash set/boolean array + stack or queue

Algorithm:
  iterative DFS or BFS; order is irrelevant for reachability

Alternatives:
  Dijkstra is correct but overkill; topological sort is inapplicable;
  adjacency matrix is unsuitable at the stated sparse scale

Complexity:
  O(V + E) time; O(V) traversal space; O(V + E) total space

Failure boundary:
  node-only visited is unsafe when arrival history changes future choices

Next evolution:
  DFS/BFS contracts → shortest-hop BFS → expanded-state search → Dijkstra

Related concepts:
  memoization, state compression, DP state, backtracking state, union-find
```

### Recall questions

1. What evidence tells you to model a domain as a graph?
2. Why is a visited set safe in the base problem?
3. When should a state be marked visited?
4. How do required operations lead to an adjacency list?
5. Why are both DFS and BFS appropriate for plain reachability?
6. Why is Dijkstra overkill rather than incorrect here?
7. Give a concrete case where node ID is not the complete state.
8. How does state expansion change complexity?

## Further Reading

- [Git `rev-list` reachability semantics](https://git-scm.com/docs/rev-list-description/2.51.0.html)
- [Git commit-graph file format](https://git-scm.com/docs/commit-graph-format.html)
- [Git commit-graph command](https://git-scm.com/docs/git-commit-graph)
- [Python `collections.deque`](https://docs.python.org/3/library/collections.html#collections.deque), used in the next section for FIFO traversal

[Next: Chapter 7.2 — DFS and BFS for Reachability](chapter_07_section_02_dfs_and_bfs_for_reachability.md)
