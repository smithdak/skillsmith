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
 * and only changed by re-running eval. A schema-constrained single choice
 * bounds but does not eliminate variance; results carry the judge model for
 * that reason.
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
  /**
   * Fraction of repeats that passed. 1 or 0 means every repeat agreed; anything
   * between is a boundary case whose contribution to the hit rate is a coin
   * flip. With repeat 1 this is always 1 or 0 and tells you nothing — which is
   * exactly why single-run failures cannot be read as regressions.
   */
  agreement: number;
}

export interface SkillEvalResult {
  skill: string;
  cases: CaseResult[];
  hitRate: number; // passes / total
  /** sha256 of the description text this run actually measured. */
  descriptionSha: string;
}

/**
 * Hash of the exact description a run measured. Committed with the results so
 * a later validate can tell a stale number from a current one: descriptions
 * are edited far more often than evals are re-run, and a hit rate attached to
 * text that no longer exists reads as measurement while being none.
 */
export async function descriptionSha(description: string): Promise<string> {
  return sha256Text(description);
}

async function sha256Text(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * The listing exactly as the judge sees it. Exported so validate can hash the
 * current catalog the same way and compare it with what a run measured
 * against: a per-skill description hash catches a skill's own edit, but not a
 * skill being added or removed, or a neighbour's description changing — and
 * every hit rate is a measurement against the whole catalog, not the skill
 * alone.
 */
export function renderListing(listing: ListingEntry[]): string {
  return `Available skills:\n${listing.map((s) => `- ${s.name}: ${s.description}`).join("\n")}`;
}

export interface EvalReport {
  judgeModel: string;
  /** sha256 of the rendered listing every case in this run was judged against. */
  listingSha: string;
  /** Judgements per case this run used. */
  repeat: number;
  /** Total votes a split case was taken to; equals `repeat` when no escalation. */
  escalate: number;
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
    /**
     * Judge each case this many times and take the strict majority. Judges are
     * stochastic near a decision boundary, so at repeat 1 a skill's measured
     * failures are dominated by variance rather than by description quality.
     * Costs one API call per case per repeat.
     */
    repeat?: number;
    /**
     * When the initial `repeat` votes on a case are not unanimous, keep
     * judging that case until it has this many votes. Unanimous cases stop at
     * `repeat`, so the cost of resolving boundary cases is paid only on
     * boundary cases — a fraction of the suite — instead of on every case.
     * Defaults to `repeat` (no escalation).
     */
    escalate?: number;
  },
): Promise<EvalReport> {
  const diagnostics: Diagnostic[] = [];
  const listing = buildListing(discovery);
  const skills = discovery.skills.filter(
    (s) => !s.draft && (opts.skill === undefined || s.name === opts.skill),
  );
  if (opts.skill !== undefined && skills.length === 0) {
    diagnostics.push(error("SCHEMA", "eval", `skill "${opts.skill}" not found (or is a draft)`));
    return { judgeModel: opts.judgeModel, listingSha: await sha256Text(renderListing(listing)), repeat: Math.max(1, opts.repeat ?? 1), escalate: Math.max(Math.max(1, opts.repeat ?? 1), opts.escalate ?? 1), results: [], diagnostics };
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

    // Round one: `repeat` votes on every case, expanded to one task per vote
    // so concurrency stays saturated. Round two: only cases whose votes split
    // are judged up to `escalate` total. Both rounds fold per case below.
    const repeat = Math.max(1, opts.repeat ?? 1);
    const escalate = Math.max(repeat, opts.escalate ?? repeat);
    type Case = (typeof cases)[number];
    const vote = async (c: Case) => {
      const picked = await opts.judge(listing, c.prompt);
      return {
        prompt: c.prompt,
        picked,
        pass: c.expectation === "trigger" ? picked === skill.name : picked !== skill.name,
      };
    };
    const expand = (cs: Case[], n: number) => cs.flatMap((c) => Array.from({ length: n }, () => c));
    const votes = await mapConcurrent(expand(cases, repeat), opts.concurrency ?? 4, vote);
    const split = cases.filter((c) => {
      const mine = votes.filter((v) => v.prompt === c.prompt);
      const passes = mine.filter((v) => v.pass).length;
      return passes > 0 && passes < mine.length;
    });
    if (escalate > repeat && split.length > 0) {
      votes.push(...(await mapConcurrent(expand(split, escalate - repeat), opts.concurrency ?? 4, vote)));
    }
    const judged: CaseResult[] = cases.map((c) => {
      const mine = votes.filter((v) => v.prompt === c.prompt);
      const passes = mine.filter((v) => v.pass).length;
      return {
        prompt: c.prompt,
        expectation: c.expectation,
        // Strict majority: a tie counts as a failure rather than rounding a
        // coin flip up into a pass.
        pass: passes * 2 > mine.length,
        // Report a failing vote's pick when there is one. A failing vote can
        // legitimately have picked null ("none"), so this cannot use `??` —
        // that would fall through to a passing vote and misreport the failure.
        judged: (() => {
          const firstFail = mine.find((v) => !v.pass);
          return firstFail !== undefined ? firstFail.picked : mine[0]!.picked;
        })(),
        agreement: passes / mine.length,
      };
    });

    results.push({
      skill: skill.name,
      cases: judged,
      hitRate: judged.length === 0 ? 0 : judged.filter((c) => c.pass).length / judged.length,
      descriptionSha: await descriptionSha(skill.frontmatter.description),
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
  return { judgeModel: opts.judgeModel, listingSha: await sha256Text(renderListing(listing)), repeat: Math.max(1, opts.repeat ?? 1), escalate: Math.max(Math.max(1, opts.repeat ?? 1), opts.escalate ?? 1), results, diagnostics };
}

/** Serialized results file: SOURCE (committed), consumed by generate/doc. */
export interface EvalResultsFile {
  judgeModel: string;
  runDate: string; // ISO date (day precision — keeps reruns on the same day byte-stable)
  /** Judgements per case. 1 means every number here carries full judge variance. */
  repeat: number;
  /** Votes a split case was escalated to; equals `repeat` when no escalation ran. */
  escalate: number;
  /** sha256 of the listing this run measured against — see renderListing. */
  listingSha: string;
  skills: Record<
    string,
    {
      hitRate: number;
      cases: number;
      failing: number;
      /** Description measured, as a sha256 — see descriptionSha. */
      descriptionSha: string;
      /**
       * The prompts that failed, so two runs can be diffed. Boundary cases
       * flip between runs; an unchanged set across runs is a stable finding,
       * a changed set is a regression. A bare count cannot tell them apart.
       */
      failingPrompts: string[];
      /**
       * Prompts where the repeats disagreed. These sit on a decision boundary,
       * so their pass/fail is unstable regardless of which way the majority
       * fell — read them before treating any hit-rate movement as a change.
       */
      flakyPrompts: string[];
    }
  >;
}

export function toResultsFile(report: EvalReport, runDate: string): string {
  const skills: EvalResultsFile["skills"] = {};
  for (const r of report.results) {
    const failed = r.cases.filter((c) => !c.pass);
    skills[r.skill] = {
      hitRate: Number(r.hitRate.toFixed(3)),
      cases: r.cases.length,
      failing: failed.length,
      descriptionSha: r.descriptionSha,
      failingPrompts: failed.map((c) => c.prompt).sort(),
      flakyPrompts: r.cases
        .filter((c) => c.agreement > 0 && c.agreement < 1)
        .map((c) => c.prompt)
        .sort(),
    };
  }
  const file: EvalResultsFile = {
    judgeModel: report.judgeModel,
    runDate,
    repeat: report.repeat,
    escalate: report.escalate,
    listingSha: report.listingSha,
    skills,
  };
  return canonicalJson(file);
}

// ---------------------------------------------------------------------------
// Default judge: Anthropic Messages API. Structured output makes the reply
// schema-valid by construction; the listing block carries a cache breakpoint
// so a full run reads the ~8k-token prefix from cache on every call but the
// first few.
// ---------------------------------------------------------------------------

const JUDGE_SYSTEM = `You simulate skill selection for an AI coding assistant.
You are given a list of available skills (name and description) and a user message.
Decide which single skill, if any, the assistant should invoke for that message.
Return the skill's name, or null when no skill's stated purpose and triggers match the message.`;

/** Per-call token accounting, surfaced so cache reuse is observable. */
export interface JudgeUsage {
  inputTokens: number;
  cacheCreationInputTokens: number;
  cacheReadInputTokens: number;
}

export function anthropicJudge(opts: {
  apiKey: string;
  model: string;
  maxRetries?: number;
  /** Called once per completed call; the CLI totals these into a cache report. */
  onUsage?: (usage: JudgeUsage) => void;
}): Judge {
  return async (listing, userPrompt) => {
    const body = JSON.stringify({
      model: opts.model,
      // Room for a thinking preamble on models where thinking is on by
      // default; a truncated response is an error, not a "no skill" answer.
      max_tokens: 1024,
      system: JUDGE_SYSTEM,
      // Schema-enforced: the response text is guaranteed-valid JSON matching
      // this shape, so no prose instruction, stop sequence, or regex is needed.
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: { skill: { type: ["string", "null"] } },
            required: ["skill"],
            additionalProperties: false,
          },
        },
      },
      messages: [
        {
          role: "user",
          content: [
            {
              // Byte-identical on every case in a run, and the whole prefix
              // ahead of it (system + this block) is cached with it. The
              // per-case prompt lives in its own block below so it cannot
              // invalidate the prefix. Rendering is deterministic, which is
              // what keeps the bytes stable across calls.
              type: "text",
              text: renderListing(listing),
              cache_control: { type: "ephemeral" },
            },
            {
              type: "text",
              text: `User message: ${JSON.stringify(userPrompt)}`,
            },
          ],
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
      const data = (await res.json()) as {
        content?: { type: string; text?: string }[];
        stop_reason?: string;
        usage?: {
          input_tokens?: number;
          cache_creation_input_tokens?: number;
          cache_read_input_tokens?: number;
        };
      };
      opts.onUsage?.({
        inputTokens: data.usage?.input_tokens ?? 0,
        cacheCreationInputTokens: data.usage?.cache_creation_input_tokens ?? 0,
        cacheReadInputTokens: data.usage?.cache_read_input_tokens ?? 0,
      });
      if (data.stop_reason === "refusal") {
        throw new Error("judge declined the request; this case cannot be scored");
      }
      const text = (data.content ?? [])
        .filter((b) => b.type === "text")
        .map((b) => b.text ?? "")
        .join("");
      // Never fall through to null on a malformed response: null scores as a
      // PASS on every no-trigger case, so a transport fault would read as a
      // clean suite. Schema violations here are bugs, and must surface.
      const parsed = JSON.parse(text) as { skill: string | null };
      return parsed.skill;
    }
  };
}
