import { test, expect } from "@playwright/test";
import { pin } from "./helpers";
test("30건 동시 제출 → 집계 합계 일치", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "API test runs once");
  await page.goto("/m3");
  const login = await page.request.post("/api/auth", { data: { pin: pin() } });
  expect(login.ok()).toBeTruthy();
  const { sessionCode } = await (await page.request.post("/api/sessions")).json();
  const sends = Array.from({ length: 30 }, (_, i) => page.request.post("/api/submit", { data: { sessionCode, question: (i % 5) + 1, answer: String((i % 4) + 1) } }));
  const res = await Promise.all(sends);
  expect(res.every((r) => r.ok())).toBeTruthy();
  const stats = await (await page.request.get(`/api/stats?sessionCode=${sessionCode}`)).json();
  expect(stats.total).toBe(30);
  expect(stats.perQuestion.reduce((s: number, p: any) => s + p.total, 0)).toBe(30);
  const del = await (await page.request.post("/api/reset", { data: { sessionCode, confirm: sessionCode } })).json();
  expect(del.deleted).toBe(30);
});
