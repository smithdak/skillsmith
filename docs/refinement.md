# Refining skills into measurable capabilities

The goal is a small library of reusable methods that improves completed work across
models, plus independently installable plugins for broader workflows. Instructions
can supply expert constraints, examples, tools and verification habits. They cannot
guarantee that every model acquires frontier-model reasoning ability.

## Capability standard

A focused skill states its input, useful output, non-obvious decision rule, relevant
failure boundary and completion check. Its normal path stays in SKILL.md. Conditional
detail goes into a reference that explains when to open it; repeated deterministic
work belongs in a script with documented inputs, outputs and failure behavior.

Target 250–600 body words, shorter when sufficient. The repository enforces 1,200
estimated body tokens (characters divided by four); this is a budget heuristic,
not tokenizer measurement. Do not achieve a small body by making every task load a
large mandatory reference. Preserve examples and domain constraints that help a
weaker model decide correctly.

Use decision criteria in place of fixed report lengths, obligatory questions or
universal agent counts. Existing authorization carries forward. Optional companion
skills and delegation must have an inline or sequential fallback. Resource paths
resolve from the installed skill, so a copied folder remains useful.

## 2026-09-08 audit

The [initial audit](refinement-audit-2026-09-08.md) records all 39 body changes
against source commit `efb6270`. That pass reduced combined body length from
26,577 to 14,473 words (45.5%), excluding references. Those are historical counts
before the focused documentation-skill revision. Descriptions and routing cases
were preserved.

All revised skills remain **experimental**. Historical routing scores retain their
original judge and date. Shorter instructions are an editing result; they do not
by themselves establish better model performance.

## Focused documentation skills

The docs-craft 0.3.0 revision keeps `readme-authoring` and `doc-visuals` small while
making their references teach editorial decisions and show worked examples:

- README guidance starts with the intended reader, a concrete proof and a complete
  first-use path. The body now routes to its structure and example references.
- Visual guidance chooses a representation by the reader's question, preserves
  branch semantics, and separates parsing from rendered inspection. It replaces
  arbitrary diagram, table and callout quotas with checks tied to comprehension.
- References cover page hierarchy, useful evidence, authentic assets, before/after
  examples and narrow layouts. Optional detail stays outside the core procedure.

The [two-task Astra pilot](../benchmarks/results/docs-quality-2026-09-08.md) passed
all ten criteria in all three arms. It found no measured uplift. Rendered inspection
also exposed a cramped sequence example and led to a compact alternative in the
reference. More difficult held-out tasks, independent visual review and weaker-model
comparisons are still needed before making quality or transfer claims.

## Evidence that determines the next revision

1. **Routing:** natural positive requests and near misses against the actual listing.
   Keep held-out prompts separate from description editing. The existing command is
   a selection simulation; observe actual invocation separately in each target host.
2. **Outcomes:** compare no skill, the prior version, and the revision under the same
   model, task and tool settings. Inspect failures and unnecessary interruptions,
   along with output quality, time and tokens. Use Astra with the Codex subscription
   as the initial runner; later test a weaker model before claiming transfer.
3. **Runtime:** install one skill or plugin in a clean location, verify resource paths,
   exercise required scripts/tools, and check the resulting artifact. Schema-valid
   packaging alone does not prove that a host selected or executed it correctly.

The [text suite](../benchmarks/effectiveness.json) starts with decision-record,
premortem and failure-mode-analysis. It is small development coverage, with eagerly
loaded references and same-model grading. See [the runner guide](effectiveness.md)
for the exact subscription command and result interpretation. The
[2026-09-08 Astra pilot](../benchmarks/results/README.md) preserved 3/3 all-criteria
passes versus the prior skills while reducing observed tokens and time on these
three tasks. It does not establish transfer to other models or the remaining skills.

The [workspace fixtures](../benchmarks/workspaces/README.md) cover tdd, diagnose-bugs
and security-diff-review. The pricing and concurrency graders were checked against
both the broken starter and independent fixes. Those checks validate graders, not
model performance. Trace review is still required for process claims such as TDD.

Promote a skill only after its difficult cases and likely near misses hold up, with
named model/harness evidence. A failing case can justify revising an instruction,
adding a discriminating example or script, merging overlapping skills, or retiring
a skill that adds no value. Do not grow every body to solve a model-specific weakness.

## Plugins

The nine workflow groups now also compile into native Codex bundles with local
marketplace metadata. Each contains its skill resources and attribution files and
can be installed independently. Start with cohesive skill bundles; add an MCP
integration or host-specific workflow component only when the job needs it and its
behavior can be exercised independently. The [plugin guide](plugins.md) describes
the emitted structure and the boundary between portable skills and host components.

Method references: the Agent Skills guidance separates
[task evaluations and baseline comparisons](https://agentskills.io/skill-creation/evaluating-skills)
from [description optimization](https://agentskills.io/skill-creation/optimizing-descriptions).
