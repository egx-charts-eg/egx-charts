'use strict';
const LW = LightweightCharts;
const $ = (s) => document.querySelector(s);
const el = (tag, attrs = {}, ...kids) => { const e = document.createElement(tag); for (const k in attrs) { if (k === 'class') e.className = attrs[k]; else if (k.startsWith('on')) e[k] = attrs[k]; else e.setAttribute(k, attrs[k]); } kids.flat().forEach(c => e.append(c)); return e; };
const fmt = (v, d = 2) => v == null || !isFinite(v) ? '–' : Number(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (v) => v == null || !isFinite(v) ? '–' : (v >= 0 ? '+' : '') + (v * 100).toFixed(2) + '%';
const cls = (v) => v == null ? '' : v >= 0 ? 'u' : 'd';
const L2 = (ar, en) => lang === 'ar' ? ar : en;
const store = { get: (k, d) => { try { const v = localStorage.getItem('egx.' + k); return v == null ? d : JSON.parse(v); } catch { return d; } }, set: (k, v) => { try { localStorage.setItem('egx.' + k, JSON.stringify(v)); } catch { } } };

/* ---------------- i18n ---------------- */
const I18N = {
  ar: { search: 'ابحث عن سهم (COMI)', log: 'لوغاريتمي', indicators: 'المؤشرات', script: 'سكربت', stats: 'إحصائيات', drawings: 'الرسومات', screener: 'الماسح',
    add: 'إضافة', compare: 'مقارنة / نسبة سهم لسهم آخر', cmpPh: 'رمز السهم الثاني (مثال ETEL)', apply: 'تطبيق', cmpHint: 'بيرسم النسبة (سعر السهم ÷ سعر السهم التاني) في نافذة جديدة، وبيحسب الارتباط في الإحصائيات.',
    load: 'تحميل', run: 'تشغيل', save: 'حفظ', clearOut: 'مسح', autorun: 'تشغيل تلقائي', apiTitle: 'توثيق واجهة السكربت',
    undo: 'تراجع', clearAll: 'مسح الكل', drawHint: 'اختار أداة من الشريط الجانبي واضغط نقطتين على الشارت. اضغط على رسمة لتحديدها ثم Delete لمسحها. Esc للإلغاء.',
    scan: 'مسح كل الأسهم', price: 'السعر', chg: 'يومي', rsi: 'RSI', fromHigh: 'من القمة', filter: 'الكل',
    dataNote: 'بيانات يومية (EOD) – آخر تحديث', noData: 'لا توجد بيانات لهذا الرمز', unknown: 'رمز غير معروف',
    t_vp: 'بروفايل الحجم (نطاق ثابت)', t_cursor: 'مؤشر', t_trend: 'خط اتجاه', t_ray: 'شعاع', t_hline: 'خط أفقي', t_vline: 'خط رأسي', t_rect: 'مستطيل', t_fib: 'فيبوناتشي', t_text: 'نص', t_measure: 'قياس', t_magnet: 'مغناطيس', t_color: 'اللون',
    enterText: 'اكتب النص ثم Enter', ex: 'أمثلة سكربت', savedPh: 'سكربتاتي المحفوظة', saveName: 'اسم السكربت؟', ranges: ['شهر', '3 شهور', '6 شهور', 'سنة', '3 سنين', '5 سنين', 'الكل'],
    noIntra: 'لا توجد بيانات داخل اليوم لهذا السهم', alerts: 'تنبيهات', aboutTxt: 'الرسوم البيانية بواسطة', tf: { '15m': '15 دقيقة', '1h': 'ساعة', '2h': 'ساعتان', '3h': '3 ساعات', '4h': '4 ساعات', D: 'يوم', W: 'أسبوع', M: 'شهر', Q: 'ربع', Y: 'سنة' }, types: { candle: 'شموع', bar: 'أعمدة', line: 'خط', area: 'مساحة' },
    stat: { last: 'آخر سعر', date: 'آخر تاريخ بيانات', since: 'أول تاريخ بيانات', d1: 'يومي', w1: 'أسبوع (5 جلسات)', m1: 'شهر (21)', m3: '3 شهور (63)', m6: '6 شهور (126)', y1: 'سنة (252)', ytd: 'منذ بداية السنة', hi: 'أعلى سعر 52 أسبوع', lo: 'أقل سعر 52 أسبوع', fromHi: 'البعد عن القمة', fromLo: 'البعد عن القاع', avgVol: 'متوسط الحجم 30 يوم', turn: 'متوسط قيمة التداول 30 يوم (جنيه)', vol: 'التذبذب السنوي', dd: 'أقصى تراجع (سنة)', rsi: 'RSI(14)', atr: 'ATR(14) كنسبة', trend: 'الاتجاه', up: 'صاعد (50 > 200)', down: 'هابط (50 < 200)', ratio: 'النسبة الحالية', ratioPct: 'مكان النسبة في آخر سنة', corr: 'الارتباط (60 جلسة)', corr1: 'الارتباط (سنة)', cmp: 'مقارنة مع', note: 'مفيش نسب مالية (P/E مثلاً) في المصدر المجاني. تقدر تحسب أي نسبة سعرية بالسكربت.' },
    cols: { sym: 'الرمز', trend: 'الاتجاه' }, filters: ['الكل', 'RSI أقل من 30', 'RSI أكبر من 70', 'قريب من القمة (أقل من 5%)', 'صاعد (50>200)', 'هابط (50<200)'] },
  en: { search: 'Search symbol (COMI)', log: 'Log', indicators: 'Indicators', script: 'Script', stats: 'Stats', drawings: 'Drawings', screener: 'Screener',
    add: 'Add', compare: 'Compare / ratio to another stock', cmpPh: 'Second symbol (e.g. ETEL)', apply: 'Apply', cmpHint: 'Plots price ratio (this ÷ other) in its own pane and adds correlation to Stats.',
    load: 'Load', run: 'Run', save: 'Save', clearOut: 'Clear', autorun: 'Auto-run', apiTitle: 'Script API reference',
    undo: 'Undo', clearAll: 'Clear all', drawHint: 'Pick a tool on the left and click two points on the chart. Click a drawing to select it, Delete removes it. Esc cancels.',
    scan: 'Scan all stocks', price: 'Price', chg: '1D', rsi: 'RSI', fromHigh: 'From high', filter: 'All',
    dataNote: 'Daily (EOD) data, fetched', noData: 'No data for this symbol', unknown: 'Unknown symbol',
    t_vp: 'Volume Profile (Fixed Range)', t_cursor: 'Cursor', t_trend: 'Trend line', t_ray: 'Ray', t_hline: 'Horizontal line', t_vline: 'Vertical line', t_rect: 'Rectangle', t_fib: 'Fib retracement', t_text: 'Text', t_measure: 'Measure', t_magnet: 'Magnet', t_color: 'Color',
    enterText: 'Type text, Enter', ex: 'Script examples', savedPh: 'My saved scripts', saveName: 'Script name?', ranges: ['1M', '3M', '6M', '1Y', '3Y', '5Y', 'All'],
    noIntra: 'No intraday data for this symbol', alerts: 'Alerts', aboutTxt: 'Charts powered by', tf: { '15m': '15 minutes', '1h': '1 hour', '2h': '2 hours', '3h': '3 hours', '4h': '4 hours', D: 'Day', W: 'Week', M: 'Month', Q: 'Quarter', Y: 'Year' }, types: { candle: 'Candles', bar: 'Bars', line: 'Line', area: 'Area' },
    stat: { last: 'Last close', date: 'Last data date', since: 'First data date', d1: '1 day', w1: '1 week (5 sessions)', m1: '1 month (21)', m3: '3 months (63)', m6: '6 months (126)', y1: '1 year (252)', ytd: 'Year to date', hi: '52w high', lo: '52w low', fromHi: 'From high', fromLo: 'From low', avgVol: 'Avg volume 30d', turn: 'Avg turnover 30d (EGP)', vol: 'Annualised volatility', dd: 'Max drawdown (1y)', rsi: 'RSI(14)', atr: 'ATR(14) % of price', trend: 'Trend', up: 'Up (50 > 200)', down: 'Down (50 < 200)', ratio: 'Current ratio', ratioPct: 'Ratio percentile (1y)', corr: 'Correlation (60 sessions)', corr1: 'Correlation (1y)', cmp: 'Compared with', note: 'No fundamental ratios (e.g. P/E) in the free data source. Any price-based ratio can be computed in a script.' },
    cols: { sym: 'Symbol', trend: 'Trend' }, filters: ['All', 'RSI below 30', 'RSI above 70', 'Near 52w high (<5%)', 'Uptrend (50>200)', 'Downtrend (50<200)'] }
};
let lang = store.get('lang', 'ar');
const T = () => I18N[lang];

/* ---------------- data ---------------- */
const SYMS = window.EGX_SYMBOLS || [];
const symMap = Object.fromEntries(SYMS.map(s => [s.id, s]));
function loadDaily(id) {
  id = id.toUpperCase();
  if (!symMap[id]) return Promise.reject(new Error(T().unknown + ': ' + id));
  if (window.EGX_DATA && window.EGX_DATA[id]) return Promise.resolve(window.EGX_DATA[id].rows.map(r => ({ time: r[0], open: r[1], high: r[2], low: r[3], close: r[4], volume: r[5] })));
  return new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'data/' + id + '.js'; s.onload = () => res(loadDaily(id)); s.onerror = () => rej(new Error(T().noData + ': ' + id)); document.head.append(s); });
}
const days = (d) => typeof d === 'number' ? d / 86400 : Date.parse(d + 'T00:00:00Z') / 86400000;
const INTRA_IDS = new Set(window.EGX_INTRA_IDS || []);
const INTRA = ['15m', '1h', '2h', '3h', '4h'], isIntra = (tf) => INTRA.includes(tf);
const tlabel = (t) => typeof t === 'number' ? new Date(t * 1000).toISOString().slice(0, 16).replace('T', ' ') : t;
function loadIntra(id) {
  id = id.toUpperCase(); window.EGX_INTRA = window.EGX_INTRA || {};
  if (window.EGX_INTRA[id]) return Promise.resolve(window.EGX_INTRA[id]);
  return new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'data/i/' + id + '.js'; s.onload = () => res(window.EGX_INTRA[id]); s.onerror = () => rej(new Error(T().noIntra)); document.head.append(s); });
}
const toBars = (rows) => rows.map(r => ({ time: r[0], open: r[1], high: r[2], low: r[3], close: r[4], volume: r[5] }));
function intraBars(tf) {
  if (!S.intra) return [];
  if (tf === '15m') return toBars(S.intra.m);
  const h = toBars(S.intra.h); if (tf === '1h') return h;
  const n = tf === '2h' ? 2 : tf === '3h' ? 3 : 4, out = []; let day = null, cnt = 0, cur = null;
  for (const b of h) { const d = new Date(b.time * 1000).toISOString().slice(0, 10); if (d !== day) { day = d; cnt = 0; cur = null; } if (cnt % n === 0) { cur = { ...b }; out.push(cur); } else { cur.high = Math.max(cur.high, b.high); cur.low = Math.min(cur.low, b.low); cur.close = b.close; cur.volume += b.volume; } cnt++; }
  return out;
}
function aggregate(rows, tf) {
  if (tf === 'D') return rows;
  if (isIntra(tf)) return rows.length && typeof rows[0].time === 'number' ? rows : [];
  const key = (d) => { if (tf === 'W') { const n = days(d); const dow = new Date(n * 86400000).getUTCDay(); return n - dow; } if (tf === 'M') return d.slice(0, 7); if (tf === 'Q') return d.slice(0, 4) + 'Q' + Math.floor((+d.slice(5, 7) - 1) / 3); return d.slice(0, 4); };
  const out = []; let k = null, cur = null;
  for (const r of rows) { const kk = key(r.time); if (kk !== k) { k = kk; cur = { time: r.time, open: r.open, high: r.high, low: r.low, close: r.close, volume: r.volume }; out.push(cur); } else { cur.high = Math.max(cur.high, r.high); cur.low = Math.min(cur.low, r.low); cur.close = r.close; cur.volume += r.volume; } }
  return out;
}
const col = (bars, k) => bars.map(b => b[k]);
function alignTo(bars, other) { // forward-fill other onto bars' times
  const o = { time: [], open: [], high: [], low: [], close: [], volume: [] }; let j = -1;
  for (const b of bars) { while (j + 1 < other.length && other[j + 1].time <= b.time) j++; const x = j >= 0 ? other[j] : null; o.time.push(b.time); for (const k of ['open', 'high', 'low', 'close', 'volume']) o[k].push(x ? x[k] : null); }
  return o;
}

