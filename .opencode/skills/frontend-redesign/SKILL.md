---
name: "frontend-redesign"
description: "Upgrades the craft of an existing web UI without a rewrite: the smallest changes that raise quality, behavior and identity preserved. Use when the user says \"improve how this looks\", \"audit this UI\", \"clean up this page's design\", or has a live UI that works but feels dated. Not for building a new page (frontend-craft), review without fixes (frontend-critique), backend work, or code correctness."
license: "MIT"
metadata:
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
  skillsmith-see-also: "frontend-craft, frontend-critique, webapp-testing, doc-visuals"
---

# frontend-redesign

An existing UI is a constraint, not a blank page — and also an
*evidence source*: the incumbent code is the most honest record of
what this product's identity actually is. The discipline is to derive
that system from the code first, diagnose against it, and raise craft
through the smallest changes that move quality. Two failure modes
bracket the skill: the sweeping rebuild that regresses behavior nobody
asked to change, and the timid polish that never touches what makes
the page feel assembled.

## Refinement preserves; redesign replaces

Decide which job this is before touching anything:

- **Refinement** (the default) keeps the incumbent identity,
  behavior, copy, and everything outside scope. It fixes execution:
  contrast, spacing rhythm, type scale, states, alignment.
- **Redesign** keeps product truth, content, and function, but treats
  the old look as *evidence of what the subject is*, not authority
  over what it becomes — and replaces the visual world wholesale.
  Reserve this for when the user says "redesign", and confirm once.

Never split the difference: polish layered onto a look the user asked
to replace produces the worst of both. A section or component inside
an established surface inherits that surface — a local addition never
becomes its own identity exercise.

## Document the incumbent system first

Diagnosing from memory invents a fictional baseline. Read the real
one out of the code: tokens/theme files, the type scale actually in
use, spacing values, the palette with its real roles, elevation
patterns, component inventory, one representative screen per major
surface. Write the system down in five lines before judging anything —
this is redesign's version of ground truth, and later findings cite
it ("the 4px/24px rhythm exists but is violated on every card").

## Diagnose against three axes

1. **Craft defects** — measured against the audit checklist
   ([references/audit-checklist.md](references/audit-checklist.md)):
   contrast failures, missing states, broken rhythm, unthemed browser
   surfaces, overflow. Each defect records what is wrong, why it
   lowers craft, and the smallest change that fixes it.
2. **Design specificity** — could an unrelated product use this
   interface unchanged? Category-interchangeable choices (the same
   hero, cards, and palette any competitor ships) are a finding even
   when individually flawless. Name which elements carry product
   character and which are furniture.
3. **Cognitive load** — decision points with more than four visible
   options, redundant confirmations, buried primary actions.

Rank by impact-per-effort; typography and spacing usually top the list
— they carry most perceived craft at lowest risk. Distinguish a
genuine defect from a deliberate choice that differs from your taste:
taste disagreements are not findings.

## Fix in ranked order

Apply changes smallest-effective-first, one concern at a time so each
is reviewable:

- Prefer token adjustments (type scale, spacing ramp, color, elevation)
  over markup restructuring — a scale fix improves every screen at once.
- Preserve behavior, routes, content, and accessibility. A visual
  upgrade that lowers contrast, drops focus states, or breaks
  semantics has exceeded its remit.
- Where a piece genuinely needs new composition rather than repair,
  hand that piece to frontend-craft instead of smuggling greenfield
  work into a refinement pass.
- Run `frontend-craft/scripts/slop-detector.py` over touched files as
  a final mechanical sweep.

## Boundaries

- Non-destructive by default: working structure, behavior, and content
  stay unless the user explicitly asked for replacement.
- Not a correctness or security pass — those run separately.
- Fewer, higher-impact changes beat a sweeping diff. Stop when the
  floor is raised, not when the page is unrecognizable.

## Verify before returning

The output names the derived system, states refine-vs-replace up
front, lists diagnosed findings across all three axes each with its
minimal fix, and orders fixes by impact-per-effort. Applied changes
preserved behavior and did not regress accessibility. The detector ran
over touched files and every remaining hit is either fixed or an
incumbent-identity choice recorded in the findings and waived inline
with `slop-ignore: <rule-id>` — a refinement pass does not strip the
display face the product already owns. A "redesign" that rewrote what was asked to
be refined — or a refinement that left the specificity findings
unspoken — has done a different job than the one asked for.
