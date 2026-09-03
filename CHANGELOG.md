# Changelog

Plugins are versioned and installed independently, so this file is organised by
plugin rather than by date. Claude Code refreshes an installed plugin by
version, never by content, which is why `version-guard` fails a content change
without a bump — and why every current version below has an entry.

Entries cover each plugin's **current** version. Earlier versions are in git
history; this file starts where the changelog rule (V16) began.

## agent-voice 0.3.0

- `voice-setup` names its scripts' real flags (`--no-reading-order`, `--caps soft`, `--rules`), explains every detector output key, handles the opencode shadowing hazard before applying rather than after, and verifies by re-running detection. `presets.md` dates its precedence claim to the installed opencode version. Evals: `writing-for-agents` phrasings as negatives.

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

## engineering-core 0.8.0

- `decision-record`'s body now delivers what its description promises: a reversibility class (two-way/one-way door) and a scored tradeoff matrix with unknown cells marked. `codebase-survey` describes `deps.sh` as it actually behaves (`maxdepth 3`, counts for four manifest kinds). `architecture-spec` names the plugin its reviewer agent ships in and gives an inline fallback. `skill-authoring` states the body ceiling concretely. Evals: near-boundary negatives for `doc-visuals`, `wizard`, `postmortem`.

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

## productivity-tools 0.4.0

- `cold-read` drops a volatile "~7x tokens" figure for a durable statement; `handoff` replaces its "~40 lines" split rule with a structural one (keep the sections, omit an empty one). Evals: near-boundary negatives drawn from `postmortem`, `define-work-items`, and `issue-triage` phrasings; a description-echoing `writing-for-agents` trigger case replaced with a situation phrasing.

## productivity-tools 0.3.0

- `issue-triage` triggers on asking which items are blocked, stale, or waiting
  on a person, not only on the word "triage" — and its surfacing step now
  includes `ready-for-human` items (the ones waiting on the maintainer) and
  flags stale ones, so the body delivers what the description promises. Measured: the phrasing
  "anything in the backlog still waiting on my input?" passed 17 of 28
  judgements before the change and 9 of 9 after.

- `writing-for-agents` gains a section on instructions that invert: rules aimed
  at an older generation's habits do not age into harmlessness.
- `issue-triage` description now states that the triaged board answers which
  items are blocked on a person and which are ready for an agent.
- `cold-reader` agent description states its trigger conditions as prose
  instead of a scripted `<example>` exchange, which rode in every request.

## epistemics 0.9.0

- `falsification-review` states plainly that the pass's product is response content — a one-line "survived" note is fine, play-by-play is not. Evals across `grilling`, `estimate`, `deep-research`, `premortem`, `discernment-nudge`: description-echoing trigger cases replaced with situation phrasings; `research-note` and `falsification-review` gain near-boundary negatives from siblings' own phrasings.

## epistemics 0.8.0

- `falsification-reviewer` agent description states its trigger conditions as
  prose instead of a scripted `<example>` exchange.

## code-craft 0.4.0

- `diagnose-bugs` admits flakes and regressions that fail at a measured rate rather than only on demand, routes a stalled loop through its stuck protocol before giving up, and asks for cause-not-correlation in the explanation. Evals: `tdd`, `diagnose-bugs`, `deep-modules`, and `retrofit-tests` each gain the others' own trigger phrasings as negatives.

## code-craft 0.3.0

- New skill `retrofit-tests`: characterization tests for code that already
  works and has none — pin behavior at its seams before changing it, prioritise
  by risk over coverage numbers, and prove every test by breaking the code and
  watching it fail. Exists because "add unit tests for the existing auth
  module" sat on `tdd`'s boundary for eight measured runs (3/8) with no skill to
  route to; `tdd`'s boundary clause now names it.

## code-craft 0.2.0

- Initial published version: `tdd`, `deep-modules`, `diagnose-bugs`.

## security 0.2.0

- The three skills that consume a threat model now agree on where it lives (`docs/THREAT_MODEL.md`, or the user-named path), and `threat-model` says so when it writes one. Evals: `hardening-proposal` and `security-diff-review` gain each other's phrasings as negatives.

## security 0.1.1

- Initial published version: `threat-model`, `security-diff-review`,
  `hardening-proposal`, `define-security-policy`.

## frontend 0.4.0

- `frontend-craft` referenced a detector script that did not exist (`slop-detector.mjs`); it now names the real `python scripts/slop-detector.py`, its exit code, and the inline `slop-ignore` waiver — the checklist reference too. `webapp-testing`'s bounded-rounds rule rewritten for clarity. `frontend-redesign` says what "the detector ran clean" requires. Evals: `frontend-critique` phrasings as negatives for its two siblings.

## frontend 0.3.0

- Rebuilt around an explicit design language; adds `frontend-critique`
  alongside `frontend-craft`, `frontend-redesign`, and `webapp-testing`.

## marketing 0.3.0

- `growth-experiments` documents the `--mde-type` flag its script already accepts. `brand-voice` says where the spec goes (drafting prompts) and where it does not (`content-scorer`), and cites its upstream source by URL. `content-scorer` states what its AI-tells panelist scores and why it is weighted. `seo-brief` uses live search when available and dates its map. Evals: near-boundary negatives across `content-scorer`, `outbound-builder`, `growth-experiments`.

## marketing 0.2.1

- Seven skills ported from `ericosiu/ai-marketing-skills` (see NOTICES.md).

## tldraw-canvas 0.3.0

- `tldraw-diagram`'s validator accepts the record prefixes real exports contain (`document:`, `instance_page_state:`, `camera:`, `pointer:`), and its format reference notes `props.text` vs `props.richText` drift across SDK versions. `tldraw-animation` defines tldraw-offline and moves the video/GIF-export cases to the side of the boundary they belong on.

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

## secrets-ops 0.2.0

- `op-secrets` scopes `op run` to local dev and non-GitHub runtimes and says precisely what the masking-off flag does. `op-github-secrets` requires user-confirmed `op://` references (never invented ones) and proves resolution by exit status with an optional canary. Evals: description-echoing trigger cases replaced with situation phrasings.

## secrets-ops 0.1.0

- Initial published version: `op-secrets`, `op-github-secrets`.

## pr-workflow 0.2.0

- `stacked-prs` no longer links same-author chains without asking — linking is the first mutation that needs consent — and its post-rewrite re-audit uses `latestReviews` plus a paginated review-comments query instead of a field `gh pr view` does not return. Evals: a duplicate negative replaced with a GitLab near-boundary case; two trigger cases reworded to situation phrasings.

## pr-workflow 0.1.1

- Initial published version: `stacked-prs`.
