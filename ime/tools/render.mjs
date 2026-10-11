// 逐帧离线渲染：node tools/render.mjs [--stills t1,t2,...] [--out file.mp4]
import { createRequire } from 'module';
import { spawn, execSync } from 'child_process';
import { createServer } from 'http';
import { createReadStream, statSync, writeFileSync, mkdirSync } from 'fs';
import { extname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const puppeteer = require(join(execSync('npm root -g').toString().trim(), 'puppeteer'));
const root = resolve(fileURLToPath(new URL('..', import.meta.url))), FPS = 30;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i+1] : null; };
const stills = arg('--stills'), outFile = arg('--out') || 'afm-ime-intro.mp4';

const MIME = { '.html': 'text/html', '.json': 'application/json', '.png': 'image/png', '.mp4': 'video/mp4', '.wav': 'audio/wav' };
const server = createServer((req, res) => { // 带 Range 的静态服务（视频 seek 需要）
  const f = join(root, decodeURIComponent(req.url.split('?')[0]));
  let st; try { st = statSync(f); } catch { res.writeHead(404).end(); return; }
  const h = { 'Content-Type': MIME[extname(f)] || 'application/octet-stream', 'Accept-Ranges': 'bytes' };
  const m = /bytes=(\d+)-(\d*)/.exec(req.headers.range || '');
  if(m){ const s = +m[1], e = m[2] ? +m[2] : st.size - 1;
    res.writeHead(206, { ...h, 'Content-Range': `bytes ${s}-${e}/${st.size}`, 'Content-Length': e - s + 1 }); createReadStream(f, { start: s, end: e }).pipe(res);
  } else { res.writeHead(200, { ...h, 'Content-Length': st.size }); createReadStream(f).pipe(res); }
}).listen(8765, '127.0.0.1');

const browser = await puppeteer.launch({ headless: true, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
page.on('console', m => console.log('[page]', m.text())); page.on('pageerror', e => console.log('[pageerror]', e.message));
await page.setViewport({ width: 1920, height: 1080 });
await page.goto('http://127.0.0.1:8765/index.html?capture=1');
await page.waitForFunction('window.ready || window.err', { timeout: 40000 });
const err = await page.evaluate('window.err'); if(err) throw new Error(err);
const DUR = await page.evaluate('window.DUR');
const frame = async t => Buffer.from((await page.evaluate(t => window.renderAt(t), t)).split(',')[1], 'base64');

if(stills){
  mkdirSync(join(root, 'stills'), { recursive: true });
  for(const t of stills.split(',').map(Number)) writeFileSync(join(root, 'stills', `t${String(t).padStart(6, '0')}.jpg`), await frame(t));
} else {
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', FPS, '-c:v', 'mjpeg', '-i', '-', '-i', join(root, 'audio/voice.wav'),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-shortest', join(root, outFile)], { stdio: ['pipe', 'inherit', 'inherit'] });
  const N = Math.floor(DUR*FPS), t0 = Date.now();
  for(let i = 0; i < N; i++){
    if(!ff.stdin.write(await frame(i/FPS))) await new Promise(r => ff.stdin.once('drain', r));
    if(i % 300 === 0) console.log(`frame ${i}/${N}  ${((Date.now()-t0)/1000).toFixed(0)}s`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('done', outFile);
}
await browser.close(); server.close();
