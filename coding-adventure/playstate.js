// Deterministic per-shot gameplay state. No rendering here, so it also runs under node (tools/shotsim.mjs).
import { World } from './src/world.js';
import { Sim, addDefaultEnts } from './src/physics.js';
import { FPS, ctxOf } from './timeline.js';

export function makeState(shot) {
  const world = new World(), sim = new Sim(world, shot.flags || {});
  sim.reset(...(shot.spawn || [14, 8, 31.5]));
  if (shot.ents !== false) addDefaultEnts(sim);
  const c0 = ctxOf(shot, 0), m = sim.mid;
  const st = { world, sim, f: 0, phi: shot.phi ? shot.phi(c0, { sim }) : 0, focus: [m[0], m[1] + 1.2, m[2]], flash: 0, log: [] };
  if (shot.setup) shot.setup(st, shot);
  return st;
}

export function advance(st, shot) {
  const c = ctxOf(shot, st.f / FPS), sim = st.sim, dt = 1 / FPS;
  for (const cut of shot.cuts || []) if (Math.round(c.at(cut.line) * FPS) === st.f) { // an edit: jump somewhere else in the same world
    for (const b of sim.bodies) { b.p = cut.pos.slice(); b.v = [0, 0, 0]; b.vy = cut.pos[1]; b.phased = false; }
    st.focus = [cut.pos[0], cut.pos[1] + 1.2, cut.pos[2]];
  }
  sim.frame(shot.input ? shot.input(c, st) : {}, dt);
  for (const e of sim.events.splice(0)) {
    if (e.type !== 'carve' && e.type !== 'jump') st.log.push({ f: st.f, type: e.type, w: e.w });
    if (e.type === 'through' || e.type === 'reject' || e.type === 'imprint' || e.type === 'stuck') st.flash = 1;
  }
  st.flash *= Math.exp(-dt * 5);
  const pt = shot.phi ? shot.phi(c, st) : 0;
  st.phi += (pt - st.phi) * (1 - Math.exp(-dt * 7));
  const m = sim.mid, k = 1 - Math.exp(-dt * 7);
  st.focus[0] += (m[0] - st.focus[0]) * k; st.focus[1] += (m[1] + 1.2 - st.focus[1]) * k; st.focus[2] += (m[2] - st.focus[2]) * k;
  st.f++;
}

export function camOf(shot, c, st) {
  const s = shot.cam ? shot.cam(c, st) : { yaw: Math.PI, pitch: 0.4, dist: 10 };
  if (s.pos) return { pos: s.pos, target: s.target, fov: s.fov || 60 };
  const ctr = s.center || [st.focus[0], st.focus[1] + (s.h || 0), st.focus[2]];
  const cp = Math.cos(s.pitch);
  return { pos: [ctr[0] + Math.cos(s.yaw) * cp * s.dist, ctr[1] + Math.sin(s.pitch) * s.dist, ctr[2] + Math.sin(s.yaw) * cp * s.dist], target: ctr, fov: s.fov || 60 };
}
