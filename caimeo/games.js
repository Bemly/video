// Game logic (same rules as winning-ways) + drawing in the site's style.
'use strict';

const EVENTS = []; // {t, k} for sound design
const LIGHT = [0.80, 0.79, 0.75];

function pick(rng, arr) { return arr[Math.min(arr.length - 1, Math.floor(rng() * arr.length))]; }

// ---------------- Kayles ----------------
const KG = [0];
function kg(n) {
  while (KG.length <= n) {
    const e = KG.length, s = new Set();
    for (const k of [1, 2]) for (let r = 0; r + k <= e; r++) s.add(KG[r] ^ KG[e - r - k]);
    let m = 0; while (s.has(m)) m++; KG.push(m);
  }
  return KG[n];
}
const KAYLES_CHAPTERS = [['1'], ['11'], ['111'], ['1', '11'], ['1', '111'], ['11', '111'], ['101011'], ['1111', '111'], ['11111', '11'], ['111111', '1111'], ['110111', '1011', '1111'], ['111111', '11111', '1111', '111']];

class Kayles {
  constructor(rng, level, o = {}) {
    let rows;
    if (o.rows) rows = o.rows;
    else if (level <= 12) rows = KAYLES_CHAPTERS[level - 1];
    else {
      for (let t = 0; t < 100; t++) {
        rows = Array.from({ length: 2 + Math.floor(rng() * 2) }, () => {
          const n = 4 + Math.floor(rng() * 5);
          let s = ''; for (let i = 0; i < n; i++) s += rng() < 0.2 ? '0' : '1';
          return s;
        });
        const k = new Kayles(rng, 0, { rows });
        if (k.count() >= 7 && k.value() !== 0) break;
      }
    }
    this.rows = rows.map((r) => [...r].map((c) => c === '1'));
    this.player = 0; this.fx = []; this.hl = null;
  }
  count() { return this.rows.flat().filter(Boolean).length; }
  value() {
    let v = 0;
    for (const r of this.rows) { let run = 0; for (const p of r) { if (p) run++; else { v ^= kg(run); run = 0; } } v ^= kg(run); }
    return v;
  }
  moves() {
    const m = [];
    this.rows.forEach((r, ri) => r.forEach((p, i) => {
      if (p) { m.push({ r: ri, i, n: 1 }); if (r[i + 1]) m.push({ r: ri, i, n: 2 }); }
    }));
    return m;
  }
  terminal() { return this.moves().length === 0; }
  valueAfter(m) { const s = this.rows.map((r) => r.slice()); for (let k = 0; k < m.n; k++) this.rows[m.r][m.i + k] = false; const v = this.value(); this.rows = s; return v; }
  ai(rng, smart = 0.9) {
    const ms = this.moves(), good = ms.filter((m) => this.valueAfter(m) === 0);
    return pick(rng, good.length && rng() < smart ? good : ms);
  }
  apply(m, now) {
    for (let k = 0; k < m.n; k++) { this.rows[m.r][m.i + k] = false; this.fx.push({ r: m.r, i: m.i + k, t: now, dir: k === 0 && m.n === 2 ? -1 : 1 }); }
    this.player ^= 1;
  }
  layout(cx, cy) {
    const pitch = 132, sp = 54, n = this.rows.length;
    return (r, i) => [cx + (i - (this.rows[r].length - 1) / 2) * sp, cy + (r - (n - 1) / 2) * pitch + 46];
  }
  pin(R, x, by, ang, a, col = INK) {
    const c = Math.cos(ang), s = Math.sin(ang);
    const P = (dx, dy) => [x + dx * c - dy * s, by + dx * s + dy * c];
    const t = P(0, -84), b = P(0, -22), f = P(0, -8);
    R.shadow(x, by + 1, 16, 3.2, INK, 0.16 * a);
    R.capsule(t[0], t[1], b[0], b[1], 9.5, 1.9, col, a);
    R.ring(f[0], f[1], 6, 1.9, col, a);
  }
  draw(R, now, cx, cy, o = {}) {
    const L = this.layout(cx, cy);
    this.rows.forEach((r, ri) => r.forEach((p, i) => {
      const [x, y] = L(ri, i);
      if (p) {
        const h = o.highlight && o.highlight.some((q) => q.r === ri && q.i === i);
        this.pin(R, x, y, 0, 1, h ? GOLD : INK);
      } else if (!this.fx.some((f) => f.r === ri && f.i === i && now - f.t < 0.9)) R.disc(x, y - 6, 1.8, QUIET, 0.35);
    }));
    for (const f of this.fx) {
      const k = (now - f.t) / 0.9; if (k > 1 || k < 0) continue;
      const [x, y] = L(f.r, f.i);
      const ang = f.dir * easeIn(k * 1.15) * 1.45;
      this.pin(R, x + f.dir * k * 10, y, ang, 1 - ease((k - 0.45) / 0.55), mixc(GOLD, INK, ease(k * 3)));
    }
  }
}

