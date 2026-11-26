// "🚀 빨리 끝냈다면" 확장 과제. 일찍 끝낸 교사용.
// 모든 문구는 content/lesson-plan.md 또는 각 모듈 코드에서만 가져왔다(새 사실 추가 금지).
// M2 정답·힌트는 서버에만 둔다 — 여기에 넣지 않는다.

export interface ExtraItem { label: string; text: string; kind?: "prompt" | "note" }
export const EXTRA: Record<string, { summary: string; items: ExtraItem[] }> = {
  // 출처: lesson-plan.md 444-456행 (1단계), src/modules/m1/index.ts
  "/m1": {
    summary: "같은 5요소로 다른 과목·단원의 프롬프트를 하나 더 만들어 비교해 보세요.",
    items: [
      { label: "다른 과목으로 한 번 더", kind: "note", text: "[과목]·[학년]·[단원명] 자리를 다른 과목이나 다른 단원으로 바꿔 5요소를 다시 채워 보세요. 5요소 중 어느 칸을 바꿨을 때 결과가 가장 달라지는지 확인합니다." },
      { label: "조건·형식 칸만 바꿔 보기", kind: "prompt", text: "객관식 3개, 서술형 2개. 각 문항에 성취기준을 표시해.\n표로: 번호 | 문항 | 정답 | 해설 | 성취기준" },
      { label: "검토 습관", kind: "note", text: "정답·성취기준이 실제와 맞는지 교사가 검토합니다(환각 체험). 틀린 곳이 있으면 어디였는지 적어 두세요." },
    ],
  },
  // 출처: lesson-plan.md 67-76, 133-141, 479행, src/modules/m2/index.ts
  "/m2": {
    summary: "회차 코드를 넣고 한 번, 코드 없이 한 번 풀어서 옆 패널을 비교해 보세요.",
    items: [
      { label: "연습 모드 vs 회차 코드", kind: "note", text: "코드 없이 풀면 연습 모드예요(채점만 하고 저장하지 않아요). 회차 코드를 넣고 풀면 제출 기록이 저장돼요. 두 경우에 옆 패널 중 어느 것이 달라지는지 찾아보세요." },
      { label: "저장하려면 무엇이 필요할까?", kind: "note", text: "3교시 퀴즈 페이지는 백엔드가 없어 점수가 저장되지 않아요. ‘제출 기록을 저장해줘(=DB)’, ‘정답은 서버에만 둬(=백엔드)’처럼 용어로 요청하면 결과물 품질이 달라져요." },
      { label: "용어로 요청해 보기", kind: "prompt", text: "위 퀴즈 페이지에 제출 기록을 저장해줘. 정답은 서버에만 둬." },
    ],
  },
  // 출처: lesson-plan.md 234, 481행, src/modules/m3/index.ts
  "/m3": {
    summary: "오답률 표를 보고 다음 수업에 쓸 한 가지를 적어 보세요.",
    items: [
      { label: "오답률이 높은 문항 찾기", kind: "note", text: "퀴즈 앱 해부 실습에서 모인 제출 기록을 문항별 오답률로 봅니다. 오답률이 높은 문항이 다음 수업에서 다시 다룰 곳이에요. 그 문항을 하나 골라 다음 수업에서 어떻게 다룰지 한 줄로 적어 보세요." },
      { label: "내 퀴즈에도 오답률을 (유료 요금제)", kind: "prompt", text: "@Sites 이 문항 5개로 퀴즈 사이트, 문항별 오답률을 교사만 보게" },
      { label: "공유 한 줄", kind: "note", text: "“다음 주 내 수업에 쓸 한 가지”를 적어 두면 공유 시간에 바로 말할 수 있어요." },
    ],
  },
  // 출처: lesson-plan.md 124-141행, src/modules/m4/index.ts
  "/m4": {
    summary: "급식 API가 ‘다른 서비스 자료를 가져오는 프론트엔드’의 예라는 점을 내 업무로 옮겨 보세요.",
    items: [
      { label: "날짜를 바꿔 불러 보기", kind: "note", text: "날짜(YYYYMMDD 8자리)를 바꿔 다시 불러 보세요. 그날 급식 정보가 없을 수 있어요." },
      { label: "필요한 구성 고르기", kind: "note", text: "보여주기만 하면 프론트엔드만, 기록을 모아야 하면 프론트 + 백엔드 + DB, 급식·날씨처럼 다른 서비스 자료를 가져와야 하면 프론트 + 외부 API예요. 내 학급 페이지에 넣고 싶은 것은 어느 쪽인지 적어 보세요." },
      { label: "‘오늘 급식’ 학급 페이지 요청 예", kind: "prompt", text: "오늘 급식을 알려주는 학급 페이지를 만들어 줘. 나이스 교육정보 개방 포털의 급식 식단 API를 부르는 프론트엔드로, 인증키는 화면에 보이지 않게 해줘." },
    ],
  },
  // 출처: lesson-plan.md 264, 285-303행, src/modules/m5/index.ts
  "/m5": {
    summary: "다른 문장으로 한 번 더 돌려 보고, 읽기와 쓰기 동작의 차이를 찾아보세요.",
    items: [
      { label: "다른 문장으로 다시", kind: "note", text: "위에서 다른 문장을 골라 1단계부터 다시 따라가 보세요. 읽기 도구(조회·검색)는 승인 단계 없이 넘어가고, 쓰기 도구는 사람의 승인을 거치는지 비교합니다." },
      { label: "드라이브 연결 요청 예", kind: "prompt", text: "@Google Drive 에서 2학기 평가 계획서 찾아 요약해 줘" },
      { label: "연결 전 확인", kind: "note", text: "앱을 연결하면 AI가 그 계정의 자료에 접근해요. 학교 계정 연결은 학교 정보보안 지침을 먼저 확인하세요." },
    ],
  },
  // 출처: lesson-plan.md 266, 305-348, 378-380행, src/modules/m6/index.ts
  "/m6": {
    summary: "완성한 SKILL.md에 예시 파일을 더하거나, 내 업무용 스킬을 하나 더 만들어 보세요.",
    items: [
      { label: "references/examples.md 추가", kind: "note", text: "폴더 구조의 references/examples.md에 ‘잘 쓴 가정통신문 2개’를 두듯, 내 업무에서 잘 쓴 결과물 2개를 떠올려 적어 보세요. 예전 자료를 올리면 품질이 올라가요(개인정보 지운 것으로)." },
      { label: "방금 한 작업을 스킬로", kind: "prompt", text: "방금 한 작업을 다음에도 쓸 수 있게 정리해줘" },
      { label: "다른 스킬 후보", kind: "note", text: "형성평가 출제(성취기준 표시 문항·해설·루브릭), 주간학습안내(학사 일정 → 고정 양식 안내문) 중 하나로 같은 형식의 SKILL.md를 써 보세요. description에 ‘언제 쓰는지’를 분명히 적는 것이 핵심이에요." },
    ],
  },
  // 출처: lesson-plan.md 391-409행, src/modules/m7/index.ts
  "/m7": {
    summary: "내 실제 업무 2개를 같은 기준으로 Chat · Work · Code 중에 분류해 보세요.",
    items: [
      { label: "내 업무 2개 분류", kind: "note", text: "이번 주에 한 업무 2개를 떠올려 결과물이 무엇인지(답변/파일/프로그램)부터 적고 층을 고르세요. 판단 흐름: 답만 필요하면 Chat → 파일이 필요하면 Work → 학생이 직접 쓸 도구면 Code." },
      { label: "매주 반복하는 일은?", kind: "note", text: "같은 일을 매주 한다면 스킬·맞춤형 GPT로 고정해요. 내 업무 중 해당하는 것이 있는지 찾아보세요." },
    ],
  },
  // 출처: lesson-plan.md 201-205, 234-238행, src/pages/prompts.ts
  "/prompts": {
    summary: "카드의 학교 예시를 내 과목·내 자료로 바꿔서 한 번 더 써 보세요.",
    items: [
      { label: "내 업무로 바꿔 쓰기", kind: "note", text: "카드 하나를 골라 과목·학년·자료 이름만 내 것으로 바꿔 보세요. 학생 이름·성적·상담 내용 같은 개인정보는 넣지 않습니다." },
      { label: "Work 카드 변형", kind: "prompt", text: "업로드한 수행평가 계획서로 루브릭 표, 학생용 안내문, 채점 시트 템플릿을 만들어 줘." },
      { label: "Sites 카드 변형 (유료 요금제)", kind: "prompt", text: "@Sites 체험학습 장소 3곳 투표, 결과는 막대그래프" },
    ],
  },
  // 출처: lesson-plan.md 부록(연수 운영 팁·교사 활용), src/pages/copilot.ts
  "/copilot": {
    summary: "PENZ 계정의 Copilot Chat을 한 번 더 써 보세요.",
    items: [
      { label: "같은 단원 퀴즈로 비교", kind: "note", text: "Copilot Chat으로 같은 단원 퀴즈 문항을 만들어 3교시 ChatGPT 결과와 비교해 보세요. 결과물은 초안이므로 사실·성취기준 일치를 교사가 확인해야 해요." },
      { label: "수업 삽화 요청 예", kind: "prompt", text: "열대우림 단면도를 교과서 삽화 느낌으로, 글자 없이" },
      { label: "지식방 질문 예(Notebooks)", kind: "prompt", text: "이 자료 안에서만 답해" },
    ],
  },
  // 출처: lesson-plan.md 467-481행(3단계), 240-245행(공개 전 체크), 483-496행(그 외 제안)
  "/final": {
    summary: "퀴즈 페이지를 한 가지씩 고쳐 보고, 공개 전 체크까지 마무리해 보세요.",
    items: [
      { label: "한 가지씩 수정 요청", kind: "prompt", text: "오답이면 힌트를 먼저 보여줘" },
      { label: "저장하려면 무엇이 필요할까?", kind: "note", text: "HTML 파일만으로는 점수가 저장되지 않아요(백엔드가 없음). 저장하려면 무엇이 필요한지 1교시 용어(백엔드·데이터베이스)로 적어 보세요." },
      { label: "공개 전 체크 · 사후 과제", kind: "note", text: "학생 이름·성적·연락처가 없는지, 공개 범위가 목적에 맞는지(인터넷 전체 공개는 마지막 선택) 확인하세요. 사후 과제로 2주 뒤 ‘실제로 써본 사례 1개’ 공유가 제안돼 있어요." },
    ],
  },
};
