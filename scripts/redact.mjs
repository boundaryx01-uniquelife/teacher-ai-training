// Blur rectangles in a capture before use (private names, chat titles). Usage: node scripts/redact.mjs in.png out.png x,y,w,h [x,y,w,h ...]
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { resolve } from "node:path";
import { tmpdir } from "node:os";
import { launch } from "./pw.mjs";
const [inp, out, ...rects] = process.argv.slice(2);
const src = "data:image/png;base64," + readFileSync(inp).toString("base64");
const html = `<!doctype html><canvas id="c"></canvas><script>const i=new Image();i.onload=()=>{const c=document.getElementById('c');c.width=i.width;c.height=i.height;const x=c.getContext('2d');x.drawImage(i,0,0);
for(const [rx,ry,rw,rh] of ${JSON.stringify(rects.map((r) => r.split(",").map(Number)))}){x.save();x.beginPath();x.rect(rx,ry,rw,rh);x.clip();x.filter='blur(9px)';x.drawImage(i,0,0);x.filter='none';x.fillStyle='rgba(60,60,60,.35)';x.fillRect(rx,ry,rw,rh);x.restore();}
window.__d=c.toDataURL('image/png')};i.src=${JSON.stringify(src)};</script>`;
const tmp = resolve(mkdtempSync(resolve(tmpdir(), "rd-")), "p.html"); writeFileSync(tmp, html);
const b = await launch(); const p = await b.newPage(); await p.goto("file://" + tmp); await p.waitForFunction(() => window.__d);
writeFileSync(out, Buffer.from((await p.evaluate(() => window.__d)).split(",")[1], "base64")); await b.close(); console.log("redacted", out);
