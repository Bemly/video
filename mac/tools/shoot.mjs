// usage: node tools/shoot.mjs [filter] — screenshots each page in build/manifest.json and logs errors
import { chromium } from '/opt/homebrew/lib/node_modules/playwright/index.mjs';
import fs from 'fs';
const man = JSON.parse(fs.readFileSync('build/manifest.json'));
const filter = process.argv[2] || '';
const browser = await chromium.launch({ channel: 'chromium', args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu-rasterization'] });
const results = fs.existsSync('shots/errors.json') ? JSON.parse(fs.readFileSync('shots/errors.json')) : {};
fs.mkdirSync('shots', { recursive: true });
for (const r of man) {
  if (!r.page || !(filter.split(',').some(f => r.id.includes(f) || r.cat.includes(f)))) continue;
  const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERR ' + e.message.slice(0, 200) + ' @' + (e.stack||'').split('\n')[1]));
  page.on('console', m => { if (m.type() === 'error') errs.length < 30 && errs.push('CONSOLE ' + m.text().slice(0, 200)); });
  page.on('requestfailed', q => errs.push('REQFAIL ' + q.url().slice(0, 150)));
  try {
    await page.goto('http://127.0.0.1:8765/' + encodeURI(r.page), { timeout: 20000, waitUntil: 'load' });
  } catch (e) { errs.push('GOTO ' + e.message.slice(0, 100)); }
  await page.waitForTimeout(5000);
  await page.screenshot({ path: `shots/${r.id}.jpg`, quality: 70, timeout: 15000 }).catch(e => errs.push('SHOT ' + e.message.slice(0, 80)));
  results[r.id] = errs;
  console.log(r.cat, r.id, r.name, errs.length ? errs.slice(0, 3).join(' || ') : 'OK');
  await Promise.race([page.close(), new Promise(r => setTimeout(r, 3000))]);
}
fs.writeFileSync('shots/errors.json', JSON.stringify(results, null, 1));
await Promise.race([browser.close(), new Promise(r => setTimeout(r, 3000))]);
process.exit(0);
