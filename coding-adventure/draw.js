// 2D drawing for the film: subtitles, title card, code view, HUD, diagram primitives.
import { W, H } from './timeline.js';

export const COL = {
  bg: '#1f2229', panel: '#282c34', a: '#f2a23a', b: '#35c9e6', ink: '#ece8dd', dim: '#5d6474', faint: '#353a46',
  hot1: '#ff29b8', hot2: '#d1ff33', green: '#4be07b', red: '#ef3d5d', yellow: '#ffd84a', pearl: '#e9f6f4',
};
export const FONT = '"PingFang SC","Hiragino Sans GB","Helvetica Neue",sans-serif';
export const MONO = '"SF Mono",Menlo,Monaco,monospace';

const hash = (n) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };
export const lerp = (a, b, k) => a + (b - a) * k;
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };

// ---------- primitives ----------
export function label(g, text, x, y, { size = 30, color = COL.ink, align = 'center', mono = false, weight = 500, alpha = 1, base = 'middle' } = {}) {
  if (alpha <= 0) return;
  g.save(); g.globalAlpha *= alpha; g.font = `${weight} ${size}px ${mono ? MONO : FONT}`; g.textAlign = align; g.textBaseline = base; g.fillStyle = color;
  g.fillText(text, x, y); g.restore();
}
export function line(g, x0, y0, x1, y1, color = COL.ink, w = 3, dash = null) {
  g.save(); g.strokeStyle = color; g.lineWidth = w; g.lineCap = 'round'; if (dash) g.setLineDash(dash);
  g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.restore();
}
export function arrow(g, x0, y0, x1, y1, color = COL.ink, w = 4) {
  const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy);
  if (l < 2) return;
  const ux = dx / l, uy = dy / l, h = Math.min(18, l * 0.6);
  line(g, x0, y0, x1 - ux * h * 0.6, y1 - uy * h * 0.6, color, w);
  g.save(); g.fillStyle = color; g.beginPath(); g.moveTo(x1, y1);
  g.lineTo(x1 - ux * h - uy * h * 0.5, y1 - uy * h + ux * h * 0.5); g.lineTo(x1 - ux * h + uy * h * 0.5, y1 - uy * h - ux * h * 0.5);
  g.closePath(); g.fill(); g.restore();
}
export function dot(g, x, y, r, color, { ring = null, hollow = false, alpha = 1 } = {}) {
  g.save(); g.globalAlpha *= alpha; g.beginPath(); g.arc(x, y, r, 0, 6.2832);
  if (hollow) { g.strokeStyle = color; g.lineWidth = 3; g.setLineDash([6, 6]); g.stroke(); } else { g.fillStyle = color; g.fill(); }
  if (ring) { g.setLineDash([]); g.strokeStyle = ring; g.lineWidth = 3; g.beginPath(); g.arc(x, y, r + 7, 0, 6.2832); g.stroke(); }
  g.restore();
}
export function spring(g, x0, y0, x1, y1, color = COL.ink, coils = 9, amp = 12, w = 3) {
  const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy);
  if (l < 4) return;
  const ux = dx / l, uy = dy / l, n = coils * 2;
  g.save(); g.strokeStyle = color; g.lineWidth = w; g.lineJoin = 'round'; g.beginPath(); g.moveTo(x0, y0);
  for (let i = 1; i < n; i++) { const k = i / n, s = i % 2 ? 1 : -1; g.lineTo(x0 + dx * k - uy * amp * s, y0 + dy * k + ux * amp * s); }
  g.lineTo(x1, y1); g.stroke(); g.restore();
}
export function rect(g, x, y, w, h, { fill = null, stroke = null, lw = 3, r = 0, dash = null, alpha = 1 } = {}) {
  g.save(); g.globalAlpha *= alpha; g.beginPath(); if (r) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h);
  if (fill) { g.fillStyle = fill; g.fill(); }
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; if (dash) g.setLineDash(dash); g.stroke(); }
  g.restore();
}
export function check(g, x, y, k, color = COL.green) { // animated tick
  if (k <= 0) return;
  g.save(); g.strokeStyle = color; g.lineWidth = 6; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath();
  g.moveTo(x - 14, y); const a = Math.min(1, k * 2), b = Math.max(0, k * 2 - 1);
  g.lineTo(x - 14 + 10 * a, y + 10 * a); if (b > 0) g.lineTo(x - 4 + 20 * b, y + 10 - 24 * b); g.stroke(); g.restore();
}
export function gauge(g, x, y, w, h, v, { thr = 1, max = 1.5, title = '张力', sub = '' } = {}) {
  rect(g, x, y, w, h, { stroke: COL.dim, lw: 2 });
  const k = clamp(v / max), fh = h * k;
  const gr = g.createLinearGradient(0, y + h, 0, y); gr.addColorStop(0, COL.hot2); gr.addColorStop(1, COL.hot1);
  rect(g, x + 3, y + h - fh, w - 6, fh, { fill: gr });
  const ty = y + h - h * (thr / max);
  line(g, x - 12, ty, x + w + 12, ty, COL.ink, 3);
  label(g, '阈值', x + w + 22, ty, { size: 24, align: 'left' });
  label(g, title, x + w / 2, y - 30, { size: 28 });
  if (sub) label(g, sub, x + w / 2, y + h + 30, { size: 22, color: COL.dim, mono: true });
}