/* ---------------- state ---------------- */
const S = { sym: store.get('sym', 'COMI'), tf: store.get('tf', 'D'), type: store.get('type', 'candle'), range: store.get('range', 3), log: store.get('log', false), daily: [], bars: [], idxByTime: {},
  inds: store.get('inds', [{ id: 'volume', p: [] }, { id: 'sma', p: [50] }, { id: 'sma', p: [200] }]), cmp: null, cmpDaily: null, tool: 'cursor', magnet: store.get('magnet', true), color: store.get('dcolor', '#f5c542'), scriptOn: false, nextPane: 1 };

/* ---------------- chart ---------------- */
const chartEl = $('#chart');
const chart = LW.createChart(chartEl, { autoSize: true, layout: { attributionLogo: false, background: { color: '#0e1116' }, textColor: '#8593a3', panes: { separatorColor: '#2a3340', separatorHoverColor: '#2f81f7' } }, grid: { vertLines: { color: '#1a212b' }, horzLines: { color: '#1a212b' } }, rightPriceScale: { borderColor: '#2a3340' }, timeScale: { borderColor: '#2a3340', rightOffset: 6, timeVisible: false }, crosshair: { mode: LW.CrosshairMode.Normal } });
let wm = null;
function makeWatermark() { try { if (wm) return; wm = LW.createTextWatermark(chart.panes()[0], { horzAlign: 'center', vertAlign: 'center', lines: [{ text: 'TradinGo', color: 'rgba(133,147,163,0.13)', fontSize: 44, fontStyle: 'bold' }] }); } catch (e) { } }
let main = null, markersApi = null, extra = [], scriptSeries = [], curVals = [];

function makeMain() {
  if (main) { try { chart.removeSeries(main); } catch { } main = null; markersApi = null; }
  const up = '#26a69a', dn = '#ef5350';
  if (S.type === 'candle') main = chart.addSeries(LW.CandlestickSeries, { upColor: up, downColor: dn, borderVisible: false, wickUpColor: up, wickDownColor: dn }, 0);
  else if (S.type === 'bar') main = chart.addSeries(LW.BarSeries, { upColor: up, downColor: dn }, 0);
  else if (S.type === 'line') main = chart.addSeries(LW.LineSeries, { color: '#2f81f7', lineWidth: 2 }, 0);
  else main = chart.addSeries(LW.AreaSeries, { lineColor: '#2f81f7', topColor: 'rgba(47,129,247,.35)', bottomColor: 'rgba(47,129,247,0)' }, 0);
  main.applyOptions({ priceLineColor: '#8593a3' }); makeWatermark();
  main.setData(S.bars.map(b => (S.type === 'line' || S.type === 'area') ? { time: b.time, value: b.close } : b));
  markersApi = LW.createSeriesMarkers(main, []);
}

/* ---------------- indicators ---------------- */
const PAL = ['#f5c542', '#2f81f7', '#e5534b', '#a371f7', '#3fb950', '#ff8f40', '#56d4dd', '#f778ba'];
const IND = {
  vpvr: { label: 'Volume Profile (Fixed Range)', pane: 0, params: [0, 24], vp: true, build: () => [], title: (p) => 'Volume Profile ' + (p[0] > 0 ? L2('آخر ', 'last ') + p[0] + L2(' شمعة', ' bars') : L2('النطاق المرئي', 'visible range')) + ' · ' + (p[1] || 24) + L2(' صف', ' rows') },
  volume: { label: 'Volume', pane: 1, params: [], build: (B) => [{ name: 'Volume', type: 'hist', values: B.volume, colors: B.close.map((c, i) => (c >= B.open[i]) ? 'rgba(38,166,154,.55)' : 'rgba(239,83,80,.55)') }] },
  sma: { label: 'SMA', pane: 0, params: [20], build: (B, p, ci) => [{ name: 'SMA ' + p[0], values: TA.sma(B.close, p[0]), color: PAL[ci % PAL.length] }] },
  ema: { label: 'EMA', pane: 0, params: [20], build: (B, p, ci) => [{ name: 'EMA ' + p[0], values: TA.ema(B.close, p[0]), color: PAL[ci % PAL.length] }] },
  wma: { label: 'WMA', pane: 0, params: [20], build: (B, p, ci) => [{ name: 'WMA ' + p[0], values: TA.wma(B.close, p[0]), color: PAL[ci % PAL.length] }] },
  bb: { label: 'Bollinger Bands', pane: 0, params: [20, 2], build: (B, p) => { const r = TA.bb(B.close, p[0], p[1]); return [{ name: 'BB mid', values: r.mid, color: '#f5c542' }, { name: 'BB upper', values: r.upper, color: '#2f81f7' }, { name: 'BB lower', values: r.lower, color: '#2f81f7' }]; } },
  donchian: { label: 'Donchian Channel', pane: 0, params: [20], build: (B, p) => { const r = TA.donchian(B.high, B.low, p[0]); return [{ name: 'DC up', values: r.upper, color: '#3fb950' }, { name: 'DC mid', values: r.mid, color: '#8593a3' }, { name: 'DC low', values: r.lower, color: '#e5534b' }]; } },
  supertrend: { label: 'Supertrend', pane: 0, params: [10, 3], build: (B, p) => { const r = TA.supertrend(B.high, B.low, B.close, p[0], p[1]); return [{ name: 'Supertrend', values: r.line, colors: r.dir.map(d => d === 1 ? '#26a69a' : '#ef5350') }]; } },
  vwap: { label: 'Rolling VWAP', pane: 0, params: [20], build: (B, p) => [{ name: 'VWAP ' + p[0], values: TA.vwap(B.high, B.low, B.close, B.volume, p[0]), color: '#a371f7' }] },
  rsi: { label: 'RSI', pane: 'new', band: true, params: [14], build: (B, p) => [{ name: 'RSI', values: TA.rsi(B.close, p[0]), color: '#7e57c2', levels: [30, 50, 70] }] },
  macd: { label: 'MACD', pane: 'new', params: [12, 26, 9], build: (B, p) => { const r = TA.macd(B.close, p[0], p[1], p[2]); return [{ name: 'Hist', type: 'hist', values: r.hist, colors: r.hist.map(v => v >= 0 ? 'rgba(38,166,154,.7)' : 'rgba(239,83,80,.7)') }, { name: 'MACD', values: r.macd, color: '#2f81f7' }, { name: 'Signal', values: r.signal, color: '#f5c542' }]; } },
  stoch: { band: true, label: 'Stochastic', pane: 'new', params: [14, 3, 3], build: (B, p) => { const r = TA.stoch(B.high, B.low, B.close, p[0], p[1], p[2]); return [{ name: '%K', values: r.k, color: '#2f81f7', levels: [20, 80] }, { name: '%D', values: r.d, color: '#f5c542' }]; } },
  cci: { band: true, label: 'CCI', pane: 'new', params: [20], build: (B, p) => [{ name: 'CCI', values: TA.cci(B.high, B.low, B.close, p[0]), color: '#56d4dd', levels: [-100, 100] }] },
  atr: { label: 'ATR', pane: 'new', params: [14], build: (B, p) => [{ name: 'ATR', values: TA.atr(B.high, B.low, B.close, p[0]), color: '#ff8f40' }] },
  adx: { label: 'ADX / DMI', pane: 'new', params: [14], build: (B, p) => { const r = TA.adx(B.high, B.low, B.close, p[0]); return [{ name: 'ADX', values: r.adx, color: '#f5c542', levels: [25] }, { name: '+DI', values: r.plus, color: '#26a69a' }, { name: '-DI', values: r.minus, color: '#ef5350' }]; } },
  obv: { label: 'OBV', pane: 'new', params: [], build: (B) => [{ name: 'OBV', values: TA.obv(B.close, B.volume), color: '#3fb950' }] },
  roc: { label: 'ROC %', pane: 'new', params: [12], build: (B, p) => [{ name: 'ROC', values: TA.roc(B.close, p[0]), color: '#f778ba', levels: [0] }] },
  willr: { band: true, label: 'Williams %R', pane: 'new', params: [14], build: (B, p) => [{ name: '%R', values: TA.willr(B.high, B.low, B.close, p[0]), color: '#56d4dd', levels: [-20, -80] }] },
  mfi: { band: true, label: 'MFI', pane: 'new', params: [14], build: (B, p) => [{ name: 'MFI', values: TA.mfi(B.high, B.low, B.close, B.volume, p[0]), color: '#e5534b', levels: [20, 80] }] }
};
function barsObj() { return { time: col(S.bars, 'time'), open: col(S.bars, 'open'), high: col(S.bars, 'high'), low: col(S.bars, 'low'), close: col(S.bars, 'close'), volume: col(S.bars, 'volume') }; }
function lineData(times, values, colors) { const o = []; for (let i = 0; i < times.length; i++) { const v = values[i]; if (v == null || !isFinite(v)) o.push({ time: times[i] }); else { const d = { time: times[i], value: v }; if (colors && colors[i]) d.color = colors[i]; o.push(d); } } return o; }
function addSpec(spec, B, paneIdx, list, o) {
  o = o || {};
  let s;
  if (spec.type === 'hist') { s = chart.addSeries(LW.HistogramSeries, { visible: !o.hidden, priceFormat: { type: 'volume' }, priceLineVisible: false, lastValueVisible: false, base: 0 }, paneIdx); }
  else s = chart.addSeries(LW.LineSeries, { color: spec.color || '#2f81f7', lineWidth: o.width || spec.width || 1.5, visible: !o.hidden, priceLineVisible: false, lastValueVisible: paneIdx !== 0 || !!spec.last, crosshairMarkerVisible: false, title: '' }, paneIdx);
  s.setData(lineData(B.time, spec.values, spec.colors));
  (o.levels || spec.levels || []).forEach(v => s.createPriceLine({ price: v, color: o.levelColor || '#787b86', lineWidth: 1, lineStyle: 2, axisLabelVisible: false, title: '' }));
  list.push(s); return s;
}
function rebuildExtras() {
  [...extra, ...scriptSeries].forEach(s => { try { chart.removeSeries(s); } catch { } });
  extra = []; scriptSeries = []; curVals = [];
  const B = barsObj(); let nextPane = 1, ci = 0;
  S.inds.forEach((ind, k) => {
    const d = IND[ind.id]; if (!d) return;
    const o = ind.o = ind.o || {};
    const p = ind.p.length ? ind.p : d.params;
    const BB = (o.src && o.src !== 'close' && SRC_OK.has(ind.id)) ? { ...B, close: srcArr(B, o.src) } : B;
    const specs = d.build(BB, p, ci);
    if (ind.id === 'rsi' && (o.ma ?? true)) specs.push({ name: 'MA', values: (o.maType === 'EMA' ? TA.ema : TA.sma)(specs[0].values, o.maLen || 14), color: '#f5c542' });
    if (d.pane === 0) ci++;
    const pane = d.pane === 0 ? 0 : nextPane++;
    const series = specs.map((sp, j) => addSpec(sp, B, pane, extra, { hidden: o.hidden, width: o.width, levelColor: o.levelColor, levels: j === 0 ? o.levels : [], ...(o.colors && o.colors[j] && !sp.colors ? {} : {}) }));
    series.forEach((sr, j) => { if (o.colors && o.colors[j] && specs[j].type !== 'hist' && !specs[j].colors) sr.applyOptions({ color: o.colors[j] }); });
    curVals[k] = { specs, series, pane };
  });
  S.nextPane = nextPane;
  if (S.cmp && S.cmpDaily) { const o = alignTo(S.bars, aggregate(S.cmpDaily, S.tf)); const r = TA.ratio(B.close, o.close); addSpec({ name: 'ratio', values: r, color: '#f778ba', width: 1.5, last: true }, B, S.nextPane++, extra); }
  try { chart.panes().forEach((p, i) => p.setStretchFactor(i === 0 ? 4 : 1)); } catch { }
  renderIndList(); renderPaneLegends();
  if (S.scriptOn) runScript(true);
}

