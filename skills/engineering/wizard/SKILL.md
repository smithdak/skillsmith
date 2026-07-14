---
name: wizard
description: >-
  Generates an interactive bash wizard that walks a human step by step
  through a manual procedure — third-party service setup, a one-off
  migration, an A-to-B state transition — opening each URL, capturing
  values with confirmation gates, and writing .env entries and GitHub
  Actions secrets. Use this skill when the user says "make me a setup
  wizard", "write a script that walks me through setting up" a service,
  or "turn this runbook into an interactive script". Not for fully
  automatable work (write a plain script), answering setup questions in
  chat, or unattended CI automation.
license: MIT
metadata:
  skillsmith-invocation: "user"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# wizard

A **wizard** is a bash script that walks a human, step by step, through a
manual procedure that is tedious to do by hand and tedious to re-explain
to an AI every time: it opens each URL, says exactly what to click and
copy, captures the values, writes them where they belong (`.env`, GitHub
secrets), confirms at every stage, and shows how much is left. Typical
subjects: third-party service setup, a one-off migration, moving a
project from one state to another.

The UX is already solved by [scripts/template.sh](scripts/template.sh) —
progress with time remaining, confirmation gates, cross-platform URL
opening (including WSL and Git Bash), hidden secret entry, idempotent
`.env` upserts, `gh secret`/`gh variable` writes, and a closing summary.
The job here is only to scope the procedure and author its stages. The
library above the `STAGES` marker is identical in every wizard; that
consistency is the point — never hand-edit it.

A wizard is ephemeral by default — built for one run, saved to a scratch
or `scripts/` path in the target repo, deleted when the job is done.
Commit it only when the user wants a repeatable setup path that should
live in the repo.

## 1 — Scope the procedure

Work out every manual step the human must take and every value captured
along the way. Read the target repo first — don't ask cold:

- Setup: `.env`, `.env.example`, `.env.*`, `README`, `docker-compose*`,
  framework config, and `.github/workflows/*` (every `secrets.*` /
  `vars.*` reference is a value the wizard must produce).
- Migration or transition: the current state, the target state, and the
  irreversible actions between them.

Show the user the ordered stage list and the values each produces, and
confirm — they may add, drop, or reorder.

**Done when:** every stage is named in order, and every captured value
has (a) where the human gets it, (b) where it is written (`.env`, a
GitHub secret, both, or nowhere — some stages are pure actions), and (c)
whether it is secret (hidden entry) or public.

## 2 — Map each stage's journey

For each stage, write the precise path a human follows: which URL to
open, what to do there, where the value is shown, which variable it
fills — "Dashboard → Developers → API keys → Reveal test key → copy".
Where the current UI or exact command is unknown, say so and ask the
user or check the docs — never invent steps that may not exist.

**Done when:** every stage traces to concrete instructions a stranger
could follow.

## 3 — Author the wizard

Copy `scripts/template.sh` to the target path. Replace the example stage
with one `stage` per step, in dependency order, using the library
helpers — `stage`, `say`/`step`, `open_url`, `ask`/`ask_secret`,
`write_env`, `set_secret`/`set_var`, `pause`/`confirm` — and set
`TOTAL_STAGES` and `TOTAL_MINUTES` to honest estimates (this drives the
time-remaining display).

Hold the bar the template sets: open the URL before asking for its
value, `ask_secret` for anything secret, `write_env` every persisted
value, `set_secret` only what CI actually needs, `confirm` before any
irreversible action. Each `stage` clears the screen so only the current
step is visible — keep a stage to one focused task so nothing the human
needs scrolls away. Don't touch the library above the marker.

## 4 — Verify and hand off

- `bash -n <script>`; run `shellcheck` if available; `chmod +x <script>`.
- Don't run it end-to-end — it opens browsers and blocks on human input.
  Trace it statically instead: every value from step 1 is captured and
  lands where step 1 said, and every `set_secret` name exactly matches a
  `secrets.*` reference in CI.
- Tell the user how to run it. If it's a repeatable setup path, commit
  it and link it from the README so the next person runs the script
  instead of asking an AI.
