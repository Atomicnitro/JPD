// Gamefowl Tracker, created by Juan Paolo Dente
require('dotenv').config();
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const ExcelJS = require('exceljs');
const { createClient } = require('@supabase/supabase-js');

const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } = process.env;
const PORT = process.env.PORT || 3000;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('\nMissing Supabase keys.');
  console.error('Copy .env.example to .env and fill in the three Supabase values.\n');
  process.exit(1);
}

const clientOptions = { auth: { persistSession: false, autoRefreshToken: false } };
// The service client can read and write everything. It only ever runs on this server.
const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, clientOptions);
const newAnonClient = () => createClient(SUPABASE_URL, SUPABASE_ANON_KEY, clientOptions);

const app = express();
app.use(express.json({ limit: '6mb' }));
app.use(express.static(path.join(__dirname, 'public')));

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const fail = (status, message) => Object.assign(new Error(message), { status });

const todayISO = () => new Date().toISOString().slice(0, 10);
const addDays = (iso, n) => {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + Number(n));
  return d.toISOString().slice(0, 10);
};
const pad3 = (n) => String(n).padStart(3, '0');

async function getSettings() {
  const { data, error } = await db.from('settings').select('*');
  if (error) throw error;
  const out = {};
  for (const row of data) out[row.key] = row.value;
  return out;
}

async function fetchAll(table, orderColumn) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db
      .from(table)
      .select('*')
      .order(orderColumn, { ascending: true })
      .range(from, from + 999);
    if (error) throw error;
    rows.push(...data);
    if (data.length < 1000) break;
  }
  return rows;
}

/* ------------------------------------------------------------------ */
/* Login and sessions                                                  */
/* ------------------------------------------------------------------ */

const publicUser = (p) => ({ id: p.id, email: p.email, name: p.full_name, role: p.role });

async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw fail(401, 'Please log in.');
    const { data, error } = await db.auth.getUser(token);
    if (error || !data.user) throw fail(401, 'Your session ended. Please log in again.');
    const { data: profile } = await db.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
    if (!profile) throw fail(403, 'This account is not set up for the farm. Ask the admin.');
    req.user = profile;
    next();
  } catch (err) {
    next(err);
  }
}

const adminOnly = (req, res, next) =>
  req.user.role === 'admin' ? next() : next(fail(403, 'Only the admin can do this.'));

app.post('/api/login', wrap(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) throw fail(400, 'Enter your email and password.');
  const { data, error } = await newAnonClient().auth.signInWithPassword({ email: email.trim(), password });
  if (error || !data.session) throw fail(401, 'Wrong email or password.');
  const { data: profile } = await db.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
  if (!profile) throw fail(403, 'This account is not set up for the farm. Ask the admin.');
  res.json({ token: data.session.access_token, refresh: data.session.refresh_token, user: publicUser(profile) });
}));

app.post('/api/refresh', wrap(async (req, res) => {
  const { refresh } = req.body || {};
  if (!refresh) throw fail(401, 'Please log in again.');
  const { data, error } = await newAnonClient().auth.refreshSession({ refresh_token: refresh });
  if (error || !data.session) throw fail(401, 'Your session ended. Please log in again.');
  res.json({ token: data.session.access_token, refresh: data.session.refresh_token });
}));

/* ------------------------------------------------------------------ */
/* Load everything in one go                                           */
/* ------------------------------------------------------------------ */

app.get('/api/data', auth, wrap(async (req, res) => {
  const [birds, pairs, batches, sales, expenses, incubators, settings] = await Promise.all([
    fetchAll('birds', 'band_id'),
    fetchAll('pairs', 'pair_no'),
    fetchAll('batches', 'batch_no'),
    fetchAll('sales', 'date_sold'),
    fetchAll('expenses', 'date'),
    fetchAll('incubators', 'created_at'),
    getSettings(),
  ]);
  res.json({ me: publicUser(req.user), birds, pairs, batches, sales, expenses, incubators, settings });
}));

