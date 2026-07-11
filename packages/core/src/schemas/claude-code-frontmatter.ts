/**
 * Layer 2 — Claude Code SKILL.md extensions. VOLATILE: churns per 2.1.x minor.
 * Pin: SCHEMA_TARGET. Unknown fields are WARNINGS (matching Claude Code's own
 * tolerance); --strict promotes them.
 *
 * Profile-scoped rules encoded here (empirical, June 2026):
 *  - `argument-hint` is valid Claude Code skill frontmatter (commands merged
 *    into skills) but FAILS the Cowork importer → error under "cowork".
 */
import { z } from "zod";
import { EFFORT_LEVELS, LIMITS } from "../constants.ts";
import { agentSkillsStandardSchema } from "./agent-skills-standard.ts";
import {
  type Diagnostic,
  type ValidationResult,
  error,
  warning,
} from "../diagnostics.ts";

/** Field names this schema layer knows. Everything else → unknown-field warning. */
const KNOWN_EXTENSION_FIELDS = [
  "when_to_use",
  "argument-hint",
  "arguments",
  "disable-model-invocation",
  "user-invocable",
  "disallowed-tools",
  "model",
  "effort",
  "context",
  "agent",
  "hooks",
  "paths",
  "shell",
  "version",
] as const;

const KNOWN_STANDARD_FIELDS = [
  "name",
  "description",
  "license",
  "compatibility",
  "metadata",
  "allowed-tools",
] as const;

export const claudeCodeFrontmatterSchema = agentSkillsStandardSchema.extend({
  when_to_use: z.string().optional(),
  "argument-hint": z.string().optional(),
  arguments: z.unknown().optional(),
  "disable-model-invocation": z.boolean().optional(),
  "user-invocable": z.boolean().optional(),
  "disallowed-tools": z.array(z.string()).optional(),
  model: z.string().optional(),
  effort: z.enum(EFFORT_LEVELS).optional(),
  context: z.literal("fork").optional(),
  agent: z.string().optional(),
  /** Skill-scoped hooks; shape validated by the hooks schema when present. */
  hooks: z.unknown().optional(),
  paths: z.array(z.string()).optional(),
  shell: z.string().optional(),
  /** Proven-safe optional field. */
  version: z.string().optional(),
});

export type ClaudeCodeFrontmatter = z.infer<typeof claudeCodeFrontmatterSchema>;

export function validateClaudeCodeFrontmatter(
  raw: unknown,
  ctx: { path: string },
): ValidationResult<ClaudeCodeFrontmatter> {
  const diagnostics: Diagnostic[] = [];
  const parsed = claudeCodeFrontmatterSchema.safeParse(raw);

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      diagnostics.push(
        error("SCHEMA", `${ctx.path}#/${issue.path.join("/")}`, issue.message, [
          "claude-code",
          "cowork",
        ]),
      );
    }
    return { diagnostics };
  }

  const fm = parsed.data;
  const known = new Set<string>([
    ...KNOWN_STANDARD_FIELDS,
    ...KNOWN_EXTENSION_FIELDS,
  ]);

  // Unknown-field policy: warning, never error (surface churns fast).
  for (const key of Object.keys(fm)) {
    if (!known.has(key)) {
      diagnostics.push(
        warning(
          "SCHEMA",
          `${ctx.path}#/${key}`,
          `unknown frontmatter field "${key}" — not in SCHEMA_TARGET; verify against your Claude Code version`,
          ["claude-code"],
        ),
      );
    }
  }

  // Profile split: argument-hint fails the Cowork importer.
  if (fm["argument-hint"] !== undefined) {
    diagnostics.push(
      error(
        "SCHEMA",
        `${ctx.path}#/argument-hint`,
        "argument-hint in SKILL.md frontmatter fails the Cowork importer — describe arguments in the body instead",
        ["cowork"],
      ),
    );
  }

  // Listing projection (V2): description + when_to_use share the 1536-char listing cap.
  const listingChars =
    fm.description.length + (fm.when_to_use?.length ?? 0);
  if (listingChars > LIMITS.listingCharCap) {
    diagnostics.push(
      error(
        "V2",
        `${ctx.path}#/description`,
        `listing projection ${listingChars} chars exceeds the ${LIMITS.listingCharCap}-char cap (description + when_to_use)`,
        ["claude-code"],
      ),
    );
  }

  return { value: fm, diagnostics };
}
