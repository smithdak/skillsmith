---
name: tdd
description: >-
  Drives implementation through the red–green loop: agree the seams
  under test up front, write one failing test, make it pass minimally,
  repeat in vertical slices. Use this skill when the user says
  "test-drive this", "let's do TDD", "write the test first",
  "red-green-refactor", or wants a feature or bugfix built test-first.
  Not for retrofitting tests onto existing untested code, running an
  existing suite, or debugging a broken test.
license: MIT
metadata:
  skillsmith-composes: "deep-modules"
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# tdd

The loop is red → green, one thin slice at a time. Running the loop is
easy; the discipline is making it produce tests worth keeping — tests
that specify behavior, survive refactors, and fail only when the
product is actually broken.

## Agree the seams before the first test

Tests live at seams: public interfaces where behavior is observable
without reaching inside (the deep-modules skill holds the vocabulary
and placement rules). Before writing any test, name the seams under
test and confirm them with the user — testing effort is finite, and
agreeing seams up front is what lands it on critical paths and complex
logic instead of every reachable edge case. No test gets written at an
unconfirmed seam.

## The loop

- **Red before green.** Write one failing test and run it. It must
  fail for the expected reason — a test failing on a typo or a missing
  import proves nothing about the behavior it claims to specify.
- **Minimal green.** Write only the code that passes the test: no
  speculative parameters, no structure for tests not yet written.
- **Vertical slices.** One seam, one test, one implementation per
  cycle, each test responding to what the last cycle taught. Writing
  all tests first specifies imagined behavior and locks in test
  structure before the implementation has taught anything.
- **Refactoring is a separate activity.** It happens under a green
  suite, between cycles, and changes no behavior. Folding it into the
  red→green transition destroys the evidence the loop exists to
  produce.

## What a keeper test looks like

It exercises behavior through the public interface and reads like a
specification — "expired coupon is rejected at checkout" tells a
reader what the system does without opening the implementation. The
implementation can be rewritten entirely and the test still runs and
still means the same thing.

## Anti-patterns

- **Implementation-coupled** — mocks internal collaborators, tests
  private functions, or verifies through a side channel (querying the
  database instead of the interface). The tell: a refactor breaks the
  test while behavior is unchanged.
- **Tautological** — the assertion recomputes the expected value the
  same way the code does, so it passes by construction. Expected
  values come from an independent source of truth: a worked example,
  a known-good literal, the spec.
- **Horizontal slicing** — all tests written first, then all
  implementation. Work vertically instead; see the loop rules.

## Verify before returning

A cycle is complete when the new test was observed failing and then
passing, the full suite is green, and no assertion in the new test
references internal structure. A test never seen red is a hope, not
evidence.
