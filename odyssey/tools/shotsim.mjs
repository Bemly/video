// Prints the timeline, and (with a shot id) simulates a gameplay shot headlessly to check its choreography.
// Usage: node tools/shotsim.mjs            -> table of all shots
//        node tools/shotsim.mjs court      -> positions at each subtitle line, plus physics events
import { SHOTS } from '../film/script.js';
import { build, FPS } from '../film/timeline.js';
import { makeState, advance } from '../film/playstate.js';

const tl = build(SHOTS);
const fmt = (t) => `${String(Math.floor(t / 60)).padStart(2, '0')}:${(t % 60).toFixed(1).padStart(4, '0')}`;
const id = process.argv[2];
if (!id) {
  let lines = 0;
  for (const s of tl.shots) { lines += s.lines.length; console.log(fmt(s.start), s.kind.padEnd(5), s.id.padEnd(14), s.dur.toFixed(1).padStart(5) + 's', `${s.lines.length} lines`, s.chapter || ''); }
  console.log(`total ${fmt(tl.dur)}  (${tl.frames} frames, ${lines} subtitle lines)`);
} else {
  const shot = tl.shots.find((s) => s.id === id);
  const st = makeState(shot), every = +(process.argv[3] || 0);
  const p = (v) => v.map((x) => x.toFixed(1)).join(',');
  let li = -1;
  for (let f = 0; f < shot.frames; f++) {
    const t = f / FPS, L = shot.lines.findLastIndex((l) => t >= l.start);
    const row = () => console.log(t.toFixed(1).padStart(5), 'A', p(st.sim.bodies[0].p), 'B', p(st.sim.bodies[1].p), 'σ', st.sim.sigma.toFixed(2), st.sim.bodies[0].phased ? 'phA' : '', st.sim.bodies[1].phased ? 'phB' : '');
    if (L !== li) { li = L; console.log(`-- L${L} @${t.toFixed(1)}  ${shot.lines[L].zh}`); row(); }
    else if (every && f % every === 0) row();
    const n = st.log.length; advance(st, shot);
    for (const e of st.log.slice(n)) console.log('        event', e.type, 'w' + e.w, '@' + t.toFixed(2));
  }
  console.log('end', 'A', p(st.sim.bodies[0].p), 'B', p(st.sim.bodies[1].p), 'scars', st.sim.scars);
}
