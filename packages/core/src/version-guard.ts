/**
 * VERSION guard — a plugin whose shipped content changes MUST carry a new
 * version, or Claude Code cannot pick up the update (installed plugins are
 * refreshed by version, not by content hash). This is the one invariant the
 * drift gate (`check`) cannot see: `check` compares the working tree against
 * what `generate` would write, but has no memory of the *previously released*
 * bytes. Catching "content changed, version didn't" needs a git baseline.
 *
 * The logic here is pure: it compares two sets of plugin snapshots (baseline
 * vs current) and reports plugins that moved without a bump. The CLI supplies
 * the snapshots — current from disk, baseline from `git show <ref>` — so the
 * git IO stays out of core.
 */
import { createHash } from "node:crypto";
import { type Diagnostic, error } from "./diagnostics.ts";

export interface PluginSnapshot {
  name: string;
  /** The `version` string from the plugin's plugin.json. */
  version: string;
  /** SHA-256 over all plugin files with the version field normalized out, so a
   * bump alone never counts as a content change. */
  contentHash: string;
}

/** Matches the top-level `"version": "x.y.z"` line in a plugin.json, tolerant of
 * whitespace produced by any JSON formatter. Non-global: first hit only, which
 * is the top-level field these manifests carry. */
const VERSION_FIELD = /"version"\s*:\s*"([^"]*)"/;

/**
 * Fold a plugin's files (repo-relative path → text content) into a snapshot.
 * The version is read from `.claude-plugin/plugin.json`; that file's version
 * value is replaced with a constant before hashing so bumping the version does
 * not, by itself, change `contentHash`.
 */
export function pluginSnapshot(name: string, files: Map<string, string>): PluginSnapshot {
  let version = "";
  const hash = createHash("sha256");
  for (const path of [...files.keys()].sort()) {
    // Normalize line endings before hashing: the repo is LF-canonical
    // (`generate` emits LF), but a working tree read through git's autocrlf
    // smudge yields CRLF while `git show` yields the LF blob. Comparing those
    // raw would flag every plugin on Windows as "changed" — a false positive.
    let content = (files.get(path) ?? "").replace(/\r\n?/g, "\n");
    if (path.endsWith(".claude-plugin/plugin.json")) {
      const match = content.match(VERSION_FIELD);
      if (match) version = match[1] ?? "";
      content = content.replace(VERSION_FIELD, '"version":"<normalized>"');
    }
    hash.update(path);
    hash.update("\0");
    hash.update(content);
    hash.update("\0");
  }
  return { name, version, contentHash: hash.digest("hex") };
}

/**
 * Compare current plugin snapshots against a baseline. A plugin that exists in
 * both and whose content hash moved while its version stayed put is a
 * violation. Plugins absent from the baseline are new — nothing to bump
 * against — and are exempt. Removed plugins are not this rule's concern.
 */
export function versionGuard(
  baseline: readonly PluginSnapshot[],
  current: readonly PluginSnapshot[],
): Diagnostic[] {
  const prev = new Map(baseline.map((p) => [p.name, p]));
  const diagnostics: Diagnostic[] = [];
  for (const cur of current) {
    const base = prev.get(cur.name);
    if (!base) continue; // new plugin
    if (cur.contentHash !== base.contentHash && cur.version === base.version) {
      diagnostics.push(
        error(
          "VERSION",
          `plugins/${cur.name}/.claude-plugin/plugin.json`,
          `plugin "${cur.name}" content changed but version is still ${cur.version} — ` +
            `bump it in skillsmith.toml so Claude Code can pick up the update`,
        ),
      );
    }
  }
  diagnostics.sort((a, b) => a.path.localeCompare(b.path));
  return diagnostics;
}
