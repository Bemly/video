// 用法: node render.mjs --w 1920 --h 1080 --from 0 --to 12715 --workers 4 --out out/seg [--step 1] [--jpg]
// 每个 worker 把自己负责的连续帧段直接管道给 ffmpeg，生成一个分段视频。
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import http from 'http'; import fs from 'fs'; import path from 'path';
const A = Object.fromEntries(process.argv.slice(2).join(' ').split('--').filter(Boolean).map(s => { const [k, ...v] = s.trim().split(' '); return [k, v.join(' ') || true]; }));
const Wd = +(A.w || 1920), Ht = +(A.h || 1080), FROM = +(A.from || 0), TO = +(A.to || 12715), NW = +(A.workers || 4), OUT = A.out || 'out/seg', STEP = +(A.step || 1);
fs.mkdirSync(path.dirname(OUT), { recursive: true });
// 本地静态服务
const root = process.cwd();
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; }
  const ext = path.extname(f); r.writeHead(200, { 'Content-Type': { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png' }[ext] || 'application/octet-stream' }); r.end(d); }); });
await new Promise(r => srv.listen(0, r)); const port = srv.address().port;
const browser = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const frames = []; for (let i = FROM; i < TO; i += STEP) frames.push(i);
const chunk = Math.ceil(frames.length / NW);
let done = 0; const t0 = Date.now();
async function worker(k) {
  const mine = frames.slice(k * chunk, (k + 1) * chunk); if (!mine.length) return;
  const page = await browser.newPage({ viewport: { width: Wd, height: Ht } });
  page.on('pageerror', e => console.error('PAGEERR', e.message));
  await page.goto(`http://localhost:${port}/render.html?w=${Wd}&h=${Ht}`);
  await page.waitForFunction(() => window.READY || window.ERR, null, { timeout: 120000 });
  const err = await page.evaluate(() => window.ERR); if (err) { console.error(err); process.exit(1); }
  const fps = A.fps ? +A.fps : 60 / STEP;
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', A.jpg ? 'mjpeg' : 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', A.preset || 'medium', '-crf', A.crf || '14', '-pix_fmt', 'yuv420p', `${OUT}_${String(k).padStart(2, '0')}.mp4`], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (const i of mine) {
    const b64 = await page.evaluate(([i, jpg]) => { window.renderFrame(i); return document.getElementById('out').toDataURL(jpg ? 'image/jpeg' : 'image/png', .96).split(',')[1]; }, [i, !!A.jpg]);
    const buf = Buffer.from(b64, 'base64');
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    done++; if (done % 120 === 0) { const el = (Date.now() - t0) / 1000; console.log(`${done}/${frames.length}  ${(done / el).toFixed(1)} fps  eta ${((frames.length - done) / (done / el) / 60).toFixed(1)} min`); }
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await page.close();
}
await Promise.all([...Array(NW).keys()].map(worker));
await browser.close(); srv.close();
console.log('done', ((Date.now() - t0) / 1000).toFixed(0), 's');
