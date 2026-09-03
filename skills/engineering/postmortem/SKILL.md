---
name: postmortem
description: >-
  Writes an incident or bug post-mortem for a defect that was subtle,
  systemic, and costly to rediscover: a 30-second executive summary,
  summary, impact, a timeline anchored to evidence (logs, commits, sequence
  numbers), the root cause as a mechanism plus why every safety net missed
  it, guardrails added with linked tests and rules, and lessons. Use this
  skill when the user says "write a post-mortem for this outage", "do an
  RCA on the duplicate-charge bug", "write up what went wrong with the sync
  job", "incident report for yesterday", or has finally found a root cause
  and wants it documented for the team. Not for forward-looking specs
  (architecture-spec, feature-spec), session-state handoffs, triaging
  issues, writing tickets, research notes on an open question, or
  debugging the bug itself.
license: MIT
metadata:
  skillsmith-see-also: "architecture-spec, define-work-items, diagnose-bugs, handoff, research-note"
  skillsmith-composes: "doc-visuals"
  skillsmith-invocation: "both"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# postmortem

*Adapted from deepseek-ai/deepseek-harness — docs/postmortem (MIT); see repo-root NOTICES.md.*

A post-mortem records why the process let a bug through, not the one-line
fix. The fix is in the commit; what the commit cannot hold is the mechanism,
the reason every safety net missed it, and the guardrails that make the same
class of bug fail loudly next time. Write it so the next engineer who meets
the symptom finds the mechanism in thirty seconds instead of re-deriving it
over three days.

## Decide whether it earns one

A post-mortem is worth its cost only when all three hold:

- **Subtle** — the mechanism is non-obvious; a careful engineer would
  re-derive it the hard way.
- **Systemic** — it escaped because of a gap in tests, tooling, or
  conventions, not a one-off typo.
- **Costly to rediscover** — it consumed real debugging time and would
  again.

When one is missing, say so and offer the lighter form: a commit message
that names the mechanism, an issue comment, or a line in the relevant doc.
A post-mortem for a typo trains readers to skip post-mortems.

## Gather evidence before narrative

Collect the record first: log excerpts, commit SHAs, session or event ids,
sequence numbers, timestamps, the failing test's name, the exact command
that reproduced it. The timeline follows this evidence, not reconstructed
intent — "the agent then assumed…" is a guess; "at sequence 31865 the agent
launched bare Vite on :5173 and observed HTTP 200" is a fact a reader can
check. Where the record is incomplete, say what is missing rather than
smoothing over it.

Separate three things that are easy to conflate: what broke (the symptom
users saw), the mechanism (the causal chain inside the system), and why it
escaped (which checks existed, and what each one actually proved instead of
what everyone assumed it proved).

## Structure

Use the skeleton in
[references/postmortem-template.md](references/postmortem-template.md).
The sections, in order:

1. **Executive summary** — one short paragraph a busy reader absorbs in
   thirty seconds: what broke, the root cause in plain terms, why it
   escaped, and the durable lesson. Write this last, from the finished
   sections; it is the part most people will read.
2. **Summary** — the setting and the defect in a few paragraphs: what the
   system was doing, what the user expected, what happened instead.
3. **Impact** — who was affected, for how long, what it cost, and what was
   *not* affected (scope limits are evidence too).
4. **Timeline** — ordered entries, each anchored to a concrete source:
   a log line, a commit, a sequence number, a message. Render it as a list
   or a table (the doc-visuals discipline applies — a table when every row
   has the same columns, prose otherwise).
5. **Root cause** — the mechanism, stated so that a reader could reproduce
   it, followed by *why each safety net missed it*: the test that passed
   and what it really asserted, the review that approved and what it could
   not see, the monitor that stayed green and what it measures.
6. **Guardrails added** — each one linked (test path, rule, doc, alert)
   with the condition under which it now fails. A guardrail that would
   pass on both the broken and the fixed code guards nothing; say how it
   was proven to fail on the broken code.
7. **Lessons** — generalizable rules, not restatements of the fix.
   "HTTP 200 from a server is not proof the application booted" transfers;
   "check for `window.__BOOT__`" does not.

Keep it factual and blameless: name roles, commands, and components, not
people's mistakes. The question is always what the system and process let
happen, and what changes so it cannot happen silently again.

## Boundaries

- Backward-looking only. Design decisions the incident prompts belong in
  `architecture-spec` or a decision record and are linked from Guardrails,
  not argued here.
- Where things stand for the next session is `handoff`; an open research
  question is `research-note`; follow-up work becomes tickets via
  `define-work-items`.
- Do not debug inside the post-mortem — that is `diagnose-bugs`' loop. If
  the root cause is not yet known, say so and stop at the evidence; a
  post-mortem with a guessed mechanism is worse than none.

## Verify before returning

From the executive summary alone a reader can name the mechanism and the
safety net that missed it. Every timeline entry cites evidence a reader
could open. Every guardrail is linked and states what makes it fail. The
Lessons section contains nothing that only applies to this one bug. Nothing
in the document assigns blame to a person.
