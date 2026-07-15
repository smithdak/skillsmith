# skillsmith.toml — configuration reference

`skillsmith.toml` at the repo root is the assembly manifest: it groups sources
into installable plugins and sets the policy knobs validation enforces. Schema:
[`packages/core/src/schemas/skillsmith-config.ts`](../packages/core/src/schemas/skillsmith-config.ts)
(exported as JSON Schema to `.skillsmith/schemas/` for editor validation).

**Unknown keys anywhere in this file are hard errors** — this is skillsmith's
own surface, so it is strict, unlike the tolerant Anthropic-owned schemas.
The commands that read the config (`validate`, `generate`, `check`, `eval`)
validate it before any work; an invalid config exits 2. (`init` bootstraps a
repo without one, and `scaffold` edits the file as text.)

## `[marketplace]`

```toml
[marketplace]
name = "skillsmith-marketplace"      # kebab-case, required
owner = { name = "Dakota" }          # required; email/url optional
description = "..."                  # optional
```

`name` must be kebab-case and must not be one of the Anthropic-reserved names
(`claude`, `anthropic`, `claude-code`, `agent-skills`, `claude-plugins-official`,
`claude-plugins-community` — [`constants.ts`](../packages/core/src/constants.ts);
the reserved-name check runs when `generate` validates the marketplace it builds).
`owner` becomes the `author` of every generated plugin manifest and the
marketplace `owner`.

## `[categories]`

```toml
[categories]
allowed = ["engineering", "productivity", "misc"]
```

The allowlist of `skills/` subfolders (kebab-case, at least one). A skill in a
folder outside this list fails V14. **`"drafts"` must not be listed** — it is
implicit, always lenient, and always excluded from generation (declaring it is
a V14 error).

## `[[plugin]]` — one table per plugin

```toml
[[plugin]]
name = "engineering-core"            # kebab-case, required, unique
version = "0.1.0"                    # optional; see version-source
version-source = "changesets"        # "changesets" (default) | "manual"
description = "..."                  # optional; shows in marketplace + catalog
skills = ["architecture-spec", "codebase-survey"]   # default []
agents = ["falsification-reviewer"]  # default []
hooks  = []                          # default []; v0.1: AT MOST ONE hook set
mcp    = []                          # default []
commands = []                        # default []; reserved, not yet assembled
```

Rules enforced at config-validation and generate time:

- **A skill belongs to exactly one plugin.** Two groupings claiming the same
  skill is an error.
- Every name listed must exist under its source directory and pass validation;
  a draft skill in a plugin is a V14 error (promote it first).
- A skill may pin its plugin with `metadata."skillsmith-plugin"`; if declared,
  it must match the grouping that claims it.
- `hooks` supports at most one set per plugin in v0.1 (merge semantics are
  undefined; [`generate.ts`](../packages/core/src/generate.ts) rejects more).
- Multiple `mcp` entries are merged into one `.mcp.json`; duplicate server
  keys across files are errors.

**Versioning:** with `version-source = "manual"`, the `version` field is used
as-is (missing → warning + `0.1.0` default). The `"changesets"` default means
a release workflow is expected to bump `version` in place — note that no
changesets tooling is wired up in this repo yet, so in practice versions are
bumped by hand either way.

## `[policy]`

Defaults shown; this repo's live values (including seven acknowledged
composition edges) are in [`skillsmith.toml`](../skillsmith.toml).

```toml
[policy]
"max-skill-body-tokens" = 5000       # V4 token ceiling (chars/4 estimate)
"max-listing-chars" = 1536           # V2 cap: description + when_to_use listing budget
"min-trigger-hit-rate" = 0.85        # eval gate: below this → V8 error
"security-tier" = "strict"           # "strict" | "standard"
"network-allowlist" = []             # S2: script paths allowed to touch the network
"composition-allowlist" = []         # V12: acknowledged cross-plugin edges
```

- **`max-skill-body-tokens`** (default 5000) — V4 fails a SKILL.md body whose
  chars/4 estimate exceeds it. The 500-line cap is fixed alongside it.
- **`max-listing-chars`** (default 1536, from `LIMITS.listingCharCap` in
  [`constants.ts`](../packages/core/src/constants.ts)) — the V2 cap on
  `description` + `when_to_use`, the budget each skill gets in the
  system-prompt listing.
- **`min-trigger-hit-rate`** (default 0.85) — after `skillsmith eval`, any
  skill scoring below this emits a V8 error ([evals guide](evals.md)).
- **`security-tier`** — under `strict`, S2 (undeclared network-touching
  script) and S5 (un-pinned external marketplace source) are errors; under
  `standard` they are warnings. Everything else is unaffected.
- **`network-allowlist`** — script paths (relative to their skill dir, e.g.
  `"scripts/fetch-docs.sh"`) permitted to contain network-touching commands.
- <a name="composition-allowlist"></a>**`composition-allowlist`** — entries of
  the form `"composer->target"` acknowledging composition edges that cross
  plugin boundaries. Cross-plugin edges are soft dependencies (a consumer may
  install one plugin without the other), so V12 warns on any edge not
  acknowledged here.

## Scaffolding a new plugin grouping

`bun packages/cli/src/main.ts scaffold plugin <name> --description "..."`
appends a `[[plugin]]` table to `skillsmith.toml` (and refuses if the name
already exists). Assign skills to it by editing the `skills` array.
