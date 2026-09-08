---
name: "readme-authoring"
description: "Writes or rewrites the README fronting a repository, derived from the actual project and ordered so a newcomer can evaluate and install first. Use when the user says \"write a README\", \"our README is out of date\", or the landing page no longer matches what ships. Not for diagrams and trees (doc-visuals), a multi-file docs tree (information-architecture), or agent-facing docs (writing-for-agents)."
license: "MIT"
metadata:
  skillsmith-composes: "doc-visuals"
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
  skillsmith-see-also: "information-architecture"
---

# readme-authoring

*Adapted from github/awesome-copilot — create-readme (MIT); see repo-root
NOTICES.md.*

Write the repository's front door: a specific reason to care, credible evidence
of what ships, and a short path to a useful result. Preserve the project's
voice and identity. A good README feels written for this project and reader.

## Recover the product and audience

Inspect manifests, public interfaces, examples, installation and release
configuration, and relevant existing docs. Identify the primary reader and
first useful task. Separate consumer setup from contributor setup. Treat the
old README as claims to verify, including package availability, credentials,
runtime requirements, counts, links, and performance claims.

Use [references/readme-structure.md](references/readme-structure.md) to choose
the reading order for this kind of repository. Select the relevant sections;
do not copy a universal heading skeleton. Keep generated regions intact and
change their source when their content needs updating.

## Make the opening earn attention

Name the concrete job and audience. Show one small, authentic proof: a command
and result, a usable API example, or an existing screenshot of the main task.
Explain the meaningful distinction or constraint. Give the reader an obvious
next step. Use [references/readme-examples.md](references/readme-examples.md)
when the opening is generic, the quick start stalls at installation, or the
page reads like a brochure.

Order installation and first use so the primary reader can succeed from the
stated starting point. Include essential prerequisites and real sample input;
show the observable result. Put a setup-changing limitation next to that path.
Move exhaustive options, internals, and contributor machinery into linked docs
when they obscure first use. Link owner files for licensing, contributions,
security, and changes; do not create empty sections for absent files.

## Give the page a clear reading rhythm

Use informative headings, short connected paragraphs, and selected examples.
Apply doc-visuals when available; its essentials are inline: each visual earns
its place, diagrams preserve actual behavior, paths are real, tables support a
comparison, and copied commands exclude terminal prompts and captured output.
Use the existing brand assets and useful badges only when available. Avoid
invented banners, decorative diagrams, and repeated claims dressed as features.

## Verify the reader's path

Try the quick start in a clean temporary location when safe. Otherwise check
syntax and prerequisites against source and state what could not be executed.
Do not perform paid, destructive, or external mutations just to document them.
Inspect rendered Markdown when possible, including narrow layouts, local links,
anchors and images. Separate actual rendering from source-only review.

Skim only the opening, headings, examples and links: can the intended reader
explain what this does, whether it fits, and how to start? Remove repeated or
low-value material before adding more sections. Return the finished document;
put change summaries and verification limits in the completion message, outside its prose.
