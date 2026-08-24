# UI redesign audit checklist

*Adapted from Leonxlnx/taste-skill (MIT); see repo-root NOTICES.md.*

Assess each existing screen against these categories. For every item that
fails, record: the defect, why it lowers craft, and the smallest change that
fixes it. Rank the resulting list by impact-per-effort — typography and
spacing usually offer the highest return for the least risk.

## Typography

- [ ] Is a real type scale in use, or are font sizes ad hoc?
- [ ] Was the typeface chosen with intent, or is it the framework default?
- [ ] Is body line length readable (~45–75 characters)?
- [ ] Is hierarchy clear (heading vs body vs caption distinguishable)?
- [ ] Line height and letter spacing appropriate for the sizes used?

## Color and elevation

- [ ] Is the palette deliberate, or an accumulation of defaults?
- [ ] Is there one elevation system, or inconsistent ad hoc shadows?
- [ ] Do color choices carry meaning (state, hierarchy) or just decorate?
- [ ] Any reflexive default tech gradient that adds nothing?

## Layout and spacing

- [ ] Does a spacing scale govern rhythm, or is whitespace arbitrary?
- [ ] Does spacing create grouping and hierarchy, or is it uniform?
- [ ] Is there structural monotony (everything full-width and centered)?
- [ ] Are reflexive equal-card grids standing in for real hierarchy?
- [ ] Is the layout responsive without breakage at common breakpoints?

## Interactive states

- [ ] Do interactive elements have hover, focus, active, and disabled states?
- [ ] Are focus states visible (not removed for aesthetics)?
- [ ] Are loading, empty, and error states designed, not blank?
- [ ] Is feedback immediate for user actions?

## Content

- [ ] Is copy specific, or filler ("Empower your workflow")?
- [ ] Does every element justify its presence, or is there decorative noise?
- [ ] Are icons from a consistent set and information-bearing?

## Iconography and imagery

- [ ] Consistent icon set, consistent weight and size?
- [ ] Are images real and relevant, or generic stock placeholders?
- [ ] Any hand-rolled SVG filler that carries no information?

## Accessibility (a redesign must not regress these)

- [ ] Text/background contrast meets WCAG AA (4.5:1 body, 3:1 large)?
- [ ] Semantic structure intact (heading order, landmarks, labels)?
- [ ] `prefers-reduced-motion` respected?
- [ ] Touch targets large enough?

## Code quality of the UI layer

- [ ] Are design tokens centralized, so a scale fix propagates everywhere?
- [ ] Is styling consistent (not a mix of competing approaches)?
- [ ] Can a defect be fixed by a token change rather than markup surgery?

## Strategic omissions

- [ ] Is anything on the page that should simply be removed rather than
      restyled? Cutting a weak section often raises craft more than
      polishing it.
