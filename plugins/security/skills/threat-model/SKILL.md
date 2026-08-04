---
name: threat-model
description: >-
  Establishes a repository-scoped threat model before any security finding
  work begins: trust boundaries, assets, attacker stories, and a severity
  calibration basis the rest of the review inherits. Use this skill when the
  user says "threat model this service", "what's our attack surface", "map
  the trust boundaries before the audit", or before running a security
  review that would otherwise anchor to a single diff or subsystem. Not for
  triaging an existing finding, reviewing one changed file, or explaining a
  named vulnerability class.
license: MIT
metadata:
  skillsmith-see-also: "codebase-survey"
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# threat-model

*Adapted from openai/codex-security (Apache-2.0); see repo-root NOTICES.md.*

A threat model built after the findings rationalizes them; one built before
them decides what counts as a finding at all. Establish the model first, at
the altitude of the whole repository — a review scoped to a diff inherits
the diff's blind spots, and the most severe exposure is usually in code the
diff never touched.

## Scope the whole repository, not the diff

The threat model covers the deployable system, not the change under review.
Enumerate what an attacker would actually reach: network-facing entry
points, authentication and authorization surfaces, data stores, secrets,
and every place untrusted input crosses into trusted execution. Narrowing
to a subsystem is the single most common way a review misses the real
exposure — resist it even when the immediate task is a small change.

For an unfamiliar codebase, establish structure first (the codebase-survey
discipline produces the map this builds on): where the entry points are,
which modules hold secrets or touch the database, how requests flow.

## Separate production paths from developer tooling

A path reachable only by a developer running a local script is not the same
risk as a path reachable by an anonymous request in production. State the
deployment context for each surface: production, authenticated-user,
admin-only, CI, or local-dev-only. A finding on a dev-only path may be real
and still rank below a low-severity production finding — the calibration
depends on who can reach it.

## Produce the model

Write these sections:

- **Overview** — what the system is, what it protects, and the one or two
  assets whose compromise would matter most.
- **Trust boundaries and assumptions** — where control changes hands
  (client to server, service to service, tenant to tenant), and what each
  side is trusted to have already enforced. Every assumption is a candidate
  attacker entry.
- **Attack surface and attacker stories** — the reachable entry points,
  each with a concrete attacker narrative: who they are, what they start
  with, what they are trying to reach. Ground each story in a real entry
  point, not a hypothetical.
- **Severity calibration basis** — the impact-times-likelihood frame the
  review will apply, and the deployment-context weighting above. This is
  the basis every later finding cites, so it is fixed here, once.

Section-by-section guidance and a fill-in skeleton are in
[references/threat-model-guidance.md](references/threat-model-guidance.md).

## Boundaries

- The model is authoritative once written. If the user supplies a threat
  model, treat it as the fixed basis and extend it — do not silently
  replace their risk priorities with inferred ones.
- A threat model is not a finding list. It states what an attacker could
  aim at and how severity will be judged; the search for actual defects is
  a later, separate step.
- One model per repository and version. Re-derive it when the architecture
  changes, not per pull request.

## Verify before returning

The model names the trust boundaries and the highest-value assets, gives at
least one grounded attacker story per external entry point, and fixes a
severity basis that separates production reach from developer-only reach. A
model that lists components without stating who can reach them from outside
has described the system, not its threats.
