import "./m1.css";
import { h, copyText, pageTitle } from "../../lib/ui.ts";

// 문구 출처: content/lesson-plan.md 440–456행 (1단계: 프롬프트 다듬기), slides/step1.html
const ONE_LINE = "평가 문제 만들어줘";

interface Element5 {
  key: string;
  name: string;
  example: string; // 강의안의 예시 문장(자리표시자 포함)
}

const ELEMENTS: Element5[] = [
  { key: "role", name: "역할", example: "너는 고등학교 [과목] 교사야." },
  { key: "target", name: "대상", example: "고[학년] 학생, 학습 수준은 중간이야." },
  { key: "task", name: "과제", example: "[단원명] 단원의 형성평가 문항 5개를 만들어 줘." },
  { key: "cond", name: "조건", example: "객관식 3개, 서술형 2개. 각 문항에 성취기준을 표시해." },
  { key: "format", name: "형식", example: "표로: 번호 | 문항 | 정답 | 해설 | 성취기준" },
];

export function mount(el: HTMLElement) {
  pageTitle("프롬프트 5요소 빌더");

  const inputs: Record<string, HTMLTextAreaElement> = {};
  const fields = ELEMENTS.map((e, i) => {
    const id = `m1-${e.key}`;
    const ta = h("textarea", { id, rows: 2, placeholder: e.example, "aria-describedby": `${id}-ex` });
    ta.addEventListener("input", update);
    inputs[e.key] = ta;
    return h("div", { class: "m1-field" },
      h("label", { for: id }, `${i + 1}. ${e.name}`),
      h("p", { class: "hint", id: `${id}-ex` }, `강의안 예시: ${e.example}`),
      ta);
  });

  const out = h("pre", { class: "m1-out", id: "m1-out", "aria-label": "완성된 프롬프트" });
  const copyBtn = h("button", { class: "btn accent", type: "button" }, "완성 프롬프트 복사");
  copyBtn.addEventListener("click", () => { const t = assemble(); if (t) void copyText(t); });
  const fillBtn = h("button", { class: "btn secondary", type: "button" }, "강의안 예시 채우기");
  fillBtn.addEventListener("click", () => {
    ELEMENTS.forEach((e) => { inputs[e.key].value = e.example; });
    update();
  });
  const clearBtn = h("button", { class: "btn secondary", type: "button" }, "비우기");
  clearBtn.addEventListener("click", () => {
    ELEMENTS.forEach((e) => { inputs[e.key].value = ""; });
    update();
  });
  const oneCopy = h("button", { class: "btn secondary", type: "button" }, "한 줄 프롬프트 복사");
  oneCopy.addEventListener("click", () => void copyText(ONE_LINE));

  const status = h("p", { class: "hint", "aria-live": "polite" });

  function assemble(): string {
    return ELEMENTS.map((e) => inputs[e.key].value.trim()).filter(Boolean).join("\n");
  }
  function update() {
    const t = assemble();
    const filled = ELEMENTS.filter((e) => inputs[e.key].value.trim()).length;
    out.textContent = t || "위 칸에 입력하면 여기에 프롬프트가 만들어집니다.";
    out.classList.toggle("m1-empty", !t);
    copyBtn.disabled = !t;
    status.textContent = `5요소 중 ${filled}개 입력`;
  }

  const left = h("section", { class: "card", "aria-labelledby": "m1-h-in" },
    h("h2", { id: "m1-h-in" }, "5요소 입력"),
    h("div", { class: "btn-row" }, fillBtn, clearBtn),
    fields);

  const right = h("section", { class: "card", "aria-labelledby": "m1-h-out" },
    h("h2", { id: "m1-h-out" }, "완성된 프롬프트"),
    status, out,
    h("div", { class: "btn-row" }, copyBtn),
    h("p", { class: "hint" }, "이 사이트는 AI를 호출하지 않습니다. 복사해서 쓰는 AI 서비스(Chat)에 붙여 넣으세요."));

  const compare = h("section", { class: "m1-compare", "aria-labelledby": "m1-h-cmp" },
    h("h2", { id: "m1-h-cmp" }, "한 줄 프롬프트와 비교"),
    h("p", {}, "먼저 “평가 문제 만들어줘”만 입력해 결과를 본 뒤, 5요소(역할·대상·과제·조건·형식)를 넣어 비교한다."),
    h("div", { class: "grid cols-2" },
      h("div", { class: "card" },
        h("h3", {}, h("span", { class: "badge" }, "A"), " 한 줄 프롬프트"),
        h("pre", {}, ONE_LINE),
        h("div", { class: "btn-row" }, oneCopy)),
      h("div", { class: "card" },
        h("h3", {}, h("span", { class: "badge orange" }, "B"), " 5요소 프롬프트"),
        h("ul", { class: "m1-list" }, ELEMENTS.map((e) =>
          h("li", {}, h("strong", {}, e.name), " ", e.example))))),
    h("p", { class: "notice", role: "note" },
      h("strong", {}, "확인 포인트: "), "정답·성취기준이 실제와 맞는지 교사가 검토한다(환각 체험)."));

  el.append(
    h("h1", {}, "프롬프트 5요소 빌더"),
    h("p", { class: "lead" }, "1단계 · 프롬프트 다듬기: 좋은 지시문의 5요소(역할·대상·과제·조건·형식) 익히기"),
    h("p", { class: "hint" }, "예시의 [과목]·[학년]·[단원명]처럼 대괄호 안은 내 내용으로 바꿔 쓰세요. 바꾸지 않으면 AI가 글자 그대로 씁니다."),
    h("div", { class: "m1-cols" }, left, right),
    compare);
  update();
}
