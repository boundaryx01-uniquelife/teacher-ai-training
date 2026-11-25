// Combine several capture cuts into one raw image for scripts/postprocess.mjs (2컷·3컷 합성).
// Usage: node scripts/compose-cuts.mjs <out.png> <targetW> <targetH> <cut>[ <cut>...]
//   cut = path[@x,y,w,h]  (optional crop in source pixels). Cuts are laid out in one row with equal gaps on paper bg,
//   each scaled to the same height, then the row is fitted into targetW×targetH (2× pixels) by postprocess.
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { resolve } from "node:path";
import { tmpdir } from "node:os";
import { launch } from "./pw.mjs";
const args = process.argv.slice(2);
const COL = args[0] === "--col"; if (COL) args.shift(); // --col: stack cuts vertically (same width)
const [out, tw, th, ...cuts] = args;
const parsed = cuts.map((c) => { const [p, crop] = c.split("@"); return { src: "data:image/png;base64," + readFileSync(p).toString("base64"), crop: crop ? crop.split(",").map(Number) : null }; });
const html = `<!doctype html><body style="margin:0;background:#F7F5EF"><canvas id="c"></canvas><script>
const cuts=${JSON.stringify(parsed)};const COL=${COL};const TW=${Number(tw) * 2},TH=${Number(th) * 2},GAP=24;
Promise.all(cuts.map(c=>new Promise(r=>{const i=new Image();i.onload=()=>r({i,c});i.src=c.src}))).then(list=>{
  const dims=list.map(({i,c})=>c.crop?[c.crop[2],c.crop[3]]:[i.width,i.height]);
  const cv=document.getElementById('c');const x=cv.getContext('2d');
  if(COL){const W=Math.max(...dims.map(d=>d[0]));const hs=dims.map(d=>d[1]*W/d[0]);const H=hs.reduce((a,b)=>a+b,0)+GAP*(list.length+1);
    cv.width=W+GAP*2;cv.height=H;x.fillStyle='#F7F5EF';x.fillRect(0,0,cv.width,H);let oy=GAP;
    list.forEach(({i,c},k)=>{const [sx,sy,sw,sh]=c.crop||[0,0,i.width,i.height];x.save();x.beginPath();x.roundRect(GAP,oy,W,hs[k],16);x.clip();x.drawImage(i,sx,sy,sw,sh,GAP,oy,W,hs[k]);x.restore();oy+=hs[k]+GAP});}
  else{const H=Math.max(...dims.map(d=>d[1]));const ws=dims.map(d=>d[0]*H/d[1]);
    const W=ws.reduce((a,b)=>a+b,0)+GAP*(list.length+1);cv.width=W;cv.height=H+GAP*2;
    x.fillStyle='#F7F5EF';x.fillRect(0,0,W,H+GAP*2);let ox=GAP;
    list.forEach(({i,c},k)=>{const [sx,sy,sw,sh]=c.crop||[0,0,i.width,i.height];x.save();x.beginPath();x.roundRect(ox,GAP,ws[k],H,16);x.clip();x.drawImage(i,sx,sy,sw,sh,ox,GAP,ws[k],H);x.restore();ox+=ws[k]+GAP});}
  window.__done=true});</script>`;
const tmp = resolve(mkdtempSync(resolve(tmpdir(), "cc-")), "p.html"); writeFileSync(tmp, html);
const b = await launch(); const p = await b.newPage({ viewport: { width: 1200, height: 800 } });
await p.goto("file://" + tmp); await p.waitForFunction(() => window.__done);
const data = await p.evaluate(() => document.getElementById("c").toDataURL("image/png"));
writeFileSync(out, Buffer.from(data.split(",")[1], "base64")); await b.close();
console.log("composed", out);
