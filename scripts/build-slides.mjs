// v3 §3: builds /slides from the provided viewer (site-slides/slides.html is never modified).
// - data-asset placeholders → <img>/<video> for manifest items that are done/fallback (same rule as S-7)
// - adds a single "홈" link at the left of the viewer bar, a page-specific CSP <meta>, local subset fonts,
//   and a service worker (scope /slides/) that precaches the page, fonts and images for offline use.
import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { resolve, basename } from "node:path";

const OUT = resolve("public/slides");
rmSync(OUT, { recursive: true, force: true });
mkdirSync(resolve(OUT, "assets"), { recursive: true });
mkdirSync(resolve(OUT, "fonts"), { recursive: true });

let html = readFileSync("site-slides/slides.html", "utf8");
const manifest = JSON.parse(readFileSync("assets/manifest.json", "utf8"));
const byId = Object.fromEntries(manifest.assets.map((a) => [a.id, a]));

// ---- Content edits (user decisions 2026-11-26) -------------------------------------------------------------
// 1) The PENZ (교육청) teacher account has no Teach menu → Teach slides/rows are removed.
// 2) Skill: explained as a concept only; the with/without-skill comparison picture (IMG-15b) is dropped.
// site-slides/slides.html itself stays untouched; to restore anything, edit this block and rebuild.
const REMOVE_SLIDES = ["cp-teach-menu", "cp-teach-lesson", "cp-teach-modify", "cp-lz", "cp-lz-limits", "cp-notebooks-ex"]; // + Notebooks example (Copilot kept short) // Teach and Learning Zone: not available on the PENZ teacher account
for (const id of REMOVE_SLIDES) {
  const re = new RegExp(`<section id="${id}"[\\s\\S]*?</section>\\n?`);
  if (!re.test(html)) throw new Error("slide not found: " + id);
  html = html.replace(re, "");
}
const edit = (from, to) => { if (!html.includes(from)) throw new Error("slide text not found: " + from); html = html.replace(from, to); };
edit('<tr><td><b>Teach</b></td><td>수업·단원 계획, 수준 조절, 퀴즈·루브릭</td><td>교사</td></tr>\n', "");
edit("PENZ 계정으로 무료(Chat·Teach·Notebooks)", "PENZ 계정으로 무료(Chat·Notebooks)");
edit("Teams·OneNote·Forms·과제 연결, 교사용 Teach", "Teams·OneNote·Forms·과제 연결");
{ // cp-notebooks: short comparison with Google NotebookLM (user decision 2026-11-26)
  const re = /(<section id="cp-notebooks">)[\s\S]*?(<div class="ph" data-asset="IMG-25")/;
  if (!re.test(html)) throw new Error("cp-notebooks not found");
  html = html.replace(re, (_, open, ph) => `${open}
<p class="eyebrow">부록 · ② 전자 필기장(Copilot Notebooks)</p>
<h2>NotebookLM과 비슷한 ‘내 자료 지식방’</h2>
<div class="row" style="gap:40px">
<table class="sm" style="flex:1">
<tr><th></th><th>전자 필기장(Notebooks)</th><th>Google NotebookLM</th></tr>
<tr><td><b>하는 일</b></td><td>내 자료 안에서만 답, 학습 가이드(요약·플래시카드·퀴즈)</td><td>올린 자료 안에서만 답</td></tr>
<tr><td><b>계정</b></td><td>PENZ 학교 계정(무료, 데이터 보호)</td><td>개인 구글 계정</td></tr>
<tr><td><b>찾는 곳</b></td><td>Copilot 사이드바 ‘전자 필기장’</td><td>NotebookLM 웹</td></tr>
</table>
${ph}`);
}
edit('<tr><td><b>Learning Zone</b></td><td>인터랙티브 레슨 생성·과제 연결</td><td>교사</td></tr>\n', "");
edit("<li>Teach · Notebooks · Study and Learn 허용</li>", "<li>Notebooks · Study and Learn 허용</li>");
edit("<li>10분: Teach로 같은 단원 퀴즈 → 3교시 ChatGPT 결과와 비교</li>", "<li>10분: Copilot Chat으로 같은 단원 퀴즈 문항 → 3교시 ChatGPT 결과와 비교</li>");
{ // cp-teacher: the four "do tomorrow" items without Teach (wording from the lesson plan's Chat / Notebooks / 학생 활용 tables)
  const m = html.match(/<div class="col">\n(<div class="mini"><div class="num">1<\/div><p><b>단원 계획[\s\S]*?)<\/div>\n<div class="ph" data-asset="IMG-19"/);
  if (!m) throw new Error("cp-teacher list not found");
  const minis = [
    ["공문 요약", "PDF 공문 → “담임이 할 일·기한만 표로”"],
    ["수업 삽화", "“열대우림 단면도를 교과서 삽화 느낌으로, 글자 없이”"],
    ["Notebooks", "교육과정·교재를 모아 “이 자료 안에서만 답해”"],
    ["학습 메뉴", "개념이 막힐 때 답 대신 힌트·질문으로 이해"],
  ].map(([b, t], i) => `<div class="mini"><div class="num">${i + 1}</div><p><b>${b}</b> ${t}</p></div>`).join("\n");
  html = html.replace(m[1], minis + "\n");
  edit('title="Teach에서 수업 계획· 퀴즈 만드는 화면"', 'title="Copilot 학습 메뉴 화면"');
  edit("<p>[IMG-19]<br>Teach에서 수업 계획·<br>퀴즈 만드는 화면</p>", "<p>[IMG-19]<br>Copilot 학습 메뉴 화면</p>");
}
html = html.replace(/<div class="ph" data-asset="IMG-15b"[^>]*><p>[\s\S]*?<\/p><\/div>\n?/, ""); // skill comparison picture dropped
html = html.replace(/<div class="ph" data-asset="IMG-20"[^>]*><p>[\s\S]*?<\/p><\/div>\n?/, ""); // student Notebooks capture dropped

