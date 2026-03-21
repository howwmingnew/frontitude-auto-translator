(function () {
  'use strict';
  var App = window.App;

  // ── Constants ──
  var BATCH_SIZE = 15;
  var MAX_SNIPPETS_PER_KEY = 3;
  var MAX_SNIPPET_CHARS = 300;
  var MAX_RETRIES = 2;
  var LANG_INSTRUCTIONS = {
    'zh-TW': ' Respond entirely in Traditional Chinese (繁體中文).',
    'ko': ' Respond entirely in Korean (한국어).'
  };

  // ── System prompt for context generation ──
  var SYSTEM_PROMPT = 'You are a UI context analyzer. Given translation keys and code snippets showing where each key is used in a WPF desktop application, generate a brief 1-2 sentence description of HOW and WHERE each key is used in the UI. Describe in terms a non-engineer translator would understand (e.g., "Button label on the login screen", "Error message shown when file upload fails", "Column header in the patient list table"). Return ONLY a JSON array of strings in the same order as the input keys. If a snippet is unclear, provide your best guess based on the key name and surrounding code.';

  // ── Response parser ──
  function parseContextResponse(content, expectedCount) {
    var cleaned = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    var arr = JSON.parse(cleaned);
    if (!Array.isArray(arr)) {
      throw new Error('Expected a JSON array from context generation');
    }
    if (arr.length !== expectedCount) {
      throw new Error('Context response length mismatch: expected ' + expectedCount + ', got ' + arr.length);
    }
    return arr;
  }

  // ── Build user content from batch keys ──
  function buildUserContent(batchKeys, cache) {
    var items = batchKeys.map(function (key) {
      var cached = cache.get(key);
      var snippetText = cached.matches.slice(0, MAX_SNIPPETS_PER_KEY).map(function (m) {
        return m.file + ': ' + m.snippet.substring(0, MAX_SNIPPET_CHARS);
      }).join('\n---\n');
      return { key: key, snippets: snippetText };
    });
    return JSON.stringify(items);
  }

  // ── OpenAI context generation ──
  async function callContextOpenAI(systemPrompt, userContent) {
    return App._withRetry(async function () {
      var s = App.getState();
      var requestBody = {
        model: s.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ]
      };
      if (App.OPENAI_NO_CUSTOM_TEMP.indexOf(s.model) === -1) {
        requestBody.temperature = 0.3;
      }

      var response = await App.fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + s.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        await App.handleAPIError(response, 'OpenAI');
      }

      var data = await response.json();
      return data.choices[0].message.content.trim();
    }, MAX_RETRIES, 1000);
  }

  // ── Gemini context generation ──
  async function callContextGemini(systemPrompt, userContent) {
    return App._withRetry(async function () {
      var s = App.getState();
      var url = 'https://generativelanguage.googleapis.com/v1beta/models/' +
        s.model + ':generateContent?key=' + s.apiKey;

      var response = await App.fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt + '\n\n' + userContent }] }],
          generationConfig: { temperature: 0.3 }
        })
      });

      if (!response.ok) {
        await App.handleAPIError(response, 'Gemini');
      }

      var data = await response.json();
      return data.candidates[0].content.parts[0].text.trim();
    }, MAX_RETRIES, 1000);
  }

  // ── Context generation dispatcher ──
  async function callContextGeneration(batchKeys, cache) {
    var userContent = buildUserContent(batchKeys, cache);
    var s = App.getState();
    var langSuffix = LANG_INSTRUCTIONS[s.uiLang] || '';
    var effectivePrompt = SYSTEM_PROMPT + langSuffix;
    var rawContent;

    if (s.provider === 'openai') {
      rawContent = await callContextOpenAI(effectivePrompt, userContent);
    } else if (s.provider === 'gemini') {
      rawContent = await callContextGemini(effectivePrompt, userContent);
    } else {
      throw new Error('Context generation not supported for provider: ' + s.provider);
    }

    return parseContextResponse(rawContent, batchKeys.length);
  }

  // ── Main batch context generation function ──
  async function generateBatchContext(keys, onProgress) {
    var s = App.getState();
    // DeepL cannot generate context descriptions
    if (s.provider === 'deepl') {
      return;
    }

    var cache = App.getContextCache();
    // Filter to keys that have search results with matches but no description yet
    var keysNeedingContext = keys.filter(function (key) {
      var cached = cache.get(key);
      return cached && cached.matches && cached.matches.length > 0 && !cached.description;
    });

    if (keysNeedingContext.length === 0) {
      return;
    }

    var completed = 0;
    for (var i = 0; i < keysNeedingContext.length; i += BATCH_SIZE) {
      var batch = keysNeedingContext.slice(i, i + BATCH_SIZE);
      try {
        var descriptions = await callContextGeneration(batch, cache);
        // Store descriptions back into cache entries
        for (var j = 0; j < batch.length; j++) {
          var entry = cache.get(batch[j]);
          if (entry && descriptions[j]) {
            entry.description = descriptions[j];
          }
        }
      } catch (err) {
        // Skip failed batch -- keys translate without context (per locked decision)
      }
      completed += batch.length;
      if (onProgress) {
        onProgress({ completed: completed, total: keysNeedingContext.length });
      }
    }
  }

  // ── Exports ──
  App.generateBatchContext = generateBatchContext;
})();
