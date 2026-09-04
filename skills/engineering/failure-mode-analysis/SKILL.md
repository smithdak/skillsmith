---
name: failure-mode-analysis
description: >-
  Ranks the failure modes of a system or design — per dependency: down,
  slow, partial, or wrong — by likelihood × impact × detectability, with
  mitigations and game-day tests. Use when the user says "what happens
  if redis goes down", "how resilient is this service", or "failure modes
  of this design". Not for attackers (threat-model), plans (premortem),
  or past failures (diagnose-bugs, postmortem).
license: MIT
metadata:
  skillsmith-see-also: "threat-model, architecture-review, premortem, migration-plan, diagnose-bugs, postmortem"
  skillsmith-invocation: "model"
  skillsmith-maturity: "experimental"
user-invocable: true
---

# failure-mode-analysis

Every dependency fails eventually, and most systems have only been
tested against the two failures somebody already imagined. This pass
enumerates the rest systematically — per dependency, per mode — then
ranks them so the top handful get real mitigations and a test that
proves each one, instead of a paragraph of reassurance.

The failures here are accidental: outages, latency, partial errors,
bad data, overload. An attacker choosing where to push is
threat-model's territory, and the two analyses share components but
not conclusions. A plan's execution risk belongs to premortem; a
failure that already happened goes to diagnose-bugs (find the cause)
or postmortem (write it up). This skill looks forward at a running or
proposed system and asks what it does when something it relies on
stops behaving.

## 1. Inventory what can fail

Read the code, config, and deployment manifests before asking the
user anything. Dependencies are declared in clients, connection
strings, environment variables, Dockerfiles, IaC, and import lists;
a cold "what does this depend on?" produces the two the user
remembers, and the analysis is only as complete as this list.

List every **external dependency**: datastores, caches, queues and
brokers, third-party APIs, identity providers, DNS and TLS
certificates, config and secret stores, object storage, the network
between components, and the cloud or platform primitives the system
assumes are always there. Then every **internal boundary**: synchronous
service calls, async jobs and workers, cron, caches, shared state,
and anything that holds a connection pool or a lock.

For each item, record the call sites (paths) and the user-facing
paths that flow through it. A dependency nobody can trace to a call
site is either dead or undiscovered — say which.

**Done when:** every item has a name, a kind, at least one call site,
and the user-facing paths that depend on it, and the list includes
the boring infrastructure (DNS, certs, config, disk) — not just the
databases.

## 2. Enumerate modes per item

Apply the same mode list to every item, deliberately, rather than
brainstorming. The goal is coverage; pruning happens in ranking.

For everything:

- **Unavailable** — connection refused, DNS fails, process dead.
- **Slow** — latency climbs past timeouts, or past what the caller's
  own callers tolerate; includes the "hangs forever" case.
- **Partial** — some calls fail, one replica or shard or region is
  bad, intermittent errors.
- **Wrong** — stale, corrupt, duplicated, out-of-order, or
  schema-shifted data returned with a success status.
- **Overloaded** — the dependency sheds load, rate-limits, or the
  system's own retries amplify a wobble into a storm.

Additionally, for anything stateful (datastores, queues, caches,
disks):

- **Full** — disk, quota, queue depth, connection pool exhausted.
- **Split-brain** — two writers or two leaders each believing they
  own the truth.
- **Lost writes** — an acknowledged write that does not survive a
  failover, restart, or replication lag.

