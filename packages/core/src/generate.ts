/**
 * Generate — invariants I1/I2 made executable.
 *
 * Pure core: (DiscoveryResult, SkillsmithConfig) → GeneratePlan, a map of
 * repo-relative path → file content. Writing to disk and drift-checking are
 * thin consumers of the same plan, which is what makes `check` trustworthy:
 * it compares the SAME bytes `generate` would write.
 *
 * Determinism rules: stable JSON key order (schema-defined, not insertion),
 * sorted file lists, LF line endings, trailing newline on every text file.
 */
import { join } from "node:path";
import type { DiscoveryResult, DiscoveredSkill } from "./discovery.ts";
import type { SkillsmithConfig } from "./schemas/skillsmith-config.ts";
import type { PluginManifest } from "./schemas/plugin-manifest.ts";
import type { Marketplace } from "./schemas/marketplace.ts";
import { validatePluginManifest } from "./schemas/plugin-manifest.ts";
import { validateMarketplace } from "./schemas/marketplace.ts";
import { renderCatalog } from "./catalog.ts";
import { generateJsonSchemas } from "./schemas/json-schemas.ts";
import type { ScriptInventoryEntry } from "./validate.ts";
import type { EvalResultsFile } from "./eval.ts";
import type { CompositionEdge } from "./composition.ts";
import { type Diagnostic, error, warning } from "./diagnostics.ts";

export interface GeneratePlan {
  /** repo-relative posix path → content. Text-only in v0.1 (see copies). */
  files: Map<string, string>;
  /** Source→dest byte copies (skill assets may be binary). */
  copies: Map<string, string>;
  diagnostics: Diagnostic[];
}

/** Canonical JSON: 2-space indent, LF, trailing newline. */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(value, null, 2) + "\n";
}

function resolveVersion(
  grouping: SkillsmithConfig["plugin"][number],
  diagnostics: Diagnostic[],
): string {
  if (grouping["version-source"] === "manual") {
    if (grouping.version) return grouping.version;
    diagnostics.push(
      warning(
        "SCHEMA",
        `skillsmith.toml#/plugin/${grouping.name}`,
        `version-source "manual" but no version set — defaulting to 0.1.0`,
      ),
    );
    return "0.1.0";
  }
  // changesets: version is stamped by the release workflow; generate uses the
  // grouping's version field as the current value (changesets bumps it there).
  return grouping.version ?? "0.1.0";
}

