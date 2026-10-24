// node tools/record.mjs out.mp4 [query] — records stage.html in real time via CDP screencast, 30fps CFR
import { chromium } from '/opt/homebrew/lib/node_modules/playwright/index.mjs';
import { spawn } from 'child_process';
const [,, out = 'video.mp4', q = ''] = process.argv;
const FPS = 30;
const b = await chromium.launch({ channel: 'chromium', args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--host-resolver-rules=MAP *.local 127.0.0.1', '--site-per-process', '--enable-gpu-rasterization', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
p.on('pageerror', e => process.stderr.write('PAGEERR(stage-or-frame) ' + e.message.slice(0, 120) + '\n'));
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS), '-i', '-',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
const cdp = await ctx.newCDPSession(p);
let latest = null, written = 0, t0 = 0;
cdp.on('Page.screencastFrame', async f => {
  latest = Buffer.from(f.data, 'base64');
  cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
});
await p.goto('http://127.0.0.1:8765/stage.html' + q);
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 });
t0 = Date.now();
const tick = setInterval(() => {
  if (!latest) return;
  const due = Math.floor((Date.now() - t0) / 1000 * FPS);
  while (written < due) { ff.stdin.write(latest); written++; }
  if (written % (FPS * 30) === 0) process.stderr.write(`rec ${(written / FPS).toFixed(0)}s\n`);
}, 10);
await p.waitForFunction(() => window.__done === true, null, { timeout: 0, polling: 500 });
await p.waitForTimeout(800);
clearInterval(tick);
ff.stdin.end();
await new Promise(r => ff.on('close', r));
process.stderr.write(`done ${(written / FPS).toFixed(1)}s -> ${out}\n`);
await Promise.race([b.close(), new Promise(r => setTimeout(r, 3000))]); process.exit(0);
