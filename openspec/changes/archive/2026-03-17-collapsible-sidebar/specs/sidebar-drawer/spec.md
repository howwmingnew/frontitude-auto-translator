## ADDED Requirements

### Requirement: Drawer 固定定位在右側
設定面板（Provider、Target Languages、Action、Download）SHALL 以 fixed positioning 呈現在畫面右側，寬度 400px，高度 100vh，可從右側滑入滑出。

#### Scenario: Drawer 預設收合
- **WHEN** 使用者上傳 JSON 進入 editor 階段
- **THEN** drawer SHALL 預設為收合狀態（隱藏在畫面右側外）

#### Scenario: Drawer 滑入動畫
- **WHEN** 使用者點擊 toggle 按鈕展開 drawer
- **THEN** drawer SHALL 從右側滑入，使用 `transform: translateX(0)` 搭配 300ms ease 過渡動畫

#### Scenario: Drawer 滑出動畫
- **WHEN** 使用者點擊 toggle 按鈕收合 drawer
- **THEN** drawer SHALL 滑出至右側外，使用 `transform: translateX(100%)` 搭配 300ms ease 過渡動畫

### Requirement: Toggle 按鈕常駐在右側
畫面上 SHALL 有一個固定在右側邊緣垂直置中的 toggle 按鈕，僅在 editor 階段可見。

#### Scenario: Toggle 按鈕在 editor 階段顯示
- **WHEN** 使用者進入 editor 階段
- **THEN** toggle 按鈕 SHALL 顯示在畫面右側邊緣，垂直置中

#### Scenario: Toggle 按鈕在上傳階段隱藏
- **WHEN** 使用者在上傳階段（未匯入檔案）
- **THEN** toggle 按鈕 SHALL 不可見

#### Scenario: Toggle 按鈕圖示隨狀態變化
- **WHEN** drawer 收合時
- **THEN** toggle 按鈕 SHALL 顯示設定圖示（齒輪或面板展開圖示）
- **WHEN** drawer 展開時
- **THEN** toggle 按鈕 SHALL 顯示關閉圖示（X 或箭頭向右）

### Requirement: Overlay 遮罩
Drawer 展開時 SHALL 在 drawer 後方顯示半透明遮罩層。

#### Scenario: 展開時顯示 overlay
- **WHEN** drawer 展開
- **THEN** 一個半透明黑色遮罩（opacity 0.3）SHALL 覆蓋在 drawer 後方的整個畫面

#### Scenario: 點擊 overlay 關閉 drawer
- **WHEN** 使用者點擊 overlay 遮罩
- **THEN** drawer SHALL 收合，overlay SHALL 消失

#### Scenario: 收合時隱藏 overlay
- **WHEN** drawer 收合
- **THEN** overlay SHALL 不可見且不可互動（pointer-events: none）

### Requirement: 內容預覽表格佔滿寬度
移除雙欄 CSS Grid 佈局後，Content Preview 表格 SHALL 佔滿整個容器寬度。

#### Scenario: 表格滿版顯示
- **WHEN** 使用者在 editor 階段
- **THEN** 內容預覽表格 SHALL 佔滿 95vw 容器的完整寬度，不再為 sidebar 保留空間

### Requirement: Dark mode 支援
Drawer、toggle 按鈕、overlay 的樣式 SHALL 支援 dark mode，使用現有的 CSS custom properties 系統。

#### Scenario: Dark mode drawer
- **WHEN** dark mode 啟用
- **THEN** drawer 背景、文字、邊框 SHALL 使用 dark mode 對應的 CSS custom properties

### Requirement: 鍵盤可及性
Drawer 的 toggle 按鈕 SHALL 可通過鍵盤操作。

#### Scenario: 鍵盤開啟 drawer
- **WHEN** toggle 按鈕獲得焦點且使用者按下 Enter 或 Space
- **THEN** drawer SHALL 展開

#### Scenario: Escape 關閉 drawer
- **WHEN** drawer 展開且使用者按下 Escape 鍵
- **THEN** drawer SHALL 收合
