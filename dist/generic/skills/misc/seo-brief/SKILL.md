---
name: seo-brief
description: >-
  Produces a keyword-anchored content brief: classifies search
  intent, identifies what top-ranking content covers and what it
  misses, and outputs a structured brief with H2 outline, secondary
  keywords, target length, and a meta description draft. Use this
  skill when the user says "write an SEO brief for", "create a
  content brief for the keyword", "what should I cover to rank for",
  "brief out this topic for SEO", or wants a research-backed
  structure before writing. Not for writing the full article,
  auditing existing content for ranking, or keyword research from
  scratch without a target keyword.
license: MIT
metadata:
  skillsmith-see-also: "content-angles, content-scorer"
  skillsmith-invocation: "user"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# seo-brief

A brief that ignores search intent produces content that ranks for
the wrong query or none at all. A brief that copies what ranks
produces content that can never outrank what is already there. This
skill does both: understand the intent, then find the gap.

## Intake

Require before proceeding:
- **Target keyword**: the primary phrase the content should rank for.
- **Audience**: who the reader is and what they already know.
- **Content goal**: what the reader should do or believe after
  reading (informational understanding, a download, a purchase, a
  referral).

If the user provides only a topic without a target keyword, ask for
one. A brief without a primary keyword is an outline, not a brief.

## Classify search intent

State the dominant intent type for the target keyword:
- **Informational** — reader wants to understand something.
- **Navigational** — reader is looking for a specific resource.
- **Commercial** — reader is comparing options before buying.
- **Transactional** — reader is ready to act.

Mixed intent (informational + commercial is common) should be
named and handled explicitly — the content structure must satisfy
both or choose one and accept the tradeoff.

State the implied content format that intent demands: long-form
guide, listicle, comparison page, product landing page, how-to
tutorial. Fighting the implied format is a ranking disadvantage.

## Map what ranks and what it misses

Describe the top-ranking content for the target keyword. Name the
common structure (what sections appear in most top results), the
questions those pieces answer, and — critically — the questions
they do not answer or answer poorly. That gap is the brief's
primary differentiation target.

Also flag: is the SERP dominated by one content type (e.g., all
listicles, all product pages)? If so, matching that type is the
default; deviating requires a specific reason.

## Write the brief

**Primary keyword**: the exact phrase.

**Secondary keywords and related terms** (6–10): phrases that
belong in the piece because they are semantically related, not
because they are separately targeted. Include at least 2 question-
form phrases (the "People also ask" signal).

**H1 suggestion**: one option that includes the primary keyword and
signals the intent-matched format. Not "The Ultimate Guide to X"
unless that format genuinely dominates the SERP.

**H2 outline**: 4–8 sections in order, each with a one-sentence
brief on what it must cover and why it earns its place. Mark one
section as the differentiation section — the part that covers the
gap identified above. Mark any section that is table-stakes (must
exist to match competitors) vs. value-add (where the piece earns
its ranking by going further).

**Target word count**: a range based on the average length of top-
ranking results for this intent type, not a round number. Flag if
intent signals that shorter would outperform longer (transactional
pages rarely benefit from 2,000 words).

**Internal link targets**: 2–3 existing pages on the site that
should be linked from this content, if the user has named other
pages or topics. Leave blank if no site context was provided.

**Meta description draft**: one 150–160 character option that
includes the primary keyword and a clear value statement. Not a
summary — a reason to click.
