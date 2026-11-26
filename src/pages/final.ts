import { h, copyBlock, serviceNotice, pageTitle, PADLET_URL } from "../lib/ui.ts";
import "./final.css";

const STORE_KEY = "final-checklist";

const Q_PROMPT = [
  "너는 고등학교 [과목] 교사야. (역할)",
  "고[학년] 학생, 학습 수준은 중간이야. (대상)",
  "[단원명] 단원의 형성평가 문항 5개를 만들어 줘. (과제)",
  "객관식 3개, 서술형 2개. 각 문항에 성취기준을 표시해. (조건)",
  "표로: 번호 | 문항 | 정답 | 해설 | 성취기준 (형식)",
].join("\n");

const QUIZ_PROMPT = [
  "앞에서 만든 문항 5개(같은 대화창에 있어야 해요)로 학생용 퀴즈 웹페이지를 만들어 줘.",
  "- HTML 파일 하나로, 인터넷만 있으면 열리게",
  "- 한 문제씩 보여주고, 제출하면 정답·해설 표시",
  "- 끝에 점수 표시, 학생 이름은 받지 말 것",
  "- 폰 화면에서도 보기 좋게",
].join("\n");

const SITES_PROMPT_1 = "@Sites 이 문항 5개로 퀴즈 사이트, 문항별 오답률을 교사만 보게";
const SITES_PROMPT_2 = "@Sites " + QUIZ_PROMPT;

const CHECKS = [
  "학생 이름·성적·연락처가 화면이나 데이터에 없는가",
  "학생 입력을 받는다면 무엇을 받고 누가 보는지 안내했는가",
  "저작권 있는 사진·교과서 지문을 그대로 올리지 않았는가",
  "공개 범위가 목적에 맞는가(인터넷 전체 공개는 마지막 선택)",
];

function loadChecks(): boolean[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const arr = raw ? JSON.parse(raw) : null;
    if (Array.isArray(arr)) return CHECKS.map((_, i) => arr[i] === true);
  } catch { /* storage unavailable */ }
  return CHECKS.map(() => false);
}
function saveChecks(v: boolean[]) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(v)); } catch { /* ignore */ }
}

function steps(items: string[]) {
  return h("ol", { class: "fa-steps" }, items.map((t) => h("li", {}, t)));
}

