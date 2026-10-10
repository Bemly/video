import { World } from '../src/world.js';
import { Sim, P } from '../src/physics.js';
const run = (name, start, script, flags = {}, every = 15) => {
  const sim = new Sim(new World(), flags); sim.reset(...start);
  console.log('==', name);
  let f = 0, maxT = 0;
  for (const [dur, inp] of script) for (let i = 0; i < dur * 30; i++, f++) {
    sim.frame(inp, 1 / 30); maxT = Math.max(maxT, sim.tension);
    for (const e of sim.events.splice(0)) if (!['carve','jump'].includes(e.type)) console.log('   event', e.type, 'w' + (e.w ?? ''), 't=' + e.t.toFixed(2));
    if (f % every === 0) { const [a, b] = sim.bodies; console.log((f / 30).toFixed(1).padStart(5), 'A', a.p.map(v => v.toFixed(2)).join(','), 'B', b.p.map(v => v.toFixed(2)).join(','), 'T', sim.tension.toFixed(0), a.phased ? 'phA' : '', b.phased ? 'phB' : '', 'sub', b.sub.toFixed(2)); }
  }
  console.log('   maxTension', maxT.toFixed(0));
};
const fwd = { mx: 1 }, dash = { mx: 1, dash: true }, none = {};
const which = process.argv[2] || 'all';
if (which === 'all' || which === 'w1') run('walk into W1', [25, 8, 31.5], [[3, fwd], [1, none]]);
if (which === 'all' || which === 'w1d') run('dash W1', [25, 8, 31.5], [[0.6, fwd], [0.1, dash], [1.5, fwd]], {}, 3);
if (which === 'all' || which === 'w2d') run('dash W2 (B wall)', [36, 8, 31.5], [[0.4, fwd], [0.1, dash], [1.5, fwd]], {}, 3);
if (which === 'all' || which === 'w3') run('dash thick W3', [46, 8, 28], [[0.4, fwd], [0.1, dash], [2.5, fwd]], {}, 3);
if (which === 'all' || which === 'court') run('court', [58, 8, 31.5], [[4, fwd], [2, none], [3, { mx: 1, dive: true }], [3, fwd], [3, {mx:1}]], {}, 15);
if (which === 'all' || which === 'nodamp') run('no damping', [25, 8, 31.5], [[3, fwd]], { damping: false, tunnel: 'off' }, 6);
if (which === 'all' || which === 'naive') run('naive thick', [46, 8, 28], [[0.4, fwd], [0.1, dash], [2.5, fwd]], { tunnel: 'naive' }, 3);
if (which === 'all' || which === 'zig') run('ziggurat', [95, 8, 31.5], [[4, fwd]], {}, 10);
if (which === 'naive1') run('naive thin', [22, 8, 31.5], [[1.1, fwd], [0.2, dash], [1.5, fwd]], { tunnel: 'naive' }, 3);
if (which === 'door') run('door', [45, 8, 31.5], [[1.4, { mz: 1 }], [0.5, {}], [0.25, fwd], [0.2, dash], [2, fwd]], {}, 3);
if (which === 'gate') run('zig no gate', [95, 8, 31.5], [[5, { mx: 0.5 }]], { speedGate: false }, 5);
if (which === 'catch') run('no catchup', [25, 8, 31.5], [[0.5, fwd], [0.2, dash], [3, fwd]], { catchUp: false }, 10);
if (which === 'imprint') run('imprint', [89, 8, 28], [[6, fwd], [1, { mz: 1 }], [0.5, { mx: -1 }], [0.5, fwd], [0.2, dash], [1.5, fwd], [2, { mx: -1 }]], { reconcile: true }, 15);
