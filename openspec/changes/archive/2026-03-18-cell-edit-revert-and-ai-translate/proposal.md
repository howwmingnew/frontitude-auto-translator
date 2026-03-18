## Why

使用者在編輯表格儲存格後，目前無法復原至原始值，必須手動記住並重新輸入。同時，編輯對話框只有手動輸入功能，缺少 AI 翻譯按鈕來快速取得翻譯建議，使用者必須關閉對話框、回到主流程才能觸發翻譯。

## What Changes

- 追蹤每個儲存格的原始值（編輯前），讓使用者可以一鍵復原
- 在編輯對話框（Edit Modal）中新增「復原」按鈕，將儲存格值恢復為編輯前的原始內容
- 在編輯對話框中新增「AI 翻譯」按鈕，使用目前選擇的翻譯 provider 對該儲存格進行即時翻譯，翻譯結果填入 textarea 供使用者確認後儲存
- 復原按鈕僅在儲存格已被編輯過時啟用；AI 翻譯按鈕僅在非來源語言（非 en）的儲存格且 API key 已設定時啟用

## Capabilities

### New Capabilities
- `cell-revert`: 儲存格編輯復原功能 — 追蹤原始值、提供復原按鈕恢復至編輯前狀態
- `edit-modal-ai-translate`: 編輯對話框 AI 翻譯按鈕 — 在 modal 內即時呼叫翻譯 API 並填入結果

### Modified Capabilities
- `cell-interaction`: 需追蹤儲存格原始值，支援復原流程
- `edited-cell-highlight`: 復原後需移除已編輯標記

## Impact

- `index.html`：state 物件新增 `originalValues` map、Edit Modal HTML 新增兩個按鈕、JS 新增復原邏輯與 modal 內翻譯邏輯
- 現有翻譯函式需可被單一儲存格翻譯重用（可能需抽取共用翻譯呼叫函式）
