---
name: tdd
description: >-
  Drives a feature or bugfix through the red–green loop: agree the seams,
  write one failing test, pass it minimally, repeat in vertical slices. Use
  when the user says "let's do TDD", "write the failing test first",
  "red-green-refactor", or wants code built test-first. Not for existing
  untested code (retrofit-tests), a broken test (diagnose-bugs), running a
  suite, or browser checks (webapp-testing).
license: MIT
metadata:
  skillsmith-composes: "deep-modules"
  skillsmith-see-also: "retrofit-tests"
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# tdd

Build requested behavior through observable red → green cycles. The test must
prove a product behavior and remain useful when the implementation changes.

## Choose the boundary

Use the existing public interface that exposes the behavior: a function,
request handler, command, or user action. The deep-modules discipline helps
keep this interface smaller than its implementation. Infer the seam from the
request and repository; explain a consequential choice briefly. Ask only when
an unresolved requirement would change what correct behavior means.

## Run a vertical slice

1. Write one test for the next behavior and run it. Confirm that the failure
   demonstrates the missing behavior, rather than a typo or broken setup.
2. Implement enough to pass it. Avoid options and abstractions for imagined
   future requirements.
3. Refactor under green tests when it improves the design, then select the
   next behavior from the requirement and what the last slice revealed.

For example, test that an expired coupon is rejected at checkout. Assert the
observable result; do not assert which private helper performed the check.

Expected values come from the requirement, a worked example, or an independent
reference. Recomputing the implementation inside the assertion proves nothing.
Use controlled substitutes at external boundaries when real dependencies make
the test unreliable; avoid mocks that freeze internal call sequences.

## Verify

Observe the new test fail before the fix and pass after it. Run affected tests
and required repository checks. Broaden the run when the change affects shared
behavior; do not repeat an unchanged passing suite without a reason.

Report the behavior implemented and verification actually performed. Keep
unrelated cleanup out of the patch. Existing behavior that needs a safety net
belongs to retrofit-tests; here each cycle introduces or corrects behavior.
