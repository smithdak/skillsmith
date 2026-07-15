/**
 * Discovery — scans the monorepo's SOURCE OF TRUTH directories and returns
 * parsed, validated source objects. Glob-based everywhere (taxonomy rule:
 * introducing subfolders later requires zero tooling change).
 *
 * Filesystem reads happen here and only here; generate/check are pure over
 * the returned structures.
 */
import { join, relative, sep } from "node:path";
import {
  type Diagnostic,
  type ValidationResult,
  error,
} from "./diagnostics.ts";
import {
  validateClaudeCodeFrontmatter,
  type ClaudeCodeFrontmatter,
} from "./schemas/claude-code-frontmatter.ts";
import { validateStandardFrontmatter } from "./schemas/agent-skills-standard.ts";
import {
  validateAgentFrontmatter,
  type AgentFrontmatter,
} from "./schemas/agent-frontmatter.ts";

export interface FrontmatterDoc<T> {
  frontmatter: T;
  body: string;
}

/** Split a markdown doc into YAML frontmatter + body. */
export function splitFrontmatter(
  content: string,
  path: string,
): ValidationResult<FrontmatterDoc<unknown>> {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(content);
  if (!match) {
    return {
      diagnostics: [error("SCHEMA", path, "missing YAML frontmatter block")],
    };
  }
  try {
    const frontmatter = Bun.YAML.parse(match[1]!);
    return { value: { frontmatter, body: match[2] ?? "" }, diagnostics: [] };
  } catch (e) {
    return {
      diagnostics: [
        error("SCHEMA", path, `frontmatter is not valid YAML: ${String(e)}`),
      ],
    };
  }
}

export interface DiscoveredSkill {
  /** e.g. "code-review" */
  name: string;
  /** Domain category derived from the parent folder, e.g. "engineering". */
  category: string;
  /** true when under skills/drafts/ — excluded from generation. */
  draft: boolean;
  /** Absolute path to the skill directory. */
  dir: string;
  /** Repo-relative path to SKILL.md (forward slashes). */
  skillMdPath: string;
  frontmatter: ClaudeCodeFrontmatter;
  body: string;
  /** Repo-relative paths of every file in the skill dir (sorted). */
  files: string[];
}

export interface DiscoveredAgent {
  name: string;
  /** Repo-relative path. */
  path: string;
  /** Absolute path (copy source). */
  absPath: string;
  frontmatter: AgentFrontmatter;
  body: string;
}

export interface DiscoveredHookSet {
  name: string;
  path: string;
  /** Absolute path (copy source). */
  absPath: string;
  content: string;
}

export interface DiscoveredMcpServer {
  name: string;
  path: string;
  content: string;
}

export interface DiscoveryResult {
  skills: DiscoveredSkill[];
  agents: DiscoveredAgent[];
  hookSets: DiscoveredHookSet[];
  mcpServers: DiscoveredMcpServer[];
  diagnostics: Diagnostic[];
}

const posix = (p: string) => p.split(sep).join("/");

