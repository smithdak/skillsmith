# Source-quality rubric

## Hierarchy (prefer higher; cite the tier used)

1. **The artifact itself** — run the tool, read the repo, hit the API.
   Empirical observation of the current version outranks all prose.
2. **Primary prose** — official docs, release notes, changelogs, vendor
   announcements, peer-reviewed papers. Note: vendor capability claims
   are primary for *what shipped*, promotional for *how well it works* —
   seek independent measurement for the latter.
3. **High-signal secondary** — maintainer posts, conference talks,
   established benchmark organizations, curated ecosystem indexes.
4. **Aggregators and coverage** — news sites, blog roundups, forums.
   Leads, not evidence: follow them upward to a primary source.

## Recency rules

- A source is dated by its content date, not its retrieval date.
- For fast-moving surfaces (model capabilities, CLI flags, plugin
  formats), treat anything older than one minor-release cycle as a lead.
- Two sources that agree but share an upstream count as one source.

## Skepticism zones (verify harder, prefer empirical)

- Product comparisons and "best X" rankings — heavily SEO-farmed.
- Vendor benchmark claims without named evals or effect sizes.
- Star counts, adoption numbers, market share — point-in-time and often
  scraped at different dates; state the scrape date or use ranges.
- Anything where the answer recommends the source's own product.

## When verification is unavailable

State the training-vintage answer explicitly as such, name the specific
check that would confirm or refute it (the command, the URL, the release
page), and size the risk of acting on the unverified version. Offering
the check is the deliverable when the fact itself is out of reach.
