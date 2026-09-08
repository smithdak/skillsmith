# Architecture review evidence checklist

Use this shape for a substantial review; adapt or omit empty sections for a
small scope. The main skill determines scope and evidence requirements.

## Report shape

1. Scope, revision, and evidence window actually inspected.
2. Ranked findings and recommendation with its main tradeoff.
3. Stated invariants with sources, and separately labeled inferred ones.
4. Supporting code, import edges, and change-history evidence.
5. Feasible options for consequential changes, including keeping the current
   structure when viable.
6. Verification limits, unresolved decisions, and next actions.

## Findings

Each finding connects an invariant or missing boundary to specific evidence
and a recurring consequence. For example: a vendor schema leaks across three
packages, and recent vendor changes require coordinated edits in all three.
Counts, paths, and examples must come from the inspected repository.

High churn alone may reflect active development; high fan-in may identify a
stable shared utility. Show the harmful coupling or propagation before calling
it a structural defect. Record intact invariants too; a clean boundary does
not need a manufactured finding.

## Options

For a meaningful choice, state the current cost and compare feasible changes.
Explain which knowledge moves behind a boundary, what consumer code changes,
and what cost or risk the transition introduces. Recommend the option whose
tradeoff best fits the user's constraints. A fixed option count is unnecessary.

Name an observable condition for revisiting a costly recommendation. A large
replacement needs a transition design, rather than an unsupported assertion
that a rewrite will be simpler.

## Evidence and limits

Include the relevant command and output or an accessible artifact reference.
Summarize large outputs instead of copying an entire import graph into the
report. State script coverage, unavailable history, dynamic imports, generated
code exclusions, and uninspected boundaries when they limit the conclusion.
Confirm representative edges and findings in the actual code.
