import type { Config } from "@netlify/functions";
import { checkOrigin, json } from "../lib/http.ts";
import { KEY } from "../lib/quiz.ts";

/** Explanation table shown after all 5 questions are answered (S-2). Contains no answer numbers. */
export default async (req: Request) => {
  const bad = checkOrigin(req); if (bad) return bad;
  return json({ items: Object.entries(KEY).map(([q, v]) => ({ question: Number(q), explain: v.explain })) });
};
export const config: Config = { path: "/api/explain", method: ["GET"] };
