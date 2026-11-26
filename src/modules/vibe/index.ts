import { h, copyBlock, serviceNotice, pageTitle } from "../../lib/ui.ts";
import "./vibe.css";

/**
 * 바이브 코딩 체험: 코드를 쓰지 않고 말로 요청 → 결과를 눌러 보고 → 한 가지씩 말로 고친다.
 * 이 화면은 체험판(미리 만들어 둔 변화만 보여 줌)이다. 외부 AI를 부르지 않는다 — 진짜 AI 실습은 아래 ‘진짜로 해 보기’의 문장을 ChatGPT에 붙여 넣는다.
 */
type Key = "title" | "big" | "color" | "hint" | "score";
interface Step { key: Key; say: string; what: string; learn: string; words: string[] }

export const FIRST = "고등학교 과학 광합성 단원의 객관식 퀴즈 웹페이지를 만들어 줘. 문제 1개, 보기 4개, HTML 파일 하나로.";
const STEPS: Step[] = [
  { key: "title", say: "제목을 ‘우리 반 광합성 퀴즈’로 하고, 폰에서도 보기 좋게 카드 모양으로 만들어 줘.", what: "제목이 생기고 내용이 카드 안에 가운데로 모였어요.", learn: "화면에 보이는 것(제목·모양)은 말로 바로 바꿀 수 있어요.", words: ["제목", "카드", "폰", "모양", "예쁘"] },
  { key: "big", say: "보기 버튼을 크게 만들고, 누르면 색이 바뀌게 해 줘.", what: "보기가 큰 버튼이 되고, 누른 것이 강조돼요.", learn: "‘크게’, ‘색이 바뀌게’처럼 눈에 보이는 결과를 말하면 돼요.", words: ["크게", "버튼", "누르면", "강조"] },
  { key: "color", say: "제출하면 정답이면 초록, 오답이면 주황으로 알려 줘.", what: "제출하면 맞았는지 색과 글자로 알려 줘요.", learn: "‘언제, 무엇을 하면, 어떻게 된다’를 한 문장으로 말하면 기능이 돼요.", words: ["정답", "오답", "초록", "주황", "제출", "채점"] },
  { key: "hint", say: "오답이면 정답을 바로 알려 주지 말고 힌트부터 보여 줘.", what: "오답일 때 힌트 한 줄이 먼저 나와요.", learn: "교사의 수업 의도(정답을 바로 주지 않기)도 말로 넣을 수 있어요.", words: ["힌트", "도움", "바로 알려"] },
  { key: "score", say: "학생 이름은 받지 말고, 점수는 이 화면에서만 보여 줘.", what: "점수 칸이 생기고, 이름은 받지 않는다는 안내가 붙어요.", learn: "개인정보를 받지 않는 규칙도 요청에 꼭 적어요.", words: ["점수", "이름", "개인정보"] },
];
const QUESTION = "광합성에서 식물이 내보내는 기체는?";
const CHOICES = ["이산화탄소", "산소", "질소", "수소"];
const ANSWER = 1;

const REAL_STEPS = [FIRST, ...STEPS.map((s) => s.say)];

