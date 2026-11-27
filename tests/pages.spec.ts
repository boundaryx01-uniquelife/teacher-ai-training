import { test, expect } from "@playwright/test";
import { readdirSync, readFileSync } from "node:fs";
import { trackConsole } from "./helpers";
const PAGES = ["/", "/lab", "/guide", "/trainer", "/m1", "/m2", "/m3", "/m4", "/m5", "/m6", "/m7", "/vibe", "/ref", "/gemini", "/prompts", "/copilot", "/final"];
for (const p of PAGES) {
  test(`페이지 열림·콘솔 에러 0: ${p}`, async ({ page }) => {
    const errors = trackConsole(page);
    await page.goto(p);
    await expect(page.locator("main h1")).toBeVisible();
    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
  });
}
test("서비스 정보 화면 상단 고지", async ({ page }) => {
  for (const p of ["/copilot", "/prompts", "/final"]) {
    await page.goto(p);
    await expect(page.locator(".notice.fixed")).toHaveText("2026년 11월 기준 · 변경될 수 있어요 · 연수 전 직접 확인");
  }
});
test("번들에 정답·힌트·해설 없음", async () => {
  // Decision (a), 2026-11-25: the guidebook renders the lesson plan verbatim, and the lesson's own example code
  // (ANSWERS = { 1: '3', 2: '1' } + the Q1 hint) is public on /guide and /slides. The live key was changed so that
  // example no longer reveals it. So: (1) every chunk except the guide must contain no hint/explanation text, and
  // (2) the answers shown in the public lesson example must NOT match the server key.
  const files = readdirSync("dist/assets").filter((f) => f.endsWith(".js") || f.endsWith(".map"));
  const appChunks = files.filter((f) => !f.startsWith("guide-")).map((f) => readFileSync(`dist/assets/${f}`, "utf8")).join("\n");
  for (const s of ["광합성에서 나오는", "창고·장부에 해당해요", "MVP = Minimum Viable Product", "산소는 온실효과를", "최소 시제품의 영어 약자"]) expect(appChunks.includes(s), s).toBe(false);
  expect(files.some((f) => f.endsWith(".map"))).toBe(false);
  const key = readFileSync("netlify/lib/quiz.ts", "utf8");
  const live = Object.fromEntries([...key.matchAll(/(\d): \{ answer: "(\d)"/g)].map((m) => [m[1], m[2]]));
  const publicText = readFileSync("content/lesson-plan.md", "utf8") + readFileSync("site-slides/slides.html", "utf8");
  for (const m of publicText.matchAll(/ANSWERS = \{([^}]*)\}/g)) {
    for (const [, q, a] of m[1].matchAll(/(\d):\s*'(\d)'/g)) expect(live[q], `public example ${q}:'${a}' must not match the live key`).not.toBe(a);
  }
  // every other chunk must not contain the live key pattern either
  expect(/answer:\s*"[1-4]",\s*hint:/.test(appChunks)).toBe(false);
});
