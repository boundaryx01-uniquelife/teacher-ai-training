import "./home.css";
import { h, PADLET_URL } from "../lib/ui.ts";
import { slideNumber } from "../lib/slides.ts";

const PERIODS = [
  { t: "도입", title: "흐름과 산출물", keys: "오늘 손에 남는 3가지", start: "cover" },
  { t: "1교시 · 50분", title: "LLM 개념과 용어", keys: "챗봇·에이전트 · 프론트·API·DB", start: "s1" },
  { t: "2교시 · 50분", title: "AI 도구 지도", keys: "Chat·Work·Code · 스킬·MCP", start: "s2" },
  { t: "3교시 · 50분", title: "ChatGPT 실습", keys: "프롬프트 → 나만의 GPT → 웹 퀴즈", start: "s3" },
  { t: "부록", title: "Copilot (PENZ)", keys: "Chat · 전자 필기장 · 학습", start: "s4" },
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
        h("span", { class: "home-start-icon", "aria-hidden": "true" }, "🖥"), h("strong", {}, "강의 슬라이드"), h("span", {}, "강의 따라가기 · 오프라인")),
      h("a", { class: "home-start-card", href: "/lab", "data-link": "" },
        h("span", { class: "home-start-icon", "aria-hidden": "true" }, "🧪"), h("strong", {}, "실습 워크벤치"), h("span", {}, "실습 7가지 · 바로 해 보기")),
      h("a", { class: "home-start-card", href: "/guide", "data-link": "" },
        h("span", { class: "home-start-icon", "aria-hidden": "true" }, "📘"), h("strong", {}, "가이드북·자료실"), h("span", {}, "강의안 · PDF · 예시")),
      h("a", { class: "home-start-card", href: PADLET_URL, target: "_blank", rel: "noopener" },
        h("span", { class: "home-start-icon", "aria-hidden": "true" }, "💬"), h("strong", {}, "함께 나누기 ↗"), h("span", {}, "패들렛 · 질문·결과물"))),
    h("h2", {}, "오늘의 흐름"),
    h("ol", { class: "home-periods" }, PERIODS.map((p) => {
      const n = slideNumber(p.start);
      return h("li", {}, h("a", { class: "home-period", href: n ? `/slides/#slide-${n}` : "/slides/" },
        h("span", { class: "home-when" }, p.t),
        h("strong", {}, p.title),
        h("span", { class: "home-keys" }, p.keys),
        h("span", { class: "home-go" }, n ? `슬라이드 ${n}번 →` : "슬라이드 →")));
    })),
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
