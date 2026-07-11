#!/usr/bin/env bun
/**
 * skillsmith — thin CLI over @skillsmith/core (spec §3). Zero logic here:
 * load config, call core, render diagnostics, exit-code semantics.
 */
import { defineCommand, runMain } from "citty";
import { join } from "node:path";
import {
  discover,
  buildPlan,
  writePlan,
  checkPlan,
  validateAll,
  validateSkillsmithConfig,
  buildInitFiles,
  buildSkillScaffold,
  buildAgentScaffold,
  buildHookScaffold,
  buildMcpScaffold,
  appendPluginGrouping,
  applyScaffold,
  runTriggerEvals,
  toResultsFile,
  anthropicJudge,
  type EvalResultsFile,
  forProfile,
  exitCode,
  type Diagnostic,
  type Profile,
  SCHEMA_TARGET,
} from "@skillsmith/core";

async function loadEvalResults(repoRoot: string): Promise<EvalResultsFile | undefined> {
  const f = Bun.file(join(repoRoot, ".skillsmith/eval-results.json"));
  if (!(await f.exists())) return undefined;
  try {
    return JSON.parse(await f.text()) as EvalResultsFile;
  } catch {
    console.error("skillsmith: .skillsmith/eval-results.json is invalid JSON — ignoring");
    return undefined;
  }
}

async function loadConfig(repoRoot: string) {
  const configPath = join(repoRoot, "skillsmith.toml");
  if (!(await Bun.file(configPath).exists())) {
    console.error(`skillsmith: no skillsmith.toml at ${repoRoot}`);
    process.exit(2);
  }
  const raw = (await import(configPath)).default;
  const result = validateSkillsmithConfig(raw, { path: "skillsmith.toml" });
  if (!result.value) {
    printDiagnostics(result.diagnostics, "claude-code");
    process.exit(2);
  }
  return result.value;
}

function printDiagnostics(diagnostics: Diagnostic[], profile: Profile) {
  for (const d of forProfile(diagnostics, profile)) {
    const tag = d.severity === "error" ? "ERROR" : "WARN ";
    console.error(`${tag} [${d.rule}] ${d.path}: ${d.message}`);
  }
}

const sharedArgs = {
  cwd: { type: "string" as const, description: "repo root", default: "." },
  profile: {
    type: "string" as const,
    description: "target validator profile: claude-code | cowork | standard",
    default: "claude-code",
  },
  strict: { type: "boolean" as const, description: "promote warnings to failures", default: false },
  json: { type: "boolean" as const, description: "machine-readable output", default: false },
};

const generateCmd = defineCommand({
  meta: { name: "generate", description: "Emit all derived artifacts (plugins/, marketplace.json, catalog/) from sources" },
  args: { ...sharedArgs, "dry-run": { type: "boolean", description: "print the plan without writing", default: false } },
  async run({ args }) {
    const repoRoot = join(process.cwd(), args.cwd);
    const profile = args.profile as Profile;
    const config = await loadConfig(repoRoot);
    const discovery = await discover(repoRoot, { allowedCategories: config.categories.allowed });
    const { inventories, edges } = await validateAll(discovery, config);
    const evalResults = await loadEvalResults(repoRoot);
    const plan = buildPlan(discovery, config, { inventories, evalResults, edges });
    printDiagnostics(plan.diagnostics, profile);
    const code = exitCode(plan.diagnostics, { strict: args.strict, profile });
    if (code !== 0) process.exit(code);

    if (args["dry-run"]) {
      const paths = [...plan.files.keys(), ...plan.copies.values()].sort();
      if (args.json) console.log(JSON.stringify({ plan: paths }, null, 2));
      else for (const p of paths) console.log(p);
      return;
    }
    await writePlan(plan, repoRoot);
    console.error(`skillsmith: generated ${plan.files.size + plan.copies.size} files (${SCHEMA_TARGET})`);
  },
});

