/**
 * Harness targets — the seam where generated output leaves
 * claude-code's plugin/marketplace layout and adapts to other agent
 * harnesses. Each adapter receives the resolved sources and appends its
 * own entries to the plan; buildPlan stays the sole orchestrator.
 *
 * Surfaces (verified against vendor docs; when a harness changes its
 * discovery rules, that change lands HERE and nowhere else):
 *
 * - generic   dist/generic/skills/<category>/<name>/ — byte-identical
 *             sources + INDEX.md; the open Agent Skills tree.
 * - codex     .codex/skills/<name>/ — project-level Codex CLI skill dir;
 *             reads the SKILL.md standard, auto-triggers on description.
 * - opencode  .opencode/skills/<name>/ — opencode project skills dir;
 *             recognized frontmatter is name/description/license/
 *             compatibility/metadata(string→string) only, so Claude-only
 *             fields are stripped instead of shipping as dead weight.
 */
import { join } from "node:path";
import type { DiscoveryResult, DiscoveredSkill } from "./discovery.ts";
import type { SkillsmithConfig } from "./schemas/skillsmith-config.ts";
import type { GeneratePlan } from "./generate.ts";
import { error } from "./diagnostics.ts";

export type TargetId = "claude-code" | "generic" | "codex" | "opencode" | "codex-plugin";

/** Harness-specific roots whose frontmatter gets normalized on emit. */
const NORMALIZED_TARGET_ROOTS: Record<string, number | null> = {
  ".codex/skills": null,
  ".opencode/skills": 1024,
};

export interface TargetContext {
  discovery: DiscoveryResult;
  config: SkillsmithConfig;
  /** Skills claimed by at least one plugin grouping, in grouping order. */
  shippedSkills: DiscoveredSkill[];
}

export interface TargetAdapter {
  id: TargetId;
  /** Append this target's files/copies to the plan. */
  emit(ctx: TargetContext, plan: GeneratePlan): void;
}

function firstSentence(description: string): string {
  const trimmed = description.trim().replace(/\s+/g, " ");
  const cut = trimmed.search(/[.!?](\s|$)/);
  return (cut === -1 ? trimmed : trimmed.slice(0, cut + 1)).slice(0, 200);
}

/**
 * Frontmatter rewrite for normalized targets: strip Claude-only keys so
 * nothing dead ships, keep the open standard's fields. Serialized by hand
 * (not a YAML library) so output bytes are stable across platforms and
 * dependency upgrades. Descriptions over a harness's documented cap get an
 * error naming both sides — silent truncation would corrupt routing.
 */
function normalizedFrontmatter(
  skill: DiscoveredSkill,
  descCap: number | null,
  diagnostics: GeneratePlan["diagnostics"],
): string {
  const desc = skill.frontmatter.description;
  if (descCap !== null && desc.length > descCap) {
    diagnostics.push(
      error(
        "SCHEMA",
        `${skill.skillMdPath}#/description`,
        `description is ${desc.length} chars; this harness caps at ${descCap} — shorten it at the source`,
      ),
    );
  }
  const lines: string[] = [
    "name: " + JSON.stringify(skill.frontmatter.name),
    "description: " + JSON.stringify(desc),
  ];
  if (skill.frontmatter.license) {
    lines.push("license: " + JSON.stringify(skill.frontmatter.license));
  }
  const meta = skill.frontmatter.metadata;
  if (meta && Object.keys(meta).length > 0) {
    lines.push("metadata:");
    for (const k of Object.keys(meta).sort()) {
      lines.push("  " + k + ": " + JSON.stringify(String(meta[k])));
    }
  }
  return "---\n" + lines.join("\n") + "\n---\n";
}

/**
 * Normalized skill dirs for harness-specific roots. SKILL.md is rebuilt
 * from discovery's parsed frontmatter + body (synchronous, no re-reads);
 * every other shipped asset (references/, scripts/) is copied
 * byte-identical. evals/ never ships.
 */
function emitNormalizedTarget(
  targetRoot: string,
  ctx: TargetContext,
  plan: GeneratePlan,
): void {
  const descCap = NORMALIZED_TARGET_ROOTS[targetRoot] ?? null;
  for (const skill of ctx.shippedSkills) {
    for (const f of skill.files) {
      if (f.startsWith("evals/")) continue;
      const dest = `${targetRoot}/${skill.name}/${f}`;
      if (f === "SKILL.md") {
        plan.files.set(
          dest,
          normalizedFrontmatter(skill, descCap, plan.diagnostics) +
            skill.body,
        );
      } else {
        plan.copies.set(dest, join(skill.dir, f));
      }
    }
  }
}

/**
 * Generic Agent Skills tree. Copies are byte-for-byte sources — no
 * frontmatter rewriting, because every listed harness consumes the same
 * core fields (name/description). Rewrites belong to the dedicated
 * adapters above when their surfaces diverge.
 */
