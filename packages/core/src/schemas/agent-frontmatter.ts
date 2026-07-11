/**
 * Subagent .md frontmatter (agents/*.md).
 *
 * Profile-scoped empirical rules (June 2026):
 *  - Plugin-shipped agents may NOT declare hooks/mcpServers/permissionMode
 *    (privilege-escalation guard) → V9, error, claude-code + cowork.
 *  - Cowork importer: model "inherit" is the only value proven to install;
 *    tools arrays beyond the proven sets have been observed failing.
 *    → warnings under "cowork" with a concrete remediation.
 */
import { z } from "zod";
import {
  AGENT_COLORS,
  COWORK_PROVEN_AGENT_TOOLSETS,
  EFFORT_LEVELS,
  KEBAB_CASE,
  LIMITS,
} from "../constants.ts";
import {
  type Diagnostic,
  type ValidationResult,
  error,
  warning,
} from "../diagnostics.ts";

export const agentFrontmatterSchema = z.looseObject({
  name: z
    .string()
    .min(LIMITS.agentNameMin)
    .max(LIMITS.agentNameMax)
    .regex(KEBAB_CASE, "alnum at both ends, lowercase, hyphens"),
  description: z.string().min(1),
  model: z.string().optional(),
  effort: z.enum(EFFORT_LEVELS).optional(),
  color: z.enum(AGENT_COLORS).optional(),
  tools: z.array(z.string()).optional(),
  /** Skill names whose full content is injected at agent startup. */
  skills: z.array(z.string()).optional(),
  permissionMode: z.string().optional(),
  hooks: z.unknown().optional(),
  mcpServers: z.unknown().optional(),
});

export type AgentFrontmatter = z.infer<typeof agentFrontmatterSchema>;

export function validateAgentFrontmatter(
  raw: unknown,
  ctx: { path: string; inPlugin: boolean },
): ValidationResult<AgentFrontmatter> {
  const diagnostics: Diagnostic[] = [];
  const parsed = agentFrontmatterSchema.safeParse(raw);

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      diagnostics.push(
        error("SCHEMA", `${ctx.path}#/${issue.path.join("/")}`, issue.message),
      );
    }
    return { diagnostics };
  }

  const fm = parsed.data;

  // V9: plugin-shipped agents cannot escalate.
  if (ctx.inPlugin) {
    for (const forbidden of ["hooks", "mcpServers", "permissionMode"] as const) {
      if (fm[forbidden] !== undefined) {
        diagnostics.push(
          error(
            "V9",
            `${ctx.path}#/${forbidden}`,
            `plugin-shipped agents may not declare "${forbidden}" (privilege-escalation guard; Claude Code rejects)`,
            ["claude-code", "cowork"],
          ),
        );
      }
    }
  }

  // Cowork empirical: model.
  if (fm.model !== undefined && fm.model !== "inherit") {
    diagnostics.push(
      warning(
        "SCHEMA",
        `${ctx.path}#/model`,
        `model "${fm.model}" passes the CLI but only "inherit" is proven to install on Cowork — put model tiering in the orchestrating skill (Agent tool accepts a spawn-time override)`,
        ["cowork"],
      ),
    );
  }

  // Cowork empirical: tools.
  if (fm.tools !== undefined) {
    const matchesProven = COWORK_PROVEN_AGENT_TOOLSETS.some(
      (set) =>
        set.length === fm.tools!.length &&
        set.every((t, i) => fm.tools![i] === t),
    );
    if (!matchesProven) {
      diagnostics.push(
        warning(
          "SCHEMA",
          `${ctx.path}#/tools`,
          `tools array is outside the Cowork-proven sets (["Read"] or ["Read","Grep","Glob"]) — omit the field entirely for unrestricted access`,
          ["cowork"],
        ),
      );
    }
  }

  // Cowork requires color; warn when absent.
  if (fm.color === undefined) {
    diagnostics.push(
      warning(
        "SCHEMA",
        `${ctx.path}#/color`,
        "color is required by the Cowork importer",
        ["cowork"],
      ),
    );
  }

  // Description craft: block-scalar-with-examples is the reliable delegation
  // pattern; bare <example> under description: is the classic YAML trap. If we
  // parsed at all the YAML was valid — but flag missing examples as a warning.
  if (!/<example>/i.test(fm.description)) {
    diagnostics.push(
      warning(
        "V7",
        `${ctx.path}#/description`,
        "agent description has no <example> block — auto-delegation reliability suffers",
      ),
    );
  }

  return { value: fm, diagnostics };
}
