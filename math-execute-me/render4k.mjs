// 可断点续渲：把 [0, N) 按 CHUNK 帧切块，每块一个 mp4；已完成（帧数正确）的块自动跳过。
// 用法: node render4k.mjs --w 3840 --h 2160 --workers 2 --chunk 300 --dir out/k4
import { chromium } from 'playwright'; import { spawn, execFileSync } from 'child_process';
import http from 'http'; import fs from 'fs'; import path from 'path';
const A = Object.fromEntries(process.argv.slice(2).join(' ').split('--').filter(Boolean).map(s => { const [k, ...v] = s.trim().split(' '); return [k, v.join(' ') || true]; }));
const Wd = +(A.w || 3840), Ht = +(A.h || 2160), NW = +(A.workers || 2), CH = +(A.chunk || 300), DIR = A.dir || 'out/k4', N = +(A.n || 12715);
fs.mkdirSync(DIR, { recursive: true });
const chunks = []; for (let a = 0; a < N; a += CH) chunks.push([a, Math.min(N, a + CH)]);
const fname = ([a]) => path.join(DIR, `c${String(a).padStart(6, '0')}.mp4`);
const frames = f => { try { return +execFileSync('ffprobe', ['-v', 'error', '-count_packets', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_packets', '-of', 'csv=p=0', f]).toString().trim(); } catch { return -1; } };
const todo = chunks.filter(c => !(fs.existsSync(fname(c)) && frames(fname(c)) === c[1] - c[0]));
console.log(`chunks ${chunks.length}, todo ${todo.length}`);
const root = process.cwd();
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200); r.end(d); }); });
await new Promise(r => srv.listen(0, r));
const browser = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
let done = 0; const t0 = Date.now(); const total = todo.reduce((s, c) => s + c[1] - c[0], 0);
async function worker() {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', e => console.error('PAGEERR', e.message));
  await page.goto(`http://localhost:${srv.address().port}/render.html?w=${Wd}&h=${Ht}`);
  await page.waitForFunction(() => window.READY || window.ERR, null, { timeout: 120000 });
  while (todo.length) {
    const c = todo.shift(); const tmp = fname(c) + '.part.mp4';
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', '60', '-c:v', 'mjpeg', '-i', '-', '-threads', '3',
      '-c:v', 'libx264', '-preset', 'fast', '-crf', '15', '-pix_fmt', 'yuv420p', tmp], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let i = c[0]; i < c[1]; i++) {
      const b64 = await page.evaluate(i => { window.renderFrame(i); return document.getElementById('out').toDataURL('image/jpeg', .95).split(',')[1]; }, i);
      if (!ff.stdin.write(Buffer.from(b64, 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
      done++;
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r)); fs.renameSync(tmp, fname(c));
    const el = (Date.now() - t0) / 1000; console.log(`${fname(c)}  ${done}/${total}  ${(done / el).toFixed(1)} fps  eta ${((total - done) / (done / el) / 60).toFixed(1)} min`);
  }
  await page.close();
}
await Promise.all([...Array(NW)].map(worker));
await browser.close(); srv.close(); console.log('ALL_DONE');
