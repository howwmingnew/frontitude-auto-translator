## ADDED Requirements

### Requirement: OpenAI/Gemini 翻譯 prompt SHALL 包含佔位符保留規則
system prompt SHALL 明確要求 LLM 原樣保留所有佔位符格式，包括但不限於 `{0}`、`{1}`、`{{name}}`、`%s`、`%d`、`${variable}` 等。

#### Scenario: 原文包含佔位符
- **WHEN** 翻譯的原文中包含 `{0}` 或 `{{name}}` 等佔位符
- **THEN** LLM 回傳的翻譯結果 SHALL 保留完全相同的佔位符格式與內容
- **AND** prompt 中 SHALL 明確列舉常見佔位符格式作為範例

#### Scenario: DeepL 不受影響
- **WHEN** 使用 DeepL 作為翻譯 provider
- **THEN** SHALL 不加入任何額外 prompt 規則（DeepL 為直接翻譯 API）

### Requirement: OpenAI/Gemini 翻譯 prompt SHALL 指定用詞風格
system prompt SHALL 要求 LLM 使用正式、禮貌的語體（formal-polite register），避免使用俚語或過於口語化的表達。

#### Scenario: 翻譯結果用詞風格
- **WHEN** 使用 OpenAI 或 Gemini 翻譯任何語言
- **THEN** prompt 中 SHALL 包含用詞風格指引，要求使用自然且正式禮貌的語體

### Requirement: OpenAI/Gemini 翻譯 prompt SHALL 禁止新增原文沒有的內容
system prompt SHALL 明確禁止 LLM 在翻譯結果中加入原文沒有的標點符號、詞語或其他內容。

#### Scenario: 原文末尾無標點
- **WHEN** 原文 `Save` 末尾沒有標點符號
- **THEN** 翻譯結果 SHALL 不在末尾加入句號或其他標點

#### Scenario: 原文有標點
- **WHEN** 原文 `Are you sure?` 末尾有問號
- **THEN** 翻譯結果 SHALL 保留對應的標點（如中文問號 `？`）
