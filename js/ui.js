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

  // ── Context Menu ──
  var activeContextMenuKey = null;

  function showSearchContextMenu(x, y, key) {
    activeContextMenuKey = key;
    var menu = App.dom.contextMenu;
    menu.style.display = 'block';
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';

    // Ensure menu stays within viewport
    var rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      menu.style.left = (window.innerWidth - rect.width - 8) + 'px';
    }
    if (rect.bottom > window.innerHeight) {
      menu.style.top = (window.innerHeight - rect.height - 8) + 'px';
    }
  }

  function dismissContextMenu() {
    App.dom.contextMenu.style.display = 'none';
    activeContextMenuKey = null;
  }

  function getActiveContextMenuKey() {
    return activeContextMenuKey;
  }

  // ── Search UI Init ──
  function initSearchUI() {
    // Right-click context menu via event delegation (survives table re-renders)
    App.dom.editorTable.addEventListener('contextmenu', function (e) {
      var row = e.target.closest('tr');
      if (!row || !row.parentElement || row.parentElement.tagName === 'THEAD') return;

      var keyCell = row.querySelector('td:first-child');
      if (!keyCell) return;

      var key = keyCell.getAttribute('title') || keyCell.textContent;
      e.preventDefault();
      showSearchContextMenu(e.clientX, e.clientY, key);
    });

    // Context menu search button click
    App.dom.contextMenuSearch.addEventListener('click', function () {
      var key = activeContextMenuKey;
      dismissContextMenu();
      if (!key) return;

      var s = App.getState();
      if (!s.bitbucketConnected) {
        App.showToast(App.t('searchNoConnection'), 'error');
        return;
      }

      // Show loading indicator on the row
      setRowSearchLoading(key, true);

      App.searchKeyContext(key).then(function (result) {
        setRowSearchLoading(key, false);
        var matchCount = result && result.matches ? result.matches.length : 0;
        if (matchCount > 0) {
          App.showToast(App.t('searchSingleFound', matchCount), 'success');
        } else {
          App.showToast(App.t('searchSingleNone'), 'info');
        }
      }).catch(function (err) {
        setRowSearchLoading(key, false);
        App.showToast(App.t('searchError', err.message || String(err)), 'error');
      });
    });

    // Dismiss context menu on click anywhere and on scroll
    document.addEventListener('click', dismissContextMenu);
    App.dom.editorTable.addEventListener('scroll', dismissContextMenu);
  }

  // ── Row Loading Indicator ──
  function setRowSearchLoading(key, isLoading) {
    var table = App.dom.editorTable;
    var rows = table.querySelectorAll('tbody tr');
    for (var i = 0; i < rows.length; i++) {
      var cell = rows[i].querySelector('td:first-child');
      if (cell && (cell.getAttribute('title') === key || cell.textContent === key)) {
        if (isLoading) {
          rows[i].classList.add('search-loading');
        } else {
          rows[i].classList.remove('search-loading');
        }
        break;
      }
    }
  }

  // ── Batch Search Progress Display ──
  function showSearchProgress(progress) {
    var section = App.dom.searchProgressSection;
    if (!progress || progress.status === 'idle') {
      section.style.display = 'none';
      return;
    }
    section.style.display = 'block';
    var pct = progress.total === 0 ? 100 : Math.round((progress.completed / progress.total) * 100);
    App.dom.searchProgressBar.style.width = pct + '%';
    App.dom.searchProgressLabel.textContent = pct + '%';
    App.dom.searchProgressText.textContent = App.t('searchProgressSearching', progress.completed, progress.total);
    App.dom.searchProgressCount.textContent = '';
  }

  function hideSearchProgress() {
    App.dom.searchProgressSection.style.display = 'none';
  }

  App.showSearchContextMenu = showSearchContextMenu;
  App.dismissContextMenu = dismissContextMenu;
  App.getActiveContextMenuKey = getActiveContextMenuKey;
  App.initSearchUI = initSearchUI;
  App.setRowSearchLoading = setRowSearchLoading;
  App.showSearchProgress = showSearchProgress;
  App.hideSearchProgress = hideSearchProgress;

  // ── Mode Toggle ──
  function initModeToggle() {
    var saved = localStorage.getItem('translate_mode');
    var mode = saved === 'precise' ? 'precise' : 'quick';
    App.setState({ translateMode: mode });
    App.dom.modeQuick.classList.toggle('mode-btn--active', mode === 'quick');
    App.dom.modePrecise.classList.toggle('mode-btn--active', mode === 'precise');
    if (!App.getState().bitbucketConnected) {
      App.dom.modePrecise.disabled = true;
      App.dom.modePrecise.title = App.t('modePreciseDisabled');
    }
    updateDeeplWarning();
  }

  function setTranslateMode(mode) {
    if (mode === 'precise' && !App.getState().bitbucketConnected) return;
    App.setState({ translateMode: mode });
    localStorage.setItem('translate_mode', mode);
    App.dom.modeQuick.classList.toggle('mode-btn--active', mode === 'quick');
    App.dom.modePrecise.classList.toggle('mode-btn--active', mode === 'precise');
    updateDeeplWarning();
  }

  function updateDeeplWarning() {
    var s = App.getState();
    var show = s.translateMode === 'precise' && s.provider === 'deepl';
    App.dom.deeplWarning.style.display = show ? 'block' : 'none';
  }

  function updatePreciseButtonState() {
    var connected = App.getState().bitbucketConnected;
    App.dom.modePrecise.disabled = !connected;
    App.dom.modePrecise.title = connected ? '' : App.t('modePreciseDisabled');
    if (!connected && App.getState().translateMode === 'precise') {
      setTranslateMode('quick');
    }
  }

  // ── Stepper UI ──
  function showStepper() {
    App.dom.progressStepper.style.display = 'flex';
    var steps = App.dom.progressStepper.querySelectorAll('.stepper-step');
    for (var i = 0; i < steps.length; i++) {
      steps[i].classList.remove('stepper-step--active');
      steps[i].classList.remove('stepper-step--done');
      steps[i].querySelector('.stepper-indicator').textContent = '\u25CB';
    }
  }

  function hideStepper() {
    App.dom.progressStepper.style.display = 'none';
    App.setState({ currentStep: null });
  }

  function updateStepper(activeStep) {
    App.setState({ currentStep: activeStep });
    var stepOrder = ['search', 'generate', 'translate'];
    var activeIndex = stepOrder.indexOf(activeStep);
    var steps = App.dom.progressStepper.querySelectorAll('.stepper-step');
    for (var i = 0; i < steps.length; i++) {
      var stepName = steps[i].getAttribute('data-step');
      var idx = stepOrder.indexOf(stepName);
      var indicator = steps[i].querySelector('.stepper-indicator');
      if (idx < activeIndex) {
        steps[i].classList.add('stepper-step--done');
        steps[i].classList.remove('stepper-step--active');
        indicator.textContent = '\u2713';
      } else if (idx === activeIndex) {
        steps[i].classList.add('stepper-step--active');
        steps[i].classList.remove('stepper-step--done');
        indicator.textContent = '\u25CF';
      } else {
        steps[i].classList.remove('stepper-step--active');
        steps[i].classList.remove('stepper-step--done');
        indicator.textContent = '\u25CB';
      }
    }
  }

  function completeStepper() {
    var steps = App.dom.progressStepper.querySelectorAll('.stepper-step');
    for (var i = 0; i < steps.length; i++) {
      steps[i].classList.add('stepper-step--done');
      steps[i].classList.remove('stepper-step--active');
      steps[i].querySelector('.stepper-indicator').textContent = '\u2713';
    }
  }

  function markFailedCells(failedKeys) {
    var table = App.dom.editorTable;
    var headerCells = table.querySelectorAll('thead th');
    var langMap = [];
    for (var h = 0; h < headerCells.length; h++) {
      langMap.push(headerCells[h].textContent.toLowerCase());
    }

    var rows = table.querySelectorAll('tbody tr');
    for (var r = 0; r < rows.length; r++) {
      var keyCell = rows[r].children[0];
      var rowKey = keyCell.getAttribute('title') || keyCell.textContent;
      for (var f = 0; f < failedKeys.length; f++) {
        if (failedKeys[f].key !== rowKey) continue;
        var colIdx = langMap.indexOf(failedKeys[f].lang);
        if (colIdx === -1) continue;
        var td = rows[r].children[colIdx];
        if (td) {
          td.classList.add('cell-error');
          td.title = failedKeys[f].error;
          td.textContent = App.t('cellFailed');
        }
      }
    }
  }

  function showRetryButton(count) {
    App.dom.retryCount.textContent = App.t('retryCount', count);
    App.dom.retrySection.style.display = 'flex';
  }

  function hideRetryButton() {
    App.dom.retrySection.style.display = 'none';
  }

  App.showStepper = showStepper;
  App.hideStepper = hideStepper;
  App.updateStepper = updateStepper;
  App.completeStepper = completeStepper;
  App.markFailedCells = markFailedCells;
  App.showRetryButton = showRetryButton;
  App.hideRetryButton = hideRetryButton;

  App.initModeToggle = initModeToggle;
  App.setTranslateMode = setTranslateMode;
  App.updateDeeplWarning = updateDeeplWarning;
  App.updatePreciseButtonState = updatePreciseButtonState;

  // ── Context Panel Accordion ──

  function buildPanelHTML(key, cached) {
    var html = '<div class="context-panel">';
    html += '<div class="context-panel-key-title">' + escapeHtml(key) + '</div>';
    var hasContext = cached && cached.matches && cached.matches.length > 0;

    if (!hasContext) {
      html += '<div class="context-panel-empty">' + App.t('contextPanelEmpty') + '</div>';
    } else {
      // Code snippet section -- first match only
      var first = cached.matches[0];
      html += '<div class="context-panel-snippet">';
      html += '<div class="context-panel-file">&#128196; ' + escapeHtml(first.file) + ':' + first.line + '</div>';
      html += '<pre class="context-panel-code">' + escapeHtml(first.snippet) + '</pre>';
      if (cached.matches.length > 1) {
        html += '<button class="context-panel-more" data-key="' + escapeHtml(key).replace(/"/g, '&quot;') + '">'
          + App.t('contextPanelMore', cached.matches.length - 1) + '</button>';
      }
      html += '</div>';

      // AI description section
      html += '<div class="context-panel-description">';
      if (cached.description) {
        html += '<span class="context-panel-desc-icon">&#128161;</span> ' + escapeHtml(cached.description);
      } else {
        html += '<span class="context-panel-no-desc">' + App.t('contextPanelNoDesc') + '</span>';
      }
      html += '</div>';
    }

    // Translation fields (all languages including EN)
    var s = App.getState();
    var jsonData = s.jsonData;
    if (jsonData) {
      var allLangs = ['en'].concat(Object.keys(jsonData).filter(function (k) { return k !== 'en'; }).sort());
      if (allLangs.length > 0) {
        html += '<div class="context-panel-translations">';
        for (var i = 0; i < allLangs.length; i++) {
          var lang = allLangs[i];
          var val = (jsonData[lang] && jsonData[lang][key] !== undefined) ? jsonData[lang][key] : '';
          var escapedVal = escapeHtml(String(val)).replace(/"/g, '&quot;');
          var escapedKey = escapeHtml(key).replace(/"/g, '&quot;');

          // Determine input color state
          var isEdited = s.editedCells.has(key + '::' + lang);
          var isAiTranslated = s.aiTranslatedCells.has(lang + ':' + key);
          var inputCls = 'context-panel-input';
          if (isAiTranslated) { inputCls += ' context-panel-input-ai'; }
          else if (isEdited) { inputCls += ' context-panel-input-edited'; }

          // Check if revert should be disabled
          var importedData = s.importedJsonData;
          var importedVal = (importedData && importedData[lang] && importedData[lang][key] !== undefined) ? importedData[lang][key] : '';
          var revertDisabled = (String(val) === String(importedVal)) ? ' disabled' : '';

          html += '<div class="context-panel-lang-row">';
          html += '<label>' + escapeHtml(lang.toUpperCase()) + '</label>';
          html += '<input type="text" class="' + inputCls + '" data-lang="' + escapeHtml(lang) + '" data-key="' + escapedKey + '" data-original="' + escapedVal + '" value="' + escapedVal + '">';
          html += '<div class="context-panel-actions">';
          html += '<button class="context-panel-save" data-lang="' + escapeHtml(lang) + '" data-key="' + escapedKey + '" disabled>' + App.t('cellEditSave') + '</button>';
          html += '<button class="context-panel-revert" data-lang="' + escapeHtml(lang) + '" data-key="' + escapedKey + '"' + revertDisabled + '>' + App.t('cellEditRevert') + '</button>';
          html += '<button class="context-panel-ai-translate" data-lang="' + escapeHtml(lang) + '" data-key="' + escapedKey + '">' + App.t('cellEditAiTranslate') + '</button>';
          html += '</div>';
          html += '</div>';
        }
        html += '</div>';
      }
    }

    html += '</div>';
    return html;
  }

  function expandContextPanel(keyRow, key) {
    collapseCurrentPanel();

    var wrap = document.getElementById('editor-table-wrap');
    if (!wrap) return;

    // Create floating panel outside the table scroll container
    var panelDiv = document.createElement('div');
    panelDiv.className = 'context-panel-floating';
    panelDiv.setAttribute('data-panel-key', key);

    var cached = App.getContextCache().get(key);
    panelDiv.innerHTML = buildPanelHTML(key, cached);

    // Insert spacer row in table to push subsequent rows down
    var colCount = keyRow.children.length;
    var spacerTr = document.createElement('tr');
    spacerTr.className = 'context-panel-row';
    var spacerTd = document.createElement('td');
    spacerTd.colSpan = colCount;
    spacerTd.className = 'context-panel-spacer';
    spacerTr.appendChild(spacerTd);
    keyRow.parentNode.insertBefore(spacerTr, keyRow.nextSibling);

    // Insert panel right after the table wrap — it's in normal document flow,
    // so it's always fully visible regardless of table horizontal scroll.
    wrap.parentNode.insertBefore(panelDiv, wrap.nextSibling);

    // Enable/disable save button based on input changes
    panelDiv.addEventListener('input', function (evt) {
      var inp = evt.target.closest('.context-panel-input');
      if (!inp) return;
      var langRow = inp.closest('.context-panel-lang-row');
      var sBtn = langRow ? langRow.querySelector('.context-panel-save') : null;
      if (sBtn) {
        sBtn.disabled = (inp.value === inp.getAttribute('data-original'));
      }
    });

    // Scroll key row into view so user sees both the row and the panel
    requestAnimationFrame(function () {
      keyRow.scrollIntoView({ block: 'nearest' });
    });

    App.setState({ expandedPanelKey: key });
    keyRow.classList.add('context-panel-expanded');
  }

  function collapseCurrentPanel() {
    // Remove floating panel
    var floatingPanel = document.querySelector('.context-panel-floating');
    if (floatingPanel) {
      floatingPanel.parentNode.removeChild(floatingPanel);
    }

    // Remove spacer row from table
    var existing = App.dom.editorTable.querySelector('.context-panel-row');
    if (existing) {
      if (existing.previousElementSibling) {
        existing.previousElementSibling.classList.remove('context-panel-expanded');
      }
      existing.parentNode.removeChild(existing);
      App.setState({ expandedPanelKey: null });
    }
  }

  function toggleContextPanel(keyRow, key) {
    var s = App.getState();
    if (s.expandedPanelKey === key) {
      collapseCurrentPanel();
    } else {
      expandContextPanel(keyRow, key);
    }
  }

  // Panel event delegation -- save, revert, AI translate, show-more buttons
  // Uses document because the floating panel is outside the table element
  document.addEventListener('click', function (e) {
    // Only handle clicks inside floating panel
    if (!e.target.closest('.context-panel-floating')) return;

    var saveBtn = e.target.closest('.context-panel-save');
    if (saveBtn) {
      var lang = saveBtn.getAttribute('data-lang');
      var key = saveBtn.getAttribute('data-key');
      if (!lang || !key) return;

      // Find sibling input with matching data-lang and data-key
      var row = saveBtn.closest('.context-panel-lang-row');
      var input = row ? row.querySelector('.context-panel-input[data-lang="' + lang + '"]') : null;
      if (!input) return;

      var newVal = input.value;

      // Immutable state update with editedCells tracking
      var curS = App.getState();
      var newJsonData = JSON.parse(JSON.stringify(curS.jsonData));
      if (!newJsonData[lang]) { newJsonData[lang] = {}; }

      var cellKey = key + '::' + lang;
      var newEditedCells = new Map(curS.editedCells);
      if (!newEditedCells.has(cellKey)) {
        newEditedCells.set(cellKey, newJsonData[lang][key] !== undefined ? newJsonData[lang][key] : '');
      }

      newJsonData[lang][key] = newVal;
      App.setState({ jsonData: newJsonData, editedCells: newEditedCells });

      // Update input style to reflect edited state
      input.classList.remove('context-panel-input-ai');
      input.classList.add('context-panel-input-edited');

      // Update revert button state
      var revertBtn = row.querySelector('.context-panel-revert');
      if (revertBtn) {
        var impData = App.getState().importedJsonData;
        var impVal = (impData && impData[lang] && impData[lang][key] !== undefined) ? impData[lang][key] : '';
        revertBtn.disabled = (String(newVal) === String(impVal));
      }

      // Update the corresponding table cell directly without full re-render
      var tableRows = App.dom.editorTable.querySelectorAll('tbody tr:not(.context-panel-row)');
      for (var ri = 0; ri < tableRows.length; ri++) {
        var kCell = tableRows[ri].children[0];
        if (kCell && (kCell.getAttribute('title') === key || kCell.textContent === key)) {
          var sNow = App.getState();
          var langs = ['en'].concat(Object.keys(sNow.jsonData).filter(function (k) { return k !== 'en'; }).sort());
          var langIdx = langs.indexOf(lang);
          if (langIdx !== -1) {
            var targetCell = tableRows[ri].children[langIdx + 1]; // +1 for key column
            if (targetCell) {
              targetCell.textContent = newVal;
              targetCell.setAttribute('title', newVal);
              targetCell.classList.add('cell-edited');
              targetCell.classList.remove('ai-translated');
              if (newVal) {
                targetCell.classList.remove('empty-cell');
              }
            }
          }
          break;
        }
      }

      // Disable save button and update original value
      saveBtn.disabled = true;
      input.setAttribute('data-original', newVal);

      showToast(App.t('cellEditSuccess'), 'success');
      return;
    }

    var revertBtn = e.target.closest('.context-panel-revert');
    if (revertBtn) {
      var rLang = revertBtn.getAttribute('data-lang');
      var rKey = revertBtn.getAttribute('data-key');
      if (!rLang || !rKey) return;

      var row = revertBtn.closest('.context-panel-lang-row');
      var input = row ? row.querySelector('.context-panel-input[data-lang="' + rLang + '"]') : null;
      if (!input) return;

      // Get imported (original) value
      var curS = App.getState();
      var importedData = curS.importedJsonData;
      var originalVal = (importedData && importedData[rLang] && importedData[rLang][rKey] !== undefined) ? importedData[rLang][rKey] : '';
      input.value = originalVal;

      // Also save immediately and remove edited/ai tracking
      var newJsonData = JSON.parse(JSON.stringify(curS.jsonData));
      if (!newJsonData[rLang]) { newJsonData[rLang] = {}; }
      newJsonData[rLang][rKey] = originalVal;

      var newEditedCells = new Map(curS.editedCells);
      newEditedCells.delete(rKey + '::' + rLang);
      var newAiCells = new Set(curS.aiTranslatedCells);
      newAiCells.delete(rLang + ':' + rKey);
      App.setState({ jsonData: newJsonData, editedCells: newEditedCells, aiTranslatedCells: newAiCells });

      // Update input style — remove edited/ai state
      input.classList.remove('context-panel-input-edited', 'context-panel-input-ai');

      // Disable revert button (now matches imported)
      revertBtn.disabled = true;

      // Update table cell
      var tableRows = App.dom.editorTable.querySelectorAll('tbody tr:not(.context-panel-row)');
      for (var ri = 0; ri < tableRows.length; ri++) {
        var kCell = tableRows[ri].children[0];
        if (kCell && (kCell.getAttribute('title') === rKey || kCell.textContent === rKey)) {
          var sNow = App.getState();
          var langs = ['en'].concat(Object.keys(sNow.jsonData).filter(function (k) { return k !== 'en'; }).sort());
          var langIdx = langs.indexOf(rLang);
          if (langIdx !== -1 && tableRows[ri].children[langIdx + 1]) {
            var tc = tableRows[ri].children[langIdx + 1];
            tc.textContent = originalVal;
            tc.setAttribute('title', originalVal);
            tc.classList.remove('cell-edited', 'ai-translated');
            if (!originalVal) { tc.classList.add('empty-cell'); }
          }
          break;
        }
      }

      // Update data-original and disable save
      input.setAttribute('data-original', originalVal);
      var rSaveBtn = row.querySelector('.context-panel-save');
      if (rSaveBtn) { rSaveBtn.disabled = true; }

      showToast(App.t('cellEditRevertSuccess'), 'success');
      return;
    }

    var aiBtn = e.target.closest('.context-panel-ai-translate');
    if (aiBtn) {
      var aLang = aiBtn.getAttribute('data-lang');
      var aKey = aiBtn.getAttribute('data-key');
      if (!aLang || !aKey) return;
      if (!App.getState().apiKey) {
        showToast(App.t('testApiKeyNoKey'), 'error');
        return;
      }

      var sourceText = App.getState().jsonData.en ? (App.getState().jsonData.en[aKey] || '') : '';
      if (!sourceText) return;

      var aRow = aiBtn.closest('.context-panel-lang-row');
      var aInput = aRow ? aRow.querySelector('.context-panel-input[data-lang="' + aLang + '"]') : null;

      // Loading state
      var origText = aiBtn.textContent;
      aiBtn.disabled = true;
      aiBtn.textContent = App.t('cellEditAiTranslating');

      App.translateSingleText(sourceText, aLang).then(function (translated) {
        if (aInput) {
          aInput.value = translated;
          // Update input style to reflect AI translated state
          aInput.classList.remove('context-panel-input-edited');
          aInput.classList.add('context-panel-input-ai');
        }

        // Auto-save to state
        var curS = App.getState();
        var newJsonData = JSON.parse(JSON.stringify(curS.jsonData));
        if (!newJsonData[aLang]) { newJsonData[aLang] = {}; }
        newJsonData[aLang][aKey] = translated;

        var newAiCells = new Set(curS.aiTranslatedCells);
        newAiCells.add(aLang + ':' + aKey);
        App.setState({ jsonData: newJsonData, aiTranslatedCells: newAiCells });

        // Update save button — disable and set new original
        var aRowForBtns = aiBtn.closest('.context-panel-lang-row');
        var aSaveBtn = aRowForBtns ? aRowForBtns.querySelector('.context-panel-save') : null;
        if (aSaveBtn) { aSaveBtn.disabled = true; }
        if (aInput) { aInput.setAttribute('data-original', translated); }

        // Update revert button state
        var aRevertBtn = aRowForBtns ? aRowForBtns.querySelector('.context-panel-revert') : null;
        if (aRevertBtn) {
          var impData = App.getState().importedJsonData;
          var impVal = (impData && impData[aLang] && impData[aLang][aKey] !== undefined) ? impData[aLang][aKey] : '';
          aRevertBtn.disabled = (String(translated) === String(impVal));
        }

        // Update table cell
        var tableRows = App.dom.editorTable.querySelectorAll('tbody tr:not(.context-panel-row)');
        for (var ri = 0; ri < tableRows.length; ri++) {
          var kCell = tableRows[ri].children[0];
          if (kCell && (kCell.getAttribute('title') === aKey || kCell.textContent === aKey)) {
            var sNow = App.getState();
            var langs = ['en'].concat(Object.keys(sNow.jsonData).filter(function (k) { return k !== 'en'; }).sort());
            var langIdx = langs.indexOf(aLang);
            if (langIdx !== -1 && tableRows[ri].children[langIdx + 1]) {
              var tc = tableRows[ri].children[langIdx + 1];
              tc.textContent = translated;
              tc.setAttribute('title', translated);
              tc.classList.remove('empty-cell', 'cell-edited');
              tc.classList.add('ai-translated');
            }
            break;
          }
        }

        showToast(App.t('cellEditSuccess'), 'success');
      }).catch(function (err) {
        showToast(App.t('cellTranslateError', err.message), 'error');
      }).finally(function () {
        aiBtn.disabled = false;
        aiBtn.textContent = origText;
      });
      return;
    }

    var moreBtn = e.target.closest('.context-panel-more');
    if (moreBtn) {
      var moreKey = moreBtn.getAttribute('data-key');
      if (!moreKey) return;

      var cachedData = App.getContextCache().get(moreKey);
      if (!cachedData || !cachedData.matches) return;

      var snippetDiv = moreBtn.closest('.context-panel-snippet');
      if (!snippetDiv) return;

      // Render all matches
      var allHtml = '';
      for (var m = 0; m < cachedData.matches.length; m++) {
        var match = cachedData.matches[m];
        allHtml += '<div class="context-panel-file">&#128196; ' + escapeHtml(match.file) + ':' + match.line + '</div>';
        allHtml += '<pre class="context-panel-code">' + escapeHtml(match.snippet) + '</pre>';
      }
      snippetDiv.innerHTML = allHtml;
      return;
    }
  });

  App.toggleContextPanel = toggleContextPanel;
  App.collapseCurrentPanel = collapseCurrentPanel;
  App.buildPanelHTML = buildPanelHTML;
})();