export function mount(el: HTMLElement) {
  pageTitle("바이브 코딩 체험");
  const on = new Set<Key>();
  let picked = -1, submitted = false;
  const log = h("ol", { class: "vb-log" });
  const note = h("p", { class: "vb-note", role: "status", "aria-live": "polite" }, "아직 아무것도 고치지 않았어요. 왼쪽에서 말을 골라 보세요.");
  const stage = h("div", { class: "vb-stage" });
  const free = h("input", { type: "text", id: "vb-free", placeholder: "예: 제목을 크게 해 줘 / 힌트도 보여 줘", autocomplete: "off", maxlength: "80" }) as HTMLInputElement;

  function render() {
    stage.className = "vb-stage" + [...on].map((k) => " vb-" + k).join("");
    const card = h("div", { class: "vb-page" });
    if (on.has("title")) card.append(h("h2", { class: "vb-h" }, "우리 반 광합성 퀴즈"));
    card.append(h("p", { class: "vb-q" }, QUESTION));
    const list = h("div", { class: "vb-choices", role: "group", "aria-label": "보기" });
    CHOICES.forEach((c, i) => {
      const b = h("button", { type: "button", class: "vb-choice", "aria-pressed": String(picked === i) }, `${"①②③④"[i]} ${c}`);
      if (submitted && on.has("color") && picked === i) b.classList.add(i === ANSWER ? "vb-right" : "vb-wrong");
      b.addEventListener("click", () => { picked = i; submitted = false; render(); });
      list.append(b);
    });
    card.append(list);
    const submit = h("button", { type: "button", class: "vb-submit" }, "제출");
    submit.addEventListener("click", () => { if (picked < 0) return; submitted = true; render(); });
    card.append(submit);
    if (submitted) {
      const ok = picked === ANSWER;
      card.append(h("p", { class: "vb-result " + (on.has("color") ? (ok ? "vb-right" : "vb-wrong") : "") }, ok ? (on.has("color") ? "✓ 정답이에요!" : "정답: 산소") : (on.has("color") ? "✗ 오답이에요" : "정답: 산소")));
      if (!ok && on.has("hint")) card.append(h("p", { class: "vb-hintline" }, "힌트: 식물은 광합성을 할 때 숨 쉴 때 쓰는 기체를 만들어 내보내요."));
    }
    if (on.has("score")) card.append(h("p", { class: "vb-score" }, `점수: ${submitted && picked === ANSWER ? 1 : 0} / 1`), h("p", { class: "vb-privacy" }, "이름은 받지 않아요 · 점수는 이 화면에서만 보여요"));
    stage.replaceChildren(card);
  }

  function apply(s: Step) {
    if (on.has(s.key)) { note.textContent = "이미 적용한 말이에요. 다른 말을 골라 보세요."; return; }
    on.add(s.key);
    log.append(h("li", {}, `“${s.say}” → ${s.what}`));
    note.textContent = `AI가 바꾼 것: ${s.what}  ·  배운 점: ${s.learn}`;
    render();
    chips.querySelectorAll<HTMLButtonElement>("button[data-k]").forEach((b) => { if (on.has(b.dataset.k as Key)) { b.disabled = true; } });
  }
  function reset() {
    on.clear(); picked = -1; submitted = false; log.replaceChildren();
    note.textContent = "처음 상태로 돌렸어요. 말을 골라 다시 해 보세요.";
    chips.querySelectorAll<HTMLButtonElement>("button[data-k]").forEach((b) => { b.disabled = false; });
    render();
  }

  const chips = h("div", { class: "vb-chips" }, STEPS.map((s, i) => {
    const b = h("button", { type: "button", class: "btn secondary vb-chip", "data-k": s.key }, h("span", { class: "vb-n" }, String(i + 1)), h("span", {}, `“${s.say}”`));
    b.addEventListener("click", () => apply(s));
    return b;
  }));

  const tryFree = () => {
    const t = free.value.trim(); if (!t) return;
    const hit = STEPS.find((s) => !on.has(s.key) && s.words.some((w) => t.includes(w)));
    if (hit) { apply(hit); free.value = ""; }
    else if (STEPS.some((s) => s.words.some((w) => t.includes(w)))) note.textContent = "그 말은 이미 적용했어요. 다른 것도 말해 보세요.";
    else note.textContent = "이 체험판은 위 다섯 가지 말만 알아들어요. 진짜 ChatGPT는 자유롭게 말해도 되니, 아래 ‘진짜로 해 보기’에서 마음껏 해 보세요.";
  };
  free.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); tryFree(); } });

  el.append(
    serviceNotice(),
    h("h1", {}, "바이브 코딩 체험"),
    h("p", { class: "lead" }, "코드를 한 줄도 쓰지 않고, 말로 부탁하고 → 결과를 눌러 보고 → 한 가지씩 말로 고쳐 가는 방법이에요."),
    h("div", { class: "notice", role: "note" }, h("strong", {}, "바이브 코딩"), " = 만들고 싶은 느낌(바이브)을 말로 설명하면 AI가 코드를 써 주고, 결과를 보며 계속 말로 다듬는 방식. 이 아래 화면은 ", h("strong", {}, "체험판"), "(미리 만들어 둔 변화)이고, 진짜 AI 실습은 맨 아래에서 해요."),
    h("section", { class: "vb-grid", "aria-label": "체험판" },
      h("div", { class: "vb-left" },
        h("h2", {}, "1. 첫 부탁"),
        h("p", {}, "AI에게 처음 이렇게 부탁했다고 해요. 오른쪽에 결과가 나와 있어요."),
        copyBlock(FIRST),
        h("h2", {}, "2. 말로 한 가지씩 고치기"),
        h("p", { class: "hint" }, "아래 말을 눌러 보세요(순서는 마음대로). 한 번에 한 가지씩이 핵심이에요."),
        chips,
        h("label", { for: "vb-free" }, "내 말로 해 보기 ", h("span", { class: "hint" }, "(Enter)")), free,
        h("div", { class: "btn-row" }, h("button", { type: "button", class: "btn danger", onclick: reset }, "처음부터 다시")),
      ),
      h("div", { class: "vb-right" },
        h("h2", {}, "결과 화면 (눌러 보세요)"),
        stage, note,
        h("h3", {}, "내가 고친 기록"), log)),
    h("section", { class: "vb-real", "aria-labelledby": "vb-real-h" },
      h("h2", { id: "vb-real-h" }, "3. 진짜로 해 보기 (ChatGPT)"),
      h("p", {}, "ChatGPT를 열고 ", h("strong", {}, "아래 문장을 위에서부터 하나씩"), " 붙여 넣어요. 한 번 붙이면 ", h("strong", {}, "결과를 직접 눌러 보고"), " 다음 문장으로 가요. 위 체험판과 비슷한 변화가 생기면 성공이에요."),
      h("ol", { class: "vb-real-list" }, REAL_STEPS.map((t, i) => h("li", {}, h("p", { class: "vb-rl" }, i === 0 ? "첫 부탁" : `고치기 ${i}`), copyBlock(t)))),
      h("div", { class: "card vb-check" },
        h("h3", {}, "끝나기 전에 확인"),
        h("ul", {},
          h("li", {}, "눌러 봤을 때 정말 정답·오답이 맞게 나오나요? (AI는 틀릴 수 있어요)"),
          h("li", {}, "학생 이름·성적을 받는 칸이 없나요?"),
          h("li", {}, "막히면 ‘안 되는 점’을 그대로 말해요. 예: “제출을 눌러도 아무 일도 안 일어나. 고쳐 줘.”"))),
      h("p", { class: "hint" }, "ChatGPT 계정이 없으면 같은 문장을 Gemini에 붙여 넣어도 돼요 → ", h("a", { href: "/gemini", "data-link": "" }, "Gemini 가이드")),
      h("p", { class: "hint" }, "내 과목으로 바꾸려면 ‘광합성’과 문제 내용만 내 단원으로 바꿔서 첫 부탁부터 다시 해 보세요.")),
  );
  render();
}
