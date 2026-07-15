# skillsmith documentation

Start from who you are:

**I want to install and use the skills**
→ Root [README — Install the skills](../README.md#install-the-skills), then
browse [catalog/CATALOG.md](../catalog/CATALOG.md) — every skill with its
measured trigger rate and the script inventory (interpreter, network flag,
SHA-256) of everything a plugin can execute. Security model:
[SECURITY.md](../SECURITY.md).

**I want to write or change a skill**

| Doc | What it answers |
|---|---|
| [Skill authoring](skill-authoring.md) | The full path from scaffold to shipped: folder anatomy, frontmatter reference, description craft, composition, promotion, the gate |
| [Evals](evals.md) | How trigger measurement works, writing `evals.json`, running it, badges |
| [Validation rules](validation-rules.md) | Every V/S rule, fix-oriented — open this when CI is red |
| [Configuration](configuration.md) | `skillsmith.toml`: plugin groupings and every policy knob |

**I want to work on the tool itself**

| Doc | What it answers |
|---|---|
| [Architecture](architecture.md) | The pipeline (discover → validate → generate → check → eval), the invariants, why determinism is load-bearing, reading order |
| [`packages/core` README](../packages/core/README.md) | The library surface, rule summary table, test layout |
| [`packages/cli` README](../packages/cli/README.md) | Command and flag reference, exit codes |

These documents were produced by dogfooding this repo's own skills —
`codebase-survey` for ground truth, `define-work-items` for scoping,
`falsification-review` and `cold-read` as the verification passes. Every
normative claim is anchored to a source path; if a doc and the code disagree,
the code is right and the doc has a bug — please file it.
