import { TaskDashboard } from "@/components/task-dashboard";
import { getPrisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import type { TaskView } from "@/lib/task-validation";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await requireUser();
  let tasks: TaskView[] = [];
  let loadError = false;
  try {
    const rows = await getPrisma().task.findMany({
      where: { userId: user.id },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: { id: true, title: true, description: true, category: true, completed: true, priority: true, dueDate: true },
    });
    tasks = rows.map((task) => ({ ...task, dueDate: task.dueDate?.toISOString().slice(0, 10) ?? null }));
  } catch {
    loadError = true;
  }
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const today = ["year", "month", "day"].map((key) => parts.find((part) => part.type === key)?.value).join("-");
  return <TaskDashboard key={user.id} user={{ name: user.name, email: user.email }} tasks={tasks} loadError={loadError} today={today} />;
}
