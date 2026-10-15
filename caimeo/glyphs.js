// Math语 script: every morpheme is one ideogram built from the pieces of the games.
// Unit box is [-0.5, 0.5]², y points down. Arc angles in degrees (0 = right, 90 = down).
'use strict';

const GLYPHS = {
  ke: [['L', -.36, .16, .36, .16], ['D', 0, -.1, .13]],                      // win: a stone above the line
  lu: [['L', -.36, -.16, .36, -.16], ['C', 0, .13, .12]],                    // lose: a hollow stone below
  vo: [['L', -.27, .34, -.27, -.04], ['A', 0, -.04, .27, 180, 180], ['L', .27, -.04, .27, .34], ['G', 0, .2, .06]], // way: a gate
  su: [['D', -.17, 0, .085], ['D', .17, 0, .085]],
  en: [['D', 0, 0, .1]],
  nu: [['C', 0, 0, .22]],
  lo: [['L', 0, -.34, 0, .34], ['L', -.12, .34, .12, .34]],
  ne: [['C', 0, -.22, .1], ['L', 0, -.1, 0, .3], ['L', -.16, .3, .16, .3]],   // person: a pawn
  ta: [['A', 0, 0, .27, 200, 130], ['A', 0, 0, .27, 20, 130], ['D', .234, -.135, .055], ['D', -.234, .135, .055]], // take turns
  ra: [['A', 0, .14, .28, 180, 180], ['D', .28, .14, .06], ['L', -.36, .3, .36, .3]], // act: a hop
  ba: [['C', 0, 0, .27], ['L', -.19, .19, .19, -.19]],
  ko: [['R', 0, 0, .3, .3], ['L', 0, -.3, 0, .3], ['L', -.3, 0, .3, 0]],       // game: a board
  pi: [['P', 0, -.3, 0, .2, .085], ['C', 0, .29, .05]],                       // pin
  ka: [['P', -.2, -.2, .14, .16, .075], ['L', -.38, .34, .38, .34]],          // knock down
  o: [['Q', 0, 0, .22]],
  sa: [['P', -.12, -.28, -.12, .26, .075], ['P', .12, -.28, .12, .26, .075]],
  go: [['D', 0, 0, .22], ['K', 0, 0, .04]],                                   // queen
  mo: [['L', -.32, 0, .28, 0], ['L', .1, -.16, .3, 0], ['L', .1, .16, .3, 0]],
  ki: [['L', -.24, -.32, -.24, .24], ['L', -.24, .24, .32, .24], ['G', -.24, .24, .075]],
  sen: [['L', .1, -.32, .1, .32], ['D', -.14, 0, .085]],
  po: [['L', -.1, -.32, -.1, .32], ['D', .14, 0, .085]],
  gi: [['L', 0, .34, 0, .02], ['L', 0, .02, -.22, -.28], ['L', 0, .02, .22, -.28], ['C', 0, .02, .05], ['C', -.22, -.28, .05], ['C', .22, -.28, .05]],
  tsu: [['L', 0, .36, 0, -.36], ['L', -.22, .12, .22, -.12]],
  da: [['L', -.38, .14, .38, .14], ['L', -.28, .14, -.38, .3], ['L', -.04, .14, -.14, .3], ['L', .2, .14, .1, .3]],
  fa: [['L', 0, -.34, 0, .26], ['L', -.16, .08, 0, .28], ['L', .16, .08, 0, .28]],
  do: [['F', 0, 0, .34, .16]],
  chi: [['L', -.28, -.28, .02, -.28], ['A', .28, -.28, .26, 90, 90], ['L', .28, -.02, .28, .28], ['L', .28, .28, -.28, .28], ['L', -.28, .28, -.28, -.28]],
  ha: [['R', 0, 0, .28, .28], ['L', -.15, -.15, .15, .15], ['L', -.15, .15, .15, -.15]],
  so: [['C', 0, 0, .31], ['D', 0, -.12, .06], ['D', -.11, .08, .06], ['D', .11, .08, .06]],
  re: [['L', -.32, .26, .32, .26], ['L', -.22, 0, .22, 0], ['L', -.12, -.26, .12, -.26]],
  iri: [['C', -.16, 0, .16], ['C', .16, 0, .16]],
  ri: [['D', -.2, -.18, .07], ['D', .16, -.22, .05], ['D', -.06, .12, .06], ['D', .22, .2, .08]],
  ga: [['L', 0, .36, 0, -.06], ['A', -.16, -.06, .16, 270, 90], ['A', .16, .06, .16, 180, 90], ['G', 0, -.2, .07]],
  ma: [['H', 0, 0, .27], ['D', 0, 0, .06]],
  ze: [['L', -.26, -.1, .26, -.1], ['L', -.26, .1, .26, .1]],
  ji: [['R', 0, 0, .3, .24], ['D', -.11, 0, .055], ['D', .11, 0, .055]],
  vi: [['A', 0, .17, .34, 210, 120], ['A', 0, -.17, .34, 30, 120], ['D', 0, 0, .09]],
  de: [['L', -.22, -.16, .22, -.16], ['L', .22, -.16, 0, .22], ['L', 0, .22, -.22, -.16]],
  fe: [['C', -.07, -.07, .18], ['L', .06, .06, .3, .3]],
  va: [['C', 0, 0, .27], ['G', 0, 0, .09], ['L', 0, -.42, 0, -.33], ['L', 0, .33, 0, .42], ['L', -.42, 0, -.33, 0], ['L', .33, 0, .42, 0]],
  mi: [['C', 0, 0, .26], ['G', 0, 0, .12]],
  ti: [['A', -.15, 0, .15, 180, 180], ['A', .15, 0, .15, 0, 180]],
};

