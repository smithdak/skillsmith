# Contributing

## Authoring flow
1. `skillsmith scaffold skill <name>` — starts in skills/drafts/ (lenient).
2. Write the skill: goal + boundaries + verification, not micro-checklists.
   Body ≤500 lines. Deterministic work goes in scripts/, on-demand docs in
   references/ (one level deep).
3. Fill evals/evals.json with ≥3 should-trigger and ≥3 should-not-trigger
   cases (real phrasings, not paraphrases of the description).
4. Promote: move the folder to its domain category, assign it to a plugin in
   skillsmith.toml.
5. `skillsmith validate --strict && skillsmith generate && skillsmith check`
   must pass before a PR.

## Rules that will bite you
- The description is the trigger surface: what it does AND when, with quoted
  user phrasings ("use when the user says ...").
- Never instruct the model to show/explain its reasoning (V13).
- Generated files (plugins/, catalog/, .claude-plugin/) are never hand-edited.
