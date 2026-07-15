/**
 * JSON Schema export for editor tooling. `generate` writes these into
 * .skillsmith/schemas/ (drift-guarded by `check`); `init` seeds them and the
 * .vscode associations that point at them. Lives in its own module so
 * generate.ts can import it without cycling through index.ts.
 */
import { toJSONSchema } from "zod";
import { claudeCodeFrontmatterSchema } from "./claude-code-frontmatter.ts";
import { pluginManifestSchema } from "./plugin-manifest.ts";
import { marketplaceSchema } from "./marketplace.ts";
import { skillsmithConfigSchema } from "./skillsmith-config.ts";
import { evalsFileSchema } from "./evals.ts";
import { hooksFileSchema } from "./hooks.ts";

export function generateJsonSchemas(): Record<string, unknown> {
  return {
    "skill-frontmatter.schema.json": toJSONSchema(claudeCodeFrontmatterSchema),
    "plugin.schema.json": toJSONSchema(pluginManifestSchema),
    "marketplace.schema.json": toJSONSchema(marketplaceSchema),
    "skillsmith-config.schema.json": toJSONSchema(skillsmithConfigSchema),
    "evals.schema.json": toJSONSchema(evalsFileSchema),
    "hooks.schema.json": toJSONSchema(hooksFileSchema),
  };
}
