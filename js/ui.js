(function () {
  'use strict';
  var App = window.App;

  // ── Theme ──
  function getPreferredTheme() {
    var saved = localStorage.getItem('translate_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  function applyTheme(theme) {
    App.setState({ theme: theme });
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  // ── Toast Notifications ──
  function showToast(message, type) {
    type = type || 'info';
    var toast = document.createElement('div');
    toast.className = 'toast toast--' + type;
    toast.textContent = message;

    var dismissTimeout;

    function dismiss() {
      clearTimeout(dismissTimeout);
      toast.classList.add('toast-dismissing');
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }

    toast.addEventListener('click', dismiss);
    App.dom.toastContainer.appendChild(toast);

    dismissTimeout = setTimeout(dismiss, 4000);
  }

  // ── Error helpers ──
  function showError(el, msg) {
    el.textContent = msg;
    el.style.display = 'block';
  }

  function hideError(el) {
    el.textContent = '';
    el.style.display = 'none';
  }

  // ── Collapsible Sections (mobile) ──
  function initCollapsible(headerEl, bodyEl, storageKey) {
    var savedState = sessionStorage.getItem(storageKey);
    if (savedState === 'collapsed') {
      headerEl.classList.add('collapsed');
      bodyEl.classList.add('collapsed');
      bodyEl.style.maxHeight = '0';
    } else {
      bodyEl.style.maxHeight = 'none';
    }

    headerEl.addEventListener('click', function () {
      // Only act as collapsible on mobile
      if (window.innerWidth >= 768) return;

      var isCollapsed = headerEl.classList.contains('collapsed');
      if (isCollapsed) {
        headerEl.classList.remove('collapsed');
        bodyEl.classList.remove('collapsed');
        bodyEl.style.maxHeight = bodyEl.scrollHeight + 'px';
        setTimeout(function () { bodyEl.style.maxHeight = 'none'; }, 300);
        sessionStorage.setItem(storageKey, 'expanded');
      } else {
        bodyEl.style.maxHeight = bodyEl.scrollHeight + 'px';
        // Force reflow
        bodyEl.offsetHeight;
        bodyEl.style.maxHeight = '0';
        headerEl.classList.add('collapsed');
        bodyEl.classList.add('collapsed');
        sessionStorage.setItem(storageKey, 'collapsed');
      }
    });
  }

  // ── Sidebar Drawer ──
  function openDrawer() {
    if (App.getState().jsonData) {
      var prevFullyDone = App.getState().fullyTranslatedLangs;
      var fullyDone = App.getFullyTranslatedLanguages(App.getState().jsonData);
      var newSelected = new Set(App.getState().selected);
      App.getState().languages.forEach(function (lang) {
        var wasFull = prevFullyDone.has(lang);
        var isFull = fullyDone.has(lang);
        if (!wasFull && isFull) {
          // Newly fully translated -> uncheck
          newSelected.delete(lang);
        } else if (wasFull && !isFull) {
          // Was fully translated but now has missing texts -> check
          newSelected.add(lang);
        }
      });
      App.setState({ fullyTranslatedLangs: fullyDone, selected: newSelected });
      App.renderLanguages();
      App.updateTranslateBtn();
    }
    App.dom.sidebarDrawer.classList.add('open');
    App.dom.sidebarOverlay.classList.add('active');
  }

  function closeDrawer() {
    App.dom.sidebarDrawer.classList.remove('open');
    App.dom.sidebarOverlay.classList.remove('active');
  }

  function toggleSidebarVisibility() {
    // Sidebar toggle is only visible after file is loaded
    // (controlled by display style in app.js)
  }

  // ── Progress Chips ──
  function renderProgressChips(languages) {
    var html = '';
    for (var i = 0; i < languages.length; i++) {
      html += '<span class="progress-chip progress-chip--pending" data-chip-lang="' + languages[i] + '">' + languages[i].toUpperCase() + '</span>';
    }
    App.dom.progressChips.innerHTML = html;
  }

  function updateProgressChip(lang, status) {
    var chip = App.dom.progressChips.querySelector('[data-chip-lang="' + lang + '"]');
    if (!chip) return;
    chip.className = 'progress-chip progress-chip--' + status;
    if (status === 'done') {
      chip.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' + lang.toUpperCase();
    } else if (status === 'error') {
      chip.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' + lang.toUpperCase();
    }
  }

  // ── Provider + API Key ──
  function storageKeyForProvider(provider) {
    return 'translate_key_' + provider;
  }

  function storageKeyForModel(provider) {
    return 'translate_model_' + provider;
  }

  function initProvider() {
    var savedProvider = localStorage.getItem('translate_provider') || 'deepl';
    App.dom.providerSelect.value = savedProvider;
    App.setState({ provider: savedProvider });
    applyProviderUI(savedProvider);
    loadProviderKey(savedProvider);
    loadProviderModel(savedProvider);
    App.updateTestKeyBtn();
  }

  function applyProviderUI(provider) {
    var config = App.PROVIDER_CONFIG[provider];
    App.dom.apiKey.placeholder = App.t(provider + 'Placeholder');
    App.dom.disclaimer.textContent = App.t(provider + 'Disclaimer');

    // DeepL note for context prompt
    App.dom.deeplNote.style.display = (provider === 'deepl') ? 'block' : 'none';

    // Model selector
    if (config.models.length === 0) {
      App.dom.modelRow.style.display = 'none';
    } else {
      App.dom.modelRow.style.display = 'flex';
      renderModelDropdown(config);
    }

    // Update Get API Key link
    if (App.dom.getApiKeyLink) {
      App.dom.getApiKeyLink.href = config.keyUrl;
    }
  }

  function renderModelDropdown(config) {
    App.dom.modelSelect.innerHTML = '';
    config.models.forEach(function (m) {
      var opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.id + ' \u2014 ' + App.t(m.annotationKey);
      App.dom.modelSelect.appendChild(opt);
    });
  }

  function loadProviderKey(provider) {
    var saved = localStorage.getItem(storageKeyForProvider(provider));
    if (saved) {
      App.dom.apiKey.value = saved;
      App.setState({ apiKey: saved });
      updateKeyBadge(saved, provider);
      App.dom.rememberKey.checked = true;
      App.dom.clearKey.style.display = 'inline';
    } else {
      App.dom.apiKey.value = '';
      App.setState({ apiKey: '' });
      updateKeyBadge('', provider);
      App.dom.clearKey.style.display = 'none';
    }
  }

  function loadProviderModel(provider) {
    var config = App.PROVIDER_CONFIG[provider];
    if (config.models.length === 0) {
      App.setState({ model: '' });
      return;
    }
    var saved = localStorage.getItem(storageKeyForModel(provider));
    var modelIds = config.models.map(function (m) { return m.id; });
    var model = (saved && modelIds.indexOf(saved) !== -1) ? saved : config.models[0].id;
    App.dom.modelSelect.value = model;
    App.setState({ model: model });
  }

  function updateKeyBadge(key, provider) {
    var p = provider || App.getState().provider;
    if (!key) {
      App.dom.keyBadge.textContent = App.t('noKey');
      App.dom.keyBadge.className = 'badge badge-none';
      return;
    }
    if (p === 'deepl') {
      var isFree = key.endsWith(':fx');
      App.dom.keyBadge.textContent = isFree ? App.t('free') : App.t('pro');
      App.dom.keyBadge.className = 'badge ' + (isFree ? 'badge-free' : 'badge-pro');
    } else {
      App.dom.keyBadge.textContent = App.PROVIDER_CONFIG[p].label;
      App.dom.keyBadge.className = 'badge badge-provider';
    }
  }

  function persistApiKey(key) {
    if (App.dom.rememberKey.checked) {
      localStorage.setItem(storageKeyForProvider(App.getState().provider), key);
      App.dom.clearKey.style.display = key ? 'inline' : 'none';
    }
  }

  function persistModel(model) {
    localStorage.setItem(storageKeyForModel(App.getState().provider), model);
  }

  function updateTranslateBtn() {
    var s = App.getState();
    var disabled = s.selected.size === 0 || !s.apiKey || s.translating;
    App.dom.translateBtn.disabled = disabled;
  }

  function updateTestKeyBtn() {
    App.dom.testApiKeyBtn.disabled = !App.dom.apiKey.value.trim();
    App.dom.testApiKeyBtn.classList.remove('test-key-success');
    App.dom.testApiKeyBtn.textContent = App.t('testApiKey');
  }

  // ── Editor Table ──
  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function renderEditorTable() {
    var s = App.getState();
    if (!s.jsonData || !s.jsonData.en) return;

    var filter = (App.dom.editorSearch.value || '').toLowerCase();
    var allKeys = Object.keys(s.jsonData.en);
    var keys = filter
      ? allKeys.filter(function (k) { return k.toLowerCase().indexOf(filter) !== -1; })
      : allKeys;

    var langs = ['en'].concat(
      Object.keys(s.jsonData).filter(function (k) { return k !== 'en'; }).sort()
    );

    var html = '<thead><tr><th>Key</th>';
    langs.forEach(function (lang) {
      var cls = lang === 'en' ? ' class="col-source"' : '';
      html += '<th' + cls + '>' + lang.toUpperCase() + '</th>';
    });
    html += '</tr></thead><tbody>';

    keys.forEach(function (key) {
      html += '<tr><td title="' + key.replace(/"/g, '&quot;') + '">' + escapeHtml(key) + '</td>';
      langs.forEach(function (lang) {
        var val = s.jsonData[lang] ? s.jsonData[lang][key] : undefined;
        var cls = lang === 'en' ? ' col-source' : '';
        var editedCls = s.editedCells.has(key + '::' + lang) ? ' cell-edited' : '';
        var aiCls = s.aiTranslatedCells.has(lang + ':' + key) ? ' ai-translated' : '';
        if (val !== undefined && val !== '') {
          html += '<td class="' + cls + editedCls + aiCls + '" title="' + escapeHtml(val).replace(/"/g, '&quot;') + '">' + escapeHtml(val) + '</td>';
        } else {
          html += '<td class="empty-cell' + cls + editedCls + '">&mdash;</td>';
        }
      });
      html += '</tr>';
    });
    html += '</tbody>';

    App.dom.editorTable.innerHTML = html;
    App.dom.editorCount.textContent = App.t('editorCount', keys.length, allKeys.length);
  }

  // ── Language Selection ──
  function getFullyTranslatedLanguages(jsonData) {
    var enKeys = Object.keys(jsonData.en).filter(function (k) {
      return jsonData.en[k] !== undefined && jsonData.en[k] !== '';
    });
    var fullyTranslated = new Set();
    var langs = Object.keys(jsonData).filter(function (k) { return k !== 'en'; });
    langs.forEach(function (lang) {
      var langData = jsonData[lang];
      if (!langData) return;
      var allDone = enKeys.every(function (k) {
        return langData[k] !== undefined && langData[k] !== '';
      });
      if (allDone) fullyTranslated.add(lang);
    });
    return fullyTranslated;
  }

  function renderLanguages() {
    App.dom.langGrid.innerHTML = '';
    App.getState().languages.forEach(function (lang) {
      var s = App.getState();
      var isFullyDone = s.fullyTranslatedLangs.has(lang);
      var isChecked = s.selected.has(lang);
      var showWarning = isFullyDone && isChecked;

      var label = document.createElement('label');
      label.className = 'lang-item'
        + (isChecked ? ' lang-item--checked' : '')
        + (showWarning ? ' lang-item--warning' : '');
      label.style.flexDirection = 'column';
      label.style.alignItems = 'flex-start';

      var row = document.createElement('div');
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.gap = '0.375rem';

      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.value = lang;
      cb.checked = isChecked;

      var span = document.createElement('span');
      span.textContent = lang.toUpperCase();

      row.appendChild(cb);
      row.appendChild(span);
      label.appendChild(row);

      // Warning hint for fully translated langs
      var hint = document.createElement('span');
      hint.className = 'lang-warning-hint';
      hint.textContent = App.t('langFullyTranslated');
      hint.style.display = showWarning ? 'block' : 'none';
      label.appendChild(hint);

      cb.addEventListener('change', function () {
        var next = new Set(App.getState().selected);
        if (cb.checked) {
          next.add(lang);
          label.classList.add('lang-item--checked');
          if (isFullyDone) {
            label.classList.add('lang-item--warning');
            hint.style.display = 'block';
          }
        } else {
          next.delete(lang);
          label.classList.remove('lang-item--checked');
          label.classList.remove('lang-item--warning');
          hint.style.display = 'none';
        }
        App.setState({ selected: next });
        App.updateTranslateBtn();
      });

      App.dom.langGrid.appendChild(label);
    });
  }

  // ── File Upload ──
  function handleFile(file) {
    hideError(App.dom.uploadError);
    hideError(App.dom.translateError);

    if (!file.name.endsWith('.json')) {
      showError(App.dom.uploadError, App.t('errJsonFile'));
      showToast(App.t('toastError', App.t('errJsonFile')), 'error');
      return;
    }

    if (file.size > App.MAX_FILE_BYTES) {
      showError(App.dom.uploadError, App.t('errFileTooLarge'));
      showToast(App.t('toastError', App.t('errFileTooLarge')), 'error');
      return;
    }

    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var parsed = JSON.parse(e.target.result);
        processJson(parsed);
      } catch (err) {
        showError(App.dom.uploadError, App.t('errJsonParse', err.message));
        showToast(App.t('toastError', App.t('errJsonParse', err.message)), 'error');
      }
    };
    reader.onerror = function () {
      showError(App.dom.uploadError, App.t('errReadFile'));
      showToast(App.t('toastError', App.t('errReadFile')), 'error');
    };
    reader.readAsText(file);
  }

  function processJson(parsed) {
    // Validate structure
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      showError(App.dom.uploadError, App.t('errInvalidFormat'));
      showToast(App.t('toastError', App.t('errInvalidFormat')), 'error');
      return;
    }

    if (!parsed.en || typeof parsed.en !== 'object') {
      showError(App.dom.uploadError, App.t('errMissingEn'));
      showToast(App.t('toastError', App.t('errMissingEn')), 'error');
      return;
    }

    var invalidKeys = Object.entries(parsed.en)
      .filter(function (kv) { return typeof kv[1] !== 'string'; })
      .map(function (kv) { return kv[0]; });
    if (invalidKeys.length > 0) {
      var keyList = invalidKeys.slice(0, 5).join(', ');
      var more = invalidKeys.length > 5 ? App.t('errNonStringMore', invalidKeys.length - 5) : '';
      showError(App.dom.uploadError, App.t('errNonString', keyList + more));
      showToast(App.t('toastError', App.t('errNonString', keyList + more)), 'error');
      return;
    }

    var langs = Object.keys(parsed).filter(function (k) { return k !== 'en'; }).sort();
    var keyCount = Object.keys(parsed.en).length;

    var fullyDone = getFullyTranslatedLanguages(parsed);
    var defaultSelected = langs.filter(function (l) { return !fullyDone.has(l); });
    App.setState({
      jsonData: parsed,
      importedJsonData: JSON.parse(JSON.stringify(parsed)),
      languages: langs,
      selected: new Set(defaultSelected),
      fullyTranslatedLangs: fullyDone,
    });

    // Show file info
    App.dom.fileInfo.style.display = 'block';
    App.dom.fileInfo.textContent = App.t('fileInfo', langs.join(', '), keyCount);

    App.dom.uploadCard.style.display = 'none';
    App.dom.container.classList.add('container--wide');

    renderLanguages();
    App.dom.editorSearch.value = '';
    renderEditorTable();
    App.dom.editorSection.style.display = 'block';
    App.dom.sidebarToggle.style.display = 'flex';
    updateTranslateBtn();

    // Toast notification for file load
    showToast(App.t('toastFileLoaded', keyCount, langs.length + 1), 'info');
  }

  // ── Download ──
  function downloadJsonData() {
    var s = App.getState();
    var json = JSON.stringify(s.jsonData, null, 2);
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'language.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  App.getPreferredTheme = getPreferredTheme;
  App.applyTheme = applyTheme;
  App.showToast = showToast;
  App.showError = showError;
  App.hideError = hideError;
  App.initCollapsible = initCollapsible;
  App.openDrawer = openDrawer;
  App.closeDrawer = closeDrawer;
  App.toggleSidebarVisibility = toggleSidebarVisibility;
  App.renderProgressChips = renderProgressChips;
  App.updateProgressChip = updateProgressChip;
  App.initProvider = initProvider;
  App.applyProviderUI = applyProviderUI;
  App.renderModelDropdown = renderModelDropdown;
  App.updateKeyBadge = updateKeyBadge;
  App.persistApiKey = persistApiKey;
  App.persistModel = persistModel;
  App.storageKeyForProvider = storageKeyForProvider;
  App.storageKeyForModel = storageKeyForModel;
  App.updateTranslateBtn = updateTranslateBtn;
  App.updateTestKeyBtn = updateTestKeyBtn;
  App.renderEditorTable = renderEditorTable;
  App.escapeHtml = escapeHtml;
  App.getFullyTranslatedLanguages = getFullyTranslatedLanguages;
  App.renderLanguages = renderLanguages;
  App.handleFile = handleFile;
  App.downloadJsonData = downloadJsonData;
  App.downloadLanguageFile = downloadJsonData;
  App.loadProviderKey = loadProviderKey;
  App.loadProviderModel = loadProviderModel;
})();
