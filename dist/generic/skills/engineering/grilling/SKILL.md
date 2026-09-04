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

A vague idea survives by staying vague: every ambiguity is a future
rework ticket, and each is cheapest the moment it is found. Grilling
is structured interrogation whose exit condition is a resolved design
tree — every branch closed by a decision, a recorded dependency, or
an owned open question. It ends on convergence, never when questions
run out and never while the user still has answers left to give.

## Restate before asking

Open by restating the idea in two lines: what it is, and what
success looks like. Get an explicit yes or a correction before the
first question — questions aimed at the wrong target waste the
user's patience and the session's credibility. Keep that restatement
visible; every later answer updates it.

## Branch the design tree

Identify the decision axes the idea implies — who it serves, scope
boundaries, the data model, failure modes, integration points,
constraints and non-goals, how it earns or saves money or time. Each
axis with no settled answer is an open branch. Draw the tree before
questioning: it prevents tunnel vision on the first interesting
unknown and reveals dependencies between branches (some answers
collapse others).

## Question discipline

- **Batch 3–5 related questions per round**, grouped by branch. One
  at a time drags; twenty at once is an interrogation, not a
  collaboration.
- **Make every question concrete.** Offer the live options with
  their tradeoffs — "Should free users hit the API directly (simple,
  abusable) or through a quota proxy (more moving parts)?" — never a
  bare "what do you want?"
- **Listen for contradictions** between answers and surface them the
  moment they appear: earlier you said X, now Y — which holds?
  Contradictions mark the exact spot where the idea was fuzzier than
  it felt.
- **Follow the answer, not the script.** An answer that opens two
  new branches outranks the planned next question.

## Resolve or record

Every answer lands in exactly one of three places:

1. **Decision** — record it with its one-line rationale in a running
   decision log shown to the user as it grows.
2. **Sub-branch** — the answer revealed finer questions; add them to
   the tree and continue down that branch.
3. **Open item** — genuinely unknowable in this session: record the
   question, why it is blocked, who or what unblocks it, and the
   latest point where it must be answered. Never invent an answer to
   close a branch early; a recorded unknown is progress, a smuggled
   guess is debt.

When an answer depends on a volatile fact (pricing tiers, current
API limits, competitor behavior), resolve it with the
ground-truth-research discipline instead of leaving it as folklore.

## Converge and route

Convergence is a complete pass over the tree that produces no new
branch. Then deliver: the updated two-line restatement, the decision
log, and the open items — and route the result. One buildable unit
goes to feature-spec or define-work-items; something larger than one
session becomes a sequence of work items, each sized to a session.
Say which routing fits and why, then stop. A grill session that refuses to end stops being useful.

## Boundaries

- Never answer for the user. Supplying candidate options is the job;
  supplying their choice is not.
- Do not grind past convergence for thoroughness theater — a clean
  tree with three owned open items is a finished session.
- Grilling runs before conclusions exist. Once the user states a
  position to be attacked, switch to falsification-review's mode:
  steelman and crux, not more questions.

## Verify before returning

The restated goal survived the session unchanged or was explicitly
corrected. Every branch terminates in a logged decision with
rationale or an owned open item — none in silence. Contradictions
raised during the session were resolved or converted into open
items. The closing summary names its destination skill.
