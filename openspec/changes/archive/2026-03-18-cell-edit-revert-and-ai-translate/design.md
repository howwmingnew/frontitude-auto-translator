## Context

目前編輯對話框（Edit Modal）只有 textarea + 儲存/取消按鈕。使用者手動編輯儲存格後無法復原，也無法在 modal 內直接觸發 AI 翻譯。現有 state 中的 `editedCells` 是 `Set<string>`（`key::lang` 格式），只追蹤「是否被編輯過」，不保存原始值。

## Goals / Non-Goals

**Goals:**
- 使用者可在編輯對話框中一鍵復原儲存格至編輯前的值
- 使用者可在編輯對話框中觸發 AI 翻譯，結果填入 textarea 供確認
- 保持單一 `index.html` 架構不變

**Non-Goals:**
- 多層 undo/redo 歷史紀錄（僅支援復原至最近一次編輯前的值）
- 批次復原多個儲存格
- 修改批次翻譯流程

## Decisions

### 1. 使用 `originalValues` Map 追蹤原始值

將 `state.editedCells` 從 `Set` 改為 `Map<string, string>`，key 為 `key::lang`，value 為**首次編輯前**的原始值。這樣一個結構同時滿足「是否被編輯過」（has）和「原始值是什麼」（get）兩個需求。

**替代方案**：新增獨立的 `originalValues` Map + 保留 `editedCells` Set → 多餘的重複追蹤，增加同步風險。

### 2. 復原按鈕在 modal 內、僅已編輯儲存格可用

復原按鈕放在 modal footer，與 AI 翻譯按鈕並列。按鈕僅在 `editedCells.has(key::lang)` 時啟用（非 disabled 態），避免誤操作。點擊後直接將 textarea 填入原始值，使用者仍需點「儲存」才會寫入 state（或可設計為直接寫入——選擇前者，保持 modal 的「預覽後確認」一致性）。

**修正**：復原應直接寫入 state 並關閉 modal，因為「復原」是明確意圖，不需要再確認。這與「AI 翻譯填入 textarea」的行為區分：翻譯結果需要人工確認，復原值使用者已知。

### 3. AI 翻譯按鈕重用現有翻譯邏輯

抽取 `handleCellTranslate` 中的核心翻譯呼叫為可重用函式（如 `translateSingleText(text, targetLang)`），讓 modal 內的 AI 翻譯按鈕可呼叫。翻譯結果填入 textarea，使用者檢視後手動儲存。

按鈕在以下情況隱藏或 disabled：
- 來源語言（en）欄位：隱藏
- 無 API key：disabled + tooltip 提示

### 4. Modal footer 按鈕排列

```
[復原] [AI 翻譯]                    [取消] [儲存]
```

左側為輔助操作，右側為主要操作。復原和 AI 翻譯使用 outline/secondary 樣式，儲存為 primary。

## Risks / Trade-offs

- **`editedCells` 型別變更** → 所有讀取 `editedCells` 的地方需從 `.has()` on Set 改為 `.has()` on Map（API 相同，影響小）。但 `new Set(state.editedCells)` 複製邏輯需改為 `new Map(state.editedCells)`。
- **翻譯函式抽取** → 需確保 AbortController、error handling、provider 分支邏輯正確抽取，避免引入 regression。
- **復原後 editedCells 清除** → 復原後該 cell 的 `editedCells` entry 應移除，highlight 也隨之消失。若使用者復原後又再次編輯，需重新記錄新的原始值（此時原始值就是復原後的值，即最初的原始值——但已被移除）。解法：復原時不刪除 entry，而是將值更新為當前值，或保留原始值不變。**選擇**：復原時刪除 entry，若再次編輯則重新記錄（此時記錄的是復原後的值，等同原始值），邏輯最簡單。
