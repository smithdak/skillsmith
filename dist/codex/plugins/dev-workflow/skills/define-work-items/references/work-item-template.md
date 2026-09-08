# Work-item template and elicitation checklist

## Template

```markdown
# <Imperative title scoped to one outcome>

| Field | Value |
|---|---|
| Status | draft \| ready \| in-progress \| blocked \| in-review \| done |
| Type | feature \| bug \| chore \| spike |
| Priority | P0 \| P1 \| P2 \| P3 |
| Size | XS \| S \| M \| L (± stated uncertainty) |
| Owner | <who, if known> |
| Depends on | <item refs, or "none"> |

## Description
<The problem and why it matters. Context the implementer needs: current
behavior, desired behavior, affected users/systems. State constraints;
do not mandate the solution unless the solution IS the requirement.>

## Tasks
- [ ] <concrete step, independently checkable>
- [ ] <…ordered where order matters>

## Acceptance criteria
- [ ] <testable assertion — binary pass/fail>
- [ ] <for behavior: Given <state>, when <action>, then <observable result>>

## Out of scope
- <explicit exclusion — pre-answer the "does this include X?" questions>

## Open questions          <!-- must be EMPTY before status: ready -->
- <question> (owner: <who answers>, blocks: <which task/AC>)

## Evidence & links
- <bug report, log excerpt, design doc, prior item — with paths/URLs>
```

Bug-type items additionally require in the description: reproduction
steps, observed vs expected behavior, and environment/version. A bug
without a reproduction is a spike to find one.

Spike-type items replace acceptance criteria with a decision to be made
and a timebox: the deliverable is an answer, and the AC is that the
answer is documented with its evidence.

## Elicitation gap checklist

Ask about any of these you cannot fill from context (batched, at most
one round unless answers create new gaps):

- **Actor & trigger** — who initiates this, and what causes it to happen?
- **Observable outcome** — what does the user/system see when it works?
- **Edge cases** — empty states, failures, concurrency, permissions?
- **Boundary** — the nearest adjacent thing this deliberately does NOT do.
- **Done-signal** — how will the requester verify completion? (Their
  answer usually IS the top acceptance criterion.)
- **Constraints** — deadline, compatibility, performance, compliance.
- **Evidence** — logs, screenshots, links that anchor the description.

## Quality bar per field

- Title: imperative verb + specific object. "Fix login" fails; "Prevent
  session expiry during active form editing" passes.
- Description answers why; if removed, the tasks would be unjustifiable.
- Each task ≤ one working session where possible; a task needing its own
  tasks is a work item.
- Each AC is checkable by someone who did not do the work.
- Open questions name an owner — a question without an owner never closes.
