---
name: prose-hygiene
description: >-
  Trims comments, JSDoc, and docs of session narration — "this PR adds", "used
  to / no longer", dead citations — so each fact stands at HEAD. Use when the
  user says "clean up the comments before we merge", "strip the history talk
  from the docs", or docstrings read like a PR description. Not for diagrams
  (doc-visuals), splitting a doc (information-architecture), or
  self-containment (cold-read).
license: MIT
metadata:
  skillsmith-see-also: "doc-visuals, information-architecture, readme-authoring, cold-read"
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# prose-hygiene

*Adapted from deepseek-ai/deepseek-harness — dsh-trim-cot-leakage and dsh-prose-standard (MIT); see repo-root NOTICES.md.*

Make comments and current-state documentation understandable at the current
revision without losing facts a caller or maintainer needs.

## Preserve the proposition

For a suspect passage, identify its behavior, conditions, ordering, ownership,
side effects, failure modes, exceptions, and obligations. Those facts survive
the edit. Remove session narration and repetition; do not weaken “must” to
“may,” erase a negative guarantee, or invent certainty to shorten a sentence.

Keep the local contract near its use and link to the owner of broader rationale.
A change story belongs in a changelog or decision history unless the surface is
itself historical. A resolvable reference can be valid even when it sounds old.

Before cutting ambiguous cases, use
[references/keep-rules.md](references/keep-rules.md). Preserve suppression
reasons, external standard citations, observed bounds, runtime old/new state
transitions, and intentional decision or incident histories.

## Inspect the requested scope

Infer scope from named files, the active diff, or the user's specific request;
ask if a materially different interpretation remains. Exclude generated,
vendored, archived, and recorded fixture content unless explicitly in scope.

Run [scripts/recall-batteries.sh](scripts/recall-batteries.sh) from its installed
location with the target scope. Treat hits as candidates, then read surrounding
prose. The script deliberately overmatches and cannot find every issue. If it
cannot run, inspect the prose directly and state that limit.

Typical candidates are dead session labels, PR-relative explanations, review
choreography, stale version narratives, and comments repeating obvious code.
Replace a dead citation with the actual owner when one exists; preserve the
useful claim. [references/coverage-by-location.md](references/coverage-by-location.md)
explains what different documentation surfaces need to retain or add.

## Apply and verify

Audit-only requests produce findings; cleanup requests authorize appropriate
edits. Change generated content through its source. Treat model-visible prompts
as behavioral changes requiring separate evidence rather than casual rewording.

Compare each edit with its original propositions and verify retained links.
Use judgment for reversible wording choices; ask only when the meaning cannot
be resolved. Report scope, material changes, intentional keeps, and checks.
Structure belongs to information-architecture, visuals to doc-visuals,
self-containment to cold-read, and full README work to readme-authoring.
