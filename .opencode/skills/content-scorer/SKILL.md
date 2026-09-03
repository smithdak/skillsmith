---
name: "content-scorer"
description: "Expert-panel scoring discipline for marketing content: assembles a panel of 7-10 domain experts, scores each dimension, and iterates toward a 90/100 aggregate in up to 3 rounds. Use this skill when the user says \"expert panel this\", \"score my content\", \"rate these variants\", \"run this through the panel\", \"quality check my copy\", or wants rigorous multi-angle criticism before publishing. Not for grammar or spelling checks, SEO keyword audits, or brand voice enforcement."
license: "MIT"
metadata:
  skillsmith-invocation: "user"
  skillsmith-maturity: "experimental"
  skillsmith-see-also: "content-angles"
---

# content-scorer

Publish-ready marketing content has passed a skeptical audience — not
just the author's judgment. This skill simulates that audience as a
panel of domain experts who score independently and force revision
until the aggregate reaches 90/100 or 3 rounds are exhausted.

## Assemble the panel

Build 7–10 experts tailored to the content type and audience. A blog
post for a technical SaaS audience needs a skeptical practitioner, a
conversion copywriter, and a first-time reader who has never heard of
the product. A cold email needs a busy VP who deletes 90% of their
inbox before the second sentence. Always include:

- **AI Humanizer** — scores whether the prose reads as human or
  generated: hollow reach-for-impact words (delve, leverage,
  seamless), "it's not X, it's Y" contrast puffery, throat-clearing
  openers, importance puffery ("crucially"), synonym cycling, uniform
  sentence rhythm, and summary-recap endings. Weight: 1.5x, on every
  content type, because generated-sounding prose is the defect a
  model-written revision is most likely to introduce.
- **Target Reader** — scores whether someone who matches the intended
  audience would keep reading and take the desired action.

Name each panelist, state their role and the one axis they score
hardest on. Scores are 1–10 per panelist; the aggregate is the
weighted mean rounded to /100.

## First-pass scoring

Run every panelist independently. Report each score, the sharpest
criticism per panelist in one sentence, and the top 3 weaknesses
across the panel. Do not average the criticisms — contradictions
between panelists are signal, not noise; surface them.

## Iterate toward 90

If the aggregate is below 90, address the top 3 weaknesses, revise,
and re-run the panel. Limit: 3 rounds total.

Rules for revision:
- Fix what the panel agreed on; flag what they disagreed on to the
  user rather than picking a side.
- Do not add length to satisfy a score. If a panelist wanted more
  depth, that depth should replace something weaker, not pad the end.
- A Humanizer score below 7 is a hard block: treat the round as
  failing regardless of the aggregate, because generated-sounding
  prose is the defect a model-written revision is most likely to
  introduce and the one readers forgive least. Fix prose before other
  dimensions.

## Report honestly

After the final round, return:
- The revised content
- The round-by-round score summary (aggregate + top critiques per round)
- An honest statement if the aggregate is still below 90: what is
  holding it back and what a future revision should address

Do not inflate scores to end early and do not hide a below-90 result
in qualifications.
