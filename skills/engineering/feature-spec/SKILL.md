---
name: feature-spec
description: >-
  Synthesizes the conversation so far into a build-ready feature spec or
  PRD, never by re-interviewing. Use when the user says "turn this into a
  spec", "write up what we discussed as a PRD", "capture this thread as a
  spec", or wants a feature discussion made buildable. Not for
  architecture documents (architecture-spec), tickets (define-work-items),
  or eliciting requirements (grilling).
license: MIT
metadata:
  skillsmith-composes: "cold-read, deep-modules"
  skillsmith-see-also: "architecture-spec, define-work-items"
  skillsmith-invocation: "user"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# feature-spec

Turn the conversation and repository evidence into a specification an
implementer can use without repeating the discussion. Preserve settled choices;
mark unresolved decisions explicitly instead of inventing answers.

## Recover the contract

Identify the user's problem, desired behavior, constraints, and excluded work.
Inspect relevant existing behavior and use the project's domain vocabulary.
Separate agreed decisions from recommendations and assumptions.

Describe acceptance scenarios with observable outcomes, including meaningful
failure and boundary cases. Choose verification seams from existing public
interfaces; the deep-modules discipline helps avoid tests tied to internals.
Ask only if an unresolved choice changes the product contract. Do not require
separate approval of routine test placement before writing the spec.

## Write a usable artifact

Use [references/spec-template.md](references/spec-template.md) when its full
structure is useful; scale sections and story count to the feature. State the
behavior, important implementation choices and their reasons, verification,
non-goals, and open decisions with their blockers.

Include stable paths, schemas, or examples when they remove implementation
ambiguity. Avoid file inventories and speculative implementation detail that
merely duplicate the code. A proposed implementation is not an accepted decision.

## Completion

Apply the cold-read discipline: an implementer without this conversation can
identify what to build, how to verify it, and which decisions still need an
answer. Perform that check inline if the skill is unavailable. Report the
artifact and material open items. Use define-work-items for a requested task
breakdown and architecture-spec for choices spanning the whole system.
