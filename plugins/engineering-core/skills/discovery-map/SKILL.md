---
name: discovery-map
description: >-
  Plans work too large and too foggy for one session as a shared map of
  investigation tickets, resolved one per session until the route to a
  named destination is clear. Use this skill when the user wants to "chart
  a discovery map", "break the unknowns into tickets", plan a large vague
  effort across sessions, or "work through the next ticket on the map".
  Not for orienting in existing code, writing a single work item, or
  scheduling known work.
license: MIT
metadata:
  skillsmith-invocation: "user"
  skillsmith-maturity: "experimental"
  skillsmith-composes: "define-work-items, ground-truth-research, cold-read, falsification-review"
  skillsmith-inspired-by: "mattpocock/skills wayfinder (MIT)"
user-invocable: true
disable-model-invocation: true
---

# discovery-map

A loose idea has arrived — bigger than one session can hold, and foggy:
the route to the destination is not visible yet. Discovery is finding
that route, not charging at the destination. The map is a shared artifact
of investigation tickets; each session resolves exactly one, and the
effort is done when nothing is left to decide before someone goes and
does the thing.

**Plan, don't do.** Every ticket resolves a decision; the map's output is
a cleared route, not the deliverable at the end of it. The pull to just
start building is usually the signal the map is finished and it's time to
hand off.

## The map and its tickets

The map is one document — the index, never the store. It names the
**destination** (what "route clear" looks like, settled first because it
fixes the scope), gists each decision made with a link to the ticket that
holds the detail, sketches the fog, and records what's ruled out. Formats,
the local-markdown tracker fallback, and issue-tracker adaptation live in
[references/map-format.md](references/map-format.md).

Each ticket is one question, sized to a single session, written as a work
item via the define-work-items discipline — its acceptance criterion is
that a decision is recorded, not that work is delivered. Ticket types:

- **research** (agent-alone) — knowledge outside the working tree; run the
  ground-truth-research discipline and link the dated summary.
- **elicitation** (human-in-the-loop) — the answer lives in the human's
  head; batched targeted questions. The agent never answers for the
  human: an elicitation ticket resolved without the human is broken.
- **prototype** (human-in-the-loop) — a cheap concrete artifact to react
  to, when "how should it look/behave" is the question.
- **task** — the one type that does rather than decides, and only to
  unblock a decision: provisioning access, moving data so its shape can
  be seen. Records resulting facts later tickets depend on.

## Fog and scope

Chart only what you can see. The **fog** section holds suspected
questions you cannot yet phrase sharply — the test is whether the
question can be stated precisely now, not whether it can be answered.
Resolving tickets clears fog ahead; graduated patches become tickets and
leave the fog section. **Out of scope** is different: work beyond the
destination, consciously ruled out, never graduating — if a live ticket
turns out to sit past the destination, close it and record why. Fog is
sharpness; out-of-scope is boundary. Confusing them is how maps sprawl.

## Charting (first invocation)

1. Name the destination with the user — elicit until it is one or two
   lines every future session can orient to. If mapping the space
   surfaces no fog, stop: the effort fits one session and needs no map.
2. Fan out breadth-first across the space; create the tickets that can
   be stated sharply now, then wire blocking between them in a second
   pass. Everything else goes to fog.
3. Run the cold-read discipline on the map with audience = a future
   session that has never seen this conversation. Charting is a full
   session; do not also resolve tickets.

## Working (every later invocation)

1. Load the map only — zoom into ticket bodies on demand.
2. Take the user's named ticket, or the first open, unblocked, unclaimed
   one. Claim it before any work so concurrent sessions skip it.
3. Resolve it using the discipline its type names. Record the answer on
   the ticket, close it, add the one-line gist to the map's decisions.
4. Graduate any fog the answer sharpened; close anything it revealed as
   out of scope; update tickets it invalidated. One ticket per session —
   stopping is part of the protocol.
5. When the frontier empties, run the falsification-review discipline on
   the claim "the route is clear": the strongest case that an unresolved
   question remains. Survive that, and the map is done — hand off.

Refer to maps and tickets by their titles in everything the human reads;
ids ride inside links, never stand in for names.
