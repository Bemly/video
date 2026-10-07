// 第 4–6 章：平面染色 / π / Mahler 猜想
'use strict';

// ═══ 第 4 章 平面染色 ══════════════════════════════════════
function moserPts(L, bx, by) {
  const d = 2 * Math.asin(1 / (2 * Math.sqrt(3))); const P2 = { A: [bx, by] };
  for (const [tag, a] of [['1', Math.PI / 2 - d / 2], ['2', Math.PI / 2 + d / 2]]) {
    P2['B' + tag] = [bx + L * Math.cos(a - Math.PI / 6), by - L * Math.sin(a - Math.PI / 6)];
    P2['C' + tag] = [bx + L * Math.cos(a + Math.PI / 6), by - L * Math.sin(a + Math.PI / 6)];
    P2['D' + tag] = [bx + L * Math.sqrt(3) * Math.cos(a), by - L * Math.sqrt(3) * Math.sin(a)];
  }
  return P2;
}
const MOSER_E = [['A', 'B1'], ['A', 'C1'], ['B1', 'C1'], ['B1', 'D1'], ['C1', 'D1'], ['A', 'B2'], ['A', 'C2'], ['B2', 'C2'], ['B2', 'D2'], ['C2', 'D2'], ['D1', 'D2']];
CH.S04_Plane = S => {
  const B = {}; 'abcdefghijk'.split('').forEach(k => B[k] = S.b(k));
  const M = moserPts(270, 0, 300);
  const fm = (1 - at(B.e, .0, .9));
  if (fm > 0) {
    text('下界：Moser 纺锤', -880, -430, 40, C.cream, { font: FONT_ZH, weight: 'bold', alpha: ap(B.a) * fm });
    const rh = at(B.b, .1, .8);
    for (const [tag, col] of [['1', '#60A5FA'], ['2', '#A78BFA']]) { ctx.save(); ctx.globalAlpha = .18 * rh * fm; ctx.fillStyle = col;
      polyline([M.A, M['B' + tag], M['D' + tag], M['C' + tag]], true); ctx.fill(); ctx.restore(); }
    MOSER_E.forEach(([u, v], i) => {
      const p = at(B.a, .35 + i * .035, .5); if (p <= 0) return;
      let col = C.grey; if (rh > .5) col = i < 5 ? '#60A5FA' : i < 10 ? '#A78BFA' : C.grey;
      let w = 5;
      if (i === 10) { const red = at(B.d, .55, .4); if (red > 0) { col = SEVEN[0]; w = 5 + 7 * red * (1 + .3 * Math.sin(S.t * 12)); } }
      ctx.save(); ctx.globalAlpha = fm; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(...M[u]); ctx.lineTo(lerp(M[u][0], M[v][0], p), lerp(M[u][1], M[v][1], p)); ctx.stroke(); ctx.restore();
    });
    const colOf = { A: [B.c, .08, SEVEN[0]], B1: [B.c, .3, SEVEN[3]], C1: [B.c, .36, SEVEN[1]], D1: [B.c, .8, SEVEN[0]],
                    B2: [B.d, .05, SEVEN[1]], C2: [B.d, .1, SEVEN[3]], D2: [B.d, .4, SEVEN[0]] };
    for (const k of Object.keys(M)) {
      const pop = at(B.a, .1 + 'ABCD'.indexOf(k[0]) * .05 + (k[1] === '2' ? .02 : 0), .4, backOut);
      let col = C.cream, r = 15;
      if (colOf[k]) { const [bi, fr, c] = colOf[k]; const q = at(bi, fr, .5); if (q > 0) { col = c; r = 15 + 6 * Math.exp(-(bi.t - fr * bi.d) * 4); } }
      ctx.save(); ctx.globalAlpha = fm; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(M[k][0], M[k][1], Math.max(.1, r * pop), 0, TAU); ctx.fill();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
    }
    const tri = (pts, bi, f0, f1) => { const a = at(bi, f0, .4) * (1 - at(bi, f1, .4)); if (a <= 0) return; ctx.save(); ctx.globalAlpha = a * fm; ctx.strokeStyle = C.cream; ctx.lineWidth = 3; ctx.setLineDash([10, 8]); ctx.lineDashOffset = -S.t * 30; polyline(pts, true); ctx.stroke(); ctx.restore(); };
    tri([M.A, M.B1, M.C1], B.c, .25, .62); tri([M.B1, M.C1, M.D1], B.c, .62, .95); tri([M.A, M.B2, M.C2], B.d, 0, .2); tri([M.B2, M.C2, M.D2], B.d, .2, .45);
    const info = at(B.a, .6, .8);
    ['7 个点', '11 条边', '每条边长度都是 1'].forEach((s, i) => text(s, 520, -160 + i * 60, 36, i === 2 ? SEVEN[1] : C.cream, { font: FONT_ZH, alpha: info * fm }));
    const three = at(B.c, 0, .6);
    text('只有 3 种颜色', 520, 60, 34, C.cream, { font: FONT_ZH, alpha: three * fm });
    [SEVEN[0], SEVEN[3], SEVEN[1]].forEach((c, i) => { ctx.fillStyle = c; ctx.globalAlpha = three * fm; ctx.beginPath(); ctx.arc(770 + i * 38, 60, 13, 0, TAU); ctx.fill(); });
    ctx.globalAlpha = 1;
    const boom = at(B.d, .6, .3, backOut) * (1 - at(B.d, .85, .4));
    text('矛盾！', 0, M.D1[1] - 70, Math.max(1, 64 * boom), SEVEN[0], { font: FONT_ZH, weight: 'bold', align: 'center', alpha: clamp(boom) * fm });
    mathText('χ(ℝ^{2}) ≥ 4', 520, 170, 58, SEVEN[1], { alpha: at(B.d, .85, .6) * fm });
  }
  const fh = at(B.e, 0, .9) * (1 - at(B.h, 0, .9));
  if (fh > 0) {
    const R = 70, grow = at(B.e, .05, 3.5, easeOut);
    const dim = 1 - .62 * at(B.f, 0, .8);
    for (let a = -16; a <= 16; a++) for (let b = -10; b <= 10; b++) {
      const [x, y] = hexCenter(a, b, R); if (Math.abs(x) > 1500 || Math.abs(y) > 900) continue;
      const d = Math.hypot(x, y) / 1500; const p = clamp((grow * 1.3 - d) / .3); if (p <= 0) continue;
      const ci = ((a + 3 * b) % 7 + 7) % 7;
      const special = (a === 0 && b === 0) || (a === 1 && b === 2);
      ctx.save(); ctx.globalAlpha = fh * (special && B.f.t > 0 ? 1 : dim); ctx.fillStyle = SEVEN[ci];
      hexPath(x, y, Math.max(.1, R * easeOut(p) - 1.5)); ctx.fill(); ctx.restore();
    }
    text('上界：七色六边形铺砌', -880, -430, 40, C.cream, { font: FONT_ZH, weight: 'bold', alpha: fh * at(B.e, .3, .8) * (1 - at(B.f, 0, .6)) });
    const ff = at(B.f, .1, .8) * (1 - at(B.h, 0, .5));
    if (ff > 0) {
      ctx.save(); ctx.globalAlpha = ff; ctx.strokeStyle = C.cream; ctx.lineWidth = 2.5; hexPath(0, 0, R); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -R * at(B.f, .15, .6)); ctx.stroke();
      ctx.strokeStyle = SEVEN[1]; ctx.lineWidth = 4; const dp = at(B.f, .4, .7); ctx.beginPath(); ctx.moveTo(-R * Math.cos(Math.PI / 6) * dp, R * .5 * dp); ctx.lineTo(R * Math.cos(Math.PI / 6) * dp, -R * .5 * dp); ctx.stroke();
      ctx.restore();
      mathText('r = 2/5', 12, -R / 2, 20, C.cream, { alpha: at(B.f, .2, .5) * ff });
      text('直径 = 4/5 < 1', -R - 20, 30, 22, SEVEN[1], { font: FONT_ZH, align: 'right', alpha: at(B.f, .45, .5) * ff });
      const uw = R / .4; ctx.save(); ctx.globalAlpha = at(B.f, .65, .5) * ff; ctx.strokeStyle = C.cream; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-uw / 2, R + 40); ctx.lineTo(uw / 2, R + 40); ctx.stroke(); ctx.restore();
      text('长度 1', 0, R + 66, 20, C.cream, { font: FONT_ZH, align: 'center', alpha: at(B.f, .65, .5) * ff });
    }
    const fg = at(B.g, 0, .8) * (1 - at(B.h, 0, .5));
    if (fg > 0) {
      const [x2, y2] = hexCenter(1, 2, R); const d0 = Math.hypot(x2, y2), ux = x2 / d0, uy = y2 / d0;
      ctx.save(); ctx.globalAlpha = fg;
      ctx.setLineDash([8, 8]); ctx.strokeStyle = C.cream; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(x2 * at(B.g, .05, .8), y2 * at(B.g, .05, .8)); ctx.stroke();
      const cc = at(B.g, .3, .7); ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU * cc); ctx.stroke(); ctx.beginPath(); ctx.arc(x2, y2, R, 0, TAU * cc); ctx.stroke(); ctx.setLineDash([]);
      const gp = at(B.g, .45, .7); ctx.strokeStyle = SEVEN[1]; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(ux * R, uy * R); ctx.lineTo(lerp(ux * R, x2 - ux * R, gp), lerp(uy * R, y2 - uy * R, gp)); ctx.stroke();
      ctx.restore();
      const lx = x2 / 2 + uy * 140, ly = y2 / 2 - ux * 140;
      ctx.save(); ctx.globalAlpha = fg * gp; ctx.fillStyle = 'rgba(17,16,14,.88)'; roundRect(lx - 170, ly - 24, 340, 48, 10); ctx.fill(); ctx.restore();
      mathText('(√21 − 2)·r ≈ 1.033 > 1', lx, ly, 24, SEVEN[1], { align: 'center', alpha: fg * gp });
      mathText('√21 · r', x2 / 2 - uy * 50, y2 / 2 + ux * 50, 22, C.cream, { align: 'center', alpha: fg * at(B.g, .1, .5) });
      const s7 = at(B.g, .78, .6);
      ctx.save(); ctx.globalAlpha = s7 * fg; ctx.fillStyle = 'rgba(17,16,14,.88)'; roundRect(-330, -260, 280, 80, 14); ctx.fill(); ctx.restore();
      mathText('χ(ℝ^{2}) ≤ 7', -190, -220, 40, C.tealL, { align: 'center', alpha: s7 * fg });
    }
  }
  const ft = at(B.h, .05, .8) * (1 - at(B.i, 0, .7));
  if (ft > 0) {
    const y = 0, x = v => -800 + (v - 1950) / 80 * 1600;
    ctx.save(); ctx.globalAlpha = ft; ctx.strokeStyle = C.grey; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x(1950) - 30, y); ctx.lineTo(x(1950) - 30 + 1660 * at(B.h, .05, 1.2), y); ctx.stroke();
    ctx.strokeStyle = C.tealL; ctx.lineWidth = 9; ctx.globalAlpha = ft * .5; ctx.beginPath(); ctx.moveTo(x(1950), y); ctx.lineTo(x(lerp(1950, 2018, at(B.h, .1, 2.5, easeInOut))), y); ctx.stroke(); ctx.restore();
    for (const v of [1950, 1970, 1990, 2010, 2030]) text(`${v}`, x(v), y + 40, 24, C.grey, { align: 'center', alpha: ft });
    const mark = (v, s, col, a, dy) => { ctx.fillStyle = col; ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(x(v), y, 12, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; text(s, x(v), y - dy, 32, col, { font: FONT_ZH, align: 'center', alpha: a }); };
    mark(1950, '1950  4 ≤ χ ≤ 7', C.tealL, ft * at(B.h, .1, .6), 60);
    mark(2018, '2018  de Grey：χ ≥ 5', '#60A5FA', ft * at(B.h, .5, .6), 60);
    mark(2026, '2026  OpenAI：χ ≥ 6', SEVEN[1], ft * Math.max(at(B.i, 0, .4), at(B.h, .92, .4)), 130);
    const ia = ft * at(B.h, .55, .8);
    ctx.save(); ctx.globalAlpha = ia; ctx.translate(x(2018) - 60, 230); ctx.rotate(S.t * .2); ctx.strokeStyle = '#60A5FA'; ctx.lineWidth = 1.5;
    for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) { const px = (i + j / 2) * 30, py = j * 26; if (Math.hypot(px, py) > 95) continue;
      for (const [dx, dy] of [[30, 0], [15, 26], [-15, 26]]) if (Math.hypot(px + dx, py + dy) <= 95) { ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + dx, py + dy); ctx.stroke(); } }
    ctx.restore();
    text('1581 个顶点的单位距离图（示意）', x(2018) - 60, 360, 22, C.grey, { font: FONT_ZH, align: 'center', alpha: ia });
  }
  const fp = at(B.i, .05, .8) * (1 - at(B.k, 0, .7));
  if (fp > 0) {
    const n = 26, cell = 300 / n;
    const blobCol = (x, y) => { let best = 0, bv = -9; for (let k = 0; k < 5; k++) { const v = Math.sin(x * (1 + k * .37) + S.t * .4 + k * 2.1) + Math.sin(y * (1.3 - k * .21) - S.t * .3 + k); if (v > bv) { bv = v; best = k; } } return SEVEN[best]; };
    const na = at(B.i, .1, .7), ba = at(B.i, .35, .7);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      ctx.globalAlpha = na * fp; ctx.fillStyle = SEVEN[Math.floor(hash2(i * 31 + j, Math.floor(S.t * 8)) * 5)];
      ctx.fillRect(-780 + i * cell, -260 + j * cell, cell - .5, cell - .5);
      ctx.globalAlpha = ba * fp; ctx.fillStyle = blobCol((i - n / 2) / n * 4, (j - n / 2) / n * 4);
      ctx.fillRect(-150 + i * cell, -260 + j * cell, cell + .5, cell + .5);
    }
    ctx.globalAlpha = 1;
    text('任意染色（示意）', -630, -300, 30, C.cream, { font: FONT_ZH, align: 'center', alpha: na * fp });
    text('弱可测染色（示意）', 0, -300, 30, C.cream, { font: FONT_ZH, align: 'center', alpha: ba * fp });
    arrowX(-460, -110, -170, -110, SEVEN[1], at(B.i, .25, .6) * fp, 5); text('① 转移', -315, -150, 28, SEVEN[1], { font: FONT_ZH, align: 'center', alpha: at(B.i, .25, .6) * fp });
    const x2 = at(B.i, .7, .6); arrowX(170, -110, 450, -110, SEVEN[0], x2 * fp, 5); text('② 五色不可能', 310, -150, 28, SEVEN[0], { font: FONT_ZH, align: 'center', alpha: x2 * fp });
    text('✗', 560, -100, Math.max(1, 120 * at(B.i, .78, .5, backOut)), SEVEN[0], { align: 'center', alpha: x2 * fp }); text('5 色', 560, 0, 30, SEVEN[0], { font: FONT_ZH, align: 'center', alpha: x2 * fp });
    ['代数旋转下的平均', '谱定理', 'Furstenberg–Zimmer 紧扩张'].forEach((s, i) => chipX(s, -480, 170 + i * 70, SEVEN[1], 26, at(B.j, .05 + i * .15, .6) * fp));
    const mm = at(B.j, .62, .9); if (mm > 0) { const m2 = moserPts(80, 560, 300);
      ctx.save(); ctx.globalAlpha = mm * fp; MOSER_E.forEach(([u, v], i) => { ctx.strokeStyle = i < 5 ? '#60A5FA' : i < 10 ? '#A78BFA' : SEVEN[0]; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(...m2[u]); ctx.lineTo(...m2[v]); ctx.stroke(); }); ctx.restore();
      text('Moser 纺锤再次登场', 560, 360, 26, C.grey, { font: FONT_ZH, align: 'center', alpha: mm * fp }); }
  }
  const fk = at(B.k, 0, .8);
  if (fk > 0) {
    const L = 1300, n2x = v => -L / 2 + (v - 1) / 7 * L, y = 40;
    ctx.save(); ctx.globalAlpha = fk; ctx.strokeStyle = C.grey; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(n2x(1) - 30, y); ctx.lineTo(n2x(8) + 30, y); ctx.stroke(); ctx.restore();
    for (let v = 1; v <= 8; v++) { text(`${v}`, n2x(v), y + 50, 36, C.cream, { font: FONT_MATH, align: 'center', alpha: fk });
      if (v <= 5) { const xa = at(B.k, .05 + v * .03, .4); text('×', n2x(v), y, Math.max(1, 44 * xa), C.grey, { align: 'center', alpha: fk * xa }); } }
    for (const v of [6, 7]) { const g = at(B.k, .25, .6, backOut); ctx.fillStyle = SEVEN[1]; ctx.beginPath(); ctx.arc(n2x(v), y, Math.max(.1, 18 * g), 0, TAU); ctx.fill(); }
    mathText('6 ≤ χ(ℝ^{2}) ≤ 7', 0, -170, 84, SEVEN[1], { align: 'center', alpha: at(B.k, .25, .8), glow: 20, glowCol: C.ink });
    chipX('Lean ✓ 五色不够', -230, 230, C.tealL, 30, at(B.k, .45, .6)); chipX('Lean ✓ 七色足够', 230, 230, C.tealL, 30, at(B.k, .52, .6));
    const q = at(B.k, .8, .6, backOut); text('?', (n2x(6) + n2x(7)) / 2, y - 70 + Math.sin(S.t * 3) * 8, Math.max(1, 90 * q), C.cream, { align: 'center', weight: 'bold', alpha: clamp(q) });
  }
};
CH.S04_Plane.cam = S => {
  const D = S.b('d'), E = S.b('e'), F = S.b('f'), G = S.b('g'), H = S.b('h');
  const zin = at(D, .5, .7, easeInOut) * (1 - at(D, .82, .8, easeInOut));
  const M = moserPts(270, 0, 300);
  let x = 0, y = lerp(0, M.D1[1] + 40, zin), z = 1 + .7 * zin;
  const hz = at(F, 0, 1.2, easeInOut) * (1 - at(G, .02, 1.2, easeInOut)), gz = at(G, .02, 1.2, easeInOut) * (1 - at(H, 0, 1, easeInOut));
  const [x2, y2] = hexCenter(1, 2, 70);
  z = z * (1 - .1 * at(E, 0, 3) * (1 - at(F, 0, 1))) * (1 + 2.3 * hz + 1.3 * gz); x += lerp(0, x2 / 2, gz); y += lerp(0, y2 / 2, gz);
  return { x, y, z };
};

