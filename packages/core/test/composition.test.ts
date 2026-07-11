import { describe, expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  discover,
  validateComposition,
  validateSkillsmithConfig,
  type SkillsmithConfig,
} from "../src/index.ts";

function makeRepo(
  skills: {
    name: string;
    category?: string;
    invocation: "user" | "model" | "both";
    composes?: string;
    seeAlso?: string;
    body?: string;
  }[],
  configOverrides: Record<string, unknown> = {},
): { root: string; config: SkillsmithConfig } {
  const root = mkdtempSync(join(tmpdir(), "v12-fixture-"));
  for (const s of skills) {
    const dir = join(root, "skills", s.category ?? "engineering", s.name);
    mkdirSync(dir, { recursive: true });
    const meta = [
      `  skillsmith-invocation: "${s.invocation}"`,
      s.composes ? `  skillsmith-composes: "${s.composes}"` : null,
      s.seeAlso ? `  skillsmith-see-also: "${s.seeAlso}"` : null,
    ]
      .filter(Boolean)
      .join("\n");
    writeFileSync(
      join(dir, "SKILL.md"),
      `---\nname: ${s.name}\ndescription: 'Use when "${s.name}".'\nmetadata:\n${meta}\n---\n${s.body ?? "Body.\n"}`,
    );
  }
  const config = validateSkillsmithConfig(
    {
      marketplace: { name: "m", owner: { name: "D" } },
      categories: { allowed: ["engineering"] },
      plugin: [{ name: "p", skills: skills.map((s) => s.name) }],
      ...configOverrides,
    },
    { path: "t" },
  ).value!;
  return { root, config };
}

async function run(root: string, config: SkillsmithConfig) {
  const d = await discover(root, { allowedCategories: config.categories.allowed });
  return validateComposition(d, config);
}

describe("V12 composition", () => {
  test("valid edge: user composes model, referenced in body — clean, edge recorded", async () => {
    const { root, config } = makeRepo([
      { name: "orchestrator", invocation: "user", composes: "discipline", body: "Run the discipline pass.\n" },
      { name: "discipline", invocation: "model" },
    ]);
    const r = await run(root, config);
    expect(r.diagnostics).toHaveLength(0);
    expect(r.edges).toEqual([{ composer: "orchestrator", target: "discipline", crossPlugin: false }]);
  });

  test("user composing user is an error", async () => {
    const { root, config } = makeRepo([
      { name: "orch-a", invocation: "user", composes: "orch-b", body: "Use orch-b.\n" },
      { name: "orch-b", invocation: "user" },
    ]);
    const r = await run(root, config);
    expect(r.diagnostics.some((d) => d.rule === "V12" && d.severity === "error" && d.message.includes("may not compose"))).toBe(true);
  });

  test("nonexistent target errors; draft target gets the promote message; self-composition errors", async () => {
    const { root, config } = makeRepo([
      { name: "composer-a", invocation: "user", composes: "ghost, wip-thing, composer-a", body: "ghost wip-thing composer-a\n" },
    ]);
    const draftDir = join(root, "skills", "drafts", "wip-thing");
    mkdirSync(draftDir, { recursive: true });
    writeFileSync(join(draftDir, "SKILL.md"), `---\nname: wip-thing\ndescription: "x"\n---\nB\n`);
    const r = await run(root, config);
    const msgs = r.diagnostics.filter((d) => d.severity === "error").map((d) => d.message);
    expect(msgs.some((m) => m.includes('"ghost" does not exist'))).toBe(true);
    expect(msgs.some((m) => m.includes("is a draft"))).toBe(true);
    expect(msgs.some((m) => m.includes("compose itself"))).toBe(true);
  });

  test("undeclared body reference warns; see-also acknowledges it; unknown see-also errors", async () => {
    const undeclared = makeRepo([
      { name: "mentioner", invocation: "model", body: "Boundary: that is sibling-skill's axis.\n" },
      { name: "sibling-skill", invocation: "model" },
    ]);
    const r1 = await run(undeclared.root, undeclared.config);
    expect(r1.diagnostics.some((d) => d.severity === "warning" && d.message.includes("does not declare"))).toBe(true);

    const acknowledged = makeRepo([
      { name: "mentioner", invocation: "model", seeAlso: "sibling-skill", body: "Boundary: that is sibling-skill's axis.\n" },
      { name: "sibling-skill", invocation: "model" },
    ]);
    const r2 = await run(acknowledged.root, acknowledged.config);
    expect(r2.diagnostics).toHaveLength(0);

    const badSeeAlso = makeRepo([
      { name: "mentioner", invocation: "model", seeAlso: "nope", body: "B.\n" },
    ]);
    const r3 = await run(badSeeAlso.root, badSeeAlso.config);
    expect(r3.diagnostics.some((d) => d.severity === "error" && d.message.includes('"nope" does not exist'))).toBe(true);
  });

  test("dead declaration (declared, never mentioned) warns", async () => {
    const { root, config } = makeRepo([
      { name: "composer-a", invocation: "user", composes: "discipline", body: "No mention at all.\n" },
      { name: "discipline", invocation: "model" },
    ]);
    const r = await run(root, config);
    expect(r.diagnostics.some((d) => d.severity === "warning" && d.message.includes("never references"))).toBe(true);
  });

  test("cross-plugin edge warns; allowlist suppresses; edge flagged either way", async () => {
    const skills = [
      { name: "composer-a", invocation: "user" as const, composes: "discipline", body: "Run discipline.\n" },
      { name: "discipline", invocation: "model" as const },
    ];
    const plugins = [
      { name: "plugin-a", skills: ["composer-a"] },
      { name: "plugin-b", skills: ["discipline"] },
    ];
    const warned = makeRepo(skills, { plugin: plugins });
    const r1 = await run(warned.root, warned.config);
    expect(r1.diagnostics.some((d) => d.severity === "warning" && d.message.includes("crosses plugins"))).toBe(true);
    expect(r1.edges[0]!.crossPlugin).toBe(true);

    const allowed = makeRepo(skills, {
      plugin: plugins,
      policy: { "composition-allowlist": ["composer-a->discipline"] },
    });
    const r2 = await run(allowed.root, allowed.config);
    expect(r2.diagnostics).toHaveLength(0);
    expect(r2.edges[0]!.crossPlugin).toBe(true);
  });
});
