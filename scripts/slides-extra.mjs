// Beginner rewrite (trainer feedback 2026-11-26): "API를 무엇인지부터, 생활 속 예, 어디서 얻고 어떻게 쓰는지, JSON이 뭔지까지 여러 장으로",
// "9번 용어에 실제 서비스 예", "14번 '만들 때 고르는 법' 축약 풀기". Merged by scripts/build-slides.mjs.
// REPLACE: whole <section> by id. INSERT: new sections placed before/after an existing id (order + titles are added to slide data).

const ex = (t) => `<p class="ex">${t}</p>`;

export const REPLACE = {
  terms1: `<section id="terms1">
<p class="eyebrow">필수 용어 ① 식당으로 비유하면</p>
<h2>웹서비스는 네 부분으로 나뉜다</h2>
<div class="cards">
<div class="card"><p class="tag">홀 · 메뉴판</p><h3>프론트엔드</h3><p>사람이 보고 누르는 <b>화면</b></p>${ex("<b>예시</b> <nobr>네이버 첫 화면</nobr>, <nobr>학교 홈페이지</nobr>")}${ex("<b>많이 쓰는 곳</b> Netlify, Vercel")}</div>
<div class="card d2"><p class="tag">주방</p><h3>백엔드(서버)</h3><p>보이지 않는 곳에서 <b>처리</b>하는 컴퓨터</p>${ex("<b>예시</b> <nobr>로그인 확인</nobr>, <nobr>채점</nobr>")}${ex("<b>많이 쓰는 곳</b> Vultr, AWS")}</div>
<div class="card d3"><p class="tag">창고 · 장부</p><h3>데이터베이스(DB)</h3><p>자료를 표처럼 <b>쌓아 두는</b> 저장소</p>${ex("<b>예시</b> <nobr>나이스 성적·출결</nobr>")}${ex("<b>많이 쓰는 곳</b> Supabase, Firebase")}</div>
<div class="card d4"><p class="tag">주문서 양식</p><h3>API</h3><p>프로그램끼리 <b>부탁하고 답을 받는 창구</b></p>${ex("<b>예시</b> <nobr>나이스 급식</nobr>, <nobr>기상청 날씨</nobr>")}${ex("<b>AI도 API로 부른다</b> <nobr>OpenAI, Claude</nobr>")}</div>
</div>
<div class="ph" data-asset="IMG-03" title="식당 단면도 일러스트: 홀 · 주문서 · 주방 · 창고" style="width:1664px;height:190px;margin-top:24px;"><p>[IMG-03]<br>식당 단면도 일러스트: 홀 · 주문서 · 주방 · 창고</p></div>
<p class="note">‘많이 쓰는 곳’은 AI로 웹서비스를 만들 때 자주 고르는 서비스의 예시다. 퀴즈 앱이라면: 버튼(프론트엔드) → 채점·저장(백엔드) → 제출 기록(DB)</p>
</section>`,

  "neis-api": `<section id="neis-api">
<p class="eyebrow">API ⑥ 직접 받아 보기</p>
<h2>부경고 급식을 API로 받아 보자</h2>
<div class="row" style="gap:40px">
<div class="col">
<p>나이스 교육정보 개방 포털(open.neis.go.kr)은 급식·학사일정·시간표를 API로 공개한다.</p>
<p class="code sm">open.neis.go.kr/hub/mealServiceDietInfo<br>  ?Type=json<br>  &amp;ATPT_OFCDC_SC_CODE=<span class="c">C10</span>  ← 부산교육청<br>  &amp;SD_SCHUL_CODE=<span class="c">7150397</span>  ← 부경고<br>  &amp;MLSV_YMD=<span class="c">20261127</span>  ← 날짜</p>
<p class="sub" style="margin-top:20px">‘▶ 실습하기’를 누르면 사이트의 서버가 이 주소로 부탁하고, 받은 JSON과 급식 메뉴를 나란히 보여 준다</p>
</div>
<div class="ph" data-asset="IMG-04" title="나이스 API 안내 화면 + 브라우저의 JSON 결과" style="width:820px;height:600px;"><p>[IMG-04]<br>나이스 API 안내 화면 +<br>브라우저의 JSON 결과</p></div>
</div>
</section>`,

  "build-choice": `<section id="build-choice">
<p class="eyebrow">용어 정리 · 내가 만들 것에는 무엇이 필요할까</p>
<h2>만들고 싶은 것에 따라 필요한 부분이 다르다</h2>
<table>
<tr><th>만들고 싶은 것</th><th>필요한 부분</th><th>ChatGPT로 만드는 방법</th></tr>
<tr><td><b>보여 주기만</b> 하면 되는 것<br><span class="sm2">행사 안내 페이지, 혼자 풀고 바로 채점되는 퀴즈</span></td><td>화면(프론트엔드)만</td><td>채팅에서 HTML 파일로 받기(캔버스)</td></tr>
<tr><td>학생 답을 <b>모아야</b> 하는 것<br><span class="sm2">과제 제출, 투표, 설문</span></td><td>화면 + 서버(백엔드) + 기록 저장소(DB)</td><td>Sites — 서버·저장소까지 만들어 줌</td></tr>
<tr><td>다른 곳의 자료를 <b>가져오는</b> 것<br><span class="sm2">오늘 급식, 날씨</span></td><td>화면 + 다른 서비스의 API</td><td>Sites, 또는 Codex(코딩 도우미)</td></tr>
</table>
<p class="lead" style="margin-top:40px">코드를 몰라도 <b>이 용어를 넣어 요청</b>하면 결과가 정확해진다<br><span class="sub">“제출 기록은 저장해 줘(DB)” · “정답은 학생 화면에 보이지 않게 서버에만 둬(백엔드)”</span></p>
</section>`,
};