// ---------- backgrounds ----------
export function clearBG(g, color = COL.bg) { g.fillStyle = color; g.fillRect(0, 0, W, H); }

export function titleCard(g, c, big, small, sub) {
  const gr = g.createLinearGradient(0, 0, W, H);
  gr.addColorStop(0, '#ff2f7d'); gr.addColorStop(0.55, '#c0178f'); gr.addColorStop(1, '#5a1fb0');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 90; i++) { // drifting voxels
    const x = (hash(i) * W + c.t * (10 + hash(i + 50) * 30)) % W, y = (hash(i + 9) * H + c.t * (4 + hash(i + 70) * 14)) % H, s = 4 + hash(i + 3) * 10;
    g.fillStyle = `rgba(255,255,255,${0.05 + hash(i + 5) * 0.12})`; g.fillRect(x, y, s, s);
  }
  const n = Math.floor(clamp(c.t / 1.1) * big.length);
  g.save(); g.font = `700 120px ${MONO}`; g.textAlign = 'left'; g.textBaseline = 'middle';
  const tw = g.measureText(big).width, x0 = (W - tw) / 2;
  g.fillStyle = 'rgba(60,0,70,0.35)'; g.fillText(big.slice(0, n), x0 + 5, H * 0.42 + 6);
  g.fillStyle = '#ff7ac8'; g.fillText(big.slice(0, n), x0, H * 0.42);
  if (n < big.length || Math.floor(c.t * 2) % 2 === 0) g.fillRect(x0 + g.measureText(big.slice(0, n)).width + 8, H * 0.42 - 52, 16, 104);
  g.restore();
  label(g, small, W / 2, H * 0.57, { size: 54, color: '#ffe3f4', weight: 600, alpha: c.smooth((c.t - 1.1) / 0.6) });
  if (sub) label(g, sub, W / 2, H * 0.645, { size: 30, color: '#ffc1e6', alpha: c.smooth((c.t - 1.5) / 0.6), mono: true });
}

// ---------- subtitles ----------
export function subtitles(g, shot, c) {
  const L = shot.lines[c.line];
  if (!L || !L.zh || c.lt > L.dur) return;
  const a = Math.min(1, c.lt / 0.12, (L.dur - c.lt) / 0.12);
  g.save(); g.globalAlpha = clamp(a); g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  g.font = `600 46px ${FONT}`; g.strokeStyle = 'rgba(8,8,14,0.92)'; g.lineWidth = 9; g.strokeText(L.zh, W / 2, 968); g.fillStyle = '#fff'; g.fillText(L.zh, W / 2, 968);
  g.font = `500 25px ${FONT}`; g.lineWidth = 6; g.strokeText(L.en, W / 2, 1018); g.fillStyle = '#f0eee6'; g.fillText(L.en, W / 2, 1018);
  g.restore();
}

export function chapterTag(g, text, t) {
  const a = Math.min(clamp(t / 0.5), clamp((5.5 - t) / 0.6));
  if (a <= 0) return;
  g.save(); g.globalAlpha = a;
  const x = 60 - (1 - a) * 30;
  rect(g, x, 54, 10, 64, { fill: COL.hot1 });
  label(g, text, x + 28, 86, { size: 40, align: 'left', weight: 600 });
  g.restore();
}

