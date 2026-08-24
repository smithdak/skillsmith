---
name: feature-spec
description: >-
  Synthesizes the current conversation into a build-ready feature spec
  (a PRD): problem, solution, user stories, implementation and testing
  decisions, out-of-scope — captured from what was already discussed,
  never by re-interviewing. Use this skill when the user says "turn
  this into a spec", "write up what we discussed as a PRD", "capture
  this thread as a spec", or wants a feature discussion made
  buildable. Not for system-wide architecture documents and not for
  eliciting requirements that were never discussed.
license: MIT
metadata:
  skillsmith-composes: "cold-read, deep-modules"
  skillsmith-see-also: "architecture-spec, define-work-items"
  skillsmith-invocation: "user"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# feature-spec

The conversation already contains the decisions; the spec's job is to
make them survive it. Synthesize what was discussed and what the
codebase shows — do not re-open settled questions or interview the
user a second time. Whatever was genuinely never resolved goes into
the spec as an explicit open item, not back to the user as a quiz.

## Ground it in the codebase

Explore current repo state wherever understanding is missing, and
write the spec in the project's own vocabulary — module names, domain
terms — so an implementer can map every sentence onto code they can
find.

## Sketch the test seams

Name the seams at which the feature will be verified, preferring
existing seams over new ones and the highest seam that can carry the
test — fewest total seams wins (the deep-modules discipline governs
placement). This is the one point to confirm with the user before
writing: seams are the spec's most expensive assumption, and a spec
tested at the wrong seam is rewritten, not revised.

## Write to the template

Load [references/spec-template.md](references/spec-template.md) for
the sections and per-section guidance: problem and solution from the
user's perspective, an extensive numbered list of user stories,
implementation decisions, testing decisions, out of scope, and open
items. Two rules do most of the work:

- Decisions, not descriptions: every implementation decision records
  what was chosen and why, traceable to the conversation or the
  codebase — nothing invented to make the spec look complete.
- No file paths and no code snippets — they rot faster than the spec.
  Exception: a snippet that encodes a decision more precisely than
  prose can (a schema, a type shape, a state machine), trimmed to the
  decision-rich part.

## Verify before returning

Run the cold-read discipline, casting the audience as an implementer
who never saw this conversation: no dangling "as discussed", every
decision self-contained, done-state unambiguous. Then stop at the
spec's edge: decomposing it into executable tickets is
define-work-items' job, not a reason to inflate the spec into one.
