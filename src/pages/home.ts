import "./home.css";
import { h } from "../lib/ui.ts";
import { slideNumber } from "../lib/slides.ts";

const PERIODS = [
  { t: "도입", title: "흐름과 산출물", start: "cover", items: ["끝날 때 손에 남는 3가지"], mods: [] as [string, string][] },
  { t: "1교시 · 50분", title: "LLM 개념과 용어", start: "s1", items: ["챗봇·워크플로우·에이전트", "퀴즈 앱으로 보는 프론트·백·DB·API"], mods: [["/m2", "M2 퀴즈 앱 해부"], ["/m3", "M3 교사 대시보드"], ["/m4", "M4 나이스 급식 API"]] as [string, string][] },
  { t: "2교시 · 50분", title: "AI 도구 지도", start: "s2", items: ["Chat/Work/Code, Work·Sites", "스킬·플러그인·MCP 적용"], mods: [["/m5", "M5 MCP 시뮬레이터"], ["/m6", "M6 SKILL.md 만들기"], ["/m7", "M7 업무 ↔ AI 짝짓기"]] as [string, string][] },
  { t: "3교시 · 50분", title: "ChatGPT 실습", start: "s3", items: ["프롬프트 → 나만의 GPT → 웹 퀴즈", "학생 수업 적용"], mods: [["/m1", "M1 프롬프트 5요소"], ["/prompts", "프롬프트 카드"], ["/final", "최종 과제"]] as [string, string][] },
  { t: "부록", title: "Microsoft Copilot (PENZ)", start: "s4", items: ["Chat · Teach · Notebooks · Learning Zone"], mods: [["/copilot", "Copilot 가이드"]] as [string, string][] },
];

// Lesson plan 3교시 1단계: a one-line prompt vs the 5-element prompt (lesson wording).
const ONE_LINE = "평가 문제 만들어줘";
const FIVE = [
  ["역할", "너는 고등학교 [과목] 교사야."],
  ["대상", "고[학년] 학생, 학습 수준은 중간이야."],
  ["과제", "[단원명] 단원의 형성평가 문항 5개를 만들어 줘."],
  ["조건", "객관식 3개, 서술형 2개. 각 문항에 성취기준을 표시해."],
  ["형식", "표로: 번호 | 문항 | 정답 | 해설 | 성취기준"],
] as const;

function demoPanel(): HTMLElement {
  const body = h("div", { class: "demo-body", "aria-live": "polite" });
  const btnA = h("button", { type: "button", class: "demo-tab", "aria-pressed": "true" }, "한 줄 프롬프트");
  const btnB = h("button", { type: "button", class: "demo-tab", "aria-pressed": "false" }, "5요소 프롬프트");
  const show = (five: boolean) => {
    btnA.setAttribute("aria-pressed", String(!five)); btnB.setAttribute("aria-pressed", String(five));
    body.replaceChildren(five
      ? h("ul", { class: "demo-five" }, FIVE.map(([k, v]) => h("li", {}, h("span", { class: "demo-key" }, k), " ", v)))
      : h("p", { class: "demo-one" }, ONE_LINE),
      h("p", { class: "demo-note" }, five ? "요구가 분명해져 결과를 그대로 수업에 쓰기 쉬워져요." : "무엇을, 누구에게, 어떤 형식으로 줄지 AI가 짐작해야 해요."));
  };
  btnA.addEventListener("click", () => show(false));
  btnB.addEventListener("click", () => show(true));
  show(false);
  return h("aside", { class: "demo", "aria-label": "프롬프트 비교 미리 보기" },
    h("div", { class: "demo-bar" }, h("span", { class: "demo-dots", "aria-hidden": "true" }, "● ● ●"), " ChatGPT에 붙여 넣을 지시문"),
    h("div", { class: "demo-tabs", role: "group", "aria-label": "비교" }, btnA, btnB),
    body,
    h("a", { class: "demo-link", href: "/m1", "data-link": "" }, "M1에서 직접 만들어 보기 →"));
}

