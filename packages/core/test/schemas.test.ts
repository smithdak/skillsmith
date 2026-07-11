import { describe, expect, test } from "bun:test";
import {
  validateStandardFrontmatter,
  validateClaudeCodeFrontmatter,
  validatePluginManifest,
  validateMarketplace,
  validateHooksFile,
  validateAgentFrontmatter,
  validateSkillsmithConfig,
  forProfile,
  exitCode,
  generateJsonSchemas,
} from "../src/index.ts";

describe("agent-skills-standard", () => {
  test("valid frontmatter with trigger phrasing passes clean", () => {
    const r = validateStandardFrontmatter(
      {
        name: "code-review",
        description:
          'Two-axis code review. Use this skill when the user asks to "review my code" or requests a pre-merge check.',
        metadata: { "skillsmith-category": "engineering" },
      },
      { path: "skills/engineering/code-review/SKILL.md", directoryName: "code-review" },
    );
    expect(r.value?.name).toBe("code-review");
    expect(r.diagnostics).toHaveLength(0);
  });

  test("V1 fires on directory mismatch and forbidden substring", () => {
    const r = validateStandardFrontmatter(
      { name: "claude-helper", description: "Use when helping." },
      { path: "skills/misc/other-name/SKILL.md", directoryName: "other-name" },
    );
    const rules = r.diagnostics.map((d) => d.rule);
    expect(rules.filter((x) => x === "V1")).toHaveLength(2);
  });

  test("V3 warns when no trigger phrasing", () => {
    const r = validateStandardFrontmatter(
      { name: "tdd", description: "A skill about test driven development." },
      { path: "skills/engineering/tdd/SKILL.md", directoryName: "tdd" },
    );
    expect(r.diagnostics.some((d) => d.rule === "V3" && d.severity === "warning")).toBe(true);
  });
});

describe("claude-code-frontmatter (profile-scoped)", () => {
  test("argument-hint: valid for claude-code, error for cowork", () => {
    const r = validateClaudeCodeFrontmatter(
      {
        name: "deploy",
        description: 'Use when the user says "deploy".',
        "argument-hint": "[environment]",
      },
      { path: "skills/engineering/deploy/SKILL.md" },
    );
    expect(forProfile(r.diagnostics, "claude-code").filter((d) => d.severity === "error")).toHaveLength(0);
    expect(forProfile(r.diagnostics, "cowork").some((d) => d.severity === "error")).toBe(true);
  });

  test("unknown field warns under claude-code", () => {
    const r = validateClaudeCodeFrontmatter(
      { name: "x-skill", description: 'Use when "x".', frobnicate: true },
      { path: "skills/misc/x-skill/SKILL.md" },
    );
    const warnings = forProfile(r.diagnostics, "claude-code").filter((d) => d.severity === "warning");
    expect(warnings.some((d) => d.message.includes("frobnicate"))).toBe(true);
  });

  test("V2 listing projection cap", () => {
    const r = validateClaudeCodeFrontmatter(
      {
        name: "long-one",
        description: `Use when "long". ${"a".repeat(1000)}`,
        when_to_use: "b".repeat(600),
      },
      { path: "skills/misc/long-one/SKILL.md" },
    );
    expect(r.diagnostics.some((d) => d.rule === "V2" && d.severity === "error")).toBe(true);
  });

  test("exitCode: strict promotes warnings", () => {
    const r = validateClaudeCodeFrontmatter(
      { name: "y-skill", description: 'Use when "y".', frobnicate: 1 },
      { path: "p" },
    );
    expect(exitCode(r.diagnostics, { strict: false, profile: "claude-code" })).toBe(0);
    expect(exitCode(r.diagnostics, { strict: true, profile: "claude-code" })).toBe(1);
  });
});

describe("plugin-manifest", () => {
  test("name-only manifest parses; missing version warns", () => {
    const r = validatePluginManifest({ name: "review-tools" }, { path: "plugin.json" });
    expect(r.value?.name).toBe("review-tools");
    expect(r.diagnostics.some((d) => d.path.endsWith("/version") && d.severity === "warning")).toBe(true);
  });

  test("agents path override must be an array", () => {
    const r = validatePluginManifest(
      { name: "p", agents: "./agents" },
      { path: "plugin.json" },
    );
    expect(r.diagnostics.some((d) => d.rule === "SCHEMA" && d.severity === "error")).toBe(true);
  });

  test("unrecognized field warns (npm-manifest dual-use tolerance)", () => {
    const r = validatePluginManifest(
      { name: "p", version: "1.0.0", dependencies: {} },
      { path: "plugin.json" },
    );
    expect(r.diagnostics.some((d) => d.message.includes("dependencies") && d.severity === "warning")).toBe(true);
  });
});

describe("marketplace", () => {
  test("reserved name rejected; S5 sha-pinning enforced under strict", () => {
    const r = validateMarketplace(
      {
        name: "claude-plugins-official",
        owner: { name: "Me" },
        plugins: [
          { name: "a", source: "./plugins/a" },
          { name: "b", source: { source: "github", repo: "o/r", ref: "main" } },
        ],
      },
      { path: "marketplace.json", securityTier: "strict" },
    );
    expect(r.diagnostics.some((d) => d.message.includes("reserved"))).toBe(true);
    expect(r.diagnostics.some((d) => d.rule === "S5" && d.severity === "error")).toBe(true);
  });

  test("relative-path sources are S5-exempt", () => {
    const r = validateMarketplace(
      {
        name: "my-marketplace",
        owner: { name: "Me" },
        plugins: [{ name: "a", source: "./plugins/a" }],
      },
      { path: "marketplace.json", securityTier: "strict" },
    );
    expect(r.diagnostics.filter((d) => d.rule === "S5")).toHaveLength(0);
  });
});