function renderIndList() {
  const box = $('#indList'); box.innerHTML = '';
  S.inds.forEach((ind, k) => {
    const d = IND[ind.id]; if (!d) return;
    const inp = d.params.length ? el('input', { type: 'text', value: (ind.p.length ? ind.p : d.params).join(','), title: 'params', onchange: (e) => { const v = e.target.value.split(',').map(x => parseFloat(x)).filter(x => !isNaN(x) && (x > 0 || (ind.id === 'vpvr' && x === 0))); if (v.length) { ind.p = v; saveInds(); rebuildExtras(); } } }) : el('span');
    box.append(el('div', { class: 'ind' }, el('span', { class: 'nm' }, d.label), inp, el('span', { class: 'v', id: 'iv' + k }), el('button', { title: 'hide/show', onclick: () => { (ind.o = ind.o || {}).hidden = !ind.o.hidden; saveInds(); rebuildExtras(); } }, '👁'), el('button', { title: 'settings', onclick: () => openIndSettings(k) }, '⚙'), el('button', { title: 'remove', onclick: () => { S.inds.splice(k, 1); saveInds(); rebuildExtras(); } }, '×')));
  });
}
const saveInds = () => store.set('inds', S.inds);
function updateIndValues(time) {
  const i = S.idxByTime[time] ?? S.bars.length - 1; lastLegI = i; paintLegendValues();
  S.inds.forEach((ind, k) => { const c = curVals[k], e = $('#iv' + k); if (!c || !e) return; e.textContent = c.specs.filter(s => s.type !== 'hist' || ind.id === 'volume').map(s => fmt(s.values[i], ind.id === 'volume' ? 0 : 2)).join(' / '); });
}

/* ---------------- legend / crosshair ---------------- */
function legendFor(i) {
  const b = S.bars[i]; if (!b) return; const p = S.bars[i - 1], c = p ? b.close / p.close - 1 : null;
  $('#legend').innerHTML = `<b>${S.sym}</b> ${tlabel(b.time)} &nbsp; O <b>${fmt(b.open)}</b> H <b>${fmt(b.high)}</b> L <b>${fmt(b.low)}</b> C <b class="${cls(c)}">${fmt(b.close)}</b> <span class="${cls(c)}">${pct(c)}</span> &nbsp; Vol <b>${fmt(b.volume, 0)}</b>`;
}
chart.subscribeCrosshairMove((p) => { const t = p.time; const i = t != null ? S.idxByTime[t] : S.bars.length - 1; if (i != null) { legendFor(i); updateIndValues(t ?? S.bars.at(-1).time); } });

/* ---------------- ranges ---------------- */
const RANGE_DAYS = [30, 91, 182, 365, 1095, 1825, 0];
function applyRange() {
  const n = S.bars.length; if (!n) return; const d = RANGE_DAYS[S.range];
  if (!d) { chart.timeScale().fitContent(); return; }
  const last = days(S.bars[n - 1].time); let from = 0; for (let i = n - 1; i >= 0; i--) { if (last - days(S.bars[i].time) > d) { from = i; break; } }
  chart.timeScale().setVisibleLogicalRange({ from: Math.max(from, 0) - 1, to: n + 5 });
}

/* ---------------- symbol / timeframe ---------------- */
async function setSymbol(id, keepRange) {
  id = id.toUpperCase().trim();
  if (!symMap[id]) { $('#symInput').value = S.sym; return; }
  try { S.daily = await loadDaily(id); } catch (e) { if (!isIntra(S.tf)) { alert(e.message); return; } S.daily = []; }
  S.intra = null; if (isIntra(S.tf)) { try { S.intra = await loadIntra(id); } catch (e) { alert(e.message); } }
  S.sym = id; store.set('sym', id); $('#symInput').value = id;
  setName();
  document.title = id + ' | TradinGo';
  refreshBars(); if (!keepRange) applyRange(); loadDrawings(); selected = null; renderDrawList(); redrawSoon(); renderStats(); checkAlerts(false);
}
function setName() { const m = symMap[S.sym]; if (m) $('#symName').textContent = (lang === 'ar' ? m.ar : m.en) + ' · ' + (lang === 'ar' ? m.secAr : m.secEn) + (m.src === 'hourly' ? (lang === 'ar' ? ' · (يومي مشتق من بيانات الساعة)' : ' · (daily derived from hourly)') : '') + (!m.src ? (lang === 'ar' ? ' · لا توجد بيانات أسعار' : ' · no price data') : ''); }
function refreshBars() {
  chart.applyOptions({ timeScale: { timeVisible: isIntra(S.tf), secondsVisible: false } });
  S.bars = isIntra(S.tf) ? intraBars(S.tf) : aggregate(S.daily, S.tf); S.idxByTime = {}; S.bars.forEach((b, i) => S.idxByTime[b.time] = i);
  makeMain(); rebuildExtras(); legendFor(S.bars.length - 1); updateIndValues(S.bars.at(-1).time);
}

/* ---------------- UI wiring ---------------- */
function buildTop() {
  const tf = $('#tfGroup'); tf.innerHTML = '';
  ['15m', '1h', '2h', '3h', '4h', 'D', 'W', 'M', 'Q', 'Y'].forEach(k => tf.append(el('button', { class: S.tf === k ? 'on' : '', title: T().tf[k], onclick: async () => { if (isIntra(k) && !INTRA_IDS.has(S.sym)) { alert(T().noIntra); return; } S.tf = k; store.set('tf', k); S.intra = isIntra(k) ? await loadIntra(S.sym).catch(() => null) : null; buildTop(); refreshBars(); applyRange(); loadDrawings(); renderDrawList(); redrawSoon(); } }, k)));
  const ty = $('#typeGroup'); ty.innerHTML = '';
  [['candle', '🕯'], ['bar', '▥'], ['line', '📈'], ['area', '◭']].forEach(([k, ic]) => ty.append(el('button', { class: S.type === k ? 'on' : '', title: T().types[k], onclick: () => { S.type = k; store.set('type', k); buildTop(); makeMain(); rebuildExtras(); redrawSoon(); } }, ic)));
  const rs = $('#rangeSel'); rs.innerHTML = ''; T().ranges.forEach((r, i) => rs.append(el('option', { value: i }, r))); rs.value = S.range;
  const dl = $('#symList'); if (!dl.children.length) SYMS.forEach(s => dl.append(el('option', { value: s.id }, s.id + ' - ' + (s.en || '') + ' - ' + s.ar)));
  $('#langBtn').textContent = lang === 'ar' ? 'EN' : 'ع';
  $('#dataNote').textContent = T().dataNote + ' ' + (window.EGX_FETCHED || '').slice(0, 10);
}
function applyLang() {
  document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach(e => e.textContent = T()[e.dataset.i18n]);
  document.querySelectorAll('[data-i18n-ph]').forEach(e => e.placeholder = T()[e.dataset.i18nPh]);
  buildTop(); buildTools(); buildSelects(); if (typeof labelsIO === 'function') { labelsIO(); buildAlertsUI(); } $('#apiDoc').textContent = API_DOC; setName();
  if (S.daily.length) { renderStats(); renderDrawList(); }
  if (scrRows) renderScreener();
}
function buildSelects() {
  const si = $('#indSel'); si.innerHTML = ''; Object.entries(IND).forEach(([k, d]) => si.append(el('option', { value: k }, d.label)));
  const ex = $('#exSel'); ex.innerHTML = ''; ex.append(el('option', { value: '' }, T().ex)); EXAMPLES.forEach((e, i) => ex.append(el('option', { value: i }, e.name)));
  refreshSaved();
}
$('#indAdd').onclick = () => { const id = $('#indSel').value; S.inds.push({ id, p: [] }); saveInds(); rebuildExtras(); };
$('#symInput').addEventListener('change', (e) => setSymbol(e.target.value));
$('#symInput').addEventListener('focus', (e) => e.target.select());
$('#rangeSel').onchange = (e) => { S.range = +e.target.value; store.set('range', S.range); applyRange(); };
$('#logScale').checked = S.log; $('#logScale').onchange = (e) => { S.log = e.target.checked; store.set('log', S.log); chart.priceScale('right').applyOptions({ mode: S.log ? LW.PriceScaleMode.Logarithmic : LW.PriceScaleMode.Normal }); redrawSoon(); };
chart.priceScale('right').applyOptions({ mode: S.log ? LW.PriceScaleMode.Logarithmic : LW.PriceScaleMode.Normal });
$('#langBtn').onclick = () => { lang = lang === 'ar' ? 'en' : 'ar'; store.set('lang', lang); applyLang(); };
document.querySelectorAll('#tabs button').forEach(b => b.onclick = () => { document.querySelectorAll('#tabs button').forEach(x => x.classList.toggle('on', x === b)); document.querySelectorAll('.tab').forEach(t => t.hidden = t.id !== 'tab-' + b.dataset.tab); if (b.dataset.tab === 'stats') renderStats(); });
$('#cmpBtn').onclick = async () => { const id = $('#cmpInput').value.toUpperCase().trim(); if (!symMap[id]) return; S.cmp = id; S.cmpDaily = await loadDaily(id); rebuildExtras(); renderStats(); };
$('#cmpClr').onclick = () => { S.cmp = null; S.cmpDaily = null; $('#cmpInput').value = ''; rebuildExtras(); renderStats(); };

