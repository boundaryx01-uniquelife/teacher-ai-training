import { test, expect } from "@playwright/test";
import { trackConsole } from "./helpers.ts";

test("바이브 코딩 체험: 말을 누르면 결과 화면이 바뀌고, 정답 표시는 색으로", async ({ page }) => {
  const errors = trackConsole(page);
  await page.goto("/vibe?from=vibe-what");
  await expect(page.locator("h1")).toHaveText("바이브 코딩 체험");
  await expect(page.locator(".practice-back")).toContainText("슬라이드");
  await expect(page.locator(".vb-h")).toHaveCount(0);
  await page.locator('.vb-chip[data-k="title"]').click();
  await expect(page.locator(".vb-h")).toHaveText("우리 반 광합성 퀴즈");
  await page.locator('.vb-chip[data-k="color"]').click();
  await page.locator('.vb-chip[data-k="hint"]').click();
  await page.locator('.vb-chip[data-k="score"]').click();
  await page.locator(".vb-choice").nth(0).click(); // 오답
  await page.locator(".vb-submit").click();
  await expect(page.locator(".vb-result")).toContainText("오답");
  await expect(page.locator(".vb-hintline")).toBeVisible();
  await expect(page.locator(".vb-privacy")).toContainText("이름은 받지 않아요");
  await page.locator(".vb-choice").nth(1).click(); // 정답
  await page.locator(".vb-submit").click();
  await expect(page.locator(".vb-result")).toContainText("정답");
  // free text → keyword mapping, unknown text → honest message
  await page.getByRole("button", { name: "처음부터 다시" }).click();
  await page.locator("#vb-free").fill("보기를 크게 해 줘"); await page.locator("#vb-free").press("Enter");
  await expect(page.locator(".vb-stage.vb-big")).toHaveCount(1);
  await page.locator("#vb-free").fill("로켓을 날려 줘"); await page.locator("#vb-free").press("Enter");
  await expect(page.locator(".vb-note")).toContainText("다섯 가지");
  // real-practice prompts + fallback
  await expect(page.locator(".vb-real-list li")).toHaveCount(6);
  await page.locator("#fallback summary").click();
  await expect(page.locator("#fallback")).toContainText("한 번에 시키는 완성 문장");
  expect(errors).toEqual([]);
});
