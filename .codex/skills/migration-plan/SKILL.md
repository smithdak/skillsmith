---
name: "migration-plan"
description: "Plans a live system's transition in reversible, verified phases — data store, runtime, service, or API cutover. Use when the user says \"plan the migration off Mongo\", \"move to the new auth service without downtime\", \"phase this upgrade\", or must change a running system in place. Not for whether to migrate (decision-record), risk-testing the plan (premortem), or manual cutover scripts (wizard)."
license: "MIT"
metadata:
  skillsmith-composes: "decision-record"
  skillsmith-invocation: "model"
  skillsmith-maturity: "experimental"
  skillsmith-see-also: "premortem, failure-mode-analysis, wizard, architecture-review"
---

# migration-plan

A migration fails in the middle, not at the ends: the system is left
half-moved, the rollback nobody rehearsed does not work, and the team
cannot say whether the last step held. The plan below exists to make
the middle safe. Its unit of work is the **phase** — a change that
ships alone, is verified by an observation before the next phase
starts, and can be reversed by a named action for a stated window. A
plan whose phases fail that test is a big-bang with extra steps.

The output is a plan document (skeleton at the end). Build it in the
order below; each step has a done-when so a half-finished plan is
visibly half-finished rather than plausibly complete.

## 1 — Define A, B, and the invariants

Write state A (where the system is) and state B (where it must end) as
predicates someone can check, not aspirations: "all reads served from
Postgres; Mongo receives zero traffic for 7 consecutive days", not
"we're on Postgres". Then list the invariants that must hold on every
day of the transition — no data loss, p99 within X ms, no downtime
over Y minutes, no double billing — and for each, how it is observed.
An invariant nobody measures is a hope.

Ask for missing numbers rather than inventing them: current traffic,
data volume, the SLO, the window the business tolerates. The plan's
shape depends on them.

**Done when:** A and B are each a checkable predicate, and every
invariant names the metric or check that shows it holding.

## 2 — Choose the transition pattern, with the reason

Load [references/patterns.md](references/patterns.md) and pick one
primary pattern — strangler fig, expand/contract, dual-write with
reconciliation, shadow traffic, feature-flag cutover, or big-bang.
Patterns compose (expand/contract inside a strangler, a flag gating
each phase), but one governs the overall shape. State the reason in
terms of this system's facts: data volume, whether writes can be
duplicated, whether traffic can be mirrored, how expensive a
half-migrated state is to live in.

Big-bang is a legitimate choice only when the reversible alternatives
are demonstrably more expensive — say what the expense is. "Simpler"
is not a reason; "the schema change touches every row and dual-writing
doubles the write budget we do not have" is.

**Done when:** one pattern is named, its reason cites facts from step 1,
and the rejected patterns carry a one-line reason each.

## 3 — Phase the work

Split the transition into phases, each a row in the plan's phase
table. For every phase state:

- **Ships** — the change that goes out, deployable alone.
- **Verification** — the observation that proves the phase held before
  the next begins: a metric crossing, a reconciliation report, a
  canary that stayed green for N hours. "Tests pass" is a
  precondition, not a verification.
- **Rollback** — the concrete action that reverses it (flip the flag,
  redeploy tag, restore from the pre-phase snapshot) and how long that
  action stays valid. Rollback windows close: once new writes land
  only in B, a snapshot restore loses them. Say when each closes.
- **State after** — what the system looks like if you stop here
  forever. A phase that leaves the system in an unlivable state has a
  hidden dependency on the next phase; split or reorder until it
  does not.

No phase may depend on a later one for its safety. Order phases so the
irreversible move — the one whose rollback window is shortest — comes
as late as possible, after the most evidence has accumulated. Mark it
explicitly as the one-way door.

**Done when:** every phase has all four cells filled, no cell reads
"same as above", and the one-way-door phase is identified.

## 4 — Plan the data

Data is where migrations lose things quietly. Cover:

- **Backfill** — how historical data reaches B: batch size, rate limit
  against production load, resume-from-checkpoint on failure, and the
  estimated duration at the measured throughput.
- **Reconciliation** — the checks that show A and B agree: row and
  aggregate counts, per-partition checksums, sampled record diffs.
  State the tolerance (zero for money, maybe 0.01% for analytics) and
  the cadence.