/* ---------------- stats ---------------- */
function statsFor(daily, cmpDaily) {
  const n = daily.length, c = col(daily, 'close'), last = c[n - 1]; const ret = (k) => n > k ? last / c[n - 1 - k] - 1 : null;
  const yr = daily[n - 1].time.slice(0, 4); const fi = daily.findIndex(b => b.time.slice(0, 4) === yr); const ytd = fi > 0 ? last / daily[fi - 1].close - 1 : null;
  const y = daily.slice(-252), hi = Math.max(...y.map(b => b.high)), lo = Math.min(...y.map(b => b.low));
  const v30 = daily.slice(-30), avgV = v30.reduce((a, b) => a + b.volume, 0) / v30.length, turn = v30.reduce((a, b) => a + b.volume * b.close, 0) / v30.length;
  const r = TA.returns(c).slice(-252).filter(x => x != null), mean = r.reduce((a, b) => a + b, 0) / r.length, vol = Math.sqrt(r.reduce((a, b) => a + (b - mean) ** 2, 0) / r.length) * Math.sqrt(252);
  let peak = -Infinity, dd = 0; y.forEach(b => { peak = Math.max(peak, b.close); dd = Math.min(dd, b.close / peak - 1); });
  const rsi = TA.rsi(c, 14)[n - 1], atr = TA.atr(col(daily, 'high'), col(daily, 'low'), c, 14)[n - 1], s50 = TA.sma(c, 50)[n - 1], s200 = TA.sma(c, 200)[n - 1];
  const o = { last, date: daily[n - 1].time, since: daily[0].time, d1: ret(1), w1: ret(5), m1: ret(21), m3: ret(63), m6: ret(126), y1: ret(252), ytd, hi, lo, fromHi: last / hi - 1, fromLo: last / lo - 1, avgV, turn, vol, dd, rsi, atrp: atr / last, s50, s200 };
  if (cmpDaily) { const al = alignTo(daily, cmpDaily), rt = TA.ratio(c, al.close), ry = rt.slice(-252).filter(x => x != null), cur = rt[n - 1]; o.ratio = cur; o.ratioPct = ry.filter(x => x <= cur).length / ry.length; const r2 = TA.returns(al.close); o.corr60 = TA.correlation(TA.returns(c), r2, 60)[n - 1]; o.corr252 = TA.correlation(TA.returns(c), r2, 252)[n - 1]; }
  return o;
}
function renderStats() {
  const box = $('#statsBox'); if (!S.daily.length) return; const s = statsFor(S.daily, S.cmpDaily), t = T().stat;
  const row = (k, v, c) => [el('div', {}, k), el('div', { class: c || '' }, v)];
  const items = [row(t.last, fmt(s.last)), row(t.date, s.date), row(t.since, s.since), row(t.d1, pct(s.d1), cls(s.d1)), row(t.w1, pct(s.w1), cls(s.w1)), row(t.m1, pct(s.m1), cls(s.m1)), row(t.m3, pct(s.m3), cls(s.m3)), row(t.m6, pct(s.m6), cls(s.m6)), row(t.y1, pct(s.y1), cls(s.y1)), row(t.ytd, pct(s.ytd), cls(s.ytd)),
  row(t.hi, fmt(s.hi)), row(t.lo, fmt(s.lo)), row(t.fromHi, pct(s.fromHi), cls(s.fromHi)), row(t.fromLo, pct(s.fromLo), cls(s.fromLo)), row(t.avgVol, fmt(s.avgV, 0)), row(t.turn, fmt(s.turn, 0)), row(t.vol, (s.vol * 100).toFixed(1) + '%'), row(t.dd, pct(s.dd), 'd'), row(t.rsi, fmt(s.rsi, 1)), row(t.atr, (s.atrp * 100).toFixed(2) + '%'),
  row(t.trend, s.s200 == null ? '–' : s.s50 > s.s200 ? t.up : t.down, s.s200 == null ? '' : s.s50 > s.s200 ? 'u' : 'd')];
  if (S.cmpDaily) items.push(row(t.cmp, S.cmp), row(t.ratio, fmt(s.ratio, 4)), row(t.ratioPct, fmt(s.ratioPct * 100, 0) + '%'), row(t.corr, fmt(s.corr60, 2)), row(t.corr1, fmt(s.corr252, 2)));
  box.innerHTML = ''; box.append(el('div', { class: 'kv' }, items.flat()), el('p', { class: 'hint' }, t.note));
}

/* ---------------- screener ---------------- */
let scrRows = null, scrSort = { k: 'turn', d: -1 }, scrFilter = 0;
$('#scrRun').onclick = async () => {
  const rows = []; let done = 0;
  await Promise.all(SYMS.filter(m => m.src).map(async m => { try { const d = await loadDaily(m.id); if (d.length > 60) { const s = statsFor(d); rows.push({ id: m.id, ...s }); } } catch { } $('#scrProg').textContent = ++done + '/' + SYMS.length; }));
  scrRows = rows; $('#scrProg').textContent = ''; renderScreener();
};
function renderScreener() {
  const box = $('#scrBox'); box.innerHTML = ''; const sel = el('select', {}, T().filters.map((f, i) => el('option', { value: i }, f))); sel.value = scrFilter; sel.onchange = (e) => { scrFilter = +e.target.value; renderScreener(); };
  const F = [() => true, r => r.rsi < 30, r => r.rsi > 70, r => r.fromHi > -0.05, r => r.s200 != null && r.s50 > r.s200, r => r.s200 != null && r.s50 < r.s200][scrFilter];
  const cols = [['id', T().cols.sym], ['last', T().price], ['d1', T().chg], ['m1', '1M'], ['y1', '1Y'], ['rsi', 'RSI'], ['fromHi', T().fromHigh], ['turn', 'EGP/d']];
  const data = scrRows.filter(F).sort((a, b) => { const x = a[scrSort.k] ?? -Infinity, y = b[scrSort.k] ?? -Infinity; return (x > y ? 1 : x < y ? -1 : 0) * scrSort.d; });
  const th = cols.map(([k, n]) => el('th', { onclick: () => { scrSort = { k, d: scrSort.k === k ? -scrSort.d : -1 }; renderScreener(); } }, n));
  const fm = { last: v => fmt(v), d1: pct, m1: pct, y1: pct, rsi: v => fmt(v, 0), fromHi: pct, turn: v => fmt(v / 1e6, 1) + 'M' };
  const trs = data.map(r => el('tr', { class: 'clk', onclick: () => { setSymbol(r.id); } }, cols.map(([k]) => el('td', { class: k === 'id' ? '' : 'n ' + (['d1', 'm1', 'y1', 'fromHi'].includes(k) ? cls(r[k]) : '') }, k === 'id' ? r.id : fm[k](r[k])))));
  box.append(sel, el('table', {}, el('thead', {}, el('tr', {}, th)), el('tbody', {}, trs)));
}