// numerals: dot patterns, like dice faces
const DIGITS = (() => {
  const d = (x, y) => ['D', x, y, .068];
  const g = [-.17, 0, .17];
  return [
    [['C', 0, 0, .2]],
    [d(0, 0)],
    [d(-.15, 0), d(.15, 0)],
    [d(0, -.16), d(-.16, .13), d(.16, .13)],
    [d(-.15, -.15), d(.15, -.15), d(-.15, .15), d(.15, .15)],
    [d(-.16, -.16), d(.16, -.16), d(0, 0), d(-.16, .16), d(.16, .16)],
    [d(-.13, -.19), d(.13, -.19), d(-.13, 0), d(.13, 0), d(-.13, .19), d(.13, .19)],
    [d(-.17, -.19), d(.17, -.19), d(-.17, 0), d(.17, 0), d(-.17, .19), d(.17, .19), d(0, 0)],
    [d(-.17, -.17), d(0, -.17), d(.17, -.17), d(-.17, 0), d(.17, 0), d(-.17, .17), d(0, .17), d(.17, .17)],
    g.flatMap((y) => g.map((x) => d(x, y))),
  ];
})();

function drawCmds(R, cmds, cx, cy, size, o = {}) {
  const col = o.col || INK, al = o.alpha ?? 1, w = size * (o.weight ?? 0.05);
  const gold = o.gold || GOLD, sl = o.slant || 0;
  const P = (x, y) => [cx + (x - y * sl) * size, cy + y * size];
  for (const c of cmds) {
    const k = c[0];
    if (k === 'L') { const a = P(c[1], c[2]), b = P(c[3], c[4]); R.line(a[0], a[1], b[0], b[1], w, col, al); }
    else if (k === 'C') { const a = P(c[1], c[2]); R.ring(a[0], a[1], c[3] * size, w, col, al); }
    else if (k === 'D') { const a = P(c[1], c[2]); R.disc(a[0], a[1], c[3] * size, col, al); }
    else if (k === 'G') { const a = P(c[1], c[2]); R.disc(a[0], a[1], c[3] * size, gold, al); }
    else if (k === 'K') { const a = P(c[1], c[2]); R.disc(a[0], a[1], c[3] * size, PAPER, al); }
    else if (k === 'A') { const a = P(c[1], c[2]); R.arc(a[0], a[1], c[3] * size, c[4] * Math.PI / 180, c[5] * Math.PI / 180, w, col, al); }
    else if (k === 'R') { const a = P(c[1], c[2]); R.box(a[0], a[1], c[3] * size, c[4] * size, size * .03, col, al, { w }); }
    else if (k === 'F') { const a = P(c[1], c[2]); R.box(a[0], a[1], c[3] * size, c[4] * size, size * .03, col, al); }
    else if (k === 'P') { const a = P(c[1], c[2]), b = P(c[3], c[4]); R.capsule(a[0], a[1], b[0], b[1], c[5] * size, w, col, al); }
    else if (k === 'Q') { const a = P(c[1], c[2]); R.diamond(a[0], a[1], c[3] * size, w, col, al); }
    else if (k === 'H') { const a = P(c[1], c[2]); R.hex(a[0], a[1], c[3] * size * 0.866, col, al, { w, rot: Math.PI / 2 }); }
  }
}

function glyph(R, key, cx, cy, size, o = {}) {
  const cmds = GLYPHS[key];
  if (!cmds) throw new Error('no glyph ' + key);
  drawCmds(R, cmds, cx, cy, size, o);
}

function digit(R, n, cx, cy, size, o = {}) { drawCmds(R, DIGITS[n], cx, cy, size, o); }

// numeral of any size; returns its width
function numeral(R, n, cx, cy, size, o = {}) {
  let s = String(Math.max(0, Math.floor(n)));
  if (o.pad && s.length < o.pad) s = '0'.repeat(o.pad - s.length) + s;
  const adv = size * 0.62, total = adv * s.length;
  let x = cx - total / 2 + adv / 2;
  if (o.align === 'left') x = cx + adv / 2;
  for (const ch of s) { digit(R, +ch, x, cy, size, o); x += adv; }
  return total;
}

// Math语 is written with the 26 Latin letters, set in Cormorant like the site.
function sentence(R, str, cx, cy, size, o = {}) {
  R.text(str, cx, cy + size * 0.32, size, { col: o.col || INK, alpha: o.alpha ?? 1, reveal: o.reveal ?? 1, italic: o.italic, ls: o.ls ?? 0.01, align: o.align });
  return R.measure(str, size, o);
}

// the site's wordmark: lowercase italic + a gold period, and the little title rule under it
function wordmark(R, str, cx, cy, size, o = {}) {
  const a = o.alpha ?? 1, rev = o.reveal ?? 1;
  const w = R.measure(str, size, { italic: true, ls: -0.04 });
  const base = cy + size * 0.3;
  R.text(str, cx - size * 0.06, base, size, { italic: true, ls: -0.04, alpha: a, reveal: rev, rise: 0.08 });
  const pr = clamp01((rev - 0.85) * 6.7);
  R.disc(cx - size * 0.06 + w / 2 + size * 0.09, base - size * 0.035, size * 0.042, GOLD, a * ease(pr));
}
function titleRule(R, cx, cy, a = 1, s = 1) {
  R.line(cx - 32 * s, cy, cx - 10 * s, cy, 1.1, QUIET, a * 0.55);
  R.line(cx + 10 * s, cy, cx + 32 * s, cy, 1.1, QUIET, a * 0.55);
  R.disc(cx, cy, 2.4 * s, GOLD, a);
}