const checkCmd = defineCommand({
  meta: { name: "check", description: "CI drift gate: fail if committed artifacts differ from what generate would write" },
  args: { cwd: sharedArgs.cwd, json: sharedArgs.json },
  async run({ args }) {
    const repoRoot = join(process.cwd(), args.cwd);
    const config = await loadConfig(repoRoot);
    const discovery = await discover(repoRoot, { allowedCategories: config.categories.allowed });
    const { inventories, edges } = await validateAll(discovery, config);
    const evalResults = await loadEvalResults(repoRoot);
    const plan = buildPlan(discovery, config, { inventories, evalResults, edges });

    // Source errors make drift meaningless — fail hard first.
    const sourceErrors = plan.diagnostics.filter((d) => d.severity === "error");
    if (sourceErrors.length > 0) {
      printDiagnostics(sourceErrors, "claude-code");
      process.exit(1);
    }

    const result = await checkPlan(plan, repoRoot);
    if (args.json) {
      console.log(JSON.stringify(result, null, 2));
    } else if (!result.clean) {
      for (const d of result.drifts) console.error(`DRIFT ${d.kind.padEnd(8)} ${d.path}`);
      console.error(`\nskillsmith check: ${result.drifts.length} drift(s) — run \`skillsmith generate\` and commit`);
    } else {
      console.error("skillsmith check: clean");
    }
    process.exit(result.clean ? 0 : 1);
  },
});

const validateCmd = defineCommand({
  meta: { name: "validate", description: "Run schema + quality (V) + security (S) tiers over all sources" },
  args: {
    ...sharedArgs,
    tier: {
      type: "string" as const,
      description: "all | schema | quality | security",
      default: "all",
    },
  },
  async run({ args }) {
    const repoRoot = join(process.cwd(), args.cwd);
    const profile = args.profile as Profile;
    const config = await loadConfig(repoRoot);
    const discovery = await discover(repoRoot, { allowedCategories: config.categories.allowed });
    const { diagnostics } = await validateAll(discovery, config);

    const tierOf = (rule: string) =>
      rule.startsWith("S") ? "security" : rule === "SCHEMA" ? "schema" : "quality";
    const filtered =
      args.tier === "all" ? diagnostics : diagnostics.filter((d) => tierOf(d.rule) === args.tier);

    if (args.json) {
      console.log(JSON.stringify({ diagnostics: forProfile(filtered, profile) }, null, 2));
    } else {
      printDiagnostics(filtered, profile);
      const relevant = forProfile(filtered, profile);
      const errors = relevant.filter((d) => d.severity === "error").length;
      const warns = relevant.filter((d) => d.severity === "warning").length;
      console.error(`skillsmith validate: ${errors} error(s), ${warns} warning(s) [tier=${args.tier}, profile=${profile}]`);
    }
    process.exit(exitCode(filtered, { strict: args.strict, profile }));
  },
});

const initCmd = defineCommand({
  meta: { name: "init", description: "Bootstrap a skills monorepo (fills gaps in non-empty dirs; never overwrites)" },
  args: {
    cwd: sharedArgs.cwd,
    name: { type: "string" as const, description: "marketplace name (kebab-case)", default: "my-marketplace" },
    owner: { type: "string" as const, description: "owner name", default: "" },
    categories: { type: "string" as const, description: "comma-separated domain categories", default: "engineering,productivity,misc" },
  },
  async run({ args }) {
    const repoRoot = join(process.cwd(), args.cwd);
    const owner = args.owner || process.env.USER || "owner";
    const files = buildInitFiles({
      marketplaceName: args.name,
      ownerName: owner,
      categories: args.categories.split(",").map((c: string) => c.trim()).filter(Boolean),
    });
    const result = await applyScaffold(files, repoRoot, { errorOnExisting: false });
    for (const p of result.written) console.error(`  create ${p}`);
    for (const p of result.skipped) console.error(`  skip   ${p} (exists)`);
    console.error(`\nskillsmith init: ${result.written.length} created, ${result.skipped.length} skipped`);
    console.error(`next: skillsmith scaffold skill <name>`);
  },
});

