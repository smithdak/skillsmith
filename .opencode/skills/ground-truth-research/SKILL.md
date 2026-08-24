---
name: "ground-truth-research"
description: "Verifies volatile facts against live sources before asserting them or designing against them, and attaches an as-of basis to every time-sensitive claim. Use this skill when a task depends on current versions, API surfaces, prices, rankings, model or tool capabilities, ecosystem or market state, or when the user says \"latest\", \"current\", or \"still\" about anything that changes. Not for settled knowledge: established science, history, protocol fundamentals."
license: "MIT"
metadata:
  skillsmith-invocation: "model"
  skillsmith-maturity: "stable"
---

# ground-truth-research

Training data is stale by default. For anything that changes — versions,
APIs, prices, capabilities, who holds a role, what tools exist — recall is
a hypothesis, not an answer. The failure mode this skill prevents is
concrete: a design built on a remembered API surface fails at
implementation, and an assertion built on a superseded fact fails in front
of the user who acts on it.

## Classify before answering

Sort each load-bearing claim by volatility:

- **Stable** — settled science, history, protocol and language
  fundamentals. Answer from knowledge; verification adds nothing.
- **Slow-changing** — governance, org structures, major-version defaults.
  Verify when the answer will be acted on; date it either way.
- **Volatile** — versions, releases, prices, benchmarks, rankings,
  ecosystem state, product capabilities. Verify before asserting, every
  time, regardless of confidence in the recalled answer. High familiarity
  with the old state is exactly what makes the stale answer convincing.

## Verify

- Prefer primary sources: the repository, the official docs, the release
  notes, the announcement — over aggregators and secondary coverage.
  Source-quality rubric and per-domain guidance in
  [references/source-rubric.md](references/source-rubric.md).
- Empirical beats documented when they disagree: what the tool does
  outranks what its docs claim. Where feasible, test the claim directly
  and report the observed behavior with the version observed.
- Form an independent prior before adopting any number the user
  supplied; when the two diverge, present both and the reason for the gap.

## Corroborate, then close the gaps

Stopping at the first plausible source is how a confident wrong answer gets
through. Hold each load-bearing claim to a completion bar: corroborate it
against multiple independent primary sources, or state explicitly that
independent sources are scarce and the claim rests on one. Two pages
repeating the same upstream press release are one source, not two.

Before finishing, run one gap round: list what is still missing,
contradictory, or resting on a single source, then do another pass to close
those. Repeat until a pass surfaces nothing new. The gap round is where
single-source claims and quiet contradictions get caught.

Keep the three kinds of statement separate rather than blending them into a
false consensus: what the sources **confirm**, what is **inferred** from
them, and what remains **unresolved**. When sources genuinely disagree, present the
disagreement and the stronger-sourced side — do not average them into a
claim no source makes.

## Report

Every time-sensitive claim carries its basis: verified, with the source's
date ("v0.43.0, released June 10, 2025, per the repo's releases page") —
or flagged as training-vintage and possibly superseded. If verification
fails or is unavailable, say the answer may be stale and name what would
confirm it. Never silently substitute the remembered answer.

## Verify before returning

Scan the drafted response for undated volatile claims — version numbers,
"currently", "the latest", capability assertions about living products.
Each one either gains its as-of basis or gets reworded to a claim the
evidence supports. An unverifiable claim stated with a flag is honest; the
same claim stated bare is a defect.
