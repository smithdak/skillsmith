import { createHash } from "node:crypto";
import { z } from "zod";

export const effectivenessSuiteSchema = z.strictObject({
  name: z.string().min(1),
  cases: z.array(z.strictObject({
    id: z.string().min(1),
    skill: z.string().min(1),
    task: z.string().min(1),
    success_criteria: z.array(z.string().min(1)).min(1),
  })).min(1),
}).refine((s) => new Set(s.cases.map((c) => c.id)).size === s.cases.length, "case IDs must be unique");

export type EffectivenessSuite = z.infer<typeof effectivenessSuiteSchema>;
export type EffectivenessRequest =
  | { operation: "solve"; task: string; instructions: string }
  | { operation: "grade"; task: string; success_criteria: string[]; output: string };

const answerSchema = z.strictObject({
  output: z.string().min(1),
  usage: z.strictObject({
    inputTokens: z.number().int().nonnegative(),
    outputTokens: z.number().int().nonnegative(),
  }).optional(),
});
const gradeSchema = z.strictObject({
  criteria: z.array(z.strictObject({ pass: z.boolean(), reason: z.string().min(1) })),
});
const sha = (text: string) => createHash("sha256").update(text).digest("hex");

/** Paired, fresh-session text tasks. The grader receives neither arm nor skill. */
export async function runEffectiveness(suite: EffectivenessSuite, opts: {
  instructions: Map<string, string>;
  /** A snapshot of the prior skill versions, compared within the same run. */
  previousInstructions?: Map<string, string>;
  runner: (request: EffectivenessRequest) => Promise<unknown>;
  runnerId: string;
  repeat: number;
}) {
  effectivenessSuiteSchema.parse(suite);
  if (!Number.isSafeInteger(opts.repeat) || opts.repeat < 1) throw new Error("repeat must be a positive integer");
  if (!opts.runnerId.trim()) throw new Error("runner ID must describe the harness, solver model, and grader model");
  for (const c of suite.cases) {
    if (!opts.instructions.get(c.skill)) throw new Error(`missing instructions for ${c.skill}`);
    if (opts.previousInstructions && !opts.previousInstructions.get(c.skill)) {
      throw new Error(`missing previous instructions for ${c.skill}`);
    }
  }
  type Arm = "on" | "off" | "previous";
  const configurations: Arm[] = opts.previousInstructions ? ["off", "previous", "on"] : ["off", "on"];
  const results: { case: string; skill: string; trial: number; arm: Arm;
    output: string; criteria: z.infer<typeof gradeSchema>["criteria"]; pass: boolean;
    durationMs: number; usage?: z.infer<typeof answerSchema>["usage"] }[] = [];
  for (const [index, c] of suite.cases.entries()) {
    for (let trial = 0; trial < opts.repeat; trial++) {
      // Counterbalance execution order to reduce time/order effects.
      const offset = (index + trial) % configurations.length;
      const arms = [...configurations.slice(offset), ...configurations.slice(0, offset)];
      for (const arm of arms) {
        const started = performance.now();
        const { output, usage } = answerSchema.parse(await opts.runner({
          operation: "solve", task: c.task,
          instructions: arm === "on" ? opts.instructions.get(c.skill)!
            : arm === "previous" ? opts.previousInstructions!.get(c.skill)! : "",
        }));
        const durationMs = Math.round(performance.now() - started);
        const { criteria } = gradeSchema.parse(await opts.runner({
          operation: "grade", task: c.task, success_criteria: c.success_criteria, output,
        }));
        if (criteria.length !== c.success_criteria.length) throw new Error(`grader omitted criteria for ${c.id}`);
        results.push({ case: c.id, skill: c.skill, trial, arm, output, criteria,
          pass: criteria.every((criterion) => criterion.pass), durationMs,
          ...(usage ? { usage } : {}) });
      }
    }
  }
  const rate = (arm: string) => {
    const selected = results.filter((r) => r.arm === arm);
    return selected.filter((r) => r.pass).length / selected.length;
  };
  const skills = [...new Set(suite.cases.map((c) => c.skill))].sort();
  const hashes = (instructions: Map<string, string>) => Object.fromEntries(
    skills.map((skill) => [skill, sha(instructions.get(skill)!)]));
  const summaries = (selected: typeof results) => Object.fromEntries(configurations.map((arm) => {
    const trials = selected.filter((r) => r.arm === arm);
    const measured = trials.filter((r) => r.usage !== undefined);
    return [arm, {
      trials: trials.length, passed: trials.filter((r) => r.pass).length,
      passRate: trials.filter((r) => r.pass).length / trials.length,
      meanDurationMs: trials.reduce((sum, r) => sum + r.durationMs, 0) / trials.length,
      // Missing usage is unknown, never zero. Only solver costs are recorded.
      usageTrials: measured.length,
      meanInputTokens: measured.length ? measured.reduce((sum, r) => sum + r.usage!.inputTokens, 0) / measured.length : null,
      meanOutputTokens: measured.length ? measured.reduce((sum, r) => sum + r.usage!.outputTokens, 0) / measured.length : null,
    }];
  }));
  return {
    suite: suite.name, suiteSha: sha(JSON.stringify(suite)),
    runDate: new Date().toISOString(), runnerId: opts.runnerId, repeat: opts.repeat,
    instructionHashes: hashes(opts.instructions),
    ...(opts.previousInstructions ? {
      previousInstructionHashes: hashes(opts.previousInstructions),
      previousPassRate: rate("previous"), revisionDelta: rate("on") - rate("previous"),
    } : {}),
    summary: summaries(results),
    perSkill: Object.fromEntries(skills.map((skill) => [skill, summaries(results.filter((r) => r.skill === skill))])),
    offPassRate: rate("off"), onPassRate: rate("on"), delta: rate("on") - rate("off"), results,
  };
}
