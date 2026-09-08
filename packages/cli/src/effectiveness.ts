import { join, resolve } from "node:path";
import { defineCommand } from "citty";
import { discover, effectivenessSuiteSchema, runEffectiveness, validateSkillsmithConfig, type EffectivenessRequest } from "@skillsmith/core";
import { CODEX_MODEL, CODEX_EFFORT, createCodexRunner, codexEffectivenessRunner } from "./codex-runner.ts";

export const effectivenessCmd = defineCommand({
  meta: { name: "effectiveness", description: "Compare task outcomes using a Codex subscription or custom runner" },
  args: {
    cwd: { type: "string", default: "." },
    suite: { type: "string", required: true, description: "JSON benchmark suite, relative to --cwd" },
    runner: { type: "string", description: "Optional JSON argv array for a custom runner; default: Codex ChatGPT subscription" },
    "runner-id": { type: "string", description: "Required for custom runners: harness/version, solver/grader models and settings" },
    model: { type: "string", default: CODEX_MODEL, description: "Codex solver and grader model" },
    effort: { type: "string", default: CODEX_EFFORT, description: "Codex reasoning effort" },
    repeat: { type: "string", default: "3" },
    baseline: { type: "string", description: "Previous source repo snapshot, relative to --cwd; adds a third comparison arm" },
    "timeout-ms": { type: "string", default: "300000" },
    output: { type: "string", description: "Save the complete JSON report to a file, relative to --cwd; default: stdout" },
  },
  async run({ args }) {
    const root = resolve(args.cwd);
    const suite = effectivenessSuiteSchema.parse(await Bun.file(resolve(root, args.suite)).json());
    const argv: unknown = args.runner ? JSON.parse(args.runner) : undefined;
    if (argv !== undefined && (!Array.isArray(argv) || argv.length === 0 || !argv.every((v) => typeof v === "string" && v.length > 0))) {
      throw new Error("runner must be a non-empty JSON array of strings");
    }
    if (argv && !args["runner-id"]?.trim()) throw new Error("custom runner requires --runner-id");
    if (!argv && args["runner-id"]) throw new Error("Codex runner ID is recorded automatically; --runner-id is only for custom runners");
    const timeout = Number(args["timeout-ms"]);
    if (!Number.isSafeInteger(timeout) || timeout < 1) throw new Error("timeout-ms must be a positive integer");
    const repeat = Number(args.repeat);
    if (!Number.isSafeInteger(repeat) || repeat < 1) throw new Error("repeat must be a positive integer");
    const config = validateSkillsmithConfig((await import(join(root, "skillsmith.toml"))).default,
      { path: "skillsmith.toml" });
    if (!config.value || config.diagnostics.some((d) => d.severity === "error")) throw new Error("invalid skillsmith.toml");
    const discovery = await discover(root, { allowedCategories: config.value.categories.allowed });
    if (discovery.diagnostics.some((d) => d.severity === "error")) throw new Error("fix source discovery errors before benchmarking");
    const loadInstructions = async (source: typeof discovery) => {
      if (source.diagnostics.some((d) => d.severity === "error")) throw new Error("fix source discovery errors before benchmarking");
      const instructions = new Map<string, string>();
      for (const name of new Set(suite.cases.map((c) => c.skill))) {
        const skill = source.skills.find((s) => s.name === name && !s.draft);
        if (!skill) throw new Error(`unknown or draft skill: ${name}`);
        const paths = skill.files.filter((f) => f === "SKILL.md" || f.startsWith("references/")).sort();
        instructions.set(name, (await Promise.all(paths.map(async (path) =>
          `File: ${path}\n${await Bun.file(join(skill.dir, path)).text()}`))).join("\n\n"));
      }
      return instructions;
    };
    const instructions = await loadInstructions(discovery);
    const previousInstructions = args.baseline
      ? await loadInstructions(await discover(resolve(root, args.baseline), { allowedCategories: config.value.categories.allowed }))
      : undefined;
    const codex = argv ? undefined : await createCodexRunner({ model: args.model, effort: args.effort, timeoutMs: timeout });
    const run = codex ? codexEffectivenessRunner(codex) : async (request: EffectivenessRequest) => {
        const child = Bun.spawn(argv as string[], {
          cwd: root, stdin: new Blob([JSON.stringify(request)]), stdout: "pipe", stderr: "inherit",
        });
        let timedOut = false;
        const timer = setTimeout(() => { timedOut = true; child.kill("SIGKILL"); }, timeout);
        try {
          const [output, code] = await Promise.all([new Response(child.stdout).text(), child.exited]);
          if (timedOut) throw new Error(`runner timed out after ${timeout} ms`);
          if (code !== 0) throw new Error(`runner exited ${code}`);
          return JSON.parse(output);
        } finally { clearTimeout(timer); }
      };
    let completed = 0;
    const total = suite.cases.length * repeat * (previousInstructions ? 3 : 2) * 2;
    console.error(`effectiveness: ${codex?.id ?? args["runner-id"]}; ${total} requests`);
    const report = await runEffectiveness(suite, {
      instructions, previousInstructions, runnerId: codex?.id ?? args["runner-id"]!, repeat,
      runner: async (request) => {
        const result = await run(request);
        console.error(`effectiveness: ${++completed}/${total} requests completed`);
        return result;
      },
    });
    const json = JSON.stringify(report, null, 2) + "\n";
    if (args.output) {
      await Bun.write(resolve(root, args.output), json);
      console.error(`effectiveness: wrote ${args.output}`);
    } else {
      // Do not send machine-readable reports through the CLI logging layer,
      // which truncates long console messages. Await the stream write as well.
      await new Promise<void>((done, reject) => process.stdout.write(json, (error) => error ? reject(error) : done()));
    }
  },
});
