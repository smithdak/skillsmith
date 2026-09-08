---
name: "threat-model"
description: "Whole-repo threat model, built before security review: trust boundaries, assets, attacker stories, and the severity basis reviews inherit. Use when the user says \"threat model this service\", \"what's our attack surface\", or \"map the trust boundaries\". Not for accidental failures (failure-mode-analysis), one change (security-diff-review), or fixing findings (hardening-proposal)."
license: "MIT"
metadata:
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
  skillsmith-see-also: "codebase-survey"
---

# threat-model

*Adapted from openai/codex-security (Apache-2.0); see repo-root NOTICES.md.*

Map assets, attacker capabilities, entry points, and trust boundaries so later
reviews can assess vulnerabilities on a consistent basis.

## Establish the system and scope

Use the requested service or repository as the starting boundary. Trace its
relevant dependencies and external interfaces far enough to understand trust
changes. State exclusions; do not expand a scoped request into an unrelated
whole-repository audit. Use codebase-survey when available for orientation, or
inspect entry points, deployment configuration, and sensitive operations directly.

Identify valuable data and operations, principals, tenant boundaries, and where
untrusted input reaches privileged behavior. Distinguish stated deployment
assumptions from verified configuration. Record what must be true for existing
controls to hold.

## Build attacker stories

For each material entry point identify an attacker, their starting access,
the asset or operation they seek, and the path across a trust boundary. Ground
stories in real interfaces while keeping hypothetical exploits distinct from
confirmed findings. Account for authenticated users, administrators, supply
chain or CI access, and anonymous production traffic where relevant.

Developer-only reach is a different prerequisite from anonymous reach; neither
is automatically low impact. A CI compromise exposing deployment credentials
can matter more than a low-impact public endpoint. Rank using both access
conditions and consequences.

## Write and calibrate

Follow the repository's model location, or use docs/THREAT_MODEL.md when none
exists. Include scope, assets, trust boundaries, attacker stories, assumptions,
controls, and a severity basis with its rationale. The expanded format is in
[references/threat-model-guidance.md](references/threat-model-guidance.md).

Preserve the user's risk priorities and existing model. Identify contradictions
with observed behavior and propose explicit updates; writing a model does not
make every assumption permanently authoritative. Revise when architecture,
exposure, or important assumptions change.

## Completion

The model connects attackers to assets through actual boundaries and makes
uncertainty visible. It supplies a consistent assessment basis without claiming
that listed threats are discovered vulnerabilities. Report the artifact and
material coverage limits.
