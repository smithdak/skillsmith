---
name: "retrofit-tests"
description: "Adds characterization tests to working code that has none: pins current behavior at its seams before it changes, prioritised by risk. Use when the user says \"add tests to this module\", \"get this under test before the refactor\", \"raise coverage on X\", or must change legacy code safely. Not for new code test-first (tdd), a broken test (diagnose-bugs), or browser checks (webapp-testing)."
license: "MIT"
metadata:
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
  skillsmith-see-also: "tdd, deep-modules, diagnose-bugs"
---

# retrofit-tests

Create a safety net around existing behavior before it changes. Characterization
records what the code currently does; it does not prove that every observed
behavior is desirable.

## Select valuable behavior

Inspect the public interfaces and the change being prepared. Prioritize paths
with likely regressions or costly failures, then representative boundary cases.
Use deep-modules' boundary test: observe behavior through the interface while
keeping implementation choices replaceable. A coverage target can guide gaps,
but adding assertions must still protect meaningful behavior.

Run examples to establish current outputs and inspect surprising results.
Record expectations as independent literals or checked fixtures, not a copy
of the implementation's calculation. Label undesirable behavior explicitly;
do not silently bless a vulnerability or defect as the intended contract.
Fixing it remains separate unless already authorized.

## Add the safety net

Prefer existing seams. If a dependency prevents reliable tests, introduce the
smallest behavior-preserving seam needed to control it. Avoid broad production
refactors before characterization protects the affected behavior.

Tests should pass against the observed baseline after setup errors are fixed.
Their first-ever execution need not be green to qualify as characterization.
Use controlled dependencies for nondeterministic or external effects.

## Check sensitivity

For the highest-risk assertions, apply a deliberate behavioral mutation in an
isolated copy or use the project's mutation tooling. Confirm the relevant test
fails, then restore and verify the original behavior. Keep unrelated work safe;
never leave temporary mutations in the user's tree. Expand sensitivity checks
when surviving mutations expose weak coverage.

Run affected tests and required repository checks. Report protected behaviors,
known surprises, and verification limits. Use tdd when introducing new behavior
and diagnose-bugs when investigating an existing failing test.
