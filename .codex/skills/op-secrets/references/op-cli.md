# op CLI — references, resolution, and auth

The `op` command-line tool resolves 1Password secret references and injects them
into processes. Verify exact flags against developer.1password.com, but the model
below is stable.

## Secret reference syntax

```
op://<vault>/<item>/<field>
op://<vault>/<item>/<section>/<field>
```

- The reference is a **pointer**, not the secret. It is inert until resolved by
  an authenticated `op`.
- Safe to commit: the value stays encrypted in 1Password and is fetched on
  demand, never stored on disk by the reference itself.

Read a single value (for scripting, not for printing to a log):

```sh
op read "op://Dev/myapp-stripe/secret-key"
```

## Injecting secrets into a process

### op run (default)

```sh
op run --env-file=.env -- your-app --flag
```

- Runs the app/script in a subprocess with the referenced secrets present as
  environment variables **for the duration of that process only**.
- Masks secret values in the command's output (do not defeat this with
  `--no-masking`).

### op inject (only when env vars won't do)

```sh
op inject -i config.tpl -o config.out
```

- Templates a file of `op://` references into resolved values. The output
  contains real secrets — write it to a gitignored/ephemeral path only, never a
  committed file.

## Authentication surfaces

- **Developer machine** — the 1Password desktop app integration / `op signin`,
  unlocked biometrically. Interactive; good for local dev.
- **Service Accounts** — a token for non-person automation, no desktop app or
  extra service to deploy. Scope it to the specific vaults and actions it needs
  (least privilege). Provide the token via `OP_SERVICE_ACCOUNT_TOKEN` in the
  environment. Preferred for CI and headless runs.
- **Connect** — a self-hosted server for higher-throughput/on-prem infra;
  heavier than service accounts. Reach for it only when a service account's
  scale or network model does not fit.

## Handling rules

- Never echo a resolved value to prove it worked — check exit status and app
  startup instead.
- Keep `OP_SERVICE_ACCOUNT_TOKEN` itself out of committed files; it is the one
  credential that is not an `op://` reference.
- Grep any file about to be committed for key-shaped strings before staging.
