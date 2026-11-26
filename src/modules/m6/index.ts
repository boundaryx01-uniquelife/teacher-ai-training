import { zipSync, strToU8 } from "fflate";
import { h, copyBlock, toast, pageTitle } from "../../lib/ui.ts";
import "./m6.css";

const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

interface State {
  name: string; description: string; title: string;
  inputs: string; steps: string; tone: string; checks: string;
  assets: boolean; references: boolean;
}
type TextKey = "name" | "description" | "title" | "inputs" | "steps" | "tone" | "checks";

// 예시: content-extract.md M6 (lesson-plan.md 305-348행) "SKILL.md 실제 예시"
const EXAMPLE: State = {
  name: "school-newsletter",
  description: "한빛고 가정통신문을 학교 양식과 공문체로 작성한다. \"가정통신문\", \"학부모 안내\" 요청에 사용.",
  title: "가정통신문 작성",
  inputs: "행사명, 일시, 장소, 대상, 준비물, 회신 필요 여부",
  steps: "빠진 입력이 있으면 먼저 묻는다\nassets/template.docx 양식을 따른다\n인사말 → 안내 본문 → 회신서 순서로 쓴다",
  tone: "\"~하오니\", \"~바랍니다\" 공문체, 한 문장 40자 이내",
  checks: "날짜와 요일이 맞는가\n학생 개인정보가 없는가",
  assets: true, references: true,
};

const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);

