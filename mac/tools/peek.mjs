// node tools/peek.mjs <url-path> <out.jpg> [waitMs] [w] [h]
import { chromium } from '/opt/homebrew/lib/node_modules/playwright/index.mjs';
const [,, path, out, wait = 4000, w = 1920, h = 1080] = process.argv;
const b = await chromium.launch({ channel: 'chromium', args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu-rasterization'] });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
p.on('console', m => ['error','warning'].includes(m.type()) && console.log(m.type(), m.text().slice(0, 300)));
p.on('pageerror', e => console.log('PAGEERR', e.message));
await p.goto('http://127.0.0.1:8765/' + encodeURI(path));
await p.waitForTimeout(+wait);
console.log(await p.evaluate(() => { const c = document.createElement('canvas'); const g = c.getContext('webgl2'); const d = g.getExtension('WEBGL_debug_renderer_info'); return d ? g.getParameter(d.UNMASKED_RENDERER_WEBGL) : 'n/a'; }));
await p.screenshot({ path: out, quality: 80 });
await Promise.race([b.close(), new Promise(r => setTimeout(r, 2000))]); process.exit(0);
