# Mitigation catalog

Each class: what it protects against, how it fails on its own, and the
parameters that decide whether it works. Most real gaps close with two
or three classes stacked (timeout + bounded retry + breaker); one class
applied alone usually just moves the failure.

## Timeout

- **Protects against:** slow and hanging dependencies consuming threads,
  connections, and the caller's own latency budget.
- **Own failure modes:** too long — indistinguishable from none under
  load; too short — turns a busy-but-healthy dependency into a stream
  of failures and retry pressure; connect timeout set but read/command
  timeout missing (the common gap).
- **Parameters:** connect, read, and total timeouts set separately, each
  derived from a **latency budget** flowing down from the user-facing
  SLO (three serial calls under a 1 s page cannot each get 900 ms);
  deadline propagation so a downstream call inherits what remains.

## Bounded retry with idempotency

- **Protects against:** transient errors, partial failures, brief
  unavailability.
- **Own failure modes:** **retry storms** — callers retrying in sync
  amplify a wobble into an outage; retrying non-idempotent operations
  produces duplicate charges, emails, or writes; retrying every error
  class (4xx, validation) spends the budget on calls that cannot succeed.
- **Parameters:** hard cap (2–3 attempts); exponential backoff with
  **full jitter**; a retry budget that shares the caller's deadline;
  retry only errors classified transient (connection reset, 503, 429
  honoring `Retry-After`); an **idempotency key** generated before the
  first attempt and persisted with the operation so a replay after a
  crash reuses it — safe only if the callee dedupes on that key.

## Circuit breaker

- **Protects against:** hammering a dependency that is down or
  overloaded and spending the budget on calls that will fail; gives the
  dependency room to recover.
- **Own failure modes:** **flapping** open/half-open on a noisy signal;
  one breaker shared across unrelated operations so a single failing
  endpoint blacks out all of them; open with no fallback, which converts
  slow failure into fast failure without degrading; thresholds tuned for
  one traffic level that never trip at another.
- **Parameters:** failure threshold as a rate over a window (not a raw
  count), minimum volume before the rate means anything, open duration,
  half-open probe count, per-dependency or per-operation scoping. Emit
  state transitions as metrics — an open breaker is a detection signal.

## Bulkhead

- **Protects against:** one dependency's failure exhausting a shared
  thread pool, connection pool, or worker queue and taking down paths
  that never touched it.
- **Own failure modes:** partitions so small that normal load saturates
  them; partitions that isolate compute but share a downstream (the same
  database) so isolation is only apparent; tuning cost of many pools.
- **Parameters:** a separate pool or semaphore per dependency or
  criticality tier, sized from measured concurrency (Little's law:
  arrival rate × latency), and fail-fast rejection when full — never an
  unbounded queue.

## Fallback and cache

- **Protects against:** unavailability of a dependency whose answer can
  be approximated, defaulted, or served stale.
- **Own failure modes:** **staleness** presented as fresh — pricing,
  permissions, and inventory from cache can be wrong in ways that cost
  money or leak access; the cache becoming a hard dependency itself
  (cold-cache stampede on restart; cache outage now equals data outage);
  fallback code that has never run in production and fails on first use.
- **Parameters:** TTL per data class with an explicit staleness
  tolerance; stale-while-revalidate versus hard expiry; negative caching
  for misses; request coalescing against stampedes; a visible marker
  (header, log field, UI hint) on degraded responses; a fallback that is
  exercised routinely (test, canary, small percentage) so it keeps working.

## Queue and replay

- **Protects against:** downstream unavailability for work that needs
  no synchronous answer — notifications, indexing, webhooks, exports.
- **Own failure modes:** the queue fills and becomes the outage; poison
  messages that fail forever and block a partition; at-least-once
  delivery producing duplicates the consumer does not dedupe; ordering
  assumptions that break across partitions or retries; replaying a
  backlog that overwhelms the just-recovered dependency.
- **Parameters:** bounded depth with a defined overflow policy;
  dead-letter queue with an alert on its depth; consumer idempotency
  (dedupe key per message); ack/visibility timeout longer than the
  slowest legitimate processing; a rate-limited replay path.

## Graceful degradation

- **Protects against:** a non-critical dependency's failure taking the
  critical path with it.
- **Own failure modes:** invisible degradation, so nobody notices the
  feature has been off for a week; "non-critical" decided once and never
  revisited as the feature became critical; a degraded code path with no
  tests of its own.
- **Parameters:** explicit tiering of features by criticality;
  per-feature kill switches; a metric for time spent degraded; the
  degraded response defined concretely (empty recommendations, cash-only
  checkout, read-only mode) rather than "handle the error".

## Load shedding

- **Protects against:** overload collapsing the whole system — the point
  where queuing latency exceeds every timeout and throughput drops to
  zero.
- **Own failure modes:** shedding the wrong traffic (health checks, the
  paying customer) because all requests are treated equally; thresholds
  on CPU when the real bottleneck is a downstream pool; clients that
  retry a 429/503 immediately and re-create the load.
- **Parameters:** a signal tied to the true bottleneck (queue depth,
  in-flight requests, downstream latency); priority classes so cheap and
  critical requests survive; fast rejection with `Retry-After`; admission
  control at the edge, before the cost has been paid.

## Choosing and stacking

- Unavailable or slow → timeout, then breaker, then a fallback if an
  honest one exists.
- Partial or transient → bounded jittered retry, only with an
  idempotency key.
- Wrong data → detection (reconciliation, checksums, schema validation at
  the boundary) plus quarantine; no retry fixes a confident wrong answer.
- Overloaded → shed at the edge and bulkhead inside; retries make it
  worse.
- Full, split-brain, lost writes → alerts on leading indicators (disk,
  queue depth, replication lag); fencing tokens or leases for
  single-writer guarantees; durability settings (sync replication, fsync)
  chosen against a stated tolerance for lost acknowledged writes.
