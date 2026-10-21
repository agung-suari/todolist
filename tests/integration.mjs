import "dotenv/config";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { Client } from "pg";

// Requires a running local server. Creates only disposable accounts and removes
// those fixtures in finally; never selects or deletes an existing user's data.
const origin = process.env.APP_URL || "http://127.0.0.1:3000";
assert.ok(["127.0.0.1", "localhost"].includes(new URL(origin).hostname), "Integration tests require a local server");
const production = process.env.INTEGRATION_MODE === "production";
const manifestPath = production ? ".next/server/server-reference-manifest.json" : ".next/dev/server/server-reference-manifest.json";
const prefix = `integration-${randomUUID()}`;
const emails = ["a", "b", "limited"].map(suffix => `${prefix}-${suffix}@ruangtugas.invalid`);
const password = randomBytes(24).toString("hex");
const db = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000 });
const request = (url, options = {}) => fetch(url, { signal: AbortSignal.timeout(30000), ...options });

async function assertLoginRedirect(response) {
  const text = await response.text();
  assert.ok(response.headers.get("location")?.endsWith("/login") ||
    /url=\/login|NEXT_REDIRECT;replace;\/login/.test(text), "Expected redirect to login");
}

async function action(name, args, cookie = "", fields) {
  const route = name === "register" ? "/register" : name === "login" ? "/login" : "/";
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const entry = Object.entries(manifest.node).find(([, value]) => value.exportedName === name);
  assert.ok(entry, `Server action ${name} not compiled`);
  const headers = { "Next-Action": entry[0], Origin: origin, Cookie: cookie };
  let body;
  if (fields) {
    body = new FormData();
    for (const [key, value] of Object.entries(fields)) body.set(`_1_${key}`, value);
    body.set("0", JSON.stringify(args));
  } else {
    headers["Content-Type"] = "text/plain;charset=UTF-8";
    body = JSON.stringify(args);
  }
  const response = await request(origin + route, { method: "POST", headers, body, redirect: "manual" });
  const text = await response.text();
  assert.ok(response.status < 400, `${name} returned HTTP ${response.status}`);
  const setCookie = response.headers.getSetCookie().find(value => /^(?:__Host-)?ruangtugas-session=/.test(value)) || "";
  return { response, text, setCookie, cookie: setCookie.split(";")[0] };
}

