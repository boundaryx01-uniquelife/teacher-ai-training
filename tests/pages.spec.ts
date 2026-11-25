import { test, expect } from "@playwright/test";
import { readdirSync, readFileSync } from "node:fs";
import { trackConsole } from "./helpers";
const PAGES = ["/", "/lab", "/guide", "/trainer", "/m1", "/m2", "/m3", "/m4", "/m5", "/m6", "/m7", "/prompts", "/copilot", "/final"];
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
  const files = readdirSync("dist/assets").filter((f) => f.endsWith(".js") || f.endsWith(".map"));
  const all = files.map((f) => readFileSync(`dist/assets/${f}`, "utf8")).join("\n");
  for (const s of ["광합성에서 나오는", "창고·장부에 해당해요", "MVP = Minimum Viable Product", "산소는 온실효과를"]) expect(all.includes(s)).toBe(false);
  expect(files.some((f) => f.endsWith(".map"))).toBe(false);
});
