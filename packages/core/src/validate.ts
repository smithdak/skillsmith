/**
 * Validate — quality (V) and security (S) tiers over discovered sources.
 * The schema tier already ran inside discovery (V1–V3, V9, V14 at source);
 * this module adds the rules that need file contents: bodies, scripts,
 * references, evals.
 *
 * Reads files under each skill dir; everything else is pure over inputs.
 */
import { join } from "node:path";
import { statSync } from "node:fs";
import type { DiscoveredSkill, DiscoveryResult } from "./discovery.ts";
import type { SkillsmithConfig } from "./schemas/skillsmith-config.ts";
import { validateEvalsFile } from "./schemas/evals.ts";
import { validateComposition, type CompositionEdge } from "./composition.ts";
import { LIMITS } from "./constants.ts";
import { type Diagnostic, error, warning } from "./diagnostics.ts";

/**
 * Token estimate: chars/4. HEURISTIC — good to ±15% on English/Markdown.
 * The real `budget` command will use a proper tokenizer; V4 uses this
 * deliberately so validate stays dependency-free and fast.
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export interface ScriptInventoryEntry {
  /** Path relative to the skill dir, e.g. "scripts/diff-stats.sh". */
  path: string;
  sha256: string;
  interpreter: string;
  networkTouching: boolean;
}

export interface SkillValidation {
  skill: string;
  diagnostics: Diagnostic[];
  inventory: ScriptInventoryEntry[];
}

