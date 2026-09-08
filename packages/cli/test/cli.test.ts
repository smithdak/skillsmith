import { afterEach, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { applyScaffold, buildInitFiles } from "@skillsmith/core";

const cli = resolve(import.meta.dir, "../src/main.ts");
const roots: string[] = [];
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "skillsmith-cli-test-"));
  roots.push(root);
  await applyScaffold(buildInitFiles({ marketplaceName: "test", ownerName: "Test", categories: ["engineering"] }), root, { errorOnExisting: true });
  await Bun.write(join(root, "CHANGELOG.md"), "# Changelog\n\n## starter 0.1.0\n\nInitial fixture.\n");
  return root;
}
afterEach(async () => { await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true }))); });

async function run(root: string, ...args: string[]) {
  const proc = Bun.spawn([process.execPath, cli, ...args, "--cwd", root], { stdout: "pipe", stderr: "pipe" });
  const [stdout, stderr, code] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text(), proc.exited]);
  return { stdout, stderr, code };
}

test("a new repository can validate before its first model eval", async () => {
  expect((await run(await fixture(), "validate", "--strict")).code).toBe(0);
});

test("malformed persisted measurements fail validate, check, and generate without overwriting them", async () => {
  const root = await fixture();
  const path = join(root, ".skillsmith/eval-results.json");
  for (const content of ["{broken", "null", '{"skills":{}}']) {
    await Bun.write(path, content);
    for (const command of ["validate", "check", "generate"]) {
      const result = await run(root, command);
      expect(result.code).toBe(2);
      expect(result.stderr).toContain("invalid .skillsmith/eval-results.json");
      expect(await Bun.file(path).text()).toBe(content);
    }
  }
});

test("unknown profiles and tiers cannot turn validation into an empty success", async () => {
  const root = await fixture();
  expect((await run(root, "validate", "--profile", "typo")).code).toBe(2);
  expect((await run(root, "validate", "--tier", "typo")).code).toBe(2);
});

test("schema findings reach the schema tier", async () => {
  const root = await fixture();
  await Bun.write(join(root, "skills/engineering/broken/SKILL.md"), "No frontmatter here.\n");
  const result = await run(root, "validate", "--tier", "schema", "--json");
  expect(result.code).toBe(1);
  expect(JSON.parse(result.stdout).diagnostics.some((d: { rule: string }) => d.rule === "SCHEMA")).toBe(true);
});

test("an unavailable explicit baseline fails instead of falling back to HEAD", async () => {
  const result = await run(await fixture(), "version-guard", "--base", "missing-baseline");
  expect(result.code).toBe(2);
  expect(result.stderr).toContain("unavailable");
});

test("version guard catches changed shipped bytes against the previous commit", async () => {
  const root = await fixture();
  const git = async (...args: string[]) => {
    const p = Bun.spawn(["git", ...args], { cwd: root, stdout: "pipe", stderr: "pipe" });
    const [output, error, code] = await Promise.all([new Response(p.stdout).text(), new Response(p.stderr).text(), p.exited]);
    if (code !== 0) throw new Error(error);
    return output.trim();
  };
  await Bun.write(join(root, "skillsmith.toml"), `${await Bun.file(join(root, "skillsmith.toml")).text()}\n[[plugin]]\nname = "p"\nversion = "0.1.0"\nskills = []\n`);
  const manifest = join(root, "plugins/p/.claude-plugin/plugin.json");
  await Bun.write(manifest, '{"name":"p","version":"0.1.0"}');
  await Bun.write(join(root, "plugins/p/body.md"), "before");
  await git("init");
  await git("add", ".");
  await git("-c", "user.name=Test", "-c", "user.email=test@example.invalid", "-c", "commit.gpgsign=false", "commit", "-m", "baseline");
  const base = await git("rev-parse", "HEAD");
  await Bun.write(join(root, "plugins/p/body.md"), "after");
  expect((await run(root, "version-guard", "--base", base)).code).toBe(1);
  await Bun.write(join(root, "plugins/p/body.md"), "before");
  await Bun.write(join(root, "dist/codex/plugins/p/.codex-plugin/plugin.json"), '{"name":"p","version":"0.1.0"}');
  expect((await run(root, "version-guard", "--base", base)).code).toBe(1);
  await Bun.write(manifest, '{"name":"p","version":"0.1.1"}');
  expect((await run(root, "version-guard", "--base", base)).code).toBe(0);
});

