// Flat, dark schematic animations. Each takes (g, c) where c is the shot context from timeline.js.
import { World } from './src/world.js';
import { Sim } from './src/physics.js';
import { COL, label, line, arrow, dot, spring, rect, check, gauge, clearBG, lerp, clamp, rgba } from './draw.js';

const A = COL.a, B = COL.b;
const fringeAt = (i, j, t) => (Math.sin((i * 2.1 + j * 3.3) * 0.9 - t * 6) > 0 ? COL.hot1 : COL.hot2);

// ---- shared top-down corridor: 20 x 7 units, a wall only in A, a coral lump only in B ----
const U = 70, OX = 260, OY = 300;
const mx = (x) => OX + x * U, my = (z) => OY + z * U;
function sheet(g, w, dy, alpha) {
  const col = w === 0 ? A : B;
  g.save(); g.globalAlpha *= alpha; g.translate(0, dy);
  rect(g, mx(0), my(0), 20 * U, 7 * U, { fill: rgba(col, 0.07), stroke: col, lw: 3 });
  if (w === 0) rect(g, mx(10), my(0), U * 0.6, 7 * U, { fill: rgba(A, 0.85) });
  else { rect(g, mx(14.3), my(2), U * 1.8, U * 3, { fill: rgba(B, 0.8), r: 22 }); rect(g, mx(15.2), my(1.2), U * 1.2, U * 1.4, { fill: rgba(B, 0.8), r: 18 }); }
  label(g, w === 0 ? '世界 A' : '世界 B', mx(0) + 8, w === 0 ? my(0) - 34 : my(7) + 36, { size: 34, color: col, align: 'left', weight: 600 });
  g.restore();
}

export function layers(g, c) {
  clearBG(g);
  const sep = 1 - c.p(1, 1.4);
  sheet(g, 0, -sep * 175 - 20 * (1 - sep) * 0, 1); sheet(g, 1, sep * 175, 1);
  if (sep > 0.02) { label(g, '干涸', mx(20) + 30, my(3.5) - sep * 175, { size: 30, color: A, align: 'left', alpha: sep }); label(g, '淹没', mx(20) + 30, my(3.5) + sep * 175, { size: 30, color: B, align: 'left', alpha: sep }); }
  if (c.line >= 2) { // residents ignore the other world's matter
    const k = c.t - c.at(2);
    const az = ((k * 0.9) % 7), bx = 6 + ((k * 1.6) % 12);
    g.save(); g.globalAlpha = c.p(2, 0.4);
    g.fillStyle = A; g.beginPath(); g.moveTo(mx(15.3), my(az) + 16); g.lineTo(mx(15.3) - 14, my(az) - 12); g.lineTo(mx(15.3) + 14, my(az) - 12); g.fill();
    g.fillStyle = B; g.beginPath(); g.moveTo(mx(bx) + 16, my(5.5)); g.lineTo(mx(bx) - 12, my(5.5) - 14); g.lineTo(mx(bx) - 12, my(5.5) + 14); g.fill();
    g.restore();
    label(g, 'A 的居民', mx(15.3) + 30, my(0.45), { size: 24, color: A, align: 'left', alpha: c.p(2, 0.4) });
    label(g, 'B 的居民', mx(6), my(6.45), { size: 24, color: B, align: 'left', alpha: c.p(2, 0.4) });
  }
  if (c.line >= 3) {
    const a = c.p(3, 0.4), pulse = 0.5 + 0.5 * Math.sin(c.t * 5);
    rect(g, mx(10) - 6, my(0) - 6, U * 0.6 + 12, 7 * U + 12, { stroke: `rgba(255,255,255,${a * (0.4 + 0.6 * pulse)})`, lw: 4 });
    label(g, '只存在于 A', mx(10) + 20, my(0) - 40, { size: 30, alpha: a });
  }
  if (c.line >= 4) { const a = c.p(4, 0.5); dot(g, mx(3), my(3.5), 16 * a, COL.ink, { ring: `rgba(255,255,255,${a})` }); label(g, '玩家', mx(3), my(3.5) - 46, { size: 30, alpha: a }); }
}

