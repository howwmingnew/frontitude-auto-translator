# Feature Landscape

**Domain:** Context-aware translation/localization tools with source code integration
**Researched:** 2026-03-20

## Table Stakes

Features users expect from any tool that claims "code-context-aware translation." Missing any of these makes the feature feel incomplete or gimmicky.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Key-to-code search | Every context tool (Crowdin Context Harvester, Lokalise) maps keys to where they appear in source code. Without this, there is no "context." | Medium | Crowdin uses grep/glob agentic AI; this project scans Bitbucket API for LocExtension usage in .xaml/.cs files |
| Code snippet display | Translators need to see the surrounding code to understand UI placement. Crowdin shows "usage examples"; Lokalise shows screenshots. At minimum, show the file + nearby lines. | Low | Extract ~5-10 lines around the key usage. Show filename + line reference. |
| Human-readable context description | Raw code is useless to non-engineer translators. Crowdin's harvester generates descriptions like "Button label on the login screen." AI-generated plain-language explanation is table stakes. | Medium | Use the same LLM provider (OpenAI/Gemini) already configured for translation. Description language should follow app UI language (EN/zh-TW/ko). |
| Context-enhanced translation prompts | The whole point: feed discovered context into the translation prompt so AI produces more accurate translations. Without this, context display is informational only. | Medium | Inject context into the system prompt alongside the existing user-supplied context prompt. |
| Selective context lookup (untranslated keys only) | Crowdin's harvester processes keys selectively via CroQL filters. Querying context for already-translated keys wastes API quota. | Low | Filter to keys without translations in target language before hitting Bitbucket API. |
| Loading/progress indicators | Context lookup is slow (multiple API calls per key). Without progress feedback, users think the app froze. Every TMS shows progress for batch operations. | Low | Show per-key or batch progress. Distinguish "searching code" vs "generating description" vs "translating" phases. |
| Error handling for API failures | Bitbucket API rate limits, network failures, missing repos. Must degrade gracefully. | Low | Show per-key error states. Allow retry. Never block the entire batch for one key failure. |

## Differentiators

Features that go beyond what competitors offer, or are uniquely valuable for this project's niche (WPF/LocExtension, Frontitude workflow, static web app).

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Dual translation modes (Quick vs Precise) | No competitor offers this toggle. Crowdin always harvests context as a separate step. Letting users choose "fast without context" vs "slower with context" per-session is a better UX for mixed workflows. | Medium | Quick mode = existing behavior (no Bitbucket calls). Precise mode = context lookup + enhanced prompts. Clear UI distinction. |
| Inline context panel with editable translations | Crowdin's editor is a separate full-page tool. Showing context in an expandable panel within the preview table, with inline editing, keeps the workflow in one place. | High | Click key row to expand. Show: code snippets, AI description, editable translation fields. Edited translations feed back into prompts for consistency. |
| WPF/LocExtension-aware code parsing | Generic tools use grep. Understanding LocExtension markup extension patterns (`{loc:Loc Key=...}`) means more precise matches and fewer false positives. | Medium | Pattern-match for LocExtension syntax in .xaml files and resource key references in .cs files. Not just string search. |
| Translation edit feedback loop | When a translator manually edits a translation in the context panel, feeding that correction back into subsequent translation prompts improves consistency across the batch. | Medium | Collect edited translations as "reference translations" in the prompt for remaining keys. Similar to translation memory but lightweight. |
| Multi-file context aggregation | A single key may appear in multiple .xaml files (reused across screens). Showing all usage locations gives translators the full picture. | Low | Bitbucket code search API may return multiple hits. Display all, not just the first match. |
| Context confidence scoring | Flag keys where context was found vs. keys where no code reference was discovered. Helps translators prioritize review effort. | Low | Simple binary: "context found" vs "no context found." Could extend to "found in N files" count. |

## Anti-Features

