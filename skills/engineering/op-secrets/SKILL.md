---
name: op-secrets
description: >-
  Moves a project's secrets out of plaintext and into 1Password secret
  references (op:// URIs) that resolve at runtime via the op CLI, producing a
  safe-to-commit .env template and an op run launch path so no real credential
  ever lands on disk. Use this skill when the user says "use 1Password for my
  env vars", "replace my .env secrets with op references", "set up op run for
  this project", "stop storing API keys in plaintext", or wants credentials
  injected from a 1Password vault at run time. Not for building an interactive
  service-setup script that captures values from a human (see the wizard skill),
  or for pushing secrets into GitHub Actions (see op-github-secrets).
license: MIT
metadata:
  skillsmith-see-also: "wizard, op-github-secrets"
  skillsmith-invocation: "user"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# op-secrets

A 1Password **secret reference** is a URI, `op://<vault>/<item>/<field>` (with
an optional section: `op://<vault>/<item>/<section>/<field>`), that *points at*
an encrypted secret rather than containing it. The reference is inert — only the
`op` CLI, authenticated to the vault, can resolve it — so references are safe to
commit to version control while the real values stay in 1Password and are
fetched on demand. This skill converts a project to that model.

The credential boundary is the whole point: **never print a resolved secret**,
never write a resolved value to a committed file, and never paste a real key
into chat. Work in references and let `op` resolve them at the last moment. See
[references/op-cli.md](references/op-cli.md) for the exact commands, auth
options, and masking behavior.

## 1 — Inventory the secrets

Read the project the way a fresh clone would: `.env`, `.env.example`, `.env.*`,
framework config, `docker-compose*`, and any `README` setup section. List every
secret-shaped value — API keys, tokens, connection strings, passwords — and,
for each, the env var name it fills and whether it is truly secret or just
config (URLs, ports, and public ids do not belong in a vault).

**Done when:** every env var is classified secret-or-config, and each secret has
a target `op://vault/item/field` chosen (existing item, or one to create).

## 2 — Author the reference template

Produce a committable `.env` (or `.env.template`) where each secret line is an
`op://` reference and each config line is a plain value:

```
DATABASE_URL=op://Dev/myapp-db/url
STRIPE_SECRET_KEY=op://Dev/myapp-stripe/secret-key
PORT=3000
```

If items do not exist in the vault yet, list the `op item create` commands (or
hand the human that step) — but do not fabricate field paths; a reference that
points at a missing item fails at resolve time. Where a value must be captured
interactively from a dashboard, that is the wizard skill's job — hand off.

## 3 — Wire runtime injection

Give the project a way to resolve references only in the process that needs
them, with nothing persisted:

- **`op run -- <command>`** runs the command with the referenced secrets present
  as environment variables for the process lifetime only, and masks them in
  output. This is the default for local dev and CI steps.
- **`op inject`** templates a file of references into resolved values — use only
  when a tool cannot read env vars, and never write the output to a committed
  path.

Choose non-interactive auth (a scoped **service account** token) for automation,
and the desktop app / biometric session for a developer's machine. Keep the
service account scoped to the minimum vaults.

## 4 — Verify without leaking

- `op run --no-masking -- printenv` is **not** how to check — that defers
  masking. Instead confirm resolution succeeds via exit status and that the app
  starts; never echo values to prove they resolved.
- Confirm the committed template contains only `op://` references and plain
  config — grep the diff for anything key-shaped before it is staged.
- State which vault and which auth method the project now depends on, and what a
  new developer must run (`op signin` / provide a service-account token) to
  start it.
