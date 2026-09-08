---
name: deep-modules
description: >-
  Applies deep-module discipline to one module's boundary: small
  interfaces hiding large implementations, seams, adapters. Use when the
  user says "design this module's interface", "decide where the seam
  goes", "shrink this API", or asks whether an abstraction earns its keep.
  Not for a contract others program against (api-design), a whole-system
  document (architecture-spec), or mechanical refactors.
license: MIT
metadata:
  skillsmith-see-also: "architecture-spec"
  skillsmith-invocation: "model"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# deep-modules

Design a boundary that hides more complexity than it exposes. Evaluate what a
caller must learn, not just the number of methods or lines of implementation.

## Inspect the interface

The interface includes types, invariants, ordering, configuration, errors, and
performance assumptions. A seam is where an implementation can vary behind
that contract; an adapter satisfies it.

Write a short account of what callers must know. Then inspect real callers:
which implementation details do they repeat, and which changes ripple outward?
Move shared knowledge behind the boundary when that reduces total complexity.

Use the deletion test: if removing an abstraction eliminates ceremony without
moving useful behavior anywhere, it may be a pass-through. If its knowledge
would be duplicated among callers, it earns its place. Translation, policy
enforcement, and isolation can justify a small adapter even with one current
implementation; do not invent a second implementation to satisfy a rule.

## Choose the seam

Prefer interfaces stated in the consumer's terms. Group operations when they
share an invariant, and separate them when they change for independent reasons.
Fewer methods help only while the remaining methods stay understandable; a
single operation with a bag of flags is not automatically deeper.

Keep policy inside the responsible module and external effects behind a
controllable boundary. Inject dependencies when that makes behavior testable;
ordinary value-only modules do not need an interface framework.

Example: expose a reservation operation that owns availability and atomic
allocation rather than making every caller coordinate read-count-write steps.

## Verify

Show a representative caller and test through the proposed interface. Check
that the caller no longer needs hidden ordering or storage knowledge, failure
behavior is explicit, and a realistic implementation change stays local.
Keep refactoring within the requested scope. System-wide decisions belong to
architecture-spec.