export function twoBodies(g, c) {
  clearBG(g);
  sheet(g, 0, 0, 1); sheet(g, 1, 0, 1);
  const walk = clamp((c.t - c.at(2) - 0.6) / (c.at(4) - c.at(2) - 0.6));
  const xa = lerp(3, 9.6, walk), xb = xa + (c.line >= 5 ? 2.6 * c.p(5, 1.2) : 0);
  const sp = c.line === 1 ? Math.sin(Math.PI * c.q(1, c.at(2) - c.at(1))) * 0.75 : 0;
  const ya = my(3.5 - sp), yb = my(3.5 + sp);
  if (c.line >= 5 && xb - xa > 0.1) line(g, mx(xa), ya, mx(xb), yb, COL.red, 4, [10, 10]);
  dot(g, mx(xb), yb, 15, B); dot(g, mx(xa), ya, 15, A);
  if (sp < 0.05 && xb - xa < 0.05) dot(g, mx(xa), ya, 15, COL.ink, { ring: Math.floor(c.t * 2) % 2 ? A : B });
  if (c.line === 1) { label(g, '身体 A', mx(xa) + 30, ya, { size: 28, color: A, align: 'left', alpha: sp * 1.3 }); label(g, '身体 B', mx(xb) + 30, yb, { size: 28, color: B, align: 'left', alpha: sp * 1.3 }); }
  if (c.line >= 2 && c.line <= 3) { // one input, two bodies
    const a = Math.min(c.p(2, 0.4), 1 - c.p(4, 0.3));
    for (const [i, k] of [['W', [1, 0]], ['A', [0, 1]], ['S', [1, 1]], ['D', [2, 1]]]) rect(g, 780 + k[0] * 64, 850 - 64 + k[1] * 64 - 40, 56, 56, { stroke: COL.ink, lw: 3, r: 8, alpha: a, fill: i === 'D' ? 'rgba(255,255,255,0.25)' : null }), label(g, i, 808 + k[0] * 64, 850 - 36 + k[1] * 64 - 40, { size: 26, mono: true, alpha: a });
    arrow(g, 840, 800, mx(xa) + 10, my(3.5) + 40, rgba(COL.ink, a * 0.8), 3);
    label(g, '同一份输入', 1000, 850, { size: 26, align: 'left', alpha: a });
  }
  if (c.line >= 4) {
    label(g, 'A：「这里有墙」', mx(10.3), my(0) - 44, { size: 32, color: A, alpha: c.p(4, 0.4) });
    label(g, 'B：「这里没有」', mx(10.3), my(7) + 46, { size: 32, color: B, alpha: c.p(4, 0.4, 1.0) });
  }
  if (c.line >= 5) label(g, '矛盾', mx((xa + xb) / 2), ya - 50, { size: 40, color: COL.red, weight: 700, alpha: c.p(5, 0.4, 0.9) });
}

// ---- DDA through a grid whose cells hold two values ----
const GC = 14, GR = 7, CS = 110, GX = 190, GY = 96;
const cellsA = new Set(['6,3', '6,2', '6,4', '11,1', '11,2', '11,0']), cellsB = new Set(['9,2', '9,1', '11,1', '11,2', '3,5', '3,6']);
function ddaPath() {
  const o = [0.35, 5.55], d = [0.93, -0.37]; const out = [];
  let cx = Math.floor(o[0]), cy = Math.floor(o[1]), t = 0;
  const sx = Math.sign(d[0]), sy = Math.sign(d[1]), dx = Math.abs(1 / d[0]), dy = Math.abs(1 / d[1]);
  let tx = ((sx > 0 ? cx + 1 : cx) - o[0]) / d[0], ty = ((sy > 0 ? cy + 1 : cy) - o[1]) / d[1];
  while (cx >= 0 && cy >= 0 && cx < GC && cy < GR) {
    out.push({ cx, cy, t });
    if (tx < ty) { t = tx; tx += dx; cx += sx; } else { t = ty; ty += dy; cy += sy; }
  }
  out.push({ cx, cy, t });
  return { o, d, steps: out };
}
const DDA = ddaPath();
export function dda(g, c) {
  clearBG(g);
  for (let j = 0; j < GR; j++) for (let i = 0; i < GC; i++) {
    const x = GX + i * CS, y = GY + j * CS, k = `${i},${j}`;
    if (cellsA.has(k)) { g.fillStyle = rgba(A, 0.85); g.beginPath(); g.moveTo(x + 6, y + 6); g.lineTo(x + CS - 10, y + 6); g.lineTo(x + 6, y + CS - 10); g.fill(); }
    if (cellsB.has(k)) { g.fillStyle = rgba(B, 0.85); g.beginPath(); g.moveTo(x + CS - 6, y + CS - 6); g.lineTo(x + 10, y + CS - 6); g.lineTo(x + CS - 6, y + 10); g.fill(); }
    rect(g, x, y, CS, CS, { stroke: COL.faint, lw: 2 });
  }
  // legend
  const lx = 1260, ly = 890;
  if (c.line >= 3) { g.fillStyle = A; g.beginPath(); g.moveTo(lx, ly - 22); g.lineTo(lx + 44, ly - 22); g.lineTo(lx, ly + 22); g.fill(); label(g, 'R = 世界 A', lx + 56, ly - 2, { size: 24, align: 'left', color: A }); g.fillStyle = B; g.beginPath(); g.moveTo(lx + 300, ly + 22); g.lineTo(lx + 256, ly + 22); g.lineTo(lx + 300, ly - 22); g.fill(); label(g, 'G = 世界 B', lx + 312, ly - 2, { size: 24, align: 'left', color: B }); }
  const P = (t) => [GX + (DDA.o[0] + DDA.d[0] * t) * CS, GY + (DDA.o[1] + DDA.d[1] * t) * CS];
  const [ox, oy] = P(0);
  dot(g, ox, oy, 13, COL.ink); label(g, '像素', ox, oy + 40, { size: 24 });
  if (c.line < 1) return;
  const n = DDA.steps.length - 1;
  const prog = c.line < 3 ? clamp((c.t - c.at(1)) / (c.at(3) - c.at(1))) * 0.42 : 0.42 + 0.58 * c.q(3, (c.dur - c.at(3)) * 0.75);
  const kf = prog * n, ki = Math.floor(kf);
  for (let i = 0; i <= Math.min(ki, n - 1); i++) { const s = DDA.steps[i]; rect(g, GX + s.cx * CS + 3, GY + s.cy * CS + 3, CS - 6, CS - 6, { stroke: 'rgba(255,255,255,0.55)', lw: 3 }); }
  const tNow = lerp(DDA.steps[Math.min(ki, n)].t, DDA.steps[Math.min(ki + 1, n)].t, c.smooth(kf - ki));
  const [ex, ey] = P(tNow);
  line(g, ox, oy, ex, ey, COL.yellow, 4);
  let hitA = false, hitB = false;
  for (let i = 1; i <= Math.min(ki, n); i++) {
    const s = DDA.steps[i], [px, py] = P(s.t), k = `${s.cx},${s.cy}`;
    dot(g, px, py, 7, COL.ink);
    if (cellsA.has(k) && !hitA) { hitA = true; dot(g, px, py, 13, A, { ring: A }); label(g, 'A 命中', px, py - 44, { size: 28, color: A, weight: 600 }); }
    if (cellsB.has(k) && !hitB) { hitB = true; dot(g, px, py, 13, B, { ring: B }); label(g, 'B 命中', px, py + 46, { size: 28, color: B, weight: 600 }); }
  }
  dot(g, ex, ey, 9, COL.yellow);
  if (c.line === 2) label(g, '每一步 = 走到最近的格子边界', 960, 60, { size: 30, alpha: c.p(2, 0.4), mono: false });
}

