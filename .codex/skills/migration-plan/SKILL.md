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

Plan a live system's transition so intermediate states are operable and each
advance has evidence. Name irreversible steps and the last safe rollback point.

## Establish the endpoints

Describe the current and target states as checkable predicates. Recover the
chosen destination and constraints from existing decisions. If the destination
is unsettled, use decision-record's comparison to identify the decision needed;
do not invent one. Identify invariants such as data integrity, availability,
and latency, with how each will be observed. Label missing measurements and
proposed thresholds; they are not existing service commitments.

## Choose the transition

Use [references/patterns.md](references/patterns.md) for expand/contract,
strangler, shadow traffic, dual-write, and cutover tradeoffs. Choose from actual
compatibility, write paths, capacity, and rollback needs. A short bounded outage
can be preferable when accepted by the user and supported by a recovery plan;
zero downtime is not an assumed requirement.

For each phase specify what ships independently, the verification required to
advance, the state if progress stops, and a concrete rollback with its validity
window. Keep risky contraction and irreversible data changes late. If a phase
has a time-limited coexistence window, name its bound and recovery action
instead of claiming the intermediate state can last forever.

## Protect the data

Where data moves, define backfill checkpoints, rerun safety, load limits,
reconciliation, and authority for conflicting writes. Check partial failures,
concurrent updates, and a backfill overwriting newer data. Choose resolution
from domain semantics; unsynchronized wall clocks do not automatically define
correct ordering. Estimate duration from measured throughput or label it unknown.

Example: restoring yesterday's snapshot after new-only writes begin discards
those writes. A rollback needs reverse replication, replay, reconciliation, or
an explicitly accepted loss window; a backup alone does not establish it.

## Define the operating decisions

For phase boundaries give an observable advance condition and a stop or pivot
condition when warranted. Name the decision owner or leave assignment open.
Describe manual steps precisely; a wizard can package a repeated procedure
when useful, but a single console step does not require another plugin.

Write the plan in the repository's usual location, with goal predicates,
invariants, phase table, data handling, triggers, and material open items.
Apply decision-record's essential discipline to costly choices: alternatives,
driver, consequence, and revisit trigger. Use premortem for requested failure
rehearsal; failure-mode-analysis and architecture-review cover other questions.

## Completion

Each phase has a supported advance check and an honest recovery limit. The
plan distinguishes measured constraints from proposals. Report the artifact;
planning does not authorize executing a production cutover.
