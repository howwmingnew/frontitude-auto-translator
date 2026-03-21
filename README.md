English | [中文](README.zh-TW.md) | [한국어](README.ko.md)

# Frontitude Context-Aware Translator

> **[Try it online](https://howwmingnew.github.io/frontitude-auto-translator/)** — no install needed, runs entirely in your browser.

A browser-based tool that batch-translates Frontitude `language.json` files using OpenAI or Gemini — with optional Bitbucket integration for context-aware translation. No backend, no build step, fully client-side.

## Features

### Core Translation
- **Multi-provider support** — choose between OpenAI and Gemini
- **Drag-and-drop upload** — drop your `language.json` and start translating
- **Content preview** — full-width Excel-like table to inspect keys and translations
- **Context prompt** — provide domain context (e.g. "dental implant software") for more accurate translations
- **Re-select JSON** — switch to a different file without reloading the page
- **35+ languages** — from Arabic to Vietnamese
- **Batch translation** — translate all selected languages in one click
- **Smart differential translation** — only translates missing texts, preserving existing translations
- **AI translation highlight** — blue background marks AI-translated cells in the preview table
- **Revert support** — revert any cell back to its original imported value
- **Real-time progress tracking** — progress bar with per-batch updates and translated text count
- **100% client-side** — API calls go directly from your browser to the provider
- **API key persistence** — optionally save your key in `localStorage`

### Context-Aware Translation (Bitbucket Integration)
- **Quick / Precise mode toggle** — choose between fast translation or context-enhanced translation
- **Bitbucket code search** — scans your WPF repo (.xaml / .cs files) to find where each translation key is used
- **AI context generation** — converts code snippets into human-readable descriptions (e.g. "Button label on the login screen")
- **Context-aware prompts** — injects per-key context into translation prompts for more accurate, UI-appropriate translations
- **Expandable context panel** — click any key to see code snippets, AI description, and edit translations inline
- **Context in edit modal** — context description shown when editing individual cells
- **Three-phase progress stepper** — shows distinct Search → Generate → Translate phases during Precise mode
- **Per-key error handling** — failed keys don't block the batch; retry button for failed translations
- **Multi-language context** — AI descriptions follow app UI language (EN / 繁體中文 / 한국어)
- **Auto-connect on load** — saved Bitbucket credentials are tested automatically on page load

## Supported Providers

| Provider | Models | Key Format |
|----------|--------|------------|
| OpenAI | `gpt-5.4-mini`, `gpt-5.4`, `gpt-5.4-nano`, `gpt-5-mini` | `sk-...` |
| Gemini | `gemini-3-flash`, `gemini-3.1-flash-lite`, `gemini-2.5-flash`, `gemini-3.1-pro-preview` | Gemini API key |

## Quick Start

### Basic Translation

1. **Open** the app in your browser
2. **Upload** your `language.json`
3. **Select a provider**, paste your API key, and optionally choose a model
4. *(Optional)* Add a **context prompt** to guide translations
5. Select target languages → click **Translate** → **Download**

### Context-Aware Translation (Precise Mode)

1. **Deploy the CORS proxy** — see [Proxy Setup](#proxy-setup)
2. **Connect Bitbucket** — enter your workspace, repo, branch, and access token in the sidebar
3. **Switch to Precise mode** — click the Precise button above Translate
4. **Translate** — the app will search code context, generate descriptions, then translate with context
5. **Review context** — click any key to expand the context panel with code snippets and AI descriptions

## Proxy Setup

Bitbucket Cloud requires a CORS proxy for browser-to-API calls. A Cloudflare Worker proxy is included:

```bash
cd proxy
npm install
npx wrangler login
npx wrangler deploy
npx wrangler secret put ALLOWED_ORIGIN
# Enter your app URL (e.g. http://localhost:8080 or your GitHub Pages URL)
```

Then enter the deployed Worker URL in the app's Bitbucket Connection settings.

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
- Bitbucket API calls go through **your own CORS proxy** (Cloudflare Worker)
- There is **no shared backend server** — the app is a static site
- Your API keys and Bitbucket tokens are stored in `localStorage` and **never sent to any third-party server**

## Tech Stack

- **Multi-file architecture** — HTML skeleton + CSS + 9 JavaScript IIFE modules
- **Zero external JS dependencies** — only Google Fonts (Inter) via CDN
- **Cloudflare Worker** — CORS proxy for Bitbucket API (optional, for Precise mode)
- Works in any modern browser — serve via HTTP server for full functionality

## Development

```bash
# Serve locally
python -m http.server 8080
# or
npx serve .
```

Then open http://localhost:8080 in a browser.

## License

MIT
