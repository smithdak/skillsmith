---
name: "information-architecture"
description: "Organizes content or a pile of files into a structure a stranger can navigate: what splits, how pieces nest, what lands up front. Use when the user says \"organize these files\", \"this doc should be split up\", \"where should this live\", or a doc or folder has become one long dump. Not for diagrams and trees (doc-visuals), a README rewrite (readme-authoring), or repo orientation (codebase-survey)."
license: "MIT"
metadata:
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
  skillsmith-see-also: "doc-visuals"
---

# information-architecture

Organize content around how readers retrieve it. A useful structure lets a
stranger predict where to look and reach the answer without knowing the
history of the files.

## Inventory and audience

Identify the audience and the questions they arrive with. List actual files or
sections before moving anything. Use [scripts/inventory.sh](scripts/inventory.sh)
from its installed location for file counts or a Markdown heading outline;
read-only manual enumeration is sufficient when the helper cannot run.

Separate source, generated, historical, and maintained reference material.
Preserve ownership and links while changing navigation.

## Group and layer

Group pieces by the task or question that reaches them. Give each maintained
fact an authoritative home; indexes and alternate navigation may link to that
home without copying the content. Split when audiences, update cadence, or
retrieval paths differ. Merge sections habitually read together.

Keep common prerequisites and the navigation map near the entry point. Put
conditional detail behind descriptive links. Prefer shallow navigation, but
use deeper structure when the reader's task actually benefits from it rather
than enforcing a universal depth limit.

Choose parallel, predictable names and state what belongs in each collection.
Use [references/naming-and-layering.md](references/naming-and-layering.md) for
naming decisions and [references/splitting.md](references/splitting.md) for
extracting an existing large document.

## Move without breaking retrieval

Keep an established entry path as an index or provide an explicit replacement.
Update inbound links and anchors affected by extraction. Change generated
surfaces through their source. Apply moves when requested; an assessment-only
request produces a proposed mapping.

Use doc-visuals for rendering when available, or show a simple verified tree
inline. The visual should expose the navigation decision, not duplicate every
file in the repository.

## Completion

Check representative reader tasks against the structure. Every item has an
intended home, every maintained destination is reachable, and moved references
resolve. Explain material placement choices and unresolved ownership. Do not
claim that a simulated location guess proves real user findability.