export function buildPlan(
  discovery: DiscoveryResult,
  config: SkillsmithConfig,
  opts?: { inventories?: Map<string, ScriptInventoryEntry[]>; evalResults?: EvalResultsFile; edges?: CompositionEdge[] },
): GeneratePlan {
  const files = new Map<string, string>();
  const copies = new Map<string, string>();
  const diagnostics: Diagnostic[] = [...discovery.diagnostics];

  const skillByName = new Map(discovery.skills.map((s) => [s.name, s]));
  const agentByName = new Map(discovery.agents.map((a) => [a.name, a]));
  const hookSetByName = new Map(discovery.hookSets.map((h) => [h.name, h]));
  const mcpByName = new Map(discovery.mcpServers.map((m) => [m.name, m]));

  const shippedSkills: { skill: DiscoveredSkill; plugin: string }[] = [];

  for (const grouping of config.plugin) {
    const pluginRoot = `plugins/${grouping.name}`;
    const version = resolveVersion(grouping, diagnostics);

    // --- resolve + assemble skills ---
    const resolvedSkills: DiscoveredSkill[] = [];
    for (const name of [...grouping.skills].sort()) {
      const skill = skillByName.get(name);
      if (!skill) {
        diagnostics.push(
          error(
            "SCHEMA",
            `skillsmith.toml#/plugin/${grouping.name}/skills`,
            `skill "${name}" not found under skills/ (or failed validation)`,
          ),
        );
        continue;
      }
      if (skill.draft) {
        diagnostics.push(
          error(
            "V14",
            `skillsmith.toml#/plugin/${grouping.name}/skills`,
            `skill "${name}" is in drafts/ and cannot be shipped — promote it first`,
          ),
        );
        continue;
      }
      // metadata.skillsmith-plugin, if declared, must match the grouping.
      const declared = skill.frontmatter.metadata?.["skillsmith-plugin"];
      if (declared !== undefined && declared !== grouping.name) {
        diagnostics.push(
          error(
            "SCHEMA",
            `${skill.skillMdPath}#/metadata/skillsmith-plugin`,
            `skill declares plugin "${declared}" but grouping "${grouping.name}" claims it`,
          ),
        );
        continue;
      }
      resolvedSkills.push(skill);
      shippedSkills.push({ skill, plugin: grouping.name });

      // Copy the skill directory into the plugin (O1: copy — the repo is the
      // artifact). evals/ are dev artifacts and do not ship.
      for (const f of skill.files) {
        if (f.startsWith("evals/")) continue;
        copies.set(
          join(skill.dir, f),
          `${pluginRoot}/skills/${skill.name}/${f}`,
        );
      }
    }

    // --- agents ---
    for (const name of [...grouping.agents].sort()) {
      const agent = agentByName.get(name);
      if (!agent) {
        diagnostics.push(
          error(
            "SCHEMA",
            `skillsmith.toml#/plugin/${grouping.name}/agents`,
            `agent "${name}" not found under agents/ (or failed validation)`,
          ),
        );
        continue;
      }
      copies.set(agent.absPath, `${pluginRoot}/agents/${agent.name}.md`);
    }

    // --- hooks (v0.1 constraint: at most one hook set per plugin) ---
    if (grouping.hooks.length > 1) {
      diagnostics.push(
        error(
          "SCHEMA",
          `skillsmith.toml#/plugin/${grouping.name}/hooks`,
          `plugin has ${grouping.hooks.length} hook sets — v0.1 supports at most one per plugin (merge semantics undefined)`,
        ),
      );
    } else if (grouping.hooks.length === 1) {
      const set = hookSetByName.get(grouping.hooks[0]!);
      if (!set) {
        diagnostics.push(
          error(
            "SCHEMA",
            `skillsmith.toml#/plugin/${grouping.name}/hooks`,
            `hook set "${grouping.hooks[0]}" not found under hooks/`,
          ),
        );
      } else {
        copies.set(set.absPath, `${pluginRoot}/hooks/hooks.json`);
      }
    }

    // --- mcp servers: merge into one .mcp.json ---
    if (grouping.mcp.length > 0) {
      const merged: Record<string, unknown> = {};
      for (const name of [...grouping.mcp].sort()) {
        const server = mcpByName.get(name);
        if (!server) {
          diagnostics.push(
            error(
              "SCHEMA",
              `skillsmith.toml#/plugin/${grouping.name}/mcp`,
              `mcp server "${name}" not found under mcp/`,
            ),
          );
          continue;
        }
        try {
          const parsed = JSON.parse(server.content) as {
            mcpServers?: Record<string, unknown>;
          };
          for (const [k, v] of Object.entries(parsed.mcpServers ?? {})) {
            if (merged[k]) {
              diagnostics.push(
                error("SCHEMA", server.path, `duplicate mcp server key "${k}"`),
              );
            }
            merged[k] = v;
          }
        } catch (e) {
          diagnostics.push(
            error("SCHEMA", server.path, `invalid JSON: ${String(e)}`),
          );
        }
      }
      files.set(
        `${pluginRoot}/.mcp.json`,
        canonicalJson({ mcpServers: merged }),
      );
    }

    // --- plugin.json (schema-ordered keys) ---
    const manifest: PluginManifest = {
      name: grouping.name,
      version,
      ...(grouping.description ? { description: grouping.description } : {}),
      author: config.marketplace.owner,
      license: "MIT",
      keywords: [
        "claude-code",
        "skills",
        ...resolvedSkills
          .map((s) => s.frontmatter.metadata?.["skillsmith-category"])
          .filter((c): c is string => c !== undefined),
      ].filter((v, i, a) => a.indexOf(v) === i),
    };
    const manifestCheck = validatePluginManifest(manifest, {
      path: `${pluginRoot}/.claude-plugin/plugin.json`,
    });
    diagnostics.push(
      ...manifestCheck.diagnostics.filter((d) => d.severity === "error"),
    );
    files.set(
      `${pluginRoot}/.claude-plugin/plugin.json`,
      canonicalJson(manifest),
    );
  }

  // --- marketplace.json ---
  const marketplace: Marketplace = {
    name: config.marketplace.name,
    owner: config.marketplace.owner,
    ...(config.marketplace.description
      ? { description: config.marketplace.description }
      : {}),
    plugins: [...config.plugin]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((p) => ({
        name: p.name,
        source: `./plugins/${p.name}`,
        ...(p.description ? { description: p.description } : {}),
      })),
  };
  const marketplaceCheck = validateMarketplace(marketplace, {
    path: ".claude-plugin/marketplace.json",
    securityTier: config.policy["security-tier"],
  });
  diagnostics.push(...marketplaceCheck.diagnostics);
  files.set(".claude-plugin/marketplace.json", canonicalJson(marketplace));

  // --- catalog ---
  files.set(
    "catalog/CATALOG.md",
    renderCatalog(shippedSkills, discovery, config, opts?.inventories, opts?.evalResults, opts?.edges),
  );

  // --- editor JSON Schemas (from the zod layer; drift-guarded like any artifact) ---
  for (const [name, schema] of Object.entries(generateJsonSchemas())) {
    files.set(`.skillsmith/schemas/${name}`, canonicalJson(schema));
  }

  return { files, copies, diagnostics };
}

/** Every path the plan owns — used by check to detect stale strays. */
export function plannedPaths(plan: GeneratePlan): string[] {
  return [...plan.files.keys(), ...plan.copies.values()].sort();
}

export async function writePlan(
  plan: GeneratePlan,
  repoRoot: string,
): Promise<void> {
  for (const [path, content] of plan.files) {
    await Bun.write(join(repoRoot, path), content);
  }
  for (const [src, dest] of plan.copies) {
    await Bun.write(join(repoRoot, dest), Bun.file(src));
  }
}