try {
  await db.connect();
  const privateTables = await db.query("SELECT c.relname,c.relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname IN ('User','Task','Session','AuthThrottle')");
  assert.equal(privateTables.rowCount, 4);
  assert.ok(privateTables.rows.every(table => table.relrowsecurity));
  const publicGrants = await db.query("SELECT has_table_privilege(r.oid,c.oid,'SELECT') AS can_read FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace CROSS JOIN pg_roles r WHERE n.nspname='public' AND c.relname IN ('User','Task','Session','AuthThrottle') AND r.rolname IN ('anon','authenticated')");
  assert.ok(publicGrants.rows.every(grant => !grant.can_read));
  for (const route of ["/login", "/register"]) {
    assert.equal((await request(origin + route)).status, 200);
  }
  const anonymous = await request(origin + "/", { redirect: "manual" });
  await assertLoginRedirect(anonymous);

  const accounts = [];
  for (const [index, email] of emails.slice(0, 2).entries()) {
    const registered = await action("register", [{ error: "" }, "$K1"], "", { name: `Disposable account ${index}`, email, password });
    assert.ok(registered.cookie.includes("session="), `Registration must create a session: ${registered.text.replaceAll(password, "[redacted]").slice(0, 1200)}`);
    assert.match(registered.setCookie, /HttpOnly/i);
    assert.match(registered.setCookie, /SameSite=lax/i);
    if (production) assert.match(registered.setCookie, /Secure/i);
    const row = await db.query('SELECT id,"passwordHash" FROM "User" WHERE email=$1', [email]);
    assert.equal(row.rowCount, 1);
    assert.match(row.rows[0].passwordHash, /^scrypt\$/);
    accounts.push({ ...registered, id: row.rows[0].id });
  }
  console.log("PASS: registration creates password hashes and protected session cookies.");

  const title = `${prefix}-task`;
  const fields = { title, description: "Disposable task", category: "Belajar", priority: "Tinggi", dueDate: "2028-02-29", userId: String(accounts[1].id) };
  const saved = await action("saveTask", [null, "$K1"], accounts[0].cookie, fields);
  assert.match(saved.text, /"ok":true/);
  const row = await db.query('SELECT id,"userId","dueDate",priority FROM "Task" WHERE title=$1', [title]);
  assert.equal(row.rowCount, 1);
  assert.equal(row.rows[0].userId, accounts[0].id, "Forged owner input must be ignored");
  assert.equal(row.rows[0].priority, "Tinggi");
  const taskId = row.rows[0].id;
  const ownerPage = await request(origin + "/", { headers: { Cookie: accounts[0].cookie } }).then(r => r.text());
  const otherPage = await request(origin + "/", { headers: { Cookie: accounts[1].cookie } }).then(r => r.text());
  assert.ok(ownerPage.includes(title));
  assert.ok(!otherPage.includes(title));

  for (const [name, args, data] of [
    ["setTaskCompleted", [taskId, true]], ["deleteTask", [taskId]],
    ["saveTask", [taskId, "$K1"], { ...fields, title: "Forbidden edit" }],
  ]) {
    assert.match((await action(name, args, accounts[1].cookie, data)).text, /"ok":false/);
  }
  const untouched = await db.query('SELECT title,completed FROM "Task" WHERE id=$1', [taskId]);
  assert.equal(untouched.rows[0].title, title);
  assert.equal(untouched.rows[0].completed, false);
  assert.match((await action("deleteTask", [taskId])).text, /"ok":false/);
  assert.match((await action("deleteTask", [taskId], accounts[0].cookie.slice(0, -1) + "z")).text, /"ok":false/);
  console.log("PASS: reads, edits, status and deletes respect ownership; anonymous and forged sessions rejected.");

  assert.match((await action("saveTask", [taskId, "$K1"], accounts[0].cookie, { ...fields, title: title + "-edited", dueDate: "" })).text, /"ok":true/);
  assert.match((await action("setTaskCompleted", [taskId, true], accounts[0].cookie)).text, /"ok":true/);
  const updated = await db.query('SELECT title,completed,"dueDate" FROM "Task" WHERE id=$1', [taskId]);
  assert.equal(updated.rows[0].title, title + "-edited");
  assert.equal(updated.rows[0].completed, true);
  assert.equal(updated.rows[0].dueDate, null);
  assert.match((await action("saveTask", [null, "$K1"], accounts[0].cookie, { ...fields, dueDate: "2026-02-29" })).text, /"ok":false/);

  const token = accounts[0].cookie.split("=")[1];
  const tokenHash = createHash("sha256").update(token).digest("hex");
  assert.equal((await db.query('SELECT "tokenHash" FROM "Session" WHERE "tokenHash"=$1', [tokenHash])).rowCount, 1);
  await db.query('UPDATE "Session" SET "expiresAt"=TIMESTAMP \'2000-01-01\' WHERE "tokenHash"=$1', [tokenHash]);
  assert.match((await action("deleteTask", [taskId], accounts[0].cookie)).text, /"ok":false/);
  const wrongPassword = await action("login", [{ error: "" }, "$K1"], "", { email: emails[0], password: "wrong password" });
  assert.ok(!wrongPassword.cookie);
  const loggedIn = await action("login", [{ error: "" }, "$K1"], "", { email: emails[0], password });
  assert.ok(loggedIn.cookie.includes("session="));
  assert.notEqual(loggedIn.cookie, accounts[0].cookie);
  assert.match((await action("deleteTask", [taskId], loggedIn.cookie)).text, /"ok":true/);
  await action("logout", [], loggedIn.cookie);
  assert.equal((await db.query('SELECT id FROM "Task" WHERE id=$1', [taskId])).rowCount, 0);
  const afterLogout = await request(origin + "/", { redirect: "manual", headers: { Cookie: loggedIn.cookie } });
  await assertLoginRedirect(afterLogout);
  console.log("PASS: edit, completion, date clearing, expiry, login, token rotation and logout revocation.");

  for (let i = 0; i < 11; i++) {
    const result = await action("login", [{ error: "" }, "$K1"], "", { email: emails[2], password: "wrong password" });
    if (i === 10) assert.ok(result.text.includes("Terlalu banyak percobaan"));
  }
  console.log("PASS: authentication throttling enforced across requests.");
} finally {
  // Exact random email fixture selection also cleans up partial registrations.
  for (const email of emails) {
    await db.query('DELETE FROM "User" WHERE email=$1', [email]).catch(() => {});
    const hash = createHash("sha256").update(email).digest("hex");
    for (const kind of ["login", "register"]) {
      await db.query('DELETE FROM "AuthThrottle" WHERE "key" LIKE $1', [`${kind}:${hash}:%`]).catch(() => {});
    }
  }
  await db.end();
}
