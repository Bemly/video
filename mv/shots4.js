// 第四部分：最终副歌（16 小节，每小节一击）→ 尾声（第 352 拍 ~ 结束）
'use strict';
const FIN = 352;
const bar = k => [FIN + 4 * k, FIN + 4 * k + 4];

// 1 门格海绵：穿越
shot(...bar(0), st => {
  st.bg = { mode: 3, a: [st.t * .3, .2, 1.6 - st.p * 1.2, 0] };
  drawGirl(0, 30, 420, { sil: 'silCream', alpha: .25 + .5 * st.beat, glow: 40 });
  lyric(st, 'enter(me)', { y: 420, size: 44, p: clamp(st.lb), glow: 14, glowCol: C.teal });
  st.fx = { ca: .8 + st.beat * 2.5, zoom: 1 + st.beat * .06, bloomAmt: .5 };
});
// 2 螺旋二十四面体（gyroid）
shot(...bar(1), st => {
  st.bg = { mode: 4, a: [st.t * .5, .4, 3.2 - st.beat * .3, 3.0], b: [0, 0, 0, 2.2] };
  girlRGB(st, 0, 30, 640, 1 + 3 * st.beat, { alpha: .95 });
  mathText('sin x cos y + sin y cos z + sin z cos x = 0', 0, 440, 30, C.cream, { align: 'center' });
  st.fx = { ca: .8 + st.beat * 2.5, bloomAmt: .4 };
});
// 3 十二重万花筒
shot(...bar(2), st => {
  fillBG(C.ink);
  drawGirl(260, -80, 700, { rot: st.t * .6 });
  rings(st, { rate: 2, col: C.tealL, r0: 10, r1: 900, n: 5, w: 8 });
  st.fx = { kal: 12, kalRot: st.t * .8, ca: 1 + st.beat * 2, zoom: 1 + st.beat * .12, bloomAmt: .5 };
});
// 4 随音频变化的 Julia 集
shot(...bar(3), st => {
  const cr = -.8 + .25 * Math.sin(st.t * 2.2) + .05 * st.low, ci = .156 + .2 * Math.cos(st.t * 1.7);
  st.bg = { mode: 1, a: [0, 0, 1.35 + st.beat * .15, 0], b: [cr, ci, .08, st.t * .1] };
  drawGirl(0, 30, 620, { glow: 40, glowCol: C.ink });
  st.fx = { ca: 1 + st.beat * 3, bloomAmt: .4, rot: st.lt * .2 };
});
// 5 旋转的牛顿分形 × 万花筒
shot(...bar(4), st => {
  st.bg = { mode: 5, a: [0, 0, 1.8 - st.beat * .2, 0], b: [st.t * 1.2, 0, 0, 0] };
  drawGirl(0, 0, 420, { glow: 30, glowCol: C.ink });
  st.fx = { kal: 6, kalRot: st.t * .4, ca: .8 + st.beat * 2, zoom: 1 + st.beat * .08, bloomAmt: .4 };
});
// 6 超立方体 + 星流
shot(...bar(5), st => {
  fillBG(C.ink);
  starfield(st, { n: 600, speed: 4, streak: true });
  const P2 = TESS.map(v => { let q = rot4(v, 0, 3, st.t * 1.6); q = rot4(q, 1, 2, st.t * 1.1);
    const w = 2.6 / (3.2 - q[3]); return proj([q[0] * w, q[1] * w, q[2] * w], { yaw: st.t * .5, pitch: .4, dist: 5, fov: 1000 * (1 + st.beat * .1) }); });
  drawGirl(0, 0, 420);
  ctx.save(); ctx.shadowColor = C.teal; ctx.shadowBlur = 25; drawWire(TESS_E, P2, C.tealL, 4); ctx.restore();
  st.fx = { ca: 1 + st.beat * 3, bloomAmt: .8 };
});
// 7 叶序爆发
shot(...bar(6), st => {
  fillBG(C.ink);
  const ga = Math.PI * (3 - Math.sqrt(5)); const e = 1 + 1.5 * st.beat;
  ctx.save(); ctx.rotate(st.t * .8);
  for (let i = 1; i < 1400; i++) { const r = 17 * Math.sqrt(i) * e, a = i * ga;
    ctx.fillStyle = i % 21 === 0 ? C.cream : i % 13 === 0 ? C.tealL : C.teal;
    ctx.beginPath(); ctx.arc(r * Math.cos(a), r * Math.sin(a), 2 + 4 * Math.sqrt(i / 1400), 0, TAU); ctx.fill(); }
  ctx.restore();
  drawGirl(0, 20, 520, { glow: 30, glowCol: C.ink });
  st.fx = { ca: .8 + st.beat * 2, bloomAmt: .6, rot: st.lt * .2 };
});
// 8 ∴ me ∈ math
shot(...bar(7), st => {
  fillBG(C.ink);
  mathRain(st, { alpha: .35, speed: 2 });
  girlRGB(st, -420, 40, 820, 2 + 4 * st.beat);
  text('∴ me ∈ math', 420, 0, 110 * (1 + .1 * st.beat), C.cream, { font: FONT_MATH, align: 'center', glow: 30, glowCol: C.teal });
  st.fx = { ca: 1.2 + st.beat * 3, bloomAmt: .7, glitch: st.beat > .7 ? .4 : 0 };
});
// 9 曼德博快速放大
shot(...bar(8), st => {
  const w = 3 * Math.pow(.0004 / 3, easeIn(st.p));
  st.bg = { mode: 2, a: [-0.10109636384562, 0.95628651080914, w, 0], b: [0, 0, 1.9, st.t * .02] };
  drawGirl(-620, 120, 600, { glow: 30, glowCol: C.ink, alpha: .95 });
  st.fx = { ca: .8 + st.beat * 2, bloomAmt: .3, zoom: 1 + st.beat * .05 };
});
// 10 一小节内用本轮画完她
shot(...bar(9), st => {
  fillBG(C.ink);
  const s = 450, tt = clamp(st.p * 1.05), K = 160, M = 700, tr = [];
  for (let i = 0; i <= M * tt; i++) { const p = epicycle(i / M, K, s); tr.push(p[p.length - 1]); }
  glowLine(tr, C.tealL, 4, 20);
  const ch = epicycle(tt, K, s); ctx.save(); ctx.strokeStyle = C.cream; ctx.globalAlpha = .7; polyline(ch.slice(0, 60)); ctx.stroke(); ctx.restore();
  if (st.p > .85) drawGirl(0, 0, 900, { alpha: (st.p - .85) / .15 });
  st.fx = { ca: .8 + st.beat * 2, bloomAmt: .8, zoom: 1 + st.beat * .06 };
});
// 11 沃罗诺伊 + 她
shot(...bar(10), st => {
  const seeds = []; for (let i = 0; i < 24; i++) { const a = hash(i) * TAU + st.t * (.6 + hash(i + 2)), r = .1 + hash(i + 7) * .7 * (1 + st.beat * .2);
    seeds.push(r * Math.cos(a) * 1.5, r * Math.sin(a) * .85); }
  st.bg = { mode: 6, a: [24, 0, 1, 0], seeds };
  drawGirl(0, 30, 740, { glow: 40, glowCol: C.ink });
  st.fx = { ca: 1 + st.beat * 2, bloomAmt: .3, invert: st.beat > .85 ? .8 : 0 };
});
// 12 洛伦兹 + 纽结
shot(...bar(11), st => {
  fillBG(C.ink);
  const L = ASSET.lorenz, cam = { yaw: st.t * 1.2, pitch: .3, dist: 110, fov: 2000 };
  ctx.save(); ctx.strokeStyle = C.teal; ctx.lineWidth = 1.2; ctx.globalAlpha = .7; ctx.beginPath();
  for (let i = 0; i < L.length; i += 3) { const [x, y, z] = L[i]; const [px, py] = proj([x, z - 25, y], cam); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); ctx.restore();
  const K = torusKnot(2, 5, 600, 2.2, .9).map(p => proj(p, { yaw: -st.t, pitch: .6, dist: 7, fov: 900 }));
  glowLine(K, C.cream, 4, 20);
  drawGirl(0, 20, 440);
  st.fx = { ca: 1 + st.beat * 2.5, bloomAmt: .8, zoom: 1 + st.beat * .06 };
});
// 13 三角形炸开 → 六重万花筒
shot(...bar(12), st => {
  fillBG(C.ink);
  const e = Math.pow(Math.sin(fract(tBeat(st.t)) * Math.PI), 3);
  drawTris(150, 0, 900, t => ({ dx: t.cx * 600 * e * (.5 + t.r), dy: t.cy * 600 * e * (.5 + t.r2), rot: e * (t.r - .5) * 4 }));
  st.fx = { kal: 6, kalRot: st.t * .6, ca: 1 + st.beat * 2, zoom: .95 + e * .15, bloomAmt: .5 };
});
// 14 德罗斯特加速
shot(...bar(13), st => {
  fillBG(C.ink);
  const K = .45, z = fract(st.lb / 1), s0 = Math.pow(1 / K, z);
  for (let k = -1; k < 9; k++) { const s = s0 * Math.pow(K, k); if (s < .004 || s > 5) continue;
    ctx.save(); ctx.translate(0, 0); ctx.rotate((k + z) * .35);
    ctx.strokeStyle = k % 2 ? C.teal : C.cream; ctx.lineWidth = 8 * s; ctx.strokeRect(-800 * s, -450 * s, 1600 * s, 900 * s);
    drawGirl(0, 0, 820 * s, { alpha: .9 }); ctx.restore(); }
  mathText('f(me) = me', 0, 440, 44, C.cream, { align: 'center' });
  st.fx = { ca: 1 + st.beat * 2, bloomAmt: .5 };
});
// 15 公式光环
const HALO = ['e^{iπ} + 1 = 0', 'φ = (1+√5)/2', 'Σ 2^{−n} = 1', 'z ← z^{2} + c', '|ℕ| < |ℝ|', 'n+1 := n ∪ {n}',
  'me(t) = Σ c_{n}e^{2πint}', '∀ε ∃δ', 'dim = log 3 / log 2', 'T(3, 7)', '{7, 3}', '137.5°'];
