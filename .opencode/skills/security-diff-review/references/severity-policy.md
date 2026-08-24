# Severity policy

*Adapted from openai/codex-security (Apache-2.0); see repo-root NOTICES.md.*

Severity is impact weighted by likelihood, then adjusted for who can
actually reach the path in the real deployment. Assign it on this fixed
basis so findings from different reviews stay comparable.

## Impact axis

- **Critical impact** — remote code execution, authentication bypass,
  arbitrary data exfiltration across tenants, privilege escalation to admin
  or root, unauthenticated write to a system of record.
- **High impact** — read of another user's or tenant's data, targeted write
  or corruption, SSRF reaching internal services, stored injection that
  executes for other users.
- **Medium impact** — self-scoped injection, information disclosure of
  non-sensitive internals, CSRF on a state-changing but non-critical action,
  denial of service requiring authentication.
- **Low impact** — disclosure with no attacker value, issues requiring
  implausible preconditions, defense-in-depth gaps with a working primary
  control.

## Likelihood axis (attacker prerequisites)

- **Plausible** — an anonymous or ordinary authenticated attacker can meet
  the preconditions with no special position.
- **Unlikely** — requires a specific role, a race, a leaked secret, or a
  chain of other conditions.
- **Unachievable in this deployment** — the precondition does not hold
  (feature disabled, path unreachable, control enforced upstream). Not a
  finding; record why.

## Deployment-context weighting

Apply after impact and likelihood. Reachability, strongest first:

`production-anon` > `production-auth` > `admin` > `ci` > `local-dev`

A high-impact defect reachable only from a local developer shell ranks below
a medium-impact defect reachable by an anonymous production request. Tag
every finding with its reachability and let the tag move the severity.

## Rating and priority mapping

| Severity | Typical shape | Priority |
|---|---|---|
| Critical | Critical impact, plausible, production-reachable | P0 |
| High | High impact, plausible; or critical impact, unlikely | P1 |
| Medium | Medium impact, plausible; or high impact, unlikely | P2 |
| Low | Low impact, or higher impact only in non-production reach | P3 |

## Downgrade triggers

Move a finding down a level when any of these hold, and record which:

- A compensating control exists and holds for this sink's context.
- Reachability requires a precondition that does not hold in production.
- Exploitation is possible only with access that would already imply a
  larger compromise (e.g. root on the host).
