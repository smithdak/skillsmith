/**
 * @skillsmith/core — public API (the anti-`internal/` decision: everything
 * konstraint hides, we export).
 */
export { SCHEMA_TARGET, STANDARD_TARGET, MODEL_BEHAVIOR_TARGET, LIMITS } from "./constants.ts";
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
  commandFrontmatterSchema,
  validateCommandFrontmatter,
  type CommandFrontmatter,
} from "./schemas/command-frontmatter.ts";

export {
  skillsmithConfigSchema,
  validateSkillsmithConfig,
  type SkillsmithConfig,
} from "./schemas/skillsmith-config.ts";

export { generateJsonSchemas } from "./schemas/json-schemas.ts";

export {
  discover,
  splitFrontmatter,
  type DiscoveryResult,
  type DiscoveredSkill,
  type DiscoveredAgent,
  type DiscoveredCommand,
} from "./discovery.ts";
export {
  buildPlan,
  writePlan,
  plannedPaths,
  canonicalJson,
  type GeneratePlan,
} from "./generate.ts";
export { checkPlan, type CheckResult, type Drift } from "./check.ts";
export { versionGuard, pluginSnapshot, type PluginSnapshot } from "./version-guard.ts";
export { renderCatalog } from "./catalog.ts";
export {
  renderReadmeBlock,
  spliceReadmeBlock,
  BLOCK_START,
  BLOCK_END,
  type ReadmeBlockData,
  type ReadmePluginRow,
} from "./readme-blocks.ts";
export {
  genericAdapter,
  codexAdapter,
  opencodeAdapter,
  extraTargets,
  type TargetAdapter,
  type TargetContext,
  type TargetId,
} from "./targets.ts";

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
  descriptionSha,
  renderListing,
  type Judge,
  type JudgeUsage,
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
