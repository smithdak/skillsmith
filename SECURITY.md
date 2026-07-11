# Security

Skills execute code in consumers' environments. This repo's guarantees:

- Every shipped script appears in the generated catalog's script inventory
  (path, interpreter, network flag, SHA-256) — see catalog/CATALOG.md.
- Network-touching scripts must be explicitly allowlisted in skillsmith.toml
  ([policy]."network-allowlist"); CI fails otherwise (rule S2).
- External marketplace sources must be sha-pinned (rule S5).
- Secrets patterns fail CI (rule S4).

What this does NOT guarantee: behavioral review of script logic. Read the
inventory before installing. Report issues via the repository issue tracker.
