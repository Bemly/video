// 第二部分：第一次副歌 → 第二段主歌 → 悖论崩溃（第 128 ~ 224 拍）
'use strict';

// C1 门格海绵（光线步进）
shot(128, 132, st => {
  const ang = st.t * .6 + st.lb * .15;
  st.bg = { mode: 3, a: [ang, .45 + Math.sin(st.t * .7) * .25, 4.9 - st.beat * .3 - st.p * .9, 0] };
  drawGirl(0, 40, 520, { alpha: .95, glow: 30, glowCol: C.ink });
  mathText('V → 0,   A → ∞', 0, 420, 44, C.cream, { align: 'center', glow: 14, glowCol: C.teal });
  text('// menger(3)', -900, -470, 22, C.tealL);
  st.fx = { ca: .6 + st.beat * 2, bloomAmt: .5, zoom: 1 + st.beat * .04, grain: .05 };
});

// C2 万花筒：她 × 环
shot(132, 136, st => {
  fillBG(C.ink);
  rings(st, { col: C.teal, r0: 40, r1: 700, n: 6, w: 6, alpha: .8 });
  drawGirl(200, -60, 600, { rot: st.t * .3, alpha: .95 });
  drawTris(-120, 120, 500, (t) => ({ dx: t.cx * 200 * st.beat, dy: t.cy * 200 * st.beat, a: .8 }));
  st.fx = { kal: 6, kalRot: st.t * .5, ca: .8 + st.beat * 2, zoom: 1 + st.beat * .08, bloomAmt: .5 };
});

// C3 超立方体（四维旋转）
shot(136, 140, st => {
  fillBG(C.ink);
  starfield(st, { n: 400, speed: 2, streak: true, alpha: .6 });
  const a1 = st.t * .9, a2 = st.t * .6 + st.beat * .3;
  const P2 = TESS.map(v => { let q = rot4(v, 0, 3, a1); q = rot4(q, 1, 2, a2); q = rot4(q, 2, 3, st.t * .4);
    const w = 2.6 / (3.2 - q[3]); return proj([q[0] * w, q[1] * w, q[2] * w], { yaw: st.t * .3, pitch: .3, dist: 6, fov: 900 }); });
  drawGirl(0, 0, 360, { alpha: .9, glow: 20 });
  drawWire(TESS_E, P2, C.tealL, 3, (a, b) => clamp(1.2 - (a[2] + b[2]) / 8));
  ctx.save(); ctx.shadowColor = C.teal; ctx.shadowBlur = 20; drawWire(TESS_E, P2, C.cream, 1.2); ctx.restore();
  for (const p of P2) { ctx.fillStyle = C.cream; ctx.beginPath(); ctx.arc(p[0], p[1], 5 + st.beat * 5, 0, TAU); ctx.fill(); }
  text('dim(me) = 4 ?', 0, 430, 40, C.cream, { align: 'center' });
  st.fx = { ca: .6 + st.beat * 2, bloomAmt: .7 };
});

// C4 Julia 集 + RGB 分离的她
shot(140, 144, st => {
  const th = st.t * 1.4;
  st.bg = { mode: 1, a: [0, 0, 1.5 - st.beat * .1, 0], b: [.7885 * Math.cos(th), .7885 * Math.sin(th), .06, st.t * .05] };
  girlRGB(st, 0, 30, 700, 1 + st.beat * 3);
  mathText('z ← z^{2} + c', 640, 420, 48, C.cream, { align: 'center', glow: 12, glowCol: C.ink });
  st.fx = { ca: .8 + st.beat * 2.5, bloomAmt: .4, shakeV: [(hash(st.t) - .5) * .01 * st.beat, 0] };
});

// C5 三角形炸开再合拢 + 八重万花筒
shot(144, 148, st => {
  fillBG(C.ink);
  const e = Math.pow(Math.sin(fract(tBeat(st.t) / 2) * Math.PI), 2);
  drawTris(160, 60, 820, t => ({ dx: t.cx * 420 * e * (0.5 + t.r), dy: t.cy * 420 * e * (0.5 + t.r2), rot: e * (t.r - .5) * 3, s: 1 - .2 * e }));
  st.fx = { kal: 8, kalRot: -st.lt * .4, ca: .3 + st.beat * .8, bloomAmt: .4, zoom: .9 + e * .15 };
});

