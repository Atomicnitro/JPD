/* Buttons and forms: everything that adds, changes or deletes records. */
(function () {
  'use strict';
  const GT = window.GT;
  const { S, api, openForm, confirmBox, toast, today, fmtDate, peso } = GT;
  const ACT = (GT.ACT = {});

  const SEX_OPTS = [{ v: 'tandang', l: 'Tandang' }, { v: 'inahin', l: 'Inahin' }, { v: 'sisiw', l: 'Sisiw' }];
  const STATUS_OPTS = Object.entries(GT.STATUS).map(([v, l]) => ({ v, l }));
  const PAIR_STATUS_OPTS = Object.entries(GT.PAIR_STATUS).map(([v, l]) => ({ v, l }));

  const birdOpts = (sex, o = {}) =>
    S.data.birds
      .filter((b) => (!sex || b.sex === sex) && (!o.active || b.status === 'active') && b.id !== o.exclude)
      .sort(GT.byBand)
      .map((b) => ({ v: b.id, l: GT.birdLabel(b) }));

  // Save, reload everything, redraw the screen.
  async function save(method, path, body) {
    const r = await api(path, { method, body });
    await GT.load();
    return r;
  }
  const redraw = () => GT.render();
  const done = (msg) => () => { redraw(); if (msg) toast(msg); };

  async function remove(path, title, message, okMsg, goTo) {
    if (!(await confirmBox(title, message))) return;
    try {
      await api(path, { method: 'DELETE' });
      await GT.load();
      if (goTo) location.hash = goTo; else redraw();
      toast(okMsg);
    } catch (e) { toast(e.message, 'err'); }
  }

  /* ---------- Birds ---------- */
  function birdForm(b) {
    const edit = !!b;
    openForm({
      title: edit ? 'Edit bird' : 'Add bird',
      submit: edit ? 'Save changes' : 'Save bird',
      values: b || { status: 'active' },
      fields: [
        { name: 'sex', label: 'Sex', type: 'seg', options: SEX_OPTS, required: true },
        { name: 'band_id', label: 'Band ID', required: true, placeholder: 'Example: R-001' },
        { name: 'bloodline', label: 'Bloodline', list: GT.bloodlines(), placeholder: 'Example: National' },
        { name: 'photo_url', label: 'Photo', type: 'photo' },
        { name: 'name', label: 'Name / nickname', more: true, w: 'half' },
        { name: 'color', label: 'Color', more: true, w: 'half' },
        { name: 'hatch_date', label: 'Date of hatch', type: 'date', more: true, w: 'half' },
        { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTS, more: true, w: 'half' },
        { name: 'sire_id', label: 'Father (Ama)', type: 'select', options: birdOpts('tandang', { exclude: b && b.id }), blank: 'Unknown / Hindi Naitala', more: true },
        { name: 'dam_id', label: 'Mother (Ina)', type: 'select', options: birdOpts('inahin', { exclude: b && b.id }), blank: 'Unknown / Hindi Naitala', more: true },
        { name: 'wingband_no', label: 'Wingband no.', more: true, w: 'half' },
        { name: 'wingband_date', label: 'Wingband date', type: 'date', more: true, w: 'half' },
        { name: 'notes', label: 'Notes', type: 'textarea', more: true },
      ],
      onSubmit: async (v) => {
        await GT.uploadPhotoIfNew(v);
        return edit ? save('PATCH', '/birds/' + b.id, v) : save('POST', '/birds', v);
      },
      after: (r) => {
        redraw();
        toast(edit ? 'Bird updated.' : `${r.band_id} added.`);
      },
    });
  }
  ACT.addBird = () => birdForm();
  ACT.editBird = (id) => birdForm(GT.bird(id));
  ACT.deleteBird = (id) => {
    const b = GT.bird(id);
    remove('/birds/' + id, `Delete ${b.band_id}?`,
      'This cannot be undone. A bird with chicks, pairs or a sale cannot be deleted. Set it to Deceased or Culled instead.',
      'Bird deleted.', '#/birds');
  };

  /* ---------- Pairs ---------- */
  function pairForm(p) {
    const edit = !!p;
    if (!edit) {
      if (!birdOpts('tandang', { active: true }).length || !birdOpts('inahin', { active: true }).length) {
        return toast('Add at least one active Tandang and one active Inahin first.', 'err');
      }
    }
    openForm({
      title: edit ? 'Edit pair' : 'Create pair',
      submit: edit ? 'Save changes' : 'Save pair',
      values: p || { date_started: today(), status: 'active' },
      note: edit ? '' : 'The Pair ID (PAIR-001, PAIR-002, …) is created for you.',
      fields: [
        { name: 'tandang_id', label: 'Tandang', type: 'select', required: true, options: birdOpts('tandang', { active: !edit }) },
        { name: 'inahin_id', label: 'Inahin', type: 'select', required: true, options: birdOpts('inahin', { active: !edit }) },
        { name: 'date_started', label: 'Date started', type: 'date', w: 'half' },
        { name: 'status', label: 'Status', type: 'select', options: PAIR_STATUS_OPTS, w: 'half' },
        { name: 'notes', label: 'Notes', type: 'textarea' },
      ],
      onSubmit: (v) => (edit ? save('PATCH', '/pairs/' + p.id, v) : save('POST', '/pairs', v)),
      after: (r) => {
        redraw();
        toast(edit ? 'Pair updated.' : `${GT.pairLabel(r)} created.`);
      },
    });
  }
  ACT.addPair = () => pairForm();
  ACT.editPair = (id) => pairForm(GT.pair(id));
  ACT.deletePair = (id) => remove('/pairs/' + id, `Delete ${GT.pairLabel(GT.pair(id))}?`,
    'A pair with hatch records cannot be deleted. Set it to Inactive or Retired instead.', 'Pair deleted.', '#/pairs');

  /* ---------- Eggs and hatch ---------- */
  const pairOpts = () => [...S.data.pairs].filter((p) => p.status === 'active').sort((a, b) => b.pair_no - a.pair_no).map((p) => ({
    v: p.id,
    l: `${GT.pairLabel(p)}: ${GT.bird(p.tandang_id)?.band_id} + ${GT.bird(p.inahin_id)?.band_id}`,
  }));
  const incubatorOpts = () => S.data.incubators.map((i) => ({ v: i.id, l: i.name }));

  function freeSpace(incId, ignoreBatchId) {
    const inc = GT.incubator(incId);
    if (!inc) return Infinity;
    const used = S.data.batches
      .filter((b) => b.status === 'incubating' && b.incubator_id === incId && b.id !== ignoreBatchId)
      .reduce((t, b) => t + b.eggs_set, 0);
    return inc.capacity - used;
  }

  function batchForm(b, pairId) {
    const edit = !!b;
    const days = S.data.settings.incubation_days || 21;
    if (!edit && !pairOpts().length) return toast('Create an active pair first.', 'err');
    const fields = [
      { name: 'pair_id', label: 'Pair', type: 'select', required: true, options: edit ? S.data.pairs.map((p) => ({ v: p.id, l: GT.pairLabel(p) })) : pairOpts() },
      { name: 'eggs_set', label: 'Number of eggs', type: 'number', step: 1, required: true, w: 'half' },
      { name: 'date_set', label: 'Date set in incubator', type: 'date', required: true, w: 'half' },
    ];
    if (S.data.incubators.length) fields.push({ name: 'incubator_id', label: 'Incubator', type: 'select', blank: 'No incubator', options: incubatorOpts() });
    if (edit) {
      fields.push(
        { name: 'eggs_hatched', label: 'Eggs hatched', type: 'number', step: 1, w: 'half', help: 'Leave empty if not hatched yet.' },
        { name: 'hatched_on', label: 'Date hatched', type: 'date', w: 'half' },
      );
    }
    fields.push({ name: 'notes', label: 'Notes', type: 'textarea' });
    openForm({
      title: edit ? 'Edit hatch record' : 'Record eggs',
      submit: edit ? 'Save changes' : 'Save eggs',
      note: `The expected hatch date is worked out for you (${days} days after the date set).`,
      values: b || { pair_id: pairId || '', date_set: today() },
      fields,
      onSubmit: async (v) => {
        if (v.incubator_id && Number(v.eggs_set) > freeSpace(v.incubator_id, b && b.id)) {
          throw new Error(`${GT.incubator(v.incubator_id).name} only has ${Math.max(0, freeSpace(v.incubator_id, b && b.id))} free spaces.`);
        }
        if (edit) {
          v.eggs_hatched = v.eggs_hatched === '' ? null : v.eggs_hatched;
          return save('PATCH', '/batches/' + b.id, v);
        }
        return save('POST', '/batches', v);
      },
      after: (r) => {
        redraw();
        toast(edit ? 'Hatch record updated.' : `Eggs saved. Expected hatch: ${fmtDate(r.expected_hatch)}.`);
      },
    });
  }
  ACT.addBatch = (id) => batchForm(null, id);
  ACT.editBatch = (id) => batchForm(GT.batch(id));
  ACT.deleteBatch = (id) => remove('/batches/' + id, `Delete ${GT.batchLabel(GT.batch(id))}?`,
    'The hatch record is removed. Chicks already registered stay in your birds list.', 'Hatch record deleted.');

  ACT.recordHatch = async (id) => {
    const inc = S.data.batches.filter((b) => b.status === 'incubating');
    if (!id && !inc.length) {
      if (await confirmBox('Nothing in the incubator', 'Record the eggs first, then you can enter the hatch result.', 'Record eggs', false)) ACT.addBatch();
      return;
    }
    const fields = [];
    if (!id) {
      fields.push({
        name: 'batch', label: 'Which eggs?', type: 'select', required: true,
        options: inc.map((b) => ({ v: b.id, l: `${GT.batchLabel(b)}: ${GT.pairLabel(GT.pair(b.pair_id))}, ${b.eggs_set} eggs` })),
      });
    }
    fields.push(
      { name: 'eggs_hatched', label: 'Eggs hatched', type: 'number', step: 1, required: true, w: 'half' },
      { name: 'hatched_on', label: 'Date hatched', type: 'date', required: true, w: 'half' },
    );
    openForm({
      title: 'Record hatch',
      submit: 'Save hatch',
      note: 'Eggs not hatched and the hatch rate are worked out for you.',
      values: { batch: id || (inc.length === 1 ? inc[0].id : ''), hatched_on: today() },
      fields,
      onSubmit: async (v) => {
        const bid = id || v.batch;
        const b = GT.batch(bid);
        const n = Number(v.eggs_hatched);
        if (!Number.isInteger(n) || n < 0) throw new Error('Enter a whole number of eggs.');
        if (n > b.eggs_set) throw new Error(`Only ${b.eggs_set} eggs were set.`);
        await save('PATCH', '/batches/' + bid, { eggs_hatched: n, hatched_on: v.hatched_on });
        return { bid, n, eggs: b.eggs_set };
      },
      after: (r) => {
        redraw();
        toast(`Hatch saved: ${r.n} of ${r.eggs}. Hatch rate ${GT.rate(r.n, r.eggs)}.`);
        if (r.n > 0) ACT.addChicks(r.bid);
      },
    });
  };

  ACT.addChicks = (id) => {
    const b = GT.batch(id);
    const p = GT.pair(b.pair_id);
    const sire = GT.bird(p.tandang_id);
    const dam = GT.bird(p.inahin_id);
    const registered = S.data.birds.filter((x) => x.batch_id === id).length;
    const left = b.eggs_hatched - registered;
    if (left <= 0) return toast('All chicks from this hatch are already registered.');
    const n = Math.min(left, 40);
    let max = 0;
    S.data.birds.forEach((x) => { const m = /^C-(\d+)$/i.exec(x.band_id); if (m) max = Math.max(max, Number(m[1])); });
    const values = { bloodline: (sire && sire.bloodline) || '' };
    const fields = [{ name: 'bloodline', label: 'Bloodline for all chicks', list: GT.bloodlines() }];
    for (let i = 1; i <= n; i += 1) {
      values['band_' + i] = 'C-' + GT.pad3(max + i);
      values['sex_' + i] = 'sisiw';
      fields.push(
        { name: 'band_' + i, label: 'Band ID', section: `Chick ${i}`, w: 'half' },
        { name: 'sex_' + i, label: 'Sex', type: 'select', options: SEX_OPTS, w: 'half' },
        { name: 'name_' + i, label: 'Name', w: 'half' },
        { name: 'color_' + i, label: 'Color', w: 'half' },
      );
    }
    openForm({
      title: 'Register chicks',
      submit: 'Save chicks',
      note: `Father ${sire ? sire.band_id : ''} and mother ${dam ? dam.band_id : ''} are connected automatically. ${left} chick${left === 1 ? '' : 's'} left to register. Clear the Band ID of any chick you want to skip.`,
      values,
      fields,
      onSubmit: async (v) => {
        const chicks = [];
        for (let i = 1; i <= n; i += 1) {
          if (v['band_' + i]) chicks.push({ band_id: v['band_' + i], sex: v['sex_' + i], name: v['name_' + i], color: v['color_' + i], bloodline: v.bloodline });
        }
        if (!chicks.length) throw new Error('Enter at least one Band ID.');
        await api(`/batches/${id}/chicks`, { method: 'POST', body: { chicks } });
        await GT.load();
        return chicks.length;
      },
      after: (count) => { redraw(); toast(`${count} chick${count === 1 ? '' : 's'} registered.`); },
    });
  };

  /* ---------- Incubators ---------- */
  function incubatorForm(i) {
    const edit = !!i;
    openForm({
      title: edit ? 'Edit incubator' : 'Add incubator',
      values: i || { name: `Incubator #${S.data.incubators.length + 1}`, capacity: 96 },
      fields: [
        { name: 'name', label: 'Name', required: true },
        { name: 'capacity', label: 'Capacity (eggs)', type: 'number', step: 1, required: true },
        { name: 'notes', label: 'Notes', type: 'textarea' },
      ],
      onSubmit: (v) => (edit ? save('PATCH', '/incubators/' + i.id, v) : save('POST', '/incubators', v)),
      after: done(edit ? 'Incubator updated.' : 'Incubator added.'),
    });
  }
  ACT.addIncubator = () => incubatorForm();
  ACT.editIncubator = (id) => incubatorForm(GT.incubator(id));
  ACT.deleteIncubator = (id) => remove('/incubators/' + id, 'Delete this incubator?', 'Egg batches stay, but they are no longer linked to it.', 'Incubator deleted.');

  /* ---------- Sales ---------- */
  function saleForm(sale, birdId) {
    const edit = !!sale;
    const options = birdOpts(null, { active: true });
    if (!edit && !options.length) return toast('You have no active birds to sell.', 'err');
    const fields = [];
    if (!edit) fields.push({ name: 'bird_id', label: 'Bird', type: 'select', required: true, options });
    fields.push(
      { name: 'buyer', label: 'Buyer', placeholder: 'Name' },
      { name: 'price', label: 'Selling price (₱)', type: 'number', required: true, w: 'half' },
      { name: 'date_sold', label: 'Date sold', type: 'date', required: true, w: 'half' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    );
    openForm({
      title: edit ? `Edit sale: ${GT.birdLabel(GT.bird(sale.bird_id))}` : 'Record sale',
      submit: edit ? 'Save changes' : 'Save sale',
      note: edit ? '' : 'The bird’s status changes to Sold automatically.',
      values: sale || { bird_id: birdId || '', date_sold: today() },
      fields,
      onSubmit: (v) => (edit ? save('PATCH', '/sales/' + sale.id, v) : save('POST', '/sales', v)),
      after: (r) => { redraw(); toast(edit ? 'Sale updated.' : `Sale saved: ${peso(r.price)}.`); },
    });
  }
  ACT.addSale = (id) => saleForm(null, id);
  ACT.editSale = (id) => saleForm(S.data.sales.find((s) => s.id === id));
  ACT.deleteSale = (id) => remove('/sales/' + id, 'Delete this sale?', 'The bird goes back to Active.', 'Sale deleted.');

  /* ---------- Expenses ---------- */
  function expenseForm(x) {
    const edit = !!x;
    openForm({
      title: edit ? 'Edit expense' : 'Add expense',
      submit: edit ? 'Save changes' : 'Save expense',
      values: x || { date: today() },
      fields: [
        { name: 'category', label: 'Category', type: 'select', required: true, options: GT.CATEGORIES.map((c) => ({ v: c, l: c })) },
        { name: 'amount', label: 'Amount (₱)', type: 'number', required: true, w: 'half' },
        { name: 'date', label: 'Date', type: 'date', required: true, w: 'half' },
        { name: 'description', label: 'Description', placeholder: 'Example: Feed for breeding stock' },
      ],
      onSubmit: (v) => (edit ? save('PATCH', '/expenses/' + x.id, v) : save('POST', '/expenses', v)),
      after: done(edit ? 'Expense updated.' : 'Expense saved.'),
    });
  }
  ACT.addExpense = () => expenseForm();
  ACT.editExpense = (id) => expenseForm(S.data.expenses.find((x) => x.id === id));
  ACT.deleteExpense = (id) => remove('/expenses/' + id, 'Delete this expense?', 'This cannot be undone.', 'Expense deleted.');

  /* ---------- Reports ---------- */
  ACT.setPeriod = (key) => { S.period.key = key; redraw(); };

  /* ---------- Users ---------- */
  ACT.addUser = () => openForm({
    title: 'Add user',
    submit: 'Create user',
    note: 'Share the email and password with them. They can use the farm records right away.',
    values: { role: 'staff' },
    fields: [
      { name: 'name', label: 'Name' },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'password', label: 'Password (at least 6 characters)', type: 'text', required: true },
      { name: 'role', label: 'Role', type: 'seg', options: [{ v: 'staff', l: 'Staff' }, { v: 'admin', l: 'Admin' }] },
    ],
    onSubmit: (v) => api('/users', { method: 'POST', body: v }),
    after: done('User added.'),
  });
  ACT.resetPassword = (id) => openForm({
    title: 'Reset password',
    submit: 'Set new password',
    fields: [{ name: 'password', label: 'New password (at least 6 characters)', type: 'text', required: true }],
    onSubmit: (v) => api('/users/' + id, { method: 'PATCH', body: { password: v.password } }),
    after: done('Password changed.'),
  });
  ACT.toggleRole = async (id, el) => {
    const toAdmin = /admin/i.test(el.textContent);
    try {
      await api('/users/' + id, { method: 'PATCH', body: { role: toAdmin ? 'admin' : 'staff' } });
      redraw();
      toast('Role updated.');
    } catch (e) { toast(e.message, 'err'); }
  };
  ACT.deleteUser = async (id) => {
    if (!(await confirmBox('Remove this user?', 'They will no longer be able to log in. The farm records stay.', 'Remove'))) return;
    try { await api('/users/' + id, { method: 'DELETE' }); redraw(); toast('User removed.'); } catch (e) { toast(e.message, 'err'); }
  };

  /* ---------- Settings, export, log out ---------- */
  ACT.saveSettings = async () => {
    try {
      const body = {
        farm_name: GT.$('#set_farm').value,
        incubation_days: GT.$('#set_days').value,
        bloodlines: GT.$('#set_lines').value,
      };
      S.data.settings = await api('/settings', { method: 'PUT', body });
      toast('Settings saved.');
    } catch (e) { toast(e.message, 'err'); }
  };
  ACT.exportXlsx = () => GT.download('/export/xlsx', `Gamefowl-Tracker-${today()}.xlsx`);
  ACT.exportJson = () => GT.download('/export/json', `Gamefowl-Tracker-backup-${today()}.json`);
  ACT.exportCsv = (t) => GT.download('/export/csv/' + t, `${t}-${today()}.csv`);
  ACT.logout = () => { GT.clearSession(); GT.onLoggedOut(); };

  /* ---------- Button clicks, typing and filters ---------- */
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const fn = ACT[el.dataset.act];
    if (fn) { e.preventDefault(); fn(el.dataset.id, el); }
  });

  document.addEventListener('input', (e) => {
    if (e.target.matches('[data-search]')) {
      S.filters.q = e.target.value;
      GT.$('#birdlist').innerHTML = GT.birdListHtml();
    }
  });

  document.addEventListener('change', (e) => {
    if (e.target.matches('[data-filter]')) { S.filters[e.target.dataset.filter] = e.target.value; redraw(); }
    if (e.target.matches('[data-period-date]')) { S.period[e.target.dataset.periodDate] = e.target.value; redraw(); }
  });
})();
