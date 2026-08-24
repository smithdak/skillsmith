---
name: "estimate"
description: "Produces calibrated estimates for uncertain quantities — duration, cost, size, headcount, throughput — by decomposing into estimable parts, anchoring each on base rates, bounding high and low independently, and expressing the result as a range with drivers, never a bare point. Use this skill when the user says \"how long will this take\", \"estimate the cost\", \"give me a timeline\", \"size this effort\", \"is X feasible within Y\", \"how much will Z cost to run\", or asks how sure the estimate is. Not for judging whether experiment results are real (growth-experiments), turning scope into tickets (define-work-items), looking up current prices or versions (ground-truth-research), or prioritizing between options."
license: "MIT"
metadata:
  skillsmith-composes: "ground-truth-research"
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
  skillsmith-see-also: "growth-experiments, define-work-items, discovery-map"
---

# estimate

A point estimate is a lie told with precision. "Three weeks" carries
no information about confidence, and its listener treats it as a
commitment regardless. The deliverable here is a bounded range with
its drivers named — something a decision-maker can act on *and*
something that can be publicly wrong without the estimator losing
credibility. Calibration beats comfort: a wide honest range
outperforms a narrow flattering one the moment reality votes.

## Classify the question

Sort the ask before computing anything:

- **Decomposable quantity** — a project, migration, or build: split
  it into parts (below).
- **Single unknown** — one quantity (a rate, a capacity): anchor and
  bound it directly.
- **Resting on volatile facts** — current prices, versions, vendor
  limits: resolve those with the ground-truth-research discipline
  first; an estimate built on a stale price is confidently wrong.

## Decompose along the work's real seams

Break the quantity into parts small enough to have anchors: phases,
components, per-unit × count. The seams matter — decomposition by
system boundary hides integration work, which is where estimates die;
decompose by *deliverable increments* including review, deploy, and
the boring glue. A part with no anchor is itself a finding: it means
genuine unknowns remain, and they widen the range rather than
disappearing inside it.

## Anchor on base rates, not vibes

For each part, ask what the *reference class* actually delivered: the
last similar ticket's real cycle time (not its estimate), the last
migration's actual duration, industry base rates for comparable work.
Inside-view reasoning — "this one is simpler because I understand
it" — is exactly how every late project started. When no base rate
exists, say so and bound from mechanism (steps required × plausible
per-step time) instead of inventing a memory of one.

## Bound each part independently, then combine honestly

Give every part a low and high bound under explicitly stated
conditions ("assuming API access day one"). Then:

- Totals: sum the lows, sum the highs — the total range is at least
  as wide as the widest intuition suggests.
- Do not average away correlation. Parts that slip together (shared
  reviewer, shared environment) move the high bound up jointly;
  treating them as independent produces fake tightness.
- Central case ≠ sum of centrals when variance matters; report the
  range and a central only if asked.

## Name the drivers and the tightening evidence

Two or three assumptions dominate every estimate. State them: which
input moves the answer most, which side it moves, and what evidence
would collapse the range (a spike day, one vendor quote, one measured
cycle time). An estimate that names "if the OAuth provider sandbox is
ready, this collapses to the low bound" is actionable; a bare range
is trivia.

## Report with calibration language

Ranges carry a confidence level and units and conditions: "80%
confident: 4–6 weeks elapsed with one engineer, assuming existing
auth seams hold." Distinguish estimate from commitment explicitly
when the asker will treat it as the latter. Flag what was excluded —
out-of-scope work is not padding, and saying so prevents both
sandbagging accusations and silent scope debt.

## Verify before returning

The answer contains both bounds, units, and conditions — no bare
points anywhere. Base rates are cited from real history or their
absence is admitted. Drivers and tightening evidence are named.
Load-bearing volatile facts carry their as-of basis. Nothing reads as
a commitment unless the word was earned.

## Boundaries

- Statistical significance questions are growth-experiments'; this
  skill forecasts quantities, it does not test hypotheses.
- Turning an estimated scope into executable tickets belongs to
  define-work-items; hand off once the shape and size are agreed.
- Effort estimates feed planning but never silently become deadlines
  — surface that conversion explicitly when the user seems to make it.