// C6 洛伦兹吸引子
shot(148, 152, st => {
  fillBG(C.ink);
  const L = ASSET.lorenz;
  const n = Math.floor(lerp(3000, L.length, st.p));
  const cam = { yaw: st.t * .5, pitch: .4, dist: 110, fov: 2100, roll: .1 };
  ctx.save(); ctx.lineWidth = 1.4; ctx.globalAlpha = .85;
  for (let seg = 0; seg < 6; seg++) {
    ctx.beginPath(); ctx.strokeStyle = seg % 2 ? C.teal : C.tealL;
    const i0 = Math.floor(n * seg / 6);
    for (let i = i0; i < Math.floor(n * (seg + 1) / 6); i += 2) { const [x, y, z] = L[i]; const [px, py] = proj([x, z - 25, y], cam); i === i0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); }
    ctx.stroke();
  }
  ctx.restore();
  const [hx, hy] = proj([L[n - 1][0], L[n - 1][2] - 25, L[n - 1][1]], cam);
  chibi(hx, hy - 50, .8, st.t);
  ctx.fillStyle = C.cream; ctx.beginPath(); ctx.arc(hx, hy, 8 + 8 * st.beat, 0, TAU); ctx.fill();
  mathText('σ = 10,  ρ = 28,  β = 8/3', -880, -440, 30, C.grey);
  text('chaos is deterministic', 0, 440, 40, C.cream, { align: 'center', glow: 12, glowCol: C.teal });
  st.fx = { ca: .5 + st.beat * 1.5, bloomAmt: .8, bloomThr: .4 };
});

// C7 环面纽结 (3,7)
shot(152, 156, st => {
  fillBG(C.ink);
  const K = torusKnot(3, 7, 900, 2.1, .85);
  const cam = { yaw: st.t * .8, pitch: .5 + Math.sin(st.t) * .3, dist: 7, fov: 900 };
  for (let s = 0; s < 3; s++) {
    const pts = K.map(p => proj([p[0] * (1 + s * .03), p[1] * (1 + s * .03), p[2]], cam));
    glowLine(pts, [C.teal, C.tealL, C.cream][s], 6 - s * 2, 18, .8);
  }
  drawGirl(0, 30, 460, { alpha: .95 });
  const pts = K.map(p => proj(p, cam)).filter(p => p[2] < 0);
  for (const p of pts) { ctx.fillStyle = C.cream; ctx.globalAlpha = .9; ctx.fillRect(p[0] - 1.5, p[1] - 1.5, 3, 3); }
  ctx.globalAlpha = 1;
  text('T(3, 7)', 760, 420, 44, C.cream, { font: FONT_MATH });
  st.fx = { ca: .5 + st.beat * 2, bloomAmt: .8, zoom: 1 + st.beat * .05 };
});

// C8 ∀ε ∃δ 冲击字 + 闪白
shot(156, 160, st => {
  fillBG(C.ink);
  const words = ['∀ε > 0', '∃δ > 0', '|x − me| < δ', '⇒ |f(x) − f(me)| < ε'];
  const k = Math.min(3, Math.floor(st.lb));
  drawGirl(0, 40, 860, { alpha: .35 + .3 * st.beat, sil: k % 2 ? 'silTeal' : undefined });
  const w = words[k], sz = k < 2 ? 220 : 90;
  text(w, 0, 0, sz * (1 + .15 * st.beat), C.cream, { font: FONT_MATH, align: 'center', glow: 30, glowCol: C.teal });
  text('continuity(me)', 0, 400, 30, C.tealL, { align: 'center' });
  st.fx = { ca: 1 + st.beat * 3, zoom: 1 + st.beat * .1, bloomAmt: .8, flash: st.lb > 3.6 ? (st.lb - 3.6) * 2.5 : 0, invert: k === 2 && st.beat > .6 ? .9 : 0 };
});

