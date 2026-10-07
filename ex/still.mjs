// 渲染若干时间点的静帧并拼成联系表：node still.mjs out.png t1 t2 ... [--w 960 --h 540]
import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const args = process.argv.slice(2); const out = args.shift(); const ts = args.map(Number);
const Wd = 960, Ht = 540; const root = process.cwd();
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200); r.end(d); }); });
await new Promise(r => srv.listen(0, r));
const b = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: Wd, height: Ht } });
p.on('pageerror', e => console.error('PAGEERR', e.message)); p.on('console', m => { if (m.type() === 'error') console.error(m.text()); });
await p.goto(`http://localhost:${srv.address().port}/render.html?w=${Wd}&h=${Ht}`);
await p.waitForFunction(() => window.READY || window.ERR, null, { timeout: 120000 });
const err = await p.evaluate(() => window.ERR); if (err) { console.error(err); process.exit(1); }
const cols = 4, rows = Math.ceil(ts.length / cols);
const html = [];
for (const t of ts) {
  const d = await p.evaluate(t => { try { window.renderTime(t); } catch (e) { return 'ERR ' + e.stack; } return document.getElementById('out').toDataURL('image/jpeg', .85); }, t);
  if (d.startsWith('ERR')) { console.error(t, d); process.exit(1); }
  html.push(`<div style="position:relative"><img src="${d}" width=${Wd / 2}><span style="position:absolute;left:4px;top:2px;color:#ff0;font:12px monospace">${t.toFixed(2)}</span></div>`);
}
const p2 = await b.newPage({ viewport: { width: cols * Wd / 2, height: rows * Ht / 2 } });
await p2.setContent(`<body style="margin:0;display:grid;grid-template-columns:repeat(${cols},${Wd / 2}px);background:#000">${html.join('')}</body>`);
await p2.screenshot({ path: out, fullPage: true });
await b.close(); srv.close();
