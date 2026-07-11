/**
 * Volatile constants as DATA (invariant I3). Every number here tracks a
 * Claude Code behavior that can change per minor release. When it does,
 * this file is the only edit.
 */

/** The Claude Code surface these schemas were verified against. */
export const SCHEMA_TARGET = "claude-code@2.1.x" as const;

/** Agent Skills open-standard spec version the standard schema tracks. */
export const STANDARD_TARGET = "agent-skills@2025-12" as const;

export const LIMITS = {
  /** Skill name max length (standard). */
  skillNameMax: 64,
  /** Skill description max length (standard). */
  descriptionMax: 1024,
  /** compatibility field max length (standard). */
  compatibilityMax: 500,
  /** Per-skill listing cap: description + when_to_use chars in the system-prompt listing. */
  listingCharCap: 1536,
  /** Recommended SKILL.md body ceiling (lines). */
  skillBodyMaxLines: 500,
  /** Default SKILL.md body ceiling (tokens) — overridable in skillsmith.toml [policy]. */
  skillBodyMaxTokens: 5000,
  /** Fraction of model context allotted to the skill listing (skillListingBudgetFraction). */
  skillListingBudgetFraction: 0.01,
  /** Compaction re-attach: first N tokens of each invoked skill are re-attached. */
  compactionReattachPerSkill: 5000,
  /** Compaction re-attach: combined budget across skills. */
  compactionReattachCombined: 25000,
  /** Agent name length bounds (empirical, Cowork importer). */
  agentNameMin: 3,
  agentNameMax: 50,
  /** Command description cap. */
  commandDescriptionMax: 60,
} as const;

/** kebab-case: lowercase alnum runs separated by single hyphens, alnum at both ends. */
export const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Substrings forbidden in skill names. */
export const FORBIDDEN_NAME_SUBSTRINGS = ["claude", "anthropic"] as const;

/** Marketplace names reserved by Anthropic. */
export const RESERVED_MARKETPLACE_NAMES = [
  "claude-plugins-official",
  "claude-plugins-community",
  "claude-code",
  "agent-skills",
  "anthropic",
  "claude",
] as const;

/**
 * Hook events per profile. VOLATILE: the Claude Code list has grown from ~9 to
 * 27–30+ across 2.1.x minors. Unknown events are WARNINGS, not errors — the
 * enum churns faster than releases of this tool.
 */
export const KNOWN_HOOK_EVENTS = {
  "claude-code": [
    "SessionStart",
    "SessionEnd",
    "Setup",
    "UserPromptSubmit",
    "UserPromptExpansion",
    "PreToolUse",
    "PostToolUse",
    "PostToolUseFailure",
    "PostToolBatch",
    "Stop",
    "StopFailure",
    "PreCompact",
    "PostCompact",
    "SubagentStart",
    "SubagentStop",
    "PermissionRequest",
    "Notification",
  ],
  cowork: [
    "PreToolUse",
    "PostToolUse",
    "Stop",
    "SubagentStop",
    "SessionStart",
    "SessionEnd",
    "UserPromptSubmit",
    "PreCompact",
    "Notification",
  ],
} as const;

/** Hook handler types (claude-code; cowork proven subset is command|prompt). */
export const HOOK_HANDLER_TYPES = [
  "command",
  "http",
  "mcp_tool",
  "prompt",
  "agent",
] as const;

/** Agent `color` values proven to install (Cowork). */
export const AGENT_COLORS = [
  "blue",
  "cyan",
  "green",
  "yellow",
  "magenta",
  "red",
] as const;

/**
 * Agent `tools` arrays proven to install on Cowork (empirical). Anything else
 * in the array: warn under the cowork profile, suggest omitting the field.
 */
export const COWORK_PROVEN_AGENT_TOOLSETS: readonly (readonly string[])[] = [
  ["Read"],
  ["Read", "Grep", "Glob"],
] as const;

/** Effort levels (Fable-5-era surface). */
export const EFFORT_LEVELS = ["low", "medium", "high", "xhigh", "max"] as const;