/* ------------------------------------------------------------------ */
/* Records: add, change, delete                                        */
/* ------------------------------------------------------------------ */

const RESOURCES = {
  birds: {
    cols: ['band_id', 'name', 'sex', 'color', 'bloodline', 'hatch_date', 'status', 'sire_id', 'dam_id',
      'photo_url', 'wingband_no', 'wingband_date', 'notes'],
    required: { band_id: 'Band ID', sex: 'Sex' },
    async prepare(row, existing, id) {
      if (row.sire_id && row.sire_id === id) throw fail(400, 'A bird cannot be its own father.');
      if (row.dam_id && row.dam_id === id) throw fail(400, 'A bird cannot be its own mother.');
    },
  },
  pairs: {
    cols: ['tandang_id', 'inahin_id', 'date_started', 'status', 'notes'],
    required: { tandang_id: 'Tandang', inahin_id: 'Inahin' },
    async prepare(row, existing) {
      const m = { ...existing, ...row };
      const { data } = await db.from('birds').select('id,sex').in('id', [m.tandang_id, m.inahin_id]);
      const sexOf = Object.fromEntries((data || []).map((b) => [b.id, b.sex]));
      if (sexOf[m.tandang_id] !== 'tandang') throw fail(400, 'Pick a Tandang (rooster) for the first bird.');
      if (sexOf[m.inahin_id] !== 'inahin') throw fail(400, 'Pick an Inahin (hen) for the second bird.');
    },
  },
  batches: {
    cols: ['pair_id', 'incubator_id', 'eggs_set', 'date_set', 'eggs_hatched', 'hatched_on', 'notes'],
    required: { pair_id: 'Pair', eggs_set: 'Number of eggs', date_set: 'Date set' },
    async prepare(row, existing) {
      const m = { ...existing, ...row };
      const settings = await getSettings();
      const days = Number(settings.incubation_days) || 21;
      if (m.date_set) row.expected_hatch = addDays(m.date_set, days);
      if (m.eggs_hatched !== null && m.eggs_hatched !== undefined) {
        if (Number(m.eggs_hatched) > Number(m.eggs_set)) throw fail(400, 'Eggs hatched cannot be more than eggs set.');
        row.status = 'hatched';
        if (!m.hatched_on) row.hatched_on = todayISO();
      } else {
        row.status = 'incubating';
        row.hatched_on = null;
      }
    },
  },
  sales: {
    cols: ['bird_id', 'buyer', 'price', 'date_sold', 'notes'],
    required: { bird_id: 'Bird', price: 'Selling price', date_sold: 'Date sold' },
    async prepare(row, existing) {
      if (!existing) {
        const { data: bird } = await db.from('birds').select('status,band_id').eq('id', row.bird_id).maybeSingle();
        if (!bird) throw fail(400, 'Bird not found.');
        if (bird.status === 'sold') throw fail(400, `${bird.band_id} is already sold.`);
      }
    },
  },
  expenses: {
    cols: ['category', 'amount', 'date', 'description'],
    required: { category: 'Category', amount: 'Amount', date: 'Date' },
  },
  incubators: {
    cols: ['name', 'capacity', 'notes'],
    required: { name: 'Name', capacity: 'Capacity' },
  },
};

function cleanRow(cfg, body) {
  const out = {};
  for (const col of cfg.cols) {
    if (!(col in (body || {}))) continue;
    let v = body[col];
    if (typeof v === 'string') v = v.trim();
    out[col] = v === '' || v === undefined ? null : v;
  }
  return out;
}

const RES_PATH = '/api/:res(birds|pairs|batches|sales|expenses|incubators)';

