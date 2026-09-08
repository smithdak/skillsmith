---
name: grilling
description: >-
  Interrogates a half-formed idea or plan until every branch resolves into
  a decision or an explicit open item, before building starts. Use when
  the user says "grill me on this", "poke holes in this idea", "ask me the
  hard questions", or has a vague idea they are about to act on. Not for
  testing a conclusion (falsification-review), capturing decisions
  (feature-spec), or tickets (define-work-items).
license: MIT
metadata:
  skillsmith-composes: "ground-truth-research"
  skillsmith-see-also: "falsification-review, feature-spec, define-work-items"
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# grilling

Turn an unsettled idea into decisions and explicit open questions. Focus the
conversation on uncertainties that could change what gets built or whether it
is worth building.

## Establish the target

Restate the intended outcome briefly using the existing conversation. If the
goal is already clear, proceed to the first consequential question. Seek a
correction when competing interpretations would send the discussion in
different directions; do not require a ceremonial approval of a restatement.

Identify the decision axes relevant to this idea: audience, scope, behavior,
data, dependencies, failure modes, cost, and success criteria. Keep this map as
working context; show it when it helps the user navigate a complex decision.

## Ask questions that change the plan

Choose the highest-impact unresolved branch. Offer concrete alternatives with
tradeoffs and a recommendation when evidence supports one. Use a short related
batch when answers are independent; ask one question when it determines the
next branch. Reuse prior answers and surface contradictions specifically.

Verify volatile facts through the ground-truth-research discipline: check the
primary source, date the claim, and separate verified facts from assumptions.
Do not ask the user to supply a fact available in the repository or live docs.

Record each answer as a decision with a reason, a narrower question, or an open
item with its blocker and the point when an answer is needed. Do not invent
user preferences or reopen settled choices for completeness.

## Converge

Stop when the remaining uncertainty no longer blocks the next useful action,
the user asks to stop, or progress depends on evidence outside this session.
An owned open question is a valid result. Repeatedly expanding low-impact
branches makes the exercise less useful.

Deliver the resulting decisions, material open items, and concrete next action.
A feature-spec can capture the feature; define-work-items can decompose the
agreed work. Apply their essential discipline inline if those skills are
unavailable. A settled conclusion needing a counterargument belongs to
falsification-review.
