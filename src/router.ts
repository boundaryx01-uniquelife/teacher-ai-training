export interface Route { path: string; title: string; nav: string; load: () => Promise<{ mount: (el: HTMLElement) => void | (() => void) }> }

export const routes: Route[] = [
  { path: "/", title: "홈", nav: "홈", load: () => import("./pages/home.ts") },
  { path: "/m1", title: "M1 프롬프트 5요소 빌더", nav: "M1 프롬프트", load: () => import("./modules/m1/index.ts") },
  { path: "/m2", title: "M2 퀴즈 앱 해부", nav: "M2 퀴즈 해부", load: () => import("./modules/m2/index.ts") },
  { path: "/m3", title: "M3 교사 대시보드", nav: "M3 대시보드", load: () => import("./modules/m3/index.ts") },
  { path: "/m4", title: "M4 나이스 급식 API", nav: "M4 급식 API", load: () => import("./modules/m4/index.ts") },
  { path: "/m5", title: "M5 MCP 호출 시뮬레이터", nav: "M5 MCP", load: () => import("./modules/m5/index.ts") },
  { path: "/m6", title: "M6 SKILL.md 만들기", nav: "M6 스킬", load: () => import("./modules/m6/index.ts") },
  { path: "/m7", title: "M7 업무 ↔ AI 짝짓기", nav: "M7 짝짓기", load: () => import("./modules/m7/index.ts") },
  { path: "/prompts", title: "프롬프트 카드 모음", nav: "프롬프트 카드", load: () => import("./pages/prompts.ts") },
  { path: "/copilot", title: "Copilot(PENZ) 가이드", nav: "Copilot 가이드", load: () => import("./pages/copilot.ts") },
  { path: "/final", title: "최종 과제 안내", nav: "최종 과제", load: () => import("./pages/final.ts") },
];

export function findRoute(pathname: string): Route | undefined {
  const p = pathname.replace(/\/+$/, "") || "/";
  return routes.find((r) => r.path === p);
}
