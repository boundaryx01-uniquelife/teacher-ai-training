import { h, copyBlock, serviceNotice, pageTitle } from "../lib/ui.ts";
import "./copilot.css";

const KEY = "copilot-admin-checklist";

type Row = string[];
function table(head: string[], rows: Row[], caption: string): HTMLElement {
  return h("div", { class: "table-wrap" }, h("table", {},
    h("caption", { class: "sr-only" }, caption),
    h("thead", {}, h("tr", {}, head.map((t) => h("th", { scope: "col" }, t)))),
    h("tbody", {}, rows.map((r) => h("tr", {}, r.map((c, i) => i === 0 ? h("th", { scope: "row" }, c) : h("td", {}, c)))))));
}
function steps(items: string[]): HTMLElement { return h("ol", { class: "cp-steps" }, items.map((t) => h("li", {}, t))); }
function bullets(items: string[]): HTMLElement { return h("ul", {}, items.map((t) => h("li", {}, t))); }
function prompt(title: string, text: string): HTMLElement {
  return h("div", { class: "cp-prompt" }, h("h4", {}, title), copyBlock(text));
}
function limits(items: string[]): HTMLElement {
  return h("div", { class: "notice cp-limits" }, h("h3", {}, "제약·한계"), bullets(items));
}

function loadChecks(): Record<string, boolean> {
  try { const v = JSON.parse(localStorage.getItem(KEY) || "{}"); return v && typeof v === "object" ? v : {}; } catch { return {}; }
}
function saveChecks(v: Record<string, boolean>) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* ignore */ } }

const ADMIN = [
  "PENZ Microsoft 365 라이선스가 A1·A3·A5 중 무엇이고, 유료 Microsoft 365 Copilot이 포함되는지(교사·학생 각각)",
  "학생 계정 연령대 설정과 Copilot Chat 활성화 여부(고등학생은 13세 이상 기준)",
  "Notebooks·Study and Learn 에이전트 허용 여부",
  "연수 전 테스트용 학생 PENZ 계정 1개로 실제 접속 확인",
  "문의처: 부산교육청 교육연구정보원(PENZ 담당)",
];

function adminChecklist(): HTMLElement {
  const state = loadChecks();
  const boxes: HTMLInputElement[] = [];
  const list = h("ul", { class: "cp-check" }, ADMIN.map((t, i) => {
    const id = `cp-admin-${i}`;
    const cb = h("input", { type: "checkbox", id });
    cb.checked = !!state[id];
    cb.addEventListener("change", () => { state[id] = cb.checked; saveChecks(state); });
    boxes.push(cb);
    return h("li", {}, h("label", { for: id }, cb, h("span", {}, t)));
  }));
  const reset = h("button", { class: "btn danger", type: "button", onclick: () => {
    for (const b of boxes) b.checked = false;
    for (const k of Object.keys(state)) delete state[k];
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  } }, "초기화");
  return h("section", { class: "card", "aria-labelledby": "cp-admin-h" },
    h("h2", { id: "cp-admin-h" }, "관리자 확인 체크리스트"),
    h("p", {}, "연수 전 학교·교육청 정보 담당에게 미리 확인하세요."),
    list,
    h("p", { class: "hint" }, "이 체크는 이 브라우저에만 저장됩니다"),
    h("div", { class: "btn-row" }, reset));
}

