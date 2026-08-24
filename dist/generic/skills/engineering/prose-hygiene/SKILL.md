---
name: prose-hygiene
description: >-
  Audits and trims comments, JSDoc, docs, READMEs, and decision notes for
  leaked authoring-session narration — "this PR adds", "used to / no
  longer", dead citations like "(decision 7)" or "rejected in review",
  justifications aimed at a reviewer, control-flow narration, hedges like
  "probably fine for now" — restating each surviving fact so it stands at
  HEAD while preserving every contract proposition (actor, condition,
  modality, negative guarantee, ownership, failure mode), and checks that
  public JSDoc, internal comments, and README say what that location
  requires. Use this skill when the user says "clean up the comments
  before we merge", "these docstrings read like a PR description", "strip
  the history talk from the docs", "audit the comments for stale decision
  references", or "make the comments read as if they were always true".
  Not for diagrams or tables (doc-visuals), splitting a doc
  (information-architecture), writing a README (readme-authoring),
  checking a doc stands alone (cold-read), or proofreading.
license: MIT
metadata:
  skillsmith-see-also: "doc-visuals, information-architecture, readme-authoring, cold-read"
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# prose-hygiene

*Adapted from deepseek-ai/deepseek-harness — dsh-trim-cot-leakage and dsh-prose-standard (MIT); see repo-root NOTICES.md.*

Leaked narration is prose whose vantage is the authoring session rather than
the repository: it cites things only that session could see, narrates the
change instead of the state, or argues with a reviewer who has left. A
reader at HEAD cannot resolve it, so it is noise at best and misleading at
worst. The fix is rarely deletion alone — a passage that carries facts is
restated so it stands on its own, then the transcript around it goes. The
opposite failure is just as real: a trim that drops an obligation, a
negative guarantee, or an owner has made the prose shorter and wrong.

## The one test

For every suspect passage ask: **could a reader at HEAD, with no access to
any session transcript, PR thread, or uncommitted draft, resolve every
reference and verify every claim?** If not, restate the surviving facts from
the repository's vantage and delete the rest. If so, it is not leakage,
however historical it sounds — though on current-state surfaces (READMEs,
reference docs, JSDoc) a resolvable change story is still change narration
and belongs in a changelog, decision record, or commit, not here.

## Preserve the complete proposition

Before touching a passage, list what it asserts: actor and action;
condition, timing, and ordering; modality (must, may, never); negative
guarantees and exceptions; ownership, side effects, failure modes, and
consequences. Every one of those that a caller or maintainer relies on
survives the edit. Cut adjectives, repetition, and narration only when each
factual clause still stands and the result reads more clearly. Fewer words
alone is not an improvement; a smaller comment that lost "never" is a bug.

Keep the complete local contract at the point of use — behavior, failure,
ownership, consequence — and link out for architecture, rationale,
algorithms, and history. One explanation has one home; essential contract
facts may repeat locally.

## Leakage taxonomy

Each class pairs a symptom with its fix.

1. **Dead session citations** — `(decision 7)`, `(audit C2)`, `design §4`,
   phase labels (`T4`, `W3`), "the design ledger". Cite the committed owner
   by path if one exists; otherwise delete the citation and restate its
   factual clause so it stands alone.
2. **PR and stack vantage** — "this PR adds", "a later PR in this stack",
   "the previous commit". State the shipped mechanism or the extension
   point; deferred work becomes a `TODO` marker or an issue reference.
3. **Change narration and version stamps** — "used to", "no longer", "the
   old X", "v1", "this cut", "now" contrasted with a past state. State the
   present behavior. A fixed regression becomes a present-tense
   counterfactual ("without X, Y happens"), never history ("used to Y").
4. **Review choreography** — "rejected in review", "the reviewer
   confirmed", draft ordinals, round attributions. Keep the surviving
   decision and rationale as plain fact; drop who said it when.
5. **Reviewer-addressed justification** — "the cast is safe — it simply…",
   "this is correct because…". A comment arguing its own correctness is
   talking to a reviewer, not a maintainer. State the invariant that makes
   the code safe, or delete the comment if the code shows it.
6. **Restatement and derivation** — control-flow narration ("first we X,
   then we Y"), test walkthroughs, proofs of obvious branches. Delete;
   keep only a non-obvious contract or invariant.
7. **Hedges and planning residue** — "probably fine for now", "should be
   enough", deferrals with no marker. Promote to `TODO`/`FIXME` with an
   owner or restate as the actual bound; delete the hedge.
8. **Authoring-language slips** — fragments of a working language in prose
   that is otherwise another language, or leftover separators like
   `---- private ----`. Translate or delete.

## What is not leakage

Issue references that resolve at HEAD; suppression justifications
(`eslint-disable … -- reason`, coverage-ignore reasons, empty-catch
explanations); counterfactual-present regression pins ("a naive X
would…"); measured bounds where the provenance word is load-bearing;
runtime old/new states ("the old connection drains before the new one
accepts"); citations into external standards that own their §-numbering;
project voice ("we"); and the sanctioned change-story sections of decision
records and post-mortems. Unaided passes fail in both directions — deleting
durable references and keeping dead ones — so calibrate against
[references/keep-rules.md](references/keep-rules.md) before cutting.

## Workflow

1. Require an explicit scope (paths, a diff, or a PR). Do not infer a
   repository-wide sweep from "clean up the comments". Exclude vendored
   code, generated output, recorded fixtures and snapshots, and archived
   notes — recorded output keeps its voice.
2. Audit read-only first. Run `scripts/recall-batteries.sh <scope>` to
   surface candidate lines by class, then read the densest prose in scope —
   module headers, READMEs, decision notes — without a pattern in hand. The
   batteries over-match by design and under-match by nature; every hit
   needs semantic judgment, and the worst leakage is usually in passages no
   pattern catches.
3. Classify each candidate: keep, trim, restate, add, or defer. Adding is
   real work, not a shortening pass — see
   [references/coverage-by-location.md](references/coverage-by-location.md)
   for what public JSDoc, internal comments, module headers, tests,
   READMEs, and diagnostics must state. Do not manufacture edits to hit a
   deletion target.
4. Fix owner-first. Generated catalogs and derived docs change through
   their source; a model-visible string is behavior, so flag it for a
   snapshot-backed change instead of silently rewording.
5. Report the scope inspected, the changes made, deliberate keeps with the
   keep rule they matched, deferred cases, and the checks actually run.

## Boundaries

- Review and audit requests report findings without editing. Apply changes
  only when the user asked for a fix, trim, or cleanup.
- Never weaken a proposition to make progress. A borderline passage — two
  versions that both preserve the facts but trade principles — is reported
  with both versions and a recommendation, not silently resolved.
- Structure, splitting, and naming belong to `information-architecture`;
  diagrams and tables to `doc-visuals`; a document's self-sufficiency for a
  stranger to `cold-read`. Copyediting for grammar is outside this skill.

## Verify before returning

Every remaining citation in scope resolves at HEAD. Each trimmed passage,
diffed against the propositions enumerated for it, lost nothing a caller or
maintainer relies on. The batteries, re-run over the same scope, return only
hits classified above as sanctioned keeps. Nothing under a vendored,
generated, fixture, or archived path changed.