app.post(RES_PATH, auth, wrap(async (req, res) => {
  const table = req.params.res;
  const cfg = RESOURCES[table];
  const row = cleanRow(cfg, req.body);
  for (const [col, label] of Object.entries(cfg.required)) {
    if (row[col] === null || row[col] === undefined) throw fail(400, `${label} is required.`);
  }
  if (cfg.prepare) await cfg.prepare(row, null, null);
  // Leave empty fields out so the database can use its own defaults.
  for (const k of Object.keys(row)) if (row[k] === null) delete row[k];
  const { data, error } = await db.from(table).insert(row).select().single();
  if (error) throw error;
  res.json(data);
}));

app.patch(`${RES_PATH}/:id`, auth, wrap(async (req, res) => {
  const table = req.params.res;
  const cfg = RESOURCES[table];
  const row = cleanRow(cfg, req.body);
  for (const [col, label] of Object.entries(cfg.required)) {
    if (col in row && row[col] === null) throw fail(400, `${label} is required.`);
  }
  const { data: existing, error: e1 } = await db.from(table).select('*').eq('id', req.params.id).maybeSingle();
  if (e1) throw e1;
  if (!existing) throw fail(404, 'Record not found.');
  if (cfg.prepare) await cfg.prepare(row, existing, req.params.id);
  const { data, error } = await db.from(table).update(row).eq('id', req.params.id).select().single();
  if (error) throw error;
  res.json(data);
}));

app.delete(`${RES_PATH}/:id`, auth, wrap(async (req, res) => {
  const { error } = await db.from(req.params.res).delete().eq('id', req.params.id);
  if (error) throw error;
  res.json({ ok: true });
}));

/* ------------------------------------------------------------------ */
/* Register chicks from a hatch. Parents are connected automatically.  */
/* ------------------------------------------------------------------ */

app.post('/api/batches/:id/chicks', auth, wrap(async (req, res) => {
  const { data: batch } = await db.from('batches').select('*').eq('id', req.params.id).maybeSingle();
  if (!batch) throw fail(404, 'Hatch record not found.');
  if (batch.status !== 'hatched') throw fail(400, 'Record the hatch result first.');
  const { data: pair } = await db.from('pairs').select('*').eq('id', batch.pair_id).single();
  const { data: sire } = await db.from('birds').select('bloodline').eq('id', pair.tandang_id).single();

  const list = Array.isArray(req.body?.chicks) ? req.body.chicks : [];
  if (!list.length) throw fail(400, 'Add at least one chick.');

  const { count } = await db.from('birds').select('id', { count: 'exact', head: true }).eq('batch_id', batch.id);
  if ((count || 0) + list.length > batch.eggs_hatched) {
    throw fail(400, `This batch only hatched ${batch.eggs_hatched}. ${count || 0} are already registered.`);
  }

  const rows = list.map((c) => {
    const band = String(c.band_id || '').trim();
    if (!band) throw fail(400, 'Every chick needs a Band ID.');
    return {
      band_id: band,
      name: String(c.name || '').trim() || null,
      sex: ['tandang', 'inahin', 'sisiw'].includes(c.sex) ? c.sex : 'sisiw',
      color: String(c.color || '').trim() || null,
      bloodline: String(c.bloodline || '').trim() || sire?.bloodline || null,
      hatch_date: batch.hatched_on,
      status: 'active',
      sire_id: pair.tandang_id,
      dam_id: pair.inahin_id,
      batch_id: batch.id,
    };
  });
  const { data, error } = await db.from('birds').insert(rows).select();
  if (error) throw error;
  res.json(data);
}));

/* ------------------------------------------------------------------ */
/* Photos                                                              */
/* ------------------------------------------------------------------ */

app.post('/api/photos', auth, wrap(async (req, res) => {
  const m = /^data:image\/(jpeg|png|webp);base64,(.+)$/.exec(req.body?.data || '');
  if (!m) throw fail(400, 'The photo must be a JPG, PNG or WebP image.');
  const buffer = Buffer.from(m[2], 'base64');
  if (buffer.length > 4 * 1024 * 1024) throw fail(400, 'That photo is too big. Try a smaller one.');
  const name = `${crypto.randomUUID()}.${m[1] === 'jpeg' ? 'jpg' : m[1]}`;
  const { error } = await db.storage.from('bird-photos').upload(name, buffer, { contentType: `image/${m[1]}` });
  if (error) throw error;
  const { data } = db.storage.from('bird-photos').getPublicUrl(name);
  res.json({ url: data.publicUrl });
}));

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

