---
name: "failure-mode-analysis"
description: "Ranks the failure modes of a system or design — per dependency: down, slow, partial, or wrong — by likelihood × impact × detectability, with mitigations and game-day tests. Use when the user says \"what happens if redis goes down\", \"how resilient is this service\", or \"failure modes of this design\". Not for attackers (threat-model), plans (premortem), or past failures (diagnose-bugs, postmortem)."
license: "MIT"
metadata:
  skillsmith-invocation: "model"
  skillsmith-maturity: "experimental"
  skillsmith-see-also: "threat-model, architecture-review, premortem, migration-plan, diagnose-bugs, postmortem"
---

# failure-mode-analysis

Trace how dependency failures become user-visible harm, then rank practical
mitigations and tests. Focus on accidental failures; threat-model handles
intentional abuse and premortem handles plan execution.

## Map dependencies and modes

Read the relevant code, configuration, and supplied design. Trace critical user
paths through services, datastores, queues, external APIs, and shared resources.
Include infrastructure such as DNS, credentials, disk, or pools where those
paths depend on it. With design-only inputs, distinguish proposed behavior
from observed implementation and do not invent call sites.

For each relevant dependency consider unavailable, slow, partial, wrong, and
overloaded behavior. For stateful components also consider capacity exhaustion,
conflicting writers, and lost acknowledged writes. Summarize irrelevant modes
briefly; concentrate detail on distinct failure mechanisms.

## Follow the propagation

For each material mode establish current behavior, affected user paths,
detection signal and delay, and recovery behavior. Read actual timeouts,
retries, acknowledgements, and transaction boundaries when code is available.

Example: a worker charges successfully, then crashes before saving the order
or acknowledging the message. Redelivery can charge again. A stable operation
identity and reconciliation address that partial completion; retries alone do
not. Examine ambiguous timeouts, duplication, ordering, and overload feedback.

Consult [references/mitigation-catalog.md](references/mitigation-catalog.md)
when selecting timeout, bounded retry, isolation, fallback, or recovery controls.
Check each control's own failure mode and whether its parameters fit the
caller's latency and capacity budget.

## Rank and verify

Prioritize by likelihood, impact, and difficulty of detection. State the evidence
and uncertainties. Use the project's numeric scale when one exists; mark
unsupported scores unknown and use an explained qualitative ordering instead
of multiplying invented numbers. Silent data corruption can outrank a visible
outage despite lower frequency.

For each top risk give a mitigation, operational tradeoff, next action, and a
fault-injection test: fault, isolated environment, and observable expected
outcome. Proposed thresholds require calibration. Specify experiments without
running disruptive operations unless separately authorized.

Use [references/fmea-template.md](references/fmea-template.md) when a full
report is useful. Lead with ranked risks; keep evidence and lower-priority
coverage concise. The result is complete when top risks have causal paths,
detection gaps, feasible controls, and testable recovery behavior. Existing
incidents belong to diagnose-bugs or postmortem; rollout sequencing belongs to
migration-plan and structural coupling to architecture-review.
