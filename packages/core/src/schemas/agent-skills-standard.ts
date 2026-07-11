/**
 * Layer 1 — Agent Skills open standard (agentskills.io, Dec 2025).
 * The portable, slow-moving subset. Pin: STANDARD_TARGET.
 */
import { z } from "zod";
import {
  KEBAB_CASE,
  LIMITS,
  FORBIDDEN_NAME_SUBSTRINGS,
} from "../constants.ts";
import {
  type Diagnostic,
  type ValidationResult,
  error,
  warning,
} from "../diagnostics.ts";

export const skillNameSchema = z
  .string()
  .min(1)
  .max(LIMITS.skillNameMax)
  .regex(KEBAB_CASE, "must be kebab-case (lowercase alnum, single hyphens)");

/**
 * Loose on purpose: unknown keys pass through so the Claude Code extension
 * layer (and future spec additions) never hard-fail here. Unknown-field
 * policy is decided by the extension schema, not the standard one.
 */
export const agentSkillsStandardSchema = z.looseObject({
  name: skillNameSchema,
  description: z.string().min(1).max(LIMITS.descriptionMax),
  license: z.string().optional(),
  compatibility: z.string().max(LIMITS.compatibilityMax).optional(),
  metadata: z.record(z.string(), z.string()).optional(),
  /** Experimental in the standard. */
  "allowed-tools": z.array(z.string()).optional(),
});

export type AgentSkillsStandard = z.infer<typeof agentSkillsStandardSchema>;

/**
 * Semantic checks beyond shape. Pure: filesystem context (the directory name)
 * is passed in, never read here.
 */
export function validateStandardFrontmatter(
  raw: unknown,
  ctx: { path: string; directoryName: string },
): ValidationResult<AgentSkillsStandard> {
  const diagnostics: Diagnostic[] = [];
  const parsed = agentSkillsStandardSchema.safeParse(raw);

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      diagnostics.push(
        error(
          "SCHEMA",
          `${ctx.path}#/${issue.path.join("/")}`,
          issue.message,
        ),
      );
    }
    return { diagnostics };
  }

  const fm = parsed.data;

  // V1: name must equal the containing directory name.
  if (fm.name !== ctx.directoryName) {
    diagnostics.push(
      error(
        "V1",
        `${ctx.path}#/name`,
        `skill name "${fm.name}" must equal its directory name "${ctx.directoryName}"`,
      ),
    );
  }

  // V1 (cont.): forbidden substrings.
  for (const forbidden of FORBIDDEN_NAME_SUBSTRINGS) {
    if (fm.name.includes(forbidden)) {
      diagnostics.push(
        error(
          "V1",
          `${ctx.path}#/name`,
          `skill name must not contain "${forbidden}"`,
        ),
      );
    }
  }

  // V3 (heuristic, warning): description should carry explicit trigger phrasing.
  const triggerHeuristics =
    /\b(use (this skill )?when|trigger(s|ed)? (on|when)|should be used when)\b/i;
  const quotedPhrase = /"[^"]{3,}"/;
  if (
    !triggerHeuristics.test(fm.description) &&
    !quotedPhrase.test(fm.description)
  ) {
    diagnostics.push(
      warning(
        "V3",
        `${ctx.path}#/description`,
        "description has no explicit trigger phrasing ('use when...', quoted user phrasings) — triggering reliability will suffer",
      ),
    );
  }

  return { value: fm, diagnostics };
}
