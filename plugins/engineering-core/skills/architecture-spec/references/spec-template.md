# Architecture Specification Template

Copy the skeleton, then consult the per-section guidance below it.

```markdown
# <System> — Architecture Specification v0.1

*One-line scope. Spec date. What it targets (versions, platforms) and the
as-of basis for volatile claims.*

## 0. Thesis and positioning
## 1. Design invariants (I1…In)
## 2. Structure / taxonomy
## 3. Interface contracts
## 4. <Domain sections as needed>
## 5. Sequencing and launch scope
## 6. Open decisions (O1…On)
## Appendix — Ground truth, volatile facts, caveats
```

## Per-section guidance

**Thesis** — what this is, for whom, and the one positioning decision that
shapes everything else (e.g. opinionated vs neutral, product vs internal
tool). If two plausible positionings exist, choosing is the spec's first
job; deferring it poisons every later section.

**Invariants** — 3–7 numbered non-negotiables. Test for each: does some
later decision cite it? An invariant nothing derives from is a slogan.
Good invariants are falsifiable practices ("derived artifacts are never
hand-edited"), not aspirations ("the system is maintainable").

**Structure/taxonomy** — directory trees, module boundaries, naming rules.
State the *rules* that generate the structure, not only the snapshot, so
additions don't require re-deriving intent. Separate one-axis concerns:
domain vs lifecycle, category vs maturity — mixing axes in one hierarchy
forces file moves when state changes.

**Interface contracts** — commands, APIs, schemas: inputs, outputs, exit
codes or error semantics, and the compatibility posture (what unknown
input does: reject, warn, pass through). The strict-on-own-surface /
tolerant-on-others'-surfaces asymmetry is usually right.

**Sequencing** — launch-blocking vs fast-follow vs deferred, each item
with a completion threshold. Include re-evaluation triggers: the external
events that reorder the plan.

**Open decisions** — for each O-item: the options, the recommendation with
rationale, the evidence that resolves it, and who owns resolution. Resolve
before the version tag or carry forward explicitly — silent disappearance
of an O-item is how specs rot.

**Appendix** — every volatile fact with source and date; claims that could
not be verified, flagged; the isolation summary (which module owns each
volatile surface). This section is what makes the spec auditable a year
later.

## Anti-patterns

- Rewriting instead of revising — loses the decision trail.
- Un-numbered decisions — can't be cited, can't be tracked.
- "TBD" without an owner and resolving evidence — an O-item is a plan to
  decide; a TBD is a hole.
- Capability claims from memory in fast-moving ecosystems — verify or date.
