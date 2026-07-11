/**
 * Check — the CI drift gate (invariant I2). Compares the bytes `generate`
 * WOULD write against what is committed. Three drift classes:
 *  - missing: plan owns a path that doesn't exist on disk
 *  - modified: path exists but bytes differ
 *  - stale: a file on disk inside generated territory that the plan no
 *    longer owns (e.g. a skill was removed but its plugin copy lingers)
 *
 * Zero flags by design (spec §3): the command is the contract.
 */
import { join, sep } from "node:path";
import type { GeneratePlan } from "./generate.ts";
import { plannedPaths } from "./generate.ts";

export type DriftKind = "missing" | "modified" | "stale";

export interface Drift {
  kind: DriftKind;
  path: string;
}

export interface CheckResult {
  clean: boolean;
  drifts: Drift[];
}

/** Directories whose contents are wholly owned by generation. */
const GENERATED_ROOTS = ["plugins", "catalog", ".claude-plugin"] as const;

const posix = (p: string) => p.split(sep).join("/");

async function bytesEqual(a: Uint8Array, b: Uint8Array): Promise<boolean> {
  if (a.byteLength !== b.byteLength) return false;
  for (let i = 0; i < a.byteLength; i++) if (a[i] !== b[i]) return false;
  return true;
}

export async function checkPlan(
  plan: GeneratePlan,
  repoRoot: string,
): Promise<CheckResult> {
  const drifts: Drift[] = [];

  // missing / modified — text files
  for (const [path, content] of plan.files) {
    const file = Bun.file(join(repoRoot, path));
    if (!(await file.exists())) {
      drifts.push({ kind: "missing", path });
      continue;
    }
    const onDisk = new Uint8Array(await file.arrayBuffer());
    const expected = new TextEncoder().encode(content);
    if (!(await bytesEqual(onDisk, expected))) {
      drifts.push({ kind: "modified", path });
    }
  }

  // missing / modified — copies
  for (const [src, dest] of plan.copies) {
    const destFile = Bun.file(join(repoRoot, dest));
    if (!(await destFile.exists())) {
      drifts.push({ kind: "missing", path: dest });
      continue;
    }
    const srcBytes = new Uint8Array(await Bun.file(src).arrayBuffer());
    const destBytes = new Uint8Array(await destFile.arrayBuffer());
    if (!(await bytesEqual(srcBytes, destBytes))) {
      drifts.push({ kind: "modified", path: dest });
    }
  }

  // stale — anything on disk in generated territory the plan doesn't own
  const owned = new Set(plannedPaths(plan));
  for (const root of GENERATED_ROOTS) {
    const glob = new Bun.Glob(`${root}/**/*`);
    for await (const rel of glob.scan({ cwd: repoRoot, onlyFiles: true })) {
      const relPath = posix(rel);
      if (!owned.has(relPath)) {
        drifts.push({ kind: "stale", path: relPath });
      }
    }
  }

  drifts.sort((a, b) => a.path.localeCompare(b.path));
  return { clean: drifts.length === 0, drifts };
}
