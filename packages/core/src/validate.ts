/**
 * Validate — quality (V) and security (S) tiers over discovered sources.
 * The schema tier already ran inside discovery (V1–V3, V9, V14 at source);
 * this module adds the rules that need file contents: bodies, scripts,
 * references, evals.
 *
 * Reads files under each skill dir; everything else is pure over inputs.
 */
import { join } from "node:path";
import { buildListing, descriptionSha, evalsFileSha, renderListing, type EvalResultsFile } from "./eval.ts";
import { statSync } from "node:fs";
import type { DiscoveredSkill, DiscoveryResult } from "./discovery.ts";
import type { SkillsmithConfig } from "./schemas/skillsmith-config.ts";
import { validateEvalsFile } from "./schemas/evals.ts";
import { validateHooksFile } from "./schemas/hooks.ts";
import { validateComposition, type CompositionEdge } from "./composition.ts";
import { LIMITS, MODEL_BEHAVIOR_TARGET } from "./constants.ts";
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

/**
 * V15 — instructions tuned against an older model generation that now invert.
 * Current models under-narrate and under-format; text written to suppress a
 * chatty model removes behavior the reader wanted.
 *
 * Two things keep this precise. The patterns require the *agent's own working
 * output* as the object, so "do not narrate entries the config already shows"
 * is not a match. And quoted spans are stripped before matching: a skill that
 * teaches these anti-patterns cites them in quotes, while a skill that commits
 * one states it plainly. That distinction is the whole difference between
 * documenting a rule and imposing it.
 */
