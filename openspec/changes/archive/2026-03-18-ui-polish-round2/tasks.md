## 1. 匯出按鈕 UX 優化

- [x] 1.1 移除底部 download section（HTML 與 CSS），移除 `download-btn` 相關的 DOM ref 和事件監聽
- [x] 1.2 移除翻譯完成後顯示 download section 的邏輯（`download-section--visible` 切換）
- [x] 1.3 為 export-btn 加入 SVG 下載 icon，調整按鈕樣式使 icon 與文字對齊

## 2. 語言切換器文字改善

- [x] 2.1 將 `#lang-switcher` 按鈕文字從 `EN`/`ZH-TW`/`KO` 改為 `English`/`繁體中文`/`한국어`
- [x] 2.2 調整 `.lang-switcher button` 的 padding 以適應較長的文字

## 3. API Key 區域配色修正

- [x] 3.1 移除 API key input 的 `font-family: monospace`，改用與其他 input 一致的字體
- [x] 3.2 統一 API key input 的背景色與邊框樣式，與其他表單元素一致
- [x] 3.3 為 remember key checkbox 加入自定義樣式（`accent-color: var(--primary)`），統一 `.key-options` 區域的視覺風格

## 4. Context Prompt 預設值多語系化

- [x] 4.1 在 i18n 字典中為 en、zh-TW、ko 新增 `defaultContextPrompt` key
- [x] 4.2 修改 `initContextPrompt()` 函式：從 i18n 字典取得當前語言的預設值，取代硬編碼的中文字串
- [x] 4.3 修改 `applyI18n()` 函式：當 context prompt 未被使用者自行修改時（localStorage 無儲存值或值等於任一語言的預設值），隨 UI 語言切換更新預設值

## 5. Target Languages 智慧選取

- [x] 5.1 新增 `getFullyTranslatedLanguages()` 函式：遍歷 `en` 所有有值的 key，檢查每個 target language 是否都有對應非空值，回傳已完整翻譯語言的 Set
- [x] 5.2 修改上傳 JSON 後的語言選取邏輯：已完整翻譯的語言預設不勾選
- [x] 5.3 新增 CSS class `.lang-item--warning` 搭配 `border-color: var(--warning)` 黃色邊框樣式
- [x] 5.4 修改 `renderLanguages()` 中的 checkbox change handler：勾選已完成語言時加上 `.lang-item--warning` class 並顯示提示文字
- [x] 5.5 在 i18n 字典中新增已完成語言警告提示文字（如「此語言已翻譯完成，重新翻譯將覆蓋全部內容」）

## 6. Edit Modal 副標題優化

- [x] 6.1 修改 i18n 字典中的 `cellEditSourceCurrent` 值：en → `Editing Original Text`、zh-TW → `編輯原文`、ko → `원문 편집`
- [x] 6.2 確認 edit modal meta 行格式 `{key} — {editOriginalLabel}` 正確顯示（移除尾部冒號）
