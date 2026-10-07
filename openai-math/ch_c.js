// 第 7–9 章：结果星图巡游 / 冷静看待 / 结尾
'use strict';
const SECT = [['数论', 31], ['代数与复几何', 36], ['实分析与复分析', 16], ['凸几何与度量几何', 15], ['理论计算机科学', 40], ['动力系统与遍历论', 12], ['组合数学', 37],
  ['代数', 18], ['概率与统计力学', 29], ['数理逻辑', 6], ['群论', 14], ['数学物理', 25], ['算子代数', 19], ['拓扑', 18], ['泛函分析', 11], ['微分几何', 29], ['偏微分方程', 16]];
const SCOL = SECT.map((_, k) => `hsl(${(k * 360 / 17 + 160) % 360}, 70%, 64%)`);
const STARS = (() => { const out = []; const sec = TAU / 17; SECT.forEach(([n, c], k) => { const a0 = -Math.PI / 2 + k * sec;
  for (let i = 0; i < c; i++) { const rr = 90 + 330 * Math.sqrt((i * .618034) % 1); const a = a0 + sec * (.08 + .84 * ((i * .381966 + .13) % 1));
    out.push({ x: rr * Math.cos(a), y: rr * Math.sin(a), k, s: 3 + 2.5 * hash(k * 50 + i) }); } }); return out; })();
const sectPt = k => { const a = -Math.PI / 2 + (k + .5) * TAU / 17; return [300 * Math.cos(a), 300 * Math.sin(a)]; };
const GAL = [['b', 0], ['c', 6], ['d', 4], ['e', 10], ['f', 0]];
const ZETA0 = [14.134725, 21.022040, 25.010858, 30.424876, 32.935062, 37.586178, 40.918719, 43.327073, 48.005151, 49.773832];
const PZ = 6.5;                  // 潜入时的放大倍数
function galleryCam(S) {
  // 依次潜入各分支；每段：前 0.9 s 从上一个目标飞来
  let x = 0, y = 0, z = 1;
  let prev = [0, 0, 1];
  for (const [k, sec] of GAL) { const bi = S.b(k); const [tx, ty] = sectPt(sec);
    const e = at(bi, 0, 1.1, easeInOut); if (e <= 0) break;
    const dip = 1 - .6 * Math.sin(Math.PI * e) * (prev[2] > 1.5 ? 1 : 0);
    x = lerp(prev[0], tx, e); y = lerp(prev[1], ty, e); z = lerp(prev[2], PZ, e) * dip; prev = [tx, ty, PZ]; }
  const g = at(S.b('g'), 0, 1.6, easeInOut); x = lerp(x, 0, g); y = lerp(y, 0, g); z = lerp(z, 1.15, g);
  return { x, y, z };
}
function panel(sec, fn, a) { if (a <= 0) return; const [tx, ty] = sectPt(sec); ctx.save(); ctx.translate(tx, ty); ctx.scale(1 / PZ, 1 / PZ); ctx.globalAlpha = a; fn(); ctx.restore(); ctx.globalAlpha = 1; }
CH.S07_Gallery = S => {
  const B = {}; 'abcdefg'.split('').forEach(k => B[k] = S.b(k));
  // 星图本体（潜入面板时变暗）
  let dimP = 0; for (const [k] of GAL) dimP = Math.max(dimP, ap(B[k], .6, .5) * (1 - ap(nextB(B, k), 0, .4)));
  const glow = at(B.g, .3, 1.5);
  for (let i = 0; i < STARS.length; i++) { const s = STARS[i]; const ap0 = at(B.a, i / STARS.length * .5, .5);
    const tw = .75 + .25 * Math.sin(S.t * 2 + i);
    ctx.fillStyle = SCOL[s.k]; ctx.globalAlpha = ap0 * tw * (1 - .85 * dimP);
    ctx.beginPath(); ctx.arc(s.x, s.y, s.s * (1 + glow * .5), 0, TAU); ctx.fill();
    if (glow > 0) { ctx.globalAlpha = .15 * glow * (1 - .85 * dimP); ctx.beginPath(); ctx.arc(s.x, s.y, s.s * 4, 0, TAU); ctx.fill(); } }
  ctx.globalAlpha = 1;
  SECT.forEach(([n], k) => { const a = -Math.PI / 2 + (k + .5) * TAU / 17; text(n, 470 * Math.cos(a), 470 * Math.sin(a), 20, SCOL[k], { font: FONT_ZH, align: 'center', alpha: at(B.a, .45, .8) * (1 - .9 * dimP) }); });
  text('372 个结果族 · 17 个分支', 0, -520, 34, C.cream, { font: FONT_ZH, align: 'center', alpha: at(B.a, .1, .8) * (1 - .9 * dimP) });
  const pa = k => ap(B[k], .85, .5) * (1 - ap(nextB(B, k), 0, .4));
  // b：准黎曼猜想
  panel(0, () => {
    const X = v => -700 + (v + .5) / 2.1 * 900, Y = v => 380 - v / 52 * 760;
    ctx.fillStyle = 'rgba(17,16,14,.92)'; roundRect(-920, -470, 1840, 940, 30); ctx.fill();
    ctx.fillStyle = '#1D2230'; ctx.fillRect(X(0), Y(52), X(1) - X(0), Y(0) - Y(52));
    ctx.fillStyle = 'rgba(3,148,141,.35)'; ctx.fillRect(X(7 / 8), Y(52), X(1.6) - X(7 / 8), Y(0) - Y(52));
    ctx.strokeStyle = C.grey; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(-.5), Y(0)); ctx.lineTo(X(1.6), Y(0)); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(0), Y(52)); ctx.stroke();
    ctx.setLineDash([8, 8]); ctx.strokeStyle = SEVEN[1]; ctx.beginPath(); ctx.moveTo(X(.5), Y(0)); ctx.lineTo(X(.5), Y(52)); ctx.stroke(); ctx.setLineDash([]);
    ZETA0.forEach((g, i) => { const a = at(B.b, .15 + i * .03, .4); ctx.fillStyle = SEVEN[1]; ctx.globalAlpha *= 1; ctx.beginPath(); ctx.arc(X(.5), Y(g), 8 * a, 0, TAU); ctx.fill(); });
    const cl = at(B.b, .55, 1.4); ctx.strokeStyle = '#60A5FA'; ctx.lineWidth = 3; ctx.beginPath();
    for (let i = 0; i <= 60 * cl; i++) { const t = i / 60 * 52; const x = X(1 - .11 / Math.log(t + 3)); i ? ctx.lineTo(x, Y(t)) : ctx.moveTo(x, Y(t)); } ctx.stroke();
    for (const [v, s] of [[0, '0'], [.5, '1/2'], [1, '1']]) text(s, X(v), Y(0) + 34, 28, C.cream, { font: FONT_MATH, align: 'center' });
    text('准黎曼猜想', 520, -340, 54, SEVEN[1], { font: FONT_ZH, weight: 'bold', align: 'center' });
    mathText('L(s, χ) ≠ 0    (Re s > 7/8)', 520, -250, 40, C.cream, { align: 'center' });
    text('● ζ 的前 10 个非平凡零点', 300, -120, 26, SEVEN[1], { font: FONT_ZH }); text('— 经典零点区域边界（示意）', 300, -70, 26, '#60A5FA', { font: FONT_ZH });
    text('■ 实部 > 7/8：无零点', 300, -20, 26, C.tealL, { font: FONT_ZH });
  }, pa('b'));
  // c：Borsuk
  panel(6, () => {
    ctx.fillStyle = 'rgba(17,16,14,.92)'; roundRect(-920, -470, 1840, 940, 30); ctx.fill();
    text('Borsuk 猜想', 0, -380, 54, SEVEN[1], { font: FONT_ZH, weight: 'bold', align: 'center' });
    const sp = at(B.c, .1, 1.2); [SEVEN[0], SEVEN[3], '#60A5FA'].forEach((c, i) => { const a0 = -Math.PI / 2 + i * TAU / 3, off = 14 * sp;
      ctx.fillStyle = c; ctx.globalAlpha = .75; ctx.beginPath(); ctx.moveTo(-560 + off * Math.cos(a0 + Math.PI / 3), -20 + off * Math.sin(a0 + Math.PI / 3)); ctx.arc(-560 + off * Math.cos(a0 + Math.PI / 3), -20 + off * Math.sin(a0 + Math.PI / 3), 210, a0, a0 + TAU / 3 * sp); ctx.closePath(); ctx.fill(); });
    ctx.globalAlpha = 1; text('圆盘：3 块，每块直径更小', -560, 250, 28, C.grey, { font: FONT_ZH, align: 'center' });
    [['1993 · Kahn–Kalai', '1325 维', '#60A5FA', .3], ['此前最低', '64 维', '#A78BFA', .55], ['2026 · 声称', '9 维', SEVEN[1], .75]].forEach(([y, d, col, f], i) => {
      const a = at(B.c, f, .6); const x = -60 + i * 300; text(y, x, -90, 26, C.grey, { font: FONT_ZH, align: 'center', alpha: a }); text(d, x, -10, 76, col, { font: FONT_ZH, weight: 'bold', align: 'center', alpha: a }); });
    text('ℝ⁴ 中直线的秩一正交投影（Frobenius 度量）', 240, 120, 28, C.grey, { font: FONT_ZH, align: 'center', alpha: at(B.c, .8, .6) });
  }, pa('c'));
  // d：矩阵乘法
  panel(4, () => {
    ctx.fillStyle = 'rgba(17,16,14,.92)'; roundRect(-920, -470, 1840, 940, 30); ctx.fill();
    const X = v => -760 + (v - 1960) / 70 * 1520, Y = v => 350 - (v - 2) / 1.05 * 640;
    text('矩阵乘法指数 ω', 0, -400, 50, SEVEN[1], { font: FONT_ZH, weight: 'bold', align: 'center' });
    ctx.strokeStyle = C.grey; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(1960), Y(3.05)); ctx.lineTo(X(1960), Y(2)); ctx.lineTo(X(2030), Y(2)); ctx.stroke();
    ctx.setLineDash([6, 8]); ctx.beginPath(); ctx.moveTo(X(1960), Y(2)); ctx.lineTo(X(2030), Y(2)); ctx.stroke(); ctx.setLineDash([]);
    for (const v of [2, 2.2, 2.4, 2.6, 2.8, 3]) text(v.toFixed(1), X(1960) - 16, Y(v), 22, C.grey, { align: 'right' });
    for (const v of [1970, 1990, 2010, 2030]) text(`${v}`, X(v), Y(2) + 30, 22, C.grey, { align: 'center' });
    const pts = [[1960, 3, 'n³'], [1969, 2.807, 'Strassen 2.807'], [1990, 2.376, 'Coppersmith–Winograd 2.376'], [2024, 2.371, '此前最好 ≈ 2.371']];
    pts.forEach(([x, v, s], i) => { const a = at(B.d, .1 + i * .15, .5); if (i) { const [px, pv] = pts[i - 1]; ctx.strokeStyle = '#60A5FA'; ctx.globalAlpha = a; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(px), Y(pv)); ctx.lineTo(lerp(X(px), X(x), a), lerp(Y(pv), Y(v), a)); ctx.stroke(); }
      ctx.fillStyle = '#60A5FA'; ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(X(x), Y(v), 9, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
      text(s, X(x) + (i === 3 ? -20 : 18), Y(v) + (i < 2 ? -30 : 34), 24, '#60A5FA', { font: FONT_ZH, align: i === 3 ? 'right' : 'left', alpha: a }); });
    const sa = at(B.d, .78, .6); ctx.strokeStyle = SEVEN[1]; ctx.lineWidth = 3; ctx.globalAlpha = sa; ctx.beginPath(); ctx.moveTo(X(2024), Y(2.371)); ctx.lineTo(X(2026), Y(2.25)); ctx.stroke(); ctx.globalAlpha = 1;
    text('★', X(2026), Y(2.25), 46 * sa + 1, SEVEN[1], { align: 'center', alpha: sa });
    mathText('2026 声称：ω ≤ 9/4 = 2.25', X(2026) - 40, Y(2.25) + 60, 30, SEVEN[1], { align: 'right', alpha: sa, font: FONT_ZH });
  }, pa('d'));
  // e：Thompson 群 F
  panel(10, () => {
    ctx.fillStyle = 'rgba(17,16,14,.92)'; roundRect(-920, -470, 1840, 940, 30); ctx.fill();
    text('Thompson 群 F', 0, -390, 54, SEVEN[1], { font: FONT_ZH, weight: 'bold', align: 'center' });
    const A0 = [[0, 0], [.5, .25], [.75, .5], [1, 1]], B0 = [[0, 0], [.5, .5], [.75, .625], [.875, .75], [1, 1]];
    [[A0, SEVEN[0], 'x₀', -560], [B0, C.tealL, 'x₁', -60]].forEach(([pp, col, nm, ox], j) => { const s = 380, oy = 220;
      ctx.strokeStyle = C.grey; ctx.lineWidth = 2; ctx.strokeRect(ox - s / 2, oy - s, s, s);
      ctx.setLineDash([5, 6]); ctx.beginPath(); ctx.moveTo(ox - s / 2, oy); ctx.lineTo(ox + s / 2, oy - s); ctx.stroke(); ctx.setLineDash([]);
      const pr = at(B.e, .1 + j * .2, 1); const P2 = pp.map(([x, y]) => [ox - s / 2 + x * s, oy - y * s]);
      ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.beginPath(); P2.forEach((p, i) => { const q = i ? [lerp(P2[i - 1][0], p[0], clamp(pr * (P2.length - 1) - i + 1)), lerp(P2[i - 1][1], p[1], clamp(pr * (P2.length - 1) - i + 1))] : p; i ? ctx.lineTo(...q) : ctx.moveTo(...q); }); ctx.stroke();
      text(nm, ox, oy - s - 30, 40, col, { font: FONT_MATH, align: 'center' }); });
    ['[0,1] 上的分段线性同胚', '断点为二进有理数', '斜率为 2 的整数次幂'].forEach((s, i) => text(s, 260, -160 + i * 54, 30, C.cream, { font: FONT_ZH, alpha: at(B.e, .45, .6) }));
    chipX('结论：F 不是顺从群', 520, 140, SEVEN[1], 34, at(B.e, .78, .6));
  }, pa('e'));
  // f：Catalan 常数
  panel(0, () => {
    ctx.fillStyle = 'rgba(17,16,14,.92)'; roundRect(-920, -470, 1840, 940, 30); ctx.fill();
    mathText('G = 1 − 1/3^{2} + 1/5^{2} − 1/7^{2} + ⋯', 0, -360, 56, C.cream, { align: 'center' });
    const X = n => -760 + n / 20 * 1520, Y = v => 330 - (v - .85) / .15 * 520; const Gv = .915965594177219;
    ctx.setLineDash([8, 8]); ctx.strokeStyle = SEVEN[1]; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(0), Y(Gv)); ctx.lineTo(X(20), Y(Gv)); ctx.stroke(); ctx.setLineDash([]);
    mathText('G ≈ 0.9159655…', X(14), Y(Gv) - 40, 32, SEVEN[1]);
    let acc = 0; const pts = []; const n = Math.floor(20 * at(B.f, .1, 1.6)) ;
    for (let j = 0; j < Math.max(1, n); j++) { acc += (j % 2 ? -1 : 1) / (2 * j + 1) ** 2; pts.push([X(j + 1), Y(Math.min(1, acc))]); }
    glowLine(pts, '#60A5FA', 3, 8); pts.forEach(p => { ctx.fillStyle = '#60A5FA'; ctx.beginPath(); ctx.arc(p[0], p[1], 7, 0, TAU); ctx.fill(); });
    chipX('结论：G 是无理数', 0, -260, SEVEN[1], 34, at(B.f, .75, .6));
  }, pa('f'));
};
function nextB(B, k) { const order = ['b', 'c', 'd', 'e', 'f', 'g']; const i = order.indexOf(k); return B[order[i + 1]] || { t: -1e9, d: 1 }; }
CH.S07_Gallery.cam = galleryCam;

// ═══ 第 8 章 冷静看待 ══════════════════════════════════════
CH.S08_Caveats = S => {
  const B = {}; 'abcdef'.split('').forEach(k => B[k] = S.b(k));
  const big = at(B.a, 0, .8) * (1 - at(B.b, 0, .8));
  text('冷静看待', 0, -20, 110, C.cream, { font: FONT_ZH, weight: 'bold', align: 'center', alpha: big + (1 - big) * 0, glow: 20, glowCol: C.teal });
  text('冷静看待', -880, -430, 40, C.tealL, { font: FONT_ZH, weight: 'bold', alpha: at(B.b, 0, .8) });
  const card = (num, title, lines, col, bi, nb, extra) => {
    const a = at(bi, 0, .8) * (1 - at(nb, 0, .6)); if (a <= 0) return;
    const dx = (1 - at(bi, 0, .8)) * 120 - at(nb, 0, .6) * 160;
    ctx.save(); ctx.translate(dx, 0); ctx.globalAlpha = a;
    text(num, -760, -170, 180, col, { font: FONT_ZH, weight: 'bold', alpha: a });
    text(title, -560, -230, 60, col, { font: FONT_ZH, weight: 'bold', alpha: a });
    lines.forEach((l, i) => text(l, -560, -140 + i * 64, 38, C.cream, { font: FONT_ZH, alpha: a * at(bi, .1 + i * .12, .6) }));
    if (extra) extra(a);
    ctx.restore();
  };
  card('1', '预印本 ≠ 同行评审', ['部分未形式化的结果可能有问题', '更正以新版本记录，旧版本保留'], SEVEN[0], B.b, B.c, a => {
    text('“Some of the unformalized results could have issues.”', 0, 120, 32, C.grey, { align: 'center', alpha: a * at(B.b, .6, .7) });
    text('—— README', 520, 175, 26, C.grey, { font: FONT_ZH, alpha: a * at(B.b, .6, .7) }); });
  card('2', '形式化 = 选定的陈述', ['π：不含 Flint–Hills 推论', 'Mahler：不含函数形式的不等式'], '#60A5FA', B.c, B.d, a => {
    text('lean/docs/NNN.md  →  ## Scope', -560, 90, 34, C.tealL, { alpha: a * at(B.c, .55, .6) }); });
  const fd = at(B.d, 0, .8) * (1 - at(B.f, 0, .6));
  if (fd > 0) {
    const up = at(B.e, 0, 1, easeInOut);
    ctx.save(); ctx.translate(0, -up * 150); ctx.scale(1 - .2 * up, 1 - .2 * up);
    text('3', -760, -170, 180, '#A78BFA', { font: FONT_ZH, weight: 'bold', alpha: fd });
    text('数学不只是对与错', -560, -230, 60, '#A78BFA', { font: FONT_ZH, weight: 'bold', alpha: fd });
    text('普林斯顿高等研究院 · 数学与 AI 顾问小组', -560, -140, 34, C.cream, { font: FONT_ZH, alpha: fd * at(B.d, .1, .6) });
    text('2026 年 9 月 29 日 公开建议', -560, -84, 34, C.cream, { font: FONT_ZH, alpha: fd * at(B.d, .2, .6) });
    ctx.restore();
    const norm = at(B.d, .5, .8) * (1 - at(B.e, 0, .6));
    text('核心规范：作者理解自己的论证，并为之负责', 0, 120, 46, SEVEN[1], { font: FONT_ZH, weight: 'bold', align: 'center', alpha: norm });
    const recs = ['① 尽力完善文献引用与写作', '② 存入不受 AI 实验室控制的学术仓库', '③ 提供资助，支持社区去理解这些结果'];
    recs.forEach((r, i) => { const a = at(B.e, .1 + i * .25, .6) * (1 - at(B.f, 0, .6)); text(r, -480 + (1 - a) * 40, -20 + i * 80, 40, C.cream, { font: FONT_ZH, alpha: a }); });
  }
  const ff = at(B.f, 0, .8);
  if (ff > 0) {
    text('OpenAI 的回应', 0, -200, 54, C.tealL, { font: FONT_ZH, weight: 'bold', align: 'center', alpha: ff });
    text('· 资助围绕 AI 重大成果的研讨会与会议', 0, -90, 40, C.cream, { font: FONT_ZH, align: 'center', alpha: at(B.f, .15, .6) });
    text('· 继续探索由社区托管的发布方式', 0, -20, 40, C.cream, { font: FONT_ZH, align: 'center', alpha: at(B.f, .3, .6) });
    const e = at(B.f, .65, 1);
    lyric(S, '真正的读懂，才刚刚开始。', { y: 120, size: 60, font: FONT_ZH, p: e, col: SEVEN[1], glow: 20, glowCol: C.ink });
  }
};
CH.S08_Caveats.cam = S => ({ z: 1 + .05 * at(S.b('a'), 0, 3) - .05 * at(S.b('b'), 0, 2) });

