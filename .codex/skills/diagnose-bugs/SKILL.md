---
name: "diagnose-bugs"
description: "Finds the root cause of a bug, flaky test, or regression: reproduce, read the evidence, one hypothesis at a time until the mechanism is proven. Use when the user says \"why is this failing\", \"this test is flaky\", \"it works on my machine\", or hands over a stack trace. Not for writing up a found cause (postmortem), what could fail (failure-mode-analysis), or diff security (security-diff-review)."
license: "MIT"
metadata:
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
  skillsmith-see-also: "tdd, postmortem, security-diff-review"
---

# diagnose-bugs

Find the causal mechanism and, when a fix is requested, demonstrate that the
fix removes it. Separate observed facts, hypotheses, and unverified claims.

## Establish the failure

Read the actual error, surrounding logs, relevant code, and recent changes.
Record the invocation, inputs, environment, and expected versus observed result.
Try the smallest reproduction that preserves the failure. For intermittent
failures, hold the command and iteration count fixed and measure the rate;
inspect seeds, ordering, concurrency, timing, and environment differences.

A missing reproduction is a limit on confidence, not a reason to stop reading
available evidence. Form hypotheses that help obtain one. If the necessary
state is inaccessible, name the missing evidence and the cheapest way to
capture it; continue independent checks without inventing a root cause.

## Discriminate between causes

For each experiment, choose one mechanism, predict an observable result, and
change one relevant variable. Prefer the cheapest check that distinguishes
the leading explanations. Bisect commits for regressions, shrink inputs for
data-dependent failures, and inspect boundaries to locate where a value first
becomes wrong. Discard a hypothesis when the observation contradicts it.

Example: if a failure disappears when requests run serially, investigate shared
state and ordering; increasing the timeout alone does not establish the cause.

Use temporary instrumentation when observation requires it. Avoid recording
credentials or sensitive payloads. Remove debugging changes after use, or keep
an intentional diagnostic with a clear operational purpose. If investigation
stalls, use [references/stuck-protocol.md](references/stuck-protocol.md).

## Fix and verify

Change the causal step with the smallest sufficient patch. Pin the original
failure through an observable interface: see the regression test fail on the
old behavior and pass with the fix. The tdd discipline supplies that loop.
Run affected tests and the repository's required checks; widen testing when
the changed dependency or unresolved evidence justifies it.

Report the mechanism, fix, evidence, and remaining limits. Distinguish a
verified fix from a plausible mitigation. Keep unrelated hardening separate;
do not skip failing tests to create a green result. Use postmortem for a
requested durable incident account and security-diff-review for vulnerabilities.

## Completion

The evidence connects input → causal step → symptom, and verification addresses
the reported failure. If it cannot, report the unresolved mechanism and next
useful experiment, without claiming the task is fixed.