shot(...bar(14), st => {
  fillBG(C.ink);
  ctx.save(); ctx.rotate(st.t * .15);
  for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; ctx.fillStyle = 'rgba(3,148,141,.22)'; ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.lineTo(1400 * Math.cos(a), 1400 * Math.sin(a)); ctx.lineTo(1400 * Math.cos(a + .13), 1400 * Math.sin(a + .13)); ctx.fill(); }
  ctx.restore();
  ctx.strokeStyle = C.teal; ctx.lineWidth = 3; ctx.globalAlpha = .3 + .6 * st.beat; ctx.beginPath(); ctx.arc(0, 0, 400, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
  HALO.forEach((f, i) => { const a = st.t * .7 + i / HALO.length * TAU; const x = 700 * Math.cos(a), y = 380 * Math.sin(a);
    mathText(f, x, y, 34 * (1 + .1 * st.beat), i % 2 ? C.cream : C.tealL, { align: 'center', alpha: .6 + .4 * (y + 380) / 760 }); });
  drawGirl(0, 30, 760, { glow: 30 });
  st.fx = { ca: .8 + st.beat * 2, bloomAmt: .6, zoom: 1 + st.beat * .05 };
});
// 16 碎裂 → 坍缩 → ∎
shot(...bar(15), st => {
  fillBG(C.ink);
  const p = st.p;
  if (p < .55) {
    const e = easeOut(p / .55);
    drawTris(0, 0, 820, t => ({ dx: t.cx * 1600 * e * (.4 + t.r), dy: t.cy * 1600 * e * (.4 + t.r2), rot: e * (t.r - .5) * 10, a: 1 - e * .4 }));
  } else if (p < .85) {
    const e = easeIn((p - .55) / .3);
    drawTris(0, 0, 820, t => ({ dx: t.cx * 1600 * (1 - e) * (.4 + t.r) - t.cx * 820 * e, dy: t.cy * 1600 * (1 - e) * (.4 + t.r2) - t.cy * 820 * e,
      rot: (1 - e) * (t.r - .5) * 10, s: 1 - e, a: .6 }));
  } else {
    const e = easeOut((p - .85) / .1); const s = 90 * backOut(e);
    ctx.fillStyle = C.cream; ctx.fillRect(-s / 2, -s / 2, s, s);
  }
  st.fx = { ca: 1 + st.beat * 3, bloomAmt: .9, flash: p > .97 ? (p - .97) * 25 : 0, cutAmt: .5 };
});

