import { describe, expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, chmodSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  discover,
  validateAll,
  validateSkill,
  validateSkillsmithConfig,
  type SkillsmithConfig,
} from "../src/index.ts";

const GOOD_EVALS = JSON.stringify({
  should_trigger: [
    { prompt: "review my code" },
    { prompt: "can you do a code review" },
    { prompt: "check this before I merge" },
  ],
  should_not_trigger: [
    { prompt: "what's the weather" },
    { prompt: "write a poem" },
    { prompt: "explain monads" },
  ],
});

function makeRepo(): { root: string; config: SkillsmithConfig } {
  const root = mkdtempSync(join(tmpdir(), "validate-fixture-"));
  const config = validateSkillsmithConfig(
    {
      marketplace: { name: "m", owner: { name: "D" } },
      categories: { allowed: ["engineering"] },
      plugin: [{ name: "p", skills: [] }],
    },
    { path: "skillsmith.toml" },
  ).value!;
  return { root, config };
}

function addSkill(
  root: string,
  name: string,
  opts: {
    body?: string;
    evals?: string | null;
    scripts?: Record<string, { content: string; exec?: boolean }>;
    references?: Record<string, string>;
    extraFiles?: Record<string, string>;
  } = {},
) {
  const dir = join(root, "skills", "engineering", name);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, "SKILL.md"),
    `---\nname: ${name}\ndescription: 'Use this skill when the user says "${name}".'\n---\n${opts.body ?? "Do the thing.\n"}`,
  );
  if (opts.evals !== null) {
    mkdirSync(join(dir, "evals"), { recursive: true });
    writeFileSync(join(dir, "evals", "evals.json"), opts.evals ?? GOOD_EVALS);
  }
  for (const [rel, spec] of Object.entries(opts.scripts ?? {})) {
    mkdirSync(join(dir, "scripts"), { recursive: true });
    const p = join(dir, "scripts", rel);
    writeFileSync(p, spec.content);
    if (spec.exec !== false) chmodSync(p, 0o755);
  }
  for (const [rel, content] of Object.entries(opts.references ?? {})) {
    const p = join(dir, "references", rel);
    mkdirSync(join(p, ".."), { recursive: true });
    writeFileSync(p, content);
  }
  for (const [rel, content] of Object.entries(opts.extraFiles ?? {})) {
    const p = join(dir, rel);
    mkdirSync(join(p, ".."), { recursive: true });
    writeFileSync(p, content);
  }
  return dir;
}

async function rulesFor(root: string, config: SkillsmithConfig, skillName: string) {
  const d = await discover(root, { allowedCategories: config.categories.allowed });
  const skill = d.skills.find((s) => s.name === skillName)!;
  const r = await validateSkill(skill, config);
  return r;
}

