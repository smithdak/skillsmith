# Third-party notices

Some skills in this repository are adapted from external open-source
projects. Portions of their methodology were re-expressed in skillsmith's
own voice and format; the license and attribution for each source are below.
Files that carry a substantial adaptation include an inline "Adapted from …"
line pointing back here.

This repository as a whole is MIT-licensed (see [LICENSE](LICENSE)). That
grant covers skillsmith's own work; material adapted from the projects listed
below remains subject to its original license, and the notices here are what
satisfy those terms. Apache-2.0 material in particular carries a
state-your-changes obligation, met by the inline "Adapted from …" lines in the
affected files.

Skills retired from the catalog live under [archive/](archive/README.md); the
obligations below follow them there unchanged.

---

## openai/codex-security

- Source: https://github.com/openai/codex-security
- License: Apache License 2.0, Copyright 2025 OpenAI
- Adapted into: `skills/engineering/threat-model/`,
  `skills/engineering/security-diff-review/`,
  `skills/engineering/hardening-proposal/`,
  `archive/skills/security/define-security-policy/` (archived), and the
  `skills/engineering/falsification-review/references/validation-guidance.md`
  reference.
- Nature of changes: the methodology (threat-model structure, the
  source/control/sink/reachable-path/boundary assessment, severity
  calibration, class-specific validation proof tuples, and the
  options-with-tradeoffs proposal format) was rewritten from scratch in
  skillsmith's format. All Codex-specific tooling — the SQLite workbench,
  MCP server, scan-contract JSON, capability preflight, and Python scripts —
  was omitted, not ported.

The Apache 2.0 license requires that adapted files state they were changed
(§4(b)); the inline "Adapted from openai/codex-security (Apache-2.0)" lines
in those files satisfy this. A copy of the Apache License 2.0 is available at
https://www.apache.org/licenses/LICENSE-2.0 .

---

## github/awesome-copilot

- Source: https://github.com/github/awesome-copilot
- License: MIT, Copyright GitHub, Inc.
- Adapted into: `skills/engineering/readme-authoring/` (from the
  `create-readme` skill), including its structure reference.
- Nature of changes: the README guidance (section ordering, the rule that
  LICENSE/CONTRIBUTING/CHANGELOG belong in dedicated files, GFM and GitHub
  admonition usage, emoji restraint, conditional logo use) was re-expressed
  in skillsmith's format and extended with a derive-claims-from-the-repository
  discipline and a pre-publish accuracy checklist. The original's runtime
  dependency on fetching four external exemplar READMEs was replaced with an
  inline structural skeleton.

MIT license terms (permission notice) — the software is provided "as is",
without warranty; the copyright and permission notice are retained here per
the license.

---

## davidondrej/skills

- Source: https://github.com/davidondrej/skills
- License: MIT, Copyright (c) 2026 David Ondrej
- Adapted into: `skills/engineering/skill-authoring/` (from the
  `effective-agent-skills` skill) and the corroboration / gap-round
  discipline added to `skills/engineering/ground-truth-research/` (from the
  `research-prompt` skill).
- Nature of changes: the authoring guidance and research-completion
  discipline were re-expressed in skillsmith's voice and scoped to this
  repo's conventions.

MIT license terms (permission notice) — the software is provided "as is",
without warranty; the copyright and permission notice are retained here per
the license.

---

## Leonxlnx/taste-skill

- Source: https://github.com/Leonxlnx/taste-skill
- License: MIT, Copyright (c) 2026 Leonxlnx
- Adapted into: `skills/engineering/frontend-craft/` (from the core
  anti-slop design discipline) and `skills/engineering/frontend-redesign/`
  (from the Scan → Diagnose → Fix redesign workflow), including their
  reference checklists.
- Nature of changes: the design-craft discipline (brief inference, the
  variance/motion/density dials, the banned-defaults list, the pre-flight
  and redesign audit checklists) was re-expressed in skillsmith's voice and
  scoped to two workflow skills. The GSAP/Next-specific code skeletons, the
  image-generation and style-pack skills, the Google Stitch tool coupling,
  and the "simulate a Python RNG" pseudo-determinism mechanism were not
  carried over.

