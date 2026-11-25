// v3 §5–6: 자료실 files + QR, generated locally and committed (Netlify's build image is not used for Chromium work).
// Requires a fresh `npx vite build` (dist/) and `node scripts/build-slides.mjs` (public/slides/).
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { resolve, join, extname } from "node:path";
import QRCode from "qrcode";
import { zipSync, strToU8 } from "fflate";
import { launch } from "./pw.mjs";

const SITE = "https://teacher-ai-training.netlify.app/";
const OUT = resolve("public/downloads");
mkdirSync(OUT, { recursive: true });

// QR (also used inside the A4 summary)
await QRCode.toFile(resolve("public/qr.png"), SITE, { width: 480, margin: 2, color: { dark: "#14213D", light: "#FFFFFF" } });
const qrData = await QRCode.toDataURL(SITE, { width: 480, margin: 1, color: { dark: "#14213D", light: "#FFFFFF" } });

// SKILL.md template zip (same shape as M6 output) — example text from the lesson plan
const lesson = readFileSync("content/lesson-plan.md", "utf8");
const m = lesson.match(/```markdown\n(---\nname: school-newsletter[\s\S]*?)```/);
if (!m) throw new Error("SKILL.md example not found in lesson plan");
writeFileSync(resolve(OUT, "skill-template.zip"), zipSync({
  "school-newsletter/SKILL.md": strToU8(m[1]),
  "school-newsletter/assets/": new Uint8Array(0),
  "school-newsletter/references/": new Uint8Array(0),
}));

// public fictional samples (English names)
const samples = { "01_공문_가상.pdf": "sample-official-letter.pdf", "02_평가계획서_가상.docx": "sample-assessment-plan.docx", "03_가정통신문_예시1.docx": "sample-newsletter-1.docx", "03_가정통신문_예시2.docx": "sample-newsletter-2.docx" };
for (const [from, to] of Object.entries(samples)) copyFileSync(resolve("fixtures", from), resolve(OUT, to));

// static server: dist/ with SPA fallback; /slides served from public/slides (same as deploy)
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".svg": "image/svg+xml", ".mp4": "video/mp4", ".woff2": "font/woff2", ".json": "application/json" };
const server = createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const base = p.startsWith("/slides") ? resolve("public") : resolve("dist");
  if (p.endsWith("/")) p += "index.html";
  let f = join(base, p);
  if (!f.startsWith(base) || !existsSync(f) || !statSync(f).isFile()) f = join(resolve("dist"), "index.html");
  res.writeHead(200, { "Content-Type": types[extname(f)] ?? "application/octet-stream" }); res.end(readFileSync(f));
}).listen(0);
const B = `http://localhost:${server.address().port}`;
const browser = await launch();

// 1) slides PDF: all 59 sections, one per 1920x1080 page
{
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(`${B}/slides/`);
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: `#bar,#notes,#black{display:none!important} html,body,#app,#wrap{height:auto!important;overflow:visible!important;background:#F7F5EF}
    #scaler{position:static!important;transform:none!important;width:1920px!important;height:auto!important}
    #scaler>section{display:flex!important;position:relative!important;inset:auto!important;page-break-after:always;break-after:page}
    #scaler>section *{animation:none!important;opacity:1!important}
    .fragment{opacity:1!important;visibility:visible!important}
    @page{size:1920px 1080px;margin:0}` });
  await page.evaluate(() => Promise.all([...document.images].map((i) => i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }))));
  await page.evaluate(() => document.querySelectorAll("video").forEach((v) => { const img = new Image(); img.src = v.poster; img.setAttribute("style", v.getAttribute("style") || ""); v.replaceWith(img); }));
  await page.waitForTimeout(500);
  await page.pdf({ path: resolve(OUT, "ai-training-slides.pdf"), width: "1920px", height: "1080px", printBackground: true, preferCSSPageSize: true });
  await page.close();
}

