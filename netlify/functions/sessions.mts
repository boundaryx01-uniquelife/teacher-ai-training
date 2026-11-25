import type { Config, Context } from "@netlify/functions";
import { randomInt } from "node:crypto";
import { checkOrigin, err, json } from "../lib/http.ts";
import { isAuthed } from "../lib/auth.ts";
import { submissions } from "../lib/store.ts";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0, O, 1, I

export default async (req: Request, context: Context) => {
  const bad = checkOrigin(req); if (bad) return bad;
  if (!isAuthed(req)) return err(401, "PIN 인증이 필요합니다");
  const store = submissions(context);
  if (req.method === "POST") {
    for (let i = 0; i < 10; i++) {
      let code = ""; for (let j = 0; j < 6; j++) code += ALPHABET[randomInt(ALPHABET.length)];
      const res = await store.setJSON(`sessions/${code}`, { createdAt: new Date().toISOString() }, { onlyIfNew: true });
      if (res.modified) return json({ sessionCode: code }, 201);
    }
    return err(500, "코드 생성에 실패했습니다");
  }
  const out: { sessionCode: string; createdAt: string }[] = [];
  for await (const page of store.list({ prefix: "sessions/", paginate: true })) {
    for (const b of page.blobs) {
      const v = (await store.get(b.key, { type: "json" })) as { createdAt: string } | null;
      if (v) out.push({ sessionCode: b.key.slice(9), createdAt: v.createdAt });
    }
  }
  out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return json({ sessions: out });
};
export const config: Config = { path: "/api/sessions", method: ["GET", "POST"] };
