// Usage: node scripts/render-svg.mjs <in.svg> <out.png> <cssWidth> <cssHeight> [--transparent]
// Renders an SVG at deviceScaleFactor 2 with Playwright Chromium (S-9). Background #F7F5EF unless --transparent.
import { launch } from "./pw.mjs";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
const [inp, out, w, h, flag] = process.argv.slice(2);
if (!inp || !out || !w || !h) { console.error("usage: render-svg in.svg out.png w h [--transparent]"); process.exit(1); }
const svg = readFileSync(resolve(inp), "utf8");
const fontDir = resolve("assets/fonts");
const bg = flag === "--transparent" ? "transparent" : "#F7F5EF";
const html = `<!doctype html><html><head><style>
@font-face{font-family:"Noto Sans KR";font-weight:400;src:url("file://${fontDir}/NotoSansKR-400.ttf")}
@font-face{font-family:"Noto Sans KR";font-weight:700;src:url("file://${fontDir}/NotoSansKR-700.ttf")}
@font-face{font-family:"Noto Sans KR";font-weight:900;src:url("file://${fontDir}/NotoSansKR-900.ttf")}
html,body{margin:0;padding:0;background:${bg}}
#box{width:${w}px;height:${h}px;background:${bg}}#box>svg{width:100%;height:100%;display:block}
</style></head><body><div id="box">${svg}</div></body></html>`;
const browser = await launch();
const page = await browser.newPage({ viewport: { width: Number(w) + 20, height: Number(h) + 20 }, deviceScaleFactor: 2 });
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.locator("#box").screenshot({ path: out, omitBackground: flag === "--transparent" });
await browser.close();
console.log(`rendered ${out} (${Number(w) * 2}x${Number(h) * 2})`);
