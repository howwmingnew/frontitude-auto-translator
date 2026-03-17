## 1. 移除舊的雙欄 Grid 佈局

- [x] 1.1 移除 `.editor-grid` 和 `.editor-grid-sidebar` 的 CSS Grid 相關樣式（包含 `@media (min-width: 1200px)` 區塊）
- [x] 1.2 修改 HTML：將 sidebar 內容（provider、language、action、download cards）從 `.editor-grid-sidebar` 抽出，放入新的 drawer 容器
- [x] 1.3 讓 `#editor-section`（Content Preview）直接放在 container 內，佔滿完整寬度

## 2. Drawer 容器與 CSS

- [x] 2.1 新增 drawer HTML：`<div id="sidebar-drawer">` 包含 overlay 遮罩和 drawer 面板
- [x] 2.2 新增 drawer CSS：fixed 定位、right: 0、width: 400px、height: 100vh、transform 滑入滑出
- [x] 2.3 新增 overlay CSS：fixed 全螢幕、半透明黑色背景、pointer-events 控制
- [x] 2.4 新增 drawer 的 dark mode CSS 覆寫
- [x] 2.5 Drawer 面板內部可捲動（overflow-y: auto）以處理內容超出螢幕高度

## 3. Toggle 按鈕

- [x] 3.1 新增 toggle 按鈕 HTML：fixed 定位在右側邊緣垂直置中，含設定/關閉圖示
- [x] 3.2 新增 toggle 按鈕 CSS：圓形按鈕、z-index 高於 drawer、dark mode 支援
- [x] 3.3 Toggle 按鈕僅在 editor 階段顯示（reselect 時隱藏）

## 4. JS 開合邏輯

- [x] 4.1 實作 `openDrawer()` / `closeDrawer()` 函式：切換 class、更新圖示、控制 overlay
- [x] 4.2 Toggle 按鈕 click 事件：切換開合
- [x] 4.3 Overlay click 事件：關閉 drawer
- [x] 4.4 Escape 鍵事件：drawer 展開時按 Escape 關閉
- [x] 4.5 進入 editor 階段時預設 drawer 收合
- [x] 4.6 Reselect JSON 時關閉 drawer 並隱藏 toggle 按鈕

## 5. i18n 與無障礙

- [x] 5.1 新增 toggle 按鈕的 aria-label 和 i18n 字串（EN/ZH-TW/KO）
- [x] 5.2 Drawer 加上 `role="dialog"` 和 `aria-label`
- [x] 5.3 確保 toggle 按鈕可鍵盤操作（Enter/Space）

## 6. 清理與驗證

- [x] 6.1 移除不再使用的 `.editor-grid` / `.editor-grid-sidebar` HTML 結構
- [x] 6.2 確認 light/dark mode 下 drawer 樣式正確
- [x] 6.3 確認 mobile 裝置上 drawer 行為正常（寬度在小螢幕調整為 100vw 或 85vw）
