// 第 0–3 章：冷开场 / 这次发布 / 结果从何而来 / Lean
'use strict';
const SEVEN = ['#F2795B', '#F4C95D', '#A3E635', '#5CC8C1', '#60A5FA', '#A78BFA', '#F472B6'];
const UNIT = 150;                                      // 平面上的“长度 1”
function hexAxial(x, y, R) {
  const q = (Math.sqrt(3) / 3 * x - y / 3) / R, r = (2 / 3 * y) / R;
  let cx = q, cz = r, cy = -q - r; let rx = Math.round(cx), ry = Math.round(cy), rz = Math.round(cz);
  const dx = Math.abs(rx - cx), dy = Math.abs(ry - cy), dz = Math.abs(rz - cz);
  if (dx > dy && dx > dz) rx = -ry - rz; else if (dy > dz) ry = -rx - rz; else rz = -rx - ry;
  return [rx, rz];
}
const hex7 = (x, y, R) => { const [a, b] = hexAxial(x, y, R); return ((a + 3 * b) % 7 + 7) % 7; };
function hexPath(cx, cy, R) { ctx.beginPath(); for (let k = 0; k < 6; k++) { const a = Math.PI / 2 + k * Math.PI / 3; const x = cx + R * Math.cos(a), y = cy + R * Math.sin(a); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); }
function hexCenter(a, b, R) { return [Math.sqrt(3) * R * (a + b / 2), 1.5 * R * b]; }

// ═══ 第 0 章 冷开场 ═══════════════════════════════════════
CH.S00_Hook = S => {
  const A = S.b('a'), B = S.b('b'), Cc = S.b('c'), D = S.b('d');
  const R = UNIT * .4;
  // a：平面上的点被逐个着色（用的正是合法的七色六边形着色）
  const fadeA = 1 - at(D, 0, 1.5);
  const nPts = Math.floor(900 * clamp((A.t - 1.5) / (A.d + 6)));
  for (let i = 0; i < nPts; i++) {
    const ang = hash(i) * TAU, rr = 120 + Math.sqrt(hash(i + 7)) * 760;
    const x = rr * Math.cos(ang) * 1.15, y = rr * Math.sin(ang) * .62;
    const born = 1.5 + i / 900 * (A.d + 6); const e = easeOut(clamp((A.t - born) / .5));
    ctx.fillStyle = SEVEN[hex7(x, y, R)]; ctx.globalAlpha = .75 * e * fadeA * (1 - at(B, .2, 2) * .55);
    ctx.beginPath(); ctx.arc(x, y, 4.5 * e, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
  // 中心点、单位圆、旋转的单位线段
  const ca = ap(A, .6, 1) * (1 - at(B, .15, 1));
  if (ca > 0) {
    ctx.save(); ctx.globalAlpha = ca;
    ctx.setLineDash([8, 9]); ctx.strokeStyle = C.grey; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, UNIT * ap(A, .8, 1.4), 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    const th = .4 + A.t * .9;
    const qx = UNIT * Math.cos(th), qy = -UNIT * Math.sin(th);
    ctx.strokeStyle = C.cream; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(qx, qy); ctx.stroke();
    ctx.fillStyle = SEVEN[0]; ctx.beginPath(); ctx.arc(0, 0, 11, 0, TAU); ctx.fill();
    ctx.fillStyle = SEVEN[3]; ctx.beginPath(); ctx.arc(qx, qy, 11, 0, TAU); ctx.fill();
    text('1', qx / 2 - Math.sin(th) * 24, qy / 2 - Math.cos(th) * 24, 30, C.cream, { font: FONT_MATH, align: 'center' });
    ctx.restore();
    text('距离为 1  ⇒  颜色不同', 0, -300, 42, C.cream, { font: FONT_ZH, align: 'center', alpha: at(A, .45, 1) * ca });
  }
  // b：问题 + 数轴 + 区间
  const bq = at(B, 0, .8) * (1 - at(D, 0, 1));
  if (bq > 0) {
    text('最少需要几种颜色？', 0, -250, 64, C.cream, { font: FONT_ZH, align: 'center', weight: 'bold', alpha: bq });
    const L = 1100, n2x = v => -L / 2 + (v - 1) / 7 * L, y = 60;
    ctx.save(); ctx.globalAlpha = bq; ctx.strokeStyle = C.grey; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(n2x(1) - 30, y); ctx.lineTo(n2x(8) + 30, y); ctx.stroke();
    for (let v = 1; v <= 8; v++) { ctx.beginPath(); ctx.moveTo(n2x(v), y - 12); ctx.lineTo(n2x(v), y + 12); ctx.stroke();
      text(`${v}`, n2x(v), y + 42, 32, C.cream, { font: FONT_MATH, align: 'center' }); }
    // 区间端点平滑移动：[4,7] → [5,7] → [6,7]
    const lo = 4 + at(B, .72, 1.2, easeInOut) + at(Cc, .05, 1.4, easeInOut);
    const col = Cc.t > .05 * Cc.d ? C.cream : C.tealL;
    ctx.strokeStyle = SEVEN[1]; ctx.lineWidth = 12; ctx.lineCap = 'round';
    const grow = at(B, .35, 1.2);
    ctx.beginPath(); ctx.moveTo(n2x(lo), y); ctx.lineTo(lerp(n2x(lo), n2x(7), grow), y); ctx.stroke();
    for (const v of [lo, 7]) { ctx.fillStyle = SEVEN[1]; ctx.beginPath(); ctx.arc(n2x(v), y, 13 * grow, 0, TAU); ctx.fill(); }
    ctx.restore();
    const year = Math.round(lerp(1950, 2018, at(B, .72, 1.2, easeInOut)));
    const ylabel = Cc.t > .05 * Cc.d ? '2026.09 · OpenAI：5 种颜色不够' : `${year}${year === 2018 ? ' · de Grey：下界 → 5' : ' 年提出 · 4 ≤ χ ≤ 7'}`;
    text(ylabel, 0, 170, 32, Cc.t > .05 * Cc.d ? SEVEN[1] : C.tealL, { font: FONT_ZH, align: 'center', alpha: bq * grow });
    mathText('χ(ℝ^{2}) ∈ {6, 7}', 0, -120, 58, SEVEN[1], { align: 'center', alpha: at(Cc, .3, 1) * bq, glow: 18, glowCol: C.ink });
    chipX('作者：OpenAI 内部模型', 0, 280, '#A78BFA', 28, at(Cc, .7, .8) * bq);
  }
  // d：缩小成 722 张稿件之一
  if (D.t > 0) {
    const cols = 38, rows = 19, w = 42, h = 54, g = 10;
    const e = at(D, .05, 2.2, easeInOut);
    for (let i = 0; i < 722; i++) {
      const r = Math.floor(i / cols), c = i % cols;
      const x = (c - (cols - 1) / 2) * (w + g), y = (r - (rows - 1) / 2) * (h + g);
      const hero = r === 9 && c === 18;
      const delay = Math.hypot(c - 18, r - 9) / 22;
      const a = clamp((e * 1.6 - delay));
      if (a <= 0) continue;
      ctx.globalAlpha = a * (hero ? 1 : .8);
      ctx.fillStyle = hero ? SEVEN[1] : '#22283A'; roundRect(x - w / 2, y - h / 2, w, h, 6); ctx.fill();
      if (!hero) { ctx.fillStyle = '#3A4258'; for (let k = 0; k < 4; k++) ctx.fillRect(x - w / 2 + 7, y - h / 2 + 10 + k * 9, w - 14 - (k === 3 ? 12 : 0), 3); }
    }
    ctx.globalAlpha = 1;
    const tt = at(D, .55, 1.2);
    ctx.save(); ctx.globalAlpha = .9 * tt; ctx.fillStyle = C.ink; roundRect(-470, -150, 940, 300, 26); ctx.fill(); ctx.restore();
    text('读懂 openai/math', 0, -30, 86, C.cream, { font: FONT_ZH, weight: 'bold', align: 'center', alpha: tt, glow: 20, glowCol: C.teal });
    text('当 AI 开始做数学研究', 0, 70, 38, C.grey, { font: FONT_ZH, align: 'center', alpha: tt });
    text('722 篇稿件', 0, -380, 50, SEVEN[1], { font: FONT_ZH, weight: 'bold', align: 'center', alpha: at(D, .15, .8) * (1 - tt * .3) });
  }
};
CH.S00_Hook.cam = S => { const A = S.b('a'), D = S.b('d'); const z = lerp(1.35, 1, at(A, .5, 4, easeInOut)) * lerp(1, .82, at(D, .05, 2.4, easeInOut)); return { z, y: -20 * at(A, .5, 4) }; };

// ═══ 第 1 章 这次发布 ═════════════════════════════════════
const DISC = [['理论计算机科学', 40], ['组合数学', 37], ['代数与复几何', 36], ['数论', 31], ['概率与统计力学', 29], ['微分几何', 29], ['数学物理', 25],
  ['算子代数', 19], ['拓扑', 18], ['代数', 18], ['实分析与复分析', 16], ['偏微分方程', 16], ['凸几何与度量几何', 15], ['群论', 14], ['动力系统与遍历论', 12], ['泛函分析', 11], ['数理逻辑', 6]];
CH.S01_Release = S => {
  const A = S.b('a'), B = S.b('b'), Cc = S.b('c'), D = S.b('d');
  // a：博客卡片
  const fa = 1 - at(B, 0, .8);
  if (fa > 0) {
    ctx.save(); ctx.globalAlpha = fa;
    text('2026 年 10 月 6 日', 0, -230, 34, C.grey, { font: FONT_ZH, align: 'center', alpha: ap(A, .2) });
    text(typed('Sharing AI progress in mathematics', clamp((A.t - .6) / 2.2)), 0, -150, 66, C.cream, { font: FONT_ZH, weight: 'bold', align: 'center' });
    text('《分享 AI 在数学上的进展》', 0, -70, 36, C.grey, { font: FONT_ZH, align: 'center', alpha: ap(A, 2.6) });
    const rc = at(A, .55, 1);
    ctx.globalAlpha = fa * rc; ctx.fillStyle = 'rgba(3,148,141,.1)'; roundRect(-400, 30, 800, 170, 22); ctx.fill();
    ctx.strokeStyle = C.teal; ctx.lineWidth = 2.5; roundRect(-400, 30, 800, 170, 22); ctx.stroke();
    text('github.com/', -250, 100, 40, C.grey, { alpha: rc * fa }); text('openai/math', -250 + textW('github.com/', 40), 100, 44, C.tealL, { alpha: rc * fa });
    text('Apache-2.0 · 公开仓库', 0, 158, 26, C.grey, { font: FONT_ZH, align: 'center', alpha: rc * fa });
    ctx.restore();
  }
  // b：722 个点流入 372 个结果族
  const fb = at(B, 0, .8) * (1 - at(Cc, 0, .8));
  if (fb > 0) {
    const m = at(B, .2, B.d * .45, easeInOut);
    const ga = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < 722; i++) {
      const r = Math.floor(i / 38), c = i % 38;
      const x0 = -760 + c * 15, y0 = -240 + r * 15;
      const k = i < 372 ? i : Math.floor(hash(i) * 372);
      const x1 = 420 + 10.5 * Math.sqrt(k + 1) * Math.cos(k * ga), y1 = -90 + 10.5 * Math.sqrt(k + 1) * Math.sin(k * ga);
      const mi = clamp(m * 1.4 - hash(i + 3) * .4);
      const x = lerp(x0, x1, easeInOut(mi)) + Math.sin(mi * Math.PI) * (hash(i + 9) - .5) * 120, y = lerp(y0, y1, easeInOut(mi)) - Math.sin(mi * Math.PI) * 80;
      ctx.fillStyle = mi > .99 ? C.tealL : SEVEN[1]; ctx.globalAlpha = fb * (i < 372 || mi < .99 ? 1 : .0);
      ctx.fillRect(x - 4, y - 4, 8, 8);
    }
    ctx.globalAlpha = 1;
    text(counter(722), -480, -320, 92, SEVEN[1], { font: FONT_MATH, align: 'center', alpha: fb });
    text('篇稿件', -480, -255, 30, C.grey, { font: FONT_ZH, align: 'center', alpha: fb });
    text(counter(lerp(0, 372, m)), 420, -320, 92, C.tealL, { font: FONT_MATH, align: 'center', alpha: fb });
    text('个结果族', 420, -255, 30, C.grey, { font: FONT_ZH, align: 'center', alpha: fb });
    const ft = at(B, .62, .8);
    chipX('一个结果族', 0, 200, C.tealL, 30, ft * fb);
    const kids = [['主要结果', SEVEN[1]], ['配套论证', C.cream], ['推论', C.cream], ['替代证明', C.cream]];
    kids.forEach(([s, col], i) => { const x = -420 + i * 280, a = at(B, .68 + i * .06, .6) * fb;
      ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = C.grey; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 225); ctx.lineTo(x, 300); ctx.stroke(); ctx.restore();
      chipX(s, x, 330, col, 26, a); });
  }
  // c：17 个分支的条形图
  const fc = at(Cc, 0, .8) * (1 - at(D, 0, .8));
  if (fc > 0) {
    text('17 个分支 · 372 个结果族', 0, -400, 40, C.cream, { font: FONT_ZH, weight: 'bold', align: 'center', alpha: fc });
    DISC.forEach(([name, v], i) => {
      const y = -330 + i * 41, g = at(Cc, .05 + i * .025, .9, easeOut) * fc;
      text(name, -280, y, 25, i ? C.cream : SEVEN[1], { font: FONT_ZH, align: 'right', alpha: fc });
      const w = 640 * v / 40 * g * (i === 0 ? 1 + .03 * Math.sin(S.t * 6) * at(Cc, .7, .4) : 1);
      const col = i === 0 ? SEVEN[1] : `hsl(${178 + i * 6}, 55%, ${48 - i}%)`;
      ctx.fillStyle = col; ctx.globalAlpha = fc; roundRect(-255, y - 13, Math.max(1, w), 26, 6); ctx.fill(); ctx.globalAlpha = 1;
      text(`${Math.round(v * g)}`, -240 + w, y, 22, C.grey, { alpha: fc });
    });
  }
  // d：仓库结构
  const fd = at(D, 0, .8);
  if (fd > 0) {
    const items = [['preprints/', '722 份稿件：PDF、源文件、引用信息', SEVEN[1]], ['lean/', 'Lean 4 形式化证明库 + Comparator 挑战', '#60A5FA'],
      ['reasoning_traces/', '10 份模型推理过程摘要', '#A78BFA'], ['CONTENTS.md · overview.pdf', '总览目录：每个结果族的简介', C.cream]];
    text('openai/math/', -430, -320, 46, C.tealL, { alpha: fd });
    items.forEach(([n, d, col], i) => {
      const a = at(D, .12 + i * .2, .8); const y = -200 + i * 140;
      ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = C.grey; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(-410, -290 + (i ? (i - 1) * 140 + 90 : 0)); ctx.lineTo(-410, y); ctx.lineTo(-360, y); ctx.stroke(); ctx.restore();
      // 文件夹图标
      ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = col; ctx.globalAlpha = a * .85; roundRect(-340, y - 20, 46, 36, 5); ctx.fill(); ctx.fillRect(-340, y - 26, 20, 10); ctx.restore();
      text(n, -270 + (1 - a) * 30, y - 4, 38, col, { alpha: a });
      text(d, -270 + (1 - a) * 30, y + 42, 26, C.grey, { font: FONT_ZH, alpha: a });
    });
  }
};
CH.S01_Release.cam = S => { const B = S.b('b'), D = S.b('d'); return { z: 1 + .05 * at(B, .2, 3) - .05 * at(D, 0, 2), x: 40 * Math.sin(S.lt * .1) }; };

