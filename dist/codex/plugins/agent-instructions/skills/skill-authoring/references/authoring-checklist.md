# Skill review checklist

*Adapted from davidondrej/skills — effective-agent-skills (MIT); see
repo-root NOTICES.md.*

## Capability

- One recognizable job, with useful inputs, output, and a completion check.
- A non-obvious decision rule, example, domain constraint, or reusable tool
  explains why loading the skill could improve the result.
- The description routes realistic requests and distinguishes actual near
  neighbors. Test exclusions; their wording can also attract adjacent tasks.
- Quoted or block-scalar YAML keeps colon-space from changing the field type.

## Loaded context

- The body is as short as the task permits. Aim for 250–600 words, preserving
  essential constraints and respecting the repository's hard token ceiling.
- References are conditional and linked directly from the body with a reason
  to open them. Avoid moving bloat into a reference required on every run.
- Instructions describe useful decisions, not ceremony or fixed report sizes.
- Worked examples clarify a hard distinction; they are not universal rules.
- Deterministic repeated work uses a tested helper when the benefit warrants it.

## Portability and behavior

- Resources resolve relative to the installed skill, not the target repo.
- Tool and runtime requirements are explicit. Optional companions have a
  useful inline fallback; unavailable capabilities are reported honestly.
- User intent, scope, and existing authorization survive the workflow.
- Routine progress does not depend on repeated confirmation of known choices.
- Instructions request evidence and useful outputs, not private reasoning.
- References do not reintroduce rules the body removed.

## Evidence

- Routing cases include realistic positives and adjacent negatives.
- Fresh validation tasks remain separate from prompts used to refine the text.
- Outcome tests compare no skill, prior instructions, and the revision under
  equivalent model, tool, and workspace conditions.
- Mechanical assertions check artifacts; qualitative grades cite evidence.
- Record task success, mistakes, unnecessary interruptions, time, and tokens.
- Reports identify model and harness versions, suite and instruction hashes,
  sample counts, and limits. Missing usage is unknown rather than zero.
- Experimental is the default for a revised body until meaningful outcome
  evidence supports a stronger maturity claim. Neither brevity nor a passing
  schema establishes cross-model effectiveness.