// ---- compositing: attended world solid, the other a ghost ----
export function ghost(g, c) {
  clearBG(g);
  const ey = 520, x0 = 240;
  const toB = c.line >= 2 && c.line < 3 ? 0 : 0; void toB;
  // eye
  g.save(); g.strokeStyle = COL.ink; g.lineWidth = 4; g.beginPath(); g.moveTo(x0 - 50, ey); g.quadraticCurveTo(x0, ey - 44, x0 + 50, ey); g.quadraticCurveTo(x0, ey + 44, x0 - 50, ey); g.stroke(); g.restore();
  dot(g, x0 + 4, ey, 16, COL.ink);
  label(g, '注视：世界 A', x0, ey + 90, { size: 28, color: A, alpha: c.p(0, 0.4) });
  const slab = (x, w, solid, col, name, a) => {
    if (a <= 0) return;
    rect(g, x, ey - 190, w, 380, solid ? { fill: rgba(col, 0.9), alpha: a } : { stroke: col, lw: 4, fill: rgba(col, 0.07), alpha: a });
    label(g, name, x + w / 2, ey - 225, { size: 28, color: col, alpha: a });
  };
  const xs = [900, 1260], both = c.p(4, 0.8);
  slab(xs[1], 90, c.line >= 1, A, c.line >= 1 ? 'A：实心' : 'A', c.p(0, 0.5, 0.3));
  slab(xs[0], 90, false, B, c.line >= 2 ? 'B：轮廓 + 雾' : 'B', c.p(0, 0.5, 0.6));
  if (both > 0) { // a cell both worlds agree on
    const x = lerp(520, 600, both);
    g.save(); g.globalAlpha = both; g.beginPath(); g.rect(x, ey - 190, 90, 380); g.clip();
    for (let i = -6; i < 12; i++) { g.fillStyle = i % 2 ? A : B; g.beginPath(); g.moveTo(x - 100, ey - 190 + i * 44); g.lineTo(x + 200, ey - 190 + i * 44 - 150); g.lineTo(x + 200, ey - 190 + i * 44 - 106); g.lineTo(x - 100, ey - 190 + i * 44 + 44); g.fill(); }
    g.restore(); label(g, 'A 和 B 都有', x + 45, ey - 225, { size: 28, alpha: both });
  }
  // the ray
  if (c.line >= 3) {
    const stop = both > 0.5 ? lerp(520, 600, both) : xs[1];
    const k = c.line === 3 ? c.q(3, 2.2) : 1, xe = lerp(x0 + 60, stop, k);
    line(g, x0 + 60, ey, xe, ey, COL.yellow, 5); dot(g, xe, ey, 9, COL.yellow);
    // accumulator
    const bx = 620, by = 880, bw = 720;
    label(g, '像素颜色 =', bx - 24, by + 22, { size: 30, align: 'right' });
    rect(g, bx, by, bw, 44, { stroke: COL.dim, lw: 2 });
    if (both > 0.5) { rect(g, bx, by, bw, 44, { fill: '#b9b494' }); label(g, '100%', bx + bw / 2, by + 22, { size: 24, color: '#111', mono: true }); }
    else {
      if (xe > xs[0]) { rect(g, bx, by, bw * 0.13, 44, { fill: B }); label(g, '13%', bx + bw * 0.065, by - 22, { size: 24, color: B, mono: true }); dot(g, xs[0], ey, 11, B, { ring: B }); }
      if (xe >= xs[1] - 1) { rect(g, bx + bw * 0.13, by, bw * 0.87, 44, { fill: A }); label(g, '87%', bx + bw * 0.565, by - 22, { size: 24, color: A, mono: true }); }
    }
  }
}