- **Idempotency** — every backfill and sync step is safe to re-run
  from any point, because it will be re-run.
- **Ordering and dual-write hazards** — what happens when a write to A
  succeeds and B fails, when two writers race, when a backfill row is
  older than a live update to the same key. Name the resolution rule
  (last-writer-wins by source timestamp, A authoritative until phase
  N, and so on).

A migration with no data movement (a runtime upgrade, a pure service
extraction) states that in one line rather than skipping the section.

**Done when:** backfill has a rate and a resume story, reconciliation
has a tolerance, and every dual-write hazard has a named resolution.

## 5 — Set cutover criteria and kill/pivot triggers

Before phase 1 ships, write two lists of measurable conditions:

- **Advance criteria** — what permits moving from each phase to the
  next: "reconciliation drift under 0.01% for 3 consecutive daily
  runs", "p99 on the shadow path within 10% of production for 48
  hours". Each names the metric, the threshold, and the duration.
- **Kill/pivot triggers** — what aborts or redirects: drift that does
  not converge, a rollback window about to close with verification
  still red, backfill throughput implying a duration the business
  will not accept. Each trigger names the observation, the action
  (roll back to phase N, switch pattern, stop), and who decides.

Deciding these calmly now is the whole point; decided mid-incident,
they are rationalizations. A trigger without an owner is a wish.

**Done when:** every phase boundary has an advance criterion with a
number, and at least one kill trigger and one pivot trigger exist with
an owner.

## 6 — Route manual steps to a wizard

Any step a human performs in a console, vendor dashboard, or DNS
panel — create the replica, rotate the credential, flip the vendor
switch — does not live as prose in the plan. Reference it as a wizard
stage (the wizard skill, dev-workflow plugin) and record it in Open
items: which steps, what values they capture, which phase
depends on them. Prose runbooks drift; a script with confirmation
gates does not skip a step at 2 a.m.

**Done when:** no phase's "ships" cell contains a human console action;
each is named as a wizard stage.

## 7 — Hand off

Two follow-ons, both recorded in Open items:

- Run the premortem discipline on the finished plan — assume the
  migration failed and reason back to why. The plan supplies the
  destination, phases, and triggers that a premortem needs to bite
  on; do not substitute a risk brainstorm here for that pass.
- Record each one-way-door choice — the pattern selection where
  big-bang was chosen, the irreversible phase, the resolution rule
  for conflicting writes — as a decision-record entry with its
  reversibility class and revisit trigger, so the reasoning survives
  the people who made it.

## The plan document

```
# Migration: <A> → <B>

## Goal predicates
A (current): <checkable statement>
B (target):  <checkable statement>

## Invariants
| Invariant | How observed | Threshold |

## Pattern and reason
<pattern> — because <facts from step 1>. Rejected: <pattern> (<why>), …

## Phases
| # | Ships | Verification | Rollback (action / valid until) | State after |
Mark the one-way-door phase.

## Data plan
Backfill · Reconciliation (checks, tolerance, cadence) · Idempotency ·
Ordering and dual-write hazards with resolution rules

## Cutover criteria
Per phase boundary: metric, threshold, duration.

## Kill/pivot triggers
| Observation | Action | Owner |

## Open items
Numbers still needed · wizard stages (manual steps) · premortem
pending · decision-record entries to file
```

Write it where the repo keeps plans (`docs/`, `docs/migrations/`, or
alongside an existing plan), following local conventions, and report
the path.

## Verify before returning

A and B are predicates, not intentions. Every phase can be stopped at
and lived in. Every rollback names its action and when it stops
working. The one-way door is identified and placed as late as the
dependencies allow. Advance criteria and triggers carry numbers and
owners. No manual console step is written as prose. Open items list
the premortem pass and the decision-record entries.

## Boundaries

- Whether to migrate at all, or to which target, is a decision —
  decision-record's job. This skill starts once the destination is
  chosen; if it is not, say so and stop.
- Rehearsing how the plan fails is premortem's pass, run after the
  plan exists; do not fold it in.
- Enumerating how the resulting system can fail in operation is
  failure-mode-analysis; this skill covers failure during the
  transition only.
- Judging whether the current structure warrants moving is
  architecture-review, which may hand off here once it concludes yes.
- Writing the migration script, SQL, or code, and one-file refactors
  that ship in a single deploy, need no plan of this kind.
