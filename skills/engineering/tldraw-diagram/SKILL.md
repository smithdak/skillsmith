---
name: tldraw-diagram
description: >-
  Generates a tldraw canvas file (.tldr / .tldraw JSON) from a described
  diagram or outline — boxes, arrows, text, frames, and notes positioned on
  the infinite canvas — so it opens directly in tldraw or tldraw-offline as
  editable shapes, with no browser or render step. Use this skill when the
  user says "make me a tldraw diagram", "generate a .tldr file", "turn this
  architecture into a tldraw whiteboard", "build an editable canvas of this
  flow", or wants a hand-editable tldraw document rather than a flat image.
  Not for rendering a canvas to PNG/SVG (that needs a browser — see
  tldraw-export), converting Mermaid source (see mermaid-to-tldraw), or
  authoring Mermaid/Graphviz text diagrams.
license: MIT
metadata:
  skillsmith-see-also: "doc-visuals, mermaid-to-tldraw, tldraw-export"
  skillsmith-invocation: "user"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# tldraw-diagram

A `.tldr` file is just JSON. It has three top-level keys —
`tldrawFileFormatVersion` (a number, currently `1`), `schema` (a
`SerializedSchema`), and `records` (an array of records) — and the MIME type
`application/vnd.tldraw+json`. Because the whole document is data, a diagram
can be authored as records and dropped straight into tldraw or tldraw-offline
as editable shapes. No canvas, browser, or render step is involved. That is
the entire premise of this skill: emit records, not pixels.

Only the **document** records matter for a file — shapes, pages, and bindings.
Camera, selection, and UI state are per-user session state that tldraw
regenerates on open, so a generated file can omit them.

## The one rule that keeps files loadable

tldraw's record schema is versioned and drifts between SDK releases; a
handwritten record with a missing or renamed prop will fail to load silently.
So never invent the schema from memory. Anchor to a real export:

- Ask the user to open tldraw / tldraw-offline, draw one of each shape the
  diagram needs (a box, an arrow, a text label, a frame), and **Save / Export
  as `.tldr`** — or paste the output of `editor.getSnapshot()`.
- Use that file as the template. Copy its `schema` block verbatim and match its
  record shapes exactly, changing only positions, text, and ids.

If no export is available, generate against the skeleton in
[references/tldr-format.md](references/tldr-format.md) and tell the user it
targets the current tldraw v3 format and may need a re-save if their version
differs. Treat that as a fallback, not the default path.

## Author the records

1. **Lay out before emitting.** Decide x/y for every node on a grid so nothing
   overlaps and flow reads left-to-right or top-to-bottom. tldraw units are
   pixels; a readable box is ~200×100 with ~80px gaps. Group related nodes
   inside a `frame` shape when the diagram has sections.
2. **One page unless asked.** Put every shape under a single `page:` parent via
   `parentId`. Use additional page records only when the user wants tabs.
3. **Ids are stable strings.** `shape:`, `page:`, `binding:` prefixes, unique
   within the file. Reference them consistently (an arrow binding points at the
   exact `shape:` id of its endpoints).
4. **Arrows connect via bindings, not coordinates.** An arrow that should stay
   attached when a box moves needs a `binding` record (`type: "arrow"`,
   `fromId` = the arrow, `toId` = the shape) per endpoint — not just start/end
   points. Match how the exported sample encodes them.
5. **Text lives on shapes.** A labeled box carries its label in the geo shape's
   `props.text`; use a standalone `text` shape only for free-floating labels.

## Verify before handing off

- The file parses as JSON and keeps the three top-level keys.
- Every `parentId` and every binding `fromId`/`toId` resolves to a real record
  id in the file — dangling references are the most common load failure.
- Confirm it opens: the user drags the `.tldr` into tldraw, or loads it with
  `parseTldrawJsonFile()` / `loadSnapshot()`. If it opens with shapes in the
  right places and arrows attached, it is done. When the `tldraw-offline` agent
  skill is available, hand off to it to open the generated file and refine the
  layout live rather than re-editing the JSON by hand.
- Report what was generated: shape count, page count, and any endpoint that had
  to fall back to fixed coordinates because a binding target was ambiguous.
