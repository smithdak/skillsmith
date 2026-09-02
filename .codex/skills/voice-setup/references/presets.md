# Presets and flags

`scripts/apply-contract.sh` renders the managed block from flags; this file
documents each knob and when to reach for it. The recommended default is:
all five reply rules on, reading order on, caps off.

## Flags

| Flag | Default | Meaning |
| --- | --- | --- |
| `--file PATH` | (required, repeatable) | Every instruction file to splice the block into. |
| `--no-reading-order` | off | Drops the "file content leads with the summary" line for users who only care about chat replies. |
| `--rules LIST` | `preambles,narration,recaps,reexplain,format` | Comma-separated subset of the reply rules to render. `--ban` is the pre-0.2 spelling; its `bloat` key still selects `format`. |
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
- Default to the shortest accurate form; reach for bullets, tables, or headings only where the structure carries meaning.
- No preambles ("Let me...", "Great question"); the first sentence carries substance.
- Narrate work only where the user gains by hearing it: name a multi-step plan once, and report what changed when a long step ends. Do not announce each individual read or search.
- No post-task recap paragraphs; report edits as path:line plus one sentence only when intent is non-obvious.
- Do not re-explain code the diff already shows; explain decisions, not mechanics.
- Format for the reader, not for emphasis: plain sentences unless the content is genuinely a list, a comparison, or a sectioned document.
- Command and test runs get one line: pass/fail; expand failures only (rule id, path:line).

<!-- /agent-voice:output-contract -->
```
