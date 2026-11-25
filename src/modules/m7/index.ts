import { h, toast } from "../../lib/ui.ts";
import "./m7.css";

type Layer = "Chat" | "Work" | "Code";
const LAYERS: Layer[] = ["Chat", "Work", "Code"];

interface Task { id: string; name: string; output: string; answer: Layer; tools: string; reason: string }

// Source: content/lesson-plan.md lines 391-409 (table: 학교 업무 / 결과물 / 추천 층 / 도구 / 이유).
const TASKS: Task[] = [
  { id: "t1", name: "가정통신문·안내문 초안", output: "텍스트", answer: "Chat", tools: "ChatGPT", reason: "짧고 빠름" },
  { id: "t2", name: "수업 발문·활동 아이디어", output: "텍스트", answer: "Chat", tools: "ChatGPT, Claude", reason: "대화하며 다듬기" },
  { id: "t3", name: "교과서·연수 자료 요약·질문", output: "요약·답변", answer: "Chat", tools: "NotebookLM", reason: "올린 자료 안에서만 답함" },
  { id: "t4", name: "최신 정책·진학 정보 조사", output: "출처 달린 요약", answer: "Chat", tools: "Perplexity, ChatGPT 검색", reason: "출처 확인 가능 (검색 포함 Chat)" },
  { id: "t5", name: "수행평가 루브릭 + 평가지 파일", output: "문서 파일", answer: "Work", tools: "ChatGPT Work, Claude Cowork", reason: "여러 단계를 한 번에" },
  { id: "t6", name: "연수·수업 슬라이드 제작", output: "슬라이드", answer: "Work", tools: "ChatGPT Work, Claude, Gamma", reason: "파일로 완성" },
  { id: "t7", name: "엑셀 성적·설문 결과 정리", output: "표·그래프", answer: "Work", tools: "ChatGPT Work, Copilot in Excel", reason: "표 계산 + 시각화" },
  { id: "t8", name: "구글 클래스룸·드라이브 자료 정리", output: "문서·폴더", answer: "Work", tools: "Gemini(Workspace)", reason: "자료가 구글에 있음" },
  { id: "t9", name: "주간학습안내 매주 반복", output: "같은 양식 문서", answer: "Work", tools: "맞춤형 GPT, 스킬", reason: "양식 고정 반복 (Work + 스킬, 스킬로 고정하면 더 좋음)" },
  { id: "t10", name: "학생용 퀴즈·단어장 웹앱", output: "프로그램(링크)", answer: "Code", tools: "Codex, ChatGPT Sites, Claude Code", reason: "학생이 직접 사용" },
  { id: "t11", name: "동아리·학급 알림 PWA", output: "앱", answer: "Code", tools: "Codex, Claude Code", reason: "폰 설치형" },
];

const RULE = "판단 흐름: 답만 필요하면 Chat → 파일이 필요하면 Work → 학생이 직접 쓸 도구면 Code. 같은 일을 매주 하면 스킬·맞춤형 GPT로 고정한다.";

