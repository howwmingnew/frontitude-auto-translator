(function () {
  'use strict';
  var App = window.App;

  // ── UI Translations ──
  var UI_TRANSLATIONS = {
    en: {
      title: 'Frontitude One-Click Translator',
      subtitle: 'Upload your language.json, pick target languages, translate via DeepL / OpenAI / Gemini.',
      uploadTitle: 'Upload JSON',
      dropzoneText: 'Drag &amp; drop <strong>language.json</strong> here, or click to browse',
      contentPreview: 'Content Preview',
      searchPlaceholder: 'Search by key name...',
      providerTitle: 'Translation Provider',
      modelLabel: 'Model:',
      rememberKey: 'Remember key across sessions',
      clearSavedKey: 'Clear saved key',
      targetLangs: 'Target Languages',
      selectAll: 'Select All',
      selectNone: 'Select None',
      translateBtn: 'Translate',
      downloadBtn: 'Download language.json',
      noKey: 'No Key',
      free: 'Free',
      pro: 'Pro',
      fileInfo: 'Languages: en, {0}  |  Keys in "en": {1}',
      editorCount: '{0} of {1} keys',
      errJsonFile: 'Please upload a .json file.',
      errFileTooLarge: 'File is too large (max 5 MB).',
      errJsonParse: 'JSON parse error: {0}',
      errReadFile: 'Failed to read file. Please try again.',
      errInvalidFormat: 'Invalid format: expected an object with language codes as keys.',
      errMissingEn: 'Missing "en" key in the JSON. Source language must be English.',
      errNonString: 'Non-string values found in "en" for keys: {0}',
      errNonStringMore: ' (and {0} more)',
      progressTranslating: 'Translating {0} ({1}/{2} languages)...',
      progressDone: 'Done! All {0} language(s) translated.',
      progressTranslatedCount: 'Translated: {0} / {1} texts',
      errTimeout: 'API request timed out after {0}s. Please try again.',
      errReturnedCount: '{0} returned {1} translations but expected {2} for language {3}',
      errUnexpectedDeepL: 'Unexpected DeepL response format for language {0}',
      errUnexpectedResponse: '{0} returned unexpected response structure for language {1}',
      errInvalidJson: '{0} returned invalid JSON for language {1}: {2}',
      errApiError: '{0} API error {1}: {2}',
      deeplPlaceholder: 'Paste your DeepL API key here',
      deeplDisclaimer: 'Your API key is sent directly from your browser to DeepL and is visible in the browser Network tab. It is never sent to any other server.',
      openaiPlaceholder: 'Paste your OpenAI API key here (sk-...)',
      openaiDisclaimer: 'Your API key is sent directly from your browser to OpenAI and is visible in the browser Network tab. It is never sent to any other server.',
      geminiPlaceholder: 'Paste your Gemini API key here',
      geminiDisclaimer: 'Your API key is sent directly from your browser to Google and is visible in the browser Network tab (as a URL parameter). It is never sent to any other server.',
      contextPromptLabel: 'Context Prompt',
      contextPromptPlaceholder: 'e.g. dental implant software',
      contextPromptDeeplNote: 'Context prompt is only used with OpenAI and Gemini.',
      defaultContextPrompt: 'Multilingual translation for dental implant software UI',
      langFullyTranslated: 'Fully translated. Re-translating will overwrite all content.',
      modelFastLowCost: 'Fast, low cost',
      modelHighQuality: 'High quality',
      modelUltraFast: 'Ultra fast',
      modelEconomical: 'Economical',
      modelBalanced: 'Balanced',
      getApiKey: 'Get API Key',
      confirmTranslateTitle: 'Confirm Translation',
      confirmLangHeader: 'Language',
      confirmCountHeader: 'Texts',
      confirmRetranslateAll: 'Re-translate all',
      confirmCancel: 'Cancel',
      confirmTranslate: 'Translate',
      reselectJson: 'Re-select JSON',
      themeToggle: 'Toggle theme',
      toastFileLoaded: 'File loaded: {0} keys, {1} languages',
      toastTranslateComplete: 'Translation complete! {0} languages translated.',
      toastError: 'Error: {0}',
      sidebarToggle: 'Toggle settings panel',
      sidebarTitle: 'Translation Settings',
      testApiKey: 'Test Key',
      testApiKeySuccess: '\u2713 Valid',
      testApiKeyNoKey: 'Please enter an API key first.',
      testApiKeyTesting: 'Testing...',
      cellEditConfirm: 'This cell already has a translation. Do you want to modify it?',
      cellEditTitle: 'Edit Translation',
      cellEditSave: 'Save',
      cellEditCancel: 'Cancel',
      cellTranslating: 'Translating...',
      cellTranslateSuccess: 'Cell translated successfully.',
      cellTranslateError: 'Translation failed: {0}',
      cellEditSuccess: 'Cell updated successfully.',
      cellEditSource: 'Source (EN):',
      cellEditRevert: 'Revert',
      cellEditAiTranslate: 'AI Translate',
      cellEditRevertSuccess: 'Cell reverted to original value.',
      cellEditAiTranslating: 'Translating...',
      exportBtn: 'Export Language File',
      cellEditSourceCurrent: 'Editing Original Text',
      bbTitle: 'Bitbucket Connection',
      bbProxyUrl: 'Proxy URL',
      bbProxyUrlPlaceholder: 'https://your-proxy.workers.dev',
      bbWorkspace: 'Workspace',
      bbWorkspacePlaceholder: 'my-workspace',
      bbRepo: 'Repository',
      bbRepoPlaceholder: 'my-repo',
      bbBranch: 'Branch',
      bbBranchPlaceholder: 'main',
      bbToken: 'Access Token',
      bbTokenPlaceholder: 'Bitbucket Repository Access Token',
      bbTestConnection: 'Test Connection',
      bbNotConnected: 'Not Connected',
      bbConnected: 'Connected',
      bbConnecting: 'Connecting...',
      bbConnectSuccess: 'Bitbucket connection successful',
      bbConnectFailed: 'Connection failed: {0}',
      bbMissingFields: 'Please fill in Proxy URL, Workspace, Repository, and Access Token',
      bbDisclaimer: 'Your token is stored in this browser only. It is sent to your CORS proxy for Bitbucket API access.',
      bbSetupGuide: 'Setup Guide',
      searchContextMenu: 'Search Context',
      searchProgressSearching: 'Searching context: {0}/{1} keys',
      searchProgressDone: 'Context search complete',
      searchSingleLoading: 'Searching...',
      searchSingleFound: 'Found {0} match(es)',
      searchSingleNone: 'No code context found',
      searchNoConnection: 'Connect to Bitbucket first (Settings sidebar)',
      searchError: 'Search failed: {0}',
    },
    'zh-TW': {
      title: 'Frontitude \u4e00\u9375\u7ffb\u8b6f\u5668',
      subtitle: '\u4e0a\u50b3 language.json\uff0c\u9078\u64c7\u76ee\u6a19\u8a9e\u8a00\uff0c\u900f\u904e DeepL / OpenAI / Gemini \u7ffb\u8b6f\u3002',
      uploadTitle: '\u4e0a\u50b3 JSON',
      dropzoneText: '\u62d6\u653e <strong>language.json</strong> \u5230\u6b64\u8655\uff0c\u6216\u9ede\u64ca\u700f\u89bd',
      contentPreview: '\u5167\u5bb9\u9810\u89bd',
      searchPlaceholder: '\u4f9d\u9375\u540d\u641c\u5c0b...',
      providerTitle: '\u7ffb\u8b6f\u4f9b\u61c9\u5546',
      modelLabel: '\u6a21\u578b\uff1a',
      rememberKey: '\u8a18\u4f4f\u91d1\u9470',
      clearSavedKey: '\u6e05\u9664\u5df2\u5132\u5b58\u7684\u91d1\u9470',
      targetLangs: '\u76ee\u6a19\u8a9e\u8a00',
      selectAll: '\u5168\u9078',
      selectNone: '\u53d6\u6d88\u5168\u9078',
      translateBtn: '\u7ffb\u8b6f',
      downloadBtn: '\u4e0b\u8f09 language.json',
      noKey: '\u7121\u91d1\u9470',
      free: '\u514d\u8cbb\u7248',
      pro: '\u5c08\u696d\u7248',
      fileInfo: '\u8a9e\u8a00\uff1aen, {0}  |  "en" \u4e2d\u7684\u9375\u6578\uff1a{1}',
      editorCount: '{1} \u500b\u9375\u4e2d\u7684 {0} \u500b',
      errJsonFile: '\u8acb\u4e0a\u50b3 .json \u6a94\u6848\u3002',
      errFileTooLarge: '\u6a94\u6848\u904e\u5927\uff08\u4e0a\u9650 5 MB\uff09\u3002',
      errJsonParse: 'JSON \u89e3\u6790\u932f\u8aa4\uff1a{0}',
      errReadFile: '\u8b80\u53d6\u6a94\u6848\u5931\u6557\uff0c\u8acb\u91cd\u8a66\u3002',
      errInvalidFormat: '\u683c\u5f0f\u7121\u6548\uff1a\u9810\u671f\u70ba\u4ee5\u8a9e\u8a00\u4ee3\u78bc\u70ba\u9375\u7684\u7269\u4ef6\u3002',
      errMissingEn: 'JSON \u4e2d\u7f3a\u5c11 "en" \u9375\u3002\u4f86\u6e90\u8a9e\u8a00\u5fc5\u9808\u70ba\u82f1\u6587\u3002',
      errNonString: '"en" \u4e2d\u7684\u4ee5\u4e0b\u9375\u5305\u542b\u975e\u5b57\u4e32\u503c\uff1a{0}',
      errNonStringMore: '\uff08\u53e6\u6709 {0} \u500b\uff09',
      progressTranslating: '\u6b63\u5728\u7ffb\u8b6f {0}\uff08{1}/{2} \u7a2e\u8a9e\u8a00\uff09...',
      progressDone: '\u5b8c\u6210\uff01\u5df2\u7ffb\u8b6f\u5168\u90e8 {0} \u7a2e\u8a9e\u8a00\u3002',
      progressTranslatedCount: '\u5df2\u7ffb\u8b6f\uff1a{0} / {1} \u500b\u6587\u672c',
      errTimeout: 'API \u8acb\u6c42\u903e\u6642\uff08{0} \u79d2\uff09\uff0c\u8acb\u91cd\u8a66\u3002',
      errReturnedCount: '{0} \u56de\u50b3\u4e86 {1} \u7b46\u7ffb\u8b6f\uff0c\u4f46\u8a9e\u8a00 {3} \u9810\u671f\u70ba {2} \u7b46',
      errUnexpectedDeepL: 'DeepL \u56de\u50b3\u4e86\u8a9e\u8a00 {0} \u7684\u975e\u9810\u671f\u683c\u5f0f',
      errUnexpectedResponse: '{0} \u56de\u50b3\u4e86\u8a9e\u8a00 {1} \u7684\u975e\u9810\u671f\u56de\u61c9\u7d50\u69cb',
      errInvalidJson: '{0} \u56de\u50b3\u4e86\u8a9e\u8a00 {1} \u7684\u7121\u6548 JSON\uff1a{2}',
      errApiError: '{0} API \u932f\u8aa4 {1}\uff1a{2}',
      deeplPlaceholder: '\u5728\u6b64\u8cbc\u4e0a\u60a8\u7684 DeepL API \u91d1\u9470',
      deeplDisclaimer: '\u60a8\u7684 API \u91d1\u9470\u6703\u5f9e\u700f\u89bd\u5668\u76f4\u63a5\u50b3\u9001\u81f3 DeepL\uff0c\u4e26\u53ef\u5728\u700f\u89bd\u5668\u7db2\u8def\u9762\u677f\u4e2d\u770b\u5230\u3002\u5b83\u4e0d\u6703\u50b3\u9001\u5230\u4efb\u4f55\u5176\u4ed6\u4f3a\u670d\u5668\u3002',
      openaiPlaceholder: '\u5728\u6b64\u8cbc\u4e0a\u60a8\u7684 OpenAI API \u91d1\u9470\uff08sk-...\uff09',
      openaiDisclaimer: '\u60a8\u7684 API \u91d1\u9470\u6703\u5f9e\u700f\u89bd\u5668\u76f4\u63a5\u50b3\u9001\u81f3 OpenAI\uff0c\u4e26\u53ef\u5728\u700f\u89bd\u5668\u7db2\u8def\u9762\u677f\u4e2d\u770b\u5230\u3002\u5b83\u4e0d\u6703\u50b3\u9001\u5230\u4efb\u4f55\u5176\u4ed6\u4f3a\u670d\u5668\u3002',
      geminiPlaceholder: '\u5728\u6b64\u8cbc\u4e0a\u60a8\u7684 Gemini API \u91d1\u9470',
      geminiDisclaimer: '\u60a8\u7684 API \u91d1\u9470\u6703\u5f9e\u700f\u89bd\u5668\u76f4\u63a5\u50b3\u9001\u81f3 Google\uff0c\u4e26\u53ef\u5728\u700f\u89bd\u5668\u7db2\u8def\u9762\u677f\u4e2d\u770b\u5230\uff08\u4f5c\u70ba URL \u53c3\u6578\uff09\u3002\u5b83\u4e0d\u6703\u50b3\u9001\u5230\u4efb\u4f55\u5176\u4ed6\u4f3a\u670d\u5668\u3002',
      contextPromptLabel: '\u60c5\u5883\u63d0\u793a',
      contextPromptPlaceholder: '\u4f8b\u5982\uff1a\u9f52\u79d1\u690d\u7259\u8edf\u9ad4',
      contextPromptDeeplNote: '\u60c5\u5883\u63d0\u793a\u50c5\u9069\u7528\u65bc OpenAI \u548c Gemini\u3002',
      defaultContextPrompt: '\u9f52\u79d1\u690d\u7259\u8edf\u9ad4\u4ecb\u9762\u591a\u570b\u8a9e\u7cfb\u7ffb\u8b6f',
      langFullyTranslated: '\u5df2\u7ffb\u8b6f\u5b8c\u6210\uff0c\u91cd\u65b0\u7ffb\u8b6f\u5c07\u8986\u84cb\u5168\u90e8\u5167\u5bb9\u3002',
      modelFastLowCost: '\u5feb\u901f\u3001\u4f4e\u6210\u672c',
      modelHighQuality: '\u9ad8\u54c1\u8cea',
      modelUltraFast: '\u6975\u901f',
      modelEconomical: '\u7d93\u6fdf\u5be6\u60e0',
      modelBalanced: '\u5e73\u8861',
      getApiKey: '\u53d6\u5f97 API Key',
      confirmTranslateTitle: '\u78ba\u8a8d\u7ffb\u8b6f',
      confirmLangHeader: '\u8a9e\u8a00',
      confirmCountHeader: '\u6587\u672c\u6578',
      confirmRetranslateAll: '\u5168\u90e8\u91cd\u65b0\u7ffb\u8b6f',
      confirmCancel: '\u53d6\u6d88',
      confirmTranslate: '\u7ffb\u8b6f',
      reselectJson: '\u91cd\u65b0\u9078\u64c7 JSON',
      themeToggle: '\u5207\u63db\u4e3b\u984c',
      toastFileLoaded: '\u6a94\u6848\u5df2\u8f09\u5165\uff1a{0} \u500b\u9375\uff0c{1} \u7a2e\u8a9e\u8a00',
      toastTranslateComplete: '\u7ffb\u8b6f\u5b8c\u6210\uff01\u5df2\u7ffb\u8b6f {0} \u7a2e\u8a9e\u8a00\u3002',
      toastError: '\u932f\u8aa4\uff1a{0}',
      sidebarToggle: '\u958b\u95dc\u8a2d\u5b9a\u9762\u677f',
      sidebarTitle: '\u7ffb\u8b6f\u8a2d\u5b9a',
      testApiKey: '\u6e2c\u8a66\u91d1\u9470',
      testApiKeySuccess: '\u2713 \u6e2c\u8a66\u6210\u529f',
      testApiKeyNoKey: '\u8acb\u5148\u8f38\u5165 API \u91d1\u9470\u3002',
      testApiKeyTesting: '\u6e2c\u8a66\u4e2d...',
      cellEditConfirm: '\u6b64\u5132\u5b58\u683c\u5df2\u6709\u7ffb\u8b6f\u3002\u662f\u5426\u8981\u4fee\u6539\uff1f',
      cellEditTitle: '\u7de8\u8f2f\u7ffb\u8b6f',
      cellEditSave: '\u5132\u5b58',
      cellEditCancel: '\u53d6\u6d88',
      cellTranslating: '\u7ffb\u8b6f\u4e2d...',
      cellTranslateSuccess: '\u5132\u5b58\u683c\u7ffb\u8b6f\u6210\u529f\u3002',
      cellTranslateError: '\u7ffb\u8b6f\u5931\u6557\uff1a{0}',
      cellEditSuccess: '\u5132\u5b58\u683c\u66f4\u65b0\u6210\u529f\u3002',
      cellEditSource: '\u539f\u6587 (EN)\uff1a',
      cellEditRevert: '\u5fa9\u539f',
      cellEditAiTranslate: 'AI \u7ffb\u8b6f',
      cellEditRevertSuccess: '\u5132\u5b58\u683c\u5df2\u5fa9\u539f\u70ba\u539f\u59cb\u503c\u3002',
      cellEditAiTranslating: '\u7ffb\u8b6f\u4e2d...',
      exportBtn: '\u532f\u51fa\u8a9e\u8a00\u6a94',
      cellEditSourceCurrent: '\u7de8\u8f2f\u539f\u6587',
      bbTitle: 'Bitbucket \u9023\u7dda',
      bbProxyUrl: 'Proxy \u7db2\u5740',
      bbProxyUrlPlaceholder: 'https://your-proxy.workers.dev',
      bbWorkspace: '\u5de5\u4f5c\u5340',
      bbWorkspacePlaceholder: 'my-workspace',
      bbRepo: '\u5132\u5b58\u5eab',
      bbRepoPlaceholder: 'my-repo',
      bbBranch: '\u5206\u652f',
      bbBranchPlaceholder: 'main',
      bbToken: '\u5b58\u53d6\u6b0a\u6756',
      bbTokenPlaceholder: 'Bitbucket \u5132\u5b58\u5eab\u5b58\u53d6\u6b0a\u6756',
      bbTestConnection: '\u6e2c\u8a66\u9023\u7dda',
      bbNotConnected: '\u672a\u9023\u7dda',
      bbConnected: '\u5df2\u9023\u7dda',
      bbConnecting: '\u9023\u7dda\u4e2d...',
      bbConnectSuccess: 'Bitbucket \u9023\u7dda\u6210\u529f',
      bbConnectFailed: '\u9023\u7dda\u5931\u6557\uff1a{0}',
      bbMissingFields: '\u8acb\u586b\u5beb Proxy \u7db2\u5740\u3001\u5de5\u4f5c\u5340\u3001\u5132\u5b58\u5eab\u548c\u5b58\u53d6\u6b0a\u6756',
      bbDisclaimer: '\u6b0a\u6756\u50c5\u5132\u5b58\u65bc\u6b64\u700f\u89bd\u5668\u3002\u900f\u904e\u60a8\u7684 CORS proxy \u5b58\u53d6 Bitbucket API\u3002',
      bbSetupGuide: '\u8a2d\u5b9a\u6307\u5357',
      searchContextMenu: '\u67e5\u8a62\u60c5\u5883',
      searchProgressSearching: '\u641c\u5c0b\u60c5\u5883\u4e2d: {0}/{1} \u500b key',
      searchProgressDone: '\u60c5\u5883\u641c\u5c0b\u5b8c\u6210',
      searchSingleLoading: '\u641c\u5c0b\u4e2d...',
      searchSingleFound: '\u627e\u5230 {0} \u500b\u5339\u914d',
      searchSingleNone: '\u672a\u627e\u5230\u7a0b\u5f0f\u78bc\u60c5\u5883',
      searchNoConnection: '\u8acb\u5148\u9023\u63a5 Bitbucket\uff08\u5074\u908a\u6b04\u8a2d\u5b9a\uff09',
      searchError: '\u641c\u5c0b\u5931\u6557: {0}',
    },
    ko: {
      title: 'Frontitude \uc6d0\ud074\ub9ad \ubc88\uc5ed\uae30',
      subtitle: 'language.json\uc744 \uc5c5\ub85c\ub4dc\ud558\uace0, \ub300\uc0c1 \uc5b8\uc5b4\ub97c \uc120\ud0dd\ud55c \ud6c4 DeepL / OpenAI / Gemini\ub85c \ubc88\uc5ed\ud558\uc138\uc694.',
      uploadTitle: 'JSON \uc5c5\ub85c\ub4dc',
      dropzoneText: '<strong>language.json</strong> \ud30c\uc77c\uc744 \uc5ec\uae30\uc5d0 \ub4dc\ub798\uadf8\ud558\uac70\ub098 \ud074\ub9ad\ud558\uc5ec \ucc3e\uc544\ubcf4\uae30',
      contentPreview: '\ucf58\ud150\uce20 \ubbf8\ub9ac\ubcf4\uae30',
      searchPlaceholder: '\ud0a4 \uc774\ub984\uc73c\ub85c \uac80\uc0c9...',
      providerTitle: '\ubc88\uc5ed \uacf5\uae09\uc790',
      modelLabel: '\ubaa8\ub378:',
      rememberKey: '\ud0a4 \uae30\uc5b5\ud558\uae30',
      clearSavedKey: '\uc800\uc7a5\ub41c \ud0a4 \uc0ad\uc81c',
      targetLangs: '\ub300\uc0c1 \uc5b8\uc5b4',
      selectAll: '\ubaa8\ub450 \uc120\ud0dd',
      selectNone: '\uc120\ud0dd \ud574\uc81c',
      translateBtn: '\ubc88\uc5ed',
      downloadBtn: 'language.json \ub2e4\uc6b4\ub85c\ub4dc',
      noKey: '\ud0a4 \uc5c6\uc74c',
      free: '\ubb34\ub8cc',
      pro: '\ud504\ub85c',
      fileInfo: '\uc5b8\uc5b4: en, {0}  |  "en" \ud0a4 \uc218: {1}',
      editorCount: '{1}\uac1c \ud0a4 \uc911 {0}\uac1c',
      errJsonFile: '.json \ud30c\uc77c\uc744 \uc5c5\ub85c\ub4dc\ud574 \uc8fc\uc138\uc694.',
      errFileTooLarge: '\ud30c\uc77c\uc774 \ub108\ubb34 \ud07d\ub2c8\ub2e4 (\ucd5c\ub300 5 MB).',
      errJsonParse: 'JSON \ud30c\uc2f1 \uc624\ub958: {0}',
      errReadFile: '\ud30c\uc77c \uc77d\uae30\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4. \ub2e4\uc2dc \uc2dc\ub3c4\ud574 \uc8fc\uc138\uc694.',
      errInvalidFormat: '\uc798\ubabb\ub41c \ud615\uc2dd: \uc5b8\uc5b4 \ucf54\ub4dc\ub97c \ud0a4\ub85c \ud558\ub294 \uac1d\uccb4\uac00 \ud544\uc694\ud569\ub2c8\ub2e4.',
      errMissingEn: 'JSON\uc5d0 "en" \ud0a4\uac00 \uc5c6\uc2b5\ub2c8\ub2e4. \uc18c\uc2a4 \uc5b8\uc5b4\ub294 \uc601\uc5b4\uc5ec\uc57c \ud569\ub2c8\ub2e4.',
      errNonString: '"en"\uc758 \ub2e4\uc74c \ud0a4\uc5d0 \ubb38\uc790\uc5f4\uc774 \uc544\ub2cc \uac12\uc774 \uc788\uc2b5\ub2c8\ub2e4: {0}',
      errNonStringMore: ' (\uc678 {0}\uac1c)',
      progressTranslating: '{0} \ubc88\uc5ed \uc911 ({1}/{2} \uc5b8\uc5b4)...',
      progressDone: '\uc644\ub8cc! {0}\uac1c \uc5b8\uc5b4 \ubaa8\ub450 \ubc88\uc5ed\ub418\uc5c8\uc2b5\ub2c8\ub2e4.',
      progressTranslatedCount: '\ubc88\uc5ed\ub428: {0} / {1} \ud14d\uc2a4\ud2b8',
      errTimeout: 'API \uc694\uccad \uc2dc\uac04 \ucd08\uacfc ({0}\ucd08). \ub2e4\uc2dc \uc2dc\ub3c4\ud574 \uc8fc\uc138\uc694.',
      errReturnedCount: '{0}\uc774(\uac00) {3} \uc5b8\uc5b4\uc5d0 \ub300\ud574 {1}\uac1c\uc758 \ubc88\uc5ed\uc744 \ubc18\ud658\ud588\uc9c0\ub9cc {2}\uac1c\uac00 \uc608\uc0c1\ub418\uc5c8\uc2b5\ub2c8\ub2e4',
      errUnexpectedDeepL: '\uc5b8\uc5b4 {0}\uc5d0 \ub300\ud55c \uc608\uae30\uce58 \uc54a\uc740 DeepL \uc751\ub2f5 \ud615\uc2dd',
      errUnexpectedResponse: '{0}\uc774(\uac00) \uc5b8\uc5b4 {1}\uc5d0 \ub300\ud574 \uc608\uae30\uce58 \uc54a\uc740 \uc751\ub2f5 \uad6c\uc870\ub97c \ubc18\ud658\ud588\uc2b5\ub2c8\ub2e4',
      errInvalidJson: '{0}\uc774(\uac00) \uc5b8\uc5b4 {1}\uc5d0 \ub300\ud574 \uc798\ubabb\ub41c JSON\uc744 \ubc18\ud658\ud588\uc2b5\ub2c8\ub2e4: {2}',
      errApiError: '{0} API \uc624\ub958 {1}: {2}',
      deeplPlaceholder: 'DeepL API \ud0a4\ub97c \uc5ec\uae30\uc5d0 \ubd99\uc5ec\ub123\uc73c\uc138\uc694',
      deeplDisclaimer: 'API \ud0a4\ub294 \ube0c\ub77c\uc6b0\uc800\uc5d0\uc11c DeepL\ub85c \uc9c1\uc811 \uc804\uc1a1\ub418\uba70 \ube0c\ub77c\uc6b0\uc800 \ub124\ud2b8\uc6cc\ud06c \ud0ed\uc5d0\uc11c \ud655\uc778\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4. \ub2e4\ub978 \uc11c\ubc84\ub85c\ub294 \uc804\uc1a1\ub418\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.',
      openaiPlaceholder: 'OpenAI API \ud0a4\ub97c \uc5ec\uae30\uc5d0 \ubd99\uc5ec\ub123\uc73c\uc138\uc694 (sk-...)',
      openaiDisclaimer: 'API \ud0a4\ub294 \ube0c\ub77c\uc6b0\uc800\uc5d0\uc11c OpenAI\ub85c \uc9c1\uc811 \uc804\uc1a1\ub418\uba70 \ube0c\ub77c\uc6b0\uc800 \ub124\ud2b8\uc6cc\ud06c \ud0ed\uc5d0\uc11c \ud655\uc778\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4. \ub2e4\ub978 \uc11c\ubc84\ub85c\ub294 \uc804\uc1a1\ub418\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.',
      geminiPlaceholder: 'Gemini API \ud0a4\ub97c \uc5ec\uae30\uc5d0 \ubd99\uc5ec\ub123\uc73c\uc138\uc694',
      geminiDisclaimer: 'API \ud0a4\ub294 \ube0c\ub77c\uc6b0\uc800\uc5d0\uc11c Google\ub85c \uc9c1\uc811 \uc804\uc1a1\ub418\uba70 \ube0c\ub77c\uc6b0\uc800 \ub124\ud2b8\uc6cc\ud06c \ud0ed\uc5d0\uc11c \ud655\uc778\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4 (URL \ub9e4\uac1c\ubcc0\uc218\ub85c). \ub2e4\ub978 \uc11c\ubc84\ub85c\ub294 \uc804\uc1a1\ub418\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.',
      contextPromptLabel: '\ucee8\ud14d\uc2a4\ud2b8 \ud504\ub86c\ud504\ud2b8',
      contextPromptPlaceholder: '\uc608: \uce58\uacfc \uc784\ud50c\ub780\ud2b8 \uc18c\ud504\ud2b8\uc6e8\uc5b4',
      contextPromptDeeplNote: '\ucee8\ud14d\uc2a4\ud2b8 \ud504\ub86c\ud504\ud2b8\ub294 OpenAI \ubc0f Gemini\uc5d0\uc11c\ub9cc \uc0ac\uc6a9\ub429\ub2c8\ub2e4.',
      defaultContextPrompt: '\uce58\uacfc \uc784\ud50c\ub780\ud2b8 \uc18c\ud504\ud2b8\uc6e8\uc5b4 UI \ub2e4\uad6d\uc5b4 \ubc88\uc5ed',
      langFullyTranslated: '\ubc88\uc5ed \uc644\ub8cc\ub428. \uc7ac\ubc88\uc5ed \uc2dc \ubaa8\ub4e0 \ub0b4\uc6a9\uc744 \ub36e\uc5b4\uc501\ub2c8\ub2e4.',
      modelFastLowCost: '\ube60\ub984, \uc800\ube44\uc6a9',
      modelHighQuality: '\uace0\ud488\uc9c8',
      modelUltraFast: '\ucd08\uace0\uc18d',
      modelEconomical: '\uacbd\uc81c\uc801',
      modelBalanced: '\uade0\ud615',
      getApiKey: 'API Key \ubc1b\uae30',
      confirmTranslateTitle: '\ubc88\uc5ed \ud655\uc778',
      confirmLangHeader: '\uc5b8\uc5b4',
      confirmCountHeader: '\ud14d\uc2a4\ud2b8',
      confirmRetranslateAll: '\uc804\uccb4 \uc7ac\ubc88\uc5ed',
      confirmCancel: '\ucde8\uc18c',
      confirmTranslate: '\ubc88\uc5ed',
      reselectJson: 'JSON \ub2e4\uc2dc \uc120\ud0dd',
      themeToggle: '\ud14c\ub9c8 \uc804\ud658',
      toastFileLoaded: '\ud30c\uc77c \ub85c\ub4dc\ub428: {0}\uac1c \ud0a4, {1}\uac1c \uc5b8\uc5b4',
      toastTranslateComplete: '\ubc88\uc5ed \uc644\ub8cc! {0}\uac1c \uc5b8\uc5b4 \ubc88\uc5ed\ub428.',
      toastError: '\uc624\ub958: {0}',
      sidebarToggle: '\uc124\uc815 \ud328\ub110 \uc804\ud658',
      sidebarTitle: '\ubc88\uc5ed \uc124\uc815',
      testApiKey: '\ud0a4 \ud14c\uc2a4\ud2b8',
      testApiKeySuccess: '\u2713 \uc720\ud6a8',
      testApiKeyNoKey: '\uba3c\uc800 API \ud0a4\ub97c \uc785\ub825\ud574 \uc8fc\uc138\uc694.',
      testApiKeyTesting: '\ud14c\uc2a4\ud2b8 \uc911...',
      cellEditConfirm: '\uc774 \uc140\uc5d0 \uc774\ubbf8 \ubc88\uc5ed\uc774 \uc788\uc2b5\ub2c8\ub2e4. \uc218\uc815\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?',
      cellEditTitle: '\ubc88\uc5ed \ud3b8\uc9d1',
      cellEditSave: '\uc800\uc7a5',
      cellEditCancel: '\ucde8\uc18c',
      cellTranslating: '\ubc88\uc5ed \uc911...',
      cellTranslateSuccess: '\uc140 \ubc88\uc5ed \uc644\ub8cc.',
      cellTranslateError: '\ubc88\uc5ed \uc2e4\ud328: {0}',
      cellEditSuccess: '\uc140 \uc5c5\ub370\uc774\ud2b8 \uc644\ub8cc.',
      cellEditSource: '\uc6d0\ubb38 (EN):',
      cellEditRevert: '\ub418\ub3cc\ub9ac\uae30',
      cellEditAiTranslate: 'AI \ubc88\uc5ed',
      cellEditRevertSuccess: '\uc140\uc774 \uc6d0\ub798 \uac12\uc73c\ub85c \ubcf5\uc6d0\ub418\uc5c8\uc2b5\ub2c8\ub2e4.',
      cellEditAiTranslating: '\ubc88\uc5ed \uc911...',
      exportBtn: '\uc5b8\uc5b4 \ud30c\uc77c \ub0b4\ubcf4\ub0b4\uae30',
      cellEditSourceCurrent: '\uc6d0\ubb38 \ud3b8\uc9d1',
      bbTitle: 'Bitbucket \uc5f0\uacb0',
      bbProxyUrl: '\ud504\ub85d\uc2dc URL',
      bbProxyUrlPlaceholder: 'https://your-proxy.workers.dev',
      bbWorkspace: '\uc6cc\ud06c\uc2a4\ud398\uc774\uc2a4',
      bbWorkspacePlaceholder: 'my-workspace',
      bbRepo: '\ub9ac\ud3ec\uc9c0\ud1a0\ub9ac',
      bbRepoPlaceholder: 'my-repo',
      bbBranch: '\ube0c\ub79c\uce58',
      bbBranchPlaceholder: 'main',
      bbToken: '\uc561\uc138\uc2a4 \ud1a0\ud070',
      bbTokenPlaceholder: 'Bitbucket \ub9ac\ud3ec\uc9c0\ud1a0\ub9ac \uc561\uc138\uc2a4 \ud1a0\ud070',
      bbTestConnection: '\uc5f0\uacb0 \ud14c\uc2a4\ud2b8',
      bbNotConnected: '\ubbf8\uc5f0\uacb0',
      bbConnected: '\uc5f0\uacb0\ub428',
      bbConnecting: '\uc5f0\uacb0 \uc911...',
      bbConnectSuccess: 'Bitbucket \uc5f0\uacb0 \uc131\uacf5',
      bbConnectFailed: '\uc5f0\uacb0 \uc2e4\ud328: {0}',
      bbMissingFields: '\ud504\ub85d\uc2dc URL, \uc6cc\ud06c\uc2a4\ud398\uc774\uc2a4, \ub9ac\ud3ec\uc9c0\ud1a0\ub9ac, \uc561\uc138\uc2a4 \ud1a0\ud070\uc744 \uc785\ub825\ud558\uc138\uc694',
      bbDisclaimer: '\ud1a0\ud070\uc740 \uc774 \ube0c\ub77c\uc6b0\uc800\uc5d0\ub9cc \uc800\uc7a5\ub429\ub2c8\ub2e4. Bitbucket API \uc561\uc138\uc2a4\ub97c \uc704\ud574 CORS \ud504\ub85d\uc2dc\ub85c \uc804\uc1a1\ub429\ub2c8\ub2e4.',
      bbSetupGuide: '\uc124\uc815 \uac00\uc774\ub4dc',
      searchContextMenu: '\ucee8\ud14d\uc2a4\ud2b8 \uac80\uc0c9',
      searchProgressSearching: '\ucee8\ud14d\uc2a4\ud2b8 \uac80\uc0c9 \uc911: {0}/{1} \ud0a4',
      searchProgressDone: '\ucee8\ud14d\uc2a4\ud2b8 \uac80\uc0c9 \uc644\ub8cc',
      searchSingleLoading: '\uac80\uc0c9 \uc911...',
      searchSingleFound: '{0}\uac1c \uc77c\uce58 \ud56d\ubaa9 \ubc1c\uacac',
      searchSingleNone: '\ucf54\ub4dc \ucee8\ud14d\uc2a4\ud2b8\ub97c \ucc3e\uc744 \uc218 \uc5c6\uc74c',
      searchNoConnection: '\uba3c\uc800 Bitbucket\uc5d0 \uc5f0\uacb0\ud558\uc138\uc694 (\uc124\uc815 \uc0ac\uc774\ub4dc\ubc14)',
      searchError: '\uac80\uc0c9 \uc2e4\ud328: {0}',
    },
  };

  // ── i18n helpers ──
  function t(key) {
    var lang = App.getState().uiLang || 'en';
    var translations = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.en;
    var template = translations[key] || UI_TRANSLATIONS.en[key] || key;
    var args = Array.prototype.slice.call(arguments, 1);
    return template.replace(/\{(\d+)\}/g, function (_, idx) {
      return args[parseInt(idx, 10)] !== undefined ? args[parseInt(idx, 10)] : _;
    });
  }

  function isDefaultContextPrompt(val) {
    var langs = Object.keys(UI_TRANSLATIONS);
    for (var i = 0; i < langs.length; i++) {
      if (UI_TRANSLATIONS[langs[i]].defaultContextPrompt === val) return true;
    }
    return false;
  }

  function applyI18n() {
    var lang = App.getState().uiLang || 'en';
    document.documentElement.lang = lang === 'zh-TW' ? 'zh-Hant' : lang;
    document.title = t('title');

    // textContent elements
    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      els[i].textContent = t(els[i].getAttribute('data-i18n'));
    }

    // innerHTML elements
    var htmlEls = document.querySelectorAll('[data-i18n-html]');
    for (var j = 0; j < htmlEls.length; j++) {
      htmlEls[j].innerHTML = t(htmlEls[j].getAttribute('data-i18n-html'));
    }

    // placeholder elements
    var phEls = document.querySelectorAll('[data-i18n-placeholder]');
    for (var k = 0; k < phEls.length; k++) {
      phEls[k].placeholder = t(phEls[k].getAttribute('data-i18n-placeholder'));
    }

    // title elements
    var titleEls = document.querySelectorAll('[data-i18n-title]');
    for (var ti = 0; ti < titleEls.length; ti++) {
      titleEls[ti].title = t(titleEls[ti].getAttribute('data-i18n-title'));
    }

    // Update language switcher active state
    var btns = document.querySelectorAll('#lang-switcher button');
    for (var b = 0; b < btns.length; b++) {
      btns[b].classList.toggle('active', btns[b].getAttribute('data-lang') === lang);
    }

    // Update context prompt if still on a default value
    var savedCtx = localStorage.getItem('translate_context_prompt');
    if (savedCtx === null || isDefaultContextPrompt(savedCtx)) {
      var newDefault = t('defaultContextPrompt');
      App.dom.contextPrompt.value = newDefault;
      App.setState({ contextPrompt: newDefault });
    }

    // Re-apply provider-specific dynamic strings
    App.applyProviderUI(App.getState().provider);

    // Re-render model dropdown annotations
    var provConfig = App.PROVIDER_CONFIG[App.getState().provider];
    if (provConfig.models.length > 0) {
      var currentModel = App.getState().model;
      App.renderModelDropdown(provConfig);
      App.dom.modelSelect.value = currentModel;
    }

    // Re-apply key badge
    App.updateKeyBadge(App.getState().apiKey);

    // Re-apply file info if data loaded
    var s = App.getState();
    if (s.jsonData) {
      var langs = Object.keys(s.jsonData).filter(function (k) { return k !== 'en'; }).sort();
      var keyCount = Object.keys(s.jsonData.en).length;
      App.dom.fileInfo.textContent = t('fileInfo', langs.join(', '), keyCount);
    }

    // Re-apply editor count if visible
    if (s.jsonData && App.dom.editorSection.style.display !== 'none') {
      App.renderEditorTable();
      App.renderLanguages();
    }
  }

  App.UI_TRANSLATIONS = UI_TRANSLATIONS;
  App.t = t;
  App.applyI18n = applyI18n;
  App.isDefaultContextPrompt = isDefaultContextPrompt;
})();
