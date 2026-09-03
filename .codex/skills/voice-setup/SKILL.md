---
name: "voice-setup"
description: "Interactive guided setup that persists the output-contract reply rules into real instruction files: detects which harness surfaces exist (AGENTS.md, CLAUDE.md, opencode configs, global scopes), interviews for scope and rule toggles, renders a marker-delimited managed block via scripts, and verifies the result idempotently. Use when the user says \"set up the output contract\", \"/voice-setup\", \"make replies concise in this repo\", \"configure the agent output style\", \"persist these conciseness rules\", or wants terse output applied project-wide or machine-wide. Not for refactoring code to be shorter, editing README prose, explaining harness config formats for their own sake, or one-off rewording that is never persisted."
license: "MIT"
metadata:
  skillsmith-composes: "output-contract"
  skillsmith-invocation: "model"
  skillsmith-maturity: "experimental"
  skillsmith-see-also: "writing-for-agents"
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
- `repo_opencode_dir` / `repo_opencode_config` / `global_opencode_config`:
  presence signals only — they confirm opencode is in use, which makes
  `AGENTS.md` (repo) or `~/.config/opencode/AGENTS.md` (global) the right
  target. The block is never written into JSON config.
- `shadowing_hazard`: warns that creating the global opencode AGENTS.md will
  shadow an existing `~/.claude/CLAUDE.md` fallback.

### 2. Interview

Ask with concrete options, never open-ended:

1. **Scope** — repo `AGENTS.md`, repo `CLAUDE.md`, both, plus any global
   file. Global writes require explicit consent, every time.
2. **Tuning** — recommended default (all five reply rules, reading order
   on, no caps) or custom: drop the file rule (`--no-reading-order`)? add a
   soft length line (`--caps soft`)? drop any reply rule (`--rules` subset
   of `preambles,narration,recaps,reexplain,format`)? Point at
   `references/presets.md` when the user asks what a toggle does.

### 3. Handle the shadowing hazard

When `shadowing_hazard` is set and the user chooses
`~/.config/opencode/AGENTS.md`, say before asking consent that opencode will
stop reading `~/.claude/CLAUDE.md` entirely, and offer one fix: append a
one-line pointer into `~/.claude/CLAUDE.md` (or symlink one file to the
other) so neither loader loses its rules.

### 4. Preview, then apply

Run `scripts/apply-contract.sh --dry-run` with the chosen flags, show the
rendered block, get confirmation, then run it for real. The script replaces
an existing managed block in place and never touches content outside the
markers; unmanaged files get the block appended.

### 5. Verify and report

Re-run `scripts/detect-harnesses.sh`: every chosen target must now read
`managed`; anything else is a failed apply. Then report one line per target
using apply-contract's own output (`created | updated | appended <path>`) and
remind that instruction files load at session start — quit and restart the
agent session for them to take effect.

## Boundaries

- Never write outside the chosen `--file` targets; the scripts create no
  backups because they destroy nothing outside markers.
- Never flip a toggle the user did not choose; the recommended default still
  requires their pick.
- Re-running setup on a `managed` file is an update, not a duplicate.
