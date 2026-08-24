---
name: op-github-secrets
description: >-
  Wires GitHub Actions to pull secrets from 1Password at run time instead of
  storing long-lived copies in GitHub — using the 1Password load-secrets action
  with op:// references and a scoped service-account token, so CI reads secrets
  on demand and 1Password masks them in logs. Use this skill when the user says
  "load secrets from 1Password in GitHub Actions", "stop pasting secrets into
  GitHub repo settings", "use a 1Password service account in CI", or wants a
  workflow that resolves op:// references during a job. Not for local runtime
  injection (see op-secrets) or an interactive human setup script (see the
  wizard skill).
license: MIT
metadata:
  skillsmith-see-also: "op-secrets, wizard"
  skillsmith-invocation: "user"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# op-github-secrets

The goal is that GitHub Actions holds **one** secret — a scoped 1Password
service-account token — and every other credential is an `op://` reference
resolved during the job. That shrinks the blast radius (rotate one token, not
twenty copies scattered across repos) and keeps values out of GitHub's stored
secrets. 1Password masks resolved values in Actions logs, replacing an
accidentally-printed secret with `***`.

The credential boundary still holds: **never `echo` a resolved secret in a
step**, and never widen the service account beyond the vaults CI actually needs.

## 1 — Provision the service account and token

Create (or have the user create) a 1Password **service account** scoped to only
the vault(s) this repo's CI reads, with read-only access. Store its token as the
single GitHub repository (or environment/organization) secret, e.g.
`OP_SERVICE_ACCOUNT_TOKEN`. This token is the one value GitHub stores; guard it
like any other and prefer an Environment secret with required reviewers for
production.

**Done when:** the service account exists, is vault-scoped and read-only, and
its token is set as a GitHub secret — with the token value never echoed.

## 2 — Reference secrets, don't store them

For each secret a workflow needs, pick its `op://vault/item/field` reference.
Config that is not secret (public URLs, ids) stays as plain workflow env or
repo variables — do not route it through the vault.

## 3 — Author the workflow step

Use the official 1Password load-secrets action so references become masked env
vars for the job:

```yaml
- name: Load secrets from 1Password
  uses: 1password/load-secrets-action@v2
  env:
    OP_SERVICE_ACCOUNT_TOKEN: ${{ secrets.OP_SERVICE_ACCOUNT_TOKEN }}
    STRIPE_SECRET_KEY: op://CI/myapp-stripe/secret-key
    DATABASE_URL: op://CI/myapp-db/url
  with:
    export-env: true

- name: Use them
  run: ./deploy.sh   # secrets present as env vars, masked in logs
```

Alternatively, install the CLI (`1password/install-cli-action`) and wrap a step
in `op run -- <command>` — same model, useful when a step needs the `op` CLI for
more than injection. Pin the action to a released major (`@v2`) and match the
repo's existing action-pinning convention.

## 4 — Verify without leaking

- Every job that previously read `${{ secrets.X }}` now either loads `X` via the
  action or wraps its command in `op run`; the only remaining stored secret is
  the service-account token.
- No step echoes a secret; confirm masking by checking that a deliberately
  referenced value shows as `***` in a test log, not by printing the real value.
- The service account is read-only and vault-scoped — over-broad access is the
  main risk here.
- Report which references CI now depends on and confirm the token secret name
  matches the workflow exactly.
