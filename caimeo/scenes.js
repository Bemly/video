// Scenes of the video. Everything is deterministic: frame f -> image.
'use strict';

let LAYOUT = null;
function setLayout(W, H) {
  LAYOUT = { W, H, cx: W / 2, wordY: 168, ruleY: 268, boardY: 520, indY: 790, subY: 868, footY: 935 };
}

class Runner {
  constructor(Make, seed, o = {}) {
    this.Make = Make; this.rng = mulberry32(seed); this.level = o.level || 13;
    this.interval = o.interval || 0.8; this.t = 0; this.o = o; this.newLevel();
  }
  newLevel() { this.g = new this.Make(this.rng, this.level); this.phase = 'in'; this.pt = 0; this.next = this.interval * 0.8; this.winner = undefined; }
  update(dt, gt) {
    this.t += dt; this.pt += dt;
    if (this.phase === 'in' && this.pt > 0.4) { this.phase = 'play'; this.pt = 0; }
    else if (this.phase === 'play' && this.pt >= this.next) {
      if (this.g.terminal()) { this.phase = 'end'; this.pt = 0; this.winner = 1 - this.g.player; EVENTS.push({ t: gt, k: 'win' }); }
      else {
        this.g.apply(this.g.ai(this.rng), this.t); EVENTS.push({ t: gt, k: this.o.sfx || 'move' });
        this.pt = 0; this.next = this.interval * (0.85 + 0.3 * this.rng());
      }
    } else if (this.phase === 'end' && this.pt > (this.o.endHold || 1.1)) { this.phase = 'out'; this.pt = 0; }
    else if (this.phase === 'out' && this.pt > 0.35) { this.level++; this.newLevel(); }
  }
  alpha() {
    if (this.phase === 'in') return ease(this.pt / 0.4);
    if (this.phase === 'out') return 1 - ease(this.pt / 0.35);
    return 1;
  }
  draw(R, cx, cy, o = {}) { R.push(); R.fade(this.alpha()); this.g.draw(R, this.t, cx, cy, o); R.pop(); }
}

function sceneAlpha(lt, dur, fin = 0.5, fout = 0.45) { return ease(lt / fin) * (1 - ease((lt - (dur - fout)) / fout)); }

