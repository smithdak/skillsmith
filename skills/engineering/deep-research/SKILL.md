---
name: deep-research
description: >-
  Orchestrates a heavyweight fan-out research harness: decomposes a
  broad question into independent angles, runs parallel investigators
  across distinct source modalities, adversarially verifies every
  load-bearing claim, and synthesizes one cited, dated report. Use
  this skill when the user says "do deep research on X", "research
  this thoroughly", "fan out and research", "give me a comprehensive
  fact-checked report", or asks a broad or contested question that no
  single search thread can cover. Not for a single volatile fact, a
  bounded question one investigator covers end to end, or
  summarizing material the user supplies.
license: MIT
metadata:
  skillsmith-composes: "ground-truth-research"
  skillsmith-see-also: "research-note"
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# deep-research

A single investigator answers a question with whichever sources it
found first; a harness answers it with sources that were forced to
disagree. The cost is real — many parallel subagents — so the skill
applies when breadth, contest, or stakes justify it. A bounded
question one investigator can cover end to end is research-note's
job; a single volatile fact is an inline ground-truth-research check.

## Decompose before searching

Break the question into sub-questions and pick the angles that will
answer them. Angles must be independent to be worth running in
parallel: different source modalities (official docs and specs,
source code, issue trackers and community threads, first-party
announcements and news, academic work), different stakeholders,
different time slices. Write the decomposition down before spawning
anything — it is the coverage contract. An angle dropped for cost or
time is reported as dropped, never silently absorbed.

## Fan out blind

One subagent per angle, run in parallel, each blind to the others'
findings. Convergence between independent investigators is evidence;
convergence between investigators reading each other is an echo.
Each investigator returns claims, not prose: for every claim, the
source that owns it (link) and the date accessed. The
ground-truth-research discipline applies in full inside every
investigator — volatile facts verified live, every time-sensitive
claim carrying its as-of basis.

## Verify adversarially

Pool the claims and dedupe them. Every load-bearing claim then gets
an independent verifier whose brief is refutation: find the primary
source and try to break the claim against it. A claim survives on
sources, not on plausibility. Claims that fail are dropped or
reported as contested with both sides cited; a claim no verifier
could check against a primary source is reported as unverified,
never quietly kept.

## Ask what is missing

Before synthesis, run a completeness pass over the coverage
contract: which angle never ran, which claim is still unverified,
which cited source was never actually read. What it finds becomes
the next round of fan-out; the loop ends when a round comes back
dry, not when a round count runs out.

## Synthesize one report

One report, answer first — a reader who stops after the opening
section leaves correct. Then findings with a citation per claim,
each claim labeled honestly: confirmed, single-source, contested, or
unverified. Contradictions between sources are surfaced as
contradictions, never averaged into a middle claim nobody made.
Close with what was not established and the dated source list. The
report itself carries its date — research is a snapshot. When the
user wants the result to outlive the conversation, land it as a
durable note the way research-note does and report the path.
