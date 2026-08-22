# Playwright patterns for local web-app checks

*Adapted from anthropics/skills — webapp-testing (Apache-2.0); see repo-root NOTICES.md.*

Three recurring shapes, each in the Python sync API and in TypeScript. Pick
the runtime the project already has. Every example launches Chromium
headless, waits for `networkidle` before touching the DOM, and closes the
browser. Replace `OUT` with a directory the user can open and the repo
ignores (an existing output folder, `.playwright/`, or the session
scratchpad).

## Element discovery — what is actually on the page

Run this first on any dynamic app; choose selectors from its output.

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 800})
    page.goto("http://localhost:5173")
    page.wait_for_load_state("networkidle")

    for i, b in enumerate(page.locator("button").all()):
        print(f"button[{i}] {b.inner_text() if b.is_visible() else '[hidden]'}")
    for a in page.locator("a[href]").all()[:10]:
        print(f"link {a.inner_text().strip()!r} -> {a.get_attribute('href')}")
    for el in page.locator("input, textarea, select").all():
        name = el.get_attribute("name") or el.get_attribute("id") or "[unnamed]"
        print(f"field {name} ({el.get_attribute('type') or 'text'})")

    page.screenshot(path="OUT/discovery.png", full_page=True)
    browser.close()
```

```ts
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto("http://localhost:5173");
await page.waitForLoadState("networkidle");

for (const [i, b] of (await page.locator("button").all()).entries()) {
  console.log(`button[${i}]`, (await b.isVisible()) ? await b.innerText() : "[hidden]");
}
for (const a of (await page.locator("a[href]").all()).slice(0, 10)) {
  console.log("link", (await a.innerText()).trim(), "->", await a.getAttribute("href"));
}
for (const el of await page.locator("input, textarea, select").all()) {
  const name = (await el.getAttribute("name")) ?? (await el.getAttribute("id")) ?? "[unnamed]";
  console.log("field", name, `(${(await el.getAttribute("type")) ?? "text"})`);
}

await page.screenshot({ path: "OUT/discovery.png", fullPage: true });
await browser.close();
```

## Static HTML over `file://`

No server: load the file directly. Read the HTML first to pick selectors;
fall back to discovery above if the markup is generated at runtime.

```python
import os
from playwright.sync_api import sync_playwright

url = "file://" + os.path.abspath("dist/index.html")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 800})
    page.goto(url)
    page.screenshot(path="OUT/before.png", full_page=True)

    page.get_by_role("button", name="Get started").click()
    page.fill("#email", "person@example.com")
    page.click("button[type=submit]")
    page.wait_for_selector("text=Thanks")          # assert the state, don't sleep for it
    page.screenshot(path="OUT/after.png", full_page=True)
    browser.close()
```

```ts
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(pathToFileURL("dist/index.html").href);
await page.screenshot({ path: "OUT/before.png", fullPage: true });

await page.getByRole("button", { name: "Get started" }).click();
await page.fill("#email", "person@example.com");
await page.click("button[type=submit]");
await page.waitForSelector("text=Thanks");
await page.screenshot({ path: "OUT/after.png", fullPage: true });
await browser.close();
```

## Console capture — "why is this page blank?"

Attach the handler *before* `goto` so startup errors are caught. Keep the
log; the first `[error]` line usually names the failing module or request.

```python
from playwright.sync_api import sync_playwright

lines = []
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.on("console", lambda msg: lines.append(f"[{msg.type}] {msg.text}"))
    page.on("pageerror", lambda err: lines.append(f"[pageerror] {err}"))

    page.goto("http://localhost:5173")
    page.wait_for_load_state("networkidle")
    page.click("text=Dashboard")
    page.wait_for_timeout(1000)                   # let async handlers log
    browser.close()

with open("OUT/console.log", "w", encoding="utf-8") as f:
    f.write("\n".join(lines))
print(f"{len(lines)} console messages -> OUT/console.log")
```

```ts
import { writeFileSync } from "node:fs";
import { chromium } from "playwright";

const lines: string[] = [];
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.on("console", (msg) => lines.push(`[${msg.type()}] ${msg.text()}`));
page.on("pageerror", (err) => lines.push(`[pageerror] ${err.message}`));

await page.goto("http://localhost:5173");
await page.waitForLoadState("networkidle");
await page.click("text=Dashboard");
await page.waitForTimeout(1000);
await browser.close();

writeFileSync("OUT/console.log", lines.join("\n"));
console.log(`${lines.length} console messages -> OUT/console.log`);
```

## Pitfalls

- Inspecting before `networkidle` on a dynamic app returns the pre-hydration
  shell — empty button lists and missing text.
- A fixed `wait_for_timeout` is not proof a state was reached; assert with
  `wait_for_selector` / `expect(locator)` and use timeouts only to let
  logging drain.
- Substring checks on `body.textContent` match the user's own typed input;
  assert on a specific element with exact text.
- Two servers on the same port, or a replacement server on a new port, do
  not verify the page the user is looking at — test the origin they use.
