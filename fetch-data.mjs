// Downloads price history for the whole EGX register (tools/universe.json) from Yahoo Finance's public chart endpoint.
//  - normal stocks: daily bars from <TICKER>.CA
//  - stocks with no daily history there: daily bars derived from the hourly series of their ISIN symbol (about 3 years)
// Writes data/<ID>.js and data/symbols.js. Usage: node tools/fetch-data.mjs [ID ...]
import fs from 'fs';
const U = JSON.parse(fs.readFileSync(new URL('./universe.json', import.meta.url)));
const only = process.argv.slice(2).map(s => s.toUpperCase());
const out = new URL('../data/', import.meta.url); fs.mkdirSync(out, { recursive: true });
const H = { headers: { 'User-Agent': 'Mozilla/5.0' } };
const r3 = x => Math.round(x * 1000) / 1000;
const cairoDate = (t) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(t * 1000));
const getSplits = (x) => Object.entries(x.events?.splits || {}).map(([k, v]) => [cairoDate(+k), Math.round(v.numerator / v.denominator * 1e6) / 1e6, cairoDate(v.date)]).filter(a => a[1] > 0 && a[1] !== 1).sort((a, b) => a[0] < b[0] ? -1 : 1);

// Yahoo's split dates can be off by days or weeks, and some splits are missing. Align each listed split (factor >= 1.3 or <= 1/1.3) to the day whose
// close-to-close ratio matches it, then add unlisted jumps of 1.8x or more that are close to a multiple of 0.5. Result: [[firstDayAtNewPrice, factor, 'y'|'auto'], ...]
function fitSplits(rows, list) {
  const out = [], used = new Set();
  for (const [d1, f, d2] of list) {
    if (f < 1.3 && f > 1 / 1.3) continue;
    const dd = d1 < d2 ? d1 : d2; let c = rows.findIndex(r => r[0] >= dd); if (c < 1) continue;
    let best = -1, bd = 9;
    for (let i = Math.max(1, c - 25); i < Math.min(rows.length, c + 25); i++) { const r = rows[i - 1][4] / rows[i][4]; if (!(r > 0)) continue; const e = Math.abs(Math.log(r / f)); if (e < bd) { bd = e; best = i; } }
    if (best > 0 && bd < 0.1 && !used.has(best)) { used.add(best); out.push([rows[best][0], f, 'y']); }
  }
  for (let i = 1; i < rows.length; i++) {
    if (used.has(i)) continue; const r = rows[i - 1][4] / rows[i][4]; if (!(r > 0) || (r < 1.8 && r > 1 / 1.8)) continue;
    const g = r >= 1 ? r : 1 / r, h = Math.round(g * 2) / 2; if (Math.abs(g / h - 1) > 0.05) continue; out.push([rows[i][0], r >= 1 ? h : 1 / h, 'auto']);
  }
  return out.sort((a, b) => a[0] < b[0] ? -1 : 1);
}
async function getJson(url) { for (let k = 0; k < 3; k++) { try { const r = await fetch(url, H); return await r.json(); } catch { await new Promise(r => setTimeout(r, 800)); } } return null; }
async function daily(tk) {
  const j = await getJson(`https://query1.finance.yahoo.com/v8/finance/chart/${tk}.CA?period1=1230768000&period2=${Math.floor(Date.now() / 1000) + 86400}&interval=1d&events=splits`);
  const x = j?.chart?.result?.[0]; if (!x?.timestamp || x.timestamp.length < 30) return null; const q = x.indicators.quote[0], m = new Map();
  x.timestamp.forEach((t, i) => { if (q.close[i] == null || q.open[i] == null) return; const d = cairoDate(t); m.set(d, [d, r3(q.open[i]), r3(q.high[i]), r3(q.low[i]), r3(q.close[i]), q.volume[i] || 0]); });
  const rr = [...m.values()].sort((a, b) => a[0] < b[0] ? -1 : 1); return { rows: rr, src: 'daily', splits: fitSplits(rr, getSplits(x)) };
}
async function derived(isin) {
  const j = await getJson(`https://query1.finance.yahoo.com/v8/finance/chart/${isin}?range=730d&interval=60m&events=splits`);
  const x = j?.chart?.result?.[0]; if (!x?.timestamp || x.timestamp.length < 30) return null; const q = x.indicators.quote[0], by = new Map();
  x.timestamp.forEach((t, i) => { if (q.close[i] == null || q.open[i] == null) return; const d = cairoDate(t), b = by.get(d); if (!b) by.set(d, [d, q.open[i], q.high[i], q.low[i], q.close[i], q.volume[i] || 0]); else { b[2] = Math.max(b[2], q.high[i]); b[3] = Math.min(b[3], q.low[i]); b[4] = q.close[i]; b[5] += q.volume[i] || 0; } });
  const rows = [...by.values()].sort((a, b) => a[0] < b[0] ? -1 : 1).map(r => [r[0], r3(r[1]), r3(r[2]), r3(r[3]), r3(r[4]), r[5]]);
  return rows.length >= 30 ? { rows, src: 'hourly', splits: fitSplits(rows, getSplits(x)) } : null;
}
const meta = []; let idx = 0, ok = 0;
async function worker() {
  while (idx < U.length) {
    const u = U[idx++]; const file = new URL(u.id + '.js', out);
    let res = null;
    if (only.length && !only.includes(u.id)) { if (fs.existsSync(file)) { const m = fs.readFileSync(file, 'utf8').match(/"src":"(\w+)"/); res = { keep: true, src: m ? m[1] : 'daily' }; } }
    else { res = u.daily ? await daily(u.id) : null; if (!res && u.isin) res = await derived(u.isin); if (res) fs.writeFileSync(file, `window.EGX_DATA=window.EGX_DATA||{};window.EGX_DATA[${JSON.stringify(u.id)}]=${JSON.stringify({ currency: 'EGP', src: res.src, rows: res.rows, splits: res.splits || [] })};`); }
    meta.push({ id: u.id, en: u.en, ar: u.ar, secEn: u.secEn, secAr: u.secAr, src: res ? res.src : null });
    if (res) ok++;
    await new Promise(r => setTimeout(r, 120));
  }
}
await Promise.all([worker(), worker(), worker()]);
const order = new Map(U.map((u, i) => [u.id, i])); meta.sort((a, b) => order.get(a.id) - order.get(b.id));
fs.writeFileSync(new URL('./symbols.js', out), `window.EGX_SYMBOLS=${JSON.stringify(meta)};window.EGX_FETCHED=${JSON.stringify(new Date().toISOString())};`);
console.log('listed', U.length, 'with data', meta.filter(m => m.src).length, 'derived', meta.filter(m => m.src === 'hourly').length, 'no data', meta.filter(m => !m.src).length);

