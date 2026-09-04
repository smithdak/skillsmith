# Changelog

Plugins are versioned and installed independently, so this file is organised by
plugin rather than by date. Claude Code refreshes an installed plugin by
version, never by content, which is why `version-guard` fails a content change
without a bump — and why every current version below has an entry.

Entries cover each plugin's **current** version. Earlier versions are in git
history; this file starts where the changelog rule (V16) began.

## Migration — 2026-09-03 catalog restructure

The catalog was curated to the disciplines that separate a frontier model from
a weaker one and regrouped by job so a session installs only what it needs
(Claude Code lists every installed skill's description in the system prompt
within ~1% of the context window; rule V17 now keeps each plugin under half of
that). Every description was rewritten to ≤ 400 characters. Retired plugin
names stop receiving updates; reinstall by job:

| Retired plugin | Install instead |
|---|---|
| `engineering-core` | `architecture` (architecture-spec, decision-record) · `planning` (feature-spec) · `code-craft` (codebase-survey, postmortem) · `dev-workflow` (wizard) · `docs-craft` · `agent-instructions` (skill-authoring) |
| `epistemics` | `planning` (falsification-review, premortem, second-order-effects, grilling) · `research` |
| `productivity-tools` | `dev-workflow` (handoff, cold-read, define-work-items) · `agent-instructions` (writing-for-agents) |
| `agent-voice` | `agent-instructions` — `output-contract` is now `communication-contract`; `voice-setup` and `/voice-setup` are now `instructions-setup` and `/instructions-setup` |
| `marketing`, `secrets-ops`, `pr-workflow` | nothing — their skills are archived (see below) |

```
/plugin uninstall engineering-core@skillsmith-marketplace
/plugin install architecture@skillsmith-marketplace
```

Archived under [`archive/`](archive/README.md), no longer generated: brand-voice,
content-angles, content-scorer, growth-experiments, outbound-builder,
podcast-repurposer, seo-brief, op-secrets, op-github-secrets, stacked-prs,
issue-triage, estimate, discernment-nudge, discovery-map,
define-security-policy.

## architecture 0.1.0

- New plugin. Takes `architecture-spec` and `decision-record` from engineering-core and `deep-modules` from code-craft, and adds four skills: `architecture-review` (judges an existing system against its claimed invariants with `depgraph.sh` import-graph and `churn.sh` change-frequency evidence; findings carry options and kill triggers, never a bare rewrite), `api-design` (contract-first design of a surface others program against: consumers first, error model and compatibility policy before the happy path), `migration-plan` (reversible, verified phases for a live A→B transition, with a pattern table), and `failure-mode-analysis` (FMEA over dependencies: down, slow, partial, wrong; ranked by likelihood × impact × detectability, with a mitigation catalog and game-day tests).
- All seven descriptions ≤ 400 chars. New skills are `experimental` and unmeasured until the next eval run.

## planning 0.1.0

- New plugin: `grilling`, `feature-spec`, `premortem`, `falsification-review`, `second-order-effects`, plus the `falsification-reviewer` agent, from engineering-core and epistemics. `premortem` and `grilling` no longer route large efforts to `discovery-map` (archived); they route to `define-work-items`. Descriptions rewritten to ≤ 400 chars.

## research 0.1.0

- New plugin: `ground-truth-research`, `deep-research`, `research-note` from epistemics. Descriptions rewritten to ≤ 400 chars.

## code-craft 0.5.0

- Gains `codebase-survey` and `postmortem` from engineering-core; `deep-modules` moves to the `architecture` plugin (`tdd` still composes it across the boundary). Descriptions rewritten to ≤ 400 chars.

## dev-workflow 0.1.0

- New plugin: `handoff`, `cold-read`, `define-work-items`, the `cold-reader` agent (from productivity-tools) and `wizard` (from engineering-core).
- `wizard` template library v2: `--list` prints the stage plan with no side effects, `--resume` skips stages recorded in a state file and `--from N` restarts at a stage, and `WIZARD_NONINTERACTIVE=1` answers prompts from the environment for smoke tests. New `scripts/verify.sh` replaces the manual static trace: syntax, shellcheck, library-unchanged, stage count, every `set_secret` matched against `secrets.*` in workflows, every `write_env` against `.env.example`.