/* ---------------- drawings ---------------- */
const cv = $('#overlay'), cx = cv.getContext('2d'), wrap = $('#chartWrap');
let drawings = {}, pending = null, hover = null, selected = null, lastSig = '';
const dkey = () => 'draw.' + S.sym + (isIntra(S.tf) ? '.i' : '');
const loadDrawings = () => { if (!drawings[S.sym]) drawings[S.sym] = store.get(dkey(), []); return drawings[S.sym]; };
const saveDrawings = () => store.set(dkey(), drawings[S.sym]);
const TOOLS = [['cursor', '↖'], ['trend', '╱'], ['ray', '↗'], ['hline', '─'], ['vline', '│'], ['rect', '▭'], ['fib', '≡'], ['text', 'T'], ['measure', '↔'], ['vp', '▤']];
const NEED = { trend: 2, ray: 2, hline: 1, vline: 1, rect: 2, fib: 2, text: 1, measure: 2, vp: 2 };
function buildTools() {
  const t = $('#tools'); t.innerHTML = '';
  TOOLS.forEach(([k, ic]) => t.append(el('button', { class: S.tool === k ? 'on' : '', title: T()['t_' + k], onclick: () => setTool(k) }, ic)));
  t.append(el('hr'), el('button', { class: S.magnet ? 'on' : '', title: T().t_magnet, onclick: () => { S.magnet = !S.magnet; store.set('magnet', S.magnet); buildTools(); } }, '🧲'));
  const c = el('input', { type: 'color', value: S.color, title: T().t_color, style: 'width:30px;height:26px;padding:0;border:0;background:none' }); c.oninput = (e) => { S.color = e.target.value; store.set('dcolor', S.color); };
  t.append(c);
}
function setTool(k) { S.tool = k; pending = null; hover = null; cv.classList.toggle('active', k !== 'cursor'); buildTools(); redrawSoon(); }
function findIdx(d) { const b = S.bars; let lo = 0, hi = b.length - 1, r = 0; while (lo <= hi) { const m = (lo + hi) >> 1; if (b[m].time <= d) { r = m; lo = m + 1; } else hi = m - 1; } return r; }
function toPx(pt) { const x = chart.timeScale().logicalToCoordinate(findIdx(pt.d)), y = main.priceToCoordinate(pt.p); return x == null || y == null ? null : { x, y }; }
function plotSize() { let w = wrap.clientWidth - chart.priceScale('right').width(); let h; try { h = chart.panes()[0].getHeight(); } catch { h = wrap.clientHeight - 26; } return { w, h }; }
function fromPx(x, y) {
  const lg = chart.timeScale().coordinateToLogical(x); if (lg == null) return null; const i = Math.max(0, Math.min(S.bars.length - 1, Math.round(lg))); let p = main.coordinateToPrice(y); if (p == null) return null;
  if (S.magnet) { const b = S.bars[i]; let best = null, bd = 12; for (const v of [b.open, b.high, b.low, b.close]) { const yy = main.priceToCoordinate(v); if (yy != null && Math.abs(yy - y) < bd) { bd = Math.abs(yy - y); best = v; } } if (best != null) p = best; }
  return { d: S.bars[i].time, p };
}
function fitCanvas() { const dpr = window.devicePixelRatio || 1, { w, h } = plotSize(); const W = Math.max(10, Math.round(w)), H = Math.max(10, Math.round(h)); if (cv.width !== W * dpr || cv.height !== H * dpr) { cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px'; } cx.setTransform(dpr, 0, 0, dpr, 0, 0); return { W, H }; }

function vpCompute(d, rows) {
  const a = findIdx(d.pts[0].d), b = findIdx(d.pts[1].d), i1 = Math.min(a, b), i2 = Math.max(a, b), bars = S.bars.slice(i1, i2 + 1);
  if (!bars.length) return null; let hi = -Infinity, lo = Infinity; bars.forEach(x => { hi = Math.max(hi, x.high); lo = Math.min(lo, x.low); });
  if (!(hi > lo)) hi = lo + 0.01; const step = (hi - lo) / rows, up = new Array(rows).fill(0), dn = new Array(rows).fill(0);
  bars.forEach(x => { const v = x.volume || 0, bi = Math.max(0, Math.min(rows - 1, Math.floor((x.low - lo) / step))), bj = Math.max(0, Math.min(rows - 1, Math.floor((x.high - lo) / step))), n = bj - bi + 1, arr = x.close >= x.open ? up : dn; for (let r = bi; r <= bj; r++) arr[r] += v / n; });
  const tot = up.map((u, i) => u + dn[i]); let poc = 0; tot.forEach((v, i) => { if (v > tot[poc]) poc = v === tot[poc] ? poc : i; });
  const sum = tot.reduce((m, v) => m + v, 0); let acc = tot[poc], l = poc, h = poc; while (acc < sum * 0.7 && (l > 0 || h < rows - 1)) { const nl = l > 0 ? tot[l - 1] : -1, nh = h < rows - 1 ? tot[h + 1] : -1; if (nh >= nl) { h++; acc += tot[h]; } else { l--; acc += tot[l]; } }
  return { lo, hi, step, up, dn, tot, poc, va: [l, h], i1, i2, sum };
}
function drawVP(d, pts, W, H, isSel) {
  const rows = d.rows || 24, r = vpCompute(d, rows); if (!r || !r.sum) { cx.fillText(L2('لا يوجد حجم في النطاق', 'No volume in range'), pts[0].x, pts[0].y); return; }
  const xa = Math.min(pts[0].x, pts[1].x), xb = Math.max(pts[0].x, pts[1].x), maxW = Math.max(40, (xb - xa) * (d.frac || 0.6)), mx = Math.max(...r.tot);
  const y = (p) => main.priceToCoordinate(p); const yt = y(r.hi), yb = y(r.lo); if (yt == null || yb == null) return;
  cx.setLineDash([]); cx.globalAlpha = 1; cx.strokeStyle = 'rgba(133,147,163,.5)'; cx.lineWidth = 1; cx.strokeRect(xa, Math.min(yt, yb), xb - xa, Math.abs(yb - yt));
  for (let i = 0; i < rows; i++) {
    const y1 = y(r.lo + (i + 1) * r.step), y2 = y(r.lo + i * r.step); if (y1 == null || y2 == null) continue; const inVA = i >= r.va[0] && i <= r.va[1], w = r.tot[i] / mx * maxW, wu = r.up[i] / mx * maxW, top = Math.min(y1, y2), hh = Math.max(1, Math.abs(y2 - y1) - 1);
    cx.globalAlpha = inVA ? .75 : .35; cx.fillStyle = '#2f81f7'; cx.fillRect(xa, top, wu, hh); cx.fillStyle = '#f5c542'; cx.fillRect(xa + wu, top, w - wu, hh);
  }
  cx.globalAlpha = 1;
  const pocP = r.lo + (r.poc + 0.5) * r.step, yp = y(pocP); cx.strokeStyle = '#ef5350'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(xa, yp); cx.lineTo(xb, yp); cx.stroke();
  cx.setLineDash([4, 4]); cx.lineWidth = 1; cx.strokeStyle = '#8593a3'; [r.lo + (r.va[1] + 1) * r.step, r.lo + r.va[0] * r.step].forEach(p => { const yy = y(p); cx.beginPath(); cx.moveTo(xa, yy); cx.lineTo(xb, yy); cx.stroke(); }); cx.setLineDash([]);
  cx.font = 'bold 12px system-ui'; cx.fillStyle = '#ef5350'; cx.fillText('POC ' + fmt(pocP), xb - 78, yp - 4);
  cx.font = '11px system-ui'; cx.fillStyle = '#8593a3'; cx.fillText('VAH ' + fmt(r.lo + (r.va[1] + 1) * r.step), xb - 78, y(r.lo + (r.va[1] + 1) * r.step) - 3); cx.fillText('VAL ' + fmt(r.lo + r.va[0] * r.step), xb - 78, y(r.lo + r.va[0] * r.step) + 12);
}
function drawAutoVP(W, H) {
  if (!S.bars.length) return; const n = S.bars.length;
  S.inds.forEach((ind) => {
    if (ind.id !== 'vpvr' || (ind.o && ind.o.hidden)) return;
    const pr = ind.p.length ? ind.p : IND.vpvr.params; let i1, i2;
    if (pr[0] > 0) { i2 = n - 1; i1 = Math.max(0, n - Math.round(pr[0])); }
    else { const r = chart.timeScale().getVisibleLogicalRange(); if (!r) return; i1 = Math.max(0, Math.ceil(r.from)); i2 = Math.min(n - 1, Math.floor(r.to)); }
    if (i2 <= i1) return;
    const ts = chart.timeScale(), x1 = ts.logicalToCoordinate(i1), x2 = ts.logicalToCoordinate(i2); if (x1 == null || x2 == null) return;
    const d = { type: 'vp', rows: Math.max(4, Math.min(100, Math.round(pr[1] || 24))), frac: 0.35, pts: [{ d: S.bars[i1].time }, { d: S.bars[i2].time }] };
    drawVP(d, [{ x: x1, y: 0 }, { x: x2, y: 0 }], W, H, false);
  });
}
function vpSummary(d) { const r = vpCompute(d, d.rows || 24); return r && r.sum ? 'POC ' + fmt(r.lo + (r.poc + 0.5) * r.step) : ''; }
function drawOne(d, W, H, isSel) {
  const pts = d.pts.map(toPx); if (pts.some(p => !p)) return; const color = d.color || '#f5c542'; cx.strokeStyle = color; cx.fillStyle = color; cx.lineWidth = isSel ? 2.5 : 1.5; cx.font = '12px system-ui'; cx.setLineDash([]);
  const ext = (a, b) => { const dx = b.x - a.x, dy = b.y - a.y; if (!dx && !dy) return b; const t = Math.max(W, H) * 20 / Math.hypot(dx, dy); return { x: a.x + dx * t, y: a.y + dy * t }; };
  const line = (a, b) => { cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); cx.stroke(); };
  if (d.type === 'trend') line(pts[0], pts[1]);
  else if (d.type === 'ray') line(pts[0], ext(pts[0], pts[1]));
  else if (d.type === 'hline') { line({ x: 0, y: pts[0].y }, { x: W, y: pts[0].y }); cx.fillText(fmt(d.pts[0].p), 6, pts[0].y - 4); }
  else if (d.type === 'vline') line({ x: pts[0].x, y: 0 }, { x: pts[0].x, y: H });
  else if (d.type === 'rect') { const x = Math.min(pts[0].x, pts[1].x), y = Math.min(pts[0].y, pts[1].y), w = Math.abs(pts[0].x - pts[1].x), h = Math.abs(pts[0].y - pts[1].y); cx.globalAlpha = .12; cx.fillRect(x, y, w, h); cx.globalAlpha = 1; cx.strokeRect(x, y, w, h); }
  else if (d.type === 'fib') { const [a, b] = d.pts, x1 = pts[0].x, x2 = pts[1].x; [0, .236, .382, .5, .618, .786, 1].forEach(l => { const p = b.p + (a.p - b.p) * l, y = main.priceToCoordinate(p); if (y == null) return; cx.globalAlpha = l === 0 || l === 1 ? 1 : .75; cx.beginPath(); cx.moveTo(Math.min(x1, x2), y); cx.lineTo(Math.max(x1, x2, Math.min(x1, x2) + 40), y); cx.stroke(); cx.globalAlpha = 1; cx.fillText(l + '  (' + fmt(p) + ')', Math.min(x1, x2) + 4, y - 3); }); cx.setLineDash([4, 4]); line(pts[0], pts[1]); cx.setLineDash([]); }
  else if (d.type === 'text') { cx.font = 'bold 13px system-ui'; cx.fillText(d.text || '', pts[0].x, pts[0].y); }
  else if (d.type === 'measure') { cx.setLineDash([5, 4]); line(pts[0], pts[1]); cx.setLineDash([]); const [a, b] = d.pts, nb = findIdx(b.d) - findIdx(a.d), ch = b.p / a.p - 1; const txt = `${pct(ch)}  (${fmt(b.p - a.p)})  ${nb} bars`; cx.fillStyle = '#0e1116'; const tw = cx.measureText(txt).width + 10; cx.fillRect(pts[1].x + 6, pts[1].y - 18, tw, 20); cx.fillStyle = color; cx.fillText(txt, pts[1].x + 11, pts[1].y - 4); }
  else if (d.type === 'vp') { drawVP(d, pts, W, H, isSel); }
  if (isSel) pts.forEach(p => { cx.beginPath(); cx.arc(p.x, p.y, 4, 0, 7); cx.fillStyle = '#fff'; cx.fill(); cx.strokeStyle = color; cx.stroke(); });
}
function redraw() {
  if (!main) return; const { W, H } = fitCanvas(); cx.clearRect(0, 0, W, H);
  loadDrawings().forEach(d => drawOne(d, W, H, d === selected));
  drawAutoVP(W, H);
  if (pending && hover) drawOne({ type: pending.type, color: S.color, pts: [pending.pts[0], hover] }, W, H, false);
}
const redrawSoon = () => { lastSig = ''; };
function loop() { try { placeLegends(); if (main && S.bars.length) { const r = chart.timeScale().getVisibleLogicalRange(), sig = [r && r.from.toFixed(2), r && r.to.toFixed(2), main.priceToCoordinate(1), main.priceToCoordinate(1000), wrap.clientWidth, wrap.clientHeight, S.sym, S.tf, drawings[S.sym]?.length, selected && 1, hover && hover.d + hover.p, S.type, chart.priceScale('right').width(), S.inds.map(x => x.id + (x.p || []) + ((x.o && x.o.hidden) ? 'h' : '')).join()].join('|'); if (sig !== lastSig) { lastSig = sig; redraw(); } } } catch (e) { } requestAnimationFrame(loop); }
cv.addEventListener('pointermove', (e) => { if (!pending) return; const r = cv.getBoundingClientRect(); hover = fromPx(e.clientX - r.left, e.clientY - r.top); });
cv.addEventListener('click', (e) => {
  const r = cv.getBoundingClientRect(), pt = fromPx(e.clientX - r.left, e.clientY - r.top); if (!pt) return;
  if (!pending) pending = { type: S.tool, pts: [pt] }; else pending.pts.push(pt);
  if (pending.pts.length >= NEED[pending.type]) { const d = { type: pending.type, pts: pending.pts, color: S.color }; pending = null; hover = null; if (d.type === 'text') { askText(e.clientX - r.left, e.clientY - r.top, (t) => { if (t) { d.text = t; loadDrawings().push(d); saveDrawings(); renderDrawList(); } redrawSoon(); }); } else { loadDrawings().push(d); saveDrawings(); renderDrawList(); } setTool('cursor'); }
});
function askText(x, y, cb) { const box = $('#textPrompt'); box.hidden = false; box.style.left = x + 'px'; box.style.top = y + 'px'; box.innerHTML = ''; const i = el('input', { placeholder: T().enterText }); i.onkeydown = (e) => { if (e.key === 'Enter') { box.hidden = true; cb(i.value); } else if (e.key === 'Escape') { box.hidden = true; cb(''); } }; box.append(i); i.focus(); }
function distSeg(p, a, b) { const dx = b.x - a.x, dy = b.y - a.y, L = dx * dx + dy * dy; let t = L ? ((p.x - a.x) * dx + (p.y - a.y) * dy) / L : 0; t = Math.max(0, Math.min(1, t)); return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy)); }
function hit(d, p) {
  const q = d.pts.map(toPx); if (q.some(x => !x)) return false;
  if (d.type === 'trend' || d.type === 'measure') return distSeg(p, q[0], q[1]) < 6;
  if (d.type === 'ray') { const dx = q[1].x - q[0].x, dy = q[1].y - q[0].y, L = Math.hypot(dx, dy) || 1; return distSeg(p, q[0], { x: q[0].x + dx / L * 5000, y: q[0].y + dy / L * 5000 }) < 6; }
  if (d.type === 'hline') return Math.abs(p.y - q[0].y) < 6; if (d.type === 'vline') return Math.abs(p.x - q[0].x) < 6;
  if (d.type === 'text') return Math.abs(p.x - q[0].x) < 60 && Math.abs(p.y - q[0].y) < 14;
  const x1 = Math.min(q[0].x, q[1].x), x2 = Math.max(q[0].x, q[1].x), y1 = Math.min(q[0].y, q[1].y), y2 = Math.max(q[0].y, q[1].y);
  if (d.type === 'rect') return (p.x >= x1 - 5 && p.x <= x2 + 5 && p.y >= y1 - 5 && p.y <= y2 + 5) && (Math.abs(p.x - x1) < 6 || Math.abs(p.x - x2) < 6 || Math.abs(p.y - y1) < 6 || Math.abs(p.y - y2) < 6);
  if (d.type === 'fib') return p.x >= x1 - 5 && p.x <= x2 + 60 && p.y >= y1 - 5 && p.y <= y2 + 5;
  return false;
}
chart.subscribeClick((param) => { if (S.tool !== 'cursor' || !param.point) return; selected = null; const l = loadDrawings(); for (let i = l.length - 1; i >= 0; i--) if (hit(l[i], param.point)) { selected = l[i]; break; } redrawSoon(); renderDrawList(); });
document.addEventListener('keydown', (e) => { if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return; if (e.key === 'Escape') { setTool('cursor'); selected = null; redrawSoon(); } if ((e.key === 'Delete' || e.key === 'Backspace') && selected) { const l = loadDrawings(); l.splice(l.indexOf(selected), 1); selected = null; saveDrawings(); renderDrawList(); redrawSoon(); } });
function renderDrawList() {
  const box = $('#drawList'); box.innerHTML = ''; const l = loadDrawings();
  l.forEach((d, i) => box.append(el('div', { class: 'dr', style: d === selected ? 'background:var(--bg3)' : '' }, el('span', { style: 'color:' + d.color }, '● ' + T()['t_' + d.type] + ' · ' + d.pts[0].d + (d.text ? ' · ' + d.text : '') + (d.type === 'vp' ? ' · ' + vpSummary(d) : '')), el('button', { onclick: () => { selected = d; redrawSoon(); renderDrawList(); } }, '◎'), el('button', { onclick: () => { l.splice(i, 1); if (selected === d) selected = null; saveDrawings(); renderDrawList(); redrawSoon(); } }, '×'))));
}
$('#undoDraw').onclick = () => { const l = loadDrawings(); l.pop(); saveDrawings(); renderDrawList(); redrawSoon(); };
$('#clearDraw').onclick = () => { drawings[S.sym] = []; saveDrawings(); selected = null; renderDrawList(); redrawSoon(); };

