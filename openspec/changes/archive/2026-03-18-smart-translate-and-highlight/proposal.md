## Why

目前翻譯流程有三個問題：(1) 確認對話框顯示只需翻譯缺失文本的數量，但實際上翻譯了所有文本，浪費 API 配額；(2) 翻譯完成後無法在表格中區分哪些儲存格是 AI 翻譯的；(3) 使用 gpt-5-mini 模型時，hardcode 的 `temperature: 0.3` 導致 API 400 錯誤，因為該模型僅支援預設值 1。

## What Changes

- 修改翻譯邏輯：對於非「全部重新翻譯」的語言，僅送出缺失文本給 API，翻譯完成後合併回原有數據（保留已有翻譯值）
- 翻譯完成後，在內容預覽表格中以不同背景色標示被 AI 翻譯的儲存格
- 在 state 中追蹤哪些儲存格是 AI 翻譯的，以便渲染時區分
- 修復 OpenAI temperature 參數：對不支援自訂 temperature 的模型（如 gpt-5-mini），不傳送 temperature 參數或使用預設值

## Capabilities

### New Capabilities
- `ai-translated-highlight`: AI 翻譯儲存格的視覺標記功能，在表格中以不同顏色區分 AI 翻譯的儲存格

### Modified Capabilities
- `translate-confirmation`: 翻譯確認後的實際翻譯行為需與確認對話框顯示的文本數一致，僅翻譯缺失文本

## Impact

- `index.html`：翻譯邏輯（`startTranslation`）、API 呼叫（`callOpenAI` 的 temperature 處理）、表格渲染（`renderEditorTable`）、state 結構（新增 AI 翻譯追蹤）
- 無新增依賴或 API 變更
