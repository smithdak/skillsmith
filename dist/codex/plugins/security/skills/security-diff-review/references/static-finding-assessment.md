# Static finding assessment

*Adapted from openai/codex-security (Apache-2.0); see repo-root NOTICES.md.*

A suspected vulnerability is a finding only when it can show a complete
chain. Assess every candidate against the five-tuple below before reporting
it.

## The five-tuple

1. **Source** — where untrusted input enters: a request parameter, header,
   body, uploaded file, queue message, environment value under attacker
   influence, or data read back from a store an attacker can write.
2. **Control** — the check that is supposed to make the input safe:
   validation, authentication, authorization, escaping, sanitization,
   parameterization, allowlisting. Name the control that is *missing,
   wrong, or bypassable* — a finding is the absence or defeat of a control,
   not merely the presence of a sink.
3. **Sink** — the dangerous operation the input reaches: a SQL/command
   string, a filesystem path, an HTTP request target, a deserializer, an
   HTML/JS context, a redirect, a privileged action.
4. **Reachable path** — a concrete route from source to sink that actually
   executes, traced across every wrapper, helper, and trust boundary in
   between. "These two things exist in the same file" is not a path.
5. **Boundary** — the trust boundary the path crosses, and why the
   receiving side is entitled to assume nothing about the input.

## Evidence search order

Look for proof in this order; stop when the chain is established or
definitively broken:

1. A direct, unbroken data-flow trace from source to sink in the code.
2. The specific control that should intervene, and proof it does not (no
   call, wrong order, bypassable predicate, wrong encoding for the context).
3. Reachability of the entry point in the deployed configuration (route
   registered, handler wired, feature enabled).
4. Any compensating control upstream that already neutralizes the input —
   if one exists and holds, the candidate is not a finding.

## Confidence criteria

- **High** — every element of the tuple is shown in code, the path is
  traced end to end, and no compensating control intervenes.
- **Medium** — source, sink, and missing control are shown, but one link
  (reachability, or a possible upstream control) is unverified and named as
  the open question.
- **Low** — a pattern that often indicates a vulnerability, but the path or
  the missing control is not established. Report as a note to investigate,
  not as a confirmed finding.

## Suppression standard

A generic claim does not suppress a finding. "Input is probably validated
upstream" is not a control unless you can point to the validation and show
it covers this sink's context. Suppress only on a specific, located,
sufficient control — and record which control suppressed it.