// little homepage icons for the twelve games
function homeIcon(R, i, x, y, a) {
  const s = 1;
  switch (i) {
    case 0: for (let k = -1; k <= 1; k++) { R.capsule(x + k * 14, y - 20, x + k * 14, y + 8, 4, 1.3, INK, a); R.ring(x + k * 14, y + 15, 2.5, 1.2, INK, a); } break;
    case 1: for (let k = 0; k < 3; k++) { R.line(x - 22 + k * 22, y - 22, x - 22 + k * 22, y + 22, 1, RULE, 0.25 * a); R.line(x - 22, y - 22 + k * 22, x + 22, y - 22 + k * 22, 1, RULE, 0.25 * a); } R.disc(x + 5, y - 10, 5, INK, a); R.ring(x - 24, y + 22, 4, 1, GOLD, a); break;
    case 2: for (const k of [-1, 1]) { const X = x + k * 16; R.line(X, y + 22, X, y, 1.3, INK, a); R.line(X, y, X - 8, y - 16, 1.3, INK, a); R.line(X, y, X + 8, y - 16, 1.3, INK, a); } break;
    case 3: R.box(x - 12, y - 4, 7, 15, 1.5, INK, a); R.box(x + 10, y + 12, 14, 6, 1.5, [0.72, 0.72, 0.68], a); for (let k = 0; k < 2; k++) R.box(x + 8, y - 10 + k * 0, 14, 8, 1, RULE, 0.2 * a, { w: 1 }); break;
    case 4: R.hex(x - 10, y - 10, 9, INK, a, { rot: Math.PI / 2 }); R.hex(x + 4, y + 4, 9, [0.45, 0.5, 0.42], a, { rot: Math.PI / 2 }); R.hex(x + 18, y - 4, 9, RULE, 0.25 * a, { rot: Math.PI / 2, w: 1 }); R.hex(x - 4, y + 18, 9, RULE, 0.25 * a, { rot: Math.PI / 2, w: 1 }); break;
    case 5: for (let k = 0; k < 4; k++) R.capsule(x, y - 18 + k * 12, x, y - 18 + k * 12, 5, 1.1, QUIET, a); break;
    case 6: for (let k = 0; k < 6; k++) R.ring(x, y - 22 + k * 9, 3, 1.1, QUIET, a * (k < 2 ? 0.5 : 1)); break;
    case 7: R.line(x - 26, y + 10, x + 26, y + 10, 1, QUIET, 0.5 * a); R.shadow(x - 6, y + 4, 9, 6, INK, a * 0.9); R.shadow(x + 10, y + 5, 8, 5, QUIET, a * 0.9); break;
    case 8: for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) R.box(x - 26 + c * 13, y - 20 + r * 13, 5.5, 5.5, 1.5, RULE, 0.35 * a, { w: 1 }); R.line(x - 30, y + 15, x - 22, y + 23, 1.1, GOLD, a); R.line(x - 30, y + 23, x - 22, y + 15, 1.1, GOLD, a); break;
    case 9: for (let k = 0; k < 7; k++) { const an = k / 7 * Math.PI * 2 - Math.PI / 2; R.ring(x + Math.cos(an) * 20, y + Math.sin(an) * 20, 3.6, 1, QUIET, a); } break;
    case 10: R.disc(x - 14, y + 14, 5, INK, a); R.disc(x + 2, y + 14, 5, INK, a); R.disc(x + 18, y - 2, 5, INK, a); R.ring(x + 18, y + 14, 5, 1.2, QUIET, a); R.disc(x + 18, y - 18, 3, QUIET, a * 0.4); break;
    case 11: for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) { const X = x - 12 + c * 24, Y = y - 12 + r * 24; R.box(X, Y, 11, 11, 1, [0.36, 0.42, 0.36], a); R.diamond(X, Y, 8, 1, [0.62, 0.52, 0.36], a, true); } break;
  }
}

function pageChrome(R, title, level, lt, dur, o = {}) {
  const { W, cx, wordY, ruleY, footY } = LAYOUT;
  const a = sceneAlpha(lt, dur, 0.5, 0.4);
  wordmark(R, title, cx, wordY, o.titleSize || 128, { alpha: a, reveal: ease(lt / 0.9) });
  titleRule(R, cx, ruleY, a);
  footer(R, W, footY, level, a);
  return a;
}

