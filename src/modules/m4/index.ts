import "./m4.css";
import { h } from "../../lib/ui.ts";

interface NeisRes { mode: "live" | "sample"; reason: string; requestUrl: string; raw: unknown; status: "ok" | "empty"; school: string; meals: { type: string; dishes: string[]; kcal: string }[]; message: string; error?: string }

/** 연수 장소: 부경고등학교 (부산광역시교육청). 공개된 학교 코드이며 개인정보가 아님. */
const DEFAULT = { name: "부경고등학교", office: "C10", school: "7150397" };

function todayKst(): string {
  const d = new Date(Date.now() + 9 * 3600_000);
  return d.toISOString().slice(0, 10);
}

export function mount(el: HTMLElement) {
  const office = h("input", { type: "text", id: "m4-office", maxlength: "3", value: DEFAULT.office, autocomplete: "off", placeholder: "예: B10", "aria-describedby": "m4-office-help" }) as HTMLInputElement;
  const school = h("input", { type: "text", id: "m4-school", maxlength: "7", value: DEFAULT.school, inputmode: "numeric", autocomplete: "off", placeholder: "7자리 숫자", "aria-describedby": "m4-school-help" }) as HTMLInputElement;
  const date = h("input", { type: "date", id: "m4-date", value: todayKst() }) as HTMLInputElement;
  const btn = h("button", { class: "btn", type: "submit" }, "급식 불러오기");
  const msg = h("p", { class: "bad", "aria-live": "assertive" });
  const result = h("section", { class: "m4-result", "aria-live": "polite" });
  const params = new URLSearchParams(location.search);
  const simulateFail = params.get("simulateFail") === "1";

  const form = h("form", { class: "card m4-form" },
    h("div", { class: "m4-fields" },
      h("div", {}, h("label", { for: "m4-office" }, "교육청 코드 (ATPT_OFCDC_SC_CODE)"), office, h("p", { id: "m4-office-help", class: "hint" }, "영문 대문자 1자 + 숫자 2자리")),
      h("div", {}, h("label", { for: "m4-school" }, "학교 코드 (SD_SCHUL_CODE)"), school, h("p", { id: "m4-school-help", class: "hint" }, "숫자 7자리")),
      h("div", {}, h("label", { for: "m4-date" }, "날짜 (MLSV_YMD)"), date)),
    h("p", { class: "hint" }, `기본값은 연수 학교인 ${DEFAULT.name}(부산광역시교육청 ${DEFAULT.office} · ${DEFAULT.school})예요. 다른 학교 코드는 `, h("a", { href: "https://open.neis.go.kr", target: "_blank", rel: "noopener noreferrer" }, "나이스 교육정보 개방 포털(open.neis.go.kr)"), "에서 찾아 바꿔 넣으세요. 이 사이트는 학교 검색을 하지 않아요."),
    simulateFail ? h("p", { class: "notice" }, "실패 시험 모드(simulateFail=1): 서버가 실패로 처리하고 샘플로 전환해요.") : null,
    h("div", { class: "btn-row" }, btn), msg);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";
    const o = office.value.trim().toUpperCase(), s = school.value.trim(), d = date.value.replace(/-/g, "");
    office.value = o;
    if (!/^[A-Z]\d{2}$/.test(o)) { msg.textContent = "교육청 코드는 영문 대문자 1자 + 숫자 2자리예요(예: B10)."; office.focus(); return; }
    if (!/^\d{7}$/.test(s)) { msg.textContent = "학교 코드는 숫자 7자리예요."; school.focus(); return; }
    if (!/^\d{8}$/.test(d)) { msg.textContent = "날짜를 골라 주세요."; date.focus(); return; }
    const q = new URLSearchParams({ office: o, school: s, date: d });
    if (simulateFail) q.set("simulateFail", "1");
    result.replaceChildren(h("p", {}, "불러오는 중…"));
    try {
      const res = await fetch(`/api/neis?${q}`);
      const data = (await res.json()) as NeisRes;
      if (!res.ok) { result.replaceChildren(); msg.textContent = data.error ?? "불러오지 못했어요"; return; }
      render(data, d);
    } catch { result.replaceChildren(h("p", { class: "bad" }, "우리 사이트 서버에 연결하지 못했어요. 잠시 뒤 다시 시도하세요.")); }
  });

  function render(r: NeisRes, d: string) {
    const ymd = `${d.slice(0, 4)}.${d.slice(4, 6)}.${d.slice(6)}`;
    const head = h("div", { class: "m4-head" },
      r.mode === "sample" ? h("span", { class: "badge sim" }, "샘플") : h("span", { class: "badge" }, "실제 응답"),
      " ", h("strong", {}, `${r.school || "학교"} · ${ymd}`));
    const cards = r.status === "empty"
      ? [h("p", { class: "card" }, r.message)]
      : r.meals.map((m) => h("article", { class: "card m4-meal" }, h("h3", {}, m.type || "급식"), h("ul", {}, m.dishes.map((x) => h("li", {}, x))), m.kcal ? h("p", { class: "hint" }, m.kcal) : null));
    result.replaceChildren(...[
      h("h2", {}, "결과"), head,
      r.mode === "sample" ? h("p", { class: "notice" }, `${r.reason} (가상 학교·메뉴)`) : null,
      h("div", { class: "grid cols-2 m4-cards" }, cards),
      h("h2", {}, "우리 서버가 부른 주소"),
      h("pre", { class: "m4-url" }, r.requestUrl),
      h("p", { class: "hint" }, "인증키는 서버 환경변수에만 있고, 화면에는 *** 로 가려요."),
      h("details", { class: "m4-raw" }, h("summary", {}, "원본 JSON 보기"), h("pre", {}, JSON.stringify(r.raw, null, 2)))].filter((x): x is NonNullable<typeof x> => x !== null));
  }

  el.append(
    h("h1", {}, "M4 나이스 급식 API 체험"),
    h("p", { class: "lead" }, "나이스 교육정보 개방 포털(open.neis.go.kr)은 급식·학사일정·시간표를 API로 제공합니다. 주소에 학교 코드와 날짜를 넣으면 그날 메뉴가 JSON으로 와요."),
    h("p", {}, "“오늘 급식 알려주는 학급 페이지” = 이 API를 부르는 프론트엔드"),
    form, result);
}
