import { h, copyBlock, serviceNotice, pageTitle } from "../lib/ui.ts";
import "./prompts.css";

type Cat = "work" | "sites" | "skill";
interface Card { cat: Cat; title: string; when: string; prompt: string; note?: string }

const CATS: { id: "all" | Cat; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "work", label: "Work" },
  { id: "sites", label: "Sites" },
  { id: "skill", label: "스킬" },
];
const CAT_LABEL: Record<Cat, string> = { work: "Work", sites: "Sites(@Sites)", skill: "스킬" };

const SITES_NOTE = "공개 베타. Free·Go를 제외한 유료 요금제에서 쓸 수 있고, 요금제별 사용량 한도가 있어요.";

const CARDS: Card[] = [
  // Work
  {
    cat: "work",
    title: "현장체험학습 준비",
    when: "Work는 드라이브에서 직접 찾아 읽고, 계획 → 실행 → 점검을 거쳐 문서·표·슬라이드 파일 3개를 만들어 줘요. 중간에 질문하고, 저장·발송 전에는 승인을 받아요.",
    prompt: "@Google Drive의 ‘현장체험 계획서’를 읽고, 가정통신문·학생 안전 체크리스트·당일 시간표 슬라이드를 만들어 줘. 발송은 하지 말고 초안만.",
    note: "학교 계정을 연결하면 Work가 그 안의 자료를 읽어요. 학생 개인정보가 담긴 폴더는 연결 범위에서 빼세요.",
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
    prompt: "12월 결업식 가정통신문 써 줘",
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
