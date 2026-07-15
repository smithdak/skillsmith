/**
 * Eval — trigger hit-rate measurement (spec §3 `eval`, trigger suite).
 *
 * Method: reconstruct the skill LISTING as Claude Code presents it (every
 * non-draft skill's name + description in the system prompt), then for each
 * eval case ask a judge model which skill, if any, it would invoke for the
 * case's prompt. A should-trigger case passes when the judge picks the skill
 * under test; a should-not-trigger case passes when it picks anything else
 * or nothing. This measures the DESCRIPTION's selectivity against the whole
 * catalog — which is the thing that actually determines triggering — not
 * the skill in isolation.
 *
 * Determinism boundary: eval is the one intentionally non-deterministic
 * command. Its output (.skillsmith/eval-results.json) is SOURCE, not a
 * derived artifact — committed, consumed by generate for catalog badges,
 * and only changed by re-running eval. temperature 0 reduces variance but
 * does not eliminate it; results carry the judge model for that reason.
 *
 * The judge is injectable: tests use a deterministic fake; the default
 * implementation calls the Anthropic Messages API (ANTHROPIC_API_KEY).
 * Effectiveness suite (baseline on/off comparison) is deferred to v0.2.
 */
import { join } from "node:path";
import type { DiscoveryResult, DiscoveredSkill } from "./discovery.ts";
import type { SkillsmithConfig } from "./schemas/skillsmith-config.ts";
import { validateEvalsFile, type EvalsFile } from "./schemas/evals.ts";
import { canonicalJson } from "./generate.ts";
import { type Diagnostic, error } from "./diagnostics.ts";

export interface ListingEntry {
  name: string;
  description: string;
}

/** The listing as the runtime would present it: non-draft skills, sorted. */
export function buildListing(discovery: DiscoveryResult): ListingEntry[] {
  return discovery.skills
    .filter((s) => !s.draft)
    .map((s) => ({ name: s.name, description: s.frontmatter.description }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Judge contract: given the listing and a user prompt, return the name of
 * the skill that would be invoked, or null for none. Implementations must
 * return null (not throw) for "no skill applies".
 */
export type Judge = (
  listing: ListingEntry[],
  userPrompt: string,
) => Promise<string | null>;

export interface CaseResult {
  prompt: string;
  expectation: "trigger" | "no-trigger";
  judged: string | null;
  pass: boolean;
}

export interface SkillEvalResult {
  skill: string;
  cases: CaseResult[];
  hitRate: number; // passes / total
}

export interface EvalReport {
  judgeModel: string;
  results: SkillEvalResult[];
  diagnostics: Diagnostic[];
}

async function loadEvals(
  skill: DiscoveredSkill,
): Promise<{ evals?: EvalsFile; diagnostics: Diagnostic[] }> {
  const evalsRel = skill.files.find((f) => f === "evals/evals.json");
  if (!evalsRel) {
    return {
      diagnostics: [error("V8", skill.skillMdPath, "missing evals/evals.json")],
    };
  }
  try {
    const raw = JSON.parse(await Bun.file(join(skill.dir, evalsRel)).text());
    const result = validateEvalsFile(raw, { path: `${skill.skillMdPath} → ${evalsRel}` });
    return { evals: result.value, diagnostics: result.diagnostics };
  } catch (e) {
    return {
      diagnostics: [
        error("V8", `${skill.skillMdPath} → ${evalsRel}`, `invalid JSON: ${String(e)}`),
      ],
    };
  }
}

async function mapConcurrent<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]!);
    }
  });
  await Promise.all(workers);
  return results;
}

