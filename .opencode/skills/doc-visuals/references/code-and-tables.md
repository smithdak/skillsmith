# Code blocks and tables — rules and before/after pairs

## Code blocks

1. **Every fence carries a language tag** — `sh`, `ts`, `json`, `diff`,
   `text` for trees and raw output. An untagged block gets whatever
   highlighting the renderer guesses.
2. **Commands and output never share a block.** Mixed blocks cannot be
   copy-pasted and cannot be scanned. Commands go in one `sh` block;
   output goes in a following `text` block, or inline as a `# =>`
   comment for a single short line.
3. **No prompt characters** (`$`, `>`) unless the block intentionally
   interleaves commands and output — prompts break paste.
4. **Show the minimum that runs.** Trim setup the reader already has,
   but never elide *inside* a command — `…` in a command produces a
   command that fails. Elision belongs in output only.
5. **Spell flags out in docs** (`--strict`, not `-s`) — a doc is read
   more than typed.
6. **Use `diff` fences for changes** instead of paired before/after
   blocks when the change is the point.

Before — mixed, untagged, unpasteable:

```text
$ npm run build
building...
done in 3s
$ npm test
42 passing
```

After — commands pasteable, output separated:

```sh
npm run build
npm test
```

```text
building... done in 3s
42 passing
```

## Tables

1. **A table holds short enumerable facts.** A cell that needs a full
   sentence marks a row that wants to be prose or a definition list —
   restructure rather than wrap.
2. **The left column is the scan key** — put whatever the reader looks
   up by there (flag, file, rule id), not prose.
3. **Explanation lives in surrounding prose,** not in cells. If every
   cell in a column starts with the same words, hoist those words into
   the header.
4. **Split by question** rather than building one mega-table with many
   axes; two small tables scan faster than one wide one.

Before — a cell doing a paragraph's job:

| Stage | What it does |
|---|---|
| validate | Runs quality rules V1–V14 and security rules S1–S7 over sources, builds the script inventory with SHA-256 hashes, and produces composition edges consumed downstream by the catalog. |

After — the table keeps the scan keys; prose keeps the explanation:

| Stage    | Rules       | Produces                            |
|----------|-------------|-------------------------------------|
| validate | V1–14, S1–7 | script inventory, composition edges |

The inventory carries a SHA-256 per script; edges feed the catalog —
details a reader wants once, in prose, not in every scan of the table.
