## Context

目前 `startTranslation()` 對每個目標語言都翻譯所有 `en` 鍵值，即使確認對話框已計算出僅需翻譯缺失的文本數。此外，翻譯完成後表格無法區分 AI 翻譯與原始數據，且 OpenAI gpt-5-mini 模型不支援自訂 temperature 值導致 400 錯誤。

## Goals / Non-Goals

**Goals:**
- 翻譯時僅送出確認對話框中計算的缺失文本，節省 API 配額
- 對「全部重新翻譯」的語言，保留原始翻譯值於 state 中以供參考
- 翻譯完成後以視覺標記區分 AI 翻譯的儲存格
- 修復 gpt-5-mini temperature 不相容問題

**Non-Goals:**
- 不實作逐一儲存格選擇翻譯的功能
- 不改變 DeepL 或 Gemini 的 temperature 處理
- 不實作翻譯歷史記錄或 undo 功能

## Decisions

### 1. 差異翻譯邏輯

**決策**：在 `startTranslation()` 中根據 `buildTranslationSummary()` 的結果決定送出哪些文本。

- 非全部重新翻譯：篩選出 `langData[key]` 為空或 undefined 的鍵，僅送出這些文本給 API，翻譯完成後與現有 langData 合併
- 全部重新翻譯：行為不變，送出所有文本，但在覆蓋前將舊值存入 `state.originalTranslations`

**替代方案**：在 API dispatcher 層做篩選 → 否決，因為篩選邏輯與 UI 確認更相關，應在 orchestration 層處理。

### 2. AI 翻譯追蹤

**決策**：新增 `state.aiTranslatedCells` (Set)，儲存格式為 `"lang:key"`。

- 翻譯完成後，將所有被 AI 翻譯的 (lang, key) 組合加入此 Set
- `renderEditorTable()` 渲染時檢查此 Set，對匹配的 `<td>` 加上 CSS class
- 重新選擇 JSON 時清空此 Set

**替代方案**：在 jsonData 中加 metadata → 否決，會污染數據結構且影響 export。

### 3. 視覺標記樣式

**決策**：使用淺藍色背景 (`--ai-translated-bg`) 搭配左側 2px 邊框指示。

- Light mode: `#eff6ff` (藍色淺底) + `#3b82f6` 左邊框
- Dark mode: `#172554` + `#60a5fa` 左邊框
- 與現有 edited cell 的黃色標記互不衝突

### 4. OpenAI temperature 修復

**決策**：維護一份不支援自訂 temperature 的模型清單（如 `gpt-5-mini`），在 `callOpenAI()` 中條件性地省略 temperature 參數。

- 清單方式比 try-catch 更可靠，避免無謂的失敗重試
- 若模型不在清單中，維持現有 `temperature: 0.3`

**替代方案**：全面移除 temperature → 否決，其他模型使用 0.3 能提供更穩定的翻譯結果。

## Risks / Trade-offs

- **差異翻譯的批次邊界**：缺失文本數量可能不是 50 的倍數，但現有批次邏輯已能處理任意長度陣列 → 無需額外處理
- **模型清單維護**：未來若有更多模型不支援 temperature，需手動更新清單 → 可接受，頻率低且易於修改
- **aiTranslatedCells 記憶體**：大型檔案可能有數千個 key × 多語言 → Set 儲存字串效率足夠，不構成問題
