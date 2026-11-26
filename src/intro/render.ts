// 인트로 모션 "한 줄이 도구가 되다" — 14초 + 정리 1초(플레이어가 투명하게 걷음)
// render(ctx, W, H, t)는 시간 t만의 순수 함수(상태 없음, 시드 고정 난수만 씀) → 실시간 재생과 mp4 프레임 렌더가 같은 그림.
//  0.0–2.2  한 줄 프롬프트: 입력창에 "평가 문제 만들어줘"가 타이핑 → AI의 물음표(누구에게? 몇 문항? 어떤 형식?)
//  2.2–4.6  5요소: 입력창이 카드로 커지고 역할·대상·과제·조건·형식 칩이 날아와 꽂힘
//  4.6–7.6  한 바퀴: 카드가 '화면' 노드가 되고 API·서버·DB로 요청 점이 갔다가 ✓로 돌아옴
//  7.6–10.4 도구 완성: 노드가 폰으로 모이고 학생이 퀴즈를 풀어 정답 표시
// 10.4–14.0 제목 + 시작 카드 3장(강의 슬라이드·실습 워크벤치·가이드북·자료실) → 홈 첫 화면과 같은 배치
// 가상 폭: 가로 1920 / 세로(폰) 1080, 높이는 실제 화면 비율.
export const DUR = 14;

export const FONT = '"Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif';
const C = {
  bg: "#f7f5ef", ink: "#14213d", soft: "#4a5568", faint: "#8a8577", line: "#d9d4c7",
  orange: "#f2a541", od: "#a8530a", white: "#ffffff", ok: "#1f6f43", okBg: "#e3f1e8", navy2: "#22325a", chip: "#eef0f5",
};

