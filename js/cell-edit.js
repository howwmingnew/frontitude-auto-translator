(function () {
  'use strict';
  var App = window.App;

  // ── Cell Click Interaction ──
  var cellTranslatingKeys = {}; // track cells currently being translated

  // ── Edit Modal ──
  var editModalState = { key: null, lang: null };

  function getImportedValue(key, lang) {
    var s = App.getState();
    return (s.importedJsonData && s.importedJsonData[lang])
      ? (s.importedJsonData[lang][key] || '')
      : '';
  }

  function updateRevertBtn() {
    var key = editModalState.key;
    var lang = editModalState.lang;
    if (!key || !lang) { App.dom.cellEditRevert.disabled = true; return; }
    var importedVal = getImportedValue(key, lang);
    App.dom.cellEditRevert.disabled = App.dom.cellEditTextarea.value === importedVal;
  }

  function openEditModal(key, lang, value, sourceText, isSourceEdit) {
    editModalState = { key: key, lang: lang };
    App.dom.cellEditTitle.textContent = App.t('cellEditTitle');

    var sourceBlock = App.dom.cellEditSourceLabel.parentElement;
    if (isSourceEdit) {
      App.dom.cellEditMeta.textContent = key + ' \u2014 ' + App.t('cellEditSourceCurrent');
      sourceBlock.style.display = 'none';
    } else {
      App.dom.cellEditMeta.textContent = key + ' \u2014 ' + lang.toUpperCase();
      sourceBlock.style.display = '';
      App.dom.cellEditSourceLabel.textContent = App.t('cellEditSource');
      App.dom.cellEditSource.textContent = sourceText || '';
    }

    App.dom.cellEditTextarea.value = value || '';

    // Context description from cache
    var cachedCtx = App.getContextCache().get(key);
    var ctxDesc = cachedCtx && cachedCtx.description ? cachedCtx.description : '';
    if (ctxDesc) {
      App.dom.cellEditContext.style.display = '';
      App.dom.cellEditContextText.textContent = ctxDesc;
    } else {
      App.dom.cellEditContext.style.display = 'none';
      App.dom.cellEditContextText.textContent = '';
    }

    // Revert button: enabled if textarea differs from imported value
    updateRevertBtn();

    // AI Translate button: hidden for source lang, disabled without API key
    if (isSourceEdit) {
      App.dom.cellEditAiTranslate.style.display = 'none';
    } else {
      App.dom.cellEditAiTranslate.style.display = '';
      App.dom.cellEditAiTranslate.disabled = !App.getState().apiKey;
    }

    App.dom.cellEditOverlay.classList.add('active');
    App.dom.cellEditTextarea.focus();
  }

  function closeEditModal() {
    App.dom.cellEditOverlay.classList.remove('active');
    editModalState = { key: null, lang: null };
    // Reset source block visibility
    App.dom.cellEditSourceLabel.parentElement.style.display = '';
  }

  function handleCellEdit(td, key, lang, currentVal) {
    if (!confirm(App.t('cellEditConfirm'))) return;
    var isSourceEdit = (lang === 'en');
    var sourceText = isSourceEdit ? '' : (App.getState().jsonData.en[key] || '');
    openEditModal(key, lang, currentVal, sourceText, isSourceEdit);
  }

  // ── Single text translation helper ──
  async function translateSingleText(text, targetLang, context) {
    var contexts = context ? [context] : undefined;
    var results = await App.callTranslateAPI([text], targetLang, contexts);
    return results[0];
  }

  // ── Click-to-Translate (untranslated cell) ──
  async function handleCellTranslate(td, key, lang) {
    if (!App.getState().apiKey) {
      App.showToast(App.t('testApiKeyNoKey'), 'error');
      return;
    }

    var cellId = lang + ':' + key;
    if (cellTranslatingKeys[cellId]) return; // already translating
    cellTranslatingKeys[cellId] = true;

    // Show loading state
    td.classList.add('cell-loading');
    td.textContent = App.t('cellTranslating');

    var sourceText = App.getState().jsonData.en[key];

    try {
      var translated = await translateSingleText(sourceText, lang);

      // Immutable update
      var newJsonData = JSON.parse(JSON.stringify(App.getState().jsonData));
      if (!newJsonData[lang]) {
        newJsonData[lang] = {};
      }
      newJsonData[lang][key] = translated;
      var newAiCells = new Set(App.getState().aiTranslatedCells);
      newAiCells.add(lang + ':' + key);
      App.setState({ jsonData: newJsonData, aiTranslatedCells: newAiCells });
      App.renderEditorTable();
      App.showToast(App.t('cellTranslateSuccess'), 'success');
    } catch (err) {
      td.classList.remove('cell-loading');
      td.textContent = '\u2014';
      td.classList.add('empty-cell');
      App.showToast(App.t('cellTranslateError', err.message), 'error');
    } finally {
      delete cellTranslatingKeys[cellId];
    }
  }

  function initCellEditEvents() {
    App.dom.cellEditTextarea.addEventListener('input', updateRevertBtn);

    App.dom.cellEditCancel.addEventListener('click', closeEditModal);

    App.dom.cellEditOverlay.addEventListener('mousedown', function (e) {
      if (e.target === App.dom.cellEditOverlay) e.preventDefault();
    });

    App.dom.cellEditSave.addEventListener('click', function () {
      var key = editModalState.key;
      var lang = editModalState.lang;
      if (!key || !lang) return;

      var newVal = App.dom.cellEditTextarea.value;

      // Immutable update
      var s = App.getState();
      var newJsonData = JSON.parse(JSON.stringify(s.jsonData));
      if (!newJsonData[lang]) {
        newJsonData[lang] = {};
      }

      // Track edited cell -- record original value only on first edit
      var cellKey = key + '::' + lang;
      var newEditedCells = new Map(s.editedCells);
      if (!newEditedCells.has(cellKey)) {
        newEditedCells.set(cellKey, newJsonData[lang][key] !== undefined ? newJsonData[lang][key] : '');
      }

      newJsonData[lang][key] = newVal;
      App.setState({ jsonData: newJsonData, editedCells: newEditedCells });
      App.renderEditorTable();
      closeEditModal();
      App.showToast(App.t('cellEditSuccess'), 'success');
    });

    // ── Revert button handler ──
    App.dom.cellEditRevert.addEventListener('click', function () {
      var key = editModalState.key;
      var lang = editModalState.lang;
      if (!key || !lang) return;

      var originalVal = getImportedValue(key, lang);
      App.dom.cellEditTextarea.value = originalVal;
      updateRevertBtn();
      App.dom.cellEditTextarea.focus();
    });

    // ── AI Translate button handler (in Edit Modal) ──
    App.dom.cellEditAiTranslate.addEventListener('click', async function () {
      var key = editModalState.key;
      var lang = editModalState.lang;
      if (!key || !lang) return;
      if (!App.getState().apiKey) {
        App.showToast(App.t('testApiKeyNoKey'), 'error');
        return;
      }

      var sourceText = App.getState().jsonData.en ? (App.getState().jsonData.en[key] || '') : '';
      if (!sourceText) return;

      // Loading state
      var btn = App.dom.cellEditAiTranslate;
      var originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = App.t('cellEditAiTranslating');

      try {
        var cachedCtx = App.getContextCache().get(key);
        var ctxDesc = (cachedCtx && cachedCtx.description) || '';
        var translated = await translateSingleText(sourceText, lang, ctxDesc);
        App.dom.cellEditTextarea.value = translated;
      } catch (err) {
        App.showToast(App.t('cellTranslateError', err.message), 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = originalText;
      }
    });

    // ── Table click handler ──
    App.dom.editorTable.addEventListener('click', function (e) {
      // Skip clicks inside context panel accordion rows
      if (e.target.closest('.context-panel-row')) return;

      // Guard: ignore text selection
      var sel = window.getSelection();
      if (sel && sel.toString().length > 0) return;

      var td = e.target.closest('td');
      if (!td) return;

      var tr = td.closest('tr');
      if (!tr || !tr.parentElement || tr.parentElement.tagName !== 'TBODY') return;

      // Determine column index (0 = Key, 1+ = languages)
      var cells = Array.prototype.slice.call(tr.children);
      var colIndex = cells.indexOf(td);
      if (colIndex === 0) {
        // Key column click -- toggle context panel accordion
        var keyCell = tr.children[0];
        var key = keyCell.getAttribute('title') || keyCell.textContent;
        App.toggleContextPanel(tr, key);
        return;
      }

      // Build langs array matching table columns
      var s = App.getState();
      var langs = ['en'].concat(
        Object.keys(s.jsonData).filter(function (k) { return k !== 'en'; }).sort()
      );
      var lang = langs[colIndex - 1]; // -1 because column 0 is Key
      if (!lang) return;

      // Get the key from the first cell of this row
      var keyCell = tr.children[0];
      var key = keyCell.getAttribute('title') || keyCell.textContent;

      var currentVal = s.jsonData[lang] ? s.jsonData[lang][key] : undefined;
      var isEmpty = currentVal === undefined || currentVal === '';

      if (lang === 'en') {
        // English source editing
        if (isEmpty) {
          openEditModal(key, lang, '', '', true);
        } else {
          handleCellEdit(td, key, lang, currentVal);
        }
      } else if (isEmpty) {
        handleCellTranslate(td, key, lang);
      } else {
        handleCellEdit(td, key, lang, currentVal);
      }
    });
  }

  App.openCellEditModal = openEditModal;
  App.closeEditModal = closeEditModal;
  App.translateSingleText = translateSingleText;
  App.initCellEditEvents = initCellEditEvents;
})();
