---
description: Set up or tune the output contract for this repo.
argument-hint: "[repo | global | both]"
---

Set up or retune the agent output contract. Invoke the `voice-setup` skill
and follow its workflow end to end: detect harness surfaces with its script,
interview for scope and rule toggles, preview the managed block, apply it,
and verify.

Scope hint from the invocation (may be empty): $ARGUMENTS

Treat the hint as a preference, not consent — global writes still require an
explicit yes during the interview.
