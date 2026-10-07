// 第一部分：开机 → 构造 → 第一段主歌（第 -2 ~ 128 拍）
'use strict';

// S1 开机：光标与命令
shot(-2, 8, st => {
  fillBG(C.ink);
  const a = clamp((st.t - 0.3) / 2);
  bgDots(st, { alpha: .18 * a, react: .5 });
  const s = '> math.execute (me) ;';
  const p = clamp((st.bt - 1) / 5);
  const shown = typed(s, p);
  const x0 = -380, y0 = -10;
  text(shown.slice(0, 1), x0, y0, 54, C.teal);
  text(shown.slice(1), x0 + textW('>', 54), y0, 54, C.cream, { glow: 8, glowCol: C.teal });
  const cw = textW(shown, 54);
  if (fract(st.t * 1.7) < .55) { ctx.fillStyle = C.cream; ctx.fillRect(x0 + cw + 6, y0 - 26, 26, 52); }
  if (st.bt > 6.2) text('[ enter ]', x0, y0 + 70, 22, C.grey, { alpha: clamp(st.bt - 6.2) });
  st.fx = { scan: .7, grain: .07, ca: .6, vign: .9, bloomAmt: .8, cutAmt: 0 };
});

// S2 启动日志 + 冯·诺依曼序数
shot(8, 16, st => {
  fillBG(C.ink);
  mathRain(st, { alpha: .12, cols: 40 });
  const lines = ['[ ok ] mount axioms ........ ZFC', '[ ok ] ∅ := { }', '[ ok ] 0 := ∅', '[ ok ] 1 := { 0 }', '[ ok ] 2 := { 0, 1 }',
    '[ ok ] 3 := { 0, 1, 2 }', '[ .. ] n+1 := n ∪ { n }', '[ ok ] ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ ⊂ ℂ', '[ ok ] ε > 0 chosen', '[ ok ] spawn process: me'];
  const k = st.lb * 1.6;
  text('> math.execute (me) ;', -860, -420, 30, C.cream);
  lines.forEach((l, i) => {
    const p = clamp(k - i); if (p <= 0) return;
    const y = -360 + i * 48;
    text(typed(l, p * 1.2), -860, y, 28, i === 9 ? C.tealL : (l.includes('..') ? C.grey : C.cream), { alpha: p });
  });
  // 右侧：序数 n 的嵌套圆，持续自转
  const n = clamp(Math.floor(k / 1.6), 0, 5);
  const draw = (cx, cy, r, d, rot) => {
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.strokeStyle = d % 2 ? C.teal : C.cream; ctx.lineWidth = 2.5; ctx.stroke();
    for (let j = 0; j < d; j++) { const a = rot + TAU * j / d; const rr = d === 1 ? 0 : r * .52; draw(cx + rr * Math.cos(a), cy + rr * Math.sin(a), d === 1 ? r * .55 : r * .4, j, rot * -1.3); }
  };
  ctx.save(); ctx.globalAlpha = .95; draw(470, 0, 300 * (1 + st.beat * .03), n, st.t * .4); ctx.restore();
  text(`${n}`, 470, 360, 64, n % 2 ? C.teal : C.cream, { font: FONT_MATH, align: 'center' });
  st.fx = { scan: .5, grain: .06, ca: .4 + st.beat * .8 };
});

