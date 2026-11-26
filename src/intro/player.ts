import { ALL_TEXT, DUR, render } from "./render.ts";
import "./intro.css";

const SEEN = "intro-seen";

async function loadFonts() {
  // the site already ships Noto Sans KR (unicode-range split); load just the ranges the intro needs
  try { await Promise.all([700, 900].map((w) => document.fonts.load(`${w} 40px "Noto Sans KR"`, ALL_TEXT))); } catch { /* fall back to system font */ }
}

/**
 * First-visit intro on the home page. Plays once per browser; ?intro=1 always plays, ?intro=0 never.
 * Skippable (button, Esc/Enter/Space, click), skipped for reduced motion. ?cap exposes window.__seek(t) for mp4 rendering.
 */
export function maybePlayIntro() {
  if (location.pathname !== "/") return;
  const q = new URLSearchParams(location.search);
  const cap = q.has("cap"), force = q.get("intro") === "1" || cap;
  let seen = false;
  try { seen = localStorage.getItem(SEEN) === "1"; } catch { /* storage blocked */ }
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!force && (q.get("intro") === "0" || seen || calm)) return;

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  const skip = document.createElement("button");
  skip.type = "button"; skip.className = "intro-skip"; skip.textContent = "건너뛰기 ▸";
  const bar = document.createElement("div"); bar.className = "intro-progress";
  const sr = document.createElement("p"); sr.className = "sr-only";
  sr.textContent = "인트로 영상: 한 줄 프롬프트가 5요소로 다듬어지고, 퀴즈 앱으로 완성되는 과정을 보여 줍니다. 건너뛰기 버튼으로 바로 시작할 수 있어요.";
  const ov = document.createElement("div");
  ov.className = "intro" + (cap ? " intro-cap" : "");
  ov.append(canvas, sr, bar, skip);
  document.body.append(ov);
  document.documentElement.classList.add("intro-on");
  document.documentElement.classList.remove("intro-pending");
  const ctx = canvas.getContext("2d")!;

  const size = () => {
    const dpr = cap ? 1 : Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(innerWidth * dpr); canvas.height = Math.round(innerHeight * dpr);
  };
  size();
  const draw = (t: number) => render(ctx, canvas.width, canvas.height, Math.max(0, Math.min(DUR, t)));

  let raf = 0, done = false, start = 0;
  const finish = () => {
    if (done) return; done = true;
    cancelAnimationFrame(raf);
    try { localStorage.setItem(SEEN, "1"); } catch { /* ignore */ }
    removeEventListener("keydown", onKey); removeEventListener("resize", onResize);
    ov.classList.add("out");
    document.documentElement.classList.remove("intro-on");
    setTimeout(() => ov.remove(), 700);
    (document.querySelector(".home-start a") as HTMLElement | null)?.focus({ preventScroll: true });
  };
  const onKey = (e: KeyboardEvent) => { if (["Escape", "Enter", " "].includes(e.key)) { e.preventDefault(); finish(); } };
  const onResize = () => { size(); };
  skip.addEventListener("click", finish);
  ov.addEventListener("click", (e) => { if (e.target === canvas) finish(); });
  addEventListener("keydown", onKey); addEventListener("resize", onResize);

  loadFonts().then(() => {
    if (cap) {
      (window as unknown as { __seek: (t: number) => void }).__seek = (t) => draw(t);
      (window as unknown as { __ready: boolean }).__ready = true;
      draw(0);
      return;
    }
    skip.focus({ preventScroll: true });
    start = performance.now();
    const loop = (now: number) => {
      const t = (now - start) / 1000;
      draw(t);
      bar.style.transform = `scaleX(${Math.min(1, t / DUR)})`;
      if (t >= DUR + 0.6) return finish();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  });
}
