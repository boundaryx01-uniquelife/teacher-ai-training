import "./home.css";
import { h } from "../lib/ui.ts";

const PERIODS = [
  { t: "1교시 · 50분", title: "LLM 개념과 용어", items: ["챗봇·워크플로우·에이전트", "퀴즈 앱으로 보는 프론트·백·DB·API"], mods: [["/m2", "M2 퀴즈 앱 해부"], ["/m3", "M3 교사 대시보드"], ["/m4", "M4 나이스 급식 API"]] },
  { t: "2교시 · 50분", title: "AI 도구 지도", items: ["Chat/Work/Code, Work·Sites", "스킬·플러그인·MCP 적용"], mods: [["/m7", "M7 업무 ↔ AI 짝짓기"], ["/m5", "M5 MCP 호출 시뮬레이터"], ["/m6", "M6 SKILL.md 만들기"]] },
  { t: "3교시 · 50분", title: "ChatGPT 실습", items: ["프롬프트 → 나만의 GPT → 웹 퀴즈", "학생 수업 적용"], mods: [["/m1", "M1 프롬프트 5요소"], ["/prompts", "프롬프트 카드"], ["/final", "최종 과제"]] },
] as const;

export function mount(el: HTMLElement) {
  el.append(
    h("h1", {}, "교사 AI 활용 연수 실습"),
    h("p", { class: "lead" }, "3교시, 개념 → 지도 → 실습. 각 교시에 맞는 실습 모듈로 바로 가세요."),
    h("ol", { class: "home-periods" }, PERIODS.map((p) =>
      h("li", { class: "card home-period" },
        h("p", { class: "home-when" }, p.t),
        h("h2", {}, p.title),
        h("ul", { class: "home-items" }, p.items.map((i) => h("li", {}, i))),
        h("div", { class: "home-mods" }, p.mods.map(([href, label]) => h("a", { class: "btn secondary", href, "data-link": "" }, label)))))),
    h("section", { class: "home-flow", "aria-labelledby": "flow-h" },
      h("h2", { id: "flow-h" }, "판단 흐름"),
      h("ol", { class: "home-flow-steps" },
        h("li", {}, h("strong", {}, "답"), "만 필요하면 ", h("span", { class: "home-tag" }, "Chat")),
        h("li", {}, h("strong", {}, "파일"), "이 필요하면 ", h("span", { class: "home-tag" }, "Work")),
        h("li", {}, h("strong", {}, "학생이 쓸 도구"), "면 ", h("span", { class: "home-tag" }, "Code"))),
      h("p", {}, "같은 일을 매주 한다면 → 스킬·맞춤형 GPT로 고정")),
    h("section", { class: "card home-more" },
      h("h2", {}, "더 보기"),
      h("ul", {},
        h("li", {}, h("a", { href: "/copilot", "data-link": "" }, "Copilot(PENZ) 가이드"), " — Chat·Teach·Notebooks·Learning Zone"),
        h("li", {}, h("a", { href: "/prompts", "data-link": "" }, "프롬프트 카드 모음"), " — Work·Sites·스킬 프롬프트 복사"),
        h("li", {}, h("a", { href: "/final", "data-link": "" }, "최종 과제 안내"), " — 내 단원 퀴즈 만들기"))),
    h("p", { class: "hint" }, "쉬는 시간 10분 × 2 · 준비물: 노트북, ChatGPT 계정, 내 업무 자료 1개(개인정보 제거)"));
}
