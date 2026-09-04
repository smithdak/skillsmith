# Map and ticket formats

## Map document

```markdown
# Discovery map — <effort title>

## Destination
<one or two lines: the spec, decision, or change this effort is finding
its route to. Every session orients here before choosing a ticket.>

## Notes
<domain context; standing preferences; disciplines every session consults>

## Decisions so far
- [<closed ticket title>](link) — <one-line gist of the answer>

## Fog (not yet specifiable)
- <suspected question, as sharp as the current view allows>

## Out of scope
- <ruled-out work — gist, why it is beyond the destination, link if a
  ticket was closed into this section>
```

The map never restates a decision's detail — one line and a link; the
ticket is the single home of the answer.

## Ticket document

A ticket is a work item (define-work-items structure) specialized for
discovery: type is one of `research | elicitation | prototype | task`;
the description is the question; acceptance criteria are decision-shaped.

```markdown
# <Question as an imperative title>

| Field | Value |
|---|---|
| Status | open \| claimed \| closed |
| Type | research \| elicitation \| prototype \| task |
| Claimed by | <session/person, empty = unclaimed> |
| Blocked by | <ticket titles, or "none"> |

## Question
<the decision or investigation this ticket resolves — one session's worth>

## Acceptance criteria
- [ ] A decision is recorded with its rationale (and evidence links)
- [ ] Map's "Decisions so far" gains the one-line gist

## Resolution            <!-- appended on close -->
<the answer, dated; assets linked, not pasted>
```

## Local-markdown tracker (default)

When no issue tracker is configured, the map lives in the repo:

```
discovery/<effort-slug>/
├── map.md
└── tickets/
    ├── 001-<slug>.md
    └── 002-<slug>.md
```

- Claiming = writing "Claimed by" and committing; the commit is the lock.
- Blocking = the "Blocked by" field; the frontier is computed by reading
  ticket headers (open + no unresolved blockers + unclaimed).
- Numbering is creation order; titles remain the human-facing names.

## Issue-tracker adaptation

On a real tracker (GitHub Issues or similar): the map is one issue
labelled `discovery:map`; tickets are child issues labelled
`discovery:<type>`; claiming = assignment; blocking = the tracker's
native dependency relation so the frontier renders in the tracker's own
UI. Create tickets first, wire blocking second (issues need ids before
they can reference each other). Expect concurrent sessions: re-read
before writing, and never resolve a ticket another session has claimed.
