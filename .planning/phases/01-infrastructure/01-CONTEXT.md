# Phase 1: Infrastructure - Context

**Gathered:** 2026-03-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Deploy a Cloudflare Workers CORS proxy for Bitbucket API access, build the Bitbucket connection UI in the sidebar drawer, restructure the monolithic index.html into multiple JS/CSS files, and store connection settings in localStorage. This phase delivers the foundation for all subsequent Bitbucket-related features.

</domain>

<decisions>
## Implementation Decisions

### CORS Proxy 部署模式
- App 內建部署引導流程（指引使用者部署自己的 Cloudflare Worker）
- Proxy URL 寫在設定檔中，部署後不需每次輸入
- Origin 限制：只允許指定 domain（GitHub Pages 網域）的請求
- Proxy 只轉發 GET 請求到 Bitbucket API 搜尋和檔案內容端點
- CORS 是硬性阻擋：Bitbucket Cloud 自 2019 年起不支援瀏覽器 CORS

### Bitbucket 連線 UI
- 放在側邊欄 Drawer 內，與 Provider/Language 設定同區
- 欄位：Workspace slug、Repo slug、Access Token、Branch
- Test 按鈕驗證連線（類似現有 API Key 的 Test Key 功能）
- 所有連線資訊（workspace、repo、token、branch）存 localStorage

### 檔案拆分策略
- 整體重構：現有程式碼也拆出去（非僅新功能）
- CSS 拆成獨立 .css 檔案
- 用傳統 `<script src="...">` 標籤按順序載入，不用 ES Modules
- 原因：ES Modules 在 file:// 協定下不可用，使用者需要直接開啟 index.html 開發
- index.html 變成純 HTML 骨架 + script/link 引用

### Token 管理
- 第一版 Token 存 localStorage（跟現有 API key 一致的模式）
- 未來再考慮遷移到 proxy 端安全存儲
- 單一 repo 連線，不需多 repo 切換

### Claude's Discretion
- JS 檔案的拆分粒度和命名（如 state.js、api.js、bitbucket.js 等）
- CSS 檔案的拆分方式（單一檔或多個主題檔）
- Cloudflare Worker 的具體實作細節
- Bitbucket 連線 UI 在 Drawer 中的具體位置和排列

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Bitbucket API
- `.planning/research/STACK.md` — Bitbucket Cloud REST API v2.0 端點、認證方式、Rate Limit、CORS proxy 架構
- `.planning/research/ARCHITECTURE.md` — 組件邊界、資料流、檔案拆分策略

### Existing Codebase
- `.planning/codebase/STRUCTURE.md` — 現有 index.html 內部結構（HTML/CSS/JS 各段落位置）
- `.planning/codebase/CONVENTIONS.md` — 命名慣例、狀態管理模式、錯誤處理模式
- `.planning/codebase/ARCHITECTURE.md` — 現有分層架構（UI/State/Event/API/Utility）

### Security
- `.planning/research/PITFALLS.md` — CORS 阻擋、Token 安全性、Rate Limit 等已知陷阱

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `setState(patch)` 模式：不可變狀態更新，拆分後需保留此模式供所有模組使用
- `dom` 物件：DOM 元素快取模式，拆分後需考慮如何跨模組共享
- `fetchWithTimeout(url, options)`：已有 90 秒超時的 fetch 包裝，Bitbucket API 呼叫可復用
- `showToast(message, type)`：Toast 通知系統，Bitbucket 連線驗證可直接使用
- `showError() / hideError()`：錯誤顯示函式
- `UI_TRANSLATIONS` + `t(key, ...args)`：i18n 系統，新 Bitbucket UI 需加入翻譯字串
- `initProvider()` / `updateKeyBadge()`：Provider 設定 UI 模式，Bitbucket 連線 UI 可參考此模式

### Established Patterns
- IIFE 包裝：目前所有程式碼在單一 IIFE 中，拆分後需要新的全域共享機制
- localStorage 存取：使用 `translate_` 前綴的 key（如 `translate_provider`、`translate_key_openai`）
- camelCase 函式命名 + CONST_CAPS 常數
- 2-space 縮排，分號結尾
- Sidebar Drawer 模式：Provider 和 Language 設定的 collapsible section

### Integration Points
- Sidebar Drawer（lines 1443-1521）：Bitbucket 設定區塊需加在此處
- 啟動流程（lines 3417-3455）：需加入 Bitbucket 連線初始化
- `PROVIDER_CONFIG` 物件：Bitbucket 不是翻譯 provider，但設定 UI 可參考其模式

</code_context>

<specifics>
## Specific Ideas

- Bitbucket 連線 UI 要跟現有 Provider 設定的風格一致（同一個 Drawer 內的 section）
- Test 按鈕行為參考現有的 Test Key 功能（點擊 → loading → 成功/失敗回饋）
- 第一版先用 localStorage 存 Token（跟 API key 一樣），不要過度工程化安全性

</specifics>

<deferred>
## Deferred Ideas

- Token 安全遷移到 proxy 端存儲 — 未來版本考慮
- 多 repo 切換支援 — 如果需求出現再加

</deferred>

---

*Phase: 01-infrastructure*
*Context gathered: 2026-03-20*
