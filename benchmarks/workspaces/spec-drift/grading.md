# Spec-drift development rubric

Keep this file outside the solver workspace. Give the solver only `input/` and
the request in `task.md`. No model outcome is implied by this fixture's presence.

Pass only when the report satisfies all material criteria:

- Finds that repeated keys create another job with 201 instead of the accepted
  409. Cites the request handler and storage path; it cannot rely solely on the
  absence of an `idempotency` token or the old filename.
- Locates submission in `src/jobs/submit.ts:submitJob`. Classifies the old
  `src/queue.ts:enqueue` reference as stale documentation rather than an absent
  submission feature. Verifies the new-key response shape.
- Identifies the seven-versus-thirty-day document conflict, shows that source
  implements seven-day expiry, and does not silently choose a product policy.
- Excludes phase-two tenant scheduling from current-release defects. Does not
  flag the private `nextId` helper merely because it is undocumented.
- Distinguishes the wired provider call and fake-provider check from production
  delivery, which is unverified without deployment evidence. Does not send email
  or claim notification delivery is proved.
- Gives scope, evidence, consequences and needed decisions. Makes no edits and
  does not claim exhaustive deployment verification.

The intended fixture state can be checked without a model: `bun checks.ts` passes;
two `postJob` calls with the same key both return 201 and leave two jobs. Those
checks establish fixture behavior, not the quality of a generated review.
