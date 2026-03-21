(function () {
  'use strict';

  window.App = window.App || {};

  var state = {
    uiLang: 'en',
    provider: 'deepl',
    model: '',
    apiKey: '',
    jsonData: null,
    languages: [],
    selected: new Set(),
    translating: false,
    contextPrompt: '',
    theme: 'light',
    editedCells: new Map(),
    fullyTranslatedLangs: new Set(),
    aiTranslatedCells: new Set(),
    originalTranslations: {},
    importedJsonData: null,
  };

  function setState(patch) {
    state = Object.assign({}, state, patch);
    App.state = state;
  }

  function getState() {
    return state;
  }

  var App = window.App;
  App.state = state;
  App.getState = getState;
  App.setState = setState;
})();
