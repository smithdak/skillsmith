---
name: decision-record
description: >-
  Guides a single technical or business decision to a conclusion and
  lands it as a numbered decision record (ADR): context, genuinely
  distinct options, the tradeoff matrix, the choice with its driver,
  accepted consequences, reversibility class, and an observable
  revisit trigger. Use this skill when the user says "write an ADR",
  "help us decide between X and Y and document it", "record why we
  chose X so it doesn't get relitigated", "we picked Postgres over
  DynamoDB — write it up", or is weighing one build-vs-buy, tooling,
  license, or architecture choice. Not for whole-system architecture
  documents (architecture-spec), product feature specs (feature-spec),
  neutral option surveys with no decision sought, or recalling what a
  past record says.
license: MIT
metadata:
  skillsmith-composes: "ground-truth-research"
  skillsmith-see-also: "architecture-spec, falsification-review, premortem"
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# decision-record

Undocumented decisions relitigate themselves every quarter; a good
record ends the argument by preserving why the winning option won —
including the facts that were true when it was made. One record, one
decision: a choice that bundles "which database, which host, which
region" is three records linked together, because each gets revisited
on its own schedule.

## Size the process to the door

First classify reversibility. A **two-way door** — swap a library,
rename an endpoint — earns a fast pass: brief options, decide, record.
A **one-way door** — data model, vendor contract, public API shape —
earns the full treatment below. Saying which door you're facing up
front prevents both over-deliberating cheap choices and rushing
expensive ones.

## Establish context from ground truth

State the forces: constraints, scale numbers, team realities, the
goal the decision serves. Where options differ on volatile facts —
current pricing tiers, version capabilities, vendor limits — verify
with the ground-truth-research discipline and date them in the
record; a decision justified by last year's pricing table does not
survive its first revisit.

## Generate options that differ in mechanism

A baseline plus two alternatives, distinct in mechanism — not three
flavors of one idea. Include the do-nothing baseline when it is real:
"keep cron" is an option, and often a strong one. For each option
capture what it optimizes for and what it sacrifices; an option whose
downsides are unstated has not been stated.

## Decide on a fixed basis

Score the live options across the dimensions that actually decide
this class of choice (operational cost, migration cost, failure
modes, team familiarity, exit path) and mark unknown cells as unknown
rather than guessing. Then choose and name the **driver**: the one
consideration that made the winner win. Pressure-test the leading
option before committing — strongest case against it, would anything
flip the choice — the falsification-review discipline applied once,
not forever.

## Write the record

Sections, in order:

1. **Status, date, and reversibility class** — proposed / accepted /
   superseded-by-N, and whether this is a two-way or one-way door, with
   the one sentence that justifies the class.
2. **Context** — the forces and the goal, with dated volatile facts.
3. **Options considered** — the tradeoff matrix: each live option
   scored on the dimensions that decide this class of choice, unknown
   cells marked unknown, plus the rejected options *with the reason
   they lost*. This section is the anti-relitigation device: a future
   reader re-proposing a rejected option must first explain what changed.
4. **Decision** — what was chosen and the driver that decided it.
5. **Consequences** — what becomes easier, what becomes harder, what
   is now accepted risk. Honest negatives are the part future readers
   trust most.
6. **Revisit trigger** — the observable condition that reopens the
   decision ("p99 write latency exceeds 50ms for a week", "vendor
   price exceeds $X/mo"). A record without a trigger either lives
   forever or dies arbitrarily; state which events legitimately
   reopen it.

Place it where the repo keeps such records (`docs/decisions/` or
`adr/`, following existing numbering) and report the path.

## Verify before returning

A reader at HEAD can reconstruct why the choice was made without this
conversation. Every rejected option carries its reason. The driver is
stated in one sentence. Consequences include at least one honest
negative. The reversibility class is stated in the record itself, not
only in the conversation. The revisit trigger is observable and dated
conditions are attached where they matter.

## Boundaries

- Whole-system structure spanning many coupled decisions belongs to
  architecture-spec; link the spec rather than duplicating it here.
- Execution-failure rehearsal of the chosen path is premortem's job;
  a record may link to one, not absorb it.
- If no decision exists to document and none is sought, stop — a
  neutral comparison survey is a different deliverable.
