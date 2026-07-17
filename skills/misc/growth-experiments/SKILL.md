---
name: growth-experiments
description: >-
  Designs statistically sound A/B experiments and interprets results:
  defines hypothesis and primary metric, calculates required sample
  sizes, flags confounds, and—given results—applies the appropriate
  significance test and states a clear conclusion. Use this skill
  when the user says "design an A/B test", "is this result
  significant", "how long should I run this experiment", "analyze my
  experiment results", "help me set up a test", or wants to avoid
  underpowered or inconclusive tests. Not for multi-armed bandits,
  qualitative usability research, or instrumentation and tracking
  implementation.
license: MIT
metadata:
  skillsmith-invocation: "user"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# growth-experiments

An underpowered experiment wastes traffic and produces nothing; a
mislabeled winner produces a confident regression. This skill designs
tests that are sized to detect the effect that would matter and
interprets results without overclaiming.

## Determine mode

Two modes; detect from context:

- **Design** — user wants to plan a new experiment. Requires:
  what is being tested, the primary metric, and a baseline value for
  that metric. Clarify if missing.
- **Analyze** — user has results. Requires: sample sizes per
  variant, conversions or metric values per variant, and the original
  hypothesis (what direction of change was expected). Clarify if
  missing.

## Design mode

**Write the hypothesis first.** Form: "If [change], then [metric]
will [direction] because [mechanism]." A hypothesis without a
mechanism is a guess; a mechanism makes the result interpretable
regardless of outcome.

**State the primary metric and guardrails.** One primary metric per
test — the one that would change the decision. Guardrail metrics are
those that must not degrade (e.g., downstream conversion,
unsubscribe rate). Name them explicitly; failing a guardrail
overrides a primary metric win.

**Calculate minimum detectable effect (MDE) and sample size.** Ask
the user: what is the smallest improvement that would change a
decision? Use that as MDE. Calculate required sample size per
variant at 80% power and 95% confidence (two-tailed). State how
long the test needs to run given current traffic, and flag if the
required runtime exceeds 4 weeks — long tests accumulate time-
series confounds.

**Flag pre-experiment confounds.** Check for: novelty effect
(change that wears off), seasonality (test spans a known traffic
shift), leakage (variants visible to the same user via different
paths), and multiple comparisons (more than 2 variants without
correction).

## Analyze mode

Apply the appropriate test:
- Binomial outcome (clicks, conversions): two-proportion z-test.
- Continuous outcome (revenue, time on page): Mann-Whitney U (non-
  parametric; does not assume normality for skewed distributions).

Report: observed effect size, p-value, 95% confidence interval on
the effect, and a plain-language conclusion. Do not use
"statistically significant" without also stating what the effect
means in absolute and relative terms.

Flag if the test was stopped early — peeking invalidates the p-
value. If it was stopped early, state the result is directional,
not conclusive, and recommend a pre-registered stopping rule for the
next test.

Flag guardrail metrics before declaring a winner. A primary metric
win with a guardrail regression is a loss.
