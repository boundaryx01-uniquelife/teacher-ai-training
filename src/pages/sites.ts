import { h, serviceNotice, pageTitle, PADLET_URL } from "../lib/ui.ts";
import "./sites.css";

/**
 * 추천 참고 사이트: 연수 중·후에 ‘이런 것도 만들 수 있구나’를 보는 외부 사이트 모음.
 * 소개 문장은 2026-11-27에 각 사이트 첫 화면에서 읽은 내용 기준이다(깊게 써 본 것은 아님). 외부 사이트라 내용·공개 여부가 바뀔 수 있다.
 */
interface Site { name: string; url: string; what: string; learn: string; note?: string }
interface Group { id: string; title: string; lead: string; sites: Site[] }

const GROUPS: Group[] = [
  { id: "community", title: "교사 AI 커뮤니티", lead: "혼자 하기 어려우면 같은 고민을 하는 선생님들과 나눠요.", sites: [
    { name: "DoRms(도름)", url: "https://dorms.school/", what: "교육과 AI를 연결 짓는 교사 커뮤니티. 써 본 앱·자료, 이야기, 배움 글을 나눠요.", learn: "다른 선생님이 AI로 무엇을 만들고 어떻게 쓰는지 사례를 구경해요.", note: "가입·글쓰기는 사이트 안내를 따르세요." },
  ] },
  { id: "lesson", title: "AI로 만든 수업 자료 사이트(사례)", lead: "수업에 바로 쓰는 웹 자료를 교사가 만든 사례예요. ‘레퍼런스로 만들기’의 좋은 레퍼런스예요.", sites: [
    { name: "AI와 함께하는 학습 사이트", url: "https://aiworld.web.app/", what: "고등 인공지능 수학·인공지능 기초(학생용·전자칠판 교사용), 과학·수학 체험, 역사 사건 탐구 등 10여 개 자료를 한곳에서 골라 들어가는 목차 사이트.", learn: "‘학생용(폰)’과 ‘교사용(전자칠판)’을 나눠 만드는 구성, 한 장씩 넘기는 화면, 별 모으기 같은 게임 요소." },
    { name: "교육자료 허브", url: "https://penedu.web.app/", what: "위와 같은 제작자의 교육자료 모음 첫 화면.", learn: "여러 자료를 한 주소에서 묶어 안내하는 방법.", note: "첫 화면이 자바스크립트로 그려져서 소개 시점에 내용을 자세히 읽지 못했어요. 열어서 직접 확인하세요." },
    { name: "과학 도구상자", url: "https://biscuitbox.github.io/science-toolbox/", what: "가상실험, 계산기, 수업 도구를 분야별로 모은 과학 학습 도구 모음.", learn: "분야 메뉴 → 도구 목록 → 바로 열기의 단순한 구조, 교사용 칠판 화면." },
  ] },
  { id: "tools", title: "교사가 필요해서 만든 도구(사례)", lead: "‘우리 반에 필요한 작은 도구’를 AI와 만든 예시예요.", sites: [
    { name: "SVG Forge", url: "https://svg-forge-01.netlify.app/", what: "이미지·글자를 SVG·DXF·STL 파일로 바꿔 주는 웹 도구. 키링·이름표(3D 프린트), 레이저 가공, 키캡 모드가 있어요.", learn: "한 가지 일(파일 변환)에 집중한 도구, 용도별 모드 선택, 파일로 저장하는 흐름.", note: "만들기·메이커 수업 아이디어용이에요." },
    { name: "교사 웹앱 색인", url: "https://minkyu.web.app/", what: "교사가 수업에 쓰려고 만든 웹앱(키링 공방, 도안 생성기, QR 인쇄 등)을 표로 모아 둔 색인 페이지.", learn: "내가 만든 도구를 ‘이름·설명·분류’ 표 하나로 정리해 두는 방법.", note: "소개 시점에는 ‘초안 미리보기’ 안내와 암호 입력이 보였어요. 공개 준비 중일 수 있으니 열리는지 확인하세요." },
    { name: "클릭온 AI 챌린지(초등학교 사례)", url: "https://clickon2.netlify.app/", what: "한 학교의 AI 프로그램 참여 인증서를 올리고 학급별·개인별 참여 현황을 실시간으로 보는 행사용 웹앱.", learn: "게임처럼 진행률(로켓 연료)을 보여 주는 화면 구성, 행사용 웹앱의 기능 구성.", note: "학생별 기록과 순위를 화면에 보이는 방식은 이 연수의 ‘개인정보 미입력’ 규칙과 달라요. 화면 구조만 참고하고, 실제 학생 정보를 넣을 때는 학교 정책을 먼저 확인하세요." },
  ] },
  { id: "physical", title: "피지컬 컴퓨팅·로봇 수업(사례)", lead: "AI를 화면 밖으로 꺼낸 수업 사례예요.", sites: [
    { name: "바이브코딩으로 만드는 교탁 도우미", url: "https://biscuitbox.github.io/classhelper-board/", what: "코드를 쓰지 않고 말로 설명해서, 터치 보드(ESP32)에 지뢰찾기·소음 신호등·발표 도우미를 만드는 교사 연수(3차시) 자료 사이트. 홈·강의 슬라이드·실습 워크벤치·초보 가이드북 구성이에요.", learn: "이 연수 사이트의 구성(주소 카드, 슬라이드·워크벤치·가이드북 메뉴, ‘안 될 때’ 안내)이 이 사이트를 참고했어요. ‘말로 설명해서 만든다’는 바이브 코딩 수업의 전체 흐름을 볼 수 있어요.", note: "실제로 해 보려면 터치 보드 같은 교구와 설치 환경이 필요해요." },
    { name: "피지컬 AI 교실(마이크로비트)", url: "https://microbit-bridge.netlify.app/", what: "웹캠으로 AI에게 카드·물건을 가르치고, 마이크로비트가 로봇을 움직이게 하는 수업 사이트. 교구를 골라 시작하고 수업 슬라이드·시뮬레이터가 있어요.", learn: "인트로 영상 → 교구 선택 카드 → 학습 화면으로 이어지는 시작 구성(이 연수 사이트의 첫 화면도 이 구성을 참고했어요)." },
  ] },
  { id: "video", title: "프롬프트·영상 사례(소개만)", lead: "오늘 실습 대상은 아니고, ‘이런 것도 가능하다’를 보는 용도예요.", sites: [
    { name: "ATELIER — AI 필름 & 타이포 스튜디오", url: "https://video-creatable.netlify.app/", what: "사진을 분석해 구조(인덱스형·흐름형), 한글 타이포그래피 15종, 효과음, 연주곡을 자동으로 붙여 짧은 영상을 만들어 주는 영상 스튜디오 웹앱(사이트 설명 기준).", learn: "사진 몇 장으로 영상을 자동 연출하는 흐름, 한글 자막·타이포 스타일 고르기.", note: "첫 화면이 스크립트로 그려져서 소개 시점에는 설명 문구만 읽었어요. 직접 열어 확인하세요. 학생 얼굴이 나온 사진·남의 사진은 넣지 않아요(초상권·개인정보)." },
    { name: "Claude 5.5 프롬프트 라이브러리", url: "https://jasonzhu.ai/en/prompts/claude-opus-5-5", what: "크리에이터들이 Claude로 만든 영상·웹 작품과 쓴 프롬프트를 모은 영어 갤러리.", learn: "‘레퍼런스를 주고 부탁하는’ 방식의 다양한 사례.", note: "영어 외부 사이트예요. 작품에 남의 그림·영상·게임을 재현한 것이 섞여 있어, 저작권과 초상권에 주의하세요." },
  ] },
];

