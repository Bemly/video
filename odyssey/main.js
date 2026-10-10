import { World, FLOOR } from './src/world.js';
import { Sim, addDefaultEnts, DT } from './src/physics.js';
import { Renderer, viewOf } from './src/render.js';

const canvas = document.getElementById('c');
const q = new URLSearchParams(location.search);
let world = new World();
let sim = new Sim(world, { reconcile: q.has('reconcile') });
addDefaultEnts(sim);
if (q.has('x')) sim.reset(+q.get('x'), +(q.get('y') || FLOOR), +(q.get('z') || 31.5));
const renderer = new Renderer(canvas, world, { scale: +(q.get('scale') || 1) });

const keys = new Set();
const cam = { yaw: Math.PI, pitch: 0.42, dist: 9, pos: [0, 0, 0], target: [0, 0, 0], fov: 60 };
if (q.has('yaw')) cam.yaw = +q.get('yaw');
if (q.has('pitch')) cam.pitch = +q.get('pitch');
if (q.has('dist')) cam.dist = +q.get('dist');
let phi = +(q.get('phi') || 0), phiTarget = phi, field = 1;
const opt = { look: +(q.get('look') || 2), outline: 1, shadow: 1, field: 1, glitch: 1 };

const msg = document.getElementById('msg');
let msgT = 0;
const say = (s) => { msg.textContent = s; msg.style.opacity = 1; msgT = 1.4; };

function reset() {
  world = new World(); const flags = sim.flags;
  sim = new Sim(world, flags); addDefaultEnts(sim);
  renderer.world = world; renderer.tVox.image.data = world.vox; renderer.tField.image.data = world.fieldU8;
  world.voxDirty = true;
}
addEventListener('keydown', (e) => {
  if (e.repeat) return;
  keys.add(e.code);
  if (e.code === 'KeyQ') phiTarget = phiTarget > 0.5 ? 0 : 1;
  if (e.code === 'KeyF') { field = 1 - field; opt.field = field; }
  if (e.code === 'KeyG') { sim.flags.reconcile = !sim.flags.reconcile; say(sim.flags.reconcile ? '世界修正：开' : '世界修正：关'); }
  if (e.code === 'KeyR') reset();
  if (e.code === 'Space' || e.code === 'Tab') e.preventDefault();
});
addEventListener('keyup', (e) => keys.delete(e.code));
addEventListener('blur', () => keys.clear());
let drag = false;
canvas.addEventListener('pointerdown', (e) => { drag = true; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener('pointerup', () => { drag = false; });
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  cam.yaw += e.movementX * 0.005; cam.pitch = Math.min(1.35, Math.max(-0.2, cam.pitch + e.movementY * 0.004));
});
canvas.addEventListener('wheel', (e) => { cam.dist = Math.min(30, Math.max(3, cam.dist * (1 + e.deltaY * 0.001))); e.preventDefault(); }, { passive: false });

function resize() { renderer.setSize(innerWidth, innerHeight); }
addEventListener('resize', resize); resize();

const fill = document.getElementById('fill'), stats = document.getElementById('stats');
const focus = [14, FLOOR + 1.2, 31.5];
let last = performance.now(), acc = 0, fps = 60, camD = cam.dist;
function tick(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now; fps += (1 / Math.max(dt, 1e-3) - fps) * 0.05;
  // camera-relative input
  const f = [Math.cos(cam.yaw), Math.sin(cam.yaw)]; // forward on xz, away from the camera
  let ix = 0, iz = 0;
  if (keys.has('KeyW') || keys.has('ArrowUp')) iz += 1;
  if (keys.has('KeyS') || keys.has('ArrowDown')) iz -= 1;
  if (keys.has('KeyD') || keys.has('ArrowRight')) ix += 1;
  if (keys.has('KeyA') || keys.has('ArrowLeft')) ix -= 1;
  const input = {
    mx: -f[0] * iz + f[1] * ix, mz: -f[1] * iz - f[0] * ix,
    jump: keys.has('Space'), dive: keys.has('KeyC') || keys.has('ControlLeft'), dash: keys.has('ShiftLeft') || keys.has('ShiftRight'),
  };
  acc += dt;
  while (acc >= 1 / 60) { sim.frame(input, 1 / 60); acc -= 1 / 60; }
  for (const e of sim.events.splice(0)) {
    if (e.type === 'through') say('穿 过');
    if (e.type === 'reject') say('被 墙 拒 绝');
    if (e.type === 'imprint') say('世 界 修 正');
  }
  if (sim.mid[1] < 1.2 && sim.bodies[0].onGround && sim.bodies[1].onGround) sim.reset(14, FLOOR, 31.5);
  phi += (phiTarget - phi) * Math.min(1, dt * 6);
  const m = sim.mid;
  for (let i = 0; i < 3; i++) focus[i] += ((i === 1 ? m[1] + 1.2 : m[i]) - focus[i]) * Math.min(1, dt * 8);
  cam.target = focus;
  const dir = [Math.cos(cam.yaw) * Math.cos(cam.pitch), Math.sin(cam.pitch), Math.sin(cam.yaw) * Math.cos(cam.pitch)];
  let d = 0.5; // pull the camera in front of matter both worlds agree on
  for (; d < cam.dist; d += 0.25) {
    const x = Math.floor(focus[0] + dir[0] * (d + 0.4)), y = Math.floor(focus[1] + dir[1] * (d + 0.4)), z = Math.floor(focus[2] + dir[2] * (d + 0.4));
    if (world.solid(0, x, y, z) && world.solid(1, x, y, z)) break;
  }
  camD += (d - camD) * Math.min(1, dt * (d < camD ? 30 : 4));
  cam.pos = [focus[0] + dir[0] * camD, focus[1] + dir[1] * camD, focus[2] + dir[2] * camD];
  renderer.render(viewOf(sim, cam, phi, opt));
  fill.style.width = Math.min(100, (sim.sigmaS / 1.5) * 100) + '%';
  if ((msgT -= dt) < 0) msg.style.opacity = 0;
  stats.textContent = `${fps.toFixed(0)} fps · x ${m[0].toFixed(1)} · σ ${sim.sigmaS.toFixed(2)}`;
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.__demo = {
  get sim() { return sim; }, cam, keys, opt, setPhi: (v) => { phi = phiTarget = v; },
  run(input, seconds) { for (let i = 0; i < seconds * 60; i++) sim.frame(input, 1 / 60); return { a: sim.bodies[0].p, b: sim.bodies[1].p, sigma: sim.sigma }; },
};
