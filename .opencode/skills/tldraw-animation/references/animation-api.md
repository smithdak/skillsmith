# tldraw animation — API surface and durable-loop skeleton

Verify exact names against tldraw.dev and the installed SDK version; animation
method signatures were consolidated across the 3.x/5.x line. The model below is
stable in shape.

## Timed shape animation

Animate shapes to new partial states over a duration with easing, instead of a
hard `updateShapes` jump:

```js
editor.animateShape(
  { id: 'shape:box1', type: 'geo', x: 400, y: 120, rotation: 0.2 },
  { animation: { duration: 400, easing: EASINGS.easeOutCubic } },
)

// multiple shapes at once
editor.animateShapes(
  [
    { id: 'shape:a', type: 'geo', x: 100, y: 100 },
    { id: 'shape:b', type: 'geo', x: 300, y: 100 },
  ],
  { animation: { duration: 500, easing: EASINGS.easeInOutCubic } },
)
```

- Some SDK versions expose only the plural `animateShapes`; if `animateShape`
  is undefined, wrap the single shape in an array.
- `EASINGS` is exported from `tldraw` / `@tldraw/editor` (e.g. `linear`,
  `easeInCubic`, `easeOutCubic`, `easeInOutCubic`, `easeOutExpo`). Import it
  rather than passing a raw function unless you need a custom curve.

## Camera animation (tours, focus, fit)

```js
editor.setCamera({ x: -200, y: -100, z: 1 }, { animation: { duration: 600, easing: EASINGS.easeInOutCubic } })
editor.zoomToBounds(bounds, { animation: { duration: 500 } })
editor.zoomToFit({ animation: { duration: 400 } })
editor.centerOnPoint({ x, y }, { animation: { duration: 300 } })
```

Chain a tour by awaiting each step's settle before starting the next, so regions
are visited in order instead of the camera fighting itself:

```js
async function tour(stops) {
  for (const b of stops) {
    editor.zoomToBounds(b, { animation: { duration: 600 } })
    await new Promise((r) => setTimeout(r, 650)) // duration + small buffer
  }
}
```

## Durable loop (tldraw-offline embedded script)

tldraw-offline runs raw JavaScript with access to `editor` and `window`, and can
store the script in the document. A continuous animation is a cancelable rAF
loop driven by a clock:

```js
// Durable animation: gentle vertical bob of one shape. Cancelable.
;(function animate() {
  const id = 'shape:box1'
  const base = editor.getShape(id)?.y ?? 0
  const t0 = performance.now()
  let raf = 0

  function frame(now) {
    const shape = editor.getShape(id)
    if (!shape) return // shape deleted → stop
    const y = base + Math.sin((now - t0) / 500) * 20
    editor.updateShape({ id, type: shape.type, y }) // one batched update
    raf = requestAnimationFrame(frame)
  }
  raf = requestAnimationFrame(frame)

  // Expose a stop handle so the loop is never uncancelable.
  window.__stopAnim = () => cancelAnimationFrame(raf)
})()
```

Rules for durable loops:

- **Always keep a cancel handle** (`cancelAnimationFrame`), exposed so a human or
  a later script can stop it.
- **One batched editor update per frame**; never create shapes or new objects per
  frame — that garbage-thrashes the canvas.
- **Guard for deletion/close**: bail when `getShape` returns undefined.
- **Bound the shape count**; dozens are fine, hundreds are not.

## Capturing animation as a file

tldraw has no built-in video export. Options:

- Screen-record the live canvas playing the animation.
- Drive the animation to discrete time steps and export each frame with
  tldraw-export (headless), then encode the frames to a video/GIF with an
  external tool (e.g. ffmpeg). tldraw itself only produces still images.
