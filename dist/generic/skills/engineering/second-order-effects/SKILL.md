---
name: second-order-effects
description: >-
  Traces a proposed change beyond its first-order intent — policy,
  pricing, product rule, API contract, moderation rule, org process —
  mapping how affected actors adapt rationally, who games it, what
  couples to it, and where the new equilibrium settles. Use this skill
  when the user says "what are the unintended consequences", "if we
  do X what happens next", "play this out", "who will game this",
  "second-order effects of X", or is about to ship a rule whose
  success depends on how people respond to it. Not for rehearsing
  execution failure of an agreed plan (premortem), testing whether
  the premise itself is true (falsification-review), modeling
  attacker entry points (threat-model), or explaining the concept in
  the abstract.
license: MIT
metadata:
  skillsmith-see-also: "premortem, falsification-review, threat-model, estimate"
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# second-order-effects

First-order thinking asks whether the change does what it says.
Everything interesting happens after: people adapt, metrics get
satisfied cheaply, coupled systems shift load, and the world moves
to a new equilibrium that may keep, shrink, or invert the intended
benefit. This skill walks those steps deliberately so the change can
be shaped before shipping instead of patched after.

## Pin the change precisely

State it as an operational sentence: *who must do what differently
tomorrow because of this*. "Charge per-seat" becomes "customers with
30 named users pay for 30 seats even if 12 are active." Vague changes
produce vague consequence maps; precision here is what makes every
later step checkable.

## Enumerate the actors — including the uncooperative

List every class of actor whose incentives the change touches:
customers of each segment, support, sales, moderators, the team
operating the rule, and the ones who benefit from breaking it. Maps
built only from cooperators predict only cooperation. For each class
ask the one question that does the work: **facing this new rule, what
does a rational member of this class do that they did not do
yesterday?**

## Follow the strongest adaptations another step

Take each significant adaptation and repeat the question. Per-seat
pricing → customers invite fewer colleagues → collaboration drops →
churn rises among exactly the accounts the pricing wanted to grow.
Two steps is usually enough; three when the second step feeds back
into the first (a loop). Mark which adaptations undermine the
intent, which merely accompany it, and which are neutral noise.

## Run the gaming pass

Every measurable rule creates pressure to produce the measure without
the outcome. Ask plainly: how do I hit this number while defeating
its purpose? Freshness-ranked docs → pages get cosmetic re-dates;
refund caps → ticket volume fragments to stay under the threshold;
leaderboards → point-farming behavior nobody wanted. Name the two or
three most profitable games and who profits from them.

## Check couplings and the settling point

What else touches these same actors — other policies, SLAs, contracts,
adjacent teams' roadmaps? Changes propagate through couplings their
authors forgot. Then state the equilibrium: after adaptation settles,
does the intended benefit persist, shrink to a fraction, or invert?
An effect map without an equilibrium claim has traced ripples but
refused to name the water level.

## Report the map

Effects ordered by step and likelihood, each tagged: undermines
intent / accompanies it / neutral. Speculative chains labeled as such
— mechanism, not vibes; stop at the step where speculation dominates
and say so. Close with recommendations split into pre-emptions (design
tweaks, guardrails, sunset clauses that remove the harmful
adaptation's payoff) and accepted effects (chosen consciously, with
the estimate of their cost where quantifiable).

## Verify before returning

Actors include at least one gaming class, not just cooperators. At
least one counterintuitive second-order effect was surfaced or the
attempt to find one is documented. The equilibrium claim exists and
is falsifiable. Every recommendation distinguishes pre-emption from
acceptance — nothing just "raises concerns" and stops.

## Boundaries

- Failure rehearsal for an already-agreed plan's execution risks is
  premortem's discipline; this skill maps behavioral response to a
  rule, not schedule slippage.
- Doubts about the factual premise ("will customers actually pay
  more per seat?") belong to falsification-review plus evidence, not
  consequence tracing.
- Attacker entry-point enumeration against a system is threat-model's
  altitude; incentive gaming by legitimate actors is this skill's.