const DATED_PROMPT_PATTERNS: [RegExp, string][] = [
  [
    /\bwork(ing)? silently\b|\bno interim (updates?|reports?)\b|\bhold (all )?(findings|results)\b|\b(do not|don't)\s+narrate\s+(your|the)?\s*(work|progress|steps?|tool|each|what you)/i,
    "update suppressor — current models under-narrate; say when user-facing text is wanted instead",
  ],
  [
    /\b(never|do not|don't|avoid)\s+(use\s+|using\s+)?(bullets?|headers?|headings?|bold|markdown|lists?)\b/i,
    "anti-formatting rule — current models under-format; say when formatting is appropriate instead",
  ],
];

/**
 * Blank out double-quoted, curly-quoted, and backticked spans so V15 sees only
 * prose the skill asserts in its own voice. Single quotes are left alone —
 * apostrophes would swallow half of every sentence. Spans may cross newlines
 * because wrapped markdown breaks quotations mid-phrase, but are length-capped
 * so an unbalanced quote blanks a clause rather than the rest of the file.
 */
function stripQuotedSpans(text: string): string {
  return text.replace(/"[^"]{0,200}"|\u201c[^\u201d]{0,200}\u201d|`[^`]{0,200}`/g, '""');
}

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
    // Windows has no POSIX mode bits (statSync reports exec only for .exe-like
    // extensions), so the check would always warn there; CI covers it on Linux.
    if (process.platform !== "win32") {
      try {
        const mode = statSync(abs).mode;
        if (isShellLike && (mode & 0o111) === 0) {
          diagnostics.push(warning("V6", `${at} → ${script}`, "script is not executable (chmod +x)"));
        }
      } catch {
        /* stat failure: file listed but unreadable — surfaced elsewhere */
      }
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

  // S4 also applies to the body and to reference files (they ship too).
  for (const [pattern, label] of SECRET_PATTERNS) {
    if (pattern.test(skill.body)) {
      diagnostics.push(error("S4", at, `possible ${label} in SKILL.md body`));
    }
  }
  for (const ref of referenceFiles) {
    const text = await Bun.file(join(skill.dir, ref)).text();
    for (const [pattern, label] of SECRET_PATTERNS) {
      if (pattern.test(text)) {
        diagnostics.push(error("S4", `${at} → ${ref}`, `possible ${label} in shipped file`));
      }
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
        `body instructs the model to show/explain its reasoning — reasoning_extraction refusal hazard on ${MODEL_BEHAVIOR_TARGET}; use structured outputs instead`,
      ),
    );
  }

  // ---- V15: dated prompting patterns across the skill's prompt surface ----
  const promptSurfaces: [string, string][] = [[at, skill.frontmatter.description + "\n" + skill.body]];
  for (const rel of skill.files) {
    if (!rel.startsWith("references/") || !rel.endsWith(".md")) continue;
    promptSurfaces.push([`${at} → ${rel}`, await Bun.file(join(skill.dir, rel)).text()]);
  }
  for (const [where, text] of promptSurfaces) {
    const prose = stripQuotedSpans(text);
    for (const [pattern, why] of DATED_PROMPT_PATTERNS) {
      const m = pattern.exec(prose);
      if (m) diagnostics.push(warning("V15", where, `"${m[0].trim()}" — ${why}`));
    }
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
  opts: {
    /**
     * Committed trigger-eval results. When present, validate re-gates on them
     * so a skill below the policy floor cannot pass the pre-PR gate just
     * because nobody re-ran `eval` — the measurement and the gate that
     * consumes it are separate commands, and only this closes the gap.
     */
    evalResults?: EvalResultsFile;
    /**
     * CHANGELOG.md contents. Undefined means "not supplied" and skips V16;
     * the CLI always supplies it (empty string when the file is absent) so a
     * deleted changelog fails loudly rather than disabling the rule.
     */
    changelog?: string;
  } = {},
): Promise<ValidateResult> {
  const diagnostics: Diagnostic[] = [...discovery.diagnostics];
  const inventories = new Map<string, ScriptInventoryEntry[]>();
  for (const skill of discovery.skills) {
    if (skill.draft) continue; // drafts: schema tier only (already ran in discovery)
    const result = await validateSkill(skill, config);
    diagnostics.push(...result.diagnostics);
    inventories.set(skill.name, result.inventory);
  }
  // ---- V8: re-gate on committed eval results (measurement lives in `eval`) ----
  if (opts.evalResults) {
    const threshold = config.policy["min-trigger-hit-rate"];
    // The whole catalog is the measurement's denominator: adding or removing a
    // skill, or editing any description, changes what every other skill was
    // judged against. The per-skill hash below cannot see that; this can.
    if (opts.evalResults.listingSha) {
      const currentListingSha = await descriptionSha(renderListing(buildListing(discovery)));
      if (currentListingSha !== opts.evalResults.listingSha) {
        diagnostics.push(
          warning(
            "V8",
            ".skillsmith/eval-results.json",
            `the skill listing has changed since the ${opts.evalResults.runDate} run (a skill added or removed, or a description edited) — every committed hit-rate was measured against a different catalog; re-run \`skillsmith eval\``,
          ),
        );
      }
    }
    for (const skill of discovery.skills) {
      if (skill.draft) continue;
      const measured = opts.evalResults.skills[skill.name];
      if (!measured) {
        diagnostics.push(
          warning(
            "V8",
            skill.skillMdPath,
            `no entry in .skillsmith/eval-results.json — triggering is unmeasured; run \`skillsmith eval\``,
          ),
        );
        continue;
      }
      // A description edited since the run leaves a number attached to text
      // that no longer exists. Descriptions change far more often than evals
      // are re-run, so without this the badge and the gate below both read as
      // measurement while measuring nothing.
      const currentSha = await descriptionSha(skill.frontmatter.description);
      if (measured.descriptionSha && measured.descriptionSha !== currentSha) {
        diagnostics.push(
          warning(
            "V8",
            skill.skillMdPath,
            `description changed since the ${opts.evalResults.runDate} eval run — the committed hit-rate measures text that no longer exists; re-run \`skillsmith eval\``,
          ),
        );
      }
      // Cases added, reworded, or reclassified since the run make the number
      // a measurement of a different suite. Results written before this field
      // existed carry no hash and are not warned about.
      if (measured.evalsSha && measured.evalsSha !== (await evalsFileSha(skill))) {
        diagnostics.push(
          warning(
            "V8",
            skill.skillMdPath,
            `evals/evals.json changed since the ${opts.evalResults.runDate} eval run — the committed hit-rate measures a different case set; re-run \`skillsmith eval\``,
          ),
        );
      }
      if (measured.hitRate < threshold) {
        diagnostics.push(
          error(
            "V8",
            skill.skillMdPath,
            `committed trigger hit-rate ${measured.hitRate.toFixed(2)} below policy minimum ${threshold} (${measured.failing} failing case(s), judge ${opts.evalResults.judgeModel}, ${opts.evalResults.runDate})`,
          ),
        );
      }
    }
  }

  // ---- V16: every shipped plugin version is described in the changelog ----
  // version-guard forces a bump when content changes; this is the other half.
  // A consumer updating a plugin sees a new version number and nothing else,
  // so a bump with no entry ships a change nobody can read.
  if (opts.changelog !== undefined) {
    for (const grouping of config.plugin) {
      const heading = `## ${grouping.name} ${grouping.version}`;
      if (!opts.changelog.includes(heading)) {
        diagnostics.push(
          warning(
            "V16",
            "CHANGELOG.md",
            `no entry for the shipped version — add a "${heading}" section describing what changed`,
          ),
        );
      }
    }
  }

  // Hook sets: schema + S3 over the file contents (discovery reads them raw).
  for (const hookSet of discovery.hookSets) {
    try {
      const raw = JSON.parse(hookSet.content);
      diagnostics.push(...validateHooksFile(raw, { path: hookSet.path }).diagnostics);
    } catch (e) {
      diagnostics.push(error("SCHEMA", hookSet.path, `invalid JSON: ${String(e)}`));
    }
  }
  const composition = validateComposition(discovery, config);
  diagnostics.push(...composition.diagnostics);
  return { diagnostics, inventories, edges: composition.edges };
}