const SCENES = {
  title: {
    init() { },
    frame(R, lt, dur) {
      const { W, H, cx } = LAYOUT;
      const a = 1 - ease((lt - (dur - 0.5)) / 0.5);
      wordmark(R, 'kelvora', cx, H * 0.27, 200, { alpha: a, reveal: ease((lt - 0.3) / 1.4) });
      titleRule(R, cx, H * 0.27 + 150, a * ease((lt - 1.2) / 0.6));
      for (let i = 0; i < 12; i++) {
        const col = i % 6, row = Math.floor(i / 6);
        const x = cx + (col - 2.5) * 190, y = H * 0.62 + row * 175;
        const k = ease((lt - 1.6 - i * 0.12) / 0.6);
        homeIcon(R, i, x, y - (1 - k) * 12, a * k);
        numeral(R, i + 1, x, y + 62, 17, { pad: 2, col: QUIET, alpha: a * k, weight: 0.06 });
      }
    },
  },

  rule: {
    init(s) { s.k = new Kayles(null, 0, { rows: ['111'] }); s.done = 0; },
    frame(R, lt, dur, s, gt) {
      const { W, H, cx } = LAYOUT;
      const a = sceneAlpha(lt, dur);
      const L = s.line3 - s.start; // local time when line 3 starts
      const times = [L + 0.25, L + 0.95, L + 1.65];
      const moves = [{ r: 0, i: 1, n: 1 }, { r: 0, i: 0, n: 1 }, { r: 0, i: 2, n: 1 }];
      while (s.done < 3 && lt >= times[s.done]) { s.k.apply(moves[s.done], times[s.done]); s.done++; EVENTS.push({ t: gt, k: 'Kayles' }); }
      const ended = lt > times[2] + 0.5;
      if (ended && !s.won) { s.won = true; EVENTS.push({ t: gt, k: 'win' }); }
      // alternating turn marker before line 3
      let player = s.k.player;
      if (lt < L) player = Math.floor(Math.max(0, lt - 0.6) / 0.7) % 2;
      R.push(); R.fade(a);
      const mx = 300, my = H * 0.43;
      const big = (p, x) => {
        const isW = ended && p === 0, isL = ended && p === 1;
        const act = !ended && p === player;
        const col = isW ? GOLD : act ? INK : QUIET, al = isL ? 0.35 : act || isW ? 1 : 0.5;
        if (p === 0) { if (act || isW) R.disc(x, my, 26, col, al); else R.ring(x, my, 26, 2.4, col, al); }
        else R.diamond(x, my, 32, 2.4, col, al, act);
      };
      big(0, cx - mx); big(1, cx + mx);
      // the hop between players
      if (lt < L) {
        const ph = (Math.max(0, lt - 0.6) / 0.7) % 1, dir = player === 0 ? 1 : -1;
        const k = ease(ph * 1.6);
        R.arc(cx, my + 10, mx - 50, Math.PI * 1.08, Math.PI * 0.84, 1.3, QUIET, 0.3);
        const an = Math.PI * (dir > 0 ? lerp(1.08, 1.92, k) : lerp(1.92, 1.08, k));
        R.disc(cx + Math.cos(an) * (mx - 50), my + 10 + Math.sin(an) * (mx - 50), 4, GOLD, 1 - ease((ph - 0.6) / 0.4));
      }
      s.k.draw(R, lt, cx, my - 40);
      if (ended) {
        const k = ease((lt - times[2] - 0.5) / 0.6);
        sentence(R, 'kel', cx - mx, my + 95, 60, { alpha: k, italic: true });
        sentence(R, 'lun', cx + mx, my + 95, 60, { alpha: k, italic: true });
      }
      R.pop();
    },
  },

  game: {
    init(s) { s.r = new Runner(s.Make, s.seed, { level: s.level, interval: s.interval || 0.8, sfx: s.make }); },
    frame(R, lt, dur, s, gt, dt) {
      const { cx, boardY, indY } = LAYOUT;
      s.r.update(dt, gt);
      const a = pageChrome(R, s.title, s.r.level, lt, dur);
      R.push(); R.fade(a); s.r.draw(R, cx, boardY); R.pop();
      indicator(R, cx, indY, s.r.g.player, { alpha: a * s.r.alpha(), winner: s.r.winner, kind: s.kind });
    },
  },

  infinite: {
    init(s) { s.rng = mulberry32(99); s.lastLv = 0; s.board = null; },
    frame(R, lt, dur, s, gt) {
      const { W, H, cx, boardY } = LAYOUT;
      // level count: 1..12 steadily, then accelerating without bound
      const t1 = dur * 0.42;
      let lv = lt < t1 ? 1 + Math.floor(lt / t1 * 12) : 12 + Math.floor(Math.pow(1.9, (lt - t1) * 2.6));
      lv = Math.min(lv, 99999);
      if (lv !== s.lastLv) {
        s.board = new Kayles(s.rng, lv); s.lastLv = lv; s.bt = lt;
        if (lt < t1 || Math.random() < 0) EVENTS.push({ t: gt, k: 'tick' });
        else if (s.rng() < 0.35) EVENTS.push({ t: gt, k: 'tick' });
      }
      const a = pageChrome(R, 'rem iril', lv, lt, dur);
      const fl = lt < t1 ? ease((lt - s.bt) / 0.15) : 1;
      R.push(); R.fade(a * fl);
      R.translate(cx, boardY); R.scale(lt < t1 ? 1 : 0.85); R.translate(-cx, -boardY);
      s.board.draw(R, lt, cx, boardY);
      R.pop();
      // infinity sign drawing in behind after chapter 12
      const ki = ease((lt - t1) / 1.2);
      if (ki > 0) sentence(R, 'iril', cx, LAYOUT.indY - 6, 58, { col: GOLD, alpha: a * ki, italic: true });
    },
  },

  grundy: {
    init(s) {
      s.rng = mulberry32(5);
      s.k = new Kayles(null, 0, { rows: ['1111111', '1101'] }); s.next = 1.0; s.player = 0; s.lastV = s.k.value(); s.vt = -10;
    },
    frame(R, lt, dur, s, gt) {
      const { cx, boardY, indY } = LAYOUT;
      if (lt >= s.next && !s.k.terminal()) {
        const m = s.k.player === 0 ? s.k.ai(s.rng, 1) : s.k.ai(s.rng, 0);
        s.k.apply(m, lt); s.next = lt + 1.5; EVENTS.push({ t: gt, k: 'Kayles' }); s.vt = lt;
        if (s.k.value() === 0) EVENTS.push({ t: gt + 0.35, k: 'zero' });
      }
      const a = pageChrome(R, 'maa', 4, lt, dur);
      R.push(); R.fade(a);
      s.k.draw(R, lt, cx, boardY - 70);
      // the number of the position, in a hex
      const v = s.k.value(), z = v === 0, fk = ease((lt - s.vt - 0.25) / 0.4);
      const hy = boardY + 168;
      R.hex(cx, hy, 46 * 0.866, z ? GOLD : INK, 1, { w: 1.6, rot: Math.PI / 2 });
      if (z) R.hex(cx, hy, (46 + 14 * (1 - fk)) * 0.866, GOLD, 0.5 * (1 - fk) + 0.15, { w: 1.2, rot: Math.PI / 2 });
      numeral(R, v, cx, hy, 52, { col: z ? GOLD : INK, alpha: fk });
      R.pop();
      indicator(R, cx, indY, s.k.player, { alpha: a });
    },
  },

  machine: {
    init(s) {
      s.rng = mulberry32(17);
      s.k = new Kayles(null, 0, { rows: ['111111', '11011'] });
      s.state = 'scan'; s.st = 0.6; s.ci = 0; s.cands = null; s.player = 0;
    },
    frame(R, lt, dur, s, gt) {
      const { cx, boardY, indY } = LAYOUT;
      const a = pageChrome(R, 'jin vies', 7, lt, dur);
      if (!s.cands && !s.k.terminal()) {
        const ms = s.k.moves(); s.cands = ms.map((m) => ({ m, v: s.k.valueAfter(m) }));
        s.ci = 0; s.found = -1;
      }
      let hl = null, showV = null;
      if (s.k.player === 0 && s.cands) {
        // scan candidate moves one by one until one makes the number zero
        const step = 0.16;
        const i = Math.floor(Math.max(0, lt - s.st) / step);
        if (s.found < 0) {
          const cur = Math.min(i, s.cands.length - 1);
          if (cur !== s.lastCi) { s.lastCi = cur; EVENTS.push({ t: gt, k: 'scan' }); }
          hl = s.cands[cur]; showV = hl.v;
          if (hl.v === 0) { s.found = cur; s.ft = lt; EVENTS.push({ t: gt, k: 'zero' }); }
        } else {
          hl = s.cands[s.found]; showV = 0;
          if (lt - s.ft > 0.9) { s.k.apply(hl.m, lt); EVENTS.push({ t: gt, k: 'Kayles' }); s.cands = null; s.lastCi = -1; s.st = lt + 0.9; hl = null; }
        }
      } else if (s.cands && lt > s.st) {
        const m = s.k.ai(s.rng, 0); s.k.apply(m, lt); EVENTS.push({ t: gt, k: 'Kayles' }); s.cands = null; s.st = lt + 0.4; s.lastCi = -1;
      }
      R.push(); R.fade(a);
      const hp = hl ? Array.from({ length: hl.m.n }, (_, k) => ({ r: hl.m.r, i: hl.m.i + k })) : null;
      s.k.draw(R, lt, cx, boardY - 70, { highlight: hp });
      const hy = boardY + 168;
      if (showV !== null) {
        const z = showV === 0;
        R.hex(cx, hy, 40, z ? GOLD : QUIET, 1, { w: 1.5, rot: Math.PI / 2 });
        numeral(R, showV, cx, hy, 46, { col: z ? GOLD : QUIET });
      } else {
        R.hex(cx, hy, 40, QUIET, 0.4, { w: 1.2, rot: Math.PI / 2 });
      }
      R.pop();
      indicator(R, cx, indY, s.k.player, { alpha: a });
    },
  },

  montage: {
    init(s) {
      s.rs = [
        new Runner(Kayles, 31, { level: 40, interval: 0.32, endHold: 0.35, sfx: 'Kayles' }),
        new Runner(Wythoff, 32, { level: 57, interval: 0.4, endHold: 0.35 }),
        new Runner(Hackenbush, 33, { level: 73, interval: 0.34, endHold: 0.35 }),
        new Runner(Chomp, 34, { level: 88, interval: 0.32, endHold: 0.35 }),
      ];
    },
    frame(R, lt, dur, s, gt, dt) {
      const { W, H, cx } = LAYOUT;
      const a = sceneAlpha(lt, dur, 0.5, 0.6);
      const conv = ease((lt - (dur - 1.6)) / 1.2);
      const pos = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
      s.rs.forEach((r, i) => {
        const before = EVENTS.length;
        r.update(dt, gt);
        if (i > 0) EVENTS.length = before; // keep the mix light: only one board ticks
        const qx = cx + pos[i][0] * 440 * (1 - conv * 0.6), qy = H * 0.43 + pos[i][1] * 225 * (1 - conv * 0.6);
        R.push(); R.fade(a * (1 - conv)); R.translate(qx, qy); R.scale(0.6);
        r.draw(R, 0, i === 2 ? -120 : -10);
        R.pop();
        numeral(R, r.level, qx, qy + 185 * (1 - conv * 0.6), 20, { col: QUIET, alpha: a * (1 - conv), weight: 0.06 });
      });
      R.line(cx - 40, H * 0.43, cx + 40, H * 0.43, 1, QUIET, 0.25 * a * (1 - conv));
      R.line(cx, H * 0.43 - 40, cx, H * 0.43 + 40, 1, QUIET, 0.25 * a * (1 - conv));
      if (conv > 0) sentence(R, 'vaal', cx, H * 0.43, 150, { alpha: a * conv, italic: true, reveal: conv });
    },
  },

  outro: {
    init() { },
    frame(R, lt, dur, s, gt) {
      const { H, cx } = LAYOUT;
      const a = ease(lt / 0.6) * (1 - ease((lt - (dur - 1.2)) / 1.0));
      wordmark(R, 'kelvora', cx, H * 0.33, 200, { alpha: a, reveal: ease((lt - 0.1) / 1.2) });
      titleRule(R, cx, H * 0.33 + 150, a);
      const k = ease((lt - s.l2) / 0.6);
      const pulse = 0.5 + 0.5 * Math.sin(Math.max(0, lt - s.l2) * 4);
      R.ring(cx, H * 0.66, 34 + pulse * 6, 1.4, GOLD, a * k * (0.4 + 0.3 * pulse));
      sentence(R, 'mie', cx, H * 0.66, 50, { alpha: a * k, italic: true });
      indicator(R, cx, H * 0.66 + 90, 0, { alpha: a * k * 0.8 });
    },
  },
};

