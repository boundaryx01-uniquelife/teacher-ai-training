// Composes assets/IMG-14_logos/*.svg (official files placed by a person) into IMG-14_logos-row.png (3328x180, bg #F7F5EF, equal gaps).
import { launch } from "./pw.mjs";
import { readFileSync, existsSync } from "node:fs";
const ORDER = ["drive", "calendar", "gmail", "canva", "notion", "outlook", "teams", "sharepoint", "github"];
const files = ORDER.map((n) => `assets/IMG-14_logos/${n}.svg`);
const missing = files.filter((f) => !existsSync(f));
if (missing.length) { console.error("missing:", missing.join(", ")); process.exit(1); }
const imgs = files.map((f) => `<img src="data:image/svg+xml;base64,${readFileSync(f).toString("base64")}">`).join("");
const html = `<!doctype html><style>html,body{margin:0}#row{width:1664px;height:90px;background:#F7F5EF;display:flex;align-items:center;justify-content:space-evenly}#row img{height:56px;width:auto;max-width:150px;object-fit:contain}</style><div id="row">${imgs}</div>`;
const b = await launch(); const p = await b.newPage({ viewport: { width: 1664, height: 90 }, deviceScaleFactor: 2 });
await p.setContent(html); await p.locator("#row").screenshot({ path: "assets/IMG-14_logos-row.png" }); await b.close();
console.log("composed IMG-14_logos-row.png");
