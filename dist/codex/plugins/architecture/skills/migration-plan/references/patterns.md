# Transition patterns

Six patterns cover nearly every live-system migration. Pick one as the
governing shape; the others often appear inside it as tactics.

| Pattern | Fits when | Costs | Characteristic risks | Rollback story |
|---|---|---|---|---|
| **Strangler fig** | Replacing a large system piece by piece behind a stable facade (proxy, router, API gateway); long-lived coexistence is acceptable | A routing layer to build and operate; two systems to run for months; per-slice migration work | The last 10% is never strangled; facade becomes a permanent tax; behavior drift between old and new paths | Per slice: route the slice back to the old system. Valid as long as the old system still serves it |
| **Expand / contract** (parallel change) | Schema, interface, or contract changes with many callers; anything where old and new shapes can coexist | Three deploys instead of one; temporary duplication; discipline to actually run the contract phase | Contract phase forgotten, leaving both shapes forever; callers migrated unevenly; code paths that only exist mid-migration | Expand is additive — drop the addition. Contract is the one-way door: rollback means re-expanding, valid only if no caller depends on the removal |
| **Dual-write + reconciliation** | Moving data between stores while both must stay live; volume too large or writes too continuous for a pause | Write path complexity; doubled write load; a reconciliation job that must be built and trusted | Partial-write inconsistency (A succeeds, B fails); ordering races; reconciliation tolerance quietly widened to make it pass | Stop writing to B, keep A authoritative. Valid until reads are switched to B and B has accepted writes A did not |
| **Shadow traffic** | Replacing a service or path where behavior equivalence, not just availability, must be proven; responses can be compared | Mirroring infrastructure; a diff pipeline; doubled compute on the shadowed path | Non-idempotent side effects executed twice; comparison noise from timestamps and IDs masking real diffs; shadow load not matching peak | Turn off the mirror. Valid indefinitely — shadow never served a user |
| **Feature-flag cutover** | Routing users or requests between old and new by percentage or cohort; the new path is complete and independently deployable | Flag plumbing on every affected path; two live code paths to keep correct; cohort selection logic | Flag left on forever with the old path rotting; stateful requests split across paths mid-session; flag evaluated inconsistently across services | Flip the flag. Valid as long as the old path is deployed and its data is current |
| **Big-bang** | The transition is small, the downtime window is real and accepted, and any reversible alternative costs more than the outage | A maintenance window; a rehearsed runbook; everyone available at once | No incremental evidence — the first real test is production; rollback under pressure; hidden dependencies surface only during the window | Restore the pre-cutover snapshot and redeploy the old version. Valid only until new writes land; after that, rollback is itself a migration |

## Guidance per pattern

**Strangler fig.** Build the facade first and prove it with zero slices
migrated — a routing layer that itself changes behavior corrupts every
later measurement. Migrate the slice with the most traffic and the
least state early; it yields the most evidence per unit of risk. Plan
the decommission of the facade, or it outlives the migration.

**Expand / contract.** Number the three moves — expand, migrate
callers, contract — as separate phases with separate verifications;
the middle phase is where "all callers moved" needs a real check (log
old-shape usage and watch it reach zero), not an assumption. Write
the contract phase's date into the plan; unscheduled contractions do
not happen.

**Dual-write + reconciliation.** Decide which store is authoritative
for each phase and encode it, so a failed write to the secondary is
logged and repaired rather than failing the request. Reconciliation
must run before it is needed: a job first executed at cutover has
never been trusted. Fix the tolerance in step 1 of the plan and treat
a widening of it as a pivot trigger, not a tuning knob.

**Shadow traffic.** Inventory side effects before mirroring — emails,
charges, webhooks, writes to shared stores — and stub or sandbox every
one on the shadow path. Normalize the comparison (strip IDs,
timestamps, ordering of unordered collections) and keep the raw diffs
for the first week; the noise you filter out is where a real
discrepancy will hide.

**Feature-flag cutover.** Ramp by cohort with a fixed schedule (1% →
10% → 50% → 100%) and an advance criterion at each step; a ramp with
no criteria is a slower big-bang. Pin users to a path for the length
of a session when state is involved. Schedule the flag's removal as
the final phase.

**Big-bang.** Rehearse the full runbook against a production-sized
copy, with the clock running, at least once; the rehearsal is the
verification the other patterns get for free. Define the abort point —
the last minute at which the snapshot restore still completes inside
the window — and put a named person on the decision to abort.
