import { describe, expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  discover,
  runTriggerEvals,
  buildListing,
  anthropicJudge,
  toResultsFile,
  buildPlan,
  validateSkillsmithConfig,
  type Judge,
  type JudgeUsage,
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
    expect(parsed.skills["code-review"]).toMatchObject({ hitRate: 1, cases: 6, failing: 0 });
    // Results carry what they measured, so a later validate can spot staleness.
    expect(parsed.skills["code-review"]!.descriptionSha).toMatch(/^[0-9a-f]{64}$/);
    expect(parsed.skills["code-review"]!.failingPrompts).toEqual([]);
    expect(parsed.listingSha).toMatch(/^[0-9a-f]{64}$/);

    const withBadges = buildPlan(d, config, { evalResults: parsed });
    const catalog = withBadges.files.get("catalog/CATALOG.md")!;
    expect(catalog).toContain("Triggering");
    expect(catalog).toContain("100% (6/6, 1 vote, mock, 2026-07-11)");
    // without results: no badge column (back-compat)
    const without = buildPlan(d, config);
    expect(without.files.get("catalog/CATALOG.md")!).not.toContain("Triggering");
    // determinism: same inputs, same bytes
    expect(buildPlan(d, config, { evalResults: parsed }).files.get("catalog/CATALOG.md")).toBe(catalog);
  });
});

describe("anthropicJudge request shape", () => {
  const listing = [
    { name: "code-review", description: "Reviews code." },
    { name: "repo-survey", description: "Maps a repo." },
  ];

  /** Capture request bodies without touching the network. */
  function withStubbedFetch(
    reply: unknown,
    run: (bodies: Record<string, unknown>[]) => Promise<void>,
  ): Promise<void> {
    const bodies: Record<string, unknown>[] = [];
    const real = globalThis.fetch;
    globalThis.fetch = (async (_url: string, init: { body: string }) => {
      bodies.push(JSON.parse(init.body) as Record<string, unknown>);
      return { ok: true, status: 200, json: async () => reply } as unknown as Response;
    }) as unknown as typeof fetch;
    return run(bodies).finally(() => {
      globalThis.fetch = real;
    });
  }

  const okReply = {
    content: [{ type: "text", text: '{"skill":"code-review"}' }],
    stop_reason: "end_turn",
    usage: { input_tokens: 12, cache_creation_input_tokens: 900, cache_read_input_tokens: 0 },
  };

  test("caches the listing prefix and leaves the per-case prompt uncached", async () => {
    await withStubbedFetch(okReply, async (bodies) => {
      const judge = anthropicJudge({ apiKey: "k", model: "m" });
      expect(await judge(listing, "review my code")).toBe("code-review");

      const content = (bodies[0] as { messages: { content: Record<string, unknown>[] }[] })
        .messages[0]!.content;
      expect(content).toHaveLength(2);
      expect(content[0]!.cache_control).toEqual({ type: "ephemeral" });
      expect(content[0]!.text).toContain("code-review: Reviews code.");
      expect(content[0]!.text).not.toContain("review my code");
      // The varying half must sit after the breakpoint, or it invalidates it.
      expect(content[1]!.cache_control).toBeUndefined();
      expect(content[1]!.text).toContain("review my code");
    });
  });

  test("the cached block is byte-identical across cases", async () => {
    await withStubbedFetch(okReply, async (bodies) => {
      const judge = anthropicJudge({ apiKey: "k", model: "m" });
      await judge(listing, "review my code");
      await judge(listing, "map out this repo");
      const blockOf = (b: unknown) =>
        (b as { messages: { content: { text: string }[] }[] }).messages[0]!.content[0]!.text;
      expect(blockOf(bodies[0])).toBe(blockOf(bodies[1]));
    });
  });

  test("no sampling parameters; JSON shape is schema-enforced, not prompted", async () => {
    await withStubbedFetch(okReply, async (bodies) => {
      const judge = anthropicJudge({ apiKey: "k", model: "m" });
      await judge(listing, "review my code");
      const body = bodies[0] as Record<string, unknown>;
      // Sampling params 400 on current models.
      expect(body.temperature).toBeUndefined();
      expect(body.top_p).toBeUndefined();
      expect(body.output_config).toEqual({
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: { skill: { type: ["string", "null"] } },
            required: ["skill"],
            additionalProperties: false,
          },
        },
      });
      expect(body.system).not.toContain("ONLY a JSON object");
    });
  });

  test("reports usage so cache reuse is observable", async () => {
    await withStubbedFetch(okReply, async () => {
      const seen: JudgeUsage[] = [];
      const judge = anthropicJudge({ apiKey: "k", model: "m", onUsage: (u) => seen.push(u) });
      await judge(listing, "review my code");
      expect(seen).toEqual([
        { inputTokens: 12, cacheCreationInputTokens: 900, cacheReadInputTokens: 0 },
      ]);
    });
  });

  test("a malformed body throws instead of scoring as 'no skill'", async () => {
    await withStubbedFetch({ content: [{ type: "text", text: "not json" }] }, async () => {
      const judge = anthropicJudge({ apiKey: "k", model: "m" });
      await expect(judge(listing, "review my code")).rejects.toThrow();
    });
  });

  test("a refusal throws rather than silently passing a no-trigger case", async () => {
    await withStubbedFetch({ content: [], stop_reason: "refusal" }, async () => {
      const judge = anthropicJudge({ apiKey: "k", model: "m" });
      await expect(judge(listing, "review my code")).rejects.toThrow(/declined/);
    });
  });
});

