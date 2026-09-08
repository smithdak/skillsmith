import assert from "node:assert/strict";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

if (!process.argv[2]) throw new Error("usage: bun verify.ts <solver-workspace>");
const { totalCents } = await import(pathToFileURL(resolve(process.argv[2], "price.ts")).href);
for (const [price, quantity, expected] of [[199, 3, 597], [0, 100, 0], [123, 1, 123], [19, 100, 1900]]) {
  assert.equal(totalCents(price, quantity), expected);
}
for (const [price, quantity] of [
  [-1, 1], [1.5, 2], [NaN, 1], [Infinity, 1], [1, 0], [1, 101], [1, 1.5],
  [1, NaN], [Number.MAX_SAFE_INTEGER, 2], [Number.MAX_SAFE_INTEGER + 1, 1],
]) assert.throws(() => totalCents(price, quantity), RangeError);
console.log("PASS: pricing behavior and input boundaries");
