---
name: readme-authoring
description: >-
  Writes or rewrites the README that fronts a repository: derives every claim
  from the actual project rather than the previous README, orders sections so
  a newcomer can evaluate and install before contributor tooling appears, and
  leaves LICENSE, CONTRIBUTING, and CHANGELOG content in their own files. Use
  this skill when the user says "write a README", "our README is out of
  date", "improve the README", "the front page doesn't explain what this
  does", or a repo's landing document no longer matches what it ships. Not
  for the visual elements inside a document, reorganizing a multi-file docs
  tree, or writing API reference.
license: MIT
metadata:
  skillsmith-composes: "doc-visuals"
  skillsmith-see-also: "information-architecture"
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# readme-authoring

*Adapted from github/awesome-copilot — create-readme (MIT); see repo-root
NOTICES.md.*

The README is the most-read and least-maintained file in a repository. It is
written once when the project is small and then quietly falsified by every
subsequent commit — the counts drift, the plugin list goes stale, the install
command changes. A confidently wrong front page costs more trust than a
sparse one, because a reader who catches one false claim stops believing the
rest.

## Derive every claim from the repository

Treat the existing README as a hypothesis about a past version of the
project, never as a source. Before writing, read the ground truth for each
claim it makes or should make:

- **Counts and inventories** — how many modules, packages, plugins, or
  commands actually exist. Count them from the filesystem or the manifest.
- **Names and lists** — the real module, command, and option names, read from
  the config or the CLI, not recalled from the prose.
- **Commands** — run them as written. A documented command that fails is the
  fastest way to lose a new user.
- **Links** — confirm each target file exists at the path given.

The most common README defect is not bad writing; it is a page describing a
smaller, older version of the project with total confidence.

## Order for the newcomer

A reader arrives with three questions in a fixed order: *what is this*, *should
I care*, *how do I use it*. Answer them in that order, then serve contributors:

1. **Header** — name, badges that reflect real signals (build status, version,
   size of the thing), a one-line statement of what it is, and a short link
   row to the major sections.
2. **What and why** — what the project is and the problem that justifies it.
3. **Features** — a scannable list of what it actually does, written as
   capabilities rather than adjectives.
4. **Quick start** — the shortest path to a working result. Install and first
   use come before architecture.
5. **How it works** — the model a user needs to hold, including the
   invariants they can break.
6. **Contributor material** — development setup, commands, and authoring
   guides, after the consumer sections.
7. **Documentation index** — a table pointing at the deeper docs.

Depth belongs in linked documents. The README's job is to get someone to the
right page, not to be every page.

## Keep dedicated files dedicated

License, contribution process, changelog, security policy, and code of
conduct each belong in their own file. The README links to them — a badge or
a line in a docs table is enough. Inlining that content buries the material
the reader actually came for, and it duplicates a file that will be updated
independently and then disagree.

## Formatting

Use GitHub Flavored Markdown. Reach for GitHub admonitions
(`> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]`, `> [!CAUTION]`)
for the few statements that genuinely need to interrupt reading — an
invariant a user can violate, a cost, a prerequisite. Their power comes from
scarcity; a page of admonitions has none.

Keep emoji sparse or absent; they read as decoration and date quickly. Use a
logo in the header only if the project actually has one — do not invent or
source one. Tables suit short enumerable facts, with the explanation in
surrounding prose rather than crammed into cells. Repository maps, diagrams,
and code blocks follow the doc-visuals discipline so each survives its
renderer.

## Verify before returning

Check the finished page against the repository, not against the draft: every
count and list matches what is actually there, every documented command runs
as written, every link resolves to an existing path, and no section
duplicates a dedicated file. Confirm the reader can answer "what is this and
how do I start" from the top of the page alone. A README that reads well but
misstates the project's size or install path has failed at its only job.
