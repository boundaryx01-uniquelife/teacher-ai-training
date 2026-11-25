/** Server-only answer key (S-1, S-2). Never import this from src/.
 *  Q1/Q2 choice order differs from S-1 on purpose (user decision 2026-11-25): the lesson plan's own example code
 *  shows ANSWERS = { 1: '3', 2: '1' }, which is public on /guide and /slides, so the live key must not match it. */
export const KEY: Record<number, { answer: string; hint: string; explain: string }> = {
  1: { answer: "2", hint: "광합성에서 나오는 기체를 떠올려 보세요", explain: "산소는 온실효과를 일으키지 않는다" },
  2: { answer: "3", hint: "식당의 홀·메뉴판이에요", explain: "프론트엔드 = 화면" },
  3: { answer: "2", hint: "보이지 않는 주방이에요", explain: "정답은 서버(백엔드)에만 둔다" },
  4: { answer: "3", hint: "창고·장부에 해당해요", explain: "DB = 저장된 장부" },
  5: { answer: "4", hint: "최소 시제품의 영어 약자예요", explain: "MVP = Minimum Viable Product" },
};
