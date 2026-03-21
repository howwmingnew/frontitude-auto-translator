(function () {
  'use strict';
  var App = window.App;

  // ── Module-level cache ──
  var contextCache = new Map();

  // ── 1. Concurrency Limiter ──
  function createConcurrencyLimiter(maxConcurrent) {
    var running = 0;
    var queue = [];

    function tryNext() {
      if (running >= maxConcurrent || queue.length === 0) return;
      running++;
      var task = queue.shift();
      task.fn().then(task.resolve, task.reject).finally(function () {
        running--;
        tryNext();
      });
    }

    return function limit(fn) {
      return new Promise(function (resolve, reject) {
        queue.push({ fn: fn, resolve: resolve, reject: reject });
        tryNext();
      });
    };
  }

  // ── 2. Wait helper ──
  function wait(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  // ── 3. Exponential backoff retry ──
  async function withRetry(fn, maxRetries, baseDelay) {
    maxRetries = maxRetries || 3;
    baseDelay = baseDelay || 1000;
    for (var attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        if (err.type === 'rate_limit' && attempt < maxRetries) {
          var delay = err.retryAfter ? err.retryAfter * 1000 : baseDelay * Math.pow(2, attempt);
          await wait(delay);
          continue;
        }
        throw err;
      }
    }
  }

  // ── 4. Search API call ──
  async function doSearch(query) {
    var s = App.getState();
    var url = s.proxyUrl.replace(/\/+$/, '') + '/bitbucket/2.0/workspaces/'
      + encodeURIComponent(s.bitbucketWorkspace) + '/search/code'
      + '?search_query=' + encodeURIComponent(query) + '&pagelen=20';

    var res = await App.fetchWithTimeout(url, {
      headers: { 'Authorization': 'Bearer ' + s.bitbucketToken }
    });

    if (res.status === 429) {
      var retryAfter = res.headers.get('Retry-After');
      throw { type: 'rate_limit', retryAfter: parseInt(retryAfter) || 60 };
    }

    if (!res.ok) {
      throw new Error('Search API error: HTTP ' + res.status);
    }

    var data = await res.json();
    return data.values || [];
  }

  // ── 5. Parse search results ──
  function parseSearchResults(apiValues) {
    var results = [];
    for (var i = 0; i < apiValues.length; i++) {
      var item = apiValues[i];
      var filePath = (item.file && item.file.path) ? item.file.path : 'unknown';
      var matchedLines = [];

      if (item.content_matches) {
        for (var c = 0; c < item.content_matches.length; c++) {
          var cm = item.content_matches[c];
          if (cm.lines) {
            for (var l = 0; l < cm.lines.length; l++) {
              var lineObj = cm.lines[l];
              var lineText = lineObj.segments
                ? lineObj.segments.map(function (seg) { return seg.text; }).join('')
                : '';
              matchedLines.push({
                line: lineObj.line || 0,
                text: lineText
              });
            }
          }
        }
      }

      results.push({
        file: filePath,
        line: matchedLines.length > 0 ? matchedLines[0].line : 0,
        snippet: matchedLines.map(function (m) { return m.text; }).join('\n')
      });
    }
    return results;
  }

  // ── 6. LocExtension pattern detection ──
  function detectLocExtension(snippet) {
    return /\{(?:lex|loc):(?:Loc|Translate)\s+Key\s*=/i.test(snippet);
  }

  // ── 7. Build key result ──
  function buildKeyResult(key, searchResults) {
    var parsed = parseSearchResults(searchResults);
    for (var i = 0; i < parsed.length; i++) {
      parsed[i].isLocExtension = detectLocExtension(parsed[i].snippet);
    }
    return {
      key: key,
      matches: parsed,
      searchedAt: Date.now()
    };
  }

  // ── 8. Query length safety check ──
  function buildSafeQuery(key, ext) {
    var s = App.getState();
    var fullQuery = '"' + key + '" ext:' + ext + ' repo:' + s.bitbucketRepo;
    if (fullQuery.length > 250) {
      return '"' + key + '"';
    }
    return fullQuery;
  }

  // ── 9. Single-key search ──
  async function searchKeyContext(key) {
    // Cache-first
    if (contextCache.has(key)) {
      return contextCache.get(key);
    }

    // Search .xaml first
    var xamlQuery = buildSafeQuery(key, 'xaml');
    var results = await withRetry(function () { return doSearch(xamlQuery); });

    // Fallback to .cs if no .xaml results
    if (!results || results.length === 0) {
      var csQuery = buildSafeQuery(key, 'cs');
      results = await withRetry(function () { return doSearch(csQuery); });
    }

    var result = buildKeyResult(key, results || []);

    // Cache result
    contextCache.set(key, result);

    // Update state immutably
    var newMap = new Map(App.getState().contextResults);
    newMap.set(key, result);
    App.setState({ contextResults: newMap });

    return result;
  }

  // ── 10. Untranslated key filter ──
  function filterUntranslatedKeys(allKeys, targetLangs, jsonData, isRetranslate) {
    if (isRetranslate) {
      return allKeys;
    }
    return allKeys.filter(function (key) {
      for (var i = 0; i < targetLangs.length; i++) {
        var lang = targetLangs[i];
        if (!jsonData[lang] || jsonData[lang][key] === undefined || jsonData[lang][key] === '') {
          return true;
        }
      }
      return false;
    });
  }

  // ── 11. Batch search ──
  async function searchBatchContext(keys, onProgress) {
    var limit = createConcurrencyLimiter(3);
    var completed = 0;
    var total = keys.length;

    // Initial progress
    var initialProgress = { completed: 0, total: total, currentKey: '', status: 'searching' };
    if (onProgress) { onProgress(initialProgress); }
    App.setState({ searchProgress: initialProgress });

    var promises = keys.map(function (key) {
      return limit(function () {
        return searchKeyContext(key).then(function (result) {
          completed++;
          var progress = { completed: completed, total: total, currentKey: key, status: 'searching' };
          if (onProgress) { onProgress(progress); }
          App.setState({ searchProgress: progress });
          return result;
        }).catch(function () {
          completed++;
          var progress = { completed: completed, total: total, currentKey: key, status: 'searching' };
          if (onProgress) { onProgress(progress); }
          App.setState({ searchProgress: progress });
          return null;
        });
      });
    });

    var results = await Promise.all(promises);

    // Final progress
    App.setState({ searchProgress: { completed: total, total: total, currentKey: '', status: 'idle' } });

    return results.filter(Boolean);
  }

  // ── 12. Cache management ──
  function clearContextCache() {
    contextCache = new Map();
    App.setState({ contextResults: new Map() });
  }

  // ── 13. Cache getter ──
  function getContextCache() {
    return contextCache;
  }

  // ── 14. Init (placeholder for Phase 2) ──
  function initSearch() {
    // No-op -- trigger wiring happens in Plan 02 (UI integration)
  }

  // ── Exports ──
  App.searchKeyContext = searchKeyContext;
  App.searchBatchContext = searchBatchContext;
  App.filterUntranslatedKeys = filterUntranslatedKeys;
  App.clearContextCache = clearContextCache;
  App.getContextCache = getContextCache;
  App.detectLocExtension = detectLocExtension;
  App.initSearch = initSearch;
  App._createConcurrencyLimiter = createConcurrencyLimiter;
  App._withRetry = withRetry;
  App._wait = wait;
})();