app.put('/api/settings', auth, adminOnly, wrap(async (req, res) => {
  const allowed = ['farm_name', 'incubation_days', 'bloodlines'];
  const body = req.body || {};
  if ('incubation_days' in body) {
    const n = Number(body.incubation_days);
    if (!Number.isInteger(n) || n < 15 || n > 30) throw fail(400, 'Incubation days should be a number from 15 to 30.');
  }
  const rows = allowed.filter((k) => k in body).map((k) => ({ key: k, value: String(body[k] ?? '').trim() }));
  if (rows.length) {
    const { error } = await db.from('settings').upsert(rows);
    if (error) throw error;
  }
  res.json(await getSettings());
}));

/* ------------------------------------------------------------------ */
/* Users (admin only)                                                  */
/* ------------------------------------------------------------------ */

app.get('/api/users', auth, adminOnly, wrap(async (req, res) => {
  const { data, error } = await db.from('profiles').select('*').order('created_at');
  if (error) throw error;
  res.json(data.map(publicUser));
}));

app.post('/api/users', auth, adminOnly, wrap(async (req, res) => {
  const { email, password, name, role } = req.body || {};
  if (!email || !password) throw fail(400, 'Email and password are required.');
  if (String(password).length < 6) throw fail(400, 'The password needs at least 6 characters.');
  const userRole = role === 'admin' ? 'admin' : 'staff';
  const { data, error } = await db.auth.admin.createUser({ email: email.trim(), password, email_confirm: true });
  if (error) throw fail(400, error.message);
  const { error: profileError } = await db.from('profiles').insert({
    id: data.user.id, email: email.trim(), full_name: (name || '').trim() || null, role: userRole,
  });
  if (profileError) {
    await db.auth.admin.deleteUser(data.user.id);
    throw profileError;
  }
  res.json({ ok: true });
}));

app.patch('/api/users/:id', auth, adminOnly, wrap(async (req, res) => {
  const { role, password, name } = req.body || {};
  if (password !== undefined) {
    if (String(password).length < 6) throw fail(400, 'The password needs at least 6 characters.');
    const { error } = await db.auth.admin.updateUserById(req.params.id, { password });
    if (error) throw fail(400, error.message);
  }
  const update = {};
  if (role) {
    if (req.params.id === req.user.id && role !== 'admin') throw fail(400, 'You cannot remove your own admin access.');
    update.role = role === 'admin' ? 'admin' : 'staff';
  }
  if (name !== undefined) update.full_name = String(name).trim() || null;
  if (Object.keys(update).length) {
    const { error } = await db.from('profiles').update(update).eq('id', req.params.id);
    if (error) throw error;
  }
  res.json({ ok: true });
}));

app.delete('/api/users/:id', auth, adminOnly, wrap(async (req, res) => {
  if (req.params.id === req.user.id) throw fail(400, 'You cannot remove your own account.');
  const { error } = await db.auth.admin.deleteUser(req.params.id);
  if (error) throw fail(400, error.message);
  res.json({ ok: true });
}));

/* ------------------------------------------------------------------ */
/* Export and backup                                                   */
/* ------------------------------------------------------------------ */

const TABLES = [
  ['birds', 'band_id'], ['pairs', 'pair_no'], ['batches', 'batch_no'],
  ['sales', 'date_sold'], ['expenses', 'date'], ['incubators', 'created_at'],
];

