## ADDED Requirements

### Requirement: 點擊 Translate 按鈕後 SHALL 顯示確認對話框
使用者點擊 Translate 按鈕後，系統 SHALL 先彈出確認對話框而非直接開始翻譯。對話框 SHALL 顯示每個目標語言的翻譯摘要。

#### Scenario: 顯示確認對話框
- **WHEN** 使用者點擊 Translate 按鈕
- **THEN** SHALL 顯示自訂 modal 對話框
- **AND** 對話框 SHALL 包含標題、語言摘要列表、Cancel 和 Translate 按鈕

#### Scenario: 摘要顯示待翻譯數量
- **WHEN** 確認對話框顯示時
- **THEN** SHALL 列出每個已勾選的目標語言
- **AND** 每行 SHALL 顯示語言名稱與待翻譯的文本數量（`en` 中有值但該語言缺少對應值的 key 數）

#### Scenario: 已完成語言顯示全部重新翻譯
- **WHEN** 使用者勾選了已完整翻譯的語言（smart-target-selection 警告中的語言）
- **THEN** 該語言行 SHALL 顯示全部 key 數量
- **AND** SHALL 標註「全部重新翻譯」提示

#### Scenario: 使用者確認翻譯
- **WHEN** 使用者在確認對話框中點擊 Translate 按鈕
- **THEN** 對話框 SHALL 關閉
- **AND** 翻譯流程 SHALL 開始執行

#### Scenario: 使用者取消翻譯
- **WHEN** 使用者在確認對話框中點擊 Cancel 或按 Escape 或點擊 overlay
- **THEN** 對話框 SHALL 關閉
- **AND** 翻譯流程 SHALL 不執行
