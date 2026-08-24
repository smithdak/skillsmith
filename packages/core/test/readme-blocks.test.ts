import { describe, expect, test, beforeAll } from "bun:test";
import {
  renderReadmeBlock,
  spliceReadmeBlock,
  BLOCK_START,
  BLOCK_END,
} from "../src/readme-blocks.ts";
import { buildPlan, validateSkillsmithConfig, type SkillsmithConfig } from "../src/index.ts";

const DATA = {
  plugins: [
    {
      name: "zeta-tools",
      version: "0.3.0",
      description: "Has | pipes | in description",
      skills: ["beta-skill", "alpha-skill"],
      agents: ["checker"],
    },
    {
      name: "alpha-tools",
      version: "0.1.2",
      skills: ["solo-skill"],
      agents: [],
    },
  ],
  skillCount: 3,
  agentCount: 1,
  catalogPath: "catalog/CATALOG.md",
};

describe("renderReadmeBlock", () => {
  const block = renderReadmeBlock(DATA);

  test("states counts and links the catalog", () => {
    expect(block).toContain("2 installable plugins");
    expect(block).toContain("3 skills, 1 agent.");
    expect(block).toContain("(catalog/CATALOG.md)");
  });

  test("renders every plugin with version and codepoint-sorted skills", () => {
    expect(block).toContain("| **alpha-tools** | `0.1.2` | `solo-skill` |");
    expect(block).toContain("`alpha-skill` · `beta-skill`");
  });

  test("preserves skillsmith.toml plugin order", () => {
    const rows = block.split("\n").filter((l) => l.startsWith("| **"));
    expect(rows.map((r) => r.replace(/^\| \*\*/, "").replace(/\*\*.*$/, ""))).toEqual([
      "zeta-tools",
      "alpha-tools",
    ]);
  });

  test("lists agents after the plugin name and escapes pipes in cells", () => {
    expect(block).toContain("+ `checker` agent");
    expect(block).toContain("Has \\| pipes \\| in description");
    expect(block).not.toMatch(/\| Has \| pipes/);
  });
});

describe("spliceReadmeBlock", () => {
  const inner = renderReadmeBlock(DATA);
  const wrap = (mid: string) => `# Hi\n${BLOCK_START}\n${mid}${BLOCK_END}\nbye\n`;

  test("replaces the owned region and preserves surrounding prose", () => {
    const { content, found } = spliceReadmeBlock(wrap("stale table\n"), inner);
    expect(found).toBe(true);
    expect(content).toContain("# Hi\n");
    expect(content).toContain("\nbye\n");
    expect(content).not.toContain("stale table");
    expect(content).toContain("3 skills");
  });

  test("is idempotent — same bytes on re-splice", () => {
    const once = spliceReadmeBlock(wrap("old\n"), inner).content;
    const twice = spliceReadmeBlock(once, inner).content;
    expect(twice).toBe(once);
  });

  test("README without markers is left unowned", () => {
    const readme = "# No markers here\n";
    const { content, found } = spliceReadmeBlock(readme, inner);
    expect(found).toBe(false);
    expect(content).toBe(readme);
  });

  test("malformed markers (end before start) are left unowned", () => {
    const readme = `${BLOCK_END}\n${BLOCK_START}\n`;
    const { found } = spliceReadmeBlock(readme, inner);
    expect(found).toBe(false);
  });
});

describe("buildPlan README integration", () => {
  let config: SkillsmithConfig;
  beforeAll(() => {
    const r = validateSkillsmithConfig(
      {
        marketplace: { name: "test-marketplace", owner: { name: "Dakota" } },
        categories: { allowed: ["engineering"] },
        plugin: [
          {
            name: "review-tools",
            version: "0.2.0",
            description: "Code review workflow",
            skills: ["code-review"],
          },
        ],
      },
      { path: "skillsmith.toml" },
    );
    config = r.value!;
  });

  const skillMd = (root: string) => {
    const { mkdirSync, writeFileSync } = require("node:fs") as typeof import("node:fs");
    const { join } = require("node:path") as typeof import("node:path");
    const dir = join(root, "skills", "engineering", "code-review");
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, "SKILL.md"),
      '---\nname: code-review\ndescription: >-\n  Reviews code. Use when the user says "review my code".\n---\nReview it.\n',
    );
  };

  test("plan owns README.md only when markers are present", async () => {
    const { mkdtempSync, mkdirSync } = await import("node:fs");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    const root = mkdtempSync(join(tmpdir(), "skillsmith-readme-"));
    mkdirSync(join(root, "skills", "engineering"), { recursive: true });
    skillMd(root);

    const { discover } = await import("../src/index.ts");
    const discovery = await discover(root, { allowedCategories: ["engineering"] });

    const noMarkers = "# Readme\nno block\n";
    const planWithout = buildPlan(discovery, config, { readme: noMarkers });
    expect(planWithout.files.has("README.md")).toBe(false);

    const withMarkers = `# Readme\n${BLOCK_START}\n${BLOCK_END}\n`;
    const planWith = buildPlan(discovery, config, { readme: withMarkers });
    expect(planWith.files.has("README.md")).toBe(true);
    const out = planWith.files.get("README.md")!;
    expect(out).toContain("**review-tools**");
    expect(out).toContain("`code-review`");
    expect(out).toContain("`0.2.0`");
  });
});
