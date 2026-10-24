// node tools/film.mjs "<query>" out_prefix t1,t2,...  (seconds) — snapshot the stage at given times
import { chromium } from '/opt/homebrew/lib/node_modules/playwright/index.mjs';
const [,, q, out, ts] = process.argv;
const b = await chromium.launch({ channel: 'chromium', args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--host-resolver-rules=MAP *.local 127.0.0.1', '--site-per-process', '--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('pageerror', e => console.log('PAGEERR', e.message));
p.on('console', m => m.type() === 'error' && m.location().url.includes('stage') && console.log('ERR', m.text()));
await p.goto('http://127.0.0.1:8765/stage.html' + q);
const t0 = Date.now();
for (const t of ts.split(',').map(Number)) {
  const w = t * 1000 - (Date.now() - t0); if (w > 0) await p.waitForTimeout(w);
  await p.screenshot({ path: `${out}_${t}.jpg`, quality: 70 });
}
await Promise.race([b.close(), new Promise(r => setTimeout(r, 2000))]); process.exit(0);
