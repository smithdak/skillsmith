# Feature spec template

Every spec uses these sections in this order. Omit none; an honestly
thin section beats a missing one.

```markdown
# <feature name>

## Problem statement
## Solution
## User stories
## Implementation decisions
## Testing decisions
## Out of scope
## Open items
```

## Problem statement

The problem the user is facing, in the user's terms — observable pain,
not absence of the solution ("support can't see refund history", never
"we lack a refund-history view").

## Solution

What the user gets, still from the user's perspective. One or two
paragraphs; mechanism belongs in implementation decisions.

## User stories

A numbered list in the form: as an `<actor>`, I want `<capability>`,
so that `<benefit>`. Err on the side of extensive — edge actors
(admin, unauthenticated visitor, API consumer) and failure-path
stories included. Number them (US1, US2, …) so testing decisions and
tickets can cite them.

## Implementation decisions

What was decided and why, one decision per bullet: modules to build or
modify and the changes to their interfaces, schema changes, API
contracts, architectural choices, clarifications the user supplied.
Each decision traceable to the conversation or to the codebase. No
file paths, no code snippets — except a snippet that encodes a
decision more precisely than prose (schema, type shape, state
machine), trimmed to its decision-rich part and marked with where it
came from.

## Testing decisions

The seams the feature is tested at (confirmed with the user), which
user stories each seam covers, and prior art — existing tests in the
codebase the new ones should resemble. State the standard once: tests
exercise external behavior through the seam, never implementation
internals.

## Out of scope

Explicit exclusions, phrased to answer the "does this include X?"
questions an implementer would otherwise ask. This section kills more
questions than any other.

## Open items

Questions the conversation genuinely did not resolve, each with what
evidence or decision would close it. An honest open item beats a
guessed decision; an empty section means the spec claims completeness.
