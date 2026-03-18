## ADDED Requirements

### Requirement: Edit Modal SHALL 提供 AI 翻譯按鈕
編輯對話框 SHALL 包含一個「AI 翻譯」按鈕，讓使用者可在 modal 內即時呼叫翻譯 API，將翻譯結果填入 textarea 供使用者確認後儲存。

#### Scenario: 非來源語言儲存格且已設定 API key 時顯示可用的 AI 翻譯按鈕
- **WHEN** Edit Modal 開啟於非來源語言（非 en）的儲存格
- **AND** `state.apiKey` 已設定
- **THEN** AI 翻譯按鈕 SHALL 為可見且啟用狀態

#### Scenario: 來源語言（en）儲存格隱藏 AI 翻譯按鈕
- **WHEN** Edit Modal 開啟於來源語言（en）的儲存格
- **THEN** AI 翻譯按鈕 SHALL 隱藏（不可見）

#### Scenario: 未設定 API key 時 AI 翻譯按鈕為停用狀態
- **WHEN** Edit Modal 開啟於非來源語言儲存格
- **AND** `state.apiKey` 未設定（空或 undefined）
- **THEN** AI 翻譯按鈕 SHALL 為停用狀態（disabled）

#### Scenario: 點擊 AI 翻譯按鈕觸發翻譯並填入結果
- **WHEN** 使用者點擊 AI 翻譯按鈕
- **THEN** 系統 SHALL 使用目前選擇的翻譯 provider 和 API key，將英文來源文本翻譯為目標語言
- **AND** 翻譯過程中按鈕 SHALL 顯示 loading 狀態（disabled + 載入文字）
- **AND** 翻譯成功後 SHALL 將結果填入 textarea（覆蓋現有內容）
- **AND** 使用者 SHALL 仍需點擊「儲存」按鈕才能將翻譯結果寫入 state

#### Scenario: AI 翻譯失敗顯示錯誤訊息
- **WHEN** 使用者點擊 AI 翻譯按鈕且 API 呼叫失敗
- **THEN** 系統 SHALL 顯示錯誤 toast 訊息
- **AND** textarea 內容 SHALL 保持不變
- **AND** AI 翻譯按鈕 SHALL 恢復為可用狀態

### Requirement: AI 翻譯 SHALL 重用現有翻譯邏輯
AI 翻譯按鈕的翻譯呼叫 SHALL 重用現有的翻譯 provider 邏輯（DeepL / OpenAI / Gemini），包含 context prompt 設定。

#### Scenario: 使用 OpenAI provider 時包含 context prompt
- **WHEN** 使用者點擊 AI 翻譯按鈕且目前 provider 為 OpenAI
- **THEN** 翻譯請求 SHALL 包含 `state.contextPrompt` 作為系統提示的一部分

#### Scenario: 使用 DeepL provider 時直接呼叫翻譯 API
- **WHEN** 使用者點擊 AI 翻譯按鈕且目前 provider 為 DeepL
- **THEN** 系統 SHALL 使用 DeepL translate API 進行翻譯（不使用 context prompt）
