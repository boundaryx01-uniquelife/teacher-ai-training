# 사람이 할 일 — 단계별 안내 (2026-11-25 KST)

순서대로 하면 됩니다. ① 10분, ② 3분, ③ 캡처(약 1.5~2시간, 나눠서 해도 됨).

---

## ① M3 강사 PIN 켜기 (Netlify, 약 10분)

### 1-1. AUTH_SECRET 값 만들기 (Windows)
시작 메뉴 → **PowerShell** 실행 → 아래 한 줄을 붙여 넣고 Enter:

```powershell
$b = New-Object byte[] 32; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); -join ($b | % { $_.ToString('x2') })
```

64자짜리 영문·숫자가 나오면 복사해 둡니다. 이 값은 외울 필요가 없고, 아무에게도 보여 줄 필요가 없습니다.
(Mac이면 터미널에서 `openssl rand -hex 32`)

### 1-2. PIN 정하기
숫자 6자리 이상(예: 8자리)으로 정합니다. 생일·전화번호는 쓰지 마세요. 연수 당일 강사만 씁니다.

### 1-3. Netlify에 넣기
1. https://app.netlify.com/projects/teacher-ai-training 열기
2. 왼쪽 **Project configuration** → **Environment variables**
3. **Add a variable** → **Add a single variable**
   - Key: `TRAINER_PIN` / Value: 1-2의 PIN
   - **Contains secret values** 체크
   - Scopes: **Functions** 포함(기본 All scopes도 됨)
   - Deploy contexts: **Same value for all deploy contexts**
   - **Create variable**
4. 같은 방법으로 Key `AUTH_SECRET` / Value: 1-1의 64자 값
5. 왼쪽 **Deploys** → 오른쪽 위 **Trigger deploy** → **Deploy site** (1~2분)

### 1-4. 확인
- https://teacher-ai-training.netlify.app/m3 → PIN 입력 → **새 회차 만들기**가 보이면 성공
- Claude에게 "PIN 넣었어"라고 알려 주세요. M2→M3→초기화 자동 테스트를 하려면 PIN이 필요하니, 원하면 채팅에 알려 주고 테스트가 끝난 뒤 PIN을 바꾸면 됩니다(바꾼 뒤 1-3의 5번 재배포).

---

## ② 캡처 받을 드라이브 폴더 만들기 (3분)

1. https://drive.google.com → **새로 만들기 → 새 폴더** → 이름 **`연수캡처`**
2. 가상 자료 받기: https://github.com/boundaryx01-uniquelife/teacher-ai-training/raw/main/docs/capture-kit.zip
   → 압축 풀기 → 아래 표에 나오는 파일을 시연 계정의 구글 드라이브(ChatGPT 시연용)와 OneDrive(PENZ 시연용)에 올려 둡니다.
   - 모두 "가상 자료 — 실제 학교·인물과 무관"이 적힌 파일입니다.
3. Claude에게 "폴더 만들었어"라고 알려 주세요. 캡처는 다 찍은 뒤 한 번에 넣어도 되고, 찍는 대로 넣어도 됩니다.

---

## ③ 캡처 22개 + 로고 1개

### 공통 규칙
- **사진**: `Win + Shift + S` → 영역 선택 → 자동 저장된 이미지(사진\스크린샷 폴더)를 `연수캡처` 폴더에 올리기. **파일 이름은 신경 쓰지 않아도 됩니다**(Claude가 내용을 보고 판별). 헷갈리면 이름 앞에 ID(예: `IMG-21`)만 붙여 주세요.
- **영상**: Windows 11 **캡처 도구** → 녹화(▶ 아이콘) → 영역 선택 → 시작/중지 → mp4 저장. 60초가 넘어도 괜찮습니다(Claude가 배속·자르기).
- **2컷·3컷**이라고 적힌 것은 컷마다 따로 찍으세요. 합성은 Claude가 합니다.
- 브라우저 확대 100%, 다크 모드 끔, 창은 넓게(1400px 정도).
- **화면에 실제 학생 이름·성적·연락처·학교 메일이 보이면 안 됩니다.** 계정 이름이 보이면 흐리게 하거나 잘라서 찍으세요.

### 3-A. ChatGPT (시연 계정, 유료 플랜 기능 포함) — 남은 것 (IMG-15b 스킬 비교는 뺐음)

