import { h, copyBlock, serviceNotice, pageTitle } from "../lib/ui.ts";
import "./prompts.css";

type Cat = "chat" | "work" | "sites" | "skill";
interface Card { cat: Cat; title: string; when: string; prompt: string; note?: string }

const CATS: { id: "all" | Cat; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "chat", label: "Chat·학교 업무" },
  { id: "work", label: "Work" },
  { id: "sites", label: "Sites" },
  { id: "skill", label: "스킬" },
];
const CAT_LABEL: Record<Cat, string> = { chat: "Chat", work: "Work", sites: "Sites(@Sites)", skill: "스킬" };

const SITES_NOTE = "공개 베타. Free·Go를 제외한 유료 요금제에서 쓸 수 있고, 요금제별 사용량 한도가 있어요.";

const CARDS: Card[] = [
  // Chat — 3교시 1~2단계와 학교 업무 (대괄호 [ ] 안은 내 내용으로 바꾼 뒤 붙여넣기)
  {
    cat: "chat",
    title: "형성평가 문항 5개 (5요소)",
    when: "3교시 1단계. 역할·대상·과제·조건·형식을 모두 넣은 프롬프트예요. [ ] 안을 내 과목·학년·단원으로 바꾼 뒤 붙여넣으세요.",
    prompt: "너는 고등학교 [과목] 교사야. (역할)\n고[학년] 학생, 학습 수준은 중간이야. (대상)\n[단원명] 단원의 형성평가 문항 5개를 만들어 줘. (과제)\n객관식 3개, 서술형 2개. 각 문항에 성취기준을 표시해. (조건)\n표로: 번호 | 문항 | 정답 | 해설 | 성취기준 (형식)",
    note: "정답·성취기준이 실제와 맞는지 교사가 반드시 검토하세요.",
  },
  {
    cat: "chat",
    title: "맞춤형 GPT 지침 (형성평가 도우미)",
    when: "3교시 2단계. 맞춤형 GPT의 ‘지침’ 칸에 통째로 붙여넣으면 매번 같은 형식으로 문항을 만들어 줘요. [ ] 안은 내 내용으로 바꾸세요.",
    prompt: "너는 고등학교 [과목] 형성평가 출제 도우미야.\n- 대상은 고[학년] 학생이고, 단원을 알려 주면 문항을 만든다.\n- 항상 객관식 3개 + 서술형 2개를 만든다.\n- 항상 표 형식으로: 번호 | 문항 | 정답 | 해설 | 성취기준.\n- 모든 문항에 성취기준을 표시한다. 모르면 추측하지 말고 ‘확인 필요’라고 쓴다.\n- 학생 이름·성적 같은 개인정보는 요청하지도, 쓰지도 않는다.\n- 마지막에 교사가 검토할 점 3가지를 적는다.",
    note: "무료 계정도 맞춤형 GPT를 만들 수 있는지는 요금제에 따라 달라요. 안 되면 대화 맨 앞에 이 글을 붙여넣어 쓰세요.",
  },
  {
    cat: "chat",
    title: "가정통신문 초안",
    when: "행사·안내 가정통신문 초안이 필요할 때. [ ] 안을 바꾸세요. 학생 이름·연락처는 넣지 마세요.",
    prompt: "고등학교 가정통신문을 공문체(“~하오니”, “~바랍니다”)로 써 줘.\n행사명: [행사명]\n일시·장소: [일시] / [장소]\n대상: [대상]\n준비물: [준비물]\n회신서가 필요하면 마지막에 붙여 줘. 한 문장은 40자 이내로.",
  },
  {
    cat: "chat",
    title: "학부모 상담 안내 문구",
    when: "상담 주간 안내 문자·알림장 문구를 만들 때. 학생 개인 정보 없이 일반 안내만 만들어요.",
    prompt: "고등학교 학부모 상담 주간 안내 문구를 3종으로 써 줘: ① 문자(80자 이내) ② 알림장 공지 ③ 정중한 안내문. 일정은 [상담 기간], 방법은 [방문/전화/화상]. 개인정보는 쓰지 말고, 신청 방법만 안내해 줘.",
  },
  {
    cat: "chat",
    title: "수업 활동지 만들기",
    when: "단원 활동지(개념 확인 + 토의 문제)가 필요할 때.",
    prompt: "고[학년] [과목] [단원명] 단원의 활동지를 A4 한 장 분량으로 만들어 줘. 구성: ① 핵심 개념 확인 4문항 ② 모둠 토의 질문 2개 ③ 오늘 배운 점 한 줄 쓰기. 정답과 해설은 교사용으로 따로 표시해 줘.",
  },
  {
    cat: "chat",
    title: "공문 요약 (할 일·기한 표)",
    when: "긴 공문을 올려 담임이 할 일과 기한만 뽑을 때. 개인정보가 든 공문은 올리지 마세요.",
    prompt: "올린 공문에서 담임이 해야 할 일과 기한만 표로 정리해 줘. 열: 할 일 | 기한 | 제출처 | 비고. 공문에 없는 내용은 추측하지 말고 ‘공문에 없음’이라고 써 줘.",
  },
  // Work
  {
    cat: "work",
    title: "현장체험학습 준비",
    when: "Work는 드라이브에서 직접 찾아 읽고, 계획 → 실행 → 점검을 거쳐 문서·표·슬라이드 파일 3개를 만들어 줘요. 중간에 질문하고, 저장·발송은 설정에 따라 먼저 묻거나 바로 실행되니, “초안만”처럼 범위를 꼭 적어요.",
    prompt: "@Google Drive의 ‘현장체험 계획서’를 읽고, 가정통신문·학생 안전 체크리스트·당일 시간표 슬라이드를 만들어 줘. 발송은 하지 말고 초안만.",
    note: "학교 계정을 연결하면 Work가 그 안의 자료를 읽어요. 학생 개인정보가 담긴 폴더는 연결 범위에서 빼세요. 드라이브 연결이 안 되면 가이드북 자료실의 ‘가상 현장체험 계획서’를 내려받아 채팅에 올리고, 문장에서 ‘@Google Drive의’만 빼고 쓰세요.",
  },
  {
    cat: "work",
    title: "수행평가 패키지",
    when: "평가 · 수행평가 계획서 하나로 루브릭 표, 학생 안내문, 채점 시트를 한꺼번에 만들 때.",
    prompt: "업로드한 수행평가 계획서로 루브릭 표, 학생용 안내문, 채점 시트 템플릿을 만들어 줘.",
  },
  {
    cat: "work",
    title: "설문 결과 → 발표 자료",
    when: "분석 · 설문 결과 엑셀을 학부모 설명회용 슬라이드로 정리할 때.",
    prompt: "설문 결과 엑셀을 분석해 학부모 설명회용 슬라이드 8장으로 정리해 줘. 그래프 포함.",
  },
  {
    cat: "work",
    title: "매주 자동 초안 (예약 작업)",
    when: "예약 작업 · 매주 반복되는 안내문 초안을 자동으로 만들어 둘 때.",
    prompt: "매주 금요일 15시에 @Google Drive의 다음 주 학사 일정을 읽고 주간학습안내 초안을 만들어 두어",
    note: "예약 작업은 한 번 / 반복 / 이벤트 발생 시 / 변화 감시 중에서 고를 수 있어요.",
  },
  // Sites
  {
    cat: "sites",
    title: "단원 형성평가 퀴즈",
    when: "쓰는 기능: 프론트 + DB + 접근 권한. 문항별 오답률은 교사만 보게 할 때.",
    prompt: "@Sites 이 문항 5개로 퀴즈 사이트, 문항별 오답률을 교사만 보게",
    note: SITES_NOTE,
  },
  {
    cat: "sites",
    title: "미니 웹 도구: 학생용 퀴즈 페이지",
    when: "3교시 3단계. 문항 5개를 학생이 푸는 HTML 퀴즈로 만들 때. 무료는 캔버스 미리보기로 확인하고, 유료는 앞에 “@Sites”를 붙이면 주소까지 발급돼요.",
    prompt: "위 문항 5개로 학생용 퀴즈 웹페이지를 만들어 줘.\n- HTML 파일 하나로, 인터넷만 있으면 열리게\n- 한 문제씩 보여주고, 제출하면 정답·해설 표시\n- 끝에 점수 표시, 학생 이름은 받지 말 것\n- 폰 화면에서도 보기 좋게",
    note: "백엔드가 없으면 점수는 저장되지 않아요. " + SITES_NOTE,
  },
  {
    cat: "sites",
    title: "동아리 모집 페이지",
    when: "쓰는 기능: 프론트 + 제출 저장.",
    prompt: "동아리 소개, 활동 사진, 지원 양식이 있는 페이지",
    note: SITES_NOTE,
  },
  {
    cat: "sites",
    title: "학급 알림판",
    when: "쓰는 기능: 프론트 + 교사 편집.",
    prompt: "주간 일정·준비물을 보여주는 학급 페이지, 내가 매주 수정",
    note: SITES_NOTE,
  },
  {
    cat: "sites",
    title: "학생 투표·설문",
    when: "쓰는 기능: 프론트 + DB + 집계.",
    prompt: "체험학습 장소 3곳 투표, 결과는 막대그래프",
    note: SITES_NOTE,
  },
  {
    cat: "sites",
    title: "교무실 업무 포털",
    when: "쓰는 기능: 워크스페이스 한정 공개.",
    prompt: "학기 일정·양식 링크·담당자를 모은 내부 페이지",
    note: SITES_NOTE,
  },
  // Skills
  {
    cat: "skill",
    title: "스킬 만들기: 가정통신문",
    when: "채팅에 한 줄로 요청하면 기본 포함된 skill-creator 스킬이 작동해요. AI가 입력 항목·순서·말투·점검 기준을 물어보고, 예전 가정통신문 1–2개를 올리면 품질이 올라가요.",
    prompt: "가정통신문 작성 스킬을 만들어 줘",
    note: "채팅 속 개인 스킬은 Business·Enterprise·Edu 등 워크스페이스 요금제에서 쓸 수 있고(Enterprise·Edu는 관리자가 켜야 함), 개인 Free·Plus·Pro 요금제에서는 쓸 수 없어요.",
  },
  {
    cat: "skill",
    title: "만든 스킬 써 보기",
    when: "스킬을 설치한 뒤 새 채팅에서 요청하면 스킬이 자동으로 쓰여요(또는 @스킬명).",
    prompt: "12월 종업식 가정통신문 써 줘",
  },
  {
    cat: "skill",
    title: "입문자용: 방금 한 작업을 스킬로",
    when: "스킬을 직접 만들 필요는 없어요. 이렇게 말하면 AI가 지침을 만들어 줘요.",
    prompt: "방금 한 작업을 다음에도 쓸 수 있게 정리해줘",
  },
  {
    cat: "skill",
    title: "무료 계정: 맞춤형 GPT 지침 예",
    when: "무료 계정이면 같은 원리(고정된 지침)를 맞춤형 GPT의 ‘지침’ 칸이나 프로젝트로 체험해요. 1단계 프롬프트를 고정 규칙으로 바꿔 넣어요.",
    prompt: "항상 표 형식, 항상 성취기준 포함",
    note: "GPT 만들기는 유료, 프로젝트 생성은 무료 가능 범위 확인 필요.",
  },
];

