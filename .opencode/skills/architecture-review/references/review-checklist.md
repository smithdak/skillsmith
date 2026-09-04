# Architecture Review — document skeleton and checks

Copy the skeleton, then use the per-section guidance below it. Section
numbers match the workflow steps in SKILL.md so a reader can trace each
part of the document to the step that produced it.

```markdown
# <System or subtree> — Architecture Review

*Scope actually reviewed (paths). Date. Commit reviewed. Evidence window
(--since). What was not reviewed.*

## 0. Summary
## 1. Invariants (I1…In) — stated or inferred
## 2. Evidence
## 3. Boundaries and coupling
## 4. Findings, ranked by cost of change
## 5. Options
## 6. Handoffs and open questions
## Appendix — script output
```

## Per-section guidance

**Header line** — the scope is the first thing a reader sees because it
bounds every claim that follows. Name the paths reviewed, the commit, and
the churn window; name what was excluded (tests, generated code, a
service not in this repo). A review whose scope is implied gets cited for
things it never examined.

**0. Summary** — at most eight lines: the top three findings by cost,
each in one sentence with its evidence, and the one-line shape of the
options. A reader who stops here should know what the review found and
what it costs to ignore. No recommendation lives here; the options do.

**1. Invariants** — the numbered list from step 1. Each entry: the rule,
*stated* with the file path that states it, or *inferred* with the
observation it was inferred from. Include invariants the system needs but
nobody wrote down as "missing" entries — a finding in step 4 can point at
a missing invariant as legitimately as at a violated one. Check: does at
least one finding cite each invariant? An invariant nothing cites is
decoration; either a finding is missing or the invariant is.

**2. Evidence** — the tables that matter, pulled up from the appendix:
fan-in top-10, churn top-25, cycles, and a short note on what the scripts
could not see (a language not covered, dynamic imports, a monorepo
package that resolves through a workspace alias). Also the hot-spot
table: modules that appear in both fan-in and churn top lists, with both
numbers side by side. That table is usually the single most persuasive
thing in the document.

**3. Boundaries and coupling** — one subsection per boundary examined:
the interface restated in a few sentences, the depth verdict, the
deletion-test result, and the edges that cross it the wrong way. Keep
verdicts terse; the justification is the edges and the restated interface,
which the reader can check. Layering violations, cycles, pass-throughs,
and leaked volatility each get a line with paths.

**4. Findings** — the ranked list. Fixed shape per finding:

```markdown
### F1. <one-line title>
- Invariant: I3 (violated) / missing
- Evidence: `src/billing/index.ts -> src/notify/mailer.ts`; churn 14/6mo;
  fan-in 9
- Cost if left: every pricing change touches billing, notify, and the
  webhook tests (three of the last five did)
```

Order strictly by cost. Put observations — true, cheap, no decision
needed — in a short list after the findings, not among them. Check every
finding for a path or count; a finding without one gets demoted to an
observation or cut.

**5. Options** — for the leading findings (group those sharing a root
cause). Fixed shape:

```markdown
### Baseline — do nothing
Cost carried forward: <recurring cost from F1..Fn>

### Option A — <what moves>
- Change: <boundaries that move, edges that disappear>
- Restores / introduces: I2 / new I6
- Cost: <effort, migration, risk>
- Kill/pivot trigger: <observable within weeks; what it means if seen>

### Option B — <structurally different move>
...
```

Distinct means different boundaries move. Two sizes of the same
extraction are one option. Every option carries a trigger the team can
actually observe (a metric, a count of touched packages per change, a
build time, a class of bug recurring), with a horizon. An option that
replaces a substantial part of the system is labeled as such and points
to a migration plan as its next document rather than sketching one here.

**6. Handoffs and open questions** — what this review deliberately did
not answer and who answers it: transition sequencing for any large
option, failure behavior of dependencies the structure exposes, questions
that need someone who was there for a decision. Each item names the
next artifact or person, so the list is a set of next steps and not a
disclaimer.

**Appendix** — the verbatim script outputs and the exact commands run,
so a reader can rerun them at a later commit and diff. Hand-built tables
for uncovered languages go here with the method used to build them.

## Anti-patterns

- A recommendation in place of options — the reader inherits a decision
  without its alternatives.
- "The architecture is messy" — an adjective where a path belongs.
- Findings ranked by how interesting they are rather than what they cost.
- A rewrite option with no trigger and no transition owner.
- Generalizing from the reviewed subtree to the whole system.
- Evidence tables left out to keep the document short — they are the part
  that lets a reader disagree on the merits.