// 尾声 1：终端返回
shot(416, 436, st => {
  fillBG(C.ink);
  starfield(st, { n: 300, speed: .3, alpha: .5 });
  const lines = [['> return QED ;', C.cream], ['∴  me ∈ math', C.tealL], ['[ ok ] all proofs terminated', C.grey], ["process 'me' exited with code 0", C.grey]];
  lines.forEach(([s, c], i) => { const p = clamp((st.lb - 1 - i * 3) / 2.5); if (p <= 0) return; text(typed(s, p), -860, -300 + i * 60, 34, c); });
  // 她化作粒子缓缓上升
  const d = clamp((st.lb - 8) / 12);
  girlParticles(st, 460, 40, 820, (q, i) => {
    const k = clamp(d * 1.6 - (1 - (q.y + .5)) * .6);
    return { dy: -k * k * 600 * (.5 + q.h), dx: Math.sin(st.t + q.h * 30) * 40 * k, a: 1 - k * k };
  }, { skip: 1, size: 2.4 });
  if (fract(st.t * 1.6) < .55) { ctx.fillStyle = C.cream; ctx.fillRect(-860, -300 + 4 * 60 - 18, 20, 36); }
  st.fx = { scan: .4, grain: .06, bloomAmt: .5, flash: st.lb < 1 ? (1 - st.lb) : 0, cutAmt: 0 };
});
// 尾声 2：标题与署名
shot(436, 470, st => {
  fillBG(C.ink);
  bgDots(st, { alpha: .15, react: .3 });
  const end = (SONG_END - st.t);
  const a = clamp(st.lb / 3) * clamp((end - .3) / 3.5);
  drawGirl(480, 30, 860, { alpha: a, glow: 30 });
  text('math.execute (me) ;', -860, -80, 72, C.cream, { alpha: a, glow: 16, glowCol: C.teal });
  text('math', -860, -80, 72, C.teal, { alpha: a });
  const cr = ['音乐 · Mili — world.execute (me) ;', '角色 · 几何风猫耳少女', '画面 · Canvas 2D + WebGL，逐帧代码生成'];
  cr.forEach((s, i) => text(s, -860, 30 + i * 46, 26, C.grey, { font: FONT_ZH, alpha: a * clamp(st.lb - 2 - i * .6) }));
  if (fract(st.t * 1.6) < .55) { ctx.fillStyle = C.cream; ctx.globalAlpha = clamp(end / 1.5); ctx.fillRect(-860 + textW('math.execute (me) ;', 72) + 10, -112, 30, 64); ctx.globalAlpha = 1; }
  st.fx = { scan: .3, grain: .06, bloomAmt: .4, cutAmt: 0 };
});