// ---- spring ----
const Fk = (d) => 40 * d * (1 + (d * d) / 2.25);
export function springDia(g, c) {
  clearBG(g);
  const wx = 470, y = 520, sc = 210;
  rect(g, wx, y - 230, 36, 460, { fill: rgba(A, 0.85) }); label(g, 'A 的墙', wx + 18, y - 262, { size: 26, color: A });
  let d = c.line === 0 ? 1.25 * c.p(0, 2.2, 0.3) : c.line < 2 ? 1.25 : 0.95 + 0.62 * Math.sin((c.t - c.at(2)) * 1.5 + 0.5);
  const ax = wx - 34, bx = ax + d * sc;
  if (c.line >= 1) { spring(g, ax, y, bx, y, COL.ink, 8, 16, 4); const f = Fk(d) * 0.55 * c.p(1, 0.5); arrow(g, bx, y - 46, bx - f, y - 46, COL.hot1, 6); arrow(g, ax, y + 46, ax + f, y + 46, COL.hot1, 6); }
  dot(g, ax, y, 18, A); dot(g, bx, y, 18, B);
  label(g, '身体 A', ax, y + 96, { size: 26, color: A }); label(g, '身体 B', bx, y - 96, { size: 26, color: B });
  if (c.line >= 1) { line(g, ax, y + 150, bx, y + 150, COL.dim, 2); label(g, `d = ${d.toFixed(2)}`, (ax + bx) / 2, y + 180, { size: 26, mono: true, color: COL.ink }); }
  if (c.line < 2) return;
  // F(d) plot
  const px = 1050, py = 800, pw = 700, ph = 560, a = c.p(2, 0.5);
  g.save(); g.globalAlpha = a;
  arrow(g, px, py, px + pw + 30, py, COL.dim, 3); arrow(g, px, py, px, py - ph - 30, COL.dim, 3);
  label(g, '距离 d', px + pw, py + 36, { size: 26, color: COL.dim }); label(g, '拉力 F', px - 10, py - ph - 50, { size: 26, color: COL.dim });
  const X = (v) => px + (v / 2) * pw, Y = (f) => py - (f / 240) * ph;
  line(g, X(0), Y(0), X(2), Y(80), COL.dim, 3, [10, 10]); label(g, '普通弹簧', X(2) - 10, Y(80) + 30, { size: 24, color: COL.dim, align: 'right' });
  const stiff = c.p(3, 1.2);
  if (stiff > 0) {
    g.strokeStyle = COL.ink; g.lineWidth = 5; g.beginPath();
    for (let i = 0; i <= 60 * stiff; i++) { const v = (i / 60) * 2; g.lineTo(X(v), Y(Math.min(240, Fk(v)))); if (Fk(v) > 240) break; } g.stroke();
    label(g, '越拉越硬', X(1.5) - 20, Y(200), { size: 26, align: 'right', alpha: stiff });
  }
  const fy = c.line >= 3 ? Fk(d) : 40 * d;
  dot(g, X(d), Y(Math.min(240, fy)), 11, COL.hot1, { ring: COL.hot1 });
  g.restore();
}

