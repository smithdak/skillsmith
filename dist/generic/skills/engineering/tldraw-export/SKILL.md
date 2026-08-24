---
name: tldraw-export
description: >-
  Renders a tldraw canvas or .tldr file to a static image — SVG, PNG, JPEG, or
  WebP — by driving tldraw's browser-based export APIs from a headless browser,
  producing a shareable picture from an editable canvas. Use this skill when the
  user says "export my tldraw file to PNG", "render this .tldr as an SVG",
  "turn my tldraw canvas into an image", or needs a flat image out of a tldraw
  document. Not for generating an editable .tldr from a description (see
  tldraw-diagram), converting Mermaid (see mermaid-to-tldraw), or exporting from
  the tldraw desktop app's own File menu.
license: MIT
metadata:
  skillsmith-see-also: "tldraw-diagram, mermaid-to-tldraw"
  skillsmith-invocation: "user"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# tldraw-export

tldraw can export a canvas to SVG, PNG, JPEG, or WebP. The catch that drives the
whole design of this skill: **the export APIs are browser-based and require a
DOM** — they measure and rasterize real rendered shapes, so they do not run in
plain headless Node. Exporting programmatically therefore means driving a real
browser (Playwright/Chromium) that loads the shapes and calls the export API.

If the user just wants a one-off image and already runs the tldraw desktop app
or web editor, the fastest answer is the app's own Export menu — say so rather
than building a pipeline. When the `tldraw-offline` agent skill is available, it
can drive that desktop-app export directly; prefer it over a headless build for
a single image. This skill is for scripted or repeatable exports where no app is
running.

## Set up the headless pipeline

1. **Load the shapes into a real page.** Mount a tldraw editor in a Playwright
   Chromium page, then `loadSnapshot(editor.store, snapshot)` from the `.tldr`
   (or use a canvas the user already has open). A DOM-less runtime will fail —
   this is the single most common mistake.
2. **Choose the export call.** Use the editor's export API to produce the image:
   an SVG string for vector output, or a rasterized blob for PNG/JPEG/WebP. Pass
   the shape ids to export (all shapes, or a selection) and options like
   `background`, `padding`, and `scale`.
3. **Persist the bytes.** Write the SVG string or the blob to the target path
   from the browser context (download or `page.evaluate` returning bytes).

See [references/headless-export.md](references/headless-export.md) for the
concrete Playwright + export-API recipe, format trade-offs, and gotchas.

## Choose the format deliberately

- **SVG** — vector, editable, smallest for diagrams; best default for docs.
- **PNG** — lossless raster with transparency; use `scale: 2` for crisp output.
- **JPEG** — smaller, no transparency; only for photo-heavy canvases.
- **WebP** — small raster where the target supports it.

Match the format to the destination (README, slide, print) instead of
defaulting to PNG every time.

## Verify before handing off

- The output file exists, is non-empty, and opens as the claimed format.
- All intended shapes are inside the frame — a cropped export usually means the
  export bounds or `padding` were wrong, not the shapes.
- For raster output, confirm the resolution matches the requested `scale`.
- Report the format, dimensions, and whether the whole canvas or a selection was
  exported.
