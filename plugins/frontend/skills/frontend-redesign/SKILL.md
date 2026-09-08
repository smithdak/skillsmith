---
name: frontend-redesign
description: >-
  Upgrades the craft of an existing web UI without a rewrite: the smallest
  changes that raise quality, behavior and identity preserved. Use when
  the user says "improve how this looks", "audit this UI", "clean up this
  page's design", or has a live UI that works but feels dated. Not for
  building a new page (frontend-craft), review without fixes
  (frontend-critique), backend work, or code correctness.
license: MIT
metadata:
  skillsmith-see-also: "frontend-craft, frontend-critique, webapp-testing, doc-visuals"
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# frontend-redesign

Improve an existing interface while respecting the requested scope, product
behavior, and visual identity. Refinement is the default; an explicit request
to replace the design already authorizes a new visual direction within scope.

## Establish the baseline

Inspect the rendered interface and the actual tokens, typography, spacing,
components, and interaction states. Recover the primary user task and the
constraints to preserve. Distinguish a measured defect from a taste preference.

For a refinement, improve execution within the existing system. For a redesign,
keep product truth and function while replacing the agreed visual choices.
Ask only when the scope is ambiguous enough to change the work.

## Choose high-value changes

Use [references/audit-checklist.md](references/audit-checklist.md) for relevant
checks. Prioritize blocked actions, contrast, keyboard/focus behavior, overflow,
missing states, hierarchy, spacing, and typography. Assess whether the interface
communicates this product clearly. More than four visible choices is not by
itself a defect; inspect grouping, terminology, and decision complexity.

Prefer shared token or component fixes when they improve the affected surface
consistently. Restructure markup when the problem requires it. Keep unrelated
backend behavior and content changes outside the patch.

A local addition should fit its parent surface. Where a part needs a new
composition, apply frontend-craft's essential criteria inline: audience, clear
primary action, coherent visual language, and complete interaction states.
The companion is useful when installed, not required for progress.

## Verify the result

Compare relevant before/after rendered states at desktop and mobile widths.
Exercise the affected primary task and keyboard path. Use webapp-testing or the
available browser tools; name inspection limits when they cannot run.

The frontend-craft detector is an optional mechanical check when available.
Use its actual installed path, inspect hits in context, and preserve deliberate
incumbent choices. Do not treat a detector pass as proof of usability.

Report what changed and why, verified behavior, and unresolved issues. Stop
when the requested improvement is achieved and checks pass; further rounds
need a specific observed problem. Use frontend-critique for assessment-only
requests and doc-visuals for technical documentation visuals.
