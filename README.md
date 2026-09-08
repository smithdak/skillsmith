# skillsmith

[![CI](https://github.com/smithdak/skillsmith/actions/workflows/ci.yml/badge.svg)](https://github.com/smithdak/skillsmith/actions/workflows/ci.yml)

Focused instructions for coding agents: investigate bugs, write useful READMEs,
review designs, and carry work between sessions. Use a single skill or install a
plugin of related skills in Codex, Claude Code, or another Agent Skills harness.

Each skill keeps its core procedure small, with examples and deeper guidance in
references. The repository also contains the compiler that packages these sources,
checks generated files, and runs routing and task evaluations.

## Quick start

Try the `docs-craft` plugin to improve a repository's README. With Git and a Codex
CLI that supports `codex plugin`, run:

```sh
git clone https://github.com/smithdak/skillsmith.git
cd skillsmith
codex plugin marketplace add ./dist/codex
codex plugin add docs-craft@skillsmith-marketplace
```

The bundles are committed; installation does not require Bun or a generation step.
Open a new Codex session in the project you want to document and ask:

```text
Use readme-authoring and doc-visuals to update this repo's README.
Verify the setup commands against the project, give a newcomer a complete
first-use example, and check the rendered page at desktop and narrow widths.
```

Review the edited README and the agent's verification report. The skills direct the
agent to inspect real commands and files, preserve the project's identity, and
distinguish a rendered check from source inspection.

For **Claude Code** or **a single portable skill**, follow
[installation and compatibility](docs/plugins.md). Browse the
[source instructions](skills/engineering/readme-authoring/SKILL.md) before installing.

## Choose a plugin

<!-- skillsmith:start -->
**9 installable plugins, 39 skills, 2 agents.** Choose a plugin below to see its skills and recorded routing evaluations in the [catalog](catalog/CATALOG.md). Agent definitions ship in the Claude Code bundles.

| Plugin | Use it for |
|---|---|
| [architecture](catalog/CATALOG.md#architecture)<br>`0.2.0` | Design interfaces, record decisions, review structure, and plan migrations. |
| [planning](catalog/CATALOG.md#planning)<br>`0.2.0` | Turn ideas into specs, test assumptions, and anticipate failure. |
| [research](catalog/CATALOG.md#research)<br>`0.2.0` | Verify current facts and write reports grounded in primary sources. |
| [code-craft](catalog/CATALOG.md#code-craft)<br>`0.6.0` | Understand code, diagnose bugs, and develop with meaningful tests. |
| [dev-workflow](catalog/CATALOG.md#dev-workflow)<br>`0.2.0` | Write work items, check handoffs, and guide manual setup. |
| [docs-craft](catalog/CATALOG.md#docs-craft)<br>`0.3.0` | Write READMEs, clarify diagrams, and organize technical documentation. |
| [agent-instructions](catalog/CATALOG.md#agent-instructions)<br>`0.2.0` | Write agent instructions and skills with clear scope and triggers. |
| [security](catalog/CATALOG.md#security)<br>`0.4.0` | Model threats, review security changes, and propose mitigations. |
| [frontend](catalog/CATALOG.md#frontend)<br>`0.6.0` | Build, critique, and refine interfaces; verify behavior in a browser. |
<!-- skillsmith:end -->

Install by the work in front of you. Individual skills include their essential
procedure and an inline fallback when an optional companion skill is absent.
See [composition and packaging](docs/plugins.md) for host-specific components.

## What the evaluations establish

Routing tests ask whether a model selects the right skill. Outcome tests compare
work produced with no skill, a previous version, and the current version. A routing
score alone does not show that a skill improves the work.

The [recorded Astra pilots](benchmarks/results/README.md) include answers, grades,
and limitations. The focused README and diagram pilot passed all criteria in every
arm; it did **not** demonstrate uplift. The skills remain experimental, and results
on one model do not establish improvements on another.

Model evaluations default to **Astra through your Codex ChatGPT subscription**.
They use your subscription allowance and require no API key. Follow
[the evaluation guide](docs/effectiveness.md) to run a small comparison.

## Work on the skills or compiler

From this checkout, install [Bun](https://bun.sh) **1.3.14 or newer**, then run:

```sh
bun install --frozen-lockfile
bun packages/cli/src/main.ts validate --strict
bun packages/cli/src/main.ts check
```

Validation checks source schemas, quality and security rules. `check` compares the
working tree with the generated plan; both commands exit successfully when clean.

Edit `skills/` and `skillsmith.toml`, then run `generate` to rebuild the bundles.
Generated paths and the versioning gate are explained in
[Contributing](CONTRIBUTING.md). The CLI is available from this checkout; it is not
published to a package registry. Use `--cwd` to work on another skills repository.

## Go deeper

- [Write or refine a skill](docs/skill-authoring.md) — anatomy, examples and evaluation cases.
- [Understand the compiler](docs/architecture.md) — source ownership and drift checks.
- [Find a command or configuration option](packages/cli/README.md) — CLI reference.
- [Browse all documentation](docs/README.md) — installation, authoring and evaluation guides.

[Changes](CHANGELOG.md) · [Security model](SECURITY.md) · [MIT license](LICENSE) ·
[Attribution](NOTICES.md)
