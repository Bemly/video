// usage: node snap.mjs <projdir> <outdir> t1 t2 ...
import puppeteer from '/opt/homebrew/lib/node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import fs from 'fs';
const [proj, out, ...ts] = process.argv.slice(2);
const b = await puppeteer.launch({ headless: true, args: ['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist','--window-size=1920,1080'] });
const pg = await b.newPage(); await pg.setViewport({ width: 1920, height: 1080 });
pg.on('console', m => console.log('console:', m.text())); pg.on('pageerror', e => console.log('pageerror:', e.message));
await pg.goto('file://' + proj + '/render.html'); await pg.waitForFunction('window.ready === true');
await pg.evaluate(() => document.fonts.ready);
for (const t of ts) {
  const url = await pg.evaluate(t => { renderAt(+t); return document.getElementById('gl').toDataURL('image/jpeg', 0.9); }, t);
  fs.writeFileSync(`${out}/t_${(+t).toFixed(1)}.jpg`, Buffer.from(url.split(',')[1], 'base64'));
}
const t0 = Date.now(); await pg.evaluate(() => { for (let i = 0; i < 30; i++) { renderAt(100 + i/30); document.getElementById('gl').toDataURL('image/jpeg', 0.9); } });
console.log('30 frames ms', Date.now() - t0);
await b.close();
