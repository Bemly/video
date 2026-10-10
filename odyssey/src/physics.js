// One player, two bodies. Body 0 lives in world A, body 1 in world B.
// Each body only collides with its own world; a spring ties them together.
import { SX, SZ, SCAR, FLOOR, isSolidId } from './world.js';

export const P = {
  HX: 0.3, H: 1.8, G: 28, WALK: 5, DASH: 16, DASH_T: 0.35, DASH_CD: 1.0, JUMP: 8.5,
  ACC_G: 70, ACC_A: 18, ACC_W: 16, SWIM: 4, BUOY: 40, WDRAG: 2.5, THRUST: 18,
  K: 40, L: 1.5, C: 14, T_BREAK: 110, V_BREAK: 5, T_HOLD: 90, PHASE_FRICTION: 150,
  FIELD_DECAY: 1.8, TAU_IMPRINT: 1.6,
};
export const DT = 1 / 120;
export const defaultFlags = () => ({
  coupling: true, damping: true, stiff: 1,
  tunnel: 'full',      // 'off' | 'naive' | 'full'
  fieldDecay: true, reconcile: false,
  speedGate: true,     // tunnelling also needs the bodies to be separating fast
  catchUp: true,       // don't brake a body the spring is hurrying along
});

const EPS = 1e-4;
const makeBody = (x, y, z) => ({ p: [x, y, z], v: [0, 0, 0], onGround: false, sub: 0, hit: [0, 0, 0], phased: false, phaseT: 0, weakT: 0, entry: null, rejecting: false, vy: y });

