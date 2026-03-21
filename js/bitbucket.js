(function () {
  'use strict';
  var App = window.App;

  // localStorage keys
  var STORAGE_KEYS = {
    proxyUrl: 'translate_bb_proxy_url',
    workspace: 'translate_bb_workspace',
    repo: 'translate_bb_repo',
    branch: 'translate_bb_branch',
    token: 'translate_bb_token'
  };

  function initBitbucket() {
    // Load saved values from localStorage
    var proxyUrl = localStorage.getItem(STORAGE_KEYS.proxyUrl) || '';
    var workspace = localStorage.getItem(STORAGE_KEYS.workspace) || '';
    var repo = localStorage.getItem(STORAGE_KEYS.repo) || '';
    var branch = localStorage.getItem(STORAGE_KEYS.branch) || 'main';
    var token = localStorage.getItem(STORAGE_KEYS.token) || '';

    App.setState({
      proxyUrl: proxyUrl,
      bitbucketWorkspace: workspace,
      bitbucketRepo: repo,
      bitbucketBranch: branch,
      bitbucketToken: token,
      bitbucketConnected: false
    });

    // Populate UI fields
    App.dom.bbProxyUrl.value = proxyUrl;
    App.dom.bbWorkspace.value = workspace;
    App.dom.bbRepo.value = repo;
    App.dom.bbBranch.value = branch;
    App.dom.bbToken.value = token;

    // Input change handlers: save to localStorage and update state
    App.dom.bbProxyUrl.addEventListener('input', function () {
      localStorage.setItem(STORAGE_KEYS.proxyUrl, this.value);
      App.setState({ proxyUrl: this.value });
      updateTestBtnState();
    });
    App.dom.bbWorkspace.addEventListener('input', function () {
      localStorage.setItem(STORAGE_KEYS.workspace, this.value);
      App.setState({ bitbucketWorkspace: this.value });
      updateTestBtnState();
    });
    App.dom.bbRepo.addEventListener('input', function () {
      localStorage.setItem(STORAGE_KEYS.repo, this.value);
      App.setState({ bitbucketRepo: this.value });
      updateTestBtnState();
    });
    App.dom.bbBranch.addEventListener('input', function () {
      localStorage.setItem(STORAGE_KEYS.branch, this.value);
      App.setState({ bitbucketBranch: this.value });
    });
    App.dom.bbToken.addEventListener('input', function () {
      localStorage.setItem(STORAGE_KEYS.token, this.value);
      App.setState({ bitbucketToken: this.value });
      updateTestBtnState();
    });

    // Test Connection button
    App.dom.bbTestBtn.addEventListener('click', function () {
      testBitbucketConnection();
    });

    // Collapsible section
    App.initCollapsible(App.dom.bbCollapsible, App.dom.bbCollapsibleBody, 'collapse_bitbucket', true);

    // Initial button state
    updateTestBtnState();

    // Auto-test connection on page load if all required fields are saved
    if (proxyUrl && workspace && repo && token) {
      testBitbucketConnection();
    }
  }

  function updateTestBtnState() {
    var s = App.getState();
    var hasRequired = s.proxyUrl && s.bitbucketWorkspace && s.bitbucketRepo && s.bitbucketToken;
    App.dom.bbTestBtn.disabled = !hasRequired;
  }

  function updateBadge(status) {
    // status: 'none', 'connecting', 'connected', 'error'
    var badge = App.dom.bbBadge;
    badge.className = 'badge';
    if (status === 'none') {
      badge.classList.add('badge-none');
      badge.textContent = App.t('bbNotConnected');
    } else if (status === 'connecting') {
      badge.classList.add('badge-none');
      badge.textContent = App.t('bbConnecting');
    } else if (status === 'connected') {
      badge.classList.add('badge-connected');
      badge.textContent = App.t('bbConnected');
    } else if (status === 'error') {
      badge.classList.add('badge-error');
      badge.textContent = App.t('bbNotConnected');
    }
  }

  function updateCollapseStatus(connected) {
    var el = App.dom.bbCollapseStatus;
    if (!el) return;
    el.className = 'collapse-status ' + (connected ? 'status-connected' : 'status-disconnected');
    el.textContent = connected ? App.t('bbConnected') : App.t('bbNotConnected');
  }

  function testBitbucketConnection() {
    var s = App.getState();
    if (!s.proxyUrl || !s.bitbucketWorkspace || !s.bitbucketRepo || !s.bitbucketToken) {
      App.showToast(App.t('bbMissingFields'), 'error');
      return;
    }

    // Set loading state
    updateBadge('connecting');
    App.dom.bbTestBtn.disabled = true;

    var url = s.proxyUrl.replace(/\/+$/, '') + '/bitbucket/2.0/repositories/'
      + encodeURIComponent(s.bitbucketWorkspace) + '/'
      + encodeURIComponent(s.bitbucketRepo);

    App.fetchWithTimeout(url, {
      headers: { 'Authorization': 'Bearer ' + s.bitbucketToken }
    })
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function () {
      App.setState({ bitbucketConnected: true });
      updateBadge('connected');
      updateCollapseStatus(true);
      App.showToast(App.t('bbConnectSuccess'), 'success');
      if (App.updatePreciseButtonState) App.updatePreciseButtonState();
      // Auto-collapse on successful connection
      if (App.collapseSection) {
        App.collapseSection(App.dom.bbCollapsible, App.dom.bbCollapsibleBody, 'collapse_bitbucket');
      }
    })
    .catch(function (err) {
      App.setState({ bitbucketConnected: false });
      updateBadge('error');
      updateCollapseStatus(false);
      App.showToast(App.t('bbConnectFailed', err.message), 'error');
      if (App.updatePreciseButtonState) App.updatePreciseButtonState();
    })
    .finally(function () {
      updateTestBtnState();
    });
  }

  App.initBitbucket = initBitbucket;
  App.testBitbucketConnection = testBitbucketConnection;
})();