// ═══ 第 5 章 π ═════════════════════════════════════════════
const PI_CONV = [[3, 1, '3'], [22, 7, '22/7'], [333, 106, '333/106'], [355, 113, '355/113']];
const FH = (() => { const t = [], s = []; let acc = 0; for (let n = 1; n <= 400; n++) { const v = 1 / (n ** 3 * Math.sin(n) ** 2); acc += v; t.push(v); s.push(acc); } return { t, s }; })();
CH.S05_Pi = S => {
  const B = {}; 'abcdefghijklmn'.split('').forEach(k => B[k] = S.b(k));
  const fa = ap(B.a, 0, .8) * (1 - at(B.b, 0, .6));
  if (fa > 0) {
    text('π', 0, -60, 300, SEVEN[1], { font: FONT_MATH, align: 'center', alpha: fa, glow: 40, glowCol: C.ink });
    const digits = '3.14159265358979323846264338327950288419716939937510582097494459';
    const n = Math.floor(clamp(B.a.t / 3) * digits.length);
    text(digits.slice(0, n), 0, 140, 40, C.cream, { font: FONT_MATH, align: 'center', alpha: fa });
    text('能用分数逼近得多好？', 0, 260, 44, C.cream, { font: FONT_ZH, align: 'center', alpha: at(B.a, .6, .8) * fa });
  }
  const fb = at(B.b, 0, .6) * (1 - at(B.d, 0, .6));
  if (fb > 0) {
    text('狄利克雷逼近定理', 0, -340, 34, C.grey, { font: FONT_ZH, align: 'center', alpha: fb });
    text('对任何无理数 x，有无穷多个分数 p/q 满足', 0, -270, 34, C.cream, { font: FONT_ZH, align: 'center', alpha: fb });
    const nu = at(B.c, .05, .8, easeInOut);
    const exp = nu > .5 ? 'ν' : '2';
    mathText(`|x − p/q| < 1/q^{${exp}}`, 0, -120, 88, C.cream, { align: 'center', alpha: fb });
    if (nu > 0 && nu < 1) { ctx.save(); ctx.globalAlpha = Math.sin(nu * Math.PI) * fb; ctx.strokeStyle = SEVEN[1]; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(300, -150, 40 + 20 * Math.sin(nu * Math.PI), 0, TAU); ctx.stroke(); ctx.restore(); }
    text('μ(x) = sup { ν : 有无穷多个 p/q 满足上式 }', 0, 20, 40, C.tealL, { align: 'center', alpha: at(B.c, .2, .8) * fb, font: FONT_ZH });
    const sa = at(B.c, .5, .8) * fb;
    if (sa > 0) { const x = v => -600 + v / 10 * 1200, y = 200;
      ctx.save(); ctx.globalAlpha = sa; ctx.strokeStyle = C.grey; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x(0), y); ctx.lineTo(x(10), y); ctx.stroke();
      ctx.strokeStyle = '#2A3040'; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(x(0), y); ctx.lineTo(x(2), y); ctx.stroke(); ctx.restore();
      text('不可能', x(1), y + 40, 24, C.grey, { font: FONT_ZH, align: 'center', alpha: sa });
      text('2', x(2), y + 44, 30, C.cream, { font: FONT_MATH, align: 'center', alpha: sa }); text('∞', x(10), y + 44, 34, C.cream, { font: FONT_MATH, align: 'center', alpha: sa });
      text('几乎所有实数：μ = 2', x(2), y - 44, 28, C.tealL, { font: FONT_ZH, align: 'center', alpha: at(B.c, .65, .6) * fb });
      text('Liouville 数：μ = ∞', x(10) - 60, y - 44, 28, SEVEN[0], { font: FONT_ZH, align: 'center', alpha: at(B.c, .78, .6) * fb }); }
  }
  const fd = at(B.d, 0, .6) * (1 - at(B.f, 0, .6));
  if (fd > 0) {
    const cfa = fd * at(B.d, 0, .8);
    text('π 的连分数', -560, -400, 30, C.grey, { font: FONT_ZH, align: 'center', alpha: cfa });
    const terms = ['3', '7', '15', '1', '292', '1', '1', '…'];
    let cx0 = -880; text('π = [', cx0, -320, 52, C.cream, { font: FONT_MATH, alpha: cfa }); cx0 += textW('π = [', 52, FONT_MATH);
    terms.forEach((tm, i) => { const hi = tm === '292' && B.e.t > 0; const a = cfa * at(B.d, .05 + i * .03, .4);
      text(tm + (i < terms.length - 1 ? (i === 0 ? ';' : ',') : ']'), cx0, -320, 52, hi ? SEVEN[1] : C.cream, { font: FONT_MATH, alpha: a, glow: hi ? 20 : 0, glowCol: SEVEN[1] });
      if (hi) { ctx.save(); ctx.globalAlpha = fd * (.6 + .4 * Math.sin(S.t * 6)); ctx.strokeStyle = SEVEN[1]; ctx.lineWidth = 3; roundRect(cx0 - 10, -355, textW('292', 52, FONT_MATH) + 20, 70, 10); ctx.stroke(); ctx.restore(); }
      cx0 += textW(tm + ', ', 52, FONT_MATH); });
    const cols = [C.grey, '#60A5FA', '#A78BFA', SEVEN[1]];
    PI_CONV.forEach(([p, q, s], i) => text(`${s.padEnd(8)} = ${(p / q).toFixed(9)}`, 330, -380 + i * 52, 30, cols[i], { alpha: at(B.d, .25 + i * .12, .6) * fd }));
    text(`π        = ${Math.PI.toFixed(9)}`, 330, -380 + 4 * 52, 30, C.cream, { alpha: at(B.d, .25, .6) * fd });
    const zt = clamp((B.d.t - .35 * B.d.d) / (B.d.d * .6));
    const sc = 38 * Math.pow(10, 5.05 * easeInOut(zt));
    const Y = 140;
    ctx.save(); ctx.globalAlpha = fd; ctx.strokeStyle = C.grey; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-1000, Y); ctx.lineTo(1000, Y); ctx.stroke();
    const step = Math.pow(10, Math.floor(Math.log10(2000 / sc))) / 10;
    const k0 = Math.floor((Math.PI - 1000 / sc) / step), k1 = Math.ceil((Math.PI + 1000 / sc) / step);
    for (let k = k0; k <= k1 && k - k0 < 400; k++) { const x = (k * step - Math.PI) * sc; const maj = ((k % 10) + 10) % 10 === 0; ctx.globalAlpha = fd * (maj ? 1 : .5); ctx.lineWidth = maj ? 2 : 1; ctx.beginPath(); ctx.moveTo(x, Y - (maj ? 16 : 8)); ctx.lineTo(x, Y + (maj ? 16 : 8)); ctx.stroke(); }
    ctx.restore();
    ctx.fillStyle = C.cream; ctx.globalAlpha = fd; ctx.beginPath(); ctx.arc(0, Y, 11, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    text('π', 0, Y - 50, 44, C.cream, { font: FONT_MATH, align: 'center', alpha: fd });
    PI_CONV.forEach(([p, q, s], i) => { const x = (p / q - Math.PI) * sc; if (Math.abs(x) > 980) return; const a = fd * clamp((Math.abs(x) - 30) / 40);
      ctx.fillStyle = cols[i]; ctx.globalAlpha = fd; ctx.beginPath(); ctx.arc(x, Y, 9, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
      text(s, x, Y + 52, 30, cols[i], { font: FONT_MATH, align: 'center', alpha: a }); });
    text(`放大 × ${counter(sc / 38)}`, 0, Y + 130, 30, C.grey, { font: FONT_ZH, align: 'center', alpha: fd });
    if (B.e.t > 0) mathText('355/113 − π ≈ 2.67 × 10^{−7}', 330, -60, 36, SEVEN[1], { alpha: at(B.e, .1, .7) * fd });
  }
  const ff = at(B.f, 0, .6) * (1 - at(B.i, 0, .6));
  if (ff > 0) {
    const X = v => -780 + (v - 1945) / 87 * 1560, Y = v => 330 - v / 45 * 640;
    ctx.save(); ctx.globalAlpha = ff; ctx.strokeStyle = C.grey; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(1945), Y(46)); ctx.lineTo(X(1945), Y(0)); ctx.lineTo(X(2032), Y(0)); ctx.stroke(); ctx.restore();
    for (const v of [10, 20, 30, 40]) text(`${v}`, X(1945) - 18, Y(v), 22, C.grey, { align: 'right', alpha: ff });
    for (const v of [1950, 1970, 1990, 2010, 2030]) text(`${v}`, X(v), Y(0) + 30, 22, C.grey, { align: 'center', alpha: ff });
    text('π 的无理性指数：已证明的上界', 0, -400, 38, C.cream, { font: FONT_ZH, weight: 'bold', align: 'center', alpha: ff });
    const data = [[1953, 42, 'Mahler 1953：42', .02], [1993, 8.016, 'Hata：8.016', .3], [2008, 7.606, 'Salikhov：7.606', .5], [2020, 7.103, 'Zeilberger–Zudilin：7.103', .7]];
    const lp = [[1972, 21], [1992, 27], [2010, 33]];
    data.forEach(([yr, v, s, fr], i) => { const a = at(B.f, fr, .6) * ff; if (a <= 0) return;
      if (i) { const [py, pv] = data[i - 1]; ctx.save(); ctx.globalAlpha = a * .7; ctx.strokeStyle = '#60A5FA'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(X(py), Y(pv)); ctx.lineTo(lerp(X(py), X(yr), a), lerp(Y(pv), Y(v), a)); ctx.stroke(); ctx.restore(); }
      ctx.fillStyle = '#60A5FA'; ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(X(yr), Y(v), 9, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
      if (!i) text(s, X(yr) + 22, Y(v), 26, '#60A5FA', { font: FONT_ZH, alpha: a });
      else { const [lx, ly] = lp[i - 1]; ctx.save(); ctx.globalAlpha = a * .5; ctx.setLineDash([4, 5]); ctx.strokeStyle = '#60A5FA'; ctx.beginPath(); ctx.moveTo(X(lx), Y(ly) + 16); ctx.lineTo(X(yr), Y(v)); ctx.stroke(); ctx.restore(); text(s, X(lx), Y(ly), 26, '#60A5FA', { font: FONT_ZH, align: 'center', alpha: a }); } });
    const g = at(B.g, .05, .8);
    if (g > 0) { ctx.save(); ctx.globalAlpha = g * ff; ctx.setLineDash([8, 8]); ctx.strokeStyle = SEVEN[1]; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(1945), Y(2)); ctx.lineTo(X(2032), Y(2)); ctx.stroke(); ctx.setLineDash([]);
      ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(2020), Y(7.103)); ctx.lineTo(lerp(X(2020), X(2026), g), lerp(Y(7.103), Y(2), g)); ctx.stroke(); ctx.restore();
      const stp = at(B.g, .25, .5, backOut); text('★', X(2026), Y(2), Math.max(1, 50 * stp), SEVEN[1], { align: 'center', alpha: ff * clamp(stp) });
      text('2026（论文声称）：恰好为 2', X(2004), Y(5.2), 26, SEVEN[1], { font: FONT_ZH, align: 'center', alpha: g * ff });
      const th = at(B.g, .55, .8); ctx.save(); ctx.globalAlpha = th * ff; ctx.fillStyle = 'rgba(17,16,14,.9)'; roundRect(-560, -250, 1120, 110, 16); ctx.fill(); ctx.restore();
      mathText('∀ε > 0：|π − p/q| ≥ q^{−2−ε}', -120, -195, 42, SEVEN[1], { align: 'center', alpha: th * ff });
      text('（q 足够大）', 290, -195, 30, SEVEN[1], { font: FONT_ZH, alpha: th * ff }); }
    const h = at(B.h, .05, .7);
    if (h > 0) cardX('注意', ['μ(π) = 2 只说明指数不能超过 2', '并不等于 |π − p/q| ≥ c/q²（部分商有界）'], 0, 60, SEVEN[0], h * ff, { ts: 36, bs: 30 });
  }
  const fi = at(B.i, 0, .6) * (1 - at(B.l, 0, .6));
  if (fi > 0) {
    const up = at(B.j, 0, 1, easeInOut), gone = 1 - at(B.k, 0, .6);
    text('Flint–Hills 级数', lerp(0, -620, up), lerp(-260, -400, up), lerp(40, 28, up), SEVEN[1], { font: FONT_ZH, align: 'center', alpha: fi * gone });
    mathText('Σ 1 / (n^{3} sin^{2} n)', lerp(0, -620, up), lerp(-120, -340, up), lerp(96, 40, up), C.cream, { align: 'center', alpha: fi * gone });
    const pj = clamp(B.j.t / (B.j.d * .55)); const fj = at(B.j, 0, .6) * gone;
    if (fj > 0) {
      const X = n => -820 + n / 400 * 1640, Y = v => 380 - v / 32 * 640;
      ctx.save(); ctx.globalAlpha = fj; ctx.strokeStyle = C.grey; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(0), Y(32)); ctx.lineTo(X(0), Y(0)); ctx.lineTo(X(400), Y(0)); ctx.stroke(); ctx.restore();
      for (const v of [10, 20, 30]) text(`${v}`, X(0) - 14, Y(v), 22, C.grey, { align: 'right', alpha: fj }); for (const n of [100, 200, 300, 400]) text(`${n}`, X(n), Y(0) + 28, 22, C.grey, { align: 'center', alpha: fj });
      const N = Math.floor(400 * easeInOut(pj));
      ctx.save(); ctx.globalAlpha = fj; ctx.strokeStyle = '#60A5FA'; ctx.lineWidth = 3;
      for (let n = 1; n <= N; n++) { const v = Math.min(32, FH.t[n - 1]); if (v < .02) continue; ctx.beginPath(); ctx.moveTo(X(n), Y(0)); ctx.lineTo(X(n), Y(v)); ctx.stroke(); }
      ctx.restore();
      const pts = []; for (let n = 1; n <= N; n++) { pts.push([X(n), Y(n > 1 ? FH.s[n - 2] : 0)], [X(n), Y(FH.s[n - 1])]); }
      if (pts.length > 1) glowLine(pts, SEVEN[1], 3.5, 10, fj);
      if (N >= 355) { const a = at(B.j, .62, .6) * fj;
        mathText('n = 355：1/(355^{3} sin^{2} 355) ≈ 24.6', X(355) - 30, Y(24), 30, '#60A5FA', { align: 'right', alpha: a });
        mathText('S_{355} ≈ 29.4', X(365), Y(31), 30, SEVEN[1], { alpha: a }); }
    }
    const fk = at(B.k, .05, .7);
    if (fk > 0) {
      const x = v => -700 + (v - 1.5) / 2 * 1400, y = 60;
      ctx.save(); ctx.globalAlpha = fk; ctx.strokeStyle = C.grey; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x(1.5), y); ctx.lineTo(x(3.5), y); ctx.stroke();
      ctx.lineWidth = 16; ctx.strokeStyle = SEVEN[0]; ctx.beginPath(); ctx.moveTo(x(2.52), y); ctx.lineTo(x(2.52) + (x(3.5) - x(2.52)) * at(B.k, .1, .7), y); ctx.stroke();
      ctx.strokeStyle = C.tealL; ctx.beginPath(); ctx.moveTo(x(2.48), y); ctx.lineTo(x(2.48) - (x(2.48) - x(2)) * at(B.k, .45, .7), y); ctx.stroke(); ctx.restore();
      for (const [v, s] of [[2, '2'], [2.5, '5/2'], [3, '3']]) text(s, x(v), y + 50, 32, C.cream, { font: FONT_MATH, align: 'center', alpha: fk });
      text('μ > 5/2 ⇒ 发散（Alekseyev）', x(3.05), y - 60, 30, SEVEN[0], { font: FONT_ZH, align: 'center', alpha: at(B.k, .1, .6) * fk });
      text('μ < 5/2 ⇒ 收敛（Meiburg）', x(2.15), y - 60, 30, C.tealL, { font: FONT_ZH, align: 'center', alpha: at(B.k, .45, .6) * fk });
      const d = at(B.k, .82, .5, backOut); ctx.fillStyle = SEVEN[1]; ctx.beginPath(); ctx.arc(x(2), y, Math.max(.1, 20 * d), 0, TAU); ctx.fill();
      text('μ(π) = 2 ✓', x(2), y + 120, 40, SEVEN[1], { font: FONT_ZH, weight: 'bold', align: 'center', alpha: clamp(d) * fk });
    }
  }
  const fl = at(B.l, 0, .6);
  if (fl > 0) {
    const fade1 = 1 - at(B.m, 0, .6);
    for (let i = 0; i < 7; i++) { const a = at(B.l, .05 + i * .04, .5) * fl * fade1; const sp = Math.sin(S.t * .5);
      ctx.save(); ctx.globalAlpha = a; ctx.translate(-420 + i * 16, -40 + i * 10); ctx.rotate(-.05 * i + sp * .02 * i);
      ctx.fillStyle = '#1B1E26'; roundRect(-180, -240, 360, 480, 10); ctx.fill(); ctx.strokeStyle = C.grey; ctx.lineWidth = 1.5; roundRect(-180, -240, 360, 480, 10); ctx.stroke();
      for (let k = 0; k < 14; k++) { ctx.fillStyle = '#3A4258'; ctx.fillRect(-150, -200 + k * 30, 300 - (hash(i * 9 + k) * 120), 5); } ctx.restore(); }
    text('推理摘要', 120, -200, 54, '#A78BFA', { font: FONT_ZH, weight: 'bold', alpha: at(B.l, .1, .6) * fade1 });
    text('Summarized chain of thought', 120, -130, 28, C.grey, { alpha: at(B.l, .15, .6) * fade1 });
    text('42 页 · irrationality-exponent-of-pi.pdf', 120, -80, 28, C.cream, { font: FONT_ZH, alpha: at(B.l, .2, .6) * fade1 });
    text('最初的目标：证明级数收敛，需要 μ(π) < 5/2', 120, 20, 32, SEVEN[1], { font: FONT_ZH, alpha: at(B.l, .55, .6) * fade1 });
    const fm = at(B.m, 0, .6) * (1 - at(B.n, 0, .6));
    if (fm > 0) {
      const words = ['Padé 逼近', '模形式与尖点', 'Hankel 行列式', 'BBP 公式', 'p 进对数', 'Chebyshev 矩', '椭圆延拓', '多变量 Roth 方法', 'Toeplitz 矩阵', '复端点积分'];
      const pos = [[-600, -330], [-120, -360], [380, -320], [700, -180], [-720, -140], [-260, -170], [220, -150], [600, 0], [-480, 30], [40, 20]];
      words.forEach((w, i) => { const a = at(B.m, i * .045, .5) * fm; const [x, y] = pos[i]; const dx = Math.sin(S.t * .7 + i) * 10;
        const sk = at(B.m, .3 + i * .04, .4);
        text(w, x + dx, y, 34, C.cream, { font: FONT_ZH, align: 'center', alpha: a * (1 - .6 * sk) });
        if (sk > 0) { const w2 = textW(w, 34, FONT_ZH); ctx.strokeStyle = SEVEN[0]; ctx.lineWidth = 3; ctx.globalAlpha = a; ctx.beginPath(); ctx.moveTo(x + dx - w2 / 2, y); ctx.lineTo(x + dx - w2 / 2 + w2 * sk, y); ctx.stroke(); ctx.globalAlpha = 1; } });
      const q = at(B.m, .62, .7);
      ctx.save(); ctx.globalAlpha = q * fm; ctx.fillStyle = 'rgba(17,16,14,.9)'; roundRect(-560, 180, 1120, 140, 16); ctx.fill(); ctx.restore();
      text('“This kills approach by dimension alone.”', 0, 225, 36, SEVEN[1], { align: 'center', alpha: q * fm });
      text('“这条路仅凭维数就会失败。” —— 推理摘要原文', 0, 285, 26, C.grey, { font: FONT_ZH, align: 'center', alpha: q * fm });
    }
    const fn = at(B.n, 0, .6);
    if (fn > 0) {
      const x = v => -820 + (v - 1.5) / 6.5 * 1640, y = 120;
      ctx.save(); ctx.globalAlpha = fn; ctx.strokeStyle = C.grey; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x(1.5), y); ctx.lineTo(x(8), y); ctx.stroke(); ctx.restore();
      for (let v = 2; v <= 8; v++) text(`${v}`, x(v), y + 46, 30, C.cream, { font: FONT_MATH, align: 'center', alpha: fn });
      ctx.save(); ctx.globalAlpha = fn; ctx.strokeStyle = C.tealL; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x(2.5), y - 30); ctx.lineTo(x(2.5), y + 30); ctx.stroke(); ctx.restore();
      text('5/2', x(2.5), y - 50, 28, C.tealL, { font: FONT_MATH, align: 'center', alpha: fn });
      text('人类已知：7.103', x(7.103), y - 110, 28, '#60A5FA', { font: FONT_ZH, align: 'center', alpha: fn });
      const m1 = at(B.n, .08, 1.6, easeInOut), m2 = at(B.n, .62, 1.3, easeInOut);
      const v = lerp(lerp(7.103, 2.48, m1), 2, m2);
      ctx.fillStyle = SEVEN[1]; ctx.globalAlpha = fn; ctx.beginPath(); ctx.moveTo(x(v), y - 22); ctx.lineTo(x(v) - 16, y - 52); ctx.lineTo(x(v) + 16, y - 52); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
      text('第一阶段：62/25 = 2.48 < 5/2', 0, -260, 38, SEVEN[1], { font: FONT_ZH, align: 'center', alpha: at(B.n, .1, .6) * fn });
      text('第二阶段：插值行列式 → 2', 0, -190, 38, SEVEN[1], { font: FONT_ZH, align: 'center', alpha: at(B.n, .6, .6) * fn });
    }
  }
};
CH.S05_Pi.cam = S => { const J = S.b('j'); const zj = at(J, .5, 1.2, easeInOut) * (1 - at(J, .92, 1, easeInOut)); return { z: 1 + .3 * zj, x: 380 * zj, y: -60 * zj }; };

