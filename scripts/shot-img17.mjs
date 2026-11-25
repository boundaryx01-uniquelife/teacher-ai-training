// IMG-17: /m2?view=phone at 340x600, DPR 2, Q4 answered wrong with hint open (S-9). Needs `scripts/dev.sh` running.
import { launch } from "./pw.mjs";
const BASE = process.env.BASE_URL || "http://localhost:8888";
const browser = await launch();
const page = await browser.newPage({ viewport: { width: 340, height: 600 }, deviceScaleFactor: 2 });
await page.goto(`${BASE}/m2?view=phone`);
await page.evaluate(() => document.fonts.ready);
const answer = async (q, v) => {
  await page.locator(`#m2-card-${q} input[value="${v}"]`).check();
  await page.locator(`#m2-card-${q} button`).click();
  await page.locator(`#m2-card-${q}.is-ok, #m2-card-${q}.is-bad`).waitFor();
};
await answer(1, "3"); await answer(2, "1"); await answer(3, "2"); await answer(4, "1");
await page.locator("#m2-card-4 .m2-hint").waitFor();
await page.locator("#m2-card-4").evaluate((el) => el.scrollIntoView({ block: "center" }));
await page.waitForTimeout(300);
await page.screenshot({ path: "assets/IMG-17_quiz-phone.png" });
await browser.close();
console.log("IMG-17 done");
