# Routing evaluations

`skillsmith eval` asks a model which skill it would choose from the full catalog's
names and descriptions. This measures **simulated routing**, not actual invocation
inside a host or whether a skill improves the completed task. For the latter, use
[effectiveness comparisons](effectiveness.md) and workspace fixtures.

## Run with Astra and your subscription

```sh
codex login                       # choose ChatGPT
codex login status                # must say Logged in using ChatGPT
bun packages/cli/src/main.ts eval tdd
bun packages/cli/src/main.ts eval tdd --repeat 3 --escalate 9
# Full catalog: start this only when you want to use that many sessions.
bun packages/cli/src/main.ts eval --repeat 3 --escalate 9
```

The defaults are `--model gpt-6-astra --effort medium --concurrency 1 --repeat 1`.
Each judgement starts a fresh Codex session under your ChatGPT subscription.
There is no API-key requirement or automatic API fallback. The adapter rejects
API-key login and fixes the authentication method for each invocation. Subscription
usage limits apply. Authentication and isolation details are in
[the effectiveness guide](effectiveness.md#run-with-your-subscription).

The current suite contains **606 cases across 39 skills**: one full pass needs 606
sessions. Three votes per case need 1,818 sessions before escalation. Start with the
skill whose description changed. `--concurrency` controls simultaneous sessions;
`--timeout-ms` defaults to 300000 per session. There is no automatic retry or model
substitution on access or usage-limit failure.

Model calls run locally after login. The manual GitHub workflow
[eval.yml](../.github/workflows/eval.yml) checks evaluation infrastructure offline;
it contains no provider secret or paid model call. Ordinary tests use fake runners.

## What is scored

1. Build a sorted listing of all non-draft skill names and descriptions.
2. Give the listing and each case's message to the judge. It chooses one listed
   skill or null using a constrained JSON response. It does not perform the task.
3. A positive case passes when the named skill is selected. A negative case passes
   when any other skill, or null, is selected.
4. Take the strict majority across repeated judgements; ties fail. The fraction of
   passing cases is the skill's hit rate. A rate below the configured minimum
   (0.85 here) produces a V8 diagnostic.

See [core evaluation logic](../packages/core/src/eval.ts) and the
[Codex adapter](../packages/cli/src/codex-runner.ts). The schema allows one selection;
a real host may invoke multiple skills, use a different listing, or never invoke one.

## Write cases

Each skill owns `evals/evals.json`:

```json
{
  "should_trigger": [
    {"prompt": "TDD this bugfix — failing test first, then the fix"},
    {"prompt": "Build the rate limiter test-first"},
    {"prompt": "Let's use red-green-refactor for the coupon rules"}
  ],
  "should_not_trigger": [
    {"prompt": "Run the test suite and summarize failures", "note": "Execution, not test-first development"},
    {"prompt": "Add characterization tests around this existing parser"},
    {"prompt": "Why does this test fail only on CI?"}
  ],
  "effectiveness": []
}
```

At least three positive and three negative cases are required. Notes are optional;
placeholder TODO prompts are invalid. Unknown keys fail the strict
[schema](../packages/core/src/schemas/evals.ts). Optional effectiveness entries are
not executed by this command; paired tasks use an explicit benchmark suite.

Prefer natural requests, ambiguous boundaries and realistic sibling confusion over
paraphrases of the description. Keep fresh validation cases outside the refinement
loop. A model can memorize the desired distinction when the same cases repeatedly
guide editing.

## Variance and persisted evidence

Single votes are smoke checks. `--repeat N` shows whether the model consistently
makes the same decision. `--escalate M` extends only split cases to M total votes;
unanimous cases stop at N. This saves sessions but can miss an unstable case that
happened to be unanimous. Review both `failingPrompts` and `flakyPrompts`; rerun
consequential ambiguous cases before revising a description.

Full runs write [`.skillsmith/eval-results.json`](../.skillsmith/eval-results.json).
The file records the runner/model/settings/version identifier, vote counts, listing
hash, description hashes, case hashes, dates, failures and split votes. One-skill
runs merge only when the existing listing, runner identifier and vote settings match.
Otherwise results print without overwriting the old report. A new Astra result is
never relabeled as an old Anthropic measurement or merged into it.

`generate` renders these measurements in the catalog's **Routing simulation** column.
Rerun generation after updating committed results. Description, case or listing
changes invalidate the corresponding evidence; validation checks those hashes.
Body-only changes need separate outcome comparisons. They do not invalidate a
measurement of unchanged descriptions, but old routing evidence says nothing about
the rewritten body's quality.

The committed routing report dated 2026-09-04 was produced by the historical
`claude-sonnet-5` judge. It remains explicitly labeled with that provenance. It is
not an Astra result. New local evals use your Codex subscription.
