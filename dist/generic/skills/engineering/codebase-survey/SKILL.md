---
name: codebase-survey
description: >-
  Maps an unfamiliar repository fast: deterministic inventory scripts plus
  parallel subagent scans, synthesized into a path-anchored survey document.
  Use this skill when the user says "survey this codebase", "help me get
  oriented in this repo", "map out this project", or has inherited or
  cloned a codebase and needs orientation. Not for explaining a specific
  function, finding a specific bug, or reviewing a change.
license: MIT
metadata:
  skillsmith-composes: "doc-visuals"
  skillsmith-invocation: "user"
  skillsmith-maturity: "stable"
user-invocable: true
---

# codebase-survey

Orient in an unfamiliar repository and produce a survey a newcomer can
navigate by. Every claim in the survey is path-anchored — a file, a
directory, a manifest line — so the reader can verify rather than trust.

The survey runs in the main conversation, not a fork: its output is the
context the rest of the session builds on. (A fork would isolate the scan
noise, but discards exactly the orientation the session needs.)

## Phase 1 — deterministic inventory (run, don't read)

Execute both bundled scripts from the repo root and use their output only:

- `scripts/inventory.sh <repo-root>` — size and shape: file counts by
  extension, line counts, top-level structure, largest files.
- `scripts/deps.sh <repo-root>` — every dependency manifest present, with
  dependency counts per manifest.

These are scripts because their answers are facts: recomputing them by
reading files burns context and invites transcription errors.

## Phase 2 — parallel subagent scans

Dispatch these scans as parallel subagents, each returning path-anchored
findings (briefs in
[references/survey-guide.md](references/survey-guide.md)):

1. **entry-points** — how the system starts: binaries, main modules,
   exported APIs, service definitions, CI entry commands.
2. **test-posture** — what is tested, how it runs, and visibly untested
   territory. The gap report matters more than the coverage report.
3. **conventions** — the patterns the codebase actually follows (naming,
   layering, error handling), observed from code, not from docs claiming
   them. Note where docs and code disagree.

Three scans is the default; add a **hot-spots** scan (recently churned or
oversized modules) only when git history is available and the repo exceeds
roughly 50k lines.

## Phase 3 — synthesis

Assemble the survey using the template in references/survey-guide.md.
Render the visual elements — the Shape section's repository map, any
diagram, every command example — with the doc-visuals discipline; a
survey is navigation, and navigation that doesn't scan is noise.
Ordering rule: purpose and stack first, unknowns last — and the unknowns
section is mandatory. A survey that reports no unknowns after an hour in a
foreign codebase is reporting confidence, not knowledge.

## Verify before returning

Spot-check three claims from different scans against the actual files. If
a spot-check fails, the failing scan's findings are quarantined into the
unknowns section rather than silently dropped. State clearly which parts
of the survey are script-derived fact vs. scan-derived inference.