describe("validate quality tier", () => {
  test("clean skill produces zero diagnostics and an S1 inventory", async () => {
    const { root, config } = makeRepo();
    addSkill(root, "clean-skill", {
      scripts: { "helper.sh": { content: "#!/bin/sh\necho ok\n" } },
    });
    const r = await rulesFor(root, config, "clean-skill");
    expect(r.diagnostics).toHaveLength(0);
    expect(r.inventory).toHaveLength(1);
    expect(r.inventory[0]!.interpreter).toBe("sh");
    expect(r.inventory[0]!.networkTouching).toBe(false);
    expect(r.inventory[0]!.sha256).toMatch(/^[0-9a-f]{64}$/);
  });

  test("V4: oversized body", async () => {
    const { root, config } = makeRepo();
    addSkill(root, "huge-skill", { body: "line\n".repeat(600) });
    const r = await rulesFor(root, config, "huge-skill");
    expect(r.diagnostics.some((d) => d.rule === "V4")).toBe(true);
  });

  test("V5: deep reference errors, chained reference warns", async () => {
    const { root, config } = makeRepo();
    addSkill(root, "ref-skill", {
      references: {
        "a.md": "see [b](./references/b.md)",
        "deep/nested.md": "too deep",
      },
    });
    const r = await rulesFor(root, config, "ref-skill");
    expect(r.diagnostics.some((d) => d.rule === "V5" && d.severity === "error")).toBe(true);
    expect(r.diagnostics.some((d) => d.rule === "V5" && d.severity === "warning")).toBe(true);
  });

  test("V6: shebang-less shell script errors; non-executable warns", async () => {
    const { root, config } = makeRepo();
    addSkill(root, "script-skill", {
      scripts: { "bad.sh": { content: "echo no shebang\n", exec: false } },
    });
    const r = await rulesFor(root, config, "script-skill");
    expect(r.diagnostics.some((d) => d.rule === "V6" && d.severity === "error")).toBe(true);
    expect(r.diagnostics.some((d) => d.rule === "V6" && d.severity === "warning")).toBe(true);
  });

  test("V8: missing evals errors; insufficient cases error", async () => {
    const { root, config } = makeRepo();
    addSkill(root, "no-evals", { evals: null });
    addSkill(root, "thin-evals", {
      evals: JSON.stringify({ should_trigger: [{ prompt: "x" }], should_not_trigger: [] }),
    });
    const r1 = await rulesFor(root, config, "no-evals");
    expect(r1.diagnostics.some((d) => d.rule === "V8" && d.message.includes("missing"))).toBe(true);
    const r2 = await rulesFor(root, config, "thin-evals");
    expect(r2.diagnostics.filter((d) => d.rule === "V8")).toHaveLength(2);
  });

  test("V10: many conditional sections warns", async () => {
    const { root, config } = makeRepo();
    addSkill(root, "branchy", {
      body: "## If using React\n...\n## If using Vue\n...\n## When on Windows\n...\n",
    });
    const r = await rulesFor(root, config, "branchy");
    expect(r.diagnostics.some((d) => d.rule === "V10" && d.severity === "warning")).toBe(true);
  });

  test("V11: CLAUDE.md inside skill dir errors", async () => {
    const { root, config } = makeRepo();
    addSkill(root, "claudemd", { extraFiles: { "CLAUDE.md": "context" } });
    const r = await rulesFor(root, config, "claudemd");
    expect(r.diagnostics.some((d) => d.rule === "V11")).toBe(true);
  });

  test("V13: reasoning-extraction phrasing warns", async () => {
    const { root, config } = makeRepo();
    addSkill(root, "reasoner", {
      body: "After each step, explain your reasoning to the user.\n",
    });
    const r = await rulesFor(root, config, "reasoner");
    expect(r.diagnostics.some((d) => d.rule === "V13" && d.severity === "warning")).toBe(true);
  });
});

describe("validate security tier", () => {
  test("S2: network-touching script errors under strict, passes when allowlisted", async () => {
    const { root, config } = makeRepo();
    addSkill(root, "net-skill", {
      scripts: { "fetch.sh": { content: "#!/bin/sh\ncurl https://api.example.com\n" } },
    });
    const r = await rulesFor(root, config, "net-skill");
    expect(r.diagnostics.some((d) => d.rule === "S2" && d.severity === "error")).toBe(true);
    expect(r.inventory[0]!.networkTouching).toBe(true);

    const allowConfig = validateSkillsmithConfig(
      {
        marketplace: { name: "m", owner: { name: "D" } },
        categories: { allowed: ["engineering"] },
        plugin: [{ name: "p", skills: [] }],
        policy: { "network-allowlist": ["scripts/fetch.sh"] },
      },
      { path: "t" },
    ).value!;
    const r2 = await rulesFor(root, allowConfig, "net-skill");
    expect(r2.diagnostics.filter((d) => d.rule === "S2")).toHaveLength(0);
  });

  test("S4: hardcoded credential in script errors", async () => {
    const { root, config } = makeRepo();
    addSkill(root, "leaky", {
      scripts: {
        "deploy.sh": { content: '#!/bin/sh\napi_key="sk_live_abcdef123456789"\n' },
      },
    });
    const r = await rulesFor(root, config, "leaky");
    expect(r.diagnostics.some((d) => d.rule === "S4" && d.severity === "error")).toBe(true);
  });

  test("drafts are exempt from the V/S tiers in validateAll", async () => {
    const { root, config } = makeRepo();
    const dir = join(root, "skills", "drafts", "rough");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "SKILL.md"), `---\nname: rough\ndescription: "wip"\n---\n${"x\n".repeat(600)}`);
    const d = await discover(root, { allowedCategories: config.categories.allowed });
    const { diagnostics } = await validateAll(d, config);
    expect(diagnostics.filter((x) => x.path.includes("rough"))).toHaveLength(0);
  });
});
