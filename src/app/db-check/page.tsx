
import { prisma } from "../../lib/prisma";

export const dynamic = "force-dynamic";

export default async function DatabaseCheckPage() {
    // Mengambil daftar tugas dari PostgreSQL.
    const tasks = await prisma.task.findMany({
        orderBy: {
            createdAt: "desc",
        },
        select: {
            id: true,
            title: true,
            category: true,
            completed: true,
        },
    });

    return (
        <main className="min-h-screen bg-slate-50 p-8 text-slate-900">
            <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-bold">
                    Daftar Tugas dari Supabase
                </h1>

                <p className="mt-2 text-slate-600">
                    Jumlah tugas di database: {tasks.length}
                </p>

                {tasks.length === 0 ? (
                    <p className="mt-6 rounded-lg bg-slate-50 p-4 text-slate-600">
                        Belum ada tugas di database.
                    </p>
                ) : (
                    <ul className="mt-6 divide-y divide-slate-200">
                        {tasks.map((task) => (
                            <li key={task.id} className="py-4">
                                <p className="font-semibold">{task.title}</p>

                                <p className="mt-1 text-sm text-slate-500">
                                    Kategori: {task.category}
                                </p>

                                <p className="mt-1 text-sm">
                                    Status: {task.completed ? "Selesai" : "Belum selesai"}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </main>
    );
}
