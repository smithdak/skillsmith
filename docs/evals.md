# Evals — measuring whether skills actually trigger

A skill whose description never fires is dead weight, and one that fires on
everything is worse. `skillsmith eval` measures the thing that actually
determines triggering: the description's **selectivity against the whole
catalog**, not the skill in isolation.

## How the measurement works

Implementation: [`packages/core/src/eval.ts`](../packages/core/src/eval.ts).

1. Build the **listing** exactly as the runtime would present it: every
   non-draft skill's `name` + `description`, sorted.
2. For each eval case, ask a judge model: given this listing and this user
   message, which single skill (if any) would be invoked? The judge answers
   `{"skill": "<name>"}` or `{"skill": null}`, temperature 0, and is
   instructed to pick nothing when in doubt.
3. Score: a `should_trigger` case passes when the judge picks *the skill under
   test*; a `should_not_trigger` case passes when it picks anything else —
   including a different skill — or nothing. Confusion with a sibling skill
   counts against you, which is the point.
4. Hit rate = passing cases / total cases per skill. Any skill below
   `[policy]."min-trigger-hit-rate"` (0.85 here) produces a V8 error.

Temperature 0 reduces variance but does not eliminate it — eval is the one
intentionally non-deterministic command, which is why its output is treated as
a **source** (committed, only changed by rerunning) rather than a generated
artifact. See [Architecture — why determinism is load-bearing](architecture.md#why-determinism-is-load-bearing).

## Writing `evals/evals.json`

Schema ([`schemas/evals.ts`](../packages/core/src/schemas/evals.ts) — strict,
unknown keys are errors):

```json
{
  "should_trigger": [
    { "prompt": "TDD this bugfix — failing test first, then the fix" },
    { "prompt": "red-green-refactor the new rate limiter with me" }
  ],
  "should_not_trigger": [
    { "prompt": "run the test suite and tell me what's failing",
      "note": "running tests, not driving development with them" }
  ],
  "effectiveness": []
}
```

- ≥3 cases in each of `should_trigger` and `should_not_trigger` (V8).
- `note` is optional documentation of why the case exists — most valuable on
  should-not-trigger cases, where the boundary is the insight.
- Prompts containing `TODO` are rejected as scaffold placeholders (V8).
- `effectiveness` (task + success_criteria pairs for on/off baseline
  comparison) is accepted but not yet executed — reserved for v0.2.

**Write phrasings real users type, not paraphrases of the description.** If
your should-trigger cases quote the description back, the eval measures
string-matching, not triggering. The strongest should-not-trigger cases are
*near misses* — requests adjacent to the skill's territory that belong to a
sibling skill or to no skill. The example above (abridged from
[`skills/engineering/tdd/evals/evals.json`](../skills/engineering/tdd/evals/evals.json))
separates "drive development with tests" from "run/fix existing tests".

## Running

```sh
bun packages/cli/src/main.ts eval               # all skills; writes results file
bun packages/cli/src/main.ts eval tdd           # one skill; does NOT write results
bun packages/cli/src/main.ts eval --model claude-sonnet-4-6 --concurrency 4
```

- Requires `ANTHROPIC_API_KEY` (exit 2 if unset). Locally: put it in a
  gitignored `.env` at the repo root — Bun loads `.env` automatically. A
  Claude subscription does not cover API calls; this needs an API key with
  billing.
- Cost intuition: 14 skills × 8 cases = 112 judge calls, each ~2k input
  tokens (every call embeds all 14 descriptions) and ~20 output tokens
  against the default `claude-sonnet-4-6` judge — small change, but not
  free, which is why CI runs evals only on manual dispatch ([`.github/workflows/eval.yml`](../.github/workflows/eval.yml):
  `gh workflow run eval.yml`).
- Failing cases print with the judge's actual pick, which tells you *which*
  sibling skill is absorbing your traffic:

```
feature-spec: 88% (7/8)
  FAIL [expected trigger] "spec out the export feature" → judged: architecture-spec
```

## Results, badges, and when to rerun

Full runs write [`.skillsmith/eval-results.json`](../.skillsmith/eval-results.json)
(committed): judge model, run date (day precision — same-day reruns stay
byte-stable), and per-skill `{hitRate, cases, failing}`. Single-skill runs
deliberately do not write it — a partial file would misrepresent the catalog.

`skillsmith generate` reads the file and renders a **Triggering** badge column
in [`catalog/CATALOG.md`](../catalog/CATALOG.md)
(`100% (8/8, claude-sonnet-4-6, 2026-07-15)`), so consumers see measured
triggering, not claimed triggering. After a full eval run, rerun `generate`
and commit both files together, or `check` will report catalog drift.

Rerun evals whenever you change any skill **description** (yours or a
sibling's — selectivity is relative) and when adding a skill to the catalog.
