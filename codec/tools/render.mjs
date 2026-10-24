// usage: node render.mjs <projdir> <out.mp4> <t0> <t1> [fps]
import puppeteer from '/opt/homebrew/lib/node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import { spawn } from 'child_process';
const [proj, out, a, b, fpsArg] = process.argv.slice(2);
const fps = +(fpsArg || 30), t0 = +a, t1 = +b;
const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p', '-r', String(fps), out], { stdio: ['pipe', 'inherit', 'inherit'] });
const br = await puppeteer.launch({ headless: true, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const pg = await br.newPage(); await pg.setViewport({ width: 1920, height: 1080 });
pg.on('pageerror', e => console.log('pageerror:', e.message));
await pg.goto('file://' + proj + '/render.html'); await pg.waitForFunction('window.ready === true');
await pg.evaluate(() => document.fonts.ready);
const n0 = Math.round(t0 * fps), n1 = Math.round(t1 * fps);
const write = buf => new Promise(r => ff.stdin.write(buf) ? r() : ff.stdin.once('drain', r));
const B = 8; const st = Date.now();
for (let n = n0; n < n1; n += B) {
  const urls = await pg.evaluate((n, m, fps) => { const r = []; for (let k = n; k < m; k++) { renderAt(k / fps); r.push(document.getElementById('gl').toDataURL('image/jpeg', 0.95)); } return r; }, n, Math.min(n + B, n1), fps);
  for (const u of urls) await write(Buffer.from(u.slice(u.indexOf(',') + 1), 'base64'));
  if ((n - n0) % (fps * 30) < B) console.log(out, ((n - n0) / (n1 - n0) * 100).toFixed(1) + '%', ((Date.now() - st) / 1000).toFixed(0) + 's');
}
ff.stdin.end(); await new Promise(r => ff.on('close', r)); await br.close();
console.log('done', out);
