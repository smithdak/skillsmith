---
name: handoff
description: >-
  Produces a structured work handoff a cold reader can act on without access
  to the conversation. Use this skill when the user says "handoff", "hand
  this off", asks for "handoff notes" or "transition notes", or wants to
  document where things stand before stopping, switching contexts, or
  transferring work to someone else.
license: MIT
metadata:
  skillsmith-composes: "cold-read"
  skillsmith-invocation: "user"
  skillsmith-maturity: "stable"
user-invocable: true
---

# handoff

Produce a handoff document that lets a cold reader — a teammate, or a future
session with no memory of this one — continue the work without re-deriving
it. The test of quality: every open item is actionable without asking the
author a question.

## Gather (from the conversation and any artifacts)

Collect, in priority order:

1. **Decisions made** — each with a one-line rationale. Decisions, not
   chronology: "chose X because Y", never "first we discussed…".
2. **Locked constraints** — invariants, rejected alternatives (with the
   reason they were rejected — this prevents relitigating), and anything
   the reader must not change without understanding why.
3. **State of artifacts** — file paths, versions, branches, what is
   verified working vs. merely written. Distinguish tested from assumed.
4. **Open items** — each with a concrete next action and, when known, an
   owner and a blocking condition. "Investigate the flaky test" is not a
   next action; "run `bun test --rerun-each 20` on auth.test.ts and bisect
   the seed" is.
5. **Dead ends** — what was tried and abandoned, and why. Ten minutes of
   reading here saves the reader a day of rediscovery.

## Boundaries

- No conversation narrative or pleasantries. A handoff is a state document.
- Nothing that requires the conversation to interpret ("as discussed",
  "the earlier approach") — inline the referent or drop the item.
- No secrets, tokens, or credentials, even redacted ones.
- Default to one screen of content; split into sections only past ~40 lines.

## Output format

```markdown
# Handoff — <topic> — <date>

## Decisions
- <decision> — <rationale>

## Locked
- <constraint / rejected alternative + why>

## Artifacts
- <path or link> — <state: verified | written-untested | draft>

## Open items
- [ ] <concrete next action> (owner: <who>, blocked by: <what, if anything>)

## Dead ends
- <approach> — <why abandoned>
```

## Verify before returning

Run the cold-read discipline on the draft, casting the audience as the
person continuing this work with no access to the conversation. On top of
that pass, check the handoff-specific bar: every open item names a
concrete next action, and every artifact state is a claim the reader can
check (the command, the path, the version), not an assurance. Fix
failures before presenting; do not present and caveat.
