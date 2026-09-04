# Splitting an existing dump

The reactive path: a file has grown into one long scroll, or a folder has
gone flat and unfindable. The method is the same — cluster, layer, name,
place — but run from an inventory of what already exists, and the seams
have to be *found* before anything moves.

## First, inventory the seams

Run `scripts/inventory.sh <path>` and read the output as a map of fault
lines, not a table of contents:

- For a **long file**, the heading outline with line spans shows where the
  bulk sits. A section that is a third of the file is either the real
  spine (keep it central) or a reference straining to get out (a run of
  detail readers consult occasionally, not read through).
- For a **flat folder**, the entries with counts show which names collide,
  which files are outliers by size, and whether any grouping exists at all.

## Find the fault lines

A file wants to split where the reader's need changes. Three seams recur:

- **Topic shift.** The subject changes and does not return. Setup, then
  API, then troubleshooting are three topics, each reached by a different
  question — three candidate files.
- **Audience shift.** The same page turns from "what a user needs" to
  "what a contributor needs". The must-know / on-demand fault line usually
  runs right along this seam: the user's 20% stays on the landing surface,
  the contributor's detail moves out.
- **Depth shift.** Prose that was walking the reader through a concept
  drops into exhaustive enumeration — every flag, every field, every edge
  case. Enumeration is reference material; lift it to a reference and
  leave a one-line pointer.

## Extract without breaking the reader

- **The landing file keeps its name.** Whatever everyone already links to
  — `README.md`, the folder's index — stays put and becomes the map. The
  detail moves *out beneath it*; the entry point never moves, or every
  inbound link and every reader's muscle memory breaks at once.
- **Leave a pointer where the content was.** An extracted section leaves
  one sentence that says what moved and links to it, so a reader mid-scroll
  is handed off, not dropped.
- **Move whole clusters, not stray paragraphs.** Extract a section that
  answers a distinct question in full. Splitting mid-question forces the
  reader to hold two files open — worse than the long scroll.
- **Cap the depth.** Extracted detail sits one level down. If a piece
  seems to need its own sub-folder, ask whether it is really that large or
  just tidy; usually a well-named sibling file is enough.

## Then verify as if authored fresh

Run the predict-the-location test from the main skill: cover the new tree,
name three things a reader would look for, and confirm each lands on the
first guess. A reactive split that passes this test is done; one that does
not has moved the mess, not resolved it.