Mark a mode "not applicable" only with a reason ("read-only replica;
lost writes N/A"). Absence of a reason means the mode was skipped,
not ruled out.

**Done when:** every inventory item has every applicable mode
listed, and each non-applicable mode carries its reason.

## 3. Characterize each mode

For each (item, mode) pair, establish four things from the code and
runtime configuration, not from how the system is supposed to
behave:

1. **Detection** — what signal fires, how fast, and whether anyone
   is watching it. "The error log fills" is not detection if no
   alert reads the log. Note a detection gap explicitly.
2. **Blast radius** — which user-facing paths break, degrade, or
   silently produce wrong output. Trace it: a cache outage that
   hits the database that saturates the pool that stalls unrelated
   endpoints has a radius far wider than "cache misses".
3. **Current behavior** — what the code does today. Fail closed
   (refuse the request), fail open (proceed as if the dependency
   succeeded), hang (no timeout), crash-loop, retry unboundedly, or
   serve stale. Read the actual timeout values, retry policies, and
   catch blocks; "presumably it times out" is a gap to record.
4. **Mitigation class** — the pattern that closes the gap: timeout,
   bounded retry with idempotency, circuit breaker, bulkhead,
   fallback or cache, queue and replay, graceful degradation, load
   shedding. Load
   [references/mitigation-catalog.md](references/mitigation-catalog.md)
   for what each protects against, its own failure modes, and the
   parameters that make or break it. Where a mitigation already
   exists, record it and judge whether it is configured to work
   (a 30-second timeout on a 2-second budget is not a mitigation).

**Done when:** every mode has a detection entry (or an explicit
gap), a traced blast radius naming user-facing paths, a current
behavior read from code, and a candidate mitigation class.

## 4. Rank

Score each mode on three axes, 1–5 each, and multiply into a risk
priority number (RPN):

- **Likelihood** — how often this mode occurs. Ground it: SLA
  history, incident logs, the provider's published availability,
  how often deploys touch it.
- **Impact** — severity when it does: revenue paths, data
  integrity, safety, or an internal dashboard.
- **Detectability** — inverted: 1 means it pages someone within
  seconds, 5 means it is discovered from a customer complaint days
  later. Silent wrong data usually scores highest here and that is
  frequently the real top risk.

Where a score is unknown, write "unknown" and what would establish
it; a guessed 3 hides exactly the uncertainty the ranking should
surface. Sort by RPN and take the top 5–10. For each, write a
concrete mitigation with its rough cost (hours or days, and any
operational burden it adds) and an owner-shaped next step — a
ticket-sized action a named role could pick up, not "improve
resilience".

**Done when:** every mode has an RPN or a marked unknown, the top
5–10 are listed with mitigation, cost, and next step, and the
remainder are recorded as accepted or deferred with a one-line
reason.

## 5. Prove it

For each top mitigation, specify a game-day or fault-injection test
that would demonstrate it works: what to break (kill the process,
inject latency with a proxy or `tc`, return 500s or malformed
bodies from a stub, corrupt or duplicate a record, fill the disk,
partition the network), where to run it (staging, a canary, a
shadow environment), and the **expected observable outcome** — the
alert that should fire within N seconds, the fallback response the
user should see, the queue depth that should rise and then drain.

A test without an expected outcome is a demo. The outcome is what
turns "we added a circuit breaker" into "we know the breaker opens
after 5 failures and the checkout page degrades to cash-only within
10 seconds".

**Done when:** every top mitigation has a test with a fault, an
environment, and a measurable expected outcome.

## 6. Write the report

Deliver the full FMEA table plus the ranked mitigations and tests,
using the skeleton in
[references/fmea-template.md](references/fmea-template.md). Put the
ranked top risks first — the table is the evidence, the ranking is
the decision. Where the user names a path, write the report there;
otherwise present it inline and offer to save it next to the
system's design docs.

**Done when:** the report contains the table, the ranked list with
costs and next steps, the tests, the detection gaps as their own
section, and the unknowns that block a score.

## Verify before returning

Every inventory item appears in the table with every applicable
mode — spot-check the boring ones (DNS, certs, config, disk). Every
current-behavior entry was read from code or config, not inferred
from intent. The top-ranked risks each carry a mitigation, a cost, a
next step, and a test with an expected outcome. Unknowns are marked,
not scored. Nothing in the report describes an attacker, a rollout
plan, or a past incident — those belong to the sibling skills the
opening names.