// ---------------- Wythoff ----------------
const PHI = (1 + Math.sqrt(5)) / 2;
const WY_P = new Set(['0,0']);
for (let k = 1; k < 40; k++) { const a = Math.floor(k * PHI), b = a + k; WY_P.add(a + ',' + b); WY_P.add(b + ',' + a); }

class Wythoff {
  constructor(rng, level) {
    this.N = 7 + Math.floor(rng() * 3);
    do { this.x = 2 + Math.floor(rng() * (this.N - 2)); this.y = 2 + Math.floor(rng() * (this.N - 2)); } while (WY_P.has(this.x + ',' + this.y));
    this.player = 0; this.fx = []; this.from = null;
  }
  moves() {
    const m = [];
    for (let k = 1; k <= this.x; k++) m.push([this.x - k, this.y]);
    for (let k = 1; k <= this.y; k++) m.push([this.x, this.y - k]);
    for (let k = 1; k <= Math.min(this.x, this.y); k++) m.push([this.x - k, this.y - k]);
    return m;
  }
  terminal() { return this.x === 0 && this.y === 0; }
  value() { return WY_P.has(this.x + ',' + this.y) ? 0 : 1; }
  ai(rng) {
    const ms = this.moves(), good = ms.filter(([a, b]) => WY_P.has(a + ',' + b));
    if (good.length && rng() < 0.92) return pick(rng, good);
    const small = ms.filter(([a, b]) => Math.max(this.x - a, this.y - b) <= 2);
    return pick(rng, small.length ? small : ms);
  }
  apply(m, now) { this.fx.push({ t: now, x0: this.x, y0: this.y, x1: m[0], y1: m[1] }); this.x = m[0]; this.y = m[1]; this.player ^= 1; }
  draw(R, now, cx, cy) {
    const N = this.N, c = 58, x0 = cx - (N - 1) * c / 2, y0 = cy + (N - 1) * c / 2;
    const P = (x, y) => [x0 + x * c, y0 - y * c];
    for (let i = 0; i < N; i++) {
      R.line(...P(i, 0), ...P(i, N - 1), 1, RULE, 0.12);
      R.line(...P(0, i), ...P(N - 1, i), 1, RULE, 0.12);
    }
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) R.disc(...P(i, j), 1.6, QUIET, 0.35);
    // target corner
    const [tx, ty] = P(0, 0);
    R.ring(tx, ty, 13, 1.4, GOLD, 0.9); R.disc(tx, ty, 2.6, GOLD, 0.9);
    // queen position (animated)
    const f = this.fx[this.fx.length - 1];
    let qx = this.x, qy = this.y, k = 1;
    if (f) { k = ease((now - f.t) / 0.55); qx = lerp(f.x0, f.x1, k); qy = lerp(f.y0, f.y1, k); }
    // rays of reach
    const ra = f ? ease((now - f.t - 0.5) / 0.4) : 1;
    if (!this.terminal()) {
      R.line(...P(this.x, this.y), ...P(0, this.y), 1.2, GOLD, 0.25 * ra);
      R.line(...P(this.x, this.y), ...P(this.x, 0), 1.2, GOLD, 0.25 * ra);
      const m = Math.min(this.x, this.y);
      R.line(...P(this.x, this.y), ...P(this.x - m, this.y - m), 1.2, GOLD, 0.25 * ra);
    }
    for (const g of this.fx) {
      const a = 1 - (now - g.t) / 2.2; if (a <= 0) continue;
      R.line(...P(g.x0, g.y0), ...P(g.x1, g.y1), 1.6, GOLD, 0.6 * a * Math.min(1, (now - g.t) * 3));
      R.ring(...P(g.x0, g.y0), 6, 1.2, QUIET, 0.6 * a);
    }
    const [px, py] = P(qx, qy);
    R.shadow(px + 2, py + 5, 24, 10, INK, 0.15);
    R.disc(px, py, 20, INK, 1);
    R.disc(px, py, 2.8, PAPER, 1);
  }
}

