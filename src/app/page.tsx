
"use client";

import { useEffect, useState, type FormEvent } from "react";

// Menentukan bentuk data setiap tugas.
// TypeScript akan membantu kita menjaga konsistensi data.
type Task = {
  id: number;
  title: string;
  category: string;
  completed: boolean;
};

export default function Home() {
  // State pertama: daftar tugas.
  const [tasks, setTasks] = useState<Task[]>([]);

  // State kedua: teks yang sedang diketik pengguna.
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    let cancelled = false;

    async function loadTasks() {
      try {
        setLoadError("");

        const response = await fetch("/api/tasks");

        if (!response.ok) {
          throw new Error("Gagal mengambil daftar tugas.");
        }

        const data: Task[] = await response.json();

        if (!cancelled) {
          setTasks(data);
        }
      } catch {
        if (!cancelled) {
          setLoadError("Tugas gagal dimuat dari database.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadTasks();

    return () => {
      cancelled = true;
    };
  }, []);

  // Menghitung tugas selesai dari daftar saat ini.
  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  // Menangani pengiriman form untuk menambahkan tugas.

  async function handleAddTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = newTaskTitle.trim();

    // Jangan kirim tugas dengan judul kosong.
    if (!title) return;

    try {
      // Mengirim judul tugas ke API Next.js.
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });

      // Jika server menolak permintaan, tampilkan pesan kesalahan.
      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        throw new Error(
          errorData?.error ?? "Gagal menyimpan tugas."
        );
      }

      // Menerima tugas yang sudah disimpan oleh server.
      const savedTask: Task = await response.json();

      // Perbarui dashboard menggunakan data dari database.
      setTasks((currentTasks) => [
        savedTask,
        ...currentTasks,
      ]);

      // Kosongkan input setelah penyimpanan berhasil.
      setNewTaskTitle("");
    } catch (error) {
      console.error("Gagal menambahkan tugas:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menambahkan tugas."
      );
    }
  }


  // Menandai tugas sebagai selesai atau belum selesai.
  async function handleToggleTask(taskId: number) {
    // Mencari tugas yang sedang dipilih.
    const currentTask = tasks.find(
      (task) => task.id === taskId
    );

    if (!currentTask) return;

    // Membalik status tugas.
    const nextCompleted = !currentTask.completed;

    try {
      // Mengirim perubahan status ke API PATCH.
      const response = await fetch("/api/tasks", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: taskId,
          completed: nextCompleted,
        }),
      });

      const result: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof result === "object" &&
            result !== null &&
            "error" in result &&
            typeof result.error === "string"
            ? result.error
            : "Gagal memperbarui status tugas.";

        throw new Error(message);
      }

      // Mengambil hasil terbaru dari database.
      const updatedTask = result as Task;

      // Memperbarui tampilan setelah database berhasil diubah.
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === updatedTask.id
            ? updatedTask
            : task
        )
      );

    } catch (error) {
      console.error("Gagal mengubah status tugas:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengubah status tugas."
      );
    }
  }

  async function handleDeleteTask(taskId: number) {
    // Konfirmasi sebelum menghapus tugas.
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin menghapus tugas ini?"
    );

    if (!confirmed) return;

    try {
      // Mengirim ID tugas ke API DELETE.
      const response = await fetch("/api/tasks", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: taskId,
        }),
      });

      const result: unknown = await response.json();

      // Memeriksa apakah server berhasil menghapus tugas.
      if (!response.ok) {
        const message =
          typeof result === "object" &&
            result !== null &&
            "error" in result &&
            typeof result.error === "string"
            ? result.error
            : "Gagal menghapus tugas.";

        throw new Error(message);
      }

      // Menghapus tugas dari tampilan setelah database berhasil diubah.
      setTasks((currentTasks) =>
        currentTasks.filter(
          (task) => task.id !== taskId
        )
      );

    } catch (error) {
      console.error("Gagal menghapus tugas:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menghapus tugas."
      );
    }
  }

  function handleStartEdit(task: Task) {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
  }

  async function handleSaveEdit() {
    const title = editTitle.trim();

    if (!title || editingTaskId === null) {
      return;
    }

    try {
      // Mengirim ID dan judul baru ke API PATCH.
      const response = await fetch("/api/tasks", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingTaskId,
          title: title,
        }),
      });

      const result: unknown = await response.json();

      // Memeriksa apakah server berhasil memperbarui tugas.
      if (!response.ok) {
        const message =
          typeof result === "object" &&
            result !== null &&
            "error" in result &&
            typeof result.error === "string"
            ? result.error
            : "Gagal memperbarui tugas.";

        throw new Error(message);
      }

      // Menggunakan hasil terbaru dari database.
      const updatedTask = result as Task;

      // Memperbarui tampilan dashboard.
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === updatedTask.id
            ? updatedTask
            : task
        )
      );

      // Menutup mode edit.
      setEditingTaskId(null);
      setEditTitle("");

    } catch (error) {
      console.error("Gagal mengedit tugas:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengedit tugas."
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <p className="text-sm font-semibold text-indigo-600">
            RUANG TUGAS
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Manajemen Tugas
          </h1>

          <p className="mt-2 text-slate-600">
            Atur kegiatanmu agar lebih terorganisasi.
          </p>
        </header>

        {/* Ringkasan tugas */}
        <section className="grid gap-4 sm:grid-cols-3">
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Tugas</p>
            <p className="mt-2 text-3xl font-bold">
              {tasks.length}
            </p>
          </article>

          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Sudah Selesai</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {completedTasks}
            </p>
          </article>

          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Belum Selesai</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">
              {tasks.length - completedTasks}
            </p>
          </article>
        </section>

        {/* Form untuk menambah tugas */}
        <section className="mt-8 rounded-2xl bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-bold">Tambah Tugas</h2>

          <form
            onSubmit={handleAddTask}
            className="mt-4 flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="text"
              value={newTaskTitle}
              onChange={(event) =>
                setNewTaskTitle(event.target.value)
              }
              placeholder="Contoh: Belajar React"
              className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
            />

            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
            >
              Tambah
            </button>
          </form>
        </section>

        {/* Daftar tugas */}
        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-bold">Daftar Tugas</h2>

          {isLoading ? (
            <p className="mt-5 text-slate-500">
              Memuat tugas dari database...
            </p>
          ) : loadError ? (
            <p className="mt-5 text-red-600">
              {loadError}
            </p>
          ) : tasks.length === 0 ? (
            <p className="mt-5 text-slate-500">
              Belum ada tugas. Silakan tambahkan tugas baru.
            </p>
          ) : (
            <ul className="mt-5 divide-y divide-slate-100">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-3 py-4"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleTask(task.id)}
                    aria-label={
                      task.completed
                        ? "Tandai belum selesai"
                        : "Tandai selesai"
                    }
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm ${task.completed
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-slate-300 hover:border-indigo-500"
                      }`}
                  >
                    {task.completed ? "✓" : ""}
                  </button>

                  <div className="min-w-0 flex-1">

                    {task.id === editingTaskId ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(event) => setEditTitle(event.target.value)}
                        aria-label={`Edit judul ${task.title}`}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
                      />
                    ) : (
                      <p
                        className={`font-medium ${task.completed
                          ? "text-slate-400 line-through"
                          : "text-slate-800"
                          }`}
                      >
                        {task.title}
                      </p>
                    )}


                    <p className="mt-1 text-sm text-slate-500">
                      {task.category}
                    </p>
                  </div>

                  <span className="text-xs text-slate-500">
                    {task.completed ? "Selesai" : "Belum selesai"}
                  </span>

                  {task.id === editingTaskId ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                      >
                        Simpan
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingTaskId(null);
                          setEditTitle("");
                        }}
                        className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(task)}
                        className="rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task.id)}
                        aria-label={`Hapus tugas ${task.title}`}
                        className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        Hapus
                      </button>
                    </>
                  )}

                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="mt-6 text-center text-sm text-slate-500">
          Latihan 2 — data masih tersimpan sementara di state.
        </p>
      </div>
    </main>
  );
}
