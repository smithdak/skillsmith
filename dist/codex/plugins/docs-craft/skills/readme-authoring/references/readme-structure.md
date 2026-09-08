# Design the README around a reader's first success

*Adapted from github/awesome-copilot — create-readme (MIT); see repo-root
NOTICES.md.*

A README is a guided entry point. Its order depends on what the repository offers,
how readers obtain it, and what proves it useful. Use this reference to make those
choices; headings are not a required template.

## Establish a factual brief

Before outlining, identify the primary audience, job, first useful result, actual
installation route, essential prerequisites and meaningful limitation. Source these
from manifests, public interfaces, release configuration, examples and owner docs.
When something is unpublished, unsupported, proposed or unmeasured, keep that fact
visible where it affects a decision. Do not fill an evidence gap with promotional
language or a guessed command.

Choose the consumer before the contributor. A library user needs to call its API;
a CLI user needs to transform an input; a contributor needs a checkout and test
commands. If the repository is primarily a template or contribution project, its
checkout workflow may itself be the first-use path.

## Choose an order that fits the product

| Repository | Early proof | Route into first use |
|---|---|---|
| CLI | A small input → command → result | Real install or checkout steps, then that task |
| Library | A short public-API call and return value | Published package and runtime, then runnable usage |
| Web application | Existing screenshot of the core task | Demo link or local setup, including required services |
| Template | What the generated project contains | Create/copy steps and the first successful run |
| Documentation or dataset | A useful question it answers | A clear entry page, query or sample with its limitations |

Lead with the concrete job and reader. Follow with a small proof and the next action.
For a tool with nontrivial setup, an early demonstration may precede installation,
but label its prerequisites and later supply the full path. For a simple package,
installation and the useful example can be one compact section. A feature list
belongs early only when it helps readers evaluate fit better than an example does.

## Give every section a job

**Opening:** name the artifact, what it enables, and the distinction that matters.
Do not open with the repository's origin story, a slogan, or a list of “powerful”
capabilities. Preserve a distinctive existing voice without making claims stronger
than the evidence. A real screenshot, output or example usually proves more than
a banner. Badges are optional signals; each needs a valid target and useful meaning.

**First use:** declare the starting state, obtain the actual package or checkout,
create or point to usable input, perform a meaningful operation, and show what
success looks like. Put credentials, platform limits and write behavior before the
step they affect. Distinguish local-only work from commands that contact services.

**Fit and operating model:** explain a constraint or concept needed for safe,
successful use. A preview/apply distinction or an immutable/generated boundary can
be worth a small table or diagram. Internals that only maintainers need come later.

**Deeper paths:** use informative links to actual owner docs. Keep API catalogs,
contribution rules, license text and release history in their owner files. Link only
what exists; do not create empty sections to complete a conventional checklist.
Contributor commands follow the consumer path unless contributors are the audience.

Use a callout for a consequential prerequisite or trap, next to the affected action.
The correct number may be zero. If many sections need warnings, first consider
whether the reading order or default path needs repair. A short page can rely on the
host's heading outline instead of adding a manual table of contents.

## Review the finished page

- Read just the opening, headings, examples and links. Can a newcomer identify the
  job, fit, proof and next action without guessing?
- Trace first use from a clean starting point. Are directories, dependencies,
  sample data and credentials accounted for? Is success observable?
- Check claims, links, anchors, assets and command syntax against current sources.
  Execute safe local examples where practical; record unexecuted steps accurately.
- Inspect rendered Markdown at normal and narrow widths. Does its hierarchy survive
  without decorative emphasis? Does each visual add information?
- Remove repeated claims, filler sections and exhaustive reference material.
  Keep an important tradeoff even when it prevents a neat sales pitch.

Keep authoring notes and verification reports out of the finished README. If a
limitation affects users, express it as product guidance in the appropriate place.
GitHub reference: [README placement, links and navigation](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes).
