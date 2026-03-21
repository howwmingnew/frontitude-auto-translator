---
status: complete
phase: 03-ai-context-generation
source: [03-01-SUMMARY.md, 03-02-SUMMARY.md, 03-03-SUMMARY.md]
started: 2026-03-21T09:10:00Z
updated: 2026-03-21T10:30:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Precise 模式三階段 pipeline
expected: 選擇 Precise 模式 + OpenAI 或 Gemini，上傳 language.json，點擊 Translate。進度文字依序顯示「搜尋情境」→「生成情境說明」→「翻譯」三個階段。stepper 依序轉換。
result: pass

### 2. AI 情境說明生成
expected: 點擊 key 展開面板或點翻譯 cell 開啟 modal，都應顯示 AI 生成的情境說明。
result: pass

### 3. 情境說明語言跟隨 app 介面語言
expected: 將 app 介面語言切換到繁體中文或韓文，AI 說明應跟隨介面語言。
result: pass

### 4. 情境注入翻譯 prompt
expected: 翻譯時 prompt 中 hasAnyContext 為 true，user content 為 JSON object array 格式含 text 和 context 欄位。
result: pass

### 5. DeepL Precise 模式靜默降級
expected: Precise + DeepL 翻譯正常完成，不出錯，不顯示搜尋/情境進度文字。
result: pass

### 6. 情境搜尋失敗不阻斷翻譯
expected: 搜尋不到情境的 key 仍正常翻譯，面板顯示「此 key 未找到程式碼使用情境。[重試]」。
result: pass

## Summary

total: 6
passed: 6
issues: 0
pending: 0
skipped: 0

## Gaps

[none]
