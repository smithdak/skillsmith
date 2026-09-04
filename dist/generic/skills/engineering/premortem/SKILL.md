---
name: premortem
description: >-
  Runs a premortem on an agreed plan: assumes it failed, narrates why, and
  turns the top risks into warning signals and kill triggers. Use when
  the user says "run a premortem", "stress-test this rollout", "imagine
  it's a year on and this went badly", or is about to start a migration.
  Not for testing a conclusion (falsification-review), a fuzzy idea
  (grilling), or past failures (postmortem).
license: MIT
metadata:
  skillsmith-composes: "falsification-review"
  skillsmith-see-also: "grilling, falsification-review, architecture-spec, define-work-items"
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# premortem

A plan reviewed as "does this look right?" finds the flaws the
reviewer already believes in. A premortem flips the vantage: assume
the effort already failed, then reason backwards to why. Prospective
hindsight makes causes concrete that forward-looking caution keeps
abstract — and every concrete cause is either prevented now,
monitored deliberately, or consciously accepted.

The output is not a verdict on the plan. It is a short list of
risks worth acting on, each with its tripwire, wired back into the
plan before execution starts.

## When it applies

Plans that are agreed enough to execute: migrations, launches,
rewrites, replatforms, releases, process changes, vendor
commitments. An idea still being shaped goes through grilling; a
conclusion under debate goes through falsification-review. If the
user cannot state what "done" looks like, resolve that first — a
premortem over an undefined destination produces undefined risks.

## Assume failure

Set the scene explicitly: *"It is [N months] later. The effort
failed — badly enough that we are unwinding it."* Hold that frame
and write the history of the failure: what shipped, who was
affected, how it unraveled. Specificity is the mechanism — "the
migration stalled" explains nothing; "the dual-write window ran six
weeks instead of two because legacy writes kept drifting" is a cause
that can be prevented.

## Generate causes across classes

Produce failure histories independently per class, then dedupe:

- **Execution** — dependencies late, scope creep mid-flight, the
  dual-run window that never ends, key people pulled off.
- **Technical** — performance cliffs at real scale, data loss or
  drift during transition, integration breakage, rollback that does
  not actually work when tried.
- **Human / adoption** — nobody uses the new thing, the team that
  must maintain it was never bought in, training assumed knowledge
  users do not have.
- **External** — vendor deprecates or reprices the API the plan
  leans on, market or regulation shifts, a competitor ships it
  first.

Forcing independent generation per class matters: single-pass
brainstorms cluster on whatever risk was mentioned first.

## Rank by expected cost

Score each distinct cause roughly — probability it happens times
damage if it does — and rank. Do not fake precision: high/medium/low
on both axes is enough. The deliverable covers the top handful;
record the remainder as considered-and-set-aside with the one-line
reason. A risk list with everything marked urgent is a list nobody
acts on.

## Convert each top risk into three things

1. **Early-warning signal** — the first observable symptom that the
   risk is materializing, stated so monitoring can watch for it.
   "Dual-write drift exceeds 0.5% for two consecutive days."
2. **Prevention** — the cheapest action available *now* that removes
   or shrinks the risk (a spike to prove the risky part, a contract
   clause, a staged rollout boundary).
3. **Mitigation** — containment if prevention fails anyway (the
   tested rollback path, the fallback vendor, the feature flag).

Then promote the risks that should stop or bend the plan into
**kill/pivot triggers**: observable conditions, each with an owner
and a decision date, under which the effort pauses, pivots, or dies.
This is the architecture-spec discipline applied to execution risk —
triggers decided calmly now instead of mid-crisis later. A trigger
without an owner and a date is a wish.

## Wire it back

The premortem ends by changing something: plan revisions, guardrail
tasks via define-work-items ("build the drift-diff script"),
investigation tasks — also via define-work-items, one per unknown —
for the risks that are actually unknowns, or trigger lines appended
to the plan document.
Report which risks changed the plan, which produced tasks, and
which were accepted as-is. If nothing changed anywhere, say so
plainly — a premortem that alters nothing was either theater or the
plan was sturdier than feared; name which and why.

Pressure-test the premortem's own top finding with the
falsification-review discipline before presenting: what would make
this risk a non-issue? Check for that evidence rather than shipping
a confident wrong alarm.

## Verify before returning

Every top-ranked cause carries an early-warning signal, a
prevention, and a mitigation. Kill/pivot triggers are observable,
owned, and dated. Considered-and-rejected risks are recorded with
reasons, not silently dropped. The report names exactly what in the
plan changed as a result — revisions, tasks, tickets, triggers — or
states honestly that nothing did.