// ---------------- Green Hackenbush ----------------
class Hackenbush {
  constructor(rng, level) {
    for (let tries = 0; tries < 50; tries++) {
      this.nodes = [];
      const k = 3 + Math.floor(rng() * 2), span = 200;
      for (let s = 0; s < k; s++) {
        const x = (s - (k - 1) / 2) * span + (rng() - 0.5) * 30;
        const root = this.add(x, 0, -1);
        this.grow(rng, root, 0, -Math.PI / 2);
      }
      const e = this.nodes.filter((n) => n.p >= 0).length;
      if (e >= 10 && e <= 18 && this.value() !== 0) break;
    }
    this.player = 0; this.fx = [];
  }
  add(x, y, p) { this.nodes.push({ x, y, p, alive: true }); return this.nodes.length - 1; }
  grow(rng, pi, depth, ang) {
    let n;
    if (depth === 0) n = 1;
    else if (depth < 3 && rng() < 0.42) n = 2;
    else if (depth < 4 && rng() < 0.75) n = 1;
    else n = 0;
    for (let c = 0; c < n; c++) {
      const a = ang + (n === 2 ? (c ? 0.5 : -0.5) : (rng() - 0.5) * 0.5);
      const len = 88 * (0.85 + 0.3 * rng());
      const P = this.nodes[pi];
      const ci = this.add(P.x + Math.cos(a) * len, P.y + Math.sin(a) * len, pi);
      this.grow(rng, ci, depth + 1, a * 0.7 + (-Math.PI / 2) * 0.3);
    }
  }
  children(i) { const r = []; this.nodes.forEach((n, j) => { if (n.alive && n.p === i) r.push(j); }); return r; }
  g(i) { return this.children(i).reduce((v, c) => v ^ (this.g(c) + 1), 0); }
  value() { let v = 0; this.nodes.forEach((n, i) => { if (n.p < 0) v ^= this.g(i); }); return v; }
  moves() { const m = []; this.nodes.forEach((n, i) => { if (n.alive && n.p >= 0) m.push(i); }); return m; }
  terminal() { return this.moves().length === 0; }
  subtree(i) { const r = [i]; for (const c of this.children(i)) r.push(...this.subtree(c)); return r; }
  valueAfter(i) { const st = this.subtree(i); st.forEach((j) => (this.nodes[j].alive = false)); const v = this.value(); st.forEach((j) => (this.nodes[j].alive = true)); return v; }
  ai(rng) {
    const ms = this.moves(), good = ms.filter((i) => this.valueAfter(i) === 0);
    return pick(rng, good.length && rng() < 0.9 ? good : ms);
  }
  apply(i, now) {
    const st = this.subtree(i);
    const segs = st.map((j) => { const n = this.nodes[j], p = this.nodes[n.p]; return [p.x, p.y, n.x, n.y]; });
    const cut = this.nodes[i], par = this.nodes[cut.p];
    this.fx.push({ t: now, segs, nodes: st.map((j) => [this.nodes[j].x, this.nodes[j].y]), cut: [(cut.x + par.x) / 2, (cut.y + par.y) / 2] });
    st.forEach((j) => (this.nodes[j].alive = false));
    this.player ^= 1;
  }
  draw(R, now, cx, cy) {
    const gy = cy + 215;
    R.line(cx - 430, gy, cx + 430, gy, 1.2, QUIET, 0.6);
    for (let i = -6; i <= 6; i++) R.line(cx + i * 60 - 6, gy + 4, cx + i * 60 - 16, gy + 16, 1, QUIET, 0.25);
    this.nodes.forEach((n) => {
      if (!n.alive || n.p < 0) return;
      const p = this.nodes[n.p];
      R.line(cx + p.x, gy + p.y, cx + n.x, gy + n.y, 2.4, INK, 1);
    });
    this.nodes.forEach((n) => {
      if (!n.alive) return;
      if (n.p < 0) { R.disc(cx + n.x, gy, 4.5, INK, 1); return; }
      R.disc(cx + n.x, gy + n.y, 5.5, PAPER, 1); R.ring(cx + n.x, gy + n.y, 5.5, 1.6, INK, 1);
    });
    for (const f of this.fx) {
      const k = (now - f.t) / 1.1; if (k < 0 || k > 1) continue;
      const dy = easeIn(k) * 260, a = 1 - ease((k - 0.35) / 0.65), rot = easeIn(k) * 0.25;
      for (const s of f.segs) {
        const ox = f.cut[0], oy = f.cut[1];
        const T = (x, y) => { const dx = x - ox, dyy = y - oy; return [cx + ox + dx * Math.cos(rot) - dyy * Math.sin(rot), gy + oy + dx * Math.sin(rot) + dyy * Math.cos(rot) + dy]; };
        R.line(...T(s[0], s[1]), ...T(s[2], s[3]), 2.4, mixc(GOLD, INK, ease(k * 2)), a);
      }
      const sa = 1 - ease(k * 2.5);
      R.line(cx + f.cut[0] - 14, gy + f.cut[1] + 9, cx + f.cut[0] + 14, gy + f.cut[1] - 9, 2, GOLD, sa);
    }
  }
}

