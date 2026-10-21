import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

function derive(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 }, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = await derive(password, salt);
  return `scrypt$${salt}$${key.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const valid = /^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$/.test(stored);
  // Keep hashing cost for nonexistent and disabled accounts as well.
  const [, salt, expected] = valid ? stored.split("$") : ["scrypt", "0".repeat(32), "0".repeat(128)];
  const actual = await derive(password, salt);
  return valid && timingSafeEqual(actual, Buffer.from(expected, "hex"));
}
