import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import type { Context } from "@netlify/functions";
import { authStore } from "./store.ts";

const COOKIE = "trainer_session";
const TTL_S = 4 * 60 * 60;

function secret(): Buffer | null {
  const s = Netlify.env.get("AUTH_SECRET");
  if (!s || s.length < 32) return null;
  return Buffer.from(s);
}

export function configured(): boolean {
  const pin = Netlify.env.get("TRAINER_PIN");
  return !!pin && pin.length >= 6 && secret() !== null;
}

export function pinMatches(input: string): boolean {
  const pin = Netlify.env.get("TRAINER_PIN") ?? "";
  // Hash both sides so lengths match, then compare in constant time.
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(pin).digest();
  return pin.length >= 6 && timingSafeEqual(a, b);
}

function sign(payload: string): string {
  return createHmac("sha256", secret()!).update(payload).digest("base64url");
}

export function issueCookie(): string {
  const exp = Math.floor(Date.now() / 1000) + TTL_S;
  const payload = Buffer.from(JSON.stringify({ exp })).toString("base64url");
  const token = `${payload}.${sign(payload)}`;
  return `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/api; Max-Age=${TTL_S}`;
}

export function clearCookie(): string {
  return `${COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/api; Max-Age=0`;
}

export function isAuthed(req: Request): boolean {
  if (!secret()) return false;
  const raw = req.headers.get("cookie") ?? "";
  const m = raw.split(/;\s*/).find((c) => c.startsWith(`${COOKIE}=`));
  if (!m) return false;
  const token = m.slice(COOKIE.length + 1);
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = Buffer.from(sign(payload));
  const got = Buffer.from(sig);
  if (expected.length !== got.length || !timingSafeEqual(expected, got)) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof exp === "number" && exp > Date.now() / 1000;
  } catch { return false; }
}

/* Lockout: 5 failures within 10 minutes → locked for 15 minutes (S-4).
   Kept as one record without IP (no personal data stored). */
const WINDOW = 10 * 60_000, LOCK = 15 * 60_000, MAX = 5;
interface Lock { fails: number[]; lockedUntil: number }

export async function lockState(context: Context): Promise<Lock> {
  const v = (await authStore(context).get("lockout", { type: "json" })) as Lock | null;
  return v ?? { fails: [], lockedUntil: 0 };
}
export async function recordFailure(context: Context): Promise<Lock> {
  const now = Date.now();
  const s = await lockState(context);
  s.fails = s.fails.filter((t) => now - t < WINDOW);
  s.fails.push(now);
  if (s.fails.length >= MAX) { s.lockedUntil = now + LOCK; s.fails = []; }
  await authStore(context).setJSON("lockout", s);
  return s;
}
export async function clearFailures(context: Context) {
  await authStore(context).setJSON("lockout", { fails: [], lockedUntil: 0 });
}