// ---------------- Domineering ----------------
class Domineering {
  constructor(rng, level) {
    this.Rn = 4 + Math.floor(rng() * 3); this.Cn = 4 + Math.floor(rng() * 3);
    this.cells = Array.from({ length: this.Rn }, () => Array(this.Cn).fill(0));
    const holes = Math.floor(rng() * 3);
    for (let h = 0; h < holes; h++) this.cells[Math.floor(rng() * this.Rn)][Math.floor(rng() * this.Cn)] = -1;
    this.placed = []; this.player = 0; this.fx = [];
  }
  movesFor(p) {
    const m = [], C = this.cells;
    for (let r = 0; r < this.Rn; r++) for (let c = 0; c < this.Cn; c++) {
      if (C[r][c]) continue;
      if (p === 0 && r + 1 < this.Rn && !C[r + 1][c]) m.push([r, c]);
      if (p === 1 && c + 1 < this.Cn && !C[r][c + 1]) m.push([r, c]);
    }
    return m;
  }
  moves() { return this.movesFor(this.player); }
  terminal() { return this.moves().length === 0; }
  set(m, p, v) { const [r, c] = m; this.cells[r][c] = v; if (p === 0) this.cells[r + 1][c] = v; else this.cells[r][c + 1] = v; }
  ai(rng) {
    const p = this.player; let best = null, bs = -1e9;
    for (const m of this.moves()) {
      this.set(m, p, 1);
      const s = this.movesFor(p).length - this.movesFor(1 - p).length * 1.2 + rng() * 0.8;
      this.set(m, p, 0);
      if (s > bs) { bs = s; best = m; }
    }
    return best;
  }
  apply(m, now) { this.set(m, this.player, 1); this.placed.push({ m, p: this.player, t: now }); this.player ^= 1; }
  draw(R, now, cx, cy) {
    const s = 66, x0 = cx - (this.Cn - 1) * s / 2, y0 = cy - (this.Rn - 1) * s / 2 + 20;
    for (let r = 0; r < this.Rn; r++) for (let c = 0; c < this.Cn; c++) {
      if (this.cells[r][c] === -1) { R.disc(x0 + c * s, y0 + r * s, 2, QUIET, 0.4); continue; }
      R.box(x0 + c * s, y0 + r * s, s / 2 - 4, s / 2 - 4, 4, RULE, 0.22, { w: 1.1 });
    }
    for (const d of this.placed) {
      const k = easeOut((now - d.t) / 0.45), [r, c] = d.m;
      const x = x0 + c * s + (d.p === 1 ? s / 2 : 0), y = y0 + r * s + (d.p === 0 ? s / 2 : 0);
      const hw = d.p === 1 ? s - 7 : s / 2 - 7, hh = d.p === 0 ? s - 7 : s / 2 - 7;
      const sc = lerp(1.18, 1, k);
      R.shadow(x + 2, y + 4, hw * 1.05, hh * 1.05, INK, 0.08 * k);
      R.box(x, y - (1 - k) * 10, hw * sc, hh * sc, 5, d.p === 0 ? INK : [0.70, 0.70, 0.66], k);
      if (now - d.t < 0.6) R.box(x, y, hw + 5, hh + 5, 7, GOLD, (1 - (now - d.t) / 0.6) * 0.8, { w: 1.4 });
    }
  }
}

