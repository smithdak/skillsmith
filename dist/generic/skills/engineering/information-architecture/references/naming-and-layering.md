# Naming and layering

Rules for the two moves the reader feels most: how deep the structure
goes, and what the pieces are called. A structure fails at these two long
before it fails anywhere else — a reader forgives a slightly wrong split,
but bounces off a name that lies or a tree they have to spelunk.

## Layering: depth is a tax

The landing surface is the first thing opened — a README, an index, a
folder's top level. It carries the map and the ~20% every reader needs,
and nothing else. Everything past that is on-demand detail, and every hop
down to reach it is a cost the reader pays.

- **Two levels, then justify.** Landing surface → detail is free. A third
  level needs a reason stated out loud (a genuinely nested domain, not
  tidiness). Past three, the reader is spelunking.
- **Flat-but-labeled beats deep-but-tidy.** Ten well-named files in one
  folder are found faster than the same ten sorted into four
  sub-folders. Nest only when a group is both large and independently
  navigated.
- **The landing surface is a map, not a store.** If it cannot be scanned
  in one pass, it is holding detail that belongs one level down. The test:
  a reader should finish the landing surface knowing *where* everything
  is, not *everything*.
- **One level of references.** On-demand detail sits exactly one hop from
  the thing that sends you there. A reference that links to another
  reference is a level too deep — promote it or fold it in.

## Naming: the name is the index

A reader chooses a file by its name before opening it, so the name does
the routing. Three properties make names route correctly.

- **Parallel.** Names in a set share a grain and a part of speech.
  `installing.md`, `configuration`, and `how-to-deploy` are three
  different shapes; pick one — `install.md`, `configure.md`,
  `deploy.md` — so the set reads as a set.
- **Predictable.** A reader should guess the name before seeing it. Say
  what is inside, not how it was made: `auth.md` over `notes-2.md`,
  `troubleshooting.md` over `misc-issues.md`.
- **Disjoint.** No two names a reader could reasonably confuse. If someone
  would hesitate between `setup.md` and `getting-started.md` for the same
  question, one home is missing or two are the same.

### Anti-patterns

| Smell | Why it fails | Fix |
| --- | --- | --- |
| `misc/`, `other/`, `stuff/` | a confession that a home is missing | name the real category, or distribute the items to homes that exist |
| `utils/`, `helpers/`, `common/` | grab-bags that grow without bound | split by what the items are *for*, not that they are shared |
| `docs2/`, `notes-new/`, `final-v3/` | encodes history, not content | name by content; version in git, not the filename |
| `overview.md` **and** `intro.md` | overlapping homes, reader guesses | merge, or draw a sharp line and name each by its distinct question |
| deep `a/b/c/d/thing.md` | depth the reader must spelunk | flatten; nest only a large, independently-navigated group |

## Ordering

Order by the reader's journey, not the alphabet — unless the set is a
lookup table (a glossary, an API index) where alphabetical *is* the
journey. The first item a reader needs comes first; the reference they
consult occasionally comes last. When in doubt, order the landing
surface's links the way a newcomer would walk them.
