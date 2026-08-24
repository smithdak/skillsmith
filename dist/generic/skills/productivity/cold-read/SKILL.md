---
name: cold-read
description: >-
  Verifies that a document is self-sufficient for its intended audience —
  readable and actionable with zero access to the conversation or author.
  Use this skill before presenting any document someone else will act on
  (handoffs, work items, runbooks, READMEs, onboarding docs), or when the
  user asks "will this make sense without me", "check this is
  self-contained", or "review this for completeness before I send it".
  Not for correctness review, copyediting, or summarization.
license: MIT
metadata:
  skillsmith-see-also: "falsification-review"
  skillsmith-invocation: "model"
  skillsmith-maturity: "stable"
user-invocable: true
---

# cold-read

A document that needs its author present is a conversation with extra
steps. Before presenting a document others will act on, read it as its
cold audience — someone with the document and nothing else — and fix what
fails. Fixing before presenting is the discipline; presenting with
caveats is the anti-pattern this skill exists to prevent.

## Cast the cold reader

Name the audience and their job before checking anything, because the
checks are relative to both: a teammate continuing the work, an
implementer executing it, a newcomer navigating a system, an operator
following a runbook at 3am. What counts as "standard knowledge" and what
counts as "unexplained referent" depends entirely on who is reading.

## The pass

Read the document as that audience, flagging every point where they would
have to ask, guess, or search:

1. **Dangling referents** — "as discussed", "the earlier approach", "the
   usual way", "that bug": anything whose meaning lives in the
   conversation rather than the document. Inline the referent or cut the
   line.
2. **Unactionable actions** — every instruction or task must be
   executable as written by this audience: commands they can run, paths
   they can open, decisions they have the criteria to make.
3. **Uncheckable claims** — statements the audience must take on faith
   ("this is tested", "the config is correct") become checkable when they
   carry their evidence: the command that proves it, the path that shows
   it, the version observed.
4. **Undefined completion** — the reader must know, from the document
   alone, when they are done or what state they should end in.
5. **Silent assumptions** — knowledge the author has that the audience
   provably lacks: environment details, credentials locations, tribal
   naming. State it or link it.

## Maker-checker escalation

An inline pass is a *simulated* cold read — the simulator still holds the
full conversation, and contamination is exactly the failure mode being
checked for. For deliverables leaving the session — handoffs, runbooks,
work items someone else will execute — spawn the `cold-reader` agent with
the document and the named audience only, never the conversation: the
agent's ignorance is the instrument. Reserve the agent for documents
others will act on (subagent review costs ~7x tokens); inline passes
suffice while a draft is still iterating in-session.

## Failure handling

Fixable failures get fixed inline. Genuine unknowns — things the author
also cannot resolve — are surfaced as explicit open items with an owner,
never smoothed over and never silently dropped. A document honest about
its gaps passes; a document hiding them does not.

## Composing skills

Skills that produce documents run this pass as their final verification,
casting the audience their output serves, and add their own
domain-specific checks on top. This discipline covers self-sufficiency
only; correctness is falsification-review's axis.
