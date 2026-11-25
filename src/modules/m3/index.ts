import "./m3.css";
import { h, copyText } from "../../lib/ui.ts";

const QTEXT = ["온실가스가 아닌 것은?", "사용자가 보고 누르는 화면 부분은?", "제출한 답을 채점하는 곳은?", "제출 기록을 모아 두는 곳은?", "핵심 기능만 넣어 먼저 써 보는 시제품은?"];
interface Stats { sessionCode: string; total: number; perQuestion: { question: number; total: number; wrong: number; wrongRate: number }[]; recent: { no: number; id: string; question: number; answer: string; correct: boolean; at: string }[] }

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, { credentials: "same-origin", ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

export function mount(el: HTMLElement) {
  let timer: number | undefined;
  let current = "";
  const status = h("p", { class: "m3-status", role: "status", "aria-live": "polite" });
  const body = h("div", {});
  el.append(
    h("h1", {}, "M3 교사 대시보드"),
    h("p", { class: "lead" }, "M2에서 모인 제출 기록을 문항별 오답률로 봅니다. 오답률이 높은 문항이 다음 수업에서 다시 다룰 곳이에요."),
    status, body);

  async function start() {
    const { data } = await api("/api/auth");
    if (data.authed) showDashboard(); else showLogin(data.configured !== false);
  }

  function showLogin(configured: boolean) {
    if (timer) { clearInterval(timer); timer = undefined; }
    const pin = h("input", { type: "password", id: "m3-pin", inputmode: "numeric", autocomplete: "off", maxlength: "64" }) as HTMLInputElement;
    const msg = h("p", { class: "bad", "aria-live": "assertive" });
    const form = h("form", { class: "card m3-login" },
      h("h2", {}, "연수 강사 PIN"),
      configured ? null : h("p", { class: "notice" }, "아직 PIN이 설정되지 않았어요. 사이트 관리자가 환경변수 TRAINER_PIN·AUTH_SECRET을 설정해야 해요."),
      h("label", { for: "m3-pin" }, "PIN (6자리 이상)"), pin,
      h("div", { class: "btn-row" }, h("button", { class: "btn", type: "submit" }, "들어가기")), msg,
      h("p", { class: "hint" }, "5번 틀리면 15분 동안 잠겨요. PIN은 서버에서만 확인하고, 로그인은 4시간 뒤 풀려요."));
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      msg.textContent = "";
      let res: Response, data: any;
      try { ({ res, data } = await api("/api/auth", { method: "POST", body: JSON.stringify({ pin: pin.value }) })); }
      catch { msg.textContent = "서버에 연결하지 못했어요"; return; }
      pin.value = "";
      if (res.ok) showDashboard(); else msg.textContent = data.error ?? "로그인하지 못했어요";
    });
    body.replaceChildren(form);
    pin.focus();
  }

  async function showDashboard() {
    const select = h("select", { id: "m3-session" }) as HTMLSelectElement;
    const newBtn = h("button", { class: "btn accent", type: "button" }, "새 회차 만들기");
    const logout = h("button", { class: "btn secondary", type: "button" }, "로그아웃");
    const auto = h("input", { type: "checkbox", id: "m3-auto", checked: true }) as HTMLInputElement;
    const share = h("div", { class: "m3-share" });
    const statsBox = h("div", { class: "m3-stats" });
    const resetBox = h("div", { class: "card m3-reset" });

    body.replaceChildren(
      h("div", { class: "card m3-controls" },
        h("div", { class: "btn-row" }, newBtn, logout),
        h("label", { for: "m3-session" }, "회차 선택"), select,
        h("label", { class: "m3-check" }, auto, " 5초마다 자동 새로 고침"),
        share),
      statsBox, resetBox);

    async function loadSessions(selectCode?: string) {
      const { res, data } = await api("/api/sessions");
      if (res.status === 401) return showLogin(true);
      const list = (data.sessions ?? []) as { sessionCode: string; createdAt: string }[];
      select.replaceChildren(...(list.length ? list.map((s) => h("option", { value: s.sessionCode }, `${s.sessionCode} · ${new Date(s.createdAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", hour12: false })}`)) : [h("option", { value: "" }, "회차가 없어요 — [새 회차 만들기]")]));
      if (selectCode) select.value = selectCode;
      current = select.value;
      await loadStats();
    }

    async function loadStats() {
      if (!current) { statsBox.replaceChildren(); share.replaceChildren(); renderReset(); return; }
      const link = `${location.origin}/m2?code=${current}`;
      share.replaceChildren(
        h("p", {}, "참가자 안내: M2에서 회차 코드 ", h("strong", { class: "m3-code" }, current), " 입력"),
        h("p", { class: "m3-link" }, link), h("button", { class: "btn secondary", type: "button", onclick: () => copyText(link) }, "링크 복사"));
      const asked = current;
      const { res, data } = await api(`/api/stats?sessionCode=${asked}`);
      if (asked !== current) return; // a newer selection is in flight; drop this stale response
      if (res.status === 401) return showLogin(true);
      if (!res.ok) { status.textContent = data.error ?? "불러오지 못했어요"; return; }
      renderStats(data as Stats);
      renderReset();
      status.textContent = `${new Date().toLocaleTimeString("ko-KR", { timeZone: "Asia/Seoul", hour12: false })} 기준`;
    }

    function renderStats(s: Stats) {
      const bars = s.perQuestion.map((p) => {
        const fill = h("div", { class: "m3-fill" });
        fill.style.width = `${p.wrongRate}%`;
        return h("li", { class: "m3-bar" },
          h("div", { class: "m3-bar-label" }, h("strong", {}, `${p.question}번`), " ", QTEXT[p.question - 1]),
          h("div", { class: "m3-track", role: "img", "aria-label": `${p.question}번 오답률 ${p.wrongRate}%` }, fill),
          h("div", { class: "m3-bar-val" }, `오답률 ${p.wrongRate}% (${p.wrong}/${p.total})`));
      });
      const recent = s.recent.slice().reverse();
      statsBox.replaceChildren(
        h("section", { class: "card" },
          h("h2", {}, `문항별 오답률 · 제출 ${s.total}건`),
          h("ol", { class: "m3-bars" }, bars)),
        h("section", { class: "card" },
          h("h2", {}, "최근 제출 (최대 20건)"),
          recent.length ? h("div", { class: "table-wrap" }, h("table", {},
            h("thead", {}, h("tr", {}, ["순번", "문항", "답", "결과", "시각"].map((c) => h("th", { scope: "col" }, c)))),
            h("tbody", {}, recent.map((r) => h("tr", {}, h("td", {}, String(r.no)), h("td", {}, `${r.question}번`), h("td", {}, r.answer), h("td", {}, r.correct ? "✓ 정답" : "✗ 오답"), h("td", {}, new Date(r.at).toLocaleTimeString("ko-KR", { timeZone: "Asia/Seoul", hour12: false }))))))) : h("p", { class: "hint" }, "아직 제출이 없어요.")));
    }

    function renderReset() {
      if (!current) { resetBox.replaceChildren(h("p", { class: "hint" }, "회차를 만들면 여기서 초기화할 수 있어요.")); return; }
      const confirm = h("input", { type: "text", id: "m3-confirm", autocomplete: "off", maxlength: "6" }) as HTMLInputElement;
      const btn = h("button", { class: "btn danger", type: "button", disabled: true }, "이 회차 기록 삭제") as HTMLButtonElement;
      const msg = h("p", { "aria-live": "polite" });
      confirm.addEventListener("input", () => { confirm.value = confirm.value.toUpperCase(); btn.disabled = confirm.value !== current; });
      btn.addEventListener("click", async () => {
        const { res, data } = await api("/api/reset", { method: "POST", body: JSON.stringify({ sessionCode: current, confirm: confirm.value }) });
        msg.textContent = res.ok ? `${data.deleted}건을 삭제했어요.` : data.error ?? "삭제하지 못했어요";
        confirm.value = ""; btn.disabled = true;
        await loadStats();
      });
      resetBox.replaceChildren(h("h2", {}, "초기화"),
        h("p", {}, `회차 ${current}의 제출 기록만 지웁니다. 확인을 위해 회차 코드를 그대로 입력하세요.`),
        h("label", { for: "m3-confirm" }, "회차 코드 확인"), confirm, h("div", { class: "btn-row" }, btn), msg);
    }

    newBtn.addEventListener("click", async () => {
      const { res, data } = await api("/api/sessions", { method: "POST" });
      if (res.status === 401) return showLogin(true);
      if (res.ok) { status.textContent = `새 회차 ${data.sessionCode}를 만들었어요.`; await loadSessions(data.sessionCode); }
    });
    select.addEventListener("change", () => { current = select.value; loadStats(); });
    logout.addEventListener("click", async () => { await api("/api/auth", { method: "DELETE" }); if (timer) clearInterval(timer); showLogin(true); });
    const tick = () => { if (auto.checked && document.visibilityState === "visible") loadStats(); };
    if (timer) clearInterval(timer);
    timer = window.setInterval(tick, 5000);
    await loadSessions();
  }

  start();
  return () => { if (timer) clearInterval(timer); };
}
