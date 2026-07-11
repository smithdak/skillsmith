/**
 * evals/evals.json — the eval cases skillsmith scaffolds and V8 enforces.
 * Format is ours (strict surface): trigger cases feed `skillsmith eval`'s
 * hit-rate measurement; effectiveness cases feed baseline comparison.
 */
import { z } from "zod";
import {
  type Diagnostic,
  type ValidationResult,
  error,
} from "../diagnostics.ts";

export const triggerCaseSchema = z.strictObject({
  prompt: z.string().min(1),
  /** Optional note about why this case exists. */
  note: z.string().optional(),
});

export const evalsFileSchema = z.strictObject({
  should_trigger: z.array(triggerCaseSchema),
  should_not_trigger: z.array(triggerCaseSchema),
  /** Baseline-comparison tasks (skill on vs off); optional in v0.1. */
  effectiveness: z
    .array(
      z.strictObject({
        task: z.string().min(1),
        success_criteria: z.string().min(1),
      }),
    )
    .default([]),
});

export type EvalsFile = z.infer<typeof evalsFileSchema>;

export const V8_MIN_CASES = 3;

export function validateEvalsFile(
  raw: unknown,
  ctx: { path: string },
): ValidationResult<EvalsFile> {
  const diagnostics: Diagnostic[] = [];
  const parsed = evalsFileSchema.safeParse(raw);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      diagnostics.push(
        error("V8", `${ctx.path}#/${issue.path.join("/")}`, issue.message),
      );
    }
    return { diagnostics };
  }
  const evals = parsed.data;
  if (evals.should_trigger.length < V8_MIN_CASES) {
    diagnostics.push(
      error(
        "V8",
        `${ctx.path}#/should_trigger`,
        `needs ≥${V8_MIN_CASES} should-trigger cases (has ${evals.should_trigger.length})`,
      ),
    );
  }
  if (evals.should_not_trigger.length < V8_MIN_CASES) {
    diagnostics.push(
      error(
        "V8",
        `${ctx.path}#/should_not_trigger`,
        `needs ≥${V8_MIN_CASES} should-not-trigger cases (has ${evals.should_not_trigger.length})`,
      ),
    );
  }
  // Placeholder prompts (from scaffolding) must not count toward the minimum —
  // structurally valid TODOs would hollow out the gate.
  for (const [group, cases] of [
    ["should_trigger", evals.should_trigger],
    ["should_not_trigger", evals.should_not_trigger],
  ] as const) {
    cases.forEach((c, i) => {
      if (/\bTODO\b/.test(c.prompt)) {
        diagnostics.push(
          error(
            "V8",
            `${ctx.path}#/${group}/${i}`,
            "placeholder eval case (contains TODO) — replace with a real user phrasing",
          ),
        );
      }
    });
  }
  return { value: evals, diagnostics };
}
