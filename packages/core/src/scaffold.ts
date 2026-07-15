/**
 * Init + scaffold — repo bootstrap and component stubs (spec §3).
 *
 * Pure content builders return path→content maps; `applyScaffold` writes them
 * with a strict no-clobber rule: existing files are never overwritten — init
 * into a non-empty directory only fills gaps, and scaffolding an existing
 * component is an error.
 *
 * Design decision: `scaffold skill` targets skills/drafts/ BY DEFAULT.
 * Placeholder evals would trivially satisfy V8 and hollow out the gate;
 * drafts are exempt from V8, so a new skill starts lenient and promotion to
 * a real category is the moment the gates start binding. `--category` opts
 * into immediate rigor.
 */
import { join } from "node:path";
import { generateJsonSchemas } from "./schemas/json-schemas.ts";
import { canonicalJson } from "./generate.ts";

export type FileSet = Map<string, string>;

export interface InitOptions {
  marketplaceName: string;
  ownerName: string;
  categories: string[];
}

export function buildInitFiles(opts: InitOptions): FileSet {
  const files: FileSet = new Map();

  files.set(
    "skillsmith.toml",
    `[marketplace]
name = "${opts.marketplaceName}"
owner = { name = "${opts.ownerName}" }

[categories]
allowed = [${opts.categories.map((c) => `"${c}"`).join(", ")}]

# Groupings assemble skills/agents/hooks/mcp into installable plugins.
# A skill belongs to exactly one plugin.
[[plugin]]
name = "starter"
version = "0.1.0"
description = "First plugin — rename me"
skills = []

[policy]
"max-skill-body-tokens" = 5000
"max-listing-chars" = 1536
"min-trigger-hit-rate" = 0.85
"security-tier" = "strict"
"network-allowlist" = []
`,
  );

  for (const category of [...opts.categories, "drafts"]) {
    files.set(`skills/${category}/.gitkeep`, "");
  }
  for (const dir of ["agents", "commands", "hooks", "mcp"]) {
    files.set(`${dir}/.gitkeep`, "");
  }

  files.set(
    ".github/workflows/validate.yml",
    `name: validate
on:
  pull_request:
  push:
    branches: [main]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: 1.3.14 # pin — compile output and natives can shift between Bun versions
      # Once skillsmith is published, replace the local path with: bunx skillsmith@<pinned>
      - run: bunx skillsmith validate --strict
      - run: bunx skillsmith check
`,
  );

  files.set(
    "SECURITY.md",
    `# Security

Skills execute code in consumers' environments. This repo's guarantees:

- Every shipped script appears in the generated catalog's script inventory
  (path, interpreter, network flag, SHA-256) — see catalog/CATALOG.md.
- Network-touching scripts must be explicitly allowlisted in skillsmith.toml
  ([policy]."network-allowlist"); CI fails otherwise (rule S2).
- External marketplace sources must be sha-pinned (rule S5).
- Secrets patterns fail CI (rule S4).

What this does NOT guarantee: behavioral review of script logic. Read the
inventory before installing. Report issues via the repository issue tracker.
`,
  );

  files.set(
    "CONTRIBUTING.md",
    `# Contributing

## Authoring flow
1. \`skillsmith scaffold skill <name>\` — starts in skills/drafts/ (lenient).
2. Write the skill: goal + boundaries + verification, not micro-checklists.
   Body ≤500 lines. Deterministic work goes in scripts/, on-demand docs in
   references/ (one level deep).
3. Fill evals/evals.json with ≥3 should-trigger and ≥3 should-not-trigger
   cases (real phrasings, not paraphrases of the description).
4. Promote: move the folder to its domain category, assign it to a plugin in
   skillsmith.toml.
5. \`skillsmith validate --strict && skillsmith generate && skillsmith check\`
   must pass before a PR.

## Rules that will bite you
- The description is the trigger surface: what it does AND when, with quoted
  user phrasings ("use when the user says ...").
- Never instruct the model to show/explain its reasoning (V13).
- Generated files (plugins/, catalog/, .claude-plugin/) are never hand-edited.
`,
  );

  files.set(
    "README.md",
    `# ${opts.marketplaceName}

Claude Code skills monorepo, managed by skillsmith.

- Browse: [catalog/CATALOG.md](catalog/CATALOG.md) (generated)
- Install: \`/plugin marketplace add <this-repo>\`
- Contribute: [CONTRIBUTING.md](CONTRIBUTING.md)
`,
  );

  // Editor schema associations, generated from the Zod layer.
  const schemas = generateJsonSchemas();
  for (const [name, schema] of Object.entries(schemas)) {
    files.set(`.skillsmith/schemas/${name}`, canonicalJson(schema));
  }
  files.set(
    ".vscode/settings.json",
    canonicalJson({
      "json.schemas": [
        { fileMatch: ["plugins/*/.claude-plugin/plugin.json"], url: "./.skillsmith/schemas/plugin.schema.json" },
        { fileMatch: [".claude-plugin/marketplace.json"], url: "./.skillsmith/schemas/marketplace.schema.json" },
        { fileMatch: ["skills/*/*/evals/evals.json"], url: "./.skillsmith/schemas/evals.schema.json" },
        { fileMatch: ["hooks/*/hooks.json"], url: "./.skillsmith/schemas/hooks.schema.json" },
      ],
    }),
  );

  files.set(
    ".gitignore",
    `node_modules/
*.log
`,
  );

  return files;
}

