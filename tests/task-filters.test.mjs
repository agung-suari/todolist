import assert from "node:assert/strict";
import test from "node:test";
import { filterTasks } from "../src/lib/task-filters.ts";

const tasks = [
  { id: 1, title: "Belajar React", description: "Dasar komponen", category: "Belajar", priority: "Tinggi", dueDate: "2026-10-25", completed: false },
  { id: 2, title: "Belanja", description: null, category: "Pribadi", priority: "Sedang", dueDate: null, completed: true },
  { id: 3, title: "Belajar Prisma", description: "REACT dan database", category: "Belajar", priority: "Rendah", dueDate: "2026-10-22", completed: false },
];
const filters = { query: "", status: "all", category: "", priority: "", sort: "newest" };

test("combines search, status, category and priority filters", () => {
  assert.deepEqual(filterTasks(tasks, { ...filters, query: " react ", category: "Belajar", status: "open" }).map(t => t.id), [3, 1]);
  assert.deepEqual(filterTasks(tasks, { ...filters, priority: "Tinggi" }).map(t => t.id), [1]);
  assert.equal(filterTasks(tasks, { ...filters, status: "completed", category: "Belajar" }).length, 0);
});

test("sorts due dates with unscheduled tasks last and priority by importance", () => {
  assert.deepEqual(filterTasks(tasks, { ...filters, sort: "due" }).map(t => t.id), [3, 1, 2]);
  assert.deepEqual(filterTasks(tasks, { ...filters, sort: "priority" }).map(t => t.id), [1, 2, 3]);
  assert.deepEqual(tasks.map(t => t.id), [1, 2, 3]);
});
