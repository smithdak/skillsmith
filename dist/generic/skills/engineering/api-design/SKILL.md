---
name: api-design
description: >-
  Designs the contract for an interface others program against — REST,
  gRPC, GraphQL, events, or a library's public surface — consumers
  first, errors and compatibility before the happy path. Use when the
  user says "design the API for", "how should we version this
  endpoint", or "review our REST API". Not for one internal module's
  interface (deep-modules) or a whole-system spec (architecture-spec).
license: MIT
metadata:
  skillsmith-composes: "deep-modules"
  skillsmith-see-also: "architecture-spec, decision-record, architecture-review"
  skillsmith-invocation: "model"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# api-design

A public interface is a promise with a price to break. Every consumer
who builds against it turns each field, status code, and ordering rule
into a dependency you cannot see; once shipped, the cost of a change is
paid by people who are not in the room. So design from the consumers'
jobs inward, settle the error model and the compatibility policy before
the happy path, and keep the surface small enough to state in a few
sentences. This applies equally to HTTP/REST, RPC/gRPC, GraphQL, event
schemas, and a library or SDK's exported surface — the artifact differs,
the discipline does not.

Work the steps in order. Each ends with a criterion the output must
meet before the next begins; when the user has already supplied a step
(an existing OpenAPI file, a fixed auth scheme), verify it against the
criterion rather than redoing it.

## 1. Consumers first

List every consumer — a web client, a partner integration, an internal
batch job, a future SDK — and the job each needs done, in the
consumer's words ("show the customer their open orders with totals"),
not in storage terms ("read the orders table"). The API exists to serve
those jobs; an API that mirrors the database forces every consumer to
reassemble the domain on their side and locks the schema in place
forever. Note which consumers are external (the promise is expensive to
break) and which are internal (cheaper, but still a promise).

**Done when:** each consumer has at least one job written as an
outcome, and no job is phrased as a table or column.

## 2. Resource and operation model

Derive the nouns and the operations on them from the jobs, not from
the entities. Decide the granularity deliberately, avoiding both
failure modes: a *chatty* surface that needs five round-trips for one
job, and a *god-endpoint* that accepts a bag of options and does
everything. Separate read paths from write paths — reads may be shaped
for display and cached; writes are commands with validation and side
effects — and do not let one operation serve both. Apply one naming
convention throughout (case, plural-vs-singular, verb placement,
identifier format); inconsistency is the single most common defect
consumers report, and the cheapest to prevent now.

**Done when:** every job from step 1 maps to a small, named sequence of
operations, and every name follows the same convention.

## 3. Error model before the happy path

Design the errors first, because the happy path is what everyone
designs anyway and errors are what consumers actually have to handle.
Every error carries: a stable machine-readable **code** (an enum
consumers can switch on, never a message to parse), a human **message**,
whether it is **retryable** and with what backoff, and, for validation
failures, **which field** was wrong. Errors never leak internals — no
stack traces, table names, or upstream vendor messages. Decide the
transport-level mapping once (which HTTP statuses, which gRPC codes,
GraphQL `errors[].extensions`, which exception types) and keep it fixed.
Distinguish the consumer's fault (bad input, not found, forbidden) from
the server's (unavailable, timeout) because consumers branch on that
first.

**Done when:** the error shape is written down as a schema, every
operation lists the errors it can return, and each error states its
retryability.

## 4. Contract properties

Settle the properties every operation shares, so they are decided once
rather than per endpoint:

- **Idempotency** — every unsafe operation a consumer might retry
  (create, charge, send) accepts an idempotency key, and the contract
  states what a replay returns. Retries without keys produce
  duplicates; consumers *will* retry.
- **Pagination** — cursor-based by default: cursors stay correct when
  rows are inserted or deleted mid-scan and stay cheap at depth, where
  offsets skip or duplicate items and cost O(n). Use offsets only when
  consumers need random page access and the set is small. State the
  maximum page size and the cursor's opacity.
- **Filtering and sorting** — an explicit allowlist of fields, not free
  query expressions, so the set of queries you must keep fast is
  bounded.
