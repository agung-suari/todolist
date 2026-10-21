import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/db";

const COOKIE_NAME = process.env.NODE_ENV === "production" ? "__Host-ruangtugas-session" : "ruangtugas-session";
const SESSION_SECONDS = 7 * 24 * 60 * 60;
const digest = (value: string) => createHash("sha256").update(value).digest("hex");

export const getCurrentUser = cache(async () => {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  // Use the database clock for expiry so app instances with slightly different
  // clocks agree on whether the same session is still valid.
  const users = await getPrisma().$queryRaw<{ id: number; name: string; email: string }[]>`
    SELECT u.id, u.name, u.email FROM "Session" s
    JOIN "User" u ON u.id = s."userId"
    WHERE s."tokenHash" = ${digest(token)} AND s."expiresAt" > (NOW() AT TIME ZONE 'UTC')
  `;
  return users[0] ?? null;
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function createSession(userId: number) {
  const store = await cookies();
  const previous = store.get(COOKIE_NAME)?.value;
  const token = randomBytes(32).toString("hex");
  const expiresAt = await getPrisma().$transaction(async (db) => {
    if (previous && /^[a-f0-9]{64}$/.test(previous)) {
      await db.session.deleteMany({ where: { tokenHash: digest(previous) } });
    }
    const sessions = await db.$queryRaw<{ expiresAt: Date }[]>`
      INSERT INTO "Session" ("tokenHash", "userId", "expiresAt")
      VALUES (${digest(token)}, ${userId}, (NOW() AT TIME ZONE 'UTC') + ${SESSION_SECONDS}::integer * INTERVAL '1 second')
      RETURNING "expiresAt"
    `;
    return sessions[0].expiresAt;
  });
  store.set(COOKIE_NAME, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax",
    path: "/", maxAge: SESSION_SECONDS, expires: expiresAt,
  });
}

export async function revokeSession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token && /^[a-f0-9]{64}$/.test(token)) {
    await getPrisma().session.deleteMany({ where: { tokenHash: digest(token) } });
  }
  store.set(COOKIE_NAME, "", {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax",
    path: "/", maxAge: 0, expires: new Date(0),
  });
}

// Shared database counter: survives restarts and works across app instances.
export async function allowAuthAttempt(email: string, kind: "login" | "register") {
  const windowMs = 15 * 60 * 1000;
  const bucket = Math.floor(Date.now() / windowMs);
  const key = `${kind}:${digest(email)}:${bucket}`;
  const expiresAt = new Date((bucket + 1) * windowMs);
  const rows = await getPrisma().$queryRaw<{ attempts: number }[]>`
    INSERT INTO "AuthThrottle" ("key", "attempts", "expiresAt")
    VALUES (${key}, 1, ${expiresAt})
    ON CONFLICT ("key") DO UPDATE SET "attempts" = "AuthThrottle"."attempts" + 1
    RETURNING "attempts"
  `;
  return rows[0].attempts <= 10;
}
