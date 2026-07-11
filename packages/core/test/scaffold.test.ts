import { describe, expect, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  buildInitFiles,
  buildSkillScaffold,
  appendPluginGrouping,
  applyScaffold,
  discover,
  validateAll,
  validateSkillsmithConfig,
} from "../src/index.ts";

const INIT_OPTS = {
  marketplaceName: "test-marketplace",
  ownerName: "Dakota",
  categories: ["engineering", "productivity", "misc"],
};

describe("init", () => {
  test("emits taxonomy, config, CI, docs, and editor schemas", () => {
    const files = buildInitFiles(INIT_OPTS);
    const paths = [...files.keys()];
    expect(paths).toContain("skillsmith.toml");
    expect(paths).toContain("skills/engineering/.gitkeep");
    expect(paths).toContain("skills/drafts/.gitkeep");
    expect(paths).toContain(".github/workflows/validate.yml");
    expect(paths).toContain("SECURITY.md");
    expect(paths).toContain(".skillsmith/schemas/plugin.schema.json");
    expect(paths).toContain(".vscode/settings.json");
    // the generated toml must itself pass our config schema
    // (Bun TOML import isn't available for strings; spot-check structure)
    const toml = files.get("skillsmith.toml")!;
    expect(toml).toContain('name = "test-marketplace"');
    expect(toml).toContain('allowed = ["engineering", "productivity", "misc"]');
    expect(toml).not.toContain('"drafts"');
  });

  test("applyScaffold never overwrites; init into non-empty dir fills gaps", async () => {
    const root = mkdtempSync(join(tmpdir(), "init-fixture-"));
    writeFileSync(join(root, "SECURITY.md"), "MY EXISTING POLICY\n");
    const files = buildInitFiles(INIT_OPTS);
    const r1 = await applyScaffold(files, root, { errorOnExisting: false });
    expect(r1.skipped).toContain("SECURITY.md");
    expect(await Bun.file(join(root, "SECURITY.md")).text()).toBe("MY EXISTING POLICY\n");
    // second run: everything skips (idempotent)
    const r2 = await applyScaffold(files, root, { errorOnExisting: false });
    expect(r2.written).toHaveLength(0);
    expect(r2.skipped.length).toBe(files.size);
  });
});

describe("scaffold", () => {
  test("skill scaffold defaults to drafts and passes the full pipeline leniently", async () => {
    const root = mkdtempSync(join(tmpdir(), "scaffold-fixture-"));
    await applyScaffold(buildInitFiles(INIT_OPTS), root, { errorOnExisting: false });
    await applyScaffold(buildSkillScaffold("my-new-skill", "drafts"), root, { errorOnExisting: true });

    const config = validateSkillsmithConfig(
      (await import(join(root, "skillsmith.toml"))).default,
      { path: "skillsmith.toml" },
    ).value!;
    const d = await discover(root, { allowedCategories: config.categories.allowed });
    const skill = d.skills.find((s) => s.name === "my-new-skill");
    expect(skill?.draft).toBe(true);
    // draft: no errors despite TODO evals (V8 exempt)
    const { diagnostics } = await validateAll(d, config);
    expect(diagnostics.filter((x) => x.severity === "error")).toHaveLength(0);
  });

  test("promoted scaffold (real category) fails V8 until evals are real — the gate binds", async () => {
    const root = mkdtempSync(join(tmpdir(), "promote-fixture-"));
    await applyScaffold(buildInitFiles(INIT_OPTS), root, { errorOnExisting: false });
    await applyScaffold(buildSkillScaffold("eager-skill", "engineering"), root, { errorOnExisting: true });
    const config = validateSkillsmithConfig(
      (await import(join(root, "skillsmith.toml"))).default,
      { path: "skillsmith.toml" },
    ).value!;
    const d = await discover(root, { allowedCategories: config.categories.allowed });
    const { diagnostics } = await validateAll(d, config);
    // V8 rejects TODO placeholder prompts, so a scaffold promoted without
    // real evals FAILS — the gate binds exactly at promotion.
    expect(d.skills.find((s) => s.name === "eager-skill")?.draft).toBe(false);
    const v8 = diagnostics.filter((x) => x.rule === "V8" && x.severity === "error");
    expect(v8.length).toBe(6); // all 6 placeholder cases flagged
  });

  test("scaffolding an existing skill errors (no-clobber)", async () => {
    const root = mkdtempSync(join(tmpdir(), "clobber-fixture-"));
    await applyScaffold(buildSkillScaffold("dupe", "drafts"), root, { errorOnExisting: true });
    expect(
      applyScaffold(buildSkillScaffold("dupe", "drafts"), root, { errorOnExisting: true }),
    ).rejects.toThrow(/refusing to overwrite/);
  });

  test("appendPluginGrouping inserts before [policy] and preserves content", () => {
    const toml = `[marketplace]\nname = "m"\nowner = { name = "D" }\n\n[categories]\nallowed = ["engineering"]\n\n[[plugin]]\nname = "first"\nskills = []\n\n[policy]\n"security-tier" = "strict"\n`;
    const out = appendPluginGrouping(toml, "second", "The second plugin");
    expect(out.indexOf('name = "second"')).toBeGreaterThan(out.indexOf('name = "first"'));
    expect(out.indexOf('name = "second"')).toBeLessThan(out.indexOf("[policy]"));
    expect(out).toContain('description = "The second plugin"');
  });
});