/* ---------------- user scripts ---------------- */
const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
const API_DOC = `Your script is the body of an async function. Available:

  time, open, high, low, close, volume   arrays, one value per bar
  symbol, timeframe                       e.g. "COMI", "D"
  ta.sma/ema/wma/rma(arr, n)  ta.rsi(close, n)  ta.atr(h, l, c, n)
  ta.macd(close, f, s, sig) -> {macd, signal, hist}
  ta.bb(close, n, k) -> {mid, upper, lower}
  ta.stoch / cci / adx / obv / mfi / willr / roc / supertrend / donchian / vwap
  ta.highest(arr, n)  ta.lowest(arr, n)  ta.stdev(arr, n)  ta.sum(arr, n)
  ta.change(arr, n)  ta.returns(arr)  ta.ratio(a, b)  ta.correlation(a, b, n)
  ta.crossover(a, b) / ta.crossunder(a, b) -> boolean arrays

  plot(name, values, {color, width, pane, type})
      pane: "main" (price pane, default) or any other name => its own pane
      type: "line" (default) or "hist"; colors: [..] per-bar colors for hist
  hline(value, {color, pane})            horizontal level
  marker(barIndex, {text, shape, position, color})
      shape: arrowUp | arrowDown | circle | square
      position: aboveBar | belowBar
  await load("ETEL")   -> {time, open, high, low, close, volume} of another
                          stock aligned to this chart's bars
  await ratio("ETEL")  -> close / other.close, array
  input(name, default) -> default (edit the number in the code)
  log(...)             prints to the output box

Values are arrays; use null where there is no value. Scripts run in your
own browser only. Do not paste code you do not understand.`;
const EXAMPLES = [
  { name: 'SMA 20/50 cross signals', code: `// Buy/sell arrows when SMA(20) crosses SMA(50)
const fast = ta.sma(close, input('fast', 20));
const slow = ta.sma(close, input('slow', 50));
plot('Fast', fast, { color: '#f5c542' });
plot('Slow', slow, { color: '#2f81f7' });
const up = ta.crossover(fast, slow), dn = ta.crossunder(fast, slow);
let n = 0;
for (let i = 0; i < close.length; i++) {
  if (up[i]) { marker(i, { text: 'Buy', shape: 'arrowUp', position: 'belowBar', color: '#26a69a' }); n++; }
  if (dn[i]) { marker(i, { text: 'Sell', shape: 'arrowDown', position: 'aboveBar', color: '#ef5350' }); n++; }
}
log(n + ' signals');` },
  { name: 'Price ratio vs another stock', code: `// Ratio of this stock to another one, in its own pane
const other = input('other', 'COMI');
const r = await ratio(other);
plot(symbol + ' / ' + other, r, { color: '#f778ba', pane: 'ratio' });
plot('avg 50', ta.sma(r, 50), { color: '#8593a3', pane: 'ratio' });` },
  { name: 'Close / SMA200 ratio', code: `// How stretched is price versus its 200-bar average? 1.0 = equal
const r = ta.ratio(close, ta.sma(close, 200));
plot('Close/SMA200', r, { color: '#a371f7', pane: 'stretch' });
hline(1, { pane: 'stretch' });
hline(1.2, { pane: 'stretch', color: '#ef5350' });
hline(0.8, { pane: 'stretch', color: '#26a69a' });` },
  { name: '20-bar breakout markers', code: `// Mark closes above the previous 20-bar high
const hh = ta.highest(high, 20);
let n = 0;
for (let i = 21; i < close.length; i++) {
  if (hh[i - 1] != null && close[i] > hh[i - 1]) { marker(i, { shape: 'circle', position: 'belowBar', color: '#f5c542' }); n++; }
}
plot('20-bar high', hh.map((v, i) => i ? hh[i - 1] : null), { color: '#3fb950' });
log(n + ' breakouts');` },
  { name: 'Percent change histogram', code: `// Bar-to-bar % change as colored histogram
const ch = ta.returns(close).map(v => v == null ? null : v * 100);
plot('% change', ch, { type: 'hist', pane: 'chg', colors: ch.map(v => v >= 0 ? '#26a69a' : '#ef5350') });` },
  { name: 'RSI with overbought/oversold', code: `const r = ta.rsi(close, input('len', 14));
plot('RSI', r, { color: '#a371f7', pane: 'rsi' });
hline(70, { pane: 'rsi', color: '#ef5350' }); hline(30, { pane: 'rsi', color: '#26a69a' });
for (let i = 1; i < r.length; i++) {
  if (r[i - 1] != null && r[i - 1] < 30 && r[i] >= 30) marker(i, { text: 'RSI>30', shape: 'arrowUp', position: 'belowBar', color: '#26a69a' });
}` },
  { name: 'Correlation with another stock', code: `const other = await load(input('other', 'COMI'));
const c = ta.correlation(ta.returns(close), ta.returns(other.close), 60);
plot('Corr 60', c, { color: '#56d4dd', pane: 'corr' });
hline(0, { pane: 'corr' });` }
];
const out = $('#out');
const logOut = (msg, err) => { out.append(el('div', { class: err ? 'err' : '' }, msg)); out.scrollTop = out.scrollHeight; };
function clearScript() { scriptSeries.forEach(s => { try { chart.removeSeries(s); } catch { } }); scriptSeries = []; if (markersApi) markersApi.setMarkers([]); }
async function runScript(quiet) {
  clearScript(); out.innerHTML = '';
  const B = barsObj(); const panes = {}; let next = S.nextPane || 1; const markers = [];
  const paneOf = (n) => { if (!n || n === 'main') return 0; if (panes[n] == null) panes[n] = next++; return panes[n]; };
  const api = {
    plot: (name, values, o = {}) => { if (!Array.isArray(values)) throw new Error('plot: values must be an array'); const spec = { name, values, color: o.color || PAL[scriptSeries.length % PAL.length], width: o.width, type: o.type === 'hist' ? 'hist' : 'line', colors: o.colors, last: true }; const s = addSpec(spec, B, paneOf(o.pane), scriptSeries); if (spec.type === 'line') s.applyOptions({ title: name }); },
    hline: (v, o = {}) => { const idx = paneOf(o.pane); const s = chart.addSeries(LW.LineSeries, { color: 'rgba(0,0,0,0)', lastValueVisible: false, priceLineVisible: false, crosshairMarkerVisible: false }, idx); s.setData([]); s.createPriceLine({ price: v, color: o.color || '#8593a3', lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: '' }); scriptSeries.push(s); },
    marker: (i, o = {}) => { if (i < 0 || i >= B.time.length) return; markers.push({ time: B.time[i], position: o.position || 'aboveBar', shape: o.shape || 'circle', color: o.color || '#f5c542', text: o.text || '' }); },
    load: async (sym) => { const d = await loadDaily(String(sym)); return alignTo(S.bars, aggregate(d, S.tf)); },
    ratio: async (sym) => { const o = await api.load(sym); return TA.ratio(B.close, o.close); },
    input: (n, d) => d, log: (...a) => logOut(a.map(x => typeof x === 'object' ? JSON.stringify(x) : String(x)).join(' '))
  };
  try {
    const fn = new AsyncFunction('time', 'open', 'high', 'low', 'close', 'volume', 'symbol', 'timeframe', 'ta', 'plot', 'hline', 'marker', 'load', 'ratio', 'input', 'log', $('#code').value);
    await fn(B.time, B.open, B.high, B.low, B.close, B.volume, S.sym, S.tf, TA, api.plot, api.hline, api.marker, api.load, api.ratio, api.input, api.log);
    markers.sort((a, b) => a.time < b.time ? -1 : 1); markersApi.setMarkers(markers);
    try { chart.panes().forEach((p, i) => p.setStretchFactor(i === 0 ? 4 : 1)); } catch { }
    logOut('OK · ' + scriptSeries.length + ' series, ' + markers.length + ' markers');
  } catch (e) { clearScript(); logOut('Error: ' + e.message, true); }
}
$('#runBtn').onclick = () => { S.scriptOn = true; runScript(); };
$('#clrScript').onclick = () => { S.scriptOn = false; clearScript(); out.innerHTML = ''; };
$('#exLoad').onclick = () => { const v = $('#exSel').value; if (v !== '') { $('#code').value = EXAMPLES[v].code; store.set('code', $('#code').value); } };
$('#code').value = store.get('code', EXAMPLES[0].code);
$('#code').addEventListener('input', () => store.set('code', $('#code').value));
$('#code').addEventListener('keydown', (e) => { if (e.key === 'Tab') { e.preventDefault(); const t = e.target, s = t.selectionStart; t.value = t.value.slice(0, s) + '  ' + t.value.slice(t.selectionEnd); t.selectionStart = t.selectionEnd = s + 2; } if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { S.scriptOn = true; runScript(); } });
function refreshSaved() { const sv = store.get('scripts', {}), s = $('#savedSel'); s.innerHTML = ''; s.append(el('option', { value: '' }, T().savedPh)); Object.keys(sv).forEach(k => s.append(el('option', { value: k }, k))); }
$('#saveBtn').onclick = () => { const n = prompt(T().saveName); if (!n) return; const sv = store.get('scripts', {}); sv[n] = $('#code').value; store.set('scripts', sv); refreshSaved(); };
$('#savedLoad').onclick = () => { const sv = store.get('scripts', {}), k = $('#savedSel').value; if (k && sv[k]) { $('#code').value = sv[k]; store.set('code', sv[k]); } };
$('#savedDel').onclick = () => { const sv = store.get('scripts', {}), k = $('#savedSel').value; if (k) { delete sv[k]; store.set('scripts', sv); refreshSaved(); } };



