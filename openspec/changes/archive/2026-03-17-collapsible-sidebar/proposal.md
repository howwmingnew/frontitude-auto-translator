## 為什麼

匯入 JSON 後進入 editor 階段，容器擴展至 95vw 滿版。目前的雙欄佈局（CSS Grid）僅在 ≥1200px 才啟用，在較窄的螢幕（或使用者習慣把瀏覽器視窗縮小時），右側設定面板（Provider、Target Languages、Translate、Download）會堆疊在內容預覽表格下方，使用者需要大量往下滾動才能操作翻譯設定。即便在寬螢幕，如果右側 sidebar 超出可視範圍，也需要水平滾動。

使用者的期望是：右側設定面板應該以**可開合的側邊欄（drawer）**形式固定在右側，隨時可以展開/收合，不需要滾動就能操作。

## 變更內容

- 將右側設定面板改為**固定定位的側邊欄 drawer**，從右側滑入/滑出
- 新增一個**常駐的 toggle 按鈕**固定在畫面右側，點擊可展開/收合 sidebar
- Sidebar 展開時覆蓋在內容預覽之上（overlay 模式），不影響表格佈局
- 移除原本的 `@media (min-width: 1200px)` CSS Grid 雙欄佈局，統一使用 drawer 模式
- 內容預覽表格佔滿整個容器寬度，不再需要為 sidebar 保留空間
- Sidebar 狀態（開/合）記憶在 `sessionStorage`

## Capabilities

### New Capabilities
- `sidebar-drawer`: 可開合的固定側邊欄，包含所有翻譯設定（Provider、Languages、Action、Download），支援滑入/滑出動畫和 overlay 背景遮罩

### Modified Capabilities

## 影響範圍

- **程式碼**：`index.html` — 移除 CSS Grid 雙欄佈局，新增 drawer CSS 和 JS toggle 邏輯
- **移除**：`.editor-grid` 和 `.editor-grid-sidebar` 的 Grid 佈局相關 CSS
- **新增**：drawer 固定定位 CSS、toggle 按鈕、overlay 遮罩、開合動畫
- **無新依賴**：維持純 CSS + vanilla JS
