---
name: tldraw-animation
description: >-
  Adds motion to a tldraw canvas — animating shape position, rotation, and
  props over time with easing, animating the camera through a canvas, and
  authoring durable requestAnimationFrame loops embedded in a tldraw-offline
  document so the canvas keeps animating whenever it is opened. Use this skill
  when the user says "animate this tldraw diagram", "make these shapes move",
  "add an animation to my tldraw canvas", "create a tldraw animation loop", or
  "animate the camera through my board". Not for generating a static .tldr (see
  tldraw-diagram), exporting a canvas to an image (see tldraw-export), or CSS /
  web / video-file animation outside tldraw.
license: MIT
metadata:
  skillsmith-see-also: "tldraw-diagram, tldraw-export"
  skillsmith-invocation: "user"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# tldraw-animation

tldraw animates in two distinct ways, and the right one depends on whether the
motion is a **one-shot transition** or a **living loop**. Pick the mode before
writing anything — they use different APIs and have different failure modes.

- **Timed transition** — a shape or the camera moves from A to B once, over a
  duration, with an easing curve. Driven by the Editor animation API in a
  running session. Use for reveals, reflows, guided camera tours, step-through
  walkthroughs.
- **Durable loop** — the canvas animates continuously (a pulsing node, an
  orbiting shape, a flowing arrow) every time the file is opened. In
  tldraw-offline this is a `requestAnimationFrame` loop in a script embedded in
  the document, which the file carries with it. Use for ambient motion and
  self-running demos.

[references/animation-api.md](references/animation-api.md) has the exact Editor
animation surface, easing names, and a durable-loop script skeleton — verify
call names against the installed SDK version, which is where these drift.

## Timed transitions (Editor API)

Animate shapes to new positions or props, or move the camera, with a duration
and easing:

- Shapes: animate partial shape records (`x`, `y`, `rotation`, `props`) with an
  `{ animation: { duration, easing } }` option so tldraw tweens rather than
  jumping.
- Camera: animate the viewport to a point, to fit content, or to a bounds, with
  the same animation option — this is how a "tour" steps through regions.
- Sequence multi-step motion by chaining transitions (await/settle between
  steps), not by stacking overlapping animations on the same shape.

Keep durations honest (200–600ms reads as responsive; multi-second for tours)
and choose an easing that matches intent (ease-out for arrivals, linear for
mechanical motion).

## Durable loops (tldraw-offline embedded script)

tldraw-offline can run raw JavaScript against the canvas with access to the
`editor` and `window` objects, and store that script in the document so it runs
on open. For continuous animation:

- Drive a `requestAnimationFrame` loop that updates shape props each frame off a
  clock (`performance.now()`), and **keep a handle so it is cancelable** — an
  uncancelable loop is the main hazard.
- Batch each frame's updates in one editor call; avoid allocating new
  objects/shapes per frame or the canvas will thrash.
- Bound the work: animate a handful of shapes, not hundreds; guard against the
  document being closed or the shape being deleted mid-loop.

Authoring the script is this skill's job. Running it against the live canvas —
opening the file, injecting the durable script, editing shapes — is what the
`tldraw-offline` agent handles; hand execution to it rather than driving the app
from here.

## Constraints to state up front

- **No built-in video/GIF export.** tldraw animates on a live canvas; it does
  not render motion to a video file. To capture animation as video, screen-
  record the playing canvas, or drive it frame-by-frame and export each frame
  with tldraw-export, then encode externally. Say this before promising an MP4.
- **Performance is finite.** Frame-rate degrades with shape count and per-frame
  allocation; keep loops lean.
- **Durable scripts are arbitrary code.** They execute on open, so keep them
  small, reviewable, and cancelable — never inject an opaque loop.

## Verify before handing off

- The motion plays smoothly in the app at the intended duration/easing, and a
  camera tour lands on each region in order.
- A durable loop can be stopped (its rAF handle is cancelable) and does not spike
  CPU or leak shapes over time.
- Report which mode was used, the shapes/camera steps animated, and — for a
  durable loop — how to stop it.
