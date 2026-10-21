import type { TaskView } from "./task-validation";

export type TaskFilters = {
  query: string;
  status: string;
  category: string;
  priority: string;
  sort: string;
};

export function filterTasks(tasks: TaskView[], filters: TaskFilters) {
  const query = filters.query.trim().toLocaleLowerCase("id");
  const priorities: Record<string, number> = { Tinggi: 3, Sedang: 2, Rendah: 1 };
  return tasks.filter((task) => {
    if (filters.status === "open" && task.completed) return false;
    if (filters.status === "completed" && !task.completed) return false;
    if (filters.category && task.category !== filters.category) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    return `${task.title} ${task.description ?? ""}`.toLocaleLowerCase("id").includes(query);
  }).sort((a, b) => {
    if (filters.sort === "due") return (a.dueDate ?? "9999-99-99").localeCompare(b.dueDate ?? "9999-99-99") || b.id - a.id;
    if (filters.sort === "priority") return (priorities[b.priority] ?? 0) - (priorities[a.priority] ?? 0) || b.id - a.id;
    return b.id - a.id;
  });
}