export async function discover(repoRoot: string, opts: {
  allowedCategories: readonly string[];
  /** V2 cap override from [policy]."max-listing-chars"; defaults to LIMITS.listingCharCap. */
  listingCharCap?: number;
}): Promise<DiscoveryResult> {
  const diagnostics: Diagnostic[] = [];
  const skills: DiscoveredSkill[] = [];
  const agents: DiscoveredAgent[] = [];
  const hookSets: DiscoveredHookSet[] = [];
  const mcpServers: DiscoveredMcpServer[] = [];

  // --- skills/**/SKILL.md ---
  const skillGlob = new Bun.Glob("skills/*/*/SKILL.md");
  for await (const rel of skillGlob.scan({ cwd: repoRoot })) {
    const relPath = posix(rel);
    const parts = relPath.split("/"); // skills/<category>/<name>/SKILL.md
    const category = parts[1]!;
    const dirName = parts[2]!;
    const draft = category === "drafts";

    if (!draft && !opts.allowedCategories.includes(category)) {
      diagnostics.push(
        error(
          "V14",
          relPath,
          `category folder "${category}" is not in the [categories] allowlist`,
        ),
      );
    }

    const content = await Bun.file(join(repoRoot, rel)).text();
    const split = splitFrontmatter(content, relPath);
    if (!split.value) {
      diagnostics.push(...split.diagnostics);
      continue;
    }

    // Drafts: schema tier only (lenient) — skip V-rules, still must parse.
    const ccResult = validateClaudeCodeFrontmatter(split.value.frontmatter, {
      path: relPath,
      listingCharCap: opts.listingCharCap,
    });
    if (!ccResult.value) {
      diagnostics.push(...ccResult.diagnostics);
      continue;
    }
    if (!draft) {
      diagnostics.push(...ccResult.diagnostics);
      const stdResult = validateStandardFrontmatter(split.value.frontmatter, {
        path: relPath,
        directoryName: dirName,
      });
      diagnostics.push(...stdResult.diagnostics);

      // V14: frontmatter category, if present, must equal the folder.
      const declared = ccResult.value.metadata?.["skillsmith-category"];
      if (declared !== undefined && declared !== category) {
        diagnostics.push(
          error(
            "V14",
            `${relPath}#/metadata/skillsmith-category`,
            `declared category "${declared}" must equal folder category "${category}" (or be omitted for auto-derivation)`,
          ),
        );
      }
    }

    // Enumerate the skill's files (for assembly), sorted for determinism.
    const skillDirRel = parts.slice(0, 3).join("/");
    const files: string[] = [];
    const fileGlob = new Bun.Glob("**/*");
    for await (const f of fileGlob.scan({
      cwd: join(repoRoot, skillDirRel),
      onlyFiles: true,
    })) {
      files.push(posix(f));
    }
    files.sort();

    skills.push({
      name: ccResult.value.name,
      category,
      draft,
      dir: join(repoRoot, skillDirRel),
      skillMdPath: relPath,
      frontmatter: ccResult.value,
      body: split.value.body,
      files,
    });
  }

  // --- agents/**/*.md ---
  const agentGlob = new Bun.Glob("agents/**/*.md");
  for await (const rel of agentGlob.scan({ cwd: repoRoot })) {
    const relPath = posix(rel);
    const content = await Bun.file(join(repoRoot, rel)).text();
    const split = splitFrontmatter(content, relPath);
    if (!split.value) {
      diagnostics.push(...split.diagnostics);
      continue;
    }
    // Source-side check with inPlugin=true: these agents are destined for
    // plugin assembly, so the plugin restrictions apply at the source.
    const result = validateAgentFrontmatter(split.value.frontmatter, {
      path: relPath,
      inPlugin: true,
    });
    diagnostics.push(...result.diagnostics);
    if (result.value) {
      agents.push({
        name: result.value.name,
        path: relPath,
        absPath: join(repoRoot, rel),
        frontmatter: result.value,
        body: split.value.body,
      });
    }
  }

  // --- hooks/<set>/hooks.json ---
  const hookGlob = new Bun.Glob("hooks/*/hooks.json");
  for await (const rel of hookGlob.scan({ cwd: repoRoot })) {
    const relPath = posix(rel);
    hookSets.push({
      name: relPath.split("/")[1]!,
      path: relPath,
      absPath: join(repoRoot, rel),
      content: await Bun.file(join(repoRoot, rel)).text(),
    });
  }

  // --- mcp/<name>.mcp.json ---
  const mcpGlob = new Bun.Glob("mcp/*.mcp.json");
  for await (const rel of mcpGlob.scan({ cwd: repoRoot })) {
    const relPath = posix(rel);
    mcpServers.push({
      name: relPath.split("/")[1]!.replace(/\.mcp\.json$/, ""),
      path: relPath,
      content: await Bun.file(join(repoRoot, rel)).text(),
    });
  }

  skills.sort((a, b) => a.name.localeCompare(b.name));
  agents.sort((a, b) => a.name.localeCompare(b.name));
  hookSets.sort((a, b) => a.name.localeCompare(b.name));
  mcpServers.sort((a, b) => a.name.localeCompare(b.name));

  return { skills, agents, hookSets, mcpServers, diagnostics };
}

export { relative as _relative };
