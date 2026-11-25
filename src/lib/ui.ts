/** Tiny DOM helpers shared by all pages. No innerHTML with untrusted data. */
type Attrs = Record<string, string | number | boolean | EventListener | undefined | null>;
type Child = Node | string | number | null | undefined | false;

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Attrs = {}, ...children: (Child | Child[])[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2).toLowerCase(), v as EventListener);
    else if (k === "class") el.className = String(v);
    else if (v === true) el.setAttribute(k, "");
    else el.setAttribute(k, String(v));
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

export function toast(msg: string) {
  const t = h("div", { class: "toast", role: "status" }, msg);
  document.body.append(t);
  setTimeout(() => t.remove(), 1800);
}

export async function copyText(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); toast("복사했어요"); return true; }
  catch {
    const ta = h("textarea", { class: "sr-only" }); ta.value = text; document.body.append(ta); ta.select();
    let ok = false; try { ok = document.execCommand("copy"); } catch { ok = false; }
    ta.remove(); toast(ok ? "복사했어요" : "복사하지 못했어요. 직접 선택해 복사해 주세요"); return ok;
  }
}

/** Block of copyable text with a copy button. */
export function copyBlock(text: string, label = "복사"): HTMLElement {
  return h("div", { class: "copy-box" }, h("pre", {}, text), h("button", { class: "btn secondary", type: "button", onclick: () => copyText(text) }, label));
}

/** Sticky notice used on service-info pages (S-12). */
export function serviceNotice(): HTMLElement {
  return h("p", { class: "notice fixed", role: "note" }, "2026년 11월 기준 · 변경될 수 있어요 · 연수 전 직접 확인");
}

export function pageTitle(title: string) { document.title = `${title} · 교사 AI 연수 실습`; }