| ID | 순서 / 입력할 문장 | 화면에 꼭 보여야 할 것 | 준비 파일 |
| --- | --- | --- | --- |
| **IMG-06** | ChatGPT **데스크톱 앱** 열기 → Work 탭 선택 | 상단 Chat·Work·Codex 탭 + Work 입력창 | — |
| **IMG-10** (3컷) | ① 플러그인(앱) 디렉터리에서 "Google Drive" 검색 결과 ② 상세 화면 ③ 연결 버튼 | 세 화면 각각 | — |
| **IMG-11** | Calendar 연결 후 채팅: `@Google Calendar 다음 주 화요일 15시에 협의회 등록해 줘` | **등록 완료 카드**(설정에 따라 승인 없이 바로 실행됨 — 촬영 완료) | 더미 캘린더 |
| **IMG-12** | 채팅: `가정통신문 작성 스킬을 만들어 줘` | 요청 + skill-creator가 되묻는 질문 | `03_가정통신문_예시1·2.docx` 첨부 가능 |
| **VID-02** (영상) | 드라이브에 `04_현장체험계획서_가상.docx` 올려 둔 뒤 Work에: `@Google Drive의 ‘현장체험 계획서’를 읽고, 가정통신문·학생 안전 체크리스트·당일 시간표 슬라이드를 만들어 줘. 발송은 하지 말고 초안만.` | 계획 → 드라이브 검색 → (집합 시각이 두 개라) 되묻는 질문 → 파일 3개 → 승인 요청 | `04_현장체험계획서_가상.docx` |
| **IMG-07** | Work에서 `@Sites 이 문항 5개로 퀴즈 사이트, 문항별 오답률을 교사만 보게` (문항 5개 붙여 넣기) → 미리보기 | Sites 미리보기 화면 + **폰 화면 미리보기** | — |
| **VID-03** (영상) | 위 사이트로: 미리보기 → 수정 요청 1번(예: `오답이면 힌트 먼저 보여 줘`) → 배포 → 공유 범위 선택 → 링크 복사 | 6단계 흐름 | — |
| **IMG-08** | Sites **공유** 창 열기 | 나만 / 지정한 사람 / 인터넷 누구나 선택지 | — |
| **IMG-15a** | 드라이브에 `02_평가계획서_가상.docx` 올린 뒤: `@Google Drive 에서 ‘2학기 지필평가 계획’ 찾아서 학생용 시험 범위 안내문 만들어 줘.` | 만들어진 **시험 범위 안내문** | `02_평가계획서_가상.docx` |
| **IMG-15c** | Canva 연결 후: `@Canva 과학의 날 행사 포스터 초안 3개.` (문구는 `07_과학의날_포스터문구.txt`) | 채팅 안의 포스터 초안 | `07_과학의날_포스터문구.txt` |

### 3-B. Microsoft 365 Copilot — PENZ **교사** 계정 — 4개, 약 15분 (Teach는 이 계정에 없어 뺐음)

| ID | 순서 / 입력할 문장 | 화면에 꼭 보여야 할 것 | 준비 파일 |
| --- | --- | --- | --- |
| **IMG-18** | PENZ 계정으로 Microsoft 365 Copilot 앱(또는 m365.cloud.microsoft) 로그인 | **방패(데이터 보호) 표시** — 확대해서 찍기 | — |
| **IMG-21** | Copilot Chat에 PDF 올리고: `담임이 할 일·기한만 표로` | 할 일·기한·제출처 **표** 결과 | `01_공문_가상.pdf` |
| **IMG-25** | Notebooks → 새 노트북 → 자료 추가 → **학습 가이드** 만들기 | 3단 화면(참고 항목·페이지·채팅) + 학습 가이드 생성 창 | `05_통합사회2단원_*` 2개 |
| **IMG-26** | 새 노트북 이름 `우리 학교 교육과정 지식방` → 두 PDF 추가 → `3학년 선택과목 개설 조건은?` 또는 `수행평가 반영 비율 규정 조항은?` | **근거 링크가 붙은 답변**(또는 마인드맵) | `06_교육과정편성표_가상.pdf`, `06_학업성적관리규정_가상.pdf` |

### 3-C. PENZ **학생 테스트** 계정 — 1개, 약 10분

| ID | 순서 | 화면에 꼭 보여야 할 것 | 준비 파일 |
| --- | --- | --- | --- |
| **IMG-20** | Notebooks → 자료 추가 → 학습 가이드 → **플래시카드** 열기 | 학습 가이드 + 플래시카드 | `05_통합사회2단원_수업슬라이드.pptx`, `05_통합사회2단원_학습지.pdf` |


### 3-E. 로고 1개

| 할 일 | 방법 |
| --- | --- |
| Canva 공식 로고 | 일반 브라우저로 https://www.canva.com/newsroom/ (또는 Canva 브랜드 페이지)에서 로고 SVG 내려받기 → `연수캡처` 폴더에 넣기 |
| 출처 확인 | Microsoft 3종(Office 공식 아이콘 서버)·Notion(사이트 아이콘) 출처가 괜찮은지 "괜찮다/바꿔라"만 알려 주기 |