Features to explicitly NOT build. Either out of scope, premature, or counterproductive.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Full TMS/translation memory system | This is a single-purpose translator, not a platform. Building TM, glossaries, review workflows turns it into a Crowdin competitor. | Keep the edit feedback loop lightweight (in-session only, not persisted). |
| Screenshot/visual context capture | Crowdin/Lokalise use browser extensions, Figma plugins, or mobile SDK to capture screenshots. Massive scope for a static web app. | Rely on code context + AI descriptions instead. The WPF app is desktop, making screenshot capture impractical from a web tool. |
| Offline context caching | PROJECT.md explicitly marks this out of scope for v1. Adds IndexedDB complexity. | Re-query Bitbucket each session. Consider caching in a future milestone if API rate limits become a problem. |
| Real-time Bitbucket sync / webhooks | Over-engineering. Users translate in discrete sessions, not continuously. | Fetch context on-demand when "Precise" mode is triggered. |
| Bitbucket Server/Data Center support | PROJECT.md explicitly excludes this. Different API surface. | Only support Bitbucket Cloud REST API v2.0. |
| MFC code scanning | PROJECT.md excludes this. Different code patterns, different localization approach. | Only scan WPF files (.xaml, .cs) for LocExtension patterns. |
| DeepL context integration | DeepL's translation API does not accept contextual prompts (it is not an LLM). Adding context to DeepL calls is impossible. | When "Precise" mode is selected, only offer OpenAI/Gemini as providers. Show a clear message if DeepL is selected with Precise mode. |
| Per-key provider selection | Letting users choose different AI providers per key adds massive UX complexity for minimal benefit. | One provider per translation session, applied to all keys. |
| Automated CI/CD context harvesting | Crowdin's harvester runs in CI pipelines. This project is a static web app used manually. | Context lookup happens in-browser at translation time. |

## Feature Dependencies

```
Bitbucket Auth (Access Token)
  --> Code Search API calls
    --> Key-to-code matching (LocExtension pattern)
      --> Code snippet extraction (filename + surrounding lines)
        --> AI context description generation
          --> Context-enhanced translation prompts

Dual mode toggle (Quick/Precise)
  --> Precise mode triggers the Bitbucket pipeline above
  --> Quick mode uses existing translation flow unchanged

Context panel UI
  --> Depends on: code snippets + AI descriptions being available
  --> Enables: inline translation editing
    --> Enables: edit feedback into subsequent prompts
```

## MVP Recommendation

**Prioritize (Phase 1 - Core Context Pipeline):**
1. Bitbucket Cloud authentication (Access Token in localStorage)
2. Code search API integration (find key in .xaml/.cs files)
3. LocExtension-aware pattern matching
4. Code snippet extraction (filename + context lines)
5. AI-generated human-readable descriptions
6. Context injected into translation prompts
7. Selective lookup (untranslated keys only)
8. Loading states and error handling

**Prioritize (Phase 2 - Context UX):**
1. Dual mode toggle (Quick vs Precise)
2. Expandable context panel per key
3. Inline translation editing in context panel
4. Multi-file context aggregation display
5. Context confidence indicators

**Defer:**
- Translation edit feedback loop: Valuable but adds prompt engineering complexity. Ship basic context first, iterate.
- Offline caching: Explicitly out of scope per PROJECT.md.

## Sources

- [Crowdin Context Harvester CLI (GitHub)](https://github.com/crowdin/context-harvester)
- [Crowdin Context Harvesting Features](https://crowdin.com/features/context-harvesting)
- [Crowdin AI Context Harvester CLI (Store)](https://store.crowdin.com/crowdin-context-harvester-cli)
- [Lokalise Bitbucket Integration](https://lokalise.com/product/apps/code-repositories/bitbucket/)
- [Lokalise In-Context Editor Tools](https://lokalise.com/blog/in-context-editor-tools/)
- [Localazy Context Screenshots](https://localazy.com/features/context-screenshots-ocr)
- [Tolgee Context in Localization](https://tolgee.io/blog/context-gamechanger-localization)
- [Crowdin Translation Accuracy and Context](https://crowdin.com/blog/translation-accuracy)
- [Locize Blog: Localization Context Best Practices](https://www.locize.com/blog/localization-context/)
- [SimpleLocalize: Context in Localization](https://simplelocalize.io/blog/posts/context-in-localization/)
- [WPF Globalization and Localization (Microsoft Learn)](https://learn.microsoft.com/en-us/dotnet/desktop/wpf/advanced/wpf-globalization-and-localization-overview)