// ═══ 第 9 章 结尾 ══════════════════════════════════════════
CH.S09_Outro = S => {
  const A = S.b('a'), B = S.b('b'), Cc = S.b('c');
  const R = 60, grow = at(A, 0, 3.5);
  ctx.save(); ctx.rotate(S.lt * .03);
  for (let a = -20; a <= 20; a++) for (let b = -12; b <= 12; b++) { const [x, y] = hexCenter(a, b, R); const d = Math.hypot(x, y) / 1500; const p = clamp((grow * 1.4 - d) / .3); if (p <= 0) continue;
    ctx.fillStyle = SEVEN[((a + 3 * b) % 7 + 7) % 7]; ctx.globalAlpha = .85 * p * (1 - .55 * at(B, .3, 2)); hexPath(x, y, Math.max(.1, R * easeOut(p) - 1.5)); ctx.fill(); }
  ctx.restore(); ctx.globalAlpha = 1;
  const plate = (w, h, a) => { ctx.save(); ctx.globalAlpha = a * .9; ctx.fillStyle = C.ink; roundRect(-w / 2, -h / 2 - 20, w, h, 28); ctx.fill(); ctx.restore(); };
  const f1 = at(A, .35, .7) * (1 - at(B, 0, .6));
  if (f1 > 0) { plate(760, 180, f1); text('5 色 ✗', -170, -20, 72, C.cream, { font: FONT_ZH, weight: 'bold', align: 'center', alpha: f1 }); text('7 色 ✓', 190, -20, 72, C.cream, { font: FONT_ZH, weight: 'bold', align: 'center', alpha: at(A, .55, .6) * f1 }); }
  const f2 = at(B, 0, .7) * (1 - at(Cc, 0, .6));
  if (f2 > 0) { plate(820, 260, f2); text('6', -220, -20, 170, SEVEN[1], { font: FONT_ZH, weight: 'bold', align: 'center', alpha: f2 }); text('还是', 0, -20, 56, C.cream, { font: FONT_ZH, align: 'center', alpha: f2 }); text('7', 220, -20, 170, SEVEN[1], { font: FONT_ZH, weight: 'bold', align: 'center', alpha: f2 }); }
  const f3 = at(Cc, 0, .7);
  if (f3 > 0) { plate(1100, 330, f3); text('github.com/openai/math', 0, -70, 60, C.tealL, { align: 'center', alpha: f3 });
    text('感谢观看', 0, 20, 46, C.cream, { font: FONT_ZH, align: 'center', alpha: at(Cc, .3, .6) });
    text('资料来源：openai/math 仓库 · OpenAI 博客 · IAS 数学与 AI 顾问小组', 0, 90, 24, C.grey, { font: FONT_ZH, align: 'center', alpha: at(Cc, .45, .6) }); }
};
CH.S09_Outro.cam = S => ({ z: lerp(1.6, 1, at(S.b('a'), 0, 4, easeInOut)) * lerp(1, .8, at(S.b('b'), .2, 8, easeInOut)) });
