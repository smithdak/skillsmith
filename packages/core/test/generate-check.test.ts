import { describe, expect, test, beforeAll } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  discover,
  buildPlan,
  writePlan,
  checkPlan,
  validateSkillsmithConfig,
  type SkillsmithConfig,
} from "../src/index.ts";

function makeFixtureRepo(): string {
  const root = mkdtempSync(join(tmpdir(), "skillsmith-fixture-"));

  const skill = (
    category: string,
    name: string,
    fm: Record<string, unknown>,
    body = "Do the thing.\n",
  ) => {
    const dir = join(root, "skills", category, name);
    mkdirSync(dir, { recursive: true });
    const yaml = Object.entries(fm)
      .map(([k, v]) =>
        typeof v === "object"
          ? `${k}:\n${Object.entries(v as Record<string, string>)
              .map(([mk, mv]) => `  ${mk}: "${mv}"`)
              .join("\n")}`
          : `${k}: ${JSON.stringify(v)}`,
      )
      .join("\n");
    writeFileSync(join(dir, "SKILL.md"), `---\n${yaml}\n---\n${body}`);
    return dir;
  };

  const cr = skill("engineering", "code-review", {
    name: "code-review",
    description:
      'Two-axis code review. Use this skill when the user asks to "review my code".',
    metadata: {
      "skillsmith-plugin": "review-tools",
      "skillsmith-category": "engineering",
      "skillsmith-maturity": "stable",
    },
  });
  mkdirSync(join(cr, "scripts"), { recursive: true });
  writeFileSync(join(cr, "scripts", "diff-stats.sh"), "#!/bin/sh\ngit diff --stat\n");
  mkdirSync(join(cr, "evals"), { recursive: true });
  writeFileSync(join(cr, "evals", "evals.json"), "{}\n"); // must NOT ship

  skill("engineering", "tdd", {
    name: "tdd",
    description: 'Test-driven development discipline. Use when the user says "tdd".',
  });

  skill("drafts", "half-baked", {
    name: "half-baked",
    description: "Not ready.", // drafts are lenient — no V3 required
  });

  // agent
  mkdirSync(join(root, "agents"), { recursive: true });
  writeFileSync(
    join(root, "agents", "spec-reviewer.md"),
    `---\nname: spec-reviewer\ndescription: >-\n  Use proactively for spec review. <example>user: review the spec</example>\nmodel: inherit\ncolor: blue\n---\nReview specs.\n`,
  );

  // hooks
  mkdirSync(join(root, "hooks", "pre-commit-gate"), { recursive: true });
  writeFileSync(
    join(root, "hooks", "pre-commit-gate", "hooks.json"),
    JSON.stringify(
      { PreToolUse: [{ matcher: "Bash", hooks: [{ type: "command", command: "./gate.sh" }] }] },
      null,
      2,
    ),
  );

  // mcp
  mkdirSync(join(root, "mcp"), { recursive: true });
  writeFileSync(
    join(root, "mcp", "issue-store.mcp.json"),
    JSON.stringify(
      { mcpServers: { "issue-store": { command: "node", args: ["${CLAUDE_PLUGIN_ROOT}/server.mjs"] } } },
      null,
      2,
    ),
  );

  return root;
}

const CONFIG_RAW = {
  marketplace: {
    name: "test-marketplace",
    owner: { name: "Dakota" },
  },
  categories: { allowed: ["engineering", "productivity", "misc"] },
  plugin: [
    {
      name: "review-tools",
      version: "0.2.0",
      description: "Code review workflow",
      skills: ["code-review", "tdd"],
      agents: ["spec-reviewer"],
      hooks: ["pre-commit-gate"],
      mcp: ["issue-store"],
    },
  ],
};

