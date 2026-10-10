// Serves the project and turns frames posted by film/index.html?rec=1 into video segments.
//   node tools/record.mjs [port]
//   POST /frame?i=N&out=name   JPEG body, appended in order to out/<name>.mp4 (one ffmpeg per name)
//   POST /done?out=name        closes that segment
//   POST /still?name=x         saves out/stills/x.jpg
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = +(process.argv[2] || 8124);
const outDir = path.join(root, 'out');
fs.mkdirSync(path.join(outDir, 'stills'), { recursive: true });
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.jpg': 'image/jpeg', '.mp4': 'video/mp4' };
const safe = (s) => String(s || 'film').replace(/[^\w.-]/g, '_');
const encoders = new Map();

function encoder(name) {
  if (encoders.has(name)) return encoders.get(name);
  const file = path.join(outDir, `${name}.mp4`);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-color_range', 'tv', '-movflags', '+faststart', file], { stdio: ['pipe', 'inherit', 'inherit'] });
  const e = { ff, n: 0, file };
  ff.on('close', (code) => console.log(`[${name}] ffmpeg closed (${code}) after ${e.n} frames -> ${file}`));
  encoders.set(name, e); return e;
}
const body = (req) => new Promise((res) => { const chunks = []; req.on('data', (c) => chunks.push(c)); req.on('end', () => res(Buffer.concat(chunks))); });

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  if (req.method === 'POST') {
    const buf = await body(req);
    if (url.pathname === '/frame') {
      const e = encoder(safe(url.searchParams.get('out')));
      if (!e.ff.stdin.write(buf)) await new Promise((r) => e.ff.stdin.once('drain', r));
      e.n++;
    } else if (url.pathname === '/done') {
      const name = safe(url.searchParams.get('out')), e = encoders.get(name);
      if (e) { e.ff.stdin.end(); encoders.delete(name); }
    } else if (url.pathname === '/still') fs.writeFileSync(path.join(outDir, 'stills', `${safe(url.searchParams.get('name'))}.jpg`), buf);
    res.writeHead(200); res.end('ok'); return;
  }
  let p = decodeURIComponent(url.pathname);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(root, p);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('not found'); return; }
  res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
  fs.createReadStream(file).pipe(res);
}).listen(port, '127.0.0.1', () => console.log(`recorder on http://localhost:${port}/film/`));
