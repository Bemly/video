// 网页实时播放器：用 <audio> 的时钟驱动 renderTime(t)，每帧由代码实时绘制。
// 用法：在页面里先加载引擎与镜头脚本，再调用 startPlayer({ audioSrc, total, needFile, title })
'use strict';
async function startPlayer(opt) {
  const ui = document.getElementById('ui'), cv = document.getElementById('out');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const fit = () => { const w = innerWidth, h = innerHeight; const s = Math.min(w / 16, h / 9);
    cv.style.width = (s * 16) + 'px'; cv.style.height = (s * 9) + 'px'; };
  // 渲染分辨率：按屏幕实际像素，最高 1920×1080
  const rw = Math.min(1920, Math.round(Math.min(innerWidth, innerHeight * 16 / 9) * dpr / 2) * 2);
  setupCanvas(rw, Math.round(rw * 9 / 16));
  fit(); addEventListener('resize', fit);
  document.getElementById('status').textContent = '加载素材…';
  await loadAssets();
  if (typeof loadTimeline === 'function') await loadTimeline();
  for (const f of ['40px "STIX Two Math"', '40px Menlo', '40px "PingFang SC"']) await document.fonts.load(f).catch(() => 0);
  const audio = new Audio(); audio.preload = 'auto';
  const total = opt.total || (typeof TL !== 'undefined' && TL ? TL.total : 0);
  const bar = document.getElementById('bar'), fill = document.getElementById('fill'), tm = document.getElementById('time'), btn = document.getElementById('play');
  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  let hasA = false, ready = false, lastT = -1, silentT = 0, silentStart = null;
  const setSrc = src => { audio.src = src; hasA = true; ready = true; document.getElementById('status').textContent = ''; btn.disabled = false; };
  if (opt.needFile) {
    document.getElementById('status').innerHTML = opt.fileHint;
    const fi = document.getElementById('file'); fi.style.display = '';
    fi.onchange = () => { if (fi.files[0]) setSrc(URL.createObjectURL(fi.files[0])); };
    document.getElementById('mute').style.display = '';
    document.getElementById('mute').onclick = () => { ready = true; btn.disabled = false; document.getElementById('status').textContent = '无声模式'; hasA = false; play(); };
  } else setSrc(opt.audioSrc);
  const now = () => hasA ? audio.currentTime : (silentStart !== null ? silentT + (performance.now() - silentStart) / 1000 : silentT);
  const playing = () => hasA ? !audio.paused : silentStart !== null;
  function play() { if (!ready) return; if (hasA) audio.play(); else if (silentStart === null) silentStart = performance.now(); btn.textContent = '❚❚'; ui.classList.add('playing'); }
  function pause() { if (hasA) audio.pause(); else if (silentStart !== null) { silentT = now(); silentStart = null; } btn.textContent = '▶'; ui.classList.remove('playing'); }
  btn.onclick = () => playing() ? pause() : play();
  cv.onclick = () => btn.onclick();
  addEventListener('keydown', e => { if (e.code === 'Space') { e.preventDefault(); btn.onclick(); }
    if (e.code === 'ArrowRight') seek(now() + 5); if (e.code === 'ArrowLeft') seek(now() - 5); if (e.key === 'f') fs(); });
  const seek = t => { t = Math.max(0, Math.min(total - .05, t)); if (hasA) audio.currentTime = t; else { silentT = t; if (silentStart !== null) silentStart = performance.now(); } };
  bar.onclick = e => { const r = bar.getBoundingClientRect(); seek((e.clientX - r.left) / r.width * total); };
  const fs = () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
  document.getElementById('fs').onclick = fs;
  audio.onended = () => pause();
  renderTime(0.0001);
  const loop = () => {
    const t = Math.min(total - .02, now());
    if (Math.abs(t - lastT) > 1e-4) { renderTime(Math.max(0.0001, t)); lastT = t; }
    fill.style.width = (t / total * 100) + '%'; tm.textContent = `${fmt(t)} / ${fmt(total)}`;
    if (!hasA && t >= total - .03) pause();
    requestAnimationFrame(loop);
  };
  if (!opt.needFile) document.getElementById('status').textContent = '';
  btn.disabled = !ready;
  requestAnimationFrame(loop);
}
