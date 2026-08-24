---
name: define-work-items
description: >-
  Defines and documents work items to a business-analyst standard: a
  consistent structure with title, status, description, tasks, and testable
  acceptance criteria, complete enough that an implementer needs to ask
  nothing. Use this skill when the user says "write a ticket", "create a
  work item", "turn this into user stories", "document this as a backlog
  item", or wants a bug, feature, or task written up for someone else to
  execute. Not for status queries, backlog prioritization, or effort
  estimation.
license: MIT
metadata:
  skillsmith-composes: "cold-read"
  skillsmith-invocation: "both"
  skillsmith-maturity: "stable"
user-invocable: true
---

# define-work-items

Produce work items an implementer can execute without asking a single
question. That bar is the whole skill: every ambiguity resolved in the
item is a Slack thread that never happens; every ambiguity left in it is
one that will.

## Elicit before writing

Missing information is resolved by asking, not inventing. Identify the
gaps — actor, trigger, expected behavior, edge cases, out-of-scope
boundary, done-signal — and ask for them in one batched set of targeted
questions, never one at a time. When an answer is genuinely inferable from
context, state the assumption inside the item rather than asking; when it
would change the work, ask. The gap checklist is in
[references/work-item-template.md](references/work-item-template.md).

## Structure every item identically

Use the template in references/work-item-template.md, always with these
fields: **title** (imperative, outcome-scoped), **status**, **type**,
**description** (problem and why — context an implementer needs, not a
solution mandate), **tasks** (concrete, ordered, each independently
checkable), **acceptance criteria** (testable assertions with binary
pass/fail — "works correctly" is not a criterion), **out of scope**
(explicit exclusions; this section kills more questions than any other),
**dependencies**, and **open questions**.

Rules that hold across every item:

- Status may be `ready` only when open questions is empty. An item with
  unresolved questions is `draft` no matter how complete it looks.
- Acceptance criteria verify the description's promise; tasks deliver it.
  A criterion no task produces, or a task no criterion checks, is a gap —
  reconcile before presenting.
- Nothing conversation-dependent: no "as discussed", "the usual way",
  "etc." — inline the referent or resolve the question.
- When the user asks for stories from a larger discussion, decompose into
  items sized so each has a single coherent outcome; note ordering
  dependencies between items rather than merging them.

## Verify before returning

Run the cold-read discipline on each item, casting the audience as a
competent implementer who reads only the item: can they start work
immediately and know unambiguously when they are done? On top of that
pass, check the work-item-specific bar: every AC is binary, tasks and
criteria reconcile, the out-of-scope section answers the likely "does
this include X?" questions, and status honestly reflects open questions.
Fix failures before presenting.
