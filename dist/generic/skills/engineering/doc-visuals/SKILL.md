---
name: doc-visuals
description: >-
  Crafts the visual layer of technical documents — repository maps,
  mermaid diagrams, code blocks, and tables — so structure lands at a
  glance and every element survives its renderer. Use this skill when
  producing or revising a document that contains a directory tree, an
  architecture or flow diagram, command examples, or comparison tables,
  or when the user says "add a diagram", "the repo map is hard to read",
  "make this README scannable", or "clean up the formatting in this
  doc". Not for prose editing, verifying a document is self-contained,
  or reviewing technical correctness.
license: MIT
metadata:
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# doc-visuals

A reader trusts a directory tree or a diagram *more* than the prose
around it — visual elements read as measured fact, so a noisy or stale
one damages a document more than its absence would. Two disciplines
govern every element:

1. **One element, one question.** Every map, diagram, block, or table
   exists to answer a specific question the reader arrives with. Name
   that question before building the element; if two questions emerge,
   build two elements; if none, cut it. Introduce each element with the
   sentence that states what it answers — the element must survive being
   read without the surrounding prose.
2. **Derive from ground truth, then verify against it.** Trees come from
   the bundled script, diagrams from the code's actual flow, command
   examples from commands actually run. Visual elements drift silently —
   unlike prose, nobody greps them.

## Repository maps

Run `scripts/repo-map.sh <root> [depth]` and build the map only from its
output — a tree typed from memory invents files and misses renames. Then
apply the formatting rules in
[references/repo-maps.md](references/repo-maps.md): one entry per line,
one aligned annotation column, elisions carry counts, generated
territory explicitly marked, roughly twenty lines total.

## Diagrams

Pick the type by the reader's question: how input becomes output —
flowchart; who calls whom in what order — sequence; what states one
thing moves through — state. A diagram is prose-sized at about twelve
nodes; past that, split it by question rather than shrinking the font.
Label edges with the artifact that flows, not connective verbs. Syntax
constraints and renderer pitfalls (GitHub's mermaid is strict and
theme-hostile): [references/mermaid.md](references/mermaid.md).

## Code blocks and tables

Every fenced block carries a language tag; commands and their output
never share a block; a snippet shows the minimum that runs, with no
elision inside anything the reader will copy. Tables hold short
enumerable facts — a cell that needs a full sentence marks a row that
wants to be prose. Full rules with before/after pairs:
[references/code-and-tables.md](references/code-and-tables.md).

## Verify before returning

- Every path in a repo map appears in the script output — nothing
  invented, nothing stale.
- Every mermaid block passes the pitfall checklist in
  references/mermaid.md (reserved words, quoting, label budget).
- Every code block is language-tagged and every command in one pastes
  and runs as written.
- Every table scans in a single pass: no wrapped cells, no
  multi-sentence cells.
- Each element still answers its named question with the surrounding
  prose covered up.