// Precomputed screener rows (same numbers as the in-browser scan, split-adjusted) so the scanner tab opens instantly.
try {
  const vm = await import('vm');
  const tctx = {}; tctx.window = tctx; vm.runInNewContext(fs.readFileSync(new URL('../ta.js', import.meta.url), 'utf8'), tctx); const TA = tctx.TA;
  const r4 = (x) => Math.round(x * 10000) / 10000, rows = [];
  for (const m of meta) {
    if (!m.src) continue;
    const dctx = { window: {} }; dctx.window.EGX_DATA = {}; vm.runInNewContext(fs.readFileSync(new URL(m.id + '.js', out), 'utf8'), { window: dctx.window });
    const D = dctx.window.EGX_DATA[m.id]; if (!D) continue; const sp = D.splits || [];
    const af = (d) => { let f = 1; for (const q of sp) if (q[0] > d) f *= q[1]; return f; };
    const daily = D.rows.map(r => { const f = sp.length ? af(r[0]) : 1; return f === 1 ? { time: r[0], high: r[2], low: r[3], close: r[4], volume: r[5] } : { time: r[0], high: r4(r[2] / f), low: r4(r[3] / f), close: r4(r[4] / f), volume: Math.round(r[5] * f) }; });
    const n = daily.length; if (n <= 60) continue;
    const c = daily.map(b => b.close), last = c[n - 1], ret = (k) => n > k ? last / c[n - 1 - k] - 1 : null;
    const y = daily.slice(-252), hi = Math.max(...y.map(b => b.high)), v30 = daily.slice(-30), turn = v30.reduce((a, b) => a + b.volume * b.close, 0) / v30.length;
    rows.push({ id: m.id, last, date: daily[n - 1].time, d1: ret(1), m1: ret(21), y1: ret(252), rsi: TA.rsi(c, 14)[n - 1], fromHi: last / hi - 1, turn, s50: TA.sma(c, 50)[n - 1], s200: TA.sma(c, 200)[n - 1] });
  }
  fs.writeFileSync(new URL('./scan.js', out), `window.EGX_SCAN=${JSON.stringify({ adj: true, fetched: new Date().toISOString(), rows })};`);
  console.log('scan rows', rows.length);
} catch (e) { console.log('scan build failed', e.message); }
