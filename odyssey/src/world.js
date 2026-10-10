// Two voxel worlds sharing one grid. Channel 0 = world A (dry, ash), channel 1 = world B (drowned).
export const SX = 128, SY = 40, SZ = 64;
export const FX = SX / 2, FY = SY / 2, FZ = SZ / 2; // conflict field, half resolution

export const A = { BONE: 1, BASALT: 2, BRICK: 3, ASH: 4, WOOD: 5, LANTERN: 6, GOLD: 7 };
export const B = { ROCK: 1, CORAL: 2, TENT: 3, BARN: 4, EYEW: 5, IRIS: 6, KELP: 7, PUPIL: 8, WATER: 15 };
export const SCAR = 14; // voxel both worlds have agreed on
export const FLOOR = 8;
export const MIDZ = 31.5;

export const isSolidId = (id) => id > 0 && id < 15;

function hash2(x, z, s) {
  let h = (x * 374761393 + z * 668265263 + s * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function vnoise(x, z, s) {
  const xi = Math.floor(x), zi = Math.floor(z), fx = x - xi, fz = z - zi;
  const ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz);
  const a = hash2(xi, zi, s), b = hash2(xi + 1, zi, s), c = hash2(xi, zi + 1, s), d = hash2(xi + 1, zi + 1, s);
  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}

export class World {
  constructor() {
    this.vox = new Uint8Array(SX * SY * SZ * 2);
    this.field = new Float32Array(FX * FY * FZ);
    this.fieldU8 = new Uint8Array(FX * FY * FZ);
    this.stress = new Map();
    this.voxDirty = true;
    generate(this);
  }
  inb(x, y, z) { return x >= 0 && y >= 0 && z >= 0 && x < SX && y < SY && z < SZ; }
  get(w, x, y, z) {
    if (y >= SY) return 0;
    if (!this.inb(x, y, z)) return 1; // invisible bounds
    return this.vox[(x + SX * (y + SY * z)) * 2 + w];
  }
  set(w, x, y, z, id) {
    if (!this.inb(x, y, z)) return;
    this.vox[(x + SX * (y + SY * z)) * 2 + w] = id;
    this.voxDirty = true;
  }
  solid(w, x, y, z) { return isSolidId(this.get(w, x, y, z)); }
  water(x, y, z) { return this.inb(x, y, z) && this.vox[(x + SX * (y + SY * z)) * 2 + 1] === B.WATER; }
  box(w, x0, y0, z0, x1, y1, z1, id) {
    for (let z = z0; z <= z1; z++) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) this.set(w, x, y, z, id);
  }

  // --- conflict field -------------------------------------------------------
  decayField(k) { const f = this.field; for (let i = 0; i < f.length; i++) f[i] *= k; }
  splat(px, py, pz, radius, amount) {
    const cx = px / 2, cy = py / 2, cz = pz / 2, r = radius / 2;
    const x0 = Math.max(0, Math.floor(cx - r)), x1 = Math.min(FX - 1, Math.ceil(cx + r));
    const y0 = Math.max(0, Math.floor(cy - r)), y1 = Math.min(FY - 1, Math.ceil(cy + r));
    const z0 = Math.max(0, Math.floor(cz - r)), z1 = Math.min(FZ - 1, Math.ceil(cz + r));
    for (let z = z0; z <= z1; z++) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy, dz = z + 0.5 - cz;
      const q = 1 - (dx * dx + dy * dy + dz * dz) / (r * r);
      if (q <= 0) continue;
      const i = x + FX * (y + FY * z);
      this.field[i] = Math.min(1, this.field[i] + amount * q * q);
    }
  }
  packField() {
    const f = this.field, u = this.fieldU8;
    for (let i = 0; i < f.length; i++) u[i] = f[i] * 255;
    return u;
  }
}