// S3 let me ∈ ℝ²：点、坐标轴、网格展开
shot(16, 24, st => {
  fillBG(C.ink);
  const p = st.p;
  const g = easeOut(clamp(st.lb / 5));
  ctx.save(); ctx.strokeStyle = C.teal; ctx.lineWidth = 1;
  for (let i = -20; i <= 20; i++) {
    const L = 1100 * g * clamp(1.3 - Math.abs(i) / 20);
    ctx.globalAlpha = .35 * clamp(1 - Math.abs(i) / 20);
    ctx.beginPath(); ctx.moveTo(i * 60, -L); ctx.lineTo(i * 60, L); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-L, i * 60); ctx.lineTo(L, i * 60); ctx.stroke();
  }
  ctx.globalAlpha = 1; ctx.strokeStyle = C.cream; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(-1000 * g, 0); ctx.lineTo(1000 * g, 0); ctx.moveTo(0, -600 * g); ctx.lineTo(0, 600 * g); ctx.stroke();
  ctx.restore();
  rings(st, { col: C.tealL, r0: 10, r1: 500, alpha: .7 });
  ctx.fillStyle = C.cream; ctx.beginPath(); ctx.arc(0, 0, 9 + 10 * st.beat, 0, TAU); ctx.fill();
  // ε 球
  const eps = 40 + 30 * Math.sin(st.t * 2);
  ctx.setLineDash([6, 8]); ctx.strokeStyle = C.tealL; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, eps, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
  mathText('B_{ε}(me)', eps * .75 + 14, -eps * .75 - 10, 26, C.tealL);
  for (let i = -8; i <= 8; i++) if (i) { text(`${i}`, i * 120, 22, 18, C.grey, { align: 'center', alpha: g }); text(`${-i}`, -18, i * 120, 18, C.grey, { align: 'right', alpha: g }); }
  caption(st, 'let me ∈ ℝ²', '设“我”是平面上的一个点', { inBeats: 2.5 });
  st.fx = { grain: .05, ca: .3 + st.beat * .6, bloomAmt: .7, zoom: 1 + .1 * p };
});

// S4 粒子化的她从网格平面升起
shot(24, 32, st => {
  fillBG(C.ink);
  bgPerspGrid(st, { horizon: 160, alpha: .45, speed: .6 });
  const p = st.p;
  girlParticles(st, 0, -40, 820, (q, i) => {
    const d = clamp((p * 1.35 - (q.y + .5) * .35 - q.h * .25) / .55);
    const e = easeOut(d);
    const sx = (q.h - .5) * 1400, sy = 520 + q.h * 200;
    return { dx: (1 - e) * (sx - q.x * 820), dy: (1 - e) * (sy - q.y * 820 + 40) + Math.sin(st.t * 3 + q.h * 20) * 2 * (1 - e),
             a: clamp(d * 3) * (.65 + .35 * st.beat), s: 1 + (1 - e) * .5 };
  }, { skip: 2, size: 3.2 });
  caption(st, 'construct(me)', '从点开始，构造“我”', { y: 420 });
  st.fx = { grain: .05, ca: .4 + st.beat, bloomAmt: .9, bloomThr: .45 };
});

// S5 三角形如雨落下拼成她
shot(32, 40, st => {
  fillBG(C.ink);
  bgPerspGrid(st, { horizon: 220, alpha: .35, speed: 1.2 });
  mathRain(st, { alpha: .1 });
  const p = st.p;
  drawTris(0, 0, 900, (t, i) => {
    const d = clamp((p * 1.5 - (1 - (t.cy + .5)) * .7 - t.r * .3) / .4);
    const e = easeOut(d);
    if (d <= 0) return { a: 0 };
    const land = d > .98 ? Math.exp(-(p * 1.5 - (1 - (t.cy + .5)) * .7 - t.r * .3 - .4) * 20) : 0;
    return { dy: -(1 - e) * (900 + t.r2 * 600), dx: (1 - e) * (t.r - .5) * 300, rot: (1 - e) * (t.r - .5) * 8, a: clamp(d * 4),
             edge: land > .05 ? C.tealL : null, edgeA: land };
  });
  text(`Δ = ${Math.floor(ASSET.tris.length * clamp(p * 1.25))}`, 820, 470, 24, C.tealL, { align: 'right' });
  st.fx = { grain: .05, ca: .3 + st.beat * .8, bloomAmt: .6 };
});

// S6 低多边形呼吸，边缘随鼓点发光
shot(40, 48, st => {
  fillBG(C.ink);
  rings(st, { col: C.teal, r0: 200, r1: 900, alpha: .35 });
  const zoom = 1 + st.p * .12;
  drawTris(0, 10, 900 * zoom, (t, i) => {
    const r = Math.hypot(t.cx, t.cy);
    const w = Math.sin(r * 18 - st.t * 6) * .5 + .5;
    const kick = st.beat * Math.exp(-r * 3);
    return { dx: t.cx * 60 * kick, dy: t.cy * 60 * kick, s: 1 - .12 * w * st.low, edge: w > .8 ? C.tealL : null, edgeA: (w - .8) * 5 * (.3 + st.beat) };
  }, { stroke: true });
  hudFrame(st, '// triangulate(me)');
  st.fx = { grain: .05, ca: .5 + st.beat * 1.2, bloomAmt: .7 };
});

// S7 原画扫描显现 + 标注
shot(48, 56, st => {
  fillBG(C.ink);
  bgDots(st, { alpha: .25 });
  const sy = clamp(st.lb / 3);
  const H0 = 900;
  drawTris(0, 0, H0, t => ({ a: clamp((t.cy + .5 - sy) * 8) }));
  drawGirl(0, 0, H0, { clipY: sy });
  if (sy < 1) { ctx.fillStyle = C.tealL; ctx.globalAlpha = .8; ctx.fillRect(-350, -450 + sy * H0 - 2, 700, 4); ctx.globalAlpha = 1; }
  const notes = [['ears: 2 × Δ', -110, -380, -520, -330], ['knot: trefoil 3₁', 120, -250, 520, -300], ['eyes ∈ teal', 10, -140, 520, -100],
                 ['tail: C² curve', -380, 60, -620, 120], ['palette = { 3 }', 120, 250, 560, 300]];
  notes.forEach(([s, x, y, lx, ly], i) => {
    const p = clamp(st.lb - 3 - i * .9); if (p <= 0) return;
    ctx.save(); ctx.strokeStyle = C.tealL; ctx.lineWidth = 2; ctx.globalAlpha = p;
    ctx.beginPath(); ctx.arc(x, y, 7, 0, TAU); ctx.stroke();
    const e = easeOut(p); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(lerp(x, lx, e), lerp(y, ly, e)); ctx.stroke(); ctx.restore();
    text(typed(s, p * 1.5), lx + (lx > x ? 12 : -12), ly, 24, C.cream, { align: lx > x ? 'left' : 'right', alpha: p });
  });
  st.fx = { grain: .05, ca: .3 + st.beat * .5, scan: .3 };
});

// S8 标题：Julia 集背景
shot(56, 64, st => {
  const th = st.t * .35;
  st.bg = { mode: 1, a: [0, 0, 1.6 - st.p * .3, 0], b: [.7885 * Math.cos(th), .7885 * Math.sin(th), .045, st.t * .02] };
  ctx.fillStyle = 'rgba(17,16,14,.35)'; ctx.fillRect(-VW() / 2, -VH() / 2, VW(), VH());
  const p = clamp(st.lb / 2);
  lyric(st, 'math.execute (me) ;', { size: 96, p, glitch: st.beat * 2, glow: 24, glowCol: C.teal, y: -20, x: 200 });
  text('一个关于数学的执行过程', 200, 80, 32, C.cream, { font: FONT_ZH, align: 'center', alpha: clamp(st.lb - 2) });
  drawGirl(-700, 80, 700, { alpha: clamp(st.lb - 1) * .9, glow: 30 });
  st.fx = { grain: .05, ca: .6 + st.beat * 1.5, bloomAmt: .9, glitch: st.lb > 7.5 ? .5 : 0, flash: st.lb > 7.7 ? (st.lb - 7.7) * 3 : 0 };
});