// V1 康托尔对角线（滚动的二进制矩阵）
shot(160, 168, st => {
  fillBG(C.ink);
  const cell = 46, n = 26, off = st.lb * .5;
  const sh = (i, j) => hash2(i * 1.7, j * 2.3) > .5 ? 1 : 0;
  ctx.save(); ctx.translate(-cell * 3, -cell * 2);
  for (let i = 0; i < n; i++) for (let j = 0; j < n + 6; j++) {
    const x = (j - n / 2) * cell, y = (i - n / 2 + fract(off)) * cell * .75;
    const row = i - Math.floor(off), diag = j === i + 3;
    const v = sh(row, j); const flipped = diag && st.lb > (i / n) * 4;
    text(`${flipped ? 1 - v : v}`, x, y, 26, flipped ? C.tealL : diag ? C.red : C.grey,
      { align: 'center', alpha: diag ? 1 : .6, glow: flipped ? 14 : 0, glowCol: C.teal });
  }
  ctx.restore();
  const p = clamp((st.lb - 4) / 2);
  ctx.fillStyle = 'rgba(17,16,14,.8)'; ctx.fillRect(-520, 300, 1040, 160);
  mathText('d_{n} = 1 − r_{n,n}   ⇒   d ≠ r_{n}', 0, 340, 40, C.cream, { align: 'center', alpha: clamp(st.lb / 2) });
  mathText('|ℕ| < |ℝ|', 0, 410, 60, C.tealL, { align: 'center', alpha: p, glow: 20, glowCol: C.teal });
  st.fx = { ca: .4 + st.beat, bloomAmt: .6, rot: -.08 };
});

// V2 康托尔集
shot(168, 176, st => {
  fillBG(C.ink);
  const W0 = 1500, levels = 8, h = 34, gap = 30;
  const shown = clamp(st.lb * 1.1, 0, levels);
  let cur = [[-W0 / 2, W0 / 2]];
  for (let l = 0; l < levels; l++) {
    const y = -380 + l * (h + gap);
    const a = clamp(shown - l);
    if (a <= 0) break;
    for (const [x0, x1] of cur) { ctx.fillStyle = l % 2 ? C.teal : C.cream; ctx.globalAlpha = a; ctx.fillRect(x0, y, (x1 - x0) * easeOut(a), h); }
    const nx = []; for (const [x0, x1] of cur) { const d = (x1 - x0) / 3; nx.push([x0, x0 + d], [x1 - d, x1]); } cur = nx;
  }
  ctx.globalAlpha = 1;
  const jx = lerp(-W0 / 2 + 40, W0 / 2 - 40, fract(st.lb / 8 * 3));
  chibi(jx, -380 - 60 - Math.abs(Math.sin(st.t * 6.8)) * 60, .8, st.t);
  mathText('dim C = log 2 / log 3 ≈ 0.6309', 0, 300, 44, C.cream, { align: 'center' });
  text('长度为 0，却和实数一样多', 0, 370, 26, C.grey, { font: FONT_ZH, align: 'center' });
  st.fx = { ca: .3 + st.beat, bloomAmt: .6 };
});

// V3 芝诺
shot(176, 184, st => {
  fillBG(C.ink);
  const n = Math.floor(st.lb) + 1, f = easeOut(fract(st.lb) * 2.5);
  let x = -480, y = -480, w = 960, h = 960;
  ctx.save(); ctx.scale(.9, .9);
  for (let k = 1; k <= n; k++) {
    const a = k < n ? 1 : f; const col = [C.teal, C.ink2, C.tealD, '#0B3B39'][k % 4];
    ctx.fillStyle = col; ctx.globalAlpha = .9 * a;
    if (k % 2) { ctx.fillRect(x, y, w / 2, h); x += w / 2; w /= 2; } else { ctx.fillRect(x, y, w, h / 2); y += h / 2; h /= 2; }
  }
  ctx.globalAlpha = 1; ctx.strokeStyle = C.cream; ctx.lineWidth = 3; ctx.strokeRect(-480, -480, 960, 960);
  ctx.restore();
  const S = 1 - Math.pow(.5, n - 1 + f);
  const tx = lerp(-800, 800, S);
  ctx.strokeStyle = C.grey; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-800, 470); ctx.lineTo(800, 470); ctx.stroke();
  chibi(tx, 410 - Math.abs(Math.sin(fract(st.lb) * Math.PI)) * 50, .9, st.t);
  text('0', -800, 500, 22, C.grey, { align: 'center' }); text('1', 800, 500, 22, C.grey, { align: 'center' });
  text(`S = ${S.toFixed(8)}`, 540, -420, 36, C.cream);
  mathText('Σ 1/2^{n} = 1', 540, -340, 48, C.tealL, { glow: 14, glowCol: C.teal });
  st.fx = { ca: .3 + st.beat, bloomAmt: .5 };
});

