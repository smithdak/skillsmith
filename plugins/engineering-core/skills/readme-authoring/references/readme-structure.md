# README structure

*Adapted from github/awesome-copilot — create-readme (MIT); see repo-root
NOTICES.md.*

Copy the skeleton, then consult the per-section guidance and the pre-publish
checklist below it.

```markdown
# <project>

<badges: build status, version, and one or two real signals>

**<One sentence: what this is.>** <One or two more: what it does for whom.>

<link row: Quick start · Features · How it works · Development · Docs>

<Paragraph: the problem that justifies the project.>

## Features
## Quick start
## <How it works — the model the user must hold>
## Development
## <Repository map / project layout, if the repo is large>
## Documentation
```

## Per-section guidance

**Header** — the name, then badges that carry real signal (CI status,
released version, size of the thing). Skip badges that assert something the
repo does not back up. The bold one-liner is the sentence someone would
repeat to a colleague; write it before anything else. The link row is
navigation for a long page — omit it on a short one.

**Problem paragraph** — what goes wrong without this project. A README that
opens with capabilities and never states the problem reads as a feature list
for something the reader has no reason to want.

**Features** — capabilities, not adjectives. "Deterministic output — the same
sources produce byte-identical artifacts on any platform" beats "powerful and
reliable." Each bullet should be something a competitor could fail to do.

**Quick start** — the shortest path from nothing to a working result. Install
command, minimum configuration, first successful use. Every command here must
have been run as written. Prerequisites go inline or in an admonition, not in
a separate section the reader reaches after failing.

**How it works** — the mental model, including any invariant the user can
violate (generated files, required version bumps, ordering constraints).
This is where an admonition earns its place.

**Development** — setup, the command table, and the gate that must pass before
a change is proposed. Keep it after the consumer sections; a contributor will
scroll, an evaluator will not.

**Documentation** — a table of the deeper docs with one line each on what is
inside. This is the README's exit ramp, and it is what lets every other
section stay short.

## Admonition guide

| Syntax | Use for |
|---|---|
| `> [!NOTE]` | Context a reader benefits from but can proceed without |
| `> [!TIP]` | A better path most readers miss |
| `> [!IMPORTANT]` | Something required for correct use |
| `> [!WARNING]` | An action with a cost or a trap that bites in practice |
| `> [!CAUTION]` | Risk of data loss or a hard-to-reverse outcome |

Two to five across a whole README is a healthy range. More than that and
readers start skipping them, which costs you the one that mattered.

## What does not belong

- **License text** — a badge and a `LICENSE` file.
- **Contribution process** — link `CONTRIBUTING.md`.
- **Changelog or release history** — link `CHANGELOG.md` or the releases page.
- **Security policy** — link `SECURITY.md`.
- **Exhaustive API or option reference** — link the docs; the README shows the
  common path only.
- **Roadmap promises** — they age badly and rarely get updated.

## Pre-publish checklist

**Accuracy (the failure mode that matters most)**
- [ ] Every count and inventory was derived from the repository just now.
- [ ] Module, command, and option names match the actual source.
- [ ] Every documented command was run as written and succeeded.
- [ ] Every link resolves to a path that exists.
- [ ] Badges reflect real signals, and each points somewhere useful.

**Structure**
- [ ] A reader can answer "what is this" from the first two sentences.
- [ ] Install and first use precede contributor tooling.
- [ ] No section duplicates a dedicated file.
- [ ] Deep material is linked, not inlined.

**Formatting**
- [ ] Admonitions used sparingly and for the right severity.
- [ ] Emoji sparse or absent.
- [ ] A logo appears only if the project actually has one.
- [ ] Tables hold short enumerable facts; explanation sits in prose.
- [ ] Trees, diagrams, and code blocks follow the doc-visuals rules.
