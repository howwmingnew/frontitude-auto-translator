---
status: complete
phase: 04-context-ux
source: [04-01-SUMMARY.md, 04-02-SUMMARY.md, 04-03-SUMMARY.md]
started: 2026-03-21T10:35:00Z
updated: 2026-03-21T11:30:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Quick/Precise 模式切換
expected: Translate 按鈕上方有 Quick 和 Precise 兩個 pill 按鈕。點擊可切換，選中的有明顯背景色。重新整理後模式保留。Bitbucket 未連線時 Precise disabled 且有 tooltip。
result: pass

### 2. DeepL 不相容警告
expected: Precise + DeepL 時顯示黃色警告。
result: skipped
reason: DeepL 已移除，此測試不再適用

### 3. 情境面板展開收合
expected: 點 Key 欄展開 accordion 面板，再點收合。同時只一個面板。點面板外關閉面板。點翻譯 cell 仍開 modal。
result: pass

### 4. 面板翻譯欄位操作
expected: 每語言一行含 EN，Save/復原/AI翻譯按鈕。Save 預設 disabled，修改後啟用，AI翻譯後 disable，復原後 disable。
result: pass

### 5. 三階段進度 Stepper
expected: Precise 模式翻譯時顯示三步驟 stepper，各步驟依序轉換。Quick 模式隱藏。
result: pass

### 6. 翻譯失敗錯誤狀態
expected: 失敗 cell 淡紅背景 + ✗ 圖示，hover 顯示錯誤 tooltip。
result: skipped
reason: 需觸發 API 失敗，無法在正常環境測試

### 7. 批次重試按鈕
expected: 有失敗 key 時顯示 Retry Failed 按鈕，只重試失敗的 key。
result: skipped
reason: 需觸發 API 失敗，無法在正常環境測試

### 8. 編輯 Modal 情境說明
expected: 編輯 modal 顯示使用情境區塊，自動搜尋載入。Save 文字未改時 disabled。
result: pass

## Summary

total: 8
passed: 6
issues: 0
pending: 0
skipped: 2

## Gaps

[none]
