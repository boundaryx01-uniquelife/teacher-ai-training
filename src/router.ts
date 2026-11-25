export interface Route { path: string; title: string; load: () => Promise<{ mount: (el: HTMLElement) => void | (() => void) }> }

export const routes: Route[] = [
  { path: "/", title: "홈", load: () => import("./pages/home.ts") },
  { path: "/lab", title: "실습 워크벤치", load: () => import("./pages/lab.ts") },
  { path: "/guide", title: "가이드북", load: () => import("./pages/guide.ts") },
  { path: "/trainer", title: "강사용 진행", load: () => import("./pages/trainer.ts") },
  { path: "/m1", title: "M1 프롬프트 5요소 빌더", load: () => import("./modules/m1/index.ts") },
  { path: "/m2", title: "M2 퀴즈 앱 해부", load: () => import("./modules/m2/index.ts") },
  { path: "/m3", title: "M3 교사 대시보드", load: () => import("./modules/m3/index.ts") },
  { path: "/m4", title: "M4 나이스 급식 API", load: () => import("./modules/m4/index.ts") },
  { path: "/m5", title: "M5 MCP 호출 시뮬레이터", load: () => import("./modules/m5/index.ts") },
  { path: "/m6", title: "M6 SKILL.md 만들기", load: () => import("./modules/m6/index.ts") },
  { path: "/m7", title: "M7 업무 ↔ AI 짝짓기", load: () => import("./modules/m7/index.ts") },
  { path: "/prompts", title: "프롬프트 카드 모음", load: () => import("./pages/prompts.ts") },
  { path: "/copilot", title: "Copilot(PENZ) 가이드", load: () => import("./pages/copilot.ts") },
  { path: "/final", title: "최종 과제 안내", load: () => import("./pages/final.ts") },
];

/** Top menu (v3 §2). `match` decides which item is current; /slides/ is a separate static page (full navigation). */
export const MENU = [
  { href: "/", label: "홈", icon: "🏠", spa: true, match: (p: string) => p === "/" },
  { href: "/slides/", label: "강의 슬라이드", icon: "🖥", spa: false, match: (_p: string) => false },
  { href: "/lab", label: "실습 워크벤치", icon: "🧪", spa: true, match: (p: string) => p === "/lab" || /^\/m[1-7]$/.test(p) },
  { href: "/guide", label: "가이드북", icon: "📘", spa: true, match: (p: string) => ["/guide", "/prompts", "/copilot", "/final"].includes(p) },
];

export function findRoute(pathname: string): Route | undefined {
  const p = pathname.replace(/\/+$/, "") || "/";
  return routes.find((r) => r.path === p);
}
