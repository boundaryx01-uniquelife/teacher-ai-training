/** v3 §3-3 and §4: "← 슬라이드 N번으로" when opened from a slide, and the "2번 해 봐도 안 되면" fallback. */
import { h, copyBlock } from "./ui.ts";
import { slideNumber, SLIDE_TITLES } from "./slides.ts";
import { FALLBACK } from "./fallback-content.ts";
import { EXTRA } from "./extra-content.ts";

export function practiceBar(route: string): HTMLElement | null {
  const from = new URLSearchParams(location.search).get("from") ?? "";
  const n = /^[a-z0-9-]{1,40}$/.test(from) ? slideNumber(from) : null;
  const fb = FALLBACK[route];
  const ex = EXTRA[route];
  if (!n && !fb && !ex) return null;
  const bar = h("div", { class: "practice-bar" });
  if (n) bar.append(h("a", { class: "btn secondary practice-back", href: `/slides/#slide-${n}` }, `← 슬라이드 ${n}번으로 돌아가기`, h("span", { class: "sr-only" }, ` (${SLIDE_TITLES[from] ?? ""})`)));
  if (fb) {
    const body = h("div", { class: "practice-fallback-body" },
      h("p", {}, fb.summary),
      fb.items.map((it) => h("div", { class: "practice-item" },
        h("h3", {}, it.label),
        it.kind === "note" ? h("p", {}, it.text) : copyBlock(it.text))));
    bar.append(h("details", { class: "practice-fallback", id: "fallback" },
      h("summary", {}, h("span", { "aria-hidden": "true" }, "🆘 "), "2번 해 봐도 안 되면 — 완성 예시 보기"), body));
  }
  if (ex) {
    bar.append(h("details", { class: "practice-fallback practice-extra", id: "extra" },
      h("summary", {}, h("span", { "aria-hidden": "true" }, "🚀 "), "빨리 끝냈다면 — 더 해 보기"),
      h("div", { class: "practice-fallback-body" },
        h("p", {}, ex.summary),
        ex.items.map((it) => h("div", { class: "practice-item" }, h("h3", {}, it.label), it.kind === "prompt" ? copyBlock(it.text) : h("p", {}, it.text))))));
  }
  return bar;
}
