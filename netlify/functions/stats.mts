import type { Config, Context } from "@netlify/functions";
import { checkOrigin, err, json, SESSION_RE } from "../lib/http.ts";
import { isAuthed } from "../lib/auth.ts";
import { submissions, purgeOld, type Row } from "../lib/store.ts";

export default async (req: Request, context: Context) => {
  const bad = checkOrigin(req); if (bad) return bad;
  if (!isAuthed(req)) return err(401, "PIN 인증이 필요합니다");
  const code = new URL(req.url).searchParams.get("sessionCode") ?? "";
  if (!SESSION_RE.test(code)) return err(400, "회차 코드 형식이 올바르지 않습니다");
  if (Math.random() < 0.1) await purgeOld(context, `rows/${code}/`); // lazy cleanup, throttled (daily purge is the main path)
  const store = submissions(context);
  const rows: Row[] = [];
  for await (const page of store.list({ prefix: `rows/${code}/`, paginate: true })) {
    const got = await Promise.all(page.blobs.map((b) => store.get(b.key, { type: "json" }) as Promise<Row | null>));
    for (const r of got) if (r) rows.push(r);
  }
  rows.sort((a, b) => a.at.localeCompare(b.at) || a.id.localeCompare(b.id));
  const perQuestion = [1, 2, 3, 4, 5].map((q) => {
    const rs = rows.filter((r) => r.question === q);
    const wrong = rs.filter((r) => !r.correct).length;
    return { question: q, total: rs.length, wrong, wrongRate: rs.length ? Math.round((wrong / rs.length) * 1000) / 10 : 0 };
  });
  return json({
    sessionCode: code,
    total: rows.length,
    perQuestion,
    recent: rows.slice(-20).map((r, i, arr) => ({ no: rows.length - arr.length + i + 1, ...r })),
  });
};
export const config: Config = { path: "/api/stats", method: ["GET"] };
