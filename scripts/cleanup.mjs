import "dotenv/config";
import { Client } from "pg";

const db = new Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, connectionTimeoutMillis: 10000 });
try {
  await db.connect();
  const sessions = await db.query('DELETE FROM "Session" WHERE "expiresAt" < (NOW() AT TIME ZONE \'UTC\')');
  const throttles = await db.query('DELETE FROM "AuthThrottle" WHERE "expiresAt" < (NOW() AT TIME ZONE \'UTC\')');
  console.log(`Catatan kedaluwarsa dibersihkan: ${sessions.rowCount} sesi, ${throttles.rowCount} pembatas login.`);
} catch {
  console.error("Pembersihan gagal. Periksa koneksi database.");
  process.exitCode = 1;
} finally {
  await db.end();
}
