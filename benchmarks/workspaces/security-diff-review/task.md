Review the change from before.ts to after.ts for security vulnerabilities.
The service runs in production. Router middleware authenticates each request
and populates session.tenantId, but performs no object authorization. Report
reachable findings and check callers of changed shared helpers. Do not edit
the code. Save the review as review.md with locations and supporting evidence.
