// "2번 해 봐도 안 되면" 완성 예시. 막힌 교사가 연수 진도를 따라가도록 보여 주는 내용.
// 모든 문구는 content/lesson-plan.md 또는 각 모듈 코드에서만 가져왔다(새 사실 추가 금지).
// M2 정답·힌트는 서버에만 둔다 — 여기에 넣지 않는다.

export interface FallbackItem { label: string; text: string; kind?: "prompt" | "code" | "note" }
export interface Fallback { summary: string; items: FallbackItem[] }

const FIVE_ELEMENTS = [
  "너는 고등학교 [과목] 교사야. (역할)",
  "고[학년] 학생, 학습 수준은 중간이야. (대상)",
  "[단원명] 단원의 형성평가 문항 5개를 만들어 줘. (과제)",
  "객관식 3개, 서술형 2개. 각 문항에 성취기준을 표시해. (조건)",
  "표로: 번호 | 문항 | 정답 | 해설 | 성취기준 (형식)",
].join("\n");

const QUIZ_PAGE_PROMPT = [
  "위 문항 5개로 학생용 퀴즈 웹페이지를 만들어 줘.",
  "- HTML 파일 하나로, 인터넷만 있으면 열리게",
  "- 한 문제씩 보여주고, 제출하면 정답·해설 표시",
  "- 끝에 점수 표시, 학생 이름은 받지 말 것",
  "- 폰 화면에서도 보기 좋게",
].join("\n");

const SKILL_MD = [
  "---",
  "name: school-newsletter",
  "description: 한빛고 가정통신문을 학교 양식과 공문체로 작성한다. \"가정통신문\", \"학부모 안내\" 요청에 사용.",
  "---",
  "# 가정통신문 작성",
  "",
  "## 필요한 입력",
  "- 행사명, 일시, 장소, 대상, 준비물, 회신 필요 여부",
  "",
  "## 절차",
  "1. 빠진 입력이 있으면 먼저 묻는다",
  "2. assets/template.docx 양식을 따른다",
  "3. 인사말 → 안내 본문 → 회신서 순서로 쓴다",
  "",
  "## 말투",
  "- \"~하오니\", \"~바랍니다\" 공문체, 한 문장 40자 이내",
  "",
  "## 끝내기 전 점검",
  "- 날짜와 요일이 맞는가",
  "- 학생 개인정보가 없는가",
].join("\n");

const SKILL_TREE = [
  "school-newsletter/",
  "├── SKILL.md            ← 필수: 이름·설명·절차",
  "├── assets/",
  "│   └── template.docx   ← 우리 학교 양식",
  "└── references/",
  "    └── examples.md     ← 잘 쓴 가정통신문 2개",
].join("\n");

// 출처: src/modules/m7/index.ts TASKS (lesson-plan.md 391-409행 표)
const M7_TABLE = [
  "가정통신문·안내문 초안 → Chat (ChatGPT) · 짧고 빠름",
  "수업 발문·활동 아이디어 → Chat (ChatGPT, Claude) · 대화하며 다듬기",
  "교과서·연수 자료 요약·질문 → Chat (NotebookLM) · 올린 자료 안에서만 답함",
  "최신 정책·진학 정보 조사 → Chat (Perplexity, ChatGPT 검색) · 출처 확인 가능 (검색 포함 Chat)",
  "수행평가 루브릭 + 평가지 파일 → Work (ChatGPT Work, Claude Cowork) · 여러 단계를 한 번에",
  "연수·수업 슬라이드 제작 → Work (ChatGPT Work, Claude, Gamma) · 파일로 완성",
  "엑셀 성적·설문 결과 정리 → Work (ChatGPT Work, Copilot in Excel) · 표 계산 + 시각화",
  "구글 클래스룸·드라이브 자료 정리 → Work (Gemini(Workspace)) · 자료가 구글에 있음",
  "주간학습안내 매주 반복 → Work (맞춤형 GPT, 스킬) · 양식 고정 반복 (Work + 스킬, 스킬로 고정하면 더 좋음)",
  "학생용 퀴즈·단어장 웹앱 → Code (Codex, ChatGPT Sites, Claude Code) · 학생이 직접 사용",
  "동아리·학급 알림 PWA → Code (Codex, Claude Code) · 폰 설치형",
].join("\n");

