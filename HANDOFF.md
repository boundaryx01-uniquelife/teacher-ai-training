# 교사 AI 연수 — Claude Code 작업 지시서 v2

작성: 2026-11-25 (KST)
로컬 작업 폴더: `C:\claude\temp\20261124_교사AI연수_실습페이지\` (이 패키지를 여기에 풀고 시작)

## 0. 두 갈래 작업

| 갈래 | 결과물 | 우선순위 |
| --- | --- | --- |
| **A. 실습 사이트** | Netlify 배포용 실습 사이트(모듈 7개 + 안내 페이지) | 1 |
| **B. 시각 자료** | `assets/`의 이미지·아이콘·도식·모션 + 슬라이드 이미지 교체본 | 2 (A의 M2 완성 후) |

## 1. 패키지 구성 (읽는 순서)

1. `HANDOFF.md` — 이 문서
2. `content/lesson-plan.md` — 강의안 전문(사실·문구의 기준). 이 안의 내용만 사이트에 쓴다
3. `content/slide-previews/` — 현재 슬라이드 59장 렌더 PNG(번호_슬라이드ID). 점선 상자 = 이미지 자리
4. `content/slides/` — 슬라이드 원본(HTML·CSS·deck.json). **수정 금지**, B에서 교체본은 별도 폴더에
5. `assets/manifest.json` — 시각 자료 38항목(하위 번호 포함)의 ID·슬라이드·크기·파일명·설명·제작 주체
6. `assets/_style-guide.md` · `assets/_capture-guide.md` · `assets/CREDITS.md`
7. **부록 S(이 문서 끝)** — 구현 세부 사양. 본문과 충돌하면 부록 S가 우선

**기준 우선순위**: 문구·사실 = `lesson-plan.md`, 크기·파일명·개수·형식 = `assets/manifest.json`. 강의안 '시각 자료 제작 목록' 표의 크기·파일명·"31개"는 이전 기준이므로 무시한다. `size_px`는 슬라이드 CSS 픽셀(1920×1080 캔버스 기준, 미리보기 PNG는 1280×720로 축소본)이며, 래스터 파일은 정확히 2배로 저장한다. SVG는 `viewBox`가 같은 비율이면 된다.

## 2. 공통 규칙

- 디자인: 남색 #14213D, 바탕 #F7F5EF, 주황 #F2A541, 진주황 #A8530A, 글꼴 Noto Sans KR. 모바일 우선, 본문 18px 이상, 대비 4.5:1 이상.
- **개인정보**: 어떤 화면·자료에도 학생·교사 실명, 학번, 연락처, 성적을 넣거나 받지 않는다. 예시 자료는 모두 가상.
- 서비스 기능·요금제 정보는 강의안에 있는 것만 쓰고 "2026년 11월 기준, 변경될 수 있음"을 표시. 새 사실을 단정하지 않는다.
- ChatGPT·Copilot 등 외부 AI API를 사이트에서 호출하지 않는다(키 노출·비용). 실습은 프롬프트 복사 → 각자 서비스에 붙여넣기.
- 비밀값은 Netlify 환경변수로만. git은 기능 단위 커밋.

## 3. 갈래 A — 실습 사이트

스택: Vite + 바닐라 TypeScript, Netlify Functions(`/api/*`), Netlify Blobs(DB 역할).

| # | 모듈 | 연결 슬라이드 | 핵심 동작 | 실제/시뮬레이션 |
| --- | --- | --- | --- | --- |
| M1 | 프롬프트 5요소 빌더 | step1 | 역할·대상·과제·조건·형식 입력 → 완성 프롬프트, 복사, 한 줄 프롬프트와 비교 | 실제(로컬) |
| M2 | 퀴즈 앱 해부 실습 | submit-flow, code-front-back | 5문항 풀이 시 옆 패널에 ①요청 JSON ②서버 채점 ③DB 추가 행 ④응답 JSON 실시간 표시. 정답은 서버 함수에만 | **실제** API·DB |
| M3 | 교사 대시보드 | build-choice | M2 기록 집계(문항별 오답률 막대), 연수용 PIN 보호, 초기화 | 실제 |
| M4 | 나이스 급식 API 체험 | neis-api | 교육청·학교 코드 + 날짜 → Function이 나이스 API 호출 → 원본 JSON + 카드 | 실제(실패 시 샘플 데이터로 전환, '샘플' 표시) |
| M5 | MCP 호출 시뮬레이터 | mcp-trace | 문장 선택 → 도구 목록 → 호출 JSON → **승인 버튼** → 응답 → 완료 | 시뮬레이션(명시) |
| M6 | SKILL.md 만들기 | skill-make, skill-md | 폼 → SKILL.md 실시간 생성, 폴더 구조 미리보기, zip 내려받기 | 실제(로컬) |
| M7 | 업무 ↔ AI 짝짓기 | match | 업무 카드 11개를 Chat/Work/Code로 분류(모바일은 탭), 채점·이유 | 실제(로컬) |

추가 페이지:
- **홈**: 3교시 흐름, 모듈 바로가기, 판단 흐름(답=Chat, 파일=Work, 학생 도구=Code).
- **프롬프트 카드 모음**: 강의안의 Work·Sites·스킬 프롬프트, 복사 버튼.
- **Copilot(PENZ) 가이드**: 강의안 '부록: Microsoft Copilot 활용법' 기준. 무료/유료 표, 기능별 탭(Chat · Teach · Notebooks · Learning Zone) — 각 탭에 단계, 실제 예시 프롬프트(복사), 제약. Teach 탭에는 읽기 수준 조절 전후 비교 카드. 관리자 확인 체크리스트(체크 상태는 브라우저에만 저장). Copilot 자체를 호출하지 않음.
- **최종 과제 안내**: 내 단원 퀴즈 만들기 — 무료(캔버스 HTML)·유료(@Sites) 두 갈래 + 공개 전 체크리스트.

데이터 규칙: 제출 행은 `{id, sessionCode, question, answer, correct, at}`만. `sessionCode`로 연수 회차 구분. 30일 후 삭제 또는 대시보드 초기화, 푸터에 표기.

## 4. 갈래 B — 시각 자료

`assets/manifest.json`의 `producer` 값으로 나눈다.

| producer | 수 | 누가 | 방법 |
| --- | --- | --- | --- |
| `code` | 14 | Claude Code | SVG 아이콘·도식은 직접 작성, 일러스트는 SVG로 그려 PNG(2배) 렌더. IMG-17은 M2를 iPhone 뷰포트로 스크린샷. VID-01은 M2 애니메이션을 Playwright로 녹화하거나 코드 애니메이션을 MP4로 렌더(+ poster PNG) |
| `capture` | 23 | 사람(사용자) | `_capture-guide.md` 순서대로 촬영. Code는 촬영용 **가상 자료**를 `fixtures/`에 만든다: 가상 공문 PDF, 가상 평가 계획서(docx), 예전 가정통신문 2개, 통합사회 2단원 가상 수업 자료(pptx·pdf), 가상 학교 교육과정 편성표 |
| `brand` | 1 | Code가 수집 | IMG-14: 각 사 공식 브랜드 자료에서만, 출처는 `CREDITS.md`. 못 구하면 텍스트 칩 |

각 자산 완료 조건:
1. manifest의 `size_px` 비율에 맞음(점선 상자 대체 가능), 스타일 가이드 준수, 글자 깨짐 없음.
2. `status`를 `done`으로 바꾸고 실제 파일 경로 기록.
3. **슬라이드 교체 미리보기**: 부록 S-7 절차대로. 원본 `content/slides`는 건드리지 않는다.
4. 실제 Claude 슬라이드 덱 반영은 Code가 하지 않는다. 완료 후 `assets/` 폴더와 `build/previews/`를 사용자에게 넘기면 Claude(Cowork)가 덱에 업로드·교체한다.

## 5. 하위 에이전트 운영 (토큰 효율)

메인 에이전트는 설계·통합·최종 보고만 한다. 같은 파일 수정은 메인 한 곳에서만.

| 단계 | 하위 에이전트 | 모델 권장 | 맡길 일 | 병렬 |
| --- | --- | --- | --- | --- |
| 착수 | 탐색 | Haiku | 강의안·슬라이드에서 모듈별 필요한 문구·예시 추출(읽기 전용) | O |
| 구현 | 모듈 구현 M1·M6·M7 | Sonnet | 서로 독립 파일, worktree 분리 | O |
| 구현 | 아이콘·도식 SVG | Sonnet | manifest의 `code` 항목 중 SVG | O(사이트와 별개 폴더) |
| 검증 | 테스트 실행 | Haiku | Playwright 실행·로그 수집만 | — |
| 검증 | 독립 리뷰 | Sonnet | 개인정보 규칙·보안(정답 노출, PIN, 환경변수)·접근성 점검 | — |

M2·M3(백엔드·DB)와 공통 레이아웃·라우팅은 메인이 직접. 하위 결과는 핵심만 확인 후 반영.

## 6. 완료 기준 (검증 후 보고)

1. `netlify dev`로 모듈 7개 + 안내 페이지 동작.
2. Playwright: M2 5문항 제출 → JSON 4종 표시 → M3 오답률 반영 → 초기화. 데스크톱·iPhone 둘 다.
3. M4: 정상 1회 + 실패→샘플 전환 1회.
4. 콘솔 에러 0, 모바일 Lighthouse 접근성 90 이상.
5. Netlify **Deploy Preview URL**까지. 본 배포는 사용자 승인 후.
6. 시각 자료: `code` 14항목 완료 + `build/previews/` 렌더, `capture` 23항목은 가이드·가상 자료 준비 완료.
7. 보고는 "확인한 것 / 못 한 것 / 사람이 할 것"으로 나눠서. 테스트 로그 없는 '완료'는 완료가 아니다.

## 7. 작업 순서

0. 사전 점검(부록 S-11) → 1. 뼈대·디자인 토큰·홈 → 2. M2+M3 → 3. M1·M6·M7(병렬) + SVG 아이콘(병렬) → 4. M4·M5 → 5. Copilot 가이드·프롬프트 카드·최종 과제 → 6. 일러스트·IMG-17·VID-01 → 7. fixtures·촬영 가이드 점검 → 8. 슬라이드 교체 미리보기 → 9. 테스트·Deploy Preview.

---

## 부록 S. 구현 세부 사양 (리뷰 반영, 본문보다 우선)

### S-1. M2 문항 (고정, 사용자 확인 후 확정)
보기 4개, `answer`는 "1"~"4" 문자열. 문구는 강의안 '필수 용어' 표에서 가져옴.

| # | 문항 | 보기 | 정답 | 오답 힌트 | 해설(5문항 완료 후) |
| --- | --- | --- | --- | --- | --- |
| 1 | 온실가스가 아닌 것은? | 1 이산화탄소 2 메탄 3 산소 4 아산화질소 | 3 | 광합성에서 나오는 기체를 떠올려 보세요 | 산소는 온실효과를 일으키지 않는다 |
| 2 | 사용자가 보고 누르는 화면 부분은? | 1 프론트엔드 2 백엔드 3 DB 4 MVP | 1 | 식당의 홀·메뉴판이에요 | 프론트엔드 = 화면 |
| 3 | 제출한 답을 채점하는 곳은? | 1 프론트엔드 2 백엔드 3 메뉴판 4 PWA | 2 | 보이지 않는 주방이에요 | 정답은 서버(백엔드)에만 둔다 |
| 4 | 제출 기록을 모아 두는 곳은? | 1 API 2 프론트엔드 3 데이터베이스 4 배포 | 3 | 창고·장부에 해당해요 | DB = 저장된 장부 |
| 5 | 핵심 기능만 넣어 먼저 써 보는 시제품은? | 1 PWA 2 토큰 3 컨텍스트 4 MVP | 4 | 최소 시제품의 영어 약자예요 | MVP = Minimum Viable Product |

### S-2. 정답 비노출
- 응답은 `{correct:boolean, hint:string, trace:{step:"compare", result:"correct"|"wrong"}}`만. 정답 값은 응답·로그·번들·소스맵 어디에도 없게.
- M2 패널 ③은 trace만 문장으로, 비교식의 정답 자리는 `■■■`.
- 문항당 1회 제출(새로 고침 시 새 시도). 해설 표는 5문항 완료 후에만.

### S-3. sessionCode와 입력 검증
- 교사가 M3(PIN 인증 후) [새 회차]를 누르면 서버가 혼동 문자(0·O·1·I) 제외 대문자·숫자 6자리 생성 → `sessions/{code}`에 `{createdAt}` 저장.
- M2는 코드 입력. 없는 코드는 400. 코드 없이 풀면 '연습 모드'(채점만, 저장 안 함).
- `POST /api/submit` 본문은 `{sessionCode:/^[A-Z2-9]{6}$/, question:1..5, answer:"1".."4"}`만 허용, 그 외 400, 1KB 초과 413. 자유 텍스트 저장 없음. IP·UA·헤더 저장 금지, 로그에 본문 출력 금지.
- 요청 JSON 패널에는 실제 전송 본문(sessionCode 포함)을 보여 주고 "슬라이드 예시는 단순화한 것"이라고 한 줄 표기.

### S-4. PIN
- 환경변수 `TRAINER_PIN`(6자리 이상), `AUTH_SECRET`(32바이트). 값은 사용자가 설정, Code는 생성·출력하지 않음. `.gitignore`에 `.env*`.
- 서버에서만 검증(`timingSafeEqual`), 성공 시 4시간 서명 토큰을 `HttpOnly; Secure; SameSite=Strict` 쿠키로. URL·localStorage·번들에 두지 않음.
- `/api/stats`·`/api/sessions`·`/api/reset`은 쿠키 필수(없으면 401). 실패 5회/10분 → 15분 잠금.
- `/api/reset`은 `{sessionCode, confirm:sessionCode}`로 해당 회차만 삭제.

### S-5. Netlify Blobs 설계와 보관 기간
- Functions v2(`netlify/functions/*.mts`), `getStore({name:`${CONTEXT}-submissions`, consistency:"strong"})` — 스토어 이름에 컨텍스트 접두어로 프리뷰와 실데이터 분리.
- 제출 1건 = 키 1개 `rows/{sessionCode}/{epochMs}-{rand4}`(`setJSON`), 배열 append 금지. 표시용 순번은 stats 응답에서.
- 집계는 `list({prefix, paginate:true})` 전체 순회.
- 보관: `purge.mts`(`schedule:"@daily"`)가 `RETENTION_DAYS`(기본 30) 지난 키 삭제 + submit·stats 호출 시 지연 삭제. 테스트는 `RETENTION_DAYS=0`으로 purge 직접 호출. 스케줄 실행은 프로덕션 배포 후 사람이 함수 로그로 확인(보고서 '못 한 것'에 기재). 푸터 문구: "제출 기록은 최대 30일 보관 후 삭제되도록 설정되어 있습니다".
- 테스트: 30건 동시 제출 → 집계 합계 일치.

### S-6. 보안 헤더·호출 제한
- `/api/*`는 동일 출처만. CORS 헤더 설정 안 함(`*` 금지), 다른 `Origin`은 403. 응답에 `Cache-Control: no-store`, `X-Content-Type-Options: nosniff`.
- `netlify.toml`: CSP `default-src 'self'`(Google Fonts 쓰면 해당 도메인만 추가, 또는 로컬 폰트), `frame-ancestors 'none'`, `Referrer-Policy: no-referrer`.
- 제출 API IP당 분당 120회(교실 NAT 고려). Netlify `config.rateLimit` 가능 여부를 문서로 확인, 불가하면 Blobs 카운터.

### S-7. 슬라이드 교체 미리보기 절차
1. `build/slides-with-assets/`에 `content/slides/` 전체를 복사하고 같은 폴더에 `assets/`도 복사(슬라이드 기준 경로 `../assets/파일`).
2. 각 `data-asset="ID"` 요소: `class="ph"` 제거(점선·배경 제거), 기존 `style`(width·height·margin·position)은 유지, 내부 `<p>`를 `<img src="../assets/{file}" alt="{alt_ko}" style="width:100%;height:100%;object-fit:contain;display:block">`로 교체. VID는 `<video src=… poster=… muted loop autoplay playsinline style="width:100%;height:100%;object-fit:contain">`. `status:todo`는 점선 상자 유지.
3. `build/render.html` 하니스: `deck.json`의 `order` 순서로 각 slide HTML을 fetch → `deck.css` 적용된 1920×1080 컨테이너에 넣음. `.card`·`.step`·`.fbox` 애니메이션은 `animation:none !important`.
4. Playwright 뷰포트 1920×1080, `deviceScaleFactor:1`, `document.fonts.ready` 대기 후 `build/previews/{NN}_{id}.png`(원본 미리보기와 같은 이름 규칙).

### S-8. 폰트 (Windows 대비)
- `assets/fonts/`에 Noto Sans KR(OFL, 400·700·900)과 D2Coding 또는 JetBrains Mono를 받아 두고 출처를 `CREDITS.md`에. 사이트·렌더 하니스·SVG 모두 로컬 `@font-face`.
- 글자가 들어간 SVG(IMG-03, IMG-13)는 글자를 path로 변환하거나 폰트 base64 내장. 렌더 전 `document.fonts.check()`.

### S-9. 시각 자료 제작 도구
- SVG→PNG는 Playwright Chromium(`setContent` 후 요소 스크린샷, `deviceScaleFactor:2`, 배경 #F7F5EF). Cairo·librsvg·ImageMagick 등 네이티브 도구 금지.
- 아이콘(IMG-02·05)과 IMG-09·13은 SVG + 같은 이름 `@2x.png` 함께(덱 업로드 호환).
- **VID-01**: M2를 녹화하지 않는다. `build/vid01/index.html`에 1664×260 독립 애니메이션(15초) → 애니메이션 `currentTime`을 프레임마다 설정해 30fps×450장 PNG 캡처 → `ffmpeg -framerate 30 -i %04d.png -c:v libx264 -pix_fmt yuv420p -movflags +faststart -an VID-01_submit-flow.mp4`. ffmpeg 없으면 `ffmpeg-static`. 완성 상태 프레임을 `VID-01_poster.png`로.
- **IMG-17**: `/m2?view=phone`(패널 숨김) 340×600 뷰포트, `deviceScaleFactor:2`, 4번 문항 오답 힌트가 열린 상태.
- **IMG-14**: `assets/IMG-14_logos/{drive,calendar,gmail,canva,notion,outlook,teams,sharepoint,github}.svg`(원본 그대로) + 합성본 `IMG-14_logos-row.png`(3328×180, 바탕 #F7F5EF, 간격 균등). 공식 키트를 무인 수집 못 하면 추측·재제작 금지, 이름만 쓴 남색 칩으로 합성본을 만들고 '사람이 할 것'에 "공식 로고 수동 다운로드" 기재.
- **캡처 후처리는 Code 담당**: 사람은 원본을 `assets/_raw/`에 넣는다. `scripts/postprocess.mjs`가 `size_px`×2 캔버스에 contain + 바탕색 여백 + 모서리 32px(2배 기준) 라운드로 `assets/{file}` 생성. 강조 박스는 같은 이름 `.json`(`[{x,y,w,h}]`)이 있으면 주황 3px로 그림. 영상은 contain + 레터박스.

### S-10. 가상 자료 `fixtures/`
모든 파일에 "가상 자료 — 실제 학교·인물과 무관", 가상 학교명 '한빛고등학교', 전화 `000-0000-0000`. PDF는 Noto Sans KR 내장. Python(`python-docx`, `python-pptx`, `reportlab`) 또는 Node 라이브러리.

| 파일 | 용도 |
| --- | --- |
| `01_공문_가상.pdf` (1~2쪽, 제출 기한 3건) | IMG-21 |
| `02_평가계획서_가상.docx` (수행평가 2회 일정·반영비율) | IMG-15a, IMG-12 |
| `03_가정통신문_예시1.docx`, `03_가정통신문_예시2.docx` | IMG-12, IMG-15b |
| `04_현장체험계획서_가상.docx` (일시·장소·예산·안전, 집합 시각 2개 기재) | VID-02 |
| `05_통합사회2단원_수업슬라이드.pptx`, `05_통합사회2단원_학습지.pdf` (각 5쪽+) | IMG-20 |
| `06_교육과정편성표_가상.pdf`, `06_학업성적관리규정_가상.pdf` (조항 5개+) | IMG-26 |
| `07_과학의날_포스터문구.txt` | IMG-15c |
| `08_기후변화_읽기자료.docx` (강의안의 원문 문단) | IMG-24 |

`fixtures/README.md`에 위 표를 둔다.

### S-11. 사전 점검 (실패 시 작업 전 보고)
`node -v`(20+), `git --version`, `netlify --version`·`netlify status`(로그인·사이트 연결), `npx playwright install chromium`, `ffmpeg -version`(없으면 ffmpeg-static), Lighthouse는 `npx lighthouse`(Chrome 없으면 Playwright Chromium 경로를 `CHROME_PATH`). 한글 경로 문제 시 소스는 `C:\claude\temp\aitraining-site\`에 두고 위치를 보고. Netlify 연결·환경변수·Deploy Preview가 사용자 로그인을 요구하면 멈추고 보고.

### S-12. 모듈 세부
- **M2 레이아웃**: 1024px 이상 좌 퀴즈/우 패널, 미만은 퀴즈 아래 아코디언 4개(제출 후 자동 펼침). ①→④ 0.4초 간격 강조(`prefers-reduced-motion`이면 즉시).
- **M4**: `NEIS_API_KEY` 환경변수(사용자 발급·설정, 없으면 샘플 모드). 응답·표시 URL·로그에서 키를 `***`로. 입력 `ATPT_OFCDC_SC_CODE=/^[A-Z]\d{2}$/`, `SD_SCHUL_CODE=/^\d{7}$/`, `MLSV_YMD=/^\d{8}$/`, 호스트 `open.neis.go.kr` 고정, 타임아웃 5초. 실패 = 네트워크 오류·타임아웃·5xx·파싱 오류. '해당 데이터 없음' 결과 코드는 실패가 아니라 "그날 급식 정보가 없습니다". 샘플은 가상 학교·메뉴 + '샘플' 배지. 테스트용 `?simulateFail=1`(dev·preview에서만). 학교 코드 검색 연동은 하지 않고 포털 링크만.
- **M5**: 문장 3개 — ① "@Google Calendar 다음 주 화요일 15시에 협의회 등록해 줘"(쓰기 → 승인 필요), ② "@Google Calendar 이번 주 일정 알려줘"(읽기), ③ "@Google Drive 수행평가 계획서 찾아 줘"(읽기). 쓰기에서만 [승인]/[거절], 거절 시 "실행하지 않았습니다". '시뮬레이션' 상시 표시.
- **M6**: `name` `/^[a-z0-9]+(-[a-z0-9]+)*$/`(64자 이하), `description` 필수("언제 쓰는지를 적으세요"). zip은 클라이언트(`fflate` 또는 `jszip`), 서버 전송 없음.
- **M7**: 3분류 고정. "최신 정책·진학 정보 조사" = Chat(이유에 "검색 포함"), "주간학습안내 매주 반복" = Work(이유에 "스킬로 고정하면 더 좋음").
- **서비스 정보 화면**(Copilot 가이드, 프롬프트 카드, 최종 과제) 상단에 "2026년 11월 기준 · 변경될 수 있어요 · 연수 전 직접 확인" 고정. 강의안의 '확인 필요'·'예정'·'발표 기준' 같은 유보 표현은 그대로 옮긴다. 체크리스트는 localStorage `copilot-admin-checklist`만, "이 체크는 이 브라우저에만 저장됩니다" 표기.

### S-13. 병렬 작업 경계·마무리
- 병렬 에이전트는 `src/modules/m1|m6|m7/`만 수정. `router`·`index.html`·`package.json`·`netlify.toml`·`src/styles/`는 메인만. 모듈 인터페이스 `export function mount(el: HTMLElement)`.
- `.gitignore`: `node_modules/ build/ .env* assets/_raw/`. 완성 `assets/`는 커밋.
- Lighthouse 접근성 90+는 모바일 모드로 홈·M1~M7·Copilot·최종 과제 전 페이지, 페이지별 점수 보고.
- 완료 시 `handoff-out/`에 `assets/`·`build/previews/`·`fixtures/`를 모으고 경로 보고. manifest 파일명과 `_capture-guide.md` 파일명·크기가 100% 일치하는지 스크립트 비교 결과 첨부.
