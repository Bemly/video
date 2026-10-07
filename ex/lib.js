// 视觉部件库：背景、粒子、数学图形、角色特效、动态字幕
'use strict';

// ── 背景 ──────────────────────────────────────────────────
function bgDots(st, o = {}) {
  const g = o.gap || 48, w = VW(), h = VH(), off = (o.speed || 20) * st.t;
  ctx.save(); ctx.fillStyle = o.col || C.grey;
  for (let x = -w / 2 - g; x < w / 2 + g; x += g) for (let y = -h / 2 - g; y < h / 2 + g; y += g) {
    const xx = x + (off % g), yy = y + ((off * .6) % g);
    const d = Math.hypot(xx, yy) / 900;
    const r = (o.r || 1.6) * (1 + (o.react ?? 1) * 1.8 * st.beat * Math.exp(-d * 2));
    ctx.globalAlpha = (o.alpha ?? .35) * (1 - d * .5);
    ctx.beginPath(); ctx.arc(xx, yy, r, 0, TAU); ctx.fill();
  }
  ctx.restore();
}
function bgPerspGrid(st, o = {}) {
  const hor = o.horizon ?? 60, col = o.col || C.teal, w = VW(), h = VH();
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 1.4;
  const sp = (o.speed || 1) * st.t * 2;
  for (let side of (o.ceiling ? [1, -1] : [1])) {
    for (let i = 0; i < 26; i++) {
      const z = (i + 1 - fract(sp)) / 26; const y = hor * side + side * (h / 2) * Math.pow(z, 2.2);
      ctx.globalAlpha = (o.alpha ?? .55) * z * (1 + st.beat * .6);
      ctx.beginPath(); ctx.moveTo(-w / 2, y); ctx.lineTo(w / 2, y); ctx.stroke();
    }
    for (let k = -20; k <= 20; k++) {
      ctx.globalAlpha = (o.alpha ?? .55) * .7;
      ctx.beginPath(); ctx.moveTo(k * 18, hor * side); ctx.lineTo(k * 160, side * h / 2 + side * 40); ctx.stroke();
    }
  }
  ctx.restore();
}
const GLYPHS = '∑∫∂∞πφ∀∃∈∉⊂∪∩≈≠≤≥√∆∇ℕℤℚℝℂλθΩζ01∅⇒⇔±×÷'.split('');
function mathRain(st, o = {}) {
  const cols = o.cols || 48, w = VW(), h = VH(), cw = w / cols, size = o.size || 22;
  ctx.save(); ctx.font = `${size}px ${FONT_MATH}`; ctx.textAlign = 'center';
  for (let c = 0; c < cols; c++) {
    const sp = 120 + hash(c) * 260, len = 8 + Math.floor(hash(c + 9) * 18);
    const head = ((st.t * sp * (o.speed || 1) + hash(c + 3) * 2000) % (h + len * size)) - h / 2;
    for (let k = 0; k < len; k++) {
      const y = head - k * size; if (y < -h / 2 - 20 || y > h / 2 + 20) continue;
      const g = GLYPHS[Math.floor(hash(c * 31 + k + Math.floor(st.t * 8 + k)) * GLYPHS.length)];
      ctx.globalAlpha = (o.alpha ?? .5) * (1 - k / len) * (k === 0 ? 1.6 : 1);
      ctx.fillStyle = k === 0 ? C.cream : (o.col || C.teal);
      ctx.fillText(g, -w / 2 + (c + .5) * cw, y);
    }
  }
  ctx.restore();
}
function starfield(st, o = {}) {
  const n = o.n || 500, sp = o.speed || 1;
  ctx.save();
  for (let i = 0; i < n; i++) {
    const x0 = (hash(i) - .5) * 2, y0 = (hash(i + 101) - .5) * 2;
    const z = fract(hash(i + 7) - st.t * .12 * sp);
    const f = 1 / (z * 2 + .02), x = x0 * f * 300, y = y0 * f * 300;
    if (Math.abs(x) > VW() / 2 + 50 || Math.abs(y) > VH() / 2 + 50) continue;
    const r = clamp((1 - z) * 3.2, .3, 4) * (o.r || 1);
    ctx.globalAlpha = clamp(1 - z, 0, 1) * (o.alpha ?? .9);
    ctx.fillStyle = i % 7 === 0 ? C.tealL : C.cream;
    if (o.streak) { const f2 = 1 / ((z + .03 * sp) * 2 + .02); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = r;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x0 * f2 * 300, y0 * f2 * 300); ctx.stroke(); }
    else { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
  }
  ctx.restore();
}
function rings(st, o = {}) {
  ctx.save(); ctx.strokeStyle = o.col || C.teal;
  for (let k = 0; k < (o.n || 4); k++) {
    const ph = fract(tBeat(st.t) * (o.rate || 1) - k / (o.n || 4));
    ctx.globalAlpha = (1 - ph) * (o.alpha ?? .6); ctx.lineWidth = (o.w || 3) * (1 - ph) + .5;
    ctx.beginPath(); ctx.arc(o.x || 0, o.y || 0, (o.r0 || 60) + ph * (o.r1 || 900), 0, TAU); ctx.stroke();
  }
  ctx.restore();
}
function hudFrame(st, label = '', o = {}) {
  const w = VW() / 2 - 40, h = VH() / 2 - 34, L = 46;
  ctx.save(); ctx.strokeStyle = o.col || C.cream; ctx.globalAlpha = o.alpha ?? .55; ctx.lineWidth = 2;
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    ctx.beginPath(); ctx.moveTo(sx * w, sy * (h - L)); ctx.lineTo(sx * w, sy * h); ctx.lineTo(sx * (w - L), sy * h); ctx.stroke();
  }
  ctx.restore();
  text(label, -w + 14, -h + 26, 20, o.col || C.tealL, { alpha: .85 });
  text(`t=${st.t.toFixed(2)}s  ♩${Math.floor(st.bt)}`, w - 14, -h + 26, 18, C.grey, { align: 'right', alpha: .8 });
}
function scanBar(st, o = {}) {
  const y = ((st.t * (o.speed || 300)) % (VH() + 200)) - VH() / 2 - 100;
  const g = ctx.createLinearGradient(0, y - 60, 0, y + 6);
  g.addColorStop(0, 'rgba(3,148,141,0)'); g.addColorStop(1, 'rgba(92,199,192,.35)');
  ctx.save(); ctx.fillStyle = g; ctx.fillRect(-VW() / 2, y - 60, VW(), 66); ctx.restore();
}

// ── 动态字幕（原创诗句） ─────────────────────────────────
function lyric(st, s, o = {}) {
  const size = o.size || 54, font = o.font || FONT_MONO, p = o.p ?? 1, out = o.out ?? 0;
  const chars = [...s]; const n = chars.length;
  const ws = chars.map(c => textW(c, size, font)); const total = ws.reduce((a, b) => a + b, 0);
  let x = (o.x || 0) - (o.align === 'left' ? 0 : total / 2);
  chars.forEach((c, i) => {
    const ap = clamp((p * (n + 6) - i) / 6), ao = 1 - clamp((out * (n + 6) - i) / 6);
    const alpha = ap * ao;
    if (alpha > 0) {
      const jy = (1 - easeOut(ap)) * 30 + (o.wave ? Math.sin(st.t * 6 + i * .5) * o.wave : 0);
      const gx = o.glitch ? (hash2(i, Math.floor(st.t * 30)) - .5) * o.glitch * 30 * (hash2(i + 7, Math.floor(st.t * 30)) > .8) : 0;
      const ch = ap < 1 && c !== ' ' && hash2(i, Math.floor(st.t * 40)) > .5 ? GLYPHS[Math.floor(hash2(i, Math.floor(st.t * 40) + 3) * GLYPHS.length)] : c;
      text(ch, x + gx, (o.y || 0) + jy, size, o.col || C.cream, { font, alpha: alpha * (o.alpha ?? 1), glow: o.glow, glowCol: o.glowCol });
    }
    x += ws[i];
  });
}
function caption(st, main, sub, o = {}) {
  const y = o.y ?? VH() / 2 - 120;
  const p = clamp(st.lb / (o.inBeats || 2)), out = clamp((st.lb - (st.len - (o.outBeats || 1))) / (o.outBeats || 1));
  lyric(st, main, { y, size: o.size || 46, p, out, col: o.col || C.cream, glow: 12, glowCol: C.teal, font: o.font });
  if (sub) text(sub, 0, y + 48, 22, C.grey, { align: 'center', font: FONT_ZH, alpha: p * (1 - out) });
}

