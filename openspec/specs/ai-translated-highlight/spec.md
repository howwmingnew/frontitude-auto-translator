### Requirement: AI 翻譯儲存格視覺標記
翻譯完成後，系統 SHALL 在內容預覽表格中以不同背景色標示被 AI 翻譯的儲存格，使用者能一眼區分 AI 翻譯結果與原始數據。

#### Scenario: 翻譯缺失文本後標記新翻譯的儲存格
- **WHEN** 使用者對某語言執行翻譯且該語言有部分缺失文本
- **THEN** 僅被 AI 翻譯填入的儲存格 SHALL 顯示藍色背景標記
- **THEN** 原本已有值的儲存格 SHALL 維持原樣不加標記

#### Scenario: 全部重新翻譯後標記所有翻譯的儲存格
- **WHEN** 使用者對某語言選擇「全部重新翻譯」
- **THEN** 該語言所有被 AI 翻譯覆蓋的儲存格 SHALL 顯示藍色背景標記

#### Scenario: 重新選擇 JSON 時清除標記狀態
- **WHEN** 使用者點擊「重新選擇 JSON」
- **THEN** 所有 AI 翻譯標記 SHALL 被清除

#### Scenario: 深色模式下的標記顯示
- **WHEN** 使用者切換至深色模式
- **THEN** AI 翻譯標記 SHALL 使用適合深色背景的顏色方案

### Requirement: AI 翻譯追蹤狀態
系統 SHALL 在 state 中維護一個集合，追蹤哪些儲存格 (語言, 鍵) 是由 AI 翻譯的。

#### Scenario: 翻譯完成後記錄 AI 翻譯的儲存格
- **WHEN** 一批翻譯完成
- **THEN** 系統 SHALL 將所有被翻譯的 (語言, 鍵) 組合加入追蹤集合

#### Scenario: 追蹤狀態不影響匯出數據
- **WHEN** 使用者匯出翻譯結果
- **THEN** 匯出的 JSON SHALL 不包含任何追蹤 metadata
