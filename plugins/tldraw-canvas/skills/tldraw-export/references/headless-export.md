# Headless tldraw export recipe

tldraw's export APIs need a DOM. The reliable way to script an export is a real
Chromium page via Playwright that mounts an editor, loads the shapes, and calls
the export API. Verify current export function names against tldraw.dev, as they
were consolidated across the 3.x/5.x line.

## Shape of the pipeline

1. Serve or build a minimal page that imports `tldraw` and exposes the `editor`
   (a Vite build, or an inline page that mounts `<Tldraw onMount={...}>`).
2. Launch Playwright Chromium, open the page, wait for the editor to be ready.
3. Load the document:

```js
// in page context, after the editor mounts
import { loadSnapshot } from 'tldraw'
loadSnapshot(editor.store, snapshot) // snapshot parsed from the .tldr
```

4. Export. Two shapes of output:

```js
// Vector: an SVG string / element for the given shapes
const ids = editor.getCurrentPageShapeIds()
const svg = await editor.getSvgString([...ids], { background: true, padding: 16 })

// Raster: a Blob (PNG/JPEG/WebP)
const { blob } = await editor.toImage([...ids], { format: 'png', scale: 2, background: true })
```

Function names and return shapes differ by SDK version — some versions expose
`exportToBlob(...)` as a top-level helper taking `{ editor, ids, format, opts }`
instead of an editor method. Check the installed version's exports and adapt;
the options (`format`, `scale`, `background`, `padding`, `bounds`) are stable in
spirit.

5. Get the bytes out of the browser. For a blob, convert to a base64/array in
   `page.evaluate` and write it in Node; for SVG, return the string directly.

## Format notes

| Format | Kind | Transparency | Use for |
|---|---|---|---|
| SVG | vector | yes | docs, infinite zoom, smallest for diagrams |
| PNG | raster | yes | crisp UI/diagram images; set `scale: 2` |
| JPEG | raster | no | photo-heavy canvases only |
| WebP | raster | yes | small raster where supported |

## Gotchas

- **Runs only with a DOM.** `node export.js` with no browser fails — this is the
  number-one error. Use Playwright/Chromium, not jsdom (font/layout measurement
  is unreliable under jsdom).
- **Fonts.** Custom fonts must be loaded in the page before export or text
  metrics and rendering drift. Wait for `document.fonts.ready`.
- **Bounds/cropping.** Export the shapes you mean — pass explicit ids and a
  `padding`; relying on the current viewport can crop off-screen shapes.
- **Blank raster.** Usually the editor had not finished mounting/rendering; wait
  for a ready signal before exporting.