// ---- damping: traces come from the real simulation ----
let traces = null;
function getTraces() {
  if (traces) return traces;
  traces = [false, true].map((damping) => {
    const sim = new Sim(new World(), { damping, tunnel: 'off' }); sim.reset(27, 8, 31.5);
    const out = [];
    for (let i = 0; i < 120; i++) { sim.frame({ mx: 1 }, 1 / 30); out.push(sim.split); }
    return out;
  });
  return traces;
}
export function damping(g, c) {
  clearBG(g);
  const tr = getTraces(), px = 330, py = 800, pw = 1260, ph = 520;
  arrow(g, px, py, px + pw + 40, py, COL.dim, 3); arrow(g, px, py, px, py - ph - 40, COL.dim, 3);
  label(g, '时间', px + pw + 10, py + 38, { size: 26, color: COL.dim }); label(g, '两个身体的距离 d', px + 20, py - ph - 60, { size: 26, color: COL.dim, align: 'left' });
  const X = (i) => px + (i / 119) * pw, Y = (d) => py - (d / 1.7) * ph;
  for (const v of [0.5, 1, 1.5]) { line(g, px, Y(v), px + pw, Y(v), COL.faint, 2); label(g, v.toFixed(1), px - 16, Y(v), { size: 22, mono: true, color: COL.dim, align: 'right' }); }
  const draw = (arr, col, k) => { g.save(); g.strokeStyle = col; g.lineWidth = 5; g.lineJoin = 'round'; g.beginPath(); const n = Math.floor(k * 119); for (let i = 0; i <= n; i++) g.lineTo(X(i), Y(arr[i])); g.stroke(); g.restore(); if (n > 0) dot(g, X(n), Y(arr[n]), 8, col); };
  draw(tr[0], COL.hot1, c.q(0, 2.6, 0.3));
  line(g, px + pw - 330, py - ph - 60, px + pw - 280, py - ph - 60, COL.hot1, 5); label(g, '只有弹簧', px + pw - 264, py - ph - 60, { size: 28, color: COL.hot1, align: 'left' });
  if (c.line >= 1) { const a = Math.min(c.p(1, 0.4), 1 - c.p(2, 0.4)); label(g, '存起来 → 还回去 → 存起来 → ……', 960, 150, { size: 32, alpha: a }); }
  if (c.line >= 2) {
    draw(tr[1], COL.green, c.q(2, 2.4, 0.3));
    line(g, px + pw - 330, py - ph - 20, px + pw - 280, py - ph - 20, COL.green, 5); label(g, '弹簧 + 阻尼', px + pw - 264, py - ph - 20, { size: 28, color: COL.green, align: 'left' });
    label(g, 'F  +=  c · (v_B − v_A)', 960, 150, { size: 36, mono: true, alpha: c.p(2, 0.5) });
  }
}

// ---- conflict field ----
export function field(g, c) {
  clearBG(g);
  const wx = 900, y = 520, s = c.line >= 4 ? lerp(0.64, 1.05, c.p(4, 1.5)) : 0.64;
  const ax = wx - 30, bx = wx + 60 + s * 110;
  if (c.line >= 2) { // coarse field grid
    const cs = 64, gx0 = 420, gy0 = 200, nx = 17, ny = 10, a = c.p(2, 0.6);
    const grow = c.line >= 3 ? clamp((c.t - c.at(3)) / 2.5) * (c.line >= 4 ? 1 + c.p(4, 1.5) * 0.6 : 1) : 0;
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const cx = gx0 + (i + 0.5) * cs, cy = gy0 + (j + 0.5) * cs;
      const d1 = Math.hypot(cx - (ax + bx) / 2, cy - y) / 190, d2 = Math.hypot(cx - wx, cy - y) / 150;
      const v = clamp((Math.max(0, 1 - d1 * d1) ** 2 + Math.max(0, 1 - d2 * d2) ** 2 * 0.8) * grow);
      if (v > 0.03) rect(g, gx0 + i * cs, gy0 + j * cs, cs, cs, { fill: rgba(fringeAt(i, j, c.t), v * 0.85) });
      rect(g, gx0 + i * cs, gy0 + j * cs, cs, cs, { stroke: rgba(COL.dim, 0.5 * a), lw: 1.5 });
    }
    label(g, '冲突场  64 × 20 × 32', gx0, gy0 - 34, { size: 28, mono: true, align: 'left', alpha: a });
    if (c.line === 3) for (const [px, r] of [[(ax + bx) / 2, 190], [wx, 150]]) { const k = (c.t * 0.8) % 1; g.save(); g.strokeStyle = rgba(COL.ink, 1 - k); g.lineWidth = 3; g.beginPath(); g.arc(px, y, r * k, 0, 6.283); g.stroke(); g.restore(); }
  }
  rect(g, wx, y - 250, 36, 500, { fill: rgba(A, 0.9) });
  spring(g, ax, y, bx, y, COL.ink, 8, 14, 4);
  dot(g, ax, y, 18, A); dot(g, bx, y, 18, B);
  gauge(g, 1620, 300, 70, 440, s, { sub: `${Math.round(s * 110)} N` });
}

