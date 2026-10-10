// Cover art: the same frame seen from world A (left) and world B (right), split by a seam.
//   film/cover.html?w=1920&h=1080&name=cover_16x9   (posts the JPEG to tools/record.mjs -> out/stills/)
import { Renderer, viewOf, defaultOpt } from '../src/render.js';
import { SHOTS } from './script.js';
import { build, FPS } from './timeline.js';
import { makeState, advance } from './playstate.js';
import { MONO } from './draw.js';

const q = new URLSearchParams(location.search);
const W = +(q.get('w') || 1920), H = +(q.get('h') || 1080), name = q.get('name') || 'cover';
const stage = document.getElementById('stage'); stage.width = W; stage.height = H;
const g = stage.getContext('2d');

const shot = build(SHOTS).shots.find((s) => s.id === 'decay'), st = makeState(shot);
for (let i = 0; i < 9.2 * FPS; i++) advance(st, shot);
const glc = document.createElement('canvas'); glc.width = W; glc.height = H;
const r = new Renderer(glc, st.world, { scale: 2 }); r.setSize(W, H);
const m = st.sim.mid, wide = W / H > 1.5;
const cam = { pos: [m[0] - 7.6, 9.4, m[2] + (wide ? 4.2 : 3.4)], target: [m[0] + 6, 14.4, m[2] - 1.2], fov: wide ? 66 : 74 };
const seam = [[W * 0.66, 0], [W * 0.47, H]];
[0, 1].forEach((phi) => {
  const v = viewOf(st.sim, cam, phi, { ...defaultOpt(), glitch: 0.6 }); v.eye = 0.95; v.sigma = 0.9;
  r.render(v);
  g.save(); g.beginPath();
  if (phi === 0) { g.moveTo(0, 0); g.lineTo(seam[0][0], 0); g.lineTo(seam[1][0], H); g.lineTo(0, H); }
  else { g.moveTo(seam[0][0], 0); g.lineTo(W, 0); g.lineTo(W, H); g.lineTo(seam[1][0], H); }
  g.clip(); g.drawImage(glc, 0, 0); g.restore();
});
// seam
g.save(); g.lineCap = 'butt';
for (const [w, c] of [[H * 0.03, '#ff29b8'], [H * 0.012, '#d1ff33'], [H * 0.004, '#fff']]) { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(seam[0][0] + 20, -40); g.lineTo(seam[1][0] - 20, H + 40); g.stroke(); }
g.restore();
// title bands, top and bottom
const u = H / 1080, band = 146 * u;
const title = (s, y, color) => {
  g.fillStyle = 'rgba(12,10,34,0.62)'; g.fillRect(0, y - band / 2, W, band);
  g.font = `500 ${104 * u}px Futura, "Avenir Next", ${MONO}`; g.letterSpacing = `${7 * u}px`;
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = color; g.fillText(s, W / 2 + 3.5 * u, y + 6 * u);
};
title(q.get('top') || 'CODING ADVENTURE', 128 * u, '#e4e4e8');
title(q.get('bottom') || 'CODE ODYSSEY', H - 128 * u, '#ff3d68');

stage.toBlob(async (b) => { await fetch(`/still?name=${name}`, { method: 'POST', body: b }); document.title = 'done'; }, 'image/jpeg', 0.95);