// ═══ 第 2 章 结果从何而来 ═════════════════════════════════
CH.S02_Process = S => {
  const A = S.b('a'), B = S.b('b'), Cc = S.b('c'), D = S.b('d'), E = S.b('e'), F = S.b('f');
  // a：饱和曲线
  const fa = ap(A, 0, .6) * (1 - at(B, 0, .7));
  if (fa > 0) {
    const ox = -820, oy = 200, W0 = 760, H0 = 420;
    ctx.save(); ctx.globalAlpha = fa; ctx.strokeStyle = C.grey; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(ox, oy - H0 - 30); ctx.lineTo(ox, oy); ctx.lineTo(ox + W0 + 30, oy); ctx.stroke();
    ctx.setLineDash([6, 8]); ctx.beginPath(); ctx.moveTo(ox, oy - H0); ctx.lineTo(ox + W0, oy - H0); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
    const pr = at(A, .05, A.d * .45, easeInOut);
    const pts = []; for (let i = 0; i <= 200 * pr; i++) { const x = i / 200 * 10; pts.push([ox + x / 10 * W0, oy - H0 * (1 - Math.exp(-.55 * x))]); }
    if (pts.length > 1) { glowLine(pts, '#60A5FA', 5, 18, fa); const h = pts[pts.length - 1]; ctx.fillStyle = C.cream; ctx.beginPath(); ctx.arc(h[0], h[1], 9, 0, TAU); ctx.fill(); }
    text('已有数学评测', ox + 20, oy - H0 - 60, 32, '#60A5FA', { font: FONT_ZH, alpha: fa });
    text('趋于饱和', ox + W0 - 40, oy - H0 - 28, 26, C.grey, { font: FONT_ZH, alpha: fa * at(A, .45, .6) });
    const g = at(A, .6, .9);
    arrowX(30, -40, 230, -40, SEVEN[1], g, 5);
    if (g > .9) flowDots(30, -40, 220, -40, S.t, C.cream, 3);
    cardX('开放研究问题', ['真实的、尚未解决的', '数学研究问题'], 520, -40, SEVEN[1], at(A, .68, .8), { ts: 40, bs: 28 });
  }
  // b：约 4000 个问题 → 372
  const fb = at(B, 0, .8) * (1 - at(Cc, 0, .8));
  if (fb > 0) {
    const sel = at(B, .5, 1.6, easeInOut);
    for (let i = 0; i < 4000; i++) {
      const r = Math.floor(i / 80), c = i % 80; const x = (c - 39.5) * 17, y = (r - 24.5) * 13 - 10;
      const appear = clamp((B.t * 1.4 - Math.hypot(c - 40, r - 25) / 25));
      if (appear <= 0) continue;
      const chosen = hash(i * 1.37) < 372 / 4000;
      const s = chosen ? 3 + 3.5 * sel : 3 * (1 - .3 * sel);
      ctx.fillStyle = chosen && sel > 0 ? SEVEN[1] : C.grey; ctx.globalAlpha = fb * appear * (chosen ? 1 : 1 - .8 * sel);
      ctx.fillRect(x - s / 2, y - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
    text(sel > .5 ? '372 个结果族' : '≈ 4000 个问题', 0, -380, 50, sel > .5 ? SEVEN[1] : C.cream, { font: FONT_ZH, weight: 'bold', align: 'center', alpha: fb });
  }
  // c：3 小时
  const fc = at(Cc, 0, .8) * (1 - at(D, 0, .8));
  if (fc > 0) {
    const cx = -330, cy = -30, R = 190, sw = at(Cc, .15, 2, easeInOut) * Math.PI / 2;
    ctx.save(); ctx.globalAlpha = fc;
    ctx.fillStyle = 'rgba(244,201,93,.22)'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R - 8, -Math.PI / 2, -Math.PI / 2 + sw); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = C.cream; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
    for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; ctx.lineWidth = k % 3 ? 2 : 4; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * (R - 22), cy + Math.sin(a) * (R - 22)); ctx.lineTo(cx + Math.cos(a) * (R - 6), cy + Math.sin(a) * (R - 6)); ctx.stroke(); }
    const ha = -Math.PI / 2 + sw; ctx.strokeStyle = SEVEN[1]; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ha) * (R - 50), cy + Math.sin(ha) * (R - 50)); ctx.stroke();
    const ma = -Math.PI / 2 + at(Cc, .15, 2, easeInOut) * TAU * 3; ctx.strokeStyle = C.cream; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ma) * (R - 25), cy + Math.sin(ma) * (R - 25)); ctx.stroke();
    ctx.restore();
    text('≈ 3 小时', 40, -110, 84, SEVEN[1], { font: FONT_ZH, weight: 'bold', alpha: fc * at(Cc, .3, .8) });
    text('ChatGPT Pro 思考的等效算力', 40, -10, 38, C.cream, { font: FONT_ZH, alpha: fc * at(Cc, .38, .8) });
    text('（每个结果平均）', 40, 50, 30, C.grey, { font: FONT_ZH, alpha: fc * at(Cc, .45, .8) });
  }
  // d：例外
  const fd = at(D, 0, .8) * (1 - at(E, 0, .8));
  if (fd > 0) {
    text('固定流程之外的例外', 0, -300, 44, C.cream, { font: FONT_ZH, weight: 'bold', align: 'center', alpha: fd });
    cardX('ζ 函数零点区域', ['Re s > 11/12 的文稿', '经人工编辑以提升可读性'], -380, 0, SEVEN[0], fd * at(D, .05, .8), { ts: 42, bs: 30 });
    cardX('Hodge 猜想', ['CM 阿贝尔簇情形的证明', '不在固定流程之内'], 380, 0, '#A78BFA', fd * at(D, .3, .8), { ts: 42, bs: 30 });
  }
  // e/f：Navier–Stokes（另一次发布）
  const fe = at(E, 0, .8);
  if (fe > 0) {
    chipX('另行发布 · 不在本仓库', -660, -400, C.grey, 24, fe);
    mathText('∂_{t}u + (u·∇)u = −∇p + νΔu + f,    ∇·u = 0', 0, -300, 46, C.cream, { align: 'center', alpha: fe });
    // 向内螺旋、轴向拉伸的涡（三维螺线投影）
    const k = .8 * at(E, .2, E.d * .75, easeInOut) + .1 * at(F, 0, F.d);
    const cam = { yaw: S.t * .35, pitch: .35, dist: 7, fov: 760 };
    const fadeV = fe * (1 - at(F, .02, .8) * .7);
    for (let j = 0; j < 14; j++) {
      const ph = j / 14 * TAU, pts = [];
      for (let i = 0; i <= 260; i++) { const s = i / 260; const z = (s - .5) * (2.4 + 2.2 * k);
        const R0 = (1.9 * (1 - k) + .45 * k) * (.75 + .25 * Math.cos(Math.PI * (s - .5)));
        const th = ph + s * (3 + 9 * k) * TAU - S.t * 1.5; pts.push(proj([R0 * Math.cos(th), z, R0 * Math.sin(th)], cam)); }
      const sp = pts.map(p => [p[0] - 420, p[1] + 60]);
      glowLine(sp, `hsl(${178 - j * 4},70%,${55 + j * 1.5}%)`, 2.2, 8, .8 * fadeV);
    }
    text('示意：向内螺旋、轴向拉伸的涡', -420, 400, 24, C.grey, { font: FONT_ZH, align: 'center', alpha: fadeV });
    const cl = at(E, .35, .8) * (1 - at(F, 0, .6));
    text('OpenAI 声称：', 120, -120, 30, C.grey, { font: FONT_ZH, alpha: cl });
    text('受光滑外力驱动、从静止出发', 120, -60, 36, C.cream, { font: FONT_ZH, alpha: cl });
    text('有限时间内形成奇点', 120, 10, 48, SEVEN[1], { font: FONT_ZH, weight: 'bold', alpha: cl });
    text('（附 Lean 形式化）', 120, 70, 28, C.grey, { font: FONT_ZH, alpha: cl });
    if (F.t > 0) {
      const stats = [['≈ 10,000', '个并发智能体', SEVEN[1], 10000], ['≈ 88 小时', '首批智能体启动至得出结论', C.tealL, 88], ['不申领', '千禧年奖金', '#A78BFA', 0]];
      stats.forEach(([big, small, col, v], i) => { const a = at(F, .05 + i * .25, .8); const x = 60 + i * 290 - 80, y = -40;
        let s = big; if (v) s = '≈ ' + counter(v * easeOut(clamp((F.t - (.05 + i * .25) * F.d) / 1.2))) + (v === 88 ? ' 小时' : '');
        text(s, x + 70, y, i === 2 ? 52 : 50, col, { font: FONT_ZH, weight: 'bold', align: 'center', alpha: a });
        text(small, x + 70, y + 60, 22, C.grey, { font: FONT_ZH, align: 'center', alpha: a }); });
    }
  }
};
CH.S02_Process.cam = S => { const B = S.b('b'), E = S.b('e'); return { z: 1 + .08 * at(B, .5, 2) * (1 - at(S.b('c'), 0, 1)) - .04 * at(E, 0, 2) }; };

