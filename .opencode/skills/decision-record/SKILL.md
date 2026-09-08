---
name: "decision-record"
description: "Settles one technical or business decision and lands it as a numbered ADR: options, tradeoffs, choice and driver, and a revisit trigger. Use when the user says \"write an ADR\", \"help us decide between X and Y and document it\", or \"record why we chose X so it doesn't get relitigated\". Not for whole-system documents (architecture-spec), how to transition (migration-plan), or neutral comparisons."
license: "MIT"
metadata:
  skillsmith-composes: "ground-truth-research"
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
  skillsmith-see-also: "architecture-spec, falsification-review, premortem"
---

# decision-record

Settle or record one consequential choice, preserving why the selected option
wins and what would justify revisiting it. Separate choices that can change
independently into separate records when that helps future decisions.

## Establish the basis

Reuse the user's constraints and the repository's decisions. Identify the goal,
live alternatives, and cost of reversing the choice. Spend more effort on
costly commitments; a reversible local choice needs a brief record.

Verify decision-changing volatile facts using the ground-truth-research
discipline: consult the primary source and attach its date. When unavailable,
state the uncertainty and how it affects the recommendation. Do not invent
traffic, incident frequency, prices, or team preferences to fill a matrix.

## Compare and choose

Compare feasible options on the dimensions that decide this choice. Include
keeping the current approach when viable; do not manufacture a third option.
State each option's main benefit, cost, and failure mode. Prefer qualitative
tradeoffs to scores that imply measurements nobody has made.

Name the driver that makes the chosen option win. Apply the falsification-review
check: identify evidence that would overturn the choice and inspect it when
available. Distinguish a proposed recommendation from an already accepted
decision. A request to recommend is sufficient to recommend; acceptance must
come from the user's decision or existing authority.

## Write the record

Follow the repository's ADR location and numbering, commonly docs/decisions/.
Include status and date, context and constraints, feasible options and why they
lost, the decision and its driver, consequences including an honest drawback,
and an observable revisit trigger. State how reversal would work or why it is
expensive. Preserve accepted records by linking superseding decisions.

For example, a timeout after a charge is an ambiguous outcome: a retry policy
must address idempotency and reconciliation, not merely choose a retry count.
A threshold proposed for future monitoring is not an observed measurement.

## Completion

A future reader can reconstruct the choice without the conversation, identify
what remains unverified, and tell when to reopen it. Report the artifact path
when one was written. Whole-system design belongs to architecture-spec;
execution rehearsal belongs to premortem.
