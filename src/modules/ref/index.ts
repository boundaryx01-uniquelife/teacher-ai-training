import { h, copyBlock, serviceNotice, pageTitle } from "../../lib/ui.ts";
import "./ref.css";

/**
 * 레퍼런스로 만들기: 스크린샷 → 주소 → 공개 GitHub → 예시자료 제작.
 * 이 화면은 외부 AI·외부 주소를 부르지 않는다. 입력한 주소는 요청 문장에만 들어간다(복사용).
 */
type Kind = "shot" | "url" | "git";
const KINDS: { id: Kind; label: string; hint: string }[] = [
  { id: "shot", label: "스크린샷", hint: "마음에 드는 화면을 캡처해 첨부" },
  { id: "url", label: "웹 주소", hint: "참고할 화면의 인터넷 주소" },
  { id: "git", label: "공개 GitHub", hint: "공개된 저장소 주소(라이선스 확인)" },
];
const TAKE = ["화면 배치(어디에 무엇이 있는지)", "색과 분위기", "기능의 흐름(무엇을 누르면 어떻게 되는지)"];
export const SAMPLE_IMG = "/downloads/sample-reference-notice-app.png";
const SAMPLE_URL = "https://teacher-ai-training.netlify.app";

export function buildPrompt(kind: Kind, url: string, what: string, take: string[]): string {
  const target = what.trim() || "학급 알림장 웹페이지";
  const ref = kind === "shot" ? "첨부한 화면 이미지를 레퍼런스로 삼아"
    : kind === "url" ? `이 주소의 화면을 레퍼런스로 삼아(${url.trim() || "[참고할 주소]"})`
    : `이 공개 저장소를 레퍼런스로 삼아(${url.trim() || "[저장소 주소]"}) 먼저 어떤 구조인지 초보자에게 설명하고, 그다음`;
  const lines = [
    `${ref}, ${target}을(를) HTML 파일 하나로 만들어 줘.`,
    `가져올 것: ${take.length ? take.join(", ") : "화면 배치"}.`,
    "바꿀 것: 문구·이름·로고·이미지는 모두 우리 반에 맞게 새로 만들고, 원본의 글과 그림은 그대로 쓰지 마.",
    "학생 이름·성적 같은 개인정보는 받지 않게 해 줘.",
  ];
  if (kind === "git") lines.push("이 저장소의 라이선스와 출처 표기 방법도 알려 줘.");
  return lines.join("\n");
}

