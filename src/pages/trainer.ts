import { h, pageTitle } from "../lib/ui.ts";
import data from "../content/slides-data.json";
import "./trainer.css";

const KEY = "trainer-checklist";

interface Practice { module: string; label: string }
const D = data as unknown as {
  order: string[];
  titles: Record<string, string>;
  sections: { title: string; start: string }[];
  practice: Record<string, Practice>;
  notes: Record<string, string>;
  timers: Record<string, number>;
};

const ROUTES: Record<string, string> = {
  M1: "/m1", M2: "/m2", M3: "/m3", M4: "/m4", M5: "/m5", M6: "/m6", M7: "/m7",
  PROMPTS: "/prompts", COPILOT: "/copilot", FINAL: "/final",
};

// index = section index in slides-data (0 = 도입, 1~3 = 교시, 4 = 부록)
const TIMETABLE: Record<number, [string, string, string]> = {
  1: ["1교시", "50분", "LLM 개념 + 필수 용어 / 강의 30분, 퀴즈·질문 20분"],
  2: ["2교시", "50분", "상용 AI 지도, Chat/Work/Code, 스킬·MCP / 강의 25분, 업무↔AI 짝짓기 25분(시간은 넉넉하게, 진행 상황 보며 조정)"],
  3: ["3교시", "50분", "실습 프로젝트 3단계 + 학생 수업 적용 / 실습 40분, 공유 10분"],
};

const CHECKS: { group: string; items: string[] }[] = [
  { group: "계정·준비물", items: [
    "계정 사전 준비: 당일 가입·인증에 10분 이상 사라진다. 연수 전날까지 로그인 확인",
    "ChatGPT 계정 사전 가입 안내를 참가자에게 보냈는지",
    "무료 계정용 대체 경로(프로젝트·긴 지침 복사 사용) 준비",
  ] },
  { group: "PENZ 관리자(학교·교육청 정보 담당)에게 미리 확인", items: [
    "PENZ Microsoft 365 라이선스가 A1·A3·A5 중 무엇이고, 유료 Microsoft 365 Copilot이 포함되는지(교사·학생 각각)",
    "학생 계정 연령대 설정과 Copilot Chat 활성화 여부(고등학생은 13세 이상 기준)",
    "Notebooks·Study and Learn 에이전트 허용 여부",
    "연수 전 테스트용 학생 PENZ 계정 1개로 실제 접속 확인",
    "문의처: 부산교육청 교육연구정보원(PENZ 담당)",
  ] },
  { group: "시연 자료", items: [
    "시연용 구글 계정에 가상 평가 계획서 1개, 예전 가정통신문 2개를 미리 넣어 둔다(실제 학생 정보 없이)",
    "연수 당일 실제 화면으로 스킬·MCP 설치 가능 여부를 확인하고 시연 3개를 정한다",
    "기능·요금제별 제공 범위를 연수 전날 실제 화면으로 다시 확인",
  ] },
  { group: "나이스·장소", items: [
    "나이스 교육정보 개방 포털 인증키 발급, 연수 전 실제 호출로 확인",
    "연수 장소 와이파이 확인",
  ] },
];

function loadChecks(): Record<string, boolean> {
  try { const v = JSON.parse(localStorage.getItem(KEY) || "{}"); return v && typeof v === "object" ? v : {}; } catch { return {}; }
}
function saveChecks(v: Record<string, boolean>) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* ignore */ } }

