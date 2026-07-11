/**
 * skillsmith.toml — repo-level configuration (spec §2). This is OUR surface,
 * so it is strict: unknown keys are errors here, unlike the Anthropic-owned
 * schemas where unknowns warn.
 */
import { z } from "zod";
import { KEBAB_CASE, LIMITS } from "../constants.ts";
import {
  type Diagnostic,
  type ValidationResult,
  error,
} from "../diagnostics.ts";
import { authorSchema } from "./plugin-manifest.ts";

export const categoriesSchema = z.strictObject({
  /** Domain categories = skills/ subfolders. "drafts" is implicit and special. */
  allowed: z.array(z.string().regex(KEBAB_CASE)).min(1),
});

export const pluginGroupingSchema = z.strictObject({
  name: z.string().regex(KEBAB_CASE),
  "version-source": z.enum(["changesets", "manual"]).default("changesets"),
  version: z.string().optional(),
  description: z.string().optional(),
  skills: z.array(z.string()).default([]),
  agents: z.array(z.string()).default([]),
  hooks: z.array(z.string()).default([]),
  mcp: z.array(z.string()).default([]),
  commands: z.array(z.string()).default([]),
});

export const policySchema = z.strictObject({
  "max-skill-body-tokens": z
    .number()
    .int()
    .positive()
    .default(LIMITS.skillBodyMaxTokens),
  "max-listing-chars": z
    .number()
    .int()
    .positive()
    .default(LIMITS.listingCharCap),
  "min-trigger-hit-rate": z.number().min(0).max(1).default(0.85),
  "security-tier": z.enum(["strict", "standard"]).default("strict"),
  /** S2 allowlist: network-touching commands permitted under strict tier. */
  "network-allowlist": z.array(z.string()).default([]),
  /** V12: acknowledged cross-plugin composition edges, "composer->target". */
  "composition-allowlist": z.array(z.string()).default([]),
});

export const skillsmithConfigSchema = z.strictObject({
  marketplace: z.strictObject({
    name: z.string().regex(KEBAB_CASE),
    owner: authorSchema,
    description: z.string().optional(),
  }),
  categories: categoriesSchema,
  plugin: z.array(pluginGroupingSchema).min(1),
  // Zod 4: .default() bypasses parsing; .prefault() parses the fallback so
  // inner field defaults apply.
  policy: policySchema.prefault({}),
});

export type SkillsmithConfig = z.infer<typeof skillsmithConfigSchema>;

export function validateSkillsmithConfig(
  raw: unknown,
  ctx: { path: string },
): ValidationResult<SkillsmithConfig> {
  const diagnostics: Diagnostic[] = [];
  const parsed = skillsmithConfigSchema.safeParse(raw);

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      diagnostics.push(
        error("SCHEMA", `${ctx.path}#/${issue.path.join("/")}`, issue.message),
      );
    }
    return { diagnostics };
  }

  const config = parsed.data;

  // "drafts" must not be declared — it is implicit and excluded from generation.
  if (config.categories.allowed.includes("drafts")) {
    diagnostics.push(
      error(
        "V14",
        `${ctx.path}#/categories/allowed`,
        `"drafts" is implicit and must not appear in the categories allowlist`,
      ),
    );
  }

  // Plugin names must be unique.
  const seen = new Set<string>();
  config.plugin.forEach((p, i) => {
    if (seen.has(p.name)) {
      diagnostics.push(
        error(
          "SCHEMA",
          `${ctx.path}#/plugin/${i}/name`,
          `duplicate plugin grouping "${p.name}"`,
        ),
      );
    }
    seen.add(p.name);
  });

  // A skill may belong to at most one plugin grouping.
  const skillOwner = new Map<string, string>();
  for (const p of config.plugin) {
    for (const s of p.skills) {
      const owner = skillOwner.get(s);
      if (owner) {
        diagnostics.push(
          error(
            "SCHEMA",
            `${ctx.path}#/plugin`,
            `skill "${s}" is claimed by both "${owner}" and "${p.name}" — a skill belongs to exactly one plugin`,
          ),
        );
      }
      skillOwner.set(s, p.name);
    }
  }

  return { value: config, diagnostics };
}
