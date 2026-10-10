// Renders the whole film: splits the timeline at shot boundaries, records the parts in parallel with
// headless Chromium, then joins them. Usage: node tools/render.mjs [--jobs 4] [--ss 2] [--name dieji]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { SHOTS } from '../film/script.js';
import { build } from '../film/timeline.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const jobs = +arg('jobs', 4), ss = arg('ss', 2), name = arg('name', 'dieji'), port = 8124;
const chrome = process.env.CHROME || ['/Applications/Chromium.app/Contents/MacOS/Chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find((p) => fs.existsSync(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const up = async () => { try { return (await fetch(`http://localhost:${port}/film/index.html`)).ok; } catch { return false; } };

if (!(await up())) { spawn('node', [path.join(root, 'tools/record.mjs'), String(port)], { stdio: 'inherit', detached: true }).unref(); for (let i = 0; i < 20 && !(await up()); i++) await sleep(300); }

const tl = build(SHOTS);
const cuts = [0];
for (let j = 1; j < jobs; j++) { const want = (tl.frames * j) / jobs; cuts.push(tl.shots.reduce((b, s) => (Math.abs(s.f0 - want) < Math.abs(b - want) ? s.f0 : b), 0)); }
cuts.push(tl.frames);
const segs = cuts.slice(0, -1).map((from, i) => ({ from, to: cuts[i + 1], out: `${name}_part${i}`, file: path.join(root, 'out', `${name}_part${i}.mp4`) })).filter((s) => s.to > s.from);
console.log(`${tl.frames} frames (${(tl.dur / 60).toFixed(1)} min) in ${segs.length} parts:`, segs.map((s) => `${s.from}-${s.to}`).join('  '));

const procs = segs.map((s, i) => {
  fs.rmSync(s.file, { force: true });
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'dieji-chrome-'));
  const p = spawn(chrome, ['--headless=new', `--user-data-dir=${profile}`, '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding', '--no-first-run', '--mute-audio', '--window-size=1280,720',
    `http://localhost:${port}/film/index.html?rec=1&from=${s.from}&to=${s.to}&out=${s.out}&ss=${ss}`], { stdio: 'ignore' });
  return { p, profile };
});
const finished = (f) => fs.existsSync(f) && spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).status === 0;
const t0 = Date.now();
while (!segs.every((s) => finished(s.file))) { await sleep(5000); process.stdout.write(`\r${((Date.now() - t0) / 1000).toFixed(0)}s  done: ${segs.filter((s) => finished(s.file)).length}/${segs.length} `); }
for (const { p } of procs) p.kill();
await sleep(1500); // let Chromium let go of its profile before deleting it
for (const { profile } of procs) try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 400 }); } catch { /* a leftover temp profile is harmless */ }

const list = path.join(root, 'out', `${name}_parts.txt`), final = path.join(root, 'out', `${name}.mp4`);
fs.writeFileSync(list, segs.map((s) => `file '${path.basename(s.file)}'`).join('\n'));
const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo',
  '-c:v', 'copy', '-c:a', 'aac', '-b:a', '96k', '-shortest', '-movflags', '+faststart', final], { stdio: 'inherit', cwd: path.join(root, 'out') });
console.log(`\n${r.status === 0 ? 'wrote' : 'FAILED'} ${final}`);
