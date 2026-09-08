---
name: "skill-authoring"
description: "Authors and audits agent skills so they trigger reliably and fit their token budget: a description that routes, a body scoped by progressive disclosure, deterministic work pushed to scripts. Use when the user says \"write a skill\", \"why isn't my SKILL.md triggering\", or \"audit our skills\". Not for AGENTS.md or CLAUDE.md (writing-for-agents), the script a skill wraps, or prose editing."
license: "MIT"
metadata:
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
---

# skill-authoring

*Adapted from davidondrej/skills — effective-agent-skills (MIT); see
repo-root NOTICES.md.*

Build one reusable capability with a cheap discovery surface and enough
non-obvious guidance to improve the completed task. Portability is a packaging
property; effectiveness must be tested on named models and harnesses.

## State the capability

Identify the input, useful output, recurring failure the skill prevents, and
observable completion check. Prefer a discriminating example or decision rule
to general advice. A weaker model may need a worked example; a stronger one
may benefit chiefly from domain constraints, tools, or evidence requirements.

Keep the description focused on what the skill does and when real users need
it. Add a boundary only for likely confusion with another skill. Workflow
steps belong in the body. Evaluate descriptions against installed neighbors;
phrasing that excludes a sibling can still attract that sibling's requests.
Treat this as a measured behavior to test, not a universal wording rule.

## Keep the loaded body small

Aim for 250–600 words for a focused skill, shorter when sufficient. This is an
editing target, not a reason to delete a critical constraint. Respect the host
repository's hard limits. Keep the normal path in the body and link conditional
references with a reason to open each one. Avoid moving a long manual to a
reference that every run must read.

Bundle a script when deterministic work is otherwise repeatedly recreated.
Give its invocation, inputs, outputs, and failure meaning. Resolve resources
relative to the installed skill; do not assume the user's working directory.

Scale strictness to consequence. Preserve useful ordering such as observing a
regression before claiming a fix. Replace routine approval gates, fixed report
sizes, and generic ceremony with decision criteria. User constraints and
existing authorization govern. Optional companion skills need an inline
fallback; missing tools require a specific limitation, not a pretend result.

## Evaluate revisions

Use [references/authoring-checklist.md](references/authoring-checklist.md) for
the review checklist. Test realistic successes, near misses, and a difficult
case; keep fresh validation tasks outside the editing loop. Compare no skill,
the prior version, and the revision with the same model, tools, and inputs.
Inspect outcomes, unnecessary interruptions, tokens, and time. Keep grading
independent of the solver and test mechanical outcomes with code when possible.

Record exact instruction and reference hashes, model and harness versions,
tasks, and limitations. Routing success, outcome improvement, and installation
compatibility are separate claims. Retain, revise, merge, or retire based on
that evidence. A shorter body or passing schema check alone proves no uplift.
