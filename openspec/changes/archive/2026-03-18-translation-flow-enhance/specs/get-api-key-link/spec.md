## ADDED Requirements

### Requirement: Translation Provider 區域 SHALL 顯示取得 API Key 的外部連結按鈕
在 API key actions 行中 SHALL 新增一個按鈕，點擊後以新分頁開啟對應 provider 的 API key 申請/管理頁面。

#### Scenario: 按鈕可見性
- **WHEN** provider section 顯示時
- **THEN** SHALL 在 Test Key 按鈕旁顯示「Get API Key」按鈕
- **AND** 按鈕文字 SHALL 依當前 UI 語言顯示

#### Scenario: 點擊按鈕開啟 DeepL
- **WHEN** 當前 provider 為 DeepL 且使用者點擊按鈕
- **THEN** SHALL 以 `target="_blank"` 開啟 `https://www.deepl.com/pro#developer`

#### Scenario: 點擊按鈕開啟 OpenAI
- **WHEN** 當前 provider 為 OpenAI 且使用者點擊按鈕
- **THEN** SHALL 以 `target="_blank"` 開啟 `https://platform.openai.com/api-keys`

#### Scenario: 點擊按鈕開啟 Gemini
- **WHEN** 當前 provider 為 Gemini 且使用者點擊按鈕
- **THEN** SHALL 以 `target="_blank"` 開啟 `https://aistudio.google.com/apikey`

#### Scenario: 切換 provider 後連結更新
- **WHEN** 使用者切換翻譯 provider
- **THEN** 按鈕的目標 URL SHALL 立即更新為對應 provider 的連結
