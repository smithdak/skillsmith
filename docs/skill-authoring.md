# Authoring a skill — from scaffold to shipped

The complete path from idea to installable plugin, with every gate you will
hit on the way. The short version lives in [CONTRIBUTING.md](../CONTRIBUTING.md);
this is the long version with the reasoning attached. Failures you hit along
the way are decoded in the [validation rules reference](validation-rules.md).

## Anatomy of a skill

```
skills/<category>/<name>/
  SKILL.md            # frontmatter (the contract) + body (the briefing)
  evals/evals.json    # trigger cases — dev artifact, never ships
  scripts/            # optional: deterministic work as executable scripts
  references/         # optional: on-demand docs, exactly one level deep
```

The division of labor is the core authoring idea:

- **Frontmatter description** — decides *whether* the skill loads. It is the
  only part the model sees before invoking.
- **Body** — the briefing once loaded: goal, boundaries, verification. Capped
  at 500 lines / ~5000 tokens (V4) because it competes with the user's actual
  task for context.
- **`scripts/`** — anything deterministic (counting, hashing, inventory).
  Recomputing facts by reading files burns context and invites transcription
  errors; a script's answer is a fact.
- **`references/`** — detail loaded only when needed (templates, formats,
  checklists). One level deep, no reference→reference chains (V5).

## The lifecycle

### 1. Scaffold

```sh
bun packages/cli/src/main.ts scaffold skill my-skill
```

Creates `skills/drafts/my-skill/` with a stub SKILL.md and placeholder evals.
**Drafts are lenient**: schema parsing only — no quality/security rules, and
never included in generation. That is the point of the staging area: iterate
freely, gates bind at promotion.

### 2. Write the frontmatter

```yaml
---
name: my-skill                # must equal the folder name (V1)
description: >-
  What it does AND when to use it, with quoted user phrasings.
license: MIT
metadata:
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
user-invocable: true
---
```

