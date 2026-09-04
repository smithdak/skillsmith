---
name: define-security-policy
description: >-
  Authors a repository's SECURITY.md interactively: scope, security
  invariants, what is in and out of bounds, reportability criteria, and
  accepted risks — with a diff preview and an approval gate before writing.
  Use this skill when the user says "write a SECURITY.md", "define our
  security policy", "document what's in scope for security reports", or
  "set up a vulnerability disclosure policy". Not for modeling threats,
  reviewing a change, or proposing fixes to existing findings.
license: MIT
metadata:
  skillsmith-see-also: "threat-model"
  skillsmith-invocation: "user"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# define-security-policy

A SECURITY.md is the contract a reviewer, a reporter, and a future
maintainer read to know what the project promises to defend and what it
does not. It is informational — it records intent and scope; it never
overrides the system's actual controls. Write it so a stranger can tell,
without asking, whether the bug they found is in scope and worth reporting.

## Gather the inputs

Before drafting, settle the questions the policy answers:

- **Scope** — which components, deployments, and versions the policy covers,
  and which are explicitly excluded (third-party services, demo code,
  deprecated branches).
- **Security invariants** — the properties the project commits to holding:
  tenant isolation, authentication on privileged routes, no secrets in
  logs. A threat model (`docs/THREAT_MODEL.md`, where one exists) is the
  source of these; the policy states them as public commitments.
- **Reportability criteria** — what counts as a reportable vulnerability
  versus an accepted limitation, so reporters self-filter.
- **Accepted risks and exclusions** — the things that are known and
  deliberately not defended (a debug endpoint gated to local-dev, rate
  limits left to the deployer). Naming them prevents re-litigating settled
  decisions.
- **Contact and disclosure process** — where to report, expected response
  window, and coordinated-disclosure expectations.

## Draft the document

Produce a SECURITY.md with these sections: Scope, Security Invariants,
Reporting a Vulnerability, Out of Scope / Accepted Risks, and Disclosure
Process. Keep each claim specific and testable — "admin routes require MFA"
rather than "we take security seriously." A policy of platitudes tells a
reporter nothing about whether their finding matters.

## Resolution and inheritance

Where multiple SECURITY.md files exist across a monorepo, the nearest one to
the code governs — a package-level policy refines the repository root rather
than contradicting it. State the inheritance explicitly when authoring a
nested policy, and remember the file is informational: it describes and
scopes, it does not enforce, and it cannot loosen a control the code
actually applies.

## Preview and approve before writing

Show the full drafted document, or a diff against the existing SECURITY.md,
and get explicit confirmation before writing to disk. A security policy is a
public commitment; it is not written silently. On approval, write to
`SECURITY.md` at the chosen level and confirm the path.

## Verify before returning

The document states scope and exclusions concretely enough that a reporter
can self-filter, lists invariants as testable commitments rather than
sentiment, and gives a working reporting path. The user saw the content and
approved it before it was written.
