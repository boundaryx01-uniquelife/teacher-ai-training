import type { Context } from "@netlify/functions";

const BASE_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

export function json(data: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), { status, headers: { ...BASE_HEADERS, ...extra } });
}

export function err(status: number, message: string): Response {
  return json({ error: message }, status);
}

/** Same-origin only (S-6). Absent Origin (same-origin GET/navigations) is allowed; a foreign Origin is 403. */
export function checkOrigin(req: Request): Response | null {
  const origin = req.headers.get("origin");
  const site = req.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") return err(403, "다른 출처의 요청은 허용하지 않습니다");
  if (origin) {
    const self = new URL(req.url).origin;
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    let ok = origin === self;
    try { ok = ok || (host !== null && new URL(origin).host === host); } catch { ok = false; }
    if (!ok) return err(403, "다른 출처의 요청은 허용하지 않습니다");
  }
  return null;
}

/** Read JSON body with a hard byte limit (S-3: 1KB → 413). */
export async function readJson(req: Request, limit = 1024): Promise<{ ok: true; body: unknown } | { ok: false; res: Response }> {
  const len = Number(req.headers.get("content-length") ?? "0");
  if (len > limit) return { ok: false, res: err(413, "요청 본문이 너무 큽니다") };
  const buf = await req.arrayBuffer();
  if (buf.byteLength > limit) return { ok: false, res: err(413, "요청 본문이 너무 큽니다") };
  try { return { ok: true, body: JSON.parse(new TextDecoder().decode(buf)) }; }
  catch { return { ok: false, res: err(400, "JSON 형식이 아닙니다") }; }
}

export function deployContext(context: Context): string {
  const c = (context as any)?.deploy?.context || Netlify.env.get("CONTEXT") || "production"; // fail closed
  return String(c).replace(/[^a-z0-9-]/gi, "-");
}

export const SESSION_RE = /^[A-Z2-9]{6}$/;
