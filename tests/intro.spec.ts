import { test, expect } from "@playwright/test";
import { trackConsole } from "./helpers.ts";

test("인트로: 첫 방문 재생 → 건너뛰기 → 시작 카드, 재방문엔 생략", async ({ page }) => {
  const errors = trackConsole(page);
  await page.goto("/");
  await expect(page.locator(".intro")).toBeVisible();
  await expect(page.locator(".intro-skip")).toBeFocused();
  await page.locator(".intro-skip").click();
  await expect(page.locator(".intro")).toHaveCount(0);
  await expect(page.locator(".home-start-card")).toHaveCount(4);
  await page.reload();
  await expect(page.locator(".home-start-card").first()).toBeVisible();
  await expect(page.locator(".intro")).toHaveCount(0);
  await page.goto("/?intro=1");
  await expect(page.locator(".intro")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".intro")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("인트로: 끝까지 재생되면 저절로 닫힘, ?intro=0은 재생 안 함", async ({ page }) => {
  await page.goto("/?intro=0");
  await expect(page.locator(".home-start-card").first()).toBeVisible();
  await expect(page.locator(".intro")).toHaveCount(0);
  await page.goto("/?intro=1");
  await expect(page.locator(".intro")).toBeVisible();
  await expect(page.locator(".intro")).toHaveCount(0, { timeout: 20000 });
});
