## ADDED Requirements

### Requirement: 系統 SHALL 自動偵測已完整翻譯的語言並預設取消勾選
上傳 JSON 後，系統 SHALL 分析每個 target language 的翻譯完成度。對於所有 `en` 中有非空值的 key，若該語言也都有對應非空值，則視為「已完整翻譯」並預設不勾選。

#### Scenario: 上傳包含已完整翻譯語言的 JSON
- **WHEN** 使用者上傳的 `language.json` 中，某語言（如 `ja`）對所有 `en` 有值的 key 都有對應非空值
- **THEN** 該語言在 target languages 區域 SHALL 預設不勾選
- **AND** 其他有缺失翻譯的語言 SHALL 預設勾選

#### Scenario: 所有語言都有缺失翻譯
- **WHEN** 上傳的 JSON 中所有 target languages 都有至少一個 key 缺少翻譯
- **THEN** 所有語言 SHALL 預設勾選（與現行行為一致）

#### Scenario: 所有語言都已完整翻譯
- **WHEN** 上傳的 JSON 中所有 target languages 都已完整翻譯
- **THEN** 所有語言 SHALL 預設不勾選

### Requirement: 使用者重新勾選已完成語言時 SHALL 顯示黃色警告提示
當使用者手動勾選一個已完整翻譯的語言時，系統 SHALL 以視覺方式警告該語言將被重新翻譯。

#### Scenario: 勾選已完整翻譯的語言
- **WHEN** 使用者勾選一個被系統判定為已完整翻譯的語言
- **THEN** 該語言項目 SHALL 顯示黃色邊框（`var(--warning)` 色系）
- **AND** SHALL 在語言名稱旁顯示提示文字，說明「此語言已翻譯完成，重新翻譯將覆蓋全部內容」

#### Scenario: 取消勾選已完成語言的警告
- **WHEN** 使用者取消勾選一個帶有黃色警告的已完成語言
- **THEN** 黃色邊框和提示文字 SHALL 移除

#### Scenario: 未完成語言不顯示警告
- **WHEN** 使用者勾選一個有缺失翻譯的語言
- **THEN** SHALL 不顯示任何警告，使用正常的選取樣式
