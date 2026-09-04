# Contract review checklist

Walk the finished contract against every item. Each fails unless it
passes for every operation, or carries a written exception naming the
operation and the reason. The point of a checklist is to catch what
the author stopped seeing; do not skip items that "obviously" pass.

## Consumers and shape

- Every operation traces back to a named consumer job; none exists
  because the storage layer has that table.
- No job needs more than a handful of calls; no operation accepts a
  bag of mode flags that make it several operations in disguise.
- Reads and writes are separate operations with separate shapes.
- The whole surface can be stated in a few sentences (the deep-modules
  test); if a sentence needs a sub-list, that region is too wide.

## Naming and conventions

- One case convention for fields, one for paths or operation names,
  applied everywhere including error payloads and headers.
- Plural vs singular resource names decided once and never mixed.
- Identifiers are opaque strings to consumers, prefixed or typed so a
  user id cannot be passed where an order id is expected.
- Timestamps are one format (RFC 3339 with zone) and one field-name
  pattern (`created_at`, not `created` here and `creationDate` there).
- Money, quantities, and other units carry the unit in the name or the
  schema (`amount_minor`, `currency`), never implied.
- Booleans are affirmative (`enabled`, not `disabled`), enums are
  strings not integers, and nullability is explicit per field.

## Error model

- One error envelope for every operation and every transport error.
- Each error has a stable machine-readable code from a documented enum;
  consumers never have to parse the message.
- Retryability is stated per code, with backoff guidance where it
  matters.
- Validation errors name the offending field with a path a client can
  map back to its input.
- Consumer-fault and server-fault errors are distinguishable at a
  glance (status class, code prefix, or a top-level field).
- No error exposes a stack trace, internal class or table name, host,
  or upstream vendor text.
- Not-found vs forbidden behavior on resources the caller does not own
  is decided and consistent.

## Idempotency and concurrency

- Every unsafe operation a consumer might retry accepts an idempotency
  key, and the contract says what a replay with the same key returns
  and how long keys are honored.
- Conflicting writes are detected (version field, ETag, precondition)
  and the conflict error tells the consumer what to reload.
- Bulk operations state whether they are atomic or partial, and how
  partial results are reported.

## Pagination, filtering, sorting

- List operations paginate; the default and maximum page size are
  stated.
- Cursors are opaque and the contract says so; offsets, if used, carry
  the reason.
- Filterable and sortable fields are an explicit allowlist; the
  contract says what happens on an unknown field (reject, not ignore).
- Ordering is stable and total (a tiebreaker on id) so pages do not
  skip or repeat.

## Auth, limits, and operational contract

- Each operation states which principal types may call it.
- Rate limits are documented with the headers or metadata that expose
  remaining quota and the reset time.
- Timeouts and payload size limits are stated where a consumer could
  hit them.
- Long-running work returns an operation or job resource to poll, not
  a blocking call with an unstated ceiling.

## Compatibility and evolution

- The breaking-change rule is written in one paragraph a consumer
  could read.
- Consumers are told to ignore unknown fields, and the contract
  reserves the right to add them.
- Every enum documents that new values may appear and what a client
  should do with one it does not recognize.
- Deprecated elements carry a signal in the contract and in responses,
  a removal date, and a stated replacement.
- Nothing in the surface names an implementation detail that a
  refactor would want to change.

## Documentation and examples

- Every operation has a request example, a success example, and at
  least one error example, and the examples validate against the
  schema.
- Every field has a one-line description that says what it means, not
  what type it is.
- The contract file lives where the repo keeps such files and the
  README or index points to it.
