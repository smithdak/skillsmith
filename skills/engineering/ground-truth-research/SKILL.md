---
name: ground-truth-research
description: >-
  Verifies one volatile fact against live sources before asserting it or
  designing against it, and attaches an as-of basis to the claim. Use when a
  task depends on current versions, APIs, prices, or tool capabilities, or the
  user says "latest", "current", or "still" about anything that changes. Not
  for settled knowledge, a fan-out report (deep-research), or a durable repo
  note (research-note).
license: MIT
metadata:
  skillsmith-invocation: "model"
  skillsmith-maturity: "experimental"
---

# ground-truth-research

Verify a changing fact before someone acts on it. Treat remembered versions,
prices, limits, and capabilities as hypotheses until checked against current
evidence.

## Match verification to the claim

Identify what must be true for the answer or decision to hold. Consult the
source responsible for that fact: release metadata for versions, the official
contract for supported behavior, or the relevant implementation and runtime
for observed behavior. Use [references/source-rubric.md](references/source-rubric.md)
for source selection. Stable facts can still need verification when uncertain
or consequential; volatility is not the only reason to check.

Inspect the actual source and its scope, version, and date. A snippet or
secondary summary is a discovery aid. Reuse evidence already checked in this
session when its version and freshness still fit the question.

A direct test establishes behavior in the tested environment. If it disagrees
with documentation, report both and investigate version, configuration, or
environment differences; one observation does not rewrite the supported
contract for every user.

## Resolve meaningful uncertainty

One authoritative source may settle a version number or documented limit.
Seek independent corroboration when the claim is disputed, consequential, or
not established by that source. Two pages repeating one announcement are one
source. Additional searches need a specific question they can resolve.

Separate verified facts, inferences, and unknowns. Do not substitute model
recall for a supplied observation merely to form an “independent prior.”
Investigate a conflicting user-provided number on its evidence and scope.

## Report

State the answer with its version or as-of basis and a direct source link.
If verification is unavailable, say exactly what remains unverified and how
that limits the answer. Do not claim browsing, testing, or freshness that did
not occur. Completion means the decision-changing claim is supported or its
uncertainty is explicit; endless corroboration is not required.
