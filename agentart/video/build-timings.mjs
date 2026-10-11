// Reads script/fish/out/chNN.{wav,srt}, lays the chapters on one timeline,
// writes video/timings.js (loaded by index.html) and video/out/audio.wav.
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, '..', 'script', 'fish', 'out');
const out = join(here, 'out');
mkdirSync(out, { recursive: true });

const LEAD = 1.0, GAP = 0.9, TAIL = 5.0;

const ts = s => { const [h, m, r] = s.split(':'); return +h * 3600 + +m * 60 + parseFloat(r.replace(',', '.')); };

function parseSrt(text) {
  return text.replace(/\r/g, '').trim().split(/\n\n+/).map(block => {
    const [, time, zh, en] = block.split('\n');
    const [a, b] = time.split(' --> ').map(ts);
    return { s: a, e: b, zh, en };
  });
}

function silences(wav) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-i', wav, '-af', 'silencedetect=noise=-38dB:d=0.2', '-f', 'null', '-'], { encoding: 'utf8' });
  const starts = [...r.stderr.matchAll(/silence_start: ([\d.]+)/g)].map(m => +m[1]);
  const ends = [...r.stderr.matchAll(/silence_end: ([\d.]+)/g)].map(m => +m[1]);
  return starts.map((s, i) => [s, ends[i] ?? s]);
}

const duration = wav => +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', wav], { encoding: 'utf8' });

// Aligns punctuation-delimited phrases to silence-delimited speech segments
// (monotonic DP, many-to-one either way) so cues land on the spoken word.
function align(sents, sil, dur) {
  const segs = [];
  let p = 0;
  for (const [a, b] of [...sil, [dur, dur]]) { if (a - p > 0.08) segs.push([p, a]); p = b; }
  const phrases = [];
  sents.forEach((s, si) => {
    const re = /[.?!,:](?=\s|$)/g; let last = 0, m;
    const push = (a, b) => { const text = s.en.slice(a, b); if (/\w/.test(text)) phrases.push({ si, a: a + (text.length - text.trimStart().length), b, n: Math.max(2, text.replace(/[^A-Za-z0-9+]/g, '').length) }); };
    while ((m = re.exec(s.en))) { push(last, m.index + 1); last = m.index + 1; }
    push(last, s.en.length);
  });
  const N = phrases.length, M = segs.length;
  const rate = segs.reduce((n, [a, b]) => n + b - a, 0) / phrases.reduce((n, q) => n + q.n, 0);

  // Spread phrases i0..i1 over segments j0..j1 by character count.
  const place = (i0, i1, j0, j1) => {
    const speech = segs.slice(j0, j1).reduce((n, [a, b]) => n + b - a, 0);
    const chars = phrases.slice(i0, i1).reduce((n, q) => n + q.n, 0);
    const real = u => { for (let j = j0; j < j1; j++) { const d = segs[j][1] - segs[j][0]; if (u <= d + 1e-9) return segs[j][0] + u; u -= d; } return segs[j1 - 1][1]; };
    let u = 0;
    return phrases.slice(i0, i1).map(q => { const u0 = u; u += q.n / chars * speech; return [real(u0), real(u)]; });
  };
  const cost = (i0, i1, j0, j1) => {
    const speech = segs.slice(j0, j1).reduce((n, [a, b]) => n + b - a, 0);
    const chars = phrases.slice(i0, i1).reduce((n, q) => n + q.n, 0);
    let c = Math.abs(speech - rate * chars);
    place(i0, i1, j0, j1).forEach(([a, b], k) => {
      const s = sents[phrases[i0 + k].si];
      c += 3 * (Math.max(0, s.s - 0.45 - a) + Math.max(0, b - s.e - 0.45));
    });
    return c;
  };
  const D = Array.from({ length: N + 1 }, () => Array(M + 1).fill(Infinity));
  const back = Array.from({ length: N + 1 }, () => Array(M + 1).fill(null));
  D[0][0] = 0;
  for (let i = 1; i <= N; i++) for (let j = 1; j <= M; j++) {
    for (let k = 1; k <= 6; k++) {
      if (i - k >= 0 && D[i - k][j - 1] < Infinity) { const c = D[i - k][j - 1] + cost(i - k, i, j - 1, j); if (c < D[i][j]) { D[i][j] = c; back[i][j] = [i - k, j - 1]; } }
      if (k > 1 && j - k >= 0 && D[i - 1][j - k] < Infinity) { const c = D[i - 1][j - k] + cost(i - 1, i, j - k, j); if (c < D[i][j]) { D[i][j] = c; back[i][j] = [i - 1, j - k]; } }
    }
  }
  if (D[N][M] === Infinity) throw new Error('alignment failed');
  for (let i = N, j = M; i > 0;) {
    const [pi, pj] = back[i][j];
    place(pi, i, pj, j).forEach(([a, b], k) => { phrases[pi + k].t0 = a; phrases[pi + k].t1 = b; });
    i = pi; j = pj;
  }
  sents.forEach((s, si) => {
    const mine = phrases.filter(q => q.si === si);
    s.map = mine.map(q => [q.a, q.b, +q.t0.toFixed(3), +q.t1.toFixed(3)]);
    s.s = s.map[0][2]; s.e = s.map[s.map.length - 1][3];
  });
  return D[N][M];
}

const names = readdirSync(src).filter(f => /^ch\d+\.wav$/.test(f)).sort();
let t = LEAD;
const chapters = names.map(f => {
  const wav = join(src, f);
  const dur = duration(wav);
  const sents = parseSrt(readFileSync(wav.replace(/\.wav$/, '.srt'), 'utf8'));
  const c = align(sents, silences(wav), dur);
  console.log(f, 'alignment cost', c.toFixed(2));
  const ch = { id: f.slice(2, 4), offset: t, dur, sents };
  t += dur + GAP;
  return ch;
});
const total = t - GAP + TAIL;

writeFileSync(join(here, 'timings.js'), 'window.TIMINGS = ' + JSON.stringify({ total, chapters }, null, 1) + ';\n');

const args = ['-y', '-hide_banner', '-v', 'error'];
for (const f of names) args.push('-i', join(src, f));
const filt = chapters.map((c, i) => `[${i}:a]adelay=${Math.round(c.offset * 1000)}:all=1[a${i}]`).join(';')
  + ';' + chapters.map((_, i) => `[a${i}]`).join('') + `amix=inputs=${chapters.length}:normalize=0,apad=whole_dur=${total.toFixed(3)}[m]`;
args.push('-filter_complex', filt, '-map', '[m]', '-ar', '48000', '-ac', '2', join(out, 'audio.wav'));
execFileSync('ffmpeg', args, { stdio: 'inherit' });

console.log(`total ${total.toFixed(2)}s, ${chapters.length} chapters`);
for (const c of chapters) console.log(c.id, c.offset.toFixed(2), c.dur.toFixed(2), c.sents.length);