MIT license terms (permission notice) — the software is provided "as is",
without warranty; the copyright and permission notice are retained here per
the license.

---

## petergyang/no-ai-slop

- Source: https://github.com/petergyang/no-ai-slop
- License: MIT, Copyright (c) 2026 Peter Yang
- Adapted into:
  `archive/skills/marketing/brand-voice/references/ai-slop-patterns.md` (archived).
- Nature of changes: the AI-writing "slop" pattern taxonomy and the
  protect-intentional-style principle were adapted as an anti-pattern
  reference for the existing `brand-voice` skill. The original is a distinct,
  actively maintained skill under its author's name; this repository adapts
  the taxonomy with attribution rather than redistributing the skill.

MIT license terms (permission notice) — the software is provided "as is",
without warranty; the copyright and permission notice are retained here per
the license.

---

## anthropics/skills

- Source: https://github.com/anthropics/skills
- License: Apache License 2.0, Copyright Anthropic, PBC
- Adapted into: `skills/engineering/webapp-testing/` (from the
  `webapp-testing` skill, including `scripts/with_server.py` and the
  `references/playwright-patterns.md` reference) and
  `archive/skills/judgment/discernment-nudge/` (archived) (from the `discernment-nudge`
  skill).
- Nature of changes: the webapp-testing decision tree,
  reconnaissance-then-action pattern, and server-lifecycle helper were
  re-expressed in skillsmith's format. The helper was rewritten with
  process-group teardown on POSIX and Windows, a readiness host flag,
  per-server log files, and an already-listening check; the three example
  scripts were consolidated into one reference in both Python and
  TypeScript with the sandbox output paths removed. The discernment-nudge
  trigger and carve-out rules and the exact output format were kept; the
  description was rewritten to this repo's trigger-surface form and a
  boundary against the sibling `falsification-review` skill was added.

The Apache 2.0 license requires that adapted files state they were changed
(§4(b)); the inline "Adapted from anthropics/skills … (Apache-2.0)" lines in
those files satisfy this. A copy of the Apache License 2.0 is available at
https://www.apache.org/licenses/LICENSE-2.0 .

---

## deepseek-ai/deepseek-harness

- Source: https://github.com/deepseek-ai/deepseek-harness
- License: MIT, Copyright (c) 2026 DeepSeek
- Adapted into: `skills/engineering/prose-hygiene/` (from the
  `dsh-trim-cot-leakage` and `dsh-prose-standard` skills, including the
  recall batteries as `scripts/recall-batteries.sh` and the keep-rules and
  coverage-by-location references), `skills/engineering/postmortem/` (from
  `docs/postmortem/` — the write-one-when criteria and section structure),
  and `archive/skills/workflow/stacked-prs/` (archived) (from the `dsh-merging-stacked-prs`
  skill and the `responding-to-pr-review-on-a-stack` cookbook, including
  the `gh stack` command and GraphQL reference).
- Nature of changes: the leakage taxonomy, the resolvable-at-HEAD test, the
  complete-proposition rule, the required-coverage-by-location list, the
  post-mortem criteria and structure, and the stack landing and
  review-propagation procedure were re-expressed in skillsmith's voice and
  generalized away from the DeepSeek Harness repository. Everything specific
  to that repository — its Agent Notes system, pre-push check scripts,
  `change-scope` tooling, documentation budgets, bilingual pairing rules,
  the Chinese-language recall battery, and the harness-internal examples —
  was omitted, not ported. The recall-battery script gained a GNU grep
  fallback; the calibration examples were written fresh.

MIT license terms (permission notice) — the software is provided "as is",
without warranty; the copyright and permission notice are retained here per
the license.

*Adapted from pbakaus/impeccable (Apache-2.0): design-language concepts
in frontend-craft and frontend-redesign — visitor modes, direction
contracts, color-strategy ladder, reflex-face ban list, saturated-look
calibration, craft-floor bans, bounded verification passes, refinement-
vs-replacement semantics, and the dual-assessment critique structure in
frontend-critique. See https://github.com/pbakaus/impeccable.*

