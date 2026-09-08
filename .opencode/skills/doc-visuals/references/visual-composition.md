# Visual composition for technical documents

Use this when a page is technically correct but feels generic, dense, or hard to
scan. Start with the reader's attention, then choose Markdown elements.

## Establish a hierarchy

Write the one thing a reader should retain from this part of the page. Place its
best evidence nearby. A first-use command belongs next to its result; an access
boundary belongs next to the diagram that crosses it. Avoid making readers jump
between distant sections to decode one element.

Let importance control emphasis. A title introduces the project, headings promise
answers, paragraphs connect ideas, and examples supply evidence. When every line
is bold, every paragraph is a callout, or each feature has its own emoji, the page
loses distinctions. Restore them by removing redundant emphasis and grouping
related material. Keep a project's intentional personality; restraint is not a
requirement to make every repository look identical.

Make headings specific enough to navigate: “Preview changes before writing” tells
more than “Powerful features.” Do not stack several heading levels before giving
the reader useful content. A short page rarely needs its own link navigation row;
a long reference may benefit from one.

## Choose a proof artifact

| Reader needs to see | Useful evidence | Weak substitute |
|---|---|---|
| What the tool produces | Small actual input and output | A list of adjectives |
| How an interface feels | A current screenshot of the core task | A generated product mockup presented as real |
| Why ordering matters | A sequence with the decisive branch | Boxes naming every component |
| Which option to choose | A comparison on relevant criteria | A checkmark matrix where every entry wins |
| A measured difference | A chart with units, basis and source | Unattributed percentages or decorative bars |

Prefer one revealing example over several shallow ones. A screenshot should show
the task at readable scale, use non-sensitive data, and have alt text describing
what matters. Crop irrelevant chrome only when doing so does not conceal context.
A large banner cannot substitute for evidence of a working product.

## Make the composition carry meaning

Position and grouping communicate before labels do. Keep the main path easy to
follow, place alternatives where they diverge, and group by a meaningful boundary
such as ownership or trust. Do not mix a package inventory, runtime sequence, and
release process into one diagram simply because they share component names.

Use neutral styling first. If color encodes a distinction, reinforce it with labels,
shapes or line patterns, and explain that encoding. Color may support hierarchy;
it should not be the only way to find a failure path. Existing brand accents are
appropriate when contrast survives the actual background.

At a narrow width, restructure wide comparisons, shorten repeated labels, or split
independent views. Do not shrink all text until the diagram fits. Avoid fixed-width
HTML layouts in a Markdown host unless the host and the narrow layout were tested.

## An editorial edit

Weak opening:

> # Tracefold
> **Fast. Flexible. Powerful.**
> Features · Architecture · Installation · Configuration · Contributing
> Five badges, a full-width logo, and a ten-box architecture diagram.

For a fictional local trace-report CLI, a stronger opening would use the name,
a concrete job statement, a small input/output example, then the installation
path. Move the architecture diagram to the question it answers. Keep a badge only
if it helps evaluate the project. The gain comes from choosing useful evidence
and a reading order, not from adding more visual components.

## Inspect before calling it finished

Read the rendered page, not just the source. Check the first screen, the transition
into first use, and the densest element. Look at a narrow viewport and supported
themes. Check clipped labels, tiny diagram text, awkward table wrapping, missing
assets and distinctions conveyed only by color. Cover the prose: the visual should
still identify its subject; uncover it: the prose should add interpretation rather
than narrate every box. Record the renderer used and distinguish a local preview
from a check on the actual publishing host.