// static cover: wordmark + a still life of the games' pieces
SCENES.cover = {
  init() { },
  frame(R, lt, dur) {
    const { W, H, cx } = LAYOUT;
    const wide = W / H > 1.5;
    const ty = wide ? H * 0.25 : H * 0.22;
    wordmark(R, 'kelvora', cx, ty, wide ? 240 : 220, {});
    titleRule(R, cx, ty + 170, 1, 1.4);
    sentence(R, 'rem iril', cx, ty + 250, 92, { italic: true, col: QUIET });
    // still life band
    const by = wide ? H * 0.74 : H * 0.72, sp = wide ? 330 : 270;
    const xs = [-2, -1, 0, 1, 2].map((k) => cx + k * sp);
    // kayles pins, one tipping in gold
    const k = new Kayles(null, 0, { rows: ['111'] });
    for (let i = 0; i < 3; i++) k.pin(R, xs[0] - 50 + i * 50, by + 60, i === 2 ? 0.6 : 0, 1, i === 2 ? GOLD : INK);
    // wythoff queen with its reach
    const qx = xs[1], qy = by;
    for (let i = 0; i < 4; i++) { R.line(qx - 75 + i * 50, qy - 75, qx - 75 + i * 50, qy + 75, 1, RULE, 0.12); R.line(qx - 75, qy - 75 + i * 50, qx + 75, qy - 75 + i * 50, 1, RULE, 0.12); }
    R.line(qx + 25, qy - 25, qx - 75, qy + 75, 1.6, GOLD, 0.7); R.ring(qx - 75, qy + 75, 11, 1.4, GOLD, 1);
    R.shadow(qx + 27, qy - 20, 22, 9, INK, 0.15); R.disc(qx + 25, qy - 25, 18, INK, 1); R.disc(qx + 25, qy - 25, 2.6, PAPER, 1);
    // hackenbush stalk
    const hx = xs[2], hy = by + 70;
    R.line(hx - 90, hy, hx + 90, hy, 1.2, QUIET, 0.6);
    const pts = [[0, 0], [0, -60], [-40, -115], [35, -120], [55, -165]];
    [[0, 1], [1, 2], [1, 3], [3, 4]].forEach(([a, b], j) => R.line(hx + pts[a][0], hy + pts[a][1], hx + pts[b][0], hy + pts[b][1], 2.4, j === 3 ? GOLD : INK, 1));
    pts.slice(1).forEach(([x, y]) => { R.disc(hx + x, hy + y, 5.5, PAPER, 1); R.ring(hx + x, hy + y, 5.5, 1.6, INK, 1); });
    R.disc(hx, hy, 4.5, INK, 1);
    // domineering
    const dx = xs[3], dy = by;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) R.box(dx - 50 + c * 50, dy - 50 + r * 50, 21, 21, 3, RULE, 0.2, { w: 1 });
    R.box(dx - 50, dy - 25, 20, 45, 4, INK, 1); R.box(dx + 25, dy + 50, 45, 20, 4, [0.70, 0.70, 0.66], 1);
    // chomp, bitten
    const chx = xs[4], chy = by + 10, hs = [3, 3, 2, 1];
    hs.forEach((h, i) => { for (let j = 0; j < h; j++) { const x = chx - 75 + i * 50, y = chy + 50 - j * 50; R.box(x, y, 21, 21, 4, [0.86, 0.84, 0.79], 1); R.box(x, y, 21, 21, 4, INK, 0.55, { w: 1.2 }); if (!i && !j) { R.line(x - 7, y - 7, x + 7, y + 7, 1.6, GOLD); R.line(x - 7, y + 7, x + 7, y - 7, 1.6, GOLD); } } });
    R.box(chx + 75, chy - 50, 21, 21, 4, GOLD, 0.7, { w: 1.3 });
    // numbering like the homepage
    xs.forEach((x, i) => numeral(R, [1, 2, 3, 4, 9][i], x, by + 150, 18, { pad: 2, col: QUIET }));
  },
};

SCENES.titletext = {
  init() { },
  frame(R) {
    const { W, H, cx } = LAYOUT;
    wordmark(R, 'kelvora: rem iril', cx, H * 0.45, H * 0.42, {});
  },
};