export const FALLBACK: Record<string, Fallback> = {
  "/gemini": {
    summary: "ChatGPT 계정이 없을 때 Gemini로 같은 실습을 하는 순서예요. 문장을 복사해 Gemini에 붙여 넣으세요.",
    items: [
      { label: "1단계 문장(5요소)", kind: "prompt", text: "너는 고등학교 [과목] 교사야.\n고[학년] 학생, 학습 수준은 중간이야.\n[단원명] 단원의 형성평가 문항 5개를 만들어 줘.\n객관식 3개, 서술형 2개. 각 문항에 성취기준을 표시해.\n표로: 번호 | 문항 | 정답 | 해설 | 성취기준" },
      { label: "Gemini가 안 열릴 때", kind: "note", text: "학교(PENZ) 구글 계정에서 Gemini가 꺼져 있을 수 있어요. 그러면 옆 선생님 화면을 함께 보거나 /prompts의 문장을 메모해 두었다가 나중에 해 보세요." },
    ],
  },
  "/vibe": {
    summary: "바이브 코딩은 ‘첫 부탁 → 눌러 보기 → 한 가지씩 고치기’예요. 한 번에 다 시키지 말고 아래 문장을 하나씩 ChatGPT에 붙여 넣으세요.",
    items: [
      { label: "첫 부탁", kind: "prompt", text: "고등학교 과학 광합성 단원의 객관식 퀴즈 웹페이지를 만들어 줘. 문제 1개, 보기 4개, HTML 파일 하나로." },
      { label: "한 번에 시키는 완성 문장(막혔을 때)", kind: "prompt", text: "고등학교 과학 광합성 단원의 객관식 퀴즈 웹페이지를 만들어 줘. HTML 파일 하나로, 문제 1개와 보기 4개. 제목은 ‘우리 반 광합성 퀴즈’, 폰에서도 보기 좋게. 보기는 큰 버튼으로 누르면 색이 바뀌고, 제출하면 정답은 초록 오답은 주황으로 알려 줘. 오답이면 정답 대신 힌트부터. 학생 이름은 받지 말고 점수는 화면에서만 보여 줘." },
      { label: "안 될 때 말하는 법", kind: "note", text: "‘안 돼’ 대신 어떤 점이 안 되는지 그대로 말해요. 예: “제출을 눌러도 아무 일도 안 일어나. 고쳐 줘.” 결과는 꼭 직접 눌러 확인하세요." },
    ],
  },
  "/m1": {
    summary: "5요소(역할·대상·과제·조건·형식)를 모두 채운 완성 프롬프트와, 비교용 한 줄 프롬프트예요. 복사해서 Chat에 붙여 넣고 [과목]·[학년]·[단원명]만 바꾸세요.",
    items: [
      { label: "5요소 완성 프롬프트", kind: "prompt", text: FIVE_ELEMENTS },
      { label: "비교용 한 줄 프롬프트", kind: "prompt", text: "평가 문제 만들어줘" },
      { label: "확인 포인트", kind: "note", text: "정답·성취기준이 실제와 맞는지 교사가 검토한다(환각 체험)." },
    ],
  },
  "/m2": {
    summary: "[제출]을 누른 0.5초 동안 프론트엔드 → API → 백엔드 → 데이터베이스를 한 바퀴 돕니다. 오른쪽 4개 패널에서 무엇을 볼지 정리했어요.",
    items: [
      {
        label: "패널별로 볼 것",
        kind: "note",
        text: [
          "① 요청 JSON (프론트엔드 → API): 실제로 보낸 본문 그대로예요. 어떤 문항에 어떤 답을 보냈는지 봅니다.",
          "② 서버 채점 (백엔드): 서버가 정답과 비교해요. 정답은 학생 화면에 없고 서버에만 있습니다(부정행위 방지).",
          "③ DB 추가 행 (데이터베이스): 제출하면 장부에 한 줄이 추가돼요(언제, 몇 번, 무슨 답, 맞았는지).",
          "④ 응답 JSON (API → 프론트엔드): 서버가 돌려보낸 결과예요. 화면에 뜨는 결과가 여기서 옵니다.",
        ].join("\n"),
      },
      {
        label: "강의안의 요청·응답 예시 (단순화한 것)",
        kind: "code",
        text: [
          "요청  POST /api/submit   { \"question\": 1, \"answer\": \"3\" }",
          "응답  200 OK             { \"correct\": true, \"hint\": \"\" }",
        ].join("\n"),
      },
    ],
  },
  "/m3": {
    summary: "퀴즈 앱 해부 실습에서 모인 제출 기록을 문항별 오답률 막대로 봅니다. 오답률이 높은 문항이 다음 수업에서 다시 다룰 곳이에요.",
    items: [
      {
        label: "막대 읽는 법",
        kind: "note",
        text: [
          "문항마다 막대 하나예요. 막대가 길수록 오답률이 높습니다.",
          "막대 아래 글자 '오답률 N% (틀린 수/제출 수)'로 정확한 값을 확인하세요.",
          "오답률이 높은 문항이 다음 수업에서 다시 다룰 곳입니다.",
        ].join("\n"),
      },
      { label: "PIN은 강사만", kind: "note", text: "연수 강사 PIN은 강사만 알고 입력합니다. 참가자는 PIN 없이 퀴즈 앱 해부 실습에서 회차 코드로 참여해요. 이 화면이 막히면 강사 화면을 함께 보며 따라가세요." },
    ],
  },
  "/m4": {
    summary: "나이스 교육정보 개방 포털(open.neis.go.kr)의 급식 API는 주소에 학교 코드와 날짜를 넣으면 그날 메뉴가 JSON으로 와요.",
    items: [
      {
        label: "요청 주소 예시 (자리표시자)",
        kind: "code",
        text: [
          "https://open.neis.go.kr/hub/mealServiceDietInfo?Type=json",
          "  &ATPT_OFCDC_SC_CODE=[교육청코드]&SD_SCHUL_CODE=[학교코드]&MLSV_YMD=20261124",
        ].join("\n"),
      },
      { label: "연수 학교 기본값", kind: "note", text: "부경고등학교(부산광역시교육청): 교육청 코드 C10, 학교 코드 7150397. 날짜(MLSV_YMD)는 YYYYMMDD 8자리예요." },
      {
        label: "입력 칸 설명",
        kind: "note",
        text: [
          "ATPT_OFCDC_SC_CODE: 교육청 코드(영문 대문자 1자 + 숫자 2자리)",
          "SD_SCHUL_CODE: 학교 코드(숫자 7자리)",
          "MLSV_YMD: 날짜",
          "실제로는 포털에서 인증키를 발급받아 KEY=인증키를 붙여요. 이 사이트에서는 인증키가 서버에만 있고 화면에는 *** 로 가려져요.",
          "실제 호출이 안 되면 '샘플' 표시와 함께 가상 학교·메뉴가 나와요. 흐름을 보는 데는 충분해요.",
        ].join("\n"),
      },
      { label: "한 줄 정리", kind: "note", text: "“오늘 급식 알려주는 학급 페이지” = 이 API를 부르는 프론트엔드" },
    ],
  },
  "/m5": {
    summary: "쓰기 동작(일정 등록)의 시뮬레이션 흐름이에요. 가상 예시이고, 도구·인자 이름도 예시입니다.",
    items: [
      {
        label: "승인까지 5단계 흐름",
        kind: "note",
        text: [
          "1단계 사용자 문장: “@Google Calendar 다음 주 화요일 15시에 협의회 등록해 줘”처럼 앱(MCP로 연결된 서비스)을 불러서 부탁합니다.",
          "2단계 도구 목록: AI는 연결된 Google Calendar가 제공하는 도구 목록(일정 조회·일정 만들기·일정 삭제)을 먼저 확인합니다.",
          "3단계 호출 JSON: AI가 ‘일정 만들기’ 도구(create_event)를 골라 제목·시작·종료가 담긴 요청을 만듭니다.",
          "4단계 승인 확인: 쓰기 동작이에요. 실제 ChatGPT는 설정에 따라 묻지 않고 바로 실행하기도 해요. 시뮬레이션에서는 [승인]을 누르면 [다음 단계]로 이어가고, [거절]하면 아무 일도 일어나지 않고 멈춥니다.",
          "5단계 응답·완료: Google Calendar가 결과를 돌려줍니다. 승인 후 일정이 등록됐다고 알려 줍니다. (가상 예시)",
        ].join("\n"),
      },
      { label: "읽기 도구는?", kind: "note", text: "읽기 도구(일정 조회·파일 검색)는 이 시뮬레이션에서 승인 단계 없이 다음으로 넘어갑니다. 실제 서비스에서는 설정에 따라 다를 수 있으니 직접 확인하세요." },
    ],
  },
  "/m6": {
    summary: "폴더 하나가 스킬 하나예요. 완성된 SKILL.md 예시(school-newsletter)를 그대로 복사해 쓰세요.",
    items: [
      { label: "SKILL.md 완성 예시", kind: "code", text: SKILL_MD },
      { label: "폴더 구조", kind: "code", text: SKILL_TREE },
      { label: "핵심", kind: "note", text: "스킬은 평소에 이름과 설명만 AI가 알고 있다가, 요청이 설명과 맞으면 본문을 열어 그대로 따른다. 그래서 description에 ‘언제 쓰는지’를 분명히 적는 것이 핵심이다." },
    ],
  },
  "/m7": {
    summary: "판단 흐름: 답만 필요하면 Chat → 파일이 필요하면 Work → 학생이 직접 쓸 도구면 Code. 같은 일을 매주 하면 스킬·맞춤형 GPT로 고정한다.",
    items: [
      { label: "정답표 (업무 → 층 (도구 예) · 이유)", kind: "note", text: M7_TABLE },
    ],
  },
  "/prompts": {
    summary: "가장 많이 쓰는 카드 하나예요. 복사해서 그대로 붙여 넣으세요.",
    items: [
      { label: "미니 웹 도구: 학생용 퀴즈 페이지", kind: "prompt", text: QUIZ_PAGE_PROMPT },
      { label: "팁", kind: "note", text: "“오답이면 힌트를 먼저 보여줘”처럼 한 가지씩 수정 요청하며 반복 개선하세요." },
    ],
  },
  "/copilot": {
    summary: "PENZ 학교 계정의 Copilot Chat에서 바로 써 볼 수 있는 예시예요.",
    items: [
      { label: "공문 요약 (PDF 공문을 올린 뒤)", kind: "prompt", text: "담임이 할 일·기한만 표로" },
      { label: "팁", kind: "note", text: "개인 Microsoft 계정이 아니라 PENZ 계정으로 로그인하고, 화면에 방패(데이터 보호) 표시가 있는지 확인하세요. 유료 Copilot 포함 여부는 연수 전 확인이 필요해요." },
    ],
  },
  "/final": {
    summary: "3단계 실습의 마무리용 프롬프트예요. 1단계로 문항 5개를 만든 뒤 이어서 붙여 넣으세요.",
    items: [
      { label: "학생용 퀴즈 웹페이지 프롬프트", kind: "prompt", text: QUIZ_PAGE_PROMPT },
      { label: "유료 요금제: @Sites 한 줄", kind: "prompt", text: "@Sites 이 문항 5개로 퀴즈 사이트, 문항별 오답률을 교사만 보게" },
      { label: "팁", kind: "note", text: "공개하기 전에 학생 이름·성적·연락처가 없는지, 공개 범위가 목적에 맞는지(인터넷 전체 공개는 마지막 선택) 확인하세요." },
    ],
  },
};
