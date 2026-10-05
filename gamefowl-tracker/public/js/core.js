/* Core helpers shared by every screen. */
(function () {
  'use strict';

  const GT = (window.GT = {});

  /* ---------- Small helpers ---------- */
  GT.$ = (s, r = document) => r.querySelector(s);
  GT.$$ = (s, r = document) => [...r.querySelectorAll(s)];
  GT.esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  GT.peso = (n) => {
    const v = Number(n || 0);
    return (v < 0 ? '-' : '') + '₱' + Math.abs(v).toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };
  GT.pad3 = (n) => String(n).padStart(3, '0');
  GT.sum = (arr, key) => arr.reduce((t, x) => t + (Number(x[key]) || 0), 0);

  const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  GT.today = () => iso(new Date());
  const parse = (s) => {
    const [y, m, d] = String(s).slice(0, 10).split('-').map(Number);
    return new Date(y, m - 1, d);
  };
  GT.addDays = (s, n) => {
    const d = parse(s);
    d.setDate(d.getDate() + n);
    return iso(d);
  };
  GT.daysBetween = (a, b) => Math.round((parse(b) - parse(a)) / 86400000);
  GT.fmtDate = (s) =>
    s ? parse(s).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
  GT.longDate = (s) =>
    parse(s).toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  GT.rate = (hatched, eggs) => (eggs ? Math.round((hatched / eggs) * 1000) / 10 + '%' : '–');
  GT.iso = iso;
  GT.parseDate = parse;

  /* ---------- Labels ---------- */
  GT.SEX = { tandang: 'Tandang', inahin: 'Inahin', sisiw: 'Sisiw' };
  GT.STATUS = { active: 'Active', sold: 'Sold', deceased: 'Deceased', culled: 'Culled' };
  GT.PAIR_STATUS = { active: 'Active', inactive: 'Inactive', retired: 'Retired' };
  GT.CATEGORIES = [
    'Feed', 'Vitamins / Supplements', 'Medicine', 'Veterinary', 'Incubator', 'Equipment',
    'Electricity', 'Water', 'Transportation', 'Maintenance', 'Other',
  ];

  /* ---------- Icons ---------- */
  const ICONS = {
    home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    bird: '<g fill="currentColor" stroke="none"><circle cx="17.5" cy="4.4" r="1.8"/><path d="M16 3.4 C16 2 17 1.6 17.4 2.4 C17.9 1.6 19 2 18.8 3.2 Z"/><path d="M18.9 3.9 L21.8 5 L18.9 5.7 Z"/><ellipse cx="12" cy="12.2" rx="5.8" ry="3.6" transform="rotate(-20 12 12.2)"/><path d="M8.6 11.8 C4.2 11.8 1.8 8.2 2.4 3.4 C4.2 6.6 7.4 7.8 11 8.4 Z"/><path d="M8.2 13.6 C4.2 14.6 1.8 12 1.8 8.6 C3.4 10.8 6 11.8 9.4 11.4 Z"/></g><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M17 6 C15.8 7.6 16 9.4 15 11" stroke-width="3.2"/><path d="M11 15 L10.8 20 H8.8 M14.2 14.6 L14.8 20 H12.8" stroke-width="1.6"/></g>',
    pairs: '<circle cx="8" cy="12" r="4.5"/><circle cx="16" cy="12" r="4.5"/>',
    egg: '<path d="M12 3c4 0 7 6 7 11a7 7 0 0 1-14 0c0-5 3-11 7-11z"/>',
    incubator: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h8M8 13h8M10 17h4"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.2"/>',
    wallet: '<rect x="3" y="6" width="18" height="14" rx="3"/><path d="M3 10h18M16 15h2"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-4 3-6 6.5-6s6.5 2 6.5 6M17 11a3 3 0 1 0 0-6M21.5 19c0-3-1.5-4.5-4-5"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
    more: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    logout: '<path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 8l4 4-4 4M20 12H9"/>',
    download: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
  };
  GT.icon = (name) =>
    `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;

  /* ---------- State ---------- */
  GT.S = {
    token: null,
    refresh: null,
    user: null,
    data: { birds: [], pairs: [], batches: [], sales: [], expenses: [], incubators: [], settings: {} },
    filters: { q: '', sex: '', status: '', bloodline: '' },
    period: { key: 'month', from: '', to: '' },
  };
  const S = GT.S;

  GT.saveSession = () => {
    localStorage.setItem('gt_session', JSON.stringify({ token: S.token, refresh: S.refresh, user: S.user }));
  };
  GT.restoreSession = () => {
    try {
      const x = JSON.parse(localStorage.getItem('gt_session') || 'null');
      if (x && x.token) { S.token = x.token; S.refresh = x.refresh; S.user = x.user; }
    } catch (e) { /* ignore */ }
  };
  GT.clearSession = () => {
    S.token = S.refresh = S.user = null;
    localStorage.removeItem('gt_session');
  };

  /* ---------- API ---------- */
  async function refreshToken() {
    if (!S.refresh) return false;
    try {
      const r = await fetch('/api/refresh', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh: S.refresh }),
      });
      if (!r.ok) return false;
      const j = await r.json();
      S.token = j.token; S.refresh = j.refresh; GT.saveSession();
      return true;
    } catch (e) { return false; }
  }

  GT.api = async function (path, opts = {}) {
    const send = () =>
      fetch('/api' + path, {
        method: opts.method || 'GET',
        headers: {
          ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
          ...(S.token ? { Authorization: 'Bearer ' + S.token } : {}),
        },
        body: opts.body ? JSON.stringify(opts.body) : undefined,
      });
    let r;
    try { r = await send(); } catch (e) { throw new Error('Cannot reach the server. Check your internet connection.'); }
    if (r.status === 401 && !opts.noRefresh && S.refresh && (await refreshToken())) r = await send();
    if (opts.blob) {
      if (!r.ok) throw new Error('The download failed. Please try again.');
      return r.blob();
    }
    const j = await r.json().catch(() => ({}));
    if (r.status === 401 && !opts.noRefresh) {
      GT.clearSession();
      if (GT.onLoggedOut) GT.onLoggedOut();
      throw new Error(j.error || 'Please log in again.');
    }
    if (!r.ok) throw new Error(j.error || 'Something went wrong. Please try again.');
    return j;
  };

  GT.load = async function () {
    const d = await GT.api('/data');
    S.data = d;
    if (d.me) { S.user = d.me; GT.saveSession(); }
  };

  /* ---------- Lookups ---------- */
  GT.bird = (id) => S.data.birds.find((b) => b.id === id);
  GT.pair = (id) => S.data.pairs.find((p) => p.id === id);
  GT.batch = (id) => S.data.batches.find((b) => b.id === id);
  GT.incubator = (id) => S.data.incubators.find((i) => i.id === id);
  GT.pairLabel = (p) => (p ? 'PAIR-' + GT.pad3(p.pair_no) : 'Unknown pair');
  GT.batchLabel = (b) => (b ? 'BATCH-' + GT.pad3(b.batch_no) : '');
  GT.birdLabel = (b) => (b ? b.band_id + (b.name ? ' ' + b.name : '') : 'Unknown');
  GT.byBand = (a, b) => a.band_id.localeCompare(b.band_id, undefined, { numeric: true });
  GT.bloodlines = () => {
    const set = new Set();
    (S.data.settings.bloodlines || '').split(',').forEach((x) => x.trim() && set.add(x.trim()));
    S.data.birds.forEach((b) => b.bloodline && set.add(b.bloodline));
    return [...set].sort((a, b) => a.localeCompare(b));
  };

  /* ---------- Toast ---------- */
  GT.toast = (msg, type) => {
    const box = GT.$('#toast');
    const el = document.createElement('div');
    el.className = 'toast' + (type === 'err' ? ' err' : '');
    el.textContent = msg;
    box.appendChild(el);
    setTimeout(() => el.remove(), type === 'err' ? 5200 : 3200);
  };

  /* ---------- Photos ---------- */
  function resizeImage(file, max = 900) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * s);
        c.height = Math.round(img.height * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => reject(new Error('Could not read that photo.'));
      img.src = url;
    });
  }
  GT.uploadPhotoIfNew = async (vals) => {
    if (vals.photo_url && vals.photo_url.startsWith('data:')) {
      vals.photo_url = (await GT.api('/photos', { method: 'POST', body: { data: vals.photo_url } })).url;
    }
  };

  /* ---------- Forms in a dialog ---------- */
  const opt = (v, l, sel) => `<option value="${GT.esc(v)}"${String(sel) === String(v) ? ' selected' : ''}>${GT.esc(l)}</option>`;

  function fieldHtml(f, val) {
    val = val ?? f.def ?? '';
    const id = 'f_' + f.name;
    const e = GT.esc;
    let ctl = '';
    let labelTag = `<label for="${id}">${e(f.label)}</label>`;
    switch (f.type) {
      case 'select':
        ctl = `<select id="${id}" name="${f.name}"><option value="">${e(f.blank || 'Select')}</option>${(f.options || []).map((o) => opt(o.v, o.l, val)).join('')}</select>`;
        break;
      case 'seg':
        labelTag = `<span class="lbl">${e(f.label)}</span>`;
        ctl = `<div class="seg" role="radiogroup">${f.options.map((o) => `<label><input type="radio" name="${f.name}" value="${e(o.v)}"${val === o.v ? ' checked' : ''}><span>${e(o.l)}</span></label>`).join('')}</div>`;
        break;
      case 'textarea':
        ctl = `<textarea id="${id}" name="${f.name}" placeholder="${e(f.placeholder || '')}">${e(val)}</textarea>`;
        break;
      case 'photo':
        labelTag = `<span class="lbl">${e(f.label)}</span>`;
        ctl = `<div class="photo-box"><div class="photo-prev" data-prev>${val ? `<img src="${e(val)}" alt="">` : GT.icon('bird')}</div>
          <div><input type="file" accept="image/*" data-photo><input type="hidden" name="${f.name}" value="${e(val)}"><p class="help">Take a photo or choose one from your phone.</p></div></div>`;
        break;
      default: {
        const type = f.type || 'text';
        const attrs = [
          `type="${type}"`, `id="${id}"`, `name="${f.name}"`, `value="${e(val)}"`,
          f.placeholder ? `placeholder="${e(f.placeholder)}"` : '',
          type === 'number' ? `inputmode="decimal" step="${f.step || 'any'}" min="${f.min ?? 0}"` : '',
          f.list ? `list="dl_${f.name}"` : '',
          type === 'password' ? 'autocomplete="new-password"' : '',
          f.name === 'band_id' ? 'autocapitalize="characters"' : '',
        ].filter(Boolean).join(' ');
        ctl = `<input ${attrs}>`;
        if (f.list) ctl += `<datalist id="dl_${f.name}">${f.list.map((x) => `<option value="${e(x)}">`).join('')}</datalist>`;
      }
    }
    const help = f.help ? `<p class="help">${e(f.help)}</p>` : '';
    return `${f.section ? `<h3 class="sec">${e(f.section)}</h3>` : ''}<div class="f${f.w === 'half' ? ' half' : ''}">${labelTag}${ctl}${help}</div>`;
  }

  /*  openForm({ title, fields, values, submit, note, onSubmit(vals), after(result) })  */
  GT.openForm = function (cfg) {
    const dlg = GT.$('#dlg');
    const values = cfg.values || {};
    const main = cfg.fields.filter((f) => !f.more);
    const more = cfg.fields.filter((f) => f.more);
    dlg.innerHTML = `<form class="form" novalidate>
      <header><h2>${GT.esc(cfg.title)}</h2><button type="button" class="x" data-close aria-label="Close">×</button></header>
      <div class="fields">
        ${main.map((f) => fieldHtml(f, values[f.name])).join('')}
        ${more.length ? `<details class="more"><summary>More details</summary><div class="inner">${more.map((f) => fieldHtml(f, values[f.name])).join('')}</div></details>` : ''}
      </div>
      ${cfg.note ? `<p class="note-line">${GT.esc(cfg.note)}</p>` : ''}
      <p class="err" hidden></p>
      <footer><button type="button" class="btn ghost" data-close>Cancel</button><button class="btn primary${cfg.danger ? ' danger' : ''}" type="submit">${GT.esc(cfg.submit || 'Save')}</button></footer>
    </form>`;
    const form = GT.$('form', dlg);
    const errBox = GT.$('.err', form);
    const showErr = (m) => { errBox.textContent = m; errBox.hidden = false; errBox.scrollIntoView({ block: 'nearest' }); };

    GT.$$('[data-photo]', form).forEach((inp) => {
      inp.addEventListener('change', async () => {
        const file = inp.files[0];
        if (!file) return;
        try {
          const dataUrl = await resizeImage(file);
          GT.$('input[type=hidden]', inp.parentElement).value = dataUrl;
          GT.$('[data-prev]', form).innerHTML = `<img src="${dataUrl}" alt="">`;
        } catch (e) { showErr(e.message); }
      });
    });

    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      errBox.hidden = true;
      const vals = {};
      new FormData(form).forEach((v, k) => { vals[k] = typeof v === 'string' ? v.trim() : v; });
      for (const f of cfg.fields) {
        if (f.required && !vals[f.name]) {
          const det = GT.$(`[name="${f.name}"]`, form)?.closest('details');
          if (det) det.open = true;
          return showErr(`${f.label} is required.`);
        }
      }
      const btn = GT.$('button[type=submit]', form);
      btn.disabled = true;
      try {
        const result = await cfg.onSubmit(vals);
        dlg.close();
        if (cfg.after) cfg.after(result);
      } catch (e) {
        showErr(e.message || 'Something went wrong.');
        btn.disabled = false;
      }
    });

    dlg.showModal();
    const first = GT.$('input:not([type=hidden]):not([type=radio]):not([type=file]), select', form);
    if (first && window.matchMedia('(min-width: 861px)').matches) first.focus();
  };

  GT.confirmBox = function (title, message, okLabel = 'Delete', danger = true) {
    return new Promise((resolve) => {
      const dlg = GT.$('#dlg');
      let answer = false;
      dlg.innerHTML = `<form class="form" novalidate>
        <header><h2>${GT.esc(title)}</h2></header>
        <div class="fields"><p class="f">${GT.esc(message)}</p></div>
        <footer><button type="button" class="btn ghost" data-close>Cancel</button><button class="btn ${danger ? 'danger' : 'primary'}" type="submit">${GT.esc(okLabel)}</button></footer>
      </form>`;
      GT.$('form', dlg).addEventListener('submit', (e) => { e.preventDefault(); answer = true; dlg.close(); });
      dlg.addEventListener('close', () => resolve(answer), { once: true });
      dlg.showModal();
    });
  };

  document.addEventListener('click', (e) => {
    const dlg = GT.$('#dlg');
    if (e.target.closest('[data-close]') && dlg.open) { dlg.close(); return; }
    if (e.target === dlg) dlg.close();
  });

  GT.download = async function (path, filename) {
    try {
      const blob = await GT.api(path, { blob: true });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    } catch (e) { GT.toast(e.message, 'err'); }
  };
})();
