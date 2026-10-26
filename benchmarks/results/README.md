# Astra subscription pilots — 2026-09-08

These are small development experiments using `gpt-6-astra`, medium reasoning,
Codex CLI 0.153.4, authenticated through ChatGPT. No paid API adapter was used.
The same model solved and graded in separate fresh sessions. See the
[evaluation protocol](../../docs/effectiveness.md) for isolation and limits.

## Documentation skills

The [focused docs report](docs-quality-2026-09-08.md) compares README authoring and
diagram explanation with no skill, the preceding body revision, and revised
references. All arms passed 2/2 tasks and 10/10 criteria. This trial demonstrates
no uplift; the report separates factual grading from rendered inspection.

## Decision and risk text outcomes

[Complete report](astra-text-pilot-2026-09-08.json): three tasks × three arms × one
repeat. Prior skills come from source commit `efb6270`; current instructions are
identified by exact hashes in the report. A task passes only when all four criteria pass.

| Arm | Tasks passing every criterion | Criteria passed | Mean solver input tokens | Mean solver output tokens | Mean solver seconds |
|---|---:|---:|---:|---:|---:|
| No skill | 0/3 | 9/12 | 8,878 | 827 | 31.7 |
| Previous skill | 3/3 | 12/12 | 11,266 | 2,776 | 95.2 |
| Refined skill | 3/3 | 12/12 | 10,461 | 1,399 | 53.1 |

The refined instructions preserved the prior skills’ 3/3 all-criteria result with
fewer input and output tokens and shorter observed solver time in this sample.
The no-skill answers were substantively useful, passing 9/12 individual criteria.
Their omissions were specific: an explicit retry-policy revisit trigger, ranked
export risks with linked warning signals, and likelihood/detectability rationale
for the queue analysis. The answers and grader reasons are retained for review.

These results do not establish catalog-wide or cross-model uplift. The cases were
visible during refinement, there is one repeat, all-or-nothing scoring magnifies
single omissions, and a same-model grader can share blind spots with the solver.
Time includes session overhead and is especially noisy. A human should audit grades
before using this pilot for a release claim. Actual tool execution and automatic
skill invocation were not part of the text experiment.

**Report recovery:** the initial CLI logging path truncated the final JSON at
65,536 bytes. Eight complete trial records were recovered. Only the final previous-
skill queue solve-and-grade pair was rerun, with verified matching instruction hash
and runner settings. Summary metrics were recomputed over the eight retained trials
and the recovered trial. The report records this intervention and its timestamps.
The CLI now writes reports outside the logging layer, with a regression test for
large stdout and file outputs. There were 20 solve/grade sessions including recovery.

## Routing smoke check

[Routing report](astra-routing-smoke-2026-09-08.json): three explicit probes correctly
selected tdd, diagnose-bugs and no skill. This verifies the Astra routing adapter;
it is not a replacement for the
[606-case historical routing report](routing-2026-09-04.json). That report was
measured by `claude-sonnet-5` against the 39-skill catalog and is preserved unchanged.
The current 40-skill catalog is unmeasured; the archived scores do not describe it.

## Offline verification

- 141 repository tests passed, including evaluation contracts, refusal/error paths,
  large report persistence, native packaging and stale-output checks.
- Both package typechecks, strict source validation, drift check and version guard passed.
- All nine native Codex bundles passed the plugin validator.
- Pricing and concurrency workspace graders rejected broken starters and accepted
  independent reference fixes. These were grader checks, not model workspace runs.
