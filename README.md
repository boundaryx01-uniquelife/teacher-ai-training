# 교사 AI 연수 실습 사이트

고등학교 교사 AI 활용 연수(3교시)용 실습 사이트와 슬라이드 시각 자료. 작업 지시서는 `HANDOFF.md`.

## 구성

| 경로 | 내용 |
| --- | --- |
| `src/` | Vite + 바닐라 TS. 홈, M1~M7, 프롬프트 카드, Copilot 가이드, 최종 과제 |
| `netlify/functions/` | `/api/submit` `/api/explain` `/api/auth` `/api/sessions` `/api/stats` `/api/reset` `/api/purge` `/api/neis`, 매일 `purge` |
| `netlify/lib/` | 공통 코드. **정답은 `netlify/lib/quiz.ts`(서버)에만** |
| `assets/` | 시각 자료 + `manifest.json`(status·path 갱신) + `fonts/`(OFL) |
| `fixtures/` | 촬영용 가상 자료 |
| `scripts/` | 렌더·영상·미리보기·후처리·점검 스크립트 |
| `tests/` | Playwright(데스크톱·iPhone) |

## 환경변수 (Netlify UI에서 사용자가 설정)

| 이름 | 필수 | 설명 |
| --- | --- | --- |
| `TRAINER_PIN` | M3 사용 시 | 6자리 이상 |
| `AUTH_SECRET` | M3 사용 시 | 32자 이상 임의 문자열(예: `openssl rand -hex 32`) |
| `NEIS_API_KEY` | 선택 | 나이스 인증키. 없으면 샘플 모드 |
| `NEIS_ALLOW_KEYLESS` | 선택 | `1`이면 키 없이 나이스 체험 호출(호출 수 제한 있음) |
| `RETENTION_DAYS` | 선택 | 기본 30 |

로컬은 `.env`(커밋 제외)에 같은 이름으로.

## 명령

```bash
npm install
scripts/dev.sh                      # netlify dev (운영과 같은 빌드본, http://localhost:8888)
npx playwright test                 # dev 서버가 떠 있어야 함
node scripts/render-vid01.mjs       # VID-01 mp4 + poster
node scripts/shot-img17.mjs         # IMG-17 (dev 서버 필요)
node scripts/update-manifest.mjs    # manifest status/path 갱신
node scripts/build-previews.mjs     # build/previews/ 슬라이드 교체 미리보기
node scripts/postprocess.mjs        # assets/_raw/ 캡처 원본 → assets/ 규격본
node scripts/check-capture-guide.mjs
python3 -I scripts/make_fixtures.py
```
