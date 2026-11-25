import type { Config, Context } from "@netlify/functions";
import { checkOrigin, err, json, readJson, SESSION_RE } from "../lib/http.ts";
import { submissions, sessionExists, purgeOld, type Row } from "../lib/store.ts";
import { KEY } from "../lib/quiz.ts";

const ALLOWED = new Set(["sessionCode", "question", "answer"]);

export default async (req: Request, context: Context) => {
  const bad = checkOrigin(req); if (bad) return bad;
  if (req.method !== "POST") return err(405, "POST만 허용합니다");
  const r = await readJson(req); if (!r.ok) return r.res;
  const b = r.body as Record<string, unknown>;
  if (!b || typeof b !== "object" || Array.isArray(b)) return err(400, "본문 형식이 올바르지 않습니다");
  if (Object.keys(b).some((k) => !ALLOWED.has(k))) return err(400, "허용하지 않는 항목이 있습니다");
  const { sessionCode, question, answer } = b;
  if (!Number.isInteger(question) || (question as number) < 1 || (question as number) > 5) return err(400, "question은 1~5입니다");
  if (typeof answer !== "string" || !/^[1-4]$/.test(answer)) return err(400, "answer는 \"1\"~\"4\"입니다");
  const practice = sessionCode === undefined || sessionCode === null || sessionCode === "";
  if (!practice && (typeof sessionCode !== "string" || !SESSION_RE.test(sessionCode))) return err(400, "회차 코드 형식이 올바르지 않습니다");
  if (!practice && !(await sessionExists(context, sessionCode as string))) return err(400, "없는 회차 코드입니다");

  const q = question as number;
  const correct = answer === KEY[q].answer;
  const trace = { step: "compare" as const, result: correct ? ("correct" as const) : ("wrong" as const) };
  let row: Row | null = null;
  if (!practice) {
    const now = Date.now();
    const rand = Math.random().toString(36).slice(2, 6).padEnd(4, "0");
    const key = `rows/${sessionCode}/${now}-${rand}`;
    row = { id: `${now}-${rand}`, sessionCode: sessionCode as string, question: q, answer, correct, at: new Date(now).toISOString() };
    await submissions(context).setJSON(key, row);
    // Lazy retention cleanup for this session, after the response (S-5).
    context.waitUntil?.(purgeOld(context, `rows/${sessionCode}/`).catch(() => 0));
  }
  return json({ correct, hint: correct ? "" : KEY[q].hint, trace, row, mode: practice ? "practice" : "session" });
};

export const config: Config = {
  path: "/api/submit",
  method: ["POST"],
  rateLimit: { windowLimit: 120, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
