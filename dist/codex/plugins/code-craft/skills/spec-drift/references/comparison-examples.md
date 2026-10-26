# Distinguishing drift from differences

These worked cases explain the comparison rules in SKILL.md. Open this reference
when a search miss, a proposed change, or a partial verification could produce a
false finding.

## Missing behavior needs a bounded trace

An accepted API spec says `POST /jobs` returns 409 when the idempotency key already
exists. The handler inserts a job without looking up the key. Before reporting a
missing check, follow middleware, the storage adapter, unique constraints and error
translation. A database constraint mapped to 409 satisfies the promise even if the
handler contains no explicit duplicate branch.

If the schema permits duplicates and the request-to-write path has no equivalent
protection, report the spec section, handler and schema locations, and the inspected
boundary. A focused duplicate-request check strengthens the finding. A grep with
no match for `idempotency` does not establish it.

## Renames can preserve the contract

A design points to `src/queue.ts:enqueue`; that file has moved to
`src/jobs/submit.ts:submitJob`. The endpoint still accepts the same input, stores
the same state, and returns the promised identifier. The behavioral claim matches.
Report the stale path only if keeping that reference usable is in scope, and
classify it as documentation maintenance. Do not call the feature missing.

## Future work is not a current failure

A draft proposes per-tenant scheduling for phase two. The accepted phase-one
contract promises only a global queue, which the implementation provides. List
tenant scheduling as planned/excluded, not missing functionality. If the user
explicitly asks for progress against the draft, describe the work as unimplemented
proposal scope rather than a regression in the accepted contract.

## Conflicting promises require a decision

The accepted API spec promises a seven-day retention period; a current operations
guide promises thirty days. Code defaults to seven. Unless a source establishes
precedence or documents an intentional revision, report a contract conflict with
both locations. Changing code to thirty days would silently choose a policy.

## Source coverage is not deployment evidence

A spec promises email after job completion. Source code calls a notification
adapter and unit tests use a fake provider. Those support the claim that the call
is wired; they do not show production delivery, credentials, or provider behavior.
State what was inspected and what remains unverified. Do not send real email just
to complete the review unless that action is authorized.

## Additional internals are not additional product behavior

A private batching helper, an extra module, or a different loop structure does not
violate a contract merely because it is absent from the design. An undocumented
public endpoint, data export, or side effect may matter if the contract explicitly
limits those behaviors. Tie a finding to that governing requirement and its effect.
