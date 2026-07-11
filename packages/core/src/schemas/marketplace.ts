/**
 * marketplace.json (.claude-plugin/marketplace.json at repo root). GENERATED.
 *
 * Key facts encoded: marketplace source and plugin source are pinned
 * independently; relative paths only resolve when the marketplace was added
 * via git; reserved names are blocked; external sources must be sha-pinned
 * under the strict security policy (S5).
 */
import { z } from "zod";
import { KEBAB_CASE, RESERVED_MARKETPLACE_NAMES } from "../constants.ts";
import {
  type Diagnostic,
  type ValidationResult,
  error,
  warning,
} from "../diagnostics.ts";
import { authorSchema } from "./plugin-manifest.ts";

export const githubSourceSchema = z.looseObject({
  source: z.literal("github"),
  repo: z
    .string()
    .regex(/^[\w.-]+\/[\w.-]+$/, 'must be "owner/repo"'),
  ref: z.string().optional(),
  sha: z.string().regex(/^[0-9a-f]{7,40}$/i).optional(),
});

export const urlSourceSchema = z.looseObject({
  source: z.literal("url"),
  url: z.string().url(),
  sha: z.string().regex(/^[0-9a-f]{7,40}$/i).optional(),
});

export const npmSourceSchema = z.looseObject({
  source: z.literal("npm"),
  package: z.string().min(1),
  version: z.string().optional(),
});

/** A bare string is a path relative to the marketplace repo root. */
export const pluginSourceSchema = z.union([
  z.string().min(1),
  githubSourceSchema,
  urlSourceSchema,
  npmSourceSchema,
]);

export const marketplacePluginEntrySchema = z.looseObject({
  name: z.string().min(1).regex(KEBAB_CASE),
  source: pluginSourceSchema,
  description: z.string().optional(),
});

export const marketplaceSchema = z.looseObject({
  name: z.string().min(1).regex(KEBAB_CASE),
  owner: authorSchema,
  description: z.string().optional(),
  plugins: z.array(marketplacePluginEntrySchema).min(1),
});

export type Marketplace = z.infer<typeof marketplaceSchema>;
export type PluginSource = z.infer<typeof pluginSourceSchema>;

export function validateMarketplace(
  raw: unknown,
  ctx: { path: string; securityTier?: "strict" | "standard" },
): ValidationResult<Marketplace> {
  const diagnostics: Diagnostic[] = [];
  const parsed = marketplaceSchema.safeParse(raw);

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      diagnostics.push(
        error("SCHEMA", `${ctx.path}#/${issue.path.join("/")}`, issue.message),
      );
    }
    return { diagnostics };
  }

  const marketplace = parsed.data;

  if (
    (RESERVED_MARKETPLACE_NAMES as readonly string[]).includes(marketplace.name)
  ) {
    diagnostics.push(
      error(
        "SCHEMA",
        `${ctx.path}#/name`,
        `"${marketplace.name}" is a reserved marketplace name`,
        ["claude-code"],
      ),
    );
  }

  // Duplicate plugin names.
  const seen = new Set<string>();
  marketplace.plugins.forEach((p, i) => {
    if (seen.has(p.name)) {
      diagnostics.push(
        error(
          "SCHEMA",
          `${ctx.path}#/plugins/${i}/name`,
          `duplicate plugin name "${p.name}"`,
        ),
      );
    }
    seen.add(p.name);
  });

  // S5: external sources must be sha-pinned (error under strict tier, else warning).
  marketplace.plugins.forEach((p, i) => {
    if (typeof p.source === "string") return; // relative path — internal, exempt
    if (p.source.source === "npm") return; // npm pinning is version-based
    if (!p.source.sha) {
      const make = ctx.securityTier === "strict" ? error : warning;
      diagnostics.push(
        make(
          "S5",
          `${ctx.path}#/plugins/${i}/source`,
          `external source for "${p.name}" is not sha-pinned — supply-chain risk`,
        ),
      );
    }
  });

  return { value: marketplace, diagnostics };
}
