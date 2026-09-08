import { expect, test } from "bun:test";
import { access } from "node:fs/promises";
import { createCodexRunner, codexEffectivenessRunner, codexJudge, subscriptionEnv } from "../src/codex-runner.ts";

type Execute = NonNullable<Parameters<typeof createCodexRunner>[0]>["execute"];

function fixture(options: { auth?: string; event?: object; code?: number } = {}) {
  const calls: { argv: string[]; cwd: string; input: string }[] = [];
  let answer: object = { output: "evidence" };
  const execute: Execute = async (argv, opts) => {
    calls.push({ argv, ...opts });
    if (argv.includes("login")) return { code: 0, stdout: "", stderr: options.auth ?? "Logged in using ChatGPT" };
    if (argv.includes("--version")) return { code: 0, stdout: "codex-cli fixture", stderr: "" };
    await Bun.write(argv[argv.indexOf("--output-last-message") + 1]!, JSON.stringify(answer));
    const events = [
      { type: "item.completed", item: { type: "agent_message", text: JSON.stringify(answer) } },
      options.event ?? { type: "turn.completed", usage: { input_tokens: 120, output_tokens: 20 } },
    ];
    return { code: options.code ?? 0, stdout: events.map((event) => JSON.stringify(event)).join("\n"), stderr: "fixture error" };
  };
  return { execute, calls, answer: (value: object) => { answer = value; } };
}

test("subscription runner rejects API auth before starting an eval or changing auth", async () => {
  const f = fixture({ auth: "Logged in using an API key" });
  await expect(createCodexRunner({ execute: f.execute })).rejects.toThrow("API-key login is not accepted");
  expect(f.calls).toHaveLength(1);
  const env = subscriptionEnv({ PATH: "/bin", HOME: "/user", OPENAI_API_KEY: "secret", OPENAI_BASE_URL: "https://other.invalid", CODEX_API_KEY: "secret", ANTHROPIC_API_KEY: "secret" });
  expect(env).toEqual({ PATH: "/bin", HOME: "/user" });
});

test("solve and grade use distinct cleaned workspaces, schema outputs and subscription settings", async () => {
  const f = fixture();
  const runner = await createCodexRunner({ execute: f.execute });
  const evaluate = codexEffectivenessRunner(runner);
  expect(runner.id).toContain("gpt-6-astra; effort=medium; cli=codex-cli fixture");
  expect(await evaluate({ operation: "solve", task: "Task", instructions: "Skill content" })).toEqual({ output: "evidence", usage: { inputTokens: 120, outputTokens: 20 } });
  f.answer({ criteria: [{ pass: true, reason: "evidence" }] });
  await evaluate({ operation: "grade", task: "Task", success_criteria: ["rubric"], output: "answer" });
  const [solve, grade] = f.calls.slice(2);
  expect(solve!.cwd).not.toBe(grade!.cwd);
  expect(solve!.input).not.toContain("rubric");
  expect(grade!.input).not.toContain("Skill content");
  for (const call of [solve!, grade!]) {
    expect(call.argv).toContain('forced_login_method="chatgpt"');
    expect(call.argv).toContain('model_provider="openai"');
    expect(call.argv).toContain("--ignore-user-config");
    expect(call.argv).toContain("skip_host_skill_discovery");
    expect(call.argv).toContain("read-only");
    await expect(access(call.cwd)).rejects.toThrow();
  }
});

test("failed turns, command failures and tool use never become passing text evals", async () => {
  for (const option of [
    { code: 1 }, { event: { type: "turn.failed" } },
    { event: { type: "item.completed", item: { type: "command_execution" } } },
    { event: { type: "turn.started" } },
  ]) {
    const f = fixture(option);
    const runner = await createCodexRunner({ execute: f.execute });
    await expect(runner.request("test", {})).rejects.toThrow();
    await expect(access(f.calls.at(-1)!.cwd)).rejects.toThrow();
  }
});

test("routing accepts null and listed skills, rejecting invented names", async () => {
  const f = fixture();
  const judge = codexJudge(await createCodexRunner({ execute: f.execute }));
  const listing = [{ name: "tdd", description: "Use to build with red-green testing" }];
  f.answer({ skill: null });
  expect(await judge(listing, "hello")).toBeNull();
  f.answer({ skill: "tdd" });
  expect(await judge(listing, "use tdd")).toBe("tdd");
  f.answer({ skill: "invented" });
  await expect(judge(listing, "hello")).rejects.toThrow("outside the supplied listing");
});