export const INSERT = [
  { before: "neis-api", id: "api-what", title: "API란 무엇인가", html: `<section id="api-what">
<p class="eyebrow">API ① API란 무엇인가</p>
<h2>프로그램끼리 <span class="hlt">정해진 양식으로 부탁하고 답을 받는 창구</span></h2>
<div class="row" style="gap:56px">
<div class="col">
<div class="step"><div class="num">1</div><div><h3>주문서를 적는다</h3><p>정해진 양식대로: “급식 메뉴, 부경고, 11월 27일”</p></div></div>
<div class="step"><div class="num">2</div><div><h3>창구(API)에 낸다</h3><p>다른 기관의 컴퓨터(서버)로 보낸다 = <b>요청</b></p></div></div>
<div class="step"><div class="num">3</div><div><h3>정해진 그릇에 담겨 온다</h3><p>결과를 약속된 형식으로 돌려받는다 = <b>응답</b></p></div></div>
</div>
<div class="card hl" style="flex:0 0 640px">
<p class="tag">기억할 것 3가지</p>
<h3>① 양식대로 부탁한다</h3>
<h3>② 약속된 형식으로 답이 온다</h3>
<h3>③ 주방 안(상대 서버)은 몰라도 된다</h3>
</div>
</div>
<p class="note">API = Application Programming Interface(프로그램과 프로그램을 잇는 창구). 이름보다 ‘주문서 창구’로 기억하면 충분하다</p>
</section>` },

  { before: "neis-api", id: "api-life", title: "생활 속 API", html: `<section id="api-life">
<p class="eyebrow">API ② 우리는 이미 매일 쓰고 있다</p>
<h2>생활 속 API</h2>
<div class="cards cards2">
<div class="card"><p class="tag">날씨 앱</p><h3>“지금 부산 날씨?”</h3><p>앱이 기상청 컴퓨터에 부탁 → 기온·강수확률을 받아 화면에 표시</p></div>
<div class="card d2"><p class="tag">지도 · 길찾기</p><h3>가게·배달 앱 속 지도</h3><p>직접 지도를 만들지 않고 카카오맵·네이버 지도 API를 불러와 보여 줌</p></div>
<div class="card d3"><p class="tag">간편 로그인</p><h3>“카카오로 로그인”</h3><p>사이트가 카카오·구글에 “이 사람이 맞나요?”를 묻고 답을 받음</p></div>
<div class="card d4 hl"><p class="tag">학교</p><h3>학교 앱의 오늘 급식</h3><p>학교 홈페이지·앱의 급식·학사일정 = 나이스 교육정보 API</p></div>
</div>
<p class="note">공통점: 내 화면(프론트엔드)이 다른 기관의 컴퓨터에 부탁해서 받아 온 자료를 보여 준다</p>
</section>` },

  { before: "neis-api", id: "api-where", title: "API는 어디서 얻나", html: `<section id="api-where">
<p class="eyebrow">API ③ 어디서 얻나</p>
<h2>공공 API는 회원가입 후 무료로 신청한다</h2>
<table>
<tr><th>제공하는 곳</th><th>주소</th><th>학교에서 쓸 만한 것</th></tr>
<tr><td><b>나이스 교육정보 개방 포털</b></td><td>open.neis.go.kr</td><td>급식 식단, 학사일정, 시간표, 학교 정보</td></tr>
<tr><td><b>공공데이터포털</b></td><td>data.go.kr</td><td>미세먼지, 공휴일, 도서관 정보 등</td></tr>
<tr><td><b>기상청 API허브</b></td><td>apihub.kma.go.kr</td><td>동네 예보, 기온·강수</td></tr>
</table>
<div class="row" style="gap:40px;margin-top:36px">
<div class="col">
<div class="mini"><div class="num">1</div><p><b>회원가입</b> 후 쓰고 싶은 API를 고른다</p></div>
<div class="mini"><div class="num">2</div><p><b>활용 신청</b> → <b>인증키</b>를 받는다(바로 또는 며칠)</p></div>
<div class="mini"><div class="num">3</div><p>인증키를 주소에 붙여 부탁한다</p></div>
</div>
<div class="card hl" style="flex:0 0 760px"><p class="tag">인증키(API 키) = 출입증</p><p style="color:#14213D">누가 얼마나 쓰는지 확인하는 긴 비밀 문자열. 남에게 보이면 안 되므로 학생 화면이 아니라 <b>서버(백엔드)</b>에 둔다</p></div>
</div>
</section>` },

  { before: "neis-api", id: "api-how", title: "주소 한 줄이 곧 주문서", html: `<section id="api-how">
<p class="eyebrow">API ④ 어떻게 부탁하나</p>
<h2>인터넷 주소 한 줄이 곧 주문서다</h2>
<table class="addr">
<tr><th>주소 조각</th><th>뜻</th></tr>
<tr><td class="mono">https://open.neis.go.kr/hub/mealServiceDietInfo</td><td><b>어느 창구에</b> — 나이스의 ‘급식 식단’ 창구</td></tr>
<tr><td class="mono">?Type=json</td><td><b>어떤 그릇에</b> — JSON 형식으로 달라</td></tr>
<tr><td class="mono">&amp;ATPT_OFCDC_SC_CODE=<span class="c2">C10</span></td><td><b>교육청</b> — C10 = 부산광역시교육청</td></tr>
<tr><td class="mono">&amp;SD_SCHUL_CODE=<span class="c2">7150397</span></td><td><b>학교</b> — 7150397 = 부경고등학교</td></tr>
<tr><td class="mono">&amp;MLSV_YMD=<span class="c2">20261127</span></td><td><b>날짜</b> — 2026년 11월 27일</td></tr>
</table>
<p class="note">이 주소를 브라우저 주소창에 넣어도 결과가 나온다. 급식 앱은 이 주소를 대신 불러 주는 프로그램이다</p>
</section>` },

  { before: "neis-api", id: "json-what", title: "답장은 JSON으로 온다", html: `<section id="json-what">
<p class="eyebrow">API ⑤ 답장은 JSON으로 온다</p>
<h2>JSON = 컴퓨터끼리 주고받는 ‘이름: 값’ 메모</h2>
<div class="row" style="gap:56px">
<p class="code" style="flex:0 0 760px;font-size:34px">{<br>  "학교": <span class="c">"부경고등학교"</span>,<br>  "날짜": <span class="c">"2026-11-27"</span>,<br>  "식사": <span class="c">"중식"</span>,<br>  "메뉴": [<span class="c">"쌀밥"</span>, <span class="c">"미역국"</span>, <span class="c">"제육볶음"</span>]<br>}</p>
<div class="col">
<div class="mini"><div class="num">{ }</div><p>정보 <b>한 묶음</b>의 시작과 끝</p></div>
<div class="mini"><div class="num">:</div><p>왼쪽은 <b>항목 이름</b>, 오른쪽은 <b>내용(값)</b></p></div>
<div class="mini"><div class="num">[ ]</div><p>여러 개를 늘어놓은 <b>목록</b></p></div>
<p class="sub" style="margin-top:12px">실제 나이스 응답은 이름이 영어 약어다: SCHUL_NM(학교명), DDISH_NM(메뉴), CAL_INFO(열량)</p>
</div>
</div>
<p class="note">엑셀 표의 ‘열 제목: 칸 내용’을 한 줄씩 적은 것과 같다. 메뉴는 설명용 예시</p>
</section>` },
];

