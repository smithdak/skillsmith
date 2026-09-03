---
name: retrofit-tests
description: >-
  Adds tests to code that already works and has none: characterization
  tests that pin current behavior at its seams before that behavior is
  changed, prioritised by what is about to move or is frightening to
  touch, each one proven by breaking the code and watching it fail. Use
  this skill when the user says "add tests to this module", "we have no
  tests for this", "get this under test before the refactor", "raise
  coverage on X", "write characterization tests", or points at legacy
  code they need to change safely. Not for building new behavior
  test-first (tdd), debugging a failing test (diagnose-bugs), running an
  existing suite, or browser-level verification (webapp-testing).
license: MIT
metadata:
  skillsmith-see-also: "tdd, deep-modules, diagnose-bugs"
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# retrofit-tests

The code already works; nobody wrote down what "works" means. The job is
to record it — so that when the code changes, something says whether it
still does what it did. That inverts the red–green loop: here a new test
should pass on the first run, and the evidence it is worth keeping comes
from deliberately breaking the code and watching the test go red.

## Pin behavior, not intent

A characterization test asserts what the code *does*, including the odd
edge that no one would design on purpose. Resist correcting behavior
while pinning it: a test that encodes what the author meant, rather than
what the code does, will fail the moment it runs, and the refactor that
follows will have no baseline. Record surprises as findings for the user
to decide on, and pin the current behavior anyway.

Expected values come from running the code and reading the result, then
committing to that literal — never from re-deriving it with the same
logic the code uses. A test that computes its own expectation passes by
construction and pins nothing.

## Choose seams, then choose battles

Tests land at seams — public interfaces where behavior is observable
without reaching inside; the deep-modules skill holds the vocabulary.
Where no seam exists, the smallest possible change that creates one (an
injected dependency, an extracted function) is part of the work, and it
is the *only* production change permitted before the tests are green.

Effort is finite, so it goes where risk is: the code about to be
changed, the code everyone is afraid of, the paths that handle money,
auth, or data. A coverage number is a symptom the user may have been
handed, not the goal — the goal is that the change they are about to
make would be caught if it broke something. Say so when the two
diverge, and cover the risk.

## Prove each test can fail

A test that has only ever passed is a hope. For each one, break the
behavior it claims to pin — flip a condition, return the wrong branch,
off-by-one the boundary — run the test, confirm it fails for that
reason, and restore the code. A test that stays green through the break
is either at the wrong seam or asserting the wrong thing; fix the test,
not the break.

## Boundaries

- New behavior built test-first, with the test written before the code,
  is `tdd`. Once the retrofit is done, further work on the module can
  proceed that way.
- A test that already exists and fails is a debugging question
  (`diagnose-bugs`), not a coverage one.
- Where a seam has to be created, keep the production change minimal
  and behavior-preserving; a larger reshaping of the interface is
  `deep-modules`' job and waits until the tests hold.

## Verify before returning

Every new test passed on first run and was then observed failing under a
deliberate break and passing again after the restore. Production code
changed only where a seam had to be created, and the full suite is green.
Any behavior that looked wrong is listed for the user as a finding, and
is pinned as-is until they decide.
