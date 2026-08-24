# Hardening proposal format

*Adapted from openai/codex-security (Apache-2.0); see repo-root NOTICES.md.*

Copy the skeleton, then apply the honesty gates below.

```markdown
# <System> — Hardening Proposal

*Findings addressed: <count / source>. As-of: <date / commit>.*

## Cluster <n>: <violated invariant, one line>

Findings in this cluster: <ids / short labels>.

**Target invariant** — <the falsifiable property the hardened system holds>.

**Baseline** — <what holds today> · residual risk: <what stays exposed>.

### Options

| Option | Mechanism | Cluster coverage | Blast radius | Perf cost | Dev friction | Time | Residual risk |
|---|---|---|---|---|---|---|---|
| A: <name> | <how> | | | | | | |
| B: <name> | <how> | | | | | | |
| C: <name> | <how> | | | | | | |

**Recommendation** — <option> because <driver>. Would change if <condition>.

### Before / after

<mermaid diagram of the recommended option's boundary change>
```

## Option-distinctness test

Two options are distinct only if they differ in *mechanism* and produce
*different tradeoffs*. Apply the axes:

- **Where the control lives** — at the sink, at the trust boundary, or
  removed by dropping the capability entirely.
- **When it is enforced** — runtime check, build/CI gate, or type-system
  guarantee.
- **What supplies it** — an adopted library, a platform feature, or an
  in-house control.

If two rows share a mechanism and score the same across the matrix, merge
them; you have one option.

## Tradeoff honesty gates

- Every dimension gets a value for every option. A blank cell is a hidden
  tradeoff. Where the honest answer is "we don't know yet" write
  **unknown**; where an option neither helps nor hurts on a dimension write
  **neutral**. Do not omit.
- Coverage is stated as a fraction of the cluster, not implied. An option
  that closes three of five findings says so.
- Residual risk is never blank. Every option leaves something; name it.
- The recommendation carries a falsifier: the specific fact or constraint
  that would make a different option correct.

## Diagram guidance

The before/after diagram shows the boundary change, not the whole system:
where untrusted input entered and reached a sink before, and where the new
control intercepts it after. Keep it to the changed path. Follow the
doc-visuals rules so it survives its renderer.
