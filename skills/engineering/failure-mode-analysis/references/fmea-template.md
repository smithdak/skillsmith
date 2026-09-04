# FMEA table and report skeleton

## Table columns

One row per (component, mode) pair. Keep cells short; detail goes in
the report sections below and is referenced by row id.

| Col | Meaning |
|---|---|
| **#** | Row id (F1, F2, …) so mitigations and tests can cite it |
| **Component** | The dependency or boundary, with its primary call site path |
| **Mode** | unavailable · slow · partial · wrong · overloaded · full · split-brain · lost writes |
| **Detection** | Signal, latency to notice, and who is alerted; "gap" if nothing fires |
| **Blast radius** | User-facing paths that break, degrade, or go silently wrong |
| **Current behavior** | What the code does today, read from timeouts/retries/catch blocks: fail closed · fail open · hang · crash-loop · retry unbounded · serve stale |
| **L / I / D** | Likelihood, Impact, Detectability, each 1–5 (D: 1 = paged in seconds, 5 = found by a customer); "?" when unknown |
| **RPN** | L × I × D; blank when any factor is unknown |
| **Mitigation** | Class from the catalog plus the specific configuration, or "existing: <what>" |
| **Test** | Fault to inject, environment, and the expected observable outcome |

### Filled example

| # | Component | Mode | Detection | Blast radius | Current behavior | L/I/D | RPN | Mitigation | Test |
|---|---|---|---|---|---|---|---|---|---|
| F1 | Redis session cache (`lib/session.ts:42`) | unavailable | Connection errors in app log; no alert (gap) | Login, checkout, any authenticated page | Hang: client has no connect timeout, requests pile up until the pool is exhausted, which stalls unauthenticated pages too | 3/5/4 | 60 | Connect + command timeout 200 ms; circuit breaker (5 failures / 30 s open); fallback to DB session lookup with a 2 s budget | Staging: `iptables` drop to Redis port; expect breaker open within 5 s, p99 login < 2.5 s via DB fallback, `redis_breaker_open` alert fires within 60 s |
| F2 | Payments API (`services/payments.ts:118`) | wrong (duplicate success) | None — duplicate charges surface as refund tickets (gap) | Checkout: customer charged twice on retry | Retry on timeout with no idempotency key; the first request may have succeeded server-side | 2/5/5 | 50 | Idempotency key per checkout attempt, persisted before the first call; bounded retry (3, jittered) reusing the key; reconcile job comparing provider ledger to orders | Staging stub returns timeout after committing the charge; expect exactly one charge in the stub ledger and the order marked paid after retry |

## Report skeleton

```markdown
# Failure-mode analysis: <system>

As of <date>, against <branch/commit or design doc version>.

## Top risks (ranked by RPN)

1. **F<n> — <component> / <mode>** (RPN <n>)
   - Why it ranks: <one line grounding L, I, D>
   - Mitigation: <class + configuration>
   - Cost: <hours/days; operational burden added>
   - Next step: <ticket-sized action a named role can pick up>
   - Test: <fault, environment, expected observable outcome>
2. …

## Detection gaps

Modes that fire no alert today, whether or not they rank in the top
list — a silent failure is worth naming even when its RPN is low.

## Unknowns

Scores marked "?" and what would establish each (SLA history, a load
test, the provider's status page, a question for the owning team).

## Accepted and deferred

Rows outside the top list with a one-line reason each: accepted (cost
exceeds exposure), deferred (blocked on an unknown), or already
mitigated (existing control judged adequate).

## Full FMEA table

<the table, all rows>

## Inventory

Every dependency and boundary with kind, call sites, and dependent
user-facing paths — the evidence the table was built from.
```
