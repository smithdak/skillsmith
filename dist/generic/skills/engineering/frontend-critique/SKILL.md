---
name: frontend-critique
description: >-
  Scored design review of a finished interface — heuristics 0-4, P0-P3
  issues — no changes applied. Use when the user says "critique this
  page", "review the design", "what do you think of this UI", or wants an
  assessment before any changes. Not for applying fixes
  (frontend-redesign), building new UI (frontend-craft), browser checks
  (webapp-testing), or security review (security-diff-review).
license: MIT
metadata:
  skillsmith-composes: "webapp-testing"
  skillsmith-see-also: "frontend-redesign, frontend-craft, security-diff-review"
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# frontend-critique

Assess a finished interface against the user's task and intended audience.
Report prioritized changes without applying them unless the request includes
implementation.

## Inspect the actual interface

Identify the page or flow and whether it persuades, supports a task, explains,
or showcases. Use rendered state when available, with source paths as anchors.
A source-only assessment cannot establish visual quality or working behavior.

Review hierarchy, primary actions, navigation, readable content, consistency,
feedback, error recovery, keyboard access, and relevant mobile states. The
webapp-testing discipline can gather browser evidence; when it is unavailable,
use available browser tools or state the inspection limit explicitly.

Judge product-specific choices against the brief. Do not confuse a preference
for unusual visuals with a usability defect. Cognitive load depends on how
choices are grouped and understood, not a universal four-option cutoff.

## Assess and prioritize

When scoring heuristics, use 0–4 with a stated scale, evidence for each score,
and n/a for inapplicable items. Normalize totals to the applicable maximum.
Scores summarize observations; they are not measured conversion rates.

Separate judgment from mechanical evidence such as contrast measurements,
console failures, and assertions. The frontend-craft detector is optional when
that sibling is installed; locate it from its actual skill directory. Missing
optional scripts do not prevent a useful critique.

Rank issues P0–P3: blocked core task or serious accessibility barrier, major
friction, useful improvement, then polish. For each give the location or state,
observable problem, user consequence, and concrete fix. Identify strengths
that should survive changes when the evidence supports them. Do not invent
issues or strengths to reach a quota.

## Deliver

Lead with the most consequential finding and scope. Include scores if used,
evidence, prioritized fixes, and unresolved questions only when their answers
would change the recommendation. A critique can finish without asking anything.

Persist the report when requested or conventional in the repository. Route
implementation to frontend-redesign or frontend-craft; security-diff-review
addresses code vulnerabilities. State any untested behavior plainly.