// S9 透视数轴：小人奔跑，数越来越密
shot(64, 72, st => {
  fillBG(C.ink);
  starfield(st, { n: 300, alpha: .4 });
  const cam = { yaw: -.5 + st.p * .3, pitch: .35, dist: 7, fov: 1000 };
  const off = st.t * 3.2;
  ctx.save();
  for (let k = -40; k <= 40; k++) {
    const v = Math.floor(off) + k, x = v - off;
    const [px, py, z] = proj([x, 0, 0], cam); if (z < -5) continue;
    const a = clamp(1 - Math.abs(x) / 30);
    ctx.strokeStyle = C.cream; ctx.globalAlpha = a; ctx.lineWidth = 2;
    const [qx, qy] = proj([x, .25, 0], cam); ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(qx, qy); ctx.stroke();
    text(`${v}`, px, py + 26, 22, C.cream, { align: 'center', alpha: a });
    if (st.lb > 3) for (const [nu, de] of [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4]]) {
      const [fx, fy] = proj([x + nu / de, 0, 0], cam); ctx.globalAlpha = a * clamp(st.lb - 3) * .7; ctx.fillStyle = C.tealL;
      ctx.beginPath(); ctx.arc(fx, fy, 3, 0, TAU); ctx.fill();
    }
  }
  const [a0x, a0y] = proj([-40, 0, 0], cam), [a1x, a1y] = proj([40, 0, 0], cam);
  ctx.globalAlpha = 1; ctx.strokeStyle = C.teal; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(a0x, a0y); ctx.lineTo(a1x, a1y); ctx.stroke();
  ctx.restore();
  const [cx, cy] = proj([0, 0, 0], cam);
  chibi(cx, cy - 64 - Math.abs(Math.sin(st.t * 9)) * 14, 1.1, st.t);
  const sets = ['ℕ', 'ℕ ⊂ ℤ', 'ℕ ⊂ ℤ ⊂ ℚ', 'ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ'][Math.min(3, Math.floor(st.lb / 2))];
  text(sets, 0, -380, 64, C.cream, { font: FONT_MATH, align: 'center', glow: 16, glowCol: C.teal });
  st.fx = { grain: .05, ca: .4 + st.beat, bloomAmt: .6 };
});

// S10 埃拉托斯特尼筛法
shot(72, 80, st => {
  fillBG(C.ink);
  const N = 20, cell = 40, x0 = -cell * N / 2 + cell / 2 + 200, y0 = -cell * N / 2 + cell / 2 + 10;
  const primes = [2, 3, 5, 7, 11, 13, 17, 19];
  const k = st.lb;                  // 第 k 拍处理第 k 个质数
  const cur = Math.floor(k);
  const crossed = new Map();
  primes.forEach((p, j) => { if (j > cur) return; const prog = j < cur ? 1 : fract(k);
    for (let m = p * p, c = 0; m <= 400; m += p, c++) { const tt = clamp(prog * 2.2 - c / (400 / p) * 1.2); if (tt > 0 && !crossed.has(m)) crossed.set(m, [j, tt]); } });
  for (let n = 1; n <= 400; n++) {
    const i = (n - 1) % N, j = Math.floor((n - 1) / N), x = x0 + i * cell, y = y0 + j * cell;
    const cr = crossed.get(n);
    const isP = PRIME[n] && !cr;
    const isCur = primes[cur] === n;
    if (isCur) { ctx.fillStyle = C.teal; ctx.globalAlpha = .9; ctx.fillRect(x - cell / 2 + 2, y - cell / 2 + 2, cell - 4, cell - 4); ctx.globalAlpha = 1; }
    const lit = PRIME[n] && primes.indexOf(n) <= cur && primes.indexOf(n) >= 0;
    text(`${n}`, x, y, 16, cr ? C.ink2 : (lit || (isP && k > 7.5) ? C.cream : C.grey), { align: 'center', alpha: cr ? .5 : 1 });
    if (cr) { ctx.strokeStyle = C.red; ctx.globalAlpha = .7; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 14, y + 10); ctx.lineTo(x - 14 + 28 * cr[1], y + 10 - 20 * cr[1]); ctx.stroke(); ctx.globalAlpha = 1; }
    if (isP && k > 7.4) { ctx.strokeStyle = C.tealL; ctx.lineWidth = 2; ctx.globalAlpha = clamp((k - 7.4) * 3) * (.5 + .5 * st.beat); ctx.strokeRect(x - cell / 2 + 3, y - cell / 2 + 3, cell - 6, cell - 6); ctx.globalAlpha = 1; }
  }
  text('sieve(400)', -780, -380, 34, C.tealL);
  text('for p in primes:', -780, -320, 24, C.grey); text('  cross(p², p², …)', -780, -284, 24, C.grey);
  const p = primes[Math.min(cur, 7)];
  text(`p = ${p}`, -780, -180, 80, C.cream, { font: FONT_MATH, glow: 18, glowCol: C.teal });
  text('埃拉托斯特尼筛法', -780, 420, 24, C.grey, { font: FONT_ZH });
  st.fx = { grain: .05, ca: .3 + st.beat * .8 };
});

// S11 乌拉姆螺旋
shot(80, 88, st => {
  fillBG(C.ink);
  const N = Math.floor(lerp(30, 40000, Math.pow(st.p, 1.6)));
  const u = lerp(60, 4.2, Math.pow(st.p, .7));
  ctx.save(); ctx.rotate(st.t * .05);
  if (u > 14) { ctx.strokeStyle = C.grey; ctx.globalAlpha = .45; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let n = 1; n <= Math.min(N, 900); n++) { const [x, y] = ulamXY(n); n === 1 ? ctx.moveTo(x * u, y * u) : ctx.lineTo(x * u, y * u); } ctx.stroke(); }
  ctx.globalAlpha = 1;
  for (let n = 2; n <= N; n++) if (PRIME[n]) {
    const [x, y] = ulamXY(n); const X = x * u, Y = y * u; if (Math.abs(X) > 1100 || Math.abs(Y) > 700) continue;
    const fresh = clamp((N - n) / (N * .05 + 20));
    ctx.fillStyle = fresh < 1 ? C.cream : C.teal; const s = Math.max(1.6, u * .42) * (1 + .5 * st.beat * (n % 7 === 0));
    ctx.fillRect(X - s, Y - s, 2 * s, 2 * s);
    if (u > 22) text(`${n}`, X, Y, 15, C.ink, { align: 'center' });
  }
  ctx.restore();
  hudFrame(st, '// ulam_spiral(ℕ)');
  caption(st, 'primes(ℕ) → diagonals', '质数在对角线上聚集', { y: 430 });
  st.fx = { grain: .05, ca: .3 + st.beat * .8, bloomAmt: .8, bloomThr: .4 };
});

// S12 单位圆与正弦/余弦展开，e^{iπ}+1=0
shot(88, 96, st => {
  fillBG(C.ink);
  bgDots(st, { alpha: .15 });
  const R = 200, cx = -480, cy = -40;
  const th = tBeat(st.t) * TAU / 4;      // 每小节转一圈
  ctx.save(); ctx.strokeStyle = C.grey; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - 280, cy); ctx.lineTo(980, cy); ctx.moveTo(cx, cy - 280); ctx.lineTo(cx, 520); ctx.stroke();
  const px = cx + R * Math.cos(th), py = cy - R * Math.sin(th);
  // sin 波向右展开
  const ws = [], wc = [];
  for (let k = 0; k < 400; k++) { const a = th - k * .03; ws.push([cx + 280 + k * 3.4, cy - R * Math.sin(a)]); wc.push([cx + R * Math.cos(a), cy + 280 + k * 1.2]); }
  glowLine(ws, C.teal, 4, 14); glowLine(wc, C.cream, 3, 8, .7);
  ctx.setLineDash([5, 6]); ctx.strokeStyle = C.tealL; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(cx + 280, py); ctx.moveTo(px, py); ctx.lineTo(px, cy + 280); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = C.cream; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
  ctx.fillStyle = C.tealL; ctx.beginPath(); ctx.arc(px, py, 10 + 6 * st.beat, 0, TAU); ctx.fill();
  ctx.restore();
  mathText('e^{iθ} = cos θ + i sin θ', 260, -380, 44, C.cream, { align: 'center' });
  const near = Math.exp(-Math.pow(((th % TAU) + TAU) % TAU - Math.PI, 2) * 6);
  mathText('e^{iπ} + 1 = 0', 300, 300, 72, C.tealL, { align: 'center', alpha: .25 + .75 * near, glow: 30 * near, glowCol: C.teal });
  st.fx = { grain: .05, ca: .3 + st.beat * .6, bloomAmt: .8 };
});