function panels(): { id: string; label: string; body: HTMLElement }[] {
  const chat = h("div", {},
    h("p", {}, "웹 검색, 파일 업로드, 이미지 생성, Copilot Pages(대화 결과를 함께 고치는 문서), 에이전트를 쓴다. ChatGPT 무료 버전과 비슷하지만 학교 데이터 보호가 적용된다."),
    h("h3", {}, "단계"),
    steps([
      "PENZ에 교육디지털원패스로 로그인한 뒤 Microsoft 365를 연다. 또는 m365.cloud.microsoft(Microsoft 365 Copilot 앱)에 PENZ 계정으로 로그인한다. 개인 Microsoft 계정이 아니다.",
      "Copilot 화면에 방패(데이터 보호) 표시가 있는지 확인한다. 있으면 학교 계정의 데이터 보호가 적용된 상태다(Microsoft 안내상 입력 내용이 AI 모델 학습에 쓰이지 않음). 그래도 개인정보는 넣지 않는다.",
      "하고 싶은 일을 아래 표처럼 요청한다(공문 요약·수업 삽화·최신 자료 조사·동료와 초안 협업).",
    ]),
    table(["하고 싶은 일", "이렇게 요청", "나오는 것"], [
      ["공문 요약", "PDF 공문을 올리고 “담임이 할 일·기한만 표로”", "할 일·기한·제출처 표"],
      ["수업 삽화", "“열대우림 단면도를 교과서 삽화 느낌으로, 글자 없이”", "생성 이미지(수업 자료에 바로 삽입)"],
      ["최신 자료 조사", "“2026년 고교학점제 관련 교육부 발표 요약, 출처 링크 포함”", "요약 + 출처 링크(원문 확인 필수)"],
      ["동료와 초안 협업", "답변을 Copilot Pages로 보내 공유", "동료가 함께 고치는 문서"],
    ], "Copilot Chat 활용 예"),
    h("h3", {}, "예시 프롬프트"),
    prompt("공문 요약", "담임이 할 일·기한만 표로"),
    prompt("수업 삽화", "열대우림 단면도를 교과서 삽화 느낌으로, 글자 없이"),
    prompt("최신 자료 조사", "2026년 고교학점제 관련 교육부 발표 요약, 출처 링크 포함"),
    prompt("Teams 과제 시작 프롬프트", "너는 내 설득문의 논리만 점검하는 코치야. 나대신 고쳐 쓰지 마."),
    limits([
      "Teams 교육용 과제의 ‘Study and Learn 할당’·‘Copilot 시작 프롬프트’는 2026년 11월 전체 제공 예정 — 연수 당일 화면 확인.",
      "최신 자료 조사는 출처 링크를 열어 원문을 확인해야 한다.",
      "학생이 Copilot Chat을 쓰려면 교육청이 학생 계정에서 켜 둬야 한다(관리자 활성화).",
    ]));

  // Kept short on purpose (user decision 2026-11-26): only a comparison with Google NotebookLM.
  const nb = h("div", {},
    h("p", {}, "Copilot 사이드바의 ‘전자 필기장’에 자료(참고 항목)를 모아 두면 Copilot이 그 자료를 근거로 답한다. Google NotebookLM과 비슷한 개념이다."),
    table(["구분", "전자 필기장(Copilot Notebooks)", "Google NotebookLM"], [
      ["하는 일", "내 자료를 모아 그 안에서만 답함, 학습 가이드(요약·플래시카드·퀴즈)", "올린 자료 안에서만 답함"],
      ["계정", "PENZ 학교 계정(무료, 학교 데이터 보호)", "개인 구글 계정"],
      ["찾는 곳", "Copilot 사이드바 ‘전자 필기장’", "NotebookLM 웹"],
    ], "전자 필기장과 NotebookLM 비교"),
    h("p", { class: "hint" }, "메뉴 이름은 2026-11-26 교육청(PENZ) 교사 계정 화면 기준이며 업데이트로 바뀔 수 있어요."));

  return [
    { id: "chat", label: "Chat", body: chat },
    { id: "notebooks", label: "전자 필기장", body: nb },
  ];
}

