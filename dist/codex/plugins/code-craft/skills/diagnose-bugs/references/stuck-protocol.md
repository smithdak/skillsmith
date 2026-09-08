# Stuck protocol — what to do when the hypothesis loop stalls

Escalate through these in order. Each one attacks a different way a
diagnosis gets stuck: wrong frame, invisible state, or an
assumption nobody said out loud.

## 1 — Re-read the original evidence

Go back to the first captured failure and read it completely — full
stack, full log context, not the summary formed earlier. Stuck
diagnoses are usually anchored to a half-remembered symptom; the
raw record often names a detail the working theory ignores.

## 2 — Question the assumptions, out loud

List every premise the current theory rests on: "the config loads",
"the migration ran", "the queue delivers once", "this library is
pure". Then check each against reality — most are one command away
from verification, and one of them is false. The buggiest
assumptions are the ones so basic nobody wrote them down.

## 3 — Change altitude

- **Zoom in**: log every intermediate value across the suspect
  boundary and find exactly where the expected value becomes the
  observed one.
- **Zoom out**: reproduce the bug in a scratch script with no app
  code, or in a clean clone, or on another checkout. A bug that will
  not survive transport lives in local state — env vars, caches,
  uncommitted files, editor tooling — which is precisely where
  nobody looks.

## 4 — Invert the search

Instead of "what makes it fail", ask "why does it ever work" — the
success path carries information too. Diff a passing run against a
failing one at the same boundary (inputs, timing, environment) and
treat the delta as the suspect.

## 5 — Sleep on it, deliberately

State the problem in one sentence as if briefing a colleague:
symptom, what was excluded, the sharpest open question. Writing
that sentence routinely exposes the gap; if it does not, the next
session starts from it instead of from scrollback.

## Domain gotchas that eat afternoons

Check these before inventing exotic mechanisms — each has consumed
real debugging days somewhere:

- **Environment drift** — versions, env vars, feature flags, locale,
  timezone differ between "works here" and "fails there".
  `printenv`-level diffs beat theories.
- **Caching layers** — HTTP caches, CDN, memoization, ORM identity
  maps, build artifacts, stale `.pyc`/`dist/`. Force-bypass the
  layer once to see whether the bug moves.
- **Async and concurrency** — race windows shrink repros; try
  artificial serialization (single worker, `--serial`, delays at
  boundaries) to see whether the failure tightens or vanishes.
- **Time and timezones** — DST boundaries, UTC-vs-local parsing,
  clock skew, `Date` mutation. Reproduce with frozen or shifted
  clocks.
- **Encoding and data shape** — BOMs, CRLF, unicode normalization,
  numbers-as-strings, silent truncation at column limits.
- **Dependency behavior** — the pinned version's actual source, not
  its docs. Read the dependency's code for the failing function;
  changelogs between the working and broken versions name their own
  suspects.
- **Silent catch blocks** — an empty `catch`, a swallowed promise
  rejection, a default that hides the real error path. Search the
  path between symptom and suspicion for error handling that eats
  evidence.
