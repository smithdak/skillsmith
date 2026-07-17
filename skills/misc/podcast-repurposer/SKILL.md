---
name: podcast-repurposer
description: >-
  Converts a podcast episode or transcript into a set of platform-
  ready content assets: a long-form blog post, an email newsletter
  section, LinkedIn and X posts, and a pull-quote set. Use this
  skill when the user says "turn my podcast into content", "repurpose
  this episode", "podcast to blog", "extract clips from this
  transcript", "create content from my podcast", or wants maximum
  distribution from one recording. Not for writing podcast scripts
  from scratch, video editing guidance, or episode transcription.
license: MIT
metadata:
  skillsmith-see-also: "content-scorer, content-angles"
  skillsmith-invocation: "user"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# podcast-repurposer

A recording contains far more than one piece of content — the full
argument, the sharpest example, the one insight that surprises even
the host. This skill mines a transcript for its distinct assets
rather than summarizing it once and calling that done.

## Intake

Require the transcript or detailed show notes before proceeding.
If the user provides only a topic or episode title, ask for the
transcript — paraphrased summaries produce generic output.

From the transcript, extract before drafting:
- **The central argument** — the one claim the episode makes that a
  listener should remember tomorrow.
- **The 3 sharpest moments** — a surprising stat, a counterintuitive
  claim, or a concrete story. These become the pull quotes and social
  hooks.
- **The target audience** — who the episode was made for and what
  they already believe before listening.

## Blog post (long-form)

Write a standalone article, not a transcript summary. A reader who
never heard the episode should find it complete and compelling.

Structure: a hook that states the central argument and why it is
worth the reader's time, then 3–5 sections each organized around a
distinct point (not a time stamp), then a conclusion that states what
the reader should do or believe differently. Use direct quotes from
the transcript sparingly — when a quote is sharper than paraphrase,
use it; otherwise, paraphrase.

Target: 800–1,200 words. The transcript is raw material, not an
outline.

## Email newsletter section

One section of a newsletter (not a standalone email). Assumes the
reader is already subscribed and trusts the sender. Lead with the
one finding or insight that earns the click to the full episode or
post. 150–200 words, ending with a link and a one-sentence reason
to click.

## Social posts

**LinkedIn (1 post)**: The central argument framed as a lesson from
the episode. 150–200 words. First line must work as the preview
before "see more." Do not start with "I" or "We."

**X (3 posts, post-thread format)**: Three angles from three
different sharpest moments. Each post self-contained at ≤280 chars;
reads well in isolation but rewards following the thread.

## Pull quotes

5 pull quotes from verbatim transcript text, each under 30 words.
Select for: surprising, specific, and quote-worthy without context.
Label each with the approximate timestamp if available.

## Quality check before returning

Confirm: the blog post does not start by explaining it is based on
a podcast; the LinkedIn post's first line works as a hook; each X
post reads alone without the thread. If any fail, fix before
returning.
