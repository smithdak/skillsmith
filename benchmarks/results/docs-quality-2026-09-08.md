# Documentation skills pilot — 2026-09-08

The README and diagram tasks passed every factual criterion with no skill, the
preceding skill revision, and the revised references. **This trial found no measured
uplift.** Rendered inspection exposed readability limits that the text grader missed.

## Method and artifacts

The [suite](../docs-quality.json) contains two development cases: a README for an
unpublished local CLI, and an asynchronous export explanation with authorization,
queue acceptance, retry and polling constraints. Each has five criteria. A task
passes only when all five pass.

The run used `gpt-6-astra`, medium reasoning, Codex CLI 0.153.4 and ChatGPT
subscription authentication. Two tasks × three arms × one repeat × solve/grade
used twelve sessions. No paid API adapter was used. The same model solved and
graded in separate fresh sessions; the grader did not receive arm labels or skill
instructions. References were loaded eagerly. See the
[text-adapter protocol and limits](../../docs/effectiveness.md).

- [Complete results](docs-quality-2026-09-08.json) retain every answer, criterion
  grade, timing, usage and instruction hash.
- [Exact instruction payloads](docs-quality-instructions-2026-09-08.json) retain
  the previous and revised treatments; all four SHA-256 hashes match the report.

The previous treatment is the intermediate body refinement before this reference
pass, not the original source commit. The tested revision predates one final edit:
the Mermaid reference gained a narrow-layout table alternative after rendering
exposed small sequence labels. That addition was not rerun through the model.

## Results

| Arm | Tasks passed | Criteria passed |
|---|---:|---:|
| No skill | 2/2 | 10/10 |
| Previous skill | 2/2 | 10/10 |
| Revised references | 2/2 | 10/10 |

Mean solver output tokens were 479, 474 and 449 respectively. Mean input tokens
rose from 9,152 without a skill to 11,391 with the previous skill and 12,949 with
the revised references. The richer references cost more when loaded eagerly;
this harness does not measure selective reference loading. Mean solver duration
was 19.5, 18.0 and 18.0 seconds; one repeat cannot establish a latency difference.

All arms supplied usable README setup instructions and preserved the export
constraints. The revised visual answer added accessible diagram metadata and
used a shorter two-column status table. Those observations are not an independent
quality score.

## Rendered inspection

Local previews used Marked 17.0.3, Mermaid 11.17.2 and Chromium at viewport widths
of 1040 and 390 pixels, in light and dark themes. This was a local Markdown preview,
not verification on GitHub's renderer.

The revised export answer parsed and stayed within the page width, but its
sequence scaled from roughly 741 pixels to 350 pixels, leaving small labels at
phone width. The README kept its hierarchy and separated commands from output;
long shell commands required horizontal scrolling. The four-participant cache
example in the reference had the same small-label problem, prompting the compact
table alternative. Parsing and avoiding overflow did not establish legibility.

The repository's documentation was also revised using these skills: a complete
Codex first-use path, a compact plugin chooser, task-based navigation, and a smaller
architecture diagram. Those edits are applied examples, not additional controlled
benchmark trials.

## What remains unmeasured

These cases were visible during refinement, use one strong solver and a same-model
grader, and have only one repeat. The rubric mainly detects factual omissions and
invented behavior. It does not adequately distinguish editorial quality or visual
readability. There was no tool use, automatic invocation, installed-plugin task or
weaker-model comparison. Both skills remain experimental; the next useful evidence
is difficult held-out documentation work with independent rendered review.
