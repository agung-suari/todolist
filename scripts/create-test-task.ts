
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

// Mengambil variabel lingkungan dan memastikan nilainya tersedia.
function getRequiredEnv(key: string): string {
    const value = process.env[key];

    if (typeof value !== "string" || value.trim() === "") {
        throw new Error(`Variabel ${key} belum diisi di .env`);
    }

    return value.trim();
}

const connectionString = getRequiredEnv("DATABASE_URL");
const email = getRequiredEnv("TEST_USER_EMAIL").toLowerCase();

// Menyiapkan koneksi Prisma ke PostgreSQL.
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
    // 1. Mencari pengguna yang akan menjadi pemilik tugas.
    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            email: true,
        },
    });

    if (!user) {
        throw new Error("Pengguna uji tidak ditemukan.");
    }

    // 2. Menentukan isi tugas latihan.
    const title = "Belajar menyimpan tugas dengan Prisma";

    // 3. Memeriksa apakah tugas yang sama sudah ada.
    const existingTask = await prisma.task.findFirst({
        where: {
            userId: user.id,
            title,
        },
        select: {
            id: true,
        },
    });

    if (existingTask) {
        console.log("Tugas latihan sudah ada.");
        console.log("ID tugas:", existingTask.id);
        return;
    }

    // 4. Menyimpan tugas baru ke database.
    const task = await prisma.task.create({
        data: {
            title,
            category: "Belajar",
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
            userId: true,
        },
    });

    console.log("Tugas berhasil disimpan ke Supabase.");
    console.log("ID tugas:", task.id);
    console.log("Judul:", task.title);
    console.log("Kategori:", task.category);
    console.log("Status selesai:", task.completed);
    console.log("Pemilik tugas:", task.userId);
}

main()
    .catch((error: unknown) => {
        console.error("Gagal menyimpan tugas:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
