import type { Config, Context } from "@netlify/functions";
import { checkOrigin, err, json, readJson } from "../lib/http.ts";
import { configured, pinMatches, issueCookie, clearCookie, isAuthed, lockState, recordFailure, clearFailures } from "../lib/auth.ts";

export default async (req: Request, context: Context) => {
  const bad = checkOrigin(req); if (bad) return bad;
  if (req.method === "GET") return json({ authed: isAuthed(req), configured: configured() });
  if (req.method === "DELETE") return json({ authed: false }, 200, { "Set-Cookie": clearCookie() });
  if (req.method !== "POST") return err(405, "허용하지 않는 메서드입니다");
  if (!configured()) return err(503, "관리자 PIN이 아직 설정되지 않았습니다(환경변수 TRAINER_PIN·AUTH_SECRET)");
  if (isAuthed(req)) return json({ authed: true }, 200, { "Set-Cookie": issueCookie() });
  const lock = await lockState(context);
  if (lock.lockedUntil > Date.now()) return json({ error: "잠시 잠겼습니다. 15분 뒤 다시 시도하세요", lockedUntil: new Date(lock.lockedUntil).toISOString() }, 429);
  const r = await readJson(req, 256); if (!r.ok) return r.res;
  const pin = (r.body as { pin?: unknown })?.pin;
  if (typeof pin !== "string" || pin.length > 64 || !pinMatches(pin)) {
    const s = await recordFailure(context);
    if (s.lockedUntil > Date.now()) return json({ error: "5회 틀려 15분간 잠겼습니다" }, 429);
    return err(401, "PIN이 맞지 않습니다");
  }
  await clearFailures(context);
  return json({ authed: true }, 200, { "Set-Cookie": issueCookie() });
};
export const config: Config = { path: "/api/auth", method: ["GET", "POST", "DELETE"] };
