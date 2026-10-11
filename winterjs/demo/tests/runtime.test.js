import { test } from "node:test";
import assert from "node:assert";

test("fetch data: URL", async () => {
  assert.strictEqual(await (await fetch("data:text/plain,hi")).text(), "hi");
});
test("WinterJS.semver", () => {
  assert.ok(WinterJS.semver.satisfies("26.9.27", "^26.9.0"));
});
test("structuredClone", () => {
  assert.deepStrictEqual(structuredClone({ a: [1, 2] }), { a: [1, 2] });
});
