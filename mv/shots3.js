// 第三部分：分形 → 吸引子 → 傅里叶 → 溜冰 → 蓄力（第 224 ~ 352 拍）
'use strict';

// F1 谢尔宾斯基无限放大（每 2 拍放大 2 倍，绕左下顶点）
shot(224, 232, st => {
  fillBG(C.ink);
  const z = fract(st.lb / 2), s = 1700 * Math.pow(2, z);
  const ax = -760, ay = 420;                          // 左下顶点固定在屏幕上
  const h = s * Math.sqrt(3) / 2;
  const cols = [C.teal, C.tealL, C.cream];
  sierpinski(ax + s / 2, ay - h / 3, s, 8, cols[Math.floor(st.lb / 2) % 3], 1);
  text('S = ⋃ f_i(S)', 600, -420, 44, C.cream, { font: FONT_MATH });
  mathText('dim = log 3 / log 2 ≈ 1.585', 600, -360, 30, C.grey);
  st.fx = { ca: .4 + st.beat, bloomAmt: .6, flash: st.lb < .6 ? (1 - st.lb / .6) * .9 : 0, flashCol: [1, 1, 1], cutAmt: 0 };
});

// F2 科赫曲线：绕端点每 2 拍放大 3 倍
const KOCH7 = (() => { let pts = [[0, 0], [1, 0]];
  for (let l = 0; l < 7; l++) { const np = [];
    for (let i = 0; i < pts.length - 1; i++) { const [ax, ay] = pts[i], [bx, by] = pts[i + 1]; const dx = (bx - ax) / 3, dy = (by - ay) / 3;
      np.push([ax, ay], [ax + dx, ay + dy], [ax + dx * 1.5 - dy * Math.sqrt(3) / 2, ay + dy * 1.5 + dx * Math.sqrt(3) / 2], [ax + 2 * dx, ay + 2 * dy]); }
    np.push(pts[pts.length - 1]); pts = np; } return pts; })();
shot(232, 240, st => {
  fillBG(C.ink);
  const z = fract(st.lb / 2), s = 1900 * Math.pow(3, z);
  const ox = -880, oy = 300;
  const pts = KOCH7.map(([x, y]) => [ox + x * s, oy - y * s]);
  ctx.save(); ctx.beginPath(); ctx.moveTo(ox, oy + 400); pts.forEach(p => ctx.lineTo(p[0], p[1])); ctx.lineTo(pts[pts.length - 1][0], oy + 400); ctx.closePath();
  const g = ctx.createLinearGradient(0, -400, 0, 500); g.addColorStop(0, C.tealD); g.addColorStop(1, C.ink); ctx.fillStyle = g; ctx.fill(); ctx.restore();
  glowLine(pts, C.cream, 2.5, 12);
  chibi(ox + 1900 * Math.pow(3, z) * .5 + 0, oy - Math.sqrt(3) / 6 * s - 60, .9, st.t);
  mathText('L_{n} = (4/3)^{n} → ∞', 560, -420, 40, C.cream);
  mathText('dim = log 4 / log 3 ≈ 1.262', 560, -360, 30, C.grey);
  st.fx = { ca: .4 + st.beat, bloomAmt: .6 };
});

// F3 巴恩斯利蕨
shot(240, 248, st => {
  fillBG(C.ink);
  const F = ASSET.fern, n = Math.floor(lerp(2000, F.length, easeOut(st.p * 1.1)));
  ctx.save(); ctx.translate(120, 470); const sway = Math.sin(st.t * 1.5) * .04;
  for (let i = 0; i < n; i++) {
    const [x, y] = F[i]; const yy = y / 10;
    const X = (x + sway * y * y * .15) * 88, Y = -y * 88;
    ctx.fillStyle = i > n - 400 ? C.cream : (y > 7 ? C.tealL : C.teal);
    ctx.fillRect(X, Y, 1.6, 1.6);
  }
  ctx.restore();
  drawGirl(-520, 140, 640, { alpha: .9 });
  text('4 affine maps,', 560, -420, 34, C.cream); text('one fern.', 560, -370, 34, C.cream);
  mathText('x′ = A_{i}x + b_{i}', 560, -300, 30, C.grey);
  st.fx = { ca: .3 + st.beat, bloomAmt: .6, bloomThr: .5 };
});

// F4/F5 曼德博集合缩放
const MZ = [-0.743643887037151, 0.131825904205330];
function mandelShot(a, b, w0, w1) {
  shot(a, b, st => {
    const w = w0 * Math.pow(w1 / w0, st.p);
    st.bg = { mode: 2, a: [MZ[0], MZ[1], w, 0], b: [0, 0, 1.9, -.12 + st.t * .01] };
    ctx.fillStyle = 'rgba(17,16,14,.55)'; ctx.fillRect(-VW() / 2, 380, VW(), 120);
    mathText('z ← z^{2} + c', -560, 440, 44, C.cream, { align: 'center' });
    text(`zoom × ${Math.round(2.6 / w).toLocaleString('en')}`, 560, 440, 30, C.tealL, { align: 'center' });
    st.fx = { ca: .3 + st.beat * .8, bloomAmt: .3, zoom: 1 + st.beat * .02 };
  });
}
mandelShot(248, 256, 2.6, .03);
mandelShot(256, 264, .03, .00025);

// F6 牛顿分形
shot(264, 272, st => {
  st.bg = { mode: 5, a: [0, 0, 2.4 - st.p * .8, 0], b: [st.t * .4, 0, 0, 0] };
  girlRGB(st, 520, 60, 640, .5 + st.beat * 2, { alpha: .95 });
  mathText('z ← z − f(z) / f′(z)', -560, -420, 46, C.cream, { align: 'center', glow: 14, glowCol: C.ink });
  mathText('f(z) = z^{3} − 1', -560, -350, 34, C.cream, { align: 'center' });
  st.fx = { ca: .5 + st.beat * 1.5, bloomAmt: .3 };
});

// F7 Clifford 吸引子：尘埃在几组参数间变形
shot(272, 280, st => {
  fillBG(C.ink);
  const k = Math.floor(st.lb / 2) % 4, f = smooth(fract(st.lb / 2) * 2 - .6);
  const A = ASSET.clifford[k], B = ASSET.clifford[(k + 1) % 4];
  ctx.save(); ctx.rotate(st.t * .1); ctx.globalAlpha = .55;
  for (let i = 0; i < 70000; i += 1) {
    const x = lerp(A[2 * i], B[2 * i], f), y = lerp(A[2 * i + 1], B[2 * i + 1], f);
    ctx.fillStyle = i % 9 === 0 ? C.cream : (i % 2 ? C.teal : C.tealL);
    ctx.fillRect(x * 190, y * 190, 1.3, 1.3);
  }
  ctx.restore();
  mathText('x′ = sin(a y) + c cos(a x)', -900, -440, 28, C.grey);
  mathText('y′ = sin(b x) + d cos(b y)', -900, -400, 28, C.grey);
  st.fx = { ca: .4 + st.beat, bloomAmt: .9, bloomThr: .35, zoom: 1 + st.beat * .03 };
});

// F8 高尔顿板：钟形曲线
shot(280, 288, st => {
  fillBG(C.ink);
  const rows = 12, dx = 48, dy = 40, top = -440;
  ctx.fillStyle = C.grey;
  for (let r = 0; r < rows; r++) for (let c = 0; c <= r; c++) { ctx.beginPath(); ctx.arc((c - r / 2) * dx, top + 60 + r * dy, 4, 0, TAU); ctx.fill(); }
  const N = 900, dur = 2.2;                // 每球下落时长（秒）
  const bins = new Array(rows + 1).fill(0);
  const tt = st.lt;
  for (let i = 0; i < N; i++) {
    const t0 = i * (8 * P - dur) / N; const u = (tt - t0) / dur; if (u < 0) continue;
    let k = 0; const path = []; for (let r = 0; r < rows; r++) { path.push(k); if (hash2(i, r) > .5) k++; }
    if (u >= 1) { bins[k]++; continue; }
    const fr = u * rows, r = Math.floor(fr), f = fr - r;
    const k0 = path[r], k1 = r + 1 < rows ? path[r + 1] : k;
    const x = lerp((k0 - r / 2) * dx, (k1 - (r + 1) / 2) * dx, f), y = top + 60 + fr * dy - 12 - Math.sin(f * Math.PI) * 14;
    ctx.fillStyle = C.cream; ctx.beginPath(); ctx.arc(x, y, 5, 0, TAU); ctx.fill();
  }
  for (let k = 0; k <= rows; k++) {
    const x = (k - rows / 2) * dx; const h = bins[k] * 2.0;
    ctx.fillStyle = C.teal; ctx.fillRect(x - dx / 2 + 3, 460 - h, dx - 6, h);
  }
  const pts = []; for (let x = -rows / 2 - .5; x <= rows / 2 + .5; x += .05) { const sd = Math.sqrt(rows) / 2;
    pts.push([x * dx, 460 - N * 2.0 * Math.exp(-x * x / (2 * sd * sd)) / (sd * Math.sqrt(TAU)) * clamp(st.p * 1.3)]); }
  glowLine(pts, C.tealL, 3, 12);
  mathText('N(μ, σ^{2})', 640, -300, 50, C.cream);
  text('randomness, summed, becomes shape', 640, -230, 22, C.grey, { align: 'center' });
  st.fx = { ca: .3 + st.beat, bloomAmt: .5 };
});

// E1 原画 → 轮廓
shot(288, 296, st => {
  fillBG(C.ink);
  const ol = ASSET.outline.outline, s = 450;
  const sweep = clamp(st.lb / 4);
  drawGirl(0, 0, 900, { alpha: 1 - clamp((st.lb - 4) / 2) });
  const n = Math.floor(ol.length * sweep);
  glowLine(ol.slice(0, Math.max(2, n)).map(([x, y]) => [x * s, -y * s]), C.tealL, 4, 20);
  if (st.lb > 5) { const K = 8, tt = fract((st.lt - beatT(5) + beatT(0)) * .0 + (st.lb - 5) / 3);
    const ch = epicycle(clamp(tt), K, s);
    ctx.strokeStyle = C.cream; ctx.lineWidth = 2; ctx.globalAlpha = .8; polyline(ch); ctx.stroke(); ctx.globalAlpha = 1; }
  text('outline(me) : S¹ → ℂ', -900, -440, 28, C.tealL);
  st.fx = { ca: .3 + st.beat, bloomAmt: .6 };
});

// E2/E3 本轮：傅里叶级数画出她
function epiShot(a, b, K, label) {
  shot(a, b, st => {
    fillBG(C.ink);
    const s = 450, tt = clamp(st.p * 1.08);
    // 背景：系数谱
    const co = ASSET.outline.coef;
    ctx.save(); ctx.globalAlpha = .25;
    for (let i = 0; i < 120; i++) { const m = Math.hypot(co[i][1], co[i][2]); const h = Math.min(400, Math.sqrt(m) * 900) * (1 + st.beat * .3);
      ctx.fillStyle = i < K ? C.teal : C.ink2; ctx.fillRect(-900 + i * 15, 470 - h, 10, h); }
    ctx.restore();
    // 轨迹
    const M = 900, tr = [];
    for (let i = 0; i <= M * tt; i++) { const p = epicycle(i / M, K, s); tr.push(p[p.length - 1]); }
    glowLine(tr, C.tealL, 3.5, 16);
    const ch = epicycle(tt, K, s);
    ctx.save(); ctx.strokeStyle = C.cream; ctx.lineWidth = 1.2;
    for (let i = 1; i < Math.min(ch.length, 90); i++) { const r = Math.hypot(ch[i][0] - ch[i - 1][0], ch[i][1] - ch[i - 1][1]);
      ctx.globalAlpha = .25; ctx.beginPath(); ctx.arc(ch[i - 1][0], ch[i - 1][1], r, 0, TAU); ctx.stroke(); }
    ctx.globalAlpha = .9; polyline(ch.slice(0, 90)); ctx.stroke(); ctx.restore();
    const hd = ch[ch.length - 1]; ctx.fillStyle = C.cream; ctx.beginPath(); ctx.arc(hd[0], hd[1], 7, 0, TAU); ctx.fill();
    mathText('me(t) = Σ c_{n} e^{2πint}', -900, -440, 38, C.cream);
    text(`${label}   K = ${K}`, -900, -385, 24, C.tealL);
    if (st.p > .92) drawGirl(0, 0, 900, { alpha: (st.p - .92) / .08 * .9 });
    st.fx = { ca: .3 + st.beat, bloomAmt: .7, bloomThr: .45 };
  });
}
epiShot(296, 304, 40, 'top-K |c_n|');
epiShot(304, 312, 320, 'top-K |c_n|');

// E4 方波的傅里叶合成（吉布斯现象）
shot(312, 320, st => {
  fillBG(C.ink);
  const nH = 1 + Math.floor(st.lb * 2);        // 每半拍多一个奇次谐波
  const W0 = 1700, A0 = 260, ph = st.t * 2;
  ctx.save();
  for (let k = 1; k <= nH; k++) {               // 各分量（淡）
    const n = 2 * k - 1, pts = [];
    for (let x = -W0 / 2; x <= W0 / 2; x += 6) pts.push([x, -200 + 120 * (k - 1) / nH * 0 - (4 / Math.PI) * A0 / n * .35 * Math.sin(n * (x / 200 + ph))]);
    ctx.globalAlpha = .25; ctx.strokeStyle = C.teal; ctx.lineWidth = 1.5; polyline(pts); ctx.stroke();
  }
  const sum = []; for (let x = -W0 / 2; x <= W0 / 2; x += 3) { let y = 0; for (let k = 1; k <= nH; k++) { const n = 2 * k - 1; y += Math.sin(n * (x / 200 + ph)) / n; }
    sum.push([x, 180 - (4 / Math.PI) * A0 * y]); }
  ctx.restore();
  glowLine(sum, C.cream, 3, 18);
  mathText('sq(x) = (4/π) Σ_{k=1}^{' + nH + '} sin((2k−1)x)/(2k−1)', 0, -420, 38, C.cream, { align: 'center' });
  text('Gibbs ≈ 9%', 720, 420, 26, C.tealL);
  st.fx = { ca: .3 + st.beat, bloomAmt: .7 };
});

