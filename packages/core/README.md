# @skillsmith/core

All of skillsmith's logic. The [CLI](../cli/README.md) is deliberately a zero-logic wrapper, so every behavior — discovery, validation, generation, drift-checking, evals, scaffolding — lives and is tested here.

```sh
bun test              # from repo root or from this package
bunx tsc --noEmit     # typecheck (from this package)
```

Runtime: Bun ≥ 1.3.14, TypeScript executed directly, no build step. Sole runtime dependency: `zod` v4.

## The pipeline

Modules are stages; each consumes the previous stage's output, and only the first one touches the filesystem for reads:

| Stage | Module | Contract |
|---|---|---|
| 1. Discover | `src/discovery.ts` | The **only** module that scans the filesystem. Returns parsed source objects; frontmatter is validated at parse time. |
| 2. Validate | `src/validate.ts` + `src/composition.ts` | Quality (V) and security (S) rules over discovered sources. Builds the script inventory (SHA-256, interpreter, network-touching detection) and skill→skill composition edges. |
| 3. Generate | `src/generate.ts` | Pure function `(discovery, config) → GeneratePlan` — a map of repo-relative path → content. No I/O; `writePlan()` applies it. |
| 4. Check | `src/check.ts` | Compares committed files against the *same plan bytes* generate would write. Reports drift as modified / stale / missing. That shared-bytes property is what makes the CI gate trustworthy. |
| 5. Eval | `src/eval.ts` | LLM-judge trigger evals: each skill's `evals/evals.json` cases are judged against the full catalog listing, producing a per-skill hit rate. Full runs write `.skillsmith/eval-results.json`, which feeds catalog badges. |

Supporting modules: `src/catalog.ts` (renders `CATALOG.md` from the plan inputs), `src/scaffold.ts` (init/scaffold file sets — never overwrites), `src/diagnostics.ts` (finding model, below), and `src/schemas/` (zod v4 schemas for every source shape; `generateJsonSchemas()` exports them as JSON Schema for editor tooling in `.skillsmith/schemas/`).

**Determinism guarantee:** generated output has schema-defined JSON key order (`canonicalJson()`), sorted lists, LF line endings, and a trailing newline. Same sources in, same bytes out — on any machine.

**Volatile surface data lives only in `src/constants.ts`** — `SCHEMA_TARGET`, length limits, known hook events, proven agent toolsets. When Claude Code changes behavior, that file is the single edit point.

## Diagnostics model

Every finding (`src/diagnostics.ts`) carries a rule id, a path-anchored location, a severity, and the set of **target profiles** it applies to — `standard` (Agent Skills open standard), `claude-code`, `cowork` — because these validators empirically enforce different rules. `forProfile()` filters findings; `exitCode()` maps them to process exits: errors always fail, warnings fail only under `--strict`.

## Rule reference

One line per rule; the fix-oriented deep reference is [docs/validation-rules.md](../../docs/validation-rules.md).

### Quality tier (V1–V14)

| Rule | Enforces |
|---|---|
| V1 | Skill `name` equals its directory name (kebab-case) |
| V2 | Listing projection (description + when-to-use) ≤ 1536 chars — the Claude Code listing surface |
| V3 | Description contains explicit trigger phrasing ("use when…", quoted user phrases) |
| V4 | Body ≤ 500 lines and ≈ ≤ 5000 tokens (policy `max-skill-body-tokens`; chars/4 estimate) |
| V5 | References at most one level deep; no reference→reference chains |
| V6 | Scripts have a shebang and the executable bit (bit check is a warning; skipped on Windows, CI covers it on Linux) |
| V7 | Imperative/infinitive voice, no first/second-person narration; agent descriptions need an `<example>` block |
| V8 | `evals/evals.json` present and valid: ≥ 3 should-trigger, ≥ 3 should-not-trigger, no TODO placeholders |
| V9 | Plugin-shipped agents may not declare `hooks`/`mcpServers`/`permissionMode` (privilege-escalation guard) |
| V10 | Many mutually-exclusive conditional sections → extract to `references/` (token economy) |
| V11 | No `CLAUDE.md` inside a skill directory — it is never loaded there |
| V12 | Composition edges must exist, not self-compose, not be user→user, and cross-plugin edges need the allowlist |
| V13 | Body must not instruct the model to show/explain its reasoning (refusal hazard on Fable 5) |
| V14 | Category folder is allowlisted and matches any declared category; drafts cannot be shipped in a plugin |

### Security tier (S1–S7)

| Rule | Enforces |
|---|---|
| S1 | Every shipped script is inventoried: path, interpreter, network flag, SHA-256 (surfaced in the catalog) |
| S2 | Network-touching scripts must be in `[policy]."network-allowlist"` |
| S3 | Hook command handlers must declare intent via a `comment` field on the handler |
| S4 | Secrets patterns (private keys, AWS keys, GitHub PATs, Anthropic API keys) fail in scripts, the SKILL.md body, and references |
| S5 | External marketplace sources must be sha-pinned (supply-chain) — emitted by `generate`, not `validate` |
| S6 | *(unassigned)* |
| S7 | Dependency manifests inside `scripts/` trigger an audit warning |

Severity of S2 and S5 scales with `[policy]."security-tier"` (this repo runs `strict`); the other S-rules have fixed severities. Skills in `skills/drafts/` are exempt from both tiers — schema validation only.

## Public API

Everything exports through `src/index.ts` (`"exports": { ".": "./src/index.ts" }`), grouped by stage:

- **Discovery** — `discover()`, `splitFrontmatter()`, `DiscoveryResult`
- **Validation** — `validateAll()`, `validateSkill()`, `validateComposition()`, `estimateTokens()`
- **Generation** — `buildPlan()`, `writePlan()`, `plannedPaths()`, `canonicalJson()`, `renderCatalog()`
- **Check** — `checkPlan()`, `CheckResult`, `Drift`
- **Evals** — `buildListing()`, `runTriggerEvals()`, `toResultsFile()`, `anthropicJudge()` (the `Judge` interface is injectable — tests use deterministic judges)
- **Scaffolding** — `buildInitFiles()`, `buildSkillScaffold()`, `applyScaffold()`, `appendPluginGrouping()`
- **Schemas** — a `validateX()` + zod schema + inferred type per source shape, plus `generateJsonSchemas()`
- **Diagnostics & constants** — `forProfile()`, `exitCode()`, `LIMITS`, `SCHEMA_TARGET`

## Tests

`test/` covers every pipeline stage against fixture sources: generation/drift round-trips, all schema validators, quality and security rules, composition edges, scaffold idempotence, and eval scoring with mock judges. The CLI package has no tests — by design, it has no logic to test; if you find yourself wanting a CLI test, the logic belongs here instead.
