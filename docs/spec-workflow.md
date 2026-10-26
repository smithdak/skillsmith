# From an idea to a checked implementation

Use this workflow when a feature or system change needs a specification that
another engineer or agent can implement. The author can use the conversation and
repository history; a fresh reviewer checks what the resulting artifact actually
communicates. After implementation, compare its promises with code evidence.

Install the plugins containing the skills you need using the
[installation guide](plugins.md). Skills in this guide are experimental; this
workflow has not demonstrated outcome improvement in a model comparison.

## Choose the next check

| Current state | Skill and plugin | Useful result |
|---|---|---|
| An idea with unresolved scope | `grilling` · planning | Decisions and explicit open items |
| A feature discussion ready to capture | `feature-spec` · planning | Behavior, acceptance scenarios, non-goals and open decisions |
| A system design to document | `architecture-spec` · architecture | Invariants, interfaces, choices and revisit conditions |
| A consequential design choice to challenge | `falsification-review` · planning | Strong counterargument, deciding evidence and confidence |
| A document another person must act on | `cold-read` · dev-workflow | Gaps in comprehension or execution readiness |
| A checked-in contract to compare with code | `spec-drift` · code-craft | Evidenced discrepancies, conflicts and verification gaps |

Use only the checks the work needs. A wording correction does not need the full
sequence. A design critique does not establish that code implements the design,
and a readable plan can still describe a poor design.

## Draft with context, review from the artifact

For example, after discussing an export feature, ask:

```text
Use feature-spec to capture the decisions in this conversation in
docs/designs/exports.md. Include observable behavior, important errors,
acceptance scenarios, non-goals, and unresolved product decisions.
```

Before implementation, check the document from distinct perspectives:

1. **Purpose and simplicity.** Does it solve the stated problem? Search for
   existing components before accepting a proposed new service or abstraction.
2. **Comprehension.** Can the intended audience identify the behavior and its
   constraints from the artifact and its explicit references?
3. **Design correctness.** Challenge the main choice with the strongest competing
   explanation or simpler alternative, and identify the evidence that decides it.
4. **Execution readiness.** Can an implementer identify a first action, public
   contracts, failure handling and completion checks? An unresolved authorization
   policy can block work; choosing private helper names usually does not.

For a substantial handoff, ask:

```text
Use cold-read on docs/designs/exports.md. The audience is a service engineer
implementing the feature. Use a fresh reviewer with no inherited conversation.
Give the reviewer only the document path, this audience and job, and permission
to inspect explicit document references and repository paths needed to check them.
Return findings without rewriting the document.
```

In a host without isolated subagents, the same checks can run inline. Label that
result a simulated cold read; the author still has the surrounding context. In
either case, assess findings against evidence instead of treating reviewer
agreement as proof. Fix within the authorized scope, or record an unresolved
decision with an owner. A clearly recorded blocker still means the affected work
is not ready. Recheck changed sections and dependencies when the changes warrant it.

## Compare the shipped behavior

After implementation, ask:

```text
Use spec-drift to compare docs/designs/exports.md and the API guide with this
checkout. Trace public promises through the implementation and tests. Distinguish
accepted requirements, future phases, conflicting documents, and claims you cannot
verify locally. Report evidence and coverage without editing code or docs.
```

For each discrepancy, the result should identify the contract and source locations,
observable consequence, confidence and needed decision. A renamed file can leave a
stale reference while preserving behavior. A fake-provider test establishes less
than a successful production side effect. An undocumented private helper is not
automatically a contract violation.

Use drift results to decide whether behavior or documentation needs to change.
Review again after a relevant contract or implementation change. This guide does
not create a recurring job or require a particular review cadence.

## Source and adaptation

The [Elephant-Goldfish Model site](https://github.com/google/elephant-goldfish-model/tree/3d0b34821ce88ad328b0c9bf0e06d7eb5f1cd669/site)
introduced the source workflow reviewed here. Its
[review skill](https://github.com/google/elephant-goldfish-model/blob/3d0b34821ce88ad328b0c9bf0e06d7eb5f1cd669/skills/egm_review/SKILL.md)
separates comprehension, design critique and implementation readiness; its
[drift skill](https://github.com/google/elephant-goldfish-model/blob/3d0b34821ce88ad328b0c9bf0e06d7eb5f1cd669/skills/egm_drift_report/SKILL.md)
compares design documents with source. Sources inspected 2026-10-26.

Skillsmith adopts those review distinctions and adds `spec-drift`, while reusing
its existing drafting and critique skills. Review scope follows the task, with
inline fallbacks and no mandatory swarm size or approval at every stage. Automatic
codebase documentation remains outside this addition; use `codebase-survey` when
the task is to get oriented in a repository. Attribution and the changes made are
recorded in [NOTICES.md](../NOTICES.md).
