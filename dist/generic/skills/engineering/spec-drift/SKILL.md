---
name: spec-drift
description: >-
  Compares checked-in specifications with implemented behavior and reports
  evidence-backed discrepancies. Use when the user says "does the code match
  the spec", "find drift from our design docs", or "which documented promises
  are missing". Not for reviewing a proposed design, generated-file checks,
  or rewriting a README.
license: Apache-2.0
metadata:
  skillsmith-invocation: both
  skillsmith-maturity: experimental
user-invocable: true
---

# spec-drift

*Adapted from google/elephant-goldfish-model — egm-drift-report (Apache-2.0).
Changed to compare behavioral contracts with scoped evidence, distinguish planned
work and uncertainty, and leave remediation decisions explicit. See repo-root
NOTICES.md and references/egm-LICENSE.txt.*

Compare a specification, design directory, or documented contract with the code
that implements it. Return discrepancies the maintainer can investigate or fix,
with enough evidence to distinguish stale documentation from missing behavior.
The review itself does not authorize changing either side.

## Establish the comparison

Use the documents and repository revision named by the user. Otherwise locate
likely specs in the checkout and state the selected scope. Ask only when competing
documents or revisions would change which contract governs. Record document status:
accepted/current, draft, superseded, or unknown. Respect explicit rollout stages and
future work; a proposal is not automatically a promise at the current revision.

Extract checkable claims: public interfaces, fields and defaults, state changes,
errors, side effects, configuration, compatibility, and operational limits. Preserve
qualifiers such as "after rollout" or "only when enabled". Identify the governing
document when sources disagree; otherwise report a contract conflict, not a code bug.

## Trace claims into behavior

For each material claim, locate its implementation and follow callers, adapters,
configuration and tests far enough to establish the behavior. Search by public names
and behavior as well as the documented filename; renamed or moved code can satisfy
the same contract. A failed text search alone does not prove a missing feature.

Compare observable semantics, not private helper names or suggested libraries unless
the document makes those choices binding. Separate missing or changed behavior,
stale documentation, and conflicting contracts. Undocumented internals are not
automatically drift. For ambiguous cases, open
[references/comparison-examples.md](references/comparison-examples.md).

Run focused, safe checks when they resolve an uncertainty. Keep source inspection,
test results, and deployed behavior distinct. If credentials, infrastructure, build
flags, or unavailable dependencies prevent verification, mark the claim unverified
and name the missing evidence. Do not infer production behavior from a mock.

## Deliver an actionable report

Rank discrepancies by their effect on users, compatibility, data, or operations.
For each finding give the documented claim and location, implementation evidence
and location (including the search boundary for absence), consequence, confidence,
and the decision needed: restore behavior, correct the document, or resolve the
contract. Do not assume either side is authoritative merely because it is newer.

Finish with coverage: documents and revision inspected, matched claims summarized,
planned exclusions, and unverified claims. State "no drift found in the inspected
scope" only when that scope has no evidenced discrepancy; keep verification gaps
visible. Return the report in the requested format, or inline by default. If fixes
were also requested, apply authorized changes and recheck the affected claims.
