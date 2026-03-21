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
- ✓ Cloudflare Worker CORS proxy for Bitbucket API — Validated in Phase 1: Infrastructure
- ✓ Bitbucket 連線 UI（Workspace, Repo, Branch, Token, Proxy URL）— Validated in Phase 1: Infrastructure
- ✓ 多檔案架構（IIFE + window.App namespace）— Validated in Phase 1: Infrastructure
- ✓ Bitbucket Code Search pipeline（.xaml-first/.cs-fallback, concurrency limiter, cache）— Validated in Phase 2: Code Search Pipeline
- ✓ 右鍵選單搜尋情境 + 搜尋進度顯示 — Validated in Phase 2: Code Search Pipeline
- ✓ AI 生成非工程師能懂的情境說明（語言跟隨 app 介面語言）— Validated in Phase 3: AI Context Generation
- ✓ 情境說明注入翻譯 prompt，提升翻譯精準度 — Validated in Phase 3: AI Context Generation
- ✓ Quick/Precise 模式切換 + DeepL 不相容提示 — Validated in Phase 4: Context UX
- ✓ 點擊 key 展開情境面板（程式碼片段 + AI 說明 + inline 翻譯編輯）— Validated in Phase 4: Context UX
- ✓ 三階段進度 stepper（搜尋 → 生成 → 翻譯）— Validated in Phase 4: Context UX
- ✓ Per-key 錯誤追蹤 + 批次重試 — Validated in Phase 4: Context UX

### Active

<!-- 所有 v1 功能已完成 -->

None — all v1 requirements delivered.

### Out of Scope

- Bitbucket Server / Data Center 支援 — 目前只用 Cloud
- 掃描 MFC 程式碼 — 只掃 WPF 部分
- 離線情境快取 — 第一版不做
- 即時同步 Bitbucket 變更 — 每次翻譯時重新查詢

## Context

- 專案使用 WPF + MFC 混合架構，i18n 透過自訂 LocExtension markup extension 實現
- Bitbucket Cloud，使用 Repository Access Token 認證
- 目標使用者包含非工程師（翻譯人員），情境說明需要淺顯易懂
- 現有 app 已拆分為多檔案架構（Phase 1 完成），使用 IIFE + window.App namespace
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
| 分快速/精準兩種翻譯模式 | 解決批次翻譯效能與情境查詢的矛盾 | ✓ Phase 4 |
| 允許拆分多檔案架構 | 功能增加後單檔太複雜 | ✓ Phase 1 |
| AI 生成情境說明 | 給非工程師看，需要自然語言描述 | ✓ Phase 3 |

---
*Last updated: 2026-03-21 after Phase 4 completion (v1.0 milestone complete)*
