// Deterministic frame capture: renderAt(t) per frame → JPEG → ffmpeg (with mix.wav)
import { createRequire } from 'module';
import { spawn } from 'child_process';
const require = createRequire(process.env.PW_ROOT + '/');
const { chromium } = require('playwright');
const FPS = +(process.env.FPS || 30), FROM = +(process.env.FROM || 0), TO = process.env.TO ? +process.env.TO : null;
const out = process.argv[2] || 'build/sinytra.mp4';
const browser = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('console', m => console.log('[page]', m.text()));
await page.goto('http://127.0.0.1:8765/sinytra/index.html');
const total = await page.evaluate(() => window.ready);
await page.evaluate(() => document.fonts.ready);
const end = TO ?? total, n = Math.ceil((end - FROM) * FPS);
const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
  '-ss', String(FROM), '-t', String(end - FROM), '-i', 'build/mix.wav',
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-vf', 'scale=in_range=pc:out_range=tv,format=yuv420p', '-color_range', 'tv', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out],
  { stdio: ['pipe', 'inherit', 'inherit'] });
const t0 = Date.now();
for (let i = 0; i < n; i++) {
  const t = FROM + i / FPS;
  await page.evaluate(t => window.renderAt(t), t);
  const buf = await page.screenshot({ type: 'jpeg', quality: 92 });
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  if (i % 300 === 0) console.log(`${i}/${n} t=${t.toFixed(1)}s ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
ff.stdin.end(); await new Promise(r => ff.on('close', r));
await browser.close(); console.log('done', out);
