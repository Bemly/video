#!/usr/bin/env node
// Offline render: serves the page, drives it in headless Chrome frame by frame, pipes raw RGBA into ffmpeg.
//   node tools/render.mjs                         -> bemly-tahoe.mp4 (1920x1080, 30 fps, 8x motion blur, with audio)
//   node tools/render.mjs --w=3840 --h=2160       -> 4K
//   node tools/render.mjs --sheet=out.jpg --step=15 --w=480 --h=270 --mb=1   -> contact sheet(s) for review
// Needs: ffmpeg on PATH, puppeteer (local or global install).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v = '1'] = a.replace(/^--/, '').split('='); return [k, v]; }));
const W = +(arg.w || 1920), H = +(arg.h || 1080), FPS = +(arg.fps || 30), MB = +(arg.mb || 8), STEP = +(arg.step || 1);
const out = path.resolve(arg.sheet || arg.out || path.join(root, 'bemly-tahoe.mp4'));

let puppeteer;
try { puppeteer = createRequire(import.meta.url)('puppeteer'); }
catch { puppeteer = createRequire(path.join(execSync('npm root -g').toString().trim(), 'x.js'))('puppeteer'); }
puppeteer = puppeteer.default || puppeteer;

const RAW = ['-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`];
const ff = arg.sheet
  ? ['-y', ...RAW, '-i', '-', '-vf', `vflip,tile=${arg.tile || '6x5'}`, '-q:v', '3', out]
  : ['-y', ...RAW, '-framerate', String(FPS / STEP), '-i', '-',
    ...(arg.from || arg.to ? [] : ['-i', path.join(root, 'soundtrack.m4a')]),
    '-vf', 'vflip', '-c:v', 'libx264', '-preset', 'slow', '-crf', arg.crf || '15', '-pix_fmt', 'yuv420p',
    '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
    '-c:a', 'copy', '-shortest', '-movflags', '+faststart', out];
const ffmpeg = spawn('ffmpeg', ['-v', 'error', ...ff], { stdio: ['pipe', 'inherit', 'inherit'] });

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.m4a': 'audio/mp4' };
let frames = 0, finish;
const done = new Promise(r => { finish = r; });
const body = req => new Promise(r => { const c = []; req.on('data', d => c.push(d)); req.on('end', () => r(Buffer.concat(c))); });
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  if (req.method === 'POST') {
    const b = await body(req);
    if (url.pathname === '/frame') {
      if (!ffmpeg.stdin.write(b)) await new Promise(r => ffmpeg.stdin.once('drain', r));
      if (++frames % 150 === 0) console.log(`frame ${url.searchParams.get('i')}`);
    } else if (url.pathname === '/log') console.error('PAGE ERROR:\n' + b.toString());
    else if (url.pathname === '/done') finish();
    return res.end('ok');
  }
  const file = path.join(root, decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
  if (!file.startsWith(root) || !fs.existsSync(file)) { res.statusCode = 404; return res.end(); }
  res.setHeader('content-type', MIME[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const browser = await puppeteer.launch({
  headless: true,
  args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu', '--autoplay-policy=no-user-gesture-required', `--window-size=${W},${H}`],
  defaultViewport: { width: W, height: H, deviceScaleFactor: 1 },
});
const page = await browser.newPage();
page.on('console', m => { if (m.type() === 'error') console.error('[page]', m.text()); });
page.on('pageerror', e => console.error('[page]', e.message));
const q = new URLSearchParams({ render: 1, w: W, h: H, fps: FPS, mb: MB, step: STEP });
if (arg.from) q.set('from', arg.from);
if (arg.to) q.set('to', arg.to);
const t0 = Date.now();
await page.goto(`http://127.0.0.1:${port}/index.html?${q}`);
await done;
await browser.close(); server.close();
ffmpeg.stdin.end();
await new Promise(r => ffmpeg.on('close', r));
console.log(`${frames} frames -> ${out} (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