export function mount(el: HTMLElement) {
  pageTitle("추천 참고 사이트");
  el.append(h("div", { class: "st-page" },
    serviceNotice(),
    h("h1", {}, "추천 참고 사이트"),
    h("p", { class: "lead" }, "연수 후에 ‘이런 것도 만들 수 있구나’를 보고, 내 수업에 맞게 ‘레퍼런스’로 삼아 볼 외부 사이트예요."),
    h("div", { class: "notice", role: "note" }, h("strong", {}, "보는 방법"), h("ul", {},
      h("li", {}, "구조와 느낌만 참고해요. 남의 글·그림·로고를 그대로 가져와 만들어 공개하지 않아요(", h("a", { href: "/ref", "data-link": "" }, "레퍼런스로 만들기"), ")."),
      h("li", {}, "모두 외부 사이트라 내용·공개 여부가 바뀔 수 있어요. 소개는 2026년 11월 27일 첫 화면을 읽은 내용이에요."),
      h("li", {}, "가입하거나 학생 정보를 넣어야 하는 사이트는 학교 정책을 먼저 확인해요."))),
    GROUPS.map((g) => h("section", { class: "st-group", "aria-labelledby": `st-${g.id}` },
      h("h2", { id: `st-${g.id}` }, g.title),
      h("p", { class: "hint" }, g.lead),
      h("ul", { class: "st-list" }, g.sites.map((s) => h("li", { class: "card st-card" },
        h("h3", {}, h("a", { href: s.url, target: "_blank", rel: "noopener noreferrer" }, s.name, h("span", { class: "sr-only" }, " (새 창)"), " ↗")),
        h("p", {}, s.what),
        h("p", { class: "st-learn" }, h("strong", {}, "참고할 점 "), s.learn),
        s.note ? h("p", { class: "st-note" }, h("strong", {}, "알아 둘 점 "), s.note) : null))))),
    h("p", { class: "hint" }, "더 좋은 사이트가 있으면 패들렛 ‘오늘 만든 것’이나 ‘SOS’ 옆에 올려 나눠 주세요. ", h("a", { href: PADLET_URL, target: "_blank", rel: "noopener noreferrer" }, "패들렛 열기 ↗")),
  ));
}
