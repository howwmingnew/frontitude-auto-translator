(function () {
  'use strict';
  var App = window.App;

  // ── Shared fetch helper ──
  function fetchWithTimeout(url, options) {
    var controller = new AbortController();
    var timeoutId = setTimeout(function () { controller.abort(); }, App.FETCH_TIMEOUT_MS);
    var opts = Object.assign({}, options, { signal: controller.signal });
    return fetch(url, opts)
      .then(function (response) {
        clearTimeout(timeoutId);
        return response;
      })
      .catch(function (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          throw new Error(App.t('errTimeout', App.FETCH_TIMEOUT_MS / 1000));
        }
        throw err;
      });
  }

  async function handleAPIError(response, providerName) {
    var errorBody = '';
    try {
      var errJson = await response.json();
      errorBody = errJson.message || errJson.error?.message || '';
    } catch (_) {
      errorBody = await response.text();
    }
    throw new Error(App.t('errApiError', providerName, response.status, errorBody || response.statusText));
  }

  // ── API Dispatcher ──
  function callTranslateAPI(texts, targetLang, contexts) {
    var s = App.getState();
    switch (s.provider) {
      case 'openai': return callOpenAI(texts, targetLang, contexts);
      case 'gemini': return callGemini(texts, targetLang, contexts);
      default:       return callDeepL(texts, App.mapToDeepLLang(targetLang));
    }
  }

  // ── DeepL ──
  async function callDeepL(texts, targetLang) {
    var s = App.getState();
    var isFree = s.apiKey.endsWith(':fx');
    var baseUrl = isFree
      ? 'https://api-free.deepl.com/v2/translate'
      : 'https://api.deepl.com/v2/translate';

    var response = await fetchWithTimeout(baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'DeepL-Auth-Key ' + s.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: texts,
        source_lang: 'EN',
        target_lang: targetLang,
      }),
    });

    if (!response.ok) {
      await handleAPIError(response, 'DeepL');
    }

    var data = await response.json();
    if (!data || !Array.isArray(data.translations)) {
      throw new Error(App.t('errUnexpectedDeepL', targetLang));
    }
    return data.translations.map(function (t) { return t.text; });
  }

  // ── OpenAI ──
  async function callOpenAI(texts, targetLang, contexts) {
    var s = App.getState();
    var langName = App.langCodeToName(targetLang);
    var contextPrefix = s.contextPrompt.trim()
      ? 'The content is from: ' + s.contextPrompt.trim() + '. '
      : '';

    var hasAnyContext = contexts && contexts.some(function (c) { return c !== ''; });

    var systemContent;
    if (hasAnyContext) {
      systemContent = 'You are a professional translator. ' + contextPrefix
        + 'Translate the following items from English to ' + langName + '. '
        + 'Each item has a "text" to translate and optionally a "context" describing where it appears in the UI. '
        + 'Use the context to choose the most appropriate translation for the usage scenario. '
        + 'Return ONLY a JSON array of translated strings in the same order. '
        + 'Do not add explanations.' + App.TRANSLATION_RULES;
    } else {
      systemContent = 'You are a professional translator. ' + contextPrefix
        + 'Translate the following JSON array of strings from English to ' + langName + '. '
        + 'Return ONLY a JSON array of translated strings in the same order. '
        + 'Do not add explanations.' + App.TRANSLATION_RULES;
    }

    var userContent;
    if (hasAnyContext) {
      userContent = JSON.stringify(texts.map(function (text, idx) {
        return { text: text, context: (contexts && contexts[idx]) || '' };
      }));
    } else {
      userContent = JSON.stringify(texts);
    }

    var requestBody = {
        model: s.model,
        messages: [
          {
            role: 'system',
            content: systemContent,
          },
          {
            role: 'user',
            content: userContent,
          },
        ],
    };
    if (App.OPENAI_NO_CUSTOM_TEMP.indexOf(s.model) === -1) {
      requestBody.temperature = 0.3;
    }
    var response = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + s.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      await handleAPIError(response, 'OpenAI');
    }

    var data = await response.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      throw new Error(App.t('errUnexpectedResponse', 'OpenAI', targetLang.toUpperCase()));
    }
    var content = data.choices[0].message.content.trim();
    return parseJSONArrayResponse(content, 'OpenAI', targetLang);
  }

  // ── Gemini ──
  async function callGemini(texts, targetLang, contexts) {
    var s = App.getState();
    var langName = App.langCodeToName(targetLang);
    var contextPrefix = s.contextPrompt.trim()
      ? 'The content is from: ' + s.contextPrompt.trim() + '. '
      : '';
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/' +
      s.model + ':generateContent?key=' + s.apiKey;

    var hasAnyContext = contexts && contexts.some(function (c) { return c !== ''; });

    var promptText;
    if (hasAnyContext) {
      promptText = 'You are a professional translator. ' + contextPrefix
        + 'Translate the following items from English to ' + langName + '. '
        + 'Each item has a "text" to translate and optionally a "context" describing where it appears in the UI. '
        + 'Use the context to choose the most appropriate translation for the usage scenario. '
        + 'Return ONLY a JSON array of translated strings in the same order. '
        + 'Do not add explanations.' + App.TRANSLATION_RULES
        + '\n\n' + JSON.stringify(texts.map(function (text, idx) {
          return { text: text, context: (contexts && contexts[idx]) || '' };
        }));
    } else {
      promptText = 'You are a professional translator. ' + contextPrefix
        + 'Translate the following JSON array of strings from English to ' + langName + '. '
        + 'Return ONLY a JSON array of translated strings in the same order. '
        + 'Do not add explanations.' + App.TRANSLATION_RULES
        + '\n\n' + JSON.stringify(texts);
    }

    var response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: promptText,
          }],
        }],
        generationConfig: { temperature: 0.3 },
      }),
    });

    if (!response.ok) {
      await handleAPIError(response, 'Gemini');
    }

    var data = await response.json();
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      throw new Error(App.t('errUnexpectedResponse', 'Gemini', targetLang.toUpperCase()));
    }
    var content = data.candidates[0].content.parts[0].text.trim();
    return parseJSONArrayResponse(content, 'Gemini', targetLang);
  }

  function parseJSONArrayResponse(content, providerName, targetLang) {
    // Strip markdown code fences if present
    var cleaned = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    try {
      var arr = JSON.parse(cleaned);
      if (!Array.isArray(arr)) {
        throw new Error('Expected a JSON array');
      }
      if (!arr.every(function (item) { return typeof item === 'string'; })) {
        throw new Error('Expected array of strings, got mixed types');
      }
      return arr;
    } catch (err) {
      throw new Error(App.t('errInvalidJson', providerName, targetLang.toUpperCase(), err.message));
    }
  }

  // ── Test API Key ──
  async function testApiKey() {
    var key = App.dom.apiKey.value.trim();
    if (!key) {
      App.showToast(App.t('testApiKeyNoKey'), 'error');
      return;
    }

    var btn = App.dom.testApiKeyBtn;
    var originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = App.t('testApiKeyTesting');

    try {
      await callTranslateAPI(['hello'], 'de');
      btn.textContent = App.t('testApiKeySuccess');
      btn.classList.add('test-key-success');
      btn.disabled = true;
    } catch (err) {
      App.showToast(App.t('toastError', err.message), 'error');
      btn.textContent = originalText;
      App.updateTestKeyBtn();
    }
  }

  App.fetchWithTimeout = fetchWithTimeout;
  App.handleAPIError = handleAPIError;
  App.callTranslateAPI = callTranslateAPI;
  App.callDeepL = callDeepL;
  App.callOpenAI = callOpenAI;
  App.callGemini = callGemini;
  App.testApiKey = testApiKey;
})();