// filtered slide data: used by the viewer's inline DATA, the site (src/lib/slides.ts, /trainer) and the tests
const raw = JSON.parse(readFileSync("site-slides/slides-data.json", "utf8"));
const gone = new Set(REMOVE_SLIDES);
const keep = (o) => Object.fromEntries(Object.entries(o).filter(([k]) => !gone.has(k)));
const data = { ...raw, order: raw.order.filter((id) => !gone.has(id)), titles: keep(raw.titles), notes: keep(raw.notes), practice: keep(raw.practice), timers: keep(raw.timers) };
for (const sec of data.sections) if (gone.has(sec.start)) throw new Error("removed slide is a section start: " + sec.start);
mkdirSync("src/content", { recursive: true });
writeFileSync("src/content/slides-data.json", JSON.stringify(data, null, 1) + "\n");
{
  const re = /const DATA = (\{.*\});\n/;
  const m = html.match(re);
  if (!m) throw new Error("viewer DATA not found");
  const viewer = JSON.parse(m[1]);
  const v = { ...viewer, order: data.order, titles: data.titles, notes: data.notes, practice: data.practice, timers: data.timers };
  html = html.replace(re, () => `const DATA = ${JSON.stringify(v)};\n`);
}
const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const precache = new Set(["/slides/", "/slides/fonts.css"]);
let replaced = 0, kept = 0;
html = html.replace(/<div class="ph" data-asset="([^"]+)"([^>]*)><p>[\s\S]*?<\/p><\/div>/g, (whole, id, rest) => {
  const a = byId[id];
  if (!a || !a.path || a.status === "todo" || !existsSync(a.path)) { kept++; return whole; }
  const file = basename(a.path);
  copyFileSync(a.path, resolve(OUT, "assets", file));
  const src = `/slides/assets/${file}`;
  precache.add(src);
  replaced++;
  if (file.endsWith(".mp4")) {
    const poster = `${id}_poster.png`; // each video has its own poster (assets/<ID>_poster.png)
    if (existsSync(`assets/${poster}`)) { copyFileSync(`assets/${poster}`, resolve(OUT, "assets", poster)); precache.add(`/slides/assets/${poster}`); }
    return `<div data-asset="${id}"${rest}><video src="${src}" poster="/slides/assets/${poster}" muted loop autoplay playsinline aria-label="${esc(a.alt_ko)}" style="width:100%;height:100%;object-fit:contain"></video></div>`;
  }
  return `<div data-asset="${id}"${rest}><img src="${src}" alt="${esc(a.alt_ko)}" style="width:100%;height:100%;object-fit:contain;display:block"></div>`;
});

// Content correction (user decision (나), 2026-11-25): in the real ChatGPT the calendar write ran without an approval card.
const FIXES = [
  ["<p>쓰기 동작이라 <b>사람 승인</b></p>", "<p>쓰기 동작 — <b>설정에 따라</b> 승인을 묻거나 바로 실행</p>"],
  // user decision 2026-11-25: match the fixture (04_현장체험계획서_가상: 08:30 vs 08:00) and the real Work capture
  ["8:30? 8:50?", "8:30? 8:00?"],
  // reviewer pass 2026-11-26: same wording everywhere (approval depends on settings), typo
  ["<td>질문에 답하기, 방향 수정, 중요한 동작 승인</td>", "<td>질문에 답하기, 방향 수정, 저장·발송 범위 정하기(“초안만”)</td>"],
  ["<p><b>승인</b> “드라이브에 저장할까요?”</p>", "<p><b>저장 전 확인</b> 설정에 따라 묻거나 바로 저장</p>"],
  ["“결업식 통신문 써 줘”", "“종업식 통신문 써 줘”"],
  // trainer review: after picking a 교시 the select kept focus, so → jumped a whole 교시
  ["sel.onchange=()=>show(+sel.value);", "sel.onchange=()=>{show(+sel.value);sel.blur()};"],
];
for (const [from, to] of FIXES) { if (html.includes(from)) html = html.replace(from, to); else console.warn("slide text not found:", from); }

