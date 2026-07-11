import { describe, expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  discover,
  runTriggerEvals,
  buildListing,
  toResultsFile,
  buildPlan,
  validateSkillsmithConfig,
  type Judge,
  type SkillsmithConfig,
  type EvalResultsFile,
} from "../src/index.ts";

function makeRepo(): { root: string; config: SkillsmithConfig } {
  const root = mkdtempSync(join(tmpdir(), "eval-fixture-"));
  const mk = (name: string, description: string, evals: unknown) => {
    const dir = join(root, "skills", "engineering", name);
    mkdirSync(join(dir, "evals"), { recursive: true });
    writeFileSync(join(dir, "SKILL.md"), `---\nname: ${name}\ndescription: '${description}'\n---\nBody.\n`);
    writeFileSync(join(dir, "evals", "evals.json"), JSON.stringify(evals));
  };
  mk(
    "code-review",
    'Reviews code changes. Use this skill when the user says "review my code" or "code review".',
    {
      should_trigger: [
        { prompt: "review my code please" },
        { prompt: "run a code review on this diff" },
        { prompt: "can you code review my branch" },
      ],
      should_not_trigger: [
        { prompt: "write a poem" },
        { prompt: "survey this codebase" },
        { prompt: "what's the weather" },
      ],
    },
  );
  mk(
    "repo-survey",
    'Maps a repository. Use this skill when the user says "survey this codebase" or needs orientation.',
    {
      should_trigger: [
        { prompt: "survey this codebase" },
        { prompt: "map out this repo for me" },
        { prompt: "help me get oriented in this project" },
      ],
      should_not_trigger: [
        { prompt: "review my code please" },
        { prompt: "fix this bug" },
        { prompt: "what is a monad" },
      ],
    },
  );
  const config = validateSkillsmithConfig(
    {
      marketplace: { name: "m", owner: { name: "D" } },
      categories: { allowed: ["engineering"] },
      plugin: [{ name: "p", skills: ["code-review", "repo-survey"] }],
    },
    { path: "t" },
  ).value!;
  return { root, config };
}

/** Deterministic keyword judge standing in for the model. */
const keywordJudge: Judge = async (listing, prompt) => {
  const p = prompt.toLowerCase();
  if (p.includes("code review") || p.includes("review my code")) return "code-review";
  if (p.includes("survey") || p.includes("map out") || p.includes("oriented")) return "repo-survey";
  return null;
};

describe("eval harness (mock judge)", () => {
  test("listing contains only non-draft skills, sorted", async () => {
    const { root, config } = makeRepo();
    const draftDir = join(root, "skills", "drafts", "wip");
    mkdirSync(draftDir, { recursive: true });
    writeFileSync(join(draftDir, "SKILL.md"), `---\nname: wip\ndescription: "x"\n---\nB\n`);
    const d = await discover(root, { allowedCategories: config.categories.allowed });
    const listing = buildListing(d);
    expect(listing.map((l) => l.name)).toEqual(["code-review", "repo-survey"]);
  });

  test("perfect skills score 1.0; cross-catalog confusion is caught", async () => {
    const { root, config } = makeRepo();
    const d = await discover(root, { allowedCategories: config.categories.allowed });
    const report = await runTriggerEvals(d, config, {
      judge: keywordJudge,
      judgeModel: "mock",
    });
    expect(report.results.map((r) => r.hitRate)).toEqual([1, 1]);
    expect(report.diagnostics).toHaveLength(0);

    // Now a confusable judge: everything survey-ish routes to code-review.
    const confusedJudge: Judge = async () => "code-review";
    const report2 = await runTriggerEvals(d, config, {
      judge: confusedJudge,
      judgeModel: "mock-confused",
    });
    const survey = report2.results.find((r) => r.skill === "repo-survey")!;
    // all 3 should-trigger fail (judged code-review), all 3 no-trigger pass
    expect(survey.hitRate).toBe(0.5);
    const review = report2.results.find((r) => r.skill === "code-review")!;
    // 3 triggers pass; no-trigger cases all judged code-review → all 3 fail
    expect(review.hitRate).toBe(0.5);
    // both fall below the 0.85 policy default → threshold diagnostics
    expect(report2.diagnostics.filter((x) => x.rule === "V8")).toHaveLength(2);
  });

  test("single-skill filter; unknown skill errors", async () => {
    const { root, config } = makeRepo();
    const d = await discover(root, { allowedCategories: config.categories.allowed });
    const one = await runTriggerEvals(d, config, {
      judge: keywordJudge,
      judgeModel: "mock",
      skill: "code-review",
    });
    expect(one.results.map((r) => r.skill)).toEqual(["code-review"]);
    const missing = await runTriggerEvals(d, config, {
      judge: keywordJudge,
      judgeModel: "mock",
      skill: "nope",
    });
    expect(missing.diagnostics.some((x) => x.severity === "error")).toBe(true);
  });

  test("results file is canonical and drives catalog badges deterministically", async () => {
    const { root, config } = makeRepo();
    const d = await discover(root, { allowedCategories: config.categories.allowed });
    const report = await runTriggerEvals(d, config, { judge: keywordJudge, judgeModel: "mock" });
    const fileText = toResultsFile(report, "2026-07-11");
    const parsed = JSON.parse(fileText) as EvalResultsFile;
    expect(parsed.skills["code-review"]).toEqual({ hitRate: 1, cases: 6, failing: 0 });

    const withBadges = buildPlan(d, config, { evalResults: parsed });
    const catalog = withBadges.files.get("catalog/CATALOG.md")!;
    expect(catalog).toContain("Triggering");
    expect(catalog).toContain("100% (6/6, mock, 2026-07-11)");
    // without results: no badge column (back-compat)
    const without = buildPlan(d, config);
    expect(without.files.get("catalog/CATALOG.md")!).not.toContain("Triggering");
    // determinism: same inputs, same bytes
    expect(buildPlan(d, config, { evalResults: parsed }).files.get("catalog/CATALOG.md")).toBe(catalog);
  });
});
