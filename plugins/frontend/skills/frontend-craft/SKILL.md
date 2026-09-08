---
name: frontend-craft
description: >-
  Builds new web UI with real visual character, not the generic
  AI-template look. Use when the user says "build a landing page", "design
  a hero section", "doesn't look AI-generated", or is starting a
  marketing, portfolio, or product site. Not for upgrading existing UI
  (frontend-redesign), scored design review (frontend-critique), writing
  the copy, or diagrams in docs (doc-visuals).
license: MIT
metadata:
  skillsmith-see-also: "frontend-redesign, frontend-critique, webapp-testing, doc-visuals"
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# frontend-craft

*Adapted from Leonxlnx/taste-skill (MIT) with design-language concepts
from pbakaus/impeccable (Apache-2.0); see repo-root NOTICES.md.*

Build a new interface whose composition supports this product and brief. The
user's visual direction, existing design system, and accessibility needs govern
choices. Distinctiveness is useful when it strengthens comprehension or intent.

## Choose the direction

Infer the audience, primary action, and use scene from the brief. Distinguish
persuasion, operation, reading, and showcasing: a dashboard needs task clarity;
a portfolio may let the work dominate. Resolve consequential ambiguity without
turning a simple request into a design interview.

Choose a coherent palette, typography, spacing, and component language. State
the design idea and first-viewport composition briefly enough to guide the
build. Keep this working note out of shipped markup unless the project needs
it. Use real content lengths. Illustrative material must be identifiable where
it could be mistaken for actual customers, prices, capabilities, or results.

Avoid falling back to the same hero, card grid, and color treatment for every
subject. [references/anti-slop-checklist.md](references/anti-slop-checklist.md)
is a diagnostic aid, not an override of the brief. An existing font or a plain
layout can be the right choice; novelty alone does not justify changing it.

## Implement the complete surface

Use the project's stack and conventions. Build the primary task, responsive
layout, keyboard interaction, focus visibility, and relevant empty, loading,
error, and disabled states. Preserve semantic structure and adequate contrast.
Check overflow with real copy at small and large widths. Motion needs a purpose
and must respect reduced-motion preferences; omit it when unnecessary.

Example: a pricing page should make plan differences and the next action easy
to compare. Decorative variety does not compensate for hidden limits or an
unclear purchase action.

## Inspect and finish

Inspect rendered desktop and mobile states together, fix observed issues, and
repeat only where changes or unresolved failures warrant it. Use the
webapp-testing discipline when browser tools are available; report the specific
rendering limits if they are not. Reading source is not visual verification.

Run the bundled [scripts/slop-detector.py](scripts/slop-detector.py) against
touched files using its installed path. Hits are review candidates; justified
choices can use the documented inline waiver. A clean scan does not establish
usability or visual quality.

Report implemented behavior, rendering checks, and missing real assets.
Existing-surface work belongs to frontend-redesign; assessment without fixes
belongs to frontend-critique, and technical document diagrams to doc-visuals.
