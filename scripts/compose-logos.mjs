// Composes assets/IMG-14_logos/*.svg (official files placed by a person) into IMG-14_logos-row.png (3328x180, bg #F7F5EF, equal gaps).
import { launch } from "./pw.mjs";
import { readFileSync, existsSync } from "node:fs";
const ORDER = ["drive", "calendar", "gmail", "canva", "notion", "outlook", "teams", "sharepoint", "github"];
const files = ORDER.map((n) => `assets/IMG-14_logos/${n}.svg`);
// a missing official file is shown as a navy name chip (no guessed/redrawn logos — HANDOFF S-9)
const NAMES = { drive: "Google Drive", calendar: "Google Calendar", gmail: "Gmail", canva: "Canva", notion: "Notion", outlook: "Outlook", teams: "Teams", sharepoint: "SharePoint", github: "GitHub" };
const missing = ORDER.filter((n, i) => !existsSync(files[i]));
const imgs = ORDER.map((n, i) => existsSync(files[i])
  ? `<img alt="${NAMES[n]}" src="data:image/svg+xml;base64,${readFileSync(files[i]).toString("base64")}">`
  : `<span class="chip">${NAMES[n]}</span>`).join("");
const html = `<!doctype html><style>html,body{margin:0}#row{width:1664px;height:90px;background:#F7F5EF;display:flex;align-items:center;justify-content:space-evenly}#row img{height:56px;width:auto;max-width:150px;object-fit:contain}.chip{font:700 20px sans-serif;background:#14213D;color:#fff;border-radius:24px;padding:12px 22px}</style><div id="row">${imgs}</div>`;
const b = await launch(); const p = await b.newPage({ viewport: { width: 1664, height: 90 }, deviceScaleFactor: 2 });
await p.setContent(html); await p.locator("#row").screenshot({ path: "assets/IMG-14_logos-row.png" }); await b.close();
console.log("composed IMG-14_logos-row.png" + (missing.length ? `; name chips for: ${missing.join(", ")}` : ""));
