[English](README.md) | [中文](README.zh-TW.md) | 한국어

# Frontitude 컨텍스트 인식 번역기

> **[온라인에서 사용해보기](https://howwmingnew.github.io/frontitude-auto-translator/)** — 설치 없이 브라우저에서 바로 실행됩니다.

OpenAI 또는 Gemini를 사용하여 Frontitude `language.json` 파일을 일괄 번역하는 브라우저 기반 도구입니다. Bitbucket 통합을 통한 컨텍스트 인식 번역을 지원합니다. 백엔드 서버 없음, 빌드 과정 없음, 완전한 클라이언트 사이드 실행.

## 주요 기능

### 핵심 번역
- **다중 공급자 지원** — OpenAI와 Gemini 중 선택
- **드래그 앤 드롭 업로드** — `language.json` 파일을 끌어다 놓으면 바로 번역 시작
- **콘텐츠 미리보기** — 전체 너비 Excel 스타일 테이블로 키와 번역 내용 확인
- **컨텍스트 프롬프트** — 도메인 컨텍스트(예: "치과 임플란트 소프트웨어")를 제공하여 더 정확한 번역
- **JSON 다시 선택** — 페이지를 새로고침하지 않고 다른 파일로 전환
- **35개 이상의 언어** — 아랍어부터 베트남어까지
- **일괄 번역** — 선택한 모든 언어를 한 번에 번역
- **스마트 차등 번역** — 누락된 텍스트만 번역하여 기존 번역 보존
- **AI 번역 하이라이트** — 미리보기 테이블에서 AI 번역된 셀을 파란 배경으로 표시
- **되돌리기 지원** — 모든 셀을 가져올 당시의 원래 값으로 되돌리기 가능
- **실시간 진행 상황 추적** — 배치별 업데이트 진행 바와 번역된 텍스트 수 표시
- **100% 클라이언트 사이드** — API 호출이 브라우저에서 공급자에게 직접 전송
- **API 키 유지** — 선택적으로 `localStorage`에 키 저장 가능

### 컨텍스트 인식 번역 (Bitbucket 통합)
- **Quick / Precise 모드 전환** — 빠른 번역 또는 컨텍스트 강화 번역 선택
- **Bitbucket 코드 검색** — WPF 저장소(.xaml / .cs 파일)를 스캔하여 각 번역 키의 사용 위치 찾기
- **AI 컨텍스트 생성** — 코드 스니펫을 사람이 읽을 수 있는 설명으로 변환 (예: "로그인 화면의 버튼 라벨")
- **컨텍스트 인식 프롬프트** — 키별 컨텍스트를 번역 프롬프트에 주입하여 더 정확하고 UI에 적합한 번역
- **확장 가능한 컨텍스트 패널** — 키를 클릭하면 코드 스니펫, AI 설명을 보고 인라인으로 번역 편집
- **편집 모달 컨텍스트 표시** — 개별 셀 편집 시 컨텍스트 설명 표시
- **3단계 진행 스테퍼** — Precise 모드에서 검색 → 생성 → 번역 단계 표시
- **키별 오류 처리** — 실패한 키가 배치를 차단하지 않음; 실패한 번역에 대한 재시도 버튼
- **다국어 컨텍스트** — AI 설명이 앱 UI 언어를 따름 (EN / 繁體中文 / 한국어)
- **자동 연결** — 저장된 Bitbucket 자격 증명이 페이지 로드 시 자동으로 테스트됨

## 지원 공급자

| 공급자 | 모델 | 키 형식 |
|--------|------|---------|
| OpenAI | `gpt-5.4-mini`, `gpt-5.4`, `gpt-5.4-nano`, `gpt-5-mini` | `sk-...` |
| Gemini | `gemini-3-flash`, `gemini-3.1-flash-lite`, `gemini-2.5-flash`, `gemini-3.1-pro-preview` | Gemini API 키 |

## 빠른 시작

### 기본 번역

1. 브라우저에서 앱을 **엽니다**
2. `language.json`을 **업로드**합니다
3. **공급자를 선택**하고 API 키를 붙여넣은 후, 선택적으로 모델을 선택합니다
4. *(선택 사항)* **컨텍스트 프롬프트**를 추가하여 번역을 안내합니다
5. 대상 언어 선택 → **번역** 클릭 → **다운로드**

### 컨텍스트 인식 번역 (Precise 모드)

1. **CORS 프록시 배포** — [프록시 설정](#프록시-설정) 참조
2. **Bitbucket 연결** — 사이드바에서 workspace, repo, branch, access token 입력
3. **Precise 모드로 전환** — Translate 버튼 위의 Precise 버튼 클릭
4. **번역** — 앱이 코드 컨텍스트를 검색하고, 설명을 생성한 다음, 컨텍스트와 함께 번역합니다
5. **컨텍스트 검토** — 키를 클릭하여 컨텍스트 패널 확장

## 프록시 설정

Bitbucket Cloud는 브라우저에서 API를 호출하기 위해 CORS 프록시가 필요합니다. Cloudflare Worker 프록시가 포함되어 있습니다:

```bash
cd proxy
npm install
npx wrangler login
npx wrangler deploy
npx wrangler secret put ALLOWED_ORIGIN
# 앱 URL을 입력하세요 (예: http://localhost:8080 또는 GitHub Pages URL)
```

배포 후 앱의 Bitbucket Connection 설정에 Worker URL을 입력합니다.

## JSON 형식

이 도구는 소스 언어(`en`)와 하나 이상의 대상 언어 키가 포함된 Frontitude 형식의 `language.json`을 사용합니다:

```json
{
  "en": {
    "greeting": "Hello",
    "farewell": "Goodbye"
  },
  "fr": {
    "greeting": "",
    "farewell": ""
  },
  "ja": {
    "greeting": "",
    "farewell": ""
  }
}
```

번역기는 해당하는 `en` 소스 텍스트를 사용하여 각 빈 대상 언어 값을 채웁니다.

## 지원 언어

`ar` 아랍어, `bg` 불가리아어, `cs` 체코어, `da` 덴마크어, `de` 독일어, `el` 그리스어, `en` 영어, `es` 스페인어, `et` 에스토니아어, `fi` 핀란드어, `fr` 프랑스어, `he` 히브리어, `hi` 힌디어, `hu` 헝가리어, `id` 인도네시아어, `it` 이탈리아어, `ja` 일본어, `ko` 한국어, `lt` 리투아니아어, `lv` 라트비아어, `nb` 노르웨이어(보크몰), `nl` 네덜란드어, `pl` 폴란드어, `pt` 포르투갈어, `pt-br` 브라질 포르투갈어, `pt-pt` 유럽 포르투갈어, `ro` 루마니아어, `ru` 러시아어, `sk` 슬로바키아어, `sl` 슬로베니아어, `sv` 스웨덴어, `th` 태국어, `tr` 터키어, `uk` 우크라이나어, `vi` 베트남어, `zh` 중국어 간체, `zh-tw` 중국어 번체

## 개인정보 보호 및 보안

- 모든 API 호출은 **브라우저에서 선택한 공급자에게 직접** 전송됩니다
- Bitbucket API 호출은 **사용자 자체 CORS 프록시**(Cloudflare Worker)를 통해 전송됩니다
- **공유 백엔드 서버가 없습니다** — 앱은 정적 사이트입니다
- API 키와 Bitbucket 토큰은 `localStorage`에 저장되며, **어떤 제3자 서버에도 전송되지 않습니다**

## 기술 스택

- **다중 파일 아키텍처** — HTML 스켈레톤 + CSS + 9개의 JavaScript IIFE 모듈
- **외부 JS 의존성 제로** — Google Fonts (Inter) CDN만 사용
- **Cloudflare Worker** — Bitbucket API용 CORS 프록시 (선택 사항, Precise 모드에서만 필요)
- 모든 최신 브라우저에서 작동 — 완전한 기능을 위해 HTTP 서버로 제공

## 개발

```bash
# 로컬에서 실행
python -m http.server 8080
# 또는
npx serve .
```

브라우저에서 http://localhost:8080을 엽니다.

## 라이선스

MIT
