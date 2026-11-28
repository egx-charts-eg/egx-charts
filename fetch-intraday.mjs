// Intraday bars (15m for ~60 days, 1h for ~2 years) from Yahoo's chart endpoint using the ISIN-style symbols in universe.json.
// Writes data/i/<ID>.js and data/intra.js. Bar times are Cairo wall-clock seconds (shifted so the chart axis shows Cairo time).
import fs from 'fs';
const live = new Set(); try { const w = {}; new Function('window', fs.readFileSync(new URL('../data/symbols.js', import.meta.url), 'utf8'))(w); for (const m of w.EGX_SYMBOLS) if (m.src) live.add(m.id); } catch { }
const U = JSON.parse(fs.readFileSync(new URL('./universe.json', import.meta.url))).filter(u => u.isin && (!live.size || live.has(u.id)));
const dir = new URL('../data/i/', import.meta.url); fs.mkdirSync(dir, { recursive: true });
const H = { headers: { 'User-Agent': 'Mozilla/5.0' } };
const fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'Africa/Cairo', hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' });
const shift = (t) => { const p = Object.fromEntries(fmt.formatToParts(new Date(t * 1000)).map(x => [x.type, +x.value])); return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) / 1000; };
const r3 = x => Math.round(x * 1000) / 1000;
async function get(isin, iv, rg) {
  for (let k = 0; k < 3; k++) { try { const j = await (await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${isin}?range=${rg}&interval=${iv}`, H)).json(); const x = j?.chart?.result?.[0]; if (!x?.timestamp) return null; const q = x.indicators.quote[0]; const out = []; x.timestamp.forEach((t, i) => { if (q.close[i] == null || q.open[i] == null || !(q.volume[i] > 0)) return; out.push([shift(t), r3(q.open[i]), r3(q.high[i]), r3(q.low[i]), r3(q.close[i]), q.volume[i] || 0]); }); return out; } catch { await new Promise(r => setTimeout(r, 700)); } }
  return null;
}
const ids = []; let idx = 0;
async function worker() { while (idx < U.length) { const u = U[idx++]; const m = await get(u.isin, '15m', '60d'), h = await get(u.isin, '60m', '730d'); if (h && h.length > 20) { fs.writeFileSync(new URL(u.id + '.js', dir), `window.EGX_INTRA=window.EGX_INTRA||{};window.EGX_INTRA[${JSON.stringify(u.id)}]=${JSON.stringify({ m: m || [], h })};`); ids.push(u.id); } await new Promise(r => setTimeout(r, 120)); } }
await Promise.all([worker(), worker(), worker()]);
fs.writeFileSync(new URL('../data/intra.js', import.meta.url), `window.EGX_INTRA_IDS=${JSON.stringify(ids.sort())};window.EGX_INTRA_FETCHED=${JSON.stringify(new Date().toISOString())};`);
console.log('intraday for', ids.length, 'of', U.length);
