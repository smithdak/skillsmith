# skillsmith (CLI)

The command-line front end for [`@skillsmith/core`](../core/README.md). The [citty](https://github.com/unjs/citty) wrapper handles argument validation, filesystem and git access, result persistence, diagnostics, and exit codes. Domain rules live in core. Subprocess tests cover command behavior and failure paths.

Requires a checkout with Bun 1.3.14 or newer and `bun install --frozen-lockfile`.
Run the entry directly from the repo root:

```sh
bun packages/cli/src/main.ts <command> [flags]
```

The package is not published to a registry. Command headings below use `skillsmith`
as shorthand for `bun packages/cli/src/main.ts`.

## Commands

### `skillsmith init`
Bootstrap a skills monorepo: category taxonomy, `skillsmith.toml`, CI workflow, docs, editor schemas. Fills gaps in non-empty directories and **never overwrites** existing files.
Flags: `--name` (marketplace name), `--owner`, `--categories` (comma-separated, default `engineering,productivity,misc`).

### `skillsmith scaffold <kind> <name>`
Scaffold a `skill | agent | hook | mcp | plugin`. Skills start in `skills/drafts/` (lenient tier) unless `--category` says otherwise. Kebab-case names enforced; refuses to clobber an existing target (exit 2).
Flags: `--category`, `--description`.

### `skillsmith validate`
Run schema + quality (V1–V17) + security (S1–S7) tiers over the skill, agent, and hook sources plus the config. (MCP file contents are checked at generate-time merge only.) See the [rule reference](../core/README.md#rule-reference).
Flags: `--tier all|schema|quality|security`.

```sh
bun packages/cli/src/main.ts validate --strict
```

Successful output:

```text
skillsmith validate: 0 error(s), 0 warning(s) [tier=all, profile=claude-code]
```

### `skillsmith generate`
Emit plugin bundles, marketplaces, the catalog, editor schemas and configured
skill trees from sources. See [generated ownership](../../docs/architecture.md#generated-ownership)
for paths. Output is deterministic byte-for-byte. `--dry-run` prints the plan
without writing. Run `validate --strict` first for the full source gate.

### `skillsmith check`
The CI drift gate: fails (exit 1) if any committed artifact differs from what `generate` would write right now, reporting each file as modified, stale, or missing.

```sh
bun packages/cli/src/main.ts check
```

Successful output:

```text
skillsmith check: clean
```

### `skillsmith eval [skill]`
Measure simulated routing against the full listing using Codex with a ChatGPT
subscription. Run `codex login` first; API-key authentication is rejected. Defaults:
`--model gpt-6-astra`, `--effort medium`, `--concurrency 1`, `--repeat 1`,
`--timeout-ms 300000`. `--escalate` adds votes only to split cases.

Full runs write `.skillsmith/eval-results.json`; single-skill runs merge only when
listing, runner provenance and vote settings match. Below-policy rates fail.
Start with `skillsmith eval tdd` before a full catalog run uses hundreds of
subscription sessions. See [routing evaluations](../../docs/evals.md).

### `skillsmith version-guard`

Compare shipped plugin bytes against `--base <commit-or-ref>` (default
`origin/main`). Changed content requires a changed version. An unavailable
baseline exits 2; it never substitutes HEAD. CI supplies the PR base or the
pre-push commit explicitly.

### `skillsmith effectiveness`

Compare no-skill and current-skill text answers using Astra through the Codex
ChatGPT subscription. Required: `--suite <json>`. Optional: `--baseline
<previous-source-repo>` adds the old skill as a third arm; `--model`, `--effort`,
`--repeat` (default 3), `--timeout-ms` (default 300000), `--output <path>`, and `--cwd`.

Custom harnesses may pass `--runner '<JSON argv array>'` with `--runner-id
<provenance>`. The default runner records its own identity. Reports include
per-skill pass rates, solver duration and available token usage. JSON goes to the selected output file (or stdout)
only after all trials succeed. See [effectiveness](../../docs/effectiveness.md).

## Shared flags

| Flag | Meaning | Default |
|---|---|---|
| `--cwd` | Repo root to operate on | `.` |
| `--profile` | Target validator: `claude-code`, `cowork`, or `standard` — diagnostics are filtered to the profile they apply to | `claude-code` |
| `--strict` | Promote warnings to failures | off |
| `--json` | Machine-readable output | off |

Not every command takes every shared flag: `check` accepts only `--cwd`/`--json` (drift is binary — there is nothing for `--strict` or `--profile` to change), and `init`/`scaffold` take `--cwd` plus their own flags.

## Exit codes

- `0` — clean (or warnings without `--strict`)
- `1` — rule errors, drift, or warnings under `--strict`
- `2` — usage/environment errors (bad scaffold name, existing target, missing Codex ChatGPT login)

The pre-PR gate is `validate --strict && generate && check` — all three must exit 0.