// V4 德罗斯特：画中画无限递归  f(me) = me
shot(184, 192, st => {
  fillBG(C.ink);
  const K = 0.42;
  const z = fract(st.lb / 4);
  const s0 = Math.pow(1 / K, z);
  const vx = 260, vy = -120;
  for (let k = -1; k < 9; k++) {
    const s = s0 * Math.pow(K, k);
    if (s < .004 || s > 5) continue;
    const fw = 1500 * s, fh = 1000 * s;
    const cx = vx * (1 - s), cy = vy * (1 - s);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate((k + z) * .12);
    ctx.fillStyle = k % 2 ? C.ink : C.ink2; ctx.fillRect(-fw / 2, -fh / 2, fw, fh);
    ctx.strokeStyle = k % 2 ? C.teal : C.cream; ctx.lineWidth = 6 * s; ctx.strokeRect(-fw / 2, -fh / 2, fw, fh);
    drawGirl(-fw * .27, fh * .05, fh * .9, { alpha: .95 });
    mathText('f(me) = me', fw * .12, fh * .3, 80 * s, C.cream);
    ctx.restore();
  }
  text('fixed_point(f)', -900, 470, 24, C.tealL);
  st.fx = { ca: .4 + st.beat * 1.2, bloomAmt: .4, vign: .9 };
});

// V5 希尔伯特曲线
shot(192, 200, st => {
  fillBG(C.ink);
  const ord = Math.min(6, 1 + Math.floor(st.lb * .75));
  const P_ = hilbertPts(ord), size = 860;
  const prog = ord < 6 ? clamp(fract(st.lb * .75) * 1.4) : clamp((st.lb - 20 / 3) / 1.2);
  const n = Math.max(2, Math.floor(P_.length * prog));
  ctx.save(); ctx.lineWidth = Math.max(2, 14 / ord); ctx.shadowColor = C.teal; ctx.shadowBlur = 14;
  const step = Math.max(1, Math.floor(P_.length / 1200));
  for (let i = step; i < n; i += step) {
    ctx.strokeStyle = `hsl(${176 + 30 * Math.sin(i / P_.length * TAU * 2)}, 85%, ${40 + 30 * (i / P_.length)}%)`;
    ctx.beginPath(); ctx.moveTo(P_[i - step][0] * size, P_[i - step][1] * size);
    for (let j = i - step + 1; j <= Math.min(i, n - 1); j++) ctx.lineTo(P_[j][0] * size, P_[j][1] * size);
    ctx.stroke();
  }
  ctx.restore();
  const head = P_[n - 1]; ctx.fillStyle = C.cream; ctx.beginPath(); ctx.arc(head[0] * size, head[1] * size, 10 + 8 * st.beat, 0, TAU); ctx.fill();
  text(`H${ord}`, 760, -400, 70, C.cream, { font: FONT_MATH });
  text('a curve that fills the square', 760, -330, 22, C.grey, { align: 'center' });
  st.fx = { ca: .3 + st.beat, bloomAmt: .7, rot: st.lt * .03 };
});

// V6 龙曲线：逐级折叠展开
shot(200, 208, st => {
  fillBG(C.ink);
  const lvl = 13;
  const k = clamp(st.lb * 1.6, 0, lvl);
  const L = Math.floor(k), f = easeInOut(fract(k));
  let pts = [[0, 0], [1, 0]];
  for (let l = 1; l <= Math.min(lvl, L + 1); l++) {
    const end = pts[pts.length - 1];
    const ang = (l === L + 1 ? f : 1) * Math.PI / 2;
    const rot = pts.slice(0, -1).reverse().map(([x, y]) => { const dx = x - end[0], dy = y - end[1];
      return [end[0] + dx * Math.cos(ang) - dy * Math.sin(ang), end[1] + dx * Math.sin(ang) + dy * Math.cos(ang)]; });
    pts = pts.concat(rot);
  }
  let mnx = 1e9, mxx = -1e9, mny = 1e9, mxy = -1e9; for (const [x, y] of pts) { mnx = Math.min(mnx, x); mxx = Math.max(mxx, x); mny = Math.min(mny, y); mxy = Math.max(mxy, y); }
  const sc = Math.min(1500 / (mxx - mnx + 1e-9), 820 / (mxy - mny + 1e-9));
  const cx = (mnx + mxx) / 2, cy = (mny + mxy) / 2;
  const sp = pts.map(([x, y]) => [(x - cx) * sc, (y - cy) * sc]);
  glowLine(sp, C.teal, Math.max(1.5, 8 - L * .5), 16);
  glowLine(sp, C.cream, Math.max(.8, 3 - L * .2), 0, .8);
  text('fold(fold(fold(…)))', -900, -460, 24, C.tealL);
  text(`2^${Math.min(lvl, L + 1)} segments`, 900, 460, 24, C.grey, { align: 'right' });
  st.fx = { ca: .3 + st.beat, bloomAmt: .7 };
});

