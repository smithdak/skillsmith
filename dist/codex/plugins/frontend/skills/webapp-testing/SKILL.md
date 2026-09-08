---
name: "webapp-testing"
description: "Verifies UI behavior in a local web app in a real browser via Playwright — clicks, assertions, screenshots, console logs. Use when the user says \"click through the signup flow\", \"tell me what the console says\", or \"screenshot each step of the checkout\". Not for unit-level red-green (tdd), building or restyling UI (frontend-craft, frontend-redesign), or scored design review (frontend-critique)."
license: "MIT"
metadata:
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
  skillsmith-see-also: "tdd, frontend-craft, frontend-redesign"
---

# webapp-testing

*Adapted from anthropics/skills — webapp-testing (Apache-2.0); see repo-root NOTICES.md.*

Verify the requested user flow in a real browser and retain evidence of the
observed result. Source inspection alone does not establish UI behavior.

## Use the existing environment

Prefer the project's Playwright setup or available browser tools. Reuse an
existing server after checking it serves the intended application. If a server
is needed, resolve [scripts/with_server.py](scripts/with_server.py) from the
installed skill directory, inspect its help, and use it to manage startup and
cleanup. Do not stop a server the user already had running.

Choose the project's runtime; do not add a second language environment for one
check. If browser dependencies are missing, report the prerequisite or install
within the authorized project scope. Static pages can use a file URL when
their assets and browser behavior permit it; otherwise serve them locally.

## Observe, act, assert

Attach console and page-error capture before navigation. Wait for the actual
page state needed by the task, such as a visible control or loaded result.
Do not require network idleness: polling, analytics, and persistent connections
can make it unrelated to readiness.

Inspect the rendered DOM and choose locators from observed roles, accessible
names, or stable test identifiers. Act through those locators and assert the
resulting user-visible behavior at each important transition. Prefer locator
assertions and state waits to fixed sleeps. For layout questions, inspect the
relevant desktop and mobile widths; use the user's requested browser when
provided. Headless Chromium is a practical default, not a requirement.

Example: after submitting signup, assert the account state or confirmation and
check relevant errors. A successful click or HTTP 200 alone does not prove the
signup completed.

Patterns for Python and TypeScript are in
[references/playwright-patterns.md](references/playwright-patterns.md).

## Finish with evidence

Save useful screenshots, logs, and reusable checks to a known output location
and report paths the user can access. Match claims to the right evidence:
assertions for behavior, screenshots for appearance, logs for failures.
Batch related inspections and repeat only after changes or unresolved failures.
Close browser contexts and servers started for this task.

Report which steps passed, failed, or were not exercised. This skill verifies;
frontend-craft and frontend-redesign implement interfaces, and tdd covers
unit-level development.
