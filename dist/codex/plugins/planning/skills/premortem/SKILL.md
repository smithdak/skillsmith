---
name: "premortem"
description: "Runs a premortem on an agreed plan: assumes it failed, narrates why, and turns the top risks into warning signals and kill triggers. Use when the user says \"run a premortem\", \"stress-test this rollout\", \"imagine it's a year on and this went badly\", or is about to start a migration. Not for testing a conclusion (falsification-review), a fuzzy idea (grilling), or past failures (postmortem)."
license: "MIT"
metadata:
  skillsmith-composes: "falsification-review"
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
  skillsmith-see-also: "grilling, falsification-review, architecture-spec, define-work-items"
---

# premortem

Find actionable ways an agreed plan could fail before execution. Use an
explicitly hypothetical failure story to expose causal chains, then turn the
most consequential ones into prevention, detection, and response.

## Inspect the plan

Recover its intended outcome, constraints, dependencies, and timing from the
provided material. Ask only when an ambiguity prevents useful analysis. A
half-formed idea belongs to grilling; a disputed conclusion belongs to
falsification-review.

Imagine the plan has failed and trace how that could happen. Consider execution,
technical, adoption, and external causes when relevant. Keep invented future
events labeled as scenarios; do not present hypothetical incidents as facts.

Example: concurrent exports exhaust memory, retries create more concurrent
work, and a recoverable slowdown becomes a sustained outage. That chain points
to concurrency limits and retry behavior, rather than a generic “scale risk.”

## Prioritize and act

Rank plausible causes by likelihood and impact, explaining the driver and
marking unmeasured estimates. Do not fill every category or force a fixed risk
count. Check the leading risk with the falsification-review discipline: an
existing control may already break the proposed chain.

For each risk worth acting on, specify:

- The earliest observable warning signal.
- A practical preventive change available before execution.
- Containment or recovery if prevention fails.
- A stop or change-of-direction condition when the risk warrants one.

Name an owner or responsible role when known; otherwise leave assignment
explicitly open. Treat proposed thresholds and dates as proposals until agreed.
Borrow architecture-spec's observable triggers without expanding into a system
redesign.

## Deliver

Lead with the risks that change the plan and the recommended actions. Apply
local plan edits when requested or already within scope; otherwise present
concrete proposed revisions. Use define-work-items for requested task breakdowns,
not automatic ticket creation or messages to other people.

State which changes were applied, which are proposals, and which risks are
accepted or deferred with reasons. If no material change is justified, say why.
The result is complete when the top risks have useful signals and responses,
with assumptions and remaining decisions visible.
