# Changelog

Plugins are versioned and installed independently, so this file is organised by
plugin rather than by date. Claude Code refreshes an installed plugin by
version, never by content, which is why `version-guard` fails a content change
without a bump — and why every current version below has an entry.

Entries cover each plugin's **current** version. Earlier versions are in git
history; this file starts where the changelog rule (V16) began.

## agent-voice 0.2.0

- Removed the tool-call-narration suppressor from the output contract and the
  managed block it writes into instruction files. It was tuned against models
  that over-narrated; current models under-narrate, so the rule subtracted
  updates the reader wanted. Replaced with a rule stating when narration helps.
- Split narration from the `preambles` toggle — they shared one key, so
  dropping one meant dropping both. `--ban` is now `--rules`; the old flag and
  its `bloat` key still work.
- Replaced the style tic-lists, the blanket markdown ban, and the numeric
  clamps ("no headings under six lines", "tables only for 3+") with rules that
  say when structure is wanted.
- Fixed the managed-block splice: it matched the full start marker including
  the version, so a block written by any other version was appended below the
  stale one instead of replacing it, leaving two contract blocks in a user's
  own AGENTS.md. Matching is now version-agnostic.

## engineering-core 0.7.0

- `feature-spec` no longer competes with `define-work-items`. Its description
  lists "user stories" among its output but its boundary clause never named its
  nearest neighbour, so "turn this discussion into user stories" routed to
  `feature-spec` 8 times in 9 despite being `define-work-items`' own trigger
  phrasing. Adding that boundary took the case from 1/9 to 14/14, with
  `feature-spec` itself unchanged at 15/15 (`--repeat 9`).

- `skill-authoring` states that the strictness line moves with the model:
  scaffolding a weaker generation needed — enumerated steps for judgment work,
  emphasis for once-underweighted instructions, bans on habits the model no
  longer has — now costs output quality rather than protecting it.
- Authoring checklist gains three anti-patterns (update suppressors, blanket
  anti-formatting rules, scaffolding written for a weaker model) and the
  neighbour-phrasing technique for eval negatives.

## productivity-tools 0.3.0

- `issue-triage` triggers on asking which items are blocked, stale, or waiting
  on a person, not only on the word "triage". Measured: the phrasing
  "anything in the backlog still waiting on my input?" passed 17 of 28
  judgements before the change and 9 of 9 after.

- `writing-for-agents` gains a section on instructions that invert: rules aimed
  at an older generation's habits do not age into harmlessness.
- `issue-triage` description now states that the triaged board answers which
  items are blocked on a person and which are ready for an agent.
- `cold-reader` agent description states its trigger conditions as prose
  instead of a scripted `<example>` exchange, which rode in every request.

## epistemics 0.8.0

- `falsification-reviewer` agent description states its trigger conditions as
  prose instead of a scripted `<example>` exchange.

## code-craft 0.2.0

- Initial published version: `tdd`, `deep-modules`, `diagnose-bugs`.

## security 0.1.1

- Initial published version: `threat-model`, `security-diff-review`,
  `hardening-proposal`, `define-security-policy`.

## frontend 0.3.0

- Rebuilt around an explicit design language; adds `frontend-critique`
  alongside `frontend-craft`, `frontend-redesign`, and `webapp-testing`.

## marketing 0.2.1

- Seven skills ported from `ericosiu/ai-marketing-skills` (see NOTICES.md).

## tldraw-canvas 0.2.0

- `mermaid-to-tldraw` now says in its description that it can produce a `.tldr`
  file, and states that the *input* is what separates it from `tldraw-diagram`
  (Mermaid source here, a prose description there). Previously only
  `tldraw-diagram` claimed the term `.tldr`, so a request naming a mermaid
  block and a `.tldr` routed to the wrong skill 7 times in 9. After the change
  both skills measure 16/16 at `--repeat 9`.

## tldraw-canvas 0.1.1

- Canvas tooling: `tldraw-diagram`, `tldraw-animation`, `tldraw-export`,
  `mermaid-to-tldraw`.

## secrets-ops 0.1.0

- Initial published version: `op-secrets`, `op-github-secrets`.

## pr-workflow 0.1.1

- Initial published version: `stacked-prs`.
