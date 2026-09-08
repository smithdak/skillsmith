---
name: "postmortem"
description: "Writes an incident or bug post-mortem once the root cause is known: evidence-anchored timeline, mechanism, why every safety net missed it, guardrails. Use when the user says \"write a post-mortem for this outage\", \"do an RCA on this bug\", or wants a found root cause documented. Not for finding the cause (diagnose-bugs), what could fail (failure-mode-analysis), or tickets (define-work-items)."
license: "MIT"
metadata:
  skillsmith-composes: "doc-visuals"
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
  skillsmith-see-also: "architecture-spec, define-work-items, diagnose-bugs, handoff, research-note"
---

# postmortem

*Adapted from deepseek-ai/deepseek-harness — docs/postmortem (MIT); see repo-root NOTICES.md.*

Document an incident's established mechanism, impact, detection gaps, and
practical prevention. Honor an explicit request for a postmortem; scale its
length to the incident instead of requiring a minimum degree of complexity.

## Recover the evidence

Collect relevant logs, timestamps, commits, reproduction commands, tests, and
known impact. Separate the user-visible symptom, causal mechanism, and why
existing checks failed to catch it. Distinguish containment from a permanent
fix. Missing evidence stays missing; do not fabricate a complete timeline or
infer a person's internal state from their actions.

If the mechanism remains unsettled, write the supported incident account and
mark the root cause unresolved. Use diagnose-bugs for requested investigation.
A useful preliminary record is possible without inventing a finished RCA.

## Explain why the system allowed it

Trace the cause and contributing conditions. For relevant tests, reviews, and
monitors, state what each actually established and which failure it missed.
A passing health endpoint, for example, may demonstrate process availability
without demonstrating that a user can complete checkout.

Keep the account factual and blameless. Explain system and process conditions
rather than assigning motives or replacing causal detail with “human error.”

## Record corrective action

Use [references/postmortem-template.md](references/postmortem-template.md) when
a full report is useful. Include a concise outcome, impact and its evidence,
timeline, mechanism, detection gaps, and corrective actions with owners or open
assignments. Separate implemented guardrails from proposed follow-up work.

For each important guardrail, explain the condition it detects and how to
verify it against the failure. Do not claim it was tested unless it was. Use
doc-visuals for the timeline if available, or a simple source-anchored table.
Link requested architecture-spec, define-work-items, handoff, or research-note
artifacts rather than duplicating their jobs or creating external tickets.

## Completion

A reader can understand what happened, what is established, what changed, and
what remains unresolved. Each consequential claim has evidence, and actions
address the mechanism or detection gap rather than merely restating the fix.
