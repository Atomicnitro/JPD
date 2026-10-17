/* App shell, navigation and login. */
(function () {
  'use strict';
  const GT = window.GT;
  const { S, $, $$, esc, icon } = GT;

  const app = $('#app');

  /* ---------- Landing page (shown before login) ---------- */
  function showLanding() {
    const feat = (ic, title, text) => `<li>${icon(ic)}<div><h3>${title}</h3><p>${text}</p></div></li>`;
    const step = (n, title, text) => `<li><span class="flow-n">${n}</span><div><h3>${title}</h3><p>${text}</p></div></li>`;
    app.innerHTML = `<div class="land">
      <header class="land-hero">
        <nav class="land-nav" aria-label="Site">
          <a class="land-brand" href="#/"><span class="brand-logo"><img src="/assets/logo-128.png" alt=""></span><b>Gamefowl Tracker</b></a>
          <div class="land-links">
            <button type="button" data-scroll="land-features">What it tracks</button>
            <button type="button" data-scroll="land-flow">How it connects</button>
          </div>
          <a class="land-login" href="#/login">Log in</a>
        </nav>
        <div class="land-copy">
          <p class="land-badge"><i></i>Private record book for gamefowl breeders</p>
          <h1>Every bird, pair and peso in one place.</h1>
          <p class="land-lead">Keep pedigree, hatches, training, derbies, sales and expenses together, and check them from your phone at the pens.</p>
          <div class="land-cta">
            <a class="btn brass" href="#/login">Log in</a>
            <button class="btn dark" type="button" data-scroll="land-features">See what it tracks</button>
          </div>
          <p class="land-note">Made for one farm and its staff. Ask your admin for an account.</p>
        </div>
        <div class="land-stage">
          <div class="land-rays" aria-hidden="true"></div>
          <figure class="land-ped" aria-label="Example pedigree">
            <div class="land-frame">
              <div class="ped">
                <div class="pn"><div class="pcard self"><b>GF-005</b><small>Apoy</small></div>
                  <div class="pk">
                    <div class="pn"><div class="pcard tandang"><b>GF-001</b><small>Bulik</small></div>
                      <div class="pk"><div class="pn"><div class="pcard tandang"><b>GF-014</b><small>Hari</small></div></div><div class="pn"><div class="pcard inahin"><b>GF-009</b><small>Dalaga</small></div></div></div></div>
                    <div class="pn"><div class="pcard inahin"><b>GF-003</b><small>Maya</small></div>
                      <div class="pk"><div class="pn"><div class="pcard tandang"><b>GF-011</b><small>Bayani</small></div></div><div class="pn"><div class="pcard unk"><small>Unknown</small></div></div></div></div>
                  </div>
                </div>
                <div class="ped-legend"><span><i style="background:var(--pine)"></i>Tandang</span><span><i style="background:var(--brass)"></i>Inahin</span></div>
              </div>
            </div>
            <figcaption>Example pedigree. Every bird you add builds its own.</figcaption>
          </figure>
        </div>
      </header>

      <main>
        <section class="land-sec" id="land-features">
          <h2>What it keeps track of</h2>
          <ul class="land-feats">
            ${feat('bird', 'Birds and pedigree', 'Band ID, photo, color, bloodline and status for every bird, with father and mother linked so the family tree shows itself.')}
            ${feat('pairs', 'Pairs and hatch records', 'Pair a tandang with an inahin, log each clutch and see the hatch rate of every pair.')}
            ${feat('incubator', 'Incubator countdown', 'See how many eggs are set, which incubator they are in and how many days are left until the hatch.')}
            ${feat('dumbbell', 'Training and derbies', 'Log training sessions and weights, record fight results and add notes to derby videos.')}
            ${feat('tag', 'Sales and expenses', 'Record each sale and every peso spent on feed, vitamins, medicine and equipment, and see the net income.')}
            ${feat('chart', 'Reports and downloads', 'Pick a week, month or year to see the numbers, then download your records as CSV files.')}
          </ul>
        </section>

        <section class="land-sec land-flow" id="land-flow">
          <h2>Record once, and it connects</h2>
          <p class="land-sub">Chicks you register from a hatch are linked to their parents automatically, so pedigree grows with every hatch.</p>
          <ol class="flow">
            ${step(1, 'Add your birds', 'Tandang and inahin, with photos and bloodline.')}
            ${step(2, 'Create a pair', 'Pick the cock and hen you are breeding.')}
            ${step(3, 'Set the eggs', 'Choose the incubator and date. The hatch date is worked out for you.')}
            ${step(4, 'Record the hatch', 'Enter how many eggs hatched.')}
            ${step(5, 'Register the chicks', 'Parents are filled in, and the family tree updates.')}
          </ol>
        </section>

        <section class="land-end">
          <h2>Ready to log today's records?</h2>
          <a class="btn brass" href="#/login">Log in</a>
        </section>
      </main>
      <footer class="land-foot"><span>Created by <b>Juan Paolo Dente</b></span></footer>
    </div>`;
    app.querySelectorAll('[data-scroll]').forEach((go) => go.addEventListener('click', () => {
      const el = document.getElementById(go.dataset.scroll);
      if (el) el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    }));
    window.scrollTo(0, 0);
  }

  /* ---------- Login ---------- */
  function showLogin(message) {
    app.innerHTML = `<main class="login">
      <section class="login-brand">
        <div class="login-logo"><img src="/assets/logo-512.png" alt="Gamefowl Tracker logo" width="156" height="156"></div>
        <h1>Gamefowl Tracker</h1>
        <p class="tag">Birds, pairs, hatches, sales and expenses in one place.</p>
        <p class="credit-login">Created by <b>Juan Paolo Dente</b></p>
      </section>
      <section class="login-panel">
        <form id="loginForm" class="login-form" novalidate>
          <a class="login-back" href="#/">${icon('back')}Back to home</a>
          <h2>Log in</h2>
          <p class="login-sub">Use the email and password your admin gave you.</p>
          <div><label for="email">Email</label><input id="email" type="email" autocomplete="username" inputmode="email" autocapitalize="none" required></div>
          <div><label for="password">Password</label><input id="password" type="password" autocomplete="current-password" required></div>
          <p class="err" id="loginErr" ${message ? '' : 'hidden'}>${esc(message || '')}</p>
          <button class="btn" type="submit">Log in</button>
        </form>
      </section></main>`;
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
  GT.onLoggedOut = () => { if (location.hash !== '#/login') history.replaceState(null, '', '#/login'); showLogin(); };
  window.addEventListener('hashchange', () => {
    if (S.token) return;
    if (location.hash === '#/login') showLogin(); else showLanding();
  });

  /* ---------- Shell ---------- */
  const NAV = [
    ['home', '#/', 'home', 'Dashboard'],
    ['birds', '#/birds', 'bird', 'Birds'],
    ['pairs', '#/pairs', 'pairs', 'Pairs'],
    ['hatch', '#/hatch', 'egg', 'Hatch records'],
    ['incubator', '#/incubator', 'incubator', 'Incubator'],
    ['training', '#/training', 'dumbbell', 'Training'],
    ['derbies', '#/derbies', 'trophy', 'Derbies'],
    ['sales', '#/sales', 'tag', 'Sales'],
    ['expenses', '#/expenses', 'wallet', 'Expenses'],
    ['reports', '#/reports', 'chart', 'Reports'],
  ];

  function updateSide() {
    const el = $('#sideToday');
    if (el) el.innerHTML = GT.sideToday();
  }

  function renderShell() {
    const admin = S.user && S.user.role === 'admin';
    app.innerHTML = `<div class="shell">
      <aside class="side">
        <a class="brand" href="#/"><span class="brand-logo"><img src="/assets/logo-128.png" alt=""></span><span><b>Gamefowl<br>Tracker</b></span></a>
        <nav class="nav" aria-label="Main">
          ${NAV.map(([key, href, ic, label]) => `<a href="${href}" data-nav="${key}">${icon(ic)}${label}</a>${['home', 'incubator', 'derbies'].includes(key) ? '<div class="gap"></div>' : ''}${key === 'birds' ? `<div class="sub">
              <a href="#/birds" data-sub="">All birds</a><a href="#/birds?sex=tandang" data-sub="tandang">Tandang</a>
              <a href="#/birds?sex=inahin" data-sub="inahin">Inahin</a><a href="#/birds?sex=sisiw" data-sub="sisiw">Sisiw</a></div>` : ''}`).join('')}
          <div class="gap"></div>
          ${admin ? `<a href="#/users" data-nav="users">${icon('users')}Users</a>` : ''}
          <a href="#/settings" data-nav="settings">${icon('gear')}Settings</a>
        </nav>
        <div class="side-fill">
          <div class="side-mark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="${GT.ROOSTER_PATH}" fill="currentColor" fill-rule="evenodd"/></svg></div>
          <div class="side-today" id="sideToday"></div>
        </div>
        <div class="side-foot">
          <div class="side-user"><div><div class="who">${esc(S.user.name || S.user.email)}</div><div class="role">${admin ? 'Admin' : 'Staff'}</div></div>
            <button class="btn sm dark" data-act="logout">${icon('logout')}Log out</button></div>
          <p class="side-credit">Created by <b>Juan Paolo Dente</b></p>
        </div>
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
    [/^\/training$/, 'training'],
    [/^\/derbies$/, 'derbies'],
    [/^\/derbies\/([^/]+)$/, 'derby'],
    [/^\/fights\/([^/]+)$/, 'fight'],
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
  const NAV_OF = { bird: 'birds', pair: 'pairs', derby: 'derbies', fight: 'derbies' };

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
    const sub = $('.nav .sub');
    if (sub) sub.classList.toggle('open', name === 'birds' || name === 'bird');
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
    updateSide();
    if (!GT.keepScroll) window.scrollTo(0, 0);
    GT.keepScroll = false;
  };

  // Redraw after saving without jumping to the top of the page.
  const baseRender = GT.render;
  GT.render = function () { GT.keepScroll = true; return baseRender(); };
  window.addEventListener('hashchange', () => { GT.keepScroll = false; baseRender(); });

  function startApp() {
    if (location.hash === '#/login') history.replaceState(null, '', '#/');
    renderShell();
    baseRender();
    GT.api('/videos/limit').then((r) => { GT.videoMB = r.mb; }).catch(() => {});
  }

  /* ---------- Start ---------- */
  (async function boot() {
    GT.restoreSession();
    if (!S.token) return location.hash === '#/login' ? showLogin() : showLanding();
    try {
      await GT.load();
      startApp();
    } catch (e) {
      if (location.hash !== '#/login') history.replaceState(null, '', '#/login');
      showLogin(e.message && !/log in/i.test(e.message) ? e.message : '');
    }
  })();
})();
