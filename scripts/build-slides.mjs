// v3 §3: builds /slides from the provided viewer (site-slides/slides.html is never modified).
// - data-asset placeholders → <img>/<video> for manifest items that are done/fallback (same rule as S-7)
// - adds a single "홈" link at the left of the viewer bar, a page-specific CSP <meta>, local subset fonts,
//   and a service worker (scope /slides/) that precaches the page, fonts and images for offline use.
import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { resolve, basename } from "node:path";
import { REPLACE, INSERT, EXTRA_CSS, EXTRA_CSS2, EXTRA_CSS3, EXTRA_CSS4 } from "./slides-extra.mjs";

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
// bigger screenshots (trainer: "삽입된 이미지는 너무 작아서 가시성이 없다") — the fit step rebalances the slide afterwards
for (const [id, k] of Object.entries({ "IMG-06": 1.45, "VID-02": 1.3, "IMG-07": 1.35, "VID-03": 1.45, "IMG-08": 1.45, "IMG-10": 1.3, "IMG-11": 1.5, "IMG-12": 1.3, "IMG-21": 1.4, "IMG-19": 1.3, "IMG-25": 1.3, "IMG-18": 1.0 })) {
  const re = new RegExp(`(data-asset="${id}"[^>]*style="width:)(\\d+)px;height:(\\d+)px;`);
  if (!re.test(html)) { console.warn("asset box not found:", id); continue; }
  html = html.replace(re, (_m, pre, w, h) => `${pre}${Math.round(w * k)}px;height:${Math.round(h * k)}px;`);
}
// beginner rewrite: replace whole slides and insert new ones (scripts/slides-extra.mjs)
for (const [id, sec] of Object.entries(REPLACE)) {
  const re = new RegExp(`<section id="${id}"[\\s\\S]*?</section>`);
  if (!re.test(html)) throw new Error("slide to replace not found: " + id);
  html = html.replace(re, () => sec);
}
for (let pending = [...INSERT], guard = 0; pending.length; ) { // an insert may anchor to another inserted slide → retry until all placed
  const next = [];
  for (const x of pending) {
    let at;
    if (x.after) { const m = html.match(new RegExp(`<section id="${x.after}"[\\s\\S]*?</section>`)); at = m ? m.index + m[0].length : -1; if (at >= 0) { html = html.slice(0, at) + "\n" + x.html + html.slice(at); continue; } }
    else { at = html.indexOf(`<section id="${x.before}"`); if (at >= 0) { html = html.slice(0, at) + x.html + "\n" + html.slice(at); continue; } }
    next.push(x);
  }
  if (next.length === pending.length || ++guard > 10) throw new Error("insert anchor not found: " + next.map((x) => x.before).join(","));
  pending = next;
}

