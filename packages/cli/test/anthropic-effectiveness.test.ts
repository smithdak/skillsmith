import { expect, test } from "bun:test";
import { anthropicEffectivenessRequest } from "../src/anthropic-effectiveness-runner.ts";

test("adapter uses separate solver/grader models and keeps treatment context out of grading", async () => {
  const bodies: any[] = [];
  const opts = { apiKey: "test", solverModel: "solver", graderModel: "grader",
    fetch: (async (_url: unknown, init: RequestInit) => {
      bodies.push(JSON.parse(String(init.body)));
      return Response.json({ stop_reason: "end_turn", content: [{ type: "text", text: '{"output":"answer"}' }] });
    }) as typeof fetch };
  await anthropicEffectivenessRequest({ operation: "solve", task: "task", instructions: "skill context" }, opts);
  await anthropicEffectivenessRequest({ operation: "grade", task: "task", output: "answer", success_criteria: ["criterion"] }, opts);
  expect(bodies[0].model).toBe("solver");
  expect(bodies[0].system).toContain("skill context");
  expect(bodies[1].model).toBe("grader");
  expect(JSON.stringify(bodies[1])).not.toContain("skill context");
  expect(bodies[1].output_config.format.schema.properties.criteria).toBeDefined();
});

test("adapter rejects refusal, truncation, and HTTP failure", async () => {
  for (const response of [Response.json({}, { status: 429 }),
    Response.json({ stop_reason: "refusal" }), Response.json({ stop_reason: "max_tokens" })]) {
    await expect(anthropicEffectivenessRequest({ operation: "solve", task: "task", instructions: "" }, {
      apiKey: "test", solverModel: "solver", graderModel: "grader", fetch: (async () => response) as unknown as typeof fetch,
    })).rejects.toThrow();
  }
});
