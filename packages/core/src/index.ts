/**
 * @skillsmith/core — public API (the anti-`internal/` decision: everything
 * konstraint hides, we export).
 */
export { SCHEMA_TARGET, STANDARD_TARGET, LIMITS } from "./constants.ts";
export * from "./diagnostics.ts";

export {
  agentSkillsStandardSchema,
  skillNameSchema,
  validateStandardFrontmatter,
  type AgentSkillsStandard,
} from "./schemas/agent-skills-standard.ts";

export {
  claudeCodeFrontmatterSchema,
  validateClaudeCodeFrontmatter,
  type ClaudeCodeFrontmatter,
} from "./schemas/claude-code-frontmatter.ts";

export {
  pluginManifestSchema,
  validatePluginManifest,
  type PluginManifest,
} from "./schemas/plugin-manifest.ts";

export {
  marketplaceSchema,
  pluginSourceSchema,
  validateMarketplace,
  type Marketplace,
  type PluginSource,
} from "./schemas/marketplace.ts";

export {
  hooksFileSchema,
  validateHooksFile,
  type HooksFile,
} from "./schemas/hooks.ts";

export {
  agentFrontmatterSchema,
  validateAgentFrontmatter,
  type AgentFrontmatter,
} from "./schemas/agent-frontmatter.ts";

export {
  skillsmithConfigSchema,
  validateSkillsmithConfig,
  type SkillsmithConfig,
} from "./schemas/skillsmith-config.ts";

/**
 * JSON Schema export for editor tooling (`skillsmith init` drops .vscode
 * associations pointing at these).
 */
import { toJSONSchema } from "zod";
import { claudeCodeFrontmatterSchema } from "./schemas/claude-code-frontmatter.ts";
import { pluginManifestSchema } from "./schemas/plugin-manifest.ts";
import { marketplaceSchema } from "./schemas/marketplace.ts";
import { skillsmithConfigSchema } from "./schemas/skillsmith-config.ts";

export function generateJsonSchemas(): Record<string, unknown> {
  return {
    "skill-frontmatter.schema.json": toJSONSchema(claudeCodeFrontmatterSchema),
    "plugin.schema.json": toJSONSchema(pluginManifestSchema),
    "marketplace.schema.json": toJSONSchema(marketplaceSchema),
    "skillsmith-config.schema.json": toJSONSchema(skillsmithConfigSchema),
  };
}

export {
  discover,
  splitFrontmatter,
  type DiscoveryResult,
  type DiscoveredSkill,
  type DiscoveredAgent,
} from "./discovery.ts";
export {
  buildPlan,
  writePlan,
  plannedPaths,
  canonicalJson,
  type GeneratePlan,
} from "./generate.ts";
export { checkPlan, type CheckResult, type Drift } from "./check.ts";
export { renderCatalog } from "./catalog.ts";

export {
  validateAll,
  validateSkill,
  estimateTokens,
  type ValidateResult,
  type ScriptInventoryEntry,
} from "./validate.ts";
export { validateEvalsFile, evalsFileSchema, type EvalsFile } from "./schemas/evals.ts";
export {
  buildInitFiles,
  buildSkillScaffold,
  buildAgentScaffold,
  buildHookScaffold,
  buildMcpScaffold,
  appendPluginGrouping,
  applyScaffold,
  type InitOptions,
  type ScaffoldKind,
  type FileSet,
} from "./scaffold.ts";
export {
  buildListing,
  runTriggerEvals,
  toResultsFile,
  anthropicJudge,
  type Judge,
  type EvalReport,
  type SkillEvalResult,
  type EvalResultsFile,
  type ListingEntry,
} from "./eval.ts";
export {
  validateComposition,
  parseComposes,
  parseSeeAlso,
  type CompositionEdge,
} from "./composition.ts";
