---
name: cold-read
description: >-
  Verifies that a document stands alone for its intended audience — actionable
  with no access to the conversation or author. Use before sending any
  document someone else will act on, or when the user asks "will this make
  sense without me", "check this is self-contained", or "review this for
  completeness before I send it". Not for correctness (falsification-review),
  copyediting, or summarization.
license: MIT AND Apache-2.0
metadata:
  skillsmith-see-also: "falsification-review"
  skillsmith-invocation: "model"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# cold-read

*Adapted in part from google/elephant-goldfish-model — comprehension and
implementation-readiness reviews (Apache-2.0). Changed to keep this skill focused
on self-containment, with explicit context isolation and scoped rechecks. See
repo-root NOTICES.md and references/egm-LICENSE.txt.*

A document that needs its author present is a conversation with extra
steps. Before presenting a document others will act on, read it as its
cold audience — someone with the document and nothing else. Fix the gaps when
preparing or revising the document; an audit-only request returns findings.
Do not invent facts merely to make an incomplete document appear finished.

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
work items someone else will execute — use an independent reader when
available and authorized. Start a fresh context without inherited conversation.
Provide the document or path, named audience and their job, and permitted reference
scope. Omit the author's explanation, expected verdict, and earlier findings.
The reader checks the whole document and its explicit links before calling a term
undefined; ordinary audience knowledge is not a defect. If the `cold-reader` agent
or delegation is unavailable,
run the same checks inline and describe that as a simulated read. No named
agent is required to complete the skill. Use a separate reader where its
benefit justifies its cost, not for every short document.

For an implementation plan, have the reader identify the observable behavior,
first action, failure handling, and completion check using the artifact. Flag
missing product or interface decisions; routine choices of private helpers are
not blockers. This tests whether the plan can be followed, not whether the design
is correct. Verify claimed repository paths within the permitted scope.

## Failure handling

Fixable failures get fixed inline. Genuine unknowns — things the author
also cannot resolve — are surfaced as explicit open items with an owner,
never smoothed over and never silently dropped. Recheck changed sections and their
dependencies after a fix; stop when no new material evidence warrants another pass.
Explicit open items make a document honest, but an unresolved decision that blocks
the audience's job still means it is not ready to execute. Report that distinction.

## Composing skills

Skills that produce documents run this pass as their final verification,
casting the audience their output serves, and add their own
domain-specific checks on top. This discipline covers self-sufficiency
only; correctness is falsification-review's axis.
