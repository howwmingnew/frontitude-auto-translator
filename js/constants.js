(function () {
  'use strict';
  var App = window.App;

  var MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

  var FETCH_TIMEOUT_MS = 90000;

  // ── Provider config ──
  var PROVIDER_CONFIG = {
    deepl: {
      label: 'DeepL',
      placeholder: 'Paste your DeepL API key here',
      disclaimer: 'Your API key is sent directly from your browser to DeepL and is visible in the browser Network tab. It is never sent to any other server.',
      models: [],
      keyUrl: 'https://www.deepl.com/pro#developer',
    },
    openai: {
      label: 'OpenAI',
      placeholder: 'Paste your OpenAI API key here (sk-...)',
      disclaimer: 'Your API key is sent directly from your browser to OpenAI and is visible in the browser Network tab. It is never sent to any other server.',
      models: [
        { id: 'gpt-5.4-mini', annotationKey: 'modelFastLowCost' },
        { id: 'gpt-5.4', annotationKey: 'modelHighQuality' },
        { id: 'gpt-5.4-nano', annotationKey: 'modelUltraFast' },
        { id: 'gpt-5-mini', annotationKey: 'modelEconomical' },
      ],
      keyUrl: 'https://platform.openai.com/api-keys',
    },
    gemini: {
      label: 'Gemini',
      placeholder: 'Paste your Gemini API key here',
      disclaimer: 'Your API key is sent directly from your browser to Google and is visible in the browser Network tab (as a URL parameter). It is never sent to any other server.',
      models: [
        { id: 'gemini-3-flash', annotationKey: 'modelFastLowCost' },
        { id: 'gemini-3.1-flash-lite', annotationKey: 'modelUltraFast' },
        { id: 'gemini-2.5-flash', annotationKey: 'modelBalanced' },
        { id: 'gemini-3.1-pro-preview', annotationKey: 'modelHighQuality' },
      ],
      keyUrl: 'https://aistudio.google.com/apikey',
    },
  };

  var LANG_CODE_TO_NAME = {
    en: {
      'ar': 'Arabic', 'bg': 'Bulgarian', 'cs': 'Czech', 'da': 'Danish',
      'de': 'German', 'el': 'Greek', 'en': 'English', 'es': 'Spanish',
      'et': 'Estonian', 'fi': 'Finnish', 'fr': 'French', 'he': 'Hebrew',
      'hi': 'Hindi', 'hu': 'Hungarian', 'id': 'Indonesian', 'it': 'Italian',
      'ja': 'Japanese', 'ko': 'Korean', 'lt': 'Lithuanian', 'lv': 'Latvian',
      'nb': 'Norwegian Bokm\u00e5l', 'nl': 'Dutch', 'pl': 'Polish',
      'pt': 'Portuguese', 'pt-br': 'Brazilian Portuguese', 'pt-pt': 'European Portuguese',
      'ro': 'Romanian', 'ru': 'Russian', 'sk': 'Slovak', 'sl': 'Slovenian',
      'sv': 'Swedish', 'th': 'Thai', 'tr': 'Turkish', 'uk': 'Ukrainian',
      'vi': 'Vietnamese',
      'zh': 'Chinese Simplified', 'zh-cn': 'Chinese Simplified',
      'zh-hans': 'Chinese Simplified', 'zh-tw': 'Chinese Traditional',
      'zh-hant': 'Chinese Traditional',
    },
    'zh-TW': {
      'ar': '\u963f\u62c9\u4f2f\u6587', 'bg': '\u4fdd\u52a0\u5229\u4e9e\u6587', 'cs': '\u6377\u514b\u6587', 'da': '\u4e39\u9ea5\u6587',
      'de': '\u5fb7\u6587', 'el': '\u5e0c\u81d8\u6587', 'en': '\u82f1\u6587', 'es': '\u897f\u73ed\u7259\u6587',
      'et': '\u611b\u6c99\u5c3c\u4e9e\u6587', 'fi': '\u82ac\u862d\u6587', 'fr': '\u6cd5\u6587', 'he': '\u5e0c\u4f2f\u4f86\u6587',
      'hi': '\u5370\u5730\u6587', 'hu': '\u5308\u7259\u5229\u6587', 'id': '\u5370\u5c3c\u6587', 'it': '\u7fa9\u5927\u5229\u6587',
      'ja': '\u65e5\u6587', 'ko': '\u97d3\u6587', 'lt': '\u7acb\u9676\u5b9b\u6587', 'lv': '\u62c9\u812b\u7dad\u4e9e\u6587',
      'nb': '\u632a\u5a01\u6587', 'nl': '\u8377\u862d\u6587', 'pl': '\u6ce2\u862d\u6587',
      'pt': '\u8461\u8404\u7259\u6587', 'pt-br': '\u5df4\u897f\u8461\u8404\u7259\u6587', 'pt-pt': '\u6b50\u6d32\u8461\u8404\u7259\u6587',
      'ro': '\u7f85\u99ac\u5c3c\u4e9e\u6587', 'ru': '\u4fc4\u6587', 'sk': '\u65af\u6d1b\u4f10\u514b\u6587', 'sl': '\u65af\u6d1b\u7dad\u5c3c\u4e9e\u6587',
      'sv': '\u745e\u5178\u6587', 'th': '\u6cf0\u6587', 'tr': '\u571f\u8033\u5176\u6587', 'uk': '\u70cf\u514b\u862d\u6587',
      'vi': '\u8d8a\u5357\u6587',
      'zh': '\u7c21\u9ad4\u4e2d\u6587', 'zh-cn': '\u7c21\u9ad4\u4e2d\u6587',
      'zh-hans': '\u7c21\u9ad4\u4e2d\u6587', 'zh-tw': '\u7e41\u9ad4\u4e2d\u6587',
      'zh-hant': '\u7e41\u9ad4\u4e2d\u6587',
    },
    ko: {
      'ar': '\uc544\ub78d\uc5b4', 'bg': '\ubd88\uac00\ub9ac\uc544\uc5b4', 'cs': '\uccb4\ucf54\uc5b4', 'da': '\ub374\ub9c8\ud06c\uc5b4',
      'de': '\ub3c5\uc77c\uc5b4', 'el': '\uadf8\ub9ac\uc2a4\uc5b4', 'en': '\uc601\uc5b4', 'es': '\uc2a4\ud398\uc778\uc5b4',
      'et': '\uc5d0\uc2a4\ud1a0\ub2c8\uc544\uc5b4', 'fi': '\ud540\ub780\ub4dc\uc5b4', 'fr': '\ud504\ub791\uc2a4\uc5b4', 'he': '\ud5e4\ube0c\ub9ac\uc5b4',
      'hi': '\ud78c\ub514\uc5b4', 'hu': '\ud5dd\uac00\ub9ac\uc5b4', 'id': '\uc778\ub3c4\ub124\uc2dc\uc544\uc5b4', 'it': '\uc774\ud0c8\ub9ac\uc544\uc5b4',
      'ja': '\uc77c\ubcf8\uc5b4', 'ko': '\ud55c\uad6d\uc5b4', 'lt': '\ub9ac\ud22c\uc544\ub2c8\uc544\uc5b4', 'lv': '\ub77c\ud2b8\ube44\uc544\uc5b4',
      'nb': '\ub178\ub974\uc6e8\uc774\uc5b4', 'nl': '\ub124\ub35c\ub780\ub4dc\uc5b4', 'pl': '\ud3f4\ub780\ub4dc\uc5b4',
      'pt': '\ud3ec\ub974\ud22c\uac08\uc5b4', 'pt-br': '\ube0c\ub77c\uc9c8 \ud3ec\ub974\ud22c\uac08\uc5b4', 'pt-pt': '\uc720\ub7fd \ud3ec\ub974\ud22c\uac08\uc5b4',
      'ro': '\ub8e8\ub9c8\ub2c8\uc544\uc5b4', 'ru': '\ub7ec\uc2dc\uc544\uc5b4', 'sk': '\uc2ac\ub85c\ubc14\ud0a4\uc544\uc5b4', 'sl': '\uc2ac\ub85c\ubca0\ub2c8\uc544\uc5b4',
      'sv': '\uc2a4\uc6e8\ub374\uc5b4', 'th': '\ud0dc\uad6d\uc5b4', 'tr': '\ud130\ud0a4\uc5b4', 'uk': '\uc6b0\ud06c\ub77c\uc774\ub098\uc5b4',
      'vi': '\ubca0\ud2b8\ub0a8\uc5b4',
      'zh': '\uc911\uad6d\uc5b4 \uac04\uccb4', 'zh-cn': '\uc911\uad6d\uc5b4 \uac04\uccb4',
      'zh-hans': '\uc911\uad6d\uc5b4 \uac04\uccb4', 'zh-tw': '\uc911\uad6d\uc5b4 \ubc88\uccb4',
      'zh-hant': '\uc911\uad6d\uc5b4 \ubc88\uccb4',
    },
  };

  // ── DeepL language mapping ──
  function mapToDeepLLang(code) {
    var mapping = {
      'pt-br': 'PT-BR',
      'pt': 'PT-PT',
      'pt-pt': 'PT-PT',
      'zh': 'ZH-HANS',
      'zh-cn': 'ZH-HANS',
      'zh-hans': 'ZH-HANS',
      'zh-tw': 'ZH-HANT',
      'zh-hant': 'ZH-HANT',
      'en-us': 'EN-US',
      'en-gb': 'EN-GB',
    };
    var lower = code.toLowerCase();
    return mapping[lower] || code.toUpperCase();
  }

  function langCodeToName(code) {
    var normalized = code.toLowerCase().replace(/_/g, '-');
    var uiLang = App.getState().uiLang || 'en';
    var dict = LANG_CODE_TO_NAME[uiLang] || LANG_CODE_TO_NAME.en;
    if (dict[normalized]) return dict[normalized];
    // Try base code (e.g. 'ko-kr' -> 'ko')
    var base = normalized.split('-')[0];
    if (dict[base]) return dict[base];
    // Fallback to English dict
    var enDict = LANG_CODE_TO_NAME.en;
    if (enDict[normalized]) return enDict[normalized];
    if (enDict[base]) return enDict[base];
    return code.toUpperCase();
  }

  // ── Translation prompt rules (English for best LLM performance) ──
  var TRANSLATION_RULES = '\n\nRULES:\n1. Preserve all placeholders exactly as-is: {0}, {1}, {{name}}, %s, %d, ${variable}, etc.\n2. Use natural, formal-polite register for the target language. Do not use slang.\n3. Do not add punctuation, words, or content that is not present in the source text.';

  var OPENAI_NO_CUSTOM_TEMP = ['gpt-5-mini'];

  App.MAX_FILE_BYTES = MAX_FILE_BYTES;
  App.FETCH_TIMEOUT_MS = FETCH_TIMEOUT_MS;
  App.PROVIDER_CONFIG = PROVIDER_CONFIG;
  App.LANG_CODE_TO_NAME = LANG_CODE_TO_NAME;
  App.mapToDeepLLang = mapToDeepLLang;
  App.langCodeToName = langCodeToName;
  App.TRANSLATION_RULES = TRANSLATION_RULES;
  App.OPENAI_NO_CUSTOM_TEMP = OPENAI_NO_CUSTOM_TEMP;
})();
