# Presets and flags

`scripts/apply-contract.sh` renders the managed block from flags; this file
documents each knob and when to reach for it. The recommended default is:
all five modules on, caps off.

## Modules

`--rules` takes a comma-separated subset of these five. Each renders two to
four bullet lines; the block always carries the modules in this order.

| Module | Covers | Rendered lines |
| --- | --- | --- |
| `reporting` | Outcome first; the message stands alone; faithful reporting of failures, skips, and unverified claims | 3 |
| `calibration` | Observed vs inferred vs assumed; confidence with its driver; no false precision | 2 |
| `questions` | Assumptions over questions; disagree plainly, then build | 2 |
| `brevity` | No sycophancy; expand deliberately; format for the reader | 3 |
| `progress` | One line before a multi-step task, a short update when a long step ends or the plan changes | 1 |

## Flags

| Flag | Default | Meaning |
| --- | --- | --- |
| `--file PATH` | (required, repeatable) | Every instruction file to splice the block into. |
| `--rules LIST` | `reporting,calibration,questions,brevity,progress` | Comma-separated subset of the modules to render. |
| `--caps soft` | `none` | Adds a soft ~10-line guidance line. Off by default: patterns outlast numeric caps as models drift. |
| `--dry-run` | off | Prints the rendered block and targets without writing. |

## Legacy (v1) keys

Flags and rule keys from the v1 block are still accepted. Each one is
mapped onto its v2 module and reported once on stderr as
`mapped legacy flag <old> -> <new>`, so an old command line keeps working
without a silent change in meaning.

| v1 flag or key | v2 equivalent |
| --- | --- |
| `--ban LIST` | `--rules LIST` |
| `--no-reading-order` | no-op (v2 has no file-order line) |
| `preambles` | `brevity` |
| `narration` | `progress` |
| `recaps` | `reporting` |
| `reexplain` | `brevity` |
| `format` / `bloat` | `brevity` |

A v1 block already in a file is replaced in place on the next apply: the
splice matches on the marker prefix `agent-voice:output-contract`, which is
kept byte-identical across versions for exactly this reason.

## Target selection

- Repo-wide rules: `AGENTS.md` (read by most harnesses) and/or `CLAUDE.md`
  (Claude Code fallback when no AGENTS.md exists).
- Machine-wide rules: `~/.config/opencode/AGENTS.md` (opencode global) or
  `~/.claude/CLAUDE.md` (Claude Code global).

Precedence hazard: opencode loads only the first matching global rules file
— creating `~/.config/opencode/AGENTS.md` shadows an existing
`~/.claude/CLAUDE.md`. When both matter, keep one canonical file and point
the other at it (symlink), or mirror the block in both.
(opencode global-rules lookup order as of opencode 1.18.25, September 2026;
re-verify against opencode's rules docs when this hazard fires unexpectedly.)

## Rendered default block

```
<!-- agent-voice:output-contract v2 (managed; regenerate via instructions-setup) -->

## Communication contract (agent-instructions)

- Lead with the outcome: the first sentence is the answer, the result, or the thing that could not be verified; the last line, if any, is the next action.
- Write every message to stand alone: the reader saw no tool calls. Name the file, quote the error verbatim in a code block, say who wrote a message and what it said, expand uncommon acronyms once, and use no names coined during the session.
- Report faithfully: failed tests, skipped steps, and unverified claims are stated first and plainly, with the output; done-and-verified is stated without hedging; "mostly" is never rounded up to "done".
- Mark what was observed, what was inferred, and what was assumed; give confidence together with its driver; say what evidence would change the answer.
- No false precision: a guess stated as a number is still a guess.
- For reversible work, proceed on a stated assumption and name it. Ask only when readings diverge materially, when the action is hard to reverse, or when the answer is the user's alone to give — one question at a time, with options.
- When the premise or plan has a real problem, say so in a sentence or two, then continue under stated assumptions; if the user reaffirms, that is the decision.
- No praise of the question, no performative agreement, no apology loops, no restating the request back.
- Brevity is a default, not a ceiling: a real tradeoff, an unfamiliar failure mode, or a teaching request gets structure and length.
- Format for the reader: bullets for parallel items, tables for numbers, code blocks for commands, paths, and errors, prose for an argument; headings only in long documents.
- Before a multi-step task, one line on what is about to happen; when a long step finishes or the plan changes, a short update. Silence through a long task is the worse failure.

<!-- /agent-voice:output-contract -->
```
