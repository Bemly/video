// Watch-page driver: rAF frame stepping (30fps), play/pause, seek bar,
// ?t= / ?shot=&lt= deep links. Silent; subs are drawn on canvas (bilingual).
import { renderFrame, tl, FPS } from './film-main.js';

const q = new URLSearchParams(location.search);
const canvas = document.getElementById('stage');
const playBtn = document.getElementById('play');
const bar = document.getElementById('bar');
const fill = document.getElementById('fill');
const timeEl = document.getElementById('time');
const statusEl = document.getElementById('status');

const DUR = tl.dur;
const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

let F = 0;
if (q.has('shot')) {
  const s = tl.shots.find((s) => s.id === q.get('shot'));
  if (s) F = s.f0 + Math.round(+(q.get('lt') || 0) * FPS);
}
if (q.has('t')) F = Math.round(+q.get('t') * FPS);
F = Math.max(0, Math.min(tl.frames - 1, F));

let playing = false, last = 0, ready = false;

function show() {
  try {
    renderFrame(F);
    if (!ready) { ready = true; playBtn.disabled = false; statusEl.textContent = ''; }
  } catch (e) {
    statusEl.textContent = '渲染出错：' + e.message;
    playing = false; playBtn.textContent = '▶';
    throw e;
  }
  fill.style.width = `${(F / (tl.frames - 1)) * 100}%`;
  timeEl.textContent = `${fmt(F / FPS)} / ${fmt(DUR)}`;
}

function setPlaying(p) {
  playing = p;
  playBtn.textContent = p ? '⏸' : '▶';
  last = performance.now();
}

playBtn.addEventListener('click', () => {
  if (F >= tl.frames - 1) F = 0;
  setPlaying(!playing);
});
addEventListener('keydown', (e) => {
  if (e.code === 'Space') { e.preventDefault(); setPlaying(!playing); }
  if (e.code === 'ArrowRight') { F = Math.min(tl.frames - 1, F + (e.shiftKey ? FPS * 5 : FPS)); show(); }
  if (e.code === 'ArrowLeft') { F = Math.max(0, F - (e.shiftKey ? FPS * 5 : FPS)); show(); }
});
bar.addEventListener('pointerdown', (e) => {
  bar.setPointerCapture(e.pointerId);
  const seek = (ev) => {
    const r = bar.getBoundingClientRect();
    const k = Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width));
    F = Math.round(k * (tl.frames - 1));
    statusEl.textContent = '定位中…';
    show();
    statusEl.textContent = '';
  };
  seek(e);
  const move = (ev) => seek(ev);
  const up = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); };
  addEventListener('pointermove', move);
  addEventListener('pointerup', up);
});
document.getElementById('fs').addEventListener('click', () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen();
});

show();
requestAnimationFrame(function loop(now) {
  if (playing && ready) {
    if (now - last >= 1000 / FPS) {
      last = now;
      F++;
      if (F >= tl.frames) { F = tl.frames - 1; setPlaying(false); }
      else show();
    }
  }
  requestAnimationFrame(loop);
});
