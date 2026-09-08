---
name: "architecture-review"
description: "Judges an existing system's structure: recovers claimed invariants, tests them against import-graph and churn evidence, and lands ranked findings with options and kill triggers. Use when the user says \"review our architecture\", \"is this codebase structured well\", or \"where is the coupling\". Not for repo inventory (codebase-survey), new specs (architecture-spec), or one interface (deep-modules)."
license: "MIT"
metadata:
  skillsmith-composes: "deep-modules"
  skillsmith-invocation: "model"
  skillsmith-maturity: "experimental"
  skillsmith-see-also: "architecture-spec, failure-mode-analysis, codebase-survey, migration-plan"
---

# architecture-review

Assess an existing system's boundaries against its stated invariants and real
cost of change. A finding needs evidence of structural harm, not a preference
for another directory layout.

## Establish scope and evidence

Recover invariants from architecture docs, decisions, module contracts, and
boundary rules. Cite stated constraints; label inferred ones as hypotheses.
Do not invent a minimum count when the system has few meaningful invariants.

Use [scripts/depgraph.sh](scripts/depgraph.sh) for supported-language import
edges, fan-in/out, and cycles; use [scripts/churn.sh](scripts/churn.sh) for change
counts. Resolve these paths from the installed skill directory and inspect the
script headers for limits. Both are offline and read-only. When the language
or history is unsupported, inspect representative callers and changes directly
and state the coverage limit. An approximation is not a complete import graph.

Read the code behind hotspots. High fan-in or churn is a lead, not a defect;
verify whether changes actually propagate or violate a contract.

## Evaluate boundaries

Apply deep-modules at consequential seams: what must callers know, which
volatile details escape, and where would the complexity go if the abstraction
were removed? Its essential test works inline when the companion is absent:
an interface earns its cost by hiding repeated knowledge or enforcing policy.

Inspect reversed dependency edges, cycles, shared-change hotspots, and leaked
vendor/schema knowledge. Establish the concrete effect on a representative
change before ranking it. Separate design hypotheses from confirmed violations.

## Recommend proportional changes

For each finding give the violated or missing invariant, supporting paths and
edges, and recurring maintenance consequence. Rank by demonstrated cost and
risk. For the material choices compare keeping the current design with feasible
alternatives; do not manufacture two redesigns for a simple defect.

State the recommended change, migration cost and uncertainty, and evidence that
would justify stopping or revisiting it. Use migration-plan for a requested
transition design. Reliability failure modes belong to failure-mode-analysis.
A rewrite needs evidence that its cost is justified by the alternatives.

## Deliver

Use [references/review-checklist.md](references/review-checklist.md) for a full
review when needed. Lead with actual scope and ranked findings; include enough
code and history evidence for a reader to challenge them. Distinguish untested
recommendations from verified improvements. Do not infer whole-system quality
from a narrow subtree or claim absent history was analyzed.
