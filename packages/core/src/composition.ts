/**
 * V12 — composition validation. Edges are DECLARED, not inferred: a skill
 * that composes another lists it in metadata["skillsmith-composes"]
 * (comma-separated skill names). Declaration is what makes the edge
 * lintable and machine-readable; prose stays free.
 *
 * Checks:
 *  - declared target must exist (and not be a draft)          → error
 *  - user-invoked skills may compose model-invoked ("model"/"both")
 *    skills only — never another user-invoked one              → error
 *  - a known skill name appearing in the body but undeclared   → warning
 *    (prose/declaration drift; self-mentions excluded). Non-invoking
 *    mentions — boundary statements, disambiguation — are acknowledged
 *    via metadata["skillsmith-see-also"] instead of composes.
 *  - a declared edge never mentioned in the body               → warning
 *    (dead declaration)
 *  - edge crosses plugin boundaries: soft dependency consumers
 *    may not have installed — warning unless acknowledged in
 *    [policy]."composition-allowlist" as "composer->target"
 */
import type { DiscoveryResult } from "./discovery.ts";
import type { SkillsmithConfig } from "./schemas/skillsmith-config.ts";
import { type Diagnostic, error, warning } from "./diagnostics.ts";

export interface CompositionEdge {
  composer: string;
  target: string;
  crossPlugin: boolean;
}

function parseNameList(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parseComposes(metadata: Record<string, string> | undefined): string[] {
  return parseNameList(metadata?.["skillsmith-composes"]);
}

export function parseSeeAlso(metadata: Record<string, string> | undefined): string[] {
  return parseNameList(metadata?.["skillsmith-see-also"]);
}

export function validateComposition(
  discovery: DiscoveryResult,
  config: SkillsmithConfig,
): { edges: CompositionEdge[]; diagnostics: Diagnostic[] } {
  const diagnostics: Diagnostic[] = [];
  const edges: CompositionEdge[] = [];

  const shipped = discovery.skills.filter((s) => !s.draft);
  const byName = new Map(shipped.map((s) => [s.name, s]));
  const pluginOf = new Map<string, string>();
  for (const grouping of config.plugin) {
    for (const skillName of grouping.skills) pluginOf.set(skillName, grouping.name);
  }
  const invocationOf = (name: string) =>
    byName.get(name)?.frontmatter.metadata?.["skillsmith-invocation"] ?? "model";

  const allowlist = new Set(config.policy["composition-allowlist"]);

  for (const skill of shipped) {
    const at = skill.skillMdPath;
    const declared = parseComposes(skill.frontmatter.metadata);
    const declaredSet = new Set(declared);

    for (const target of declared) {
      if (target === skill.name) {
        diagnostics.push(error("V12", `${at}#/metadata/skillsmith-composes`, "a skill cannot compose itself"));
        continue;
      }
      const targetSkill = byName.get(target);
      if (!targetSkill) {
        const isDraft = discovery.skills.some((s) => s.draft && s.name === target);
        diagnostics.push(
          error(
            "V12",
            `${at}#/metadata/skillsmith-composes`,
            isDraft
              ? `composed skill "${target}" is a draft — promote it before shipping the composer`
              : `composed skill "${target}" does not exist`,
          ),
        );
        continue;
      }

      // Invocation legality: user-invoked composes model-invoked only.
      if (invocationOf(skill.name) === "user" && invocationOf(target) === "user") {
        diagnostics.push(
          error(
            "V12",
            `${at}#/metadata/skillsmith-composes`,
            `user-invoked skill may not compose user-invoked "${target}" — orchestrators compose disciplines, not each other`,
          ),
        );
      }

      // Dead declaration: declared but never referenced in the body.
      if (!new RegExp(`\\b${target}\\b`).test(skill.body)) {
        diagnostics.push(
          warning(
            "V12",
            `${at}#/metadata/skillsmith-composes`,
            `declares composition of "${target}" but the body never references it`,
          ),
        );
      }

      // Cross-plugin soft dependency.
      const composerPlugin = pluginOf.get(skill.name);
      const targetPlugin = pluginOf.get(target);
      const crossPlugin =
        composerPlugin !== undefined && targetPlugin !== undefined && composerPlugin !== targetPlugin;
      if (crossPlugin && !allowlist.has(`${skill.name}->${target}`)) {
        diagnostics.push(
          warning(
            "V12",
            `${at}#/metadata/skillsmith-composes`,
            `composition "${skill.name}->${target}" crosses plugins (${composerPlugin} -> ${targetPlugin}) — consumers may install one without the other; acknowledge in [policy]."composition-allowlist" if intended`,
          ),
        );
      }
      edges.push({ composer: skill.name, target, crossPlugin });
    }

    // Prose/declaration drift: known skill name in body, not declared as a
    // composition or an acknowledged see-also, not self.
    const seeAlso = new Set(parseSeeAlso(skill.frontmatter.metadata));
    for (const bad of seeAlso) {
      if (!byName.has(bad)) {
        diagnostics.push(
          error("V12", `${at}#/metadata/skillsmith-see-also`, `see-also skill "${bad}" does not exist`),
        );
      }
    }
    for (const other of shipped) {
      if (other.name === skill.name || declaredSet.has(other.name) || seeAlso.has(other.name)) continue;
      if (new RegExp(`\\b${other.name}\\b`).test(skill.body)) {
        diagnostics.push(
          warning(
            "V12",
            at,
            `body references skill "${other.name}" but metadata.skillsmith-composes does not declare it`,
          ),
        );
      }
    }
  }

  edges.sort((a, b) => a.composer.localeCompare(b.composer) || a.target.localeCompare(b.target));
  return { edges, diagnostics };
}
