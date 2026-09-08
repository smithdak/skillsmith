import { expect, test } from "bun:test";
import { runEffectiveness, type EffectivenessRequest } from "../src/effectiveness.ts";

const suite = { name: "test", cases: [{ id: "a", skill: "sample", task: "task", success_criteria: ["rubric"] }] };
test("paired runs withhold rubrics from solvers and treatment labels from graders", async () => {
  const requests: EffectivenessRequest[] = [];
  const report = await runEffectiveness(suite, {
    instructions: new Map([["sample", "instructions"]]), runnerId: "test-only", repeat: 2,
    runner: async (r) => {
      requests.push(r);
      return r.operation === "solve" ? { output: r.instructions ? "good" : "bad" }
        : { criteria: [{ pass: r.output === "good", reason: "fixture" }] };
    },
  });
  expect(report.offPassRate).toBe(0);
  expect(report.onPassRate).toBe(1);
  expect(report.results.map((r) => r.arm)).toEqual(["off", "on", "on", "off"]);
  for (const r of requests) {
    if (r.operation === "solve") expect(r).not.toHaveProperty("success_criteria");
    else { expect(r).not.toHaveProperty("instructions"); expect(r).not.toHaveProperty("arm"); }
  }
  expect(report.instructionHashes.sample).toMatch(/^[a-f0-9]{64}$/);
});

test("an incomplete grade or malformed response aborts instead of inflating scores", async () => {
  for (const response of [{ criteria: [] }, { criteria: [{ pass: "yes", reason: "bad type" }] }]) {
    await expect(runEffectiveness(suite, {
      instructions: new Map([["sample", "body"]]), runnerId: "test", repeat: 1,
      runner: async (r) => r.operation === "solve" ? { output: "answer" } : response,
    })).rejects.toThrow();
  }
});

test("a revision is compared with a snapshot and baseline, with separate skill and cost results", async () => {
  const report = await runEffectiveness({ name: "revision", cases: [
    { id: "a", skill: "a", task: "first", success_criteria: ["correct"] },
    { id: "b", skill: "b", task: "second", success_criteria: ["correct"] },
  ] }, {
    instructions: new Map([["a", "correct"], ["b", "correct"]]),
    previousInstructions: new Map([["a", "correct"], ["b", "wrong"]]),
    runnerId: "fixture", repeat: 3,
    runner: async (r) => r.operation === "solve"
      ? { output: r.instructions || "wrong", usage: { inputTokens: 10, outputTokens: 5 } }
      : { criteria: [{ pass: r.output === "correct", reason: "fixture" }] },
  });
  expect(report.results).toHaveLength(18);
  expect(report.offPassRate).toBe(0);
  expect(report.previousPassRate).toBe(0.5);
  expect(report.onPassRate).toBe(1);
  expect(report.revisionDelta).toBe(0.5);
  expect(report.perSkill.a!.previous!.passRate).toBe(1);
  expect(report.perSkill.b!.previous!.passRate).toBe(0);
  expect(report.summary.on!.usageTrials).toBe(6);
  expect(report.summary.on!.meanInputTokens).toBe(10);
  expect(report.summary.on!.meanOutputTokens).toBe(5);
  expect(report.previousInstructionHashes!.b).not.toBe(report.instructionHashes.b);
  expect(report.results.slice(0, 9).map((r) => r.arm)).toEqual([
    "off", "previous", "on", "previous", "on", "off", "on", "off", "previous",
  ]);
});

test("missing prior instructions abort before model calls, and omitted usage stays unknown", async () => {
  let calls = 0;
  const opts = {
    instructions: new Map([["sample", "current"]]), runnerId: "fixture", repeat: 1,
    runner: async (r: EffectivenessRequest) => {
      calls++;
      return r.operation === "solve" ? { output: "answer" }
        : { criteria: [{ pass: true, reason: "fixture" }] };
    },
  };
  await expect(runEffectiveness(suite, { ...opts, previousInstructions: new Map() })).rejects.toThrow("missing previous");
  expect(calls).toBe(0);
  const report = await runEffectiveness(suite, opts);
  expect(report.summary.on!.usageTrials).toBe(0);
  expect(report.summary.on!.meanInputTokens).toBeNull();
  expect(report).not.toHaveProperty("previousPassRate");
});
