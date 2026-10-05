/* Every screen of the app. Each view returns HTML. */
(function () {
  'use strict';
  const GT = window.GT;
  const { S, esc, icon, peso, sum, rate, fmtDate, today, daysBetween } = GT;
  const V = (GT.views = {});

  /* ---------- Shared pieces ---------- */
  const head = (title, sub, actions = '') =>
    `<div class="page-head"><div><h1>${esc(title)}</h1>${sub ? `<p class="sub">${esc(sub)}</p>` : ''}<span class="rule"></span></div><div class="actions">${actions}</div></div>`;
  const addBtn = (act, label, cls = '', id = '') =>
    `<button class="btn ${cls}" data-act="${act}"${id ? ` data-id="${id}"` : ''}>${icon('plus')}${esc(label)}</button>`;
  const empty = (title, text, btn = '') => `<div class="empty"><b>${esc(title)}</b>${esc(text)}<br>${btn}</div>`;
  const notFound = (what) =>
    `<a class="back" href="#/">${icon('back')}Home</a>${empty(`${what} not found`, 'It may have been deleted.')}`;
  const badge = (cls, text) => `<span class="badge ${cls}">${esc(text)}</span>`;
  const thumb = (b) => `<span class="thumb">${b && b.photo_url ? `<img src="${esc(b.photo_url)}" alt="" loading="lazy">` : icon('bird')}</span>`;
  const smallBtn = (act, label, id, cls = 'ghost') => `<button class="btn sm ${cls}" data-act="${act}" data-id="${id}">${esc(label)}</button>`;

  /* ---------- Numbers ---------- */
  function stats() {
    const { birds, pairs, batches, sales, expenses } = S.data;
    const active = birds.filter((b) => b.status === 'active');
    const done = batches.filter((b) => b.status === 'hatched');
    const incubating = batches.filter((b) => b.status === 'incubating');
    const hatched = sum(done, 'eggs_hatched');
    const eggsDone = sum(done, 'eggs_set');
    const benta = sum(sales, 'price');
    const gastos = sum(expenses, 'amount');
    return {
      active: active.length,
      tandang: active.filter((b) => b.sex === 'tandang').length,
      inahin: active.filter((b) => b.sex === 'inahin').length,
      pairs: pairs.filter((p) => p.status === 'active').length,
      eggsInc: sum(incubating, 'eggs_set'),
      hatched,
      rate: rate(hatched, eggsDone),
      benta, gastos, net: benta - gastos,
    };
  }

  function pairStats(p) {
    const bs = S.data.batches.filter((b) => b.pair_id === p.id);
    const done = bs.filter((b) => b.status === 'hatched');
    const hatched = sum(done, 'eggs_hatched');
    return {
      bs,
      records: bs.length,
      eggs: sum(bs, 'eggs_set'),
      hatched,
      doneEggs: sum(done, 'eggs_set'),
      rate: rate(hatched, sum(done, 'eggs_set')),
      kids: S.data.birds.filter((c) => c.sire_id === p.tandang_id && c.dam_id === p.inahin_id),
    };
  }

  const daysLeftText = (expected) => {
    const d = daysBetween(today(), expected);
    if (d < 0) return `${-d} day${d === -1 ? '' : 's'} overdue`;
    if (d === 0) return 'due today';
    return `${d} day${d === 1 ? '' : 's'} to go`;
  };

  /* ---------- Home ---------- */
  const SEASON = [
    ['2026-10-01', '2026-10-31', 'October 2026', 'Breeder preparation', 'Select healthy breeders; check records; prepare housing and equipment.'],
    ['2026-11-01', '2026-11-30', 'November 2026', 'Priming / preparation', 'Condition breeders and establish pairing records.'],
    ['2026-12-01', '2026-12-31', 'December 2026', 'Breeding begins', 'Record every pairing and breeding date.'],
    ['2027-01-01', '2027-01-31', 'January 2027', 'Breeding and hatching', 'Track eggs, incubation, hatching and chick records.'],
    ['2027-02-01', '2027-02-28', 'February 2027', 'Breeding continues', 'Continue pairing and hatch records as applicable.'],
    ['2027-03-01', '2027-03-31', 'March 2027', 'Hatching', 'Finalize hatch records and identify chicks.'],
    ['2027-04-01', '2027-04-20', 'April 1–20, 2027', 'Wingbanding', 'Record wingband, date, sex and status for each chick.'],
  ];

  V.home = () => {
    const st = stats();
    const inc = S.data.batches
      .filter((b) => b.status === 'incubating')
      .sort((a, b) => (a.expected_hatch || '').localeCompare(b.expected_hatch || ''));
    let sub = 'No eggs in the incubator right now.';
    if (inc.length) {
      sub = `${st.eggsInc} egg${st.eggsInc === 1 ? '' : 's'} incubating. Next hatch: ${daysLeftText(inc[0].expected_hatch)}.`;
    }
    const t = today();
    const showSeason = t <= '2027-04-30';
    return `
      <section class="hero">
        <p class="hero-date">${esc(GT.longDate(t))}</p>
        <h1>${esc(S.data.settings.farm_name || 'Gamefowl Tracker')}</h1>
        <p class="hero-sub">${esc(sub)}</p>
        <div class="quick">
          <button class="qbtn first" data-act="addBird">${icon('plus')}Add bird</button>
          <button class="qbtn" data-act="addPair">${icon('pairs')}Create pair</button>
          <button class="qbtn" data-act="recordHatch">${icon('egg')}Record hatch</button>
          <button class="qbtn" data-act="addSale">${icon('tag')}Record sale</button>
          <button class="qbtn" data-act="addExpense">${icon('wallet')}Add expense</button>
        </div>
      </section>

      <div class="stat-group"><h3>Birds</h3><div class="stats">
        <div class="stat"><b>${st.active}</b><span>Active birds</span></div>
        <div class="stat"><b>${st.tandang}</b><span>Tandang</span></div>
        <div class="stat"><b>${st.inahin}</b><span>Inahin</span></div>
      </div></div>

      <div class="stat-group"><h3>Breeding</h3><div class="stats">
        <div class="stat"><b>${st.pairs}</b><span>Active pairs</span></div>
        <div class="stat"><b>${st.eggsInc}</b><span>Eggs incubating</span></div>
        <div class="stat"><b>${st.hatched}</b><span>Pisâ hatched</span></div>
        <div class="stat"><b>${st.rate}</b><span>Hatch rate</span></div>
      </div></div>

      <div class="stat-group"><h3>Money</h3><div class="stats">
        <div class="stat"><b>${peso(st.benta)}</b><span>Total sales</span></div>
        <div class="stat"><b>${peso(st.gastos)}</b><span>Total expenses</span></div>
        <div class="stat net${st.net < 0 ? ' neg' : ''}"><b>${peso(st.net)}</b><span>Net income</span></div>
      </div></div>

      <h2 class="sec-title">In the incubator</h2>
      ${inc.length
        ? `<div class="list">${inc.map((b) => batchRow(b)).join('')}</div>`
        : empty('Nothing incubating', 'When you set eggs, they show up here with the hatch date.', addBtn('addBatch', 'Record eggs'))}

      ${showSeason ? `<h2 class="sec-title">Breeding season 2026–2027</h2>
      <div class="season"><ul>${SEASON.map(([a, b, when, task, note]) =>
        `<li class="${t >= a && t <= b ? 'now' : ''}"><b>${esc(when)}</b><span><b>${esc(task)}.</b> ${esc(note)}</span></li>`).join('')}</ul></div>` : ''}
    `;
  };

  /* ---------- Birds ---------- */
  function birdSearchText(b) {
    const pairs = S.data.pairs.filter((p) => p.tandang_id === b.id || p.inahin_id === b.id).map(GT.pairLabel);
    const sale = S.data.sales.find((s) => s.bird_id === b.id);
    return [b.band_id, b.name, b.bloodline, b.color, GT.STATUS[b.status], GT.SEX[b.sex], ...pairs, sale && sale.buyer]
      .filter(Boolean).join(' ').toLowerCase();
  }
  function filteredBirds() {
    const f = S.filters;
    const q = f.q.trim().toLowerCase();
    return S.data.birds
      .filter((b) => (!f.sex || b.sex === f.sex) && (!f.status || b.status === f.status) && (!f.bloodline || b.bloodline === f.bloodline))
      .filter((b) => !q || birdSearchText(b).includes(q))
      .sort(GT.byBand);
  }
  function birdRow(b) {
    return `<a class="row" href="#/birds/${b.id}">${thumb(b)}
      <span class="grow"><span class="title">${esc(b.band_id)}${b.name ? ' ' + esc(b.name) : ''}</span>
      <small>${GT.SEX[b.sex]}${b.bloodline ? ', ' + esc(b.bloodline) + ' bloodline' : ''}</small></span>
      ${badge(b.status, GT.STATUS[b.status])}</a>`;
  }
  GT.birdListHtml = () => {
    if (!S.data.birds.length) {
      return empty('No birds yet', 'Add your first tandang or inahin to start your records.', addBtn('addBird', 'Add bird', 'brass'));
    }
    const list = filteredBirds();
    if (!list.length) return `<div class="empty"><b>No birds found</b>Try a different search or clear the filters.</div>`;
    return `<p class="count">${list.length} bird${list.length === 1 ? '' : 's'}</p><div class="list">${list.map(birdRow).join('')}</div>`;
  };

  V.birds = () => {
    const f = S.filters;
    const lines = [...new Set(S.data.birds.map((b) => b.bloodline).filter(Boolean))].sort();
    const chip = (key, label) => `<a class="chip${f.sex === key ? ' on' : ''}" href="#/birds${key ? '?sex=' + key : ''}">${label}</a>`;
    return `${head(f.sex ? GT.SEX[f.sex] : 'Birds', 'Every tandang, inahin and sisiw on the farm.', addBtn('addBird', 'Add bird', 'brass'))}
      <div class="filters">
        <input class="search" type="search" placeholder="Search band ID, name, bloodline, pair or buyer" value="${esc(f.q)}" data-search aria-label="Search birds">
        <div class="filter-line">
          ${chip('', 'All')}${chip('tandang', 'Tandang')}${chip('inahin', 'Inahin')}${chip('sisiw', 'Sisiw')}
          <select data-filter="status" aria-label="Status"><option value="">All status</option>${Object.entries(GT.STATUS).map(([k, l]) => `<option value="${k}"${f.status === k ? ' selected' : ''}>${l}</option>`).join('')}</select>
          <select data-filter="bloodline" aria-label="Bloodline"><option value="">All bloodlines</option>${lines.map((l) => `<option${f.bloodline === l ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>
        </div>
      </div>
      <div id="birdlist">${GT.birdListHtml()}</div>`;
  };

  /* ---------- Bird profile ---------- */
  function pedNode(id, depth, self) {
    const b = id ? GT.bird(id) : null;
    const card = b
      ? `<${self ? 'div' : 'a href="#/birds/' + b.id + '"'} class="pcard ${self ? 'self' : b.sex}"><b>${esc(b.band_id)}</b><small>${esc(b.name || GT.SEX[b.sex])}</small></${self ? 'div' : 'a'}>`
      : `<div class="pcard unk"><small>Unknown / Hindi Naitala</small></div>`;
    if (!b || depth === 0) return `<div class="pn">${card}</div>`;
    return `<div class="pn">${card}<div class="pk">${pedNode(b.sire_id, depth - 1)}${pedNode(b.dam_id, depth - 1)}</div></div>`;
  }

  V.bird = (id) => {
    const b = GT.bird(id);
    if (!b) return notFound('Bird');
    const sire = GT.bird(b.sire_id);
    const dam = GT.bird(b.dam_id);
    const kids = S.data.birds.filter((c) => c.sire_id === b.id || c.dam_id === b.id).sort(GT.byBand);
    const pairs = S.data.pairs.filter((p) => p.tandang_id === b.id || p.inahin_id === b.id);
    const sale = S.data.sales.find((s) => s.bird_id === b.id);
    const parent = (label, p) => p
      ? `<a class="parent" href="#/birds/${p.id}"><small>${label}</small><b>${esc(p.band_id)}</b> ${esc(p.name || '')}</a>`
      : `<div class="parent unk"><small>${label}</small>Unknown / Hindi Naitala</div>`;

    return `<a class="back" href="#/birds">${icon('back')}All birds</a>
      <div class="profile">
        <div class="profile-photo">${b.photo_url ? `<img src="${esc(b.photo_url)}" alt="Photo of ${esc(b.band_id)}">` : icon('bird')}</div>
        <div>
          <p class="band">${esc(b.band_id)}</p>
          <h1>${esc(b.name || GT.SEX[b.sex])}</h1>
          <div class="facts">
            <div><span>Sex</span><b>${GT.SEX[b.sex]}</b></div>
            <div><span>Status</span>${badge(b.status, GT.STATUS[b.status])}</div>
            <div><span>Bloodline</span><b>${esc(b.bloodline || 'Not recorded')}</b></div>
            <div><span>Color</span><b>${esc(b.color || 'Not recorded')}</b></div>
            <div><span>Date of hatch</span><b>${b.hatch_date ? fmtDate(b.hatch_date) : 'Not recorded'}</b></div>
            ${b.wingband_no ? `<div><span>Wingband</span><b>${esc(b.wingband_no)}${b.wingband_date ? ' (' + fmtDate(b.wingband_date) + ')' : ''}</b></div>` : ''}
          </div>
          ${b.notes ? `<p class="note" style="margin-bottom:14px">${esc(b.notes)}</p>` : ''}
          <div class="actions">
            ${smallBtn('editBird', 'Edit bird', b.id)}
            ${b.status === 'active' ? smallBtn('addSale', 'Sell this bird', b.id, 'brass') : ''}
            ${smallBtn('deleteBird', 'Delete', b.id, 'danger')}
          </div>
        </div>
      </div>

      <h2 class="sec-title">Parents</h2>
      <div class="parents">${parent('Father (Ama)', sire)}${parent('Mother (Ina)', dam)}</div>

      <h2 class="sec-title">Bloodline and pedigree</h2>
      <div class="ped">${pedNode(b.id, 3, true)}
        <div class="ped-legend"><span><i style="background:var(--pine)"></i>Tandang</span><span><i style="background:var(--brass)"></i>Inahin</span></div></div>

      <h2 class="sec-title">Mga anak<small>${kids.length}</small></h2>
      ${kids.length ? `<div class="list">${kids.map(birdRow).join('')}</div>` : empty('No chicks yet', 'Chicks hatched from this bird’s pairs will appear here.')}

      <h2 class="sec-title">Breeding history</h2>
      ${pairs.length ? `<div class="list">${pairs.map((p) => {
        const st = pairStats(p);
        const other = GT.bird(p.tandang_id === b.id ? p.inahin_id : p.tandang_id);
        return `<a class="row" href="#/pairs/${p.id}"><span class="grow"><span class="title">${GT.pairLabel(p)}</span><small>With ${esc(GT.birdLabel(other))}</small></span>
          <span class="end"><b>${st.hatched}</b><small>of ${st.eggs} eggs, ${st.rate}</small></span></a>`;
      }).join('')}</div>` : empty('No pairs yet', 'Pairs this bird is part of will show here.')}

      ${sale ? `<h2 class="sec-title">Sales history</h2>
        <div class="row"><span class="grow"><span class="title">Sold to ${esc(sale.buyer || 'Unknown buyer')}</span><small>${fmtDate(sale.date_sold)}</small></span>
        <span class="end"><b>${peso(sale.price)}</b></span></div>` : ''}`;
  };

  /* ---------- Pairs ---------- */
  V.pairs = () => {
    const pairs = [...S.data.pairs].sort((a, b) => b.pair_no - a.pair_no);
    return `${head('Pairs', 'Tandang and inahin that are bred together.', addBtn('addPair', 'Create pair', 'brass'))}
      ${pairs.length ? `<div class="cards">${pairs.map((p) => {
        const st = pairStats(p);
        return `<a class="card" href="#/pairs/${p.id}">
          <div class="pair-top"><b>${GT.pairLabel(p)}</b>${badge(p.status, GT.PAIR_STATUS[p.status])}</div>
          <div class="pair-birds"><span>Tandang <b>${esc(GT.birdLabel(GT.bird(p.tandang_id)))}</b></span><span>Inahin <b>${esc(GT.birdLabel(GT.bird(p.inahin_id)))}</b></span></div>
          <div class="mini"><span><b>${st.eggs}</b> eggs</span><span><b>${st.hatched}</b> hatched</span><span><b>${st.rate}</b></span></div></a>`;
      }).join('')}</div>` : empty('No pairs yet', 'Pick a tandang and an inahin to start a breeding pair.', addBtn('addPair', 'Create pair', 'brass'))}`;
  };

  V.pair = (id) => {
    const p = GT.pair(id);
    if (!p) return notFound('Pair');
    const t = GT.bird(p.tandang_id);
    const i = GT.bird(p.inahin_id);
    const st = pairStats(p);
    const bs = [...st.bs].sort((a, b) => b.batch_no - a.batch_no);
    const birdCard = (label, b) => `<a class="parent" href="#/birds/${b.id}"><small>${label}</small><b>${esc(b.band_id)}</b> ${esc(b.name || '')}${b.bloodline ? `<small>${esc(b.bloodline)} bloodline</small>` : ''}</a>`;
    return `<a class="back" href="#/pairs">${icon('back')}All pairs</a>
      ${head(GT.pairLabel(p), p.date_started ? 'Paired on ' + fmtDate(p.date_started) : '',
        `${badge(p.status, GT.PAIR_STATUS[p.status])} ${smallBtn('addBatch', 'Record eggs', p.id, 'brass')} ${smallBtn('editPair', 'Edit', p.id)} ${smallBtn('deletePair', 'Delete', p.id, 'danger')}`)}
      <div class="parents">${birdCard('Tandang', t)}${birdCard('Inahin', i)}</div>
      <div class="stats small" style="margin-top:16px">
        <div class="stat"><b>${st.records}</b><span>Hatch records</span></div>
        <div class="stat"><b>${st.eggs}</b><span>Total eggs</span></div>
        <div class="stat"><b>${st.hatched}</b><span>Total pisâ</span></div>
        <div class="stat"><b>${st.rate}</b><span>Hatch rate</span></div>
      </div>
      ${p.notes ? `<p class="note" style="margin-top:14px">${esc(p.notes)}</p>` : ''}
      <h2 class="sec-title">Eggs and hatch records</h2>
      ${bs.length ? `<div class="list">${bs.map((b) => batchRow(b, false)).join('')}</div>` : empty('No eggs recorded', 'Record the eggs when you collect and set them.', addBtn('addBatch', 'Record eggs', 'brass', p.id))}
      <h2 class="sec-title">Offspring<small>${st.kids.length}</small></h2>
      ${st.kids.length ? `<div class="list">${st.kids.sort(GT.byBand).map(birdRow).join('')}</div>` : empty('No chicks registered', 'After a hatch, register the chicks and they are linked to both parents.')}`;
  };

  /* ---------- Hatch records ---------- */
  function batchRow(b, showPair = true) {
    const p = GT.pair(b.pair_id);
    const inc = GT.incubator(b.incubator_id);
    const reg = S.data.birds.filter((x) => x.batch_id === b.id).length;
    const done = b.status === 'hatched';
    const left = done ? b.eggs_hatched - reg : 0;
    return `<div class="row stack"><div class="grow">
        <div class="title">${GT.batchLabel(b)}${showPair && p ? ` <a class="muted" href="#/pairs/${p.id}">${GT.pairLabel(p)}</a>` : ''}</div>
        <small>${b.eggs_set} eggs set on ${fmtDate(b.date_set)}${inc ? ' in ' + esc(inc.name) : ''}</small>
        <small>${done
          ? `${b.eggs_hatched} hatched, ${b.eggs_set - b.eggs_hatched} not hatched. Hatch rate ${rate(b.eggs_hatched, b.eggs_set)}. ${reg} chick${reg === 1 ? '' : 's'} registered.`
          : `Expected hatch ${fmtDate(b.expected_hatch)} (${daysLeftText(b.expected_hatch)})`}</small>
        <div class="row-actions">
          ${done ? (left > 0 ? smallBtn('addChicks', `Register chicks (${left} left)`, b.id, 'brass') : '') : smallBtn('recordHatch', 'Record hatch', b.id, 'brass')}
          ${smallBtn('editBatch', 'Edit', b.id)}${smallBtn('deleteBatch', 'Delete', b.id, 'danger')}
        </div></div>
        ${badge(b.status, done ? 'Hatched' : 'Incubating')}</div>`;
  }
  GT.batchRow = batchRow;

  V.hatch = () => {
    const all = [...S.data.batches].sort((a, b) => b.batch_no - a.batch_no);
    const inc = all.filter((b) => b.status === 'incubating').sort((a, b) => (a.expected_hatch || '').localeCompare(b.expected_hatch || ''));
    const done = all.filter((b) => b.status === 'hatched');
    return `${head('Hatch records', 'Eggs set in the incubator and what hatched.', `${addBtn('addBatch', 'Record eggs', 'brass')}`)}
      <h2 class="sec-title" style="margin-top:0">In the incubator<small>${inc.length}</small></h2>
      ${inc.length ? `<div class="list">${inc.map((b) => batchRow(b)).join('')}</div>` : empty('Nothing incubating', 'Record eggs when you set them. The hatch date is worked out for you.', addBtn('addBatch', 'Record eggs'))}
      <h2 class="sec-title">Hatched<small>${done.length}</small></h2>
      ${done.length ? `<div class="list">${done.map((b) => batchRow(b)).join('')}</div>` : empty('No hatch results yet', 'Results appear here after you record a hatch.')}`;
  };

  /* ---------- Incubator ---------- */
  V.incubator = () => {
    const incs = S.data.incubators;
    const running = S.data.batches.filter((b) => b.status === 'incubating');
    const mini = (b) => {
      const p = GT.pair(b.pair_id);
      return `<div class="row"><span class="grow"><span class="title">${GT.batchLabel(b)} <span class="muted">${GT.pairLabel(p)}</span></span>
        <small>${b.eggs_set} eggs, set ${fmtDate(b.date_set)}</small><small>Expected hatch ${fmtDate(b.expected_hatch)} (${daysLeftText(b.expected_hatch)})</small></span>${badge('incubating', 'Incubating')}</div>`;
    };
    const card = (i) => {
      const inside = running.filter((b) => b.incubator_id === i.id);
      const used = sum(inside, 'eggs_set');
      const pct = Math.min(100, Math.round((used / i.capacity) * 100));
      return `<div class="card" style="margin-bottom:14px">
        <div class="pair-top"><b>${esc(i.name)}</b><span class="actions">${smallBtn('editIncubator', 'Edit', i.id)}${smallBtn('deleteIncubator', 'Delete', i.id, 'danger')}</span></div>
        <div class="stats small"><div class="stat"><b>${i.capacity}</b><span>Capacity</span></div><div class="stat"><b>${used}</b><span>Currently used</span></div><div class="stat"><b>${Math.max(0, i.capacity - used)}</b><span>Available</span></div></div>
        <div class="progress" aria-hidden="true"><i style="width:${pct}%"></i></div>
        <h3 style="font-size:16px;margin:14px 0 10px">Active batches</h3>
        ${inside.length ? `<div class="list">${inside.map(mini).join('')}</div>` : '<p class="muted">No eggs in this incubator.</p>'}</div>`;
    };
    const loose = running.filter((b) => !b.incubator_id);
    return `${head('Incubator', 'Space and active batches.', addBtn('addIncubator', 'Add incubator', 'brass'))}
      ${incs.length ? incs.map(card).join('') : empty('No incubator yet', 'Add Incubator #1 and its capacity to see how many eggs it holds.', addBtn('addIncubator', 'Add incubator', 'brass'))}
      ${loose.length ? `<h2 class="sec-title">Eggs not assigned to an incubator</h2><div class="list">${loose.map(mini).join('')}</div>` : ''}`;
  };

  /* ---------- Sales ---------- */
  V.sales = () => {
    const sales = [...S.data.sales].sort((a, b) => b.date_sold.localeCompare(a.date_sold));
    return `${head('Sales', 'Every bird you sold.', addBtn('addSale', 'Record sale', 'brass'))}
      <div class="stats small" style="margin-bottom:18px">
        <div class="stat"><b>${peso(sum(sales, 'price'))}</b><span>Total sales</span></div>
        <div class="stat"><b>${sales.length}</b><span>Birds sold</span></div></div>
      ${sales.length ? `<div class="list">${sales.map((s) => {
        const b = GT.bird(s.bird_id);
        return `<div class="row stack">${thumb(b)}<div class="grow"><a class="title" href="#/birds/${s.bird_id}">${esc(GT.birdLabel(b))}</a>
          <small>Sold to ${esc(s.buyer || 'Unknown buyer')} on ${fmtDate(s.date_sold)}</small>
          <div class="row-actions">${smallBtn('editSale', 'Edit', s.id)}${smallBtn('deleteSale', 'Delete', s.id, 'danger')}</div></div>
          <span class="end"><b>${peso(s.price)}</b></span></div>`;
      }).join('')}</div>` : empty('No sales yet', 'When you sell a bird, record it here and its status changes to Sold.', addBtn('addSale', 'Record sale', 'brass'))}`;
  };

  /* ---------- Expenses ---------- */
  V.expenses = () => {
    const list = [...S.data.expenses].sort((a, b) => b.date.localeCompare(a.date));
    return `${head('Expenses', 'Feed, medicine, equipment and everything else you spend.', addBtn('addExpense', 'Add expense', 'brass'))}
      <div class="stats small" style="margin-bottom:18px"><div class="stat"><b>${peso(sum(list, 'amount'))}</b><span>Total expenses</span></div><div class="stat"><b>${list.length}</b><span>Records</span></div></div>
      ${list.length ? `<div class="list">${list.map((x) => `<div class="row stack"><div class="grow"><span class="title">${esc(x.category)}</span>
        <small>${fmtDate(x.date)}${x.description ? ': ' + esc(x.description) : ''}</small>
        <div class="row-actions">${smallBtn('editExpense', 'Edit', x.id)}${smallBtn('deleteExpense', 'Delete', x.id, 'danger')}</div></div>
        <span class="end"><b>${peso(x.amount)}</b></span></div>`).join('')}</div>` : empty('No expenses yet', 'Record feed, vitamins, medicine and other costs to see your net income.', addBtn('addExpense', 'Add expense', 'brass'))}`;
  };

  /* ---------- Reports ---------- */
  function periodRange() {
    const p = S.period;
    const now = new Date();
    if (p.key === 'all') return [null, null];
    if (p.key === 'custom') return [p.from || null, p.to || null];
    if (p.key === 'week') {
      const d = new Date(now);
      d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      const start = GT.iso(d);
      return [start, GT.addDays(start, 6)];
    }
    if (p.key === 'year') return [`${now.getFullYear()}-01-01`, `${now.getFullYear()}-12-31`];
    return [GT.iso(new Date(now.getFullYear(), now.getMonth(), 1)), GT.iso(new Date(now.getFullYear(), now.getMonth() + 1, 0))];
  }
  const within = (d, [a, b]) => !!d && (!a || d >= a) && (!b || d <= b);

  V.reports = () => {
    const range = periodRange();
    const p = S.period;
    const { birds, pairs } = S.data;
    const batches = S.data.batches.filter((b) => within(b.date_set, range));
    const sales = S.data.sales.filter((s) => within(s.date_sold, range));
    const expenses = S.data.expenses.filter((x) => within(x.date, range));
    const done = batches.filter((b) => b.status === 'hatched');
    const hatched = sum(done, 'eggs_hatched');
    const benta = sum(sales, 'price');
    const gastos = sum(expenses, 'amount');
    const net = benta - gastos;

    const perPair = pairs.map((pr) => {
      const mine = done.filter((b) => b.pair_id === pr.id);
      return { pr, eggs: sum(mine, 'eggs_set'), hatched: sum(mine, 'eggs_hatched') };
    }).filter((x) => x.eggs > 0).sort((a, b) => b.hatched / b.eggs - a.hatched / a.eggs || b.hatched - a.hatched).slice(0, 5);

    const byCat = {};
    expenses.forEach((x) => { byCat[x.category] = (byCat[x.category] || 0) + Number(x.amount); });
    const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
    const maxCat = cats.length ? cats[0][1] : 1;
    const byMonth = {};
    expenses.forEach((x) => { const k = x.date.slice(0, 7); byMonth[k] = (byMonth[k] || 0) + Number(x.amount); });
    const months = Object.entries(byMonth).sort((a, b) => b[0].localeCompare(a[0]));

    const chip = (k, l) => `<button class="chip${p.key === k ? ' on' : ''}" data-act="setPeriod" data-id="${k}">${l}</button>`;
    const stat = (v, l, cls = '') => `<div class="stat ${cls}"><b>${v}</b><span>${l}</span></div>`;

    return `${head('Reports', 'Simple numbers about your breeding, birds, sales and spending.')}
      <div class="period">${chip('week', 'This week')}${chip('month', 'This month')}${chip('year', 'This year')}${chip('all', 'All time')}${chip('custom', 'Custom')}
        ${p.key === 'custom' ? `<input type="date" value="${esc(p.from)}" data-period-date="from" aria-label="From date"><input type="date" value="${esc(p.to)}" data-period-date="to" aria-label="To date">` : ''}</div>

      <div class="report-block"><h3>Financial summary</h3><div class="stats">
        ${stat(peso(benta), 'Total sales')}${stat(peso(gastos), 'Total expenses')}${stat(peso(net), 'Net income (sales minus expenses)', 'net' + (net < 0 ? ' neg' : ''))}</div></div>

      <div class="report-block"><h3>Breeding report</h3><div class="stats small">
        ${stat(pairs.length, 'Total pairs')}${stat(pairs.filter((x) => x.status === 'active').length, 'Active pairs')}
        ${stat(sum(batches, 'eggs_set'), 'Total eggs')}${stat(hatched, 'Total hatched')}${stat(rate(hatched, sum(done, 'eggs_set')), 'Hatch rate')}</div>
        <h3 style="font-size:16px;margin:18px 0 6px">Best-performing pairs</h3>
        ${perPair.length ? `<table><thead><tr><th>Pair</th><th class="r">Eggs</th><th class="r">Hatched</th><th class="r">Rate</th></tr></thead><tbody>${perPair.map((x) =>
          `<tr><td><a href="#/pairs/${x.pr.id}"><b>${GT.pairLabel(x.pr)}</b></a> ${esc(GT.bird(x.pr.tandang_id)?.band_id || '')} + ${esc(GT.bird(x.pr.inahin_id)?.band_id || '')}</td><td class="r">${x.eggs}</td><td class="r">${x.hatched}</td><td class="r">${rate(x.hatched, x.eggs)}</td></tr>`).join('')}</tbody></table>`
          : '<p class="muted">No finished hatches in this period.</p>'}</div>

      <div class="report-block"><h3>Bird report</h3><div class="stats small four">
        ${stat(birds.length, 'Total birds')}${stat(birds.filter((b) => b.sex === 'tandang').length, 'Tandang')}${stat(birds.filter((b) => b.sex === 'inahin').length, 'Inahin')}${stat(birds.filter((b) => b.sex === 'sisiw').length, 'Sisiw')}</div>
        <div class="stats small four" style="margin-top:12px">
        ${stat(birds.filter((b) => b.status === 'active').length, 'Active')}${stat(birds.filter((b) => b.status === 'sold').length, 'Sold')}${stat(birds.filter((b) => b.status === 'deceased').length, 'Deceased')}${stat(birds.filter((b) => b.status === 'culled').length, 'Culled')}</div></div>

      <div class="report-block"><h3>Sales report</h3><div class="stats small">${stat(peso(benta), 'Total sales')}${stat(sales.length, 'Birds sold')}${stat(peso(benta), 'Total revenue')}</div></div>

      <div class="report-block"><h3>Expense report</h3><div class="stats small" style="margin-bottom:16px">${stat(peso(gastos), 'Total expenses')}</div>
        ${cats.length ? `<div class="bars">${cats.map(([c, v]) => `<div class="bar-row"><span>${esc(c)}</span><div class="bar"><i style="width:${Math.round((v / maxCat) * 100)}%"></i></div><span class="v">${peso(v)}</span></div>`).join('')}</div>
        <h3 style="font-size:16px;margin:18px 0 6px">Monthly expenses</h3>
        <table><tbody>${months.map(([m, v]) => `<tr><td>${esc(new Date(m + '-01T00:00:00').toLocaleDateString('en-PH', { month: 'long', year: 'numeric' }))}</td><td class="r">${peso(v)}</td></tr>`).join('')}</tbody></table>` : '<p class="muted">No expenses in this period.</p>'}</div>`;
  };

  /* ---------- Users (admin) ---------- */
  V.users = async () => {
    if (S.user.role !== 'admin') return `${head('Users')}${empty('Admin only', 'Only the admin can manage users.')}`;
    const users = await GT.api('/users');
    return `${head('Users', 'Everyone with an account shares the same farm records.', addBtn('addUser', 'Add user', 'brass'))}
      <div class="list">${users.map((u) => `<div class="row stack"><div class="grow"><span class="title">${esc(u.name || u.email)}</span><small>${esc(u.email)}</small>
        <div class="row-actions">${smallBtn('resetPassword', 'Reset password', u.id)}
        ${u.id !== S.user.id ? `${smallBtn('toggleRole', u.role === 'admin' ? 'Make staff' : 'Make admin', u.id)}${smallBtn('deleteUser', 'Remove', u.id, 'danger')}` : ''}</div></div>
        ${badge(u.role === 'admin' ? 'sold' : 'active', u.role === 'admin' ? 'Admin' : 'Staff')}</div>`).join('')}</div>`;
  };

  /* ---------- Settings ---------- */
  V.settings = () => {
    const s = S.data.settings;
    const isAdmin = S.user.role === 'admin';
    const dis = isAdmin ? '' : ' disabled';
    return `${head('Settings', 'Farm details, backup and your account.')}
      <div class="settings-form">
        <div class="f"><label for="set_farm">Farm name</label><input type="text" id="set_farm" value="${esc(s.farm_name || '')}"${dis} placeholder="Shown on the dashboard"></div>
        <div class="f"><label for="set_days">Incubation days</label><input type="number" id="set_days" value="${esc(s.incubation_days || 21)}" min="15" max="30"${dis}><p class="help">The expected hatch date is the date set plus this many days.</p></div>
        <div class="f"><label for="set_lines">Bloodline suggestions</label><input type="text" id="set_lines" value="${esc(s.bloodlines || '')}"${dis}><p class="help">Separate with commas. They appear as suggestions when you add a bird.</p></div>
        ${isAdmin ? `<div><button class="btn" data-act="saveSettings">Save settings</button></div>` : '<p class="note">Only the admin can change these.</p>'}
      </div>
      <h2 class="sec-title">Export and backup</h2>
      <p class="note" style="margin-bottom:12px">Download a copy of your records. Keep one somewhere safe.</p>
      <div class="actions">
        <button class="btn ghost" data-act="exportXlsx">${icon('download')}Excel (all records)</button>
        <button class="btn ghost" data-act="exportJson">${icon('download')}Full backup (JSON)</button>
      </div>
      <p class="note" style="margin:16px 0 8px">Single list as CSV:</p>
      <div class="actions">${['birds', 'pairs', 'batches', 'sales', 'expenses'].map((t) => `<button class="btn sm ghost" data-act="exportCsv" data-id="${t}">${t === 'batches' ? 'hatch records' : t}</button>`).join('')}</div>
      <h2 class="sec-title">Account</h2>
      <p>${esc(S.user.name || S.user.email)}<br><span class="muted">${esc(S.user.email)}, ${S.user.role === 'admin' ? 'Admin' : 'Staff'}</span></p>
      <div class="actions" style="margin-top:12px"><button class="btn ghost" data-act="logout">${icon('logout')}Log out</button></div>`;
  };

  /* ---------- More (phone menu) ---------- */
  V.more = () => {
    const item = (href, ic, label) => `<a class="row" href="${href}">${icon(ic)}<span class="grow title">${label}</span></a>`;
    return `${head('More')}<div class="list">
      ${item('#/incubator', 'incubator', 'Incubator')}${item('#/sales', 'tag', 'Sales')}${item('#/expenses', 'wallet', 'Expenses')}${item('#/reports', 'chart', 'Reports')}
      ${S.user.role === 'admin' ? item('#/users', 'users', 'Users') : ''}${item('#/settings', 'gear', 'Settings and backup')}
      <button class="row" data-act="logout" style="width:100%;text-align:left">${icon('logout')}<span class="grow title">Log out</span></button></div>`;
  };
})();
