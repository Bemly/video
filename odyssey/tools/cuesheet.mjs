// Writes the narration cue sheet from the film timeline: one row per subtitle line with its start, end,
// duration and English text. Usage: node tools/cuesheet.mjs   -> narration/cues.{md,csv,srt}
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SHOTS } from '../film/script.js';
import { build } from '../film/timeline.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'narration');
fs.mkdirSync(dir, { recursive: true });

const WPS = 2.6; // comfortable English narration pace, words per second
const tc = (t, sep = '.') => { const ms = Math.round(t * 1000), m = Math.floor(ms / 60000), s = Math.floor(ms / 1000) % 60; return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}${sep}${String(ms % 1000).padStart(3, '0')}`; };
const words = (s) => s.split(/\s+/).filter(Boolean).length;

const tl = build(SHOTS), rows = [];
for (const shot of tl.shots) for (const L of shot.lines) {
  if (!L.zh) continue;
  const start = shot.start + L.start, n = words(L.en);
  rows.push({ id: rows.length + 1, shot: shot.id, chapter: shot.chapter || '', start, end: start + L.dur, dur: L.dur, en: L.en, zh: L.zh, need: n / WPS, tight: n / WPS > L.dur - 0.3 });
}

rows.forEach((r, i) => { if (rows[i + 1]) r.end = Math.min(r.end, rows[i + 1].start); }); // shot starts are frame-rounded

const csv = (s) => `"${String(s).replace(/"/g, '""')}"`;
fs.writeFileSync(path.join(dir, 'cues.csv'), '﻿' + ['id,shot,start,end,duration_s,est_read_s,tight,english,chinese',
  ...rows.map((r) => [r.id, r.shot, tc(r.start), tc(r.end), r.dur.toFixed(2), r.need.toFixed(1), r.tight ? 'yes' : '', csv(r.en), csv(r.zh)].join(','))].join('\n') + '\n');

fs.writeFileSync(path.join(dir, 'cues.srt'), rows.map((r) => `${r.id}\n00:${tc(r.start, ',')} --> 00:${tc(r.end, ',')}\n${r.en}\n`).join('\n'));

let md = `# Narration cue sheet\n\nFilm length ${tc(tl.dur)} · ${rows.length} lines · times are positions in \`out/dieji.mp4\`.\n\n`
  + `"Read" is the estimated time to say the line at ${WPS} words per second. Lines marked ⚠ are a tight fit for their slot.\n`;
let shotId = null;
for (const r of rows) {
  if (r.shot !== shotId) { shotId = r.shot; md += `\n## ${r.chapter ? `${r.chapter} — ` : ''}${r.shot}\n\n| # | Start | End | Slot | Read | English |\n| ---: | --- | --- | ---: | ---: | --- |\n`; }
  md += `| ${r.id} | ${tc(r.start)} | ${tc(r.end)} | ${r.dur.toFixed(1)}s | ${r.need.toFixed(1)}s${r.tight ? ' ⚠' : ''} | ${r.en.replace(/\|/g, '\\|')} |\n`;
}
fs.writeFileSync(path.join(dir, 'cues.md'), md);

const tight = rows.filter((r) => r.tight);
console.log(`${rows.length} lines, film ${tc(tl.dur)}, speech estimate ${(rows.reduce((a, r) => a + r.need, 0) / 60).toFixed(1)} min`);
console.log(`${tight.length} tight lines:`, tight.map((r) => `#${r.id} (${r.need.toFixed(1)}s in ${r.dur.toFixed(1)}s)`).join(', '));
