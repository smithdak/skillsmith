---
name: architecture-spec
description: >-
  Co-authors a versioned architecture specification through iterative
  artifact revisions: design invariants, open-decisions register, volatility
  isolation, and kill/pivot triggers. Use this skill when the user asks to
  "write an architecture spec", "spec out" a system, "draft a design doc",
  or turn a technical discussion into a specification. Not for explaining
  architectural concepts or reviewing an existing document.
license: MIT
metadata:
  skillsmith-composes: "falsification-review"
  skillsmith-invocation: "user"
  skillsmith-maturity: "stable"
user-invocable: true
---

# architecture-spec

Produce a specification the team can build against: decisions with
rationale, not descriptions of intent. The document is versioned from v0.1
and evolves by revision, never by rewrite — a spec that must be rewritten
to absorb new information was structured wrong.

## Before designing: establish ground truth

Verify the volatile facts the design depends on — current versions, API
surfaces, ecosystem state, what competing solutions already exist — against
live sources, not recall. Every time-sensitive claim in the spec carries an
as-of date. A spec built on stale ground truth fails at implementation, not
review, which is the expensive place to fail.

## Structure the document

Load [references/spec-template.md](references/spec-template.md) for the
full section template and per-section guidance. The load-bearing sections,
in order of leverage:

1. **Design invariants** — the handful of non-negotiables everything else
   derives from. Number them (I1, I2, …) so later decisions can cite them.
2. **Open-decisions register** — unresolved choices as numbered items
   (O1, O2, …), each with the options, a recommendation, and what evidence
   resolves it. An honest register beats premature resolution.
3. **Volatility isolation** — name what will churn (external schemas,
   vendor surfaces, model-specific behavior) and confine each to one
   module, one file, or one section, so change has a known blast radius.
4. **Kill/pivot triggers** — the observable conditions under which the
   architecture is wrong, stated before building. Deciding these in
   advance is cheap; deciding them mid-crisis is not.

## Work by revision

Iterate section-by-section with the user rather than presenting a complete
spec for approval — locked decisions accumulate, open items shrink, and
the register records both. Record rejected alternatives with the reason
for rejection; they prevent relitigation and are the cheapest
documentation the spec contains.

## Before tagging a version

Run the falsification-review discipline on the draft: strongest
counterargument to the central architecture choice, the crux per major
decision, and confidence with drivers. For a spec the team will build
against, escalate to the falsification-reviewer agent with the complete
document. Resolve or register every finding — a finding converted into an
O-item is handled; a finding ignored is a defect.
