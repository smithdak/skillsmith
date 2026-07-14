# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A Claude Code skills monorepo managed by its own tool, **skillsmith**: skills/agents are authored as sources, and installable plugins + marketplace + catalog are *generated* from them. The tool itself lives in `packages/`.

## Commands

Bun is the runtime (>=1.3.14); TypeScript runs directly, there is no build step.

```sh
bun install                      # install workspace deps
bun test                         # all tests (they live in packages/core/test/)
bun test packages/core/test/validate.test.ts        # single file
bun test --test-name-pattern "drift"                # by test name
cd packages/core && bunx tsc --noEmit                # typecheck
```

The CLI (no bin link — run the entry directly from repo root):

```sh
bun packages/cli/src/main.ts validate --strict   # schema + quality (V) + security (S) tiers
bun packages/cli/src/main.ts generate            # emit plugins/, marketplace.json, catalog/
bun packages/cli/src/main.ts check               # CI drift gate: committed artifacts == generate output
bun packages/cli/src/main.ts scaffold skill <name>   # new skill in skills/drafts/
bun packages/cli/src/main.ts eval                # trigger-hit-rate evals; needs ANTHROPIC_API_KEY
```

Pre-PR gate (from CONTRIBUTING.md): `validate --strict && generate && check` must all pass.

## Source vs generated — the core invariant

**Sources (hand-edited):** `skills/<category>/<name>/`, `agents/`, `hooks/`, `mcp/`, `commands/`, and `skillsmith.toml` (plugin groupings + policy).

**Generated (never hand-edit):** `plugins/`, `.claude-plugin/marketplace.json`, `catalog/CATALOG.md`, `.skillsmith/schemas/`. Fix the source and rerun `generate`; `check` fails CI on any drift.

`skillsmith.toml` assigns each skill to exactly one `[[plugin]]` grouping and sets `[policy]` knobs (token caps, `min-trigger-hit-rate` 0.85, `composition-allowlist` for skill→skill references). `skills/drafts/` is lenient and excluded from generation; promoting a skill = moving its folder to a domain category (`engineering` | `productivity` | `misc`) and adding it to a plugin in the toml.

## Architecture of packages/

- `packages/cli` — thin citty wrapper, deliberately zero logic: load config, call core, render diagnostics, exit codes.
- `packages/core` — everything, structured as a pipeline:
  1. `discovery.ts` — the only module that scans the filesystem; returns parsed source objects (frontmatter validated at parse time).
  2. `validate.ts` + `composition.ts` — quality (V1–V14) and security (S1–S7) rules over discovered sources; builds script inventories (sha256, network-touching detection) and composition edges.
  3. `generate.ts` — pure function `(discovery, config) → GeneratePlan` (map of repo-relative path → content). Deterministic output: schema-defined JSON key order, sorted lists, LF, trailing newline.
  4. `check.ts` — compares committed files against the *same* plan bytes `generate` would write, which is what makes the drift gate trustworthy.
  5. `eval.ts` — LLM-judge trigger evals against each skill's `evals/evals.json`; full runs write `.skillsmith/eval-results.json` (committed; feeds catalog badges).

**Diagnostics are profile-scoped** (`diagnostics.ts`): every finding carries the set of target validators it applies to — `standard` (Agent Skills open standard), `claude-code`, `cowork` — because these enforce empirically *different* rules. Errors always fail; warnings fail only under `--strict`.

**Volatile Claude Code surface data lives only in `packages/core/src/constants.ts`** (SCHEMA_TARGET, length limits, known hook events, proven agent toolsets). When Claude Code changes behavior, that file is the single edit point.

Schemas are zod v4 (`packages/core/src/schemas/`); JSON Schemas in `.skillsmith/schemas/` are generated from them for editor tooling.

## Skill-authoring rules (from CONTRIBUTING.md)

- The description is the trigger surface: what it does AND when, with quoted user phrasings.
- Body ≤500 lines / 5000 tokens; deterministic work goes in `scripts/`, on-demand docs in `references/` (one level deep).
- `evals/evals.json` needs ≥3 should-trigger and ≥3 should-not-trigger cases with real phrasings, not paraphrases of the description.
- Never instruct the model to show/explain its reasoning (rule V13 rejects it).
