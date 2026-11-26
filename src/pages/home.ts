import "./home.css";
import { h, PADLET_URL } from "../lib/ui.ts";
import { slideNumber } from "../lib/slides.ts";

const PERIODS = [
  { t: "도입", title: "흐름과 산출물", start: "cover", items: ["끝날 때 손에 남는 3가지"], mods: [] as [string, string][] },
  { t: "1교시 · 50분", title: "LLM 개념과 용어", start: "s1", items: ["챗봇·워크플로우·에이전트", "퀴즈 앱으로 보는 프론트·백·DB·API"], mods: [["/m2", "M2 퀴즈 앱 해부"], ["/m3", "M3 교사 대시보드"], ["/m4", "M4 나이스 급식 API"]] as [string, string][] },
  { t: "2교시 · 50분", title: "AI 도구 지도", start: "s2", items: ["Chat/Work/Code, Work·Sites", "스킬·플러그인·MCP 적용"], mods: [["/m5", "M5 MCP 시뮬레이터"], ["/m6", "M6 SKILL.md 만들기"], ["/m7", "M7 업무 ↔ AI 짝짓기"]] as [string, string][] },
  { t: "3교시 · 50분", title: "ChatGPT 실습", start: "s3", items: ["프롬프트 → 나만의 GPT → 웹 퀴즈", "학생 수업 적용"], mods: [["/m1", "M1 프롬프트 5요소"], ["/prompts", "프롬프트 카드"], ["/final", "최종 과제"]] as [string, string][] },
  { t: "부록", title: "Microsoft Copilot (PENZ)", start: "s4", items: ["Chat · 전자 필기장 · 학습"], mods: [["/copilot", "Copilot 가이드"]] as [string, string][] },
];

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
        h("p", { class: "home-replay" }, h("a", { href: "/?intro=1" }, "▶ 인트로 다시 보기")))),
    // start choice — same three cards, same order as the last frame of the intro
    h("nav", { class: "home-start", "aria-label": "어디서 시작할까요" },
      h("a", { class: "home-start-card accent", href: "/slides/" },
        h("span", { class: "home-start-icon", "aria-hidden": "true" }, "🖥"), h("strong", {}, "강의 슬라이드"), h("span", {}, "1–53번 · 오프라인")),
      h("a", { class: "home-start-card", href: "/lab", "data-link": "" },
        h("span", { class: "home-start-icon", "aria-hidden": "true" }, "🧪"), h("strong", {}, "실습 워크벤치"), h("span", {}, "M1–M7 · 바로 해 보기")),
      h("a", { class: "home-start-card", href: "/guide", "data-link": "" },
        h("span", { class: "home-start-icon", "aria-hidden": "true" }, "📘"), h("strong", {}, "가이드북·자료실"), h("span", {}, "강의안 · PDF · 예시")),
      h("a", { class: "home-start-card", href: PADLET_URL, target: "_blank", rel: "noopener" },
        h("span", { class: "home-start-icon", "aria-hidden": "true" }, "💬"), h("strong", {}, "함께 나누기 ↗"), h("span", {}, "패들렛 · 질문·결과물"))),
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
