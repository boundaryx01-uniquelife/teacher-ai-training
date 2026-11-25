import type { Config } from "@netlify/functions";
import { checkOrigin, err, json, readJson } from "../lib/http.ts";
import { KEY } from "../lib/quiz.ts";

/** Explanations only after all 5 answers are sent (S-2). Body: {answers:{"1":"1".."4", … "5":…}}. Nothing is stored. */
export default async (req: Request) => {
  const bad = checkOrigin(req); if (bad) return bad;
  const r = await readJson(req, 256); if (!r.ok) return r.res;
  const answers = (r.body as { answers?: Record<string, unknown> })?.answers;
  if (!answers || typeof answers !== "object" || Object.keys(answers).length !== 5) return err(400, "5문항을 모두 푼 뒤에 볼 수 있어요");
  for (const q of ["1", "2", "3", "4", "5"]) if (typeof answers[q] !== "string" || !/^[1-4]$/.test(answers[q] as string)) return err(400, "5문항을 모두 푼 뒤에 볼 수 있어요");
  return json({ items: Object.entries(KEY).map(([q, v]) => ({ question: Number(q), explain: v.explain })) });
};
export const config: Config = { path: "/api/explain", method: ["POST"], rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ["ip", "domain"] } };
