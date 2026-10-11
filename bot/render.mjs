import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import path from 'node:path';
const require = createRequire(path.join(execSync('npm root -g').toString().trim(), 'x.js'));
const puppeteer = require('puppeteer');
const FPS = 30, dir = path.dirname(new URL(import.meta.url).pathname);
const shots = process.argv.slice(2).map(Number);
const browser = await puppeteer.launch({ headless: true, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
const page = await browser.newPage();
page.on('pageerror', e => { console.error('PAGE ERROR', e.message); process.exit(1); });
page.on('console', m => m.type() === 'error' && console.error('console:', m.text()));
await page.setViewport({ width: 1920, height: 1080 });
await page.goto('file://' + encodeURI(path.join(decodeURI(dir), 'index.html')) + '?render');
await page.evaluate(() => window.READY);
const grab = async t => Buffer.from((await page.evaluate(t => window.renderFrame(t), t)).split(',')[1], 'base64');
if (shots.length) {
  const fs = await import('node:fs');
  for (const t of shots) fs.writeFileSync(path.join(decodeURI(dir), `shot_${t}.jpg`), await grab(t));
} else {
  const dur = await page.evaluate(() => window.DURATION), n = Math.ceil(dur * FPS);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-i', 'audio/mix.mp3',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '25', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', 'ayu-core-intro.mp4'],
    { cwd: decodeURI(dir), stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < n; i++) {
    if (!ff.stdin.write(await grab(i / FPS))) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 300 === 0) console.log(`${i}/${n}`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
}
await browser.close();
