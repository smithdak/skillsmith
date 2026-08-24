---
name: deep-modules
description: >-
  Provides the deep-module design discipline — small interfaces hiding
  large implementations, seams, adapters, depth as caller leverage —
  for designing or critiquing module boundaries. Use this skill when
  the user asks to "design this module's interface", "decide where the
  seam goes", "shrink this API", "make this easier to test", or
  questions whether an abstraction earns its keep. Not for system-wide
  architecture documents, visual design, or mechanical refactors that
  change no interface.
license: MIT
metadata:
  skillsmith-see-also: "architecture-spec"
  skillsmith-invocation: "model"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# deep-modules

A module earns its existence by hiding more than it exposes: a small
interface over a large implementation. Depth is what callers and tests
buy — more behavior per unit of interface learned — and locality is
what maintainers get: change, bugs, and knowledge concentrated in one
place instead of smeared across call sites. Use the vocabulary below
exactly; consistent language is most of the leverage.

## Vocabulary

- **Module** — anything with an interface and an implementation,
  deliberately scale-agnostic: a function, a class, a package, a
  tier-spanning slice.
- **Interface** — everything a caller must know to use the module
  correctly: the type surface plus invariants, ordering constraints,
  error modes, required configuration, and performance
  characteristics. Always wider than the type signature.
- **Seam** — the place where behavior can be changed without editing
  that place; where a module's interface lives. Placing the seam is a
  design decision distinct from what sits behind it.
- **Adapter** — a concrete thing satisfying an interface at a seam. A
  role, not a substance: a thin adapter can front a large
  implementation (a Postgres repo) or a fat one a tiny fake.
- **Depth** — behavior exercised per unit of interface learned. Deep:
  small interface, large implementation. Shallow: an interface nearly
  as complex as what it hides.

## Principles

- **Depth is a property of the interface, not the implementation.** A
  deep module may be built internally from small swappable parts with
  internal seams used only by its own tests; none of that belongs to
  the caller-facing interface.
- **The deletion test.** Imagine deleting the module. Complexity
  vanishes → it was a pass-through. Complexity reappears across N
  callers → it was earning its keep.
- **The interface is the test surface.** Tests and callers cross the
  same seam. Wanting to test past the interface is evidence the
  module is the wrong shape, not a reason for private-access tricks.
- **One adapter is a hypothetical seam; two are a real one.** A seam
  nothing varies across is pure interface cost — do not introduce it
  until something actually varies.
- **Accept dependencies, return results.** A module that constructs
  its own collaborators or works by side effect forces every test to
  arrange the world; one that takes dependencies and returns values
  can be exercised with values alone.

## Applying it

When designing or reviewing an interface, push in one direction:
fewer methods, simpler parameters, more hidden. For each module, state
its full interface — invariants and error modes included — in a few
sentences; an interface that resists a short statement is carrying the
implementation's shape, and that is the finding. System-wide structure
— which modules exist and the invariants they jointly serve — is
architecture-spec's altitude; this discipline operates one interface
at a time.
