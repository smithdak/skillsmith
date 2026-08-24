# Keep rules, false-positive families, and overcorrection traps

*Adapted from deepseek-ai/deepseek-harness — dsh-trim-cot-leakage and dsh-prose-standard (MIT); see repo-root NOTICES.md.*

Calibration for the judgment call each battery hit requires. The test is
always the same — can a reader at HEAD resolve and verify it? — but these
are the cases where an unaided pass gets the answer wrong in one direction
or the other.

## Keep: resolvable at HEAD, however historical it sounds

| Pattern | Why it stays | Example |
|---|---|---|
| Issue and ticket references | Resolve at HEAD on any surface; never relocate them | `// TODO(#1470): batch these writes` |
| Suppression justifications | Required prose — fix a false reason, never delete it | `// eslint-disable-next-line no-await-in-loop -- sequential by design: each step depends on the prior commit` |
| Counterfactual-present regression pins | Present tense, no history | "Without the lease check, a concurrent push overwrites the remote head." |
| Measured bounds | The provenance word is load-bearing | "512 nested objects parse in ~0.15 s (measured); the limit is 1024." |
| Runtime old/new states | Live objects during a handover, not repo states | "The old connection drains before the new one accepts." |
| External section citations | Standards and committed docs own their numbering | "Per RFC 9110 §10.1.5 …", "see docs/architecture.md §Layer 1" |
| Project voice | "We" as the project, not the session | "We treat drafts as lenient." |
| Genre-sanctioned change story | Decision records and post-mortems have a home for history | An "Alternatives considered" or "Timeline" section |
| Merged-PR citations inside decision records and post-mortems | Sanctioned evidence in those genres only | "Introduced in #812; the guard added in #840 pins it." |

## Known false-positive families

Battery hits that are usually fine:

- **Instrumental "used to"** — "the key used to sign requests" names a
  purpose. The temporal form has a subject's prior state in front of it:
  "colors used to come from the theme".
- **"This PR" in process documentation** — a doc *about* PR workflow
  ("the PR body should list…", templates) legitimately says "PR". The ban
  is on prose adopting one PR's vantage about the code.
- **`v1` as a protocol or path segment** — `/v1/chat`, wire-format names,
  and rule ids like `V1` are identifiers, not version stamps.
- **"Reviewer" as a role** — an agent or function named `*-reviewer`, or a
  review *process* doc, is not review choreography.
- **"Today" in recorded output** — CLI samples and generated timestamps
  keep their voice.
- **"For now" with a marker** — "for now" followed by a `TODO(#N)` is a
  deferral with an owner; the hedge is the unmarked one.

## Overcorrection traps

Each of these makes the prose shorter and wrong. Enumerate the propositions
before cutting and check the result against the list.

- **Flipping an obligation into an endorsement.** "Callers must close the
  handle; leaking it exhausts the pool" → "Closing the handle is
  recommended." The modality changed.
- **Promoting a hypothetical to a shipped feature.** "A later change could
  batch these" → "Writes are batched." Deferred work becomes a `TODO` or an
  issue, never a present-tense claim.
- **Deleting a true fact along with the narration.** "This PR adds retry on
  409; previously the caller failed hard" carries one durable proposition —
  *409 responses are retried* — that must survive as a present-tense
  statement even though both halves of the sentence are leakage.
- **Dropping provenance.** "(measured: 0.15 s)" → "0.15 s". The reader can
  no longer tell a measurement from a guess.
- **Dropping the negative guarantee.** "Never retries a non-idempotent
  request" is the most important clause in its paragraph and the easiest to
  lose in a rewrite.
- **Relocating an issue reference to a notes file** because it "looks
  historical". Issue references resolve at HEAD; they stay where the code
  is.
- **Rewording a model-visible or user-visible string** in passing. Wording
  there is behavior; flag it for a snapshot-backed change.

## Restatement patterns

How each leakage class turns into prose that stands at HEAD:

| Leaked | Restated |
|---|---|
| "See decision 7 — we chose polling." | "Polling, not webhooks: the upstream API has no event feed (docs/decisions/0007-polling.md)." |
| "This PR adds a 5 s deadline to tool calls." | "Tool calls have a 5 s deadline; a slower call is reported as timed out, not failed." |
| "Used to throw on empty input; no longer." | "Empty input returns an empty result." |
| "Rejected in review: caching here." | "Uncached on purpose: the value changes per request." |
| "This cast is safe — it simply narrows." | "`kind` is validated by the schema above, so the cast cannot fail." |
| "First we lock, then we read, then we unlock." | (delete — or) "Read under the lock: a concurrent writer could otherwise interleave." |
| "Probably fine for now." | "Bounded at 1 MB. TODO(#91): stream larger bodies." |
