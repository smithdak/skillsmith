# Validation rules — the fix-it reference

Every failure `skillsmith validate` can produce, what it means, and how to fix it.
For the one-line-per-rule summary, see the [core README's rule table](../packages/core/README.md#rule-reference);
this document is the deep reference you open when CI is red.

## How to read a diagnostic

```
ERROR [V4] skills/engineering/tdd/SKILL.md: body is 612 lines (max 500)
WARN  [V12] skills/engineering/feature-spec/SKILL.md#/metadata/skillsmith-composes: declares composition of "cold-read" but the body never references it
```

- **Severity** — `ERROR` always fails the command; `WARN` fails only under `--strict`.
  The pre-PR gate runs `validate --strict`, so treat warnings as failures too.
  (Exit-code semantics: `exitCode()` in [`packages/core/src/diagnostics.ts`](../packages/core/src/diagnostics.ts).)
- **Rule id** — `V1`–`V14` quality, `S1`–`S7` security, `SCHEMA` for shape errors.
- **Path** — file, optionally with a JSON-pointer-ish locator (`#/metadata/...`) into frontmatter.
- **Profiles** — each finding carries the validator targets it applies to
  (`standard`, `claude-code`, `cowork`); the CLI filters to `--profile`
  (default `claude-code`). A rule listed below as *cowork only* will not
  appear in a default run.

**Drafts are exempt.** Skills under `skills/drafts/` get schema parsing only —
hard parse failures still surface, but V/S rules and even schema *warnings* are
suppressed ([`discovery.ts`](../packages/core/src/discovery.ts) pushes draft
diagnostics only on parse failure, and [`validateAll`](../packages/core/src/validate.ts)
skips drafts entirely).

## Schema tier (`SCHEMA`)

Shape validation happens at parse time, inside discovery. The zod schemas live in
[`packages/core/src/schemas/`](../packages/core/src/schemas/); the messages are
self-describing (wrong type, missing field, bad kebab-case). Two policies worth knowing:

- **Unknown frontmatter fields warn, never error** ([`claude-code-frontmatter.ts`](../packages/core/src/schemas/claude-code-frontmatter.ts)) —
  the Claude Code surface churns faster than this tool releases. `--strict` promotes them.
- **`skillsmith.toml` is the opposite: unknown keys are hard errors** ([`skillsmith-config.ts`](../packages/core/src/schemas/skillsmith-config.ts)) —
  it is this repo's own surface, so it is strict.

Profile split encoded at this tier: `argument-hint` in SKILL.md frontmatter is
valid for Claude Code but **fails the Cowork importer** (error under `--profile cowork`) —
describe arguments in the body instead.

## Quality tier (V1–V14)

### V1 — name equals directory, no forbidden substrings
**Error · all profiles · [`agent-skills-standard.ts`](../packages/core/src/schemas/agent-skills-standard.ts)**

The frontmatter `name` must equal the skill's folder name exactly, and must not
contain `claude` or `anthropic` (reserved by Anthropic).
**Fix:** rename the folder or the frontmatter to match; pick a name without the
forbidden substrings.

### V2 — listing projection over 1536 chars
**Error · claude-code · [`claude-code-frontmatter.ts`](../packages/core/src/schemas/claude-code-frontmatter.ts)**

`description` + `when_to_use` together must fit the 1536-char cap
(`LIMITS.listingCharCap`) — that is the budget each skill gets in the
system-prompt listing. **Fix:** cut the description down to trigger-relevant
content; move explanation into the body.

### V3 — description lacks trigger phrasing
**Warning · all profiles · [`agent-skills-standard.ts`](../packages/core/src/schemas/agent-skills-standard.ts)**

Heuristic: the description contains neither "use when…"-style phrasing nor a
quoted user phrase (`"..."` of 3+ chars). The description is the trigger
surface; without explicit triggers, invocation reliability drops.
**Fix:** state what the skill does *and* when, quoting phrasings real users type.
See [Skill authoring — write the description](skill-authoring.md#3-write-the-description--it-is-the-product).

### V4 — body ceilings
**Error · all profiles · [`validate.ts`](../packages/core/src/validate.ts)**

Two independent caps: 500 lines (`LIMITS.skillBodyMaxLines`), and
`[policy]."max-skill-body-tokens"` tokens (5000 here), estimated as
chars/4 (±15%, deliberate — keeps validate dependency-free).
**Fix:** move deterministic work into `scripts/`, on-demand detail into
`references/`. A skill body is a briefing, not a manual.

### V5 — reference depth and chains
**Error (depth) / Warning (chain) · all profiles · [`validate.ts`](../packages/core/src/validate.ts)**

`references/` files must sit exactly one level deep (`references/foo.md`, never
`references/a/b.md`), and a reference `.md` must not link to another reference
(chains defeat on-demand loading). **Fix:** flatten.

### V6 — script hygiene
**Error (shebang) / Warning (exec bit) · all profiles · [`validate.ts`](../packages/core/src/validate.ts)**

`.sh`/`.bash`/`.py` scripts need a shebang line; shell-like scripts should be
executable. The exec-bit check is skipped on Windows (no POSIX mode bits) — CI
covers it on Linux. **Fix:** add `#!/usr/bin/env bash` (or equivalent);
`chmod +x` the file.

### V7 — voice
**Warning · all profiles · [`validate.ts`](../packages/core/src/validate.ts) + [`agent-frontmatter.ts`](../packages/core/src/schemas/agent-frontmatter.ts)**

Two manifestations:
- A skill body opening lines with "I will / I'll / We will / You should now" —
  prefer imperative/infinitive voice ("Run the script", not "I will run the script").
- An **agent** description without an `<example>` block — auto-delegation
  reliability suffers without one.

### V8 — evals present, sufficient, and passing
**Error · all profiles · [`validate.ts`](../packages/core/src/validate.ts), [`schemas/evals.ts`](../packages/core/src/schemas/evals.ts), [`eval.ts`](../packages/core/src/eval.ts)**

Non-draft skills need `evals/evals.json` with ≥3 `should_trigger` and ≥3
`should_not_trigger` cases; prompts containing `TODO` are rejected as
placeholders. Separately, `skillsmith eval` reports a V8 error for any skill
whose trigger hit-rate falls below `[policy]."min-trigger-hit-rate"` (0.85).
**Fix:** write real user phrasings — see [Evals](evals.md).

### V9 — plugin-shipped agents cannot escalate
**Error · claude-code + cowork · [`agent-frontmatter.ts`](../packages/core/src/schemas/agent-frontmatter.ts)**

Agents destined for plugin assembly may not declare `hooks`, `mcpServers`, or
`permissionMode` (privilege-escalation guard; Claude Code rejects them).
**Fix:** delete the field; hooks and MCP servers ship as their own plugin
components, not smuggled inside an agent.

### V10 — too many conditional sections
**Warning · all profiles · [`validate.ts`](../packages/core/src/validate.ts)**

Three or more `## If …`/`## When …` headings suggests mutually-exclusive paths
loaded unconditionally. **Fix:** put each branch in its own `references/` file
and let the body route.

### V11 — CLAUDE.md inside a skill directory
**Error · all profiles · [`validate.ts`](../packages/core/src/validate.ts)**

A `CLAUDE.md` inside a skill folder is never loaded by anything.
**Fix:** move the content into `SKILL.md` or `references/`.

### V12 — composition edges
**Mixed severity · all profiles · [`composition.ts`](../packages/core/src/composition.ts)**

Skill→skill references are **declared** in `metadata."skillsmith-composes"`
(comma-separated names), which makes them lintable. The sub-checks:

| Finding | Severity |
|---|---|
| Declared target does not exist (or is still a draft) | error |
| Skill composes itself | error |
| User-invoked skill composes another **user-invoked** skill | error |
| `skillsmith-see-also` names a nonexistent skill | error |
| Declared edge never mentioned in the body (dead declaration) | warning |
| Known skill name in body but not declared (prose/declaration drift) | warning |
| Edge crosses plugin boundaries without a `composition-allowlist` entry | warning |

**Fixes:** declare what you mention; mention what you declare. Non-invoking
mentions (boundary statements like "correctness is falsification-review's
axis") belong in `skillsmith-see-also`, not `skillsmith-composes`. Cross-plugin
edges are soft dependencies — acknowledge intended ones in
`[policy]."composition-allowlist"` as `"composer->target"`
([configuration reference](configuration.md#composition-allowlist)).

### V13 — reasoning-extraction phrasing
**Warning · all profiles · [`validate.ts`](../packages/core/src/validate.ts)**

Body text instructing the model to "show/explain/share your reasoning" (or
chain-of-thought) is a refusal hazard on Fable 5-era models.
**Fix:** ask for structured *output* (a decision, a table, a numbered
justification), never for the reasoning process itself.

### V14 — category discipline
**Error · all profiles · [`discovery.ts`](../packages/core/src/discovery.ts), [`skillsmith-config.ts`](../packages/core/src/schemas/skillsmith-config.ts), [`generate.ts`](../packages/core/src/generate.ts)**

Four manifestations: the category folder must be in `[categories].allowed`;
a declared `metadata."skillsmith-category"` must equal the folder (or be
omitted); `"drafts"` must not appear in the allowlist (it is implicit); and a
draft skill assigned to a plugin fails generation — promote it first.

## Security tier (S1–S7)

Severity of S2 and S5 scales with `[policy]."security-tier"` — this repo runs
`strict`, where both are errors.

### S1 — script inventory
**Not a failure — an artifact · [`validate.ts`](../packages/core/src/validate.ts)**

Every shipped script gets an inventory entry: path, interpreter (from shebang
or extension), network-touching flag, SHA-256. Surfaced in
[`catalog/CATALOG.md`](../catalog/CATALOG.md) under "What will execute", so a
consumer can verify what a plugin runs before installing it.

### S2 — undeclared network-touching script
**Error under strict tier (else warning) · [`validate.ts`](../packages/core/src/validate.ts)**

A script matching network patterns (`curl`, `wget`, `fetch(`, `axios`,
`http.request`, `urllib`, `requests.get/post`, `Invoke-WebRequest`, …) must be
listed in `[policy]."network-allowlist"`. **Fix:** remove the network call, or
add the script path to the allowlist as a conscious, reviewable decision.

### S3 — hook command handlers must declare intent
**Warning · all profiles · [`schemas/hooks.ts`](../packages/core/src/schemas/hooks.ts) — not yet wired into any command**

The schema check exists (every `type: "command"` handler surfaces a warning
demanding a declared-intent comment adjacent to the hook), but no command
currently runs `validateHooksFile` over `hooks/` — the source slot is empty
today, and hook-set contents are copied into plugins unvalidated. Treat S3 as
the contract the first shipped hook set must meet, and expect the wiring to
land with it.

### S4 — secrets in shipped files
**Error · all profiles · [`validate.ts`](../packages/core/src/validate.ts)**

Pattern scan for private key blocks, AWS access key ids, GitHub PATs,
Anthropic API keys, and hardcoded credential assignments — applied to every
script and to the SKILL.md body. **Fix:** remove the secret and rotate it;
reference secrets by environment variable name instead.

### S5 — external marketplace sources must be sha-pinned
**Error under strict tier (else warning) · [`schemas/marketplace.ts`](../packages/core/src/schemas/marketplace.ts) — emitted by `generate`, not `validate`**

A marketplace plugin entry with a `github` or `url` source needs a `sha` pin
(supply-chain integrity). Relative-path sources (this repo's own plugins) and
`npm` sources (version-pinned) are exempt. The check runs when `generate`
validates the marketplace it just built — and since generated marketplaces use
only relative sources, S5 can only fire on a hand-authored or third-party
marketplace file.

### S6 — unassigned
Reserved; no rule currently emits S6.

### S7 — dependency manifests inside scripts/
**Warning · all profiles · [`validate.ts`](../packages/core/src/validate.ts)**

A `package.json` or `requirements.txt` inside a skill's `scripts/` means the
script bundle pulls third-party code at run time — audit before shipping.

## Running the tiers selectively

```sh
bun packages/cli/src/main.ts validate --tier quality    # V-rules only
bun packages/cli/src/main.ts validate --tier security   # S-rules only
bun packages/cli/src/main.ts validate --tier schema     # shape only
bun packages/cli/src/main.ts validate --profile cowork  # what the Cowork importer would reject
```

See the [CLI reference](../packages/cli/README.md) for flags and exit codes.