export function mount(el: HTMLElement) {
  el.append(
    h("section", { class: "home-hero" },
      h("div", { class: "home-hero-text" },
        h("h1", {}, "AI, 개념에서 실습까지 — 선생님의 첫 AI 도구 만들기"),
        h("ul", { class: "home-tags", "aria-label": "연수 정보" }, ["3시간", "고교 교사", "ChatGPT", "PENZ Copilot"].map((t) => h("li", {}, t))),
        h("div", { class: "home-address" },
          h("p", { class: "home-address-label" }, h("span", { "aria-hidden": "true" }, "📱 "), "연수 자료 주소"),
          h("p", { class: "home-address-url" }, "teacher-ai-training.netlify.app"),
          h("p", { class: "home-address-hint" }, "검색창이 아니라 ", h("strong", {}, "브라우저 맨 위 주소창"), "에 그대로 입력하세요. 연수가 끝나도 같은 주소예요.")),
        h("div", { class: "btn-row" },
          h("a", { class: "btn accent", href: "/slides/" }, "강의 슬라이드 열기"),
          h("a", { class: "btn secondary", href: "/lab", "data-link": "" }, "실습 워크벤치"),
          h("a", { class: "btn secondary", href: "/guide", "data-link": "" }, "가이드북"))),
      demoPanel()),
    h("h2", {}, "오늘의 흐름"),
    h("ol", { class: "home-periods" }, PERIODS.map((p) => {
      const n = slideNumber(p.start);
      return h("li", { class: "card home-period" },
        h("p", { class: "home-when" }, p.t),
        h("h3", {}, p.title),
        h("ul", { class: "home-items" }, p.items.map((i) => h("li", {}, i))),
        h("div", { class: "home-mods" },
          n ? h("a", { class: "btn secondary", href: `/slides/#slide-${n}` }, `🖥 슬라이드 ${n}번부터`) : null,
          p.mods.map(([href, label]) => h("a", { class: "btn secondary", href, "data-link": "" }, label))));
    })),
    h("section", { class: "home-flow", "aria-labelledby": "flow-h" },
      h("h2", { id: "flow-h" }, "판단 흐름"),
      h("ol", { class: "home-flow-steps" },
        h("li", {}, h("strong", {}, "답"), "만 필요하면 ", h("span", { class: "home-tag" }, "Chat")),
        h("li", {}, h("strong", {}, "파일"), "이 필요하면 ", h("span", { class: "home-tag" }, "Work")),
        h("li", {}, h("strong", {}, "학생이 쓸 도구"), "면 ", h("span", { class: "home-tag" }, "Code"))),
      h("p", {}, "같은 일을 매주 한다면 → 스킬·맞춤형 GPT로 고정")),
    h("section", { class: "card home-promise", "aria-labelledby": "promise-h" },
      h("h2", { id: "promise-h" }, "연수 약속"),
      h("ul", { class: "home-promise-list" },
        h("li", {}, h("span", { "aria-hidden": "true" }, "🔒 "), h("strong", {}, "개인정보 미입력"), " — 학생 이름·성적·연락처는 AI에도, 이 사이트에도 넣지 않아요."),
        h("li", {}, h("span", { "aria-hidden": "true" }, "✅ "), h("strong", {}, "결과 검증"), " — LLM은 그럴듯하게 틀린다. 검증은 교사 몫."),
        h("li", {}, h("span", { "aria-hidden": "true" }, "🏷 "), h("strong", {}, "AI 사용 표시"), " — 어디에 어떻게 썼는지 적어요."))),
    h("section", { class: "card home-after", "aria-labelledby": "after-h" },
      h("h2", { id: "after-h" }, "연수 후에도 이 주소 그대로"),
      h("div", { class: "home-after-grid" },
        h("div", {},
          h("p", {}, "슬라이드·실습·가이드북을 연수 뒤에도 같은 주소에서 다시 볼 수 있어요."),
          h("p", {}, h("strong", {}, "사후 과제"), ": 2주 뒤 ‘실제로 써본 사례 1개’ 공유 → 학교 내 활용 사례집으로 축적"),
          h("p", {}, h("a", { href: "/guide#downloads", "data-link": "" }, "자료실에서 슬라이드 PDF·A4 요약 받기"))),
        h("img", { class: "home-qr", src: "/qr.png", alt: "이 사이트 주소 QR 코드", width: "160", height: "160" }))),
    h("p", { class: "hint" }, "쉬는 시간 10분 × 2 · 준비물: 노트북, ChatGPT 계정, 내 업무 자료 1개(개인정보 제거)"));
}
