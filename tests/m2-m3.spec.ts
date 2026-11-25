import { test, expect } from "@playwright/test";
import { pin, trackConsole } from "./helpers";

// answers used: Q1 wrong, Q2 right, Q3 right, Q4 wrong, Q5 right
const PLAN: [number, string, boolean][] = [[1, "2", false], [2, "1", true], [3, "2", true], [4, "1", false], [5, "4", true]];

test("M2 5문항 → 패널 4종 → M3 오답률 → 초기화", async ({ page, isMobile }) => {
  const errors = trackConsole(page);
  // trainer login + new session via the M3 UI
  await page.goto("/m3");
  await page.getByLabel("PIN (6자리 이상)").fill(pin());
  await page.getByRole("button", { name: "들어가기" }).click();
  await page.getByRole("button", { name: "새 회차 만들기" }).click();
  await expect(page.locator(".m3-code")).toHaveText(/^[A-Z2-9]{6}$/);
  const code = (await page.locator(".m3-code").textContent())!.trim();

  // participant solves M2 with the code
  await page.goto("/m2");
  await page.getByLabel(/회차 코드/).fill(code);
  for (const [q, a, ok] of PLAN) {
    const card = page.locator(`#m2-card-${q}`);
    await card.locator(`input[value="${a}"]`).check();
    const [res] = await Promise.all([
      page.waitForResponse((r) => r.url().endsWith("/api/submit")),
      card.getByRole("button", { name: "제출" }).click(),
    ]);
    const body = await res.json();
    expect(Object.keys(body).sort()).toEqual(["correct", "hint", "mode", "row", "trace"]);
    expect(body.correct).toBe(ok);
    await expect(card).toHaveClass(ok ? /is-ok/ : /is-bad/);
    if (!isMobile || q === 5) {
      // ① request ② grade ③ DB row ④ response
      const panels = page.locator(".m2-panel");
      await expect(panels.nth(0)).toContainText(`"sessionCode": "${code}"`);
      await expect(panels.nth(0)).toContainText(`"question": ${q}`);
      await expect(panels.nth(1)).toContainText("■■■");
      await expect(panels.nth(1)).toContainText(ok ? "정답" : "오답");
      await expect(panels.nth(2).locator("tbody tr")).toContainText(code);
      await expect(panels.nth(3)).toContainText(`"correct": ${ok}`);
    }
  }
  await expect(page.locator(".m2-explain table tbody tr")).toHaveCount(5);
  if (isMobile) for (const p of await page.locator(".m2-panel").all()) await expect(p).toHaveAttribute("open", "");

  // dashboard reflects wrong rates
  await page.goto("/m3");
  await page.locator("#m3-session").selectOption(code);
  await expect(page.locator(".m3-stats h2").first()).toContainText("제출 5건");
  await expect(page.locator(".m3-bar").nth(0)).toContainText("오답률 100% (1/1)");
  await expect(page.locator(".m3-bar").nth(1)).toContainText("오답률 0% (0/1)");
  await expect(page.locator(".m3-bar").nth(3)).toContainText("오답률 100% (1/1)");

  // reset this session only
  await page.getByLabel("회차 코드 확인").fill(code);
  await page.getByRole("button", { name: "이 회차 기록 삭제" }).click();
  await expect(page.locator(".m3-reset")).toContainText("5건을 삭제했어요");
  await expect(page.locator(".m3-stats h2").first()).toContainText("제출 0건");
  expect(errors).toEqual([]);
});

test("연습 모드: 저장 안 함, 없는 코드는 400", async ({ page, request }) => {
  const r1 = await request.post("/api/submit", { data: { question: 1, answer: "3" } });
  expect((await r1.json()).row).toBeNull();
  const r2 = await request.post("/api/submit", { data: { sessionCode: "ZZZZZZ", question: 1, answer: "3" } });
  expect(r2.status()).toBe(400);
  const r3 = await request.post("/api/submit", { data: { question: 1, answer: "3", name: "x" } });
  expect(r3.status()).toBe(400);
  const r4 = await request.post("/api/submit", { data: { question: 1, answer: "3" }, headers: { origin: "https://evil.example" } });
  expect(r4.status()).toBe(403);
  for (const p of ["/api/stats?sessionCode=ABCDEF", "/api/sessions"]) expect((await request.get(p)).status()).toBe(401);
  expect((await request.post("/api/reset", { data: {} })).status()).toBe(401);
});