- **Partial responses** — field selection or sparse fieldsets when
  payloads are large and consumers differ; otherwise omit, since every
  option is surface to maintain.
- **Auth boundaries** — which operations each principal type can call
  and what a caller sees of resources it does not own (404 vs 403 is a
  decision, not an accident).
- **Rate limits and timeouts** — the limits, the headers or metadata
  that expose them, and what the consumer should do on hitting them.
- **Concurrency** — how conflicting writes are detected (versions,
  ETags, preconditions) when consumers can race.

**Done when:** each bullet has a written decision that applies
uniformly, or a written reason it is out of scope.

## 5. Compatibility policy

State what counts as a breaking change *for this API* before shipping
anything — consumers infer the policy from your first change if you do
not declare it. Load
[references/compatibility-rules.md](references/compatibility-rules.md)
for the per-format table.

The default posture is **no version number plus additive-only
evolution**: add optional fields, add operations, widen accepted
inputs, never remove or rename, never tighten what you accept or
narrow what you return. This is usually right because a version bump
forces every consumer to migrate on your schedule while additive
change lets them migrate on theirs; versioning is the tool for the rare
change that cannot be made additively, and reaching for it first
signals the model was wrong. When a break is unavoidable, choose the
versioning mechanism deliberately (path, header, field-level
deprecation, new operation beside the old) and treat the old surface
as a deprecation with a **window**: an announced date, a signal in the
response (a `Deprecation`/`Sunset` header, a `@deprecated` directive, a
proto `deprecated` option, a doc-comment), and telemetry that tells you
who is still calling it before you remove it.

**Done when:** the policy names the breaking-change rule, the
evolution mechanism, the deprecation window, and the signalling
channel, in one paragraph a consumer could read.

## 6. Write the contract

Write it in the repo's idiom — the format already in use wins, because
consumers and tooling are already shaped by it: OpenAPI for HTTP,
GraphQL SDL, protobuf, or typed signatures with doc-comments for a
library. If nothing exists, pick the format the consumers' tooling
consumes best. For every operation include a request example, a
success example, and **at least one error example** using the schema
from step 3; an error you cannot write an example for is an error you
have not designed.

Then run the deep-modules test on the finished surface: state the
whole interface — operations, invariants, error modes, the
compatibility promise — in a few sentences. If it will not compress,
the surface is carrying the implementation's shape; merge, remove, or
push behavior behind fewer operations until it does. Depth is what
consumers buy: more of their job done per operation learned.

**Done when:** the contract file exists in the repo's format, every
operation has success and error examples, and the interface has a
short-paragraph statement.

## 7. Review and record

Walk the contract against
[references/contract-checklist.md](references/contract-checklist.md)
and fix what fails. Then identify the choices that are one-way doors —
the identifier format, the pagination model, the error envelope, the
versioning mechanism, anything a consumer will encode in their own
data — and capture each as a decision-record entry with the options
that lost and why. Two-way doors (a field name, a default page size)
do not need one.

**Done when:** every checklist item passes or has a written exception,
and each one-way-door choice has a record.

## Verify before returning

The contract has: an error schema with codes, retryability, and field
locators; idempotency on every unsafe retryable operation; cursor
pagination or a stated reason for offsets; a one-paragraph
compatibility policy; an error example per operation; and an interface
statement short enough to read aloud. No internal name — table, class,
vendor — appears in the public surface. Report the contract path, the
one-way-door decisions recorded, and any checklist exceptions.

## Boundaries

- One internal module's seam and depth is deep-modules' territory; this
  skill borrows its test for the public surface but designs the
  contract other teams will build against.
- Which services exist and the invariants they jointly serve is
  architecture-spec's altitude; link the spec's interface-contracts
  section rather than restating it.
- Judging whether an existing system's structure is sound is
  architecture-review's job; this skill designs a contract, and
  reviews one only against its own checklist.
- Implementing handlers, wiring routes, and generating client SDKs
  from the contract are separate tasks that consume this output.
