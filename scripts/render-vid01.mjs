// VID-01: deterministic 15 s animation → 450 PNG frames (30 fps) → H.264 MP4 + poster (S-9).
import { launch } from "./pw.mjs";
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
const out = resolve("build/vid01"); const frames = resolve(out, "frames");
rmSync(frames, { recursive: true, force: true }); mkdirSync(frames, { recursive: true });
const html = readFileSync("scripts/vid01.html", "utf8").replaceAll("FONTDIR", "file://" + resolve("assets/fonts"));
writeFileSync(resolve(out, "index.html"), html);
const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1664, height: 260 }, deviceScaleFactor: 2 });
await page.goto("file://" + resolve(out, "index.html"));
await page.evaluate(() => document.fonts.ready);
const ok = await page.evaluate(() => document.fonts.check('16px NK'));
if (!ok) throw new Error("font not loaded");
const FPS = 30, N = 450;
for (let i = 0; i < N; i++) {
  await page.evaluate((t) => window.render(t), i / FPS);
  await page.locator("#stage").screenshot({ path: resolve(frames, String(i).padStart(4, "0") + ".png") });
}
await page.evaluate(() => window.render(14.5));
await page.locator("#stage").screenshot({ path: resolve("assets/VID-01_poster.png") });
await browser.close();
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", "30", "-i", resolve(frames, "%04d.png"), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", resolve("assets/VID-01_submit-flow.mp4")]);
console.log("VID-01 done");
