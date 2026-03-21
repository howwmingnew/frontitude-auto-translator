[English](README.md) | 中文 | [한국어](README.ko.md)

# Frontitude 情境感知翻譯器

> **[線上試用](https://howwmingnew.github.io/frontitude-auto-translator/)** — 免安裝，完全在瀏覽器中運行。

一款基於瀏覽器的工具，使用 OpenAI 或 Gemini 批次翻譯 Frontitude `language.json` 檔案——可選擇整合 Bitbucket 進行情境感知翻譯。無需後端伺服器、無需建置步驟、完全在客戶端運行。

## 功能特色

### 核心翻譯
- **多供應商支援** — 可選擇 OpenAI 和 Gemini
- **拖放上傳** — 拖放你的 `language.json` 即可開始翻譯
- **內容預覽** — 全寬 Excel 風格表格，檢視鍵名和翻譯內容
- **情境提示** — 提供領域上下文（例如「齒科植牙軟體」）以獲得更準確的翻譯
- **重新選擇 JSON** — 無需重新載入頁面即可切換不同檔案
- **35+ 種語言** — 從阿拉伯語到越南語
- **批次翻譯** — 一鍵翻譯所有已選語言
- **智慧差異翻譯** — 僅翻譯缺失的文本，保留現有翻譯
- **AI 翻譯標記** — 藍色背景標示預覽表格中被 AI 翻譯的儲存格
- **復原支援** — 可將任何儲存格復原回匯入時的原始值
- **即時進度追蹤** — 逐批次更新的進度條，顯示已翻譯文本數
- **100% 客戶端** — API 呼叫直接從瀏覽器發送到供應商
- **API 金鑰持久化** — 可選擇將金鑰儲存在 `localStorage`

### 情境感知翻譯（Bitbucket 整合）
- **Quick / Precise 模式切換** — 選擇快速翻譯或情境增強翻譯
- **Bitbucket 程式碼搜尋** — 掃描 WPF 程式碼庫（.xaml / .cs 檔案）找到每個翻譯 key 的使用位置
- **AI 情境生成** — 將程式碼片段轉換為人類可讀的描述（例如「登入畫面的按鈕標籤」）
- **情境感知 prompt** — 將每個 key 的情境注入翻譯 prompt，產生更準確、更貼合 UI 的翻譯
- **可展開情境面板** — 點擊任一 key 查看程式碼片段、AI 說明，並可行內編輯翻譯
- **編輯 modal 情境顯示** — 編輯個別儲存格時顯示情境說明
- **三階段進度 stepper** — Precise 模式下顯示搜尋 → 生成 → 翻譯三個階段
- **個別 key 錯誤處理** — 失敗的 key 不會阻斷整批翻譯，提供重試按鈕
- **多語言情境** — AI 說明跟隨 app 介面語言（EN / 繁體中文 / 한국어）
- **自動連線** — 已儲存的 Bitbucket 憑證在頁面載入時自動測試

## 支援的供應商

| 供應商 | 模型 | 金鑰格式 |
|--------|------|----------|
| OpenAI | `gpt-5.4-mini`、`gpt-5.4`、`gpt-5.4-nano`、`gpt-5-mini` | `sk-...` |
| Gemini | `gemini-3-flash`、`gemini-3.1-flash-lite`、`gemini-2.5-flash`、`gemini-3.1-pro-preview` | Gemini API 金鑰 |

## 快速開始

### 基本翻譯

1. 在瀏覽器中**開啟**應用程式
2. **上傳**你的 `language.json`
3. **選擇供應商**，貼上你的 API 金鑰，並可選擇模型
4. *（可選）* 加入**情境提示**以引導翻譯
5. 選擇目標語言 → 點擊**翻譯** → **下載**

### 情境感知翻譯（Precise 模式）

1. **部署 CORS proxy** — 參見 [Proxy 設定](#proxy-設定)
2. **連接 Bitbucket** — 在側邊欄輸入 workspace、repo、branch 和 access token
3. **切換到 Precise 模式** — 點擊 Translate 按鈕上方的 Precise 按鈕
4. **翻譯** — 應用程式會搜尋程式碼情境、生成描述，然後帶情境翻譯
5. **檢視情境** — 點擊任一 key 展開情境面板

## Proxy 設定

Bitbucket Cloud 需要 CORS proxy 才能從瀏覽器呼叫 API。內附 Cloudflare Worker proxy：

```bash
cd proxy
npm install
npx wrangler login
npx wrangler deploy
npx wrangler secret put ALLOWED_ORIGIN
# 輸入你的 app URL（例如 http://localhost:8080 或 GitHub Pages URL）
```

部署完成後，在 app 的 Bitbucket Connection 設定中輸入 Worker URL。

## JSON 格式

此工具接受 Frontitude 格式的 `language.json`，包含來源語言（`en`）及一個或多個目標語言鍵：

```json
{
  "en": {
    "greeting": "Hello",
    "farewell": "Goodbye"
  },
  "fr": {
    "greeting": "",
    "farewell": ""
  },
  "ja": {
    "greeting": "",
    "farewell": ""
  }
}
```

翻譯器會使用對應的 `en` 來源文字填入每個空白的目標語言值。

## 支援的語言

`ar` 阿拉伯語、`bg` 保加利亞語、`cs` 捷克語、`da` 丹麥語、`de` 德語、`el` 希臘語、`en` 英語、`es` 西班牙語、`et` 愛沙尼亞語、`fi` 芬蘭語、`fr` 法語、`he` 希伯來語、`hi` 印地語、`hu` 匈牙利語、`id` 印尼語、`it` 義大利語、`ja` 日語、`ko` 韓語、`lt` 立陶宛語、`lv` 拉脫維亞語、`nb` 挪威語（書面）、`nl` 荷蘭語、`pl` 波蘭語、`pt` 葡萄牙語、`pt-br` 巴西葡萄牙語、`pt-pt` 歐洲葡萄牙語、`ro` 羅馬尼亞語、`ru` 俄語、`sk` 斯洛伐克語、`sl` 斯洛維尼亞語、`sv` 瑞典語、`th` 泰語、`tr` 土耳其語、`uk` 烏克蘭語、`vi` 越南語、`zh` 簡體中文、`zh-tw` 繁體中文

## 隱私與安全

- 所有 API 呼叫均**直接從你的瀏覽器**發送到所選供應商
- Bitbucket API 呼叫通過**你自己的 CORS proxy**（Cloudflare Worker）
- **沒有共享後端伺服器** — 整個應用程式是靜態網站
- 你的 API 金鑰和 Bitbucket token 儲存在 `localStorage`，**不會被發送到任何第三方伺服器**

## 技術架構

- **多檔案架構** — HTML 骨架 + CSS + 9 個 JavaScript IIFE 模組
- **零外部 JS 依賴** — 僅使用 Google Fonts (Inter) CDN
- **Cloudflare Worker** — Bitbucket API 的 CORS proxy（選用，僅 Precise 模式需要）
- 可在任何現代瀏覽器中運行 — 需透過 HTTP 伺服器提供服務以獲得完整功能

## 開發

```bash
# 本機啟動
python -m http.server 8080
# 或
npx serve .
```

然後在瀏覽器中開啟 http://localhost:8080。

## 授權條款

MIT
