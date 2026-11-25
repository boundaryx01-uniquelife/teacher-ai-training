import type { Config, Context } from "@netlify/functions";
import { checkOrigin, err, json, readJson, SESSION_RE } from "../lib/http.ts";
import { isAuthed } from "../lib/auth.ts";
import { submissions } from "../lib/store.ts";

export default async (req: Request, context: Context) => {
  const bad = checkOrigin(req); if (bad) return bad;
  if (!isAuthed(req)) return err(401, "PIN 인증이 필요합니다");
  const r = await readJson(req, 256); if (!r.ok) return r.res;
  const { sessionCode, confirm } = (r.body ?? {}) as { sessionCode?: unknown; confirm?: unknown };
  if (typeof sessionCode !== "string" || !SESSION_RE.test(sessionCode) || confirm !== sessionCode) return err(400, "확인 코드가 일치하지 않습니다");
  const store = submissions(context);
  let deleted = 0;
  for await (const page of store.list({ prefix: `rows/${sessionCode}/`, paginate: true })) {
    for (const b of page.blobs) { await store.delete(b.key); deleted++; }
  }
  return json({ sessionCode, deleted });
};
export const config: Config = { path: "/api/reset", method: ["POST"] };
