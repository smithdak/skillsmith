# @tldraw/mermaid — API surface and pitfalls

Official tldraw package that converts Mermaid diagrams into tldraw shapes. It is
the engine behind tldraw's built-in "paste Mermaid" behavior. Verify the current
version and exact exports against the npm page and tldraw.dev before wiring code,
as the API stabilized across the 5.x line.

## Install

```sh
npm install @tldraw/mermaid @tldraw/tldraw
```

Pin the `@tldraw/mermaid` version to match the `@tldraw/tldraw` / `tldraw` SDK
version in the project; mismatched majors can produce shape records the editor
rejects.

## Primary exports

- `createMermaidDiagram(...)` — the main entry point. Takes Mermaid source and
  produces tldraw shapes/records for the diagram.
- `renderBlueprint(...)` — lower-level rendering of the intermediate
  representation the package builds from parsed Mermaid.
- `mapNodeToRenderSpec(...)` — hook for mapping a parsed graph node to a custom
  render spec (custom shape type, color, geometry). Use only for bespoke node
  styling; the defaults are fine for a straight import.

The three form a pipeline: parse Mermaid → build a blueprint/IR → render to
tldraw shapes. Let the package own all three stages.

## The DOM requirement (the big one)

The conversion renders Mermaid to an SVG in an **offscreen DOM element**. It
therefore needs a browser/DOM runtime:

- Runs inside any browser context — a live tldraw app, a Vite dev build, or a
  Playwright-driven page.
- Does **not** run under bare `node script.js`. A jsdom shim is unreliable
  because Mermaid's measurement depends on real layout. Prefer a real browser
  (Playwright headless) when a `.tldr` output is needed without a running app.

## Supported diagram types

`flowchart` / `graph` families convert most reliably to node-and-arrow shapes.
Sequence, class, state, gantt, and pie diagrams have narrower or no support —
check the current package docs and, if unsupported, fall back to rendering
Mermaid as an image or authoring the tldraw file directly (tldraw-diagram).

## Getting a .tldr out (build path)

After conversion, snapshot the store and serialize:

```js
import { getSnapshot } from '@tldraw/tldraw'
const snapshot = getSnapshot(editor.store)
const file = {
  tldrawFileFormatVersion: 1,
  schema: snapshot.document.schema,
  records: Object.values(snapshot.document.store),
}
// write JSON.stringify(file) to name.tldr
```

Reconcile the exact envelope against a file the app itself exports — the
snapshot shape is version-sensitive.

## Common failures

- **Nothing renders / empty canvas** — DOM missing; you are in plain Node.
- **Dropped edges or nodes** — an unsupported Mermaid construct. Diff the graph
  against the source and report what was skipped instead of shipping silently.
- **Editor rejects records** — `@tldraw/mermaid` and SDK versions are out of
  sync. Align them.
