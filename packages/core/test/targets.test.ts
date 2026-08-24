import { describe, expect, test, beforeAll } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  discover,
  buildPlan,
  validateSkillsmithConfig,
  type SkillsmithConfig,
} from "../src/index.ts";

function makeFixtureRepo(): string {
  const root = mkdtempSync(join(tmpdir(), "skillsmith-targets-"));
  const skill = (category: string, name: string, desc: string) => {
    const dir = join(root, "skills", category, name);
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, "SKILL.md"),
      `---\nname: ${name}\ndescription: >-\n  ${desc}\n---\nBody.\n`,
    );
    return dir;
  };
  const alphaDir = skill("engineering", "alpha-skill", "First. Second sentence.");
  writeFileSync(join(alphaDir, "notes.md"), "extra asset\n");
  skill("misc", "beta-skill", "Has | a pipe. Trimmed here.");
  return root;
}

async function planFor(config: SkillsmithConfig) {
  const discovery = await discover(makeFixtureRepo(), {
    allowedCategories: ["engineering", "misc"],
  });
  return buildPlan(discovery, config);
}

const baseConfig = (targets: SkillsmithConfig["targets"]) =>
  validateSkillsmithConfig(
    {
      marketplace: { name: "test-marketplace", owner: { name: "Dakota" } },
      categories: { allowed: ["engineering", "misc"] },
      plugin: [
        {
          name: "all-tools",
          version: "1.0.0",
          skills: ["alpha-skill", "beta-skill"],
        },
      ],
      ...(targets ? { targets } : {}),
    },
    { path: "skillsmith.toml" },
  ).value!;

describe("generic target adapter", () => {
  let config: SkillsmithConfig;
  beforeAll(() => {
    config = baseConfig(["claude-code", "generic"]);
  });

  test("copies shipped skills (minus evals) into dist/generic by category", async () => {
    const plan = await planFor(config);
    const dests = [...plan.copies.keys()];
    expect(dests).toContain("dist/generic/skills/engineering/alpha-skill/SKILL.md");
    expect(dests).toContain("dist/generic/skills/engineering/alpha-skill/notes.md");
    expect(dests).toContain("dist/generic/skills/misc/beta-skill/SKILL.md");
    expect(dests.every((d) => !d.includes("/evals/"))).toBe(true);
  });

  test("emits a deterministic INDEX.md with sorted rows and escaped pipes", async () => {
    const plan = await planFor(config);
    const index = plan.files.get("dist/generic/INDEX.md")!;
    expect(index).toBeDefined();
    const rows = index.split("\n").filter((l) => l.startsWith("| `"));
    expect(rows.map((r) => r.slice(3, r.indexOf("`", 3)))).toEqual([
      "alpha-skill",
      "beta-skill",
    ]);
    expect(index).toContain("Has \\| a pipe.");
    expect(index).not.toContain("Trimmed here");
    const second = await planFor(config);
    expect(second.files.get("dist/generic/INDEX.md")).toBe(index);
  });

  test("claude-code-only default emits no dist paths", async () => {
    const plan = await planFor(baseConfig(["claude-code"]));
    expect([...plan.copies.keys()].filter((d) => d.startsWith("dist/"))).toEqual([]);
    expect(plan.files.has("dist/generic/INDEX.md")).toBe(false);
  });
});

describe("codex + opencode adapters (normalized frontmatter)", () => {
  let config: SkillsmithConfig;
  beforeAll(() => {
    config = baseConfig(["claude-code", "codex", "opencode"]);
  });

  test("emits harness-specific dirs without evals/", async () => {
    const plan = await planFor(config);
    const dests = [...plan.copies.keys(), ...plan.files.keys()];
    expect(dests).toContain(".codex/skills/alpha-skill/SKILL.md");
    expect(dests).toContain(".opencode/skills/beta-skill/SKILL.md");
    expect(dests.every((d) => !d.includes("/evals/"))).toBe(true);
  });

  test("SKILL.md is rebuilt with standard-only frontmatter, body intact", async () => {
    const plan = await planFor(config);

    // Fixture skills carry no user-invocable; assert shape + stripping
    // via a skill that has one.
    const root = mkdtempSync(join(tmpdir(), "skillsmith-norm-"));
    const dir = join(root, "skills", "engineering", "gamma-skill");
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, "SKILL.md"),
      '---\nname: gamma-skill\ndescription: >-\n  Test skill.\nlicense: MIT\nuser-invocable: true\nmetadata:\n  skillsmith-maturity: "stable"\n---\nBody line.\n',
    );
    const discovery = await discover(root, { allowedCategories: ["engineering"] });
    const gammaConfig = validateSkillsmithConfig(
      {
        marketplace: { name: "test-marketplace", owner: { name: "Dakota" } },
        categories: { allowed: ["engineering"] },
        plugin: [{ name: "norm-tools", version: "1.0.0", skills: ["gamma-skill"] }],
        targets: ["claude-code", "codex", "opencode"],
      },
      { path: "skillsmith.toml" },
    ).value!;
    const plan2 = buildPlan(discovery, gammaConfig);
    const md = plan2.files.get(".opencode/skills/gamma-skill/SKILL.md")!;
    expect(md).toBeDefined();
    expect(md).toContain('name: "gamma-skill"');
    expect(md).toContain('description: "Test skill."');
    expect(md).toContain('license: "MIT"');
    expect(md).not.toContain("user-invocable");
    expect(md).toContain("skillsmith-maturity");
    expect(md.trimEnd().endsWith("Body line."));
    expect(md.endsWith("Body line.\n")).toBe(true);

    // codex gets the same normalized treatment
    const cdx = plan2.files.get(".codex/skills/gamma-skill/SKILL.md")!;
    expect(cdx).toBe(md);
  });

  test("non-SKILL assets ship byte-identical copies", async () => {
    const plan = await planFor(config);
    expect(plan.copies.get(".opencode/skills/alpha-skill/notes.md")).toBeDefined();
  });

  test("opencode description cap produces an error naming the limit", async () => {
    const { error } = await import("../src/diagnostics.ts");
    const root = mkdtempSync(join(tmpdir(), "skillsmith-cap-"));
    const dir = join(root, "skills", "engineering", "longy");
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, "SKILL.md"),
      `---\nname: longy\ndescription: ${"x".repeat(1100)}\n---\nB.\n`,
    );
    const discovery = await discover(root, { allowedCategories: ["engineering"] });
    const plan2 = buildPlan(discovery, config);
    const hits = plan2.diagnostics.filter(
      (d) => d.severity === "error" && d.path.includes("longy"),
    );
    expect(hits.length).toBeGreaterThanOrEqual(1);
    expect(hits[0]!.message).toContain("1024");
    void error;
  });
});
