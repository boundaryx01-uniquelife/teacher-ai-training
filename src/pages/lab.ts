import "./lab.css";
import { h } from "../lib/ui.ts";
import { slidesForRoute } from "../lib/slides.ts";

const MODULES = [
  { route: "/m1", icon: "✍️", title: "프롬프트 5요소 빌더", desc: "역할·대상·과제·조건·형식으로 지시문을 완성하고 한 줄 프롬프트와 비교해요.", min: 12 },
  { route: "/m2", icon: "🔍", title: "퀴즈 앱 해부 실습", desc: "퀴즈를 풀면서 요청·채점·저장·응답이 실제로 오가는 것을 봐요.", min: 10 },
  { route: "/m3", icon: "📊", title: "교사 대시보드", desc: "퀴즈 앱 해부 실습 제출 기록을 문항별 오답률로 봐요(강사 PIN 필요).", min: 5 },
  { route: "/m4", icon: "🍱", title: "나이스 급식 API 체험", desc: "학교 코드와 날짜로 실제 급식 식단 JSON을 받아 봐요.", min: 5 },
  { route: "/m5", icon: "🔌", title: "MCP 호출 시뮬레이터", desc: "AI가 캘린더·드라이브 도구를 부르는 과정과 승인 단계를 따라가요.", min: 5 },
  { route: "/m6", icon: "🧰", title: "스킬 파일 만들기", desc: "양식을 채우면 스킬 파일과 폴더가 만들어지고 zip으로 받아요.", min: 10 },
  { route: "/m7", icon: "🧩", title: "업무 ↔ AI 짝짓기", desc: "학교 업무 11개를 Chat·Work·Code로 나누고 채점해요.", min: 15 },
  { route: "/vibe", icon: "🎧", title: "바이브 코딩 체험", desc: "코드 없이 말로 부탁하고, 결과를 눌러 보며 한 가지씩 고쳐요. 진짜 ChatGPT 실습 문장도 있어요.", min: 15 },
];

export function mount(el: HTMLElement) {
  el.append(
    h("h1", {}, "실습 워크벤치"),
    h("p", { class: "lead" }, "슬라이드의 ▶ 실습하기 버튼이나 아래 카드로 들어가요. 막히면 각 모듈 위쪽의 '2번 해 봐도 안 되면'을 펼치세요."),
    h("ul", { class: "lab-grid" }, MODULES.map((m) => {
      const nums = slidesForRoute(m.route);
      return h("li", {}, h("a", { class: "card lab-card", href: m.route, "data-link": "" },
        h("span", { class: "lab-icon", "aria-hidden": "true" }, m.icon),
        h("span", { class: "lab-title" }, m.title),
        h("span", { class: "lab-desc" }, m.desc),
        h("span", { class: "lab-meta" }, `약 ${m.min}분`, nums.length ? ` · 슬라이드 ${nums.join(", ")}번` : "")));
    })),
    h("p", { class: "hint" }, "시간은 활동 기준 대략값이에요. 슬라이드 번호는 강의 슬라이드의 순서예요."));
}