// ---------------------------------------------------------------------------

export type ScaffoldKind = "skill" | "agent" | "hook" | "mcp";

export function buildSkillScaffold(name: string, category: string): FileSet {
  const root = `skills/${category}/${name}`;
  const files: FileSet = new Map();
  files.set(
    `${root}/SKILL.md`,
    `---
name: ${name}
description: >-
  TODO one-line summary of what this does. Use this skill when the user says
  "${name.replace(/-/g, " ")}" or asks to TODO-trigger-phrase.
metadata:
  skillsmith-invocation: "model"
  skillsmith-maturity: "experimental"
---

# ${name}

State the goal, the boundaries, and how the model verifies its own output.
Prefer one sentence of intent over enumerated edge cases.

Deterministic steps belong in scripts/ (run, not read). On-demand detail
belongs in references/ (one level deep).
`,
  );
  files.set(
    `${root}/evals/evals.json`,
    canonicalJson({
      should_trigger: [
        { prompt: `TODO real user phrasing that must load ${name}` },
        { prompt: "TODO second distinct phrasing" },
        { prompt: "TODO third distinct phrasing" },
      ],
      should_not_trigger: [
        { prompt: "TODO adjacent request that must NOT load it" },
        { prompt: "TODO second near-miss" },
        { prompt: "TODO third near-miss" },
      ],
    }),
  );
  files.set(`${root}/scripts/.gitkeep`, "");
  files.set(`${root}/references/.gitkeep`, "");
  return files;
}

export function buildAgentScaffold(name: string): FileSet {
  return new Map([
    [
      `agents/${name}.md`,
      `---
name: ${name}
description: >-
  TODO trigger conditions for auto-delegation. Use proactively when TODO.
  <example>Context: TODO situation.
  user: "TODO request"
  assistant: "I'll use the ${name} agent."
  <commentary>TODO why this matches.</commentary></example>
model: inherit
color: blue
---

# ${name}

Identity, responsibilities, process, output format.
`,
    ],
  ]);
}

export function buildHookScaffold(name: string): FileSet {
  return new Map([
    [
      `hooks/${name}/hooks.json`,
      canonicalJson({
        PreToolUse: [
          {
            matcher: "Bash",
            hooks: [
              {
                type: "command",
                command: "TODO your-command-here",
                // S3: the comment field is the declared intent — required.
                comment: "TODO — intent: describe what this gate enforces",
              },
            ],
          },
        ],
      }),
    ],
  ]);
}

export function buildMcpScaffold(name: string): FileSet {
  return new Map([
    [
      `mcp/${name}.mcp.json`,
      canonicalJson({
        mcpServers: {
          [name]: {
            command: "node",
            args: ["${CLAUDE_PLUGIN_ROOT}/scripts/server.mjs"],
          },
        },
      }),
    ],
  ]);
}

/** Append a [[plugin]] grouping to skillsmith.toml (string-level, comment-preserving). */
export function appendPluginGrouping(
  tomlSource: string,
  name: string,
  description?: string,
): string {
  const block = `
[[plugin]]
name = "${name}"
version = "0.1.0"
${description ? `description = "${description}"\n` : ""}skills = []
`;
  // Insert before [policy] if present, else append.
  const policyIdx = tomlSource.indexOf("[policy]");
  if (policyIdx >= 0) {
    return tomlSource.slice(0, policyIdx) + block.trimStart() + "\n" + tomlSource.slice(policyIdx);
  }
  return tomlSource.trimEnd() + "\n" + block;
}

// ---------------------------------------------------------------------------

export interface ApplyResult {
  written: string[];
  skipped: string[];
}

/** Write a FileSet with the no-clobber rule. */
export async function applyScaffold(
  files: FileSet,
  repoRoot: string,
  opts: { errorOnExisting: boolean },
): Promise<ApplyResult> {
  const written: string[] = [];
  const skipped: string[] = [];
  for (const [path, content] of files) {
    const abs = join(repoRoot, path);
    if (await Bun.file(abs).exists()) {
      if (opts.errorOnExisting) {
        throw new Error(`refusing to overwrite existing file: ${path}`);
      }
      skipped.push(path);
      continue;
    }
    await Bun.write(abs, content);
    written.push(path);
  }
  return { written, skipped };
}