export function mount(el: HTMLElement) {
  pageTitle("프롬프트 카드 모음");
  let current: "all" | Cat = "all";

  const status = h("p", { class: "pc-status", role: "status", "aria-live": "polite" });
  const buttons = new Map<string, HTMLButtonElement>();
  const cards = CARDS.map((c, i) => {
    const titleId = `pc-title-${i}`;
    const article = h(
      "article",
      { class: `card pc-card pc-${c.cat}`, "aria-labelledby": titleId, "data-cat": c.cat },
      h("div", { class: "pc-head" }, h("span", { class: "badge orange" }, CAT_LABEL[c.cat]), h("h2", { id: titleId, class: "pc-title" }, c.title)),
      h("p", { class: "pc-when" }, h("strong", {}, "언제 쓰나요? "), c.when),
      copyBlock(c.prompt),
      c.note ? h("p", { class: "pc-note" }, c.note) : null,
    );
    return { c, article };
  });

  function apply() {
    let n = 0;
    for (const { c, article } of cards) {
      const show = current === "all" || c.cat === current;
      article.hidden = !show;
      if (show) n++;
    }
    for (const [id, b] of buttons) b.setAttribute("aria-pressed", String(id === current));
    status.textContent = `${n}개의 카드를 보여 주고 있어요.`;
  }

  const filterBar = h(
    "div",
    { class: "btn-row pc-filters", role: "group", "aria-label": "카테고리 필터" },
    CATS.map(({ id, label }) => {
      const b = h("button", { class: "btn secondary pc-filter", type: "button", "aria-pressed": "false", onclick: () => { current = id; apply(); } }, label);
      buttons.set(id, b);
      return b;
    }),
  );

  el.append(
    serviceNotice(),
    h("h1", {}, "프롬프트 카드 모음"),
    h("p", { class: "lead" }, "강의안의 Work·Sites·스킬 프롬프트예요. 복사해서 각자 사용하는 서비스에 붙여넣으세요. 이 사이트는 AI 서비스를 대신 호출하지 않아요."),
    h("p", {}, "기능과 요금제는 바뀔 수 있으니 연수 전날 실제 화면으로 확인하세요."),
    filterBar,
    status,
    h("div", { class: "grid cols-2 pc-grid" }, cards.map((x) => x.article)),
  );
  apply();
}