export function mount(el: HTMLElement) {
  const state: Record<string, Layer | undefined> = {};
  let graded = false;
  let dragId: string | null = null;
  let focusKey: string | null = null;

  const live = h("p", { class: "m7-score", role: "status", "aria-live": "polite" });
  const root = h("div", { class: "m7" });
  el.append(
    h("h1", {}, "업무 ↔ AI 짝짓기"),
    h("p", { class: "lead" }, "학교 업무 11개를 Chat · Work · Code 중 알맞은 층에 짝지어 보세요."),
    h("div", { class: "notice", role: "note" }, h("strong", {}, RULE)),
    root,
  );

  function place(id: string, layer: Layer | undefined) {
    if (graded) return;
    state[id] = layer;
  }

  function card(t: Task): HTMLElement {
    const cur = state[t.id];
    const ok = graded ? cur === t.answer : undefined;
    const c = h("li", {
      class: "m7-card" + (graded ? (ok ? " right" : " wrong") : ""),
      draggable: graded ? undefined : "true",
    });
    c.addEventListener("dragstart", (e) => { dragId = t.id; e.dataTransfer?.setData("text/plain", t.id); });
    c.addEventListener("dragend", () => { dragId = null; });
    c.append(h("p", { class: "m7-name" }, t.name), h("p", { class: "m7-out" }, "결과물: " + t.output));
    const grp = h("div", { class: "m7-choices", role: "group", "aria-label": `${t.name} 분류 선택` });
    for (const l of LAYERS) {
      grp.append(h("button", {
        type: "button", class: "m7-choice", "aria-pressed": String(cur === l), "data-key": `${t.id}-${l}`,
        disabled: graded,
        onclick: () => { place(t.id, cur === l ? undefined : l); focusKey = `${t.id}-${l}`; render(); },
      }, l));
    }
    c.append(grp);
    if (graded) {
      c.append(h("div", { class: "m7-result" },
        h("p", { class: "m7-verdict" }, ok ? "✓ 정답" : `✗ 오답 — 정답은 ${t.answer}${cur ? "" : " (미분류)"}`),
        h("p", {}, `이유: ${t.reason}`),
        h("p", { class: "m7-tools" }, `도구(예): ${t.tools}`)));
    }
    return c;
  }

  function zone(key: Layer | "pool", title: string): HTMLElement {
    const items = TASKS.filter((t) => (key === "pool" ? !state[t.id] : state[t.id] === key));
    const z = h("section", { class: "m7-zone" + (key === "pool" ? " pool" : ""), "aria-label": title },
      h("h2", {}, title, h("span", { class: "m7-count" }, ` (${items.length})`)));
    if (!items.length) z.append(h("p", { class: "hint" }, key === "pool" ? "모두 분류했어요." : "여기로 끌어다 놓거나 카드의 버튼을 누르세요."));
    z.append(h("ul", { class: "m7-list" }, items.map(card)));
    z.addEventListener("dragover", (e) => { if (!graded) e.preventDefault(); });
    z.addEventListener("drop", (e) => {
      e.preventDefault();
      const id = dragId ?? e.dataTransfer?.getData("text/plain");
      if (id && TASKS.some((t) => t.id === id)) { place(id, key === "pool" ? undefined : key); render(); }
    });
    return z;
  }

  function grade() {
    graded = true;
    const n = TASKS.filter((t) => state[t.id] === t.answer).length;
    const un = TASKS.filter((t) => !state[t.id]).length;
    live.textContent = `점수 ${n}/${TASKS.length}` + (un ? ` (미분류 ${un}개는 오답 처리)` : "");
    render();
  }

  function reset() {
    for (const t of TASKS) state[t.id] = undefined;
    graded = false;
    live.textContent = "";
    toast("처음 상태로 돌렸어요");
    render();
  }

  function render() {
    const placed = TASKS.filter((t) => state[t.id]).length;
    root.replaceChildren(
      h("p", { class: "hint" }, "데스크톱에서는 카드를 끌어다 놓을 수 있고, 어디서나 카드의 Chat · Work · Code 버튼으로 고를 수 있어요."),
      zone("pool", "분류할 업무"),
      h("div", { class: "m7-cols" }, LAYERS.map((l) => zone(l, l))),
      h("div", { class: "btn-row" },
        h("button", { type: "button", class: "btn accent", onclick: grade, disabled: graded }, "채점"),
        h("button", { type: "button", class: "btn secondary", onclick: reset }, "다시 하기"),
        h("span", { class: "hint" }, `${placed}/${TASKS.length} 분류함`)),
      live,
    );
    if (focusKey) {
      root.querySelector<HTMLElement>(`[data-key="${focusKey}"]`)?.focus();
      focusKey = null;
    }
  }
  render();
}
