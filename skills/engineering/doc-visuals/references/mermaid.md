# Mermaid diagrams — choosing, sizing, surviving renderers

## Choose the type by the reader's question

| Reader's question                      | Type              |
|----------------------------------------|-------------------|
| How does input become output?          | `flowchart LR`    |
| Who calls whom, in what order?         | `sequenceDiagram` |
| What states does one thing move through? | `stateDiagram-v2` |
| How do these entities relate?          | `erDiagram`       |

No type fits — the question is probably better served by a table or a
list. A diagram forced onto the wrong question reads as decoration.

## Sizing and labeling

- **About twelve nodes.** Past that, split by question into two diagrams
  rather than shrinking node text.
- **Node text: four words or fewer.** Longer descriptions go in the
  intro sentence or a `<br/>`-split second line — never a paragraph in
  a box.
- **Edge labels name the artifact that flows** (`GeneratePlan`,
  `findings[]`), not connective verbs (`then`, `calls`). An unlabeled
  edge is fine when the flow is obvious; a verb label never is.
- **Direction:** `LR` for pipelines and dataflow, `TD` for hierarchies
  and decision trees.
- **Subgraphs** only when the grouping itself is the point (e.g.
  hand-edited vs generated) — not as visual decoration.

## Renderer pitfalls (GitHub-flavored mermaid)

- The fence must be exactly ` ```mermaid ` — anything else renders as a
  code block.
- Lowercase `end` as a node ID or bare word breaks flowcharts — write
  `End`, or quote the label.
- Node labels containing `(`, `)`, `[`, `]`, `{`, `}`, `#`, or quotes
  must be double-quoted: `V["validate (V rules)"]`.
- Line breaks inside a node are `<br/>`, not `\n`.
- Skip `style`/`classDef` color theming: GitHub renders light and dark
  themes with its own palette, and hardcoded colors turn illegible in
  one of them.
- Comments are `%%` — `//` inside a diagram is a parse error.

## Verify

Parse the block mentally against the pitfall list above (or paste into
mermaid.live when available): every node reachable from an entry point,
every label inside its word budget, an intro sentence directly above the
fence stating what the diagram answers.
