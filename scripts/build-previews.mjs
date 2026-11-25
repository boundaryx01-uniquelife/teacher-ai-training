// Slide replacement previews (HANDOFF S-7). content/slides is never modified.
import { cpSync, rmSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { resolve, extname, join } from "node:path";
import { launch } from "./pw.mjs";

const ROOT = resolve("."), OUT = resolve("build/slides-with-assets");
rmSync(OUT, { recursive: true, force: true });
cpSync("content/slides", OUT, { recursive: true });
cpSync("assets", resolve(OUT, "assets"), { recursive: true, filter: (s) => !s.includes("/_raw") && !s.endsWith("/fonts") });

const manifest = JSON.parse(readFileSync("assets/manifest.json", "utf8"));
const byId = Object.fromEntries(manifest.assets.map((a) => [a.id, a]));
const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
let replaced = 0, kept = 0;
for (const f of readdirSync(resolve(OUT, "slides"))) {
  const p = resolve(OUT, "slides", f);
  let html = readFileSync(p, "utf8");
  html = html.replace(/<div class="ph" data-asset="([^"]+)"([^>]*)><p>[\s\S]*?<\/p><\/div>/g, (whole, id, rest) => {
    const a = byId[id];
    if (!a || !a.path || a.status === "todo") { kept++; return whole; }
    replaced++;
    const src = "../" + a.path; // assets/... relative to slides/
    const inner = a.kind === "motion" || a.path.endsWith(".mp4")
      ? `<video src="${src}" poster="../assets/VID-01_poster.png" muted loop autoplay playsinline style="width:100%;height:100%;object-fit:contain"></video>`
      : `<img src="${src}" alt="${esc(a.alt_ko)}" style="width:100%;height:100%;object-fit:contain;display:block">`;
    return `<div data-asset="${id}"${rest}>${inner}</div>`;
  });
  writeFileSync(p, html);
}
console.log(`replaced ${replaced}, kept placeholder ${kept}`);

const harness = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<link rel="stylesheet" href="/build/slides-with-assets/deck.css">
<style>
@font-face{font-family:"Noto Sans KR";font-weight:400;src:url("/assets/fonts/NotoSansKR-400.ttf")}
@font-face{font-family:"Noto Sans KR";font-weight:700;src:url("/assets/fonts/NotoSansKR-700.ttf")}
@font-face{font-family:"Noto Sans KR";font-weight:900;src:url("/assets/fonts/NotoSansKR-900.ttf")}
html,body{margin:0}
#stage{width:1920px;height:1080px;overflow:hidden;position:relative}
#stage>section{width:1920px;height:1080px;box-sizing:border-box;position:relative}
#stage aside{display:none}
.card,.step,.fbox{animation:none !important;opacity:1 !important;transform:none !important}
</style></head><body><div id="stage"></div>
<script>
const id = new URLSearchParams(location.search).get("id");
fetch("/build/slides-with-assets/slides/" + id + ".html").then(r => r.text()).then(t => {
  const stage = document.getElementById("stage");
  // base for relative asset URLs inside the slide
  const base = document.createElement("base"); base.href = "/build/slides-with-assets/slides/"; document.head.prepend(base);
  stage.innerHTML = t; window.__loaded = true;
});
</script></body></html>`;
writeFileSync(resolve("build/render.html"), harness);

const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".mp4": "video/mp4", ".ttf": "font/ttf", ".json": "application/json" };
const server = createServer((req, res) => {
  const u = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const p = join(ROOT, u);
  if (!p.startsWith(ROOT)) { res.writeHead(403).end(); return; }
  try { if (!statSync(p).isFile()) throw 0; res.writeHead(200, { "Content-Type": types[extname(p)] ?? "application/octet-stream" }); res.end(readFileSync(p)); }
  catch { res.writeHead(404).end(); }
}).listen(0);
const port = server.address().port;

const deck = JSON.parse(readFileSync("content/slides/deck.json", "utf8"));
mkdirSync("build/previews", { recursive: true });
const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const only = process.argv[2] ? process.argv[2].split(",") : null;
for (const [i, id] of deck.order.entries()) {
  if (only && !only.includes(id)) continue;
  await page.goto(`http://localhost:${port}/build/render.html?id=${id}`);
  await page.waitForFunction(() => window.__loaded);
  await page.evaluate(async () => { for (const w of [400, 700, 900]) await document.fonts.load(`${w} 40px "Noto Sans KR"`, "가A"); await document.fonts.ready; });
  if (!(await page.evaluate(() => document.fonts.check('700 40px "Noto Sans KR"')))) throw new Error("font not ready");
  await page.evaluate(() => Promise.all([...document.images].map((im) => im.complete ? 0 : new Promise((r) => { im.onload = im.onerror = r; }))));
  await page.evaluate(() => Promise.all([...document.querySelectorAll("video")].map((v) => v.readyState >= 2 ? 0 : new Promise((r) => { v.onloadeddata = v.onerror = r; setTimeout(r, 3000); }))));
  // show the finished state (same as the poster) rather than frame 0
  await page.evaluate(() => Promise.all([...document.querySelectorAll("video")].map((v) => { v.pause(); v.currentTime = 14.5; return new Promise((r) => { v.onseeked = r; setTimeout(r, 2000); }); })));
  await page.screenshot({ path: `build/previews/${String(i + 1).padStart(2, "0")}_${id}.png` });
}
await browser.close(); server.close();
console.log("previews done");