export function mount(el: HTMLElement) {
  pageTitle("강사용 진행 페이지");
  const meta = document.createElement("meta");
  meta.name = "robots"; meta.content = "noindex";
  document.head.append(meta);

  const starts = D.sections.map((s) => D.order.indexOf(s.start));
  const secOf = D.order.map((_, i) => {
    let idx = 0;
    starts.forEach((st, k) => { if (i >= st) idx = k; });
    return idx;
  });
  const range = (k: number) => {
    const a = starts[k] + 1;
    const b = k + 1 < starts.length ? starts[k + 1] : D.order.length;
    return `${a}–${b}번`;
  };

  // 시간표
  const ttRows = D.sections.map((s, k) => {
    const t = TIMETABLE[k];
    return h("tr", {}, h("th", { scope: "row" }, t ? t[0] : s.title.split(":")[0]), h("td", {}, t ? t[1] : "-"), h("td", {}, t ? t[2] : s.title), h("td", {}, range(k)));
  });
  const timetable = h("section", { class: "tr-sec", "aria-labelledby": "tr-h-tt" },
    h("h2", { id: "tr-h-tt" }, "시간표"),
    h("p", {}, "3시간 = 50분 × 3교시 + 쉬는 시간 10분 × 2"),
    h("div", { class: "table-wrap" }, h("table", {},
      h("caption", { class: "sr-only" }, "연수 시간표와 슬라이드 범위"),
      h("thead", {}, h("tr", {}, ["교시", "시간", "주제 · 활동", "슬라이드"].map((t) => h("th", { scope: "col" }, t)))),
      h("tbody", {}, ttRows))));

  // 진행 대본
  const q = h("input", { type: "text", id: "tr-q", placeholder: "제목·노트 검색" });
  const sel = h("select", { id: "tr-sec" }, h("option", { value: "-1" }, "전체 교시"),
    D.sections.map((s, k) => h("option", { value: String(k) }, s.title)));
  const count = h("p", { class: "tr-count", role: "status" });
  const rows = D.order.map((id, i) => {
    const n = i + 1;
    const note = D.notes[id];
    const pr = D.practice[id];
    const timer = D.timers[id];
    const metaP = h("p", { class: "tr-meta" },
      D.sections[secOf[i]].title,
      timer ? h("span", { class: "tr-tag" }, `타이머 ${timer}분`) : null,
      pr ? h("span", { class: "tr-tag" }, `실습 ${pr.module} · ${pr.label}`) : null);
    const links = h("p", { class: "tr-links" },
      h("a", { class: "btn secondary", href: `/slides/#slide-${n}`, target: "_blank", rel: "noopener" }, "슬라이드 열기 ↗"),
      pr ? h("a", { class: "btn accent", href: `${ROUTES[pr.module] ?? "/lab"}?from=${encodeURIComponent(id)}`, "data-link": "" }, `실습: ${pr.label}`) : null);
    const hasNote = !!(note && note.trim());
    const li = h("li", { class: "tr-slide" },
      h("h3", {}, h("span", { class: "tr-num" }, String(n)), " ", D.titles[id] ?? id),
      metaP,
      h("p", { class: hasNote ? "tr-note" : "tr-note empty" }, hasNote ? note : "(노트 없음)"),
      links);
    return { li, sec: secOf[i], text: `${D.titles[id] ?? ""} ${note ?? ""}`.toLowerCase() };
  });
  function filter() {
    const term = q.value.trim().toLowerCase();
    const s = Number(sel.value);
    let shown = 0;
    for (const r of rows) {
      const ok = (s < 0 || r.sec === s) && (!term || r.text.includes(term));
      r.li.hidden = !ok;
      if (ok) shown++;
    }
    count.textContent = `${shown} / ${rows.length}장`;
  }
  q.addEventListener("input", filter);
  sel.addEventListener("change", filter);
  const script = h("section", { class: "tr-sec", "aria-labelledby": "tr-h-sc" },
    h("h2", { id: "tr-h-sc" }, "진행 대본"),
    h("div", { class: "tr-filter" },
      h("label", { for: "tr-q" }, "검색"), q,
      h("label", { for: "tr-sec" }, "교시"), sel),
    count,
    h("ol", { class: "tr-list" }, rows.map((r) => r.li)));
  filter();

  // 체크리스트
  const state = loadChecks();
  const boxes: HTMLInputElement[] = [];
  let n = 0;
  const groups = CHECKS.map((g) => h("div", { class: "tr-group" }, h("h3", {}, g.group),
    h("ul", { class: "tr-check" }, g.items.map((t) => {
      const id = `tr-c-${n++}`;
      const cb = h("input", { type: "checkbox", id });
      cb.checked = !!state[id];
      cb.addEventListener("change", () => { state[id] = cb.checked; saveChecks(state); });
      boxes.push(cb);
      return h("li", {}, h("label", { for: id }, cb, h("span", {}, t)));
    }))));
  const reset = h("button", { class: "btn danger", type: "button", onclick: () => {
    for (const b of boxes) b.checked = false;
    for (const k of Object.keys(state)) delete state[k];
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  } }, "초기화");
  const checklist = h("section", { class: "tr-sec", "aria-labelledby": "tr-h-ck" },
    h("h2", { id: "tr-h-ck" }, "연수 전 점검 체크리스트"),
    h("p", { class: "notice" }, "이 체크는 이 브라우저에만 저장됩니다"),
    groups, h("div", { class: "btn-row" }, reset));

  const m3 = h("section", { class: "tr-sec", "aria-labelledby": "tr-h-m3" },
    h("h2", { id: "tr-h-m3" }, "M3 교사 대시보드 진입"),
    h("p", {}, "M3는 PIN이 필요해요. PIN은 Netlify 환경 변수(TRAINER_PIN)에 설정하며, 이 페이지에는 표시하지 않아요."),
    h("p", {}, h("a", { class: "btn", href: "/m3", "data-link": "" }, "M3로 이동")));

  el.append(h("div", { class: "trainer" },
    h("h1", {}, "강사용 진행 페이지"),
    h("p", { class: "notice" }, "메뉴에 노출되지 않는 페이지예요. 참가자에게 주소를 공유하지 마세요."),
    h("p", {}, "슬라이드 노트는 프로젝터에 보이지 않게 ‘노트 창’ 버튼(별도 창)으로 열고, 그 창을 강사 화면으로 옮겨 두세요. 슬라이드를 넘기면 노트도 같이 넘어가요."),
    h("details", { class: "card" },
      h("summary", {}, h("strong", {}, "인터넷·로그인이 안 될 때 대안")),
      h("ul", {},
        h("li", {}, "슬라이드(/slides)는 한 번 열어 두면 오프라인으로도 넘겨져요."),
        h("li", {}, "M4 급식 API 실패 → 샘플 모드로 자동 전환돼요. ‘실제 호출이 안 돼도 앱이 멈추지 않게 설계한다’로 설명하세요."),
        h("li", {}, "33번 데모(ChatGPT 로그인 필요) 실패 → 슬라이드 캡처와 프롬프트 카드로 말로 시연하고 넘어가요."),
        h("li", {}, "M3 PIN 로그인 실패 → 설명만 하고 M2 실습을 계속해요(제출은 연습 모드로도 가능)."),
        h("li", {}, "학교 와이파이에서 사이트가 보안 확인 화면으로 막히면 폰 테더링으로 접속을 확인해 두세요."))),
    timetable, checklist, m3, script));

  return () => meta.remove();
}
