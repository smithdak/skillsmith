---
name: "voice-setup"
description: "Interactive guided setup that persists the output-contract reply rules into real instruction files: detects which harness surfaces exist (AGENTS.md, CLAUDE.md, opencode configs, global scopes), interviews for scope and rule toggles, renders a marker-delimited managed block via scripts, and verifies the result idempotently. Use when the user says \"set up the output contract\", \"/voice-setup\", \"make replies concise in this repo\", \"configure the agent output style\", \"persist these conciseness rules\", or wants terse output applied project-wide or machine-wide. Not for refactoring code to be shorter, editing README prose, explaining harness config formats for their own sake, or one-off rewording that is never persisted."
license: "MIT"
metadata:
  skillsmith-composes: "output-contract"
  skillsmith-invocation: "model"
  skillsmith-maturity: "experimental"
---

# voice-setup

Guided setup that lands the `output-contract` rules as a managed block in
instruction files. Two deterministic scripts do the work; the interview and
judgment stay conversational.

## Workflow

### 1. Detect surfaces

Run `scripts/detect-harnesses.sh` from the repo root. Read every KEY=VAL
line before asking anything — the answers determine which targets are worth
offering:

- `repo_agents_md` / `repo_claude_md`: `absent`, `unmanaged`, or `managed`.
- `global_claude_md` / `global_opencode_agents_md`: same states, under `$HOME`.
- `shadowing_hazard`: warns that creating the global opencode AGENTS.md will
  shadow an existing `~/.claude/CLAUDE.md` fallback.

### 2. Interview

Ask with concrete options, never open-ended:

1. **Scope** — repo `AGENTS.md`, repo `CLAUDE.md`, both, plus any global
   file. Global writes require explicit consent, every time.
2. **Tuning** — recommended default (all bans, reading order on, no caps) or
   custom: drop reading-order? soften caps on (`--caps soft`)? drop any ban
   item (`--ban` subset)? Point at `references/presets.md` semantics when
   the user asks what a toggle does.

### 3. Preview, then apply

Run `scripts/apply-contract.sh --dry-run` with the chosen flags, show the
rendered block, get confirmation, then run it for real. The script replaces
an existing managed block in place and never touches content outside the
markers; unmanaged files get the block appended.

### 4. Handle the shadowing hazard

When targeting `~/.config/opencode/AGENTS.md` while `~/.claude/CLAUDE.md`
exists without the contract, say so plainly and offer one fix: append a
one-line pointer into `~/.claude/CLAUDE.md` (or symlink one file to the
other) so neither loader loses its rules.

### 5. Verify and report

Re-run `scripts/detect-harnesses.sh` and report one line per target:
`created | updated | appended <path>`. Remind that instruction files load at
session start — quit and restart the agent session for them to take effect.

## Boundaries

- Never write outside the chosen `--file` targets; the scripts create no
  backups because they destroy nothing outside markers.
- Never flip a toggle the user did not choose; the recommended default still
  requires their pick.
- Re-running setup on a `managed` file is an update, not a duplicate.
