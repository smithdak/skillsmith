/**
 * Diagnostics — the reporting substrate for all validation.
 *
 * Two dimensions beyond message/path:
 *  - severity: "error" fails the build; "warning" fails only under --strict.
 *  - profiles: WHICH validator a finding applies to. Ground truth (June 2026,
 *    empirically established): `claude plugin validate --strict` and the Cowork
 *    `.plugin` importer enforce DIFFERENT rules. A field can be valid for one
 *    target and rejection-fatal for another (e.g. `argument-hint` in SKILL.md:
 *    fine in Claude Code, fails the Cowork importer). Findings are therefore
 *    profile-scoped, and callers filter by their target profile set.
 */

export type Severity = "error" | "warning";

export type Profile =
  /** The Agent Skills open standard (agentskills.io) — portable subset. */
  | "standard"
  /** Claude Code CLI (`claude plugin validate --strict` semantics). */
  | "claude-code"
  /** The Cowork `.plugin` importer — stricter than the CLI, rules empirical. */
  | "cowork";

export const ALL_PROFILES: readonly Profile[] = [
  "standard",
  "claude-code",
  "cowork",
] as const;

export interface Diagnostic {
  /** Rule id: "V1".."V14" quality, "S1".."S7" security, "SCHEMA" for shape errors. */
  rule: string;
  severity: Severity;
  /** Profiles for which this finding applies. */
  profiles: readonly Profile[];
  /** File path and/or JSON-pointer-ish locator, e.g. "skills/engineering/tdd/SKILL.md#/description". */
  path: string;
  message: string;
}

export interface ValidationResult<T> {
  /** Parsed value when shape parsing succeeded (diagnostics may still exist). */
  value?: T;
  diagnostics: Diagnostic[];
}

/** Filter to the findings relevant for a chosen target profile. */
export function forProfile(
  diagnostics: readonly Diagnostic[],
  profile: Profile,
): Diagnostic[] {
  return diagnostics.filter((d) => d.profiles.includes(profile));
}

/** Exit-code semantics shared by every CLI command (spec §3). */
export function exitCode(
  diagnostics: readonly Diagnostic[],
  opts: { strict: boolean; profile: Profile },
): 0 | 1 {
  const relevant = forProfile(diagnostics, opts.profile);
  const failing = relevant.some(
    (d) => d.severity === "error" || (opts.strict && d.severity === "warning"),
  );
  return failing ? 1 : 0;
}

export function error(
  rule: string,
  path: string,
  message: string,
  profiles: readonly Profile[] = ALL_PROFILES,
): Diagnostic {
  return { rule, severity: "error", profiles, path, message };
}

export function warning(
  rule: string,
  path: string,
  message: string,
  profiles: readonly Profile[] = ALL_PROFILES,
): Diagnostic {
  return { rule, severity: "warning", profiles, path, message };
}