function tentacle(w, bx, bz, height, r0, seed) {
  const ph = seed * 6.283, ph2 = seed * 17.1;
  for (let i = 0; i <= height * 2; i++) {
    const k = i / (height * 2), y = FLOOR - 1 + i * 0.5;
    const sway = k * k * (3 + 3 * hash2(seed * 91 | 0, 3, 5));
    const cx = bx + Math.sin(ph + k * 3.3) * sway, cz = bz + Math.cos(ph2 + k * 2.7) * sway;
    const r = r0 * (1 - k) + 0.7;
    const R = Math.ceil(r);
    for (let dz = -R; dz <= R; dz++) for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
      if (dx * dx + dy * dy + dz * dz > r * r) continue;
      const x = Math.round(cx + dx), yy = Math.round(y + dy), z = Math.round(cz + dz);
      if (yy < FLOOR) continue;
      const sucker = hash2(x * 3 + yy, z * 5 + yy, 9) < 0.07;
      w.set(1, x, yy, z, sucker ? B.BARN : B.TENT);
    }
  }
}

function generate(w) {
  // --- terrain, both worlds ---
  for (let z = 0; z < SZ; z++) for (let x = 0; x < SX; x++) {
    const dz = Math.abs(z - MIDZ);
    let hA = FLOOR, hB = FLOOR;
    const edge = dz > 12.6 || x < 3 || x > 124;
    if (edge) {
      const e = Math.min(1, Math.max(dz - 12.6, 3 - x, x - 124) / 6);
      hA = FLOOR + 4 + Math.floor(vnoise(x * 0.11, z * 0.11, 1) * 9 * e + vnoise(x * 0.31, z * 0.31, 2) * 3);
      hB = FLOOR + 4 + Math.floor(vnoise(x * 0.09, z * 0.13, 3) * 13 * e + vnoise(x * 0.4, z * 0.4, 4) * 3);
    } else if (x >= 62 && x <= 86) { // sunken court: dry in A, flooded in B
      const s = x <= 66 ? FLOOR - (x - 61) : x >= 82 ? FLOOR - (86 - x) : 3;
      hA = hB = Math.max(3, s);
    }
    for (let y = 0; y < hA; y++) {
      const top = y >= hA - 1;
      w.set(0, x, y, z, edge ? (top && hash2(x, z, 11) < 0.7 ? A.ASH : A.BASALT) : top ? (hash2(x >> 1, z >> 1, 12) < 0.22 ? A.ASH : A.BONE) : A.BASALT);
    }
    for (let y = 0; y < hB; y++) {
      const top = y >= hB - 1;
      w.set(1, x, y, z, edge ? (top && hash2(x, z, 13) < 0.45 ? B.CORAL : B.ROCK) : top && hash2(x, z, 14) < 0.035 ? B.BARN : B.ROCK);
    }
    if (!edge && x >= 62 && x <= 86) for (let y = hB; y < FLOOR; y++) w.set(1, x, y, z, B.WATER);
    // decor on the rims
    if (edge && dz > 15 && x > 4 && x < 123) {
      const r = hash2(x, z, 21);
      if (r < 0.012) { const hh = 3 + (hash2(x, z, 22) * 5 | 0); w.box(0, x, hA, z, x, hA + hh, z, A.WOOD); w.box(0, x - 1, hA + hh - 1, z, x + 1, hA + hh - 1, z, A.WOOD); w.set(0, x, hA + hh - 2, z + 1, A.WOOD); }
      const rb = hash2(x, z, 23);
      if (rb < 0.03) { const hh = 2 + (hash2(x, z, 24) * 7 | 0); w.box(1, x, hB, z, x, hB + hh, z, B.KELP); }
      else if (rb < 0.045) { w.box(1, x, hB, z, x + 1, hB + 1 + (hash2(x, z, 25) * 3 | 0), z + 1, B.CORAL); }
    }
  }

  // --- plaza: pillars exist in both worlds (agreement) ---
  for (const px of [10, 18]) for (const pz of [24, 38]) {
    const ha = 4 + (hash2(px, pz, 31) * 4 | 0), hb = 7;
    w.box(0, px, FLOOR, pz, px + 1, FLOOR + ha, pz + 1, A.BONE);
    w.box(1, px, FLOOR, pz, px + 1, FLOOR + hb, pz + 1, B.ROCK);
    w.box(0, px - 1, FLOOR, pz - 1, px + 2, FLOOR, pz + 2, A.BASALT);
    w.box(1, px - 1, FLOOR, pz - 1, px + 2, FLOOR, pz + 2, B.ROCK);
    w.box(1, px - 1, FLOOR + hb, pz - 1, px + 2, FLOOR + hb, pz + 2, B.CORAL);
  }
  for (let x = 8; x <= 120; x += 14) for (const z of [20, 43]) { // lanterns (A) / glowing barnacles (B)
    if (x >= 60 && x <= 88) continue;
    w.box(0, x, FLOOR, z, x, FLOOR + 2, z, A.WOOD); w.set(0, x, FLOOR + 3, z, A.LANTERN);
    w.set(1, x + 3, FLOOR, z, B.BARN); w.set(1, x + 3, FLOOR + 1, z, B.EYEW);
  }

  // --- W1: thin wall, only in A ---
  w.box(0, 30, FLOOR, 19, 30, FLOOR + 4, 44, A.BRICK);
  for (let z = 19; z <= 44; z += 2) w.set(0, 30, FLOOR + 5, z, A.BRICK);
  // --- W2: thin coral wall, only in B ---
  w.box(1, 40, FLOOR, 19, 40, FLOOR + 4, 44, B.CORAL);
  for (let z = 19; z <= 44; z++) if (hash2(z, 40, 41) < 0.5) w.set(1, 40, FLOOR + 5, z, B.CORAL);
  // --- W3: thick wall in A with a door; the door is plugged in B ---
  w.box(0, 50, FLOOR, 19, 55, FLOOR + 5, 44, A.BASALT);
  w.box(0, 50, FLOOR, 37, 55, FLOOR + 2, 39, 0);
  w.box(0, 50, FLOOR + 3, 36, 55, FLOOR + 3, 40, A.GOLD);
  w.box(1, 51, FLOOR, 35, 51, FLOOR + 4, 41, B.CORAL);

  // --- court: low wall only in A (swim over it), reef roof only in B (dive under it) ---
  w.box(0, 73, 3, 19, 74, 4, 44, A.BRICK);
  w.box(1, 78, 6, 19, 80, 7, 44, B.CORAL);
  w.box(1, 78, 8, 19, 80, 8, 44, B.CORAL);

  // --- membrane: thin wall only in B, used for the reconcile chapter ---
  w.box(1, 93, FLOOR, 19, 93, FLOOR + 4, 44, B.TENT);

  // --- temple: ziggurat only in A ---
  const tx = 107, tz = 31;
  for (let k = 0; k < 4; k++) w.box(0, tx - 8 + 2 * k, FLOOR + k, tz - 8 + 2 * k, tx + 9 - 2 * k, FLOOR + k, tz + 9 - 2 * k, k % 2 ? A.BASALT : A.BONE);
  w.box(0, tx, FLOOR + 4, tz, tx + 1, FLOOR + 4, tz + 1, A.GOLD);
  for (const [dx, dz2] of [[-2, -2], [3, -2], [-2, 3], [3, 3]]) { w.box(0, tx + dx, FLOOR + 3, tz + dz2, tx + dx, FLOOR + 6, tz + dz2, A.BONE); w.set(0, tx + dx, FLOOR + 7, tz + dz2, A.LANTERN); }
  // --- temple: tentacles and the eye only in B ---
  tentacle(w, 98, 23, 16, 2.6, 0.13); tentacle(w, 99, 41, 19, 2.8, 0.47);
  tentacle(w, 116, 22, 21, 3.0, 0.71); tentacle(w, 117, 42, 17, 2.6, 0.29);
  tentacle(w, 107, 46, 12, 2.0, 0.83); tentacle(w, 108, 17, 13, 2.0, 0.61);
  const ex = 122, ey = 20, ez = 31.5, er = 7.5;
  for (let z = 20; z <= 43; z++) for (let y = FLOOR; y < 32; y++) for (let x = 113; x <= 126; x++) {
    const dx = x - ex, dy = y - ey, dz = z - ez, d = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (d < er + 2.5 + vnoise(y * 0.5, z * 0.5, 51) * 2 && x >= 120) w.set(1, x, y, z, hash2(y, z, 52) < 0.3 ? B.CORAL : B.TENT);
    if (d < er) {
      const r2 = Math.sqrt(dy * dy + dz * dz);
      w.set(1, x, y, z, dx < -er * 0.55 ? (r2 < 1.8 ? B.PUPIL : r2 < 3.6 ? B.IRIS : B.EYEW) : B.EYEW);
    }
  }
}