const scaffoldCmd = defineCommand({
  meta: { name: "scaffold", description: "Scaffold a skill | agent | hook | mcp | plugin" },
  args: {
    cwd: sharedArgs.cwd,
    kind: { type: "positional" as const, description: "skill | agent | hook | mcp | plugin", required: true },
    name: { type: "positional" as const, description: "kebab-case name", required: true },
    category: { type: "string" as const, description: "(skill) target category; defaults to drafts — promotion is when gates bind", default: "drafts" },
    description: { type: "string" as const, description: "(plugin) description", default: "" },
  },
  async run({ args }) {
    const repoRoot = join(process.cwd(), args.cwd);
    const name = args.name as string;
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
      console.error(`skillsmith scaffold: "${name}" is not kebab-case`);
      process.exit(2);
    }
    try {
      switch (args.kind) {
        case "skill": {
          const r = await applyScaffold(buildSkillScaffold(name, args.category), repoRoot, { errorOnExisting: true });
          for (const p of r.written) console.error(`  create ${p}`);
          if (args.category === "drafts")
            console.error(`\nscaffolded in drafts/ (lenient). Promote to a domain category when evals are real.`);
          break;
        }
        case "agent": {
          const r = await applyScaffold(buildAgentScaffold(name), repoRoot, { errorOnExisting: true });
          for (const p of r.written) console.error(`  create ${p}`);
          break;
        }
        case "hook": {
          const r = await applyScaffold(buildHookScaffold(name), repoRoot, { errorOnExisting: true });
          for (const p of r.written) console.error(`  create ${p}`);
          break;
        }
        case "mcp": {
          const r = await applyScaffold(buildMcpScaffold(name), repoRoot, { errorOnExisting: true });
          for (const p of r.written) console.error(`  create ${p}`);
          break;
        }
        case "plugin": {
          const tomlPath = join(repoRoot, "skillsmith.toml");
          const source = await Bun.file(tomlPath).text();
          if (new RegExp(`name = "${name}"`).test(source)) {
            console.error(`skillsmith scaffold: plugin "${name}" already in skillsmith.toml`);
            process.exit(2);
          }
          await Bun.write(tomlPath, appendPluginGrouping(source, name, args.description || undefined));
          console.error(`  update skillsmith.toml (+ [[plugin]] ${name})`);
          break;
        }
        default:
          console.error(`skillsmith scaffold: unknown kind "${args.kind}" (skill | agent | hook | mcp | plugin)`);
          process.exit(2);
      }
    } catch (e) {
      console.error(`skillsmith scaffold: ${e instanceof Error ? e.message : String(e)}`);
      process.exit(2);
    }
  },
});

const evalCmd = defineCommand({
  meta: { name: "eval", description: "Measure trigger hit-rate per skill against the full catalog listing (writes .skillsmith/eval-results.json)" },
  args: {
    ...sharedArgs,
    skill: { type: "positional" as const, description: "restrict to one skill", required: false },
    model: { type: "string" as const, description: "judge model", default: "claude-sonnet-4-6" },
    concurrency: { type: "string" as const, description: "parallel judge calls", default: "4" },
  },
  async run({ args }) {
    const repoRoot = join(process.cwd(), args.cwd);
    const profile = args.profile as Profile;
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("skillsmith eval: ANTHROPIC_API_KEY is not set — trigger evals require API access");
      process.exit(2);
    }
    const config = await loadConfig(repoRoot);
    const discovery = await discover(repoRoot, { allowedCategories: config.categories.allowed });
    const report = await runTriggerEvals(discovery, config, {
      judge: anthropicJudge({ apiKey, model: args.model }),
      judgeModel: args.model,
      skill: args.skill as string | undefined,
      concurrency: Number(args.concurrency),
    });

    for (const r of report.results) {
      const failing = r.cases.filter((c) => !c.pass);
      console.error(`${r.skill}: ${(r.hitRate * 100).toFixed(0)}% (${r.cases.length - failing.length}/${r.cases.length})`);
      for (const c of failing) {
        console.error(`  FAIL [expected ${c.expectation}] "${c.prompt}" → judged: ${c.judged ?? "none"}`);
      }
    }
    printDiagnostics(report.diagnostics, profile);

    // Full runs update the committed results file; single-skill runs don't
    // (a partial file would misrepresent the catalog badges).
    if (args.skill === undefined && report.results.length > 0) {
      const runDate = new Date().toISOString().slice(0, 10);
      await Bun.write(join(repoRoot, ".skillsmith/eval-results.json"), toResultsFile(report, runDate));
      console.error(`\nwrote .skillsmith/eval-results.json — run skillsmith generate to refresh catalog badges`);
    }
    process.exit(exitCode(report.diagnostics, { strict: args.strict, profile }));
  },
});

const main = defineCommand({
  meta: {
    name: "skillsmith",
    version: "0.1.0",
    description: `Generate, validate, and drift-check Claude Code skill monorepos (${SCHEMA_TARGET})`,
  },
  subCommands: { init: initCmd, scaffold: scaffoldCmd, generate: generateCmd, check: checkCmd, validate: validateCmd, eval: evalCmd },
});

runMain(main);
