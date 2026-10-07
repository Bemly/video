// 封面：复用引擎（着色器背景 + 立绘 + 排版）
'use strict';
function renderCover(kind) {
  begin2D();
  const v = kind === 'v';                      // 竖版 3:4
  const t = 188.6;                              // 取最终副歌的时间点，节拍纹理一致
  const st = { t, bt: tBeat(t), lb: 2, len: 4, p: .5, lt: 0, beat: .35, fx: {}, bg: null };
  const bg = { mode: 1, a: [v ? .1 : -.55, v ? -.25 : 0, v ? 1.25 : 1.15, 0], b: [-0.7269, 0.1889, .055, .62] };
  // 放射线与光环
  if (!v) { const g = ctx.createLinearGradient(-960, 0, 260, 0); g.addColorStop(0, 'rgba(17,16,14,.95)'); g.addColorStop(.65, 'rgba(17,16,14,.7)'); g.addColorStop(1, 'rgba(17,16,14,0)');
    ctx.fillStyle = g; ctx.fillRect(-960, -540, 1220, 1080); }
  else { const g = ctx.createLinearGradient(0, -540, 0, -280); g.addColorStop(0, 'rgba(17,16,14,.95)'); g.addColorStop(1, 'rgba(17,16,14,0)'); ctx.fillStyle = g; ctx.fillRect(-405, -540, 810, 260);
    const g2 = ctx.createLinearGradient(0, 330, 0, 540); g2.addColorStop(0, 'rgba(17,16,14,0)'); g2.addColorStop(1, 'rgba(17,16,14,.95)'); ctx.fillStyle = g2; ctx.fillRect(-405, 330, 810, 210); }
  ctx.save(); ctx.translate(v ? 0 : 470, v ? 70 : 40);
  for (let i = 0; i < 28; i++) { const a = i / 28 * TAU; ctx.fillStyle = 'rgba(17,16,14,.38)'; ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.lineTo(2400 * Math.cos(a), 2400 * Math.sin(a)); ctx.lineTo(2400 * Math.cos(a + .11), 2400 * Math.sin(a + .11)); ctx.fill(); }
  ctx.strokeStyle = C.cream; ctx.lineWidth = 4; ctx.globalAlpha = .7; ctx.beginPath(); ctx.arc(0, 0, v ? 330 : 470, 0, TAU); ctx.stroke();
  ctx.globalAlpha = .35; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, v ? 375 : 545, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
  const F = ['e^{iπ} + 1 = 0', 'z ← z^{2} + c', '|ℕ| < |ℝ|', 'Σ 2^{−n} = 1', 'φ = (1+√5)/2', 'me(t) = Σ c_{n}e^{2πint}', '∀ε ∃δ', 'dim = log 3 / log 2'];
  F.forEach((f, i) => { const a = -1.9 + i / F.length * TAU; const R = v ? 375 : 545; const fs = v ? 22 : 30;
    let x = R * Math.cos(a); const y = R * Math.sin(a) * (v ? 1 : .92);
    if (v && y > 250) return;
    const w = textW(f.replace(/[\^_{}]/g, ''), fs, FONT_MATH) + 24; if (v) x = clamp(x, -395 + w / 2, 395 - w / 2); ctx.fillStyle = 'rgba(17,16,14,.72)'; ctx.fillRect(x - w / 2, y - fs * .8, w, fs * 1.6);
    mathText(f, x, y, fs, i % 2 ? C.cream : C.tealL, { align: 'center' }); });
  ctx.restore();
  // 角色（原画 + 色散残影 + 发光）
  const gx = v ? 0 : 470, gy = v ? 90 : 50, gh = v ? 720 : 900;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  drawGirl(gx - 10, gy, gh, { sil: 'silRed', alpha: .25 }); drawGirl(gx + 10, gy + 3, gh, { sil: 'silTeal', alpha: .45 }); ctx.restore();
  drawGirl(gx, gy, gh, { glow: 60, glowCol: C.ink });
  // 左侧压暗渐变，保证标题可读
  if (!v) { const g = ctx.createLinearGradient(-960, 0, 200, 0); g.addColorStop(0, 'rgba(17,16,14,.92)'); g.addColorStop(.7, 'rgba(17,16,14,.6)'); g.addColorStop(1, 'rgba(17,16,14,0)');
    ctx.save(); ctx.globalCompositeOperation = 'destination-over'; ctx.restore(); }
  // 标题排版
  const tx = v ? -360 : -880, ty = v ? -455 : -300;
  
  text('math', tx, ty, v ? 76 : 110, C.teal, { glow: 20, glowCol: C.teal });
  text('.execute', tx + textW('math', v ? 76 : 110), ty, v ? 76 : 110, C.cream, { glow: 16, glowCol: C.teal });
  text('(me) ;', tx, ty + (v ? 84 : 120), v ? 76 : 110, C.cream, { glow: 16, glowCol: C.teal });
  if (!v) {
    text('数学，就是她的全部世界', tx, ty + 240, 46, C.cream, { font: FONT_ZH });
    text('66 个镜头 · 每一帧都由代码绘制', tx, ty + 310, 30, C.tealL, { font: FONT_ZH });
    text('4K60 · world.execute(me); 非官方同人 MV', tx, ty + 360, 28, C.grey, { font: FONT_ZH });
  } else {
    text('数学，就是她的全部世界', 0, 420, 40, C.cream, { font: FONT_ZH, align: 'center', glow: 20, glowCol: C.ink });
    text('4K60 · world.execute(me); 非官方同人 MV', 0, 472, 22, C.tealL, { font: FONT_ZH, align: 'center', glow: 14, glowCol: C.ink });
  }
  // 角标
  text('> math.execute (me) ;█', v ? -360 : -880, v ? 515 : 470, v ? 16 : 24, C.grey);
  composite(t, { ca: .18, bloomAmt: .35, grain: .03, vign: .7 }, bg);
}
window.renderCover = renderCover;
