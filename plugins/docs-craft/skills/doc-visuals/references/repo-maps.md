# Repository maps — formatting rules and a worked example

A repository map answers one question: *where do I go for X?* It is a
navigation aid, not an inventory — the script output is the inventory;
the map is the curated view of it.

## The rules

1. **One entry per line.** Two directories sharing a line ("`misc/
   drafts/`") forces the reader to parse instead of scan, and breaks the
   annotation column.
2. **One annotation column, aligned.** Every annotation starts at the
   same column — two spaces past the longest path. Mid-file drift in the
   annotation column is the single most common cause of "hard to read".
3. **Annotations state role, not contents.** "the pipeline library", not
   "core package". If the annotation restates the path, cut it — an
   unannotated line is better than a redundant one.
4. **Depth is a budget.** Default two levels; go deeper only where the
   reader will actually navigate (source dirs), shallower where they
   won't (vendored, generated).
5. **Elisions carry counts.** `… 10 more skills` reads as scope;
   a bare `…` reads as fatigue. Get counts from the script, not by
   estimating.
6. **Mark generated territory.** When a repo mixes hand-edited and
   generated paths, the map must say which is which — it is the one fact
   a newcomer cannot see from the tree itself.
7. **About twenty lines.** A map that scrolls is a filing cabinet.
   Merge low-traffic siblings into one elided line before cutting
   anything the reader navigates to.
8. **Trailing slash on directories,** none on files. Order by the
   reader's journey — sources before generated, entry points before
   support — not strictly by alphabet.

## Worked example

Before — misaligned annotations, two dirs on one line, no
generated/source distinction:

```text
src/           app code
  api/    route handlers, one file per resource
  jobs/  cron/   background work
lib/     shared helpers
dist/          output
```

After — one column, one entry per line, roles and territory explicit:

```text
src/           app code (hand-edited)
  api/         route handlers, one file per resource
  jobs/        background workers
  cron/        schedule definitions the workers run on
lib/           helpers shared by api/ and jobs/
dist/          GENERATED build output — never edit
```

## Verify

Diff every path in the map against `repo-map.sh` output: no invented
paths, no stale names, counts match. Then cover the prose around the map
and check it still answers "where do I go for X?" on its own.
