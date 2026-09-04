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
`.env` upserts, `gh secret`/`gh variable` writes, a closing summary, and
`--list` / `--resume` / `--from N` handling with a state file. The job
here is only to scope the procedure and author its stages. The library
above the `STAGES` marker is identical in every wizard; that consistency
is the point — never hand-edit it, and `scripts/verify.sh` fails if it
was.

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
helpers — `stage`, `say`/`step`/`note`, `open_url`, `ask`/`ask_secret`,
`write_env`, `set_secret`/`set_var`, `pause`/`confirm`, `run` — and set
`TOTAL_STAGES` and `TOTAL_MINUTES` to honest estimates (this drives the
time-remaining display).

Hold the bar the template sets: open the URL before asking for its
value, `ask_secret` for anything secret, `write_env` every persisted
value, `set_secret` only what CI actually needs, `confirm` before any
irreversible action. Each `stage` clears the screen so only the current
step is visible — keep a stage to one focused task so nothing the human
needs scrolls away. Don't touch the library above the marker.

Two conventions the library depends on:

- Every command a stage executes goes through `run "what it does" cmd
  args...`. The library makes each helper a no-op under `--list` and in
  a stage skipped by `--resume`; a raw command in a stage body has no
  such guard and runs anyway. `confirm` passes in those modes, so
  `confirm "Drop the old DB?" && run "drop old DB" ...` is safe and
  `confirm ... && dropdb ...` is not.
- A captured value that is never persisted — it only drives a later step,
  such as a project id used to build a URL — gets `# pure` at the end of
  its `ask` line, so `verify.sh` knows it is intentional. Note that such
  a value is empty after `--resume` skips the stage that asked for it;
  `write_env` it if a later stage needs it.

Preview as you write: `bash <script> --list` prints every stage with the
values it captures and writes, without prompting, opening a browser, or
touching anything. It is the fastest way to check the plan from step 1
survived into the script.

## 4 — Verify and hand off

Run the deterministic checks:

```sh
scripts/verify.sh <script> <repo-dir>
```

It parses the script, runs `shellcheck` when installed, confirms the
library section is byte-identical to `template.sh`, checks
`TOTAL_STAGES` against the `stage` calls, cross-references every
`set_secret` name with `secrets.*` in `.github/workflows/*` (a mismatch
is a FAIL — CI would silently read an empty secret), every `write_env`
var with `.env.example`, and that every `ask` is persisted or marked
pure. Fix every FAIL; treat a warn as a question to settle with the user.
Then `chmod +x <script>` — on Windows the bit does not persist, so if the
wizard is committed set it in git (`git update-index --chmod=+x
<script>`) or Linux checkouts get a non-executable script.

Smoke-test without a human when it matters (a repeatable wizard that is
going to be committed): `WIZARD_NONINTERACTIVE=1` makes every
`ask`/`ask_secret VAR` read `$VAR` from the environment (unset is a hard
error naming the variable), auto-continues `pause`/`confirm`, and prints
URLs instead of opening them — so `WIZARD_NONINTERACTIVE=1 API_URL=...
API_TOKEN=... ENV_FILE=/tmp/x.env bash <script>` exercises the whole
flow in CI or a scratch directory. Don't run it interactively yourself —
it opens browsers and blocks on input.

Tell the user how to run it:

- `bash <script>` to run; `bash <script> --list` to preview the stages
  first; `bash <script> --help` for the flags.
- Interrupted (Ctrl-C, a closed tab, a failed `gh`)? `bash <script>
  --resume` skips the stages already completed and offers saved `.env`
  values as defaults; `--from N` restarts at stage N. Progress lives in
  `.<script-name>.state` in the directory the wizard was run from — stage
  numbers only, never a value or secret — and `finish` deletes it.
- For Windows users, name Git Bash explicitly — `& "C:\Program
  Files\Git\bin\bash.exe" <script>` from PowerShell — because a bare
  `bash` resolves to the WSL shim on most machines and dies with an
  execvpe error.
- If it's a repeatable setup path, commit it and link it from the README
  so the next person runs the script instead of asking an AI.
