import "@fontsource/noto-sans-kr/400.css";
import "@fontsource/noto-sans-kr/700.css";
import "@fontsource/noto-sans-kr/900.css";
import "@fontsource/jetbrains-mono/400.css";
import "./styles/tokens.css";
import "./styles/base.css";
import { MENU, findRoute } from "./router.ts";
import { practiceBar } from "./lib/practice.ts";
import { h, pageTitle } from "./lib/ui.ts";

// first-visit intro on "/" (cover the page synchronously so the home does not flash before the overlay)
if (location.pathname === "/") {
  const q = new URLSearchParams(location.search);
  let seen = false;
  try { seen = localStorage.getItem("intro-seen") === "1"; } catch { /* storage blocked */ }
  const want = q.get("intro") === "1" || q.has("cap") || (q.get("intro") !== "0" && !seen && !matchMedia("(prefers-reduced-motion: reduce)").matches);
  if (want) {
    document.documentElement.classList.add("intro-pending");
    setTimeout(() => document.documentElement.classList.remove("intro-pending"), 4000); // never leave the page covered
    import("./intro/player.ts").then((m) => m.maybePlayIntro()).catch(() => document.documentElement.classList.remove("intro-pending"));
  }
}

const app = document.getElementById("app")!;
let cleanup: void | (() => void);

function buildShell() {
  const navList = h("ul", {}, MENU.map((m) => h("li", {}, h("a", { href: m.href, ...(m.spa ? { "data-link": "" } : {}) },
    h("span", { class: "nav-icon", "aria-hidden": "true" }, m.icon), h("span", { class: "nav-label" }, m.label)))));
  const nav = h("nav", { class: "site-nav", "aria-label": "주요 메뉴" }, navList);
  const header = h("header", { class: "site-header" }, h("div", { class: "inner" }, h("a", { class: "brand", href: "/", "data-link": "" }, "교사 AI 연수"), nav));
  const main = h("main", { id: "main", tabindex: "-1" });
  const footer = h("footer", { class: "site-footer" }, h("div", { class: "inner" },
    h("p", {}, "이 사이트는 개인정보를 받지 않아요. 저장하는 것은 퀴즈 앱 해부 실습 퀴즈를 회차 코드로 풀었을 때의 답 기록뿐이며, 최대 30일 뒤 자동 삭제돼요."),
    h("p", {}, "이 사이트는 ChatGPT·Copilot 등 외부 AI를 직접 호출하지 않습니다. 프롬프트는 복사해서 각자 쓰는 서비스에 붙여 넣으세요.")));
  app.replaceChildren(h("a", { class: "skip", href: "#main" }, "본문 바로가기"), header, main, footer);
  return { main, nav };
}

const shell = buildShell();

let renderToken = 0;
async function render() {
  const token = ++renderToken;
  if (typeof cleanup === "function") cleanup();
  cleanup = undefined;
  const route = findRoute(location.pathname);
  const here = route?.path ?? "";
  shell.nav.querySelectorAll("a").forEach((a, i) => {
    if (MENU[i].match(here)) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });
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
  const bar = practiceBar(route.path);
  if (bar) main.append(bar);
  const box = h("div", { class: "page" });
  main.append(box);
  cleanup = mod.mount(box);
  // jump to an in-page anchor (e.g. /guide#copilot-teach) once the page exists
  if (location.hash.length > 1) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
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