// V7 莫比乌斯带上的自指句
shot(208, 216, st => {
  fillBG(C.ink);
  const cam = { yaw: st.t * .5, pitch: .95, dist: 5.2, fov: 1500 };
  const M = (u, v) => { const r = 1.6 + v * .55 * Math.cos(u / 2); return [r * Math.cos(u), v * .55 * Math.sin(u / 2), r * Math.sin(u)]; };
  ctx.save(); ctx.lineWidth = 2;
  for (let j = -4; j <= 4; j++) { const v = j / 4; const pts = []; for (let i = 0; i <= 160; i++) pts.push(proj(M(i / 160 * TAU, v), cam));
    ctx.strokeStyle = j === 0 ? C.tealL : C.teal; ctx.globalAlpha = j === 0 ? .9 : .45; polyline(pts); ctx.stroke(); }
  for (let i = 0; i < 80; i++) { const u = i / 80 * TAU; const a = proj(M(u, -1), cam), b = proj(M(u, 1), cam);
    ctx.globalAlpha = .25; ctx.strokeStyle = C.teal; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
  ctx.restore();
  const sentence = 'this statement is false · ';
  for (let i = 0; i < 52; i++) {
    const u = (i / 52) * TAU * 2 + st.t * .6; const p = proj(M(u, 0), cam);
    const ch = sentence[i % sentence.length];
    text(ch, p[0], p[1], 34 * p[3] / 260, p[2] < 0 ? C.cream : C.grey, { align: 'center', alpha: p[2] < 0 ? 1 : .5 });
  }
  const pc = proj(M(st.t * .9, 0), cam); chibi(pc[0], pc[1] - 40, .6, st.t);
  text('one side · one edge', 0, 440, 30, C.cream, { align: 'center' });
  st.fx = { ca: .4 + st.beat, bloomAmt: .6 };
});

// V8 悖论崩溃
shot(216, 224, st => {
  fillBG(st.lb > 4 && fract(st.lb * 2) < .25 ? '#2a0d10' : C.ink);
  const g = clamp(st.lb / 6);
  girlSlices(st, 0, 30, 860, 1 + g * 4);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  drawGirl(-20 * g - 10 * st.beat, 30, 860, { sil: 'silRed', alpha: .4 * g }); ctx.restore();
  lyric(st, 'assert "this statement is false"', { y: -420, size: 38, p: clamp(st.lb / 2), glitch: g * 2 });
  if (st.lb > 2.5) {
    for (let k = 0; k < Math.floor((st.lb - 2.5) * 4); k++) {
      const y = -300 + (k * 67) % 700, x = (hash(k) - .5) * 900;
      text('ParadoxError: undecidable', x, y, 30 + hash(k + 3) * 20, hash(k + 1) > .5 ? C.red : C.cream, { align: 'center', alpha: .85 });
    }
  }
  st.fx = { glitch: .2 + g * .8, ca: 1 + g * 4, pixel: st.lb > 6 ? 2 + Math.floor((st.lb - 6) * 10) : 0, invert: fract(st.lb * 2) < .06 && st.lb > 3 ? 1 : 0,
            flash: st.lb > 7.5 ? (st.lb - 7.5) * 2 : 0, flashCol: [1, 1, 1], grain: .12, shakeV: [(hash(st.t * 7) - .5) * .02 * g, (hash(st.t * 9) - .5) * .02 * g] };
});
