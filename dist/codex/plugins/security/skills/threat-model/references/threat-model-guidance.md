# Threat model guidance

*Adapted from openai/codex-security (Apache-2.0); see repo-root NOTICES.md.*

Copy the skeleton, then consult the per-section guidance below it.

```markdown
# <System> — Threat Model

*Scope: the deployable system. As-of: <date / commit>.*

## Overview
## Trust boundaries and assumptions
## Attack surface and attacker stories
## Severity calibration basis
```

## Per-section guidance

**Overview** — one paragraph: what the system does, what it protects, and
the one or two assets whose compromise would matter most (customer data, a
signing key, tenant isolation, funds movement). If you cannot name the crown
jewels, the rest of the model has no yardstick.

**Trust boundaries and assumptions** — a boundary is any point where control
or data crosses from one trust level to another: client to server, service
to service, tenant to tenant, unauthenticated to authenticated, user to
admin, third-party input to internal execution. For each, state what the
receiving side assumes the sending side already enforced. Those assumptions
are the attack surface: an attacker's job is to violate one.

**Attack surface and attacker stories** — list the reachable entry points
(routes, queue consumers, file/upload handlers, deserializers, webhooks,
CLI/admin tooling). For each, write a one-line attacker story grounded in
that entry point: *who* they are (anonymous internet, authenticated tenant,
compromised dependency, malicious insider), *what they hold* at the start,
and *what they are reaching for*. Prefer stories tied to a concrete route or
handler over abstract categories.

**Severity calibration basis** — fix the frame the review inherits:
- **Impact** — what an attacker gains if the exposure is real (data read,
  data write, code execution, privilege escalation, denial of service).
- **Likelihood** — attacker prerequisites: plausible, unlikely, or
  requiring conditions that do not hold in this deployment.
- **Deployment weighting** — reachable by an anonymous production request
  outranks authenticated-user reach, which outranks admin-only, which
  outranks CI or local-dev-only. Record the weighting once here so every
  finding cites the same basis instead of re-arguing severity.

## Production vs developer-only paths

Tag each surface with its reachability: `production-anon`,
`production-auth`, `admin`, `ci`, or `local-dev`. A path an attacker reaches
only by already running code on a developer's machine is a materially
smaller risk than an anonymous production path, and the tag is what keeps a
dev-only issue from being ranked as if it were internet-facing.

## Anti-patterns

- Scoping the model to the diff or one module — the worst exposure is
  usually elsewhere.
- Listing components instead of boundaries — a component inventory is not a
  threat model; the boundaries between components are.
- Attacker stories with no starting position — "an attacker could" without
  what they hold or where they stand is not calibratable.
- Deferring severity to each finding — without a fixed basis, severities
  drift and cannot be compared.