describe("--repeat majority voting", () => {

  const root = mkdtempSync(join(tmpdir(), "fold-"));
  const dir = join(root, "skills", "engineering", "s");
  mkdirSync(join(dir, "evals"), { recursive: true });
  writeFileSync(join(dir, "SKILL.md"), `---\nname: s\ndescription: 'Use when the user says "s".'\n---\nBody\n`);
  writeFileSync(join(dir, "evals", "evals.json"), JSON.stringify({
    should_trigger: [{ prompt: "always" }, { prompt: "coin" }, { prompt: "never" }],
    should_not_trigger: [{ prompt: "n1" }, { prompt: "n2" }, { prompt: "n3" }],
  }));
  const config = validateSkillsmithConfig({ marketplace: { name: "m", owner: { name: "D" } },
    categories: { allowed: ["engineering"] }, plugin: [{ name: "p", skills: [] }] }, { path: "x" }).value!;

  let coinCalls = 0;
  test("majority vote folds per case; ties fail; agreement is recorded", async () => {
    const d = await discover(root, { allowedCategories: config.categories.allowed });
    const report = await runTriggerEvals(d, config, {
      judgeModel: "fake", repeat: 5, concurrency: 1,
      judge: async (_l, prompt) => {
        if (prompt === "always") return "s";
        if (prompt === "never") return null;
        if (prompt === "coin") return coinCalls++ < 2 ? "s" : null;  // 2 of 5 pass
        return null; // negatives all pass
      },
    });
    const cases = Object.fromEntries(report.results[0]!.cases.map((c) => [c.prompt, c]));
    expect(cases["always"]!.agreement).toBe(1);
    expect(cases["always"]!.pass).toBe(true);
    expect(cases["never"]!.agreement).toBe(0);
    expect(cases["never"]!.pass).toBe(false);
    expect(cases["coin"]!.agreement).toBe(0.4);   // 2/5 — minority
    expect(cases["coin"]!.pass).toBe(false);      // strict majority, so it fails
    // The reported pick must come from a FAILING vote. "coin" passed its first
    // two votes (picked "s") then failed three (picked null): the failure is
    // "none", and a `??` fallthrough would have misreported it as "s".
    expect(cases["coin"]!.judged).toBeNull();
    expect(report.repeat).toBe(5);
  });

});

describe("--escalate: split cases get more votes, unanimous ones do not", () => {
  const root = mkdtempSync(join(tmpdir(), "esc-"));
  const dir = join(root, "skills", "engineering", "e");
  mkdirSync(join(dir, "evals"), { recursive: true });
  writeFileSync(join(dir, "SKILL.md"), `---\nname: e\ndescription: 'Use when the user says "e".'\n---\nBody\n`);
  writeFileSync(join(dir, "evals", "evals.json"), JSON.stringify({
    should_trigger: [{ prompt: "solid" }, { prompt: "edge" }, { prompt: "t3" }],
    should_not_trigger: [{ prompt: "n1" }, { prompt: "n2" }, { prompt: "n3" }],
  }));
  const config = validateSkillsmithConfig({ marketplace: { name: "m", owner: { name: "D" } },
    categories: { allowed: ["engineering"] }, plugin: [{ name: "p", skills: [] }] }, { path: "x" }).value!;

  test("only the split case is escalated, and its majority is taken over all its votes", async () => {
    const calls: Record<string, number> = {};
    let edgeCalls = 0;
    const d = await discover(root, { allowedCategories: config.categories.allowed });
    const report = await runTriggerEvals(d, config, {
      judgeModel: "fake", repeat: 3, escalate: 9, concurrency: 1,
      judge: async (_l, prompt) => {
        calls[prompt] = (calls[prompt] ?? 0) + 1;
        if (prompt === "edge") {
          // Votes 1-3: pass, fail, pass (split → escalate). Votes 4-9: all fail.
          const n = edgeCalls++;
          return n === 1 || n >= 3 ? null : "e";
        }
        return prompt === "solid" || prompt === "t3" ? "e" : null;
      },
    });
    expect(calls["solid"]).toBe(3);   // unanimous: stopped at repeat
    expect(calls["n1"]).toBe(3);
    expect(calls["edge"]).toBe(9);    // split: escalated to the cap
    const edge = report.results[0]!.cases.find((c) => c.prompt === "edge")!;
    expect(edge.agreement).toBeCloseTo(2 / 9);  // 2 passes of 9 — the round-one lead did not survive
    expect(edge.pass).toBe(false);
    expect(report.escalate).toBe(9);
    // No escalation requested: field equals repeat.
    const plain = await runTriggerEvals(d, config, { judgeModel: "fake", repeat: 3, judge: async () => "e" });
    expect(plain.escalate).toBe(3);
  });
});
