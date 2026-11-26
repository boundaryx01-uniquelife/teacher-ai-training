import "./m2.css";
import { h } from "../../lib/ui.ts";
import { QUESTIONS, MARKS } from "./questions.ts";

interface SubmitResponse {
  correct: boolean; hint: string;
  trace: { step: "compare"; result: "correct" | "wrong" };
  row: { id: string; sessionCode: string; question: number; answer: string; correct: boolean; at: string } | null;
  mode: "practice" | "session";
}

const CODE_RE = /^[A-Z2-9]{6}$/;
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function mount(el: HTMLElement) {
  const params = new URLSearchParams(location.search);
  const phone = params.get("view") === "phone";
  const results = new Map<number, boolean>();
  const picks = new Map<number, string>();
  let busy = false;

  /* ---------- session code ---------- */
  const codeInput = h("input", { type: "text", id: "m2-code", inputmode: "text", autocomplete: "off", maxlength: "6", "aria-describedby": "m2-code-help", placeholder: "예: K7P3QZ" }) as HTMLInputElement;
  const fromUrl = (params.get("code") ?? "").toUpperCase();
  if (CODE_RE.test(fromUrl)) codeInput.value = fromUrl;
  const modeLine = h("p", { id: "m2-code-help", class: "hint", "aria-live": "polite" });
  const updateMode = () => {
    const v = codeInput.value.trim().toUpperCase();
    if (codeInput.value !== v) codeInput.value = v;
    if (!v) modeLine.textContent = "코드 없이 풀면 '연습 모드'예요. 채점만 하고 저장하지 않아요.";
    else if (!CODE_RE.test(v)) modeLine.textContent = "회차 코드는 영문 대문자·숫자 6자리예요(0·O·1·I 제외).";
    else modeLine.textContent = `회차 ${v}로 제출해요. 제출 기록은 교사 대시보드에 모여요.`;
  };
  codeInput.addEventListener("input", updateMode);
  updateMode();

  /* ---------- panels ---------- */
  const reqPre = h("pre", { class: "m2-json" }, "아직 제출하지 않았어요");
  const gradeBox = h("div", { class: "m2-grade" }, h("p", { class: "hint" }, "제출하면 서버가 정답과 비교해요"));
  const dbBox = h("div", { class: "m2-db" }, h("p", { class: "hint" }, "제출하면 장부에 한 줄이 추가돼요"));
  const resPre = h("pre", { class: "m2-json" }, "아직 응답이 없어요");
  const panelDefs = [
    { n: "①", title: "요청 JSON", sub: "화면이 서버에 보낸 쪽지 (프론트엔드 → API)", body: h("div", {}, reqPre, h("p", { class: "hint" }, "실제로 보낸 본문 그대로예요. 슬라이드 예시는 단순화한 것이에요.")) },
    { n: "②", title: "서버 채점", sub: "서버가 정답과 맞춰 봄 (백엔드)", body: gradeBox },
    { n: "③", title: "DB 추가 행", sub: "기록장에 한 줄 적기 (데이터베이스)", body: dbBox },
    { n: "④", title: "응답 JSON", sub: "서버가 화면에 보낸 답장 (API → 프론트엔드)", body: resPre },
  ];
  const panels = panelDefs.map((p) => {
    const sec = h("details", { class: "m2-panel", open: true },
      h("summary", {}, h("span", { class: "m2-num" }, p.n), " ", h("strong", {}, p.title), " ", h("span", { class: "hint" }, p.sub)),
      h("div", { class: "m2-panel-body" }, p.body));
    return sec;
  });
  const isWide = () => window.matchMedia("(min-width: 1024px)").matches;
  const syncOpen = () => panels.forEach((p) => { if (isWide()) p.open = true; else if (!busy) p.open = false; });
  syncOpen();
  const mq = window.matchMedia("(min-width: 1024px)");
  const onMq = () => syncOpen();
  mq.addEventListener("change", onMq);

  const live = h("p", { class: "sr-only", "aria-live": "polite" });

  async function highlight() {
    for (const p of panels) {
      p.open = true;
      p.classList.add("flash");
      if (!reduced()) await wait(400);
    }
    setTimeout(() => panels.forEach((p) => p.classList.remove("flash")), reduced() ? 0 : 900);
  }

  function showRequest(body: object) {
    reqPre.textContent = `POST /api/submit\nContent-Type: application/json\n\n${JSON.stringify(body, null, 2)}`;
  }
  function showGrade(q: number, answer: string, data: SubmitResponse) {
    const ok = data.trace.result === "correct";
    gradeBox.replaceChildren(
      h("p", {}, `${q}번 문제: 보낸 답 "${answer}"을 서버에만 있는 정답과 비교합니다.`),
      h("pre", { class: "m2-code" }, `ANSWERS[${q}] === "${answer}"\n→ ■■■ === "${answer}"`),
      h("p", { class: ok ? "ok" : "bad" }, h("strong", {}, ok ? "✓ 비교 결과: 정답" : "✗ 비교 결과: 오답")),
      h("p", { class: "hint" }, "■■■ 자리의 정답 번호는 응답에 담지 않아요. 다만 정답·오답 결과는 알려 주므로 여러 번 찍어 보면 알아낼 수 있어요 — 실제 평가라면 제출 횟수 제한이 함께 필요해요."));
  }
  function showDb(data: SubmitResponse) {
    if (!data.row) {
      dbBox.replaceChildren(h("p", {}, "연습 모드라 저장하지 않았어요."), h("p", { class: "hint" }, "회차 코드를 넣고 풀면 submissions 장부에 한 줄이 추가돼요."));
      return;
    }
    const r = data.row;
    const at = new Date(r.at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", hour12: false });
    dbBox.replaceChildren(
      h("p", {}, "submissions 장부에 추가된 한 줄"),
      h("div", { class: "table-wrap" }, h("table", {},
        h("thead", {}, h("tr", {}, ["id", "sessionCode", "question", "answer", "correct", "at"].map((c) => h("th", { scope: "col" }, c)))),
        h("tbody", {}, h("tr", { class: "m2-newrow" }, h("td", {}, r.id), h("td", {}, r.sessionCode), h("td", {}, String(r.question)), h("td", {}, r.answer), h("td", {}, String(r.correct)), h("td", {}, at))))),
      h("p", { class: "hint" }, "이름·학번·기기 정보는 저장하지 않아요."));
  }
  function showResponse(status: number, data: unknown) {
    resPre.textContent = `${status} ${status === 200 ? "OK" : ""}\n\n${JSON.stringify(data, null, 2)}`;
  }

  /* ---------- quiz ---------- */
  const explainBox = h("section", { class: "m2-explain", "aria-live": "polite" });
  const progress = h("p", { class: "m2-progress", "aria-live": "polite" }, "0 / 5 제출");

  const cards = QUESTIONS.map((q) => {
    const name = `m2-q${q.no}`;
    const choices = q.choices.map((c, i) =>
      h("label", { class: "m2-choice" }, h("input", { type: "radio", name, value: String(i + 1) }), h("span", {}, `${MARKS[i]} ${c}`)));
    const feedback = h("div", { class: "m2-feedback", "aria-live": "polite" });
    const btn = h("button", { class: "btn", type: "button" }, "제출") as HTMLButtonElement;
    const fs = h("fieldset", { class: "m2-q card", id: `m2-card-${q.no}` },
      h("legend", {}, `${q.no}. ${q.text}`), h("div", { class: "m2-choices" }, choices), h("div", { class: "btn-row" }, btn), feedback);
    btn.addEventListener("click", async () => {
      if (busy || results.has(q.no)) return;
      const picked = fs.querySelector<HTMLInputElement>(`input[name=${name}]:checked`);
      if (!picked) { feedback.replaceChildren(h("p", { class: "bad" }, "보기를 하나 골라 주세요.")); return; }
      const code = codeInput.value.trim().toUpperCase();
      if (code && !CODE_RE.test(code)) { feedback.replaceChildren(h("p", { class: "bad" }, "회차 코드 형식을 확인해 주세요.")); codeInput.focus(); return; }
      const body: Record<string, unknown> = code ? { sessionCode: code, question: q.no, answer: picked.value } : { question: q.no, answer: picked.value };
      busy = true; btn.disabled = true; btn.textContent = "채점 중…";
      showRequest(body);
      try {
        const res = await fetch("/api/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const data = await res.json().catch(() => ({ error: "응답을 읽지 못했어요" }));
        showResponse(res.status, data);
        if (!res.ok) {
          gradeBox.replaceChildren(h("p", { class: "bad" }, `서버가 요청을 거절했어요 (${res.status}): ${data.error ?? ""}`));
          dbBox.replaceChildren(h("p", { class: "hint" }, "저장하지 않았어요."));
          feedback.replaceChildren(h("p", { class: "bad" }, data.error ?? "제출하지 못했어요"));
          btn.disabled = false; btn.textContent = "제출";
          busy = false;
          await highlight();
          return;
        }
        const d = data as SubmitResponse;
        showGrade(q.no, picked.value, d);
        showDb(d);
        results.set(q.no, d.correct);
        picks.set(q.no, picked.value);
        fs.querySelectorAll("input").forEach((i) => ((i as HTMLInputElement).disabled = true));
        codeInput.disabled = true;
        btn.textContent = "제출함";
        fs.classList.add(d.correct ? "is-ok" : "is-bad");
        feedback.replaceChildren(d.correct
          ? h("p", { class: "ok" }, h("strong", {}, "✓ 정답!"))
          : h("div", { class: "m2-hint" }, h("p", {}, h("strong", { class: "bad" }, "✗ 오답")), h("p", {}, `힌트: ${d.hint}`)));
        live.textContent = `${q.no}번 ${d.correct ? "정답" : "오답"}`;
        progress.textContent = `${results.size} / 5 제출 · 정답 ${[...results.values()].filter(Boolean).length}개`;
        busy = false;
        await highlight();
        if (results.size === 5) await showExplain();
      } catch {
        feedback.replaceChildren(h("p", { class: "bad" }, "네트워크 오류로 제출하지 못했어요. 다시 눌러 주세요."));
        btn.disabled = false; btn.textContent = "제출";
      } finally { busy = false; }
    });
    return fs;
  });

  async function showExplain() {
    try {
      const res = await fetch("/api/explain", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers: Object.fromEntries(picks) }) });
      if (!res.ok) throw new Error(String(res.status));
      const { items } = (await res.json()) as { items: { question: number; explain: string }[] };
      const score = [...results.values()].filter(Boolean).length;
      explainBox.replaceChildren(
        h("h2", {}, `해설 · ${score} / 5`),
        h("div", { class: "table-wrap" }, h("table", {},
          h("thead", {}, h("tr", {}, h("th", { scope: "col" }, "문항"), h("th", { scope: "col" }, "내 결과"), h("th", { scope: "col" }, "해설"))),
          h("tbody", {}, items.map((it) => h("tr", {},
            h("td", {}, `${it.question}. ${QUESTIONS[it.question - 1].text}`),
            h("td", {}, results.get(it.question) ? "✓ 정답" : "✗ 오답"),
            h("td", {}, it.explain)))))),
        h("p", { class: "hint" }, "다시 풀려면 페이지를 새로 고치세요(새 시도로 기록돼요)."));
    } catch { explainBox.replaceChildren(h("p", { class: "bad" }, "해설을 불러오지 못했어요.")); }
  }

  /* ---------- layout ---------- */
  const intro = h("div", { class: "m2-intro" },
    h("p", { class: "lead" }, "[제출]을 누른 0.5초 동안 프론트엔드 → API → 백엔드 → 데이터베이스를 한 바퀴 돕니다. 문제를 풀면서 ‘지금 오가는 데이터’ 패널(넓은 화면은 오른쪽, 좁은 화면은 아래)에서 실제로 오가는 내용을 확인하세요. 영어·코드는 몰라도 괜찮아요 — 패널 제목의 쉬운 말만 보면 돼요."),
    h("label", { for: "m2-code" }, "회차 코드 ", h("span", { class: "hint" }, "(선택 · 강사가 알려 줘요)")), codeInput, modeLine,
    h("p", { class: "hint" }, "이름·학번 등 개인정보는 받지 않아요."));
  const quizCol = h("section", { class: "m2-quiz", "aria-label": "퀴즈" }, phone ? null : intro, progress, cards, explainBox);
  const panelCol = h("aside", { class: "m2-panels", "aria-label": "요청·채점·저장·응답 패널" }, h("h2", { class: "m2-panels-title" }, "지금 오가는 데이터"), panels);

  el.classList.add("m2");
  if (phone) el.classList.add("m2-phone");
  el.append(
    phone ? h("h1", { class: "m2-phone-title" }, "용어 퀴즈") : h("h1", {}, "M2 퀴즈 앱 해부 실습"),
    h("div", { class: "m2-layout" }, quizCol, phone ? null : panelCol), live);
  if (phone) document.documentElement.classList.add("m2-phone-mode");
  return () => { mq.removeEventListener("change", onMq); document.documentElement.classList.remove("m2-phone-mode"); };
}
