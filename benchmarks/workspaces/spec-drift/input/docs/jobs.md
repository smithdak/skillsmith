# Jobs API

Status: accepted, phase one. This document and the operations README have no
declared precedence rule.

`POST /jobs` accepts `{ "key": string }`. A new key returns status 201 and
`{ "jobId": string }`. A repeated key returns 409 and must not create another job.
The request handler is `postJob`; submission lives in `src/queue.ts:enqueue`.

Completed job records expire after seven days. Completion sends the job ID to
the configured notification provider. Production notification delivery must work.

Phase two, not required for the current release: per-tenant scheduling.