/** extra CSS for the rewritten slides */
export const EXTRA_CSS = `
#scaler .card .ex{font-size:27px;color:#14213D;background:#F2EEE3;border-radius:10px;padding:10px 14px;margin:12px 0 0}
#scaler .cards2{flex-wrap:wrap}#scaler .cards2>.card{flex:1 1 40%}
#scaler .hlt{background:linear-gradient(transparent 62%,#F2A541 62%)}
#scaler .sm2{font-size:26px;color:#4A5568}
#scaler table.addr td{font-size:30px;padding:16px 20px}#scaler table.addr .mono{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:26px;word-break:break-all}
#scaler .c2{color:#A8530A;font-weight:700}
#scaler .mini .num{font-size:24px}
#scaler .eyebrow{font-size:30px}#scaler .note{font-size:28px}
#scaler table{font-size:30px}#scaler table.sm{font-size:28px}#scaler td{padding:14px 20px}#scaler th{padding:14px 20px}
#scaler .card p{font-size:28px}#scaler .card .tag{font-size:26px}#scaler .card .ex{font-size:26px}
#scaler .fbox p{font-size:27px}#scaler .fbox h3{font-size:32px}#scaler .mini p{font-size:30px}#scaler .step p{font-size:30px}
#scaler .code.sm{font-size:26px}#scaler .lbl{font-size:26px}
#scaler [data-asset^="IMG-02"],#scaler [data-asset^="IMG-05"],#scaler [data-asset^="IMG-09"]{width:180px!important;height:180px!important}
`;

