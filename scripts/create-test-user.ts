import "dotenv/config";

import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

function getRequiredEnv(key: string): string {
    const value = process.env[key];

    if (!value?.trim()) {
        throw new Error(`Variabel ${key} belum diisi di .env`);
    }

    return value.trim();
}

const connectionString = getRequiredEnv("DATABASE_URL");
const name = getRequiredEnv("TEST_USER_NAME");
const email = getRequiredEnv("TEST_USER_EMAIL").toLowerCase();
const password = getRequiredEnv("TEST_USER_PASSWORD");

if (password === "GANTI_DENGAN_PASSWORD_UJI_KAMU") {
    throw new Error("Ganti password uji di file .env terlebih dahulu.");
}
if (!connectionString || !name || !email || !password) {
    throw new Error("Konfigurasi .env belum lengkap.");
}

if (password === "GANTI_DENGAN_PASSWORD_UJI_KAMU") {
    throw new Error("Ganti password contoh di file .env terlebih dahulu.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
    // Periksa apakah email sudah terdaftar.
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        console.log("Pengguna uji sudah ada.");
        console.log("ID pengguna:", existingUser.id);
        return;
    }

    // Hash password sebelum menyimpannya.
    const passwordHash = await bcrypt.hash(password, 12);

    // Simpan pengguna baru ke database.
    const user = await prisma.user.create({
        data: {
            name,
            email,
            passwordHash,
        },
    });

    console.log("Pengguna uji berhasil dibuat.");
    console.log("ID pengguna:", user.id);
    console.log("Email:", user.email);
}

main()
    .catch((error: unknown) => {
        console.error("Gagal membuat pengguna uji:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });