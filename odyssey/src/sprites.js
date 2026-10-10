// Tiny voxel models (8 x 16 x 8 each), stacked along z in one 3D texture. Front faces +z.
export const SPR_N = 4, SW = 8, SH = 16;

export function makeSprites() {
  const data = new Uint8Array(SW * SH * SW * SPR_N);
  const set = (m, x, y, z, id) => { if (x >= 0 && x < 8 && y >= 0 && y < 16 && z >= 0 && z < 8) data[x + SW * (y + SH * (z + m * 8))] = id; };
  const box = (m, x0, y0, z0, x1, y1, z1, id) => { for (let z = z0; z <= z1; z++) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(m, x, y, z, id); };

  // 0/1: the wanderer (two walk frames). ids: 1 cloak dark, 2 cloak, 3 skin, 4 glow, 5 boots
  for (let m = 0; m < 2; m++) {
    const s = m === 0 ? 0 : 1;
    box(m, 2, 0, 3 - s, 3, 3, 4 - s, 5); box(m, 4, 0, 3 + s, 5, 3, 4 + s, 5);
    box(m, 2, 4, 2, 5, 10, 5, 2); box(m, 2, 4, 2, 5, 5, 5, 1);
    box(m, 1, 6, 3, 1, 9, 4, 1); box(m, 6, 6, 3, 6, 9, 4, 1);
    box(m, 2, 11, 2, 5, 14, 5, 2); box(m, 3, 15, 2, 4, 15, 4, 2); box(m, 2, 10, 2, 5, 10, 5, 1);
    box(m, 3, 11, 5, 4, 13, 5, 3); set(m, 3, 13, 5, 4); set(m, 4, 13, 5, 4);
    box(m, 7, 4, 4, 7, 5, 4, 4); set(m, 7, 6, 4, 1); set(m, 6, 6, 4, 1);
  }
  // 2: cultist. ids: 1 robe dark, 2 robe, 3 void, 4 eye
  box(2, 2, 0, 2, 5, 11, 5, 2); box(2, 1, 0, 2, 6, 1, 5, 1); box(2, 2, 6, 2, 5, 7, 5, 1);
  box(2, 1, 7, 3, 1, 10, 4, 1); box(2, 6, 7, 3, 6, 10, 4, 1);
  box(2, 2, 12, 2, 5, 15, 5, 1); box(2, 3, 12, 5, 4, 14, 5, 3); set(2, 3, 13, 5, 4);
  // 3: eye-jelly. ids: 1 bell, 2 inner, 3 tentacle, 4 iris, 5 pupil
  for (let z = 0; z < 8; z++) for (let y = 7; y < 16; y++) for (let x = 0; x < 8; x++) {
    const dx = x - 3.5, dy = (y - 10.5) * 1.15, dz = z - 3.5, d = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (d < 3.9 && y >= 8) set(3, x, y, z, d < 2.6 ? 2 : 1);
  }
  box(3, 3, 9, 7, 4, 12, 7, 4); box(3, 3, 10, 7, 4, 11, 7, 5); box(3, 2, 10, 7, 5, 11, 7, 4); box(3, 3, 10, 7, 4, 11, 7, 5);
  for (const [x, z, y0] of [[1, 1, 2], [6, 1, 1], [1, 6, 0], [6, 6, 3], [3, 3, 1], [4, 5, 2]]) for (let y = y0; y < 8; y++) if ((y + x) % 3 !== 0) set(3, x, y, z, 3);
  return data;
}
