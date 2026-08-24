---
name: "diagnose-bugs"
description: "Runs a disciplined root-cause diagnosis for a bug, flaky test, performance regression, or unexplained behavior: reproduce deterministically, read the evidence before theorizing, then drive a one-variable-at-a-time hypothesis loop until the mechanism is proven. Use this skill when the user says \"why is this failing\", \"figure out this bug\", \"this test is flaky\", \"it works on my machine\", \"find the regression\", or hands over a stack trace, error message, or misbehaving system to investigate. Not for building features test-first (tdd), documenting an already-found root cause (postmortem), security review of a change (security-diff-review), or explaining how working code functions."
license: "MIT"
metadata:
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
  skillsmith-see-also: "tdd, postmortem, security-diff-review"
---

# diagnose-bugs

Debugging is controlled experimentation, not guessing harder. The
output is a proven mechanism — "given X, the system does Y because
Z" — backed by a demonstration: the bug reproduced on demand, then
shown gone. Guessing produces fixes that mask symptoms; the loop
below makes each experiment cheap enough that the truth arrives
before frustration does.

## Phase 1 — Reproduce deterministically

No hypothesis work starts before the bug reproduces on demand:

- Capture the exact invocation: command, inputs, environment,
  commit, seed. A repro that needs "the state it was in" is not yet
  a repro.
- Shrink the input. Half the dataset, half the document, one request
  instead of a session — smaller repros run faster and exclude more
  causes.
- For flaky failures, find the lever: random seed, execution order,
  parallelism, timing, locale, timezone, network conditions. Run the
  suspected lever across many iterations (`--repeat`, seeds in a
  loop) until failure rate is measurable — a lever moved from
  "sometimes" to "one in twenty" is a lead, not noise.
- If reproduction fails entirely, stop and say so: the report may be
  environment-specific, and that difference is itself the first
  clue. Ask for the missing environment detail rather than
  simulating confidence.

**Done when:** a single command fails on demand, and its output is
captured.

## Phase 2 — Read the evidence before theorizing

Read the complete error, the full stack trace, the surrounding log
lines — not the first line. Note which layer raised it and what the
message literally claims. Most bugs die here: the stack names the
module, the message names the violated expectation, the log names
the request that carried bad data into it. Record what the evidence
establishes versus what it merely suggests; theories come next, and
they must survive contact with this record.

## Phase 3 — Run the hypothesis loop

One cycle = one hypothesis, one prediction, one minimal experiment,
one observation:

1. State the hypothesis as a mechanism: "X happens because Y".
2. Predict what the next experiment shows if the hypothesis holds —
   before running it. An experiment whose outcome fits any
   hypothesis teaches nothing; sharpen it until it can fail.
3. Change one variable at a time. Two simultaneous changes make
   both results uninterpretable.
4. Binary-search the surface: bisect history (`git bisect`) for
   regressions, bisect the input for data-dependent failures, log
   at interface boundaries to bracket which side of a boundary the
   value goes wrong.

Prefer experiments that read state over experiments that mutate it;
prefer the cheapest observation that discriminates between the two
leading hypotheses. When the evidence contradicts the hypothesis,
discard the hypothesis, not the evidence.

## Phase 4 — Instrument deliberately, then remove it

When behavior must be watched rather than queried: add assertions
or logging at module boundaries (function entry/exit, queue
send/receive, cache hit/miss), never scattered mid-block. Log the
value, the type, and the boundary name. Every instrument gets
removed or converted into a permanent assertion before the fix is
declared — leftover debug output is its own defect.

## Phase 5 — Fix the mechanism and pin it

- Fix the causal step, not the loudest symptom. Where a guard would
  have caught it earlier, that placement decision is part of the
  fix.
- Pin the bug with a regression test written against the original
  repro: it must fail on the pre-fix code and pass on the fixed
  code. A fix without a pin reverts silently under the next refactor.
  (The red-green mechanics are the tdd discipline.)
- Re-run the full suite, not just the new test — fixes move
  behavior, and neighbors break quietly.
- Explain the mechanism in one paragraph: what was wrong, why it
  produced the observed symptom, why the fix holds. If the root
  cause was subtle, systemic, and costly to rediscover, offer the
  postmortem discipline for the write-up.

## Boundaries

- No removing or skipping tests to make failures disappear; a test
  that encodes wrong behavior gets rewritten with the reason stated,
  never deleted quietly.
- No speculative hardening shipped alongside the fix — unrelated
  "while we're in here" changes become separate suggestions.
- If the mechanism stays out of reach after a real effort through
  this loop, stop at the evidence: report what was established,
  what was excluded, and the sharpest open question — do not
  present a guess as a diagnosis.

## Verify before returning

The original repro was shown failing before the fix and passing
after it, by command. A regression test pins the mechanism and the
full suite is green. All temporary instrumentation is gone. The
closing explanation states the mechanism — cause, not just
correlation — and names the evidence that proved it.
