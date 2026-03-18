## 1. State 與 CSS 基礎建設

- [x] 1.1 在 state 中新增 `aiTranslatedCells` (Set) 和 `originalTranslations` (Object)，並在 `setState` 初始化及 reselect JSON 時清空
- [x] 1.2 新增 CSS 變數 `--ai-translated-bg` 和 `--ai-translated-border`（Light/Dark mode），以及 `.ai-translated` class 樣式

## 2. 差異翻譯邏輯

- [x] 2.1 修改 `startTranslation()` — 對非全部重新翻譯的語言，篩選出缺失鍵的文本，僅送出缺失文本給 API，翻譯後與現有 langData 合併
- [x] 2.2 修改 `startTranslation()` — 對全部重新翻譯的語言，翻譯前將舊值保存至 `state.originalTranslations[lang]`
- [x] 2.3 翻譯完成後，將所有被 AI 翻譯的 (lang, key) 組合以 `"lang:key"` 格式加入 `state.aiTranslatedCells`

## 3. AI 翻譯視覺標記

- [x] 3.1 修改 `renderEditorTable()` — 渲染表格時檢查 `state.aiTranslatedCells`，對匹配的 `<td>` 加上 `.ai-translated` CSS class

## 4. OpenAI Temperature 修復

- [x] 4.1 在 `callOpenAI()` 中新增不支援自訂 temperature 的模型清單（含 gpt-5-mini），條件性地省略 temperature 參數

## 5. 驗證

- [x] 5.1 驗證：部分缺失語言僅翻譯缺失文本，已有值保持不變
- [x] 5.2 驗證：AI 翻譯的儲存格在表格中顯示藍色標記，深色模式下正常顯示
- [x] 5.3 驗證：選用 gpt-5-mini 時翻譯不再報 temperature 錯誤
