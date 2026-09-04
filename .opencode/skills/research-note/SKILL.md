---
name: "research-note"
description: "Investigates a question against primary sources and lands the findings as a durable, cited Markdown note in the repo. Use when the user says \"research X and write it up\", \"look into this and leave notes in the repo\", or wants reading legwork made a permanent reference. Not for one volatile fact (ground-truth-research), a fan-out report (deep-research), or summarizing a supplied document."
license: "MIT"
metadata:
  skillsmith-composes: "ground-truth-research"
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
---

# research-note

An answer in chat dies with the scrollback; the deliverable here is a
note in the repo that outlives the conversation and needs none of it.
One note answers one question — a question that turns out to be three
becomes three notes, or one note with explicit sub-questions, never a
sprawl.

## Investigate at the source

Work from primary sources — the source code, the official docs,
release notes, the spec, first-party announcements — and follow every
claim back to the source that owns it, not a secondary write-up of
one. The ground-truth-research discipline applies in full: volatile
facts verified live, every time-sensitive claim carrying its as-of
date. A note is worth committing precisely because its claims are
load-bearing; an uncited claim in a committed note is a defect that
future work inherits.

The investigation delegates well: hand the question to a subagent and
keep the main thread working — the note is what comes back, and its
quality bar does not change with who wrote it.

## Write the note

Place it where the repo already keeps such notes; absent any
convention, create `docs/research/<slug>.md` and report where it
landed. Structure, in order: the question, the answer up front — a
reader who stops after the first section leaves correct — findings
with a citation per claim (link plus date accessed), what was *not*
established, and the source list. Date the note itself: research is a
snapshot, and an undated snapshot is indistinguishable from a current
one.

## Verify before returning

Every claim traces to a source that owns it; the note stands alone
for a reader with no access to this conversation; whatever could not
be established is stated as an open question, never smoothed over.
Report the note's path as the result — the findings live there, not
in the chat.
