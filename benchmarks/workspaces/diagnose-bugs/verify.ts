import assert from "node:assert/strict";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

if (!process.argv[2]) throw new Error("usage: bun verify.ts <solver-workspace>");
const { greet } = await import(pathToFileURL(resolve(process.argv[2], "greeting.ts")).href);
const releases = new Map<string, (user: { name: string }) => void>();
const load = (id: string) => new Promise<{ name: string }>((done) => releases.set(id, done));
const first = greet("tenant-a", "a", load);
const second = greet("tenant-b", "b", load);
// Both reads must start without waiting for the other request to finish.
assert.equal(releases.size, 2, "fix must preserve concurrent execution");
releases.get("b")!({ name: "Bea" });
assert.equal(await second, "tenant-b: hello Bea");
releases.get("a")!({ name: "Ada" });
assert.equal(await first, "tenant-a: hello Ada");
assert.equal(await greet("tenant-c", "c", async () => ({ name: "Cy" })), "tenant-c: hello Cy");
console.log("PASS: isolated request state with overlapping calls");
