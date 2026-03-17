[English](README.md) | [中文](README.zh-TW.md) | 한국어

# Frontitude 원클릭 번역기

> **[온라인에서 사용해보기](https://howwmingnew.github.io/frontitude-auto-translator/)** — 설치 없이 브라우저에서 바로 실행됩니다.

DeepL, OpenAI 또는 Gemini를 사용하여 Frontitude `language.json` 파일을 일괄 번역하는 브라우저 기반 도구입니다. 백엔드 서버 없음, 빌드 과정 없음, 완전한 클라이언트 사이드 실행.

## 주요 기능

- **다중 공급자 지원** — DeepL, OpenAI, Gemini 중 선택
- **드래그 앤 드롭 업로드** — `language.json` 파일을 끌어다 놓으면 바로 번역 시작
- **콘텐츠 미리보기** — 전체 너비 Excel 스타일 테이블로 키와 번역 내용 확인
- **컨텍스트 프롬프트** — 도메인 컨텍스트(예: "치과 임플란트 소프트웨어")를 제공하여 더 정확한 OpenAI/Gemini 번역
- **JSON 다시 선택** — 페이지를 새로고침하지 않고 다른 파일로 전환
- **35개 이상의 언어** — 아랍어부터 베트남어까지
- **일괄 번역** — 선택한 모든 언어를 한 번에 번역
- **실시간 진행 상황 추적** — 언어별 상태가 포함된 진행 바
- **100% 클라이언트 사이드** — API 호출이 브라우저에서 공급자에게 직접 전송
- **API 키 유지** — 선택적으로 `localStorage`에 키 저장 가능

## 지원 공급자

| 공급자 | 모델 | 키 형식 |
|--------|------|---------|
| DeepL | — (단일 엔드포인트) | DeepL API 키 |
| OpenAI | `gpt-4o-mini`, `gpt-4o`, `gpt-4.1-mini`, `gpt-4.1-nano` | `sk-...` |
| Gemini | `gemini-2.0-flash`, `gemini-2.5-flash`, `gemini-2.5-pro` | Gemini API 키 |

## 빠른 시작

1. 브라우저에서 `index.html`을 **엽니다**
2. `language.json`을 **업로드**합니다
3. **공급자를 선택**하고 API 키를 붙여넣은 후, 선택적으로 모델을 선택합니다
4. *(선택 사항)* **컨텍스트 프롬프트**를 추가하여 번역을 안내합니다 (OpenAI/Gemini만 해당)
5. 대상 언어 선택 → **번역** 클릭 → **다운로드**

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
- **백엔드 서버가 없습니다** — 전체 앱이 단일 HTML 파일입니다
- API 키는 **어떤 제3자 서버에도 전송되지 않습니다**
- 키 저장은 `localStorage`를 사용하며, 사용자의 기기에만 보관됩니다

## 기술 스택

- **단일 파일** HTML / CSS / JavaScript
- **의존성 제로** — 프레임워크 없음, npm 없음, 빌드 과정 없음
- 모든 최신 브라우저에서 작동 — `index.html`을 열기만 하면 됩니다

## 변경 이력

과거 설계 문서, 스펙, 작업 목록은 [openspec/changes/archive/](openspec/changes/archive/)를 참조하세요.

## 라이선스

MIT
