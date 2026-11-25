import { getStore } from "@netlify/blobs";
import type { Context } from "@netlify/functions";
import { deployContext } from "./http.ts";

export interface Row { id: string; sessionCode: string; question: number; answer: string; correct: boolean; at: string }

/** Context-prefixed stores keep preview data apart from production (S-5). */
export function submissions(context: Context) {
  return getStore({ name: `${deployContext(context)}-submissions`, consistency: "strong" });
}
export function authStore(context: Context) {
  return getStore({ name: `${deployContext(context)}-auth`, consistency: "strong" });
}

export function retentionMs(): number {
  const raw = Netlify.env.get("RETENTION_DAYS");
  const d = raw === undefined || raw === "" ? 30 : Number(raw);
  return (Number.isFinite(d) && d >= 0 ? d : 30) * 86_400_000;
}

/** Key layout: rows/{code}/{epochMs}-{rand4}, sessions/{code}. Timestamp lives in the key, so purge needs no reads. */
export function keyTime(key: string): number | null {
  const m = key.match(/^rows\/[A-Z2-9]{6}\/(\d{10,})-/);
  return m ? Number(m[1]) : null;
}

/** Delete rows older than the retention window (optionally limited to one session prefix). Returns number deleted. */
export async function purgeOld(context: Context, prefix = "rows/"): Promise<number> {
  const store = submissions(context);
  const cutoff = Date.now() - retentionMs();
  let deleted = 0;
  for await (const page of store.list({ prefix, paginate: true })) {
    for (const b of page.blobs) {
      const t = keyTime(b.key);
      if (t !== null && t <= cutoff) { await store.delete(b.key); deleted++; }
    }
  }
  if (prefix === "rows/") {
    for await (const page of store.list({ prefix: "sessions/", paginate: true })) {
      for (const b of page.blobs) {
        const s = (await store.get(b.key, { type: "json" })) as { createdAt?: string } | null;
        const t = s?.createdAt ? Date.parse(s.createdAt) : NaN;
        if (Number.isFinite(t) && t <= cutoff) { await store.delete(b.key); deleted++; }
      }
    }
  }
  return deleted;
}

export async function sessionExists(context: Context, code: string): Promise<boolean> {
  const s = await submissions(context).get(`sessions/${code}`, { type: "json" });
  return s !== null;
}
