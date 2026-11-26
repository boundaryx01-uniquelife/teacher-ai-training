import { h, copyBlock, serviceNotice, pageTitle } from "../lib/ui.ts";
import "./gemini.css";

/**
 * Gemini 가이드: ChatGPT 계정이 없는 선생님이 같은 실습을 Gemini(구글 계정)로 따라 하는 방법.
 * 메뉴 이름·허용 범위는 학교·교육청 설정과 업데이트에 따라 다르므로 ‘확인할 것’으로 적고 단정하지 않는다.
 */
function table(head: string[], rows: string[][], caption: string): HTMLElement {
  return h("div", { class: "table-wrap" }, h("table", {},
    h("caption", { class: "sr-only" }, caption),
    h("thead", {}, h("tr", {}, head.map((t) => h("th", { scope: "col" }, t)))),
    h("tbody", {}, rows.map((r) => h("tr", {}, r.map((c, i) => i === 0 ? h("th", { scope: "row" }, c) : h("td", {}, c)))))));
}

export const GEMINI_STEP1 = "너는 고등학교 [과목] 교사야.\n고[학년] 학생, 학습 수준은 중간이야.\n[단원명] 단원의 형성평가 문항 5개를 만들어 줘.\n객관식 3개, 서술형 2개. 각 문항에 성취기준을 표시해.\n표로: 번호 | 문항 | 정답 | 해설 | 성취기준";
export const GEMINI_GEM = "너는 고등학교 [과목] 형성평가 출제 도우미야.\n- 대상은 고[학년] 학생이고, 단원을 알려 주면 문항을 만든다.\n- 항상 객관식 3개 + 서술형 2개를 만든다.\n- 항상 표 형식으로: 번호 | 문항 | 정답 | 해설 | 성취기준.\n- 모든 문항에 성취기준을 표시한다. 모르면 추측하지 말고 ‘확인 필요’라고 쓴다.\n- 학생 이름·성적 같은 개인정보는 요청하지도, 쓰지도 않는다.";
export const GEMINI_STEP3 = "앞에서 만든 문항 5개로 학생용 퀴즈 웹페이지를 만들어 줘.\n- HTML 파일 하나로\n- 한 문제씩, 제출하면 정답·해설 표시\n- 끝에 점수, 학생 이름은 받지 말 것\n- 폰 화면에서도 보기 좋게";

export function mount(el: HTMLElement) {
  pageTitle("Gemini 가이드");
  el.append(h("div", { class: "gm-page" },
    serviceNotice(),
    h("h1", {}, "Gemini로 같은 실습 하기"),
    h("p", { class: "lead" }, "ChatGPT 계정이 없어도 괜찮아요. 부산 교사 계정(PENZ)으로 구글에 로그인되는 경우가 많아서, 같은 문장을 Gemini에 붙여 넣어 똑같이 해 볼 수 있어요."),
    h("p", { class: "hint" }, "이 페이지는 Gemini를 호출하지 않아요. 문장을 복사해서 각자 Gemini 창에 붙여 넣으세요."),
    h("div", { class: "notice", role: "note" }, h("strong", {}, "먼저 확인"), h("ul", {},
      h("li", {}, "gemini.google.com 에 학교(PENZ) 구글 계정으로 들어가 보세요. 교육청·학교 설정에 따라 Gemini가 꺼져 있을 수 있어요(그러면 개인 계정이나 다른 도구를 쓰거나, 옆 선생님 화면을 함께 봐요)."),
      h("li", {}, "화면에 데이터 보호 안내가 있는지 읽어 보고, 어느 계정이든 학생 이름·성적·연락처는 넣지 않아요."),
      h("li", {}, "메뉴 이름과 위치는 업데이트로 바뀔 수 있어요. 안 보이면 ‘안 보여요’ 하고 강사에게 알려 주세요."))),
    h("section", { "aria-labelledby": "gm-map-h" },
      h("h2", { id: "gm-map-h" }, "ChatGPT에서 하던 것은 Gemini에서 이렇게"),
      table(["연수에서 한 것", "ChatGPT", "Gemini에서는"], [
        ["문항 만들기(프롬프트 5요소)", "채팅(Chat)", "Gemini 채팅 — 같은 문장을 그대로 붙여 넣기"],
        ["나만의 GPT(반복 업무 고정)", "맞춤형 GPT", "Gem(맞춤 도우미) — 지침 칸에 규칙을 저장"],
        ["학생용 퀴즈 웹페이지", "캔버스 / Sites", "Gemini의 캔버스(Canvas)로 만들어 미리보기 → HTML 파일로 저장"],
        ["내 자료 안에서만 답하기", "프로젝트·지식 파일", "NotebookLM(자료를 올려 그 안에서만 답)"],
        ["구글 문서·드라이브 정리", "플러그인(@Google Drive)", "구글 문서·드라이브 안의 Gemini(관리자가 켠 경우)"],
      ], "ChatGPT와 Gemini 기능 대응표"),
      h("p", { class: "hint" }, "스킬·Sites처럼 Gemini에 똑같은 기능이 없는 것은 ‘Gem 지침’과 ‘HTML 파일 만들기’로 비슷하게 해요. 기능 이름은 자주 바뀌니 화면에서 확인하세요.")),
    h("section", { "aria-labelledby": "gm-do-h" },
      h("h2", { id: "gm-do-h" }, "따라 하기 3단계"),
      h("h3", {}, "1단계 · 프롬프트 5요소로 문항 만들기"),
      h("p", {}, "[ ] 안(과목·학년·단원명)은 내 내용으로 바꿔서 붙여 넣어요."),
      copyBlock(GEMINI_STEP1),
      h("h3", {}, "2단계 · Gem(나만의 도우미) 만들기"),
      h("ol", {}, h("li", {}, "Gemini 왼쪽 메뉴에서 ‘Gem’(또는 Gem 관리자)을 열어 새 Gem 만들기를 눌러요."),
        h("li", {}, "이름을 ‘형성평가 출제 도우미’로 하고, 지침 칸에 아래 글을 붙여 넣어요."),
        h("li", {}, "저장한 뒤 단원명만 바꿔 두 번 해 보고, 같은 형식으로 나오는지 확인해요.")),
      copyBlock(GEMINI_GEM),
      h("h3", {}, "3단계 · 퀴즈 웹페이지(바이브 코딩)"),
      h("p", {}, "문항을 만든 같은 대화창에서 아래를 붙여 넣어요. 결과는 캔버스 미리보기로 눌러 보고, 고칠 곳은 한 가지씩 말해요."),
      copyBlock(GEMINI_STEP3),
      h("p", {}, h("a", { href: "/vibe", "data-link": "" }, "바이브 코딩 체험"), "의 문장도 그대로 Gemini에 쓸 수 있어요.")),
    h("section", { class: "card gm-limits", "aria-labelledby": "gm-lim-h" },
      h("h2", { id: "gm-lim-h" }, "알아 둘 점"),
      h("ul", {},
        h("li", {}, "Gemini도 그럴듯하게 틀릴 수 있어요. 정답·성취기준은 교사가 직접 확인해요."),
        h("li", {}, "학생이 쓸 수 있는지(연령·허용 범위)는 교육청·학교 정책에 따라 달라요. 학생 수업에 넣기 전에 관리자에게 확인하세요."),
        h("li", {}, "만든 HTML 파일은 내려받아 두 번 클릭하면 인터넷 창에서 열려요. 공개 주소가 필요하면 학교 정책에 맞는 방법을 쓰세요."))),
  ));
}