// ---------------- Chomp ----------------
const CH_MEMO = new Map();
function chWin(h) {
  const key = h.join(',');
  if (CH_MEMO.has(key)) return CH_MEMO.get(key);
  let w = false;
  for (const m of chMoves(h)) { if (!chWin(chApply(h, m))) { w = true; break; } }
  CH_MEMO.set(key, w); return w;
}
function chMoves(h) { const m = []; h.forEach((H, i) => { for (let j = 0; j < H; j++) if (i || j) m.push([i, j]); }); return m; }
function chApply(h, [i, j]) { return h.map((H, k) => (k >= i ? Math.min(H, j) : H)); }

class Chomp {
  constructor(rng, level) {
    const cols = 4 + Math.floor(rng() * 4), rows = 3 + Math.floor(rng() * 3);
    this.h = Array(cols).fill(rows); this.rows = rows; this.cols = cols;
    this.player = 0; this.fx = []; this.done = false;
  }
  moves() { return chMoves(this.h); }
  terminal() { return this.moves().length === 0; }
  value() { return chWin(this.h) ? 1 : 0; }
  ai(rng) {
    const ms = this.moves(), good = ms.filter((m) => !chWin(chApply(this.h, m)));
    if (good.length && rng() < 0.9) return pick(rng, good);
    const sizes = ms.map((m) => [m, this.h.reduce((s, H) => s + H, 0) - chApply(this.h, m).reduce((s, H) => s + H, 0)]);
    const small = sizes.filter(([, d]) => d <= 3).map(([m]) => m);
    return pick(rng, small.length ? small : ms);
  }
  apply(m, now) {
    const nh = chApply(this.h, m), eaten = [];
    this.h.forEach((H, i) => { for (let j = nh[i]; j < H; j++) eaten.push([i, j]); });
    this.fx.push({ t: now, eaten, m });
    this.h = nh; this.player ^= 1;
  }
  draw(R, now, cx, cy) {
    const s = 64, x0 = cx - (this.cols - 1) * s / 2, y0 = cy + (this.rows - 1) * s / 2 + 10;
    const P = (i, j) => [x0 + i * s, y0 - j * s];
    for (let i = 0; i < this.cols; i++) for (let j = 0; j < this.rows; j++) R.box(...P(i, j), s / 2 - 5, s / 2 - 5, 5, RULE, 0.07, { w: 1 });
    this.h.forEach((H, i) => {
      for (let j = 0; j < H; j++) {
        const [x, y] = P(i, j);
        R.box(x, y, s / 2 - 5, s / 2 - 5, 6, [0.86, 0.84, 0.79], 1);
        R.box(x, y, s / 2 - 5, s / 2 - 5, 6, INK, 0.55, { w: 1.3 });
        if (i === 0 && j === 0) { R.line(x - 9, y - 9, x + 9, y + 9, 1.8, GOLD, 1); R.line(x - 9, y + 9, x + 9, y - 9, 1.8, GOLD, 1); }
      }
    });
    for (const f of this.fx) {
      const k = (now - f.t) / 0.7; if (k < 0 || k > 1) continue;
      for (const [i, j] of f.eaten) {
        const [x, y] = P(i, j), d = Math.hypot(i - f.m[0], j - f.m[1]);
        const kk = clamp01(k * 1.4 - d * 0.08), sc = 1 - easeIn(kk) * 0.7;
        R.box(x, y + easeIn(kk) * 16, (s / 2 - 5) * sc, (s / 2 - 5) * sc, 6, GOLD, (1 - ease(kk)) * 0.85, { w: 1.4 });
      }
    }
  }
}

