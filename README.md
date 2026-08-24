# skillsmith

[![CI](https://github.com/smithdak/skillsmith/actions/workflows/ci.yml/badge.svg)](https://github.com/smithdak/skillsmith/actions/workflows/ci.yml)
[![Bun](https://img.shields.io/badge/Bun-%E2%89%A51.3.14-000000?logo=bun&logoColor=white)](https://bun.sh)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**A library of ready-made skills for Claude Code — plus the tool that quality-checks and packages them.**

A *skill* is a small instruction pack that teaches Claude to do one job well — reviewing a pull request for security bugs, running test-driven development, writing a handoff document, modeling threats before an audit. This repo holds **53 skills**, bundled into **11 installable plugins**.

[Install](#install) · [Browse the skills](#plugins) · [How it works](#how-it-works) · [Write your own](#write-your-own) · [Documentation](#documentation)

## Install

In Claude Code, run:

```
/plugin marketplace add smithdak/skillsmith
/plugin install engineering-core@skillsmith-marketplace
```

> [!TIP]
> Browse everything first in **[catalog/CATALOG.md](catalog/CATALOG.md)** — every skill, what it's for, and a security inventory of anything it can execute. The security model is in [SECURITY.md](SECURITY.md).

## Plugins

Install individually — each skill belongs to exactly one plugin.

<!-- skillsmith:start -->
[![Skills](https://img.shields.io/badge/skills-53-brightgreen)](catalog/CATALOG.md)
[![Plugins](https://img.shields.io/badge/plugins-11-blue)](catalog/CATALOG.md)

**11 installable plugins, 53 skills, 2 agents.** Install individually — a skill belongs to exactly one plugin. Versions below are generated from `skillsmith.toml`; per-skill detail lives in [catalog/CATALOG.md](catalog/CATALOG.md).

| Plugin | Version | Skills | What it's for |
|---|---|---|---|
| **productivity-tools** + `cold-reader` agent | `0.2.0` | `cold-read` · `define-work-items` · `handoff` · `issue-triage` · `writing-for-agents` | Work discipline: handoffs, transitions, work-item definition, issue triage |
| **epistemics** + `falsification-reviewer` agent | `0.7.0` | `deep-research` · `discernment-nudge` · `estimate` · `falsification-review` · `grilling` · `ground-truth-research` · `premortem` · `research-note` · `second-order-effects` | Judgment discipline: elicitation grilling before work starts, premortems on agreed plans, falsification passes, adversarial review, crux identification, post-answer discernment nudges, live-source verification, durable research |
| **engineering-core** | `0.6.0` | `architecture-spec` · `codebase-survey` · `decision-record` · `discovery-map` · `doc-visuals` · `feature-spec` · `information-architecture` · `postmortem` · `prose-hygiene` · `readme-authoring` · `skill-authoring` · `wizard` | Engineering workflow orchestrators: specs, surveys, decisions, post-mortems, guided setup wizards — plus the information-architecture, doc-visuals, prose-hygiene, readme-authoring, and skill-authoring disciplines they compose |
| **code-craft** | `0.2.0` | `deep-modules` · `diagnose-bugs` · `tdd` | Implementation discipline: test-driven red-green loops, deep-module interface design, and disciplined root-cause diagnosis for bugs, flakes, and regressions |
| **security** | `0.1.1` | `define-security-policy` · `hardening-proposal` · `security-diff-review` · `threat-model` | Security review discipline: repository threat modeling, diff-scoped review with sibling-instance sweeps, decision-ready hardening proposals, and SECURITY.md authoring |
| **frontend** | `0.3.0` | `frontend-craft` · `frontend-critique` · `frontend-redesign` · `webapp-testing` | Frontend craft discipline: build high-craft web UI that refuses generic AI-default patterns, non-destructively audit and upgrade the craft of an existing interface, and verify UI behavior in a real browser with Playwright |
| **marketing** | `0.2.1` | `brand-voice` · `content-angles` · `content-scorer` · `growth-experiments` · `outbound-builder` · `podcast-repurposer` · `seo-brief` | Marketing discipline: content scoring, outbound sequences, content angle research, podcast repurposing, and growth experiment design |
| **tldraw-canvas** | `0.1.1` | `mermaid-to-tldraw` · `tldraw-animation` · `tldraw-diagram` · `tldraw-export` | tldraw canvas tooling: author editable .tldr files from a description, convert Mermaid into tldraw shapes, and export canvases to images |
| **secrets-ops** | `0.1.0` | `op-github-secrets` · `op-secrets` | 1Password-backed secret handling: convert projects to op:// references with op run, and load secrets into GitHub Actions via a scoped service account |
| **pr-workflow** | `0.1.1` | `stacked-prs` | Pull-request workflow discipline: landing and propagating review fixes across dependent GitHub PR stacks with the official gh stack extension |
| **agent-voice** | `0.1.0` | `output-contract` · `voice-setup` | How the agent talks: terse takeaway-last chat replies, summary-first files, one-line command reports — plus guided per-repo setup of those rules as managed instruction blocks |
<!-- skillsmith:end -->

Skills also work together — for example, the architecture-spec skill runs a built-in adversarial review before it finishes. Every such pairing is listed in the catalog.

## How it works

Think of it like a small compiler:

1. **Write** — each skill lives in `skills/` as plain markdown plus optional scripts. Humans edit these.
2. **Generate** — one command (`generate`) bundles them into the installable `plugins/`, the marketplace listing, and the catalog. Those files are never edited by hand.
3. **Check** — CI re-runs `generate` and fails if anything committed doesn't match exactly what it would produce, so the published artifacts always match the sources.

Along the way every skill passes validation rules: structure checks, quality rules (clear trigger descriptions, size limits), and security rules (every script is inventoried and hashed). Skills are also tested with evals that measure whether they fire when a real user asks — see [docs/evals.md](docs/evals.md).

> [!IMPORTANT]
> Never hand-edit `plugins/`, `.claude-plugin/marketplace.json`, or `catalog/`. If something looks wrong there, fix the source and rerun `generate`.

> [!WARNING]
> Changing what a plugin ships requires bumping its `version` in `skillsmith.toml` — installed plugins refresh by version number, so an unbumped change silently never reaches users. CI enforces this.

The pipeline, module boundaries, and design decisions: [docs/architecture.md](docs/architecture.md).

## Write your own

```sh
bun packages/cli/src/main.ts scaffold skill my-skill   # starts a draft in skills/drafts/
```

Then follow the short guide in [CONTRIBUTING.md](CONTRIBUTING.md); the full walkthrough is [docs/skill-authoring.md](docs/skill-authoring.md). Before opening a PR: `validate --strict && generate && check` must all pass.

To hack on the tool itself ([Bun](https://bun.sh) ≥ 1.3.14, no build step):

```sh
bun install
bun test                                # all tests live in packages/core/test/
cd packages/core && bunx tsc --noEmit   # typecheck
```

## Documentation

| Document | Contents |
|---|---|
| [docs/architecture.md](docs/architecture.md) | Pipeline design, module boundaries, why diagnostics are profile-scoped |
| [docs/skill-authoring.md](docs/skill-authoring.md) | Full authoring guide — anatomy, descriptions, references, scripts |
| [docs/validation-rules.md](docs/validation-rules.md) | Every V and S rule with the fix for each |
| [docs/evals.md](docs/evals.md) | How trigger-hit-rate measurement works and how to read results |
| [docs/configuration.md](docs/configuration.md) | `skillsmith.toml` reference — groupings and policy knobs |
| [packages/core](packages/core/README.md) · [packages/cli](packages/cli/README.md) | Package-level docs (all logic lives in core) |
| [SECURITY.md](SECURITY.md) · [NOTICES.md](NOTICES.md) | Security model; third-party attribution for adapted skills |