const clamp = (x: number, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const eOut3 = (x: number) => 1 - (1 - x) ** 3;
const eIO3 = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
const eBack = (x: number) => { if (x <= 0) return 0; if (x >= 1) return 1; const c = 1.6, y = x - 1; return 1 + (c + 1) * y ** 3 + c * y * y; };
const rnd = (i: number) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
/** fade in over [a,a+d], out over [b-d,b] */
const win = (t: number, a: number, b: number, d = 0.3) => Math.min(prog(t, a, a + d), 1 - prog(t, b - d, b));

type Ctx = CanvasRenderingContext2D;

function rr(c: Ctx, x: number, y: number, w: number, h: number, r: number) {
  r = Math.min(r, w / 2, h / 2);
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function box(c: Ctx, x: number, y: number, w: number, h: number, r: number, fill: string, stroke?: string, lw = 3) {
  rr(c, x, y, w, h, r); c.fillStyle = fill; c.fill(); if (stroke) { c.lineWidth = lw; c.strokeStyle = stroke; c.stroke(); }
}
function text(c: Ctx, s: string, x: number, y: number, size: number, weight: number, color: string, align: CanvasTextAlign = "center") {
  c.font = `${weight} ${size}px ${FONT}`; c.fillStyle = color; c.textAlign = align; c.textBaseline = "middle"; c.fillText(s, x, y);
}
function check(c: Ctx, x: number, y: number, s: number, color: string, k = 1) {
  c.save(); c.strokeStyle = color; c.lineWidth = s * 0.16; c.lineCap = "round"; c.lineJoin = "round";
  c.beginPath(); const p1 = [x - s * 0.35, y], p2 = [x - s * 0.1, y + s * 0.25], p3 = [x + s * 0.38, y - s * 0.28];
  const a = clamp(k * 2), b = clamp(k * 2 - 1);
  c.moveTo(p1[0], p1[1]); c.lineTo(lerp(p1[0], p2[0], a), lerp(p1[1], p2[1], a));
  if (b > 0) c.lineTo(lerp(p2[0], p3[0], b), lerp(p2[1], p3[1], b));
  c.stroke(); c.restore();
}

// ---------- small icons (drawn, no image assets) ----------
function icon(c: Ctx, kind: string, x: number, y: number, s: number, color: string) {
  c.save(); c.strokeStyle = color; c.fillStyle = color; c.lineWidth = s * 0.08; c.lineCap = "round"; c.lineJoin = "round";
  if (kind === "screen") {
    rr(c, x - s * 0.45, y - s * 0.34, s * 0.9, s * 0.56, s * 0.06); c.stroke();
    c.beginPath(); c.moveTo(x, y + s * 0.22); c.lineTo(x, y + s * 0.36); c.moveTo(x - s * 0.2, y + s * 0.38); c.lineTo(x + s * 0.2, y + s * 0.38); c.stroke();
    c.beginPath(); c.moveTo(x - s * 0.08, y - s * 0.16); c.lineTo(x + s * 0.12, y - s * 0.06); c.lineTo(x - s * 0.08, y + s * 0.04); c.closePath(); c.fill();
  } else if (kind === "doc") {
    rr(c, x - s * 0.3, y - s * 0.4, s * 0.6, s * 0.8, s * 0.06); c.stroke();
    for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(x - s * 0.16, y - s * 0.18 + i * s * 0.18); c.lineTo(x + s * 0.16, y - s * 0.18 + i * s * 0.18); c.stroke(); }
  } else if (kind === "gear") {
    c.beginPath(); c.arc(x, y, s * 0.24, 0, Math.PI * 2); c.stroke();
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; c.beginPath(); c.moveTo(x + Math.cos(a) * s * 0.3, y + Math.sin(a) * s * 0.3); c.lineTo(x + Math.cos(a) * s * 0.42, y + Math.sin(a) * s * 0.42); c.stroke(); }
    c.beginPath(); c.arc(x, y, s * 0.08, 0, Math.PI * 2); c.fill();
  } else if (kind === "db") {
    const w = s * 0.36, h = s * 0.1;
    c.beginPath(); c.ellipse(x, y - s * 0.28, w, h, 0, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(x - w, y - s * 0.28); c.lineTo(x - w, y + s * 0.28); c.ellipse(x, y + s * 0.28, w, h, 0, Math.PI, 0, true); c.lineTo(x + w, y - s * 0.28); c.stroke();
    c.beginPath(); c.ellipse(x, y, w, h, 0, 0, Math.PI); c.stroke();
  } else if (kind === "flask") {
    c.beginPath(); c.moveTo(x - s * 0.12, y - s * 0.4); c.lineTo(x - s * 0.12, y - s * 0.08); c.lineTo(x - s * 0.36, y + s * 0.34);
    c.lineTo(x + s * 0.36, y + s * 0.34); c.lineTo(x + s * 0.12, y - s * 0.08); c.lineTo(x + s * 0.12, y - s * 0.4); c.stroke();
    c.beginPath(); c.moveTo(x - s * 0.22, y + s * 0.12); c.lineTo(x + s * 0.22, y + s * 0.12); c.lineTo(x + s * 0.32, y + s * 0.3); c.lineTo(x - s * 0.32, y + s * 0.3); c.closePath(); c.fill();
  } else if (kind === "book") {
    c.beginPath(); c.moveTo(x, y - s * 0.28); c.quadraticCurveTo(x - s * 0.22, y - s * 0.38, x - s * 0.44, y - s * 0.3); c.lineTo(x - s * 0.44, y + s * 0.3);
    c.quadraticCurveTo(x - s * 0.22, y + s * 0.22, x, y + s * 0.32); c.quadraticCurveTo(x + s * 0.22, y + s * 0.22, x + s * 0.44, y + s * 0.3);
    c.lineTo(x + s * 0.44, y - s * 0.3); c.quadraticCurveTo(x + s * 0.22, y - s * 0.38, x, y - s * 0.28); c.lineTo(x, y + s * 0.32); c.stroke();
  }
  c.restore();
}

// ---------- layout ----------
interface L { VW: number; VH: number; cx: number; cy: number; portrait: boolean; barW: number; cardW: number; cardH: number }
function layout(W: number, H: number): L {
  const portrait = H > W * 1.1;
  const VW = portrait ? 1080 : 1920, VH = (H / W) * VW;
  return { VW, VH, cx: VW / 2, cy: VH / 2, portrait, barW: portrait ? 900 : 940, cardW: portrait ? 920 : 1000, cardH: portrait ? 560 : 540 };
}

const ONE = "평가 문제 만들어줘";
const ASKS = ["누구에게?", "몇 문항?", "어떤 형식?"];
const FIVE: [string, string][] = [
  ["역할", "고등학교 과학 교사"], ["대상", "고1 학생, 중간 수준"], ["과제", "형성평가 5문항"],
  ["조건", "객관식 3 · 서술형 2"], ["형식", "표: 문항 | 정답 | 해설"],
];
const NODES: [string, string, string][] = [["화면", "프론트엔드", "screen"], ["API", "주문서", "doc"], ["서버", "백엔드", "gear"], ["DB", "데이터베이스", "db"]];
const CAPS: [number, number, string][] = [
  [0.2, 2.3, "한 줄 프롬프트"], [2.3, 4.6, "5요소로 다듬기"], [4.6, 7.7, "화면 → API → 서버 → DB"], [7.7, 10.4, "내 수업용 퀴즈 도구"],
];
export const START_CARDS: [string, string, string][] = [["강의 슬라이드", "강의 따라가기 · 오프라인", "screen"], ["실습 워크벤치", "실습 7가지 · 바로 해 보기", "flask"], ["가이드북 · 자료실", "강의안 · PDF · 예시", "book"]];

const OPTS = ["빛", "물", "이산화탄소", "질소"];
const MISC = "형성평가 퀴즈 1 / 5 광합성에 필요하지 않은 것은? ①②③④ 정답! 다음 문제 → +1 AI, 개념에서 실습까지 선생님의 첫 AI 도구 만들기 2026. 11. 27. · 부경고등학교 교사 연수 · teacher-ai-training.netlify.app";
/** every glyph the intro draws — the player asks the webfont for exactly these before playing */
export const ALL_TEXT = [ONE, ...ASKS, ...FIVE.flat(), ...NODES.flat(), ...CAPS.map((c) => c[2]), ...START_CARDS.flat(), ...OPTS, MISC].join("");

function nodeRect(l: L, i: number) {
  if (l.portrait) {
    const w = 400, h = 260, gx = 230, gy = 180;
    const pos = [[-1, -1], [1, -1], [1, 1], [-1, 1]][i];
    return { x: l.cx + pos[0] * gx - w / 2, y: l.cy + pos[1] * gy - h / 2, w, h };
  }
  const w = 320, h = 220, gap = 440;
  return { x: l.cx + (i - 1.5) * gap - w / 2, y: l.cy - h / 2 + 30, w, h };
}
const center = (r: { x: number; y: number; w: number; h: number }) => [r.x + r.w / 2, r.y + r.h / 2];

export function render(c: Ctx, W: number, H: number, t: number) {
  const l = layout(W, H);
  c.save();
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.fillStyle = C.bg; c.fillRect(0, 0, W, H);
  const k = W / l.VW; c.scale(k, k);

  // faint dot grid (paper)
  c.fillStyle = "rgba(20,33,61,.07)";
  for (let y = 40; y < l.VH; y += 60) for (let x = 40; x < l.VW; x += 60) { c.beginPath(); c.arc(x, y, 2.2, 0, Math.PI * 2); c.fill(); }

  // caption pill
  for (const [a, b, s] of CAPS) {
    const al = win(t, a, b); if (al <= 0) continue;
    c.save(); c.globalAlpha = al;
    c.font = `700 ${l.portrait ? 44 : 40}px ${FONT}`; const w = c.measureText(s).width + 64, y = l.portrait ? l.VH * 0.2 : l.VH * 0.17;
    box(c, l.cx - w / 2, y - 34 + (1 - al) * 12, w, 68, 34, C.ink);
    text(c, s, l.cx, y + (1 - al) * 12, l.portrait ? 44 : 40, 700, C.orange);
    c.restore();
  }

  sceneInput(c, l, t);
  sceneFlow(c, l, t);
  scenePhone(c, l, t);
  sceneTitle(c, l, t);
  c.restore();
}

/** 0–4.9: one-line input → 5-element card (the card then becomes node 0 in sceneFlow) */
function sceneInput(c: Ctx, l: L, t: number) {
  if (t > 5.2) return;
  const appear = eOut3(prog(t, 0, 0.45));
  const grow = eIO3(prog(t, 2.2, 2.8));
  const toNode = eIO3(prog(t, 4.6, 5.2));
  const n0 = nodeRect(l, 0);
  let w = lerp(l.barW, l.cardW, grow), h = lerp(110, l.cardH, grow);
  let x = l.cx - w / 2, y = l.cy - h / 2 + 30;
  x = lerp(x, n0.x, toNode); y = lerp(y, n0.y, toNode); w = lerp(w, n0.w, toNode); h = lerp(h, n0.h, toNode);
  c.save(); c.globalAlpha = appear;
  const sc = lerp(0.92, 1, appear); c.translate(l.cx, l.cy); c.scale(sc, sc); c.translate(-l.cx, -l.cy);
  box(c, x, y, w, h, lerp(55, 24, Math.max(grow, toNode)), C.white, C.ink, 4);
  const content = 1 - prog(t, 4.55, 4.85);

  // one-line text + cursor + send
  const one = 1 - prog(t, 2.2, 2.45);
  if (one > 0) {
    c.save(); c.globalAlpha = appear * one;
    const n = Math.floor(prog(t, 0.45, 1.6) * ONE.length + 0.001);
    const s = ONE.slice(0, n);
    c.font = `700 46px ${FONT}`; const tw = c.measureText(s).width;
    text(c, s, x + 56, y + h / 2, 46, 700, C.ink, "left");
    if (Math.floor(t * 2.4) % 2 === 0 || t < 1.6) { c.fillStyle = C.od; c.fillRect(x + 60 + tw, y + h / 2 - 26, 4, 52); }
    const press = win(t, 1.7, 2.0, 0.12);
    c.beginPath(); c.arc(x + w - 56, y + h / 2, 36 - press * 4, 0, Math.PI * 2); c.fillStyle = press > 0 ? C.orange : C.ink; c.fill();
    c.strokeStyle = C.white; c.lineWidth = 6; c.lineCap = "round"; c.beginPath();
    c.moveTo(x + w - 56, y + h / 2 + 14); c.lineTo(x + w - 56, y + h / 2 - 14); c.moveTo(x + w - 68, y + h / 2 - 2); c.lineTo(x + w - 56, y + h / 2 - 14); c.lineTo(x + w - 44, y + h / 2 - 2); c.stroke();
    c.restore();
  }
  // AI's guesses: question bubbles
  for (let i = 0; i < ASKS.length; i++) {
    const a = win(t, 1.85 + i * 0.12, 2.45, 0.2); if (a <= 0) continue;
    const pop = eBack(prog(t, 1.85 + i * 0.12, 2.2 + i * 0.12));
    const bx = l.cx + (l.portrait ? (i - 1) * 300 : (i - 1) * 340), by = l.cy - (l.portrait ? 170 : 150) + (i === 1 ? -40 : 0);
    c.save(); c.globalAlpha = a; c.translate(bx, by); c.scale(pop, pop);
    c.font = `700 36px ${FONT}`; const bw = c.measureText(ASKS[i]).width + 48;
    box(c, -bw / 2, -32, bw, 64, 32, C.chip, C.line, 2);
    text(c, ASKS[i], 0, 0, 36, 700, C.soft);
    c.restore();
  }
  // five chips + phrases
  if (grow > 0 && content > 0) {
    c.save(); c.globalAlpha = content;
    const rowH = (l.cardH - 80) / 5;
    for (let i = 0; i < FIVE.length; i++) {
      const p = eBack(prog(t, 2.6 + i * 0.22, 3.1 + i * 0.22)); if (p <= 0) continue;
      const tx = x + 40, ty = y + 40 + i * rowH + rowH / 2 - 32;
      const a = rnd(i + 3) * Math.PI * 2, R = l.portrait ? 900 : 1100;
      const sx = l.cx + Math.cos(a) * R, sy = l.cy + Math.sin(a) * R * 0.6;
      const cxp = lerp(sx, tx, p), cyp = lerp(sy, ty, p);
      box(c, cxp, cyp, 150, 64, 32, C.orange);
      text(c, FIVE[i][0], cxp + 75, cyp + 32, 36, 900, C.ink);
      const rev = prog(t, 3.0 + i * 0.22, 3.5 + i * 0.22);
      if (rev > 0) {
        c.save(); c.beginPath(); c.rect(tx + 176, ty - 10, (w - 230) * eOut3(rev), 84); c.clip();
        text(c, FIVE[i][1], tx + 180, ty + 32, l.portrait ? 40 : 42, 700, C.ink, "left"); c.restore();
      }
    }
    c.restore();
  }
  c.restore();
}

/** 4.6–8.1: request travels 화면 → API → 서버 → DB and back */
function sceneFlow(c: Ctx, l: L, t: number) {
  if (t < 4.6 || t > 8.2) return;
  const gather = eIO3(prog(t, 7.6, 8.1)); // nodes shrink into the phone
  const rects = NODES.map((_, i) => nodeRect(l, i));
  const centers = rects.map(center);
  c.save(); c.globalAlpha = 1 - gather;
  // connectors
  const draw = prog(t, 5.2, 5.8);
  c.strokeStyle = C.line; c.lineWidth = 6; c.setLineDash([14, 12]);
  for (let i = 0; i < 3; i++) {
    const [ax, ay] = centers[i], [bx, by] = centers[i + 1], d = clamp(draw * 3 - i);
    if (d <= 0) continue; c.beginPath(); c.moveTo(ax, ay); c.lineTo(lerp(ax, bx, d), lerp(ay, by, d)); c.stroke();
  }
  c.setLineDash([]);
  // packet position along the polyline
  const go = eIO3(prog(t, 5.9, 6.9)), back = eIO3(prog(t, 6.95, 7.45));
  const along = (u: number) => { const s = u * 3, i = Math.min(2, Math.floor(s)), f = s - i; return [lerp(centers[i][0], centers[i + 1][0], f), lerp(centers[i][1], centers[i + 1][1], f)]; };
  const u = t < 6.95 ? go : 1 - back;
  const hot = (i: number) => clamp(1 - Math.abs(u * 3 - i) * 1.6) * (t > 5.85 && t < 7.5 ? 1 : 0);
  rects.forEach((r, i) => {
    const [ncx, ncy] = centers[i];
    if (i === 0 && t < 5.2) return; // until then the input card (sceneInput) is morphing into this node
    const p = i === 0 ? 1 : eBack(prog(t, 4.95 + i * 0.15, 5.4 + i * 0.15)); if (p <= 0) return;
    const gx = lerp(ncx, l.cx, gather), gy = lerp(ncy, l.cy, gather), s = p * (1 - gather * 0.7);
    c.save(); c.translate(gx, gy); c.scale(s, s);
    const hl = hot(i);
    box(c, -r.w / 2, -r.h / 2, r.w, r.h, 24, C.white, hl > 0.05 ? C.od : C.ink, 4 + hl * 4);
    const fade = i === 0 ? prog(t, 5.2, 5.5) : 1;
    c.globalAlpha *= fade;
    icon(c, NODES[i][2], 0, -r.h * 0.16, r.h * 0.42, C.ink);
    text(c, NODES[i][0], 0, r.h * 0.2, 44, 900, C.ink);
    text(c, NODES[i][1], 0, r.h * 0.36, 28, 700, C.soft);
    if (i === 3) { const row = win(t, 6.85, 7.7, 0.15); if (row > 0) { c.globalAlpha = row; box(c, r.w / 2 - 70, -r.h / 2 - 26, 100, 52, 26, C.orange); text(c, "+1", r.w / 2 - 20, -r.h / 2, 32, 900, C.ink); } }
    c.restore();
  });
  // packet
  if (t > 5.85 && t < 7.5) {
    const [px, py] = along(u);
    c.beginPath(); c.arc(px, py, 26, 0, Math.PI * 2); c.fillStyle = t < 6.95 ? C.orange : C.ok; c.fill();
    if (t >= 6.95) check(c, px, py, 30, C.white);
    else { c.fillStyle = C.ink; c.font = `900 22px ${FONT}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("②", px, py + 1); }
  }
  c.restore();
}

/** 7.8–10.9: the tool — a phone with a quiz the student solves */
function scenePhone(c: Ctx, l: L, t: number) {
  if (t < 7.8 || t > 11) return;
  const pop = eBack(prog(t, 7.85, 8.45));
  const leave = eIO3(prog(t, 10.35, 10.9));
  const pw = 460, ph = 860;
  const s = (l.portrait ? 1.15 : 0.76) * pop * lerp(1, 0.6, leave);
  c.save(); c.globalAlpha = 1 - leave; c.translate(l.cx, lerp(l.cy + (l.portrait ? 40 : 70), l.cy - 200, leave)); c.scale(s, s);
  box(c, -pw / 2, -ph / 2, pw, ph, 64, C.ink);
  box(c, -pw / 2 + 18, -ph / 2 + 18, pw - 36, ph - 36, 48, C.bg);
  box(c, -40, -ph / 2 + 30, 80, 14, 7, C.ink);
  // header
  box(c, -pw / 2 + 18, -ph / 2 + 70, pw - 36, 90, 0, C.ink);
  text(c, "형성평가 퀴즈", 0, -ph / 2 + 115, 34, 900, C.white);
  text(c, "1 / 5", 0, -ph / 2 + 200, 28, 700, C.soft);
  text(c, "광합성에 필요하지", 0, -ph / 2 + 260, 36, 900, C.ink);
  text(c, "않은 것은?", 0, -ph / 2 + 306, 36, 900, C.ink);
  const opts = OPTS;
  const pick = prog(t, 8.95, 9.15);
  opts.forEach((o, i) => {
    const oy = -ph / 2 + 370 + i * 92;
    const chosen = i === 3 && pick > 0;
    box(c, -pw / 2 + 50, oy, pw - 100, 74, 18, chosen ? C.okBg : C.white, chosen ? C.ok : C.line, chosen ? 4 : 3);
    text(c, `${"①②③④"[i]} ${o}`, -pw / 2 + 80, oy + 37, 32, 700, C.ink, "left");
    if (chosen) check(c, pw / 2 - 90, oy + 37, 36, C.ok, prog(t, 9.15, 9.45));
  });
  // tap ripple
  const tap = prog(t, 8.75, 9.2);
  if (tap > 0 && tap < 1) { const oy = -ph / 2 + 370 + 3 * 92 + 37; c.beginPath(); c.arc(60, oy, 20 + tap * 50, 0, Math.PI * 2); c.strokeStyle = `rgba(168,83,10,${1 - tap})`; c.lineWidth = 6; c.stroke(); }
  const res = win(t, 9.45, 11, 0.25);
  if (res > 0) { c.globalAlpha = (1 - leave) * res; box(c, -pw / 2 + 50, ph / 2 - 130, pw - 100, 76, 38, C.ok); text(c, "정답! 다음 문제 →", 0, ph / 2 - 92, 32, 900, C.white); }
  c.restore();
}

/** 10.5–14: title + three start cards (same order as the home page start cards) */
function sceneTitle(c: Ctx, l: L, t: number) {
  if (t < 10.5) return;
  const a1 = eOut3(prog(t, 10.55, 11.3)), a2 = eOut3(prog(t, 10.85, 11.6));
  const ty = l.portrait ? l.VH * 0.27 : l.VH * 0.25;
  c.save();
  c.globalAlpha = a1; text(c, "AI, 개념에서 실습까지", l.cx, ty + (1 - a1) * 30, l.portrait ? 70 : 84, 900, C.ink);
  c.globalAlpha = a2;
  const t2 = "선생님의 첫 AI 도구 만들기", fs2 = l.portrait ? 62 : 76;
  c.font = `900 ${fs2}px ${FONT}`; const w2 = c.measureText(t2).width;
  const y2 = ty + (l.portrait ? 100 : 120) + (1 - a2) * 30;
  const hl = eOut3(prog(t, 11.3, 11.9));
  c.fillStyle = C.orange; c.fillRect(l.cx - w2 / 2 - 10, y2 + fs2 * 0.12, (w2 + 20) * hl, fs2 * 0.36);
  text(c, t2, l.cx, y2, fs2, 900, C.ink);
  c.restore();

  START_CARDS.forEach(([title, sub, ic], i) => {
    const p = eBack(prog(t, 11.5 + i * 0.18, 12.1 + i * 0.18)); if (p <= 0) return;
    let x: number, y: number, w: number, h: number;
    if (l.portrait) { w = 880; h = 190; x = l.cx - w / 2; y = ty + 230 + i * 220; }
    else { w = 470; h = 300; x = l.cx + (i - 1) * 520 - w / 2; y = ty + 230; }
    c.save(); c.globalAlpha = clamp(p); c.translate(x + w / 2, y + h / 2 + (1 - p) * 40); c.scale(lerp(0.9, 1, p), lerp(0.9, 1, p));
    box(c, -w / 2, -h / 2, w, h, 28, i === 0 ? C.orange : C.white, C.ink, 4);
    if (l.portrait) {
      icon(c, ic, -w / 2 + 110, 0, 110, C.ink);
      text(c, title, -w / 2 + 200, -26, 52, 900, C.ink, "left");
      text(c, sub, -w / 2 + 200, 40, 34, 700, i === 0 ? C.ink : C.soft, "left");
    } else {
      icon(c, ic, 0, -h / 2 + 90, 110, C.ink);
      text(c, title, 0, 40, 46, 900, C.ink);
      text(c, sub, 0, 100, 30, 700, i === 0 ? C.ink : C.soft);
    }
    c.restore();
  });
  const foot = eOut3(prog(t, 12.4, 13));
  if (foot > 0) {
    c.save(); c.globalAlpha = foot;
    text(c, "2026. 11. 27. · 부경고등학교 교사 연수 · teacher-ai-training.netlify.app", l.cx, l.portrait ? l.VH - 140 : l.VH - 90, l.portrait ? 30 : 32, 700, C.soft);
    c.restore();
  }
}
