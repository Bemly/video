// 讲解视频的“舞台”：一个连续的世界坐标系 + 一台连续运动的摄像机。
// 每章是世界里的一个“站点”；章节之间摄像机飞行过去（拉远—平移—旋转—推近），绝无硬切。
'use strict';
let TL = null;
const CH = {};                     // 章节绘制函数：CH[key](S)
const STATION = {};                // 章节在世界中的位置
async function loadTimeline() {
  TL = await fetch('timeline.json').then(r => r.json());
  TL.scenes.forEach((s, i) => {
    STATION[s.key] = { x: i * 2300, y: Math.sin(i * 1.3) * 700, r: 0, i };
  });
}

// 节拍信息：S.b('a') → { t: 距该句开始的秒数, p: 0..1, d: 时长, on }
function beatInfo(sc, k, t) {
  const b = sc.beats[k]; if (!b) return { t: -1e9, p: 0, d: 1, on: false };
  const d = b.t1 - b.t0; return { t: t - b.t0, p: clamp((t - b.t0) / d), d, on: t >= b.t0 && t < b.t1 + .45 };
}
// 进场缓动：从 beat 起点后 delay 秒开始、持续 dur 秒
function ap(bi, delay = 0, dur = .8, ease = easeOut) { return ease(clamp((bi.t - delay) / dur)); }
// 在一句话的第 frac 处开始
function at(bi, frac, dur = .8, ease = easeOut) { return ease(clamp((bi.t - frac * bi.d) / dur)); }

function camAt(t) {
  const sc = TL.scenes;
  // 找到所在章节与飞行窗口
  for (let i = 0; i < sc.length; i++) {
    const s = sc[i], st = STATION[s.key];
    const next = sc[i + 1];
    const flyStart = next ? next.start - 1.55 : 1e9, flyEnd = next ? next.start + .35 : 1e9;
    if (t < flyStart || !next) {
      const lt = t - s.start;
      const local = CH[s.key] && CH[s.key].cam ? CH[s.key].cam(mkS(s, t)) : { x: 0, y: 0, z: 1, r: 0 };
      return { x: st.x + (local.x || 0) + Math.sin(lt * .21) * 6, y: st.y + (local.y || 0) + Math.cos(lt * .17) * 5,
               z: (local.z || 1) * (1 + .006 * Math.sin(lt * .3)), r: st.r + (local.r || 0), scene: i, both: null };
    }
    if (t < flyEnd) {
      const e = easeInOut((t - flyStart) / (flyEnd - flyStart));
      const a = camAtScene(i, flyStart), b = camAtScene(i + 1, flyEnd);
      const dip = 1 - .4 * Math.sin(Math.PI * e);
      return { x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e) - 220 * Math.sin(Math.PI * e), z: lerp(a.z, b.z, e) * dip,
               r: lerp(a.r, b.r, e) + .12 * Math.sin(Math.PI * e), scene: i, both: i + 1, e };
    }
  }
}
function camAtScene(i, t) {
  const s = TL.scenes[i], st = STATION[s.key], lt = t - s.start;
  const local = CH[s.key] && CH[s.key].cam ? CH[s.key].cam(mkS(s, t)) : { x: 0, y: 0, z: 1, r: 0 };
  return { x: st.x + (local.x || 0) + Math.sin(lt * .21) * 6, y: st.y + (local.y || 0) + Math.cos(lt * .17) * 5,
           z: (local.z || 1) * (1 + .006 * Math.sin(lt * .3)), r: st.r + (local.r || 0) };
}
function mkS(s, t) {
  return { t, lt: t - s.start, key: s.key, b: k => beatInfo(s, k, t), fx: {}, bg: null, sc: s };
}

