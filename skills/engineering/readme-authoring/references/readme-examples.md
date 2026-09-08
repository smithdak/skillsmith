# Worked README edits

These examples use invented projects and commands to demonstrate editorial choices.
They are not install instructions or facts to copy into a real repository. Use the
actual project's interfaces, assets and voice. Select the example relevant to the
weakness you are fixing.

## Replace a brochure opening with a useful demonstration

Weak:

> # Tracefold
> A powerful, flexible, next-generation log-processing solution.
> Features: fast processing, intuitive CLI, rich reports, seamless integration.
> Install with your favorite package manager. See the documentation to get started.

Nothing identifies the reader's input, result, installation route or tradeoff.

Suppose the supplied repository facts say Tracefold is a Python CLI, runs locally,
accepts JSONL traces, produces Markdown reports, requires Python 3.11+, is distributed
only by checkout, and has the example shown below. A stronger opening is:

````markdown
# Tracefold

Turn JSONL traces into a Markdown report of failed requests. Tracefold runs locally
for developers investigating exported logs; it does not upload trace data.

## Try it on the included trace

Requires Python 3.11+ and Git. Install from source; no package is published yet.

```sh
git clone https://example.invalid/team/tracefold.git
cd tracefold
python -m venv .venv
.venv/bin/python -m pip install .
.venv/bin/tracefold examples/checkout.jsonl --output report.md
```

Open `report.md` to see the failed requests grouped by cause. The included example
produces:

```text
3 failed requests · 2 causes
Wrote report.md
```

Tracefold analyzes exported files rather than collecting live logs. See
[the input format](docs/input-format.md) to use your own traces.
````

Why this works: a concrete job replaces adjectives; the checkout matches actual
availability; the sample is available after cloning; the result has a destination;
the constraint helps readers evaluate fit. The example uses POSIX virtualenv paths;
a real README must state its platform scope or give the supported Windows equivalent.
The example's reserved URL is illustrative, not an installable repository.

## A library needs a usable API example, not a CLI-shaped template

Weak:

> ## Installation
> Install the package.
> ## Features
> Configurable validation. Helpful errors. Flexible integrations.
> ## Architecture
> The parser feeds the validator and normalizer.

Suppose the real interface is a pure function accepting text and returning either a
normalized value or errors. Show that contract early instead of an internal pipeline:

````markdown
# Labelkit

Validate and normalize user-entered labels before saving them. Labelkit is a small
JavaScript library for form and import handlers; validation returns data instead of
throwing on invalid input.

```sh
npm install labelkit
```

```js
import { parseLabel } from "labelkit";

console.log(parseLabel("  release candidate  "));
// { ok: true, value: "release candidate" }

console.log(parseLabel(""));
// { ok: false, errors: ["Label is required"] }
```

The example assumes a project configured for ES modules. See [validation rules](docs/rules.md)
for length and character limits, and [development](CONTRIBUTING.md) to work on Labelkit.
````

Only use this shape when the package and return values are verified. The API's
failure behavior is useful product information; private module names usually are
not. If the function is asynchronous, requires setup, or returns a different shape,
the example must expose that rather than hiding it behind an elegant snippet.

## Repair an overbuilt README

When a page starts with a large logo, many badges, navigation, a problem essay,
features and an architecture chart before the first task, remove competition:

1. Keep the existing identity and the signals readers use to evaluate the project.
2. Move a short, meaningful example beside the capability statement or quick start.
3. Replace repeated feature claims with the actual distinction or limitation.
4. Place a diagram only where a reader needs its relationship explained.
5. Link exhaustive reference and contributor material after first use.

Do not replace every project with the same sparse layout. An application's authentic
screenshot, a research tool's sourced result figure, or a dataset's small sample can
supply the opening evidence. Judge the page by what readers can understand and do,
not by how many conventional sections or Markdown features it includes.
