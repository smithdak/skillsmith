---
name: "frontend-redesign"
description: "Upgrades the craft of an existing web UI without a rewrite: scans the current interface, diagnoses specific defects against an audit checklist, and applies the smallest changes that raise quality. Use this skill when the user says \"improve how this looks\", \"audit this UI\", \"make our existing site look more polished\", \"clean up this page's design\", or points at a live interface that works but feels dated or unfinished. Not for building a new page from scratch, backend work, or reviewing code for correctness or security."
license: "MIT"
metadata:
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
  skillsmith-see-also: "frontend-craft"
---

# frontend-redesign

An existing UI is a constraint, not a blank page. The users know it, the
code works, and a rewrite trades known problems for unknown ones. The
discipline is to raise craft through the smallest changes that move quality —
diagnose specific defects, fix them in place, and leave working structure
alone. The failure mode is the tempting full rebuild that regresses behavior
nobody asked to change.

## Scan

Inventory what exists before judging it. Walk the interface and record, per
screen or section: the typographic choices, the spacing rhythm, the color
and elevation usage, the layout structure, the interactive states, the
content, and the accessibility posture. Note what already works — those are
the parts to preserve. A redesign that cannot name the current state will
"fix" things that were fine and miss the things that were not.

## Diagnose

Assess the scan against the audit checklist in
[references/audit-checklist.md](references/audit-checklist.md). For each
defect, record three things: what is wrong, why it lowers craft, and the
smallest change that fixes it. Rank by impact-per-effort — the changes that
most raise perceived quality for the least disruption go first. Typography
and spacing usually top the list; they carry most of perceived craft and are
low-risk to change. Distinguish a genuine defect from a deliberate choice
that simply differs from the auditor's taste: taste disagreements are not
defects.

## Fix

Apply changes in ranked order, smallest effective change first, one concern
at a time so each is reviewable and reversible:

- Prefer adjusting tokens (type scale, spacing ramp, color, elevation) over
  restructuring markup — a scale fix improves every screen at once.
- Preserve working behavior, routes, and content. A visual upgrade that
  changes what the page does has exceeded its remit.
- Where a section needs genuinely new design rather than repair, hand it to
  the frontend-craft discipline for that piece; redesign is for raising an
  existing floor, not greenfield composition.

Verify each change against the same accessibility bar a new build must meet —
a redesign must not lower contrast, remove focus states, or break semantics
in the name of looking better.

## Boundaries

- Non-destructive by default. Working structure, behavior, and content are
  preserved unless the user explicitly asks for a rebuild.
- Not a code-quality or security review — this is craft, not correctness.
  Those are separate passes.
- Fewer, higher-impact changes beat a sweeping diff. Stop when the floor is
  raised, not when the page is unrecognizable.

## Verify before returning

The output names the current state, lists diagnosed defects each with its
minimal fix, and orders the fixes by impact-per-effort. Applied changes
preserved behavior and did not regress accessibility. A "redesign" that
rewrote the page rather than raising it has done a different, riskier job
than the one asked for.
