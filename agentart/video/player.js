// Watch-page driver: audio-clocked renderFrame + shared player chrome
// (top bar, bottom play/seek/time/fullscreen). Keeps ?t= single-frame and
// ?headless (render.mjs pipeline) behaviors.
const AUDIO_SRC = 'out/audio.wav';

const q = new URLSearchParams(location.search);
const canvas = document.getElementById('gl');
const playBtn = document.getElementById('play');
const bar = document.getElementById('bar');
const fill = document.getElementById('fill');
const timeEl = document.getElementById('time');
const statusEl = document.getElementById('status');

const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

await boot();
const DUR = window.TIMINGS?.total || 307.4;
timeEl.textContent = `0:00 / ${fmt(DUR)}`;

if (q.has('t')) { renderFrame(+q.get('t')); statusEl.textContent = ''; }
else if (!q.has('headless')) {
  document.body.classList.add('preview');
  const audio = new Audio(AUDIO_SRC);
  let playing = false, ready = false;

  const setPlaying = (p) => {
    playing = p;
    playBtn.textContent = p ? '⏸' : '▶';
    document.getElementById('ui').classList.toggle('playing', p);
  };
  const show = () => {
    renderFrame(audio.currentTime);
    fill.style.width = `${(audio.currentTime / DUR) * 100}%`;
    timeEl.textContent = `${fmt(audio.currentTime)} / ${fmt(DUR)}`;
  };
  if (window.TIMINGS?.chapters) {
    for (const c of window.TIMINGS.chapters) {
      const t = document.createElement('div');
      t.className = 'tick';
      t.style.left = `${(c.offset / DUR) * 100}%`;
      bar.appendChild(t);
    }
  }
  audio.addEventListener('canplay', () => { if (!ready) { ready = true; playBtn.disabled = false; statusEl.textContent = ''; renderFrame(0); } }, { once: true });
  audio.addEventListener('error', () => { statusEl.textContent = '音频加载失败'; }, { once: true });
  audio.addEventListener('play', () => setPlaying(true));
  audio.addEventListener('pause', () => setPlaying(false));
  const loop = () => { if (playing) show(); requestAnimationFrame(loop); };
  canvas.onclick = () => { if (!ready) return; audio.paused ? audio.play() : audio.pause(); };
  playBtn.addEventListener('click', () => { if (!ready) return; audio.paused ? audio.play() : audio.pause(); });
  addEventListener('keydown', (e) => {
    if (e.code === 'Space') { e.preventDefault(); if (ready) audio.paused ? audio.play() : audio.pause(); }
    if (e.code === 'ArrowRight') audio.currentTime = Math.min(DUR, audio.currentTime + 5);
    if (e.code === 'ArrowLeft') audio.currentTime = Math.max(0, audio.currentTime - 5);
  });
  bar.addEventListener('pointerdown', (e) => {
    const r = bar.getBoundingClientRect();
    audio.currentTime = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * DUR;
    show();
  });
  document.getElementById('fs').addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  });
  renderFrame(0);
  requestAnimationFrame(loop);
}
