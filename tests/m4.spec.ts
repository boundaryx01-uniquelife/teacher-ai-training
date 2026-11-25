import { test, expect } from "@playwright/test";
async function run(page: any, url: string) {
  await page.goto(url);
  await page.getByLabel(/교육청 코드/).fill("B10");
  await page.getByLabel(/학교 코드/).fill("7010057");
  await page.getByLabel(/날짜/).fill("2026-11-24");
  await page.getByRole("button", { name: "급식 불러오기" }).click();
}
test("M4 정상 호출", async ({ page }) => {
  await run(page, "/m4");
  await expect(page.locator(".m4-head")).toContainText("실제 응답", { timeout: 15000 });
  await expect(page.locator(".m4-meal").first()).toBeVisible();
  await expect(page.locator(".m4-url")).toContainText("open.neis.go.kr");
});
test("M4 실패 → 샘플 전환", async ({ page }) => {
  await run(page, "/m4?simulateFail=1");
  await expect(page.locator(".m4-head .badge")).toHaveText("샘플");
  await expect(page.locator(".m4-result")).toContainText("한빛고등학교(가상)");
});
