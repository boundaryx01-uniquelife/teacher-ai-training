// 레퍼런스 실습용 가상 앱 화면(개인정보 없음) → public/downloads/sample-reference-notice-app.png. dev 서버 필요(:8888, 사이트 글꼴 사용).
import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const ctx = await b.newContext({ viewport: { width: 390, height: 693 }, deviceScaleFactor: 2, bypassCSP: true });
const p = await ctx.newPage();
await p.goto("http://localhost:8888/lab?intro=0");
await p.evaluate(() => document.fonts.ready);
await p.evaluate(() => {
  document.body.innerHTML = `<style>
  body{margin:0;background:#f7f5ef;font-family:"Noto Sans KR",sans-serif;color:#14213d;padding:0}
  .top{background:#14213d;color:#fff;padding:22px 20px 18px}.top small{color:#f2a541;font-weight:700}.top h1{margin:4px 0 0;font-size:26px}
  .date{padding:16px 20px 4px;font-weight:700;color:#a8530a}
  .card{background:#fff;border:1px solid #d9d4c7;border-radius:16px;margin:12px 16px;padding:16px 18px;box-shadow:0 4px 12px rgba(20,33,61,.08)}
  .card b{display:block;font-size:19px;margin-bottom:4px}.card span{color:#4a5568;font-size:15px}
  .tag{display:inline-block;background:#f2a541;color:#14213d;font-weight:900;font-size:13px;border-radius:999px;padding:2px 10px;margin-bottom:6px}
  .tabs{position:fixed;left:0;right:0;bottom:0;display:flex;background:#14213d;color:#fff;text-align:center}
  .tabs div{flex:1;padding:12px 0 16px;font-size:13px}.tabs div:first-child{background:#f2a541;color:#14213d;font-weight:900}
  </style>
  <div class="top"><small>우리 반</small><h1>알림장</h1></div>
  <div class="date">오늘 · 12월 3일(수)</div>
  <div class="card"><span class="tag">준비물</span><b>내일 체육복을 가져오세요</b><span>1교시 체육 · 운동장 집합</span></div>
  <div class="card"><span class="tag">과제</span><b>과학 보고서 제출</b><span>12월 5일(금)까지 · 온라인 제출</span></div>
  <div class="card"><span class="tag">행사</span><b>학급 독서 시간</b><span>목요일 점심시간 · 책 한 권 챙기기</span></div>
  <div class="tabs"><div>🏠 오늘</div><div>📅 일정</div><div>📌 공지</div></div>`;
});
await p.waitForTimeout(300);
await p.screenshot({ path: "public/downloads/sample-reference-notice-app.png" });
await b.close();
