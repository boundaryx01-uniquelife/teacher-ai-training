/** Question text and choices only. The answer key lives in netlify/lib/quiz.ts (server) — never here. */
export interface Question { no: number; text: string; choices: [string, string, string, string] }
export const QUESTIONS: Question[] = [
  { no: 1, text: "온실가스가 아닌 것은?", choices: ["이산화탄소", "산소", "메탄", "아산화질소"] },
  { no: 2, text: "사용자가 보고 누르는 화면 부분은?", choices: ["백엔드", "DB", "프론트엔드", "MVP"] },
  { no: 3, text: "제출한 답을 채점하는 곳은?", choices: ["프론트엔드", "백엔드", "메뉴판", "PWA"] },
  { no: 4, text: "제출 기록을 모아 두는 곳은?", choices: ["API", "프론트엔드", "데이터베이스", "배포"] },
  { no: 5, text: "핵심 기능만 넣어 먼저 써 보는 시제품은?", choices: ["PWA", "토큰", "컨텍스트", "MVP"] },
];
export const MARKS = ["①", "②", "③", "④"];
