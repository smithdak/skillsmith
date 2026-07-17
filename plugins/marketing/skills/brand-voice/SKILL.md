---
name: brand-voice
description: >-
  Extracts a brand voice specification from existing copy samples:
  identifies tone, vocabulary patterns, sentence structure, and
  anti-patterns, then produces a durable voice spec other content
  can be checked against. Use this skill when the user says "extract
  our brand voice", "document our tone of voice", "what is our
  writing style", "create a voice guide from our copy", "our content
  sounds inconsistent — define our voice", or provides copy samples
  and wants a reusable voice standard. Not for rewriting existing
  content to match a voice, scoring content quality, or creating
  general style guides for code or documentation.
license: MIT
metadata:
  skillsmith-see-also: "content-scorer, outbound-builder, content-angles"
  skillsmith-invocation: "user"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# brand-voice

A voice spec extracted from real copy is more reliable than one
written from brand values — the copy is what the brand actually
sounds like, not what it aspires to. This skill mines patterns from
samples and makes them explicit enough that a writer (or a model)
who never worked at the company can reproduce the voice.

## Intake

Require at least 3 copy samples before proceeding. More samples
produce a more reliable extraction; 5–8 is the useful range. Ideal
samples span formats — a homepage headline, a blog intro, a social
post, an email — because voice is consistent across formats even
when length and register shift.

If the user provides only a brand name or a values statement ("we
are bold, human, and direct"), ask for actual copy. Values
descriptions produce generic specs; copy produces specific ones.

Also ask: who is the intended reader, and what should they feel after
reading a piece of content from this brand? This frames the "why"
behind the patterns.

## Extract patterns

Read every sample for the following dimensions. For each, find
recurring patterns across samples — not a single occurrence in one
piece, but a habit that shows up in at least two thirds of samples.

**Sentence structure**: average sentence length (short / medium /
long), preference for active or passive voice, use of fragments,
use of questions, em-dash or parenthetical frequency.

**Vocabulary register**: technical or plain, formal or casual,
category jargon or plain alternatives (does the brand say "leverage"
or "use"?), first or third person, use of "we" vs "I" vs neither.

**Tone markers**: what emotion does the prose invoke? confidence,
warmth, urgency, irreverence, authority? Name the 2–3 dominant tones
with a verbatim phrase from the samples as evidence for each.

**Structural habits**: does the brand lead with the insight or the
context? Does it end with a CTA, a question, or a declarative? Does
it use subheads in short content?

**Anti-patterns**: things the samples consistently avoid. A brand
that never uses superlatives, never hedges with "perhaps" or "might",
never writes a passive construction — these exclusions are as
defining as inclusions.

## Write the voice spec

Produce the spec in four sections:

**Voice in one sentence**: a single sentence that captures the
dominant tone and the reader relationship. ("Confident but not
arrogant — we explain complex things simply and trust the reader
to keep up.")

**Do / Don't vocabulary table**: two columns, 8–12 rows. Each row is
a specific word or phrase pair — not abstract directions. "Use" vs
"leverage", "helps" vs "enables", "fast" vs "performant". Rows
sourced from actual sample patterns, not invented to fill the table.

**Sentence structure rules** (5–7 bullets): concrete, testable
rules. "Sentences average under 18 words." "Questions are allowed
at paragraph ends, not paragraph starts." "Em dashes instead of
parentheses." Rules a writer can check mechanically.

**Anti-pattern examples**: 3 before/after pairs. Each pair shows a
sentence that violates the voice and a rewrite that matches it.
Source the "before" from a real off-voice tendency (generic AI
output, corporate filler, or a sample that didn't fit the pattern).

## Save and return

Write the voice spec to `brand-voice.md` in the project root (or
the location the user specifies). Return the spec inline and confirm
the path. A saved file means the spec can be referenced in future
sessions — paste it into prompts for content-scorer or
outbound-builder to enforce voice in those workflows.
