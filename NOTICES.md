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

---

## openai/codex-security

- Source: https://github.com/openai/codex-security
- License: Apache License 2.0, Copyright 2025 OpenAI
- Adapted into: `skills/engineering/threat-model/`,
  `skills/engineering/security-diff-review/`,
  `skills/engineering/hardening-proposal/`,
  `skills/engineering/define-security-policy/`, and the
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
  `skills/misc/brand-voice/references/ai-slop-patterns.md`.
- Nature of changes: the AI-writing "slop" pattern taxonomy and the
  protect-intentional-style principle were adapted as an anti-pattern
  reference for the existing `brand-voice` skill. The original is a distinct,
  actively maintained skill under its author's name; this repository adapts
  the taxonomy with attribution rather than redistributing the skill.

MIT license terms (permission notice) — the software is provided "as is",
without warranty; the copyright and permission notice are retained here per
the license.