Field reference — layer 1 is the [Agent Skills open standard](https://agentskills.io)
([schema](../packages/core/src/schemas/agent-skills-standard.ts)), layer 2 the
Claude Code extensions ([schema](../packages/core/src/schemas/claude-code-frontmatter.ts)):

| Field | Notes |
|---|---|
| `name` | kebab-case, ≤64 chars, equals folder name, no "claude"/"anthropic" (V1) |
| `description` | ≤1024 chars; with `when_to_use` shares a 1536-char listing cap (V2) |
| `license` | this repo ships MIT per skill |
| `metadata` | string→string map; the `skillsmith-*` conventions below live here |
| `when_to_use` | optional extra trigger text; counts against the V2 cap |
| `user-invocable` | expose as a `/slash` command |
| `disable-model-invocation` | only the user can trigger it (see `discovery-map` for a real use) |
| `argument-hint` | valid in Claude Code, **fails the Cowork importer** — avoid |
| `model` / `effort` / `context: fork` / `agent` | execution overrides; use sparingly |

`metadata."skillsmith-*"` conventions (validated where noted):

| Key | Values | Consumed by |
|---|---|---|
| `skillsmith-invocation` | `user` \| `model` \| `both` (default `model`) | catalog column; V12 legality — user-invoked may not compose user-invoked |
| `skillsmith-maturity` | `stable` \| `experimental` (default) | catalog column |
| `skillsmith-composes` | comma-separated skill names | V12 edge validation, catalog "Composes" line |
| `skillsmith-see-also` | comma-separated skill names | acknowledges non-invoking mentions so V12 doesn't flag drift |
| `skillsmith-category` | must equal the folder if present (V14) | plugin manifest keywords |
| `skillsmith-plugin` | must match the claiming grouping | generate-time cross-check |
| `skillsmith-inspired-by` | free text attribution | humans |

### 3. Write the description — it is the product

The description is the trigger surface: the judge (and the real runtime)
chooses among *all* catalog descriptions, so yours competes with its siblings.
The pattern that survives evals, taken from shipped skills:

> Verifies that a document is self-sufficient for its intended audience —
> readable and actionable with zero access to the conversation or author.
> **Use this skill** before presenting any document someone else will act on
> (handoffs, work items, runbooks, READMEs, onboarding docs), or **when the
> user asks** "will this make sense without me", "check this is
> self-contained" […] **Not for** correctness review, copyediting, or
> summarization. — `cold-read`

Three moving parts, all load-bearing:

1. **What it does** — one sentence, specific enough to differentiate from siblings.
2. **When** — "use when the user says…", with *quoted phrasings real users
   type* (V3 warns without them).
3. **Not-for boundary** — steers near-miss requests to the right sibling;
   this is what makes `should_not_trigger` evals pass.

### 4. Write the body

Goal, boundaries, and verification — not micro-checklists. The house style,
observable in any shipped skill:

- **Imperative/infinitive voice** ("Run the script", never "I will run the
  script" — V7).
- **State the why next to the what** — a rule whose reason is visible survives
  contact with edge cases; a bare rule gets misapplied.
- **A verification section at the end**: what the skill checks before
  returning, so quality is enforced, not hoped for.
- Never instruct the model to show/explain its reasoning (V13 — refusal
  hazard); ask for structured output instead.
- Three or more `## If …`/`## When …` sections means the body should route to
  `references/` files instead (V10).

Scripts must have shebangs and be executable (V6), must not contain secrets
(S4), and must not touch the network unless allowlisted in
`[policy]."network-allowlist"` (S2) — every script ships with its SHA-256 in
the [catalog's script inventory](../catalog/CATALOG.md) (S1), so consumers can
audit exactly what will execute.

### 5. Declare composition, don't just mention it

If the body tells the model to run another skill's discipline, declare the
edge in `skillsmith-composes` — declaration is what makes it lintable (V12).
If the body merely *mentions* a sibling to draw a boundary ("correctness is
falsification-review's axis"), acknowledge it in `skillsmith-see-also`
instead. Edges that cross plugin boundaries are soft dependencies and need a
`[policy]."composition-allowlist"` entry —
[configuration reference](configuration.md#composition-allowlist).

Legality rule: a user-invoked skill may not compose another user-invoked
skill (composing `model`- or `both`-invocation skills is fine). Orchestrators
compose disciplines, not each other.

### 6. Write real evals

≥3 should-trigger and ≥3 should-not-trigger cases, phrased the way users
actually type, with near-miss negatives. Full guidance: [Evals](evals.md).

### 7. Promote

```sh
git mv skills/drafts/my-skill skills/engineering/my-skill
```

…then add `"my-skill"` to a `[[plugin]]`'s `skills` array in
[`skillsmith.toml`](../skillsmith.toml). Category must be in
`[categories].allowed` (`engineering` | `productivity` | `misc` here);
a skill belongs to exactly one plugin.

### 8. Gate

```sh
bun packages/cli/src/main.ts validate --strict \
  && bun packages/cli/src/main.ts generate \
  && bun packages/cli/src/main.ts check
```

All three must pass before a PR ([CI](../.github/workflows/ci.yml) runs
`validate --strict`, `check`, `bun test`, and the typecheck — `check`
subsumes `generate` byte-for-byte). Commit the regenerated `plugins/`,
`catalog/`, and `.claude-plugin/` files together with your source change —
`check` fails on any byte of drift. Then run a full
`eval` when the description is new or changed ([why and how](evals.md)) and
commit the refreshed results + catalog.

## Agents, hooks, MCP servers

Skills are the mature path; the other source types assemble the same way
(scaffold → source dir → grouping in `skillsmith.toml` → generate):

- **Agents** (`agents/<name>.md`) — subagent definitions. The description
  needs an `<example>` block (V7) — see
  [`agents/falsification-reviewer.md`](../agents/falsification-reviewer.md)
  for the house pattern. Plugin-shipped agents may not declare `hooks`,
  `mcpServers`, or `permissionMode` (V9, privilege-escalation guard), and
  Cowork-bound agents should stick to `model: inherit` and the proven
  toolsets ([schema](../packages/core/src/schemas/agent-frontmatter.ts)).
- **Hooks** (`hooks/<set>/hooks.json`) — one set per plugin in v0.1; command
  handlers carry a declared-intent comment (S3 — the [schema](../packages/core/src/schemas/hooks.ts)
  exists but is not yet run by any command; expect the wiring to land with
  the first shipped hook set).
- **MCP servers** (`mcp/<name>.mcp.json`) — merged per plugin into one
  `.mcp.json`; duplicate server keys are errors.