// 世界背景：两层视差（点阵 + 六边形格），随摄像机移动
function worldBG(cam, t) {
  fillBG(C.ink);
  const layers = [{ par: .35, gap: 90, a: .22, r: 1.6 }, { par: .7, gap: 54, a: .28, r: 1.3 }];
  for (const L of layers) {
    const z = cam.z * (1 - (1 - L.par) * .5);
    ctx.save(); ctx.rotate(-cam.r * L.par);
    const ox = -cam.x * L.par * z, oy = -cam.y * L.par * z, g = L.gap * z;
    ctx.fillStyle = C.grey;
    const w = VW() * .75, h = VH() * .75;
    for (let x = ((ox % g) + g) % g - w; x < w; x += g) for (let y = ((oy % g) + g) % g - h; y < h; y += g) {
      const d = Math.hypot(x, y) / 1300; ctx.globalAlpha = L.a * (1 - d * .6);
      ctx.beginPath(); ctx.arc(x, y, L.r * Math.max(.6, z), 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

// 字幕：屏幕空间、下三分之一
function drawCaption(t) {
  for (const s of TL.scenes) for (const k in s.beats) for (const [a, b, txt] of s.beats[k].sents) {
    if (t < a - .15 || t > b + .25) continue;
    const pieces = splitCap(txt); const tot = pieces.reduce((x, p) => x + p.length, 0);
    let u = a;
    for (const pc of pieces) {
      const d = (b - a) * pc.length / tot; const ta = u, tb = u + d; u = tb;
      if (t < ta - .12 || t > tb + .12) continue;
      const al = clamp((t - ta + .12) / .18) * clamp((tb + .12 - t) / .18);
      const size = 34, y = VH() / 2 - 62, w = textW(pc, size, FONT_ZH) + 56;
      ctx.save(); ctx.globalAlpha = al * .78; ctx.fillStyle = '#07090F';
      roundRect(-w / 2, y - 30, w, 60, 14); ctx.fill(); ctx.restore();
      text(pc, 0, y + 1, size, C.cream, { font: FONT_ZH, align: 'center', alpha: al });
    }
  }
}
function splitCap(s, max = 24) {
  const parts = s.split(/(?<=[，；：、])/); const out = []; let cur = '';
  for (const p of parts) { if ((cur + p).length <= max || !cur) cur += p; else { out.push(cur); cur = p; } }
  if (cur) out.push(cur);
  const res = [];
  for (let o of out) { if (o.length <= max + 4) { res.push(o); continue; }
    const k = Math.ceil(o.length / max), L = Math.ceil(o.length / k); let i = 0;
    while (i < o.length) { let j = Math.min(o.length, i + L); while (j < o.length && /[A-Za-z0-9.–'’-]/.test(o[j - 1]) && /[A-Za-z0-9.–'’-]/.test(o[j])) j++; res.push(o.slice(i, j)); i = j; } }
  return res.map(x => x.trim()).filter(Boolean);
}
function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

// 常用 UI 部件
function chipX(s, x, y, col, size = 26, a = 1, fillA = .14) {
  const w = textW(s, size, FONT_ZH) + 34, h = size + 22;
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = col; ctx.globalAlpha *= fillA; roundRect(x - w / 2, y - h / 2, w, h, 12); ctx.fill();
  ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = 2; roundRect(x - w / 2, y - h / 2, w, h, 12); ctx.stroke(); ctx.restore();
  text(s, x, y + 1, size, col, { font: FONT_ZH, align: 'center', alpha: a });
  return w;
}
function cardX(title, lines, x, y, col, a = 1, o = {}) {
  const ts = o.ts || 34, bs = o.bs || 24;
  const w = Math.max(textW(title, ts, FONT_ZH), ...lines.map(l => textW(l, bs, FONT_ZH))) + 64;
  const h = 40 + ts + lines.length * (bs + 14) + 20;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y + (1 - a) * 30);
  ctx.fillStyle = 'rgba(17,16,14,.85)'; roundRect(-w / 2, -h / 2, w, h, 18); ctx.fill();
  ctx.fillStyle = col; ctx.globalAlpha = a * .08; roundRect(-w / 2, -h / 2, w, h, 18); ctx.fill(); ctx.globalAlpha = a;
  ctx.strokeStyle = col; ctx.lineWidth = 2; roundRect(-w / 2, -h / 2, w, h, 18); ctx.stroke();
  text(title, -w / 2 + 32, -h / 2 + 22 + ts / 2, ts, col, { font: FONT_ZH, weight: 'bold' });
  lines.forEach((l, i) => text(l, -w / 2 + 32, -h / 2 + 40 + ts + i * (bs + 14) + bs / 2, bs, C.cream, { font: FONT_ZH }));
  ctx.restore();
  return { w, h };
}
function arrowX(x0, y0, x1, y1, col, p = 1, w = 3, dashed = false) {
  const x = lerp(x0, x1, p), y = lerp(y0, y1, p); if (p <= 0) return;
  ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w; if (dashed) ctx.setLineDash([10, 9]);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x, y); ctx.stroke(); ctx.setLineDash([]);
  const a = Math.atan2(y1 - y0, x1 - x0); ctx.translate(x, y); ctx.rotate(a);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-16, -8); ctx.lineTo(-16, 8); ctx.closePath(); ctx.fill(); ctx.restore();
}
// 沿路径流动的光点（表现“数据在传输”）
function flowDots(x0, y0, x1, y1, t, col, n = 4) {
  for (let i = 0; i < n; i++) { const u = fract(t * .6 + i / n); ctx.fillStyle = col; ctx.globalAlpha = Math.sin(u * Math.PI);
    ctx.beginPath(); ctx.arc(lerp(x0, x1, u), lerp(y0, y1, u), 5, 0, TAU); ctx.fill(); }
  ctx.globalAlpha = 1;
}
function counter(v, digits = 0) { return Math.round(v).toLocaleString('en'); }

// ── 主渲染 ────────────────────────────────────────────────
function renderStage(t) {
  begin2D();
  const cam = camAt(t);
  worldBG(cam, t);
  const fxAll = {}; let bgShader = null;
  const draw = (i) => {
    const s = TL.scenes[i], st = STATION[s.key]; if (!CH[s.key]) return;
    const S = mkS(s, t);
    ctx.save();
    ctx.scale(cam.z, cam.z); ctx.rotate(-cam.r); ctx.translate(st.x - cam.x, st.y - cam.y); ctx.rotate(st.r);
    CH[s.key](S);
    ctx.restore();
    Object.assign(fxAll, S.fx); if (S.bg) bgShader = S.bg;
  };
  if (cam.both !== null && cam.both !== undefined) { draw(cam.scene); draw(cam.both); } else draw(cam.scene);
  drawCaption(t);
  // 片头淡入、片尾淡出
  const fadeIn = clamp(t / .8), fadeOut = clamp((TL.total - t) / 2);
  const fx = Object.assign({ grain: .03, vign: .55, bloomAmt: .32, bloomThr: .72, ca: .12 }, fxAll);
  if (cam.both !== null && cam.both !== undefined) fx.ca = (fx.ca || 0) + .5 * Math.sin(Math.PI * cam.e);
  fx.flash = Math.max(fx.flash || 0, 1 - Math.min(fadeIn, fadeOut)); fx.flashCol = [.067, .063, .055];
  composite(t, fx, bgShader);
}
window.renderFrame = i => renderStage(i / 60);
window.renderTime = t => renderStage(t);
