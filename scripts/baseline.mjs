import "dotenv/config";
import { spawnSync } from "node:child_process";
import { Client } from "pg";

// Only for databases created with db push before migrations existed.
const db = new Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, connectionTimeoutMillis: 10000 });
try {
  await db.connect();
  const tables = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('User','Task','Session','AuthThrottle','_prisma_migrations')");
  const names = new Set(tables.rows.map(row => row.table_name));
  if (names.has("_prisma_migrations")) throw new Error("Riwayat migrasi sudah ada. Gunakan npm run db:status.");
  if (!names.has("User") || !names.has("Task") || names.has("Session") || names.has("AuthThrottle")) {
    throw new Error("Database tidak sesuai schema lama. Jangan baseline otomatis; periksa schema terlebih dahulu.");
  }
  const columns = await db.query("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='Task'");
  if (columns.rows.some(row => ['priority','dueDate'].includes(row.column_name))) throw new Error("Kolom baru sudah ada. Periksa riwayat migrasi secara manual.");
  await db.end();
  const run = (args) => {
    const result = spawnSync(process.execPath, ["node_modules/prisma/build/index.js", ...args, "--config", "./prisma7.config.ts"], { stdio: "inherit" });
    if (result.status !== 0) throw new Error("Perintah Prisma gagal; baseline dihentikan.");
  };
  // Verify ALL columns, defaults, indexes and relations, not just table names.
  run(["migrate", "diff", "--from-config-datasource", "--to-schema", "prisma/baseline.prisma", "--exit-code"]);
  run(["migrate", "resolve", "--applied", "0001_initial"]);
  console.log("Baseline tercatat tanpa menghapus data. Lanjutkan npm run db:deploy.");
} catch (error) {
  console.error(error instanceof Error ? error.message : "Baseline gagal.");
  await db.end().catch(() => {});
  process.exitCode = 1;
}
