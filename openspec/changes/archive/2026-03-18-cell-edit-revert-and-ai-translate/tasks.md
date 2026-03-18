## 1. State 結構變更

- [x] 1.1 將 `state.editedCells` 從 `new Set()` 改為 `new Map()`，更新初始化和 reset 處
- [x] 1.2 更新所有 `editedCells` 讀取處：table render 中的 `.has()` 判斷（Map 和 Set 皆有 `.has()`，確認相容）、`new Set()` 複製改為 `new Map()`

## 2. 編輯儲存時記錄原始值

- [x] 2.1 在 `cellEditSave` handler 中，儲存前檢查 `editedCells.has(key::lang)`，若無記錄則將當前值（編輯前）存入 Map
- [x] 2.2 更新 `setState` 呼叫，傳入新的 `editedCells` Map

## 3. Edit Modal HTML — 新增按鈕

- [x] 3.1 在 Edit Modal footer 新增「復原」按鈕（左側，outline 樣式，預設 disabled）
- [x] 3.2 在 Edit Modal footer 新增「AI 翻譯」按鈕（左側，outline 樣式）
- [x] 3.3 調整 footer 佈局：左側放復原 + AI 翻譯，右側放取消 + 儲存

## 4. 復原功能

- [x] 4.1 在 `openEditModal` 中根據 `editedCells.has(key::lang)` 設定復原按鈕的 disabled 狀態
- [x] 4.2 實作復原按鈕 click handler：從 `editedCells` 取得原始值、更新 `state.jsonData`、從 Map 移除記錄、re-render table、關閉 modal、顯示 toast

## 5. AI 翻譯功能

- [x] 5.1 抽取現有 `handleCellTranslate` 中的核心翻譯呼叫為獨立函式 `translateSingleText(text, targetLang)`，回傳 Promise<string>
- [x] 5.2 更新 `handleCellTranslate` 改用 `translateSingleText`
- [x] 5.3 在 `openEditModal` 中根據語言和 API key 狀態設定 AI 翻譯按鈕的可見性與 disabled 狀態
- [x] 5.4 實作 AI 翻譯按鈕 click handler：呼叫 `translateSingleText`、loading 狀態管理、成功時填入 textarea、失敗時顯示 error toast

## 6. i18n 文字

- [x] 6.1 新增 UI 文字：復原按鈕文字、AI 翻譯按鈕文字、復原成功 toast、AI 翻譯 loading 文字等

## 7. 驗證

- [x] 7.1 測試：編輯儲存格 → 復原 → highlight 消失、值恢復
- [x] 7.2 測試：AI 翻譯按鈕在 en 欄位隱藏、無 API key 時 disabled
- [x] 7.3 測試：AI 翻譯結果填入 textarea 後需手動儲存才寫入 state
