---
name: "doc-visuals"
description: "Crafts the visual layer of technical docs — directory trees, mermaid diagrams, code blocks, tables — so structure lands at a glance and survives rendering. Use when the user says \"add a diagram\", \"the repo map is hard to read\", \"make this README scannable\", or a diagram renders broken. Not for prose (prose-hygiene), splitting content (information-architecture), or self-containment (cold-read)."
license: "MIT"
metadata:
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
---

# doc-visuals

Make the document easier to understand by showing the relationship, comparison,
or result that prose alone makes the reader reconstruct. Visual craft includes
what to omit, where to place the evidence, and how it reads at the destination.

## Choose what deserves attention

Identify the reader's question and the publishing surface: GitHub README, docs
site, exported report, or plain text. Preserve the project's visual identity.
For a page that feels generic or cluttered, use
[references/visual-composition.md](references/visual-composition.md) to establish
hierarchy, choose a proof artifact, and remove competing emphasis.

Choose the representation by what the reader must understand: a diagram for
relationships, a table for decisions across shared attributes, a tree for
navigation, a code example for first use, or a real screenshot for visible UI
behavior. A short sentence can be the best visual edit. Avoid adding a diagram
that merely repeats a list of features.

## Build from verified facts

- **Diagrams:** trace the actual boundary, ordering, branch conditions, and
  outputs. Follow [references/mermaid.md](references/mermaid.md) for semantic
  examples and rendering checks. Label edges with data, actions, or conditions
  according to their meaning. Preserve a consequential failure or bypass path.
- **Repository maps:** resolve `scripts/repo-map.sh` from this installed skill
  and pass `<root> [depth]`. Its git mode lists tracked paths; inspect current
  untracked/deleted files too when they matter. Curate the inventory using
  [references/repo-maps.md](references/repo-maps.md); identify edit locations
  and generated output without pretending to show every file.
- **Examples and comparisons:** follow
  [references/code-and-tables.md](references/code-and-tables.md). Supply needed
  setup, distinguish commands from expected output, and make comparisons answer
  a decision. Short sentences in table cells are fine when they scan well.

Introduce an element with the conclusion it helps establish. Give it enough
labels and nearby explanation to remain useful without color or animation.
Use existing authentic assets; do not fabricate screenshots, performance
charts, directory counts, or runtime behavior to make a page look finished.

## Inspect the result

Parse diagrams and render them with the target's supported version when
available. Inspect the rendered page at its normal content width and a narrow
viewport: labels, reading order, crossings, wrapping, cropping, and contrast.
Revise a crowded structure before shrinking text. Check light and dark themes
when the destination supports them. Static source review alone is not a render
check; name that limit when rendering is unavailable.

Verify paths, links, examples, and the represented behavior against evidence.
Run safe local examples when practical; do not perform paid, destructive, or
external mutations merely to verify documentation. Keep verification notes in
the completion message, outside the finished document unless readers need the limitation.

Finish when the reader can identify the important relationship or next action
quickly, and the rendered element supports the same claim as its source.
