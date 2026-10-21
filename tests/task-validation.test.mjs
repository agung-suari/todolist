import assert from "node:assert/strict";
import test from "node:test";
import { isValidTaskId, parseTaskInput } from "../src/lib/task-validation.ts";

function form(fields = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries({ title: "Belajar", category: "Pribadi", ...fields })) {
    data.set(key, value);
  }
  return data;
}

test("normalizes task text and empty optional descriptions", () => {
  assert.deepEqual(parseTaskInput(form({ title: "  Belajar  ", description: "   " })), {
    title: "Belajar", description: null, category: "Pribadi", priority: "Sedang", dueDate: null,
  });
  assert.equal(parseTaskInput(form({ description: "  Catatan  " })).description, "Catatan");
});

test("validates real calendar dates and priority values", () => {
  assert.equal(parseTaskInput(form({ dueDate: "2028-02-29", priority: "Tinggi" })).dueDate, "2028-02-29");
  for (const dueDate of ["2026-02-29", "2026-04-31", "2026-13-01", "invalid", "2026-1-1"]) {
    assert.throws(() => parseTaskInput(form({ dueDate })), /tanggal/);
  }
  assert.throws(() => parseTaskInput(form({ priority: "SUPER" })), /prioritas/);
});

test("rejects blank titles even when browser validation is bypassed", () => {
  assert.throws(() => parseTaskInput(form({ title: " \n " })), /wajib diisi/);
});

test("enforces title and description limits on the server", () => {
  assert.equal(parseTaskInput(form({ title: "a".repeat(200) })).title.length, 200);
  assert.throws(() => parseTaskInput(form({ title: "a".repeat(201) })), /200/);
  assert.throws(() => parseTaskInput(form({ description: "a".repeat(2001) })), /2000/);
});

test("rejects forged categories and file values", () => {
  assert.throws(() => parseTaskInput(form({ category: "Administrator" })), /kategori/);
  const data = form();
  data.set("title", new Blob(["not text"]), "title.txt");
  assert.throws(() => parseTaskInput(data), /wajib diisi/);
});

test("accepts only positive PostgreSQL integer task IDs", () => {
  for (const id of [1, 2147483647]) assert.equal(isValidTaskId(id), true);
  for (const id of [0, -1, 1.5, "1", null, undefined, true, NaN, Infinity, 2147483648]) {
    assert.equal(isValidTaskId(id), false);
  }
});
