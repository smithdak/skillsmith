The greeting service sometimes greets the wrong tenant when calls overlap.
Find the cause in greeting.ts, fix it, and add a regression test. Preserve the
public API and concurrent execution. Explain the mechanism and distinguish
what you reproduced from what you inferred. No external service is required;
loadUser is an injected async function.
