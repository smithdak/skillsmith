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

Review the change, but do not trust its edges. A diff shows the lines that
moved; the vulnerability it introduces often lives in a line that did not —
a sibling caller of the helper the change modified, a second route with the
same missing check. Anchor to the change, expand along its real blast
radius, and stop there.

## Anchor, then expand deliberately

Start from the changed lines. Expand outward only along paths the change
actually affects:

- **Directly supporting code** — functions the change calls, callers of the
  functions it changed, types and validators it relies on.
- **The sibling-instance sweep** — when the change touches a *shared* helper
  (a parser, an auth guard, an escaping or sanitizing function, a query
  builder), the same pattern almost always exists at other call sites. If
  the change fixes or weakens a check in one place, find every other place
  that check should also hold. A patch that hardens one caller while three
  siblings stay vulnerable is a partial fix reported as a complete one.

Do not expand into unrelated subsystems. Repository-wide auditing is a
different job; here the change defines the perimeter.

## Assess each candidate before reporting

For every suspected issue, establish the evidence chain before calling it a
finding: an untrusted **source**, a dangerous **sink**, a **reachable path**
between them, and the **absence of a control** that would stop it — assessed
across any wrapper or boundary the path crosses. The full evidence order and
confidence criteria are in
[references/static-finding-assessment.md](references/static-finding-assessment.md).

A candidate that cannot show a reachable source-to-sink path is a note, not
a finding. Before reporting anything consequential, apply the falsification-review
discipline: state what would prove the finding wrong and check for it —
security reviews are where plausible-but-unreachable claims do the most
damage to trust.

## Assign severity on a fixed basis

Rank each confirmed finding with the impact-times-likelihood frame and the
deployment-context weighting in
[references/severity-policy.md](references/severity-policy.md). Where a
threat model exists for the repository (`docs/THREAT_MODEL.md`, or wherever
the user points), its severity basis governs; this review inherits it rather
than inventing a new scale. Reachability by an anonymous production request
outranks a path that needs admin access or a local developer shell.

## Report

For each finding: the file and line, the source-to-sink path in one or two
sentences, the missing control, the severity with its driver, and — when the
sibling sweep found them — the other call sites carrying the same pattern. A
clean review is a valid result; say the change is safe to merge and name
what was checked, rather than manufacturing a finding to look thorough.

## Verify before returning

Every reported finding names a concrete source, sink, and reachable path,
not a category label. Every shared helper the change touched has had its
other call sites checked or been explicitly noted as not shared. The
severity of each finding cites the same basis. If nothing survived
assessment, the review says so plainly.
