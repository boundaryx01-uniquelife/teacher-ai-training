import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
const data = JSON.parse(readFileSync("src/content/slides-data.json", "utf8"));
import { trackConsole } from "./helpers";

const ROUTE: Record<string, string> = { M1: "/m1", M2: "/m2", M3: "/m3", M4: "/m4", M5: "/m5", M6: "/m6", M7: "/m7", PROMPTS: "/prompts", COPILOT: "/copilot", FINAL: "/final" };
const practice = Object.entries(data.practice as Record<string, { module: string; label: string }>);

test("슬라이드 실습 버튼 전수: 모듈로 이동 → 같은 슬라이드로 복귀", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "full sweep on desktop; phone checks one link below");
  test.setTimeout(240_000);
  const errors = trackConsole(page);
  for (const [id, p] of practice) {
    const n = data.order.indexOf(id) + 1;
    await page.goto(`/slides/#slide-${n}`);
    await expect(page.locator("#count")).toHaveText(`${n} / ${data.order.length}`);
    const btn = page.locator("#practice");
    await expect(btn).toBeVisible();
    await expect(btn).toContainText(p.label);
    await btn.click();
    await expect(page).toHaveURL(new RegExp(`${ROUTE[p.module]}\\?from=${id}$`));
    const back = page.locator(".practice-back");
    await expect(back).toContainText(`슬라이드 ${n}번으로`);
    await expect(page.locator("#fallback summary")).toContainText("2번 해 봐도 안 되면");
    await expect(page.locator("#extra summary")).toContainText("빨리 끝냈다면");
    await back.click();
    await expect(page.locator("#count")).toHaveText(`${n} / ${data.order.length}`);
  }
  expect(practice.length).toBeGreaterThanOrEqual(24);
  expect(errors).toEqual([]);
});

test("폰: 실습 버튼 → 모듈 → 복귀 1건", async ({ page }) => {
  const n = data.order.indexOf("submit-flow") + 1;
  await page.goto(`/slides/#slide-${n}`);
  await page.locator("#practice").click();
  await expect(page).toHaveURL(/\/m2\?from=submit-flow$/);
  await page.locator(".practice-back").click();
  await expect(page.locator("#count")).toHaveText(`${n} / ${data.order.length}`);
});

test("오프라인: /slides 전체 이동", async ({ page, context }, info) => {
  test.skip(info.project.name !== "desktop", "SW check once");
  await page.goto("/slides/");
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload(); // now controlled by the service worker
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator("#count")).toHaveText(`1 / ${data.order.length}`);
  for (let i = 1; i < data.order.length; i++) {
    await page.locator("#next").click();
    // fragments may need extra clicks; advance until the counter moves
    for (let k = 0; k < 6 && (await page.locator("#count").textContent()) !== `${i + 1} / ${data.order.length}`; k++) await page.locator("#next").click();
    await expect(page.locator("#count")).toHaveText(`${i + 1} / ${data.order.length}`);
  }
  const imgsOk = await page.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src));
  expect(imgsOk).toEqual([]);
  expect(await page.evaluate(() => document.fonts.check('700 40px "Noto Sans KR"'))).toBe(true);
  await context.setOffline(false);
});

test("모든 경로 200", async ({ request }, info) => {
  test.skip(info.project.name !== "desktop", "once");
  for (const p of ["/", "/slides/", "/lab", "/guide", "/trainer", "/m1", "/m2", "/m3", "/m4", "/m5", "/m6", "/m7", "/prompts", "/copilot", "/final", "/qr.png",
    "/downloads/ai-training-slides.pdf", "/downloads/ai-training-a4-summary.pdf", "/downloads/ai-training-prompt-cards.pdf", "/downloads/skill-template.zip",
    "/downloads/sample-official-letter.pdf", "/downloads/sample-assessment-plan.docx", "/downloads/sample-newsletter-1.docx", "/downloads/sample-newsletter-2.docx"]) {
    const r = await request.get(p);
    expect.soft(r.status(), p).toBe(200);
    // a 200 can be the SPA fallback (index.html) — files must come back with their own type
    const type = r.headers()["content-type"] ?? "";
    if (/\.(png|pdf|zip|docx)$/.test(p)) expect.soft(type, p).not.toContain("text/html");
  }
  // every image the slide viewer references must really exist (not the SPA shell)
  const html = await (await request.get("/slides/")).text();
  for (const src of [...html.matchAll(/src="(\/slides\/assets\/[^"]+)"/g)].map((m) => m[1])) {
    const r = await request.get(src);
    expect.soft(r.headers()["content-type"] ?? "", src).not.toContain("text/html");
  }
});