// Fonts: subset Noto Sans KR to the characters used in the deck (keeps offline cache small).
const text = html.replace(/<[^>]+>/g, " ") + " ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,:;!?'\"()[]{}<>/\\|-_=+*&^%$#@~`·…→←↑↓▶◀⏱①②③④⑤“”‘’";
const chars = [...new Set(text)].join("");
writeFileSync("build/slides-chars.txt", chars);
const faces = [];
for (const w of [400, 700, 900]) {
  const out = resolve(OUT, "fonts", `noto-sans-kr-${w}.woff2`);
  execFileSync("python3", ["-I", "-m", "fontTools.subset", `assets/fonts/NotoSansKR-${w}.ttf`, `--text-file=build/slides-chars.txt`, "--flavor=woff2", `--output-file=${out}`, "--layout-features=*"]);
  faces.push(`@font-face{font-family:"Noto Sans KR";font-weight:${w};font-style:normal;font-display:swap;src:url("/slides/fonts/noto-sans-kr-${w}.woff2") format("woff2")}`);
  precache.add(`/slides/fonts/noto-sans-kr-${w}.woff2`);
}
writeFileSync(resolve(OUT, "fonts.css"), faces.join("\n") + "\n");

const CSP = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; media-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'";
const head = `<meta http-equiv="Content-Security-Policy" content="${CSP}"><meta name="referrer" content="no-referrer"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/slides/fonts.css"><style>#scaler section{word-break:keep-all;overflow-wrap:anywhere}#scaler section :is(p,h1,h2,h3,li,td){text-wrap:pretty}#bar button,#bar select,#bar a,#bar input{min-height:44px;min-width:44px}#bar a{display:inline-flex;align-items:center;justify-content:center}#app:has(#black.on) :is(#bar,#notes){visibility:hidden}@media (max-width:700px) and (orientation:portrait){#bar::after{content:"📱 폰을 가로로 돌리면 슬라이드가 더 크게 보여요";flex-basis:100%;text-align:center;font-size:14px;color:#F2A541}}</style>`;
if (!html.includes('<meta name="viewport" content="width=device-width,initial-scale=1">')) throw new Error("viewport meta not found");
html = html.replace('<meta name="viewport" content="width=device-width,initial-scale=1">', (m) => m + head);
const barOpen = '<div id="bar" role="toolbar" aria-label="슬라이드 조작">';
if (!html.includes(barOpen)) throw new Error("viewer bar not found");
html = html.replace(barOpen, barOpen + '\n  <a id="home" href="/" title="사이트 홈">홈</a>');
html = html.replace("</body>", `<script>if("serviceWorker" in navigator){navigator.serviceWorker.register("/slides/sw.js",{scope:"/slides/"}).catch(function(){})}</script>\n</body>`);
writeFileSync(resolve(OUT, "index.html"), html);

const hv = createHash("sha256").update(html).update(faces.join());
for (const u of precache) { const f = resolve("public" + u.replace(/\/$/, "/index.html")); if (existsSync(f)) hv.update(readFileSync(f)); }
const version = hv.digest("hex").slice(0, 12); // changes whenever any precached file changes
const sw = `// generated by scripts/build-slides.mjs — offline cache for /slides only (never /api)
const CACHE = "slides-${version}";
const PRECACHE = ${JSON.stringify([...precache], null, 0)};
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("slides-") && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin || !u.pathname.startsWith("/slides")) return;
  const key = u.pathname === "/slides" || u.pathname === "/slides/index.html" ? "/slides/" : u.pathname;
  if (key === "/slides/") {
    // network first for the page (fresh deck when online), cache fallback offline
    // non-OK answers (e.g. a CDN 403/5xx) fall back to the cached deck as well
    e.respondWith(fetch(e.request).then((r) => {
      if (r.ok) { const c = r.clone(); caches.open(CACHE).then((x) => x.put("/slides/", c)); return r; }
      return caches.match("/slides/").then((hit) => hit || r);
    }).catch(() => caches.match("/slides/")));
    return;
  }
  e.respondWith(caches.match(key).then((hit) => hit || fetch(e.request)));
});
`;
writeFileSync(resolve(OUT, "sw.js"), sw);
console.log(`slides: replaced ${replaced}, placeholders kept ${kept}, precache ${precache.size} files, cache ${version}`);
