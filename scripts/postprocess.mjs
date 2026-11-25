// Capture post-processing (HANDOFF S-9). Person drops originals in assets/_raw/ named like the manifest file
// (any of .png .jpg .jpeg .webp for images; .mp4 .mov .webm for video). Optional highlight boxes:
// assets/_raw/<basename>.json = [{x,y,w,h}] in ORIGINAL image pixels → orange 3px (css) boxes.
// Output: assets/<file> at size_px×2, contain + paper margin + 32px (2x) rounded corners. Video: contain + letterbox.
import { readFileSync, existsSync, writeFileSync, mkdtempSync } from "node:fs";
import { resolve, parse } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { launch } from "./pw.mjs";

const PAPER = "#F7F5EF", ORANGE = "#F2A541";
const m = JSON.parse(readFileSync("assets/manifest.json", "utf8"));
const only = process.argv[2]?.split(",");
const items = m.assets.filter((a) => a.producer === "capture" && (!only || only.includes(a.id)));
const find = (base, exts) => exts.map((e) => `assets/_raw/${base}${e}`).find(existsSync);
let browser, done = [], missing = [];
for (const a of items) {
  const base = parse(a.file).name;
  const [W, H] = a.size_px.map((n) => n * 2);
  if (a.file.endsWith(".mp4")) {
    const src = find(base, [".mp4", ".mov", ".webm"]);
    if (!src) { missing.push(a.id); continue; }
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", src, "-vf",
      `scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=0xF7F5EF,format=yuv420p`,
      "-c:v", "libx264", "-movflags", "+faststart", "-an", `assets/${a.file}`]);
    done.push(a.id); continue;
  }
  const src = find(base, [".png", ".jpg", ".jpeg", ".webp"]);
  if (!src) { missing.push(a.id); continue; }
  const boxesPath = `assets/_raw/${base}.json`;
  const boxes = existsSync(boxesPath) ? JSON.parse(readFileSync(boxesPath, "utf8")) : [];
  browser ??= await launch();
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const html = `<!doctype html><style>html,body{margin:0;background:${PAPER}}#c{display:block}</style><canvas id="c" width="${W}" height="${H}"></canvas>
<script>
const img = new Image(); img.src = "file://${resolve(src)}";
img.onload = () => {
  const c = document.getElementById("c"), x = c.getContext("2d");
  x.fillStyle = "${PAPER}"; x.fillRect(0, 0, ${W}, ${H});
  const pad = 0, s = Math.min((${W} - pad * 2) / img.width, (${H} - pad * 2) / img.height);
  const w = img.width * s, h = img.height * s, ox = (${W} - w) / 2, oy = (${H} - h) / 2;
  x.save(); x.beginPath(); x.roundRect(ox, oy, w, h, 32); x.clip(); x.drawImage(img, ox, oy, w, h); x.restore();
  x.strokeStyle = "${ORANGE}"; x.lineWidth = 6;
  for (const b of ${JSON.stringify(boxes)}) { x.beginPath(); x.roundRect(ox + b.x * s, oy + b.y * s, b.w * s, b.h * s, 8); x.stroke(); }
  window.__done = true;
};
img.onerror = () => { window.__err = true; };
</script>`;
  const tmp = resolve(mkdtempSync(resolve(tmpdir(), "pp-")), "p.html"); writeFileSync(tmp, html);
  await page.goto("file://" + tmp);
  await page.waitForFunction(() => window.__done || window.__err);
  if (await page.evaluate(() => window.__err)) { console.error(`${a.id}: cannot read ${src}`); await page.close(); continue; }
  await page.locator("#c").screenshot({ path: `assets/${a.file}` });
  await page.close(); done.push(a.id);
}
await browser?.close();
console.log(`processed: ${done.join(" ") || "-"}\nno raw file yet: ${missing.join(" ") || "-"}`);
