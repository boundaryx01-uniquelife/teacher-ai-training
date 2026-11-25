import "@fontsource/noto-sans-kr/400.css";
import "@fontsource/noto-sans-kr/700.css";
import "@fontsource/noto-sans-kr/900.css";
import "@fontsource/jetbrains-mono/400.css";
import "./styles/tokens.css";
import "./styles/base.css";
import { routes, findRoute } from "./router.ts";
import { h, pageTitle } from "./lib/ui.ts";

const app = document.getElementById("app")!;
let cleanup: void | (() => void);

function buildShell() {
  const navList = h("ul", {}, routes.map((r) => h("li", {}, h("a", { href: r.path, "data-link": "" }, r.nav))));
  const nav = h("nav", { class: "site-nav", id: "site-nav", "aria-label": "주요 메뉴" }, navList);
  const toggle = h("button", { class: "nav-toggle", type: "button", "aria-expanded": "false", "aria-controls": "site-nav" }, "메뉴");
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  const header = h("header", { class: "site-header" }, h("div", { class: "inner" }, h("a", { class: "brand", href: "/", "data-link": "" }, "교사 AI 연수 실습"), toggle, nav));
  const main = h("main", { id: "main", tabindex: "-1" });
  const footer = h("footer", { class: "site-footer" }, h("div", { class: "inner" },
    h("p", {}, "제출 기록은 최대 30일 보관 후 삭제되도록 설정되어 있습니다. 이름·학번·연락처 등 개인정보는 입력하지 마세요."),
    h("p", {}, "이 사이트는 ChatGPT·Copilot 등 외부 AI를 직접 호출하지 않습니다. 프롬프트는 복사해서 각자 쓰는 서비스에 붙여 넣으세요.")));
  app.replaceChildren(h("a", { class: "skip", href: "#main" }, "본문 바로가기"), header, main, footer);
  return { main, nav, toggle };
}

const shell = buildShell();

let renderToken = 0;
async function render() {
  const token = ++renderToken;
  if (typeof cleanup === "function") cleanup();
  cleanup = undefined;
  const route = findRoute(location.pathname);
  shell.nav.querySelectorAll("a").forEach((a) => {
    if (a.getAttribute("href") === (route?.path ?? "")) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });
  shell.nav.classList.remove("open"); shell.toggle.setAttribute("aria-expanded", "false");
  const main = shell.main;
  main.replaceChildren();
  if (!route) {
    pageTitle("찾을 수 없음");
    main.append(h("h1", {}, "페이지를 찾을 수 없어요"), h("p", {}, h("a", { href: "/", "data-link": "" }, "홈으로")));
    return;
  }
  pageTitle(route.title);
  const mod = await route.load();
  if (token !== renderToken) return; // a newer navigation started
  const box = h("div", { class: "page" });
  main.append(box);
  cleanup = mod.mount(box);
}

document.addEventListener("click", (e) => {
  const a = (e.target as HTMLElement).closest("a[data-link]") as HTMLAnchorElement | null;
  if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.target) return;
  const url = new URL(a.href);
  if (url.origin !== location.origin) return;
  e.preventDefault();
  if (url.pathname + url.search !== location.pathname + location.search) history.pushState({}, "", url.pathname + url.search);
  render().then(() => { window.scrollTo(0, 0); shell.main.focus({ preventScroll: true }); });
});
window.addEventListener("popstate", () => { render(); });
render();
