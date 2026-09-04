# Required prose coverage by location

*Adapted from deepseek-ai/deepseek-harness — dsh-prose-standard (MIT); see repo-root NOTICES.md.*

Trimming is half the job. The other half is noticing where code, types, and
structure do not communicate a contract that a caller or maintainer needs —
and adding it. A contract is an obligation, invariant, precondition,
postcondition, or compatibility promise someone relies on. Comments state
non-obvious contracts and rationale the code cannot express; they never
restate what the code already shows.

Do not add a comment where the facts below are already obvious locally.

## Public API docs (JSDoc, docstrings, XML docs)

State what the signature cannot: return-value distinctions a caller must
branch on (`null` vs empty, partial vs complete); what throws or rejects and
when; side effects; ownership (who closes, disposes, or frees); timing and
ordering constraints; cancellation behavior; durability (is the write
flushed, is the result cached). A public function with none of these needs
no doc comment beyond its one-line purpose.

## Internal comments

Orient the reader to non-local structure and to genuinely complicated local
structure: invariants, race ordering, ownership handoffs, security
boundaries, surprising failure behavior, and why an obvious alternative was
not taken when the code cannot show it. Delete control-flow narration and
code restatement. "Increment the counter" above `count++` is noise; "count
is read by the flush timer without a lock — single writer by construction"
is a contract.

## Module and file headers

The module's role, what it depends on, what it owns, and any non-obvious
architectural choice — with a link to the owning explanation rather than a
local essay. A header that narrates the file's history is a changelog in
the wrong place.

## Tests

Explain only non-obvious test design: why a fixture is shaped as it is, why
an assertion is indirect, why a platform accommodation exists, why the test
drives the real entry path instead of a mock. Delete step-by-step
walkthroughs and inventories of what the test covers — the assertions are
that inventory.

## READMEs

The consumer contract: configuration and defaults, semantics, failure modes,
limitations, extension points, and anything model- or user-visible the
package emits. Quote stable user-visible text the package owns; link
generated catalogs rather than copying them. Keep durable gaps and
maintainer traps; drop ordinary cleanup inventories and status notes.

## Cookbooks and how-tos

Prerequisites, the exact actions, the real entry path (the built artifact
or shipped command, not a dev shortcut), how the reader observes success,
and concise warnings about the likely misstep.

## Decision records

The unique rationale, the mechanism chosen, the alternatives considered and
why they lost, consequences, and what verification pins the decision.
Implemented decisions read as present-tense shipped state; planning
checklists and acceptance-task lists come out once the work lands.

## Post-mortems

The incident sequence, evidence, causal chain, impact, and prevention.
Remove repeated persuasion and implementation detail that does not
establish causality.

## Skills and agent instructions

Behavioral guardrails and explicit scope limits ("guidance, not a
checklist"). Keep the workflow concise and link its source of truth instead
of restating it.

## Examples and configuration comments

Access limits, non-obvious wiring or load order, security stance, replay or
fixture behavior, and likely misuse. Do not narrate entries the
configuration already shows.

## Prompts and visible strings

Wording is behavior. Inspect the generated output and run the behavior
check, or state why no snapshot applies, before changing a word.

## Diagnostics and error messages

Name the failing subject or path, the violated rule, and the correction
when it is not obvious. Remove internal execution narration ("entering
phase 2…") from anything a user reads.

## Emphasis and searchable names

Preserve searchable mechanism names and meaningful modal, temporal, or
negative emphasis ("**never** retried"). Normalize only decorative emphasis.
