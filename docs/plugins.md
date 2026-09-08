# Install a skill or plugin

A skill supplies the procedure and resources for one job. A plugin packages related
skills and any configured host integrations. Choose the smallest unit that covers
your task; the [catalog](../catalog/CATALOG.md) lists each plugin's contents.

## Codex

With Git and a Codex CLI supporting `codex plugin`, obtain the committed bundles:

```sh
git clone https://github.com/smithdak/skillsmith.git
cd skillsmith
codex plugin marketplace add ./dist/codex
codex plugin add docs-craft@skillsmith-marketplace
```

Open a new Codex session in the project you want to document and ask:

```text
Use readme-authoring to update this project's README from the actual code.
Include a complete first-use example and verify the local links.
```

Replace `docs-craft` with another plugin name from the catalog as needed. The local
marketplace points to the bundles in this checkout, so keep it available for future
marketplace operations. Installation does not require Bun or an API key.

## Claude Code

In Claude Code, register the repository and install a plugin:

```text
/plugin marketplace add smithdak/skillsmith
/plugin install docs-craft@skillsmith-marketplace
```

Then ask Claude Code to use `readme-authoring` on the current project. These bundles
include each group's configured Claude agents, commands, hooks and MCP servers.
Inspect the catalog's script inventory and [security model](../SECURITY.md) when
choosing a plugin.

## One portable skill

From a checkout, copy the complete skill directory into your harness's configured
skill directory. For the README skill, the source of the portable copy is:

```text
dist/generic/skills/engineering/readme-authoring/
├── SKILL.md
└── references/
    ├── readme-examples.md
    └── readme-structure.md
```

The destination depends on the harness. Keep all references, scripts and assets
with the skill; resources resolve relative to its installed directory. Include
the root `LICENSE` and `NOTICES.md` when redistributing copies. Plugin bundles
already contain those files.

Optional companion skills add capabilities, but each skill includes an essential
fallback procedure when the companion is absent. For example, `readme-authoring`
includes basic visual checks and can use `doc-visuals` for deeper guidance.

## What ships to each host

| Distribution | Contents |
|---|---|
| Portable, Codex and OpenCode skill trees | Normalized skill instructions and supporting resources |
| Claude Code plugins | Skills and configured Claude agents, commands, hooks and MCP |
| Native Codex plugins | Skills, resources, native manifests and configured MCP |

Claude agent definitions, commands and hooks are not translated into Codex
components. A plugin containing only those components produces no empty Codex
bundle. Packaging checks establish file layout and relocation; runtime behavior
still needs verification in the intended host.

The generator owns these installation locations:

```text
plugins/           # Claude Code bundles
dist/codex/        # Native bundles and local marketplace
dist/generic/      # Portable skills grouped by category
.codex/skills/     # Codex project skills
.opencode/skills/  # OpenCode project skills
```

## Build a richer workflow

Declare a coherent grouping in `skillsmith.toml`. Keep reusable resources with
their skills; declare shared tool servers in `mcp/` and reference them from the
group only when needed. Keep credentials outside the repository.

A coding plugin might combine `codebase-survey`, `diagnose-bugs` and `tdd`.
Each remains independently useful. An orchestrator should select only the steps
the task requires and respect the user's existing authorization.

Follow [Contributing](../CONTRIBUTING.md) to generate and validate all targets.
Changing shipped content in either plugin distribution requires a group version
bump and changelog entry. Use [outcome evaluations](effectiveness.md) and actual
installed-plugin tasks before claiming that a workflow improves results.
