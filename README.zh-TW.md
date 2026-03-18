[English](README.md) | 中文 | [한국어](README.ko.md)

# Frontitude 一鍵翻譯器

> **[線上試用](https://howwmingnew.github.io/frontitude-auto-translator/)** — 免安裝，完全在瀏覽器中運行。

一款基於瀏覽器的工具，使用 DeepL、OpenAI 或 Gemini 批次翻譯 Frontitude `language.json` 檔案——無需後端伺服器、無需建置步驟、完全在客戶端運行。

## 功能特色

- **多供應商支援** — 可選擇 DeepL、OpenAI 和 Gemini
- **拖放上傳** — 拖放你的 `language.json` 即可開始翻譯
- **內容預覽** — 全寬 Excel 風格表格，檢視鍵名和翻譯內容
- **情境提示** — 提供領域上下文（例如「齒科植牙軟體」）以獲得更準確的 OpenAI/Gemini 翻譯
- **重新選擇 JSON** — 無需重新載入頁面即可切換不同檔案
- **35+ 種語言** — 從阿拉伯語到越南語
- **批次翻譯** — 一鍵翻譯所有已選語言
- **智慧差異翻譯** — 僅翻譯缺失的文本，保留現有翻譯
- **AI 翻譯標記** — 藍色背景標示預覽表格中被 AI 翻譯的儲存格
- **復原支援** — 可將任何儲存格復原回匯入時的原始值
- **即時進度追蹤** — 逐批次更新的進度條，顯示已翻譯文本數
- **100% 客戶端** — API 呼叫直接從瀏覽器發送到供應商
- **API 金鑰持久化** — 可選擇將金鑰儲存在 `localStorage`

## 支援的供應商

| 供應商 | 模型 | 金鑰格式 |
|--------|------|----------|
| DeepL | —（單一端點） | DeepL API 金鑰 |
| OpenAI | `gpt-5.4-mini`、`gpt-5.4`、`gpt-5.3-instant`、`gpt-5-mini` | `sk-...` |
| Gemini | `gemini-3-flash`、`gemini-3.1-flash-lite`、`gemini-2.5-flash`、`gemini-3.1-pro-preview` | Gemini API 金鑰 |

## 快速開始

1. 在瀏覽器中**開啟** `index.html`
2. **上傳**你的 `language.json`
3. **選擇供應商**，貼上你的 API 金鑰，並可選擇模型
4. *（可選）* 加入**情境提示**以引導翻譯（僅限 OpenAI/Gemini）
5. 選擇目標語言 → 點擊**翻譯** → **下載**

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
- **沒有後端伺服器** — 整個應用程式是單一 HTML 檔案
- 你的 API 金鑰**不會被發送到任何第三方伺服器**
- 金鑰儲存使用 `localStorage`，僅保留在你的裝置上

## 技術架構

- **單一檔案** HTML / CSS / JavaScript
- **零依賴** — 無框架、無 npm、無建置步驟
- 可在任何現代瀏覽器中運行 — 只需開啟 `index.html`

## 變更紀錄

參見 [openspec/changes/archive/](openspec/changes/archive/) 查看過往的設計文件、規格與任務清單。

## 授權條款

MIT
