import { h, toast } from "../../lib/ui.ts";
import "./m5.css";

type Tool = { name: string; kind: "read" | "write"; desc: string };
type Scenario = {
  id: number;
  text: string;
  connector: string;
  write: boolean;
  tools: Tool[];
  chosen: string;
  args: Record<string, unknown>;
  response: Record<string, unknown>;
  summary: string;
};

const CAL_TOOLS: Tool[] = [
  { name: "list_events", kind: "read", desc: "일정 조회" },
  { name: "create_event", kind: "write", desc: "일정 만들기" },
  { name: "delete_event", kind: "write", desc: "일정 삭제" },
];
const DRIVE_TOOLS: Tool[] = [
  { name: "search_files", kind: "read", desc: "파일 검색" },
  { name: "read_file", kind: "read", desc: "파일 내용 읽기" },
  { name: "share_file", kind: "write", desc: "파일 공유" },
];

const SCENARIOS: Scenario[] = [
  {
    id: 1,
    text: "@Google Calendar 다음 주 화요일 15시에 협의회 등록해 줘",
    connector: "Google Calendar",
    write: true,
    tools: CAL_TOOLS,
    chosen: "create_event",
    args: { title: "교과 협의회", start: "2026-12-01T15:00", end: "2026-12-01T16:00" },
    response: { status: "confirmed", link: "https://example.invalid/가상-일정" },
    summary: "AI가 ‘일정 만들기’ 도구를 골라 요청을 만들고 등록했습니다. 이 시뮬레이션은 승인 단계를 보여 주지만, 실제 ChatGPT는 설정에 따라 묻지 않고 바로 등록하기도 해요. (가상 예시)",
  },
  {
    id: 2,
    text: "@Google Calendar 이번 주 일정 알려줘",
    connector: "Google Calendar",
    write: false,
    tools: CAL_TOOLS,
    chosen: "list_events",
    args: { start: "2026-11-23", end: "2026-11-29" },
    response: {
      events: [
        { title: "교과 협의회", start: "2026-11-24T15:00" },
        { title: "학급 회의", start: "2026-11-26T08:40" },
      ],
    },
    summary: "AI가 ‘일정 조회’ 도구를 골라 부르고, 돌려받은 가상 일정 2건을 정리해 알려 줍니다.",
  },
  {
    id: 3,
    text: "@Google Drive 수행평가 계획서 찾아 줘",
    connector: "Google Drive",
    write: false,
    tools: DRIVE_TOOLS,
    chosen: "search_files",
    args: { query: "수행평가 계획서" },
    response: { files: [{ name: "수행평가 계획서(가상 예시).docx", modified: "2026-11-10" }] },
    summary: "AI가 ‘파일 검색’ 도구를 골라 부르고, 찾은 가상 파일을 알려 줍니다.",
  },
];

