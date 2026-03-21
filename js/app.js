(function () {
  'use strict';
  var App = window.App;

  function init() {
    // ── Theme ──
    var theme = App.getPreferredTheme();
    App.applyTheme(theme);

    // ── UI language ──
    var saved = localStorage.getItem('ui_lang');
    if (saved && App.UI_TRANSLATIONS[saved]) {
      App.setState({ uiLang: saved });
    } else {
      var browserLang = (navigator.language || '').toLowerCase();
      if (browserLang.indexOf('zh') === 0) {
        App.setState({ uiLang: 'zh-TW' });
      } else if (browserLang.indexOf('ko') === 0) {
        App.setState({ uiLang: 'ko' });
      }
    }
    App.applyI18n();

    // ── Context prompt ──
    var savedPrompt = localStorage.getItem('translate_context_prompt');
    if (savedPrompt !== null) {
      App.dom.contextPrompt.value = savedPrompt;
      App.setState({ contextPrompt: savedPrompt });
    } else {
      var defaultVal = App.t('defaultContextPrompt');
      App.dom.contextPrompt.value = defaultVal;
      App.setState({ contextPrompt: defaultVal });
    }

    // ── Provider ──
    App.initProvider();
    App.initBitbucket();
    App.initSearchUI();
    App.initModeToggle();

    // ── Collapsible sections ──
    App.initCollapsible(App.dom.providerCollapsible, App.dom.providerCollapsibleBody, 'collapse_provider');
    App.initCollapsible(App.dom.langCollapsible, App.dom.langCollapsibleBody, 'collapse_lang');

    // ── Cell edit events ──
    App.initCellEditEvents();

    // ── Mode toggle events ──
    App.dom.modeQuick.addEventListener('click', function () { App.setTranslateMode('quick'); });
    App.dom.modePrecise.addEventListener('click', function () { App.setTranslateMode('precise'); });

    // ── Event listeners ──

    // Theme toggle
    App.dom.themeToggle.addEventListener('click', function () {
      var s = App.getState();
      var next = s.theme === 'dark' ? 'light' : 'dark';
      App.applyTheme(next);
      localStorage.setItem('translate_theme', next);
    });

    // Sidebar toggle
    App.dom.sidebarToggle.addEventListener('click', function () {
      if (App.dom.sidebarDrawer.classList.contains('open')) {
        App.closeDrawer();
      } else {
        App.openDrawer();
      }
    });

    App.dom.sidebarOverlay.addEventListener('click', function () {
      App.closeDrawer();
    });

    // Provider change
    App.dom.providerSelect.addEventListener('change', function () {
      var provider = App.dom.providerSelect.value;
      localStorage.setItem('translate_provider', provider);
      App.setState({ provider: provider });
      App.applyProviderUI(provider);
      App.loadProviderKey(provider);
      App.loadProviderModel(provider);
      App.updateTranslateBtn();
      App.updateTestKeyBtn();
      App.updateDeeplWarning();
    });

    // Model change
    App.dom.modelSelect.addEventListener('change', function () {
      var model = App.dom.modelSelect.value;
      App.setState({ model: model });
      App.persistModel(model);
    });

    // API key input
    App.dom.apiKey.addEventListener('input', function () {
      var key = App.dom.apiKey.value.trim();
      App.setState({ apiKey: key });
      App.updateKeyBadge(key);
      App.persistApiKey(key);
      App.updateTranslateBtn();
      App.updateTestKeyBtn();
    });

    // Remember key checkbox
    App.dom.rememberKey.addEventListener('change', function () {
      if (App.dom.rememberKey.checked) {
        App.persistApiKey(App.getState().apiKey);
      } else {
        localStorage.removeItem(App.storageKeyForProvider(App.getState().provider));
        App.dom.clearKey.style.display = 'none';
      }
    });

    // Clear key button
    App.dom.clearKey.addEventListener('click', function () {
      localStorage.removeItem(App.storageKeyForProvider(App.getState().provider));
      App.dom.apiKey.value = '';
      App.dom.rememberKey.checked = false;
      App.dom.clearKey.style.display = 'none';
      App.setState({ apiKey: '' });
      App.updateKeyBadge('');
      App.updateTranslateBtn();
      App.updateTestKeyBtn();
    });

    // Context prompt
    App.dom.contextPrompt.addEventListener('input', function () {
      App.setState({ contextPrompt: App.dom.contextPrompt.value });
      localStorage.setItem('translate_context_prompt', App.dom.contextPrompt.value);
    });

    // Re-select JSON button
    App.dom.reselectBtn.addEventListener('click', function () {
      App.setState({ jsonData: null, importedJsonData: null, languages: [], selected: new Set(), editedCells: new Map(), fullyTranslatedLangs: new Set(), aiTranslatedCells: new Set(), originalTranslations: {} });
      App.clearContextCache();
      App.hideSearchProgress();
      App.dom.fileInput.value = '';
      App.dom.fileInfo.style.display = 'none';
      App.dom.uploadError.style.display = 'none';
      App.dom.editorSection.style.display = 'none';
      App.closeDrawer();
      App.dom.sidebarToggle.style.display = 'none';
      App.dom.progressSection.style.display = 'none';
      App.dom.translateError.style.display = 'none';

      App.dom.uploadCard.style.display = '';
      App.dom.container.classList.remove('container--wide');
    });

    // File upload
    App.dom.dropzone.addEventListener('click', function () {
      App.dom.fileInput.click();
    });

    App.dom.dropzone.addEventListener('dragover', function (e) {
      e.preventDefault();
      App.dom.dropzone.classList.add('dragover');
    });

    App.dom.dropzone.addEventListener('dragleave', function () {
      App.dom.dropzone.classList.remove('dragover');
    });

    App.dom.dropzone.addEventListener('drop', function (e) {
      e.preventDefault();
      App.dom.dropzone.classList.remove('dragover');
      var files = e.dataTransfer.files;
      if (files.length > 0) {
        App.handleFile(files[0]);
      }
    });

    App.dom.fileInput.addEventListener('change', function () {
      if (App.dom.fileInput.files.length > 0) {
        App.handleFile(App.dom.fileInput.files[0]);
      }
    });

    // Editor search
    App.dom.editorSearch.addEventListener('input', function () {
      App.renderEditorTable();
    });

    // Select All / None
    App.dom.selectAll.addEventListener('click', function () {
      App.setState({ selected: new Set(App.getState().languages) });
      App.renderLanguages();
      App.updateTranslateBtn();
    });

    App.dom.selectNone.addEventListener('click', function () {
      App.setState({ selected: new Set() });
      App.renderLanguages();
      App.updateTranslateBtn();
    });

    // Translate button
    App.dom.translateBtn.addEventListener('click', function () {
      if (App.getState().translating) return;
      App.showTranslateConfirm();
    });

    // Translate confirmation modal
    App.dom.translateConfirmCancel.addEventListener('click', App.closeTranslateConfirm);
    App.dom.translateConfirmOverlay.addEventListener('click', function (e) {
      if (e.target === App.dom.translateConfirmOverlay) App.closeTranslateConfirm();
    });
    App.dom.translateConfirmOk.addEventListener('click', function () {
      App.closeTranslateConfirm();
      App.startTranslation();
    });

    // Export button
    App.dom.exportBtn.addEventListener('click', App.downloadJsonData);

    // Test API Key
    App.dom.testApiKeyBtn.addEventListener('click', function () {
      App.testApiKey();
    });

    // Language switcher
    document.getElementById('lang-switcher').addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-lang]');
      if (!btn) return;
      var lang = btn.getAttribute('data-lang');
      App.setState({ uiLang: lang });
      localStorage.setItem('ui_lang', lang);
      App.applyI18n();
    });

    // Escape key handlers
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (App.dom.contextMenu.style.display !== 'none') {
          App.dismissContextMenu();
        } else if (App.dom.cellEditOverlay.classList.contains('active')) {
          App.closeEditModal();
        } else if (App.dom.translateConfirmOverlay.classList.contains('active')) {
          App.closeTranslateConfirm();
        } else if (App.dom.sidebarDrawer.classList.contains('open')) {
          App.closeDrawer();
        }
      }
    });
  }

  App.init = init;
  init();
})();
