# Contributing

Change authored sources, regenerate their distributions, and verify the result.
Start with Git, [Bun](https://bun.sh) 1.3.14 or newer, and a checkout of this repo.

## Set up and check the checkout

```sh
bun install --frozen-lockfile
bun test
bun run --cwd packages/core typecheck
bun run --cwd packages/cli typecheck
```

TypeScript runs directly; no build step is required. CLI commands below run from
the repository root. The package is not published to a registry.

## Write a new skill

Create a draft, replacing `my-skill` with its kebab-case name:

```sh
bun packages/cli/src/main.ts scaffold skill my-skill
```

The draft lives in `skills/drafts/my-skill/` and is excluded from distributions.
Write one useful procedure with a clear boundary and completion check. Target
250–600 body words; this catalog caps bodies at 1,200 estimated tokens and 500 lines.
Put conditional guidance in `references/` and reusable deterministic work in
`scripts/`. Link references where the agent needs them.

Add at least three positive and three negative routing cases to `evals/evals.json`.
Use real requests and near misses. For material behavior changes, add outcome cases
or repository fixtures that can expose a failure. Keep the skill experimental until
the evidence supports promotion; see the [refinement standard](docs/refinement.md).

To ship the draft, move it into an allowed category and assign it to one plugin in
`skillsmith.toml`. Follow the [authoring guide](docs/skill-authoring.md) for schema,
composition and resource details.

## Change a shipped skill

Preserve a previous source snapshot before editing if you will compare outcomes.
The [effectiveness guide](docs/effectiveness.md#compare-a-revision) gives the command.

- Bump the owning plugin's version in `skillsmith.toml` when shipped content changes.
  The guard covers both Claude Code and Codex bundles.
- Add a `## <plugin> <version>` entry to `CHANGELOG.md` explaining the user-visible
  change. Validation enforces the entry.
- A description edit invalidates its routing measurement. Re-evaluate the affected
  boundary and inspect both positive requests and near misses. Use the
  [routing guide](docs/evals.md) for repeats, provenance and result merging.

Evaluations default to Astra through a Codex ChatGPT subscription. They consume
subscription allowance; the offline tests above do not call a model.

## Regenerate and verify

Edit `skills/`, host component sources and `skillsmith.toml`. The
[generated roots](docs/architecture.md#generated-ownership) and managed README block
belong to the compiler. Change their source or generator, then run:

```sh
bun packages/cli/src/main.ts validate --strict
bun packages/cli/src/main.ts generate
bun packages/cli/src/main.ts check
bun packages/cli/src/main.ts version-guard --base origin/main
```

Use a fetched `origin/main` that predates your change, or supply the explicit base
commit. Comparing a committed revision with itself cannot check its version bump.
Commit the authored and regenerated files together. For compiler changes, also run
the tests and both typechecks shown above. For documentation changes, check commands,
local links and rendered layout.

Open the [validation rules](docs/validation-rules.md) when a finding needs a fix.
Descriptions define when a skill triggers; avoid update suppressors, blanket
formatting bans and instructions to reveal private reasoning. Prefer specific
decision rules, examples and observable verification.
