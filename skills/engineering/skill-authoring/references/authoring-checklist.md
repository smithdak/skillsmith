# Skill authoring — anti-patterns and ship checklist

*Adapted from davidondrej/skills — effective-agent-skills (MIT); see
repo-root NOTICES.md.*

## Anti-patterns

- **Workflow-in-description** — the description restates the steps, so the
  model concludes it already has the procedure and never loads the body.
  Descriptions route; bodies instruct.
- **Paraphrase triggers** — the "use when" phrasings are reworded versions
  of the description instead of phrasings a real user would type. Triggering
  degrades because nothing matches how people actually ask.
- **Missing differentiator** — no "Not for …" boundary, so the skill and its
  nearest neighbor both claim the same request and routing becomes a
  coin-flip.
- **Kitchen-sink body** — everything the skill might ever need, inlined,
  paid for on every run. Move sometimes-needed detail to references.
- **Reference chains** — reference A links to reference B. The model cannot
  reach B from the body directly; flatten so every reference is one hop.
- **Deep references** — a `references/a/b.md` two levels down. Keep
  references one level deep.
- **Prose doing a script's job** — a deterministic transform written as
  natural-language steps. It re-derives every run and drifts. Push it into a
  script the skill calls.
- **First/second-person narration** — "I will now…", "you should then…".
  Prefer imperative/infinitive: "Cluster the findings", "Verify the path."
- **Reasoning-extraction instructions** — "show your reasoning", "explain
  your thought process" as an output demand. Specify the output artifact
  instead.
- **Unquoted colon-space in the description** — `foo: bar` inside an
  unquoted YAML scalar can be parsed as a mapping by strict loaders. Quote
  or use a block scalar.
- **Over-constrained judgment / under-constrained mechanics** — freedom must
  match consequence. A design task written as rigid steps is brittle; a
  release gate written as loose principles is unreliable.
- **Evals that echo the description** — cases lifted from the description
  prove nothing. Use independent real phrasings, and include should-not
  cases that are genuinely near the boundary.

## Ship checklist

Before a skill is considered done:

- [ ] Name is kebab-case and equals its directory name.
- [ ] Description carries what, when (quoted real phrasings), and a
      differentiator; it does not summarize the workflow.
- [ ] Description is quoted or block-scalar if it contains a colon.
- [ ] Body is under the line and token ceilings.
- [ ] Body assumes the skill was already selected — no re-triggering preamble.
- [ ] Sometimes-needed detail is in references, one level deep, no chains.
- [ ] Deterministic work is in scripts, not prose.
- [ ] No instruction to reveal internal reasoning.
- [ ] Evals: at least three should-trigger and three should-not-trigger,
      real phrasings, near-boundary negatives, no placeholder text.
- [ ] A verification section states the observable bar for "done".
- [ ] Cross-skill mentions are declared (composition) or acknowledged
      (see-also), not left as loose prose references.