export const genericAdapter: TargetAdapter = {
  id: "generic",
  emit(ctx, plan) {
    const root = "dist/generic/skills";
    for (const skill of ctx.shippedSkills) {
      for (const f of skill.files) {
        if (f.startsWith("evals/")) continue;
        plan.copies.set(
          `${root}/${skill.category}/${skill.name}/${f}`,
          join(skill.dir, f),
        );
      }
    }

    const lines: string[] = [
      "# Skill index (Agent Skills standard)",
      "",
      `<!-- generated by skillsmith for targets=["generic"] — do not edit; run \`skillsmith generate\` -->`,
      "",
      "Each folder below is a self-contained skill: `SKILL.md` plus optional",
      "`references/` and `scripts/`. Point any harness that reads the",
      "SKILL.md standard at `dist/generic/skills/`, or copy individual",
      "folders into its skills directory.",
      "",
      "| Skill | Category | Description |",
      "|---|---|---|",
    ];
    const sorted = [...ctx.shippedSkills].sort((a, b) =>
      a.name < b.name ? -1 : a.name > b.name ? 1 : 0,
    );
    for (const s of sorted) {
      lines.push(
        `| \`${s.name}\` | ${s.category} | ${firstSentence(
          s.frontmatter.description.replace(/\|/g, "\\|"),
        )} |`,
      );
    }
    plan.files.set("dist/generic/INDEX.md", lines.join("\n") + "\n");
  },
};

export const codexAdapter: TargetAdapter = {
  id: "codex",
  emit(ctx, plan) {
    emitNormalizedTarget(".codex/skills", ctx, plan);
  },
};

export const opencodeAdapter: TargetAdapter = {
  id: "opencode",
  emit(ctx, plan) {
    emitNormalizedTarget(".opencode/skills", ctx, plan);
  },
};

/** Native, independently installable bundles; no implicit conversion of host-specific agents or hooks. */
export const codexPluginAdapter: TargetAdapter = {
  id: "codex-plugin",
  emit(ctx, plan) {
    const json = (value: unknown) => JSON.stringify(value, null, 2) + "\n";
    const entries: object[] = [];
    for (const grouping of ctx.config.plugin) {
      const root = `dist/codex/plugins/${grouping.name}`;
      const skills = ctx.shippedSkills.filter((s) => grouping.skills.includes(s.name));
      const mcp = plan.files.get(`plugins/${grouping.name}/.mcp.json`);
      // Agent/command/hook-only Claude plugins have no supported Codex payload.
      if (!skills.length && !mcp) continue;
      for (const file of ctx.discovery.legalFiles ?? []) {
        plan.copies.set(`${root}/${file.path}`, file.absPath);
      }
      emitNormalizedTarget(`${root}/skills`, { ...ctx, shippedSkills: skills }, plan);
      if (mcp) plan.files.set(`${root}/.mcp.json`, mcp);
      const title = grouping.name.split("-").map((w) => w[0]!.toUpperCase() + w.slice(1)).join(" ");
      const description = grouping.description || `${title} skills`;
      plan.files.set(`${root}/.codex-plugin/plugin.json`, json({
        name: grouping.name, version: grouping.version ?? "0.1.0", description,
        author: ctx.config.marketplace.owner,
        ...(skills.length ? { skills: "./skills/" } : {}),
        ...(mcp ? { mcpServers: "./.mcp.json" } : {}),
        interface: {
          displayName: title, shortDescription: description.slice(0, 100), longDescription: description,
          developerName: ctx.config.marketplace.owner.name, category: "Productivity",
          capabilities: [], defaultPrompt: `Help me choose a ${grouping.name} skill for my task.`,
        },
      }));
      plan.files.set(`${root}/README.md`, [
        `# ${title}`, "", description, "",
        "This bundle contains portable skills and their scripts and references. Each skill can also be copied individually.",
        "Open the selected SKILL.md for inputs, resource paths, and verification. Companion skills are optional unless stated otherwise.", "",
        "| Skill | Instructions |", "|---|---|",
        ...skills.map((s) => `| ${s.name} | [SKILL.md](skills/${s.name}/SKILL.md) |`), "",
        "Model effectiveness is measured separately from packaging compatibility. See the repository's benchmark reports before inferring a quality improvement.", "",
        ...(grouping.agents.length || grouping.commands.length || grouping.hooks.length ? [
          "Claude-specific agents, commands, and hooks are available in the Claude Code distribution; this bundle does not translate them.", "",
        ] : []),
      ].join("\n"));
      entries.push({
        name: grouping.name, source: { source: "local", path: `./plugins/${grouping.name}` },
        policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" }, category: "Productivity",
      });
    }
    plan.files.set("dist/codex/.agents/plugins/marketplace.json", json({
      name: ctx.config.marketplace.name,
      interface: { displayName: ctx.config.marketplace.name }, plugins: entries,
    }));
  },
};

const adapters: Record<Exclude<TargetId, "claude-code">, TargetAdapter> = {
  generic: genericAdapter,
  codex: codexAdapter,
  opencode: opencodeAdapter,
  "codex-plugin": codexPluginAdapter,
};

/** Extra targets requested by config, in config order, deduped. */
export function extraTargets(config: SkillsmithConfig): TargetAdapter[] {
  const seen = new Set<string>();
  const out: TargetAdapter[] = [];
  for (const id of config.targets) {
    if (id === "claude-code") continue;
    if (seen.has(id)) continue;
    seen.add(id);
    const adapter = adapters[id];
    if (adapter) out.push(adapter);
  }
  return out;
}