// ---------------- turn indicator & footer chrome ----------------
function indicator(R, cx, cy, player, o = {}) {
  const a = o.alpha ?? 1, win = o.winner;
  const kind = o.kind || 'dot';
  const ca = (p) => (win !== undefined ? (p === win ? GOLD : QUIET) : (p === player ? INK : QUIET));
  const aa = (p) => (win !== undefined ? (p === win ? 1 : 0.35) : (p === player ? 1 : 0.55)) * a;
  R.line(cx - 18, cy, cx + 18, cy, 1, QUIET, 0.4 * a);
  if (kind === 'domino') {
    R.box(cx - 46, cy, 5, 11, 1.5, ca(0), aa(0));
    R.box(cx + 46, cy, 11, 5, 1.5, ca(1), aa(1), player === 1 && win === undefined ? {} : { w: 1.3 });
  } else {
    if (player === 0 || win === 0) R.disc(cx - 46, cy, 7, ca(0), aa(0)); else R.ring(cx - 46, cy, 7, 1.4, ca(0), aa(0));
    R.diamond(cx + 46, cy, 8.5, 1.4, ca(1), aa(1), player === 1 && win === undefined);
  }
}

function footer(R, W, y, level, a = 1) {
  const x0 = W / 2 - 520, x1 = W / 2 + 520;
  R.line(x0, y, x1, y, 1, RULE, 0.18 * a);
  numeral(R, level, x0 + 4, y + 46, 30, { pad: 2, align: 'left', col: INK, alpha: a * 0.9 });
  // icons: undo, spark, sound, help
  const iy = y + 46, ix = x1 - 170, q = QUIET, al = 0.8 * a;
  R.arc(ix, iy, 9, Math.PI * 1.1, Math.PI * 1.3, 1.3, q, al * 0.6); R.disc(ix - 8.6, iy - 3, 1.6, q, al * 0.6);
  const sx = ix + 55;
  R.line(sx, iy - 11, sx, iy + 11, 1.3, q, al); R.line(sx - 11, iy, sx + 11, iy, 1.3, q, al); R.disc(sx, iy, 2, q, al);
  const ux = sx + 55;
  R.box(ux - 4, iy, 4, 5, 1, q, al, { w: 1.3 }); R.arc(ux + 2, iy, 7, -0.7, 1.4, 1.3, q, al); R.arc(ux + 2, iy, 12, -0.7, 1.4, 1.3, q, al * 0.7);
  const hx = ux + 55;
  R.ring(hx, iy, 10, 1.3, q, al); R.disc(hx, iy + 4, 1.6, q, al); R.arc(hx, iy - 3, 3.4, Math.PI, Math.PI * 1.4, 1.3, q, al);
}
