// Film runtime: renders any frame of the timeline onto one 1920x1080 canvas.
//   preview:  film/index.html?t=123.4   or  ?shot=court&lt=5      (←/→ scrub, space plays)
//   record:   film/index.html?rec=1[&from=F&to=F]                (posts JPEG frames to tools/record.mjs)
import { Renderer, viewOf, defaultOpt } from '../src/render.js';
import { SHOTS } from './script.js';
import { build, ctxOf, FPS, W, H } from './timeline.js';
import { makeState, advance, camOf } from './playstate.js';
import { subtitles, titleCard, codeView, chapterTag, hud, label, rect, clamp } from './draw.js';

const q = new URLSearchParams(location.search);
const tl = build(SHOTS);
const stage = document.getElementById('stage'), g = stage.getContext('2d');
const glc = document.createElement('canvas'); glc.width = W; glc.height = H;
let renderer = null, cur = null;

const EVENT_TEXT = { through: '穿 过', reject: '被 墙 吐 回', imprint: '世 界 修 正' };

function drawPlay(shot, f) {
  if (!cur || cur.shot !== shot || cur.st.f > f + 1) cur = { shot, st: makeState(shot) };
  const st = cur.st;
  while (st.f < f + 1) advance(st, shot);
  const c = ctxOf(shot, f / FPS);
  if (!renderer) { renderer = new Renderer(glc, st.world, { scale: +(q.get('ss') || 2) }); renderer.setSize(W, H); }
  renderer.setWorld(st.world);
  const opt = { ...defaultOpt(), ...(shot.opt ? shot.opt(c, st) : {}) };
  const view = viewOf(st.sim, camOf(shot, c, st), st.phi, opt);
  if (shot.noPlayer) view.ents = view.ents.slice(2);
  if (shot.eye) view.eye = shot.eye(c, st);
  renderer.render(view);
  g.drawImage(glc, 0, 0);
  const h = shot.hud || {};
  hud(g, { sigma: h.sigma ? st.sim.sigmaS : null, phi: h.phi ? st.phi : null, tag: h.tag || null });
  if (shot.flags?.tunnel !== 'naive') {
    const e = st.log.findLast((e) => EVENT_TEXT[e.type]);
    if (e && st.f - e.f < 40) { const a = clamp((40 - (st.f - e.f)) / 12); g.save(); g.shadowColor = '#ff29b8'; g.shadowBlur = 24; label(g, EVENT_TEXT[e.type], W / 2, 250, { size: 54, weight: 600, alpha: a }); g.restore(); }
  }
  return c;
}

function drawCode(shot, c) {
  const { snip, reveal, hl } = shot, i = c.line;
  if (shot.insert !== undefined) return codeView(g, snip, snip.lines.length, hl[0], c.t, { line: shot.insert, frac: c.q(0, 1.6, 0.5) });
  const prev = i > 0 ? reveal[i - 1] : 0, n = reveal[i];
  const dur = Math.min(shot.lines[i].dur * 0.7, (n - prev) * 0.3);
  codeView(g, snip, n > prev ? prev + (n - prev) * clamp(c.lt / Math.max(dur, 1e-3)) : n, c.lt > dur ? hl[i] : null, c.t);
}

export function renderFrame(F) {
  F = Math.max(0, Math.min(tl.frames - 1, F));
  const shot = tl.shots.findLast((s) => F >= s.f0), f = F - shot.f0, c = ctxOf(shot, f / FPS);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  if (shot.kind === 'play') drawPlay(shot, f);
  else if (shot.kind === 'dia') shot.draw(g, c);
  else if (shot.kind === 'code') drawCode(shot, c);
  else if (shot.kind === 'title') titleCard(g, c, shot.big, shot.small, shot.sub);
  if (shot.chapter) chapterTag(g, shot.chapter, c.t);
  subtitles(g, shot, c);
  if (shot.fadeOut) {
    const a = clamp((c.t - (shot.dur - shot.fadeOut - 1)) / shot.fadeOut);
    if (a > 0) { rect(g, 0, 0, W, H, { fill: `rgba(12,8,16,${a})` }); label(g, '叠界', W / 2, H / 2 - 20, { size: 90, weight: 700, alpha: a, color: '#ffd9f1' }); label(g, 'two worlds, one body', W / 2, H / 2 + 60, { size: 30, mono: true, alpha: a, color: '#ff8fd0' }); }
  }
  if (F < 8) rect(g, 0, 0, W, H, { fill: `rgba(0,0,0,${1 - F / 8})` });
  return { shot: shot.id, f, t: F / FPS };
}

// ---------------------------------------------------------------- preview / record
const info = document.getElementById('info');
let F = 0, playing = false;
if (q.has('shot')) { const s = tl.shots.find((s) => s.id === q.get('shot')); F = s.f0 + Math.round(+(q.get('lt') || 0) * FPS); }
if (q.has('t')) F = Math.round(+q.get('t') * FPS);
const show = () => { const r = renderFrame(F); info.textContent = `${(F / FPS).toFixed(2)}s  frame ${F}/${tl.frames}  shot ${r.shot} +${(r.f / FPS).toFixed(2)}s`; return r; };

window.__film = {
  tl, renderFrame,
  seek(t) { F = Math.round(t * FPS); return show(); },
  async still(name, quality = 0.9) { const blob = await new Promise((r) => stage.toBlob(r, 'image/jpeg', quality)); await fetch(`/still?name=${name}`, { method: 'POST', body: blob }); return name; },
  // contact sheet of several moments: [[shotId, localSeconds], ...]
  async sheet(name, items, cols = 3) {
    const cw = 640, ch = 360, cv = document.createElement('canvas'); cv.width = cw * cols; cv.height = ch * Math.ceil(items.length / cols);
    const x = cv.getContext('2d');
    items.forEach(([id, lt], i) => { this.shot(id, lt); x.drawImage(stage, (i % cols) * cw, Math.floor(i / cols) * ch, cw, ch); });
    const blob = await new Promise((r) => cv.toBlob(r, 'image/jpeg', 0.88)); await fetch(`/still?name=${name}`, { method: 'POST', body: blob }); return name;
  },
  shot(id, lt = 0) { const s = tl.shots.find((s) => s.id === id); F = s.f0 + Math.round(lt * FPS); return show(); },
};

if (q.has('rec')) {
  const from = +(q.get('from') || 0), to = Math.min(tl.frames, +(q.get('to') || tl.frames)), quality = +(q.get('q') || 0.93), out = q.get('out') || 'film';
  (async () => {
    const t0 = performance.now();
    for (let i = from; i < to; i++) {
      renderFrame(i);
      const blob = await new Promise((r) => stage.toBlob(r, 'image/jpeg', quality));
      await fetch(`/frame?i=${i}&out=${out}`, { method: 'POST', body: blob });
      if (i % 30 === 0) info.textContent = `recording ${i}/${to}  ${(((i - from + 1) / (performance.now() - t0)) * 1000).toFixed(1)} fps`;
    }
    await fetch(`/done?out=${out}`, { method: 'POST' });
    info.textContent = 'done'; document.title = 'done';
  })();
} else {
  show();
  addEventListener('keydown', (e) => {
    const step = e.shiftKey ? FPS * 5 : e.altKey ? 1 : FPS;
    if (e.code === 'ArrowRight') { F += step; show(); }
    if (e.code === 'ArrowLeft') { F -= step; show(); }
    if (e.code === 'Space') { playing = !playing; e.preventDefault(); }
  });
  let last = performance.now();
  const loop = (now) => { if (playing && now - last >= 1000 / FPS) { last = now; F = (F + 1) % tl.frames; show(); } requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
}
