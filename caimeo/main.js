'use strict';
const Q = new URLSearchParams(location.search);
const W = +(Q.get('w') || 1920), H = +(Q.get('h') || 1080);
const cv = document.getElementById('c');
cv.width = W; cv.height = H;
const R = new Renderer(cv);
setLayout(W, H);

const TL = Q.get('cover') ? { fps: 30, duration: 1, noSubs: true, lines: [], scenes: [{ type: Q.get('cover') === '2' ? 'titletext' : 'cover', start: 0, end: 1, params: {} }] } : window.TIMELINE;
const FPS = TL.fps;
const MAKERS = { Kayles, Wythoff, Hackenbush, Domineering, Chomp };
const states = new Map();
let frameNo = -1;

function sceneState(sc) {
  if (!states.has(sc)) {
    const s = { ...sc.params, start: sc.start };
    if (s.make) s.Make = MAKERS[s.make];
    const def = SCENES[sc.type];
    def.init(s);
    states.set(sc, s);
  }
  return states.get(sc);
}

function drawSubtitle(gt) {
  for (const ln of TL.lines) {
    if (ln.id === 1 || gt < ln.start - 0.15 || gt > ln.end + 0.6) continue;
    const a = ease((gt - ln.start + 0.15) / 0.3) * (1 - ease((gt - ln.end - 0.3) / 0.3));
    const rev = clamp01((gt - ln.start) / Math.max(0.4, (ln.end - ln.start) * 0.85));
    sentence(R, ln.say, W / 2, LAYOUT.subY, 50, { alpha: a, reveal: rev });
  }
}

function drawFrame(f, draw = true) {
  const gt = f / FPS, dt = 1 / FPS;
  if (draw) R.begin();
  for (const sc of TL.scenes) {
    if (gt < sc.start || gt >= sc.end) continue;
    const s = sceneState(sc);
    const def = SCENES[sc.type];
    if (!draw) { const n = R.n; R.begin(); def.frame(R, gt - sc.start, sc.end - sc.start, s, gt, dt); R.n = 0; continue; }
    def.frame(R, gt - sc.start, sc.end - sc.start, s, gt, dt);
  }
  if (draw) {
    if (!TL.noSubs) drawSubtitle(gt);
    const fade = ease(gt / 0.4) * (1 - ease((gt - (TL.duration - 0.6)) / 0.6));
    R.end({ vig: 0.07 });
    if (fade < 1) { /* fade handled by scenes; paper stays */ }
  }
  frameNo = f;
}

window.renderFrame = (f) => {
  // frames must be sequential (the games are simulations)
  if (f !== frameNo + 1) { states.clear(); EVENTS.length = 0; for (let i = 0; i < f; i++) drawFrame(i, false); }
  drawFrame(f, true);
  R.gl.finish();
  return true;
};
window.getEvents = () => EVENTS;
window.totalFrames = Math.ceil(TL.duration * FPS);
window.ready = true;

if (Q.get('play')) {
  let f0 = Math.floor(+(Q.get('t') || 0) * FPS), t0 = performance.now();
  const loop = () => { const f = f0 + Math.floor((performance.now() - t0) / 1000 * FPS); if (f < window.totalFrames) { while (frameNo < f) window.renderFrame(frameNo + 1); requestAnimationFrame(loop); } };
  loop();
} else if (Q.get('t')) {
  window.renderFrame(Math.floor(+Q.get('t') * FPS));
}
