import { TROUBLE } from "../content/trouble.ts";
import "./guide.css";
import { h } from "../lib/ui.ts";
import { GUIDE_HTML, GUIDE_TOC, GUIDE_ALIASES } from "../content/guide-content.ts";

const DOWNLOADS: { href: string; label: string; desc: string; fake?: boolean }[] = [
  { href: "/downloads/ai-training-slides.pdf", label: "슬라이드 PDF", desc: "연수 슬라이드 전체" },
  { href: "/downloads/ai-training-a4-summary.pdf", label: "A4 한 장 요약", desc: "판단 흐름·프롬프트 5요소·연수 약속 (인쇄용)" },
  { href: "/downloads/ai-training-prompt-cards.pdf", label: "프롬프트 카드 모음 PDF", desc: "복사해 쓰는 프롬프트 카드" },
  { href: "/downloads/skill-template.zip", label: "SKILL.md 템플릿", desc: "스킬 만들기 실습용 zip" },
  { href: "/downloads/sample-official-letter.pdf", label: "가상 공문", desc: "실습용 예시 공문", fake: true },
  { href: "/downloads/sample-assessment-plan.docx", label: "가상 평가 계획서", desc: "실습용 예시 평가 계획서", fake: true },
  { href: "/downloads/sample-newsletter-1.docx", label: "가정통신문 예시 1", desc: "실습용 예시 가정통신문", fake: true },
  { href: "/downloads/sample-newsletter-2.docx", label: "가정통신문 예시 2", desc: "실습용 예시 가정통신문", fake: true },
];

export function mount(el: HTMLElement) {
  // TOC
  const tocList = h("ul", { class: "guide-toc-list" }, GUIDE_TOC.map((t) =>
    h("li", { class: `lv${t.level}` }, h("a", { href: `#${t.id}`, "data-toc": t.id }, t.text))));
  const toc = h("nav", { class: "guide-toc", "aria-label": "가이드북 목차" },
    h("details", { class: "guide-toc-details", open: window.matchMedia("(min-width: 1024px)").matches },
      h("summary", {}, "목차"), tocList));

  // Guide body (build-time trusted content)
  const body = h("div", { class: "guide-body" });
  const tpl = document.createElement("template");
  tpl.innerHTML = GUIDE_HTML;
  body.append(tpl.content);
  body.querySelectorAll("table").forEach((t) => {
    const wrap = h("div", { class: "table-wrap", tabindex: "0", role: "region", "aria-label": "표 (가로로 스크롤)" });
    t.replaceWith(wrap); wrap.append(t);
  });

  const downloads = h("section", { class: "guide-downloads card", id: "downloads", "aria-labelledby": "downloads-h" },
    h("h2", { id: "downloads-h" }, "자료실"),
    h("p", {}, "연수 후에도 쓸 수 있는 자료입니다. “가상 자료”는 실습용으로 만든 예시이며 실제 학교·인물과 무관합니다."),
    h("ul", { class: "guide-dl" }, DOWNLOADS.map((d) =>
      h("li", {},
        h("a", { class: "btn secondary", href: d.href, download: "" }, d.label),
        d.fake ? h("span", { class: "guide-badge" }, "가상 자료") : null,
        h("span", { class: "guide-dl-desc" }, d.desc)))));

  // "안 될 때" — grouped by stage, each item has a fixed anchor #trouble-<id>
  const stages = [...new Set(TROUBLE.map((t) => t.stage))];
  const trouble = h("section", { class: "guide-trouble card", id: "trouble", "aria-labelledby": "trouble-h" },
    h("h2", { id: "trouble-h" }, "안 될 때"),
    h("p", {}, "자주 막히는 곳을 단계별로 모았어요. 그래도 안 되면 실습 화면의 '2번 해 봐도 안 되면'을 펼치거나 강사에게 손을 들어 주세요."),
    stages.map((st) => h("div", { class: "guide-trouble-group" },
      h("h3", {}, h("span", { class: "guide-stage" }, st)),
      TROUBLE.filter((t) => t.stage === st).map((t) => h("details", { class: "guide-trouble-item", id: `trouble-${t.id}` },
        h("summary", {}, t.q),
        h("ul", {}, t.a.map((x) => h("li", {}, x))))))));

  el.append(
    h("h1", {}, "가이드북"),
    h("nav", { class: "guide-sub", "aria-label": "가이드북 하위 메뉴" },
      h("a", { class: "btn secondary", href: "/prompts", "data-link": "" }, "프롬프트 카드 모음"),
      h("a", { class: "btn secondary", href: "/copilot", "data-link": "" }, "Copilot 가이드"),
      h("a", { class: "btn secondary", href: "/final", "data-link": "" }, "최종 과제"),
      h("a", { class: "btn secondary", href: "#trouble" }, "안 될 때"),
      h("a", { class: "btn secondary", href: "#downloads" }, "자료실")),
    h("div", { class: "guide-layout" }, toc, h("div", { class: "guide-main" }, body, trouble, downloads)));

  // Close mobile TOC after choosing an entry
  tocList.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).closest("a") && !window.matchMedia("(min-width: 1024px)").matches)
      toc.querySelector("details")?.removeAttribute("open");
  });

  const scrollToHash = () => {
    const raw = decodeURIComponent(location.hash.slice(1));
    if (!raw) return;
    const id = GUIDE_ALIASES[raw] && !el.querySelector(`[id="${CSS.escape(raw)}"]`) ? GUIDE_ALIASES[raw] : raw;
    const target = el.querySelector(`[id="${CSS.escape(id)}"]`) ?? el.querySelector(`[id="${CSS.escape(raw)}"]`);
    if (target instanceof HTMLDetailsElement) target.open = true;
    if (target) (target as HTMLElement).scrollIntoView({ block: "start" });
  };
  requestAnimationFrame(scrollToHash);
  window.addEventListener("hashchange", scrollToHash);
  return () => window.removeEventListener("hashchange", scrollToHash);
}
