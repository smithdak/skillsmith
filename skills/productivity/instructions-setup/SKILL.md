---
name: instructions-setup
description: >-
  Persists the communication contract into AGENTS.md, CLAUDE.md, or global
  files as a managed block. Use when the user says "set up the communication
  contract in this repo", "/instructions-setup", "persist these reply
  rules", or "make the agent report honestly project-wide". Not for the
  rules (communication-contract), agent instructions in general
  (writing-for-agents), or READMEs (readme-authoring).
license: MIT
metadata:
  skillsmith-composes: "communication-contract"
  skillsmith-see-also: "writing-for-agents"
  skillsmith-invocation: "model"
  skillsmith-maturity: "experimental"
---

# instructions-setup

Guided setup that lands the `communication-contract` rules as a managed
block in instruction files. Two deterministic scripts do the work; the
interview and the judgment stay conversational.

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

`managed` covers both the current v2 block and a v1 block from an earlier
install; either is updated in place at step 4.

### 2. Interview

Ask with concrete options, never open-ended:

1. **Scope** — repo `AGENTS.md`, repo `CLAUDE.md`, both, plus any global
   file. Global writes require explicit consent, every time.
2. **Tuning** — recommended default (all five modules, no caps) or custom:
   drop a module (`--rules` subset of
   `reporting,calibration,questions,brevity,progress`)? add a soft length
   line (`--caps soft`)? Point at `references/presets.md` when the user asks
   what a module contains or is holding v1 flag names — those still work
   and are mapped, with a note on stderr.

### 3. Handle the shadowing hazard

When `shadowing_hazard` is set and the user chooses
`~/.config/opencode/AGENTS.md`, say before asking consent that opencode will
stop reading `~/.claude/CLAUDE.md` entirely, and offer one fix: append a
one-line pointer into `~/.claude/CLAUDE.md` (or symlink one file to the
other) so neither loader loses its rules.

### 4. Preview, then apply

Run `scripts/apply-contract.sh --dry-run` with the chosen flags, show the
rendered block, get confirmation, then run it for real. The script replaces
an existing managed block in place — v1 included — and never touches
content outside the markers; unmanaged files get the block appended.

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
- The wording of the rules is `communication-contract`'s; this skill only
  places it. Other instruction-file content (conventions, boundaries, build
  commands) is authored under `writing-for-agents`.