// S13 黄金螺线：无限自相似放大（缩放 φ、旋转 90° 后与自身重合）
const FIB_TILES = (() => {
  const F = [1, 1]; while (F.length < 26) F.push(F[F.length - 1] + F[F.length - 2]);
  let x0 = 0, y0 = 0, x1 = 1, y1 = 1; const out = [{ x: 0, y: 0, s: 1, cx: 1, cy: 1, a0: Math.PI }];
  const dirs = ['R', 'U', 'L', 'D'];
  for (let i = 1; i < F.length; i++) {
    const f = F[i], d = dirs[(i - 1) % 4]; let bx, by, cx, cy, a0;
    if (d === 'R') { bx = x1; by = y0; cx = x1; cy = y0 + f; a0 = -Math.PI / 2; }
    else if (d === 'U') { bx = x1 - f; by = y1; cx = x1 - f; cy = y1; a0 = 0; }
    else if (d === 'L') { bx = x0 - f; by = y1 - f; cx = x0; cy = y1 - f; a0 = Math.PI / 2; }
    else { bx = x0; by = y0 - f; cx = x0 + f; cy = y0; a0 = Math.PI; }
    out.push({ x: bx, y: by, s: f, cx, cy, a0 });
    x0 = Math.min(x0, bx); y0 = Math.min(y0, by); x1 = Math.max(x1, bx + f); y1 = Math.max(y1, by + f);
  }
  // 极点：相似变换 c_{k+1}-P = λ (c_k-P)，λ = φ·i
  const k = 22, c = i => [out[i].x + out[i].s / 2, out[i].y + out[i].s / 2];
  const phi = (1 + Math.sqrt(5)) / 2, [ax, ay] = c(k), [bx2, by2] = c(k + 1);
  // λ = φ i : (bx + i by) - λ(ax + i ay) = P (1 - λ)
  const lr = 0, li = phi; const nr = bx2 - (lr * ax - li * ay), ni = by2 - (lr * ay + li * ax);
  const dr = 1 - lr, di = -li, dd = dr * dr + di * di;
  out.pole = [(nr * dr + ni * di) / dd, (ni * dr - nr * di) / dd];
  return out;
})();
shot(96, 104, st => {
  fillBG(C.ink);
  const phi = (1 + Math.sqrt(5)) / 2;
  const z = st.lb / 2;                       // 每两拍：缩小 φ 倍、转 90°
  const base = 300 / Math.pow(phi, 12);
  const sc = base * Math.pow(phi, -fract(z)) * Math.pow(phi, 0);
  const [px, py] = FIB_TILES.pole;
  ctx.save(); ctx.rotate(-fract(z) * Math.PI / 2 + st.t * 0);
  for (let i = 4; i < FIB_TILES.length; i++) {
    const q = FIB_TILES[i]; const s = q.s * sc; if (s < 2 || s > 6000) continue;
    const X = (q.x - px) * sc, Y = -(q.y + q.s - py) * sc;
    ctx.fillStyle = [C.teal, C.ink2, C.tealD, '#0B3B39'][i % 4]; ctx.globalAlpha = .9; ctx.fillRect(X, Y, s, s);
    ctx.globalAlpha = 1; ctx.strokeStyle = C.cream; ctx.lineWidth = 1.5; ctx.strokeRect(X, Y, s, s);
    ctx.beginPath(); ctx.arc((q.cx - px) * sc, -(q.cy - py) * sc, s, -q.a0 - Math.PI / 2, -q.a0, false);
    ctx.lineWidth = 4; ctx.shadowColor = C.cream; ctx.shadowBlur = 12; ctx.stroke(); ctx.shadowBlur = 0;
    if (s > 60) text(`${q.s}`, X + s / 2, Y + s / 2, Math.min(80, s * .3), C.cream, { align: 'center', alpha: .7, font: FONT_MATH });
  }
  ctx.restore();
  const bx = 0, by = 0;
  ctx.fillStyle = 'rgba(17,16,14,.6)'; ctx.fillRect(-560, 380, 1120, 70);
  mathText('φ = (1 + √5) / 2 ≈ 1.6180339…', 0, 415, 40, C.cream, { align: 'center', glow: 12, glowCol: C.teal });
  hudFrame(st, '// golden(φ)');
  st.fx = { grain: .05, ca: .3 + st.beat * .6, bloomAmt: .6 };
});