// ── 角色特效 ──────────────────────────────────────────────
function girlParticles(st, cx, cy, h, f, o = {}) {
  const P_ = ASSET.pts; ctx.save();
  const sz = (o.size || 2.4) * h / 700;
  for (let i = 0; i < P_.length; i += (o.skip || 1)) {
    const q = P_[i]; const m = f(q, i);
    if (!m || m.a <= 0) continue;
    ctx.globalAlpha = m.a ?? 1;
    ctx.fillStyle = m.col || `rgb(${q.r},${q.g},${q.b})`;
    const x = cx + q.x * h + (m.dx || 0), y = cy + q.y * h + (m.dy || 0);
    const s = sz * (m.s ?? 1);
    if (o.round) { ctx.beginPath(); ctx.arc(x, y, s, 0, TAU); ctx.fill(); } else ctx.fillRect(x - s, y - s, 2 * s, 2 * s);
  }
  ctx.restore();
}
function girlRGB(st, x, y, h, amt, o = {}) {
  const ox = amt * 14;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  drawGirl(x - ox, y, h, { sil: 'silRed', alpha: .55 * (o.alpha ?? 1) });
  drawGirl(x + ox, y + amt * 3, h, { sil: 'silTeal', alpha: .7 * (o.alpha ?? 1) });
  ctx.restore();
  drawGirl(x, y, h, { alpha: o.alpha ?? 1 });
}
function girlSlices(st, x, y, h, amt, o = {}) {
  const g = o.src ? ASSET[o.src] : ASSET.girl, w = h * ASSET.girlAspect, n = o.n || 26;
  ctx.save(); ctx.globalAlpha *= o.alpha ?? 1;
  for (let i = 0; i < n; i++) {
    const sy = i / n, sh = 1 / n; const off = (hash2(i, Math.floor(st.t * 18)) - .5) * amt * 160 * (hash2(i + 3, Math.floor(st.t * 18)) > .55);
    ctx.drawImage(g, 0, sy * g.height, g.width, sh * g.height + 1, x - w / 2 + off, y - h / 2 + sy * h, w, sh * h + 1);
  }
  ctx.restore();
}

