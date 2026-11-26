// Intro frames → PNG (contact sheet or mp4). Usage:
//   node scripts/render-intro.mjs sheet <outdir> [w h]     key frames for review
//   node scripts/render-intro.mjs mp4 <out.mp4> [w h fps]  full render (ffmpeg)
// Needs the dev server (scripts/dev.sh) on :8888. Uses the same render(t) as the live page via /?cap.
import { chromium } from "playwright";
import { mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
const [mode, out, W = "1920", H = "1080", FPS = "30"] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const p = await b.newPage({ viewport: { width: +W, height: +H }, deviceScaleFactor: 1 });
await p.goto("http://localhost:8888/?cap");
await p.waitForFunction(() => window.__ready === true, null, { timeout: 20000 });
const shot = async (t, file) => { await p.evaluate((t) => window.__seek(t), t); await p.locator(".intro canvas").screenshot({ path: file }); };
if (mode === "sheet") {
  mkdirSync(out, { recursive: true });
  const ts = [0.3, 1.2, 2.1, 2.6, 3.4, 4.4, 4.9, 5.5, 6.3, 7.1, 7.8, 8.4, 9.3, 10.0, 10.7, 11.6, 12.6, 14];
  for (const t of ts) await shot(t, join(out, `f_${String(t.toFixed(1)).padStart(4, "0")}.png`));
} else {
  const dir = out + ".frames"; rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  const n = Math.round(14 * +FPS) + 1;
  for (let i = 0; i < n; i++) await shot(i / +FPS, join(dir, `f${String(i).padStart(4, "0")}.png`));
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", FPS, "-i", join(dir, "f%04d.png"), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "22", "-preset", "slow", "-movflags", "+faststart", out]);
  rmSync(dir, { recursive: true, force: true });
}
await b.close();
