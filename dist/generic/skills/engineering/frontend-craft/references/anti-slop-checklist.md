# Anti-slop checklist

*Adapted from Leonxlnx/taste-skill (MIT) with ban-list and calibration
concepts from pbakaus/impeccable (Apache-2.0); see repo-root NOTICES.md.*

Three lists. **Banned defaults** are patterns to refuse unless the
brief positively calls for them. **Reflex tells** are subtler habits
that mark assembled-not-designed work. The **pre-flight checklist** is
the pass to run before delivering. None of it is aesthetic dogma — a
brief's own words can earn any pattern back; reaching for one when the
axis is free means you were not deciding.

## Banned defaults → crafted alternative

| Default (the tell) | Why it reads as generated | Crafted alternative |
|---|---|---|
| Centered hero: headline + subhead + two buttons over a gradient | The single most-produced AI layout | Composition motivated by the brief — asymmetry, a real product visual, an editorial split |
| Three equal feature cards: icon tile + heading + text | The reflexive page scaffold; cards are the lazy container | Unequal emphasis, alternating rows, or the structure the content actually needs |
| Cards nested inside cards | Always wrong; hierarchy by boxing | Separate the levels — whitespace, rules, or one containing surface |
| Hero-metric template: big number, small label, supporting stats | Dashboard costume on a marketing page | The metric rendered in the product's own visual language, or cut |
| Eyebrow/kicker label above every heading | The most-copied template tell; pure ornament | Delete it — let the heading carry its own weight |
| Section numbers (01 / 02 / 03) as decoration | Template scaffolding | Keep numbering only when the sequence itself informs |
| Gradient text for emphasis | Reads as generated on sight | Emphasis from weight or size |
| Glassmorphism/blur as default decoration | Effect without a reason | Blur only when it does something specific (legibility over media, depth cue) |
| Colored side-stripe borders (>1px) on cards/callouts | The alert-box cliché | Full-surface tint, an icon, or typography carries the signal |
| Hard offset shadows (`4px 4px 0`) outside real neobrutalism | A costume depth system | An elevation ramp with offset + blur that encodes actual hierarchy |
| Emoji or unicode glyphs standing in for icons | No icon system was chosen | Icons drawn from one set or authored SVG, consistent stroke and weight |
| Monospace as a "technical" costume (not code/data/measurement) | Category cosplay | Mono where monospace is functionally true |
| System display face (Inter, Arial Black, platform sans) as display voice | No typographic decision made | A sourced face whose character fits the world |
| Geometric masks approximating photo edges (circle/polygon cutouts) | The cheap version of cut-outs | Derive an alpha matte from the image, or ship the rectangle honestly |
| Modal for tasks needing neither interruption nor protected focus | Reflex chrome | Inline flows; reserve modals for real focus protection |

## Reflex tells

- Same-size card grids as the *page structure* (vs one deliberate row)
- Sparklines and progress rings standing in for content
- Light/dark theme picked by category instead of use scene
- One identical entrance animation on every section
- `repeating-linear-gradient` stripes or grid overlays with no canvas,
  map, blueprint, or measuring tool under them
- Sketch-style SVG illustration scenes and `feTurbulence` grain — SVG
  doing geometry (diagrams, linework) remains first-class
- Naming a concept in copy and ironizing it instead of claiming it

## Saturated looks — the calibration test

These complete looks are what models converge on regardless of subject:

1. Warm cream ground, high-contrast serif display, terracotta/red accent
2. Near-black ground, one neon accent, glowing edges
3. Broadsheet editorial: hairline rules, italic serif display, tracked mono labels

Legitimate when pinned. When the brief left aesthetics free, landing
in one fails the self-check — rework the rendition until the aesthetic
is not guessable from the category alone.

## Pre-flight checklist

**Direction**
- [ ] Mode named (Persuade / Operate / Read / Experience).
- [ ] Direction contract written: THESIS, WORLD, STORY, FIRST VIEWPORT, FINISH.
- [ ] Color strategy picked (Restrained / Committed / Full / Drenched); dark-or-light justified by scene.
- [ ] Display typeface chosen with a reason no reflex face satisfies.
- [ ] Calibration test passed: aesthetic not guessable from category alone.

**Typography**
- [ ] Type scale obvious; body measure 65–75ch; no text overflow at any breakpoint.

**Layout and spacing**
- [ ] Spacing rhythm: tight groups, generous separation, more space above a heading than below.
- [ ] No identical-card-grid page structure; no nested cards.

**Color, elevation, browser surfaces**
- [ ] Contrast: ≥4.5:1 body, ≥3:1 large; secondary text on colored surfaces tinted, never gray.
- [ ] One elevation system; shadows have offset + blur.
- [ ] Selection, caret, scrollbars, focus rings, tabular numerals themed.

**Motion and states**
- [ ] One authored motion moment; exponential ease-out; reduced-motion respected.
- [ ] Hover, focus-visible, disabled, loading, error, empty states present where relevant.

**Content**
- [ ] Copy specific and in the product's voice; controls name their action.
- [ ] Synthetic material labeled; no invented commercial claims.
- [ ] `slop-detector.mjs` run clean (or every hit consciously resolved).