export function mount(el: HTMLElement) {
  pageTitle("최종 과제 안내");

  const free = h(
    "section",
    { class: "card fa-path fa-free", "aria-labelledby": "fa-free-h" },
    h("span", { class: "badge" }, "무료"),
    h("h3", { id: "fa-free-h" }, "무료: 캔버스 HTML"),
    h("p", {}, "Sites가 없는 Free 계정 교사도 할 수 있어요. HTML 파일 하나로 만들어요."),
    steps([
      "위의 ‘먼저: 문항 5개’로 만든 문항을 준비해요.",
      "아래 프롬프트를 붙여넣어요.",
      "ChatGPT의 캔버스·미리보기로 확인해요.",
      "HTML을 내려받아 더블클릭하면 열려요.",
      "“오답이면 힌트를 먼저 보여줘”처럼 한 가지씩 수정을 요청해요.",
    ]),
    copyBlock(QUIZ_PROMPT),
    h("p", { class: "fa-note" }, "백엔드가 없으므로 점수는 저장되지 않아요. ‘저장하려면 무엇이 필요할까?’를 생각해 보세요(1교시 용어: DB)."),
  );

  const paid = h(
    "section",
    { class: "card fa-path fa-paid", "aria-labelledby": "fa-paid-h" },
    h("span", { class: "badge orange" }, "유료"),
    h("h3", { id: "fa-paid-h" }, "유료: @Sites"),
    h("p", {}, "공개 베타예요. Free·Go를 제외한 유료 요금제에서 쓸 수 있고, 요금제별 사용량 한도가 있어요(연수 전 확인 필요). 앞에 “@Sites”를 붙이면 주소까지 발급돼요."),
    steps([
      "Work를 열고 “@Sites …을 만들어 줘”라고 설명한다.",
      "ChatGPT가 비공개 미리보기를 만든다.",
      "미리보기를 눌러 보며 테스트한다(폰 화면 포함).",
      "“제출 버튼을 더 크게”처럼 한 가지씩 수정을 요청한다.",
      "배포(Deploy)하면 주소가 생긴다. 이때는 아직 나만 볼 수 있다.",
      "공유(Share)에서 공개 범위를 고른다. 학생용이면 링크 공개, 동료용이면 지정한 사람.",
      "동료에게 ‘편집 가능’ 권한을 주면 함께 고칠 수 있다(같은 워크스페이스).",
    ]),
    h("h4", {}, "프롬프트 예 1: 오답률을 교사만 보게"),
    copyBlock(SITES_PROMPT_1),
    h("h4", {}, "프롬프트 예 2: 무료 프롬프트 앞에 @Sites"),
    copyBlock(SITES_PROMPT_2),
    h("p", { class: "fa-note" }, "배포하는 주소는 모두 실제 운영 주소예요. 고칠 때는 버전 저장 → 확인 → 배포 순서로 하세요. 공개 범위는 나만(기본) → 지정한 사람 → 워크스페이스 → 인터넷 누구나."),
  );

  const state = loadChecks();
  const progress = h("p", { class: "fa-progress", role: "status", "aria-live": "polite" });
  const update = () => { progress.textContent = `${state.filter(Boolean).length} / ${CHECKS.length} 확인했어요`; };
  const list = h(
    "ul",
    { class: "fa-checks" },
    CHECKS.map((text, i) => {
      const id = `fa-check-${i}`;
      const box = h("input", { type: "checkbox", id, onchange: () => { state[i] = box.checked; saveChecks(state); update(); } });
      box.checked = state[i];
      return h("li", {}, h("label", { for: id, class: "fa-check" }, box, h("span", {}, text)));
    }),
  );
  update();

  el.append(
    serviceNotice(),
    h("h1", {}, "최종 과제 안내: 내 단원 퀴즈 만들기"),
    h("p", { class: "lead" }, "주제는 하나예요. 내 과목 한 단원의 형성평가 도구를 만들어, 학생이 폰으로 푸는 퀴즈 페이지(MVP)까지 키워 봅니다."),
    h("p", {}, h("a", { href: "/m2", "data-link": "" }, "이런 구조예요"), " — 퀴즈 앱이 화면·서버·DB로 어떻게 나뉘는지 직접 풀어 보며 확인할 수 있어요."),

    h("section", { class: "fa-section", "aria-labelledby": "fa-prep-h" },
      h("h2", { id: "fa-prep-h" }, "먼저: 문항 5개"),
      h("p", {}, "먼저 “평가 문제 만들어줘”만 입력해 결과를 본 뒤, 5요소(역할·대상·과제·조건·형식)를 넣은 아래 프롬프트와 비교해 보세요."),
      h("p", { class: "fa-note" }, "[ ] 안(과목·학년·단원명)은 내 내용으로 바꾼 뒤 붙여넣으세요. 바꾸지 않으면 AI가 대괄호 글자를 그대로 씁니다."),
      copyBlock(Q_PROMPT),
      h("p", { class: "fa-note" }, "정답·성취기준이 실제와 맞는지 교사가 반드시 검토하세요(환각 체험)."),
    ),

    h("section", { class: "fa-section", "aria-labelledby": "fa-paths-h" },
      h("h2", { id: "fa-paths-h" }, "두 갈래 중 하나를 고르세요"),
      h("p", {}, "Free 계정 교사는 Sites가 없어서, 3단계는 ‘캔버스 HTML’(무료)과 ‘Sites’(유료) 두 갈래로 나뉘어요."),
      h("div", { class: "fa-paths" }, free, paid),
    ),

    h("section", { class: "fa-section", "aria-labelledby": "fa-priv-h" },
      h("h2", { id: "fa-priv-h" }, "개인정보 규칙"),
      h("ul", { class: "fa-priv" },
        h("li", {}, "프롬프트에 “학생 이름은 받지 말 것”을 넣어요."),
        h("li", {}, "개인정보는 입력하지 않아요. 학생 이름·성적·연락처를 화면이나 데이터에 넣지 않아요."),
        h("li", {}, "학생 입력을 받는다면 무엇을 받고 누가 보는지 안내해요."),
      ),
    ),

    h("section", { class: "fa-section", "aria-labelledby": "fa-check-h" },
      h("h2", { id: "fa-check-h" }, "공개 전 체크리스트"),
      list,
      progress,
      h("p", { class: "fa-note" }, "이 체크는 이 브라우저에만 저장됩니다"),
    ),

    h("section", { class: "fa-section", "aria-labelledby": "fa-share-h" },
      h("h2", { id: "fa-share-h" }, "공유와 사후 과제"),
      h("ul", {},
        h("li", {}, "공유(10분): 2–3명이 화면을 보여 주고, “다음 주 내 수업에 쓸 한 가지”를 패들렛 ‘다음 주에 쓸 한 가지’에 적어요."),
        h("li", {}, "사후 과제: 2주 뒤 ‘실제로 써본 사례 1개’를 패들렛 ‘2주 뒤 사례 나눔’에 올려요 → 학교 내 활용 사례집으로 축적"),
      ),
      h("p", {}, h("a", { class: "btn accent", href: PADLET_URL, target: "_blank", rel: "noopener" }, "💬 패들렛 열기 ↗")),
      h("p", { class: "fa-note" }, "패들렛에는 이름 대신 과목·학년만 적고, 학생 이름·성적·사진은 올리지 않아요. 패들렛은 외부 서비스예요."),
    ),

    h("section", { class: "fa-section", "aria-labelledby": "fa-next-h" },
      h("h2", { id: "fa-next-h" }, "연수 후 첫 주 체크리스트"),
      h("ol", {},
        h("li", {}, "월: 내 업무 중 하나를 고른다(가정통신문·문항·활동지·공문 요약 등)."),
        h("li", {}, h("a", { href: "/prompts", "data-link": "" }, "프롬프트 카드"), "에서 비슷한 카드를 복사하고 [ ]를 내 내용으로 바꾼다."),
        h("li", {}, "결과를 그대로 쓰지 말고 사실·날짜·성취기준을 직접 확인한다."),
        h("li", {}, "아래 사례 메모 양식을 채워 둔다."),
        h("li", {}, "금: 2주 뒤 공유할 사례 1개를 정한다. 개인정보는 지우고 공유한다."),
      ),
      h("h3", {}, "사례 메모 양식(복사해서 메모장에 붙여넣기)"),
      copyBlock("과목·학년: \n한 일(어디에 AI를 썼나): \n걸린 시간(전 → 후): \n확인한 점·고친 점: \n다음에 바꿀 점: \n※ 학생 이름·성적·연락처는 적지 않는다"),
    ),

    h("section", { class: "fa-section", "aria-labelledby": "fa-adv-h" },
      h("h2", { id: "fa-adv-h" }, "이미 익숙하다면: 중급 트랙"),
      h("ul", {},
        h("li", {}, "3단계 퀴즈를 ", h("a", { href: "/m6", "data-link": "" }, "스킬(SKILL.md)"), "로 바꿔 매번 같은 양식으로 출제되게 한다."),
        h("li", {}, "Work 예약 작업으로 ‘매주 금요일 주간학습안내 초안’을 내 업무에 적용해 본다(발송은 하지 않고 초안만)."),
        h("li", {}, "연결한 앱의 권한을 점검한다: 필요한 폴더만 연결했는지, 학생 개인정보 폴더는 빠졌는지."),
        h("li", {}, h("a", { href: "/m5", "data-link": "" }, "MCP 호출 시뮬레이터"), "에서 쓰기 동작이 설정에 따라 바로 실행될 수 있음을 확인하고, 요청에 ‘초안만’을 적는 습관을 만든다."),
      ),
    ),
  );
}
