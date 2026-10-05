/* App shell, navigation and login. */
(function () {
  'use strict';
  const GT = window.GT;
  const { S, $, $$, esc, icon } = GT;

  const app = $('#app');

  /* ---------- Login ---------- */
  function showLogin(message) {
    app.innerHTML = `<main class="login"><div class="login-card">
      <div class="login-logo"><img src="/assets/logo-512.png" alt="Gamefowl Tracker logo" width="156" height="156"></div>
      <h1>Gamefowl Tracker</h1>
      <p class="tag">Breeding, hatch, sales and expense records.</p>
      <form id="loginForm" novalidate>
        <div><label for="email">Email</label><input id="email" type="email" autocomplete="username" inputmode="email" autocapitalize="none" required></div>
        <div><label for="password">Password</label><input id="password" type="password" autocomplete="current-password" required></div>
        <p class="err" id="loginErr" ${message ? '' : 'hidden'}>${esc(message || '')}</p>
        <button class="btn brass" type="submit">Log in</button>
      </form>
      <p class="credit-login">Created by <b>Juan Paolo Dente</b></p></div></main>`;
    $('#loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = $('button', e.target);
      const err = $('#loginErr');
      err.hidden = true;
      btn.disabled = true;
      try {
        const r = await GT.api('/login', {
          method: 'POST', noRefresh: true,
          body: { email: $('#email').value, password: $('#password').value },
        });
        S.token = r.token; S.refresh = r.refresh; S.user = r.user;
        GT.saveSession();
        await GT.load();
        startApp();
      } catch (ex) {
        err.textContent = ex.message;
        err.hidden = false;
        btn.disabled = false;
      }
    });
  }
  GT.onLoggedOut = () => showLogin();

  /* ---------- Shell ---------- */
  const NAV = [
    ['home', '#/', 'home', 'Dashboard'],
    ['birds', '#/birds', 'bird', 'Birds'],
    ['pairs', '#/pairs', 'pairs', 'Pairs'],
    ['hatch', '#/hatch', 'egg', 'Hatch records'],
    ['incubator', '#/incubator', 'incubator', 'Incubator'],
    ['sales', '#/sales', 'tag', 'Sales'],
    ['expenses', '#/expenses', 'wallet', 'Expenses'],
    ['reports', '#/reports', 'chart', 'Reports'],
  ];

  function renderShell() {
    const admin = S.user && S.user.role === 'admin';
    app.innerHTML = `<div class="shell">
      <aside class="side">
        <a class="brand" href="#/"><span class="brand-logo"><img src="/assets/logo-128.png" alt=""></span><span><b>Gamefowl<br>Tracker</b></span></a>
        <nav class="nav" aria-label="Main">
          ${NAV.map(([key, href, ic, label]) => `<a href="${href}" data-nav="${key}">${icon(ic)}${label}</a>${key === 'birds' ? `<div class="sub">
              <a href="#/birds" data-sub="">All birds</a><a href="#/birds?sex=tandang" data-sub="tandang">Tandang</a>
              <a href="#/birds?sex=inahin" data-sub="inahin">Inahin</a><a href="#/birds?sex=sisiw" data-sub="sisiw">Sisiw</a></div>` : ''}`).join('')}
          <div class="gap"></div>
          ${admin ? `<a href="#/users" data-nav="users">${icon('users')}Users</a>` : ''}
          <a href="#/settings" data-nav="settings">${icon('gear')}Settings</a>
        </nav>
        <div class="side-foot"><div class="who">${esc(S.user.name || S.user.email)}</div><div class="role">${admin ? 'Admin' : 'Staff'}</div>
          <button class="btn sm dark" data-act="logout">${icon('logout')}Log out</button></div>
      </aside>
      <main class="main" id="main">
        <div class="mtop"><span class="brand-logo"><img src="/assets/logo-128.png" alt=""></span><b>Gamefowl Tracker</b></div>
        <div id="view"></div>
        <footer class="credit">Created by&nbsp;<b>Juan Paolo Dente</b></footer>
      </main>
      <nav class="tabs" aria-label="Main">
        <a href="#/" data-tab="home">${icon('home')}Home</a>
        <a href="#/birds" data-tab="birds">${icon('bird')}Birds</a>
        <a href="#/pairs" data-tab="pairs">${icon('pairs')}Pairs</a>
        <a href="#/hatch" data-tab="hatch">${icon('egg')}Hatch</a>
        <a href="#/more" data-tab="more">${icon('more')}More</a>
      </nav></div>`;
  }

  /* ---------- Router ---------- */
  const ROUTES = [
    [/^\/?$/, 'home'],
    [/^\/birds$/, 'birds'],
    [/^\/birds\/([^/]+)$/, 'bird'],
    [/^\/pairs$/, 'pairs'],
    [/^\/pairs\/([^/]+)$/, 'pair'],
    [/^\/hatch$/, 'hatch'],
    [/^\/incubator$/, 'incubator'],
    [/^\/sales$/, 'sales'],
    [/^\/expenses$/, 'expenses'],
    [/^\/reports$/, 'reports'],
    [/^\/users$/, 'users'],
    [/^\/settings$/, 'settings'],
    [/^\/more$/, 'more'],
  ];
  const TAB_OF = {
    home: 'home', birds: 'birds', bird: 'birds', pairs: 'pairs', pair: 'pairs', hatch: 'hatch',
  };
  const NAV_OF = { bird: 'birds', pair: 'pairs' };

  function current() {
    const raw = location.hash.slice(1) || '/';
    const [path, qs] = raw.split('?');
    return { path, q: Object.fromEntries(new URLSearchParams(qs || '')) };
  }

  let token = 0; // ignore slow screens if the user already moved on
  GT.render = async function () {
    if (!S.token || !$('#view')) return;
    const { path, q } = current();
    const hit = ROUTES.find(([re]) => re.test(path));
    const name = hit ? hit[1] : 'home';
    const arg = hit ? (path.match(hit[0]) || [])[1] : undefined;
    if (name === 'birds') S.filters.sex = q.sex || '';

    $$('[data-nav]').forEach((a) => a.classList.toggle('on', a.dataset.nav === (NAV_OF[name] || name)));
    $$('[data-sub]').forEach((a) => a.classList.toggle('on', name === 'birds' && a.dataset.sub === S.filters.sex));
    $$('[data-tab]').forEach((a) => a.classList.toggle('on', a.dataset.tab === (TAB_OF[name] || 'more')));

    const my = ++token;
    let html;
    try {
      html = await GT.views[name](arg);
    } catch (e) {
      html = `<div class="empty"><b>Could not load this screen</b>${esc(e.message)}</div>`;
    }
    if (my !== token) return;
    const view = $('#view');
    view.innerHTML = html;
    if (!GT.keepScroll) window.scrollTo(0, 0);
    GT.keepScroll = false;
  };

  // Redraw after saving without jumping to the top of the page.
  const baseRender = GT.render;
  GT.render = function () { GT.keepScroll = true; return baseRender(); };
  window.addEventListener('hashchange', () => { GT.keepScroll = false; baseRender(); });

  function startApp() {
    renderShell();
    baseRender();
  }

  /* ---------- Start ---------- */
  (async function boot() {
    GT.restoreSession();
    if (!S.token) return showLogin();
    try {
      await GT.load();
      startApp();
    } catch (e) {
      showLogin(e.message && !/log in/i.test(e.message) ? e.message : '');
    }
  })();
})();