const STEP_LABELS = ["사용자 문장", "도구 목록", "호출 JSON", "승인", "응답"];
const json = (v: unknown) => JSON.stringify(v, null, 2);
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function mount(el: HTMLElement) {
  let sel: Scenario | null = null;
  let step = 0; // 0 = none chosen; 1..5
  let approval: "pending" | "approved" | "rejected" = "pending";

  const live = h("p", { class: "sr-only", "aria-live": "polite", role: "status" });
  const picker = h("div", { class: "m5-picker", role: "radiogroup", "aria-label": "문장 고르기" });
  const indicator = h("ol", { class: "m5-steps", "aria-label": "진행 단계" });
  const stage = h("div", { class: "m5-stage" });
  const nextBtn = h("button", { class: "btn accent", type: "button", onclick: () => advance() }, "다음 단계");
  const resetBtn = h("button", { class: "btn secondary", type: "button", onclick: () => reset() }, "처음부터");
  const controls = h("div", { class: "btn-row m5-controls" }, nextBtn, resetBtn);

  function reset() {
    sel = null; step = 0; approval = "pending";
    render();
    picker.querySelector<HTMLElement>("button")?.focus();
    announce("처음 상태로 돌아왔습니다. 문장을 골라 주세요.");
  }

  function announce(msg: string) {
    live.textContent = "";
    setTimeout(() => { live.textContent = msg; }, 30);
  }

  function choose(s: Scenario) {
    sel = s; step = 1; approval = "pending";
    render(true);
  }

  function advance() {
    if (!sel || nextBtn.disabled) return;
    if (step === 4 && sel.write && approval !== "approved") return;
    step += 1;
    render(true);
  }

  function decide(ok: boolean) {
    approval = ok ? "approved" : "rejected";
    toast(ok ? "승인했습니다 (시뮬레이션)" : "거절했습니다 (시뮬레이션)");
    render(true);
  }

  function panel(n: number, title: string, ...body: (Node | string)[]): HTMLElement {
    const hd = h("h3", { class: "m5-h", tabindex: -1, id: `m5-step-${n}` }, `${n}단계 · ${title}`);
    return h("section", { class: "card m5-panel", "aria-labelledby": `m5-step-${n}` }, hd, ...body);
  }

  function buildPanel(n: number, s: Scenario): HTMLElement {
    if (n === 1) {
      return panel(1, "사용자 문장",
        h("p", { class: "m5-quote" }, `“${s.text}”`),
        h("p", {}, `‘@${s.connector}’처럼 앱(MCP로 연결된 서비스)을 불러서 부탁합니다. 이 문장은 AI에게 전달됩니다.`));
    }
    if (n === 2) {
      return panel(2, "AI가 보는 도구 목록",
        h("p", {}, `AI는 연결된 ${s.connector}가 제공하는 도구 목록을 먼저 확인합니다. (도구 이름은 예시)`),
        h("ul", { class: "m5-tools" }, s.tools.map((t) =>
          h("li", {}, h("code", {}, t.name), " ", h("span", { class: `m5-tag ${t.kind}` }, t.kind === "read" ? "읽기" : "쓰기"), " ", t.desc))),
        h("pre", { "aria-label": "도구 목록 JSON 예시" }, json({ tools: s.tools.map((t) => ({ name: t.name, access: t.kind, description: t.desc })) })));
    }
    if (n === 3) {
      const t = s.tools.find((x) => x.name === s.chosen)!;
      return panel(3, "호출 JSON",
        h("p", {}, `AI가 ‘${t.desc}’ 도구를 골라 요청을 만듭니다. 날짜는 가상의 예시 날짜입니다. (도구·인자 이름은 예시)`),
        h("pre", { "aria-label": "호출 JSON 예시" }, `→ ${json({ tool: s.chosen, arguments: s.args })}`));
    }
    if (n === 4) {
      if (!s.write) {
        return panel(4, "읽기 도구",
          h("p", {}, `‘${s.chosen}’는 읽기 도구입니다. 이 시뮬레이션에서는 승인 단계 없이 다음으로 넘어갑니다. (실제 서비스에서는 설정에 따라 다를 수 있으니 직접 확인하세요.)`));
      }
      const body: (Node | string)[] = [
        h("p", {}, "쓰기 동작이에요. 실제 서비스는 설정에 따라 실행 전에 묻거나 바로 실행해요(연수 준비 중 실제로는 묻지 않고 바로 등록됐어요). 이 시뮬레이션에서는 승인 단계를 직접 눌러 봅니다. 아래 요청을 실행할까요?"),
        h("pre", { "aria-label": "승인 요청 내용" }, json({ tool: s.chosen, arguments: s.args })),
      ];
      if (approval === "pending") {
        body.push(h("div", { class: "btn-row" },
          h("button", { class: "btn", type: "button", onclick: () => decide(true) }, "승인"),
          h("button", { class: "btn danger", type: "button", onclick: () => decide(false) }, "거절")));
      } else if (approval === "approved") {
        body.push(h("p", { class: "ok m5-result" }, "승인했습니다. [다음 단계]를 눌러 이어가세요."));
      } else {
        body.push(h("p", { class: "m5-result m5-stop" }, "실행하지 않았습니다. 캘린더에는 아무 일도 일어나지 않았고, 여기서 멈춥니다."));
      }
      return panel(4, "사람 승인", ...body);
    }
    return panel(5, "응답 · 완료",
      h("p", {}, `${s.connector}가 결과를 돌려줍니다. (가상 데이터)`),
      h("pre", { "aria-label": "응답 JSON 예시" }, `← ${json(s.response)}`),
      h("p", { class: "m5-summary" }, h("strong", {}, "완료. "), s.summary));
  }

  function render(focusNew = false) {
    picker.replaceChildren(...SCENARIOS.map((s) =>
      h("button", {
        class: "m5-choice", type: "button", role: "radio",
        "aria-checked": sel?.id === s.id ? "true" : "false",
        onclick: () => choose(s),
      },
        h("span", { class: "m5-choice-text" }, `${"①②③"[s.id - 1]} ${s.text}`),
        h("span", { class: `m5-tag ${s.write ? "write" : "read"}` }, s.write ? "쓰기 · 승인 확인" : "읽기"))));

    const stopped = approval === "rejected";
    indicator.replaceChildren(...STEP_LABELS.map((lb, i) => {
      const n = i + 1;
      const cls = ["m5-step", n === step ? "current" : "", n < step ? "done" : "", stopped && n > 4 ? "off" : ""].join(" ").trim();
      const li = h("li", { class: cls }, h("span", { class: "m5-num" }, n), h("span", { class: "m5-lb" }, lb));
      if (n === step) li.setAttribute("aria-current", "step");
      return li;
    }));

    stage.replaceChildren();
    if (!sel) {
      stage.append(h("p", { class: "lead" }, "위에서 문장을 하나 고르면 1단계부터 시작합니다."));
    } else {
      for (let n = 1; n <= step; n++) stage.append(buildPanel(n, sel));
    }

    const atEnd = step >= 5;
    nextBtn.disabled = !sel || atEnd || (step === 4 && !!sel.write && approval !== "approved");
    nextBtn.hidden = !sel || atEnd || stopped;
    resetBtn.hidden = !sel;

    if (focusNew && sel) {
      const target = stage.querySelector<HTMLElement>(`#m5-step-${step}`);
      if (target) {
        target.focus({ preventScroll: true });
        if (!reduced()) target.scrollIntoView({ block: "nearest", behavior: "smooth" });
        else target.scrollIntoView({ block: "nearest" });
      }
      announce(stopped ? "거절했습니다. 실행하지 않았습니다." : `${step}단계, ${STEP_LABELS[step - 1]}`);
    }
  }

  el.append(
    h("div", { class: "m5" },
      h("h1", {}, "MCP 호출 시뮬레이터"),
      h("p", { class: "m5-banner", role: "note" },
        h("span", { class: "badge sim" }, "시뮬레이션"),
        " 이 화면은 연습용입니다. 실제 구글 캘린더·드라이브 등 어떤 서비스에도 연결하거나 호출하지 않으며, 모든 도구 이름·JSON·일정·파일은 가상 ‘예시’입니다."),
      h("p", { class: "lead" }, "MCP는 AI를 다른 프로그램에 꽂는 ‘표준 콘센트(USB-C)’입니다. 문장을 고르고 AI가 도구를 부르는 과정을 한 단계씩 따라가 보세요."),
      h("h2", { class: "m5-sub" }, "1. 문장 고르기"),
      picker,
      h("h2", { class: "m5-sub" }, "2. 단계 따라가기"),
      indicator,
      controls,
      stage,
      live,
      h("p", { class: "notice" }, "1교시 API와 같은 원리입니다. 차이는 사람이 코드를 짜는 대신 AI가 어떤 도구를 언제 부를지 스스로 고른다는 점이고, MCP는 그 도구 목록과 호출 방식을 맞춘 표준 규칙입니다. 앱을 연결하면 AI가 그 계정의 자료에 접근하므로, 학교 계정은 학교 정보보안 지침을 먼저 확인하세요.")));
  render();
}
