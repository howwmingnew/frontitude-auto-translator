English | [中文](README.zh-TW.md) | [한국어](README.ko.md)

# Frontitude One-Click Translator

A browser-based tool that batch-translates Frontitude `language.json` files using DeepL, OpenAI, or Gemini — no backend, no build step, fully client-side.

## Features

- **Multi-provider support** — choose between DeepL, OpenAI, and Gemini
- **Drag-and-drop upload** — drop your `language.json` and start translating
- **35+ languages** — from Arabic to Vietnamese
- **Batch translation** — translate all selected languages in one click
- **Real-time progress tracking** — progress bar with per-language status
- **100% client-side** — API calls go directly from your browser to the provider
- **API key persistence** — optionally save your key in `localStorage`

## Supported Providers

| Provider | Models | Key Format |
|----------|--------|------------|
| DeepL | — (single endpoint) | DeepL API key |
| OpenAI | `gpt-4o-mini`, `gpt-4o`, `gpt-4.1-mini`, `gpt-4.1-nano` | `sk-...` |
| Gemini | `gemini-2.0-flash`, `gemini-2.5-flash`, `gemini-2.5-pro` | Gemini API key |

## Quick Start

1. **Open** `index.html` in your browser
2. **Select a provider**, paste your API key, and optionally choose a model
3. **Upload** your `language.json` → select target languages → click **Translate** → **Download**

## JSON Format

The tool expects a Frontitude-style `language.json` with the source language (`en`) and one or more target language keys:

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

The translator fills in each empty target-language value using the corresponding `en` source text.

## Supported Languages

`ar` Arabic, `bg` Bulgarian, `cs` Czech, `da` Danish, `de` German, `el` Greek, `en` English, `es` Spanish, `et` Estonian, `fi` Finnish, `fr` French, `he` Hebrew, `hi` Hindi, `hu` Hungarian, `id` Indonesian, `it` Italian, `ja` Japanese, `ko` Korean, `lt` Lithuanian, `lv` Latvian, `nb` Norwegian Bokmål, `nl` Dutch, `pl` Polish, `pt` Portuguese, `pt-br` Brazilian Portuguese, `pt-pt` European Portuguese, `ro` Romanian, `ru` Russian, `sk` Slovak, `sl` Slovenian, `sv` Swedish, `th` Thai, `tr` Turkish, `uk` Ukrainian, `vi` Vietnamese, `zh` Chinese Simplified, `zh-tw` Chinese Traditional

## Privacy & Security

- All API calls are made **directly from your browser** to the selected provider
- There is **no backend server** — the entire app is a single HTML file
- Your API key is **never sent to any third-party server**
- Key storage uses `localStorage` and stays on your machine

## Tech Stack

- **Single-file** HTML / CSS / JavaScript
- **Zero dependencies** — no frameworks, no npm, no build step
- Works in any modern browser — just open `index.html`

## License

MIT
