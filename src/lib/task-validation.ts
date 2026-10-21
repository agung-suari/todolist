export const MAX_TITLE_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 2000;
export const TASK_CATEGORIES = ["Pribadi", "Belajar", "Pemrograman", "Proyek", "Pekerjaan"] as const;
export const TASK_PRIORITIES = ["Rendah", "Sedang", "Tinggi"] as const;

export type TaskInput = { title: string; description: string | null; category: string; priority: string; dueDate: string | null };
export type TaskView = TaskInput & { id: number; completed: boolean };
export type TaskActionResult = { ok: true } | { ok: false; error: string };

export function parseTaskInput(formData: FormData): TaskInput {
  const title = formData.get("title");
  const description = formData.get("description") ?? "";
  const category = formData.get("category");
  const priority = formData.get("priority") ?? "Sedang";
  const dueDate = formData.get("dueDate") ?? "";
  if (typeof title !== "string" || !title.trim()) throw new Error("Judul tugas wajib diisi.");
  if (title.trim().length > MAX_TITLE_LENGTH) throw new Error(`Judul maksimal ${MAX_TITLE_LENGTH} karakter.`);
  if (typeof description !== "string" || description.trim().length > MAX_DESCRIPTION_LENGTH) {
    throw new Error(`Deskripsi maksimal ${MAX_DESCRIPTION_LENGTH} karakter.`);
  }
  if (typeof category !== "string" || !TASK_CATEGORIES.some((value) => value === category)) {
    throw new Error("Pilih kategori yang tersedia.");
  }
  if (typeof priority !== "string" || !TASK_PRIORITIES.some((value) => value === priority)) {
    throw new Error("Pilih prioritas yang tersedia.");
  }
  if (typeof dueDate !== "string" || (dueDate !== "" && !isValidDate(dueDate))) {
    throw new Error("Masukkan tanggal tenggat yang valid.");
  }
  return { title: title.trim(), description: description.trim() || null, category, priority, dueDate: dueDate || null };
}

export function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < "1900-01-01" || value > "9999-12-31") return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function isValidTaskId(id: unknown): id is number {
  return typeof id === "number" && Number.isSafeInteger(id) && id > 0 && id <= 2147483647;
}
