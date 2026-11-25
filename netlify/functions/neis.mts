import type { Config, Context } from "@netlify/functions";
import { checkOrigin, err, json, deployContext } from "../lib/http.ts";

const HOST = "https://open.neis.go.kr/hub/mealServiceDietInfo";
const RE = { office: /^[A-Z]\d{2}$/, school: /^\d{7}$/, date: /^\d{8}$/ };

interface Meal { type: string; dishes: string[]; kcal: string }

function sample(office: string, school: string, date: string) {
  const raw = { mealServiceDietInfo: [
    { head: [{ list_total_count: 1 }, { RESULT: { CODE: "INFO-000", MESSAGE: "샘플 데이터(가상)" } }] },
    { row: [{ ATPT_OFCDC_SC_CODE: office, SD_SCHUL_CODE: school, SCHUL_NM: "한빛고등학교(가상)", MMEAL_SC_NM: "중식", MLSV_YMD: date,
      DDISH_NM: "현미밥<br/>미역국 (5.6)<br/>닭갈비 (5.6.13.15)<br/>시금치나물<br/>배추김치 (9)<br/>사과", CAL_INFO: "780.0 Kcal" }] },
  ] };
  return raw;
}

function parse(raw: any): { status: "ok" | "empty"; school: string; meals: Meal[]; message: string } {
  if (raw?.RESULT?.CODE === "INFO-200") return { status: "empty", school: "", meals: [], message: "그날 급식 정보가 없습니다" };
  const block = raw?.mealServiceDietInfo;
  if (!Array.isArray(block)) throw new Error("unexpected shape");
  const code = block[0]?.head?.[1]?.RESULT?.CODE;
  if (code && code !== "INFO-000") throw new Error("result " + code);
  const rows: any[] = block[1]?.row ?? [];
  if (!rows.length) return { status: "empty", school: "", meals: [], message: "그날 급식 정보가 없습니다" };
  const meals = rows.map((r) => ({
    type: String(r.MMEAL_SC_NM ?? ""),
    dishes: String(r.DDISH_NM ?? "").split(/<br\s*\/?>/i).map((s) => s.replace(/<[^>]*>/g, "").trim()).filter(Boolean),
    kcal: String(r.CAL_INFO ?? ""),
  }));
  return { status: "ok", school: String(rows[0].SCHUL_NM ?? ""), meals, message: "" };
}

export default async (req: Request, context: Context) => {
  const bad = checkOrigin(req); if (bad) return bad;
  const q = new URL(req.url).searchParams;
  const office = (q.get("office") ?? "").toUpperCase(), school = q.get("school") ?? "", date = q.get("date") ?? "";
  if (!RE.office.test(office) || !RE.school.test(school) || !RE.date.test(date)) return err(400, "교육청 코드(예: B10), 학교 코드 7자리, 날짜 8자리(YYYYMMDD)를 확인하세요");

  const key = Netlify.env.get("NEIS_API_KEY") ?? "";
  const keyless = Netlify.env.get("NEIS_ALLOW_KEYLESS") === "1";
  const ctx = deployContext(context);
  // fail closed: the failure drill only runs on an explicit non-production context AND a non-primary host
  const host = new URL(req.url).hostname;
  const nonProd = ["deploy-preview", "branch-deploy", "dev"].includes(ctx) && host !== "teacher-ai-training.netlify.app";
  const simulateFail = q.get("simulateFail") === "1" && nonProd;
  const params = new URLSearchParams({ Type: "json", ATPT_OFCDC_SC_CODE: office, SD_SCHUL_CODE: school, MLSV_YMD: date });
  const shownUrl = `${HOST}?${key ? "KEY=***&" : ""}${params}`;

  const fallback = (reason: string) => {
    const raw = sample(office, school, date);
    return json({ mode: "sample", reason, requestUrl: shownUrl, raw, ...parse(raw), school: "한빛고등학교(가상)" });
  };

  if (!key && !keyless) return fallback("인증키(NEIS_API_KEY)가 설정되지 않아 샘플 데이터를 보여 줍니다");
  if (simulateFail) return fallback("실패 시험(simulateFail=1): 샘플 데이터로 전환했습니다");

  const realUrl = `${HOST}?${key ? `KEY=${encodeURIComponent(key)}&` : ""}${params}`;
  try {
    const res = await fetch(realUrl, { signal: AbortSignal.timeout(5000), redirect: "error" });
    if (res.status >= 500) return fallback(`나이스 서버 오류(${res.status})로 샘플 데이터로 전환했습니다`);
    if (!res.ok) return fallback(`나이스 응답 ${res.status}: 샘플 데이터로 전환했습니다`);
    const text = await res.text();
    let raw: unknown, p: ReturnType<typeof parse>;
    try { raw = JSON.parse(text); p = parse(raw); }
    catch { return fallback("응답을 해석하지 못해 샘플 데이터로 전환했습니다"); }
    return json({ mode: "live", reason: "", requestUrl: shownUrl, raw, ...p });
  } catch (e) {
    const name = (e as Error)?.name;
    const reason = name === "TimeoutError" || name === "AbortError" ? "5초 안에 응답이 없어"  : "네트워크 오류로";
    console.log(`neis fallback: ${name}`); // never log the key or URL
    return fallback(`${reason} 샘플 데이터로 전환했습니다`);
  }
};

export const config: Config = { path: "/api/neis", method: ["GET"], rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ["ip", "domain"] } };
