# Archive

Skills retired from the catalog on 2026-09-03, when the catalog was curated
down to the disciplines that separate a frontier model from a weaker one:
verification before claiming done, elicitation before building, root-cause
discipline, adversarial self-review, live-source grounding, clean handoffs, and
architecture. What was cut is domain content a capable model already carries,
or a procedure tied to one tool.

Nothing here is discovered, validated, or generated: the pipeline scans only
`skills/*/*/SKILL.md`. Each folder is the skill exactly as it last shipped —
`SKILL.md`, `evals/`, `references/`, `scripts/` — moved with `git mv`, so
`git log --follow` still reaches its history. Third-party attribution in
[NOTICES.md](../NOTICES.md) continues to apply to archived files.

## Layout

Folders mirror the live plugin taxonomy so a reader who knows the catalog can
guess where a retired skill sits:

```
archive/skills/
  marketing/   content and growth skills (former `marketing` plugin)
  ops/         tool-specific secrets handling (former `secrets-ops`)
  workflow/    git and issue-tracker procedures
  judgment/    reasoning aids retired in favour of the planning plugin
  planning/    multi-session planning orchestrators
  security/    policy-document authoring
```

## Index

| Skill | Path | Former plugin | Why archived | Reach for instead |
|---|---|---|---|---|
| brand-voice | `skills/marketing/brand-voice/` | marketing | Domain content; extracts a voice spec from copy samples. Adapted material — see NOTICES. | prose-hygiene for editing voice into a document |
| content-angles | `skills/marketing/content-angles/` | marketing | Domain content; content ideation. | research-note for grounded topic research |
| content-scorer | `skills/marketing/content-scorer/` | marketing | Domain content; expert-panel scoring of marketing copy. | falsification-review for adversarial review of a draft |
| growth-experiments | `skills/marketing/growth-experiments/` | marketing | Domain content; A/B test design. | second-order-effects for what a change sets in motion |
| outbound-builder | `skills/marketing/outbound-builder/` | marketing | Domain content; cold-email sequences. | — |
| podcast-repurposer | `skills/marketing/podcast-repurposer/` | marketing | Domain content; transcript to assets. | — |
| seo-brief | `skills/marketing/seo-brief/` | marketing | Domain content; keyword briefs. | — |
| op-secrets | `skills/ops/op-secrets/` | secrets-ops | Procedure tied to 1Password's `op` CLI. | wizard to script the manual steps |
| op-github-secrets | `skills/ops/op-github-secrets/` | secrets-ops | Procedure tied to 1Password service accounts and `gh secret`. | wizard |
| stacked-prs | `skills/workflow/stacked-prs/` | pr-workflow | Procedure tied to the `gh stack` extension; longest description in the catalog. Adapted material — see NOTICES. | handoff for state between sessions |
| issue-triage | `skills/workflow/issue-triage/` | productivity-tools | Tracker state machine; process routing rather than reasoning. | define-work-items for the write-up once a ticket is understood |
| estimate | `skills/judgment/estimate/` | epistemics | Calibrated ranges are covered by premortem (risk) and grilling (unknowns) in the planning plugin. | premortem, grilling |
| discernment-nudge | `skills/judgment/discernment-nudge/` | epistemics | Appends follow-up questions after advice; about the reader's discernment more than the model's. Adapted material — see NOTICES. | communication-contract, which calibrates the answer itself |
| discovery-map | `skills/planning/discovery-map/` | engineering-core | Multi-session investigation map; overlapped grilling, feature-spec, and define-work-items and was the heaviest cross-plugin composer. | grilling to resolve unknowns, then define-work-items per session |
| define-security-policy | `skills/security/define-security-policy/` | security | Writes SECURITY.md interactively; a document template, not review discipline. Adapted material — see NOTICES. | threat-model for the scope it would have documented |

## Un-archiving

Move the folder back under `skills/<category>/`, add the skill to exactly one
`[[plugin]]` in `skillsmith.toml`, rewrite the description to the current
contract (≤ 400 characters, siblings named in the boundary clause), then
`validate --strict`, re-measure with `eval`, and add a CHANGELOG entry under
the plugin that gains it.