// S14 向日葵叶序
shot(104, 112, st => {
  fillBG(C.ink);
  drawGirl(0, 20, 900, { sil: 'silTeal', alpha: .12 });
  const ga = Math.PI * (3 - Math.sqrt(5));
  const n = Math.floor(lerp(50, 1600, easeOut(st.p * 1.2)));
  ctx.save(); ctx.rotate(st.t * .25);
  for (let i = 1; i < n; i++) {
    const r = 12 * Math.sqrt(i) * (1 + .04 * st.beat), a = i * ga;
    const fresh = clamp((n - i) / 60);
    const s = (2 + 5 * Math.sqrt(i / 1600)) * (fresh < 1 ? 1.6 - .6 * fresh : 1);
    ctx.fillStyle = i % 21 === 0 ? C.cream : i % 13 === 0 ? C.tealL : C.teal;
    ctx.globalAlpha = .4 + .6 * fresh;
    ctx.beginPath(); ctx.arc(r * Math.cos(a), r * Math.sin(a), s, 0, TAU); ctx.fill();
  }
  ctx.restore();
  mathText('137.5° = 360° / φ^{2}', -800, -400, 40, C.cream);
  caption(st, 'every seed turns by φ', '每一粒种子，转过同一个黄金角', { y: 440 });
  st.fx = { grain: .05, ca: .3 + st.beat * .6, bloomAmt: .9, bloomThr: .4 };
});

// S15 谐振图：比值逐拍变化的利萨如曲线
shot(112, 120, st => {
  fillBG(C.ink);
  const ratios = [[3, 2], [5, 4], [4, 3], [5, 3], [7, 4], [6, 5], [7, 6], [9, 8]];
  const k = Math.min(7, Math.floor(st.lb)), f = fract(st.lb);
  const [a, b] = ratios[k];
  const pts = []; const dl = st.t * .9;
  const M = 900;
  for (let i = 0; i < M; i++) { const s = i / M * TAU * Math.max(a, b);
    const decay = Math.exp(-i / M * 1.2);
    pts.push([480 * Math.sin(a * s + dl) * decay, 360 * Math.sin(b * s) * decay]); }
  const n = Math.floor(M * easeOut(f * 1.3));
  glowLine(pts.slice(0, Math.max(2, n)), C.tealL, 3, 18);
  glowLine(pts.slice(0, Math.max(2, n)), C.cream, 1.2, 0, .8);
  text(`${a} : ${b}`, 0, 0, 120, C.cream, { font: FONT_MATH, align: 'center', alpha: .15 + .2 * st.beat });
  mathText('x = sin(at + δ),  y = sin(bt)', -820, -400, 34, C.grey);
  st.fx = { grain: .05, ca: .4 + st.beat, bloomAmt: 1, bloomThr: .35 };
});

// S16 蓄力：玫瑰线 r = cos(kθ) 越转越快，最后频闪
shot(120, 128, st => {
  fillBG(C.ink);
  const speed = st.lb < 4 ? 1 : st.lb < 6 ? 2 : 4;
  const k = 2 + Math.floor(st.lb * speed) % 9;
  const pts = []; for (let i = 0; i <= 1600; i++) { const th = i / 1600 * TAU; const r = 380 * Math.cos(k * th);
    pts.push([r * Math.cos(th), r * Math.sin(th)]); }
  ctx.save(); ctx.rotate(st.t * speed * .4);
  glowLine(pts, C.teal, 5, 30); glowLine(pts, C.cream, 2, 0);
  ctx.restore();
  rings(st, { rate: speed, col: C.tealL, alpha: .5 });
  mathText(`r = cos(${k}θ)`, 0, 430, 48, C.cream, { align: 'center' });
  const strobe = st.lb > 7 ? (fract(st.lb * 4) < .5 ? .6 : 0) : 0;
  st.fx = { grain: .06, ca: .5 + st.beat * 2, bloomAmt: 1.1, zoom: 1 + st.p * .25, flash: strobe + (st.lb > 7.75 ? (st.lb - 7.75) * 4 : 0) };
});
