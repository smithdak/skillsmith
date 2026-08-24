---
name: hardening-proposal
description: >-
  Turns a set of security findings into a decision-ready hardening proposal:
  clusters them by the invariant they violate, defines a falsifiable target
  invariant, and presents a baseline plus two or three genuinely distinct
  options with an honest tradeoff matrix. Use this skill when the user says
  "how should we fix these findings", "propose a hardening plan", "what are
  our options to close this class of bugs", or has a list of vulnerabilities
  and needs an architectural response rather than one patch at a time. Not
  for writing a single fix, triaging findings, or authoring a security
  policy document.
license: MIT
metadata:
  skillsmith-composes: "falsification-review"
  skillsmith-see-also: "architecture-spec, doc-visuals"
  skillsmith-invocation: "user"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# hardening-proposal

Individual patches close individual holes; a hardening proposal closes the
class. Findings that look separate usually violate the same invariant — the
proposal's job is to name that invariant, define what "fixed" would mean as
a testable property, and lay out distinct ways to get there so the decision
is made on tradeoffs, not on the first idea that worked.

## Cluster by violated invariant

Group the findings by the property they each break, not by file or by CWE
number. Three injection findings, a path-traversal, and an SSRF may all be
one invariant — "untrusted input never reaches a sink without passing a
context-appropriate control." Naming the shared invariant is what turns a
list of patches into an architectural decision. A finding that fits no
cluster gets its own; do not force it.

## Define the target invariant

For each cluster, state the invariant the hardened system will hold, phrased
so it can be falsified: not "input is validated" but "every SQL sink
receives only parameterized values; string-concatenated SQL fails a build
check." A target invariant you cannot write a test or a lint rule against is
an aspiration, and it will not survive contact with the next feature. This
is the same discipline as an architecture-spec design invariant, applied to
security properties.

## Generate distinct options

For each cluster, present a **baseline** (what holds today, and its residual
risk) plus **two or three genuinely distinct options** — distinct in
mechanism, not three flavors of the same idea. Typical axes of real
difference: fix-at-the-sink vs fix-at-the-boundary vs remove-the-capability;
runtime enforcement vs build-time enforcement; library adoption vs in-house
control. If two options collapse to the same tradeoffs, they are one
option, not two.

Pressure-test the leading option with the
falsification-review discipline: state the strongest case against it and the
evidence that would flip the choice, before presenting it as the
recommendation.

## Build the tradeoff matrix

Score each option across the dimensions that actually decide it — coverage
of the cluster, blast radius of the change, performance cost, developer
friction, time to implement, and residual risk. Be honest about unknowns:
where a dimension is genuinely unknown or a wash, write "unknown" or
"neutral" rather than omitting the cell — an omitted tradeoff reads as no
tradeoff and biases the choice. A before/after diagram for the recommended
option makes the boundary change legible; render it with the doc-visuals
discipline.

Matrix layout, the option skeleton, and the honesty gates are in
[references/proposal-format.md](references/proposal-format.md).

## Boundaries

- Propose; do not implement. The deliverable is a decision-ready document,
  not a patch set.
- Recommend one option and say why, but present the alternatives fairly
  enough that the reader could choose differently on their own constraints.
- Do not inflate the option count. Two real options beat three where the
  third is padding.

## Verify before returning

Each cluster names a falsifiable target invariant. Each option is distinct
in mechanism and scored on the same dimensions, with unknowns marked rather
than hidden. The recommendation states its driver and the condition that
would change it. A proposal that offers one dressed-up option, or a matrix
with no "neutral"/"unknown" cells anywhere, has probably hidden a tradeoff.
