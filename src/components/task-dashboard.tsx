"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteTask, saveTask, setTaskCompleted } from "@/app/actions";
import { logout } from "@/app/auth-actions";
import { Brand } from "@/components/brand";
import { Icon, type IconName } from "@/components/icon";
import { Modal } from "@/components/modal";
import { LogoutButton } from "@/components/logout-button";
import { TaskForm } from "@/components/task-form";
import { TASK_CATEGORIES, TASK_PRIORITIES, type TaskActionResult, type TaskView } from "@/lib/task-validation";
import { filterTasks, type TaskFilters } from "@/lib/task-filters";

const emptyFilters: TaskFilters = { query: "", status: "all", category: "", priority: "", sort: "newest" };
type View = "all" | "today" | "overdue";

function deadlineLabel(date: string, today: string) {
  if (date === today) return "Hari ini";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

export function TaskDashboard({ tasks, loadError, user, today }: {
  tasks: TaskView[]; loadError: boolean; user: { name: string; email: string }; today: string;
}) {
  const router = useRouter();
  const [filters, setFilters] = useState<TaskFilters>(emptyFilters);
  const [view, setView] = useState<View>("all");
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState<TaskView | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<TaskView | null>(null);
  const [feedback, setFeedback] = useState<{ error: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const inFlight = useRef(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const completedCount = tasks.filter((task) => task.completed).length;
  const todayCount = tasks.filter((task) => !task.completed && task.dueDate === today).length;
  const overdueCount = tasks.filter((task) => !task.completed && task.dueDate && task.dueDate < today).length;
  const progress = tasks.length ? Math.round(completedCount / tasks.length * 100) : 0;
  const viewTasks = tasks.filter((task) => view === "all" || (!task.completed && task.dueDate && (view === "today" ? task.dueDate === today : task.dueDate < today)));
  const filteredTasks = filterTasks(viewTasks, filters);
  const pageCount = Math.max(1, Math.ceil(filteredTasks.length / 20));
  const currentPage = Math.min(page, pageCount);
  const visibleTasks = filteredTasks.slice((currentPage - 1) * 20, currentPage * 20);
  const hasFilters = Boolean(filters.query || filters.category || filters.priority || filters.status !== "all" || view !== "all");
  const title = view === "today" ? "Hari ini" : view === "overdue" ? "Lewat tenggat" : filters.category || "Tugas saya";

  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey || event.target instanceof HTMLElement && (event.target.closest("input, textarea, select, [contenteditable]"))) return;
      if (event.key === "/" && editor === undefined && !deleting) { event.preventDefault(); searchRef.current?.focus(); }
    };
    document.addEventListener("keydown", shortcut);
    return () => document.removeEventListener("keydown", shortcut);
  }, [editor, deleting]);

  function changeFilter(key: keyof TaskFilters, value: string) {
    setFilters((previous) => ({ ...previous, [key]: value }));
    setPage(1);
  }
  function resetFilters() { setFilters(emptyFilters); setView("all"); setPage(1); }
  function openEditor(task: TaskView | null) { setFeedback(null); setEditor(task); }
  function changeView(next: View, status = "all") { setView(next); setFilters({ ...emptyFilters, status }); setPage(1); }
  function run(operation: () => Promise<TaskActionResult>, message: string, afterSave?: () => void) {
    if (inFlight.current) return;
    inFlight.current = true;
    setFeedback(null);
    startTransition(async () => {
      try {
        const result = await operation();
        if (!result.ok) { setFeedback({ error: true, text: result.error }); return; }
        afterSave?.();
        setFeedback({ error: false, text: message });
      } catch {
        setFeedback({ error: true, text: "Koneksi terputus. Muat ulang untuk memeriksa apakah perubahan sudah tersimpan." });
      } finally { inFlight.current = false; }
    });
  }

  const views: { id: View; label: string; icon: IconName; count: number }[] = [
    { id: "all", label: "Semua tugas", icon: "list", count: tasks.length },
    { id: "today", label: "Hari ini", icon: "calendar", count: todayCount },
    { id: "overdue", label: "Terlewat", icon: "clock", count: overdueCount },
  ];

  return (
    <div className="workspace">
      <a className="skip-link" href="#task-main">Langsung ke daftar tugas</a>
      <aside className="sidebar" aria-label="Navigasi ruang kerja">
        <Link href="/" className="brand-link" aria-label="Ruang Tugas"><Brand /></Link>
        <button className="primary-button sidebar-create" onClick={() => openEditor(null)} disabled={isPending || loadError}><Icon name="plus" size={19} />Tugas baru</button>
        <nav className="sidebar-nav" aria-label="Tampilan tugas">
          {views.map((item) => <button key={item.id} className={`nav-item ${view === item.id && !filters.category && filters.status !== "completed" ? "is-active" : ""}`} onClick={() => changeView(item.id)}><Icon name={item.icon} size={19} /><span>{item.label}</span><span className="nav-count">{item.count}</span></button>)}
          <button className={`nav-item ${filters.status === "completed" ? "is-active" : ""}`} onClick={() => changeView("all", "completed")}><Icon name="check" size={19} /><span>Selesai</span><span className="nav-count">{completedCount}</span></button>
        </nav>
        <div className="sidebar-categories"><p>Kategori</p>{TASK_CATEGORIES.map((category, index) => <button key={category} className={`category-nav ${filters.category === category ? "is-active" : ""}`} onClick={() => { setView("all"); setFilters({ ...emptyFilters, category }); setPage(1); }}><span className={`category-dot category-${index}`} /><span>{category}</span></button>)}</div>
        <div className="sidebar-bottom"><p>Ruang untuk fokus.<br />Langkah kecil, setiap hari.</p><span>Ruang pribadi milikmu</span></div>
      </aside>

      <main id="task-main" className="workspace-main">
        <header className="workspace-topbar"><div className="desktop-context"><span>Ruang pribadi</span><Icon name="chevron" size={14} /><span>Tugas</span></div><div className="mobile-brand"><Brand /></div><div className="account"><span className="avatar" aria-hidden="true">{user.name.trim().slice(0, 1).toUpperCase()}</span><span className="account-name" title={user.email}>{user.name}</span><form action={logout}><LogoutButton /></form></div></header>
        <div className="workspace-content">
          <section className="workspace-heading"><div><h1>{title}</h1><p>{view === "today" ? "Satu hari. Beberapa langkah yang berarti." : view === "overdue" ? "Atur kembali waktunya, lalu mulai pelan-pelan." : "Buat rencana kecil. Beri ruang untuk yang penting."}</p></div><button className="primary-button main-create" onClick={() => openEditor(null)} disabled={isPending || loadError}><Icon name="plus" size={19} />Tugas baru</button></section>

          {loadError ? <section role="alert" className="empty-state"><Icon name="clock" size={32} /><h2>Tugas belum bisa dimuat</h2><p>Data yang tersimpan tetap ada. Coba sambungkan lagi sebentar.</p><button disabled={isPending} className="primary-button" onClick={() => startTransition(() => router.refresh())}>{isPending ? "Memuat…" : "Coba lagi"}</button></section> : <>
            <section className="progress-strip" aria-label="Ringkasan tugas"><div className="progress-copy"><span className="progress-number">{completedCount}<span>/{tasks.length}</span></span><div><strong>{tasks.length ? "Tugas selesai" : "Ruang untuk rencanamu"}</strong><span>{tasks.length ? "Setiap yang selesai memberi ruang baru." : "Mulai dari satu hal yang ingin kamu kerjakan."}</span></div></div><div className="progress-track-wrap"><span>{progress}% selesai</span><progress value={completedCount} max={Math.max(tasks.length, 1)} aria-label="Progres tugas" /></div></section>

            <div className="mobile-views" aria-label="Tampilan tugas">{views.map((item) => <button key={item.id} className={view === item.id ? "is-active" : ""} onClick={() => changeView(item.id)}>{item.label}<span>{item.count}</span></button>)}</div>
            <section className="task-section" aria-labelledby="task-list-heading">
              <div className="list-toolbar"><div className="status-tabs" aria-label="Status tugas">{[{ id: "all", label: "Semua", count: viewTasks.length }, { id: "open", label: "Aktif", count: viewTasks.filter(t => !t.completed).length }, { id: "completed", label: "Selesai", count: viewTasks.filter(t => t.completed).length }].map((tab) => <button key={tab.id} className={filters.status === tab.id ? "is-active" : ""} aria-pressed={filters.status === tab.id} onClick={() => changeFilter("status", tab.id)}>{tab.label}<span>{tab.count}</span></button>)}</div><span className="task-count" aria-live="polite">{filteredTasks.length} tugas</span></div>
              <div className="search-toolbar"><div className="search-box"><Icon name="search" size={19} /><label htmlFor="task-search" className="sr-only">Cari tugas</label><input ref={searchRef} id="task-search" type="search" value={filters.query} onChange={(event) => changeFilter("query", event.target.value)} placeholder="Cari tugas atau catatan…" maxLength={200} /><span className="search-shortcut" aria-hidden="true">/</span></div><details className="filter-details"><summary><Icon name="filter" size={18} />Filter{(filters.category || filters.priority) && <span className="filter-active" />}</summary><div className="filter-panel"><div className="field"><label htmlFor="category-filter">Kategori</label><select id="category-filter" value={filters.category} onChange={(event) => changeFilter("category", event.target.value)}><option value="">Semua kategori</option>{TASK_CATEGORIES.map(category => <option key={category}>{category}</option>)}</select></div><div className="field"><label htmlFor="priority-filter">Prioritas</label><select id="priority-filter" value={filters.priority} onChange={(event) => changeFilter("priority", event.target.value)}><option value="">Semua prioritas</option>{TASK_PRIORITIES.map(priority => <option key={priority}>{priority}</option>)}</select></div></div></details><div className="sort-control"><label className="sr-only" htmlFor="sort-order">Urutkan tugas</label><select id="sort-order" value={filters.sort} onChange={(event) => changeFilter("sort", event.target.value)}><option value="newest">Terbaru</option><option value="due">Tenggat terdekat</option><option value="priority">Prioritas tertinggi</option></select></div></div>
              <h2 id="task-list-heading" className="sr-only">Daftar tugas</h2>
              {hasFilters && <div className="active-filters"><span>{filters.category || (view === "today" ? "Hari ini" : view === "overdue" ? "Terlewat" : "Hasil pilihanmu")}{filters.priority && ` · ${filters.priority}`}</span><button onClick={resetFilters}>Reset filter<Icon name="close" size={14} /></button></div>}
              {tasks.length === 0 ? <section className="empty-state"><span className="empty-symbol"><Icon name="list" size={32} /></span><h2>Mulai dari satu tugas.</h2><p>Tidak perlu merencanakan semuanya.<br />Cukup satu langkah yang ingin kamu ambil.</p><button className="primary-button" onClick={() => openEditor(null)}><Icon name="plus" size={18} />Tulis tugas pertamamu</button></section> : filteredTasks.length === 0 ? <section className="empty-state"><Icon name="search" size={30} /><h2>Belum ada yang cocok.</h2><p>Coba kata lain atau longgarkan pilihan filtermu.</p><button className="secondary-button" onClick={resetFilters}>Tampilkan semua tugas</button></section> : <ul className="task-list" aria-busy={isPending}>{visibleTasks.map(task => <li key={task.id} className={`task-row ${task.completed ? "is-complete" : ""}`}>
                <button type="button" disabled={isPending} className="check-target" aria-pressed={task.completed} aria-label={`${task.completed ? "Tandai belum selesai" : "Tandai selesai"}: ${task.title}`} onClick={() => run(() => setTaskCompleted(task.id, !task.completed), "Status tugas diperbarui.")}><span className="task-checkbox">{task.completed && <Icon name="check" size={16} />}</span></button>
                <div className="task-row-content"><button className="task-title-button" onClick={() => openEditor(task)} disabled={isPending}><span>{task.title}</span></button>{task.description && <p className="task-note">{task.description}</p>}<div className="task-meta"><span className="task-category">{task.category}</span><span className={`priority-label priority-${task.priority === "Tinggi" ? "high" : task.priority === "Rendah" ? "low" : "medium"}`}>{task.priority}</span>{task.dueDate && <span className={`deadline ${!task.completed && task.dueDate < today ? "is-overdue" : ""}`}><Icon name="calendar" size={14} />{deadlineLabel(task.dueDate, today)}{!task.completed && task.dueDate < today && " · Terlewat"}</span>}</div></div>
                <div className="task-actions"><button className="icon-button" disabled={isPending} aria-label={`Edit ${task.title}`} title="Edit tugas" onClick={() => openEditor(task)}><Icon name="edit" size={18} /></button><button className="icon-button danger-icon" disabled={isPending} aria-label={`Hapus ${task.title}`} title="Hapus tugas" onClick={() => { setFeedback(null); setDeleting(task); }}><Icon name="trash" size={18} /></button></div>
              </li>)}</ul>}
              {pageCount > 1 && <nav className="pagination" aria-label="Halaman tugas"><button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="secondary-button">Sebelumnya</button><span>{currentPage} dari {pageCount}</span><button disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} className="secondary-button">Berikutnya</button></nav>}
            </section>
          </>}
          <footer className="workspace-footer"><span>Satu tugas pada satu waktu.</span><span>Ruang Tugas</span></footer>
        </div>
      </main>

      <div className="feedback-region" aria-live="polite" aria-atomic="true">{isPending && editor === undefined && !deleting ? <div className="feedback-toast">Menyimpan perubahan…</div> : feedback && editor === undefined && !deleting && <div className={`feedback-toast ${feedback.error ? "is-error" : ""}`} role={feedback.error ? "alert" : "status"}><Icon name={feedback.error ? "clock" : "check"} size={18} /><span>{feedback.text}{feedback.error && feedback.text.includes("Sesi") && <> <Link href="/login">Masuk kembali</Link></>}</span><button className="icon-button" aria-label="Tutup pesan" onClick={() => setFeedback(null)}><Icon name="close" size={16} /></button></div>}</div>
      {editor !== undefined && <Modal title={editor ? "Edit tugas" : "Tugas baru"} pending={isPending} onClose={() => { setEditor(undefined); setFeedback(null); }}><p className="dialog-description">Beri satu rencana kecil tempat untuk dimulai.</p><TaskForm task={editor ?? undefined} disabled={isPending} error={feedback?.error ? feedback.text : undefined} onCancel={() => { setEditor(undefined); setFeedback(null); }} onSave={(data) => run(() => saveTask(editor?.id ?? null, data), editor ? "Tugas diperbarui." : "Tugas ditambahkan.", () => setEditor(undefined))} /></Modal>}
      {deleting && <Modal title="Hapus tugas?" pending={isPending} onClose={() => { setDeleting(null); setFeedback(null); }}><p className="delete-task-title">{deleting.title}</p><p className="dialog-description">Tugas ini akan dihapus permanen. Pilih batal kalau kamu masih ingin menyimpannya.</p>{feedback?.error && <p role="alert" className="form-error">{feedback.text}</p>}<div className="dialog-actions"><button disabled={isPending} className="secondary-button" onClick={() => setDeleting(null)}>Batal</button><button disabled={isPending} className="danger-button" onClick={() => run(() => deleteTask(deleting.id), "Tugas dihapus.", () => setDeleting(null))}>{isPending ? "Menghapus…" : "Ya, hapus tugas"}<Icon name="trash" size={17} /></button></div></Modal>}
    </div>
  );
}
