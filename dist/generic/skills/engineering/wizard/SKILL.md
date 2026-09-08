---
name: wizard
description: >-
  Generates an interactive bash wizard that walks a human through a manual
  procedure, capturing values into .env and GitHub secrets. Use when the
  user says "make me a setup wizard", "write a script that walks me
  through setting up <service>", or keeps re-explaining a multi-tab setup.
  Not for fully automatable work (plain script), the phased plan itself
  (migration-plan), or unattended CI automation.
license: MIT
metadata:
  skillsmith-invocation: "user"
  skillsmith-maturity: "experimental"
  skillsmith-see-also: "migration-plan"
user-invocable: true
---

# wizard

Build an interactive Bash guide for a procedure whose human steps cannot be
fully automated. It should capture values once, persist them where needed,
and let an interrupted user resume safely.

## Scope from the repository

Recover the intended setup or transition, required variables, and destinations
from documentation, configuration names, and workflow references. Avoid reading
or printing existing secret values just to learn their names. Reuse the user's
specified scope; ask about missing consequential choices rather than requiring
approval of every routine stage.

For each stage identify the human action, current documented URL or command,
value captured, destination, and whether it is secret. Verify unfamiliar vendor
instructions instead of inventing dashboard labels. A migration-plan can supply
the transition constraints; this skill creates the executable human guide.

## Use the bundled implementation

Resolve [scripts/template.sh](scripts/template.sh) from the installed skill
folder and copy it to the requested script path. Keep the library above its
STAGES marker byte-identical. Replace example stages, set TOTAL_STAGES and an
honest TOTAL_MINUTES estimate, and use the helpers for prompts, persistence,
URL opening, confirmation, and command execution.

Open the relevant page before requesting its value. Use ask_secret for secrets
and persist values needed by later stages. Use set_secret only for values the
specified CI workflow needs. Do not imply that generating the script authorizes
running its external or irreversible operations.

Two invariants protect preview and resume:

- Execute stage commands through the run helper. Raw commands bypass skipped
  stages and preview guards. A confirmation alone does not provide the guard,
  because confirm also passes in preview mode. Use the shape
  confirm "Confirm action?" && run "description" command args.
- An ask value used only in its stage may carry the documented pure comment.
  A later stage cannot rely on that transient value after resume; persist it
  when needed across stages.

Confirm irreversible operations at execution time, respecting already supplied
scope and required permissions. Keep secrets out of command logs and summaries.

## Verify without external side effects

Preview with bash <script> --list. Run the installed
[scripts/verify.sh](scripts/verify.sh) with the script and target repo paths;
it checks syntax, template integrity, counts, and variable destinations.
Investigate failures and interpret warnings against the actual requested scope.
Set the executable bit for a retained script.

WIZARD_NONINTERACTIVE=1 supplies prompts from environment variables and
continues confirmations; it is not a dry run. Smoke-test only with dummy data,
a temporary ENV_FILE, and stubbed external commands. Never use that mode to
exercise real deletion or secret-upload steps merely for verification.

## Hand off

Give the script path and the run, --list, --resume, and --from N commands.
Explain required runtimes, using Git Bash explicitly for Windows when needed.
The state file stores stage progress, not secret values; resumed stages still
need their persisted inputs. Keep a reusable wizard when requested and link it
from setup docs. Do not delete the user's artifact automatically after use.
