import type { Config, Context } from "@netlify/functions";
import { checkOrigin, err, json } from "../lib/http.ts";
import { isAuthed } from "../lib/auth.ts";
import { purgeOld } from "../lib/store.ts";

/** Manual trigger of the same purge (trainer only) — used by tests with RETENTION_DAYS=0. */
export default async (req: Request, context: Context) => {
  const bad = checkOrigin(req); if (bad) return bad;
  if (!isAuthed(req)) return err(401, "PIN 인증이 필요합니다");
  return json({ deleted: await purgeOld(context) });
};
export const config: Config = { path: "/api/purge", method: ["POST"] };
