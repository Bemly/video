// node render.mjs still 12.5 40 ...        -> out/still_<t>.png
// node render.mjs cover [width]            -> out/cover.png (1440 gives a 4:3 cover)
// node render.mjs video [fps] [workers]    -> out/video.mp4 (frames piped to ffmpeg, then muxed with out/audio.wav)
import { createRequire } from 'node:module';
import { execFileSync, spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { writeFileSync, mkdirSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, 'out');
mkdirSync(out, { recursive: true });
const globalRoot = execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim();
const { chromium } = createRequire(globalRoot + '/')('playwright');

async function open(browser, query = '') {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => { console.error('page error:', e.message); process.exitCode = 1; });
  await page.goto(pathToFileURL(join(here, 'index.html')).href + '?headless' + query);
  await page.waitForFunction('window.READY === true', null, { timeout: 15000 });
  return page;
}
const launch = () => chromium.launch({ headless: true, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] });

const [mode, ...rest] = process.argv.slice(2);

if (mode === 'still') {
  const browser = await launch();
  const page = await open(browser);
  console.log(await page.evaluate(() => { const e = gl.getExtension('WEBGL_debug_renderer_info'); return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : 'unknown renderer'; }));
  for (const t of rest.map(Number)) {
    await page.evaluate(t => renderFrame(t), t);
    writeFileSync(join(out, `still_${t.toFixed(2)}.png`), await page.screenshot({ type: 'png' }));
  }
  await browser.close();
} else if (mode === 'cover') {
  const browser = await launch();
  const w = +(rest[0] ?? 1920);
  const page = await open(browser, '&w=' + w);
  await page.evaluate(() => renderFrame(40, drawCover));
  writeFileSync(join(out, w === 1920 ? 'cover.png' : `cover_${w}x1080.png`), await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: w, height: 1080 } }));
  await browser.close();
} else if (mode === 'video') {
  const fps = +(rest[0] ?? 60), workers = +(rest[1] ?? 4);
  const browser = await launch();
  const probe = await open(browser);
  const total = await probe.evaluate('TOTAL');
  await probe.close();
  const frames = Math.ceil(total * fps), per = Math.ceil(frames / workers);
  const started = Date.now();
  let done = 0;
  const parts = await Promise.all(Array.from({ length: workers }, async (_, w) => {
    const page = await open(browser);
    const file = join(out, `part_${w}.mp4`);
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(fps), '-i', '-',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '15', '-pix_fmt', 'yuv420p', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', file],
      { stdio: ['pipe', 'inherit', 'inherit'] });
    const closed = new Promise((res, rej) => ff.on('close', c => c ? rej(new Error('ffmpeg ' + c)) : res()));
    for (let f = w * per; f < Math.min(frames, (w + 1) * per); f++) {
      await page.evaluate(t => renderFrame(t), f / fps);
      const buf = await page.screenshot({ type: 'jpeg', quality: 97 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (++done % 600 === 0) console.log(`${done}/${frames} frames, ${((Date.now() - started) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end();
    await closed;
    return file;
  }));
  await browser.close();
  writeFileSync(join(out, 'parts.txt'), parts.map(p => `file '${p}'`).join('\n'));
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', join(out, 'parts.txt'), '-i', join(out, 'audio.wav'),
    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', join(out, 'video.mp4')], { stdio: 'inherit' });
  console.log('wrote', join(out, 'video.mp4'), `in ${((Date.now() - started) / 1000).toFixed(0)}s`);
} else {
  console.error('usage: node render.mjs still <t...> | video [fps] [workers]');
  process.exit(1);
}
