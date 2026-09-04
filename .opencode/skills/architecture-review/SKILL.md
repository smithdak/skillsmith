---
name: "architecture-review"
description: "Judges an existing system's structure: recovers claimed invariants, tests them against import-graph and churn evidence, and lands ranked findings with options and kill triggers. Use when the user says \"review our architecture\", \"is this codebase structured well\", or \"where is the coupling\". Not for repo inventory (codebase-survey), new specs (architecture-spec), or one interface (deep-modules)."
license: "MIT"
metadata:
  skillsmith-composes: "deep-modules"
  skillsmith-invocation: "model"
  skillsmith-maturity: "experimental"
  skillsmith-see-also: "architecture-spec, failure-mode-analysis, codebase-survey, migration-plan"
---

# architecture-review

Judge the structure of a system that already exists. The unit of judgment
is an invariant: a rule the system claims about which parts may depend on
which, what changes together, and what is hidden from whom. A review
recovers those claims, tests the code and its history against them, and
lands findings the team can price. It never lands as "rewrite it" — a
rewrite is one option among several, and it needs a transition plan that
belongs to migration-plan, not to this review.

Evidence comes before theory. Read the script outputs before forming a
view of the system; an architecture opinion formed from file names is the
most common way a review goes wrong.

## 1. Recover the claimed invariants

Search for what the system says about itself: an architecture spec, ADRs
or decision records, README, CLAUDE.md, CONTRIBUTING, module-level docs,
lint rules that encode layering (dependency-cruiser, import-linter, Go
`internal/` directories, ESLint boundary rules). Extract every statement of
the form "X never depends on Y", "all Z goes through W", "generated files
are never hand-edited", "one module owns each volatile surface". Number
them I1…In and cite where each was found.

When no source states any, infer three to five from the shape of the code
— the directory layout, the names, the obvious tiers — and label every one
of them *inferred*. An inferred invariant is a hypothesis about what the
authors intended; a finding against it is weaker than a finding against a
stated one, and the review says so.

**Done when:** a numbered list of invariants exists, each marked *stated*
(with its source path) or *inferred*, and the list has at least three
entries.

## 2. Gather evidence before theorizing

Run both scripts from the repository root (or the subtree under review)
and read the full output before writing anything:

- [scripts/depgraph.sh](scripts/depgraph.sh) `[dir] [--maxdepth N]` —
  internal import edges for TS/JS, Python, and Go, then fan-in and fan-out
  top-10 tables and detected import cycles. Read its header for exactly
  what it does and does not follow.
- [scripts/churn.sh](scripts/churn.sh) `[dir] [--since 6.months]` — files
  ranked by how many commits touched them in the window, plus totals per
  top-level directory. Widen the window when the count is thin; a repo
  with twelve commits in six months gives churn no signal.

Both are offline and read-only. For a language neither script covers,
build the same two tables by hand — edges and change counts — before
proceeding; the method depends on having them, not on the scripts.

Then read the code at the hot spots the tables name: the top fan-in
modules, the top churn files, every module on a cycle. Reading three files
the evidence pointed at beats skimming thirty the layout suggested.

**Done when:** both outputs (or their hand-built equivalents) are captured
verbatim into the working notes, and the top fan-in, top churn, and every
cycle member have been opened.

## 3. Map boundaries and coupling

Identify the boundaries the system actually has — packages, layers,
services, the seams between them — and apply the deep-modules discipline
per boundary. For each one, answer in writing:

- **Depth.** Is the interface small relative to what it hides? Restate the
  full interface (types plus invariants, ordering, error modes,
  configuration) in a few sentences; if it will not compress, the
  boundary is carrying the implementation's shape.
- **Deletion test.** Delete the module in imagination. If complexity
  vanishes, it was a pass-through; if it reappears across N callers, it
  earns its place.
- **Direction.** Do the edges cross this boundary in the direction the
  invariants allow? Every edge that crosses the wrong way is a layering
  violation with a path attached.