export class Sim {
  constructor(world, flags = {}) {
    this.world = world;
    this.flags = { ...defaultFlags(), ...flags };
    this.ents = [];
    this.reset(14, FLOOR, 31.5);
  }
  reset(x, y, z) {
    this.bodies = [makeBody(x, y, z), makeBody(x, y, z)];
    this.t = 0; this.tension = 0; this.sigma = 0; this.sigmaS = 0; this.eye = 0; this.scars = 0;
    this.dashT = 0; this.dashCD = 0; this.dashDir = [1, 0]; this.dashHeld = false;
    this.yaw = Math.PI / 2; this.walk = 0; this.events = [];
  }
  get mid() { const a = this.bodies[0].p, b = this.bodies[1].p; return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]; }
  get split() { const a = this.bodies[0].p, b = this.bodies[1].p; return Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]); }

  overlaps(w, p) {
    const W = this.world;
    const x0 = Math.floor(p[0] - P.HX + EPS), x1 = Math.floor(p[0] + P.HX - EPS);
    const y0 = Math.floor(p[1] + EPS), y1 = Math.floor(p[1] + P.H - EPS);
    const z0 = Math.floor(p[2] - P.HX + EPS), z1 = Math.floor(p[2] + P.HX - EPS);
    for (let z = z0; z <= z1; z++) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (W.solid(w, x, y, z)) return true;
    return false;
  }
  submerged(p) { // fraction of the body under water (world B only)
    const W = this.world; let n = 0;
    for (let i = 0; i < 6; i++) if (W.water(Math.floor(p[0]), Math.floor(p[1] + 0.15 + i * 0.3), Math.floor(p[2]))) n++;
    return n / 6;
  }

  moveAxis(w, b, a, dt) {
    const d = b.v[a] * dt;
    if (d === 0) return;
    b.p[a] += d;
    // a phased body has left its own world: until it re-forms it obeys the other world's geometry
    const naive = this.flags.tunnel === 'naive';
    if (b.phased && (naive || b.free)) return;
    const ow = w; if (b.phased) w = 1 - w;
    if (!this.overlaps(w, b.p)) return;
    if (a !== 1) { // step (or mantle) up one voxel
      const py = b.p[1], up = Math.floor(py + 1e-3) + 1 + 1e-3;
      b.p[1] = up;
      if (!this.overlaps(w, b.p)) return;
      b.p[1] = py;
    }
    const s = Math.sign(d);
    if (a === 1) b.p[1] = s > 0 ? Math.floor(b.p[1] + P.H) - P.H - EPS : Math.floor(b.p[1]) + 1 + EPS;
    else b.p[a] = s > 0 ? Math.floor(b.p[a] + P.HX) - P.HX - EPS : Math.floor(b.p[a] - P.HX) + 1 + P.HX + EPS;
    if (a === 1 && s < 0) b.onGround = true;
    b.hit[a] = s; b.v[a] = 0;
  }

  step(input) {
    const F = this.flags, dt = DT, [A, B] = this.bodies;
    let mx = input.mx || 0, mz = input.mz || 0;
    const ml = Math.hypot(mx, mz);
    if (ml > 1) { mx /= ml; mz /= ml; }
    if (ml > 0.1) { this.yaw = Math.atan2(mx, mz); this.walk += dt * 9; }
    this.dashCD -= dt;
    if (input.dash && !this.dashHeld && this.dashCD <= 0) {
      this.dashT = P.DASH_T; this.dashCD = P.DASH_CD;
      this.dashDir = ml > 0.1 ? [mx / ml, mz / ml] : [Math.sin(this.yaw), Math.cos(this.yaw)];
      this.events.push({ type: 'dash', t: this.t });
    }
    this.dashHeld = !!input.dash;
    const dashing = this.dashT > 0; this.dashT -= dt;

    // spring between the two bodies
    const d = [B.p[0] - A.p[0], B.p[1] - A.p[1], B.p[2] - A.p[2]];
    const dist = Math.hypot(d[0], d[1], d[2]);
    const k = P.K * F.stiff * (1 + (dist * dist) / (P.L * P.L));
    const c = F.damping ? P.C : 0;
    const f = [0, 0, 0];
    if (F.coupling) for (let a = 0; a < 3; a++) f[a] = k * d[a] + c * (B.v[a] - A.v[a]);
    this.tension = F.coupling ? k * dist : 0;
    const sepRate = dist > 1e-6 ? (d[0] * (B.v[0] - A.v[0]) + d[1] * (B.v[1] - A.v[1]) + d[2] * (B.v[2] - A.v[2])) / dist : 0;
    this.sigma = Math.min(1.5, this.tension / P.T_BREAK);

    for (let w = 0; w < 2; w++) {
      const b = this.bodies[w], sgn = w === 0 ? 1 : -1;
      b.sub = w === 1 ? this.submerged(b.p) : 0;
      const inSolid = b.phased && this.overlaps(w, b.p);
      // each world applies its own rules
      b.v[1] -= P.G * dt;
      if (b.sub > 0) {
        b.v[1] += (P.G + P.BUOY) * b.sub * dt;
        if (input.jump) b.v[1] += P.THRUST * b.sub * dt;
        if (input.dive) b.v[1] -= P.THRUST * b.sub * dt;
        const dr = Math.exp(-P.WDRAG * b.sub * dt);
        b.v[0] *= dr; b.v[1] *= dr; b.v[2] *= dr;
      }
      if (input.jump && b.onGround && b.sub < 0.5 && !b.phased) { b.v[1] = P.JUMP; this.events.push({ type: 'jump', t: this.t, w }); }
      if (!inSolid) { // walk / swim / dash controller
        const sp = dashing ? P.DASH : b.sub > 0.5 ? P.SWIM : P.WALK;
        const acc = dashing ? 400 : b.sub > 0.5 ? P.ACC_W : b.onGround ? P.ACC_G : P.ACC_A;
        const tx = dashing ? this.dashDir[0] * sp : mx * sp, tz = dashing ? this.dashDir[1] * sp : mz * sp;
        let ex = tx - b.v[0], ez = tz - b.v[2];
        const tl = Math.hypot(tx, tz);
        if (tl > 0.1 && F.catchUp) { // never brake a body that the spring is hurrying along: lets the laggard catch up
          const al = (ex * tx + ez * tz) / tl;
          if (al < 0) { ex -= (tx / tl) * al * 0.85; ez -= (tz / tl) * al * 0.85; }
        }
        const el = Math.hypot(ex, ez);
        if (el > 1e-6) { const q = Math.min(el, acc * dt) / el; b.v[0] += ex * q; b.v[2] += ez * q; }
      }
      for (let a = 0; a < 3; a++) b.v[a] += sgn * f[a] * dt;
      if (inSolid) { // solid matter grips a phased body: only a hard pull drags it through
        const sp = Math.hypot(b.v[0], b.v[2]);
        if (sp > 0) { const q = Math.max(0, sp - P.PHASE_FRICTION * dt) / sp; b.v[0] *= q; b.v[2] *= q; }
      }
      if (b.rejecting && b.entry) { // the wall throws the phased body back to where it entered
        const e = [b.entry[0] - b.p[0], b.entry[1] - b.p[1], b.entry[2] - b.p[2]], el = Math.hypot(e[0], e[1], e[2]) || 1;
        for (let a = 0; a < 3; a++) b.v[a] = (e[a] / el) * 11;
      }
      const sp2 = Math.hypot(b.v[0], b.v[1], b.v[2]);
      if (sp2 > 60) for (let a = 0; a < 3; a++) b.v[a] *= 60 / sp2;

      b.hit[0] = b.hit[1] = b.hit[2] = 0; const wasGround = b.onGround; b.onGround = false;
      if (wasGround && b.v[1] <= 0) b.onGround = true; // keeps step-up alive; reset by the y move below
      this.moveAxis(w, b, 0, dt); this.moveAxis(w, b, 2, dt);
      b.onGround = false; this.moveAxis(w, b, 1, dt);
      b.p[0] = Math.min(SX - 1.5, Math.max(1.5, b.p[0])); b.p[2] = Math.min(SZ - 1.5, Math.max(1.5, b.p[2]));
      if (b.p[1] < 0) { b.p[1] = 0; b.v[1] = 0; b.onGround = true; }

      // --- tunnelling ---
      if (F.tunnel !== 'off' && !b.phased && this.tension > P.T_BREAK && (!F.speedGate || sepRate > P.V_BREAK)) {
        const fl = Math.hypot(f[0], f[1], f[2]) || 1;
        let into = 0;
        for (let a = 0; a < 3; a++) if (b.hit[a] !== 0) into = Math.max(into, (sgn * f[a] * b.hit[a]) / fl);
        if (into > 0.6) {
          b.phased = true; b.phaseT = 0; b.weakT = 0; b.rejecting = false; b.entry = b.p.slice();
          this.events.push({ type: 'phase', t: this.t, w, p: b.p.slice() });
        }
      } else if (b.phased) {
        b.phaseT += dt;
        const over = this.overlaps(w, b.p);
        if (F.tunnel === 'naive') {
          if (b.phaseT > 0.12) { b.phased = false; this.events.push({ type: over ? 'stuck' : 'through', t: this.t, w, p: b.p.slice() }); }
        } else if (b.free) { // evicted by a freshly written voxel: fly straight back to the other body
          const o = this.bodies[1 - w];
          b.entry = o.p.slice();
          if (Math.hypot(b.p[0] - o.p[0], b.p[1] - o.p[1], b.p[2] - o.p[2]) < 0.25 || b.phaseT > 1) { b.phased = b.free = b.rejecting = false; b.v[0] = b.v[1] = b.v[2] = 0; }
        } else if (!over && b.phaseT > 0.03) {
          const o = this.bodies[1 - w];
          const ok = !b.rejecting;
          b.phased = false; b.rejecting = false;
          this.events.push({ type: ok ? 'through' : 'reject', t: this.t, w, p: b.p.slice() });
          if (!ok) { const ol = Math.hypot(o.v[0], o.v[2]); if (ol > 4) { o.v[0] *= 4 / ol; o.v[2] *= 4 / ol; } }
        } else if (over) {
          if (F.reconcile) this.carve(w, b);
          b.weakT = this.tension < P.T_HOLD ? b.weakT + dt : 0;
          if (b.weakT > 0.08) b.rejecting = true;
        }
      }
      b.vy += (b.p[1] - b.vy) * Math.min(1, dt * 18); // smoothed height, hides step-ups
    }
    this.t += dt;
  }

  // --- reconciliation: the two worlds rewrite themselves until they agree ---
  carve(w, b) {
    const W = this.world, p = b.p;
    for (let z = Math.floor(p[2] - P.HX); z <= Math.floor(p[2] + P.HX); z++) for (let y = Math.floor(p[1]); y <= Math.floor(p[1] + P.H); y++) for (let x = Math.floor(p[0] - P.HX); x <= Math.floor(p[0] + P.HX); x++) {
      if (y < FLOOR - 5 || !W.inb(x, y, z) || !W.solid(w, x, y, z) || W.solid(1 - w, x, y, z)) continue;
      W.set(w, x, y, z, 0); this.scars++;
      this.events.push({ type: 'carve', t: this.t, w, p: [x + 0.5, y + 0.5, z + 0.5] });
    }
  }
  imprint(dt) {
    const W = this.world;
    for (let w = 0; w < 2; w++) {
      const b = this.bodies[w], o = this.bodies[1 - w];
      if (b.phased || this.sigma < 0.25) continue;
      for (let a = 0; a < 3; a += 2) {
        if (!b.hit[a]) continue;
        const q = b.p.slice(); q[a] += b.hit[a] * 0.4;
        for (let z = Math.floor(q[2] - P.HX); z <= Math.floor(q[2] + P.HX); z++) for (let y = Math.floor(q[1]); y <= Math.floor(q[1] + P.H); y++) for (let x = Math.floor(q[0] - P.HX); x <= Math.floor(q[0] + P.HX); x++) {
          if (!W.inb(x, y, z) || !W.solid(w, x, y, z) || W.solid(1 - w, x, y, z)) continue;
          const key = x + SX * (y + 64 * z), s = (W.stress.get(key) || 0) + (this.sigma * dt) / P.TAU_IMPRINT;
          if (s < 1) { W.stress.set(key, s); continue; }
          W.stress.delete(key);
          W.set(0, x, y, z, SCAR); W.set(1, x, y, z, SCAR); this.scars++;
          this.events.push({ type: 'imprint', t: this.t, w, p: [x + 0.5, y + 0.5, z + 0.5] });
          if (!o.phased && this.overlaps(1 - w, o.p)) { o.phased = true; o.free = true; o.phaseT = 0; o.weakT = 1; o.rejecting = true; o.entry = b.p.slice(); }
        }
      }
    }
  }

  updateField(dt) {
    const W = this.world, F = this.flags, [A, B] = this.bodies, s = this.sigma;
    if (F.fieldDecay) W.decayField(Math.exp(-P.FIELD_DECAY * dt));
    if (s > 0.04) {
      for (let i = 0; i <= 3; i++) {
        const k = i / 3;
        W.splat(A.p[0] + (B.p[0] - A.p[0]) * k, A.p[1] + 0.9 + (B.p[1] - A.p[1]) * k, A.p[2] + (B.p[2] - A.p[2]) * k, 1.5 + s * 0.9, s * dt * 2.6);
      }
      for (const b of this.bodies) for (let a = 0; a < 3; a++) if (b.hit[a]) {
        const q = [b.p[0], b.p[1] + 0.9, b.p[2]]; q[a] += b.hit[a] * (a === 1 ? 0.9 : 0.5);
        W.splat(q[0], q[1], q[2], 2.6, s * dt * 5);
      }
    }
    for (const b of this.bodies) if (b.phased) W.splat(b.p[0], b.p[1] + 0.9, b.p[2], 3.0, dt * 9);
  }

  updateEnts(dt) {
    for (const e of this.ents) {
      if (this.t < (e.hold || 0)) continue;
      const tgt = e.path[e.seg], dx = tgt[0] - e.home[0], dy = tgt[1] - e.home[1], dz = tgt[2] - e.home[2], dl = Math.hypot(dx, dy, dz);
      if (dl < 0.2) { e.seg = (e.seg + 1) % e.path.length; continue; }
      const st = Math.min(dl, e.speed * dt);
      e.home[0] += (dx / dl) * st; e.home[1] += (dy / dl) * st; e.home[2] += (dz / dl) * st;
      e.yaw = Math.atan2(dx, dz);
      // only the player can push things, and only through the body that shares their world
      const b = this.bodies[e.w], px = e.home[0] + e.off[0] - b.p[0], pz = e.home[2] + e.off[2] - b.p[2], pl = Math.hypot(px, pz);
      if (pl < 1.1 && Math.abs(e.home[1] - b.p[1]) < 2) { const push = (1.1 - pl) / (pl || 1); e.off[0] += px * push; e.off[2] += pz * push; }
      e.off[0] *= Math.exp(-dt * 1.5); e.off[2] *= Math.exp(-dt * 1.5);
      e.p[0] = e.home[0] + e.off[0]; e.p[2] = e.home[2] + e.off[2];
      e.p[1] = e.home[1] + (e.w === 1 ? Math.sin(this.t * 1.7 + e.seed * 9) * 0.35 : 0);
    }
  }

  // advance one rendered frame (fixed sub-steps keep it deterministic)
  frame(input, dt = 1 / 30) {
    const n = Math.max(1, Math.round(dt / DT));
    for (let i = 0; i < n; i++) this.step(input);
    const fdt = n * DT;
    if (this.flags.reconcile) this.imprint(fdt);
    this.updateField(fdt);
    this.updateEnts(fdt);
    this.sigmaS += (this.sigma - this.sigmaS) * Math.min(1, fdt * 6);
    const eyeT = Math.min(1, this.sigmaS * 0.9 + this.scars * 0.012);
    this.eye += (eyeT - this.eye) * Math.min(1, fdt * (eyeT > this.eye ? 2.5 : 0.35));
  }
}

export const mkEnt = (model, w, path, speed, seed, hold = 0) => ({ model, w, path, speed, seed, hold, seg: 1, home: path[0].slice(), p: path[0].slice(), off: [0, 0, 0], yaw: 0 });
export function addDefaultEnts(sim) {
  const mk = mkEnt;
  sim.ents = [
    mk(2, 0, [[24, FLOOR, 24], [46, FLOOR, 24], [46, FLOOR, 28], [24, FLOOR, 28]], 1.6, 0.1),   // cultists: walk through B's coral wall
    mk(2, 0, [[98, FLOOR, 38], [90, FLOOR, 26], [96, FLOOR, 22]], 1.3, 0.5),
    mk(3, 1, [[22, 10, 36], [36, 11, 40], [58, 10, 34], [36, 12, 30]], 1.4, 0.2),                 // jellies: drift through A's walls
    mk(3, 1, [[48, 12, 26], [56, 11, 24], [44, 13, 22]], 1.0, 0.7),
    mk(3, 1, [[70, 5, 26], [78, 4.3, 36], [68, 5.5, 38]], 1.1, 0.9),
    mk(3, 1, [[100, 12, 30], [112, 14, 36], [104, 15, 26]], 1.2, 0.4),
  ];
}
