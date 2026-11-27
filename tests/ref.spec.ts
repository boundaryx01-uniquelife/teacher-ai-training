import { test, expect } from "@playwright/test";
import { trackConsole } from "./helpers.ts";

test("레퍼런스로 만들기: 종류에 따라 요청 문장이 바뀌고 예시 화면이 열린다", async ({ page, request }) => {
  const errors = trackConsole(page);
  await page.goto("/ref?from=ref-what");
  await expect(page.locator("h1")).toHaveText("레퍼런스로 만들기");
  await expect(page.locator(".practice-back")).toContainText("슬라이드");
  const box = page.locator(".rf-out pre, .rf-out code").first();
  await expect(page.locator(".rf-out")).toContainText("첨부한 화면 이미지를 레퍼런스로 삼아");
  await expect(page.locator("#rf-url")).toBeHidden();
  await page.getByRole("button", { name: /웹 주소/ }).click();
  await page.locator("#rf-url").fill("https://teacher-ai-training.netlify.app");
  await expect(page.locator(".rf-out")).toContainText("이 주소의 화면을 레퍼런스로 삼아(https://teacher-ai-training.netlify.app)");
  await page.locator("#rf-url").fill("http://bad");
  await expect(page.locator(".rf-warn")).toContainText("https://");
  await page.getByRole("button", { name: /공개 GitHub/ }).click();
  await page.locator("#rf-url").fill("https://github.com/example/notice-app");
  await expect(page.locator(".rf-out")).toContainText("라이선스와 출처 표기");
  await page.locator("#rf-take-2").check();
  await expect(page.locator(".rf-out")).toContainText("기능의 흐름");
  await expect(page.locator(".rf-sample")).toBeVisible();
  const r = await request.get("/downloads/sample-reference-notice-app.png");
  expect(r.status()).toBe(200); expect(r.headers()["content-type"]).toContain("image/png");
  await page.locator("#fallback summary").click();
  await expect(page.locator("#fallback")).toContainText("완성 문장");
  expect(errors).toEqual([]);
});