// ---- tunnelling ----
export function tunnel(g, c) {
  clearBG(g);
  const wx = 900, y = 500, wt = 60;
  rect(g, wx, y - 250, wt, 500, { fill: rgba(A, 0.9) }); label(g, '只在 A', wx + wt / 2, y - 282, { size: 26, color: A });
  let ax, bx, s, phased = false, speed = 0;
  if (c.line < 2) { ax = wx - 30; bx = wx + 30 + 0.64 * 110 + Math.sin(c.t * 3) * 3; s = 0.64; }
  else {
    const k = clamp((c.t - c.at(2)) / (c.at(4) - c.at(2) + 0.6)); // the dash, in slow motion
    bx = lerp(520, 1330, k); ax = Math.min(bx, wx - 30); s = clamp((bx - ax) / 240, 0, 1.5); speed = k < 1 ? 1 : 0;
    if (c.line >= 4) phased = true;
    if (c.line >= 5) { const m = c.p(5, 1.0); ax = lerp(wx - 30, bx - 60, m); s = lerp(s, 0.15, m); phased = m < 0.85; speed = 0; }
  }
  if (bx - ax > 6) spring(g, ax, y, bx, y, COL.ink, 8, 14, 4);
  dot(g, bx, y, 18, B);
  if (phased) { dot(g, ax, y, 20, A, { hollow: true }); label(g, '脱相', ax, y + 60, { size: 30, color: A, weight: 600 }); } else dot(g, ax, y, 18, A);
  if (speed) { arrow(g, bx + 30, y, bx + 150, y, COL.yellow, 6); label(g, 'v', bx + 90, y - 30, { size: 28, mono: true, color: COL.yellow }); }
  gauge(g, 1620, 280, 70, 440, s, {});
  const bx0 = 250, by0 = 850;
  if (c.line >= 2) { label(g, '张力 > 阈值', bx0 + 50, by0, { size: 32, align: 'left', alpha: c.p(2, 0.4) }); check(g, bx0, by0, s >= 1 || c.line >= 4 ? c.q(2, 0.4, 0.2) * (s >= 1 || c.line >= 4 ? 1 : 0) : 0); }
  if (c.line >= 3) { label(g, '分离速度 > 5 m/s', bx0 + 480, by0, { size: 32, align: 'left', alpha: c.p(3, 0.4) }); check(g, bx0 + 430, by0, c.q(3, 0.4, 0.3)); }
}

export function states(g, c) {
  clearBG(g);
  const box = (x, y, w, t1, t2, col, a) => { rect(g, x, y, w, 110, { stroke: col, lw: 4, r: 14, fill: rgba(col, 0.08), alpha: a }); label(g, t1, x + w / 2, y + 40, { size: 32, color: col, weight: 600, alpha: a }); label(g, t2, x + w / 2, y + 80, { size: 22, color: COL.ink, alpha: a * 0.8, mono: true }); };
  if (c.line === 0) { // no timers
    const a = 1 - c.p(1, 0.3);
    g.save(); g.globalAlpha = a; g.strokeStyle = COL.ink; g.lineWidth = 6; g.beginPath(); g.arc(960, 480, 110, 0, 6.283); g.moveTo(960, 480); g.lineTo(960, 400); g.moveTo(960, 480); g.lineTo(1010, 500); g.stroke(); g.restore();
    label(g, '0.12 s', 960, 640, { size: 40, mono: true, alpha: a });
    const k = c.p(0, 0.4, 0.6); line(g, 820, 340, 820 + 280 * k, 340 + 280 * k, rgba(COL.red, a), 12);
    return;
  }
  const a1 = c.p(1, 0.5), y = 250;
  box(180, y, 300, '实体', 'SOLID', COL.ink, a1);
  box(810, y, 300, '脱相', 'PHASED', COL.hot1, a1);
  box(1440, y, 300, '实体（对面）', 'THROUGH', COL.green, c.p(1, 0.5, 0.8));
  arrow(g, 490, y + 55, 800, y + 55, rgba(COL.ink, a1), 4); label(g, '张力 > 阈值', 645, y + 22, { size: 22, alpha: a1 }); label(g, '且高速分离', 645, y + 88, { size: 22, alpha: a1 });
  arrow(g, 1120, y + 55, 1430, y + 55, rgba(COL.ink, c.p(1, 0.5, 0.8)), 4); label(g, '离开了实心区域', 1275, y + 22, { size: 22, alpha: c.p(1, 0.5, 0.8) });
  if (c.line >= 2) label(g, '碰撞对象 → 另一个世界', 960, y + 150, { size: 28, color: COL.hot1, alpha: c.p(2, 0.4) });
  if (c.line >= 3) { // the wall grips the body
    const a = c.p(3, 0.5), wx = 760, wy = 560;
    rect(g, wx, wy, 400, 200, { fill: rgba(A, 0.85), alpha: a });
    const jig = Math.sin(c.t * 30) * 2;
    for (let i = 0; i < 9; i++) { line(g, wx + 110 + i * 22 + jig, wy + 70, wx + 120 + i * 22 + jig, wy + 86, rgba('#1b1410', a), 4); line(g, wx + 110 + i * 22 - jig, wy + 130, wx + 120 + i * 22 - jig, wy + 114, rgba('#1b1410', a), 4); }
    const ax = wx + 200 + (c.line >= 4 ? -260 * c.p(4, 0.9, 0.8) : 0);
    dot(g, ax, wy + 100, 20, c.line >= 4 && c.p(4, 0.9, 0.8) > 0.95 ? A : '#1b1410', { hollow: !(c.line >= 4 && c.p(4, 0.9, 0.8) > 0.95), alpha: a });
    const pull = c.line >= 4 ? 1 - c.p(4, 0.6) : 1;
    arrow(g, wx + 420, wy + 100, wx + 420 + 160 * pull + 1, wy + 100, rgba(COL.hot1, a), 6);
    label(g, '摩擦 150 N', wx + 200, wy + 236, { size: 26, alpha: a, mono: true });
    label(g, '拉力', wx + 500, wy + 60, { size: 26, color: COL.hot1, alpha: a * pull });
  }
  if (c.line >= 4) { const a = c.p(4, 0.5); box(180, 600, 300, '吐回入口', 'REJECTED', COL.red, a); arrow(g, 840, 370, 420, 590, rgba(COL.red, a), 4); label(g, '张力 < 90 N', 560, 450, { size: 22, color: COL.red, alpha: a }); }
}

