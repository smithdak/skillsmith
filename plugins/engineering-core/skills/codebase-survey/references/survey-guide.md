# Survey guide — scan briefs and output template

## Subagent scan briefs

Give each subagent the repo root, its brief, and this return contract:
findings as `claim — evidence-path` pairs; unknowns listed separately;
no recommendations (the survey orients, it does not prescribe).

**entry-points brief:** Identify every way the system starts or is
consumed: executable entry files, exported package APIs, service/daemon
definitions, container entrypoints, CI workflow commands. For each: path,
what it starts, and how it is invoked in practice (cite the script or
workflow that calls it).

**test-posture brief:** Locate test directories, runners, and CI test
commands. Report: how tests are run locally (exact command), what layers
are covered (unit/integration/e2e), and the visible gaps — significant
modules with no adjacent tests. Cite paths for both coverage and gaps.

**conventions brief:** Infer the operative conventions from the code:
naming patterns, module layering (what imports what), error-handling
style, configuration mechanics. Where a README or contributing doc claims
a convention, check it against three real files and report agreement or
divergence.

**hot-spots brief (conditional):** From git history: the ten
most-frequently-changed files in the last year and any file over the 95th
percentile in size. High churn + high size + low tests = flag it.

## Output template

```markdown
# Survey — <repo> — <date>

## Purpose & stack
<what this is, in one paragraph; languages/frameworks from manifests>

## Shape
<inventory.sh highlights: size, structure, notable imbalances>

## Entry points
- <path> — <what it starts> — <invoked by>

## Dependencies
<deps.sh summary; flag: pinned vs floating, anything unusual>

## Test posture
<how to run; what's covered; the gaps, path-cited>

## Conventions (observed)
- <pattern> — <evidence paths> [— diverges from documented claim at <path>]

## Hot spots            <!-- only when the scan ran -->
- <path> — <churn/size/test signal>

## Unknowns
- <what could not be determined and what would determine it>
```

Script-derived sections (Shape, Dependencies) are fact; the rest is
inference and the survey must read that way — "appears to", "no evidence
of" — never certainty the evidence doesn't support.
