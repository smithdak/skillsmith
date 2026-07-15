/**
 * hooks/hooks.json. Event enum is VOLATILE data (constants.ts) — unknown
 * events warn rather than fail, because the event list grows faster than
 * this tool releases. Handler exit-code semantics (for docs and S3 checks):
 * exit 0 = success (stdout parsed for JSON), exit 2 = blocking error
 * (stderr fed to Claude), anything else = non-blocking failure.
 */
import { z } from "zod";
import { HOOK_HANDLER_TYPES, KNOWN_HOOK_EVENTS } from "../constants.ts";
import {
  type Diagnostic,
  type ValidationResult,
  error,
  warning,
} from "../diagnostics.ts";

export const hookHandlerSchema = z.looseObject({
  type: z.enum(HOOK_HANDLER_TYPES),
  /** For type: "command". */
  command: z.string().optional(),
  /** For type: "prompt" | "agent". */
  prompt: z.string().optional(),
  /** S3: declared intent for command handlers — JSON's stand-in for an adjacent comment. */
  comment: z.string().optional(),
  timeout: z.number().int().positive().optional(),
});

export const hookMatcherEntrySchema = z.looseObject({
  /** Exact name, "A|B" list, or regex. */
  matcher: z.string().optional(),
  /** Newer permission-rule syntax, e.g. Bash(git *). */
  if: z.string().optional(),
  hooks: z.array(hookHandlerSchema).min(1),
});

/** { EventName: [ { matcher, hooks: [...] } ] } */
export const hooksFileSchema = z.record(
  z.string(),
  z.array(hookMatcherEntrySchema),
);

export type HooksFile = z.infer<typeof hooksFileSchema>;

export function validateHooksFile(
  raw: unknown,
  ctx: { path: string },
): ValidationResult<HooksFile> {
  const diagnostics: Diagnostic[] = [];
  const parsed = hooksFileSchema.safeParse(raw);

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      diagnostics.push(
        error("SCHEMA", `${ctx.path}#/${issue.path.join("/")}`, issue.message),
      );
    }
    return { diagnostics };
  }

  const hooks = parsed.data;

  for (const [event, entries] of Object.entries(hooks)) {
    // Volatile-surface policy: unknown event = warning, per profile.
    if (!(KNOWN_HOOK_EVENTS["claude-code"] as readonly string[]).includes(event)) {
      diagnostics.push(
        warning(
          "SCHEMA",
          `${ctx.path}#/${event}`,
          `unknown hook event "${event}" for SCHEMA_TARGET — verify against your Claude Code version`,
          ["claude-code"],
        ),
      );
    }
    if (!(KNOWN_HOOK_EVENTS.cowork as readonly string[]).includes(event)) {
      diagnostics.push(
        warning(
          "SCHEMA",
          `${ctx.path}#/${event}`,
          `hook event "${event}" is not in the Cowork-proven event set`,
          ["cowork"],
        ),
      );
    }

    entries.forEach((entry, i) => {
      entry.hooks.forEach((handler, j) => {
        const at = `${ctx.path}#/${event}/${i}/hooks/${j}`;
        if (handler.type === "command" && !handler.command) {
          diagnostics.push(
            error("SCHEMA", at, `handler type "command" requires a command`),
          );
        }
        if (
          (handler.type === "prompt" || handler.type === "agent") &&
          !handler.prompt
        ) {
          diagnostics.push(
            error("SCHEMA", at, `handler type "${handler.type}" requires a prompt`),
          );
        }
        // S3: command handlers run arbitrary commands on harness events, so
        // each must carry its justification — a non-empty `comment` field
        // (JSON has no comments; the field is the adjacent comment).
        if (handler.type === "command" && handler.command && !handler.comment?.trim()) {
          diagnostics.push(
            warning(
              "S3",
              at,
              "command handler has no declared intent — add a `comment` field stating why this hook exists",
            ),
          );
        }
      });
    });
  }

  return { value: hooks, diagnostics };
}
