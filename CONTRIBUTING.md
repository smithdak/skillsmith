# Contributing

This is the short form. The full guides live in [docs/](docs/README.md):
[skill authoring](docs/skill-authoring.md) (frontmatter reference, description
craft, composition), [validation rules](docs/validation-rules.md) (every V/S
failure with its fix), [evals](docs/evals.md), and
[configuration](docs/configuration.md).

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

## Changing a shipped skill
A skill already assigned to a plugin ships to installs. Two obligations come
with that, both enforced:
- Bump the plugin's `version` in skillsmith.toml — Claude Code refreshes by
  version, never by content, so without a bump nobody receives the change
  (`version-guard`, run in CI against `origin/main`). Locally, compare against
  the branch point: `--base $(git merge-base main HEAD)`. `--base HEAD` always
  reports clean and tells you nothing.
- Add a `## <plugin> <version>` entry to CHANGELOG.md saying what changed
  (V16). A bump without an entry ships a number nobody can read.
- Editing a description invalidates its measured hit rate. `validate` warns
  that the committed result measured text that no longer exists; re-run
  `skillsmith eval` (needs an API key — see .env.example).
- Judging one case once tells you almost nothing: measured variance on a real
  boundary case was 17/28. Before treating a hit-rate change as real, re-measure
  that skill with `skillsmith eval <skill> --repeat 9`.

## Rules that will bite you
- The description is the trigger surface: what it does AND when, with quoted
  user phrasings ("use when the user says ...").
- Never instruct the model to show/explain its reasoning (V13).
- No update suppressors ("work silently") or blanket anti-formatting rules
  ("never use bullets") — both invert on current models (V15). Quote them if a
  skill needs to teach them.
- Generated files (plugins/, catalog/, .claude-plugin/) are never hand-edited.
