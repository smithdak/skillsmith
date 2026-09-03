---
name: webapp-testing
description: >-
  Tests and debugs a locally running web app in a real browser via
  Playwright: starts the dev server with a bundled with_server helper, then
  does reconnaissance before action — navigate, wait for network idle,
  screenshot and inspect the DOM, discover selectors, then click, type, and
  assert — capturing console logs to verify UI behavior; static HTML is
  loaded over file://. Use this skill when the user says "open the app and
  click through the signup flow", "the page renders blank — check the
  browser console", "screenshot each step of checkout on localhost:3000",
  "write a Playwright script that fills the form and checks the toast", or
  wants UI behavior verified in a browser rather than in unit tests. Not
  for unit-level red-green development (tdd), building or restyling UI
  (frontend-craft, frontend-redesign), rendering tldraw canvases to images
  (tldraw-export), or security review of a diff.
license: MIT
metadata:
  skillsmith-see-also: "tdd, frontend-craft, frontend-redesign, tldraw-export"
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# webapp-testing

*Adapted from anthropics/skills — webapp-testing (Apache-2.0); see repo-root NOTICES.md.*

A claim about UI behavior is only as good as the browser run behind it. Drive
the app in a real headless browser, look at the rendered state before choosing
selectors, and keep the evidence — screenshots and console output — so every
claim is reviewable after the fact. Reading the source shows what the app is
supposed to do; the browser shows what it does.

## Decide the approach

- **Static HTML** (a file, no server): read the file to identify selectors,
  then load it over `file://`. If the markup is built at runtime or the read
  is inconclusive, treat it as dynamic.
- **Dynamic app, server not running**: start it with the bundled helper —
  `scripts/with_server.py --help` first, then
  `python scripts/with_server.py --server "npm run dev" --port 5173 -- <your command>`.
  It starts one or more servers, waits for each port to accept connections,
  runs the command, and tears the whole process tree down afterwards. Run it
  as a black box; do not read it into context unless it fails.
- **Dynamic app, server already running**: skip the helper and go straight
  to reconnaissance against the existing origin. Never start a second copy
  of a server the user already has up — verifying a replacement server
  proves nothing about the page they are looking at.

## Reconnaissance, then action

1. Navigate and wait: `page.goto(url)` then wait for `networkidle`.
   Inspecting the DOM before the app's JavaScript has run is the single most
   common way to get an empty or wrong selector list.
2. Inspect the rendered state: a full-page screenshot, `page.content()`,
   and locator sweeps (`button`, `a[href]`, `input, textarea, select`) to see
   what is actually on the page and what it is called.
3. Choose selectors from what the recon found — prefer roles and visible text
   (`get_by_role`, `text=`), then stable ids; avoid brittle CSS chains.
4. Act with those selectors, adding explicit waits (`wait_for_selector`,
   `expect(locator).to_be_visible()`) at each state transition rather than
   fixed sleeps.

Always launch Chromium headless, use one viewport for the whole run, and
close the browser when done. Keep inspection rounds **bounded**: one
reconnaissance round (add a mobile viewport only when the question is
about layout), one action-and-assert round, and at most one confirming
round after any fix the user or another skill applies — open-ended
screenshot loops burn the session without converging faster than
that. Patterns for element discovery, static-file
automation, and console capture, in both Python and TypeScript, are in
[references/playwright-patterns.md](references/playwright-patterns.md).

## Capture evidence

Write screenshots and logs to a path the user can open and the repo ignores —
the project's existing output or `.playwright` directory, or the session
scratchpad — never to a sandbox-only path. Attach a `page.on("console", …)`
handler before navigating so startup errors are captured, and keep the log
when the task is "why is this page broken": the console usually names the
failing module or request. Pair every behavioral claim in the report with
the screenshot or log line that shows it.

## Runtime

Use the Playwright the project already has. A `package.json` that depends on
`@playwright/test` or `playwright` means Node/TypeScript; otherwise use the
Python sync API (`pip install playwright && playwright install chromium`).
Do not add a second runtime to a project for one check. If a browser MCP
server (Playwright, Chrome) is connected, it can replace the reconnaissance
step; checks the user will re-run still become scripts, because a script is
repeatable and a tool session is not.

## Boundaries

- This skill verifies behavior; it does not build or restyle interfaces.
  New UI is `frontend-craft`, upgrading an existing one is
  `frontend-redesign`.
- Unit-level red-green work belongs to `tdd`. Reach for the browser when the
  question is what the user sees, not whether a function returns the right
  value.
- Do not install browsers or dependencies globally without saying so;
  prefer the project-local install.
- Stop any server the helper started. A server left running outlives the
  turn and confuses the next run.

## Verify before returning

Every claim about what the page does is backed by a screenshot or a console
log captured after `networkidle`. Selectors in any returned script were
observed in the rendered DOM, not guessed from source. Servers started by the
helper are gone, and every cited output path exists.