describe("generate + check end-to-end", () => {
  let root: string;
  let config: SkillsmithConfig;

  beforeAll(() => {
    root = makeFixtureRepo();
    const r = validateSkillsmithConfig(CONFIG_RAW, { path: "skillsmith.toml" });
    expect(r.value).toBeDefined();
    config = r.value!;
  });

  test("discovery finds skills (incl. draft), agent, hooks, mcp", async () => {
    const d = await discover(root, { allowedCategories: config.categories.allowed });
    expect(d.skills.map((s) => s.name).sort()).toEqual(["code-review", "half-baked", "tdd"]);
    expect(d.skills.find((s) => s.name === "half-baked")?.draft).toBe(true);
    expect(d.agents.map((a) => a.name)).toEqual(["spec-reviewer"]);
    expect(d.hookSets.map((h) => h.name)).toEqual(["pre-commit-gate"]);
    expect(d.mcpServers.map((m) => m.name)).toEqual(["issue-store"]);
    expect(d.diagnostics.filter((x) => x.severity === "error")).toHaveLength(0);
  });

  test("plan emits manifests, marketplace, catalog; excludes evals and drafts", async () => {
    const d = await discover(root, { allowedCategories: config.categories.allowed });
    const plan = buildPlan(d, config);
    expect(plan.diagnostics.filter((x) => x.severity === "error")).toHaveLength(0);

    const manifest = JSON.parse(plan.files.get("plugins/review-tools/.claude-plugin/plugin.json")!);
    expect(manifest.name).toBe("review-tools");
    expect(manifest.version).toBe("0.2.0");

    const marketplace = JSON.parse(plan.files.get(".claude-plugin/marketplace.json")!);
    expect(marketplace.plugins[0].source).toBe("./plugins/review-tools");

    const catalog = plan.files.get("catalog/CATALOG.md")!;
    expect(catalog).toContain("code-review");
    expect(catalog).toContain("1 draft skill(s)");
    expect(catalog).not.toContain("half-baked");

    const dests = [...plan.copies.values()];
    expect(dests).toContain("plugins/review-tools/skills/code-review/SKILL.md");
    expect(dests).toContain("plugins/review-tools/skills/code-review/scripts/diff-stats.sh");
    expect(dests).toContain("plugins/review-tools/agents/spec-reviewer.md");
    expect(dests.some((p) => p.includes("evals"))).toBe(false);
    expect(dests.some((p) => p.includes("half-baked"))).toBe(false);

    const mcp = JSON.parse(plan.files.get("plugins/review-tools/.mcp.json")!);
    expect(mcp.mcpServers["issue-store"].command).toBe("node");
  });

  test("generate is deterministic (two plans, identical bytes)", async () => {
    const d1 = await discover(root, { allowedCategories: config.categories.allowed });
    const d2 = await discover(root, { allowedCategories: config.categories.allowed });
    const p1 = buildPlan(d1, config);
    const p2 = buildPlan(d2, config);
    expect([...p1.files.entries()]).toEqual([...p2.files.entries()]);
  });

  test("write → check clean; mutate → drift(modified); stray file → drift(stale); delete → drift(missing)", async () => {
    const d = await discover(root, { allowedCategories: config.categories.allowed });
    const plan = buildPlan(d, config);
    await writePlan(plan, root);

    let result = await checkPlan(plan, root);
    expect(result.clean).toBe(true);

    // modified: hand-edit a generated manifest (the anti-pattern I2 exists to catch)
    const manifestPath = join(root, "plugins/review-tools/.claude-plugin/plugin.json");
    writeFileSync(manifestPath, "{\n  \"name\": \"hand-edited\"\n}\n");
    result = await checkPlan(plan, root);
    expect(result.drifts.some((x) => x.kind === "modified" && x.path.endsWith("plugin.json"))).toBe(true);

    // restore, then stale: a lingering file the plan no longer owns
    await writePlan(plan, root);
    writeFileSync(join(root, "plugins/review-tools/skills/removed-skill.md"), "orphan\n");
    result = await checkPlan(plan, root);
    expect(result.drifts.some((x) => x.kind === "stale" && x.path.includes("removed-skill"))).toBe(true);
    rmSync(join(root, "plugins/review-tools/skills/removed-skill.md"));

    // missing: delete a generated file
    rmSync(join(root, "catalog/CATALOG.md"));
    result = await checkPlan(plan, root);
    expect(result.drifts.some((x) => x.kind === "missing" && x.path === "catalog/CATALOG.md")).toBe(true);
  });

  test("shipping a draft is an error; unknown skill is an error", async () => {
    const bad = validateSkillsmithConfig(
      {
        ...CONFIG_RAW,
        plugin: [{ name: "bad-plugin", skills: ["half-baked", "nonexistent"] }],
      },
      { path: "skillsmith.toml" },
    ).value!;
    const d = await discover(root, { allowedCategories: bad.categories.allowed });
    const plan = buildPlan(d, bad);
    const errors = plan.diagnostics.filter((x) => x.severity === "error");
    expect(errors.some((x) => x.rule === "V14" && x.message.includes("drafts"))).toBe(true);
    expect(errors.some((x) => x.message.includes('"nonexistent" not found'))).toBe(true);
  });

  test("category folder outside allowlist is a V14 error", async () => {
    const dir = join(root, "skills", "rogue-category", "rogue-skill");
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, "SKILL.md"),
      `---\nname: rogue-skill\ndescription: 'Use when \"rogue\".'\n---\nBody.\n`,
    );
    const d = await discover(root, { allowedCategories: config.categories.allowed });
    expect(d.diagnostics.some((x) => x.rule === "V14" && x.message.includes("rogue-category"))).toBe(true);
    rmSync(join(root, "skills", "rogue-category"), { recursive: true });
  });
});