// ---- walking in A, swimming in B ----
export function buoyancy(g, c) {
  clearBG(g);
  const top = 400, bot = 760, xs = [200, 560, 720, 1240, 1400, 1740];
  const wa = c.p(2, 0.8);
  if (wa > 0) { rect(g, xs[1], top, xs[4] - xs[1], bot - top, { fill: rgba(B, 0.22 * wa) }); line(g, xs[1], top, xs[4], top, rgba(B, wa), 4); label(g, 'B：灌满了水', 1320, top + 46, { size: 28, color: B, alpha: wa, align: 'right' }); label(g, 'A：干的', 1320, top - 40, { size: 28, color: A, alpha: wa, align: 'right' }); }
  g.save(); g.strokeStyle = COL.ink; g.lineWidth = 5; g.lineJoin = 'round'; g.beginPath(); g.moveTo(xs[0], top);
  g.lineTo(xs[1], top); for (let i = 1; i <= 4; i++) { g.lineTo(xs[1] + i * 40 - 40, top + i * 90); g.lineTo(xs[1] + i * 40, top + i * 90); }
  g.lineTo(xs[3], bot); for (let i = 1; i <= 4; i++) { g.lineTo(xs[3] + i * 40 - 40, bot - i * 90 + 90); g.lineTo(xs[3] + i * 40 - 40, bot - i * 90); } g.lineTo(xs[5], top); g.stroke(); g.restore();
  const x = 980, rise = c.line >= 4 ? c.p(4, 2.2, 0.4) : 0, wob = c.line >= 5 ? Math.sin(c.t * 2.2) * 6 : 0;
  const ya = bot - 30 - rise * 150 + wob, yb = bot - 30 - rise * 215 + wob * 1.3;
  if (c.line >= 4 && ya - yb > 4) spring(g, x, ya, x, yb, COL.ink, 5, 12, 4);
  if (c.line >= 3) {
    const a = c.p(3, 0.5);
    arrow(g, x - 60, ya, x - 60, ya + 95 * a, A, 6); label(g, '重力', x - 130, ya + 60, { size: 28, color: A, alpha: a });
    arrow(g, x + 60, yb, x + 60, yb - 130 * a, B, 6); label(g, '浮力', x + 130, yb - 80, { size: 28, color: B, alpha: a });
  }
  dot(g, x, ya, 20, A); dot(g, x, yb, 20, B);
  if (ya - yb < 4) dot(g, x, ya, 20, COL.ink);
  if (c.line >= 5) label(g, '近似平衡', x + 250, (ya + yb) / 2, { size: 34, weight: 600, alpha: c.p(5, 0.5) });
}

