---
name: deep-research
description: >-
  Fans a broad or contested question out to parallel investigators, checks
  each load-bearing claim, and delivers one cited, dated report. Use when the
  user says "do deep research on X", "research this thoroughly", or "fan out
  and research", or the question outgrows one thread. Not for one volatile
  fact (ground-truth-research), a durable repo note (research-note), or
  summarizing supplied material.
license: MIT
metadata:
  skillsmith-composes: "ground-truth-research"
  skillsmith-see-also: "research-note"
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# deep-research

Answer a broad or contested question with a cited synthesis whose important
claims withstand source checks. Size the investigation to the user's decision,
available tools, and budget.

## Map the question

Identify independent subquestions, competing explanations, and the evidence
that would resolve them. Choose source types appropriate to each: official
docs, implementation, primary studies, releases, or first-hand observations.
A single bounded inquiry may need only research-note; one changing fact can use
ground-truth-research's verification discipline directly.

## Investigate independently

When subagents are available and authorized, give each a bounded angle and
minimum context without other investigators' conclusions. Request claims with
supporting sources, dates, limitations, and contradictions. If delegation is
unavailable, cover the angles sequentially and do not claim independent review.

Use ground-truth-research's essential method even if the companion is absent:
follow a claim to its primary source, verify volatile facts live, and attach
an as-of basis. Distinguish a direct observation from its generalization.
Multiple summaries of one upstream source are not independent corroboration.

## Challenge important claims

For conclusions the answer depends on, inspect the cited material and seek the
strongest counterevidence. A separate verifier is useful for costly decisions
when available; another model's agreement is not a substitute for primary
evidence. Preserve disagreement rather than averaging incompatible claims.

Review coverage gaps before synthesizing. Continue when a specific unresolved
claim could change the answer and a feasible check remains. Stop at the agreed
budget or when further investigation adds no decision-relevant evidence;
report the material gaps without pretending the search was exhaustive.

## Deliver

Lead with the answer, followed by the evidence needed to assess it. Label
confirmed, inferred, single-source, contested, and unresolved claims as needed;
attach citations near the claims they support. Date the report and distinguish
source publication dates from access dates. Persist it when requested, following
research-note's repository conventions. Do not imply that sources or angles
were checked when they were not.