test("effectiveness CLI exchanges JSON with a runner and rejects runner failure", async () => {
  const root = await fixture();
  await Bun.write(join(root, "skills/engineering/sample/SKILL.md"), '---\nname: sample\ndescription: Use when writing sample output.\n---\nInclude evidence.\n');
  await Bun.write(join(root, "suite.json"), JSON.stringify({ name: "test", cases: [{ id: "a", skill: "sample", task: "Explain the result", success_criteria: ["Includes evidence"] }] }));
  const runner = join(root, "runner.ts");
  await Bun.write(runner, `const r = await Bun.stdin.json(); console.log(JSON.stringify(r.operation === 'solve' ? {output:r.instructions ? 'evidence' : 'guess'} : {criteria:[{pass:r.output === 'evidence',reason:'fixture score'}]}));`);
  const args = ["effectiveness", "--suite", "suite.json", "--runner", JSON.stringify([process.execPath, runner]), "--runner-id", "deterministic-test", "--repeat", "1"];
  const result = await run(root, ...args);
  expect(result.code).toBe(0);
  expect(JSON.parse(result.stdout).delta).toBe(1);
  await Bun.write(join(root, "previous/skills/engineering/sample/SKILL.md"), '---\nname: sample\ndescription: Use when writing sample output.\n---\nOld instruction.\n');
  const comparison = await run(root, ...args, "--baseline", "previous");
  expect(comparison.code).toBe(0);
  const report = JSON.parse(comparison.stdout);
  expect(report.results).toHaveLength(3);
  expect(report.previousInstructionHashes.sample).not.toBe(report.instructionHashes.sample);
  const missing = await run(root, ...args, "--baseline", "does-not-exist");
  expect(missing.code).not.toBe(0);
  expect(missing.stdout).toBe("");
  await Bun.write(runner, "process.exit(3);");
  const failed = await run(root, ...args);
  expect(failed.code).not.toBe(0);
  expect(failed.stdout).toBe("");
});

test("large effectiveness reports survive stdout and explicit file output", async () => {
  const root = await fixture();
  await Bun.write(join(root, "skills/engineering/sample/SKILL.md"), '---\nname: sample\ndescription: Use when writing sample output.\n---\nInclude evidence.\n');
  await Bun.write(join(root, "suite.json"), JSON.stringify({ name: "large", cases: [{ id: "a", skill: "sample", task: "Explain the result", success_criteria: ["Includes evidence"] }] }));
  const runner = join(root, "runner.ts");
  await Bun.write(runner, `const r = await Bun.stdin.json(); console.log(JSON.stringify(r.operation === 'solve' ? {output:'evidence'.repeat(20000)} : {criteria:[{pass:true,reason:'fixture score'}]}));`);
  const args = ["effectiveness", "--suite", "suite.json", "--runner", JSON.stringify([process.execPath, runner]), "--runner-id", "large-test", "--repeat", "1"];
  const streamed = await run(root, ...args);
  expect(streamed.code).toBe(0);
  expect(JSON.parse(streamed.stdout).results[1].output).toHaveLength(160000);
  const saved = await run(root, ...args, "--output", "report.json");
  expect(saved.code).toBe(0);
  expect(saved.stdout).toBe("");
  expect((await Bun.file(join(root, "report.json")).json()).results[1].output).toHaveLength(160000);
});
