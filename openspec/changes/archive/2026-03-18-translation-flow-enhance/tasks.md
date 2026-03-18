## 1. 強化翻譯 Prompt

- [x] 1.1 在 `callOpenAI()` 的 system prompt 後追加佔位符保留、用詞風格、禁止新增內容三段規則
- [x] 1.2 在 `callGemini()` 的 prompt 後追加相同的三段規則
- [x] 1.3 在 i18n 字典中新增 prompt 規則文字（供未來可能的 UI 顯示使用，目前先硬編碼在 JS 中為英文，因為 LLM prompt 統一用英文效果最佳）

## 2. 更新模型清單

- [x] 2.1 更新 `PROVIDER_CONFIG.openai.models` 為 `gpt-5.4-mini`、`gpt-5.4`、`gpt-5.3-instant`、`gpt-5-mini`
- [x] 2.2 更新 `PROVIDER_CONFIG.gemini.models` 為 `gemini-3-flash`、`gemini-3.1-flash-lite`、`gemini-2.5-flash`、`gemini-3.1-pro-preview`
- [x] 2.3 將 models 陣列從純字串改為 `{ id, label }` 物件格式，label 包含模型名稱 + 註解
- [x] 2.4 在 i18n 字典中新增各模型的註解文字（en/zh-TW/ko 三語）
- [x] 2.5 修改 `applyProviderUI()` 中 model dropdown 的渲染邏輯，使用 `label` 作為 `<option>` 顯示文字、`id` 作為 `value`
- [x] 2.6 修改 `loadProviderModel()` 以相容新的物件格式（用 `id` 比對 localStorage 儲存值）
- [x] 2.7 在 `applyI18n()` 中加入重新渲染 model dropdown 的邏輯，使註解隨語言切換更新

## 3. 取得 API Key 按鈕

- [x] 3.1 在 `PROVIDER_CONFIG` 中為每個 provider 新增 `keyUrl` 欄位
- [x] 3.2 在 `api-key-actions` 區域（Test Key 按鈕旁）新增 `<a>` 按鈕 HTML，樣式與 `btn-test-key` 一致
- [x] 3.3 在 i18n 字典中新增 `getApiKey` 文字（en/zh-TW/ko）
- [x] 3.4 修改 `applyProviderUI()` 在 provider 切換時更新按鈕的 `href` 屬性

## 4. 翻譯確認對話框

- [x] 4.1 新增確認對話框的 HTML 結構（overlay + modal，風格與 cell-edit-overlay 一致）
- [x] 4.2 新增確認對話框的 CSS 樣式（摘要表格、按鈕）
- [x] 4.3 新增 `buildTranslationSummary()` 函式：計算每個勾選語言的待翻譯文本數，已完成語言標註「全部重新翻譯」
- [x] 4.4 修改 Translate 按鈕的 click handler：先呼叫確認對話框，使用者確認後才呼叫 `startTranslation()`
- [x] 4.5 新增確認對話框的 Cancel / Translate 按鈕事件、Escape 鍵和 overlay 點擊關閉邏輯
- [x] 4.6 在 i18n 字典中新增確認對話框相關文字（標題、表頭、按鈕、「全部重新翻譯」標註，en/zh-TW/ko）
- [x] 4.7 新增 DOM ref 到 `dom` 物件中
