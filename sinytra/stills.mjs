import { createRequire } from 'module';
const require = createRequire(process.env.PW_ROOT + '/');
const { chromium } = require('playwright');
const b = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('console', m => console.log('[page]', m.text())); p.on('pageerror', e => console.log('[err]', e.message));
await p.goto('http://127.0.0.1:8765/sinytra/index.html'); await p.evaluate(() => window.ready);
const tl = JSON.parse(require('fs').readFileSync('timeline.json'));
const only = process.argv.slice(2);
for (const s of tl.scenes) { if (only.length && !only.includes(s.id)) continue;
  const l = s.lines[s.lines.length - 1]; const t = (l.start + l.end) / 2;
  const t1 = Date.now(); await p.evaluate(t => renderAt(t), t);
  await p.screenshot({ path: `build/still_${s.id}.jpg`, type: 'jpeg', quality: 80 }); console.log(s.id, Date.now() - t1, 'ms'); }
await b.close();
