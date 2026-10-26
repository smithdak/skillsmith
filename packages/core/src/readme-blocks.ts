/**
 * Managed README blocks — derived plugin data rendered between explicit
 * markers in the repository README, then drift-guarded like any artifact.
 *
 * Opt-in: a README without the marker pair is left untouched. When the
 * markers exist, `generate` owns everything between them and `check`
 * fails on hand-edits, which retires the stale-counts/stale-table bug
 * class: the block is regenerated from skillsmith.toml on every run.
 */

export interface ReadmePluginRow {
  name: string;
  version: string;
  description?: string;
  skills: string[];
  agents: string[];
}

export interface ReadmeBlockData {
  plugins: ReadmePluginRow[];
  skillCount: number;
  agentCount: number;
  catalogPath: string;
}

export const BLOCK_START = "<!-- skillsmith:start -->";
export const BLOCK_END = "<!-- skillsmith:end -->";

/** Render the inner markdown of the managed block (without markers). */
export function renderReadmeBlock(data: ReadmeBlockData): string {
  const { plugins, skillCount, agentCount, catalogPath } = data;
  const lines: string[] = [];

  const noun = (n: number, s: string, p: string) => `${n} ${n === 1 ? s : p}`;
  lines.push(
    `**${noun(plugins.length, "installable plugin", "installable plugins")}, ${noun(skillCount, "skill", "skills")}, ${noun(agentCount, "agent", "agents")}.** Choose a plugin below to see its skills and routing status in the [catalog](${catalogPath}). Agent definitions ship in the Claude Code bundles.`,
    "",
  );

  lines.push(
    "| Plugin | Use it for |",
    "|---|---|",
  );
  const esc = (s: string) => s.replace(/\|/g, "\\|");
  for (const p of plugins) {
    const label = `[${esc(p.name)}](${catalogPath}#${p.name})<br>\`${p.version}\``;
    lines.push(`| ${label} | ${esc(p.description ?? "")} |`);
  }

  return lines.join("\n");
}

/**
 * Replace the region between the markers (inclusive) with a freshly
 * rendered block. Returns found=false when the README has no marker pair,
 * in which case content is returned unchanged and unowned.
 */
export function spliceReadmeBlock(
  readme: string,
  blockInner: string,
): { content: string; found: boolean } {
  const start = readme.indexOf(BLOCK_START);
  const end = readme.indexOf(BLOCK_END);
  if (start === -1 || end === -1 || end < start) {
    return { content: readme, found: false };
  }
  const replacement = `${BLOCK_START}\n${blockInner}\n${BLOCK_END}`;
  const before = readme.slice(0, start);
  const after = readme.slice(end + BLOCK_END.length);
  return { content: before + replacement + after, found: true };
}
