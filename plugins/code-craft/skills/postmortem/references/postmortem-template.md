# Post-mortem skeleton

*Adapted from deepseek-ai/deepseek-harness — docs/postmortem (MIT); see repo-root NOTICES.md.*

Copy the skeleton, then replace every bracketed line. Delete guidance
comments as you fill them. File it where the repo keeps incident records
(`docs/postmortems/NNNN-short-slug.md` is a reasonable default) and add a
row to that directory's index if one exists.

```markdown
# Post-mortem NNNN: [one-line title — the symptom, in the user's terms]

Status: [draft | resolved | monitoring]
Date of incident: [YYYY-MM-DD]
Author: [role or team]

## Executive summary

[One paragraph, ≤ 5 sentences: what broke → root cause in plain terms →
why it escaped → the durable lesson. Write this last.]

## Summary

[What the system was doing, what was expected, what happened instead.
Enough setting that a reader from another team can follow the timeline.]

## Impact

- Affected: [who / which flows, and for how long]
- Cost: [time lost, data affected, money, trust]
- Not affected: [explicit scope limits — what the evidence rules out]

## Timeline

| When | Event | Evidence |
|---|---|---|
| [timestamp or seq] | [what happened, stated neutrally] | [log line / commit / message id] |
| … | … | … |

## Root cause

**Mechanism.** [The causal chain, precise enough to reproduce. Name the
components, the inputs, and the state that made the path reachable.]

**Why each safety net missed it.**

- [Test X] passed because it asserted [what it really checks], not [what
  everyone assumed].
- [Review] could not see [the missing context].
- [Monitor / alert] measures [transport readiness], which is not
  [application readiness].

## Guardrails added

- [`path/to/test`] — fails when [condition]. Proven by [introducing the
  regression and watching it go red; commit SHA].
- [Rule / doc / alert] — [what it now requires], linked at [path].

## Lessons

- [A rule that transfers beyond this bug.]
- [Another.]
```

## Writing the executive summary

The test of a good one: a reader who stops after it can explain the bug to
a colleague. An example, for a fictional incident:

> The nightly sync job silently skipped every customer with a non-ASCII
> name for three weeks. The exporter normalized names to NFC while the
> matcher compared NFD bytes, so the join produced no rows and the job
> reported success with zero errors. Unit tests used ASCII fixtures only,
> and the job's "rows processed" metric had no lower-bound alert. Lesson:
> a job that can legitimately process zero rows needs an explicit
> expected-volume check, and string-equality tests need at least one
> non-ASCII case.

Four sentences: symptom, mechanism, why it escaped, lesson. Nothing about
who wrote the matcher.

## Timeline entries

Good: `14:02:11 — deploy 3f9a2c1 rolled to prod (deploy log #4412)`.
Weak: `Around 2pm the deploy went out.` The second has nothing a reader can
open. When the only source is memory, mark it: `(recollection, unverified)`.

## Guardrails that actually guard

Before listing a test as a guardrail, run it against the unfixed code (or
reintroduce the regression on a branch) and confirm it fails. Record the
failing output or SHA. A green test that was never seen red is a hope, not
a guardrail.
