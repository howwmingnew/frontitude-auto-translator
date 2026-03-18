## MODIFIED Requirements

### Requirement: An "匯出語言檔" button SHALL be available at all times in the editor phase
一個匯出按鈕 SHALL 始終顯示在 editor phase 的 Content Preview 區域，作為唯一的檔案匯出入口。移除翻譯完成後額外顯示的 download section，避免重複按鈕造成使用者混淆。按鈕 SHALL 包含下載 icon 以強化視覺暗示。

#### Scenario: Export button is visible after file upload
- **WHEN** 使用者上傳有效的 `language.json` 並進入 editor phase
- **THEN** 匯出按鈕 SHALL 在 Content Preview 區域可見
- **AND** 按鈕 SHALL 包含下載 icon
- **AND** 按鈕 SHALL 始終可見，不論是否已執行翻譯

#### Scenario: Export button downloads current state of jsonData
- **WHEN** 使用者點擊匯出按鈕
- **THEN** 系統 SHALL 下載包含當前 `state.jsonData` 的 `language.json` 檔案
- **AND** 下載的檔案 SHALL 包含本次 session 中所有手動編輯與翻譯結果

#### Scenario: Export button works before any translation
- **WHEN** 使用者已上傳檔案但尚未執行任何翻譯
- **AND** 使用者點擊匯出按鈕
- **THEN** 系統 SHALL 下載原始上傳資料作為 `language.json`

#### Scenario: Export button label follows current UI language
- **WHEN** UI 語言設定為任何支援的語言（en, zh-TW, ko）
- **THEN** 匯出按鈕標籤 SHALL 以當前 UI 語言顯示

#### Scenario: 翻譯完成後不顯示額外 download section
- **WHEN** 翻譯流程完成
- **THEN** SHALL 不再顯示底部的獨立 download section
- **AND** 使用者 SHALL 透過 Content Preview 區域的匯出按鈕下載檔案