describe("hooks", () => {
  test("known event + command handler parses; S3 intent warning attaches", () => {
    const r = validateHooksFile(
      {
        PreToolUse: [
          { matcher: "Bash", hooks: [{ type: "command", command: "./gate.sh" }] },
        ],
      },
      { path: "hooks/hooks.json" },
    );
    expect(r.value).toBeDefined();
    expect(r.diagnostics.some((d) => d.rule === "S3" && d.severity === "warning")).toBe(true);
  });

  test("unknown event warns per-profile, never errors", () => {
    const r = validateHooksFile(
      { BrandNewEvent: [{ hooks: [{ type: "prompt", prompt: "check" }] }] },
      { path: "hooks/hooks.json" },
    );
    expect(r.diagnostics.every((d) => d.severity === "warning")).toBe(true);
    expect(forProfile(r.diagnostics, "claude-code").length).toBeGreaterThan(0);
  });

  test("command handler without command is an error", () => {
    const r = validateHooksFile(
      { Stop: [{ hooks: [{ type: "command" }] }] },
      { path: "hooks/hooks.json" },
    );
    expect(r.diagnostics.some((d) => d.severity === "error")).toBe(true);
  });
});

describe("agent-frontmatter", () => {
  test("V9: plugin-shipped agent with hooks is an error; standalone is fine", () => {
    const fm = {
      name: "spec-reviewer",
      description: "Use proactively after large changes. <example>user: review</example>",
      model: "inherit",
      color: "blue",
      hooks: {},
    };
    const inPlugin = validateAgentFrontmatter(fm, { path: "agents/spec-reviewer.md", inPlugin: true });
    expect(inPlugin.diagnostics.some((d) => d.rule === "V9" && d.severity === "error")).toBe(true);
    const standalone = validateAgentFrontmatter(fm, { path: "agents/spec-reviewer.md", inPlugin: false });
    expect(standalone.diagnostics.filter((d) => d.rule === "V9")).toHaveLength(0);
  });

  test("cowork profile: non-inherit model and unproven tools warn", () => {
    const r = validateAgentFrontmatter(
      {
        name: "worker",
        description: "Use proactively. <example>x</example>",
        model: "sonnet",
        color: "green",
        tools: ["Read", "Write"],
      },
      { path: "agents/worker.md", inPlugin: true },
    );
    const cowork = forProfile(r.diagnostics, "cowork");
    expect(cowork.some((d) => d.message.includes("inherit"))).toBe(true);
    expect(cowork.some((d) => d.message.includes("proven"))).toBe(true);
    // claude-code profile is unaffected by either
    const cc = forProfile(r.diagnostics, "claude-code").filter(
      (d) => d.path.endsWith("/model") || d.path.endsWith("/tools"),
    );
    expect(cc).toHaveLength(0);
  });
});

describe("skillsmith-config", () => {
  const validConfig = {
    marketplace: { name: "my-marketplace", owner: { name: "Me" } },
    categories: { allowed: ["engineering", "productivity", "misc"] },
    plugin: [
      { name: "review-tools", skills: ["code-review", "tdd"] },
      { name: "prod-tools", skills: ["handoff"] },
    ],
  };

  test("valid config parses with policy defaults applied", () => {
    const r = validateSkillsmithConfig(validConfig, { path: "skillsmith.toml" });
    expect(r.value?.policy["security-tier"]).toBe("strict");
    expect(r.value?.policy["max-skill-body-tokens"]).toBe(5000);
    expect(r.diagnostics).toHaveLength(0);
  });

  test("V14: drafts in allowlist is an error", () => {
    const r = validateSkillsmithConfig(
      { ...validConfig, categories: { allowed: ["engineering", "drafts"] } },
      { path: "skillsmith.toml" },
    );
    expect(r.diagnostics.some((d) => d.rule === "V14")).toBe(true);
  });

  test("a skill claimed by two plugins is an error", () => {
    const r = validateSkillsmithConfig(
      {
        ...validConfig,
        plugin: [
          { name: "a", skills: ["tdd"] },
          { name: "b", skills: ["tdd"] },
        ],
      },
      { path: "skillsmith.toml" },
    );
    expect(r.diagnostics.some((d) => d.message.includes("exactly one plugin"))).toBe(true);
  });

  test("unknown key is an error (our surface is strict)", () => {
    const r = validateSkillsmithConfig(
      { ...validConfig, extraneous: true },
      { path: "skillsmith.toml" },
    );
    expect(r.diagnostics.some((d) => d.severity === "error")).toBe(true);
  });
});

describe("json schema export", () => {
  test("all four schemas convert", () => {
    const schemas = generateJsonSchemas();
    expect(Object.keys(schemas)).toHaveLength(4);
    for (const s of Object.values(schemas)) {
      expect((s as Record<string, unknown>).type ?? (s as Record<string, unknown>).$schema).toBeDefined();
    }
  });
});