// ═══ 第 6 章 Mahler ════════════════════════════════════════
function gammaF(x) { const c = [676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (x < .5) return Math.PI / (Math.sin(Math.PI * x) * gammaF(1 - x)); x -= 1; let a = .99999999999980993; const t = x + 7.5; for (let i = 0; i < 8; i++) a += c[i] / (x + i + 1);
  return Math.sqrt(2 * Math.PI) * Math.pow(t, x + .5) * Math.exp(-t) * a; }
function lpArea(p) { if (p > 500) return 4; if (p < 1.002) return 2; return 4 * gammaF(1 + 1 / p) ** 2 / gammaF(1 + 2 / p); }
function lpPath(p, s, cx, cy, M) { ctx.beginPath(); const e = 2 / p; for (let i = 0; i <= 360; i++) { const t = i / 360 * TAU, c = Math.cos(t), sn = Math.sin(t);
  let x = Math.sign(c) * Math.abs(c) ** e, y = Math.sign(sn) * Math.abs(sn) ** e; if (M) { const nx = M[0] * x + M[1] * y, ny = M[2] * x + M[3] * y; x = nx; y = ny; }
  i ? ctx.lineTo(cx + x * s, cy - y * s) : ctx.moveTo(cx + x * s, cy - y * s); } ctx.closePath(); }
function regPoly(n, R, rot, cx, cy, M) { ctx.beginPath(); for (let i = 0; i <= n; i++) { const a = rot + i / n * TAU; let x = R * Math.cos(a), y = R * Math.sin(a);
  if (M) { const nx = M[0] * x + M[1] * y, ny = M[2] * x + M[3] * y; x = nx; y = ny; } i ? ctx.lineTo(cx + x, cy - y) : ctx.moveTo(cx + x, cy - y); } ctx.closePath(); }
const CUBE_V = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]];
const CUBE_F = [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [2, 3, 7, 6], [1, 2, 6, 5], [0, 3, 7, 4]];
const OCT_V = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
const OCT_F = [[0, 2, 4], [0, 4, 3], [0, 3, 5], [0, 5, 2], [1, 2, 4], [1, 4, 3], [1, 3, 5], [1, 5, 2]];
const TET_V = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]], TET_F = [[0, 1, 2], [0, 1, 3], [0, 2, 3], [1, 2, 3]];
function solid(V, F, cam, s, ox, oy, col, alpha, edge) {
  const P2 = V.map(v => proj([v[0] * s, v[1] * s, v[2] * s], cam));
  const faces = F.map(f => ({ f, z: f.reduce((a, i) => a + P2[i][2], 0) / f.length })).sort((a, b) => b.z - a.z);
  for (const { f, z } of faces) { ctx.beginPath(); f.forEach((i, k) => k ? ctx.lineTo(ox + P2[i][0], oy + P2[i][1]) : ctx.moveTo(ox + P2[i][0], oy + P2[i][1])); ctx.closePath();
    ctx.globalAlpha = alpha * (.35 + .4 * clamp(.5 - z / 6)); ctx.fillStyle = col; ctx.fill(); ctx.globalAlpha = alpha; ctx.strokeStyle = edge || col; ctx.lineWidth = 2.5; ctx.stroke(); }
  ctx.globalAlpha = 1;
}
CH.S06_Mahler = S => {
  const B = {}; 'abcdefghi'.split('').forEach(k => B[k] = S.b(k));
  const U = 230, cx = -420, cy = 20;
  const f2 = 1 - at(B.d, 0, .7);
  if (f2 > 0) {
    ctx.save(); ctx.globalAlpha = .5 * f2 * ap(B.a); ctx.strokeStyle = '#22283A'; ctx.lineWidth = 1;
    for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(cx + i * U / 1.5, cy - 400); ctx.lineTo(cx + i * U / 1.5, cy + 400); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx - 450, cy + i * U / 1.5); ctx.lineTo(cx + 450, cy + i * U / 1.5); ctx.stroke(); }
    ctx.strokeStyle = C.grey; ctx.beginPath(); ctx.moveTo(cx - 470, cy); ctx.lineTo(cx + 470, cy); ctx.moveTo(cx, cy - 420); ctx.lineTo(cx, cy + 420); ctx.stroke(); ctx.restore();
    text('凸几何：极体', -880, -430, 40, C.cream, { font: FONT_ZH, weight: 'bold', alpha: f2 * ap(B.a) });
    const toCircle = at(B.b, .25, 2, easeInOut), toHex = at(B.b, .62, 1.2, easeInOut);
    const p = toCircle < 1 ? lerp(1000, 2, Math.pow(toCircle, .25)) : 2;
    const lin = at(B.c, .1, 1.4, easeInOut); const M = [1 + .35 * lin, .35 * lin, 0, 1 - .2 * lin];
    const det = M[0] * M[3] - M[1] * M[2]; const Minv = [M[3] / det, -M[2] / det, -M[1] / det, M[0] / det];
    ctx.save(); ctx.globalAlpha = f2;
    if (toHex < .5) {
      lpPath(p, U, cx, cy, B.c.t > 0 ? M : null); ctx.fillStyle = 'rgba(244,201,93,.15)'; ctx.fill(); ctx.strokeStyle = SEVEN[1]; ctx.lineWidth = 4; ctx.stroke();
      if (B.b.t > 0) { lpPath(p / (p - 1), U, cx, cy, B.c.t > 0 ? Minv : null); ctx.fillStyle = 'rgba(92,199,192,.15)'; ctx.fill(); ctx.strokeStyle = C.tealL; ctx.stroke(); }
    } else {
      regPoly(6, U, 0, cx, cy, B.c.t > 0 ? M : null); ctx.fillStyle = 'rgba(244,201,93,.15)'; ctx.fill(); ctx.strokeStyle = SEVEN[1]; ctx.lineWidth = 4; ctx.stroke();
      regPoly(6, U * 2 / Math.sqrt(3), Math.PI / 6, cx, cy, B.c.t > 0 ? Minv : null); ctx.fillStyle = 'rgba(92,199,192,.15)'; ctx.fill(); ctx.strokeStyle = C.tealL; ctx.stroke();
    }
    ctx.restore();
    const fa = ap(B.a, .3, .8) * (1 - at(B.b, 0, .6));
    if (fa > 0) {
      const th = .2 + B.a.t * .55;
      const y0 = [Math.cos(th), Math.sin(th)], s1 = Math.abs(y0[0]) + Math.abs(y0[1]); const y = [y0[0] / s1, y0[1] / s1];
      const n = Math.hypot(...y), base = [y[0] / (n * n), y[1] / (n * n)], tg = [-y[1] / n, y[0] / n];
      ctx.save(); ctx.globalAlpha = fa; ctx.strokeStyle = '#60A5FA'; ctx.lineWidth = 3; ctx.beginPath();
      ctx.moveTo(cx + (base[0] - 3 * tg[0]) * U, cy - (base[1] - 3 * tg[1]) * U); ctx.lineTo(cx + (base[0] + 3 * tg[0]) * U, cy - (base[1] + 3 * tg[1]) * U); ctx.stroke();
      ctx.strokeStyle = C.tealL; ctx.lineWidth = 4; ctx.beginPath();
      for (let k = 0; k <= 120; k++) { const a = .2 + (th - .2) * k / 120; const c = Math.cos(a), sn = Math.sin(a), q = Math.abs(c) + Math.abs(sn); k ? ctx.lineTo(cx + c / q * U, cy - sn / q * U) : ctx.moveTo(cx + c / q * U, cy - sn / q * U); }
      ctx.stroke(); ctx.fillStyle = C.tealL; ctx.beginPath(); ctx.arc(cx + y[0] * U, cy - y[1] * U, 9, 0, TAU); ctx.fill(); ctx.restore();
      mathText('K^{∘} = { y : ⟨x, y⟩ ≤ 1  ∀x ∈ K }', 420, -250, 44, C.cream, { align: 'center', alpha: at(B.a, .2, .8) * f2 });
      text('K', cx + U + 30, cy - U - 20, 40, SEVEN[1], { font: FONT_MATH, alpha: fa }); text('K°', cx + 30, cy - 70, 36, C.tealL, { font: FONT_MATH, alpha: at(B.a, .5, .6) * fa });
    }
    const fb = at(B.b, 0, .6);
    if (fb > 0) {
      let aK, aP; if (toHex < .5) { aK = lpArea(p); aP = lpArea(p / (p - 1)); } else { aK = 3 * Math.sqrt(3) / 2; aP = 2 * Math.sqrt(3); }
      const name = toHex >= .5 ? '正六边形  →  9' : toCircle > .95 ? '圆盘 · 圆盘  →  π²' : '正方形 · 菱形  →  8';
      mathText(`|K| = ${aK.toFixed(3)}`, 260, -120, 44, SEVEN[1], { alpha: fb * f2 }); mathText(`|K^{∘}| = ${aP.toFixed(3)}`, 260, -50, 44, C.tealL, { alpha: fb * f2 });
      mathText(`|K|·|K^{∘}| = ${(aK * aP).toFixed(3)}`, 260, 40, 54, C.cream, { alpha: fb * f2 });
      text(name, 260, 120, 34, C.grey, { font: FONT_ZH, alpha: fb * f2 });
      text('线性变换下不变', 260, -220, 32, C.cream, { font: FONT_ZH, alpha: at(B.c, 0, .6) * f2 });
      text('最大：椭圆（Blaschke–Santaló）', 260, 210, 32, C.tealL, { font: FONT_ZH, alpha: at(B.c, .45, .6) * f2 });
      text('最小：？', 260, 285, 52, SEVEN[1], { font: FONT_ZH, weight: 'bold', alpha: at(B.c, .8, .5) * f2 });
    }
  }
  const f3 = at(B.d, 0, .7) * (1 - at(B.f, 0, .7));
  if (f3 > 0) {
    const cam = { yaw: S.t * .45, pitch: .45, dist: 7, fov: 900 };
    solid(CUBE_V, CUBE_F, cam, 1.25, 330, 40, SEVEN[1], f3 * .55);
    solid(OCT_V, OCT_F, cam, 1.25, 330, 40, C.tealL, f3 * .9, C.cream);
    mathText('|K|·|K^{∘}| ≥ 4^{n} / n!', -560, -300, 64, C.cream, { align: 'center', alpha: f3 });
    text('Mahler 猜想（1939）', -560, -220, 32, C.grey, { font: FONT_ZH, align: 'center', alpha: f3 });
    mathText('8 · 4/3 = 32/3 = 64/6 = 4^{3}/3!', -560, -100, 42, SEVEN[1], { align: 'center', alpha: at(B.d, .6, .8) * f3 });
    text('立方体 · 体积 8      正轴体 · 体积 4/3', -560, -40, 26, C.grey, { font: FONT_ZH, align: 'center', alpha: at(B.d, .5, .8) * f3 });
    const hist = [['n = 2', 'Mahler 本人（1939）', '✓', C.tealL], ['n = 3', 'Iriyeh–Shibata（2020）', '✓', C.tealL], ['n ≥ 4', '悬而未决', '?', SEVEN[0]]];
    hist.forEach(([a, b, c, col], i) => { const al = at(B.e, .05 + i * .28, .6) * f3; const y = 100 + i * 70;
      text(a, -820, y, 34, C.cream, { alpha: al, font: FONT_MATH }); text(b, -650, y, 32, col, { font: FONT_ZH, alpha: al }); text(c, -250, y, 40, col, { alpha: al }); });
  }
  const ff = at(B.f, .05, .7) * (1 - at(B.g, 0, .7));
  if (ff > 0) {
    ctx.save(); ctx.globalAlpha = ff; ctx.strokeStyle = SEVEN[1]; ctx.lineWidth = 4; ctx.fillStyle = 'rgba(244,201,93,.15)';
    ctx.translate(-420, -60); ctx.rotate(Math.sin(S.t * .5) * .05); ctx.beginPath(); ctx.rect(-130, -130, 260, 260); ctx.fill(); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.globalAlpha = ff * at(B.f, .2, .6); ctx.strokeStyle = C.tealL; ctx.lineWidth = 4; ctx.fillStyle = 'rgba(92,199,192,.15)';
    ctx.translate(420, -60); ctx.rotate(Math.PI / 4 + Math.sin(S.t * .5) * .05); ctx.beginPath(); ctx.rect(-92, -92, 184, 184); ctx.fill(); ctx.stroke(); ctx.restore();
    text('×', 0, -60, 90, C.cream, { align: 'center', alpha: ff * at(B.f, .2, .6) });
    text('位置坐标 q ∈ K', -420, 130, 34, SEVEN[1], { font: FONT_ZH, align: 'center', alpha: ff }); text('动量坐标 p ∈ K°', 420, 130, 34, C.tealL, { font: FONT_ZH, align: 'center', alpha: ff * at(B.f, .2, .6) });
    mathText('ω_{0} = Σ dq_{j} ∧ dp_{j}        K × K^{∘} ⊂ ℝ^{2n}', 0, 260, 42, C.cream, { align: 'center', alpha: ff * at(B.f, .5, .8) });
  }
  const fg = at(B.g, 0, .7) * (1 - at(B.h, 0, .7));
  if (fg > 0) {
    const w = at(B.g, .1, B.g.d * .8, easeInOut), c = lerp(1, 3.95, w);
    const cam = { yaw: S.t * .4, pitch: .4, dist: 7, fov: 820 };
    const bx = [1.9, 1.15, 1.45]; const BV = CUBE_V.map(v => [v[0] * bx[0], v[1] * bx[1], v[2] * bx[2]]);
    const P2 = BV.map(v => proj(v, cam)); ctx.save(); ctx.globalAlpha = fg; ctx.strokeStyle = '#60A5FA'; ctx.lineWidth = 2;
    for (const [i, j] of [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]) { ctx.beginPath(); ctx.moveTo(P2[i][0] + 300, P2[i][1]); ctx.lineTo(P2[j][0] + 300, P2[j][1]); ctx.stroke(); }
    const r = Math.sqrt(c / Math.PI) * 1.05, ax = 1 + .45 * w, ay = 1 - .25 * w, az = 1 / (ax * ay);
    ctx.strokeStyle = SEVEN[1]; ctx.lineWidth = 1.6;
    for (let k = 1; k < 12; k++) { const v = k / 12 * Math.PI; ctx.beginPath(); for (let i = 0; i <= 60; i++) { const u = i / 60 * TAU; const p = proj([r * ax * Math.cos(u) * Math.sin(v), r * az * Math.cos(v), r * ay * Math.sin(u) * Math.sin(v)], cam); i ? ctx.lineTo(p[0] + 300, p[1]) : ctx.moveTo(p[0] + 300, p[1]); } ctx.stroke(); }
    for (let k = 0; k < 12; k++) { const u = k / 12 * TAU; ctx.beginPath(); for (let i = 0; i <= 40; i++) { const v = i / 40 * Math.PI; const p = proj([r * ax * Math.cos(u) * Math.sin(v), r * az * Math.cos(v), r * ay * Math.sin(u) * Math.sin(v)], cam); i ? ctx.lineTo(p[0] + 300, p[1]) : ctx.moveTo(p[0] + 300, p[1]); } ctx.stroke(); }
    ctx.restore();
    text('K × K°（示意）', 640, -380, 30, '#60A5FA', { font: FONT_ZH, alpha: fg });
    text('球的容量 c', -820, -300, 34, SEVEN[1], { font: FONT_ZH, alpha: fg });
    const gx = v => -820 + v / 4 * 520; ctx.save(); ctx.globalAlpha = fg; ctx.strokeStyle = C.grey; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(gx(0), -220); ctx.lineTo(gx(4), -220); ctx.stroke(); ctx.restore();
    for (let v = 0; v <= 4; v++) text(`${v}`, gx(v), -180, 26, C.cream, { font: FONT_MATH, align: 'center', alpha: fg });
    ctx.fillStyle = SEVEN[1]; ctx.globalAlpha = fg; ctx.beginPath(); ctx.arc(gx(c), -220, 12, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    mathText('c_{G}(K × K^{∘}) = 4', -560, -80, 46, SEVEN[1], { align: 'center', alpha: at(B.g, .75, .6) * fg });
    text('Gromov 宽度', -560, -140, 30, C.cream, { font: FONT_ZH, align: 'center', alpha: at(B.g, .75, .6) * fg });
  }
  const fh = at(B.h, 0, .7) * (1 - at(B.i, 0, .7));
  if (fh > 0) {
    mathText('vol(B^{2n}(c)) = c^{n} / n!', 0, -220, 60, C.cream, { align: 'center', alpha: at(B.h, .02, .7) * fh }); text('容量 c 的 2n 维球的体积', 0, -160, 28, C.grey, { font: FONT_ZH, align: 'center', alpha: at(B.h, .02, .7) * fh });
    mathText('c^{n} / n!  ≤  vol(K × K^{∘})  =  |K|·|K^{∘}|', 0, -50, 60, C.cream, { align: 'center', alpha: at(B.h, .3, .7) * fh }); text('辛嵌入保持体积', 0, 10, 28, C.grey, { font: FONT_ZH, align: 'center', alpha: at(B.h, .3, .7) * fh });
    const l3 = at(B.h, .62, .8);
    mathText('c → 4   ⟹   |K|·|K^{∘}| ≥ 4^{n} / n!', 0, 140, 70, SEVEN[1], { align: 'center', alpha: l3 * fh, glow: 20 * l3, glowCol: C.ink });
    if (l3 > .9) { ctx.save(); ctx.globalAlpha = fh * (.5 + .5 * Math.sin(S.t * 4)); ctx.strokeStyle = SEVEN[1]; ctx.lineWidth = 3; roundRect(-560, 90, 1120, 100, 16); ctx.stroke(); ctx.restore(); }
  }
  const fi = at(B.i, 0, .7);
  if (fi > 0) {
    const cam = { yaw: S.t * .5, pitch: .4, dist: 7, fov: 760 };
    solid(CUBE_V, CUBE_F, cam, .9, -520, 120, SEVEN[1], fi * .7); solid(OCT_V, OCT_F, { ...cam, yaw: -S.t * .4 }, 1.25, -80, 120, C.tealL, fi * .8, C.cream);
    solid(TET_V, TET_F, { ...cam, yaw: S.t * .6 }, .95, 480, 120, SEVEN[0], fi * at(B.i, .5, .6) * .85, C.cream);
    text('对称：Hanner 多面体（的线性像）取等', -300, -330, 34, C.cream, { font: FONT_ZH, align: 'center', alpha: fi }); mathText('4^{n} / n!', -300, -260, 44, SEVEN[1], { align: 'center', alpha: fi });
    text('非对称：单纯形取等', 480, -330, 34, SEVEN[0], { font: FONT_ZH, align: 'center', alpha: at(B.i, .5, .6) }); mathText('(n+1)^{n+1} / (n!)^{2}', 480, -260, 44, SEVEN[0], { align: 'center', alpha: at(B.i, .5, .6) });
  }
};
CH.S06_Mahler.cam = S => ({ z: 1 + .04 * Math.sin(S.lt * .2) });
