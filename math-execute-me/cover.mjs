import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const root = process.cwd();
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200); r.end(d); }); });
await new Promise(r => srv.listen(0, r));
const b = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
for (const [kind, w, h, name] of [['h', 3840, 2160, 'out/MV封面_16x9_4K.png'], ['v', 1620, 2160, 'out/MV封面_3x4.png']]) {
  const p = await b.newPage({ viewport: { width: 800, height: 600 } }); p.on('pageerror', e => console.error(e.message));
  await p.goto(`http://localhost:${srv.address().port}/render.html?w=${w}&h=${h}`);
  await p.waitForFunction(() => window.READY || window.ERR);
  const d = await p.evaluate(k => { renderCover(k); return document.getElementById('out').toDataURL('image/png'); }, kind);
  fs.writeFileSync(name, Buffer.from(d.split(',')[1], 'base64')); await p.close(); console.log(name);
}
await b.close(); srv.close();
