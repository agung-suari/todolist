"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/db";
import { allowAuthAttempt, createSession, revokeSession } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { parseCredentials, type AuthState } from "@/lib/auth-validation";

async function authenticate(data: FormData, registering: boolean): Promise<AuthState> {
  let credentials;
  try {
    credentials = parseCredentials(data, registering);
  } catch (error) {
    const email = data instanceof FormData ? data.get("email") : null;
    const name = data instanceof FormData ? data.get("name") : null;
    return {
      error: error instanceof Error ? error.message : "Isian tidak valid.",
      email: typeof email === "string" ? email.slice(0, 254) : "",
      name: typeof name === "string" ? name.slice(0, 80) : "",
    };
  }
  const { email, password, name } = credentials;
  try {
    if (!await allowAuthAttempt(email, registering ? "register" : "login")) {
      return { error: "Terlalu banyak percobaan. Coba lagi dalam 15 menit.", email, name };
    }
    let user;
    if (registering) {
      const passwordHash = await hashPassword(password);
      user = await getPrisma().user.create({ data: { name, email, passwordHash }, select: { id: true } });
    } else {
      const account = await getPrisma().user.findUnique({ where: { email } });
      const valid = await verifyPassword(password, account?.passwordHash ?? "");
      if (!account || !valid) return { error: "Email atau password salah.", email };
      user = account;
    }
    await createSession(user.id);
  } catch (error) {
    if (registering && typeof error === "object" && error && "code" in error && error.code === "P2002") {
      return { error: "Akun tidak dapat dibuat dengan email ini. Coba masuk atau gunakan email lain.", email, name };
    }
    return { error: "Layanan belum bisa dihubungi. Coba lagi sebentar.", email, name };
  }
  revalidatePath("/", "layout");
  redirect("/");
}

export async function login(_previous: AuthState, data: FormData) {
  return authenticate(data, false);
}

export async function register(_previous: AuthState, data: FormData) {
  return authenticate(data, true);
}

export async function logout() {
  await revokeSession();
  revalidatePath("/", "layout");
  redirect("/login");
}
