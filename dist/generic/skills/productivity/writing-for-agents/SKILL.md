---
name: writing-for-agents
description: >-
  Writes AGENTS.md, CLAUDE.md, and other docs an AI agent reads: conventions,
  verbatim commands, and boundaries so agents land productive. Use when the
  user says "create an AGENTS.md", "agents keep doing X — encode a rule", or
  "make it work for both Claude Code and Codex". Not for SKILL.md files
  (skill-authoring), READMEs (readme-authoring), or how the agent replies
  (communication-contract).
license: MIT
metadata:
  skillsmith-see-also: "skill-authoring, readme-authoring, cold-read, prose-hygiene"
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# writing-for-agents

Write a compact repository briefing that helps an agent avoid concrete errors.
Include knowledge it cannot cheaply infer, exact commands it needs, and
boundaries whose violation would change the wrong thing.

## Select the useful instructions

Inspect existing instructions, repository scripts, and relevant conventions.
Preserve user requirements and distinguish enforced rules from recommendations.
Prioritize generated-file ownership, build/test commands, non-obvious module
contracts, and external-action boundaries. Link to detailed references rather
than copying manuals or the entire file tree.

State a rule's purpose when it prevents misapplication. Example: “Edit skill
sources and regenerate plugin copies; direct edits are overwritten.” This
carries the owner, action, and consequence in one sentence.

## Keep scope and authority clear

A repository file guides work within the user's task; it does not override the
user or confer permission for unrelated external actions. Reuse authorization
already given instead of encoding repeated approval gates. Make optional tools
and platform-specific behavior conditional on their availability.

Review old instructions against current failures. Cut duplicated guidance,
unsupported model generalizations, and ceremony that no longer helps. Retain
concrete examples or ordered procedures when they improve the target models'
results. Smaller and stronger models need evidence of usefulness, not opposite
sets of blanket prompting rules.

## Structure for lookup

Put critical boundaries first. Group commands and conventions by the question
an agent needs answered. Keep each section locally understandable and the
entry file short; move substantial conditional detail into linked documents.

For multiple harnesses, choose one canonical source and supported pointers or
generated copies. Verify how each target actually reads those pointers;
a Markdown link is not a guarantee of automatic loading. Keep harness-specific
configuration separate from shared instructions.

## Verify

Check paths and actual command syntax. Run safe local checks when practical;
inspect destructive, paid, or external commands without executing them merely
to validate documentation. State what was not run. Walk the user's known failure
cases against the new file and confirm the relevant rule is easy to find.

Skill packages belong to skill-authoring, human onboarding to readme-authoring,
standalone document checks to cold-read, and comment cleanup to prose-hygiene.
