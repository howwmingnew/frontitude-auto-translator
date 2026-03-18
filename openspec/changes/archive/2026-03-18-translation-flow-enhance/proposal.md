## Why

翻譯品質和使用者信心是這個工具的核心價值。目前的翻譯 prompt 過於簡單，導致 LLM 可能破壞佔位符格式、加入原文沒有的標點、或使用不適當的用詞風格。模型清單已過時（GPT-4.x 系列已退役），使用者無法選用最新且更具性價比的模型。此外，新使用者不知道去哪裡取得 API key，翻譯前也缺乏確認步驟可能導致誤觸翻譯浪費 API 額度。

## What Changes

- **強化翻譯 prompt**：在 OpenAI/Gemini 的 system prompt 中加入佔位符保留規則（`{0}`、`{{name}}` 等）、目標語言偏好用詞風格指引、禁止增加原文沒有的標點或內容
- **更新模型清單**：OpenAI 更新為 gpt-5.4-mini、gpt-5.4、gpt-5.3-instant、gpt-5-mini；Gemini 更新為 gemini-3-flash、gemini-3.1-flash-lite、gemini-2.5-flash、gemini-3.1-pro-preview。每個模型名稱後附加特性註解（快速、高品質、平衡等）
- **新增「取得 API Key」按鈕**：在 Translation Provider 區域新增按鈕，點擊後依當前 provider 開啟對應的 API key 申請/管理頁面
- **翻譯前確認對話框**：點擊 Translate 按鈕後先彈出確認框，列出每個目標語言及其將翻譯的文本數量，使用者確認後才執行翻譯

## Capabilities

### New Capabilities
- `enhanced-translation-prompt`: 強化 LLM 翻譯 prompt，加入佔位符保留、用詞風格、禁止新增內容等規則
- `get-api-key-link`: 在 provider 設定區域新增取得 API key 的外部連結按鈕
- `translate-confirmation`: 翻譯前的確認對話框，顯示目標語言與文本數量摘要

### Modified Capabilities
- `test-api-key`: 模型清單更新（需更新 PROVIDER_CONFIG 中的 models 陣列與顯示格式）

## Impact

- **程式碼**：僅影響 `index.html`（JS prompt 模板、PROVIDER_CONFIG、HTML 按鈕、確認對話框邏輯）
- **i18n 字串**：需新增多個 key（取得 API key 按鈕文字、確認對話框標題/內容/按鈕、模型註解）
- **外部連結**：DeepL（deepl.com/pro#developer）、OpenAI（platform.openai.com/api-keys）、Google AI（aistudio.google.com/apikey）
- **相依性**：無新增外部相依
