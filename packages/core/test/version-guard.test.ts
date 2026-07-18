import { describe, expect, test } from "bun:test";
import { pluginSnapshot, versionGuard, type PluginSnapshot } from "../src/index.ts";

/** Build a plugin file map with a plugin.json carrying `version` plus one extra
 * file whose content we vary to simulate a shipped-content change. */
function files(version: string, body: string): Map<string, string> {
  return new Map([
    [
      "plugins/demo/.claude-plugin/plugin.json",
      JSON.stringify({ name: "demo", version, description: "d" }, null, 2),
    ],
    ["plugins/demo/skills/x/SKILL.md", body],
  ]);
}

describe("pluginSnapshot", () => {
  test("extracts the version from plugin.json", () => {
    expect(pluginSnapshot("demo", files("1.2.3", "a")).version).toBe("1.2.3");
  });

  test("a version bump alone does not change the content hash", () => {
    const a = pluginSnapshot("demo", files("0.1.0", "same body"));
    const b = pluginSnapshot("demo", files("0.2.0", "same body"));
    expect(a.contentHash).toBe(b.contentHash);
    expect(a.version).not.toBe(b.version);
  });

  test("a body change does change the content hash", () => {
    const a = pluginSnapshot("demo", files("0.1.0", "before"));
    const b = pluginSnapshot("demo", files("0.1.0", "after"));
    expect(a.contentHash).not.toBe(b.contentHash);
  });

  test("line-ending differences (CRLF vs LF) do not change the hash", () => {
    const lf = pluginSnapshot("demo", files("0.1.0", "line one\nline two\n"));
    const crlf = pluginSnapshot("demo", files("0.1.0", "line one\r\nline two\r\n"));
    expect(lf.contentHash).toBe(crlf.contentHash);
  });
});

describe("versionGuard", () => {
  const base = pluginSnapshot("demo", files("0.1.0", "before"));

  test("content changed without a bump → one VERSION error", () => {
    const curr = pluginSnapshot("demo", files("0.1.0", "after"));
    const d = versionGuard([base], [curr]);
    expect(d).toHaveLength(1);
    const [first] = d;
    expect(first?.rule).toBe("VERSION");
    expect(first?.severity).toBe("error");
    expect(first?.path).toBe("plugins/demo/.claude-plugin/plugin.json");
  });

  test("content changed with a bump → clean", () => {
    const curr = pluginSnapshot("demo", files("0.2.0", "after"));
    expect(versionGuard([base], [curr])).toHaveLength(0);
  });

  test("no content change, no bump → clean", () => {
    const curr = pluginSnapshot("demo", files("0.1.0", "before"));
    expect(versionGuard([base], [curr])).toHaveLength(0);
  });

  test("version-only bump, identical content → clean", () => {
    const curr = pluginSnapshot("demo", files("0.2.0", "before"));
    expect(versionGuard([base], [curr])).toHaveLength(0);
  });

  test("new plugin absent from baseline is exempt", () => {
    const curr = pluginSnapshot("fresh", files("0.1.0", "anything"));
    expect(versionGuard([base], [curr, base])).toHaveLength(0);
  });

  test("multiple plugins report independently and sorted by path", () => {
    const baseA: PluginSnapshot = { name: "aaa", version: "1.0.0", contentHash: "h1" };
    const baseB: PluginSnapshot = { name: "zzz", version: "1.0.0", contentHash: "h2" };
    const currA: PluginSnapshot = { name: "aaa", version: "1.0.0", contentHash: "CHANGED" };
    const currB: PluginSnapshot = { name: "zzz", version: "1.0.0", contentHash: "CHANGED" };
    const d = versionGuard([baseA, baseB], [currB, currA]);
    expect(d).toHaveLength(2);
    expect(d.map((x) => x.path)).toEqual([
      "plugins/aaa/.claude-plugin/plugin.json",
      "plugins/zzz/.claude-plugin/plugin.json",
    ]);
  });
});
