---
name: falsification-review
description: >-
  Runs a falsification pass before a consequential conclusion is presented:
  strongest counterargument first, crux identification, and a check on what
  evidence would overturn the position. Use this skill when about to endorse
  a recommendation, architecture decision, estimate, or plan — when the user
  asks "should we", "is this the right call", "sanity check this decision",
  or presents a position for assessment. Not for factual lookups, how-to
  questions, or neutral surveys of options.
license: MIT
metadata:
  skillsmith-invocation: "both"
  skillsmith-maturity: "stable"
user-invocable: true
---

# falsification-review

Before presenting a consequential conclusion, subject it to an attempt to
break it. The output changes only when the attempt succeeds — but the
attempt must be real, not ceremonial. A conclusion that has survived a
genuine falsification attempt is worth more than the same conclusion
asserted; a conclusion that fails one was about to be a mistake.

## When this applies

Recommendations the user will act on: architecture and technology choices,
estimates, plans, go/no-go calls, and any position the user has advanced
for assessment. It does not apply to factual answers, how-to responses, or
neutral option surveys where no judgment is being rendered.

## The pass

Work through these before writing the conclusion:

1. **Steelman the opposite.** Construct the strongest case a competent
   advocate would make against the position — evidence and mechanism, not a
   strawman. If the position is the user's, this case leads the response.
2. **Find the crux.** Identify the single consideration that, if resolved
   the other way, flips the conclusion. If no such consideration exists,
   the question may be underdetermined — say so instead of manufacturing
   confidence.
3. **Name the falsifier.** State what observable evidence would prove the
   conclusion wrong, and check whether that evidence was actually looked
   for. "Nothing could change my mind" is a defect, not confidence.
4. **Separate reporting from endorsing.** Where the conclusion leans on a
   consensus view, state whether the consensus is being endorsed or merely
   relayed, and follow the evidence where they diverge.
5. **Attach confidence with a driver.** High / moderate / low, and for
   anything below high, the specific missing evidence that would raise it.

## Maker-checker escalation

For document-scale deliverables — specs, estimate packs, plans, SOWs —
inline checking is insufficient: the author's context biases the check.
Spawn the `falsification-reviewer` agent with the complete draft and act on
its findings before presenting. Reserve this for deliverables; inline passes
suffice for conversational recommendations (subagent review costs ~7x
tokens).

## Boundaries

- Do not manufacture disagreement. When the position survives the pass,
  confirm briefly and move on — a clean bill of health is a valid finding.
- One pass per conclusion. Re-running until an objection appears is
  p-hacking, not rigor.
- The pass produces content for the response (counterargument, crux,
  confidence), not narration about having performed it.

## Verify before returning

The response must contain: the strongest counterargument stated concretely
enough that its advocate would recognize it; the crux, if one exists; and a
confidence level with its driver. If the counterargument changed the
conclusion, the response says so plainly rather than presenting the revised
position as the original.
