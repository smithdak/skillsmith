---
name: "security-diff-review"
description: "Security review of one code change — a diff, PR, or branch — anchored to what changed, swept out to sibling call sites of any shared helper it touches. Use when the user says \"security review this PR\", \"is this change safe to merge\", or \"run a security pass on my feature branch\". Not for trust boundaries (threat-model), fixing a set of findings (hardening-proposal), or whole-repo audits."
license: "MIT"
metadata:
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
  skillsmith-see-also: "threat-model, falsification-review"
---

# security-diff-review

Review a code change for reachable vulnerabilities. Anchor findings to the
diff and follow affected dependencies far enough to establish the security
consequence. A clean review is a valid outcome.

## Trace the change

Read the changed lines, their callers, supporting code, and relevant controls.
When a shared parser, authorization guard, escaping function, or query builder
changes, inspect its other call sites for the same failure. Track unchecked
callers as coverage limits instead of claiming the sweep is complete.

For each candidate establish an untrusted source, a dangerous sink, a reachable
path between them, and the missing or ineffective control. Account for
middleware, wrappers, tenant boundaries, and deployment conditions. A category
label or suspicious function name is insufficient evidence.

Example: an endpoint may lack a visible ownership check while shared middleware
already enforces it. Verify that middleware covers this route and the resource
identifier used by the sink before reporting an authorization bypass.

Use [references/static-finding-assessment.md](references/static-finding-assessment.md)
for ambiguous reachability or confidence. Apply the falsification-review
question to consequential findings: what existing control would defeat this
attack, and is it present?

## Rank and report

Inherit the repository threat-model severity basis when available; otherwise
use [references/severity-policy.md](references/severity-policy.md). Account for
attacker prerequisites and user impact consistently across findings.

For each supported finding give the location, source-to-sink path, missing
control, severity with its driver, and affected sibling callers. Separate
unverified candidates from findings. Do not perform live attacks or mutate
external systems merely to strengthen a review.

If no candidate survives, say that no vulnerabilities were found within the
reviewed scope. State what was checked and material verification limits;
absence of findings is not a guarantee that a change is safe to merge.

## Completion

Every finding has a reachable path and a consistent severity basis. The review
states its actual scope, distinguishes evidence from assumptions, and accounts
for shared callers without expanding into unrelated repository auditing.
