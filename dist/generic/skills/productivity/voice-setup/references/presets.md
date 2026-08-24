# Presets and flags

`scripts/apply-contract.sh` renders the managed block from flags; this file
documents each knob and when to reach for it. The recommended default is:
all four bans on, reading order on, caps off.

## Flags

| Flag | Default | Meaning |
| --- | --- | --- |
| `--file PATH` | (required, repeatable) | Every instruction file to splice the block into. |
| `--no-reading-order` | off | Drops the "file content leads with the summary" line for users who only care about chat replies. |
| `--ban LIST` | `preambles,recaps,reexplain,bloat` | Comma-separated subset of the standing ban list to enforce. |
| `--caps soft` | `none` | Adds a soft ~10-line guidance line. Off by default: patterns outlast numeric caps as models drift. |
| `--dry-run` | off | Prints the rendered block and targets without writing. |

## Target selection

- Repo-wide rules: `AGENTS.md` (read by most harnesses) and/or `CLAUDE.md`
  (Claude Code fallback when no AGENTS.md exists).
- Machine-wide rules: `~/.config/opencode/AGENTS.md` (opencode global) or
  `~/.claude/CLAUDE.md` (Claude Code global).

Precedence hazard: opencode loads only the first matching global rules file
— creating `~/.config/opencode/AGENTS.md` shadows an existing
`~/.claude/CLAUDE.md`. When both matter, keep one canonical file and point
the other at it (symlink), or mirror the block in both.

## Rendered default block

```
<!-- agent-voice:output-contract v1 (managed; regenerate via voice-setup) -->

## Output contract (agent-voice)

- Chat replies end with the takeaway on the final line — the eye lands at the bottom of terminal scrollback.
- File content leads with the summary or conclusion; detail follows.
- Default to the shortest accurate form: flat bullets, no headings under six lines, tables only for 3+ comparisons.
- No preambles ("Let me...", "Great question") and no tool-call narration; state a multi-step plan once, in one line, then work silently.
- No post-task recap paragraphs; report edits as path:line plus one sentence only when intent is non-obvious.
- Do not re-explain code the diff already shows; explain decisions, not mechanics.
- No markdown bloat: no bold-heavy fragments, nested bullets, decorative headers, or horizontal rules in short answers.
- Command and test runs get one line: pass/fail; expand failures only (rule id, path:line).

<!-- /agent-voice:output-contract -->
```