### 다 넣은 뒤
Claude에게 "캡처 넣었어"라고 알려 주세요. Claude가 다음을 합니다.
판별 → 크기 맞춤·라운드·강조 박스 → 개인정보 노출 점검 → 슬라이드(`/slides`)·PDF 반영 → `main` push(자동 본 배포) → 확인 보고.
일부만 넣어도 그만큼 먼저 반영합니다.

---

## ④ 나중에 (선택)
- 연수 당일: 교실 와이파이로 사이트를 열어 "Security by Netlify 연결 확인" 화면이 뜨는지 확인(뜨면 몇 초 기다리면 넘어감)
- 연수 전날: 강의안의 '확인 필요'·'예정' 항목(요금제·기능 범위) 재확인
- 짧은 주소를 원하면 정해서 알려 주기(홈의 주소 카드에 넣음)


---

## 2026-11-26 정리 (사용자 결정)
- **Teach 삭제**: 교육청(PENZ) 교사 계정에 Teach 메뉴가 없어서, 슬라이드 3장(cp-teach-menu·lesson·modify)과 캡처 IMG-22·23·24를 뺐습니다. IMG-19는 ‘학습’ 메뉴 화면으로 바꿔 반영했습니다.
- **스킬 비교 삭제**: 스킬은 개념 설명까지만. IMG-15b(스킬 전후 비교)를 뺐습니다.
- **Learning Zone 삭제**: 사이드바에 없어서(윈도 앱·기기 조건) 슬라이드 2장(cp-lz·cp-lz-limits)과 캡처 IMG-27·28을 뺐습니다.
- **남은 캡처(7개)**: IMG-15c(Canva 포스터) · IMG-08 · VID-03(Sites 배포 후) · IMG-18(방패 확대) · IMG-25 · IMG-26 · IMG-20(학생 계정)

### 원본 덱(Cowork)에 같은 수정 전달
1. 슬라이드 삭제: `cp-teach-menu`, `cp-teach-lesson`, `cp-teach-modify`, `cp-lz`, `cp-lz-limits`
2. `cp-free` 표에서 Teach 행 삭제, `cp-free` 표에서 Learning Zone 행도 삭제, 번호 정리: `cp-notebooks` 제목 위 "③ Copilot Notebooks" → "② Copilot Notebooks"
3. `cp-teacher`: 제목은 그대로(정리 · 내일 바로 해 볼 4가지), 항목을 ① 공문 요약(PDF 공문 → “담임이 할 일·기한만 표로”) ② 수업 삽화(“열대우림 단면도를 교과서 삽화 느낌으로, 글자 없이”) ③ Notebooks(교육과정·교재를 모아 “이 자료 안에서만 답해”) ④ 학습 메뉴(개념이 막힐 때 답 대신 힌트·질문으로 이해)로 교체, 이미지는 IMG-19(‘학습’ 메뉴 화면)
4. `cp-vs`: "Chat·Teach·Notebooks" → "Chat·Notebooks", "교사용 Teach" 삭제
5. `cp-admin`: "Teach · Notebooks · Study and Learn 허용" → "Notebooks · Study and Learn 허용", "10분: Teach로 같은 단원 퀴즈" → "10분: Copilot Chat으로 같은 단원 퀴즈 문항"
6. `demo3`: 가운데 카드(스킬)의 이미지 자리(IMG-15b) 삭제
7. `mcp-trace` 3단계 문구 → "쓰기 동작 — 설정에 따라 승인을 묻거나 바로 실행", `work-trace` 3단계 → "8:30? 8:00?"
8. 2026-11-26 리뷰 반영: `work-what` 표 '사람 역할' → "질문에 답하기, 방향 수정, 저장·발송 범위 정하기(“초안만”)", `work-trace` 6단계 → "저장 전 확인 — 설정에 따라 묻거나 바로 저장", `skill-make` 5단계 "결업식" → "종업식"
9. 줄바꿈: `section { word-break: keep-all; overflow-wrap: anywhere; }`, 문단·제목에 `text-wrap: pretty`

## 2026-11-26 Copilot 간소화 (사용자 결정)
- 전자 필기장(Notebooks)은 **NotebookLM과 비교하는 수준**으로만 다룸: 슬라이드 cp-notebooks를 비교표로 교체, cp-notebooks-ex 삭제, 사이트·가이드북도 같은 비교표.
- IMG-20(학생 계정), IMG-26(지식방 답변) 제외. cp-student는 표만 남기고 이미지 자리 삭제.
- **남은 캡처 2개**: IMG-18(방패 + "엔터프라이즈 데이터 보호" 말풍선), IMG-25(사이드바 ‘전자 필기장’ 첫 화면)
- 원본 덱(Cowork)에도: `cp-notebooks-ex` 삭제, `cp-notebooks` 비교표로 교체, `cp-student` 이미지 자리 삭제
