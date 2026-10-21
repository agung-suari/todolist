"use server";

import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { isValidTaskId, parseTaskInput, type TaskActionResult } from "@/lib/task-validation";

async function mutateTask(operation: (userId: number) => Promise<void>): Promise<TaskActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: "Sesi berakhir. Masuk kembali untuk melanjutkan." };
    await operation(user.id);
  } catch {
    return { ok: false, error: "Perubahan belum tersimpan. Coba lagi sebentar." };
  }
  revalidatePath("/");
  return { ok: true };
}

export async function saveTask(id: number | null, formData: FormData): Promise<TaskActionResult> {
  if (id !== null && !isValidTaskId(id)) return { ok: false, error: "Tugas tidak valid." };
  if (!(formData instanceof FormData)) return { ok: false, error: "Isian tidak valid." };
  let input;
  try {
    input = parseTaskInput(formData);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Isian tidak valid." };
  }
  const data = { ...input, dueDate: input.dueDate ? new Date(`${input.dueDate}T00:00:00.000Z`) : null };
  return mutateTask(async (userId) => {
    if (id === null) {
      await getPrisma().task.create({ data: { ...data, userId } });
    } else {
      const result = await getPrisma().task.updateMany({ where: { id, userId }, data });
      if (result.count !== 1) throw new Error("Task unavailable");
    }
  });
}

export async function setTaskCompleted(id: number, completed: boolean): Promise<TaskActionResult> {
  if (!isValidTaskId(id) || typeof completed !== "boolean") return { ok: false, error: "Perubahan status tidak valid." };
  return mutateTask(async (userId) => {
    const result = await getPrisma().task.updateMany({ where: { id, userId }, data: { completed } });
    if (result.count !== 1) throw new Error("Task unavailable");
  });
}

export async function deleteTask(id: number): Promise<TaskActionResult> {
  if (!isValidTaskId(id)) return { ok: false, error: "Tugas tidak valid." };
  return mutateTask(async (userId) => {
    const result = await getPrisma().task.deleteMany({ where: { id, userId } });
    if (result.count !== 1) throw new Error("Task unavailable");
  });
}