export async function runTriggerEvals(
  discovery: DiscoveryResult,
  config: SkillsmithConfig,
  opts: {
    judge: Judge;
    judgeModel: string;
    /** Restrict to one skill; default all non-draft skills with evals. */
    skill?: string;
    concurrency?: number;
  },
): Promise<EvalReport> {
  const diagnostics: Diagnostic[] = [];
  const listing = buildListing(discovery);
  const skills = discovery.skills.filter(
    (s) => !s.draft && (opts.skill === undefined || s.name === opts.skill),
  );
  if (opts.skill !== undefined && skills.length === 0) {
    diagnostics.push(error("SCHEMA", "eval", `skill "${opts.skill}" not found (or is a draft)`));
    return { judgeModel: opts.judgeModel, results: [], diagnostics };
  }

  const results: SkillEvalResult[] = [];
  for (const skill of skills) {
    const { evals, diagnostics: evalDiags } = await loadEvals(skill);
    diagnostics.push(...evalDiags);
    if (!evals) continue;

    const cases: { prompt: string; expectation: "trigger" | "no-trigger" }[] = [
      ...evals.should_trigger.map((c) => ({ prompt: c.prompt, expectation: "trigger" as const })),
      ...evals.should_not_trigger.map((c) => ({ prompt: c.prompt, expectation: "no-trigger" as const })),
    ];

    const judged = await mapConcurrent(cases, opts.concurrency ?? 4, async (c) => {
      const picked = await opts.judge(listing, c.prompt);
      const pass =
        c.expectation === "trigger" ? picked === skill.name : picked !== skill.name;
      return { prompt: c.prompt, expectation: c.expectation, judged: picked, pass };
    });

    results.push({
      skill: skill.name,
      cases: judged,
      hitRate: judged.length === 0 ? 0 : judged.filter((c) => c.pass).length / judged.length,
    });
  }

  // Threshold gating.
  const threshold = config.policy["min-trigger-hit-rate"];
  for (const r of results) {
    if (r.hitRate < threshold) {
      diagnostics.push(
        error(
          "V8",
          `skills → ${r.skill}`,
          `trigger hit-rate ${r.hitRate.toFixed(2)} below policy minimum ${threshold} (${r.cases.filter((c) => !c.pass).length} failing case(s))`,
        ),
      );
    }
  }

  results.sort((a, b) => a.skill.localeCompare(b.skill));
  return { judgeModel: opts.judgeModel, results, diagnostics };
}

/** Serialized results file: SOURCE (committed), consumed by generate/doc. */
export interface EvalResultsFile {
  judgeModel: string;
  runDate: string; // ISO date (day precision — keeps reruns on the same day byte-stable)
  skills: Record<string, { hitRate: number; cases: number; failing: number }>;
}

export function toResultsFile(report: EvalReport, runDate: string): string {
  const skills: EvalResultsFile["skills"] = {};
  for (const r of report.results) {
    skills[r.skill] = {
      hitRate: Number(r.hitRate.toFixed(3)),
      cases: r.cases.length,
      failing: r.cases.filter((c) => !c.pass).length,
    };
  }
  const file: EvalResultsFile = { judgeModel: report.judgeModel, runDate, skills };
  return canonicalJson(file);
}

// ---------------------------------------------------------------------------
// Default judge: Anthropic Messages API.
// UNVERIFIED against the live API in this build environment (no key present);
// the request shape follows the current Messages API and the response parse
// is defensive, but treat the first keyed run as the integration test.
// ---------------------------------------------------------------------------

const JUDGE_SYSTEM = `You simulate skill selection for an AI coding assistant.
You are given a list of available skills (name and description) and a user message.
Decide which single skill, if any, the assistant should invoke for that message.
Respond with ONLY a JSON object, no other text: {"skill": "<name>"} or {"skill": null}.
Pick a skill only when the message clearly matches its stated purpose and triggers; when in doubt, respond {"skill": null}.`;

export function anthropicJudge(opts: {
  apiKey: string;
  model: string;
  maxRetries?: number;
}): Judge {
  return async (listing, userPrompt) => {
    const body = JSON.stringify({
      model: opts.model,
      max_tokens: 64,
      temperature: 0,
      system: JUDGE_SYSTEM,
      messages: [
        {
          role: "user",
          content: `Available skills:\n${listing
            .map((s) => `- ${s.name}: ${s.description}`)
            .join("\n")}\n\nUser message: ${JSON.stringify(userPrompt)}`,
        },
      ],
    });

    const maxRetries = opts.maxRetries ?? 3;
    for (let attempt = 0; ; attempt++) {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": opts.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body,
      });
      if (res.status === 429 || res.status >= 500) {
        if (attempt >= maxRetries) throw new Error(`judge API ${res.status} after ${attempt} retries`);
        await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
        continue;
      }
      if (!res.ok) {
        const body = await res.text();
        throw new Error(
          `judge API ${res.status} (request-id: ${res.headers.get("request-id") ?? "none"}): ${body || "<empty body>"}`,
        );
      }
      const data = (await res.json()) as { content?: { type: string; text?: string }[] };
      const text = (data.content ?? [])
        .filter((b) => b.type === "text")
        .map((b) => b.text ?? "")
        .join("");
      const match = /\{[^}]*"skill"[^}]*\}/.exec(text);
      if (!match) return null;
      try {
        const parsed = JSON.parse(match[0]) as { skill?: string | null };
        return typeof parsed.skill === "string" ? parsed.skill : null;
      } catch {
        return null;
      }
    }
  };
}