// ═══ 第 3 章 Lean ══════════════════════════════════════════
const LEAN = ['def ProperColoring (colorCount : ℕ)', '    (coloring : ℂ → Fin colorCount) : Prop :=', '  ∀ point otherPoint : ℂ,',
  '    ‖point - otherPoint‖ = 1 →', '      coloring point ≠ coloring otherPoint', '', 'theorem no_proper_five_coloring :',
  '    ¬ ∃ coloring : ℂ → Fin 5,', '      ProperColoring 5 coloring := by', '  sorry'];
function leanLine(s, x, y, size, alpha) {
  const toks = s.split(/(\s+|[():,→≠¬∃∀‖=])/).filter(t => t !== '');
  let cx = x;
  for (const tk of toks) {
    let col = C.cream;
    if (/^(def|theorem|by|sorry)$/.test(tk)) col = '#F472B6';
    else if (/^(Prop|Fin|ℕ|ℂ)$/.test(tk)) col = C.tealL;
    else if (/^[0-9]+$/.test(tk)) col = '#A78BFA';
    else if (/^[():,→≠¬∃∀‖=:]+$/.test(tk)) col = '#F4C95D';
    text(tk, cx, y, size, col, { alpha }); cx += textW(tk, size);
  }
}
CH.S03_Lean = S => {
  const A = S.b('a'), B = S.b('b'), Cc = S.b('c'), D = S.b('d'), E = S.b('e'), F = S.b('f'), G = S.b('g');
  const fa = ap(A, 0, .6) * (1 - at(B, 0, .7));
  if (fa > 0) {
    text('AI 写出的证明，凭什么相信？', 0, -260, 58, C.cream, { font: FONT_ZH, weight: 'bold', align: 'center', alpha: fa });
    text('Lean 4', 0, -80, 120, '#60A5FA', { align: 'center', alpha: fa * at(A, .25, .8), glow: 30, glowCol: '#60A5FA' });
    const xs = [-420, 0, 420], names = ['定理陈述', '证明', '内核逐步检查 ✓'];
    names.forEach((n, i) => chipX(n, xs[i], 130, i === 2 ? C.tealL : C.cream, 30, at(A, .45 + i * .12, .6) * fa));
    for (let i = 0; i < 2; i++) { const p = at(A, .52 + i * .12, .5); arrowX(xs[i] + 110, 130, xs[i + 1] - 130 - (i ? 40 : 0), 130, C.grey, p * fa, 3); if (p > .9) flowDots(xs[i] + 110, 130, xs[i + 1] - 170, 130, S.t + i, C.tealL, 3); }
  }
  // b/c：代码
  const fcode = at(B, 0, .6) * (1 - at(D, .02, .8));
  if (fcode > 0) {
    const x0 = -880, y0 = -330, lh = 52, size = 31;
    const slide = at(D, .02, .8, easeIn);
    ctx.save(); ctx.translate(-slide * 300, 0); ctx.globalAlpha = fcode;
    ctx.fillStyle = '#1B1E26'; roundRect(x0 - 30, y0 - 70, 1100, LEAN.length * lh + 100, 18); ctx.fill();
    ctx.strokeStyle = '#3A4258'; ctx.lineWidth = 2; roundRect(x0 - 30, y0 - 70, 1100, LEAN.length * lh + 100, 18); ctx.stroke();
    text('ComparatorChallenges/EuclideanFiveColor.lean', x0, y0 - 38, 22, C.grey);
    LEAN.forEach((l, i) => { const a = clamp((B.t - .3 - i * .22) / .3); if (a > 0) leanLine(l, x0, y0 + 20 + i * lh, size, a * fcode); });
    // 平滑移动的高亮框
    const hlA = at(B, .3, .8) * (1 - at(Cc, 0, .5)), hlB = at(B, .62, .8) * (1 - at(Cc, 0, .5)), hlC = at(Cc, 0, .6);
    const box = (i0, i1, col, a, x1 = 1060) => { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a * fcode; ctx.strokeStyle = col; ctx.lineWidth = 3.5;
      roundRect(x0 - 14, y0 + 20 + i0 * lh - 30, x1 - 4, (i1 - i0 + 1) * lh + 8, 10); ctx.stroke(); ctx.restore(); };
    box(0, 4, C.tealL, hlA * (1 - hlB)); box(6, 8, SEVEN[1], hlB); box(7, 7, SEVEN[0], hlC, 640);
    ctx.restore();
    const lab = (lines, y, col, a) => lines.forEach((l, i) => text(l, 300, y + i * 46, i ? 30 : 38, i ? C.cream : col, { font: FONT_ZH, weight: i ? '' : 'bold', alpha: a * fcode }));
    lab(['定义“正常染色”', '距离为 1 的两点', '颜色必须不同'], -280, C.tealL, hlA * (1 - hlB));
    lab(['定理', '不存在正常的五染色'], 40, SEVEN[1], hlB * (1 - hlC));
    lab(['任意函数 ℂ → Fin 5', '不要求可测或连续', '这句 Lean 就是问题本身'], 40, SEVEN[0], hlC);
  }
  // d/e：Comparator
  const fd = at(D, .1, .8) * (1 - at(F, 0, .7));
  if (fd > 0) {
    cardX('挑战文件', ['只写定理陈述', 'theorem … := by sorry'], -560, -240, SEVEN[0], fd * at(D, .1, .8), { ts: 38, bs: 28 });
    cardX('OAI 库', ['真正的证明', 'theorem … := by ⟨证明⟩'], 560, -240, '#60A5FA', fd * at(D, .4, .8), { ts: 38, bs: 28 });
    const cp = at(D, .6, .8);
    cardX('Comparator', ['逐项比对'], 0, 30, SEVEN[1], fd * cp, { ts: 42, bs: 28 });
    arrowX(-430, -150, -160, 0, C.grey, cp * fd, 3); arrowX(430, -150, 160, 0, C.grey, cp * fd, 3);
    if (cp > .9) { flowDots(-430, -150, -170, -5, S.t, SEVEN[0], 3); flowDots(430, -150, 170, -5, S.t + .3, '#60A5FA', 3); }
    const c1 = at(E, .05, .8), c2 = at(E, .45, .8), c3 = at(E, .62, .8);
    text('①  定理陈述与挑战完全一致', -420, 220, 34, C.cream, { font: FONT_ZH, alpha: c1 * fd });
    text('②  只用三条标准公理', -420, 285, 34, C.cream, { font: FONT_ZH, alpha: c2 * fd });
    text('propext · Quot.sound · Classical.choice', -380, 345, 28, C.tealL, { alpha: c3 * fd });
    const ok = at(E, .8, .5, backOut); text('✓', 0, -120, 110 * ok, C.tealL, { align: 'center', alpha: clamp(ok) * fd, glow: 30, glowCol: C.teal });
  }
  // f：规模
  const ff = at(F, 0, .7) * (1 - at(G, 0, .7));
  if (ff > 0) {
    const s = [['121,734', '个 Lean 文件', 121734, '#60A5FA'], ['2590 万', '行代码', 25.9, '#60A5FA'], ['405', '个 Comparator 挑战', 405, SEVEN[1]]];
    s.forEach(([big, small, v, col], i) => { const a = at(F, .05 + i * .14, .7); const x = -560 + i * 560;
      const val = v * easeOut(clamp((F.t - (.05 + i * .14) * F.d) / 1.4));
      const str = i === 1 ? `${Math.round(val * 100)} 万` : counter(val);
      text(str, x, -260, 76, col, { font: FONT_ZH, weight: 'bold', align: 'center', alpha: a });
      text(small, x, -190, 28, C.grey, { font: FONT_ZH, align: 'center', alpha: a }); });
    const rp = at(F, .6, 1.6, easeInOut);
    ctx.save(); ctx.globalAlpha = ff; ctx.lineWidth = 40; ctx.strokeStyle = '#22283A'; ctx.beginPath(); ctx.arc(-240, 110, 140, 0, TAU); ctx.stroke();
    ctx.strokeStyle = C.tealL; ctx.beginPath(); ctx.arc(-240, 110, 140, -Math.PI / 2, -Math.PI / 2 + TAU * 235 / 372 * rp); ctx.stroke(); ctx.restore();
    text(`${Math.round(235 * rp)} / 372`, 0, 80, 64, C.tealL, { font: FONT_ZH, weight: 'bold', alpha: ff * at(F, .6, .6) });
    text('个结果族附有形式化说明', 0, 150, 32, C.cream, { font: FONT_ZH, alpha: ff * at(F, .65, .6) });
  }
  // g：Lean 保证什么
  const fg = at(G, 0, .7);
  if (fg > 0) {
    const xs = [-560, 0, 560];
    chipX('原始数学问题', xs[0], 0, C.cream, 38, fg); chipX('形式化陈述', xs[1], 0, '#60A5FA', 38, fg * at(G, .05, .6)); chipX('证明', xs[2], 0, C.tealL, 38, fg * at(G, .1, .6));
    const p1 = at(G, .2, .8); arrowX(xs[2] - 90, 0, xs[1] + 170, 0, C.tealL, p1, 5);
    text('Lean 保证', (xs[1] + xs[2]) / 2 + 40, -60, 34, C.tealL, { font: FONT_ZH, align: 'center', alpha: p1 });
    const p2 = at(G, .52, .9); arrowX(xs[0] + 190, 0, xs[1] - 170, 0, SEVEN[0], p2, 4, true);
    text('需要人来核对', (xs[0] + xs[1]) / 2, -60, 34, SEVEN[0], { font: FONT_ZH, align: 'center', alpha: p2 });
    if (p2 > .9) { const pu = .5 + .5 * Math.sin(S.t * 5); ctx.save(); ctx.globalAlpha = .25 * pu; ctx.strokeStyle = SEVEN[0]; ctx.lineWidth = 3; roundRect(-560, -110, 470, 90, 16); ctx.stroke(); ctx.restore(); }
  }
};
CH.S03_Lean.cam = S => { const B = S.b('b'), D = S.b('d'); return { z: 1 + .06 * at(B, .2, 3) * (1 - at(D, 0, 1.5)), x: -40 * at(B, .2, 3) * (1 - at(D, 0, 1.5)) }; };