/* ---------------- TradingView-style indicator legends + settings ---------------- */
const SRC_OK = new Set(['sma', 'ema', 'wma', 'bb', 'rsi', 'macd', 'roc', 'cci']);
const SRC_LIST = ['close', 'open', 'high', 'low', 'hl2', 'hlc3', 'ohlc4'];
const srcArr = (B, s) => B.close.map((c, i) => s === 'open' ? B.open[i] : s === 'high' ? B.high[i] : s === 'low' ? B.low[i] : s === 'hl2' ? (B.high[i] + B.low[i]) / 2 : s === 'hlc3' ? (B.high[i] + B.low[i] + c) / 3 : s === 'ohlc4' ? (B.open[i] + B.high[i] + B.low[i] + c) / 4 : c);
const PN = { vpvr: [L2('عدد الشموع (0 = النطاق المرئي)', 'Last bars (0 = visible range)'), L2('عدد الصفوف', 'Rows')], bb: ['Length', 'StdDev'], macd: ['Fast', 'Slow', 'Signal'], stoch: ['%K length', '%D', 'Smooth'], supertrend: ['ATR length', 'Factor'] };
let lastLegI = -1;
const legLayer = document.createElement('div'); legLayer.id = 'paneLegends'; $('#chartWrap').append(legLayer);
function renderPaneLegends() {
  legLayer.innerHTML = '';
  S.inds.forEach((ind, k) => {
    const d = IND[ind.id]; if (!d || !curVals[k]) return; const o = ind.o || {};
    const pr = ind.p.length ? ind.p : d.params; const src = SRC_OK.has(ind.id) ? ' ' + (o.src || 'close') : '';
    const row = el('div', { class: 'plg' + (o.hidden ? ' off' : ''), 'data-k': k },
      el('span', { class: 'pn' }, d.title ? d.title(pr) : d.label + (pr.length ? ' ' + pr.join(' ') : '') + src), el('span', { class: 'pv', dir: 'ltr' }),
      el('button', { title: 'hide/show', onclick: () => { o.hidden = !o.hidden; ind.o = o; saveInds(); rebuildExtras(); } }, o.hidden ? '🚫' : '👁'),
      el('button', { title: 'settings', onclick: () => openIndSettings(k) }, '⚙'),
      el('button', { title: 'remove', onclick: () => { S.inds.splice(k, 1); saveInds(); rebuildExtras(); } }, '🗑'));
    legLayer.append(row);
    if (d.band && (o.fill ?? true) && !o.hidden) { const lv = (o.levels || curVals[k].specs[0].levels || []); if (lv.length >= 2) legLayer.append(el('div', { class: 'band', 'data-k': k, style: 'background:' + (o.fillColor || 'rgba(126,87,194,.12)') })); }
  });
  lastLegKey = ''; paintLegendValues(); placeLegends();
}
function paintLegendValues() {
  legLayer.querySelectorAll('.plg').forEach(r => { const k = +r.dataset.k, c = curVals[k], ind = S.inds[k]; if (!c || !ind) return; const i = lastLegI < 0 ? S.bars.length - 1 : lastLegI; const sp = c.specs.map((s, j) => ({ s, j })).filter(x => x.s.type !== 'hist' || ind.id === 'volume'); const o = ind.o || {};
    r.querySelector('.pv').innerHTML = sp.map(x => { const col = (o.colors && o.colors[x.j]) || x.s.color || '#8593a3'; return '<span style="color:' + col + '">' + fmt(x.s.values[i], ind.id === 'volume' ? 0 : 2) + '</span>'; }).join(' '); });
}
let lastLegKey = '';
function placeLegends() {
  try {
    const panes = chart.panes(), wr = $('#chartWrap').getBoundingClientRect(), stack = {};
    const key = [wr.width, wr.height, panes.length, panes.map(p => p.getHTMLElement().getBoundingClientRect().top.toFixed(0)).join(',')].join('|');
    const rows = legLayer.querySelectorAll('.plg'), bands = legLayer.querySelectorAll('.band');
    if (key === lastLegKey && !bands.length) return; lastLegKey = key;
    rows.forEach(r => { const c = curVals[+r.dataset.k]; if (!c) return; const pe = panes[c.pane]; if (!pe) return; const rc = pe.getHTMLElement().getBoundingClientRect(); const n = stack[c.pane] = (stack[c.pane] || 0); stack[c.pane]++; r.style.top = (rc.top - wr.top + 4 + n * 26) + 'px'; });
    bands.forEach(b => { const k = +b.dataset.k, c = curVals[k]; if (!c) return; const pe = panes[c.pane]; const o = S.inds[k].o || {}; const lv = o.levels || c.specs[0].levels; const hi = Math.max(...lv), lo = Math.min(...lv); const y1 = c.series[0].priceToCoordinate(hi), y2 = c.series[0].priceToCoordinate(lo); if (y1 == null || y2 == null || !pe) { b.style.display = 'none'; return; } const rc = pe.getHTMLElement().getBoundingClientRect(); b.style.display = 'block'; b.style.top = (rc.top - wr.top + Math.min(y1, y2)) + 'px'; b.style.height = Math.abs(y2 - y1) + 'px'; b.style.left = '0px'; b.style.width = chart.timeScale().width() + 'px'; });
  } catch (e) { }
}
function openIndSettings(k) {
  const ind = S.inds[k], d = IND[ind.id]; if (!ind || !d) return; const o = ind.o = ind.o || {};
  document.querySelector('#dlg')?.remove();
  const apply = () => { saveInds(); rebuildExtras(); };
  const row = (label, ctl) => el('div', { class: 'drow' }, el('label', {}, label), ctl);
  const num = (v, fn, step) => el('input', { type: 'number', step: step || 'any', value: v, onchange: (e) => { const x = parseFloat(e.target.value); if (isFinite(x)) fn(x); } });
  const body = el('div', { class: 'dbody' });
  const pr = ind.p.length ? ind.p : d.params.slice();
  const names = PN[ind.id] || pr.map((_, i) => pr.length === 1 ? L2('الفترة', 'Length') : 'P' + (i + 1));
  body.append(el('h5', {}, L2('المدخلات', 'Inputs')));
  pr.forEach((v, i) => body.append(row(names[i], num(v, (x) => { const a = (ind.p.length ? ind.p : d.params).slice(); a[i] = x; ind.p = a; apply(); }, i === 1 && ind.id === 'bb' || ind.id === 'supertrend' && i === 1 ? '0.1' : '1'))));
  if (SRC_OK.has(ind.id)) { const sel = el('select', { onchange: (e) => { o.src = e.target.value; apply(); } }, ...SRC_LIST.map(x => el('option', { value: x }, x))); sel.value = o.src || 'close'; body.append(row(L2('المصدر', 'Source'), sel)); }
  if (ind.id === 'rsi') {
    body.append(row(L2('متوسط RSI', 'RSI moving average'), el('input', { type: 'checkbox', checked: o.ma ?? true, onchange: (e) => { o.ma = e.target.checked; apply(); } })));
    const t = el('select', { onchange: (e) => { o.maType = e.target.value; apply(); } }, el('option', { value: 'SMA' }, 'SMA'), el('option', { value: 'EMA' }, 'EMA')); t.value = o.maType || 'SMA'; body.append(row(L2('نوع المتوسط', 'MA type'), t));
    body.append(row(L2('طول المتوسط', 'MA length'), num(o.maLen || 14, (x) => { o.maLen = Math.max(1, Math.round(x)); apply(); }, '1')));
  }
  const isVP = ind.id === 'vpvr';
  if (isVP) body.append(el('div', { class: 'hint' }, L2('الفترة = 0 يعني النطاق المرئي على الشارت، أو اكتب عدد الشموع الأخيرة.', 'Bars = 0 uses the visible range; or enter the number of last bars.')));
  body.append(el('h5', {}, L2('النمط', 'Style')));
  const sp = curVals[k] ? curVals[k].specs : [];
  sp.forEach((s, j) => { if (s.type === 'hist' || s.colors) return; body.append(row(s.name, el('input', { type: 'color', value: (o.colors && o.colors[j]) || s.color || '#2f81f7', onchange: (e) => { o.colors = o.colors || []; o.colors[j] = e.target.value; apply(); } }))); });
  const w = isVP ? el('span') : el('select', { onchange: (e) => { o.width = +e.target.value; apply(); } }, ...[1, 1.5, 2, 3, 4].map(x => el('option', { value: x }, x))); if (!isVP) { w.value = o.width || 1.5; body.append(row(L2('سمك الخط', 'Line width'), w)); }
  const lv = o.levels || (sp[0] && sp[0].levels) || [];
  if (lv.length) {
    body.append(el('h5', {}, L2('المستويات', 'Levels')));
    lv.forEach((v, i) => body.append(row(L2('مستوى ', 'Level ') + (i + 1), num(v, (x) => { const a = (o.levels || (sp[0].levels || [])).slice(); a[i] = x; o.levels = a; apply(); }))));
    body.append(row(L2('لون المستويات', 'Levels color'), el('input', { type: 'color', value: o.levelColor || '#787b86', onchange: (e) => { o.levelColor = e.target.value; apply(); } })));
    if (d.band) { body.append(row(L2('تظليل الخلفية', 'Background fill'), el('input', { type: 'checkbox', checked: o.fill ?? true, onchange: (e) => { o.fill = e.target.checked; apply(); } }))); body.append(row(L2('لون التظليل', 'Fill color'), el('input', { type: 'color', value: o.fillHex || '#7e57c2', onchange: (e) => { const h = e.target.value; o.fillHex = h; const r = parseInt(h.slice(1, 3), 16), g = parseInt(h.slice(3, 5), 16), b = parseInt(h.slice(5, 7), 16); o.fillColor = `rgba(${r},${g},${b},.14)`; apply(); } }))); }
  }
  body.append(row(L2('إظهار', 'Visible'), el('input', { type: 'checkbox', checked: !o.hidden, onchange: (e) => { o.hidden = !e.target.checked; apply(); } })));
  const dlg = el('div', { id: 'dlg' }, el('div', { class: 'dbox' }, el('div', { class: 'dhead' }, el('b', {}, d.label), el('span', { class: 'sp' }), el('button', { class: 'btn', onclick: () => { ind.p = []; ind.o = {}; apply(); openIndSettings(k); } }, L2('افتراضي', 'Defaults')), el('button', { class: 'btn primary', onclick: () => dlg.remove() }, L2('تم', 'OK'))), body));
  dlg.addEventListener('pointerdown', (e) => { if (e.target === dlg) dlg.remove(); });
  document.body.append(dlg);
}