function yamlValue(v: string): string {
  const one = v.replace(/\s+/g, " ").trim();
  return /(^[\s\-?:,[\]{}#&*!|>'"%@`])|(: )| #|:$/.test(one) ? JSON.stringify(one) : one;
}

function validate(s: State) {
  let name = "", description = "";
  const n = s.name.trim();
  if (!n) name = "이름을 적어 주세요. 영어 소문자·숫자·하이픈만 쓸 수 있어요.";
  else if (n.length > 64) name = "이름은 64자 이하로 적어 주세요.";
  else if (!NAME_RE.test(n)) name = "영어 소문자·숫자·하이픈(-)만 쓸 수 있고, 하이픈은 처음·끝·연속으로 올 수 없어요. 예: school-newsletter";
  if (!s.description.trim()) description = "설명을 꼭 적어 주세요. 언제 쓰는지를 적으세요.";
  return { name, description };
}

function build(s: State): string {
  const out: string[] = ["---", `name: ${s.name.trim()}`, `description: ${yamlValue(s.description)}`, "---"];
  if (s.title.trim()) out.push(`# ${s.title.trim()}`);
  const sec = (title: string, body: string[]) => { if (body.length) out.push("", `## ${title}`, ...body); };
  const inputs = lines(s.inputs).join(" ");
  sec("필요한 입력", inputs ? [`- ${inputs}`] : []);
  sec("절차", lines(s.steps).map((l, i) => `${i + 1}. ${l}`));
  sec("말투", lines(s.tone).map((l) => `- ${l}`));
  sec("끝내기 전 점검", lines(s.checks).map((l) => `- ${l}`));
  return out.join("\n") + "\n";
}

function tree(s: State): string {
  const root = (s.name.trim() || "skill-name") + "/";
  const rows: [string, string][] = [["SKILL.md", "  ← 필수: 이름·설명·절차"]];
  if (s.assets) rows.push(["assets/", ""]);
  if (s.references) rows.push(["references/", ""]);
  return [root, ...rows.map(([n, note], i) => `${i === rows.length - 1 ? "└── " : "├── "}${n}${note}`)].join("\n");
}

export function mount(el: HTMLElement) {
  pageTitle("SKILL.md 만들기");
  const s: State = { name: "", description: "", title: "", inputs: "", steps: "", tone: "", checks: "", assets: false, references: false };
  const touched = new Set<TextKey>();
  let url: string | null = null;

  const field = (id: string, label: string, key: TextKey, opts: { area?: boolean; hint: string; ph?: string }) => {
    const hintId = `${id}-hint`, errId = `${id}-err`;
    const attrs = { id, placeholder: opts.ph, "aria-describedby": `${hintId} ${errId}` };
    const ctl = opts.area
      ? h("textarea", { ...attrs, rows: 3 })
      : h("input", { ...attrs, type: "text", autocomplete: "off", spellcheck: "false" });
    ctl.addEventListener("input", () => { s[key] = ctl.value; touched.add(key); render(); });
    ctl.addEventListener("blur", () => { touched.add(key); render(); });
    const err = h("p", { id: errId, class: "m6-err", "aria-live": "polite" });
    return { key, ctl, err, node: h("div", {}, h("label", { for: id }, label), h("p", { id: hintId, class: "hint" }, opts.hint), ctl, err) };
  };

  const fields = [
    field("m6-name", "스킬 이름 (name)", "name", { hint: "영어 소문자·숫자·하이픈, 64자 이하. 폴더 이름이 됩니다.", ph: "school-newsletter" }),
    field("m6-desc", "설명 (description)", "description", { area: true, hint: "언제 쓰는지를 적으세요", ph: "○○를 ○○할 때 사용" }),
    field("m6-title", "본문 제목 (선택)", "title", { hint: "SKILL.md 본문 첫 줄 제목" }),
    field("m6-in", "필요한 입력 (선택)", "inputs", { area: true, hint: "쉼표로 이어서 적으세요" }),
    field("m6-steps", "절차 (선택)", "steps", { area: true, hint: "한 줄에 한 단계씩. 번호는 자동으로 붙어요." }),
    field("m6-tone", "말투 (선택)", "tone", { area: true, hint: "한 줄에 하나씩" }),
    field("m6-checks", "끝내기 전 점검 (선택)", "checks", { area: true, hint: "한 줄에 하나씩" }),
  ];

  const mkCheck = (id: string, label: string, key: "assets" | "references") => {
    const c = h("input", { id, type: "checkbox" });
    c.addEventListener("change", () => { s[key] = c.checked; render(); });
    return { c, node: h("label", { class: "m6-check", for: id }, c, label) };
  };
  const cAssets = mkCheck("m6-assets", "assets/ 폴더 포함 (예: 학교 양식 파일)", "assets");
  const cRefs = mkCheck("m6-refs", "references/ 폴더 포함 (예: 잘 쓴 예시)", "references");

  const treeOut = h("pre", { class: "m6-tree" });
  const mdOut = h("div", { class: "m6-out" });
  const status = h("p", { class: "m6-status", role: "status" });
  const dl = h("button", { class: "btn accent", type: "button" }, "zip 내려받기");
  const fill = h("button", { class: "btn secondary", type: "button" }, "예시 채우기");

  function render() {
    const v = validate(s);
    for (const f of fields) {
      const msg = f.key === "name" ? v.name : f.key === "description" ? v.description : "";
      const show = msg && touched.has(f.key) ? msg : "";
      f.err.textContent = show;
      f.ctl.setAttribute("aria-invalid", show ? "true" : "false");
    }
    const invalid = !!(v.name || v.description);
    dl.disabled = invalid;
    status.textContent = invalid ? "이름과 설명을 올바르게 채우면 내려받을 수 있어요." : "준비됐어요. 내려받아도 서버로 전송되지 않아요.";
    treeOut.textContent = tree(s);
    mdOut.replaceChildren(invalid
      ? h("p", { class: "hint" }, "이름과 설명이 올바를 때 복사할 수 있어요. 아래는 지금까지의 미리보기예요.")
      : "", copyBlock(build(s), "SKILL.md 복사"));
    if (invalid) mdOut.querySelector("button")?.setAttribute("disabled", "");
  }

  fill.addEventListener("click", () => {
    Object.assign(s, EXAMPLE);
    for (const f of fields) (f.ctl as HTMLInputElement | HTMLTextAreaElement).value = s[f.key];
    cAssets.c.checked = s.assets; cRefs.c.checked = s.references;
    render(); toast("예시를 채웠어요");
  });
  dl.addEventListener("click", () => {
    if (dl.disabled) return;
    const root = s.name.trim();
    const files: Record<string, Uint8Array> = { [`${root}/SKILL.md`]: strToU8(build(s)) };
    if (s.assets) files[`${root}/assets/`] = new Uint8Array(0);
    if (s.references) files[`${root}/references/`] = new Uint8Array(0);
    const blob = new Blob([zipSync(files) as BlobPart], { type: "application/zip" });
    if (url) URL.revokeObjectURL(url);
    url = URL.createObjectURL(blob);
    const a = h("a", { href: url, download: `${root}.zip` });
    document.body.append(a); a.click(); a.remove();
    toast("zip을 내려받았어요");
  });

  el.classList.add("m6");
  el.replaceChildren(
    h("h1", {}, "SKILL.md 만들기"),
    h("p", { class: "lead" }, "폴더 하나가 스킬 하나예요. 이름과 설명, 절차를 적으면 SKILL.md가 바로 만들어져요."),
    h("p", { class: "notice", role: "note" }, "AI는 평소에 이름과 설명만 알고 있다가, 요청이 설명과 맞으면 본문을 열어 따라요. 그래서 description에 ‘언제 쓰는지’를 분명히 적는 것이 핵심이에요. 이 화면의 내용은 서버로 보내지 않아요."),
    h("div", { class: "btn-row" }, fill),
    h("div", { class: "grid cols-2" },
      h("section", { class: "card", "aria-labelledby": "m6-h-form" },
        h("h2", { id: "m6-h-form" }, "1. 내용 적기"),
        ...fields.map((f) => f.node),
        h("p", { class: "hint" }, "선택 폴더 (zip에 빈 폴더로 들어가요)"),
        cAssets.node, cRefs.node),
      h("section", { class: "card", "aria-labelledby": "m6-h-out" },
        h("h2", { id: "m6-h-out" }, "2. 만들어진 결과"),
        h("h3", {}, "폴더 구조"), treeOut,
        h("h3", {}, "SKILL.md"), mdOut,
        h("div", { class: "btn-row" }, dl),
        status,
        h("h3", {}, "3. 내려받은 뒤"),
        h("ol", {},
          h("li", {}, "assets/ 폴더에 내 학교 가정통신문 양식을 template.docx 이름으로 넣어요(자료실의 예시 양식도 쓸 수 있어요)."),
          h("li", {}, "ChatGPT 설정의 스킬 메뉴에서 폴더(zip)를 올려요. 스킬은 요금제·학교 관리자 설정에 따라 메뉴가 없을 수 있어요."),
          h("li", {}, "스킬 메뉴가 없으면 SKILL.md 내용을 맞춤형 GPT나 프로젝트 지침에 붙여 넣어 같은 효과를 내요.")))));
  render();
  return () => { if (url) URL.revokeObjectURL(url); };
}
