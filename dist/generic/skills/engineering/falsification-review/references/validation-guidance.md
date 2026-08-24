# Validation guidance for security findings

*Adapted from openai/codex-security (Apache-2.0); see repo-root NOTICES.md.*

Falsifying a security finding is stricter than falsifying an opinion: the
claim is "an attacker can do X," and the honest test is to try to prove they
cannot. Assign each candidate exactly one disposition — **confirmed**,
**refuted**, or **needs-more-evidence** — and back it with proof at the
right altitude for its vulnerability class.

## Class-specific proof

The evidence that settles a finding depends on the class. For each, the
minimum proof that confirms it:

- **Injection (SQL, command, template)** — a traced path where attacker
  input reaches the interpreter unparameterized, and a concrete input that
  changes the parsed structure (not just the data).
- **Path traversal / file access** — a path where attacker-controlled path
  segments reach a filesystem call without normalization-then-containment,
  and an input that escapes the intended root.
- **Deserialization** — attacker-controlled bytes reaching a deserializer
  that can instantiate arbitrary types or invoke gadget chains; name the
  sink and why the type set is not constrained.
- **SSRF** — attacker-controlled destination reaching an outbound request
  with no allowlist, plus what internal target becomes reachable.
- **Authorization** — a request that reaches a protected action without the
  check, shown by the missing or mis-ordered guard on that specific path,
  not by the guard's general presence elsewhere.
- **XML / XXE** — untrusted XML reaching a parser with external-entity
  resolution enabled; name the parser and its configuration.

## Confidence calibration

State confidence as a number and mean it:

- **0.9–1.0** — full chain traced, proof-of-concept or equivalent
  demonstration, no compensating control.
- **0.6–0.8** — source, sink, and missing control located; one link
  (reachability or a possible upstream control) not yet verified.
- **0.3–0.5** — a suggestive pattern; the path or the missing control is not
  established. Disposition is needs-more-evidence, not confirmed.
- **Below 0.3** — refuted, or too speculative to report as a finding.

## Suppression standard

A generic assurance does not refute a finding. "It's probably sanitized
upstream" refutes nothing unless you can point to the sanitizer and show it
covers this sink's context and encoding. Refute on a specific, located,
sufficient control — and record which control did it and why it holds.
