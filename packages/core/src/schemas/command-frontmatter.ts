/**
 * Slash-command .md frontmatter (commands/*.md).
 *
 * Claude Code names commands by filename; the body below the frontmatter is
 * the prompt template ($ARGUMENTS / $1..$9 substitution is harness-side).
 * The description renders inline in the slash-command menu, so it is capped
 * hard (LIMITS.commandDescriptionMax).
 */
import { z } from "zod";
import { KEBAB_CASE, LIMITS } from "../constants.ts";
import {
  type Diagnostic,
  type ValidationResult,
  error,
} from "../diagnostics.ts";

export const commandFrontmatterSchema = z.looseObject({
  description: z.string().min(1).max(LIMITS.commandDescriptionMax),
  /** Hint shown for tab-completion, e.g. "[preset]". Cosmetic only. */
  "argument-hint": z.string().optional(),
  model: z.string().optional(),
  agent: z.string().optional(),
  "allowed-tools": z.array(z.string()).optional(),
  "disable-model-invocation": z.boolean().optional(),
});

export type CommandFrontmatter = z.infer<typeof commandFrontmatterSchema>;

export function validateCommandFrontmatter(
  raw: unknown,
  ctx: { path: string; name: string },
): ValidationResult<CommandFrontmatter> {
  const diagnostics: Diagnostic[] = [];

  if (!KEBAB_CASE.test(ctx.name)) {
    diagnostics.push(
      error(
        "SCHEMA",
        ctx.path,
        `command filename "${ctx.name}" must be kebab-case (it becomes the slash-command name)`,
      ),
    );
  }

  const parsed = commandFrontmatterSchema.safeParse(raw);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      diagnostics.push(
        error("SCHEMA", `${ctx.path}#/${issue.path.join("/")}`, issue.message),
      );
    }
    return { diagnostics };
  }

  return { value: parsed.data, diagnostics };
}