// ---- reconciliation ----
export function reconcile(g, c) {
  clearBG(g);
  const cs = 130, x0 = 505, strip = (y, wallA, wallB, scar, lab) => {
    for (let i = 0; i < 7; i++) {
      const x = x0 + i * cs, w = i === 3;
      rect(g, x, y, cs, cs / 2, { stroke: rgba(A, 0.7), lw: 2, fill: w ? (scar > 0.5 ? COL.pearl : wallA ? rgba(A, 0.9) : null) : null });
      rect(g, x, y + cs / 2, cs, cs / 2, { stroke: rgba(B, 0.7), lw: 2, fill: w ? (scar > 0.5 ? COL.pearl : wallB ? rgba(B, 0.9) : null) : null });
    }
    label(g, 'A', x0 - 34, y + cs / 4, { size: 28, color: A, mono: true }); label(g, 'B', x0 - 34, y + cs * 0.75, { size: 28, color: B, mono: true });
    label(g, lab, x0 - 80, y + cs / 2, { size: 30, align: 'right' });
  };
  // push: the wall is copied into the other world
  const y1 = 250, fill = c.line >= 4 ? c.q(4, c.at(5) - c.at(4) - 0.5) : 0, done = fill >= 1 ? 1 : 0;
  strip(y1, true, done, done, c.line >= 4 ? '顶住' : '');
  const ax = x0 + 3 * cs - 26, bxx = done ? ax : x0 + 3 * cs + 62 + Math.sin(c.t * 4) * 2;
  if (!done) spring(g, ax, y1 + cs / 4, bxx, y1 + cs * 0.75, COL.ink, 5, 9, 3);
  dot(g, ax, y1 + cs / 4, 15, A); dot(g, bxx, y1 + cs * 0.75, 15, B);
  if (c.line >= 3) {
    const a = c.p(3, 0.4), bw = cs - 16, bx = x0 + 3 * cs + 8, by = y1 + cs + 24;
    rect(g, bx, by, bw, 18, { stroke: COL.dim, lw: 2, alpha: a }); rect(g, bx, by, bw * fill, 18, { fill: done ? COL.pearl : COL.hot1, alpha: a });
    label(g, '应力', bx + bw + 18, by + 9, { size: 24, align: 'left', alpha: a });
  }
  if (c.line >= 5) { check(g, x0 + 7 * cs + 60, y1 + cs / 2, c.q(5, 0.4)); label(g, '一致', x0 + 7 * cs + 100, y1 + cs / 2, { size: 30, align: 'left', color: COL.green, alpha: c.p(5, 0.4) }); }
  if (c.line < 6) return;
  // dash: the wall is erased
  const y2 = 620, k = c.p(6, 1.3, 0.5), gone = k > 0.55 ? 1 : 0;
  g.save(); g.globalAlpha = c.p(6, 0.4);
  strip(y2, !gone, false, 0, '冲过去');
  const px = lerp(x0 + 2 * cs + 40, x0 + 5 * cs, k);
  dot(g, px, y2 + cs / 4, 15, A, { hollow: k > 0.2 && k < 0.8 }); dot(g, lerp(x0 + 3 * cs + 62, x0 + 5 * cs, k), y2 + cs * 0.75, 15, B);
  g.restore();
  if (c.line >= 7) { check(g, x0 + 7 * cs + 60, y2 + cs / 2, c.q(7, 0.4)); label(g, '一致', x0 + 7 * cs + 100, y2 + cs / 2, { size: 30, align: 'left', color: COL.green, alpha: c.p(7, 0.4) }); }
}

// ---- silhouette test used for ink outlines ----
export function outline(g, c) {
  clearBG(g);
  const cs = 190, x0 = 250, y0 = 190;
  const solid = new Set(['0,2', '1,2', '2,2', '3,2', '4,2', '2,1', '3,1']);
  for (let j = 0; j < 3; j++) for (let i = 0; i < 5; i++) rect(g, x0 + i * cs, y0 + j * cs, cs, cs, { fill: solid.has(`${i},${j}`) ? rgba(A, 0.85) : null, stroke: COL.faint, lw: 2 });
  label(g, '侧视图', x0, y0 - 40, { size: 28, color: COL.dim, align: 'left' });
  const fx = x0 + cs, fy = y0 + 2 * cs, tx = 1460;
  line(g, fx, fy, fx + cs, fy, COL.yellow, 9);
  dot(g, tx, 250, 10, COL.yellow); label(g, '正在着色的面', tx + 28, 250, { size: 32, color: COL.yellow, align: 'left' });
  if (c.line >= 1) { const a = c.p(1, 0.4); rect(g, fx - cs + 10, fy + 10, cs - 20, cs - 20, { stroke: COL.green, lw: 6, alpha: a }); rect(g, fx - cs + 10, fy - cs + 10, cs - 20, cs - 20, { stroke: COL.green, lw: 5, dash: [12, 10], alpha: a }); dot(g, tx, 360, 10, COL.green, { alpha: a }); label(g, '旁边实心、斜上方空', tx + 28, 345, { size: 30, color: COL.green, align: 'left', alpha: a }); label(g, '→ 平的，不画线', tx + 28, 390, { size: 30, align: 'left', alpha: a }); }
  if (c.line >= 2) { const a = c.p(2, 0.4); rect(g, fx + cs + 10, fy - cs + 10, cs - 20, cs - 20, { stroke: COL.hot1, lw: 6, alpha: a }); dot(g, fx + cs, fy, 14, '#111', { ring: COL.hot1, alpha: a }); dot(g, tx, 500, 10, COL.hot1, { alpha: a }); label(g, '斜上方有体素', tx + 28, 485, { size: 30, color: COL.hot1, align: 'left', alpha: a }); label(g, '→ 折角，画线', tx + 28, 530, { size: 30, align: 'left', alpha: a }); }
  if (c.line >= 3) { const a = c.p(3, 0.4); dot(g, x0 + 5 * cs, fy, 14, '#111', { ring: B, alpha: a }); rect(g, x0 + 5 * cs + 10, fy + 10, cs - 20, cs - 20, { stroke: B, lw: 5, dash: [12, 10], alpha: a }); dot(g, tx, 640, 10, B, { alpha: a }); label(g, '旁边是空的', tx + 28, 625, { size: 30, color: B, align: 'left', alpha: a }); label(g, '→ 轮廓，画线', tx + 28, 670, { size: 30, align: 'left', alpha: a }); }
}
