# Jobs service operations

Status: current operations guide. Completed job records expire after thirty days.
No source establishes whether this guide or `docs/jobs.md` takes precedence.

`src/api.ts` exposes the phase-one request handler and completion callback. The
provided `checks.ts` exercises it with a fake notification provider. This checkout
contains no deployment configuration, production credentials or delivery receipts.

Run the local checks with Bun:

```sh
bun checks.ts
```