/* 한 줄이 어색하게 끊기지 않게 */
export const EXTRA_CSS2 = `#scaler :is(h1,h2,h3,.lead){text-wrap:balance}#scaler .tag,#scaler .lbl,#scaler .eyebrow{white-space:normal;text-wrap:balance}#scaler nobr{white-space:nowrap}#scaler :is(td,th,.fbox p,.card p,.mini p,.step p){text-wrap:balance}#scaler table tr>:first-child:is(td,th){white-space:nowrap}#scaler table.addr tr>:first-child{white-space:normal}`;

/* ===== design pass 2026-11-26: 5th (keyword) color, indentation, aligned cards ===== */
// palette: navy #14213D · paper #F7F5EF · orange #F2A541 · dark-orange #A8530A (numbers, eyebrows) · NEW teal #0B7A75 (keywords)
export const EXTRA_CSS3 = `
#scaler section b,#scaler section .kw{color:#0B7A75;font-weight:900;background:linear-gradient(transparent 64%,rgba(31,168,154,.24) 64%);padding:0 3px;border-radius:2px}
#scaler section.dark b,#scaler section.dark .kw{color:#6FE3D6;background:none}
#scaler section.accent b,#scaler section.accent .kw{color:#14213D;background:linear-gradient(transparent 64%,rgba(255,255,255,.55) 64%)}
#scaler :is(th,.code,.num,.eyebrow,.tag,.lbl) :is(b,.kw){color:inherit;background:none;padding:0}
#scaler .code b{color:#F2A541}
#scaler .fit>:is(.lead,.sub){margin-left:28px}
#scaler :is(ul,ol){padding-left:64px}#scaler li::marker{color:#A8530A;font-weight:900}
#scaler .step>div,#scaler .mini>p{margin-left:6px}
#scaler .card :is(p:not(.tag)){margin-left:2px}
#terms1 .cards{display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:auto auto auto auto auto;gap:0 28px}
#terms1 .card{display:grid;grid-row:span 5;grid-template-rows:subgrid;row-gap:12px;padding:34px 30px;align-content:start}
#terms1 .card>p,#terms1 .card>h3{margin:0}#terms1 .card .ex{display:block;line-height:1.4;padding:12px 16px}#terms1 .card .ex b{display:block;background:none;padding:0;color:#0B7A75}
`;

/* ===== design review 2026-11-26 (Sonnet design critic → applied with the real class names) ===== */
export const EXTRA_CSS4 = `
#scaler .fit>:is(.cards,table,.row,.flow,.step:first-of-type){margin-top:auto}
#scaler .fit>:is(.cards,table,.row,.flow){margin-bottom:auto}
#scaler .fit>.note{margin-top:auto;padding-top:24px;font-size:26px}
#scaler .card p:not(.tag){font-size:30px}
#scaler td b,#scaler td .kw{background:none!important;padding:0;font-weight:800}
#scaler :is(td,.sm,.note,.ex,.sm2) :is(b,.kw){color:#086661}
#scaler img:not([src$=".svg"]):not([src*="IMG-03"]):not([src*="IMG-14"]):not([src*="IMG-01"]){border-radius:12px;box-shadow:0 8px 24px rgba(20,33,61,.16)}
#scaler section.dark>.fit{justify-content:center}
#scaler section.accent>.fit :is(.eyebrow,.lead,.sub,h2,p){color:#14213D!important}
#scaler section.accent>.fit .lead.fragment{font-size:44px;font-weight:900}
#sites-steps ol{font-size:32px!important;line-height:1.7!important}
#cp-admin ul{font-size:30px!important}#cp-admin li{margin-bottom:20px}
#cp-free table,#cp-notebooks table{width:100%}
`;
