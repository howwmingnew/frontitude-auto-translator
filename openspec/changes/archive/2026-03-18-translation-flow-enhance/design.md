## Context

目前 OpenAI/Gemini 的翻譯 prompt 只有簡單的 `You are a professional translator... Translate the following JSON array...`，沒有處理佔位符保留、用詞風格、禁止新增內容等規則。模型清單停留在 GPT-4.x 和 Gemini 2.x，這些模型已退役或即將退役。使用者沒有便捷方式取得 API key，也沒有翻譯前確認機制。

## Goals / Non-Goals

**Goals:**
- 提升 LLM 翻譯品質，減少佔位符被破壞和不必要內容被新增的機率
- 模型清單反映 2026 年 3 月最新可用的 API 模型
- 降低新使用者取得 API key 的門檻
- 翻譯前給使用者確認機會，避免誤觸浪費額度

**Non-Goals:**
- 不做 prompt 的 A/B 測試或品質評分系統
- 不做模型自動偵測或動態從 API 拉取模型列表
- 不做 API key 的自動申請流程

## Decisions

### 1. Prompt 強化策略

在現有 system prompt 後追加三段規則，用換行分隔：

```
RULES:
1. Preserve all placeholders exactly as-is: {0}, {1}, {{name}}, %s, %d, ${variable}, etc.
2. Use natural, formal-polite register for the target language. Do not use slang.
3. Do not add punctuation, words, or content that is not present in the source text.
```

這段規則對 DeepL 不適用（DeepL 是直接翻譯 API，不接受 prompt）。

**替代方案**：將每條規則做成使用者可勾選的選項 → 拒絕，過度複雜且大部分使用者需要全部規則。

### 2. 模型清單更新

**OpenAI**（chat completions API）：
- `gpt-5.4-mini` — 快速、低成本
- `gpt-5.4` — 高品質推理
- `gpt-5.3-instant` — 極速回應
- `gpt-5-mini` — 經濟實惠

**Gemini**（generateContent API）：
- `gemini-3-flash` — 快速、高性價比
- `gemini-3.1-flash-lite` — 極速、最低成本
- `gemini-2.5-flash` — 穩定、平衡
- `gemini-3.1-pro-preview` — 最高品質

顯示格式：在 `<select>` 的 `<option>` 中用 `modelName — 註解` 格式，如 `gpt-5.4-mini — Fast, low cost`。註解需 i18n 化。

### 3. 取得 API Key 按鈕

在 `api-key-actions` 行（Test Key 按鈕旁邊）加入一個 `<a>` 按鈕，樣式與 Test Key 按鈕相同。點擊以 `target="_blank"` 開新分頁。URL 依 provider 動態切換：

- DeepL: `https://www.deepl.com/pro#developer`
- OpenAI: `https://platform.openai.com/api-keys`
- Gemini: `https://aistudio.google.com/apikey`

### 4. 翻譯確認對話框

使用自訂 modal（非 `window.confirm`），與現有 cell-edit-overlay 相同風格。內容：

- 標題：「確認翻譯」
- 摘要表格：每行一個語言，顯示語言名稱 + 待翻譯文本數
- 底部：Cancel / Translate 按鈕
- 翻譯數量計算：遍歷 `en` 中有值的 key，檢查該語言是否缺少對應值（空或 undefined），加總為待翻譯數。若使用者勾選的是已完成語言（smart-target-selection），則顯示全部 key 數並標註「全部重新翻譯」

## Risks / Trade-offs

- **[風險] Prompt 規則可能影響某些語言的翻譯自然度**（如禁止新增標點可能讓日文缺少句讀）→ 緩解：使用 "Do not add punctuation... not present in the source" 而非絕對禁止所有標點
- **[風險] 模型清單會過時** → 緩解：使用穩定的 model ID（非 preview 版本為主），未來可考慮動態拉取
- **[取捨] 確認對話框增加一步操作** → 可接受，防止誤觸的價值遠大於多一次點擊的成本
