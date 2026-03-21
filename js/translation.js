(function () {
  'use strict';
  var App = window.App;

  // ── Translation Confirmation ──
  function buildTranslationSummary() {
    var s = App.getState();
    var enKeys = Object.keys(s.jsonData.en).filter(function (k) {
      return s.jsonData.en[k] !== undefined && s.jsonData.en[k] !== '';
    });
    var totalKeys = enKeys.length;
    var targetLangs = Array.from(s.selected);
    return targetLangs.map(function (lang) {
      var isFullyDone = s.fullyTranslatedLangs.has(lang);
      if (isFullyDone) {
        return { lang: lang, count: totalKeys, retranslate: true };
      }
      var langData = s.jsonData[lang] || {};
      var missing = enKeys.filter(function (k) {
        return langData[k] === undefined || langData[k] === '';
      }).length;
      return { lang: lang, count: missing, retranslate: false };
    });
  }

  function showTranslateConfirm() {
    var summary = buildTranslationSummary();
    App.dom.translateConfirmTitle.textContent = App.t('confirmTranslateTitle');
    App.dom.translateConfirmCancel.textContent = App.t('confirmCancel');
    App.dom.translateConfirmOk.textContent = App.t('confirmTranslate');

    var html = '<table class="translate-confirm-table"><thead><tr>'
      + '<th>' + App.t('confirmLangHeader') + '</th>'
      + '<th>' + App.t('confirmCountHeader') + '</th>'
      + '</tr></thead><tbody>';
    summary.forEach(function (item) {
      var langName = App.langCodeToName(item.lang);
      var badge = item.retranslate
        ? '<span class="retranslate-badge">(' + App.t('confirmRetranslateAll') + ')</span>'
        : '';
      html += '<tr><td>' + langName + ' (' + item.lang.toUpperCase() + ')' + badge + '</td>'
        + '<td>' + item.count + '</td></tr>';
    });
    html += '</tbody></table>';
    App.dom.translateConfirmBody.innerHTML = html;
    App.dom.translateConfirmOverlay.classList.add('active');
  }

  function closeTranslateConfirm() {
    App.dom.translateConfirmOverlay.classList.remove('active');
  }

  // ── Translation ──
  async function startTranslation() {
    var s = App.getState();
    App.setState({ translating: true, failedKeys: [] });
    App.updateTranslateBtn();
    App.hideError(App.dom.translateError);
    App.hideRetryButton();

    var isPrecise = App.getState().translateMode === 'precise';

    App.dom.progressSection.style.display = 'block';

    var enKeys = Object.keys(s.jsonData.en).filter(function (k) {
      return s.jsonData.en[k] !== undefined && s.jsonData.en[k] !== '';
    });
    var targetLangs = Array.from(s.selected);

    // Deep clone to avoid any mutation of original data
    var result = JSON.parse(JSON.stringify(s.jsonData));
    var newAiCells = new Set(s.aiTranslatedCells);
    var newOriginals = Object.assign({}, s.originalTranslations);

    var batchSize = 10;

    // Pre-calculate total batches for fine-grained progress
    var langBatchInfo = [];
    var totalBatches = 0;
    for (var li = 0; li < targetLangs.length; li++) {
      var l = targetLangs[li];
      var isRe = s.fullyTranslatedLangs.has(l);
      var ld = s.jsonData[l] || {};
      var ktKeys = isRe ? enKeys : enKeys.filter(function (k) { return ld[k] === undefined || ld[k] === ''; });
      var batches = ktKeys.length === 0 ? 0 : Math.ceil(ktKeys.length / batchSize);
      langBatchInfo.push({ lang: l, isRetranslate: isRe, keys: ktKeys, batches: batches });
      totalBatches += Math.max(batches, 1); // at least 1 step per lang for chip update
    }

    var totalTexts = langBatchInfo.reduce(function (sum, info) { return sum + info.keys.length; }, 0);
    var translatedCount = 0;
    var completedBatches = 0;
    var simulatedPct = 0;
    var simTimer = null;
    var failedKeys = [];

    function updateProgress(jumpTo) {
      if (simTimer) { clearInterval(simTimer); simTimer = null; }
      var realPct = totalBatches === 0 ? 100 : Math.round((completedBatches / totalBatches) * 100);
      realPct = Math.min(realPct, 100);
      if (jumpTo !== undefined) {
        simulatedPct = jumpTo;
      }
      simulatedPct = Math.max(simulatedPct, realPct);
      App.dom.progressBar.style.width = simulatedPct + '%';
      App.dom.progressLabel.textContent = simulatedPct + '%';
    }

    // Simulate gradual progress while waiting for API response
    function startSimulatedProgress(targetPct) {
      if (simTimer) { clearInterval(simTimer); simTimer = null; }
      simTimer = setInterval(function () {
        if (simulatedPct < targetPct) {
          simulatedPct += 1;
          App.dom.progressBar.style.width = simulatedPct + '%';
          App.dom.progressLabel.textContent = simulatedPct + '%';
        } else {
          clearInterval(simTimer);
          simTimer = null;
        }
      }, 300);
    }

    // Render progress chips
    App.renderProgressChips(targetLangs);
    App.dom.progressLabel.textContent = '0%';
    App.dom.progressBar.style.width = '0%';
    App.dom.progressTranslatedCount.textContent = App.t('progressTranslatedCount', 0, totalTexts);

    // ── Phase A: Search code context (precise mode) ──
    var allKeysToSearch = [];
    if (isPrecise && s.bitbucketConnected && s.provider !== 'deepl') {
      if (isPrecise) {
        App.showStepper();
        App.updateStepper('search');
      }

      // Collect all untranslated keys across all target languages (deduplicated)
      var keySet = {};
      for (var si = 0; si < langBatchInfo.length; si++) {
        var searchInfo = langBatchInfo[si];
        for (var sk = 0; sk < searchInfo.keys.length; sk++) {
          keySet[searchInfo.keys[sk]] = true;
        }
      }
      allKeysToSearch = Object.keys(keySet);

      if (allKeysToSearch.length > 0) {
        App.dom.progressText.textContent = App.t('progressSearching', allKeysToSearch.length);
        await App.searchBatchContext(allKeysToSearch, function (p) {
          // Search progress -- leave progress bar at 0% during search (translation progress is separate)
        });
      }
    }

    // ── Phase B: Generate context descriptions (precise mode) ──
    if (isPrecise && s.bitbucketConnected && s.provider !== 'deepl' && allKeysToSearch.length > 0) {
      if (isPrecise) {
        App.updateStepper('generate');
      }
      App.dom.progressText.textContent = App.t('progressGeneratingContext', allKeysToSearch.length);
      await App.generateBatchContext(allKeysToSearch, function (p) {
        // Context generation progress -- leave progress bar at 0% during generation
      });
    }

    // ── Phase C: Translate ──
    if (isPrecise) {
      App.updateStepper('translate');
      App.dom.progressBar.style.width = '0%';
      App.dom.progressLabel.textContent = '0%';
      simulatedPct = 0;
    }

    try {
      for (var i = 0; i < langBatchInfo.length; i++) {
        var info = langBatchInfo[i];
        var lang = info.lang;
        var isRetranslate = info.isRetranslate;
        var langData = App.getState().jsonData[lang] || {};
        var keysToTranslate = info.keys;
        var textsToTranslate = keysToTranslate.map(function (k) { return App.getState().jsonData.en[k]; });

        if (isRetranslate) {
          newOriginals[lang] = JSON.parse(JSON.stringify(langData));
        }

        App.updateProgressChip(lang, 'translating');
        App.dom.progressText.textContent = App.t('progressTranslating', lang.toUpperCase(), i + 1, targetLangs.length);
        updateProgress();

        var translatedTexts = [];

        try {
          if (textsToTranslate.length === 0) {
            completedBatches += 1;
            updateProgress();
          } else {
            for (var batchStart = 0; batchStart < textsToTranslate.length; batchStart += batchSize) {
              var batch = textsToTranslate.slice(batchStart, batchStart + batchSize);
              // Simulate progress up to ~90% of next batch's share while waiting
              var nextRealPct = totalBatches === 0 ? 100 : Math.round(((completedBatches + 1) / totalBatches) * 100);
              var simTarget = simulatedPct + Math.round((nextRealPct - simulatedPct) * 0.85);
              startSimulatedProgress(simTarget);
              // Look up context descriptions for this batch's keys
              var batchKeys = keysToTranslate.slice(batchStart, batchStart + batchSize);

              try {
                var batchContexts = batchKeys.map(function (key) {
                  var cached = App.getContextCache().get(key);
                  return (cached && cached.description) || '';
                });
                var translated = await App.callTranslateAPI(batch, lang, batchContexts);
                translatedTexts = translatedTexts.concat(translated);
                translatedCount += batch.length;
              } catch (batchErr) {
                // Mark all keys in this failed batch
                batchKeys.forEach(function (key) {
                  failedKeys.push({ key: key, lang: lang, error: batchErr.message || String(batchErr) });
                });
                // Fill with empty strings to maintain alignment
                for (var f = 0; f < batch.length; f++) {
                  translatedTexts.push('');
                }
                translatedCount += batch.length;
              }

              completedBatches++;
              updateProgress();
              App.dom.progressTranslatedCount.textContent = App.t('progressTranslatedCount', translatedCount, totalTexts);
            }
          }

          // Build language block: merge with existing data (skip failed keys)
          if (textsToTranslate.length > 0) {
            var langBlock = isRetranslate ? {} : Object.assign({}, result[lang] || {});
            keysToTranslate.forEach(function (key, idx) {
              var isFailed = failedKeys.some(function (fk) { return fk.key === key && fk.lang === lang; });
              if (!isFailed && translatedTexts[idx]) {
                langBlock[key] = translatedTexts[idx];
                newAiCells.add(lang + ':' + key);
              }
            });
            result[lang] = langBlock;
          }

          // Determine chip state: error if any keys failed for this lang, else done
          var langHasErrors = failedKeys.some(function (fk) { return fk.lang === lang; });
          App.updateProgressChip(lang, langHasErrors ? 'error' : 'done');

        } catch (langErr) {
          // Fatal error for this language (not a batch error)
          App.updateProgressChip(lang, 'error');
          keysToTranslate.forEach(function (key) {
            failedKeys.push({ key: key, lang: lang, error: langErr.message || String(langErr) });
          });
        }
      }

      if (simTimer) { clearInterval(simTimer); simTimer = null; }
      App.dom.progressLabel.textContent = '100%';
      App.dom.progressBar.style.width = '100%';
      App.setState({ jsonData: result, aiTranslatedCells: newAiCells, originalTranslations: newOriginals, failedKeys: failedKeys });
      App.renderEditorTable();

      if (isPrecise) {
        App.completeStepper();
      }

      if (failedKeys.length > 0) {
        App.markFailedCells(failedKeys);
        App.showRetryButton(failedKeys.length);
        App.dom.progressText.textContent = App.t('progressDone', targetLangs.length);
        App.showToast(App.t('progressDone', targetLangs.length) + ' (' + failedKeys.length + ' failed)', 'warning');
      } else {
        App.dom.progressText.textContent = App.t('progressDone', targetLangs.length);
        App.showToast(App.t('toastTranslateComplete', targetLangs.length), 'success');
      }
    } catch (err) {
      App.showError(App.dom.translateError, err.message);
      App.showToast(App.t('toastError', err.message), 'error');
    } finally {
      if (simTimer) { clearInterval(simTimer); simTimer = null; }
      App.setState({ translating: false });
      App.updateTranslateBtn();
      if (isPrecise && failedKeys.length === 0) {
        setTimeout(function () { App.hideStepper(); }, 2000);
      }
    }
  }

  // ── Retry Failed Keys ──
  async function retryFailedKeys() {
    var s = App.getState();
    var currentFailedKeys = s.failedKeys;
    if (!currentFailedKeys || currentFailedKeys.length === 0) return;

    App.setState({ translating: true });
    App.updateTranslateBtn();
    App.hideRetryButton();
    App.dom.progressSection.style.display = 'block';

    var result = JSON.parse(JSON.stringify(s.jsonData));
    var newAiCells = new Set(s.aiTranslatedCells);
    var newFailedKeys = [];
    var total = currentFailedKeys.length;
    var done = 0;

    // Group by lang
    var byLang = {};
    currentFailedKeys.forEach(function (f) {
      if (!byLang[f.lang]) byLang[f.lang] = [];
      byLang[f.lang].push(f.key);
    });

    App.dom.progressBar.style.width = '0%';
    App.dom.progressLabel.textContent = '0%';

    var langs = Object.keys(byLang);
    for (var i = 0; i < langs.length; i++) {
      var lang = langs[i];
      var keys = byLang[lang];
      var texts = keys.map(function (k) { return s.jsonData.en[k]; });
      var batchSize = 10;

      App.dom.progressText.textContent = App.t('progressTranslating', lang.toUpperCase(), i + 1, langs.length);

      for (var batchStart = 0; batchStart < texts.length; batchStart += batchSize) {
        var batch = texts.slice(batchStart, batchStart + batchSize);
        var batchKeys = keys.slice(batchStart, batchStart + batchSize);

        try {
          var batchContexts = batchKeys.map(function (key) {
            var cached = App.getContextCache().get(key);
            return (cached && cached.description) || '';
          });
          var translated = await App.callTranslateAPI(batch, lang, batchContexts);
          batchKeys.forEach(function (key, idx) {
            if (!result[lang]) result[lang] = {};
            result[lang][key] = translated[idx];
            newAiCells.add(lang + ':' + key);
          });
          done += batchKeys.length;
        } catch (err) {
          batchKeys.forEach(function (key) {
            newFailedKeys.push({ key: key, lang: lang, error: err.message || String(err) });
          });
          done += batchKeys.length;
        }

        var pct = Math.round((done / total) * 100);
        App.dom.progressBar.style.width = pct + '%';
        App.dom.progressLabel.textContent = pct + '%';
      }
    }

    App.setState({ jsonData: result, aiTranslatedCells: newAiCells, failedKeys: newFailedKeys, translating: false });
    App.updateTranslateBtn();
    App.renderEditorTable();

    if (newFailedKeys.length > 0) {
      App.markFailedCells(newFailedKeys);
      App.showRetryButton(newFailedKeys.length);
      App.showToast(App.t('retryCount', newFailedKeys.length), 'warning');
    } else {
      App.hideRetryButton();
      App.showToast(App.t('toastTranslateComplete', langs.length), 'success');
    }
  }

  App.showTranslateConfirm = showTranslateConfirm;
  App.closeTranslateConfirm = closeTranslateConfirm;
  App.startTranslation = startTranslation;
  App.doTranslate = startTranslation;
  App.retryFailedKeys = retryFailedKeys;
})();
