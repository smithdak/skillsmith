---
name: "frontend-craft"
description: "Designs and builds high-craft web UI that does not read as machine-generated: infers the brief, sets explicit variance/motion/density dials, and forbids the generic defaults that mark AI-built pages. Use this skill when the user says \"build a landing page\", \"design a hero section\", \"make the page you're building feel crafted, not AI-generated\", or is generating new marketing, portfolio, or product-site frontend. Not for backend or data work, polishing or upgrading UI that already exists (frontend-redesign), or diagrams inside technical docs."
license: "MIT"
metadata:
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
  skillsmith-see-also: "frontend-redesign, doc-visuals, brand-voice"
---

# frontend-craft

*Adapted from Leonxlnx/taste-skill (MIT); see repo-root NOTICES.md.*

AI-built UI has a tell: it reaches for the same defaults every time — a
centered hero over a purple gradient, three equal feature cards, a system
font, a default drop shadow, emoji bullets. Each default is individually
harmless and collectively the reason the page looks generated. The craft is
not adding flourish; it is making every visual choice traceable to the
brief, so nothing on the page is there merely because it was the path of
least resistance.

## Read the brief before generating

Design is a response to a brief, so infer the brief first — even when the
user gave only "build a landing page." State, in a sentence each: the
**audience** (who reads this and what they already know), the **purpose**
(the one action or belief the page is for), and the **emotional target**
(what it should feel like — authoritative, playful, precise, warm). Every
later choice cites one of these. A page with no stated emotional target
defaults to none, which is how it ends up generic.

## Set the dials explicitly

Fix three parameters from the brief, and let them govern the concrete
choices rather than deciding each element ad hoc:

- **Design variance** — how far from convention. Low for a bank or a gov
  service (familiarity is trust); high for a portfolio or a launch (novelty
  is the point). Variance sets how much the layout may deviate from the
  expected pattern.
- **Motion intensity** — none, restrained, or expressive. Motion earns its
  place by directing attention or expressing brand; motion for its own sake
  is noise and a performance cost. Respect `prefers-reduced-motion`.
- **Visual density** — airy, balanced, or dense. A data product tolerates
  density a marketing page does not. Density sets spacing scale and how much
  lands above the fold.

State the three settings before building. They are the difference between a
deliberate design and an averaged one.

## Refuse the defaults

Named generic patterns are banned unless the brief positively calls for
them. The full list with the crafted alternative for each is in
[references/anti-slop-checklist.md](references/anti-slop-checklist.md); the
ones that matter most:

- **The default hero** — centered headline, subhead, two buttons, over a
  gradient. Vary the composition: asymmetry, a real product visual, an
  editorial layout — something the brief motivates.
- **Three equal feature cards** — the reflexive grid. Use hierarchy: unequal
  emphasis, alternating rows, or a different structure entirely.
- **System-font-and-default-shadow** — pick a typeface with intent and a
  real elevation system. Type and spacing are 80% of perceived craft.
- **Decorative filler** — emoji bullets, meaningless icon grids,
  hand-rolled SVG "logos." Every element justifies its presence or is cut.

Ground the positive choices in real systems — established type scales,
spacing ramps, and accessible color relationships — rather than framework
defaults. Borrow the discipline of a real design system even when not using
one.

## Boundaries

- Scope is marketing, landing, portfolio, and product-site UI. Not backend,
  not data pipelines, not internal admin tools where convention is a
  feature.
- Craft is not maximalism. Restraint is a valid, often correct, setting of
  the dials — a stark editorial page is high-craft.
- Accessibility is not optional polish: contrast, focus states, reduced
  motion, and semantic structure are part of "done," not additions to it.

## Verify before returning

The response states the inferred audience, purpose, and emotional target;
names the three dial settings; and every banned default that appears is
there because the brief called for it, not by reflex. Run the pre-flight
checklist in the reference before delivering. A page that passes but cannot
say which brief line justified its hero has not been designed, only
assembled.
