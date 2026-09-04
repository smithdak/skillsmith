---
name: writing-for-agents
description: >-
  Writes AGENTS.md, CLAUDE.md, and other docs an AI agent reads: conventions,
  verbatim commands, and boundaries so agents land productive. Use when the
  user says "create an AGENTS.md", "agents keep doing X — encode a rule", or
  "make it work for both Claude Code and Codex". Not for SKILL.md files
  (skill-authoring), READMEs (readme-authoring), or how the agent replies
  (communication-contract).
license: MIT
metadata:
  skillsmith-see-also: "skill-authoring, readme-authoring, cold-read, prose-hygiene"
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# writing-for-agents

An agent reads your repo fresh every session: no memory, no hallway
context, total obedience to whatever the instruction file says —
including when that file is wrong. A good agent-facing document is
therefore small, verifiable, and front-loads the constraints an
agent cannot infer from code. A bad one is worse than none, because
the agent trusts it over evidence.

## Decide what earns a place

Include only what an agent cannot cheaply derive or must never get
wrong:

- **Non-inferable conventions** — "services live in packages/* and
  talk over the bus, never direct imports." Code shows structure;
  it does not show intent behind it.
- **Commands that must run verbatim** — test invocation, local dev,
  release gate. Agents copy these literally; a wrong flag costs a
  session.
- **Boundaries** — "plugins/, catalog/ are generated: fix sources and
  rerun generate." State the consequence, not just the prohibition;
  agents follow reasons better than bare rules.
- **Pointers to deeper docs** — one line each, not transcriptions.

Exclude anything derivable by reading the tree, anything aimed at
humans evaluating the project, and aspirations nobody enforces. An
instruction file stuffed with derivable facts buries the two lines
that matter.

## Write for the model you have, not the one you had

Instruction files accumulate rules aimed at an older generation's habits, and
those rules do not age into harmlessness — they invert. Telling a model that
under-narrates to "work silently", or one that under-formats to "never use
bullets", subtracts exactly what the reader wanted. The same goes for
enumerated steps around judgment work and emphasis added because an
instruction was once ignored: prescription that outlived its model reduces
output quality rather than protecting it.

So when an instruction file is not working, cut before adding. State when
updates and formatting *are* wanted rather than banning them, keep ordered
steps only where order genuinely matters, and re-read the file's oldest rules
whenever the model behind it changes — a rule nobody can trace to a failure
that still reproduces is a candidate for deletion, not a fixture.

## Structure for lookup, not narrative

Agents scan for the section answering their current failure. Head
sections by the question ("How do I run tests?", "What is generated?",
"Where do new skills go?") and keep each self-contained — an agent
acting on one section rarely holds the others in view. Hard
constraints go at the top: early text carries more weight, and by the
time an agent reaches paragraph twelve it has usually already acted.

## Keep every claim verifiable

A stale instruction is not neutral; it teaches the agent to distrust
the file and improvise. Before landing:

- Run every command exactly as written.
- Open every referenced path; dead pointers break trust silently.
- Check every stated rule against current reality — if the code and
  the doc disagree, the doc loses until the repo is fixed.

Prefer fewer true claims over more approximate ones.

## One source, many harnesses

AGENTS.md, CLAUDE.md, and their kin carry overlapping audiences.
Maintain one canonical file and make the others point at it — a stub
with a link, a symlink where supported — rather than duplicating
content that will drift apart. Harness-specific quirks (a CLI flag,
a config path) belong in clearly labeled addenda sections, never
woven into shared text.

## Verify before returning

Every command runs as written; every pointer resolves; every rule
matches observed repo behavior. The file fits in one screen-ish
budget — past roughly eighty lines, justify each section's presence
or move it to a linked doc. A cold agent handed only this file plus
the repo should avoid every failure mode it was written to prevent;
walk the top three failures the user named and confirm the file
addresses them in the first screen.

## Boundaries

- SKILL.md files are packaged capabilities with routing contracts and
  evals — the skill-authoring discipline governs those; this skill
  covers repo-resident instruction files.
- Human-evaluation documents (READMEs) follow readme-authoring;
  self-sufficiency checks are cold-read's axis; comment-level leakage
  cleanup is prose-hygiene's.
