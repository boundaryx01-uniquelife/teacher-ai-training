// "안 될 때" FAQ. 강의안(content/lesson-plan.md)의 경고·팁과 이 사이트 코드의 사실만 담았다.
// id는 앵커(#trouble-<id>)로 쓰이는 ASCII 슬러그.

export interface Trouble { id: string; stage: "계정·로그인" | "ChatGPT" | "Copilot" | "실습 사이트" | "교실 환경"; q: string; a: string[] }
export const TROUBLE: Trouble[] = [
  // 강의안 488행: 계정 사전 준비
  { id: "account-login", stage: "계정·로그인", q: "ChatGPT에 로그인이 안 돼요", a: ["당일 가입·인증에 10분 이상 걸릴 수 있어요. 연수 전날까지 로그인을 확인해 두는 것이 좋아요.", "막히면 멈추고 옆 사람이나 강사에게 도움을 청하세요."] },
  // 부록 접속 방법
  { id: "penz-account", stage: "계정·로그인", q: "Copilot이 열리지 않거나 학교 계정이 아니라고 나와요", a: ["개인 Microsoft 계정이 아니라 PENZ 계정으로 로그인해야 해요.", "Copilot 화면에 방패(데이터 보호) 표시가 있으면 학교 계정 상태예요."] },
  // 부록 관리자 확인 목록
  { id: "student-penz", stage: "계정·로그인", q: "학생 PENZ 계정으로 접속이 안 돼요", a: ["학생 계정 연령대 설정과 Copilot Chat 활성화 여부를 학교 정보 담당자에게 확인해야 해요.", "연수 전에 테스트용 학생 PENZ 계정 1개로 실제 접속을 확인해 두세요."] },
  // 강의안 13, 247, 460, 487행
  { id: "chatgpt-free-limit", stage: "ChatGPT", q: "맞춤형 GPT 만들기나 Work가 안 보여요", a: ["요금제에 따라 달라요. 무료 계정이면 프로젝트나 긴 지침 복사로 대신 체험할 수 있어요.", "기능·요금제별 제공 범위는 자주 바뀌니 실제 화면으로 확인 필요해요."] },
  // 강의안 215, 247행
  { id: "sites-missing", stage: "ChatGPT", q: "@Sites가 없어요", a: ["Sites는 공개 베타이고 Free·Go를 제외한 유료 요금제에서 제공돼요. 요금제별 사용량 한도도 있어요.", "무료 계정이면 3단계를 ‘캔버스 HTML’로 하세요."] },
  // 강의안 39, 456행
  { id: "wrong-answer", stage: "ChatGPT", q: "AI가 만든 정답이나 성취기준이 이상해요", a: ["AI는 그럴듯하게 틀릴 수 있어요(환각). 정답·성취기준이 실제와 맞는지 교사가 검토하세요.", "공문·수치는 반드시 원문을 확인하세요."] },
  // 강의안 14, 23행
  { id: "personal-info", stage: "ChatGPT", q: "업무 자료를 넣어도 되나요?", a: ["학생 이름·성적·상담 내용 등 개인정보는 실습에 넣지 않아요.", "개인정보를 지운 자료만 사용하세요."] },
  // 부록 무료 vs 유료 표·29행
  { id: "copilot-button", stage: "Copilot", q: "워드 안의 Copilot 버튼이 안 돼요", a: ["대부분 유료 라이선스 문제예요. Microsoft 365 Copilot은 학교가 구매하는 유료 추가 라이선스예요.", "myaccount.microsoft.com의 구독에서 확인하세요. Copilot Chat까지만 보이면 오피스 안 Copilot은 쓸 수 없어요."] },
  { id: "teach-missing", stage: "Copilot", q: "Copilot에 Teach·Learning Zone 메뉴가 없어요(‘학습’만 보여요)", a: ["연수 준비 중 교육청(PENZ) 교사 계정에서는 Teach가 보이지 않고 ‘학습’ 메뉴만 보였어요. 그래서 이 연수에서는 Teach와 Learning Zone을 다루지 않아요.", "내 계정에 Teach가 보이면 계정·라이선스에 따라 열린 거예요. 학교 정보 담당자에게 허용 여부를 확인하세요."] },
  // src/modules/m2/index.ts 31-33, 119행
  { id: "m2-code", stage: "실습 사이트", q: "M2에서 회차 코드를 넣었는데 안 돼요", a: ["회차 코드는 영문 대문자·숫자 6자리예요(0·O·1·I 제외). 없는 회차 코드라면 강사에게 코드를 확인하세요.", "코드 없이 풀면 연습 모드예요. 채점만 하고 저장하지 않아요."] },
  // src/modules/m3/index.ts 34-37행
  { id: "m3-pin", stage: "실습 사이트", q: "M3 강사 PIN이 안 돼요", a: ["PIN은 6자리 이상이고, 5번 틀리면 15분 동안 잠겨요. 로그인은 4시간 뒤 풀려요.", "PIN 설정 안내가 나오면 사이트 관리자가 설정해야 해요."] },
  // src/modules/m4/index.ts 55-59행
  { id: "m4-sample", stage: "실습 사이트", q: "M4에 ‘샘플’ 배지가 떠요", a: ["나이스 연결에 실패했거나 인증키가 없을 때 가상 학교·메뉴가 나와요. 흐름을 보는 데는 충분해요.", "‘실제 응답’인데 급식이 비어 있다면 그날 급식 정보가 없을 수 있어요. 다른 날짜로 불러 보세요."] },
  // 사이트 사실: public/slides
  { id: "slides-offline", stage: "교실 환경", q: "와이파이가 끊기면 슬라이드가 멈추나요?", a: ["한 번 열어 둔 기기에서는 와이파이가 끊겨도 슬라이드가 넘어가요.", "연수 장소 와이파이는 미리 확인해 두세요."] },
  // 사이트 사실: Netlify
  { id: "netlify-check", stage: "교실 환경", q: "‘Security by Netlify’ 연결 확인 화면에서 멈춰요", a: ["몇 초 기다리면 넘어가요.", "계속 안 넘어가면 브라우저의 자바스크립트가 켜져 있는지 확인하세요."] },
  // 강의안 488행: 짝 실습
  { id: "stuck-together", stage: "교실 환경", q: "혼자 막혔어요", a: ["입문자끼리 막히면 멈추고 숙련자 짝이나 강사에게 물어보세요.", "‘2번 해 봐도 안 되면’ 완성 예시를 보고 진도를 따라가도 돼요."] },
];
