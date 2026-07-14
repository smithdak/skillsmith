# skillsmith (CLI)

The command-line front end for [`@skillsmith/core`](../core/README.md). It is a thin [citty](https://github.com/unjs/citty) wrapper and is **deliberately zero-logic**: load config, call core, render diagnostics, map to exit codes. If a change involves any decision-making, it belongs in core.

There is no bin link inside this repo — run the entry directly from the repo root:

```sh
bun packages/cli/src/main.ts <command> [flags]
```

(Installed as a package it exposes the `skillsmith` bin; examples below use the short form.)

## Commands

### `skillsmith init`
Bootstrap a skills monorepo: category taxonomy, `skillsmith.toml`, CI workflow, docs, editor schemas. Fills gaps in non-empty directories and **never overwrites** existing files.
Flags: `--name` (marketplace name), `--owner`, `--categories` (comma-separated, default `engineering,productivity,misc`).

### `skillsmith scaffold <kind> <name>`
Scaffold a `skill | agent | hook | mcp | plugin`. Skills start in `skills/drafts/` (lenient tier) unless `--category` says otherwise. Kebab-case names enforced; refuses to clobber an existing target (exit 2).
Flags: `--category`, `--description`.

### `skillsmith validate`
Run schema + quality (V1–V14) + security (S1–S7) tiers over all sources. See the [rule reference](../core/README.md#rule-reference).
Flags: `--tier all|schema|quality|security`.

```
$ skillsmith validate --strict
skillsmith validate: 0 error(s), 0 warning(s) [tier=all, profile=claude-code]
```

### `skillsmith generate`
Emit all derived artifacts — `plugins/`, `.claude-plugin/marketplace.json`, `catalog/CATALOG.md`, `.skillsmith/schemas/` — from sources. Output is deterministic byte-for-byte. `--dry-run` prints the plan without writing.

### `skillsmith check`
The CI drift gate: fails (exit 1) if any committed artifact differs from what `generate` would write right now, reporting each file as modified, stale, or missing.

```
$ skillsmith check
skillsmith check: clean
```

### `skillsmith eval [skill]`
Measure trigger hit-rate per skill: an LLM judge decides, for each eval case, which catalog entry it would trigger — confusion with *other* skills in the catalog counts against you. Requires `ANTHROPIC_API_KEY` (exit 2 if unset). Full runs (no skill filter) write `.skillsmith/eval-results.json`, which feeds catalog badges; hit rates below `[policy]."min-trigger-hit-rate"` (0.85 here) become diagnostics.
Flags: `--skill <name>`, `--model` (judge model, default `claude-sonnet-4-6`), `--concurrency` (default 4).

## Shared flags

| Flag | Meaning | Default |
|---|---|---|
| `--cwd` | Repo root to operate on | `.` |
| `--profile` | Target validator: `claude-code`, `cowork`, or `standard` — diagnostics are filtered to the profile they apply to | `claude-code` |
| `--strict` | Promote warnings to failures | off |
| `--json` | Machine-readable output | off |

## Exit codes

- `0` — clean (or warnings without `--strict`)
- `1` — rule errors, drift, or warnings under `--strict`
- `2` — usage/environment errors (bad scaffold name, existing target, missing `ANTHROPIC_API_KEY`)

The pre-PR gate is `validate --strict && generate && check` — all three must exit 0.
