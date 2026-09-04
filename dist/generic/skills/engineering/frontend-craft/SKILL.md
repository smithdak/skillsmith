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

AI-built UI has a tell: trained on the same templates, it ships the
same handful of looks regardless of subject — Inter as display,
purple-to-blue gradients, icon-tile card grids, gray text on colored
ground. Craft is not decoration; it is every visual choice traceable
to this product and this brief, so nothing is present because it was
the path of least resistance. The full ban list lives in
[references/anti-slop-checklist.md](references/anti-slop-checklist.md);
the workflow below keeps you out of it by construction.

## Name the mode before anything else

The visitor's success defines the design criteria — pick one:

- **Persuade** — the visitor decides and acts. Landing pages,
  marketing, pricing. Design is the product: earn attention, expose
  the action, prove something only this product can.
- **Operate** — the visitor completes a task. App UI, dashboards,
  settings. Scanability and consistency outrank expression; brand
  lives in precise details.
- **Read** — the visitor understands something. Docs, guides,
  articles. Structure for comprehension first, then make reading
  worth staying in.
- **Experience** — the visitor is inside the work itself. Portfolios,
  showcases. The artifact leads from the first viewport; chrome
  recedes.

Pick the mode from the *surface*, not the company: a tool's landing
page is still Persuade; a fashion house's docs are still Read. State
the mode in one line before designing.

## Read the brief, then obey it

Infer what the user gave only "build a page": audience, purpose,
emotional target, one sentence each. **A pinned brief wins over every
default in this skill** — pinned eras, palettes, faces, and materials
stand even when a rule here would flag them. Redirecting a clear
brief toward your own taste is failure. Where the brief is silent,
you decide — deliberately, never by category habit.

## Commit to one visual world

Before picking colors, pick the **color strategy**: Restrained
(neutrals + one accent — right for Operate/Read), Committed (one
saturated color carries 30–60% of the surface), Full palette (3–4
named roles), or Drenched (the surface *is* the color). Persuade and
Experience earn the bolder end when the brief allows. Color commits
at page scale — fields that own whole regions, not accents scattered
over neutral ground. Dark or light is chosen from the use scene (who,
where, under what light), never defaulted.

Typefaces are objects from the subject's world, picked for character:
a display face with a point of view for Persuade/Experience;
workhorse UI faces serve Operate/Read honestly. The reflex-face list
(Fraunces, Playfair Display, Inter-as-display, Space Grotesk, DM
Sans, Outfit…) marks faces so training-common that naming one needs a
reason no other face satisfies — "books want a serif" is not a
reason. Self-host or source the face whose lettering fits; reaching
for the closest installed system face as display voice is failure.

## Run the calibration self-check

AI interfaces cluster into recognizable looks regardless of subject:
warm cream ground + serif display + terracotta accent; near-black +
one neon accent + glowing edges; broadsheet hairlines + italic serif
+ tracked mono labels. All are legitimate *when the brief calls for
them*; where the brief leaves aesthetics free, landing in one means
the self-check failed. Test: could someone guess this aesthetic from
the category alone, or from category-plus-avoidance? If yes, rework
until neither answer is obvious — rework the rendition, not the
committed world.

For greenfield content, **truth binds claims, not demonstrations**:
author illustrative material at full fidelity, label synthetic
material where a visitor could mistake it, list what must be replaced
with real assets — and never invent prices, customers, benchmarks, or
capabilities the product does not have.

## Write the direction contract

Before code, state the design as five short blocks (~150 words),
placed as an HTML comment at the top of the artifact where the build
preserves it:

```
THESIS: the one idea this surface owns — and the category-default
        arrangement it refuses.
WORLD: palette + component language, recognizable with all
       content removed.
STORY: what the visitor understands, believes, and does.
FIRST VIEWPORT: the exact composition — what sits where, at what
        scale, where the primary action lands.
FINISH: unreviewed is unfinished — this build ends with a batched
        inspection pass against this contract.
```

A block that reads like a mood means the direction is not decided
yet. The finish pass audits the render against these lines.

## Build to the craft floor

The mechanics no design survives failing — verify on the rendered
result, not intentions:

- **Contrast:** body ≥4.5:1, large text ≥3:1. Secondary text on a
  colored surface tints from that hue — never gray.
- **Depth:** shadows carry offset and blur; zero-offset colored halos
  are decoration, and one elevation system governs the page.
- **Type:** body measure 65–75ch, obvious scale steps, real copy at
  every breakpoint with overflow fixed.
- **Motion:** one authored moment per page, exponential ease-out from
  a visible default; reach past transform/opacity (blur, clip-path,
  mask) when smooth; respect `prefers-reduced-motion`.
- **States:** hover, focus-visible, disabled, loading, error, empty —
  plus keyboard reachability and touch-sized targets.
- **Browser surfaces:** theme text selection, caret, scrollbars,
  focus rings, underline offset, tabular numerals. They ship with
  defaults belonging to no design system; theming them is the
  cheapest signal a page was built rather than assembled — and the
  step models skip most reliably.

## Verify in bounded passes, then stop

Build fully, inspect once — desktop and mobile screenshots together
in one batched round — fix everything that round shows in one batch,
confirm with at most one more round, and stop polishing. Open-ended
self-QA burns the session doing worse what a final review does better.
Run `python scripts/slop-detector.py <files-or-dir>` once before
delivering (exit 1 = hits; waive a deliberate pattern inline with
`<!-- slop-ignore: <rule-id> -->`): it deterministically catches the
highest-signal slop patterns in markup/CSS; act on its hits, and treat
a clean run as necessary, not sufficient.

## Boundaries

- Scope is marketing, landing, portfolio, product-site, and new
  surface UI. Upgrading an existing interface is frontend-redesign;
  reviewing a finished one is frontend-critique; browser behavior
  verification is webapp-testing's.
- Craft is not maximalism: restraint is a valid dial setting, and an
  Operate surface done plainly-but-perfectly is high craft.
- Accessibility is part of done, never polish added after.
