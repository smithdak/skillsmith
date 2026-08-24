---
name: outbound-builder
description: >-
  Builds and optimizes cold outbound sequences: researches the
  prospect segment, drafts multi-touch email cadences with subject
  line variants, and tightens each touchpoint for reply rate. Use
  this skill when the user says "build me a cold email sequence",
  "write cold outreach", "create an outbound cadence", "optimize my
  cold email", "write a prospecting sequence", or needs a targeted
  multi-step sequence for a specific role or company type. Not for
  nurture emails to existing subscribers, event invitations, product
  announcements, or newsletter copy.
license: MIT
metadata:
  skillsmith-see-also: "content-scorer"
  skillsmith-invocation: "user"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# outbound-builder

Cold outbound fails at the delete button, not the send button. Each
touchpoint must earn its read before it can earn a reply. This skill
builds sequences backward from the reply — what would make this
specific person respond — rather than forward from a template.

## Determine mode

Two modes; detect from context:

- **Build** — user needs a new sequence from scratch. Requires:
  target persona (role, company stage, pain), value proposition, and
  desired next step. Clarify these before drafting if they are
  missing.
- **Optimize** — user has an existing sequence with reply rate or
  open rate data. Diagnose before rewriting: identify which
  touchpoint is the break point and why (subject line, opener, CTA,
  timing, length).

## Research the segment first

Before writing a word: state what a skeptical member of the target
persona already believes about this problem, what they have tried,
and why those solutions disappointed them. The sequence earns its
read by demonstrating this understanding — not by claiming it.

If the user has not provided this context, ask for one real example
of their ideal prospect (name, title, company, what the company
does). One real example is worth more than a persona description.

## Draft the touchpoints

A standard 4-touch cadence:

1. **Day 1 — Opener**: One sharp insight about their world + one
   connection to the value prop. No pitch. Subject line: specific,
   not clever. ≤100 words.
2. **Day 4 — Angle shift**: Different lens on the same problem. Not
   a re-pitch. Acknowledge they may have seen the first note. ≤75
   words.
3. **Day 9 — Social proof or specificity**: One concrete result for a
   similar company or a specific hypothesis about their situation.
   ≤75 words.
4. **Day 14 — Breakup**: Permission to close. Honest, not passive-
   aggressive. Keeps the door open. ≤50 words.

Produce 2 subject line variants per touch. Vary the axis: one plays
specificity, one plays curiosity or urgency.

## Evaluate before returning

Score each touchpoint on three axes (1–5): opens on a genuine
insight (not "I hope this finds you well"), CTA is one clear action,
reads in under 15 seconds. Any touch scoring below 3 on any axis
gets rewritten before returning.