Then overlay the evidence to find the structural risks:

- **Volatility hot spots** — modules that are both high fan-in and high
  churn. Something many modules depend on *and* that keeps changing is
  where the cost of the current structure concentrates.
- **Cycles** — every cycle depgraph reports, plus what breaks the cycle
  (which edge is the accidental one).
- **Pass-through modules** — failed the deletion test; interface cost with
  no depth.
- **Leaked volatility** — an external schema, vendor surface, or format
  that the invariants say lives in one place but the edges show imported
  from several.

**Done when:** every boundary has a depth verdict, and every hot spot,
cycle, pass-through, and leak is listed with the paths, edges, or churn
counts that establish it.

## 4. Write the findings

A finding is one structural problem, stated as:

1. **The invariant it violates** (by number), or the invariant that is
   *missing* — a rule the system needs and nobody wrote down.
2. **The evidence**: file paths, the specific edge `a -> b`, the churn
   count, the cycle. A finding with no path is an opinion; leave it out or
   downgrade it to an observation.
3. **The cost of change if left**: what gets harder, for whom, how often —
   grounded in churn (how often this area is touched) times fan-in (how
   much a touch ripples). State it as a concrete recurring cost ("every
   schema change touches four packages and a migration"), not an adjective.

Rank findings by that cost. The ranking is the review's main output; a
long unranked list transfers the work of judgment back to the reader.
Separate *observations* (true, cheap, not worth a decision) from
*findings* (worth a decision) so the list stays short.

**Done when:** each finding carries all three parts, the list is ordered by
cost, and nothing in it rests on an unnamed file.

## 5. Lay out the options

For the top findings — usually the ones that share a root cause — present
options, never a single recommendation:

- **Baseline: do nothing.** Always first, always priced: the recurring
  cost from step 4 continued forward. This is the option every other one
  is measured against, and it is sometimes the right one.
- **Two structurally distinct options.** Distinct means different
  boundaries move, not two sizes of the same change. Typical pairs: extract
  the volatile surface behind one seam vs. invert the dependency so the
  hot module stops importing its callers; split a module vs. merge two
  that always change together.

Each option states what changes, which invariant it restores or
introduces, its cost, and a **kill or pivot trigger**: the observable
condition, checkable within weeks, under which the option has proven
wrong and work should stop or turn. An option without a trigger is a bet
without a stake.

Do not recommend a rewrite. If one option amounts to replacing a
substantial part of the system, state it as such and hand the transition
to migration-plan — the sequencing, reversibility, and coexistence
questions are that skill's, and a review that answers them in a paragraph
answers them badly. Findings about what happens when a dependency fails,
rather than how it is structured, belong to failure-mode-analysis; note
them and route them rather than expanding the review to cover them.

**Done when:** the baseline is priced, two distinct options each carry a
trigger, and any rewrite-shaped option names migration-plan as its next
step.

## 6. Produce the review

Write the review document using the section skeleton in
[references/review-checklist.md](references/review-checklist.md); load it
for per-section guidance and the checks each section must pass. Keep the
evidence in the document — the review is read by people who did not run
the scripts, and a table of edges and counts is what lets them disagree
with a finding on the merits rather than on trust.

Scope the review to what the evidence covers. A review of one subtree
says so in its first line, and it does not generalize from that subtree
to the system.

## Before returning

Confirm all of the following against the draft; fix what fails rather
than shipping with a caveat:

- Every invariant is numbered and marked stated (with source) or inferred.
- Both script outputs, or hand-built equivalents, appear in an appendix.
- Every finding names a file path, edge, or count; none rests on a
  directory name alone.
- Findings are ranked by cost of change, and the top finding's cost is a
  recurring, concrete statement.
- The baseline is priced, and each alternative has a kill/pivot trigger.
- No option says "rewrite" without routing to migration-plan.
- The first line states the scope actually reviewed.
