// Film runtime for the watch page: renders any frame of the timeline onto one
// 1920x1080 canvas. Stripped of the local preview/record harness (see film/
// in the source tree); the page driver is player.js. Silent, bilingual subs.
import { Renderer, viewOf, defaultOpt } from './src/render.js';
import { SHOTS } from './script.js';
import { build, ctxOf, FPS, W, H } from './timeline.js';
import { makeState, advance, camOf } from './playstate.js';
import { subtitles, titleCard, codeView, chapterTag, hud, label, rect, clamp } from './draw.js';

export { FPS, W, H };
export const tl = build(SHOTS);

const stage = document.getElementById('stage'), g = stage.getContext('2d');
const glc = document.createElement('canvas'); glc.width = W; glc.height = H;
let renderer = null, cur = null;
const q = new URLSearchParams(location.search);
const SS = +(q.get('ss') || 1);

const EVENT_TEXT = { through: '穿 过', reject: '被 墙 吐 回', imprint: '世 界 修 正' };

function drawPlay(shot, f) {
  if (!cur || cur.shot !== shot || cur.st.f > f + 1) cur = { shot, st: makeState(shot) };
  const st = cur.st;
  while (st.f < f + 1) advance(st, shot);
  const c = ctxOf(shot, f / FPS);
  if (!renderer) { renderer = new Renderer(glc, st.world, { scale: SS }); renderer.setSize(W, H); }
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
