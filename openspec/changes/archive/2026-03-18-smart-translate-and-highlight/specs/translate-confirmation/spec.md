## MODIFIED Requirements

### Requirement: 翻譯僅處理確認的文本數量
系統 SHALL 在翻譯時僅送出確認對話框中顯示的文本數給 API，而非所有文本。對於非「全部重新翻譯」的語言，僅翻譯缺失的文本並與現有數據合併。

#### Scenario: 翻譯僅缺失文本的語言
- **WHEN** 某語言有 100 個鍵但僅 30 個缺失翻譯
- **WHEN** 確認對話框顯示該語言需翻譯 30 個文本
- **WHEN** 使用者確認翻譯
- **THEN** 系統 SHALL 僅送出 30 個缺失文本給翻譯 API
- **THEN** 翻譯結果 SHALL 與現有 70 個已翻譯文本合併
- **THEN** 現有的 70 個翻譯值 SHALL 被保留不變

#### Scenario: 全部重新翻譯的語言
- **WHEN** 某語言被標記為「全部重新翻譯」
- **WHEN** 使用者確認翻譯
- **THEN** 系統 SHALL 送出所有文本給翻譯 API
- **THEN** 系統 SHALL 在翻譯前保存該語言的原始翻譯值

### Requirement: 保留原始翻譯值
對於「全部重新翻譯」的語言，系統 SHALL 在覆蓋前保存原始翻譯文本（如果有值），以供使用者參考。

#### Scenario: 重新翻譯前保存原始值
- **WHEN** 某語言有已存在的翻譯值
- **WHEN** 使用者選擇全部重新翻譯該語言
- **THEN** 系統 SHALL 將該語言的原始翻譯值保存至 state 中

### Requirement: OpenAI temperature 相容性
系統 SHALL 對不支援自訂 temperature 值的 OpenAI 模型（如 gpt-5-mini）省略 temperature 參數，避免 API 400 錯誤。

#### Scenario: 使用 gpt-5-mini 翻譯
- **WHEN** 使用者選擇 gpt-5-mini 模型進行翻譯
- **THEN** API 請求 SHALL 不包含 temperature 參數
- **THEN** 翻譯 SHALL 正常完成無錯誤

#### Scenario: 使用支援 temperature 的模型翻譯
- **WHEN** 使用者選擇其他支援 temperature 的模型（如 gpt-4o-mini）
- **THEN** API 請求 SHALL 包含 `temperature: 0.3`