// filtered slide data: used by the viewer's inline DATA, the site (src/lib/slides.ts, /trainer) and the tests
const raw = JSON.parse(readFileSync("site-slides/slides-data.json", "utf8"));
const gone = new Set(REMOVE_SLIDES);
const keep = (o) => Object.fromEntries(Object.entries(o).filter(([k]) => !gone.has(k)));
// trainer notes: fill empty ones from scripts/trainer-notes.json (existing notes are kept); demo slide gets a fallback line
const extraNotes = JSON.parse(readFileSync("scripts/trainer-notes.json", "utf8"));
const notes = keep(raw.notes);
for (const [id, t] of Object.entries(extraNotes)) { if (!raw.order.includes(id) && !INSERT.some((x) => x.id === id)) throw new Error("unknown slide in trainer-notes: " + id); if (!gone.has(id) && !notes[id]) notes[id] = t; }
notes["demo3"] = (notes["demo3"] || "") + " 시연이 안 되면(로그인·인터넷): 슬라이드의 캡처 화면과 /prompts 카드로 말로 시연하고 넘어간다.";
// 2교시 짝짓기: 강의안(25분)에 맞춰 타이머 25분 (user decision 2026-11-26: 시간은 넉넉하게)
const timers = { ...keep(raw.timers), match: 25 };
const order = raw.order.filter((id) => !gone.has(id));
for (let pending = [...INSERT]; pending.length; ) { const next = []; for (const x of pending) { const k = order.indexOf(x.after ?? x.before); if (k < 0) next.push(x); else order.splice(x.after ? k + 1 : k, 0, x.id); } if (next.length === pending.length) throw new Error("order anchor missing"); pending = next; }
const titles = { ...keep(raw.titles), ...Object.fromEntries(INSERT.map((x) => [x.id, x.title])) };
titles["neis-api"] = "부경고 급식을 API로 받아 보자"; titles["build-choice"] = "만들고 싶은 것에 따라 필요한 부분이 다르다"; titles["terms1"] = "웹서비스는 네 부분으로 나뉜다";
const data = { ...raw, order, titles, notes, practice: { ...keep(raw.practice), match2: raw.practice.match, "vibe-what": { module: "VIBE", label: "바이브 코딩 체험" }, "ref-what": { module: "REF", label: "레퍼런스로 만들기" }, "gemini-map": { module: "GEMINI", label: "Gemini 가이드" }, "gemini-steps": { module: "GEMINI", label: "Gemini 가이드" } }, timers: { ...timers, "vibe-what": 12, "ref-what": 15 } };
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
  if (!a || !a.path || a.status === "todo" || !existsSync(a.path)) { kept++; return ""; } // capture not delivered yet: show no dashed placeholder box (the slide reflows to full width)
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
  ["description: ○○고 가정통신문을", "description: 한빛고 가정통신문을"],
  ["FINAL:'/final'}", "FINAL:'/final',VIBE:'/vibe',GEMINI:'/gemini',REF:'/ref'}"],
  ["[연수 일자] · [강사명] · [학교·기관명]", "2026. 11. 27. · 동래발명교육센터 박재현 · 부경고등학교 교사 대상 연수"],
  // trainer review: after picking a 교시 the select kept focus, so → jumped a whole 교시
  ["sel.onchange=()=>show(+sel.value);", "sel.onchange=()=>{show(+sel.value);sel.blur()};"],
];
for (const [from, to] of FIXES) { if (html.includes(from)) html = html.replace(from, to); else console.warn("slide text not found:", from); }
// beginner plain-language pass (reviewed 2026-11-26): replace only inside the named slide
for (const f of JSON.parse(readFileSync("scripts/jargon-fixes.json", "utf8"))) {
  const re = new RegExp(`<section id="${f.slide}"[\\s\\S]*?</section>`);
  const m = html.match(re);
  if (!m || !m[0].includes(f.old)) { console.warn("jargon fix not applied:", f.slide, f.old.slice(0, 40)); continue; }
  html = html.replace(m[0], () => m[0].replace(f.old, () => f.new));
}
// short parentheticals stay on one line ("보기 싫은 줄바꿈" fix): wrap "(…)" of <=16 chars in <nobr> inside text nodes only
html = html.replace(/<section [\s\S]*?<\/section>/g, (sec) => sec.replace(/>([^<>]+)</g, (m, txt) => ">" + txt.replace(/\(([^()]{2,16})\)/g, "<nobr>($1)</nobr>") + "<"));
// split slide 12: the DB table moves to its own slide (code-db)
html = html.replace(/(<section id="code-front-back"[\s\S]*?)<p class="lbl" style="margin-top:28px">[\s\S]*?<\/table>(\s*<\/div>\s*<\/section>|\s*<\/section>)/, (m, head, tail) => head + tail);
// keyword highlight (5th color): first occurrence per slide of core glossary words, in body text only (not headings/tags/tables' header)
const KW = ["프론트엔드", "백엔드", "데이터베이스", "인증키", "JSON", "API", "서버", "환각", "프롬프트", "맞춤형 GPT", "워크플로우", "에이전트", "챗봇", "스킬", "MCP", "플러그인"];
html = html.replace(/<section [\s\S]*?<\/section>/g, (sec) => {
  const used = new Set();
  return sec.replace(/(<(?:p|li|td)(?: class="(?:lead|sub|ex)")?(?: style="[^"]*")?>)([^<]+)/g, (m, open, txt) => {
    let t = txt;
    for (const k of KW) { if (used.size >= 2 || used.has(k) || !t.includes(k)) continue; used.add(k); t = t.replace(k, `<b class="kw">${k}</b>`); }
    return open + t;
  });
});
// fit-to-fill: every slide's content sits in .fit and is scaled to use the free space (runtime, after fonts load)
html = html.replace(/(<section [^>]*>)([\s\S]*?)(<\/section>)/g, (_m, o, inner, c) => `${o}<div class="fit">${inner}</div>${c}`);

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
const head = `<meta http-equiv="Content-Security-Policy" content="${CSP}"><meta name="referrer" content="no-referrer"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/slides/fonts.css"><style>#scaler section{word-break:keep-all;overflow-wrap:anywhere}#scaler section :is(td,th){overflow-wrap:break-word}#scaler section :is(p,h1,h2,h3,li,td){text-wrap:pretty}${EXTRA_CSS.replace(/\n/g, "")}${EXTRA_CSS2}${EXTRA_CSS3.replace(/\n/g, "")}${EXTRA_CSS4.replace(/\n/g, "")}#scaler>section{padding:72px 104px}#scaler>section>.fit{display:flex;flex-direction:column;flex:1 0 auto;transform-origin:0 0}#scaler img.zoomable,#scaler video{cursor:zoom-in}#lb{position:fixed;inset:0;z-index:50;background:rgba(10,18,38,.92);display:none;align-items:center;justify-content:center;cursor:zoom-out}#lb.on{display:flex}#lb img{max-width:96vw;max-height:94vh;background:#fff;border-radius:8px}#bar button,#bar select,#bar a,#bar input{min-height:44px;min-width:44px}#bar a{display:inline-flex;align-items:center;justify-content:center}#app:has(#black.on) :is(#bar,#notes){visibility:hidden}@media (max-width:700px) and (orientation:portrait){#bar::after{content:"📱 폰을 가로로 돌리면 슬라이드가 더 크게 보여요";flex-basis:100%;text-align:center;font-size:14px;color:#F2A541}}</style>`;
if (!html.includes('<meta name="viewport" content="width=device-width,initial-scale=1">')) throw new Error("viewport meta not found");
html = html.replace('<meta name="viewport" content="width=device-width,initial-scale=1">', (m) => m + head);
const barOpen = '<div id="bar" role="toolbar" aria-label="슬라이드 조작">';
if (!html.includes(barOpen)) throw new Error("viewer bar not found");
html = html.replace(barOpen, barOpen + '\n  <a id="home" href="/" title="사이트 홈">홈</a>');
// 강사 노트 별도 창(?notes) + 타이머 자동 정지 (trainer review 2026-11-26)
html = html.replace('<button id="nt" ', '<button id="nw" title="노트를 별도 창으로 (프로젝터에는 슬라이드만)">노트 창</button>\n  <button id="nt" ');
const fitScript = `<div id="lb" role="dialog" aria-label="그림 크게 보기"></div>
<script>(function(){
// fit-to-fill: scale each slide's content so it fills the free area (0.72x–1.35x), measured once fonts are loaded
function fitAll(){document.querySelectorAll("#scaler>section").forEach(function(sec){var f=sec.querySelector(":scope>.fit");if(!f)return;
 var was=sec.style.display;sec.style.display="flex";sec.style.visibility=sec.classList.contains("on")?"":"hidden";
 f.style.transform="";f.style.width="";f.style.height="";f.style.flex="";
 var cs=getComputedStyle(sec),W=sec.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight),H=sec.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom);
 function ok(z){f.style.flex="none";f.style.width=(W/z)+"px";f.style.height=(H/z)+"px";return f.scrollHeight<=f.clientHeight+8&&f.scrollWidth<=f.clientWidth+2}
 if([].some.call(f.children,function(e){return getComputedStyle(e).position==="absolute"})){f.style.flex="";f.style.width="";f.style.height="";f.dataset.fit="1";sec.style.display=was;sec.style.visibility="";return}
 var lo=0.72,hi=1.35;if(ok(hi))lo=hi;else{for(var i=0;i<9;i++){var m=(lo+hi)/2;if(ok(m))lo=m;else hi=m}}
 ok(lo);f.style.transform="scale("+lo+")";f.dataset.fit=lo.toFixed(2);sec.style.display=was;sec.style.visibility=""})}
(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(function(){fitAll();window.__fitDone=true});
// click a picture to see it full screen (screenshots are small on a projector)
var lb=document.getElementById("lb");
document.querySelectorAll("#scaler img").forEach(function(im){if(im.naturalWidth===0||im.closest(".card")&&im.width<200)return;im.classList.add("zoomable")});
document.getElementById("scaler").addEventListener("click",function(e){var t=e.target;if(t.tagName==="VIDEO")return;if(t.tagName==="IMG"){var im=new Image();im.alt="";im.src=t.currentSrc||t.src;lb.replaceChildren(im);lb.classList.add("on");e.stopPropagation()}});
lb.addEventListener("click",function(){lb.classList.remove("on")});addEventListener("keydown",function(e){if(e.key==="Escape")lb.classList.remove("on")});
})()</script>\n`;
const notesScript = `<style>.notes-only #wrap,.notes-only #bar{display:none}.notes-only #notes{display:block;max-height:none;min-height:100vh;font-size:30px;line-height:1.6;border-top:0;padding:24px 32px}#ntitle{font-weight:900;font-size:22px;color:#A8530A;margin:0 0 12px}</style>
<script>(function(){
var bc=window.BroadcastChannel?new BroadcastChannel("ai-slides"):null;
var nm=/[?&]notes(&|$)/.test(location.search);
var _show=show;
function title(){var n=document.getElementById("ntitle");if(!n){n=document.createElement("p");n.id="ntitle";document.getElementById("notes").before(n)}n.textContent=(cur+1)+" / "+ids.length+" · "+DATA.titles[ids[cur]]}
show=function(i,f){if(!nm&&tmId&&i!==cur)$("#tmb").click();_show(i,f);if(bc&&!nm)bc.postMessage({i:cur});if(nm)title()};
if(nm){document.body.classList.add("notes-only");$("#app").classList.add("show-notes");title();if(bc)bc.onmessage=function(e){if(e.data&&typeof e.data.i==="number")show(e.data.i,true)}}
else{if(bc)bc.onmessage=function(e){if(e.data&&e.data.hello)bc.postMessage({i:cur})};
$("#nw").onclick=function(){window.open("/slides/?notes#slide-"+(cur+1),"ai-notes","width=720,height=640")}}
if(nm&&bc)bc.postMessage({hello:1});
})()</script>\n`;
html = html.replace("</body>", () => fitScript + notesScript + "</body>");
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