## docs-craft 0.1.0

- New plugin: `prose-hygiene`, `readme-authoring`, `doc-visuals`, `information-architecture` from engineering-core. Descriptions rewritten to ≤ 400 chars (`prose-hygiene` was the catalog's longest at 1,033).

## agent-instructions 0.1.0

- New plugin: `writing-for-agents` (from productivity-tools), `skill-authoring` (from engineering-core), and the transformed agent-voice pair.
- `output-contract` → `communication-contract`: no longer a brevity style guide. It now encodes how a frontier model reports — outcome first, the message stands alone, failures and skipped steps stated plainly, observed vs inferred vs assumed, assumptions over questions for reversible work, disagreement said then built on, no sycophancy, a progress cadence stated positively, deliberate expansion, format for the reader. The "takeaway on the final line" rule is gone; it contradicted answer-first reading.
- `voice-setup` → `instructions-setup` (`/instructions-setup`): renders the contract as five modules (`reporting,calibration,questions,brevity,progress`); legacy `--rules` keys and `--no-reading-order` map with a stderr note. The managed-block marker keeps its `agent-voice:output-contract` prefix so blocks written by v1 are replaced in place; the block is now `v2`.

## security 0.3.0

- `define-security-policy` archived; `threat-model`, `security-diff-review`, `hardening-proposal` descriptions rewritten to ≤ 400 chars, with `threat-model` bounded against the new `failure-mode-analysis` (adversarial vs accidental).

## frontend 0.5.0

- Descriptions rewritten to ≤ 400 chars; `webapp-testing` no longer names the removed tldraw plugin.

---

## Earlier versions and retired plugin names

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

- `skill-authoring` records a measured routing rule: a boundary clause names the sibling and never restates its case — the restatement recruits the request toward the skill carrying the clause (0/9 on a previously-passing case; deleting the clause fixed it) — and description edits are re-measured on both sides of the boundary, because a rewrite shifts what every neighbour is judged against.
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

- `falsification-review` names its security-finding mode in one phrase ("is this finding real or a false positive"). A larger rewrite that also named sibling skills in its boundary clause was measured and reverted: it pulled `grilling`'s, `content-scorer`'s, and `ground-truth-research`'s own cases toward `falsification-review` (0/9 each), and removing the clause restored `grilling` to 17/17.
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

- `frontend-craft` excludes writing the marketing copy itself (measured: a no-trigger case that had drifted to 0/9 returned to 17/17).
- `frontend-craft` referenced a detector script that did not exist (`slop-detector.mjs`); it now names the real `python scripts/slop-detector.py`, its exit code, and the inline `slop-ignore` waiver — the checklist reference too. `webapp-testing`'s bounded-rounds rule rewritten for clarity. `frontend-redesign` says what "the detector ran clean" requires. Evals: `frontend-critique` phrasings as negatives for its two siblings.

## frontend 0.3.0

- Rebuilt around an explicit design language; adds `frontend-critique`
  alongside `frontend-craft`, `frontend-redesign`, and `webapp-testing`.

## marketing 0.3.0

- `growth-experiments` documents the `--mde-type` flag its script already accepts. `brand-voice` says where the spec goes (drafting prompts) and where it does not (`content-scorer`), and cites its upstream source by URL. `content-scorer` states what its AI-tells panelist scores and why it is weighted. `seo-brief` uses live search when available and dates its map. Evals: near-boundary negatives across `content-scorer`, `outbound-builder`, `growth-experiments`.

## marketing 0.2.1

- Seven skills ported from `ericosiu/ai-marketing-skills` (see NOTICES.md).

## tldraw-canvas — removed

- The plugin and its four skills (`tldraw-diagram`, `tldraw-animation`,
  `tldraw-export`, `mermaid-to-tldraw`) are no longer published. Installed copies
  keep working but receive no further updates. It carried the catalog's highest
  volatile-specifics risk — SDK record formats, headless-browser export, a
  validator already lagging real exports — and sat outside the catalog's focus.

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
