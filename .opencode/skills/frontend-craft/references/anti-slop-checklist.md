# Anti-slop checklist

*Adapted from Leonxlnx/taste-skill (MIT); see repo-root NOTICES.md.*

Two lists. The **banned defaults** are patterns to refuse unless the brief
positively calls for them. The **pre-flight checklist** is the pass to run
before delivering. Neither is aesthetic dogma — each item is a default that
reads as generated, paired with the crafted alternative.

## Banned defaults → crafted alternative

| Default (the tell) | Why it reads as generated | Crafted alternative |
|---|---|---|
| Centered hero: headline + subhead + two buttons over a gradient | The single most-produced AI layout | Composition motivated by the brief — asymmetry, a real product visual, an editorial split |
| Three equal feature cards in a row | Reflexive grid, no hierarchy | Unequal emphasis, alternating rows, or a structure the content actually needs |
| Purple/blue diagonal gradient background | The default "tech" gradient | A considered palette; if a gradient, one with intent and restraint |
| System font stack (or Inter everywhere) by default | No typographic decision was made | A typeface chosen for the voice, with a real type scale |
| Default framework drop shadow on everything | Flat elevation, no system | A deliberate elevation ramp; shadows that encode real depth |
| Emoji as bullets or section markers | Decorative filler | Typographic hierarchy, or icons from a real set used consistently |
| Hand-rolled SVG "logos" and icon grids | Meaningless visual noise | A consistent icon set; cut icons that carry no information |
| Equal whitespace everywhere | No rhythm, no emphasis | A spacing scale that creates hierarchy and grouping |
| Every section full-width and centered | Monotone rhythm | Vary container width and alignment to pace the page |
| Lorem-ipsum-shaped real copy ("Empower your workflow") | Says nothing | Specific copy; if voice matters, apply the brand-voice discipline |

## Pre-flight checklist

Run before delivering. Group by concern.

**Brief traceability**
- [ ] Audience, purpose, and emotional target are stated.
- [ ] The three dials (variance, motion, density) are set and named.
- [ ] The hero composition cites a brief line, not a default.

**Typography**
- [ ] Typeface chosen with intent; not the framework default by omission.
- [ ] A type scale is in use (not ad hoc font sizes).
- [ ] Line length is readable (~45–75 characters for body).

**Layout and spacing**
- [ ] A spacing scale governs rhythm; whitespace creates hierarchy.
- [ ] Feature/benefit sections have hierarchy, not an equal-card grid.
- [ ] Container widths and alignment vary to pace the page.

**Color and elevation**
- [ ] Palette is deliberate; no default tech gradient by reflex.
- [ ] A single elevation system; shadows encode depth, not decoration.

**Motion**
- [ ] Every animation directs attention or expresses brand.
- [ ] `prefers-reduced-motion` is respected.
- [ ] No motion added purely because motion was possible.

**Accessibility (part of done)**
- [ ] Text/background contrast meets WCAG AA (4.5:1 body, 3:1 large).
- [ ] Visible focus states on every interactive element.
- [ ] Semantic structure (headings in order, landmarks, alt text).
- [ ] Interactive targets are large enough to hit on touch.

**Content**
- [ ] Copy is specific, not filler; every element justifies its presence.
- [ ] Empty, loading, and error states are considered where relevant.
