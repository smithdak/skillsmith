---
name: "skill-authoring"
description: "Authors and audits agent skills so they trigger reliably and stay within their token budget: a description that routes, a body scoped by progressive disclosure, and deterministic work pushed to scripts and references. Use this skill when the user says \"write a skill\", \"author a SKILL.md\", \"why isn't my skill triggering\", \"review this skill\", or \"audit our skills for quality\". Not for writing the underlying tool or script a skill wraps, and not for general prose editing."
license: "MIT"
metadata:
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
---

# skill-authoring

*Adapted from davidondrej/skills — effective-agent-skills (MIT); see
repo-root NOTICES.md.*

A skill fails in one of two ways: it never loads when it should, or it loads
and wastes the context it was given. The first is a description problem, the
second a body problem. Author for both — a skill that triggers perfectly but
dumps five thousand tokens of prose the model does not need is as broken as
one that never fires.

## The description is a routing contract

The description is the only text the model sees when deciding whether to
load the skill. It must answer two questions and one more:

- **What** the skill does, concretely.
- **When** to use it — with quoted user phrasings the real user would type,
  not paraphrases of the what.
- **The differentiator** — a closing boundary ("Not for …") that separates
  this skill from its nearest neighbor, so two adjacent skills do not both
  claim the same request.

Do not summarize the workflow in the description. If the description already
contains the steps, the model believes it has what it needs and skips
loading the body — the routing text and the instruction text have different
jobs. Keep the steps in the body; keep the triggers in the description.

A boundary clause names the sibling; it never restates the sibling's job. A
mention recruits: "Not for restructuring a SKILL.md into body and references
(skill-authoring)" routed that exact request *to* the skill carrying the
clause, nine votes in nine, and deleting the clause fixed it. The same shape
across three other pairs pulled siblings' own trigger phrasings toward the
skill that named them. Write "(skill-authoring)" and stop. And treat every
description edit as a change to the whole catalog's routing, not one
skill's — it is measured against every neighbour, so re-measure both sides
of any boundary you touch before trusting the number.

## Progressive disclosure

Three levels, each with a tighter budget than the last:

1. **Description** — always in context. A sentence or two. Costs tokens on
   every turn whether or not the skill fires, so it stays lean.
2. **Body (SKILL.md)** — loaded on trigger. The workflow itself, kept under
   the body ceiling — 500 lines / 5,000 tokens unless the host repository's
   policy sets a tighter one. Everything the model needs *every time* the
   skill runs.
3. **References** — loaded on demand, one level deep. Templates, rubrics,
   long tables, class-specific detail the model needs *sometimes*. A body
   that inlines what belongs in a reference pays its cost on every run.

Push anything deterministic — parsing, formatting, a fixed transform — out
of prose and into a script. Prose re-derives the procedure every run; a
script runs it the same way every time.

## Strictness matches consequence

Scale how much freedom the instructions leave to how much a wrong step
costs. A high-stakes, one-right-way procedure (a migration, a release gate)
is written as ordered, unambiguous steps. A judgment task (a review, a
design) states principles and a verification bar and leaves the path open.
Over-constraining a judgment task makes it brittle; under-constraining a
mechanical one makes it unreliable.

The line moves with the model. Scaffolding a weaker generation needed —
enumerated steps for work the model can plan itself, emphasis added because
an instruction was underweighted, bans on habits it no longer has — now
costs output quality rather than protecting it. When a skill written for an
older generation underperforms, cut the scaffolding before adding to it, and
keep ordered steps only where the order genuinely matters.

## Common failures

The full anti-pattern list and a ship checklist are in
[references/authoring-checklist.md](references/authoring-checklist.md). The
ones that bite most often:

- **Workflow-in-description** — the body never loads (see above).
- **Trigger phrasings that are description paraphrases** — they do not match
  how users actually ask, so the skill misses real requests.
- **An unquoted colon-space in the description** — some strict YAML parsers
  read everything after it as a mapping and silently mangle the field.
  Quote descriptions that contain a colon.
- **Reference chains** — a reference that links to another reference. Flatten
  to one level; the model should reach any reference directly from the body.
- **Demanding the model externalize its thinking** — states the internal
  process as an output requirement; drop it and specify the output artifact
  instead.

## Verify before returning

A finished skill has: a description that a stranger could use to decide,
correctly, whether it applies — carrying what, when, and a differentiator;
a body under that budget that assumes the skill has already been chosen; on-demand
detail in flat references; and evals that pin real triggering phrasings, not
restatements of the description. Read the description back as if you were the
router: if two neighboring skills would both claim the same prompt, the
differentiator is not doing its job yet.