// 2) prompt cards PDF: the /prompts page printed
{
  const page = await browser.newPage({ viewport: { width: 1000, height: 1400 }, bypassCSP: true });
  await page.goto(`${B}/prompts`);
  await page.locator("main h1").waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: `.site-header,.site-nav,.site-footer,.skip,.practice-bar,.copy-box .btn,.pc-filters,[role=group]{display:none!important} body{padding:0!important} .notice.fixed{position:static!important} article,.card{break-inside:avoid}` });
  await page.pdf({ path: resolve(OUT, "ai-training-prompt-cards.pdf"), format: "A4", printBackground: true, margin: { top: "12mm", bottom: "12mm", left: "12mm", right: "12mm" } });
  await page.close();
}

// 3) A4 one-page summary
{
  const five = ["역할", "대상", "과제", "조건", "형식"];
  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><link rel="stylesheet" href="/slides/fonts.css"><style>
  @page{size:A4;margin:14mm} body{font-family:"Noto Sans KR",sans-serif;color:#14213D;margin:0;font-size:12.5pt;line-height:1.5}
  h1{font-size:20pt;margin:0 0 2mm} .sub{color:#4A5568;margin:0 0 6mm} h2{font-size:14pt;margin:6mm 0 2mm;border-left:5px solid #F2A541;padding-left:3mm}
  .flow{display:grid;grid-template-columns:repeat(3,1fr);gap:3mm} .flow div{background:#14213D;color:#fff;border-radius:3mm;padding:3mm 4mm}
  .flow b{display:block;background:#F2A541;color:#14213D;border-radius:2mm;padding:0 2mm;width:max-content;margin-top:1mm;font-size:13pt}
  .five{display:grid;grid-template-columns:repeat(5,1fr);gap:2mm} .five div{border:1.5px solid #14213D;border-radius:2mm;padding:2mm;text-align:center;font-weight:700}
  ul{margin:0;padding-left:5mm} .foot{display:grid;grid-template-columns:1fr 34mm;gap:4mm;align-items:center;margin-top:6mm} .foot img{width:34mm;height:34mm}
  .small{color:#4A5568;font-size:10pt}</style></head><body>
  <h1>교사 AI 활용 연수 — 한 장 요약</h1><p class="sub">AI, 개념에서 실습까지 · 3시간 · 고교 교사 · ChatGPT · PENZ Copilot</p>
  <h2>판단 흐름</h2><div class="flow"><div>답만 필요하면<b>Chat</b></div><div>파일이 필요하면<b>Work</b></div><div>학생이 쓸 도구면<b>Code</b></div></div>
  <p>같은 일을 매주 한다면 → 스킬·맞춤형 GPT로 고정 · 연결은 MCP</p>
  <h2>프롬프트 5요소</h2><div class="five">${five.map((f) => `<div>${f}</div>`).join("")}</div>
  <p class="small">먼저 한 줄 프롬프트(“평가 문제 만들어줘”)로 결과를 본 뒤 5요소 버전과 비교하세요.</p>
  <h2>연수 약속</h2><ul><li><b>개인정보 미입력</b> — 학생 이름·성적·연락처는 넣지 않는다</li><li><b>결과 검증</b> — LLM은 그럴듯하게 틀린다, 검증은 교사 몫</li><li><b>AI 사용 표시</b> — 어디에 어떻게 썼는지 적는다</li></ul>
  <h2>기억할 세 문장</h2><ul><li>LLM은 그럴듯하게 틀린다 — 검증은 교사 몫</li><li>답은 Chat, 파일은 Work, 학생 도구는 Code</li><li>반복되면 스킬·GPT로 고정, 연결은 MCP</li></ul>
  <div class="foot"><div><b>연수 후에도 이 주소 그대로</b><br>${SITE}<br><span class="small">슬라이드 · 실습 워크벤치 · 가이드북 · 자료실. 사후 과제: 2주 뒤 ‘실제로 써본 사례 1개’ 공유</span></div><img src="${qrData}" alt="사이트 QR"></div>
  </body></html>`;
  writeFileSync(resolve("dist/__a4.html"), html);
  const page = await browser.newPage();
  await page.goto(`${B}/__a4.html`);
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: resolve(OUT, "ai-training-a4-summary.pdf"), format: "A4", printBackground: true, preferCSSPageSize: true });
  await page.close();
}
await browser.close(); server.close();
for (const f of ["ai-training-slides.pdf", "ai-training-a4-summary.pdf", "ai-training-prompt-cards.pdf", "skill-template.zip"]) console.log(f, statSync(resolve(OUT, f)).size);
