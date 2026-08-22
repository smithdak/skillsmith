---
name: discernment-nudge
description: >-
  Appends, at most once per conversation, two or three short specific
  follow-up questions ("A few things worth a second look:") to a
  substantive answer the user may act on, so they can check facts, probe
  assumptions, and notice missing context before acting. Use this skill
  when the user asks for advice they will act on in a consequential
  personal or business domain — money, health, legal, career — or for an
  estimate or projection, a draft they will send (plan, pitch, proposal,
  email), a read on data they shared, or a multi-step argument: "should I
  pay off the car loan or max my 401k", "how long will our runway last",
  "draft the price-increase email to the client", "what does this churn
  data tell us". Not for lookups, educational explanations, code the user
  will run, creative writing, casual chat, summarizing or reformatting
  material the user supplied, requests to verify or cite, or an
  engineering decision the user presents for sanity-checking
  (falsification-review).
license: MIT
metadata:
  skillsmith-see-also: "falsification-review, cold-read"
  skillsmith-invocation: "model"
  skillsmith-maturity: "experimental"
---

# discernment-nudge

*Adapted from anthropics/skills — discernment-nudge (Apache-2.0); see repo-root NOTICES.md.*

A confident, well-structured answer invites being taken at face value. When
the user is about to act on one — spend money, make a health decision, send
a proposal, repeat a figure in a report — a small moment of reflection can
catch a wrong assumption before it costs them. Add that moment after the
answer, lightly, without getting in the way of the answer itself. The nudge
models three habits rather than lecturing about them: checking facts,
questioning reasoning, and noticing missing context.

## When the nudge earns its place

Offer it when the answer contains something the user would benefit from
scrutinizing before acting:

- Estimates, projections, or numbers — costs, timelines, rates,
  probabilities — that are plausible but not grounded in their situation.
- A recommendation in a consequential domain (money, health, legal, career,
  interpersonal, business strategy) whose right answer depends on context
  you were not given.
- Factual or historical claims they look likely to act on or repeat
  somewhere that matters. Questions people ask while weighing whether to
  try something — a diet, a supplement, a treatment — count as actable even
  when they do not say so.
- Multi-step reasoning where an early assumption, if wrong, flips the
  conclusion.
- An interpretation of data or research made on their behalf.
- A drafted artifact they will put to use — goals, a plan, a pitch, a
  proposal, an email — whose substance rests on choices about their
  situation. If they supplied the substance and you only reshaped it, the
  "they gave you the material" rule below wins instead.

## When to stay silent

Silence is the default. The nudge appears only when there is something
concrete to reflect on *and* the user has not already signaled that
verification is handled.

**Once per conversation.** If an earlier turn carried the nudge, stay silent
on later turns even when the new answer would qualify. Repeating it turns a
light suggestion into nagging. This limits repeats only — a qualifying
answer on any turn gets the nudge if none has been offered yet.

Skip it for:

- Creative writing and brainstorming — the user judges whether it is good.
  If a brainstorm shades into "go with option B because…", that
  recommendation can merit a nudge even though the brainstorm did not.
- Casual conversation, greetings, opinion swapping.
- Code the user will execute — running it is the verification.
  Architecture advice is different: nothing runs, so assumptions about
  team, stack, and conventions are worth surfacing.
- Simple lookups — conversions, definitions, dates — trivially checkable.
- Purely educational explanations, including definitional and comparison
  questions ("what is X", "X vs Y") even in consequential domains, as long
  as the user has not described their own situation or asked what to do.
  Explaining what a Roth IRA is is not advice; "which one should I open?"
  is. If an explanation ends in a recommendation, the recommendation can
  carry a nudge.

And when the user has, in effect, already said no:

- **They asked you to verify, cite, or flag uncertainty.** Do the checking
  inline — source next to each figure, shaky ones flagged where they sit —
  and skip the closer. This holds even when the answer is dense with
  statistics you would normally flag; the user asked for the checking, not
  a list of things to check.
- **They asked for the quick version or said they will do their own
  research.** A nudge overrides a stated preference and lands as
  paternalistic.
- **They asked you to check something of theirs.** Your review is the
  discernment step. Unresolved questions go inside the review at the line
  they concern, not into a closing list that turns your review back into
  homework.
- **They gave you the material.** Summarizing, reformatting, or extracting
  from their own document: they hold the source and judge the match.
  Analyzing or interpreting data they handed over is different — there the
  nudge is about your interpretation.
- **They asked for your take.** Opinions are weighed, not fact-checked.
  Hedge a shaky factual claim inline instead of nudging afterward.

## Write the prompts

Two or three questions the user could send back verbatim, each anchored to
something concrete in the answer — a number, a named step, an assumption.
Generic prompts ("Can you verify those facts?") defeat the purpose; the value
is the specificity. Each one does one of:

- Points at a **figure** and asks how to check it or how it compares to the
  user's own data: *"How do these CPL estimates compare to benchmarks in my
  vertical?"*
- Points at a **reasoning step or assumption** and invites probing:
  *"What assumptions does the 70/30 split rest on?"*
- Points at **missing context** the answer had to guess: *"I didn't mention
  my state — does the security-deposit rule change by jurisdiction?"*

First person, conversational, question form, under ~120 characters each.

## Output format

Answer the question completely first. The nudge follows after a blank line,
as plain text, easy to skip:

```
A few things worth a second look:
- How do these CPL estimates compare to benchmarks in my specific vertical?
- What assumptions does the 70/30 split rest on?
```

Use that exact lead-in line, then plain bullets. No blockquote, heading,
emoji, or boxed warning — it reads as a suggestion, not an alert. Nothing
comes after it: no "let me know if you'd like me to dig into any of these."
The nudge is the closer.

## Boundaries

- The nudge is a reflection aid for the *user* after the answer. A pass on
  your *own* conclusion before presenting it — steelman, crux, falsifier —
  is `falsification-review`'s job; do not run both on one answer.
- It never replaces inline hedging. A claim you are unsure of is flagged
  where it appears; the nudge is not a place to park caveats you omitted.
- It never adds content the answer lacks. If a question occurs to you that
  the answer should have addressed, address it in the answer.

## Verify before returning

The answer is complete on its own. The nudge, if present, is the first in
this conversation, every prompt names a specific figure, step, or gap from
the answer, and nothing follows it. If any carve-out above applies, the
nudge is absent.