/* ---------------- script export / import ---------------- */
function labelsIO() { $('#expScripts').textContent = L2('تصدير السكربتات', 'Export scripts'); $('#impScripts').textContent = L2('استيراد', 'Import'); }
$('#expScripts').onclick = () => {
  const data = { app: 'egx-charts', scripts: store.get('scripts', {}), current: $('#code').value };
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })); a.download = 'egx-scripts.json'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
};
$('#impScripts').onclick = () => $('#impFile').click();
$('#impFile').onchange = async (e) => {
  const f = e.target.files[0]; if (!f) return;
  try { const d = JSON.parse(await f.text()); if (!d || typeof d.scripts !== 'object') throw new Error('bad file'); const sv = store.get('scripts', {}); let n = 0; for (const k of Object.keys(d.scripts)) { if (typeof d.scripts[k] === 'string') { sv[k] = d.scripts[k]; n++; } } store.set('scripts', sv); refreshSaved(); logOut(L2('تم استيراد ', 'Imported ') + n + L2(' سكربت', ' scripts')); }
  catch (err) { logOut(L2('ملف غير صالح: ', 'Invalid file: ') + err.message, true); }
  e.target.value = '';
};

/* ---------------- alerts (checked while the page is open) ---------------- */
const AL_KINDS = { 'price>': ['السعر أعلى من', 'Price above'], 'price<': ['السعر أقل من', 'Price below'], 'rsi>': ['RSI(14) أعلى من', 'RSI(14) above'], 'rsi<': ['RSI(14) أقل من', 'RSI(14) below'], 'smaUp': ['السعر يخترق SMA لأعلى (الفترة)', 'Price crosses above SMA (period)'], 'smaDn': ['السعر يخترق SMA لأسفل (الفترة)', 'Price crosses below SMA (period)'] };
let alerts = store.get('alerts', []);
const saveAlerts = () => store.set('alerts', alerts);
function alKindLabel(k) { return AL_KINDS[k][lang === 'ar' ? 0 : 1]; }
function buildAlertsUI() {
  const sel = $('#alKind'); const cur = sel.value; sel.innerHTML = ''; Object.keys(AL_KINDS).forEach(k => sel.append(el('option', { value: k }, alKindLabel(k)))); if (cur) sel.value = cur;
  $('#alVal').placeholder = L2('القيمة', 'value'); $('#alAdd').textContent = L2('+ أضف تنبيه للسهم الحالي', '+ Alert on current symbol');
  $('#alPerm').textContent = L2('تفعيل إشعارات المتصفح', 'Enable browser notifications'); $('#alSoundLbl').textContent = L2('صوت', 'sound');
  $('#alHint').textContent = L2('التنبيهات تعمل والصفحة مفتوحة فقط (تتحقق كل 5 دقائق من أحدث بيانات الموقع وعند فتح السهم). تُحفظ في هذا المتصفح. البيانات متأخرة وليست لحظية.', 'Alerts only work while this page is open (checked every 5 minutes against the latest site data, and when you open a symbol). Saved in this browser. Data is delayed, not live.');
  renderAlerts();
}
function renderAlerts() {
  const box = $('#alList'); box.innerHTML = '';
  if (!alerts.length) { box.append(el('div', { class: 'hint' }, L2('لا توجد تنبيهات', 'No alerts'))); return; }
  alerts.forEach(a => box.append(el('div', { class: 'ind' }, el('span', { class: 'nm' }, a.sym), el('span', {}, alKindLabel(a.kind) + ' ' + a.val), el('span', { class: 'v' }, a.fired ? '✔ ' + a.fired : L2('نشط', 'active')), a.fired ? el('button', { title: 're-arm', onclick: () => { a.fired = null; saveAlerts(); renderAlerts(); } }, '↻') : el('span'), el('button', { title: 'remove', onclick: () => { alerts = alerts.filter(x => x !== a); saveAlerts(); renderAlerts(); } }, '×'))));
}
$('#alAdd').onclick = () => { const v = parseFloat($('#alVal').value); if (!isFinite(v) || v <= 0) { $('#alVal').focus(); return; } alerts.push({ id: Date.now(), sym: S.sym, kind: $('#alKind').value, val: v, fired: null }); saveAlerts(); renderAlerts(); checkAlerts(); };
$('#alPerm').onclick = async () => { if (!('Notification' in window)) { alert(L2('المتصفح لا يدعم الإشعارات', 'Notifications not supported in this browser')); return; } const r = await Notification.requestPermission(); $('#alPerm').textContent = L2('الإشعارات: ', 'Notifications: ') + r; };
function fireAlert(a, msg) {
  a.fired = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16).replace('T', ' '); saveAlerts(); renderAlerts();
  const text = a.sym + ': ' + msg;
  let shown = false; try { if ('Notification' in window && Notification.permission === 'granted') { new Notification('EGX Charts', { body: text }); shown = true; } } catch { }
  if ($('#alSound').checked) { try { const ac = new (window.AudioContext || window.webkitAudioContext)(), o = ac.createOscillator(); o.connect(ac.destination); o.frequency.value = 880; o.start(); setTimeout(() => { o.stop(); ac.close(); }, 400); } catch { } }
  const t = el('div', { class: 'toast' }, text); document.body.append(t); setTimeout(() => t.remove(), 15000); t.onclick = () => t.remove();
  return shown;
}
function evalAlert(a, bars) {
  const c = bars.map(b => b.close), n = c.length; if (n < 2) return null; const last = c[n - 1];
  switch (a.kind) {
    case 'price>': return last > a.val ? L2('السعر ', 'price ') + last + L2(' أعلى من ', ' above ') + a.val : null;
    case 'price<': return last < a.val ? L2('السعر ', 'price ') + last + L2(' أقل من ', ' below ') + a.val : null;
    case 'rsi>': { const r = TA.rsi(c, 14)[n - 1]; return r != null && r > a.val ? 'RSI ' + r.toFixed(1) + ' > ' + a.val : null; }
    case 'rsi<': { const r = TA.rsi(c, 14)[n - 1]; return r != null && r < a.val ? 'RSI ' + r.toFixed(1) + ' < ' + a.val : null; }
    case 'smaUp': { const m = TA.sma(c, Math.round(a.val)), x = TA.crossover(c, m); return x[n - 1] ? L2('السعر اخترق SMA ', 'price crossed above SMA ') + a.val : null; }
    case 'smaDn': { const m = TA.sma(c, Math.round(a.val)), x = TA.crossunder(c, m); return x[n - 1] ? L2('السعر كسر SMA ', 'price crossed below SMA ') + a.val : null; }
  }
  return null;
}
function loadFresh(path) { return new Promise((res) => { const s = document.createElement('script'); s.src = path + '?t=' + Date.now(); s.onload = () => { s.remove(); res(true); }; s.onerror = () => { s.remove(); res(false); }; document.head.append(s); }); }
async function checkAlerts(fresh) {
  const act = alerts.filter(a => !a.fired); if (!act.length) return;
  for (const sym of [...new Set(act.map(a => a.sym))]) {
    let bars = null;
    try {
      if (fresh && location.protocol.startsWith('http')) { await loadFresh('data/' + sym + '.js'); }
      bars = await loadDaily(sym);
      if (fresh && location.protocol.startsWith('http') && INTRA_IDS.has(sym)) { delete (window.EGX_INTRA || {})[sym]; const im = await loadIntra(sym).catch(() => null); const m = im && im.m && im.m.length ? im.m : null; if (m) { const lastD = bars.at(-1).time, ld = new Date(m.at(-1)[0] * 1000).toISOString().slice(0, 10); if (ld >= lastD) bars = bars.slice(0, ld === lastD ? -1 : undefined).concat([{ time: ld, open: m.at(-1)[1], high: m.at(-1)[2], low: m.at(-1)[3], close: m.at(-1)[4], volume: 0 }]); } }
    } catch { continue; }
    for (const a of act.filter(x => x.sym === sym)) { const msg = evalAlert(a, bars); if (msg) fireAlert(a, msg); }
  }
}
setInterval(() => checkAlerts(true), 300000);

/* ---------------- boot ---------------- */
applyLang(); labelsIO(); buildAlertsUI();
setSymbol(symMap[S.sym] ? S.sym : SYMS[0].id);
loop();
window.addEventListener('resize', redrawSoon);

$('#panelBtn').onclick = () => { document.body.classList.toggle('drawer'); setTimeout(redrawSoon, 300); };
document.querySelectorAll('#tabs button').forEach(b => b.addEventListener('click', () => document.body.classList.add('drawer')));
chartEl.addEventListener('pointerdown', () => { if (window.innerWidth <= 760) document.body.classList.remove('drawer'); });

/* ---------------- About / licences ---------------- */
$('#aboutBtn').onclick = () => {
  document.querySelector('#dlg')?.remove();
  const body = el('div', { class: 'dbody' },
    el('h5', {}, 'TradinGo'),
    el('p', {}, L2('منصة شارتات للبورصة المصرية. البيانات من Yahoo Finance، متأخرة وغير لحظية، وللأغراض المعلوماتية فقط وليست نصيحة استثمارية.', 'EGX charting platform. Data from Yahoo Finance: delayed, not real-time, for information only and not investment advice.')),
    el('h5', {}, L2('التراخيص', 'Licences')),
    el('p', {}, L2('الرسم البياني يعمل بمكتبة ', 'Charting is powered by '), el('a', { href: 'https://www.tradingview.com/', target: '_blank', rel: 'noopener' }, 'TradingView Lightweight Charts™'), ' (Apache License 2.0). © TradingView, Inc.'),
    el('p', {}, el('a', { href: 'https://github.com/tradingview/lightweight-charts/blob/master/LICENSE', target: '_blank', rel: 'noopener' }, 'LICENSE'), ' · ', el('a', { href: 'NOTICE.txt', target: '_blank' }, 'NOTICE')));
  const dlg = el('div', { id: 'dlg' }, el('div', { class: 'dbox' }, el('div', { class: 'dhead' }, el('b', {}, L2('حول / التراخيص', 'About / Licences')), el('span', { class: 'sp' }), el('button', { class: 'btn primary', onclick: () => dlg.remove() }, L2('تم', 'OK'))), body));
  dlg.addEventListener('pointerdown', (e) => { if (e.target === dlg) dlg.remove(); });
  document.body.append(dlg);
};
