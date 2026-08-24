---
name: "frontend-critique"
description: "Runs a structured UX design review of a finished interface and lands a scored report: design-specificity verdict, Nielsen heuristics scored 0-4 with renormalization, cognitive-load checklist, persona red flags, and P0-P3 issues each with a concrete fix and the skill that should apply it. Use this skill when the user says \"critique this page\", \"review the design\", \"what do you think of this UI\", \"score our landing page's design\", or wants a design assessment before deciding what to change. Not for applying fixes (frontend-redesign), building new UI (frontend-craft), verifying behavior in a browser (webapp-testing), or security review."
license: "MIT"
metadata:
  skillsmith-composes: "webapp-testing"
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
  skillsmith-see-also: "frontend-redesign, frontend-craft, security-diff-review"
---

# frontend-critique

A critique that mixes "look at it" with "run checks on it" fails
twice: the deterministic findings anchor the judgment, and the
judgment gets diluted into a checklist recital. This skill runs two
assessments kept deliberately apart, then synthesizes one report. The
report is the deliverable; fixing is other skills' work.

## Resolve one stable target

Prefer a source path over a dev-server URL ("the homepage" →
`pages/index.astro`; "the settings modal" → its component file) —
ports drift, paths do not. Confirm what "done well" means for this
surface by naming its mode (Persuade / Operate / Read / Experience):
criteria differ per mode, and heuristics that cannot apply to the mode
get marked n/a rather than forced.

## Assessment A — design review (judgment first)

Review the interface as a designed artifact before seeing any
mechanical findings:

- **Design specificity**: is this composition grounded in *this*
  product, or could an unrelated product ship it unchanged? Verdict:
  authored vs category-interchangeable, with the furniture named.
- **Heuristics**: score Nielsen's ten 0–4 each; write `n/a` where the
  mode genuinely excludes one and renormalize the total to 4 × scored
  count. Be honest — a 4 means genuinely excellent; most real
  interfaces land 20–32 out of 40.
- **Cognitive load**: flag decision points showing >4 visible options,
  redundant confirmations, hidden primary actions. 0–1 failed items is
  healthy; 4+ is critical.
- **Emotional journey**: where does confidence peak and dip? Are
  high-stakes moments (payment, delete, submit) reassured?
- Persona red flags: name two personas (e.g., a power user, a
  first-timer) and where each would stall or abandon.

## Assessment B — mechanical evidence

Only after A is written down: gather deterministic evidence. Run
`frontend-craft/scripts/slop-detector.py` over the target files for
slop-pattern hits; when a browser session is warranted, use the
webapp-testing discipline to capture rendered state and console output
— screenshots at desktop + mobile widths in one batched round. Note
what the mechanical pass caught that A missed, and any false positives
it produced.

If subagents are available, run A and B as two isolated parallel
subagents so neither anchors the other; if not, finish A completely
before starting B. Either way, state which path ran in the report
header (`independent` / `sequential`).

## Synthesize the report

Structure, in order:

1. Header: target, mode, assessment path, date.
2. Design-specificity verdict — the lead finding.
3. Heuristics table with total over applicable maximum.
4. Cognitive-load and emotional-journey notes.
5. Issues as `[P0-P3] What / Why it matters / Fix / Suggested skill` —
   P0 blocks shipping (broken core task, accessibility blocker);
   P1 major craft damage; P2 clear improvement; P3 polish. Every fix
   names its executor: frontend-redesign for repair, frontend-craft
   for recomposition, webapp-testing for verification harnesses.
6. Two or three genuine strengths — what must survive any rework.
7. Close with 2-3 targeted questions whose answers shape the action
   plan (scope, appetite, constraints), each with concrete options. If
   questions are genuinely unnecessary, say so explicitly rather than
   trailing off.

Persist the full report to `docs/critiques/<target-slug>-<date>.md`
when the repo keeps such artifacts, and report the path.

## Verify before returning

Both assessments ran and their order is stated. The specificity
verdict exists and is argued, not asserted. Heuristic scores are
honest with n/a renormalized. Every issue carries severity, fix, and
executor. Strengths are present — a critique with only defects has not
identified what works. The response ends with the targeted questions
(or the explicit statement of why there are none), never with prose
after them.

## Boundaries

- Report, don't fix: applying changes is frontend-redesign /
  frontend-craft's job; this skill may recommend them by name.
- Behavior verification (does the flow actually work?) is
  webapp-testing's discipline — used here as evidence, not delivered
  as its own result.
- Security review of the interface's code is security-diff-review's
  axis entirely.
