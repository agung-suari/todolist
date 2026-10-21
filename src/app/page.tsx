
"use client";

import { useState, type FormEvent } from "react";

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
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: "Belajar dasar Next.js",
      category: "Belajar",
      completed: true,
    },
    {
      id: 2,
      title: "Memahami TypeScript",
      category: "Pemrograman",
      completed: false,
    },
    {
      id: 3,
      title: "Membuat desain dashboard",
      category: "Proyek",
      completed: false,
    },
  ]);

  // State kedua: teks yang sedang diketik pengguna.
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");


  // Menghitung tugas selesai dari daftar saat ini.
  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  // Menangani pengiriman form untuk menambahkan tugas.
  function handleAddTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Menghapus spasi di awal dan akhir judul.
    const title = newTaskTitle.trim();

    // Jangan menambahkan tugas jika judul kosong.
    if (!title) return;

    const newTask: Task = {
      id: Date.now(),
      title: title,
      category: "Pribadi",
      completed: false,
    };

    // Membuat array baru yang berisi tugas lama dan tugas baru.
    setTasks((currentTasks) => [
      ...currentTasks,
      newTask,
    ]);

    // Mengosongkan input setelah tugas ditambahkan.
    setNewTaskTitle("");
  }

  // Menandai tugas sebagai selesai atau belum selesai.
  function handleToggleTask(taskId: number) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  }
  function handleDeleteTask(taskId: number) {
    setTasks((currentTasks) =>
      currentTasks.filter(
        (task) => task.id !== taskId
      )
    );
  }
  function handleStartEdit(task: Task) {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
  }
  function handleSaveEdit() {
    const title = editTitle.trim();

    if (!title || editingTaskId === null) {
      return;
    }

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === editingTaskId
          ? { ...task, title: title }
          : task
      )
    );

    setEditingTaskId(null);
    setEditTitle("");
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

          {tasks.length === 0 ? (
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
