# Requirements: Frontitude Context-Aware Translator

**Defined:** 2026-03-20
**Core Value:** 透過程式碼情境讓 AI 翻譯更精準 — 知道 key 用在哪個 UI 元件上，翻譯才能貼合使用場景。

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Infrastructure

- [x] **INFRA-01**: 部署 Cloudflare Workers CORS proxy，轉發 Bitbucket API 請求並處理 CORS headers
- [x] **INFRA-02**: 使用者可輸入 Bitbucket workspace/repo 資訊，透過 Access Token 連接 Bitbucket Cloud
- [x] **INFRA-03**: Access Token 安全存儲於 Cloudflare Worker 端（非瀏覽器 localStorage），避免 XSS 風險
- [x] **INFRA-04**: 現有 index.html 單檔架構拆分為 ES Modules 多檔案結構（無需 bundler）

### Code Search

- [x] **SRCH-01**: 透過 Bitbucket Code Search API 搜尋 key 在 WPF 檔案（.xaml / .cs）中的使用位置
- [x] **SRCH-02**: 識別 LocExtension markup extension 模式，精準匹配 key 使用
- [x] **SRCH-03**: 只對未翻譯的 key 查詢情境，節省 API 配額
- [x] **SRCH-04**: 擷取 key 所在檔案名稱及周圍程式碼行作為使用情境
- [x] **SRCH-05**: 聚合同一 key 在多個檔案中的使用位置，完整呈現所有情境

### AI Context

- [ ] **ACTX-01**: 使用 AI（OpenAI/Gemini）根據程式碼片段生成非工程師能懂的情境說明，語言跟隨 app 介面語言（EN/zh-TW/ko）
- [ ] **ACTX-02**: 將情境資訊（檔名、程式碼片段、AI 說明）注入翻譯 prompt，提升翻譯精準度

### User Experience

- [ ] **UEXP-01**: 使用者可切換快速翻譯（不查情境，同現有）與精準翻譯（帶情境，較慢）兩種模式
- [ ] **UEXP-02**: 點擊 key 行可展開情境面板，顯示程式碼片段、AI 說明，並可行內編輯翻譯結果
- [ ] **UEXP-03**: 精準模式選擇 DeepL 時顯示不相容提示，引導使用 OpenAI/Gemini
- [ ] **UEXP-04**: 情境搜尋過程顯示 loading 進度指示器，區分搜尋/生成/翻譯階段
- [ ] **UEXP-05**: 單一 key 的 API 失敗不阻斷整批翻譯，顯示個別錯誤狀態並允許重試

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Context Enhancement

- **CTXE-01**: 翻譯編輯回饋循環 — 手動修改的翻譯回饋到後續 key 的 prompt 中
- **CTXE-02**: 情境信心指標 — 標註每個 key 是否找到程式碼情境及匹配數量
- **CTXE-03**: 離線情境快取 — 使用 IndexedDB 快取已查詢的情境資料

### Platform

- **PLAT-01**: Bitbucket Server / Data Center 支援
- **PLAT-02**: GitHub / GitLab 整合

## Out of Scope

| Feature | Reason |
|---------|--------|
| 完整 TMS / 翻譯記憶庫 | 這是單用途翻譯工具，非平台 |
| 螢幕截圖 / 視覺化情境 | WPF 桌面應用無法從 web 工具擷取截圖 |
| 即時 Bitbucket 同步 / Webhooks | 使用者在離散 session 中翻譯，非持續同步 |
| MFC 程式碼掃描 | 只掃描 WPF 部分 |
| CI/CD 情境採集 | 靜態 web app，手動操作 |
| 每個 key 選不同翻譯引擎 | UX 複雜度過高，收益有限 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Complete |
| INFRA-02 | Phase 1 | Complete |
| INFRA-03 | Phase 1 | Complete |
| INFRA-04 | Phase 1 | Complete |
| SRCH-01 | Phase 2 | Complete |
| SRCH-02 | Phase 2 | Complete |
| SRCH-03 | Phase 2 | Complete |
| SRCH-04 | Phase 2 | Complete |
| SRCH-05 | Phase 2 | Complete |
| ACTX-01 | Phase 3 | Pending |
| ACTX-02 | Phase 3 | Pending |
| UEXP-01 | Phase 4 | Pending |
| UEXP-02 | Phase 4 | Pending |
| UEXP-03 | Phase 4 | Pending |
| UEXP-04 | Phase 4 | Pending |
| UEXP-05 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 16 total
- Mapped to phases: 16
- Unmapped: 0

---
*Requirements defined: 2026-03-20*
*Last updated: 2026-03-20 after roadmap creation*