const NETWORK_PATTERNS =
  /\b(curl|wget|fetch\s*\(|axios|http\.request|https\.request|net\.connect|XMLHttpRequest|urllib|requests\.(get|post)|Invoke-WebRequest)\b/;

const SECRET_PATTERNS: [RegExp, string][] = [
  [/-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/, "private key material"],
  [/\bAKIA[0-9A-Z]{16}\b/, "AWS access key id"],
  [/\bghp_[A-Za-z0-9]{36}\b/, "GitHub personal access token"],
  [/\bsk-ant-[A-Za-z0-9-]{20,}\b/, "Anthropic API key"],
  [/\b(api[_-]?key|secret|password)\s*[:=]\s*['"][^'"\s]{8,}['"]/i, "hardcoded credential assignment"],
];

const REASONING_EXTRACTION_PATTERNS =
  /\b(show|explain|share|reveal|display)\s+(your|the model's|its)\s+(reasoning|chain[- ]of[- ]thought|thought process)\b/i;

function interpreterOf(path: string, firstLine: string): string {
  const shebang = /^#!\s*(\S+)(?:\s+(\S+))?/.exec(firstLine);
  if (shebang) return shebang[2] ?? shebang[1]!.split("/").pop()!;
  const ext = path.split(".").pop() ?? "";
  return { sh: "sh", bash: "bash", py: "python (no shebang)", ts: "bun", js: "node", mjs: "node" }[ext] ?? "unknown";
}

async function sha256(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bytes as BufferSource);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function validateSkill(
  skill: DiscoveredSkill,
  config: SkillsmithConfig,
): Promise<SkillValidation> {
  const diagnostics: Diagnostic[] = [];
  const inventory: ScriptInventoryEntry[] = [];
  const at = skill.skillMdPath;
  const policy = config.policy;

  // ---- V4: body ceilings ----
  const lines = skill.body.split("\n").length;
  if (lines > LIMITS.skillBodyMaxLines) {
    diagnostics.push(
      error("V4", at, `body is ${lines} lines (max ${LIMITS.skillBodyMaxLines})`),
    );
  }
  const tokens = estimateTokens(skill.body);
  if (tokens > policy["max-skill-body-tokens"]) {
    diagnostics.push(
      error(
        "V4",
        at,
        `body ≈${tokens} tokens (policy max ${policy["max-skill-body-tokens"]}; chars/4 estimate)`,
      ),
    );
  }

  // ---- V5: reference depth and chains ----
  const referenceFiles = skill.files.filter((f) => f.startsWith("references/"));
  for (const ref of referenceFiles) {
    // depth: references/<file> is level 1; references/a/b is deeper.
    if (ref.split("/").length > 2) {
      diagnostics.push(
        error("V5", `${at} → ${ref}`, "reference files must be at most 1 level deep"),
      );
    }
  }
  for (const ref of referenceFiles.filter((f) => f.endsWith(".md"))) {
    const content = await Bun.file(join(skill.dir, ref)).text();
    if (/\]\(\.?\/?references\//.test(content)) {
      diagnostics.push(
        warning("V5", `${at} → ${ref}`, "reference file links to another reference (chain) — flatten"),
      );
    }
  }

  // ---- V6 + S1/S2/S4/S7: scripts ----
  const scriptFiles = skill.files.filter((f) => f.startsWith("scripts/"));
  for (const script of scriptFiles) {
    const abs = join(skill.dir, script);
    const bytes = new Uint8Array(await Bun.file(abs).arrayBuffer());
    const text = new TextDecoder().decode(bytes);
    const firstLine = text.split("\n", 1)[0] ?? "";

    // V6: executable + shebang'd (shebang required for sh/py; ts/js run via runtime)
    const isShellLike = /\.(sh|bash|py)$/.test(script);
    if (isShellLike && !firstLine.startsWith("#!")) {
      diagnostics.push(error("V6", `${at} → ${script}`, "script has no shebang"));
    }
    try {
      const mode = statSync(abs).mode;
      if (isShellLike && (mode & 0o111) === 0) {
        diagnostics.push(warning("V6", `${at} → ${script}`, "script is not executable (chmod +x)"));
      }
    } catch {
      /* stat failure: file listed but unreadable — surfaced elsewhere */
    }

    // S2: network-touching
    const networkTouching = NETWORK_PATTERNS.test(text);
    if (networkTouching && !policy["network-allowlist"].includes(script)) {
      const make = policy["security-tier"] === "strict" ? error : warning;
      diagnostics.push(
        make(
          "S2",
          `${at} → ${script}`,
          "script contains network-touching commands and is not in [policy].network-allowlist",
        ),
      );
    }

    // S4: secrets
    for (const [pattern, label] of SECRET_PATTERNS) {
      if (pattern.test(text)) {
        diagnostics.push(error("S4", `${at} → ${script}`, `possible ${label} in shipped file`));
      }
    }

    // S7: dependency manifests inside scripts/
    if (/(^|\/)package\.json$|(^|\/)requirements\.txt$/.test(script)) {
      diagnostics.push(
        warning("S7", `${at} → ${script}`, "script bundle declares dependencies — audit before shipping"),
      );
    }

    // S1: inventory entry
    inventory.push({
      path: script,
      sha256: await sha256(bytes),
      interpreter: interpreterOf(script, firstLine),
      networkTouching,
    });
  }

  // S4 also applies to the body and references.
  for (const [pattern, label] of SECRET_PATTERNS) {
    if (pattern.test(skill.body)) {
      diagnostics.push(error("S4", at, `possible ${label} in SKILL.md body`));
    }
  }

  // ---- V7: voice heuristic (warning) ----
  if (/^(I will|I'll|We will|You should now)\b/m.test(skill.body)) {
    diagnostics.push(
      warning("V7", at, "body uses first/second-person narration — prefer imperative/infinitive voice"),
    );
  }

  // ---- V10: mutually-exclusive paths heuristic (warning) ----
  const conditionalHeadings = skill.body.match(/^#{2,3}\s+(If|When)\b.*$/gim) ?? [];
  if (conditionalHeadings.length >= 3) {
    diagnostics.push(
      warning(
        "V10",
        at,
        `${conditionalHeadings.length} conditional sections — mutually-exclusive paths belong in separate reference files (token economy)`,
      ),
    );
  }

  // ---- V11: CLAUDE.md inside a skill dir ----
  if (skill.files.some((f) => f === "CLAUDE.md" || f.endsWith("/CLAUDE.md"))) {
    diagnostics.push(
      error("V11", at, "CLAUDE.md inside a skill directory is never loaded — move content into SKILL.md or references/"),
    );
  }

  // ---- V13: reasoning-extraction phrasing (warning; Fable 5 refusal hazard) ----
  if (REASONING_EXTRACTION_PATTERNS.test(skill.body)) {
    diagnostics.push(
      warning(
        "V13",
        at,
        "body instructs the model to show/explain its reasoning — reasoning_extraction refusal hazard on Fable 5; use structured outputs instead",
      ),
    );
  }

  // ---- V8: evals present and sufficient (drafts exempt) ----
  if (!skill.draft) {
    const evalsPath = skill.files.find((f) => f === "evals/evals.json");
    if (!evalsPath) {
      diagnostics.push(error("V8", at, "missing evals/evals.json"));
    } else {
      try {
        const raw = JSON.parse(await Bun.file(join(skill.dir, evalsPath)).text());
        diagnostics.push(
          ...validateEvalsFile(raw, { path: `${at} → ${evalsPath}` }).diagnostics,
        );
      } catch (e) {
        diagnostics.push(error("V8", `${at} → ${evalsPath}`, `invalid JSON: ${String(e)}`));
      }
    }
  }

  return { skill: skill.name, diagnostics, inventory };
}

export interface ValidateResult {
  diagnostics: Diagnostic[];
  /** S1: per-skill script inventories, consumed by the catalog. */
  inventories: Map<string, ScriptInventoryEntry[]>;
  /** V12: declared composition edges, consumed by the catalog. */
  edges: CompositionEdge[];
}

export async function validateAll(
  discovery: DiscoveryResult,
  config: SkillsmithConfig,
): Promise<ValidateResult> {
  const diagnostics: Diagnostic[] = [...discovery.diagnostics];
  const inventories = new Map<string, ScriptInventoryEntry[]>();
  for (const skill of discovery.skills) {
    if (skill.draft) continue; // drafts: schema tier only (already ran in discovery)
    const result = await validateSkill(skill, config);
    diagnostics.push(...result.diagnostics);
    inventories.set(skill.name, result.inventory);
  }
  const composition = validateComposition(discovery, config);
  diagnostics.push(...composition.diagnostics);
  return { diagnostics, inventories, edges: composition.edges };
}