// Replace internal ids with readable names (band IDs, PAIR-001, ...)
function readable(all) {
  const band = Object.fromEntries(all.birds.map((b) => [b.id, b.band_id]));
  const pair = Object.fromEntries(all.pairs.map((p) => [p.id, `PAIR-${pad3(p.pair_no)}`]));
  const batch = Object.fromEntries(all.batches.map((b) => [b.id, `BATCH-${pad3(b.batch_no)}`]));
  const incub = Object.fromEntries(all.incubators.map((i) => [i.id, i.name]));
  const drop = new Set(['id', 'created_at']);
  const out = {};
  for (const [table, rows] of Object.entries(all)) {
    out[table] = rows.map((r) => {
      const o = {};
      for (const [k, v] of Object.entries(r)) {
        if (drop.has(k)) continue;
        if (k === 'sire_id') o.sire = band[v] || '';
        else if (k === 'dam_id') o.dam = band[v] || '';
        else if (k === 'bird_id') o.bird = band[v] || '';
        else if (k === 'tandang_id') o.tandang = band[v] || '';
        else if (k === 'inahin_id') o.inahin = band[v] || '';
        else if (k === 'pair_id') o.pair = pair[v] || '';
        else if (k === 'batch_id') o.batch = batch[v] || '';
        else if (k === 'incubator_id') o.incubator = incub[v] || '';
        else if (k === 'pair_no') o.pair_id = `PAIR-${pad3(v)}`;
        else if (k === 'batch_no') o.batch_id = `BATCH-${pad3(v)}`;
        else o[k] = v ?? '';
      }
      return o;
    });
  }
  return out;
}

async function loadAllTables() {
  const all = {};
  for (const [t, order] of TABLES) all[t] = await fetchAll(t, order);
  return all;
}

const csvCell = (v) => {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

app.get('/api/export/csv/:table', auth, wrap(async (req, res) => {
  const table = req.params.table;
  if (!TABLES.some(([t]) => t === table)) throw fail(404, 'Unknown table.');
  const rows = readable(await loadAllTables())[table];
  const headers = rows.length ? Object.keys(rows[0]) : [];
  const lines = [headers.join(','), ...rows.map((r) => headers.map((h) => csvCell(r[h])).join(','))];
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.send('\uFEFF' + lines.join('\r\n'));
}));

app.get('/api/export/xlsx', auth, wrap(async (req, res) => {
  const data = readable(await loadAllTables());
  const wb = new ExcelJS.Workbook();
  for (const [table] of TABLES) {
    const ws = wb.addWorksheet(table.charAt(0).toUpperCase() + table.slice(1));
    const rows = data[table];
    const headers = rows.length ? Object.keys(rows[0]) : ['(no records yet)'];
    ws.addRow(headers).font = { bold: true };
    rows.forEach((r) => ws.addRow(headers.map((h) => r[h])));
    ws.columns.forEach((c) => { c.width = 18; });
  }
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  await wb.xlsx.write(res);
  res.end();
}));

app.get('/api/export/json', auth, wrap(async (req, res) => {
  const all = await loadAllTables();
  all.settings = await getSettings();
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ exported_at: new Date().toISOString(), ...all }, null, 2));
}));

/* ------------------------------------------------------------------ */
/* Errors                                                              */
/* ------------------------------------------------------------------ */

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));

app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  let status = err.status || 500;
  let message = err.message || 'Something went wrong.';
  const text = `${err.message || ''} ${err.details || ''}`;
  if (err.code === '23505') {
    status = 400;
    message = /band_id/.test(text) ? 'That Band ID is already used by another bird.' : 'That record already exists.';
  } else if (err.code === '23503') {
    status = 400;
    message = 'This record is connected to other records, so it cannot be deleted. For a bird, set its status to Deceased or Culled instead.';
  } else if (err.code === '23514') {
    status = 400;
    message = 'One of the values is not allowed. Please check the form.';
  } else if (err.code === '22P02' || err.code === '22007') {
    status = 400;
    message = 'One of the values is not in the right format. Please check the form.';
  }
  if (status >= 500) console.error(err);
  res.status(status).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`\nGamefowl Tracker is running.`);
  console.log(`Open http://localhost:${PORT} in your browser.\n`);
});