// K1/K2 溜冰：奶白色的“冰面”坐标平面，她沿曲线滑行
function skate(st, curve, label, formula) {
  fillBG(C.cream);
  ctx.save(); ctx.strokeStyle = 'rgba(17,16,14,.12)'; ctx.lineWidth = 1;
  for (let i = -20; i <= 20; i++) { ctx.beginPath(); ctx.moveTo(i * 60, -600); ctx.lineTo(i * 60, 600); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-1100, i * 60); ctx.lineTo(1100, i * 60); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(17,16,14,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-1100, 0); ctx.lineTo(1100, 0); ctx.moveTo(0, -600); ctx.lineTo(0, 600); ctx.stroke();
  ctx.restore();
  const u = st.lt * .55;
  const full = []; for (let i = 0; i <= 600; i++) full.push(curve(i / 600 * TAU));
  ctx.save(); ctx.setLineDash([4, 10]); ctx.strokeStyle = 'rgba(3,148,141,.45)'; ctx.lineWidth = 2; polyline(full); ctx.stroke(); ctx.restore();
  // 冰刀划痕（已滑过的部分）
  const trail = []; for (let i = 0; i <= 240; i++) trail.push(curve(u - i * .01));
  glowLine(trail, C.teal, 5, 0, .9);
  // 残影
  for (let k = 6; k >= 1; k--) { const [x, y] = curve(u - k * .09); drawGirl(x, y - 150, 300, { sil: 'silTeal', alpha: .12 * (7 - k) / 6 }); }
  const [x, y] = curve(u), [x2, y2] = curve(u + .01);
  const lean = Math.atan2(y2 - y, x2 - x) * .15;
  drawGirl(x, y - 150, 300, { rot: lean, flip: x2 < x });
  // 冰屑
  for (let i = 0; i < 18; i++) { const q = i * .02 + fract(st.t * 2) * .02; const [px, py] = curve(u - q);
    ctx.fillStyle = C.ink; ctx.globalAlpha = .3 * (1 - i / 18); ctx.beginPath(); ctx.arc(px + (hash(i) - .5) * 30, py + (hash(i + 5) - .5) * 20, 2, 0, TAU); ctx.fill(); }
  ctx.globalAlpha = 1;
  text(label, -900, -450, 26, C.teal);
  mathText(formula, -900, -400, 34, C.ink);
}
shot(320, 328, st => {
  skate(st, th => { const r = 260 * (1 - Math.cos(th)); return [r * Math.cos(th) + 260, r * Math.sin(th) * .9]; }, '// skate(cardioid)', 'r = a(1 − cos θ)');
  st.fx = { ca: .2 + st.beat * .5, bloomAmt: .15, vign: .35, grain: .04 };
});
shot(328, 336, st => {
  skate(st, th => { const a = 640, s = Math.sin(th), c = Math.cos(th), d = 1 + s * s; return [a * c / d, a * s * c / d * 1.15]; }, '// skate(lemniscate)', '(x^{2} + y^{2})^{2} = a^{2}(x^{2} − y^{2})');
  st.fx = { ca: .2 + st.beat * .5, bloomAmt: .15, vign: .35, grain: .04 };
});

// K3 沃罗诺伊：种子随节拍游走
shot(336, 344, st => {
  const seeds = [];
  for (let i = 0; i < 22; i++) { const a = hash(i) * TAU + st.t * (.2 + hash(i + 3) * .5) * (i % 2 ? 1 : -1), r = .15 + hash(i + 7) * .6;
    seeds.push(r * Math.cos(a) * 1.4, r * Math.sin(a) * .8 + Math.sin(st.t + i) * .03); }
  st.bg = { mode: 6, a: [22, 0, 1, 0], seeds };
  drawGirl(0, 30, 760, { glow: 40, glowCol: C.ink });
  text('nearest(p) = me', 0, 440, 34, C.cream, { align: 'center', glow: 12, glowCol: C.ink });
  st.fx = { ca: .4 + st.beat * 1.2, bloomAmt: .3 };
});

// K4 杨辉三角 mod 2 → 谢尔宾斯基，蓄力频闪
shot(344, 352, st => {
  fillBG(C.ink);
  const R = Math.min(64, Math.floor(st.lb * 9) + 1), cell = 13;
  let row = [1];
  for (let r = 0; r < R; r++) {
    for (let c = 0; c <= r; c++) { if (row[c] % 2) { ctx.fillStyle = r === R - 1 ? C.cream : (r % 8 < 4 ? C.teal : C.tealL);
      ctx.fillRect((c - r / 2) * cell - cell / 2 + 1, -420 + r * cell, cell - 2, cell - 2); } }
    const nr = [1]; for (let c = 1; c <= r; c++) nr.push((row[c - 1] + row[c]) % 2); nr.push(1); row = nr;
  }
  text('C(n, k) mod 2', 0, 470, 34, C.cream, { align: 'center' });
  const strobe = st.lb > 6 ? (fract(st.lb * 4) < .5 ? .55 : 0) : 0;
  st.fx = { ca: .4 + st.beat * 2, bloomAmt: .8, zoom: 1 + st.p * .2, flash: strobe + (st.lb > 7.6 ? (st.lb - 7.6) * 2.5 : 0) };
});
