---
name: mermaid-to-tldraw
description: >-
  Converts Mermaid diagram source into editable tldraw shapes using tldraw's
  official @tldraw/mermaid package, so a flowchart or graph written as Mermaid
  text becomes real, movable nodes and arrows on a tldraw canvas rather than a
  static image. Use this skill when the user says "convert this mermaid to
  tldraw", "turn my mermaid flowchart into editable tldraw shapes", "import
  mermaid into tldraw", or has Mermaid source they want as a hand-editable
  canvas. Not for authoring Mermaid text itself, rendering Mermaid to an image,
  or building a tldraw file from a prose description (see tldraw-diagram).
license: MIT
metadata:
  skillsmith-see-also: "tldraw-diagram, tldraw-export, doc-visuals"
  skillsmith-invocation: "user"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# mermaid-to-tldraw

tldraw ships an official `@tldraw/mermaid` package that turns Mermaid source
into tldraw shapes — the same engine behind tldraw's "paste Mermaid" feature.
It exposes `createMermaidDiagram` plus helpers (`renderBlueprint`,
`mapNodeToRenderSpec`) for mapping graph nodes onto custom shapes. Using it
means the diagram arrives as editable nodes and arrows, not a flattened image,
and the layout is computed for you.

## The constraint that shapes the whole approach

The conversion renders Mermaid to an SVG in an **offscreen DOM element**, so it
needs a browser/DOM environment — it does not run in plain headless Node. That
makes this a "scaffold and run in a page" skill, not a pure data transform.
Pick the path that fits the user's setup before writing code; see
[references/mermaid-package.md](references/mermaid-package.md) for the exact API
surface, install, and the pitfalls.

## Choose the run environment

- **Inside a tldraw / tldraw-offline app the user already runs** — the cleanest
  path. Wire `createMermaidDiagram` to the editor and feed it the Mermaid
  string; the shapes land on the live canvas. tldraw-offline can also run raw
  JavaScript against its `editor` object directly. If the `tldraw-offline`
  agent skill is available, hand the desktop-app driving to it — it opens the
  file and scripts the canvas — instead of reimplementing app control here.
- **A throwaway Vite/browser project** — when the user just wants a `.tldr` out.
  Scaffold a minimal page that mounts a headless editor, calls the package, then
  `getSnapshot()` → write the `.tldr`. Note the DOM requirement means Playwright
  or a real browser tab, not `node script.js`.

State which path you are taking and why, so the user knows whether they need a
running app or a browser build.

## Convert

1. **Validate the Mermaid first.** Malformed source is the most common failure;
   confirm it renders in a Mermaid live editor or matches a known-good grammar
   before wiring conversion. Only `flowchart`/`graph` families map cleanly to
   shapes — call out sequence/gantt/class inputs, whose support is narrower.
2. **Run the package, don't reimplement it.** Call `createMermaidDiagram` on the
   source; let it own parsing, layout, and shape creation. Reach for
   `mapNodeToRenderSpec` only when the user wants nodes mapped to custom shapes
   (specific colors, geo types, or a design system).
3. **Capture the result** as live shapes (app path) or a `.tldr` via
   `getSnapshot()` (build path).

## Verify before handing off

- The node and edge counts on the canvas match the Mermaid graph — a dropped
  edge usually means an unsupported Mermaid feature; name it rather than
  shipping a silently-incomplete diagram.
- Arrows connect the intended nodes and the layout is readable (no overlaps).
- If a `.tldr` was produced, confirm it opens in tldraw with shapes intact —
  hand off to tldraw-export only if the user then wants an image.
- Report the package version used and any Mermaid constructs that did not
  convert.
