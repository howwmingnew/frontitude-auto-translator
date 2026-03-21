# Frontitude Context-Aware Translator

## What This Is

一個靜態 Web App，用來翻譯 Frontitude 匯出的 `language.json` 檔案。支援 OpenAI、Gemini 翻譯引擎。整合 Bitbucket，從專案 git repo 搜尋每個 key 在 WPF 程式碼中的使用情境，用 AI 生成情境說明並注入翻譯 prompt，提升翻譯精準度。

## Core Value

透過程式碼情境讓 AI 翻譯更精準 — 知道 key 用在哪個 UI 元件上，翻譯才能貼合使用場景。

## Current State

**v1.0 shipped 2026-03-21** — 4 phases, 11 plans, 16 requirements all delivered.

Tech stack: Vanilla JS (IIFE + window.App), CSS, HTML. 4,077 LOC JS + 2,804 LOC CSS.
Deployed via GitHub Pages with Cloudflare Worker CORS proxy for Bitbucket API.

## Requirements

### Validated

- ✓ 上傳 language.json 並預覽內容 — existing
- ✓ OpenAI / Gemini 翻譯引擎支援 — existing
- ✓ 多語言同時翻譯 — existing
- ✓ 使用者自訂 context prompt — existing
- ✓ API Key localStorage 持久化 — existing
- ✓ 明暗主題切換 — existing
- ✓ App 介面三語言切換（EN / 繁體中文 / 한국어） — existing
- ✓ Content Preview Excel 風格表格 — existing
- ✓ 單格點擊翻譯 — existing
- ✓ 翻譯結果 JSON 下載 — existing
- ✓ Cloudflare Worker CORS proxy for Bitbucket API — v1.0
- ✓ Bitbucket 連線 UI + 自動連線測試 — v1.0
- ✓ 多檔案架構（IIFE + window.App namespace）— v1.0
- ✓ Bitbucket 檔案掃描搜尋 pipeline（.xaml/.cs, concurrency limiter, cache）— v1.0
- ✓ 右鍵選單搜尋情境 + 搜尋進度顯示 — v1.0
- ✓ AI 生成情境說明（語言跟隨 app 介面語言）— v1.0
- ✓ 情境說明注入翻譯 prompt — v1.0
- ✓ Quick/Precise 模式切換 — v1.0
- ✓ 情境展開面板（程式碼片段 + AI 說明 + inline 編輯 + 復原 + AI 翻譯）— v1.0
- ✓ 三階段進度 stepper — v1.0
- ✓ Per-key 錯誤追蹤 + 批次重試 — v1.0
- ✓ 編輯 modal 情境說明顯示 — v1.0
- ✓ Provider/Bitbucket 區塊可收合 + 狀態徽章 — v1.0

### Active

None — planning next milestone.

### Out of Scope

- Bitbucket Server / Data Center 支援 — 目前只用 Cloud
- 掃描 MFC 程式碼 — 只掃 WPF 部分
- 離線情境快取 — 使用 IndexedDB（v2 candidate）
- 即時同步 Bitbucket 變更 — 每次翻譯時重新查詢

## Context

- 專案使用 WPF + MFC 混合架構，i18n 透過自訂 LocExtension markup extension 實現
- Bitbucket Cloud，使用 Repository Access Token 認證（workspace search 不可用，改用檔案內容掃描）
- 目標使用者包含非工程師（翻譯人員），情境說明需要淺顯易懂
- 多檔案架構（9 JS + 1 CSS + HTML），使用 IIFE + window.App namespace
- 三語言 UI（EN / zh-TW / ko），情境說明跟隨 app 語言
- DeepL provider 已移除（v1.0 後期決策）

## Constraints

- **架構**: 純靜態 Web App，無後端 — Bitbucket API 透過 CORS proxy 從瀏覽器呼叫
- **API Rate Limit**: Bitbucket Cloud API 有請求限制，檔案掃描需併發控制
- **部署**: GitHub Pages 靜態部署
- **安全性**: Access Token 存在 localStorage，不上傳到任何後端

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 使用 Bitbucket Cloud API（非 Server） | 團隊使用 Cloud 版本 | ✓ v1.0 |
| 只掃描 WPF 檔案 | MFC 部分不需要翻譯 | ✓ v1.0 |
| 只查未翻譯 key 的情境 | 節省 API 配額與時間 | ✓ v1.0 |
| 分快速/精準兩種翻譯模式 | 解決批次翻譯效能與情境查詢的矛盾 | ✓ v1.0 |
| 允許拆分多檔案架構 | 功能增加後單檔太複雜 | ✓ v1.0 |
| AI 生成情境說明 | 給非工程師看，需要自然語言描述 | ✓ v1.0 |
| 檔案內容掃描取代 Code Search API | Repository Access Token 無 workspace 搜尋權限 | ✓ v1.0 |
| 移除 DeepL provider | 簡化架構，專注 OpenAI/Gemini | ✓ v1.0 |
| 情境說明語言跟隨 app 介面語言 | 情境將顯示在 UI 面板中，需跟隨使用者語言 | ✓ v1.0 |

---
*Last updated: 2026-03-21 after v1.0 milestone*
