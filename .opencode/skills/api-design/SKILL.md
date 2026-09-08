---
name: "api-design"
description: "Designs the contract for an interface others program against — REST, gRPC, GraphQL, events, or a library's public surface — consumers first, errors and compatibility before the happy path. Use when the user says \"design the API for\", \"how should we version this endpoint\", or \"review our REST API\". Not for one internal module's interface (deep-modules) or a whole-system spec (architecture-spec)."
license: "MIT"
metadata:
  skillsmith-composes: "deep-modules"
  skillsmith-invocation: "model"
  skillsmith-maturity: "experimental"
  skillsmith-see-also: "architecture-spec, decision-record, architecture-review"
---

# api-design

Design an interface from consumer jobs, including failure and evolution. The
contract covers operations, data, authorization, ordering, and errors, not only
successful response shapes.

## Recover the consumer's job

Use existing requirements and conventions. Map each relevant consumer outcome
to a small sequence of operations. Avoid mirroring storage tables, excessive
round trips, or a single operation with unrelated flags. For one internal seam,
use deep-modules; architecture-spec governs system-wide boundaries.

## Specify the consequential behavior

Define stable machine-readable errors, human explanations, field locations
where useful, and retry behavior using the transport's conventions. Avoid
exposing sensitive implementation details. Include an error example alongside
a representative successful request and response.

For state-changing operations, define how retries and concurrent requests are
handled. An idempotency key needs a scope, lifetime, replay result, and rule for
conflicting payloads. An operation may instead be naturally idempotent; explain
that property. Treat timeouts after a side effect as ambiguous outcomes.

For collections, choose pagination to fit ordering and consistency needs.
A cursor alone does not guarantee a stable scan: define a total order with a
tie-breaker and whether results use a snapshot or reflect concurrent changes.
Use offsets when bounded random-page access is the real requirement.

Specify authorization and tenant/object ownership, conflicting-write behavior,
and applicable size, rate, and time limits. Document allowed filters or sort
fields. Include optional features only when a consumer needs them.

## Protect compatibility

Follow the existing versioning contract. State what consumers can rely on and
how breaking changes migrate, coexist, and eventually retire. Check
[references/compatibility-rules.md](references/compatibility-rules.md) for
format-specific risks: adding a response enum value can break exhaustive
clients even though the schema change looks additive. Do not equate versionless
APIs with compatibility or prescribe versioning independently of consumers.

## Produce and verify the contract

Use the repository's executable format: OpenAPI, protobuf, GraphQL SDL, or typed
exports. Run its validator when available. Exercise a consumer scenario and its
failure path against [references/contract-checklist.md](references/contract-checklist.md),
scoping irrelevant checks out explicitly. Apply deep-modules' test: callers
should learn less than the implementation hides.

Record consequential decisions and their reasons; use decision-record when a
separate ADR is useful. Report artifact paths, checks run, and open contract
choices. Handler implementation and a whole architecture-review remain separate
unless requested.
