
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
export async function GET() {
    // Endpoint ini hanya digunakan untuk latihan lokal.
    if (process.env.NODE_ENV !== "development") {
        return NextResponse.json(
            { error: "Endpoint latihan tidak tersedia." },
            { status: 404 }
        );
    }

    try {
        const email = process.env.TEST_USER_EMAIL
            ?.trim()
            .toLowerCase();

        if (!email) {
            return NextResponse.json(
                { error: "Konfigurasi pengguna uji belum tersedia." },
                { status: 500 }
            );
        }

        // Mencari pengguna pemilik tugas.
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Pengguna uji tidak ditemukan." },
                { status: 404 }
            );
        }

        // Mengambil tugas milik pengguna tersebut.
        const tasks = await prisma.task.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                title: true,
                category: true,
                completed: true,
            },
        });

        return NextResponse.json(tasks);
    } catch (error) {
        console.error("Gagal mengambil daftar tugas:", error);

        return NextResponse.json(
            { error: "Terjadi kesalahan saat mengambil tugas." },
            { status: 500 }
        );
    }
}
export async function POST(request: Request) {
    // Endpoint latihan ini hanya boleh digunakan saat development.
    if (process.env.NODE_ENV !== "development") {
        return NextResponse.json(
            { error: "Endpoint latihan tidak tersedia." },
            { status: 404 }
        );
    }

    try {
        // Membaca data JSON yang dikirim oleh dashboard.
        const body: unknown = await request.json();

        // Memastikan judul tugas berupa teks.
        if (
            typeof body !== "object" ||
            body === null ||
            !("title" in body) ||
            typeof body.title !== "string"
        ) {
            return NextResponse.json(
                { error: "Judul tugas harus berupa teks." },
                { status: 400 }
            );
        }

        const title = body.title.trim();

        // Menolak judul kosong atau hanya berisi spasi.
        if (!title) {
            return NextResponse.json(
                { error: "Judul tugas tidak boleh kosong." },
                { status: 400 }
            );
        }

        // Menggunakan pengguna uji yang telah kita buat.
        const email = process.env.TEST_USER_EMAIL
            ?.trim()
            .toLowerCase();

        if (!email) {
            return NextResponse.json(
                { error: "Konfigurasi pengguna uji belum tersedia." },
                { status: 500 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Pengguna uji tidak ditemukan." },
                { status: 404 }
            );
        }

        // Menyimpan tugas baru ke PostgreSQL.
        const task = await prisma.task.create({
            data: {
                title,
                category: "Pribadi",
                completed: false,
                user: {
                    connect: { id: user.id },
                },
            },
            select: {
                id: true,
                title: true,
                category: true,
                completed: true,
            },
        });

        // Mengirimkan data tugas yang berhasil dibuat.
        return NextResponse.json(task, { status: 201 });
    } catch (error) {
        console.error("Gagal menyimpan tugas:", error);

        return NextResponse.json(
            { error: "Terjadi kesalahan saat menyimpan tugas." },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request) {
    // Hanya tersedia untuk latihan lokal.
    if (process.env.NODE_ENV !== "development") {
        return NextResponse.json(
            { error: "Endpoint latihan tidak tersedia." },
            { status: 404 }
        );
    }

    try {

        const body: unknown = await request.json();

        // Memastikan ID tugas valid.
        if (
            typeof body !== "object" ||
            body === null ||
            !("id" in body) ||
            typeof body.id !== "number" ||
            !Number.isInteger(body.id) ||
            body.id <= 0
        ) {
            return NextResponse.json(
                { error: "ID tugas tidak valid." },
                { status: 400 }
            );
        }

        const id = body.id;

        // PATCH harus mengubah judul ATAU status.
        if (("title" in body) === ("completed" in body)) {
            return NextResponse.json(
                { error: "Data perubahan tidak valid." },
                { status: 400 }
            );
        }

        // Menyiapkan data yang akan diperbarui.
        const updateData: {
            title?: string;
            completed?: boolean;
        } = {};

        // Jika yang dikirim adalah judul.
        if ("title" in body) {
            if (
                typeof body.title !== "string" ||
                !body.title.trim()
            ) {
                return NextResponse.json(
                    { error: "Judul tugas tidak boleh kosong." },
                    { status: 400 }
                );
            }

            updateData.title = body.title.trim();
        }

        // Jika yang dikirim adalah status selesai.
        if ("completed" in body) {
            if (typeof body.completed !== "boolean") {
                return NextResponse.json(
                    { error: "Status tugas tidak valid." },
                    { status: 400 }
                );
            }

            updateData.completed = body.completed;
        }


        // Mencari pengguna uji.
        const email = process.env.TEST_USER_EMAIL
            ?.trim()
            .toLowerCase();

        if (!email) {
            return NextResponse.json(
                { error: "Konfigurasi pengguna uji belum tersedia." },
                { status: 500 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Pengguna uji tidak ditemukan." },
                { status: 404 }
            );
        }

        // Memastikan tugas dimiliki pengguna uji.
        const existingTask = await prisma.task.findFirst({
            where: {
                id,
                userId: user.id,
            },
            select: { id: true },
        });

        if (!existingTask) {
            return NextResponse.json(
                { error: "Tugas tidak ditemukan." },
                { status: 404 }
            );
        }

        // Memperbarui judul tugas di database.
        const updatedTask = await prisma.task.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                title: true,
                category: true,
                completed: true,
            },
        });

        return NextResponse.json(updatedTask);

    } catch (error) {
        console.error("Gagal memperbarui tugas:", error);

        return NextResponse.json(
            { error: "Terjadi kesalahan saat memperbarui tugas." },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    // Hanya tersedia untuk latihan lokal.
    if (process.env.NODE_ENV !== "development") {
        return NextResponse.json(
            { error: "Endpoint latihan tidak tersedia." },
            { status: 404 }
        );
    }

    try {
        const body: unknown = await request.json();

        // Memeriksa apakah ID yang dikirim berupa angka positif.
        if (
            typeof body !== "object" ||
            body === null ||
            !("id" in body) ||
            typeof body.id !== "number" ||
            !Number.isInteger(body.id) ||
            body.id <= 0
        ) {
            return NextResponse.json(
                { error: "ID tugas tidak valid." },
                { status: 400 }
            );
        }

        const id = body.id;

        // Mengambil email pengguna uji.
        const email = process.env.TEST_USER_EMAIL
            ?.trim()
            .toLowerCase();

        if (!email) {
            return NextResponse.json(
                { error: "Konfigurasi pengguna uji belum tersedia." },
                { status: 500 }
            );
        }

        // Mencari pengguna pemilik tugas.
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Pengguna uji tidak ditemukan." },
                { status: 404 }
            );
        }

        // Memastikan tugas dimiliki pengguna uji.
        const existingTask = await prisma.task.findFirst({
            where: {
                id,
                userId: user.id,
            },
            select: { id: true },
        });

        if (!existingTask) {
            return NextResponse.json(
                { error: "Tugas tidak ditemukan." },
                { status: 404 }
            );
        }

        // Menghapus tugas dari database.
        const deletedTask = await prisma.task.delete({
            where: { id: existingTask.id },
            select: { id: true },
        });

        return NextResponse.json({
            message: "Tugas berhasil dihapus.",
            id: deletedTask.id,
        });

    } catch (error) {
        console.error("Gagal menghapus tugas:", error);

        return NextResponse.json(
            { error: "Terjadi kesalahan saat menghapus tugas." },
            { status: 500 }
        );
    }
}
