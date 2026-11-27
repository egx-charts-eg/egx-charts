// Builds one self-contained file: dist/egx-charts.html (code, styles, library and gzip-compressed price data inlined).
import fs from 'fs'; import zlib from 'zlib';
const r = (p) => fs.readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const KEEP = Number(process.env.KEEP_YEARS || 6); const cut = new Date(Date.now() - KEEP * 365.25 * 864e5).toISOString().slice(0, 10);
const data = {};
for (const f of fs.readdirSync(new URL('../data/', import.meta.url))) {
  if (!/^[A-Z0-9]+\.js$/.test(f)) continue;
  const m = r('data/' + f).match(/window\.EGX_DATA\[("[^"]+")\]=(.*);$/s); const o = JSON.parse(m[2]); if (KEEP > 0) o.rows = o.rows.filter(x => x[0] >= cut); data[JSON.parse(m[1])] = o;
}
const blob = zlib.gzipSync(Buffer.from(JSON.stringify(data)), { level: 9 }).toString('base64');
const safe = (s) => s.replace(/<\/script/gi, '<\\/script');
const html = r('index.html')
  .replace('<link rel="stylesheet" href="style.css">', '<style>' + r('style.css') + '</style>')
  .replace(/<script src="vendor\/lightweight-charts.js"><\/script>\s*<script src="ta.js"><\/script>\s*<script src="data\/symbols.js"><\/script>\s*<script src="data\/intra.js"><\/script>\s*<script src="app.js"><\/script>/,
    () => '<div id="boot" style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#0e1116;color:#8593a3;z-index:99;font:16px system-ui">Loading EGX data…</div>\n' +
      '<script>' + safe(r('vendor/lightweight-charts.js')) + '</script>\n<script>' + safe(r('ta.js')) + '</script>\n<script>' + safe(r('data/symbols.js')) + '</script>\n<script>window.EGX_INTRA_IDS=[];</script>\n' +
      '<script type="text/plain" id="appsrc">' + safe(r('app.js')) + '</script>\n' +
      '<script type="text/plain" id="blob">' + blob + '</script>\n' +
      '<script>(async()=>{try{const b=atob(document.getElementById("blob").textContent.trim());const u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);' +
      'const s=new Blob([u]).stream().pipeThrough(new DecompressionStream("gzip"));const d=JSON.parse(await new Response(s).text());' +
      'window.EGX_DATA={};for(const k in d)window.EGX_DATA[k]=d[k];const sc=document.createElement("script");sc.textContent=document.getElementById("appsrc").textContent;document.body.append(sc);document.getElementById("boot").remove();}catch(e){document.getElementById("boot").textContent="Error: "+e.message+" (browser too old?)";}})();</script>');
fs.mkdirSync(new URL('../dist/', import.meta.url), { recursive: true });
fs.writeFileSync(new URL('../dist/egx-charts.html', import.meta.url), html);
console.log('size KB', Math.round(html.length / 1024), 'blob KB', Math.round(blob.length / 1024));
