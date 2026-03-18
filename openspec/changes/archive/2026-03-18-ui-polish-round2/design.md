## Context

目前 `index.html` 存在六項 UX 瑕疵需要修正。所有改動僅影響單一檔案，無架構變更，屬於純 UI 層面的 polish。

現狀：
- 匯出按鈕有兩個（editor table 內的 export-btn 與 download section 的 download-btn），download section 在翻譯完成後才顯示，export-btn 則始終可見但 UX 互動不直覺
- 語言切換器硬編碼顯示 `EN`、`ZH-TW`、`KO`
- API key 輸入區使用 `monospace` 字體、`var(--card)` 背景，remember checkbox 是系統預設樣式
- `DEFAULT_CONTEXT` 固定為中文字串 `'齒科植牙軟體介面多國語系翻譯'`
- target languages 全選所有語言，不考慮翻譯完成度
- edit modal 原文副標題使用 `English Source (Current):` 格式

## Goals / Non-Goals

**Goals:**
- 統一匯出按鈕行為，消除重複按鈕帶來的混淆
- 語言切換器顯示人類可讀的語言名稱
- API key 區域視覺風格與整體 UI 一致
- Context prompt 預設值隨 UI 語言切換
- 智慧判斷已翻譯語言，減少不必要的重複翻譯
- 改善 edit modal 的描述文字清晰度

**Non-Goals:**
- 不重新設計整體 UI 佈局或配色系統
- 不增加新的翻譯功能或 API provider
- 不修改 localStorage 資料結構

## Decisions

### 1. 匯出按鈕整合

移除底部 download section 的獨立按鈕，僅保留 editor table 頂部的 export-btn。翻譯完成後不再顯示額外的 download section，export-btn 始終作為唯一匯出入口。按鈕加入下載 icon 強化視覺暗示。

**替代方案**：保留兩個按鈕但統一樣式 → 拒絕，因為兩個按鈕做同樣的事會讓使用者困惑。

### 2. 語言切換器使用原生語言名稱

按鈕文字改為各語言的原生名稱：`English`、`繁體中文`、`한국어`。因為按鈕空間會變寬，改用水平 pill 按鈕群組。

### 3. API key 區域配色對齊

將 API key input 的字體從 `monospace` 改為與其他 input 一致的預設字體，背景色使用 `var(--surface)` 或與其他輸入框一致的值。checkbox 改用自定義樣式與 `accent-color: var(--primary)` 一致。

### 4. Context prompt 預設值國際化

將 `DEFAULT_CONTEXT` 從固定字串改為從 i18n 字典中取值（新增 `defaultContextPrompt` key）。在 `applyI18n()` 時，若 context prompt 未被使用者修改（等於任一語言的預設值或 localStorage 無儲存），則更新為當前語言的預設值。

### 5. Target languages 智慧選取

上傳 JSON 後分析每個 target language 的翻譯完成度：遍歷所有 `en` 有值的 key，檢查該語言是否都有對應非空值。完整翻譯的語言預設不勾選。使用者手動勾選已完成語言時，以 `border-color: var(--warning)` 黃色邊框標示，並在語言標籤旁顯示提示 tooltip 或小文字說明。

### 6. Edit modal 副標題改善

將 `cellEditSourceCurrent` 從 `English Source (Current):` 改為更直覺的描述，例如 `Editing Original Text`（en）、`編輯原文`（zh-TW）、`원문 편집`（ko）。meta 行格式從 `{key} — English Source (Current):` 改為 `{key} — 編輯原文`。

## Risks / Trade-offs

- **[風險] 移除 download section 可能影響已習慣的使用者** → 緩解：export-btn 位置明顯且始終可見，過渡成本低
- **[風險] 智慧選取判斷邏輯可能與使用者期望不同**（例如有值但值是空字串）→ 緩解：只檢查 non-empty string，空字串視為未翻譯
- **[取捨] 語言切換器按鈕變寬** → 可接受，因為按鈕數量少（3 個），且人類可讀名稱的易用性收益遠大於空間成本
