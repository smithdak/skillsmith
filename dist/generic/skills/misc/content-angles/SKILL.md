---
name: content-angles
description: >-
  Researches and generates distinct content angles for a topic:
  maps what is already saturated, identifies underserved
  perspectives, and produces a ranked set of angles each with a
  one-paragraph execution brief. Use this skill when the user says
  "what should I write about", "find angles for", "research content
  ideas", "generate topic variants", "what's the best spin on",
  "help me ideate content", or wants to pick the strongest take
  before writing. Not for writing the full piece, auditing existing
  content for quality, or deep academic research.
license: MIT
metadata:
  skillsmith-see-also: "content-scorer, podcast-repurposer"
  skillsmith-invocation: "user"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# content-angles

The first idea for a piece of content is almost never the most
differentiated one — it is the one already written a dozen times.
This skill surfaces the space of possible angles before committing
to one, so the user picks the strongest take with full information.

## Map the saturated landscape

Start by identifying what already exists on this topic. Name the 3
most common angles (the takes that have been done to death), the
dominant narrative (the frame most published content uses), and the
conventional wisdom the target audience already holds. Do this from
first principles — do not just describe the topic, describe what
makes it crowded.

This inventory is the starting constraint: a good angle either
occupies a gap in this map or explicitly challenges the dominant
narrative with new evidence.

## Generate 5–8 angles

For each angle, define:
- **The thesis in one sentence** — what this piece would argue that
  is specific and falsifiable, not a restatement of the topic.
- **Who it is written for** — the specific reader and what they
  believe before they read it.
- **Why it is different** — where it sits on the map relative to
  saturated content.
- **The strongest evidence or example** — the one data point, case,
  or counterintuitive finding that makes the argument credible.

Angle types to ensure coverage: contrarian (challenges a belief the
audience holds), data-led (a finding that surprises), persona-
specific (for a narrow audience nobody writes for), narrative
(a specific story that generalizes), tutorial (the right execution
path for one constrained scenario).

## Rank and execute brief

Rank the angles on two dimensions: differentiation (how far from the
saturated center) and audience fit (how well it matches the user's
stated audience and goals). Combine into a single ranking.

For the top 3 angles, write a one-paragraph execution brief: the
opening hook, the central tension the piece resolves, and the
ending the reader should remember.

Return the full ranked list and the 3 execution briefs. Flag if any
angle requires evidence the user should verify before committing —
an angle built on a claim that turns out to be wrong is worse than
a conventional take.