export function mount(el: HTMLElement) {
  pageTitle("Copilot(PENZ) 가이드");
  const items = panels();
  const tabs: HTMLButtonElement[] = [];
  const panelEls: HTMLElement[] = [];

  function select(i: number, focus = false) {
    tabs.forEach((t, j) => { t.setAttribute("aria-selected", String(i === j)); t.tabIndex = i === j ? 0 : -1; });
    panelEls.forEach((p, j) => { p.hidden = i !== j; });
    if (focus) tabs[i].focus();
  }
  const list = h("div", { class: "tabs", role: "tablist", "aria-label": "Copilot 기능" });
  items.forEach((it, i) => {
    const tab = h("button", { type: "button", role: "tab", id: `cp-tab-${it.id}`, "aria-controls": `cp-panel-${it.id}`, "aria-selected": "false", tabindex: -1 }, it.label);
    tab.addEventListener("click", () => select(i));
    tab.addEventListener("keydown", (e) => {
      const n = items.length; let k = -1;
      if (e.key === "ArrowRight") k = (i + 1) % n;
      else if (e.key === "ArrowLeft") k = (i - 1 + n) % n;
      else if (e.key === "Home") k = 0;
      else if (e.key === "End") k = n - 1;
      if (k >= 0) { e.preventDefault(); select(k, true); }
    });
    tabs.push(tab); list.append(tab);
    panelEls.push(h("div", { role: "tabpanel", id: `cp-panel-${it.id}`, "aria-labelledby": `cp-tab-${it.id}`, tabindex: 0, hidden: true }, it.body));
  });

  el.replaceChildren(
    h("div", { class: "cp-page" },
      serviceNotice(),
      h("h1", {}, "Copilot(PENZ) 가이드"),
      h("p", { class: "lead" }, "부산 교사·학생은 2026년 9월부터 PENZ(펜즈) 계정 하나로 Microsoft 365에 로그인한다(교육디지털원패스 연계, 초1부터 고3까지 같은 계정). 학교 계정이라 추가 비용이 없고, 입력한 내용이 AI 학습에 쓰이지 않으며, 교육청이 학생 접근을 관리한다. 그래서 학생 수업은 PENZ Copilot이 기본 선택이다."),
      h("p", { class: "hint" }, "이 페이지는 Copilot을 호출하지 않습니다. 프롬프트를 복사해 각자 Copilot에 붙여넣으세요."),
      h("section", { "aria-labelledby": "cp-cmp-h" },
        h("h2", { id: "cp-cmp-h" }, "무료 vs 유료"),
        h("p", {}, "에듀 계정(Microsoft 365 A1·A3·A5)으로 무료인 것 vs 유료인 것. 유료 Microsoft 365 Copilot 라이선스 포함 여부는 공개 자료로 확인되지 않아, ‘유료’ 항목은 연수 전 확인이 필요하다."),
        table(["기능", "무엇을 하나", "교사", "학생(13세+)", "비용"], [
          ["Microsoft 365 Copilot Chat", "대화형 AI. 웹 검색, 파일 업로드, 이미지 생성, Copilot Pages, 에이전트", "○", "○(관리자 활성화)", "무료"],
          ["Copilot Notebooks + 학습 가이드", "내 자료를 모아 그 안에서만 답하는 작업 공간, 자료로 학습 가이드·자기 테스트 생성", "○", "○", "무료"],
          ["Study and Learn 에이전트", "학습 과학 기반 학습 동반자(개념 설명·연습·피드백)", "—", "○", "무료"],
          ["Microsoft 365 Copilot", "워드·엑셀·파워포인트 안 Copilot, Researcher·Analyst 에이전트", "△", "△", "유료 추가 라이선스(학교 구매)"],
        ], "무료와 유료 기능 비교"),
        h("p", {}, "“워드 안의 Copilot 버튼이 왜 안 되죠?”는 대부분 유료 라이선스 문제다. 내 라이선스 확인: myaccount.microsoft.com → 구독. “Microsoft 365 Copilot”이 보이면 워드·엑셀·파워포인트 안 Copilot까지, A1·A3 등만 보이면 Copilot Chat까지다.")),
      h("section", { "aria-labelledby": "cp-tabs-h" },
        h("h2", { id: "cp-tabs-h" }, "기능별 안내"),
        list, ...panelEls),
      adminChecklist(),
      h("p", { class: "hint" }, "메뉴 이름·위치와 한국어 지원 범위는 업데이트에 따라 다를 수 있어요. 연수 전 실제 화면으로 확인하세요.")));
  select(0);
}
