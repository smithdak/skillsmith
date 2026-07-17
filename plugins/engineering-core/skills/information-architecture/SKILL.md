---
name: information-architecture
description: >-
  Organizes a body of content or a pile of files into a structure a
  stranger can navigate — deciding what splits into its own file, how
  pieces nest, what lands up front versus on demand, and how each is
  named, ordered, and linked. Use this skill when a document or README
  has grown into one long dump, when a folder or repo has become a flat
  or "misc"-ridden pile, or when the user says "organize these files",
  "this doc should be split up", "where should this live", "give this a
  sensible structure", or "the information architecture is a mess". Not
  for authoring the visual elements inside a document (see doc-visuals),
  writing the prose, or reviewing technical correctness.
license: MIT
metadata:
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
  skillsmith-see-also: "doc-visuals"
user-invocable: true
---

# information-architecture

A structure is good when a stranger can predict where anything lives
before opening it. The long file and the flat, "misc"-ridden folder fail
the same test: both are organized by the order things were *produced*,
not the way they will be *retrieved*. Information architecture is the
arrangement — what splits, what nests, what lands up front — that makes
the map match the reader's guess.

Two disciplines govern every structure:

1. **Organize by retrieval, not by production.** The unit of structure is
   the question someone arrives with. Cluster pieces by the journey that
   reaches them and name each cluster by the question it answers — not by
   when it was written or which system produced it. An outline that
   mirrors the author's process is an accident the reader has to decode.
2. **Every item one obvious home; every home reachable.** Each piece
   belongs in exactly one place a reader would look first, and every place
   is reachable from the index. Two homes for one thing means the reader
   guesses wrong half the time; a "misc" bucket is the confession that a
   home is missing; an item reachable from nowhere may as well be deleted.

## Inventory from ground truth

Never restructure from memory. List the actual pieces first: for a folder,
its items with sizes and counts; for an over-long file, its latent
sections. Run `scripts/inventory.sh <path>` — it prints a directory's
entries with line counts, or a markdown file's heading outline with the
line span of each section, so the seams and the bloat show as fact rather
than recollection. You cannot cluster what you have not enumerated.

## Cluster, layer, name, place

The method is four moves over the inventory:

- **Cluster by retrieval.** Group the pieces by the question or journey
  that reaches them. A group earns its own file or folder when it answers
  a distinct question *and* is reached by a distinct path; if two
  candidate groups are always read together, they are one.
- **Layer by attention.** The landing surface holds the map plus the ~20%
  every reader needs; the rest is on-demand detail, one level down. Depth
  is a tax — each hop is a cost the reader pays, so a flat set of
  well-named files beats a tidy deep tree past two levels. Detail nested
  deeper than that is either a reference that wants promoting or content
  that wants cutting.
- **Name as the index.** A name is a promise about what is inside and a
  fence against what is not. Names in a set stay parallel (same grain and
  part of speech), predictable (guessable before opening), and disjoint
  (no two a reader could confuse). Ordering, casing, and the
  anti-patterns — "misc", "utils", overlapping names — are in
  [references/naming-and-layering.md](references/naming-and-layering.md).
- **Place and check.** Every item lands in one home; the index links every
  home. Nothing orphaned, nothing in two places, no dumping ground.

## Splitting an existing dump

The common request is reactive: one file has grown too long, or a folder
has gone flat. The move is the same method run from the inventory — but
the seams have to be *found*, not assumed. The full playbook (detecting
topic and audience shifts, the must-know / on-demand fault line,
extraction mechanics, and keeping the original file as the landing
surface so inbound links survive) is in
[references/splitting.md](references/splitting.md). The one rule that
governs it: the file everyone already links to stays as the map and keeps
its name; the detail moves out beneath it, never the other way around.

## Rendering is a separate job

Information architecture decides the structure; it does not draw the tree,
the diagram, or the tables that live inside a document — that discipline
runs after the structure is settled. Deciding a repository map belongs in
the README is this skill; making that map scan is doc-visuals.

## Verify before returning

- **Predict-the-location test.** Cover the tree, name three things a
  reader would look for, and check each lands on the right file on the
  first guess. A miss is a naming or clustering fault, not the reader's.
- Every item from the inventory has exactly one home, and every home is
  reachable from the index.
- No "misc"/"other" bucket, and no two names a reader could reasonably
  confuse.
- Nothing nests more than one level below the landing surface without a
  reason named out loud.
- The landing surface scans in a single pass — it is the map plus the
  must-know, not the whole store.
