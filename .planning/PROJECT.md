# Frontitude Context-Aware Translator

## What This Is

一個靜態 Web App，用來翻譯 Frontitude 匯出的 `language.json` 檔案。支援 DeepL、OpenAI、Gemini 三種翻譯引擎。這次要新增 Bitbucket 整合功能，讓系統能從專案 git repo 中搜尋每個 key 在 WPF 程式碼中的使用情境，用這些情境來提升 AI 翻譯精準度，特別針對 UI 文本字串的翻譯場景。

## Core Value

透過程式碼情境讓 AI 翻譯更精準 — 知道 key 用在哪個 UI 元件上，翻譯才能貼合使用場景。

## Requirements

### Validated

<!-- 現有已運作的功能 -->

- ✓ 上傳 language.json 並預覽內容 — existing
- ✓ DeepL / OpenAI / Gemini 多翻譯引擎支援 — existing
- ✓ 多語言同時翻譯 — existing
- ✓ 使用者自訂 context prompt — existing
- ✓ API Key localStorage 持久化 — existing
- ✓ 明暗主題切換 — existing
- ✓ App 介面三語言切換（EN / 繁體中文 / 한국어） — existing
- ✓ Content Preview Excel 風格表格 — existing
- ✓ 單格點擊翻譯 — existing
- ✓ 翻譯結果 JSON 下載 — existing

### Active

<!-- 這次要做的新功能 -->

- [ ] Bitbucket Cloud 整合（Access Token 認證）
- [ ] 掃描 WPF 檔案（.xaml / .cs）搜尋 key 使用位置（LocExtension markup extension）
- [ ] 只對未翻譯 key 查詢情境（節省 API 配額）
- [ ] 擷取檔名 + 周圍程式碼作為使用情境
- [ ] AI 生成非工程師能懂的情境說明（語言跟隨 app 介面語言）
- [ ] 點擊 key 展開面板，顯示使用情境 + 程式碼片段 + AI 說明
- [ ] 展開面板中可編輯翻譯結果
- [ ] 編輯後的翻譯結果回饋到 prompt 中
- [ ] 兩種翻譯模式：快速翻譯（不查情境，同現有）vs 精準翻譯（帶情境，較慢）
- [ ] 精磨 UX：loading 狀態、錯誤處理、進度顯示

### Out of Scope

- Bitbucket Server / Data Center 支援 — 目前只用 Cloud
- 掃描 MFC 程式碼 — 只掃 WPF 部分
- 離線情境快取 — 第一版不做
- 即時同步 Bitbucket 變更 — 每次翻譯時重新查詢

## Context

- 專案使用 WPF + MFC 混合架構，i18n 透過自訂 LocExtension markup extension 實現
- Bitbucket Cloud，使用 Repository Access Token 認證
- 目標使用者包含非工程師（翻譯人員），情境說明需要淺顯易懂
- 現有 app 是單一 index.html 架構，這次可以拆分成多個 JS/CSS 檔案
- 現有 app 已有三語言 UI（EN / zh-TW / ko），情境說明需跟隨 app 語言

## Constraints

- **架構**: 純靜態 Web App，無後端 — Bitbucket API 從瀏覽器直接呼叫
- **API Rate Limit**: Bitbucket Cloud API 有請求限制，需批次查詢優化
- **部署**: GitHub Pages 靜態部署
- **安全性**: Access Token 存在 localStorage，不上傳到任何後端

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 使用 Bitbucket Cloud API（非 Server） | 團隊使用 Cloud 版本 | — Pending |
| 只掃描 WPF 檔案 | MFC 部分不需要翻譯 | — Pending |
| 只查未翻譯 key 的情境 | 節省 API 配額與時間 | — Pending |
| 分快速/精準兩種翻譯模式 | 解決批次翻譯效能與情境查詢的矛盾 | — Pending |
| 允許拆分多檔案架構 | 功能增加後單檔太複雜 | — Pending |
| AI 生成情境說明 | 給非工程師看，需要自然語言描述 | — Pending |

---
*Last updated: 2026-03-20 after initialization*
