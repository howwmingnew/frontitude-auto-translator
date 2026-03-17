## 背景

目前 editor 階段使用 `container--wide`（95vw）搭配 CSS Grid 雙欄佈局（≥1200px 時 `1fr 400px`）。問題是：
1. <1200px 時右側面板堆疊在下方，需大量下滾
2. 即使 ≥1200px，95vw 的表格加上 400px sidebar 可能超出視窗
3. 使用者期望在任何寬度下都能快速存取設定面板

現有結構：`#editor-grid` 包含 `.card#editor-section`（表格）和 `.editor-grid-sidebar`（設定面板）。

## 目標 / 非目標

**目標：**
- 右側設定面板改為 fixed/absolute drawer，隨時可展開收合
- 內容預覽表格佔滿容器寬度，最大化可視空間
- Drawer 展開時以 overlay 模式覆蓋，不推擠表格
- 提供明顯的 toggle 按鈕讓使用者隨時操控

**非目標：**
- 不改變翻譯邏輯或 API 整合
- 不改變上傳階段的佈局
- 不做拖曳調整寬度

## 設計決策

### 1. Drawer 使用 fixed positioning + transform 滑入

**決策**：Sidebar 改為 `position: fixed; right: 0; top: 0; height: 100vh; width: 400px`，收合時 `transform: translateX(100%)`，展開時 `transform: translateX(0)`。過渡使用 `transition: transform 300ms ease`。

**理由**：Fixed 定位讓 drawer 脫離文檔流，不影響表格佈局。Transform 動畫效能好（GPU 加速），不會造成 reflow。

**替代方案**：用 `right: -400px` 做位移 — 效能較差，且需要 `overflow: hidden` 在 body 上。

### 2. Toggle 按鈕固定在右側邊緣

**決策**：一個圓形按鈕 `position: fixed; right: 0; top: 50%; transform: translateY(-50%)`，drawer 收合時顯示齒輪/設定圖示，展開時顯示關閉圖示。Drawer 展開後按鈕位置跟著移到 drawer 左邊緣。

**理由**：固定在畫面右側中央最容易被發現，且不會被表格內容遮擋。

### 3. 移除 CSS Grid 雙欄，改為單欄 + drawer

**決策**：移除 `@media (min-width: 1200px)` 的 grid 佈局。Editor section 直接佔滿容器。Sidebar 的 HTML 從 grid 中抽出，改為獨立的 fixed drawer。

**理由**：統一所有螢幕寬度的行為，避免兩套佈局邏輯，降低複雜度。

### 4. Overlay 遮罩

**決策**：Drawer 展開時顯示一個半透明黑色 overlay（`rgba(0,0,0,0.3)`），點擊 overlay 可關閉 drawer。

**理由**：Overlay 提供視覺聚焦效果，也讓使用者直覺地點擊外部關閉 drawer。Mobile 上這是標準 UX 模式。

### 5. 狀態記憶

**決策**：Drawer 的開合狀態不做 persist — 每次進入 editor 階段預設收合。

**理由**：Drawer 是臨時操作（選完設定就收起來），不需要跨 session 記憶。且每次上傳新檔案可能需要重新設定，預設收合比較不會遮擋表格。

## 風險 / 權衡

- **Drawer 遮擋表格內容** → 使用者可能想同時看表格和設定。Mitigation：400px 寬度不會佔太多空間，且 overlay 點擊即可關閉。
- **Fixed 定位在 mobile 的行為** → 某些 mobile 瀏覽器對 fixed 有怪異行為（如 iOS Safari 鍵盤彈出時）。Mitigation：Drawer 不包含 input 需要 focus 的場景少（只有 API key），且已有 collapsible 行為作為 fallback。
- **Z-index 衝突** → 需確保 drawer 的 z-index 高於所有其他元素（header、toast 等）。Mitigation：使用 z-index: 1000，toast 用 z-index: 1100 保持在最上層。
