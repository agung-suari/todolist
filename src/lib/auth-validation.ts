export type AuthState = { error: string; email?: string; name?: string };

export function parseCredentials(data: FormData, registering = false) {
  if (!(data instanceof FormData)) throw new Error("Isian tidak valid.");
  const email = data.get("email");
  const password = data.get("password");
  const name = data.get("name");
  if (typeof email !== "string" || email.trim().length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    throw new Error("Masukkan alamat email yang valid.");
  }
  if (typeof password !== "string" || password.length < (registering ? 12 : 1) ||
    Buffer.byteLength(password, "utf8") > 128) {
    throw new Error(registering ? "Password minimal 12 karakter dan maksimal 128 byte." : "Email atau password salah.");
  }
  if (registering && (typeof name !== "string" || !name.trim() || name.trim().length > 80)) {
    throw new Error("Nama wajib diisi, maksimal 80 karakter.");
  }
  return { email: email.trim().toLowerCase(), password, name: typeof name === "string" ? name.trim() : "" };
}