export function mount(el: HTMLElement) {
  pageTitle("레퍼런스로 만들기");
  let kind: Kind = "shot";
  const take = new Set<string>([TAKE[0], TAKE[1]]);
  const urlIn = h("input", { type: "text", id: "rf-url", placeholder: "https://…", autocomplete: "off", maxlength: "200" }) as HTMLInputElement;
  const whatIn = h("input", { type: "text", id: "rf-what", autocomplete: "off", maxlength: "60", value: "학급 알림장 웹페이지" }) as HTMLInputElement;
  const urlRow = h("div", { class: "rf-urlrow" }, h("label", { for: "rf-url" }, "주소"), urlIn);
  const warn = h("p", { class: "rf-warn", role: "status", "aria-live": "polite" });
  const out = h("div", { class: "rf-out" });

  const kindBtns = KINDS.map((k) => {
    const b = h("button", { type: "button", class: "btn secondary rf-kind", "aria-pressed": String(k.id === kind) }, h("strong", {}, k.label), h("span", { class: "hint" }, k.hint));
    b.addEventListener("click", () => { kind = k.id; refresh(); });
    return b;
  });
  const takeBox = h("div", { class: "rf-take", role: "group", "aria-label": "가져올 것" }, TAKE.map((t, i) => {
    const id = `rf-take-${i}`;
    const cb = h("input", { type: "checkbox", id }) as HTMLInputElement;
    cb.checked = take.has(t);
    cb.addEventListener("change", () => { if (cb.checked) take.add(t); else take.delete(t); refresh(); });
    return h("label", { for: id }, cb, h("span", {}, t));
  }));

  function refresh() {
    kindBtns.forEach((b, i) => b.setAttribute("aria-pressed", String(KINDS[i].id === kind)));
    urlRow.hidden = kind === "shot";
    const u = urlIn.value.trim();
    warn.textContent = kind !== "shot" && u && !/^https:\/\/[^\s]+$/.test(u) ? "주소는 https:// 로 시작해야 해요." : (kind === "git" ? "공개 저장소인지, 라이선스(MIT·Apache 등)가 있는지 먼저 확인하세요." : "");
    out.replaceChildren(copyBlock(buildPrompt(kind, urlIn.value, whatIn.value, TAKE.filter((t) => take.has(t)))));
  }
  urlIn.addEventListener("input", refresh); whatIn.addEventListener("input", refresh);

  el.append(
    serviceNotice(),
    h("h1", {}, "레퍼런스로 만들기"),
    h("p", { class: "lead" }, "처음부터 설명하기 어려우면, 마음에 드는 화면을 ‘레퍼런스(참고 자료)’로 주고 “이런 느낌으로 우리 반용으로 만들어 줘”라고 부탁해요."),
    h("div", { class: "notice", role: "note" }, h("strong", {}, "지킬 것 3가지"), h("ul", {},
      h("li", {}, h("b", {}, "구조와 느낌만 참고"), "해요. 남의 글·그림·로고를 그대로 쓰거나 똑같이 만들어 공개하지 않아요."),
      h("li", {}, "공개 저장소(GitHub)는 ", h("b", {}, "라이선스와 출처"), "를 확인하고 지켜요."),
      h("li", {}, "학생 이름·성적 같은 ", h("b", {}, "개인정보"), "와 비밀번호·키는 넣지 않아요."))),

    h("p", {}, h("a", { class: "btn accent", href: "#rf-b" }, "↓ 요청 문장 만들기로 바로 가기")),
    h("section", { class: "rf-step", "aria-labelledby": "rf-1" },
      h("h2", { id: "rf-1" }, "1단계 · 스크린샷으로 시작 (가장 쉬움)"),
      h("div", { class: "rf-row" },
        h("div", {}, h("ol", {},
          h("li", {}, "오른쪽 예시 화면을 내려받거나, 마음에 드는 앱·사이트 화면을 캡처해요(Windows: Win+Shift+S)."),
          h("li", {}, "ChatGPT나 Gemini 입력창에 그림을 올려요(클립 아이콘 또는 붙여넣기)."),
          h("li", {}, "아래 ‘요청 문장 만들기’에서 만든 문장을 붙여 넣어요."),
          h("li", {}, "결과를 눌러 보고 한 가지씩 고쳐요(바이브 코딩).")),
          h("p", {}, h("a", { class: "btn secondary", href: SAMPLE_IMG, download: "sample-reference-notice-app.png" }, "예시 화면 내려받기(가상 앱)"))),
        h("img", { class: "rf-sample", src: SAMPLE_IMG, alt: "예시 레퍼런스: ‘우리 반 알림장’ 모양의 가상 앱 화면. 위에 날짜, 가운데 공지 카드 세 개, 아래에 탭 메뉴", width: "300", height: "533" }))),

    h("section", { class: "rf-step", "aria-labelledby": "rf-2" },
      h("h2", { id: "rf-2" }, "2단계 · 웹 주소로 참고하기"),
      h("ol", {},
        h("li", {}, "참고할 화면의 주소를 복사해요. 연습용으로는 이 사이트 주소를 써도 돼요: ", h("code", {}, SAMPLE_URL)),
        h("li", {}, "‘요청 문장 만들기’에서 ‘웹 주소’를 고르고 주소를 붙여 넣어요."),
        h("li", {}, "AI가 주소를 못 열면(요금제·설정에 따라 다름) 화면을 캡처해 1단계 방식으로 해요.")),
      h("p", {}, h("a", { href: "/sites", "data-link": "" }, "추천 참고 사이트 보기 →"), " (다른 선생님들이 만든 사례)"),
      h("p", { class: "hint" }, "남의 서비스는 구조와 느낌만 참고하세요. 같은 이름·로고·문구로 만들어 공개하면 안 돼요.")),

    h("section", { class: "rf-step", "aria-labelledby": "rf-3" },
      h("h2", { id: "rf-3" }, "3단계 · 공개된 GitHub에서 가져오기"),
      h("p", {}, "GitHub는 개발자들이 코드를 올려 두고 나누는 곳이에요. ‘공개(Public)’ 저장소는 누구나 볼 수 있고, 라이선스에 따라 가져다 고쳐 쓸 수 있어요."),
      h("ol", {},
        h("li", {}, "github.com 에서 ‘school notice’, ‘class timetable’, ‘quiz app’ 같은 말로 검색해요."),
        h("li", {}, h("b", {}, "라이선스 확인"), ": 저장소 첫 화면의 License(MIT·Apache-2.0 등)가 있으면 출처를 밝히고 고쳐 쓸 수 있는 경우가 많아요. 없으면 쓰지 않는 쪽이 안전해요."),
        h("li", {}, "‘요청 문장 만들기’에서 ‘공개 GitHub’를 고르고 저장소 주소를 넣어요. 먼저 ‘어떤 구조인지 설명해 줘’부터 해요."),
        h("li", {}, "AI가 저장소를 못 열면 GitHub의 Code → Download ZIP으로 받아 AI에 올려요."),
        h("li", {}, "비밀번호·키(.env 파일 등)가 들어 있지 않은지 확인하고, 내가 쓸 때는 출처와 라이선스를 적어 둬요.")),
      copyBlock("이 공개 저장소의 README를 읽고, 무슨 프로그램인지 초등학생도 알 만큼 쉽게 설명해 줘. 우리 반 알림장으로 바꾸려면 어떤 파일의 무엇을 바꿔야 하는지도 알려 줘.")),

    h("section", { class: "rf-step rf-builder", id: "rf-b", "aria-labelledby": "rf-bh" },
      h("h2", { id: "rf-bh" }, "요청 문장 만들기"),
      h("p", { class: "hint" }, "고르는 대로 아래 문장이 바뀌어요. 복사해서 ChatGPT나 Gemini에 붙여 넣으세요."),
      h("div", { class: "rf-kinds", role: "group", "aria-label": "레퍼런스 종류" }, kindBtns),
      urlRow,
      h("label", { for: "rf-what" }, "만들 것"), whatIn,
      h("p", { class: "rf-lbl" }, "가져올 것"), takeBox, warn, out),

    h("section", { class: "rf-step", "aria-labelledby": "rf-4" },
      h("h2", { id: "rf-4" }, "4단계 · 예시자료 만들기 실습"),
      h("p", {}, "위에서 하나를 골라 ", h("strong", {}, "‘우리 반 알림장’ 웹페이지"), "를 만들어 봐요. 걸리는 시간은 약 15분이에요."),
      h("ol", {},
        h("li", {}, "1·2·3단계 중 하나로 레퍼런스를 정해요(처음이면 1단계 예시 화면)."),
        h("li", {}, "요청 문장을 붙여 넣고 결과를 받아요."),
        h("li", {}, "눌러 보고 ‘고치기’를 두세 번 해요. 예: “공지 카드를 4개로 늘려 줘”, “오늘 날짜가 맨 위에 보이게 해 줘”."),
        h("li", {}, "다 됐으면 마지막 체크를 해요.")),
      h("div", { class: "card rf-check" }, h("h3", {}, "마지막 체크"), h("ul", {},
        h("li", {}, "원본의 글·그림·로고를 그대로 쓰지 않았나요?"),
        h("li", {}, "학생 이름·성적·연락처가 없나요?"),
        h("li", {}, "공개 저장소를 썼다면 출처와 라이선스를 적었나요?"),
        h("li", {}, "눌러 봤을 때 정말 동작하나요?"))),
      h("h3", {}, "더 나아가기: 폰 홈 화면에 올리기(PWA)"),
      copyBlock("이 웹페이지를 PWA로 만들어 줘. 폰 홈 화면에 추가할 수 있게 이름과 아이콘을 넣고, 인터넷이 없어도 열리게 해 줘. 학생 개인정보는 저장하지 마.")),

    h("section", { class: "card rf-video", "aria-labelledby": "rf-v" },
      h("h2", { id: "rf-v" }, "참고: 영상 만들기도 ‘레퍼런스’로 해요 (소개만)"),
      h("p", {}, "AI에게 레퍼런스 영상·그림과 글 설명을 주고 짧은 영상을 만드는 사례가 많아요. 다만 이미지·음성 도구를 여러 개 쓰고 시간이 오래 걸려서, 오늘 연수의 실습 대상은 아니에요."),
      h("ul", {},
        h("li", {}, "이 사이트 첫 화면 인트로(14초)도 AI가 코드로 그린 움직임 그래픽이에요(자료실에서 내려받을 수 있어요)."),
        h("li", {}, "영상 레퍼런스는 저작권과 초상권이 더 까다로워요. 학생 얼굴·목소리, 남의 영상·음악은 쓰지 않아요."),
        h("li", {}, "사례 모음 사이트: ", h("a", { href: "https://jasonzhu.ai/en/prompts/claude-opus-5-5", target: "_blank", rel: "noopener noreferrer" }, "jasonzhu.ai 프롬프트 라이브러리 ↗"), " (영어, 외부 사이트 · 내용은 직접 확인한 것이 아니에요)"))),
  );
  refresh();
}