// ── 数学图形 ──────────────────────────────────────────────
function sierpinski(x, y, s, depth, col, a = 1) {
  ctx.save(); ctx.fillStyle = col; ctx.globalAlpha = a;
  const rec = (ax, ay, bx, by, cx2, cy2, d) => {
    if (d === 0) { ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(cx2, cy2); ctx.closePath(); ctx.fill(); return; }
    const abx = (ax + bx) / 2, aby = (ay + by) / 2, bcx = (bx + cx2) / 2, bcy = (by + cy2) / 2, cax = (cx2 + ax) / 2, cay = (cy2 + ay) / 2;
    rec(ax, ay, abx, aby, cax, cay, d - 1); rec(abx, aby, bx, by, bcx, bcy, d - 1); rec(cax, cay, bcx, bcy, cx2, cy2, d - 1);
  };
  const h = s * Math.sqrt(3) / 2;
  rec(x - s / 2, y + h / 3, x + s / 2, y + h / 3, x, y - 2 * h / 3, depth);
  ctx.restore();
}
function kochPts(level, size) {
  const h = size * Math.sqrt(3) / 2;
  let pts = [[-size / 2, h / 3], [0, -2 * h / 3], [size / 2, h / 3], [-size / 2, h / 3]];
  for (let l = 0; l < level; l++) {
    const np = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[i + 1]; const dx = (bx - ax) / 3, dy = (by - ay) / 3;
      const p1 = [ax + dx, ay + dy], p3 = [ax + 2 * dx, ay + 2 * dy];
      const p2 = [p1[0] + dx * .5 + dy * Math.sqrt(3) / 2, p1[1] - dx * Math.sqrt(3) / 2 + dy * .5];
      np.push([ax, ay], p1, p2, p3);
    }
    np.push(pts[pts.length - 1]); pts = np;
  }
  return pts;
}
const _hil = {};
function hilbertPts(order) {
  if (_hil[order]) return _hil[order];
  const n = 1 << order, pts = [];
  for (let d = 0; d < n * n; d++) {
    let x = 0, y = 0, t = d;
    for (let s = 1; s < n; s *= 2) { const rx = 1 & (t >> 1), ry = 1 & (t ^ rx);
      if (ry === 0) { if (rx === 1) { x = s - 1 - x; y = s - 1 - y; } const tmp = x; x = y; y = tmp; }
      x += s * rx; y += s * ry; t = t >> 2; }
    pts.push([(x + .5) / n - .5, (y + .5) / n - .5]);
  }
  return (_hil[order] = pts);
}
const _drag = {};
function dragonTurns(n) { if (_drag[n]) return _drag[n]; let s = [1]; for (let i = 1; i < n; i++) s = [...s, 1, ...s.slice().reverse().map(v => -v)]; return (_drag[n] = s); }
const PRIME = (() => { const N = 90000, s = new Uint8Array(N + 1).fill(1); s[0] = s[1] = 0; for (let i = 2; i * i <= N; i++) if (s[i]) for (let j = i * i; j <= N; j += i) s[j] = 0; return s; })();
function ulamXY(n) {
  if (n === 1) return [0, 0];
  const k = Math.ceil((Math.sqrt(n) - 1) / 2), t0 = 2 * k + 1, m = t0 * t0, tt = t0 - 1;
  if (n >= m - tt) return [k - (m - n), -k];
  if (n >= m - 2 * tt) return [-k, -k + (m - tt - n)];
  if (n >= m - 3 * tt) return [-k + (m - 2 * tt - n), k];
  return [k, k - (m - 3 * tt - n)];
}
const TESS = (() => { const v = []; for (let i = 0; i < 16; i++) v.push([i & 1 ? 1 : -1, i & 2 ? 1 : -1, i & 4 ? 1 : -1, i & 8 ? 1 : -1]); return v; })();
const TESS_E = (() => { const e = []; for (let i = 0; i < 16; i++) for (let k = 0; k < 4; k++) { const j = i ^ (1 << k); if (j > i) e.push([i, j]); } return e; })();
function rot4(p, a, b, ang) { const q = p.slice(); const c = Math.cos(ang), s = Math.sin(ang); q[a] = p[a] * c - p[b] * s; q[b] = p[a] * s + p[b] * c; return q; }
function epicycle(t, K, scale) {
  const co = ASSET.outline.coef; let x = 0, y = 0; const pts = [[0, 0]];
  for (let i = 0; i < K; i++) { const [f, re, im] = co[i]; const a = TAU * f * t, c = Math.cos(a), s = Math.sin(a);
    x += (re * c - im * s) * scale; y -= (re * s + im * c) * scale; pts.push([x, y]); }
  return pts;
}
function drawWire(edges, P2, col, w = 2, alphaFn) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w;
  for (const [i, j] of edges) { ctx.globalAlpha = alphaFn ? alphaFn(P2[i], P2[j]) : 1; ctx.beginPath(); ctx.moveTo(P2[i][0], P2[i][1]); ctx.lineTo(P2[j][0], P2[j][1]); ctx.stroke(); }
  ctx.restore();
}
function torusKnot(p, q, n, R = 2, r = .8) {
  const pts = []; for (let i = 0; i <= n; i++) { const t = TAU * i / n, rr = R + r * Math.cos(q * t);
    pts.push([rr * Math.cos(p * t), rr * Math.sin(p * t), r * Math.sin(q * t)]); } return pts;
}
function glowLine(pts, col, w, glow, a = 1, close = false) {
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = w; if (glow) { ctx.shadowColor = col; ctx.shadowBlur = glow; }
  polyline(pts, close); ctx.stroke(); ctx.restore();
}
function chibi(x, y, s, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.translate(0, Math.sin(t * 8) * 2);
  ctx.lineWidth = 3; ctx.strokeStyle = C.ink;
  const P2 = (pts, f) => { ctx.beginPath(); pts.forEach(([a, b], i) => i ? ctx.lineTo(a, b) : ctx.moveTo(a, b)); ctx.closePath(); ctx.fillStyle = f; ctx.fill(); ctx.stroke(); };
  ctx.beginPath(); ctx.moveTo(22, 46); ctx.bezierCurveTo(52, 50, 58, 20 + Math.sin(t * 6) * 6, 40, 8); ctx.lineWidth = 8; ctx.stroke(); ctx.strokeStyle = C.teal; ctx.lineWidth = 4; ctx.stroke();
  ctx.lineWidth = 3; ctx.strokeStyle = C.ink;
  P2([[-18, 22], [18, 22], [26, 58], [-26, 58]], C.teal);
  P2([[-10, 22], [10, 22], [0, 42]], C.ink);
  P2([[-29, -20], [-31, -56], [-6, -33]], C.teal);
  P2([[29, -20], [31, -56], [6, -33]], C.ink);
  P2([[-31, -2], [-25, -27], [0, -36], [25, -27], [31, -2], [17, 21], [-17, 21]], C.cream);
  P2([[-27, -24], [2, -37], [-10, -9]], C.teal);
  P2([[2, -37], [28, -24], [16, -6]], C.ink);
  ctx.fillStyle = C.teal; for (const ex of [-10, 10]) { ctx.beginPath(); ctx.moveTo(ex - 5, 0); ctx.lineTo(ex, -6); ctx.lineTo(ex + 5, 0); ctx.lineTo(ex, 6); ctx.fill(); }
  ctx.restore();
}
