# skillsmith

[![CI](https://github.com/smithdak/skillsmith/actions/workflows/ci.yml/badge.svg)](https://github.com/smithdak/skillsmith/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/tag/smithdak/skillsmith?label=release&sort=semver)](CHANGELOG.md)
[![Bun](https://img.shields.io/badge/Bun-%E2%89%A51.3.14-000000?logo=bun&logoColor=white)](https://bun.sh)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**An engineering pipeline for agent skills — validated, measured, versioned, and built for more than one harness — plus the 50-skill catalog it maintains.**

A *skill* is a small instruction pack that teaches a coding agent to do one job well: review a diff for security bugs, run test-driven development, write a handoff, model threats before an audit. Most skill repositories are a folder of markdown that nobody measures. This one treats skills as software: every skill has a schema, a security inventory, a version, a changelog entry, and a **measured trigger rate** — and one command compiles the sources into installable plugins for Claude Code and plain Agent-Skills trees for Codex and OpenCode.

[Quick start](#quick-start) · [What it does](#what-it-does) · [The catalog](#the-catalog) · [How it works](#how-it-works) · [Use it on your own skills](#use-it-on-your-own-skills) · [Documentation](#documentation)

## What it does

- **Validates** every skill against 16 quality rules and 7 security rules — trigger-description craft, size ceilings, dated prompting patterns that regress on current models, hashed script inventories, network-touching detection — with findings scoped to the harness that enforces them ([rule reference](docs/validation-rules.md)).
- **Generates** four targets from one source tree: Claude Code plugins and a marketplace listing, and dependency-free Agent-Skills trees for Codex, OpenCode, and any other SKILL.md-standard harness. Generated output is never hand-edited; CI fails on drift.
- **Measures** whether each skill actually fires when a real user asks. A judge model routes every eval case against the *whole* catalog, so a skill is scored on how well it separates from its neighbours. Runs take a majority of three votes, escalate split cases to nine, and record the description, eval-case, and catalog hashes each number was measured against — so a badge can never quote a figure for text that no longer exists ([how evals work](docs/evals.md)).
- **Versions** every plugin and refuses a content change without a bump — installed plugins refresh by version, never by content — and refuses a bump without a changelog entry a consumer can read.

## Quick start

**Install skills into Claude Code:**

```
/plugin marketplace add smithdak/skillsmith
/plugin install engineering-core@skillsmith-marketplace
```

**Use them from Codex or OpenCode:** copy the tree under [`dist/generic/`](dist/generic/) (or the harness-specific ones under `.codex/skills/` and `.opencode/skills/`) into your harness's skills directory. Same sources, no Claude Code dependency.

> [!TIP]
> Browse before installing: [catalog/CATALOG.md](catalog/CATALOG.md) lists every skill, its measured trigger rate, and a security inventory of anything it can execute. The security model is in [SECURITY.md](SECURITY.md).

## The catalog

<!-- skillsmith:start -->
[![Skills](https://img.shields.io/badge/skills-50-brightgreen)](catalog/CATALOG.md)
[![Plugins](https://img.shields.io/badge/plugins-10-blue)](catalog/CATALOG.md)

**10 installable plugins, 50 skills, 2 agents.** Install individually — a skill belongs to exactly one plugin. Versions below are generated from `skillsmith.toml`; per-skill detail lives in [catalog/CATALOG.md](catalog/CATALOG.md).

| Plugin | Version | Skills | What it's for |
|---|---|---|---|
| **productivity-tools** + `cold-reader` agent | `0.4.0` | `cold-read` · `define-work-items` · `handoff` · `issue-triage` · `writing-for-agents` | Work discipline: handoffs, transitions, work-item definition, issue triage |
| **epistemics** + `falsification-reviewer` agent | `0.9.0` | `deep-research` · `discernment-nudge` · `estimate` · `falsification-review` · `grilling` · `ground-truth-research` · `premortem` · `research-note` · `second-order-effects` | Judgment discipline: elicitation grilling before work starts, premortems on agreed plans, falsification passes, adversarial review, crux identification, post-answer discernment nudges, live-source verification, durable research |
| **engineering-core** | `0.8.0` | `architecture-spec` · `codebase-survey` · `decision-record` · `discovery-map` · `doc-visuals` · `feature-spec` · `information-architecture` · `postmortem` · `prose-hygiene` · `readme-authoring` · `skill-authoring` · `wizard` | Engineering workflow orchestrators: specs, surveys, decisions, post-mortems, guided setup wizards — plus the information-architecture, doc-visuals, prose-hygiene, readme-authoring, and skill-authoring disciplines they compose |
| **code-craft** | `0.4.0` | `deep-modules` · `diagnose-bugs` · `retrofit-tests` · `tdd` | Implementation discipline: test-driven red-green loops, characterization tests for code that has none, deep-module interface design, and disciplined root-cause diagnosis for bugs, flakes, and regressions |
| **security** | `0.2.0` | `define-security-policy` · `hardening-proposal` · `security-diff-review` · `threat-model` | Security review discipline: repository threat modeling, diff-scoped review with sibling-instance sweeps, decision-ready hardening proposals, and SECURITY.md authoring |
| **frontend** | `0.4.0` | `frontend-craft` · `frontend-critique` · `frontend-redesign` · `webapp-testing` | Frontend craft discipline: build high-craft web UI that refuses generic AI-default patterns, non-destructively audit and upgrade the craft of an existing interface, and verify UI behavior in a real browser with Playwright |
| **marketing** | `0.3.0` | `brand-voice` · `content-angles` · `content-scorer` · `growth-experiments` · `outbound-builder` · `podcast-repurposer` · `seo-brief` | Marketing discipline: content scoring, outbound sequences, content angle research, podcast repurposing, and growth experiment design |
| **secrets-ops** | `0.2.0` | `op-github-secrets` · `op-secrets` | 1Password-backed secret handling: convert projects to op:// references with op run, and load secrets into GitHub Actions via a scoped service account |
| **pr-workflow** | `0.2.0` | `stacked-prs` | Pull-request workflow discipline: landing and propagating review fixes across dependent GitHub PR stacks with the official gh stack extension |
| **agent-voice** | `0.3.0` | `output-contract` · `voice-setup` | How the agent talks: terse takeaway-last chat replies, summary-first files, one-line command reports — plus guided per-repo setup of those rules as managed instruction blocks |
<!-- skillsmith:end -->

Skills compose — `architecture-spec` runs a falsification pass before it finishes; `feature-spec` hands the reader off to `cold-read`. Every declared pairing is in the catalog. Adapted skills carry their attribution in [NOTICES.md](NOTICES.md).

## How it works

A small compiler with a drift gate:

1. **Write** — a skill is a directory under `skills/<category>/`: `SKILL.md` (frontmatter + body), optional `references/` loaded on demand, optional `scripts/` for deterministic work, and `evals/evals.json` with real user phrasings that should and should not trigger it. Agents and commands live alongside. Humans edit only these.
2. **Validate** — `validate --strict` runs the schema, quality, and security tiers and re-gates on the committed eval results: a skill below the policy floor, or one whose description or cases changed since it was measured, fails the build.
3. **Generate** — `generate` emits `plugins/`, the marketplace manifest, the catalog, and the generic and harness-specific trees, deterministically: sorted keys, LF, trailing newline.
4. **Check** — `check` recomputes the same plan and fails if anything committed differs by a byte. `version-guard` compares each plugin's shipped bytes to the base branch and fails a change without a bump.

> [!IMPORTANT]
> `plugins/`, `.claude-plugin/`, `catalog/`, `dist/`, `.codex/`, and `.opencode/` are generated. Fix the source and rerun `generate`; CI rejects hand edits as drift.

> [!WARNING]
> A description edit changes what *every* skill is judged against, not just one. Re-measure both sides of any boundary you touch before trusting the number, and edit one boundary at a time — rewriting many at once shifts routing on skills whose text never changed. The measured version of that rule is in [skill-authoring](skills/engineering/skill-authoring/SKILL.md).

The pipeline, module boundaries, and design decisions: [docs/architecture.md](docs/architecture.md).

## Use it on your own skills

The tool is not tied to this catalog. Point it at any repository laid out the same way — `skills/`, optional `agents/`, and a `skillsmith.toml` naming plugins and policy — from a checkout of this repo:

```sh
bun packages/cli/src/main.ts validate --strict --cwd ../your-skills-repo
bun packages/cli/src/main.ts generate --cwd ../your-skills-repo
bun packages/cli/src/main.ts eval --cwd ../your-skills-repo --repeat 3 --escalate 9   # needs ANTHROPIC_API_KEY
```

`skillsmith.toml` sets the harness targets, the plugin groupings, and the policy knobs — body token caps, minimum trigger rate, the allowlist for skill-to-skill composition ([configuration reference](docs/configuration.md)). It is not yet published to a package registry; running from a checkout with `--cwd` is the supported path today.

To write a skill here:

```sh
bun packages/cli/src/main.ts scaffold skill my-skill   # starts a draft in skills/drafts/
```

then follow [CONTRIBUTING.md](CONTRIBUTING.md) and the full [authoring guide](docs/skill-authoring.md). The pre-PR gate is `validate --strict && generate && check`.

To hack on the tool ([Bun](https://bun.sh) ≥ 1.3.14, no build step):

```sh
bun install
bun test                                # packages/core/test/
cd packages/core && bunx tsc --noEmit   # typecheck
```

## Documentation

| Document | Contents |
|---|---|
| [docs/architecture.md](docs/architecture.md) | Pipeline design, module boundaries, why diagnostics are profile-scoped |
| [docs/skill-authoring.md](docs/skill-authoring.md) | Full authoring guide — anatomy, descriptions, references, scripts, evals |
| [docs/validation-rules.md](docs/validation-rules.md) | Every V and S rule with the fix for each |
| [docs/evals.md](docs/evals.md) | Trigger measurement: votes, escalation, provenance, cost, how to read a result |
| [docs/configuration.md](docs/configuration.md) | `skillsmith.toml` reference — targets, groupings, policy knobs |
| [CHANGELOG.md](CHANGELOG.md) | What changed in each shipped plugin version |
| [packages/core](packages/core/README.md) · [packages/cli](packages/cli/README.md) | Package-level docs (all logic lives in core) |
| [SECURITY.md](SECURITY.md) · [NOTICES.md](NOTICES.md) | Security model; third-party attribution for adapted skills |
