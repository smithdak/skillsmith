---
name: "codebase-survey"
description: "Maps an unfamiliar repository fast: inventory scripts plus parallel subagent scans, synthesized into a path-anchored survey document. Use when the user says \"survey this codebase\", \"help me get oriented in this repo\", \"map out this project\", or has inherited a codebase. Not for judging its structure (architecture-review), a new design (architecture-spec), one bug (diagnose-bugs), or one function."
license: "MIT"
metadata:
  skillsmith-composes: "doc-visuals"
  skillsmith-invocation: "user"
  skillsmith-maturity: "experimental"
---

# codebase-survey

Orient a newcomer with a map of the repository's purpose, entry points,
important boundaries, commands, and verification limits. Anchor claims to paths
or observed command output.

## Inventory

Resolve [scripts/inventory.sh](scripts/inventory.sh) and
[scripts/deps.sh](scripts/deps.sh) from the installed skill directory, passing
the target repository as their argument. Use the outputs for size, file types,
and dependency manifests; inspect their documented coverage before treating
them as exhaustive. If the shell or a helper is unavailable, use equivalent
read-only file and manifest inspection and state the limitation.

## Trace the useful paths

Inspect how the system starts, where its public behavior lives, how tests run,
and conventions demonstrated by representative code. Cross-check docs against
implementation. Describe visibly uncovered behavior as an observation, not a
coverage measurement inferred from filenames.

For a substantial repository, independent scans of entry points, tests, and
conventions can run in parallel when subagents are available and authorized.
Give each a bounded scope and request path-anchored findings. With no delegation,
run the same scans sequentially. Do not require a particular model or agent
name. [references/survey-guide.md](references/survey-guide.md) supplies scan
briefs and a report shape.

## Synthesize and check

Lead with purpose and stack, then a navigable map, important flows, commands,
and material unknowns. Apply doc-visuals' essential check inline when the
companion is absent: every tree path exists, diagrams match observed flows,
and commands are labeled with their verification status.

Verify representative claims from different scans against their sources.
When a claim fails, investigate the affected area rather than trusting its
summary. Keep scan evidence and interpretation distinct. Retain the final map
in the main conversation so later work can use it.

The survey is complete when a newcomer can locate the relevant entry point,
find how to run an appropriate check, and see which areas remain unexplored.
Avoid inventing unknowns merely to populate a section.
