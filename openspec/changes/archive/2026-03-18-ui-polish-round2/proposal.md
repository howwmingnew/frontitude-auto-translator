## Why

目前介面有多處 UX 不一致與可用性問題：匯出按鈕互動不直覺、語言切換器顯示技術性語言碼而非人類可讀名稱、API key 輸入區域配色與整體風格不協調、預設 context prompt 未隨 UI 語言切換、target languages 無法智慧判斷已翻譯完成的語言、以及 edit modal 的副標題描述不夠清晰。這些問題影響整體使用體驗的一致性與專業感。

## What Changes

- **匯出按鈕 UX 優化**：重新設計匯出語言檔按鈕的互動方式與視覺呈現，使操作更直覺
- **語言切換器文字改善**：將首頁 UI 語言切換器從語言碼（EN、ZH-TW、KO）改為人類可讀名稱（English、繁體中文、한국어）
- **API key 區域配色修正**：調整設定頁面中 API key 輸入欄位與 remember key checkbox 的視覺風格，使其與整體 UI 配色一致
- **Context prompt 多語系化**：預設 context prompt 文字依照當前 UI 語言動態顯示對應翻譯，而非固定中文
- **Target languages 智慧選取**：自動偵測已完整翻譯的語言並預設取消勾選；若使用者重新勾選已完成語言，以黃色邊框提示並說明重新翻譯將覆蓋現有內容
- **Edit modal 副標題優化**：改善編輯英文原文時的副標題描述文字，使其更清晰易懂

## Capabilities

### New Capabilities
- `smart-target-selection`: 智慧偵測已翻譯完成的語言，預設取消選取並在重新勾選時顯示警告提示

### Modified Capabilities
- `export-language-file`: 匯出按鈕的 UX 互動方式調整
- `edit-source-text`: 編輯原文 modal 的副標題文字描述優化

## Impact

- **程式碼**：僅影響 `index.html`（HTML 結構、CSS 樣式、JS 邏輯）
- **i18n 字串**：需新增/修改多個 i18n key（語言切換器標籤、context prompt 預設值、智慧選取提示文字、edit modal 副標題）
- **localStorage**：無影響，現有持久化邏輯不變
- **相依性**：無新增外部相依