// ---------- in-game HUD ----------
export function hud(g, { sigma = null, phi = null, tag = null }) {
  if (tag) { g.save(); g.font = `500 24px ${MONO}`; const w = g.measureText(tag).width + 36; rect(g, W - w - 48, 48, w, 44, { fill: 'rgba(10,10,16,0.55)', r: 6 }); label(g, tag, W - 66, 70, { size: 24, mono: true, align: 'right', color: '#f3efe4' }); g.restore(); }
  if (phi !== null) {
    const x = 60, y = 150;
    rect(g, x, y, 250, 46, { fill: 'rgba(10,10,16,0.55)', r: 6 });
    label(g, '注视', x + 16, y + 23, { size: 22, align: 'left', color: '#cfcabd' });
    rect(g, x + 78, y + 9, 76, 28, { fill: rgba(COL.a, lerp(1, 0.18, phi)), r: 4 }); label(g, 'A', x + 116, y + 24, { size: 22, mono: true, color: '#1b1410', weight: 700 });
    rect(g, x + 162, y + 9, 76, 28, { fill: rgba(COL.b, lerp(0.18, 1, phi)), r: 4 }); label(g, 'B', x + 200, y + 24, { size: 22, mono: true, color: '#0d171b', weight: 700 });
  }
  if (sigma !== null) {
    const x = 60, y = 212, w = 250;
    rect(g, x, y, w, 46, { fill: 'rgba(10,10,16,0.55)', r: 6 });
    label(g, '冲突', x + 16, y + 23, { size: 22, align: 'left', color: '#cfcabd' });
    const bw = 150, bx = x + 80; rect(g, bx, y + 17, bw, 12, { stroke: 'rgba(255,255,255,0.4)', lw: 1.5 });
    const gr = g.createLinearGradient(bx, 0, bx + bw, 0); gr.addColorStop(0, COL.hot2); gr.addColorStop(1, COL.hot1);
    rect(g, bx, y + 17, bw * clamp(sigma / 1.5), 12, { fill: gr });
    line(g, bx + bw / 1.5, y + 11, bx + bw / 1.5, y + 35, '#fff', 2);
  }
}

// ---------- code view ----------
const KW = new Set('const let var for if else return while break continue function export import from new class this of in true false null void uniform out precision highp'.split(' '));
const TY = new Set('float int bool vec2 vec3 vec4 ivec2 ivec3 mat3 sampler3D sampler2D Math'.split(' '));
const CC = { text: '#abb2bf', kw: '#c678dd', ty: '#e5c07b', num: '#d19a66', com: '#687080', fn: '#61afef', str: '#98c379', punc: '#8b93a3' };
const tokCache = new Map();
function tokenize(s) {
  if (tokCache.has(s)) return tokCache.get(s);
  const out = [], re = /(\/\/.*$)|('[^']*'|"[^"]*")|(\b\d+\.?\d*(?:e-?\d+)?\b|\.\d+)|([A-Za-z_]\w*)|(\s+)|(.)/g;
  let m;
  while ((m = re.exec(s))) {
    if (m[1]) out.push([m[1], CC.com]); else if (m[2]) out.push([m[2], CC.str]); else if (m[3]) out.push([m[3], CC.num]);
    else if (m[4]) out.push([m[4], KW.has(m[4]) ? CC.kw : TY.has(m[4]) ? CC.ty : s[re.lastIndex] === '(' ? CC.fn : CC.text]);
    else if (m[5]) out.push([m[5], CC.text]); else out.push([m[6], CC.punc]);
  }
  tokCache.set(s, out); return out;
}
// visible: how many lines are shown (fractional = the last one is being typed)
export function codeView(g, { file, lines }, visible, hl, t, ins = null) {
  clearBG(g, COL.panel);
  rect(g, 0, 0, W, 64, { fill: '#21252b' });
  rect(g, 40, 14, 60 + file.length * 15, 50, { fill: COL.panel, r: 8 });
  label(g, file, 70, 40, { size: 24, mono: true, align: 'left', color: '#d7dae0' });
  const x0 = 150, y0 = 132, lh = 46, fs = 31;
  g.save(); g.font = `500 ${fs}px ${MONO}`; g.textBaseline = 'middle';
  const cw = g.measureText('M').width;
  if (hl) { rect(g, 0, y0 + hl[0] * lh - lh / 2, W, (hl[1] - hl[0] + 1) * lh, { fill: 'rgba(255,255,255,0.055)' }); rect(g, 0, y0 + hl[0] * lh - lh / 2, 6, (hl[1] - hl[0] + 1) * lh, { fill: COL.hot1 }); }
  const full = Math.floor(visible), frac = visible - full;
  for (let i = 0; i < lines.length && i <= full; i++) {
    const y = y0 + i * lh, s = lines[i];
    const typing = ins ? i === ins.line && ins.frac < 1 : i === full;
    const limit = ins ? (i === ins.line ? Math.floor(ins.frac * (s.length + 1)) : 1e9) : i < full ? 1e9 : Math.floor(frac * (s.length + 1));
    if (!ins && i === full && frac <= 0) break;
    g.textAlign = 'right'; g.fillStyle = '#4b5263'; g.fillText(String(i + 1), x0 - 40, y);
    g.textAlign = 'left';
    let col = 0;
    for (const [txt, color] of tokenize(s)) {
      if (col >= limit) break;
      const part = txt.slice(0, Math.max(0, limit - col));
      g.fillStyle = color; g.fillText(part, x0 + col * cw, y); col += txt.length;
    }
    if (typing && Math.floor(t * 2.5) % 2 === 0) { g.fillStyle = '#d7dae0'; g.fillRect(x0 + Math.min(limit, s.length) * cw + 2, y - fs * 0.55, 3, fs * 1.1); }
  }
  g.restore();
}
