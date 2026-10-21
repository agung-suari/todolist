import assert from "node:assert/strict";
import test from "node:test";
import { hashPassword, verifyPassword } from "../src/lib/password.ts";
import { parseCredentials } from "../src/lib/auth-validation.ts";

function credentials(values) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

test("passwords use random salts and reject wrong, disabled, and malformed hashes", async () => {
  const password = "a long example phrase";
  const first = await hashPassword(password);
  const second = await hashPassword(password);
  assert.notEqual(first, second);
  assert.ok(!first.includes(password));
  assert.equal(await verifyPassword(password, first), true);
  assert.equal(await verifyPassword("different password", first), false);
  assert.equal(await verifyPassword(password, "!disabled"), false);
  assert.equal(await verifyPassword(password, "scrypt$invalid$invalid"), false);
});

test("normalizes identity while preserving spaces in passwords", () => {
  const result = parseCredentials(credentials({ email: " Example@Example.com ", password: " a long phrase ", name: " Person " }), true);
  assert.equal(result.email, "example@example.com");
  assert.equal(result.password, " a long phrase ");
  assert.equal(result.name, "Person");
});

test("rejects invalid emails, missing names, and oversized passwords", () => {
  const valid = { email: "person@example.com", password: "a long example phrase", name: "Person" };
  for (const changes of [{ email: "broken" }, { name: " " }, { password: "short" }, { password: "😀".repeat(40) }]) {
    assert.throws(() => parseCredentials(credentials({ ...valid, ...changes }), true));
  }
});
