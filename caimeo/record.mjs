// usage: node record.mjs stills <outdir> t1 t2 ...   |  node record.mjs video <out.mp4> [w h]
import { createRequire } from 'module';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || '/opt/homebrew/lib/node_modules/playwright');

const here = path.dirname(new URL(import.meta.url).pathname);
const [mode, out, ...rest] = process.argv.slice(2);
const isVideo = mode === 'video';
const w = +(process.env.W || 1920), h = +(process.env.H || 1080);
const extra = process.env.QS || '';

const browser = await chromium.launch({ headless: true, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
page.on('console', (m) => console.log('[page]', m.text()));
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto(`file://${here}/index.html?w=${w}&h=${h}${extra}`);
await page.waitForFunction(() => window.ready === true);
const renderer = await page.evaluate(() => { const gl = document.getElementById('c').getContext('webgl2'); const e = gl.getExtension('WEBGL_debug_renderer_info'); return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : 'unknown'; });
console.log('GPU:', renderer);

async function grab() {
  const b64 = await page.evaluate(() => document.getElementById('c').toDataURL('image/png').split(',')[1]);
  return Buffer.from(b64, 'base64');
}

if (!isVideo) {
  fs.mkdirSync(out, { recursive: true });
  const fps = await page.evaluate(() => window.TIMELINE.fps);
  for (const t of rest) {
    await page.evaluate((f) => window.renderFrame(f), Math.round(+t * fps));
    fs.writeFileSync(path.join(out, `t${(+t).toFixed(2)}.png`), await grab());
    console.log('still', t);
  }
} else {
  const N = Math.min(+(process.env.MAXF || 1e9), await page.evaluate(() => window.totalFrames));
  const fps = await page.evaluate(() => window.TIMELINE.fps);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p', '-tune', 'animation', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = 0; f < N; f++) {
    await page.evaluate((i) => window.renderFrame(i), f);
    const buf = await grab();
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % 150 === 0) console.log(`frame ${f}/${N}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  const ev = await page.evaluate(() => window.getEvents());
  fs.writeFileSync(out.replace(/\.mp4$/, '.events.json'), JSON.stringify(ev));
  console.log('done', N, 'frames');
}
await browser.close();
