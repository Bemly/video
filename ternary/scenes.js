import { QR_SVG } from './qr.js';
// 场景定义：每个场景的画面与音效都锚定到配音的词边界时间（L.w('词')）。
// 浏览器渲染与 node 混音共用本文件，draw() 只产出数据，不碰 DOM。

export const COL = { neg: '#4fc3f7', zero: '#9aa0b0', pos: '#ffa726', amb: '#ffb74d', bad: '#ff5d5d', good: '#3ddc84', dim: '#6b7385', txt: '#e8eaf0' };
export const vcol = v => (v < 0 ? COL.neg : v > 0 ? COL.pos : COL.zero);
export const tsym = v => (v < 0 ? '−' : v > 0 ? '+' : '0');
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ramp = (t, a, b) => clamp((t - a) / (b - a));
const eio = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eo = x => 1 - Math.pow(1 - clamp(x), 3);
const back = x => { x = clamp(x); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;
const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// 十进制 → 平衡三进制字符串（高位在前）
export function toBal(n, width = 0) {
  const d = [];
  if (n === 0) d.push(0);
  while (n !== 0) { let r = ((n % 3) + 3) % 3; if (r === 2) r = -1; d.push(r); n = (n - r) / 3; }
  while (d.length < width) d.push(0);
  return d.reverse().map(tsym).join('');
}

// 沿折线取点
function along(pts, u) {
  const L = []; let tot = 0;
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(l); tot += l; }
  let d = clamp(u) * tot;
  for (let i = 0; i < L.length; i++) {
    if (d <= L[i] || i === L.length - 1) { const k = L[i] ? d / L[i] : 0; return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)]; }
    d -= L[i];
  }
  return pts[pts.length - 1];
}

// ---------- 绘制上下文 ----------
export class Ctx {
  constructor(t) { this.t = t; this.segs = []; this.boxes = []; this.html = []; this.cam = { x: 960, y: 540, z: 1 }; this.P = [0, 0, 0, 0, 0, 0, 0, 0]; }
  S(x, y) { const c = this.cam; return [(x - c.x) * c.z + 960, (y - c.y) * c.z + 540]; }
  seg(x0, y0, x1, y1, o = {}) {
    if (this.segs.length >= 128) return;
    this.segs.push([x0, y0, x1, y1, o.v ?? 0, o.p ?? 1, o.flow ?? 0, o.a ?? 1, o.off ?? 0, o.speed ?? 170, o.w ?? 2.5, 0]);
  }
  // 折线导线，o.p 为整体绘制进度
  wire(pts, o = {}) {
    const ls = []; let tot = 0;
    for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); ls.push(l); tot += l; }
    const P = (o.p ?? 1) * tot; let acc = 0;
    for (let i = 0; i < ls.length; i++) {
      const p = ls[i] ? clamp((P - acc) / ls[i]) : 1;
      if (p > 0) this.seg(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], { ...o, p, off: (o.off ?? 0) + acc });
      acc += ls[i];
    }
    return tot;
  }
  // kind: 0 面板 1 引脚 2 圆环 3 着色格
  box(cx, cy, hw, hh, o = {}) {
    if (this.boxes.length >= 48) return;
    this.boxes.push([cx, cy, hw, hh, o.v ?? 2, o.a ?? 1, o.hl ?? 0, o.kind ?? 0]);
  }
  el(x, y, html, o = {}) {
    const a = o.a ?? 1; if (a <= 0.003) return;
    const world = o.world ?? true;
    const [X, Y] = world ? this.S(x, y) : [x, y];
    const sc = (o.s ?? 1) * (world ? this.cam.z : 1);
    const an = o.anchor ?? 'c';
    const tr = an === 'l' ? '0,-50%' : an === 'r' ? '-100%,-50%' : an === 'tl' ? '0,0' : '-50%,-50%';
    const org = an === 'l' ? 'left center' : an === 'r' ? 'right center' : an === 'tl' ? 'left top' : 'center';
    this.html.push(`<div class="el ${o.cls ?? ''}" style="left:${X.toFixed(1)}px;top:${Y.toFixed(1)}px;opacity:${a.toFixed(3)};transform:translate(${tr}) ${o.tf ?? ''} scale(${sc.toFixed(4)});transform-origin:${org};${o.style ?? ''}">${html}</div>`);
  }
  cursor(x, y, o = {}) {
    const a = o.a ?? 1; if (a <= 0) return;
    const [X, Y] = this.S(x, y);
    const sc = o.down ? 0.88 : 1;
    this.html.push(`<div class="el cursor" style="left:${X}px;top:${Y}px;opacity:${a};transform:scale(${sc})"><svg width="34" height="40" viewBox="0 0 17 20"><path d="M1 1 L1 16 L5 12.5 L8 19 L10.6 17.8 L7.7 11.5 L13 11.5 Z" fill="#f4f6fa" stroke="#0c0e12" stroke-width="1.2" stroke-linejoin="round"/></svg></div>`);
  }
  ripple(x, y, age, col = COL.amb) {
    if (age < 0 || age > 0.5) return;
    const [X, Y] = this.S(x, y); const k = age / 0.5;
    this.html.push(`<div class="el" style="left:${X}px;top:${Y}px;width:${16 + 60 * eo(k)}px;height:${16 + 60 * eo(k)}px;border:2px solid ${col};border-radius:50%;transform:translate(-50%,-50%);opacity:${1 - k}"></div>`);
  }
}

// 游戏风格的门面板：返回引脚坐标
function gate(c, cx, cy, o) {
  const ins = o.ins ?? [], outs = o.outs ?? [];
  const w = o.w ?? 180, n = Math.max(ins.length, outs.length, 1), gap = o.gap ?? 56;
  const h = o.h ?? Math.max(110, n * gap + 44);
  const a = o.a ?? 1, s = o.s ?? 1;
  const hw = (w / 2) * s, hh = (h / 2) * s;
  c.box(cx, cy, hw, hh, { v: o.hv ?? 2, a, hl: o.hl ?? 0, kind: 0 });
  const pin = (arr, side) => arr.map((p, i) => {
    const y = cy + (i - (arr.length - 1) / 2) * gap * s, x = cx + side * hw;
    c.box(x, y, 7 * s, 7 * s, { v: p.v ?? 4, a, hl: 1, kind: 1 });
    c.el(x - side * 14 * s, y, p.n, { cls: 'pinlab', a: a * 0.9, anchor: side < 0 ? 'l' : 'r', s });
    return [x, y];
  });
  const I = pin(ins, -1), O = pin(outs, 1);
  c.el(cx, cy - hh + 22 * s, o.name, { cls: 'gname', a, s, style: o.nameStyle ?? '' });
  if (o.sub) c.el(cx, cy + hh - 18 * s, o.sub, { cls: 'gsub', a: a * 0.8, s });
  return { I, O, hw, hh };
}

// 输入/输出小面板（像游戏左右两侧的 IN/OUT 卡片）
function ioPanel(c, cx, cy, label, v, o = {}) {
  const a = o.a ?? 1, s = o.s ?? 1, out = o.out ?? false;
  c.box(cx, cy, 62 * s, 38 * s, { v: v ?? 4, a, hl: o.hl ?? 0.5, kind: 0 });
  c.el(cx - 40 * s, cy, `<b>${label}</b>`, { cls: 'iolab', a, anchor: 'l', s });
  if (v !== undefined && v !== null) c.el(cx + 30 * s, cy, tsym(v), { cls: 'tval', a, s, style: `color:${vcol(v)};border-color:${vcol(v)}` });
  const px = cx + (out ? -62 : 62) * s;
  c.box(px, cy, 7 * s, 7 * s, { v: v ?? 4, a, hl: 1, kind: 1 });
  return [px, cy];
}

const pitchOf = v => (v < 0 ? -5 : v > 0 ? 7 : 0);

// ---------- 场景 ----------
// sid: 着色器背景  0 布线网格 1 二进制→三进制地砖 2 Setun 磁鼓 3 标题冲击 4 撞墙裂纹 5 尾声粒子
export const SCENES = {
  hook: {
    sid: 1, kicker: 'PROLOGUE',
    cues: L => [
      { t: 0.0, s: 'portal/trigger', v: 0.16 },
      { t: L.w('零和一'), s: 'note/bit', v: 0.35, p: 0 },
      { t: L.w('零和一') + 0.3, s: 'note/bit', v: 0.35, p: 5 },
      { t: L.w('负一'), s: 'note/bell', v: 0.55, p: -5 },
      { t: L.w('零'), s: 'note/bell', v: 0.55, p: 0 },
      { t: L.w('正'), s: 'note/bell', v: 0.55, p: 7 },
      { t: L.w('怎样'), s: 'block/amethyst/resonate1', v: 0.6 },
    ],
    draw(c, L) {
      const t = c.t;
      c.P[0] = ramp(t, L.w('负一') - 0.1, L.w('正') + 0.6);
      const bin = ramp(t, L.w('零和一') - 0.2, L.w('零和一')) * (1 - ramp(t, L.w('负一') - 0.25, L.w('负一') - 0.05));
      const fl = k => (hash(Math.floor(t * 9) + k) > 0.5 ? 1 : 0);
      c.el(800, 430, String(fl(1)), { cls: 'mega', a: bin, world: false, style: 'color:#f4f6fa' });
      c.el(1120, 430, String(fl(2)), { cls: 'mega', a: bin, world: false, style: 'color:#f4f6fa' });
      const g = (w, x, txt, col) => { const k = ramp(t, L.w(w), L.w(w) + 0.35); c.el(x, 430, txt, { cls: 'mega', a: k, s: 0.6 + 0.4 * back(k), world: false, style: `color:${col};text-shadow:0 0 40px ${col}` }); };
      g('负一', 640, '−1', COL.neg); g('零', 960, '0', COL.zero); g('正', 1280, '+1', COL.pos);
      const q = ramp(t, L.w('怎样'), L.w('怎样') + 0.5);
      c.el(960, 640, 'BINARY &nbsp;→&nbsp; TERNARY', { cls: 'tag big', a: q, world: false });
    },
  },

  setun: {
    sid: 2, kicker: 'HISTORY · 1958',
    cues: L => [
      { t: L.w('一九五八年'), s: 'block/iron_trapdoor/close1', v: 0.7 },
      { t: 0.6, s: 'block/sculk_sensor/sculk_clicking1', v: 0.35 },
      { t: 2.3, s: 'block/sculk_sensor/sculk_clicking3', v: 0.35 },
      { t: L.w('莫斯科大学'), s: 'ui/cartography_table/drawmap1', v: 0.5 },
      { t: L.w('Setun'), s: 'block/vault/activate', v: 0.8 },
    ],
    draw(c, L) {
      const t = c.t;
      c.P[0] = ramp(t, L.w('Setun'), L.w('Setun') + 0.6);
      const k1 = ramp(t, L.w('一九五八年'), L.w('一九五八年') + 0.25);
      c.el(170, 330, '1958', { cls: 'year', a: k1, anchor: 'l', s: 1.25 - 0.25 * eo(k1), world: false });
      const k2 = ramp(t, L.w('莫斯科大学'), L.w('莫斯科大学') + 0.4);
      c.el(178, 470, '莫斯科国立大学 &nbsp;<span class="dim">МГУ</span>', { cls: 'h2', a: k2, anchor: 'l', world: false, tf: `translateX(${(1 - eo(k2)) * -40}px)` });
      const k3 = ramp(t, L.w('三'), L.w('三') + 0.4);
      c.el(178, 545, '<span style="color:#4fc3f7">−1</span> · <span style="color:#9aa0b0">0</span> · <span style="color:#ffa726">+1</span> &nbsp;平衡三进制计算机', { cls: 'h3', a: k3, anchor: 'l', world: false });
      const k4 = ramp(t, L.w('Setun'), L.w('Setun') + 0.35);
      c.el(170, 690, 'СЕТУНЬ', { cls: 'setun', a: k4, anchor: 'l', s: 1.3 - 0.3 * back(k4), world: false });
      c.el(178, 790, 'SETUN · 50 台量产 · 铁氧体磁芯 + 磁鼓', { cls: 'h4', a: k4, anchor: 'l', world: false });
      c.el(1300, 120, '磁鼓存储 · 示意', { cls: 'cap', a: 0.7 * ramp(t, 0.3, 1), world: false });
    },
  },

  title: {
    sid: 3, kicker: 'TERNARY COMPLETE',
    cues: L => [
      { t: L.w('网页'), s: 'ui/toast/in', v: 0.5 },
      { t: L.w('三进制') - 0.12, s: 'random/click', v: 0.7 },
      { t: L.w('三进制'), s: 'block/beacon/activate', v: 0.9 },
      { t: L.w('三进制'), s: 'fireworks/largeblast1', v: 0.35 },
      { t: L.w('完备'), s: 'block/amethyst/resonate2', v: 0.55 },
    ],
    draw(c, L) {
      const t = c.t, T = L.w('三进制');
      c.P[0] = t - T;
      // 冲击前：三枚 trit 圆环绕中心
      const pre = 1 - ramp(t, T - 0.05, T + 0.2);
      for (let i = 0; i < 3; i++) {
        const ang = t * 1.2 + (i * Math.PI * 2) / 3, r = 150 * (1 - 0.6 * ramp(t, T - 0.6, T));
        const k = ramp(t, 0.2 + i * 0.25, 0.6 + i * 0.25);
        c.box(960 + Math.cos(ang) * r, 540 + Math.sin(ang) * r * 0.55, 34, 34, { v: i - 1, a: k * pre, hl: 1, kind: 2 });
      }
      const kw = ramp(t, L.w('网页'), L.w('网页') + 0.3) * pre;
      c.el(960, 300, 'WEB GAME · 网页闯关', { cls: 'tag', a: kw, world: false });
      const kc = ramp(t, L.w('亲手'), L.w('亲手') + 0.3) * (1 - ramp(t, T + 0.1, T + 0.4));
      const cp = along([[1300, 820], [985, 560]], eio(ramp(t, L.w('亲手'), T - 0.15)));
      c.cursor(cp[0], cp[1], { a: kc, down: t > T - 0.15 && t < T });
      c.ripple(960, 540, t - (T - 0.12));
      const k = ramp(t, T, T + 0.45);
      c.el(960, 480, '三进制完备', { cls: 'title', a: k, s: 1.5 - 0.5 * eo(k), world: false });
      const k2 = ramp(t, L.w('完备'), L.w('完备') + 0.4);
      c.el(960, 610, 'T E R N A R Y &nbsp; C O M P L E T E', { cls: 'subtitle', a: k2, world: false, tf: `translateY(${(1 - eo(k2)) * 20}px)` });
      const k3 = ramp(t, L.w('完备') + 0.5, L.w('完备') + 0.9);
      c.el(960, 690, '平衡三进制 · 18 关 · 从一个 TNAND 门到一台 CPU', { cls: 'h4 center', a: k3, world: false });
    },
  },

  trits: {
    sid: 0, kicker: 'CH 0 · 平衡三进制',
    cues: L => [
      { t: L.w('导线'), s: 'ui/cartography_table/drawmap1', v: 0.6 },
      { t: L.w('蓝色'), s: 'note/bit', v: 0.55, p: -5 }, { t: L.w('蓝色'), s: 'random/click', v: 0.4 },
      { t: L.w('灰色'), s: 'note/bit', v: 0.55, p: 0 }, { t: L.w('灰色'), s: 'random/click', v: 0.4 },
      { t: L.w('橙色'), s: 'note/bit', v: 0.55, p: 7 }, { t: L.w('橙色'), s: 'random/click', v: 0.4 },
    ],
    draw(c, L) {
      const t = c.t;
      c.cam = { x: 960, y: 540, z: 1 + 0.04 * ramp(t, 0, 6.5) };
      const rows = [['蓝色', -1, '负 · −1', 390], ['灰色', 0, '零 · 0', 540], ['橙色', 1, '正 · +1', 690]];
      rows.forEach(([w, v, name, y], i) => {
        const pd = eio(ramp(t, L.w('导线') + i * 0.15, L.w('导线') + 0.9 + i * 0.15));
        const on = ramp(t, L.w(w), L.w(w) + 0.25);
        c.box(520, y, 7, 7, { v: on > 0 ? v : 4, a: pd > 0 ? 1 : 0, hl: 1, kind: 1 });
        c.box(1400, y, 7, 7, { v: on > 0 ? v : 4, a: pd >= 1 ? 1 : 0, hl: 1, kind: 1 });
        c.wire([[520, y], [1400, y]], { v: on > 0 ? v : 4, p: pd, flow: on, w: 3 });
        c.box(440, y, 52, 40, { v: on > 0 ? v : 4, a: ramp(t, 0.2, 0.6), hl: on, kind: 3 });
        c.el(440, y, on > 0 ? tsym(v) : '?', { cls: 'bigsym', a: ramp(t, 0.2, 0.6), style: `color:${on > 0 ? vcol(v) : COL.dim}` });
        c.el(1460, y, name, { cls: 'h3', a: on, anchor: 'l', style: `color:${vcol(v)}`, tf: `translateX(${(1 - eo(on)) * 30}px)` });
      });
      c.el(960, 200, '一根导线 · 三种状态', { cls: 'h2 center', a: ramp(t, 0.9, 1.4) });
    },
  },

  number: {
    sid: 0, kicker: 'CH 0 · 平衡三进制',
    cues: L => [
      { t: L.w('符号位'), s: 'block/crafter/fail', v: 0.5 },
      { t: L.w('正'), s: 'note/bit', v: 0.5, p: 7 },
      { t: L.w('零'), s: 'note/bit', v: 0.5, p: 0 },
      { t: L.w('负'), s: 'note/bit', v: 0.5, p: -5 },
      { t: L.w('八'), s: 'random/orb', v: 0.6 },
      { t: L.w('取反'), s: 'tile/piston/out', v: 0.6 },
      { t: L.w('负八'), s: 'random/orb', v: 0.6, p: -5 },
    ],
    draw(c, L) {
      const t = c.t, F = L.w('取反');
      const flipK = ramp(t, F, F + 0.5);
      const digs = [1, 0, -1], ws = ['正', '零', '负'], xs = [760, 960, 1160];
      digs.forEach((d0, i) => {
        const fk = ramp(t, F + i * 0.08, F + 0.35 + i * 0.08);
        const d = fk > 0.5 ? -d0 : d0;
        const on = ramp(t, L.w(ws[i]), L.w(ws[i]) + 0.2);
        const sy = Math.abs(Math.cos(fk * Math.PI));
        c.box(xs[i], 450, 80, 80 * Math.max(sy, 0.04), { v: d, a: ramp(t, 0.1, 0.5), hl: Math.max(on * (1 - ramp(t, 4.5, 5.2)) , fk > 0 && fk < 1 ? 1 : 0, 0.25), kind: 3 });
        c.el(xs[i], 450, tsym(d), { cls: 'dig', a: ramp(t, 0.1, 0.5) * (sy > 0.15 ? 1 : 0), style: `color:${vcol(d)};transform-origin:center`, tf: `scaleY(${sy.toFixed(3)})` });
        c.el(xs[i], 575, ['9', '3', '1'][i], { cls: 'weight', a: ramp(t, L.w('三'), L.w('三') + 0.4) });
      });
      c.el(560, 575, '权重', { cls: 'cap', a: ramp(t, L.w('三'), L.w('三') + 0.4), anchor: 'r' });
      const ks = ramp(t, L.w('符号位'), L.w('符号位') + 0.3) * (1 - ramp(t, L.w('正') - 0.3, L.w('正')));
      c.el(960, 260, '<s>符号位</s> &nbsp;不需要', { cls: 'h2 center', a: ks, style: 'color:#ff8a8a' });
      // 等式
      const e1 = ramp(t, L.w('等于'), L.w('等于') + 0.3) * (1 - ramp(t, F - 0.1, F + 0.15));
      const p1 = ramp(t, L.w('九加零'), L.w('九加零') + 0.2), p2 = ramp(t, L.w('减一'), L.w('减一') + 0.2), r1 = ramp(t, L.w('八'), L.w('八') + 0.3);
      c.el(960, 720, `<span style="opacity:${p1}">9 + 0</span> <span style="opacity:${p2}">− 1</span> <span style="opacity:${r1};color:#ffb74d">= 8</span>`, { cls: 'eq', a: e1 });
      const e2 = ramp(t, F + 0.3, F + 0.6), r2 = ramp(t, L.w('负八'), L.w('负八') + 0.3);
      c.el(960, 720, `−9 + 0 + 1 <span style="opacity:${r2};color:#4fc3f7">= −8</span>`, { cls: 'eq', a: e2 });
      c.el(960, 820, '每一位取反 = 整个数变号', { cls: 'h4 center', a: ramp(t, F + 0.6, F + 1.0) });
    },
  },

  tnand: {
    sid: 0, kicker: 'LEVEL 01–02 · 起点',
    cues: L => {
      const cs = [{ t: L.w('门'), s: 'block/copper_bulb/place1', v: 0.9 }, { t: L.w('门') + 0.05, s: 'random/wood_click', v: 0.5 }];
      for (let i = 0; i < 9; i++) { const a = Math.floor(i / 3) - 1, b = (i % 3) - 1; cs.push({ t: L.w('三进制') + i * 0.15, s: 'note/bit', v: 0.22, p: pitchOf(-Math.min(a, b)) }); }
      cs.push({ t: L.w('T'), s: 'random/orb', v: 0.5 });
      return cs;
    },
    draw(c, L) {
      const t = c.t, G = L.w('门');
      const kg = ramp(t, G - 0.15, G + 0.1);
      const gy = 540 - 60 * (1 - eo(kg));
      const g = gate(c, 600, gy, { name: 'TNAND', sub: '与非', ins: [{ n: 'A' }, { n: 'B' }], outs: [{ n: 'Y' }], a: kg, hl: ramp(t, L.w('T'), L.w('T') + 0.3), w: 200, s: 1.4 });
      c.wire([[g.I[0][0] - 140, g.I[0][1]], g.I[0]], { v: 4, p: ramp(t, G + 0.2, G + 0.6), a: 0.8 });
      c.wire([[g.I[1][0] - 140, g.I[1][1]], g.I[1]], { v: 4, p: ramp(t, G + 0.25, G + 0.65), a: 0.8 });
      c.wire([g.O[0], [g.O[0][0] + 140, g.O[0][1]]], { v: 4, p: ramp(t, G + 0.3, G + 0.7), a: 0.8 });
      // 真值表
      const T0 = L.w('三进制'), x0 = 1120, y0 = 380, cs = 92;
      const kt = ramp(t, T0 - 0.3, T0);
      c.el(x0 - cs, y0 - cs, 'A╲B', { cls: 'cap', a: kt });
      [-1, 0, 1].forEach((v, i) => {
        c.el(x0 + i * cs, y0 - cs, tsym(v), { cls: 'thd', a: kt, style: `color:${vcol(v)}` });
        c.el(x0 - cs, y0 + i * cs, tsym(v), { cls: 'thd', a: kt, style: `color:${vcol(v)}` });
      });
      for (let i = 0; i < 9; i++) {
        const a = Math.floor(i / 3) - 1, b = (i % 3) - 1, y = -Math.min(a, b);
        const k = ramp(t, T0 + i * 0.15, T0 + i * 0.15 + 0.2);
        const cx = x0 + (b + 1) * cs, cy = y0 + (a + 1) * cs;
        c.box(cx, cy, cs / 2 - 5, cs / 2 - 5, { v: y, a: k, hl: k * (1 - ramp(t, T0 + i * 0.15 + 0.2, T0 + i * 0.15 + 0.8)), kind: 3 });
        c.el(cx, cy, tsym(y), { cls: 'tcell', a: k, style: `color:${vcol(y)}` });
      }
      c.el(600, 330, 'Y = −min(A, B)', { cls: 'formula', a: ramp(t, L.w('T'), L.w('T') + 0.3) });
      c.el(960, 860, '整个游戏的第一块积木', { cls: 'h4 center', a: ramp(t, 0.2, 0.7) * (1 - ramp(t, 5.3, 5.7)) });
    },
  },

  play_sti: {
    sid: 0, kicker: 'LEVEL 02 · 取反 STI',
    cues: L => [
      { t: 0.95, s: 'random/click', v: 0.6 }, { t: 1.35, s: 'random/click', v: 0.6 }, { t: 1.85, s: 'random/click', v: 0.6 },
      { t: 2.05, s: 'random/wood_click', v: 0.6 }, { t: 2.07, s: 'note/bit', v: 0.4, p: pitchOf(1) },
      { t: 2.75, s: 'random/wood_click', v: 0.6 }, { t: 2.77, s: 'note/bit', v: 0.4, p: pitchOf(-1) },
      { t: L.w('诞生'), s: 'random/levelup', v: 0.4 },
    ],
    draw(c, L) {
      const t = c.t;
      c.cam = { x: 960, y: 540, z: 1.0 + 0.08 * eio(ramp(t, 0, 5)) };
      const X = t < 2.05 ? 0 : t < 2.75 ? -1 : 1, on = t > 1.93;
      const xin = ioPanel(c, 480, 540, 'X', on ? X : 0, { hl: 0.6 });
      const g = gate(c, 960, 540, { name: 'TNAND', sub: '与非', ins: [{ n: 'A', v: on ? X : 4 }, { n: 'B', v: on ? X : 4 }], outs: [{ n: 'Y', v: on ? -X : 4 }], w: 200, gap: 60, hl: ramp(t, L.w('STI'), L.w('STI') + 0.3), hv: on ? -X : 2 });
      const yout = ioPanel(c, 1440, 540, 'Y', on ? -X : null, { out: true, hl: 0.6 });
      const jx = 720;
      const w1 = [xin, [jx, 540], [jx, g.I[0][1]], g.I[0]], w2 = [[jx, 540], [jx, g.I[1][1]], g.I[1]], w3 = [g.O[0], yout];
      const p1 = eio(ramp(t, 0.45, 0.95)), p2 = eio(ramp(t, 0.97, 1.35)), p3 = eio(ramp(t, 1.4, 1.85));
      const sv = v => (on ? v : 0);
      c.wire(w1, { v: sv(X), p: p1, flow: on ? 1 : 0, w: 3 });
      c.wire(w2, { v: sv(X), p: p2, flow: on ? 1 : 0, w: 3, off: 160 });
      c.wire(w3, { v: sv(-X), p: p3, flow: on ? 1 : 0, w: 3 });
      if (p2 > 0) c.box(jx, 540, 6, 6, { v: sv(X), a: 1, hl: 1, kind: 2 });
      // 光标轨迹
      let cp, down = false;
      if (t < 0.45) cp = along([[760, 820], xin], eio(ramp(t, 0, 0.45)));
      else if (t < 0.95) { cp = along(w1, p1); down = true; }
      else if (t < 0.97) cp = g.I[0];
      else if (t < 1.35) { cp = along(w2, p2); down = true; }
      else if (t < 1.4) cp = along([g.I[1], g.O[0]], ramp(t, 1.35, 1.4));
      else if (t < 1.85) { cp = along(w3, p3); down = true; }
      else if (t < 2.05) cp = along([yout, [490, 545]], eio(ramp(t, 1.85, 2.03)));
      else cp = [490, 545];
      c.cursor(cp[0] + 4, cp[1] + 4, { down: down || (t > 2.03 && t < 2.1) || (t > 2.73 && t < 2.8), a: 1 - ramp(t, 3.6, 4.0) });
      [0.95, 1.35, 1.85].forEach(tc => c.ripple(...(tc === 0.95 ? g.I[0] : tc === 1.35 ? g.I[1] : yout), t - tc));
      [2.05, 2.75].forEach(tc => c.ripple(490, 545, t - tc, COL.pos));
      const ks = ramp(t, L.w('STI'), L.w('STI') + 0.35);
      c.el(960, 380, 'STI ¬ &nbsp;·&nbsp; Y = −A', { cls: 'formula', a: ks, s: 0.8 + 0.2 * back(ks) });
      const kp = ramp(t, L.w('诞生'), L.w('诞生') + 0.3);
      c.el(960, 760, '✓ &nbsp;测试 3/3 通过', { cls: 'toast good', a: kp, tf: `translateY(${(1 - eo(kp)) * 30}px)` });
      c.el(960, 180, '输入并联 → 第一个反相器', { cls: 'h3 center', a: ramp(t, 0.2, 0.6) });
    },
  },

  wall: {
    sid: 4, kicker: 'LEVEL 05 · 撞墙',
    cues: L => [
      { t: L.w('撞墙'), s: 'block/crafter/fail', v: 0.9 }, { t: L.w('撞墙'), s: 'random/anvil_land', v: 0.3 },
      { t: L.w('零'), s: 'note/bit', v: 0.45, p: 0 },
      { t: L.w('零', 1), s: 'note/bit', v: 0.45, p: 0 },
      { t: L.w('不'), s: 'random/anvil_land', v: 0.75 }, { t: L.w('不'), s: 'random/glass1', v: 0.45 },
      { t: L.w('完备'), s: 'block/vault/insert_fail', v: 0.6 },
    ],
    draw(c, L) {
      const t = c.t, B = L.w('撞墙'), K = L.w('不');
      const shake = Math.exp(-Math.max(0, t - B) * 8) * (t > B ? 1 : 0) + Math.exp(-Math.max(0, t - K) * 6) * (t > K ? 1.4 : 0);
      c.cam = { x: 960 + Math.sin(t * 90) * 10 * shake, y: 540 + Math.cos(t * 77) * 8 * shake, z: 1.0 };
      c.P[0] = ramp(t, K, K + 0.6); c.P[1] = shake;
      const z = t > L.w('零') - 0.1;
      // 一小片 TNAND 网络，输入全 0
      const g1 = gate(c, 760, 430, { name: 'TNAND', ins: [{ n: 'A', v: z ? 0 : 4 }, { n: 'B', v: z ? 0 : 4 }], outs: [{ n: 'Y', v: z ? 0 : 4 }], w: 170, gap: 50 });
      const g2 = gate(c, 760, 660, { name: 'TNAND', ins: [{ n: 'A', v: z ? 0 : 4 }, { n: 'B', v: z ? 0 : 4 }], outs: [{ n: 'Y', v: z ? 0 : 4 }], w: 170, gap: 50 });
      const g3 = gate(c, 1160, 545, { name: 'TNAND', ins: [{ n: 'A', v: z ? 0 : 4 }, { n: 'B', v: z ? 0 : 4 }], outs: [{ n: 'Y', v: z ? 0 : 4 }], w: 170, gap: 50, hl: ramp(t, L.w('零', 1), L.w('零', 1) + 0.2), hv: 0 });
      const ins = [[420, 405], [420, 455], [420, 635], [420, 685]];
      ins.forEach((p, i) => { c.box(p[0], p[1], 7, 7, { v: z ? 0 : 4, hl: 1, kind: 1 }); c.wire([p, i < 2 ? g1.I[i] : g2.I[i - 2]], { v: z ? 0 : 4, flow: z ? 1 : 0 }); c.el(p[0] - 30, p[1], '0', { cls: 'tval', a: z ? 1 : 0.3, style: 'color:#9aa0b0;border-color:#9aa0b0' }); });
      c.wire([g1.O[0], [980, g1.O[0][1]], [980, g3.I[0][1]], g3.I[0]], { v: z ? 0 : 4, flow: z ? 1 : 0 });
      c.wire([g2.O[0], [1000, g2.O[0][1]], [1000, g3.I[1][1]], g3.I[1]], { v: z ? 0 : 4, flow: z ? 1 : 0 });
      c.wire([g3.O[0], [1440, g3.O[0][1]]], { v: z ? 0 : 4, flow: z ? 1 : 0 });
      const ko = ramp(t, L.w('零', 1), L.w('零', 1) + 0.25);
      c.box(1490, 545, 44, 44, { v: 0, a: ko, hl: 1, kind: 2 });
      c.el(1490, 545, '0', { cls: 'bigsym', a: ko, style: 'color:#9aa0b0' });
      c.el(960, 220, '−min(0, 0) = 0 &nbsp;·&nbsp; 0 进 0 出，永远逃不出 0', { cls: 'h3 center', a: ramp(t, L.w('零'), L.w('零') + 0.3) });
      const kw = ramp(t, B, B + 0.15) * (1 - ramp(t, B + 0.4, B + 0.8));
      c.el(960, 540, '', { a: kw * 0.35, world: false, style: 'width:1920px;height:1080px;background:#ff2a2a;mix-blend-mode:screen' });
      const ks = ramp(t, K, K + 0.25);
      c.el(960, 560, '不完备<small>INCOMPLETE</small>', { cls: 'stamp', a: ks, s: 1.6 - 0.6 * eo(ks), world: false, tf: 'rotate(-8deg)' });
    },
  },

  threshold: {
    sid: 0, kicker: 'LEVEL 05 · 阈值门',
    cues: L => [
      { t: L.w('阈值'), s: 'block/amethyst/resonate3', v: 0.4 },
      { t: L.w('NTI'), s: 'block/enchantment_table/enchant1', v: 0.6 },
      { t: L.w('PTI'), s: 'block/enchantment_table/enchant2', v: 0.6 },
      { t: L.w('Setun'), s: 'block/beacon/power1', v: 0.45 },
    ],
    draw(c, L) {
      const t = c.t;
      const defs = [['NTI', '负阈', 640, [1, -1, -1]], ['PTI', '正阈', 1280, [1, 1, -1]]];
      defs.forEach(([nm, cn, x, tbl]) => {
        const T0 = L.w(nm), k = ramp(t, T0 - 0.1, T0 + 0.25);
        const ph = Math.floor(Math.max(0, t - T0 - 0.2) / 0.45) % 3, inV = ph - 1, outV = tbl[ph];
        const g = gate(c, x, 400, { name: nm, sub: cn, ins: [{ n: 'A', v: inV }], outs: [{ n: 'Y', v: outV }], w: 180, a: k, s: 0.85 + 0.15 * back(k), hl: k, hv: outV });
        c.wire([[g.I[0][0] - 120, g.I[0][1]], g.I[0]], { v: inV, a: k, flow: 1 });
        c.wire([g.O[0], [g.O[0][0] + 120, g.O[0][1]]], { v: outV, a: k, flow: 1 });
        // 传输特性：输入 − 0 + → 输出
        [-1, 0, 1].forEach((iv, i) => {
          const cx = x - 110 + i * 110, kk = ramp(t, T0 + 0.1 + i * 0.1, T0 + 0.3 + i * 0.1);
          c.box(cx, 640, 44, 34, { v: iv, a: kk * 0.9, hl: ph === i ? 1 : 0.15, kind: 3 });
          c.el(cx, 640, tsym(iv), { cls: 'tcell', a: kk, style: `color:${vcol(iv)}` });
          c.wire([[cx, 676], [cx, 720]], { v: tbl[i], a: kk, p: kk });
          c.box(cx, 756, 44, 34, { v: tbl[i], a: kk * 0.9, hl: ph === i ? 1 : 0.15, kind: 3 });
          c.el(cx, 756, tsym(tbl[i]), { cls: 'tcell', a: kk, style: `color:${vcol(tbl[i])}` });
        });
        c.el(x - 200, 640, '输入', { cls: 'cap', a: k, anchor: 'r' });
        c.el(x - 200, 756, '输出', { cls: 'cap', a: k, anchor: 'r' });
      });
      const ks = ramp(t, L.w('Setun'), L.w('Setun') + 0.35);
      c.el(960, 870, 'Setun 的物理基础 · 用阈值区分三种电平', { cls: 'toast', a: ks, tf: `translateY(${(1 - eo(ks)) * 24}px)` });
      c.el(960, 190, '破局的钥匙', { cls: 'h2 center', a: ramp(t, L.w('钥匙'), L.w('钥匙') + 0.3) * (1 - ramp(t, L.w('NTI') - 0.2, L.w('NTI') + 0.2)) });
      c.el(960, 190, '阈值门：把“是不是某个值”变成 + / −', { cls: 'h3 center', a: ramp(t, L.w('NTI'), L.w('NTI') + 0.3) });
    },
  },

  mux: {
    sid: 0, kicker: 'CH 1 · 选择与判断',
    cues: L => {
      const S = L.w('MUX');
      return [
        { t: L.w('搭出'), s: 'ui/cartography_table/drawmap2', v: 0.55 },
        { t: S, s: 'random/click', v: 0.6 }, { t: S, s: 'note/bit', v: 0.4, p: -5 },
        { t: S + 0.45, s: 'random/click', v: 0.6 }, { t: S + 0.45, s: 'note/bit', v: 0.4, p: 0 },
        { t: S + 0.9, s: 'random/click', v: 0.6 }, { t: S + 0.9, s: 'note/bit', v: 0.4, p: 7 },
        { t: L.w('真值'), s: 'ui/loom/select_pattern1', v: 0.55 },
        { t: L.w('查表'), s: 'note/pling', v: 0.5, p: 0 },
      ];
    },
    draw(c, L) {
      const t = c.t, S = L.w('MUX');
      c.cam = { x: 960 + 140 * eio(ramp(t, L.w('真值') - 0.3, L.w('真值') + 0.5)), y: 540, z: 1 - 0.08 * eio(ramp(t, L.w('真值') - 0.3, L.w('真值') + 0.5)) };
      const D = [1, -1, 0];
      const sel = t < S ? null : t < S + 0.45 ? -1 : t < S + 0.9 ? 0 : 1;
      const Sv = sel ?? 4, Y = sel === null ? 4 : D[sel + 1];
      const kb = ramp(t, L.w('搭出') - 0.3, L.w('搭出'));
      const g = gate(c, 820, 500, { name: 'MUX', sub: '选择器', ins: [{ n: 'Dm', v: D[0] }, { n: 'Dz', v: D[1] }, { n: 'Dp', v: D[2] }], outs: [{ n: 'Y', v: Y }], w: 200, gap: 70, a: kb, hl: ramp(t, S, S + 0.3), hv: Y });
      const pw = eio(ramp(t, L.w('搭出'), L.w('三路') + 0.3));
      D.forEach((d, i) => {
        const p = ioPanel(c, 400, g.I[i][1], ['Dm', 'Dz', 'Dp'][i], d, { a: kb, s: 0.85 });
        const act = sel === null ? 0.8 : sel === i - 1 ? 1 : 0.25;
        c.wire([p, g.I[i]], { v: d, p: pw, a: act, flow: sel === i - 1 ? 1 : 0, w: sel === i - 1 ? 3.5 : 2.5 });
      });
      const sp = ioPanel(c, 820, 790, 'S', sel ?? 0, { a: kb, s: 0.85 });
      c.wire([[sp[0] + 70, sp[1]], [880, 790], [880, 500 + 108]], { v: Sv, p: pw, flow: sel !== null ? 1 : 0 });
      c.box(880, 608, 7, 7, { v: Sv, a: kb, hl: 1, kind: 1 });
      c.wire([g.O[0], [1110, 500]], { v: Y, p: pw, flow: sel !== null ? 1 : 0, w: 3.5 });
      c.box(1140, 500, 30, 30, { v: Y, a: kb, hl: sel !== null ? 1 : 0, kind: 2 });
      c.el(1140, 500, sel === null ? '' : tsym(Y), { cls: 'tval0', a: kb, style: `color:${vcol(Y)}` });
      c.el(820, 300, 'S = − / 0 / + → 选 Dm / Dz / Dp', { cls: 'h4 center', a: ramp(t, S, S + 0.3) });
      // 真值表 = 查表
      const T0 = L.w('真值'), kt = ramp(t, T0, T0 + 0.3), x0 = 1440, y0 = 420, cs = 86;
      c.el(x0 + cs, y0 - 105, '任意 f(A, B)', { cls: 'h3 center', a: kt });
      const f = [[1, 0, -1], [0, 1, 1], [-1, -1, 0]];
      const scan = Math.floor(ramp(t, T0 + 0.4, L.w('查表')) * 7.99);
      for (let i = 0; i < 9; i++) {
        const r = Math.floor(i / 3), cc = i % 3, v = f[r][cc];
        const hit = (t < L.w('查表') && i === scan) || (t >= L.w('查表') && i === 5);
        c.box(x0 + cc * cs, y0 + r * cs, cs / 2 - 5, cs / 2 - 5, { v, a: kt * ramp(t, T0 + i * 0.04, T0 + 0.2 + i * 0.04), hl: hit ? 1 : 0.1, kind: 3 });
        c.el(x0 + cc * cs, y0 + r * cs, tsym(v), { cls: 'tcell', a: kt, style: `color:${vcol(v)}` });
      }
      const kq = ramp(t, L.w('查表'), L.w('查表') + 0.3);
      c.el(x0 + cs, y0 + 3 * cs + 20, '两级 MUX 查表 → 任何函数', { cls: 'toast', a: kq });
    },
  },

  play_add: {
    sid: 0, kicker: 'CH 2 · 算术',
    cues: L => {
      const C = L.w('进位'), cs = [
        { t: 0.55, s: 'random/click', v: 0.5 },
        { t: L.w('半加器'), s: 'block/copper_bulb/place1', v: 0.8 },
        { t: L.w('全加器'), s: 'block/copper_bulb/place2', v: 0.8 },
        { t: L.w('全加器') + 0.15, s: 'block/copper_bulb/place3', v: 0.7 },
        { t: L.w('全加器') + 0.3, s: 'block/copper_bulb/place4', v: 0.6 },
      ];
      for (let k = 0; k < 4; k++) cs.push({ t: C + k * 0.6 + 0.35, s: 'note/bit', v: 0.45, p: [0, 4, 7, 12][k] });
      cs.push({ t: C + 2.75, s: 'random/orb', v: 0.6 });
      return cs;
    },
    draw(c, L) {
      const t = c.t, C = L.w('进位');
      c.cam = { x: 960 + 40 * eio(ramp(t, C, C + 2.4)), y: 540, z: 0.94 };
      const A = [1, 0, 1], B = [1, 1, 0], Sres = [-1, -1, -1], xs = [420, 780, 1140];
      const rs = k => C + k * 0.6;                         // 第 k 位得出结果的时刻
      xs.forEach((x, k) => {
        const appear = k === 0 ? L.w('半加器') : L.w('全加器') + (k - 1) * 0.15;
        const ka = ramp(t, appear - 0.15, appear + 0.1);
        const done = t > rs(k);
        const ins = k === 0 ? [{ n: 'A', v: A[k] }, { n: 'B', v: B[k] }] : [{ n: 'A', v: A[k] }, { n: 'B', v: B[k] }, { n: 'Ci', v: t > rs(k - 1) + 0.4 ? 1 : 4 }];
        const g = gate(c, x, 540, { name: k === 0 ? 'HADD' : 'FADD', sub: `trit ${k}`, ins, outs: [{ n: 'S', v: done ? Sres[k] : 4 }, { n: 'C', v: done ? 1 : 4 }], w: 170, gap: 52, a: ka, s: 0.9 + 0.1 * back(ka), hl: done ? 1 - ramp(t, rs(k) + 0.3, rs(k) + 0.9) * 0.6 : 0, hv: 1 });
        // A/B 从上方进来
        [A[k], B[k]].forEach((v, j) => {
          const top = [x - 150 - j * 26, 250];
          c.el(top[0], top[1] - 30, `${j ? 'B' : 'A'}${k}`, { cls: 'pinlab', a: ka });
          c.box(top[0], top[1], 7, 7, { v, a: ka, hl: 1, kind: 1 });
          c.wire([top, [top[0], g.I[j][1]], g.I[j]], { v, a: ka, p: k === 0 && j === 0 ? eio(ramp(t, 0.15, 0.55)) : ka, flow: t > C - 0.4 ? 1 : 0 });
        });
        // 和输出往下
        const so = [g.O[0][0] + 40, 800];
        c.wire([g.O[0], [g.O[0][0] + 40, g.O[0][1]], so], { v: Sres[k], p: eo(ramp(t, rs(k), rs(k) + 0.35)), flow: 1 });
        const ks = ramp(t, rs(k) + 0.3, rs(k) + 0.5);
        c.box(so[0], so[1] + 30, 30, 30, { v: Sres[k], a: ks, hl: 1, kind: 3 });
        c.el(so[0], so[1] + 30, tsym(Sres[k]), { cls: 'tcell', a: ks, style: `color:${COL.neg}` });
        // 进位往右
        const nx = k < 2 ? [xs[k + 1] - 85 * 1, 540 + 52] : [1500, g.O[1][1]];
        const path = k < 2 ? [g.O[1], [x + 125, g.O[1][1]], [x + 125, 640], [xs[k + 1] - 125, 640], [xs[k + 1] - 125, 592], [xs[k + 1] - 85, 592]] : [g.O[1], [1500, g.O[1][1]]];
        c.wire(path, { v: 1, p: eo(ramp(t, rs(k), rs(k) + 0.45)), flow: 1, w: 3.5, speed: 300 });
        void nx;
      });
      const kc = ramp(t, rs(2) + 0.45, rs(2) + 0.7);
      c.box(1540, 566, 30, 30, { v: 1, a: kc, hl: 1, kind: 3 });
      c.el(1540, 566, '+', { cls: 'tcell', a: kc, style: `color:${COL.pos}` });
      // 游戏光标：开场拖一根线
      const cp = t < 0.15 ? [270, 380] : along([[270, 250], [270, 514], [335, 514]], eio(ramp(t, 0.15, 0.55)));
      c.cursor(cp[0] + 4, cp[1] + 4, { a: 1 - ramp(t, 0.8, 1.1), down: t > 0.15 && t < 0.55 });
      c.ripple(335, 514, t - 0.55);
      const kr = ramp(t, C + 2.75, C + 3.05);
      c.el(960, 140, `<span style="color:${COL.pos}">+0+</span> (10) &nbsp;+&nbsp; <span style="color:${COL.pos}">0++</span> (4) &nbsp;=&nbsp; <span style="color:${COL.amb}">+−−−</span> (14)`, { cls: 'eq small', a: kr });
      c.el(960, 140, '半加器 → 全加器 → 行波进位', { cls: 'h3 center', a: ramp(t, 0.3, 0.7) * (1 - ramp(t, C + 2.5, C + 2.75)) });
    },
  },

  sub: {
    sid: 0, kicker: 'LEVEL 12 · 减法器',
    cues: L => [
      { t: L.w('加法器'), s: 'block/copper_bulb/place2', v: 0.8 },
      { t: L.w('减法'), s: 'ui/toast/in', v: 0.45 },
      { t: L.w('B'), s: 'random/click', v: 0.5 },
      { t: L.w('取反'), s: 'tile/piston/out', v: 0.6 }, { t: L.w('取反') + 0.15, s: 'block/copper_bulb/toggle', v: 0.8 },
      { t: L.w('加'), s: 'random/orb', v: 0.55 },
    ],
    draw(c, L) {
      const t = c.t, N = L.w('取反');
      const ka = ramp(t, L.w('加法器') - 0.2, L.w('加法器') + 0.1);
      const neg = t > N + 0.15, run = t > L.w('加') - 0.1;
      const A = [0, 1], B = [1, 0], Bn = B.map(v => -v), Bi = neg ? Bn : B;
      const out = run ? [-1, 1, 0] : [4, 4, 4];
      const g = gate(c, 1080, 540, { name: 'ADD2', sub: '2-trit 加法', ins: [{ n: 'A0', v: A[0] }, { n: 'A1', v: A[1] }, { n: 'B0', v: Bi[0] }, { n: 'B1', v: Bi[1] }], outs: [{ n: 'S0', v: out[0] }, { n: 'S1', v: out[1] }, { n: 'C', v: out[2] }], w: 220, gap: 62, a: ka, hl: run ? 1 : 0, hv: 2 });
      const ap = [ioPanel(c, 380, g.I[0][1], 'A0', A[0], { a: ka, s: 0.8 }), ioPanel(c, 380, g.I[1][1], 'A1', A[1], { a: ka, s: 0.8 })];
      const bp = [ioPanel(c, 380, g.I[2][1], 'B0', B[0], { a: ka, s: 0.8, hl: ramp(t, L.w('B'), L.w('B') + 0.2) }), ioPanel(c, 380, g.I[3][1], 'B1', B[1], { a: ka, s: 0.8, hl: ramp(t, L.w('B'), L.w('B') + 0.2) })];
      ap.forEach((p, i) => c.wire([p, g.I[i]], { v: A[i], a: ka, flow: 1 }));
      const ks = ramp(t, N - 0.1, N + 0.2);
      bp.forEach((p, i) => {
        const y = g.I[i + 2][1];
        if (ks <= 0) { c.wire([p, g.I[i + 2]], { v: B[i], a: ka, flow: 1 }); return; }
        const sg = gate(c, 700, y, { name: 'STI', ins: [{ n: '', v: B[i] }], outs: [{ n: '', v: neg ? Bn[i] : 4 }], w: 90, h: 50, gap: 1, a: ks, s: 0.6 + 0.4 * back(ks), hl: 1, hv: neg ? Bn[i] : 2 });
        c.wire([p, sg.I[0]], { v: B[i], flow: 1 });
        c.wire([sg.O[0], g.I[i + 2]], { v: neg ? Bn[i] : 4, flow: neg ? 1 : 0, p: eo(ramp(t, N, N + 0.3)) });
      });
      out.forEach((v, i) => {
        c.wire([g.O[i], [g.O[i][0] + 150, g.O[i][1]]], { v, a: ka, flow: run ? 1 : 0, p: run ? eo(ramp(t, L.w('加') - 0.1, L.w('加') + 0.3)) : 1 });
        c.el(g.O[i][0] + 185, g.O[i][1], run ? tsym(v) : '', { cls: 'tval0', a: ramp(t, L.w('加') + 0.2, L.w('加') + 0.4), style: `color:${vcol(v)}` });
      });
      c.el(960, 180, 'A − B &nbsp;=&nbsp; A + (−B)', { cls: 'formula', a: ramp(t, L.w('减法'), L.w('减法') + 0.3) });
      const kf = ramp(t, L.w('白送'), L.w('白送') + 0.2);
      c.el(1430, 230, 'FREE', { cls: 'stamp mini', a: kf * (1 - ramp(t, N - 0.2, N)), s: 1.4 - 0.4 * eo(kf), tf: 'rotate(8deg)' });
      const kr = ramp(t, L.w('上去'), L.w('上去') + 0.3);
      c.el(960, 860, `3 − 1 = 2 &nbsp;·&nbsp; <span style="color:${COL.pos}">+0</span> − <span style="color:${COL.pos}">0+</span> = <span style="color:${COL.amb}">+−</span>`, { cls: 'eq small', a: kr });
    },
  },

  cpu: {
    sid: 0, kicker: 'CH 4 · 完备',
    cues: L => [
      { t: L.w('最后'), s: 'portal/trigger', v: 0.25 },
      { t: L.w('程序'), s: 'block/copper_bulb/place2', v: 0.8 },
      { t: L.w('ALU'), s: 'block/copper_bulb/place3', v: 0.9 },
      { t: L.w('TRIT'), s: 'block/conduit/activate', v: 0.85 },
      { t: L.w('CPU'), s: 'block/beacon/power2', v: 0.4 },
    ],
    draw(c, L) {
      const t = c.t, H = L.w('最后') + 0.25, A = L.w('ALU'), T = L.w('TRIT'), PCt = L.w('程序'), MG = L.w('拼');
      const parts = ['TNAND', 'STI', 'NTI', 'PTI', 'MUX', 'CMP', 'DEC', 'HADD', 'FADD', 'ADD2', 'SUB2', 'REG', 'CNT', 'RAM'];
      const kp = ramp(t, 0.0, A);
      parts.forEach((p, i) => {
        const ang = (i / parts.length) * Math.PI * 2 + 0.3, R = 420 + 60 * hash(i);
        const x0 = 960 + Math.cos(ang) * R * 1.45, y0 = 540 + Math.sin(ang) * R * 0.85;
        const m = eio(ramp(t, H + i * 0.03, A + 0.1 + i * 0.03));
        const x = lerp(x0, 960, m), y = lerp(y0, 540, m);
        const a = ramp(t, i * 0.04, 0.3 + i * 0.04) * (1 - ramp(m, 0.85, 1));
        c.box(x, y, 60 * (1 - 0.5 * m), 26 * (1 - 0.5 * m), { v: 2, a, hl: 0.5, kind: 0 });
        c.el(x, y, p, { cls: 'pinlab', a, s: 1 - 0.5 * m, style: `color:${COL.amb}` });
        void kp;
      });
      // 芯片与放射走线
      const kch = ramp(t, A - 0.1, A + 0.25), kt = ramp(t, T, T + 0.6);
      for (let i = 0; i < 40; i++) {
        const side = i % 4, j = Math.floor(i / 4), o = (j - 4.5) * 34;
        const h1 = 60 + 220 * hash(i + 7), h2 = 80 + 260 * hash(i + 31), sgn = hash(i + 3) > 0.5 ? 1 : -1;
        const v = [-1, 0, 1][i % 3];
        let pts;
        if (side === 0) pts = [[960 + o, 540 - 200], [960 + o, 540 - 200 - h1], [960 + o + sgn * 40, 540 - 240 - h1], [960 + o + sgn * 40, 540 - 260 - h1 - h2]];
        else if (side === 1) pts = [[960 + o, 540 + 200], [960 + o, 540 + 200 + h1], [960 + o + sgn * 40, 540 + 240 + h1], [960 + o + sgn * 40, 540 + 260 + h1 + h2]];
        else if (side === 2) pts = [[960 - 200, 540 + o * 0.9], [960 - 200 - h1, 540 + o * 0.9], [960 - 240 - h1, 540 + o * 0.9 + sgn * 40], [960 - 260 - h1 - h2 * 1.5, 540 + o * 0.9 + sgn * 40]];
        else pts = [[960 + 200, 540 + o * 0.9], [960 + 200 + h1, 540 + o * 0.9], [960 + 240 + h1, 540 + o * 0.9 + sgn * 40], [960 + 260 + h1 + h2 * 1.5, 540 + o * 0.9 + sgn * 40]];
        c.wire(pts, { v, p: eo(ramp(kt, hash(i) * 0.4, 0.6 + hash(i) * 0.4)), flow: 1, speed: -220, a: 0.85, w: 2 });
      }
      const sc = 0.6 + 0.4 * back(kch);
      c.box(960, 540, 200 * sc, 200 * sc, { v: 2, a: kch, hl: 0.5 + 0.5 * kt, kind: 0 });
      c.box(960, 540, 120 * sc, 60 * sc, { v: 1, a: kch * (1 - kt * 0.7), hl: 1, kind: 3 });
      // 程序计数器 PC：先在右侧出现，再并进芯片
      const kpc = ramp(t, PCt - 0.1, PCt + 0.2), mpc = eio(ramp(t, MG, MG + 0.5));
      const px = lerp(1330, 960, mpc), py = lerp(540, 540, mpc);
      c.box(px, py, 80 * (1 - 0.6 * mpc), 50 * (1 - 0.6 * mpc), { v: 1, a: kpc * (1 - ramp(mpc, 0.8, 1)), hl: 1, kind: 0 });
      c.el(px, py, 'PC', { cls: 'chip', a: kpc * (1 - ramp(mpc, 0.8, 1)), s: 0.7 * (1 - 0.6 * mpc) });
      c.el(960, 540 - 10 * kt, 'ALU', { cls: 'chip', a: kch * (1 - ramp(t, T, T + 0.3)), s: sc });
      c.el(960, 520, 'TRIT-3', { cls: 'chip', a: kt, s: sc });
      c.el(960, 585, 'CPU', { cls: 'chipsub', a: ramp(t, L.w('CPU'), L.w('CPU') + 0.3) });
      c.el(960, 900, 'ALU + 程序计数器 · 3-trit 字长 · 寄存器 R0–R3 · 内存 M0–M8', { cls: 'h4 center', a: ramp(t, L.w('CPU'), L.w('CPU') + 0.4), world: false });
    },
  },

  clock: {
    sid: 0, kicker: 'CH 3 · 存储（时序）',
    cues: L => {
      const cs = [];
      for (let k = 0; k < 18; k++) { const tt = L.w('时钟') + k * 0.5; if (tt < 9.2) cs.push({ t: tt, s: k % 2 ? 'tile/piston/in' : 'tile/piston/out', v: 0.2 }); }
      cs.push({ t: L.w('寄存器'), s: 'block/copper_bulb/place1', v: 0.7 });
      cs.push({ t: L.w('移位'), s: 'block/copper_bulb/place2', v: 0.7 });
      cs.push({ t: L.w('计数'), s: 'random/click', v: 0.5 });
      cs.push({ t: L.w('累加器'), s: 'block/copper_bulb/place3', v: 0.7 });
      cs.push({ t: L.w('三格'), s: 'random/chestopen', v: 0.7 });
      return cs;
    },
    draw(c, L) {
      const t = c.t, T0 = L.w('时钟');
      const tickAt = x => (x >= T0 ? Math.floor((x - T0) / 0.5) + 1 : 0);
      const ticks = tickAt(t);
      const pulse = ticks ? 1 - ramp(t, T0 + (ticks - 1) * 0.5, T0 + (ticks - 1) * 0.5 + 0.3) : 0;
      // 顶部时钟波形
      const kw = ramp(t, T0 - 0.2, T0 + 0.2);
      let d = 'M0 40';
      for (let x = 0; x <= 1400; x += 4) { const tt = t - (1400 - x) / 500; const hi = tt > T0 && ((tt - T0) % 0.5) < 0.25; d += ` L${x} ${hi ? 6 : 40}`; }
      c.el(960, 170, `<svg width="1400" height="48"><path d="${d}" fill="none" stroke="${COL.amb}" stroke-width="3" style="filter:drop-shadow(0 0 6px ${COL.amb})"/></svg>`, { a: kw, world: false });
      c.el(240, 120, 'CLK', { cls: 'pinlab', a: kw, world: false, anchor: 'l' });
      c.el(1680, 120, `T = ${ticks}`, { cls: 'pinlab', a: kw, world: false, anchor: 'r', style: `color:${COL.amb}` });
      const seq = [1, -1, 0, 1, 1, -1, 0, -1, 1, 0, 1, -1, 0, 1, -1, 0, 1, 1, -1];
      const D = k => seq[k % seq.length];
      const xs = [250, 590, 930, 1270, 1620], Y = 520;
      const card = (i, word, name, sub, nth = 0) => {
        const k = ramp(t, L.w(word, nth) - 0.15, L.w(word, nth) + 0.15);
        gate(c, xs[i], Y, { name, sub, w: 250, h: 230, a: k, s: 0.85 + 0.15 * back(k), hl: k * (0.35 + 0.65 * pulse), hv: 2 });
        return k;
      };
      // 寄存器：每拍锁存 D
      const k1 = card(0, '寄存器', 'REG', '寄存器');
      const q = ticks ? D(ticks) : 0;
      c.box(xs[0], Y + 10, 42, 42, { v: q, a: k1, hl: 1, kind: 3 });
      c.el(xs[0], Y + 10, tsym(q), { cls: 'tcell', a: k1, style: `color:${vcol(q)}` });
      // 移位寄存器：三格往后挪
      const k2 = card(1, '移位', 'SHIFT', '移位寄存器');
      [0, 1, 2].forEach(j => {
        const v = ticks - j > 0 ? D(ticks - j) : 0;
        c.box(xs[1] - 70 + j * 70, Y + 10, 28, 28, { v, a: k2, hl: 0.8, kind: 3 });
        c.el(xs[1] - 70 + j * 70, Y + 10, tsym(v), { cls: 'tcell small', a: k2, style: `color:${vcol(v)};font-size:30px` });
      });
      // 计数器
      const k3 = card(2, '计数', 'CNT', '计数器');
      const n = Math.max(0, tickAt(t) - tickAt(L.w('计数')) + 1) * (t >= L.w('计数') ? 1 : 0);
      c.el(xs[2], Y + 5, toBal(n % 14, 3), { cls: 'dig mid', a: k3, style: `color:${COL.amb}` });
      c.el(xs[2], Y + 60, `= ${n % 14}`, { cls: 'cap', a: k3 });
      // 累加器：Q ← Q + X
      const k4 = card(3, '累加器', 'ACC', '累加器');
      const xsSeq = [1, 1, -1, 1, 1, -1, -1, 1, 1];
      const a0 = tickAt(L.w('累加器'));
      let acc = 0, lastX = 0;
      for (let k = a0; k <= ticks && t >= L.w('累加器'); k++) { lastX = xsSeq[(k - a0) % xsSeq.length]; acc += lastX; }
      c.el(xs[3], Y - 18, `${lastX > 0 ? '+' : '−'}1`, { cls: 'cap', a: k4, style: `color:${vcol(lastX)}` });
      c.el(xs[3], Y + 22, String(acc), { cls: 'dig mid', a: k4, style: `color:${COL.good}` });
      // 三格小内存
      const k5 = card(4, '三格', 'RAM', '三格小内存');
      const T2 = L.w('三格');
      [-1, 0, 1].forEach((addr, j) => {
        const filled = t > T2 + 0.3 + j * 0.3, v = [1, -1, 0][j];
        const y = Y - 52 + j * 52;
        c.el(xs[4] - 70, y, ['M−', 'M0', 'M+'][j], { cls: 'pinlab', a: k5 });
        c.box(xs[4] + 20, y, 30, 20, { v: filled ? v : 4, a: k5, hl: filled ? 0.7 : 0, kind: 3 });
        c.el(xs[4] + 20, y, filled ? tsym(v) : '', { cls: 'tcell', a: k5, style: `color:${vcol(v)};font-size:28px` });
      });
      c.el(960, 860, '滴答之间，电路记住了过去', { cls: 'h3 center', a: ramp(t, L.w('记忆'), L.w('记忆') + 0.3) });
    },
  },

  asm: {
    sid: 0, kicker: 'CH 4 · 汇编编程',
    cues: L => {
      const cs = [];
      for (let k = 0; k < 6; k++) cs.push({ t: 0.15 + k * 0.12, s: 'random/wood_click', v: 0.16, p: (k % 3) * 2 });
      const tabs = [L.w('累加'), L.w('乘法'), L.w('斐波'), L.w('排序')];
      tabs.forEach((x, i) => { cs.push({ t: x, s: 'random/click', v: 0.5 }); cs.push({ t: x + 0.45, s: 'note/bit', v: 0.35, p: [0, 4, 7, 12][i] }); });
      cs.push({ t: L.w('排序') + 0.9, s: 'random/levelup', v: 0.4 });
      return cs;
    },
    draw(c, L) {
      const t = c.t;
      const P = [
        { w: '累加', tab: '② 累加', code: ['INP R0', 'LIT R1, 1', 'LIT R2, 0', 'LOOP:', 'SUB R3, R1, R0', 'JPP R3, DONE', 'ADD R2, R2, R1', 'ADD R1, R1, 1', 'JMP LOOP', 'DONE:', 'OUT R2', 'HLT'], io: [['4', '10']] },
        { w: '乘法', tab: '③ 乘法', code: ['INP R0', 'INP R1', 'LIT R2, 0', 'JPZ R1, DONE', 'JPP R1, LOOP', 'NEG R0, R0', 'NEG R1, R1', 'LOOP:', 'ADD R2, R2, R0', 'SUB R1, R1, 1', 'JPP R1, LOOP', 'DONE:', 'OUT R2'], io: [['3, 4', '12'], ['−2, 3', '−6']] },
        { w: '斐波', tab: '④ 斐波那契', code: ['INP R0', 'LIT R1, 1', 'LIT R2, 1', 'LOOP:', 'OUT R1', 'SUB R0, R0, 1', 'JPZ R0, DONE', 'ADD R3, R1, R2', 'MOV R1, R2', 'MOV R2, R3', 'JMP LOOP', 'DONE:', 'HLT'], io: [['7', '1 1 2 3 5 8 13']] },
        { w: '排序', tab: '⑤ 排序', code: ['INP R0', 'INP R1', 'INP R2', 'MIN R3, R0, R1', 'MAX R0, R0, R1', 'MIN R1, R3, R2', 'OUT R1', 'MIN R1, R0, R2', 'MAX R1, R1, R3', 'OUT R1', 'MAX R1, R0, R2', 'OUT R1', 'HLT'], io: [['3, −2, 1', '−2 1 3']] },
      ];
      let cur = 0;
      P.forEach((p, i) => { if (t >= L.w(p.w) - 0.05) cur = i; });
      const sw = ramp(t, L.w(P[cur].w) - 0.05, L.w(P[cur].w) + 0.25);
      const ka = ramp(t, 0, 0.3);
      const tabs = P.map((p, i) => `<span class="atab${i === cur && t >= L.w(P[0].w) - 0.05 ? ' on' : ''}">${p.tab}</span>`).join('');
      const lines = P[cur].code.map((s, i) => {
        const col = s.endsWith(':') ? COL.neg : COL.txt;
        return `<div class="ln"><i>${String(i + 1).padStart(2, ' ')}</i><span style="color:${col}">${s.replace(/(R\d)/g, `<b style="color:${COL.amb}">$1</b>`)}</span></div>`;
      }).join('');
      c.el(250, 130, `<div class="code"><div class="ctitle">TRIT-3 · 汇编编辑器</div><div class="atabs">${tabs}</div><div style="opacity:${0.35 + 0.65 * sw};transform:translateX(${(1 - eo(sw)) * 24}px)">${lines}</div></div>`, { a: ka, anchor: 'tl', world: false });
      const rows = P[cur].io.map(([i, o], k) => {
        const ok = ramp(t, L.w(P[cur].w) + 0.35 + k * 0.25, L.w(P[cur].w) + 0.5 + k * 0.25);
        return `<div class="reg"><b>IN</b><span class="rv" style="width:auto;flex:1;text-align:left">${i}</span></div><div class="reg"><b>OUT</b><span class="rv" style="width:auto;flex:1;text-align:left;color:${COL.good};opacity:${ok}">${o} &nbsp;✓</span></div>`;
      }).join('');
      c.el(1110, 130, `<div class="regs"><div class="ctitle">测试用例</div>${rows}</div>`, { a: ramp(t, 0.4, 0.8), anchor: 'tl', world: false });
      const kr = ramp(t, L.w('排序') + 0.9, L.w('排序') + 1.2);
      c.el(1390, 880, '5 道汇编题 · 全部通过', { cls: 'toast good', a: kr, world: false });
    },
  },

  map: {
    sid: 0, kicker: 'MISSION MAP · 任务路线',
    cues: L => {
      const cs = [];
      const scale = [0, 2, 4, 7, 9];
      for (let k = 0; k < 25; k++) cs.push({ t: 0.25 + k * 0.135, s: 'note/bit', v: 0.18, p: scale[k % 5] + 12 * Math.floor(k / 5) - 12 });
      cs.push({ t: L.w('计算机'), s: 'random/levelup', v: 0.4 });
      return cs;
    },
    draw(c, L) {
      const t = c.t, STEP = 0.135;
      const prog = ramp(t, 0.1, 0.25 + 25 * STEP);
      c.cam = { x: 960, y: lerp(700, 380, eio(prog)), z: lerp(0.86, 0.78, eio(ramp(t, 0, 6))) };
      const chapters = [
        ['0 · 平衡三进制', ['连一根线', '取反 STI', '取小 TMIN', '取大 TMAX', '阈值门']],
        ['1 · 选择与判断', ['选择器 MUX', '比较器', '解码器']],
        ['2 · 算术', ['半加器', '全加器', '行波加法', '减法器', '乘法器']],
        ['3 · 存储', ['寄存器', '移位寄存器', '计数器', '累加器', '小内存']],
        ['4 · 完备', ['ALU', '程序计数器', '编程 ①', '编程 ②', '编程 ③', '编程 ④', '编程 ⑤']],
      ];
      const nodes = []; let idx = 0, row = 0;
      chapters.forEach(([cn, names], ci) => {
        for (let k = 0; k < names.length; k += 5) {
          const y = 1180 - row * 165;
          names.slice(k, k + 5).forEach((nm, i) => nodes.push([600 + i * 250, y, idx++, nm]));
          if (k === 0) c.el(250, y, `<b>CHAPTER ${ci}</b><br>${cn.split(' · ')[1]}`, { cls: 'chap', a: ramp(t, L.w('五个') + ci * 0.08, L.w('五个') + 0.3 + ci * 0.08), anchor: 'l' });
          row++;
        }
      });
      for (let k = 1; k < nodes.length; k++) {
        const a = nodes[k - 1], b = nodes[k];
        const lit = t > 0.25 + k * STEP;
        const pts = a[1] === b[1] ? [[a[0] + 64, a[1]], [b[0] - 64, b[1]]]
          : [[a[0] + 64, a[1]], [a[0] + 90, a[1]], [a[0] + 90, (a[1] + b[1]) / 2], [b[0] - 90, (a[1] + b[1]) / 2], [b[0] - 90, b[1]], [b[0] - 64, b[1]]];
        c.wire(pts, { v: lit ? 5 : 4, w: 3, flow: lit ? 1 : 0, speed: 260 });
      }
      nodes.forEach(([x, y, k, nm]) => {
        const lit = t > 0.25 + k * STEP, fresh = 1 - ramp(t, 0.25 + k * STEP, 0.25 + k * STEP + 0.5);
        c.box(x, y, 64, 34, { v: lit ? 5 : 2, a: 1, hl: lit ? 0.5 + fresh * 0.5 : 0, kind: 0 });
        c.el(x, y - 2, `<i>${String(k + 1).padStart(2, '0')}</i> ${nm}`, { cls: 'node', a: lit ? 1 : 0.45 });
      });
      const kf = ramp(t, L.w('计算机'), L.w('计算机') + 0.4);
      c.el(960, 90, '25 关 · 5 章 · 从一根导线到一台计算机', { cls: 'h2 center', a: kf, world: false });
      c.el(1730, 90, `${Math.min(25, Math.max(0, Math.floor((t - 0.25) / STEP) + 1))}/25`, { cls: 'counter', a: ramp(t, 0.1, 0.4), world: false });
    },
  },

  bench: {
    sid: 0, kicker: 'GAMEPLAY · 布线台',
    cues: L => [
      { t: L.w('引') - 0.2, s: 'random/click', v: 0.35 },
      { t: L.w('吸附'), s: 'random/click', v: 0.6 }, { t: L.w('吸附') + 0.02, s: 'note/pling', v: 0.35, p: 7 },
      { t: L.w('拖'), s: 'random/wood_click', v: 0.5 },
      { t: L.w('改接'), s: 'random/click', v: 0.6 }, { t: L.w('改接') + 0.02, s: 'note/pling', v: 0.35, p: 12 },
      { t: L.w('单步'), s: 'tile/piston/out', v: 0.45 }, { t: L.w('单步'), s: 'random/wood_click', v: 0.5 },
      { t: L.w('时钟'), s: 'tile/piston/in', v: 0.45 }, { t: L.w('时钟'), s: 'random/wood_click', v: 0.5 },
      { t: L.w('配'), s: 'tile/piston/out', v: 0.45 }, { t: L.w('配'), s: 'random/wood_click', v: 0.5 },
      { t: L.w('波形'), s: 'ui/cartography_table/drawmap2', v: 0.5 },
    ],
    draw(c, L) {
      const t = c.t;
      const S0 = L.w('引') - 0.6, SN = L.w('吸附'), R0 = L.w('拖'), RN = L.w('改接'), K = L.w('单步');
      c.cam = { x: 960, y: 470 + 50 * eio(ramp(t, K - 0.3, K + 0.5)), z: 0.95 };
      const ticks = [K, L.w('时钟'), L.w('配')].filter(x => t >= x).length;
      const seqA = [1, -1, 0, 1], seqB = [-1, 0, 1, 1];
      const a = seqA[ticks], b = seqB[ticks];
      const pA = ioPanel(c, 380, 360, 'A', a), pB = ioPanel(c, 380, 600, 'B', b);
      const g1 = gate(c, 1050, 330, { name: 'TMAX', sub: '取大', ins: [{ n: 'A', v: t > SN ? a : 4 }, { n: 'B', v: b }], outs: [{ n: 'Y' }], w: 170, gap: 60 });
      const g2 = gate(c, 1050, 640, { name: 'TMIN', sub: '取小', ins: [{ n: 'A', v: t > RN ? a : 4 }, { n: 'B', v: b }], outs: [{ n: 'Y' }], w: 170, gap: 60 });
      // B 早已接好两根
      c.wire([pB, [800, 600], [800, g1.I[1][1]], g1.I[1]], { v: b, flow: 1 });
      c.wire([pB, [820, 600], [820, g2.I[1][1]], g2.I[1]], { v: b, flow: 1 });
      c.wire([g1.O[0], [1300, g1.O[0][1]]], { v: t > SN && t < RN ? Math.max(a, b) : 4, a: 0.7, flow: t > SN && t < RN ? 1 : 0 });
      c.wire([g2.O[0], [1300, g2.O[0][1]]], { v: t > RN ? Math.min(a, b) : 4, a: 0.7, flow: t > RN ? 1 : 0 });
      const route = (to) => [pA, [700, pA[1]], [700, to[1]], to];
      let cur = null, snapTo = null;
      if (t >= S0 && t < SN) {
        // 拖线中：光标停在钉旁 26px，吸附框亮起，预览直接连到钉上
        const m = along([pA, [g1.I[0][0] - 26, g1.I[0][1] + 18]], eio(ramp(t, S0, SN - 0.35)));
        cur = m;
        snapTo = t > SN - 0.4 ? g1.I[0] : null;
        c.wire(route(snapTo || m), { v: 2, a: 0.75, w: 2.5 });
      } else if (t >= SN && t < R0) {
        c.wire(route(g1.I[0]), { v: a, flow: 1, w: 3 });
        cur = [g1.I[0][0] - 20, g1.I[0][1] + 16];
      } else if (t >= R0 && t < RN) {
        // 拎起线头，拖到 TMIN 的 A 钉
        const m = along([g1.I[0], [g2.I[0][0] - 24, g2.I[0][1] - 16]], eio(ramp(t, R0, RN - 0.3)));
        cur = m;
        snapTo = t > RN - 0.35 ? g2.I[0] : null;
        c.wire(route(snapTo || m), { v: 2, a: 0.75, w: 2.5 });
      } else if (t >= RN) {
        c.wire(route(g2.I[0]), { v: a, flow: 1, w: 3 });
        cur = along([[g2.I[0][0] - 20, g2.I[0][1] - 10], [600, 190]], eio(ramp(t, RN + 0.2, K - 0.3)));
      } else cur = along([[700, 900], pA], eio(ramp(t, 0, S0)));
      if (snapTo) c.box(snapTo[0], snapTo[1], 12, 12, { v: 2, a: 1, hl: 1, kind: 2 });
      const dn = (t > S0 && t < SN) || (t > R0 && t < RN) || [K, L.w('时钟'), L.w('配')].some(x => t > x - 0.03 && t < x + 0.08);
      c.cursor(cur[0] + 4, cur[1] + 4, { down: dn });
      c.ripple(g1.I[0][0], g1.I[0][1], t - SN); c.ripple(g2.I[0][0], g2.I[0][1], t - RN);
      const kb1 = ramp(t, SN - 0.4, SN - 0.2) * (1 - ramp(t, R0 - 0.3, R0));
      c.el(g1.I[0][0] - 60, g1.I[0][1] - 52, '自动吸附', { cls: 'badge good', a: kb1 });
      const kb2 = ramp(t, RN - 0.3, RN - 0.1) * (1 - ramp(t, K - 0.4, K - 0.1));
      c.el(g2.I[0][0] - 60, g2.I[0][1] - 52, '拖线改接', { cls: 'badge good', a: kb2 });
      const kb = ramp(t, K - 0.5, K - 0.2);
      c.el(600, 190, `<span class="btn${dn && t > K - 0.1 ? ' on' : ''}">⏵ 滴答</span> <span class="btn ghost">T=${ticks}</span>`, { a: kb });
      const kw = ramp(t, L.w('波形') - 0.2, L.w('波形') + 0.2);
      const lane = (seq, y, nm, col) => {
        let d = '';
        for (let i = 0; i <= ticks; i++) { const v = seq[i], x0 = 120 + i * 140, yy = y - v * 18; d += `${i ? 'L' : 'M'}${x0} ${yy} L${x0 + 140} ${yy} `; }
        return `<text x="10" y="${y + 5}" fill="#9aa1b2" font-size="15" font-family="Menlo">${nm}</text><path d="${d}" fill="none" stroke="${col}" stroke-width="2.5"/>`;
      };
      const ys = seqA.map((v, i) => Math.min(v, seqB[i]));
      c.el(960, 960, `<svg width="760" height="170" viewBox="0 0 760 170">${lane(seqA, 30, 'IN A', COL.neg)}${lane(seqB, 85, 'IN B', COL.pos)}${lane(ys, 140, 'OUT Y', COL.amb)}</svg>`, { cls: 'wave', a: kw, world: false });
    },
  },

  toy: {
    sid: 0, kicker: 'BILIBILI TOY',
    cues: L => [
      { t: L.w('上线'), s: 'random/levelup', v: 0.4 },
      { t: L.w('点'), s: 'random/click', v: 0.6 },
      { t: L.w('进度'), s: 'ui/toast/in', v: 0.45 },
      { t: L.w('排行榜'), s: 'block/amethyst/resonate1', v: 0.45 },
      { t: L.w('排行榜') + 0.1, s: 'random/orb', v: 0.4 },
    ],
    draw(c, L) {
      const t = c.t;
      const kp = ramp(t, 0.0, 0.5);
      const tap = L.w('点');
      // 手机：竖屏里的真实游戏画面（路线图）
      const press = t > tap - 0.05 && t < tap + 0.15 ? 0.97 : 1;
      c.el(700, 545, `<div class="phone"><div class="notch"></div><img src="phone.png" alt=""></div>`, { a: kp, s: (0.92 + 0.08 * eo(kp)) * press, world: false, tf: `translateY(${(1 - eo(kp)) * 40}px)` });
      c.ripple(700, 640, t - tap);
      // B站 Toy 标签
      const kt = ramp(t, L.w('B'), L.w('Toy') + 0.2);
      c.el(1180, 250, '<span class="toytag">B站 Toy</span>', { a: kt, s: 0.8 + 0.2 * back(kt), world: false, anchor: 'l' });
      c.el(1180, 330, 'bilibili.com/toy/ternary', { cls: 'url small', a: ramp(t, L.w('Toy') + 0.1, L.w('App')), world: false, anchor: 'l' });
      const ka = ramp(t, L.w('App'), L.w('App') + 0.3);
      c.el(1180, 420, 'App 里点开就玩', { cls: 'h3', a: ka, world: false, anchor: 'l' });
      const kc = ramp(t, L.w('进度'), L.w('进度') + 0.3);
      c.el(1180, 500, '<span class="chip3">云存档 · 跟随 B站账号</span>', { a: kc, world: false, anchor: 'l', tf: `translateX(${(1 - eo(kc)) * 30}px)` });
      const kr = ramp(t, L.w('排行榜'), L.w('排行榜') + 0.35);
      const rows = [['1', '通关数榜'], ['2', '精简分榜']].map(([n, s]) => `<li><b>${n}</b>${s}</li>`).join('');
      c.el(1180, 660, `<div class="rankcard"><div class="ctitle">排行榜 · 总榜 / 本周 / 今日</div><ol>${rows}</ol></div>`, { a: kr, world: false, anchor: 'l', tf: `translateY(${(1 - eo(kr)) * 30}px)` });
    },
  },

  outro: {
    sid: 5, kicker: 'PLAY',
    cues: L => {
      const cs = [];
      for (let k = 0; k < 10; k++) cs.push({ t: 0.2 + k * 0.22, s: 'random/wood_click', v: 0.13, p: (k % 4) * 2 });
      for (let k = 0; k < 8; k++) cs.push({ t: L.w('或者') + k * 0.28, s: 'random/wood_click', v: 0.11, p: (k % 3) * 2 });
      cs.push({ t: L.w('ternary') + 0.1, s: 'note/pling', v: 0.4, p: 7 });
      cs.push({ t: L.w('三个'), s: 'note/bell', v: 0.5, p: -5 }, { t: L.w('三个') + 0.15, s: 'note/bell', v: 0.5, p: 0 }, { t: L.w('三个') + 0.3, s: 'note/bell', v: 0.5, p: 7 });
      cs.push({ t: L.w('计算机') - 0.9, s: 'fireworks/launch1', v: 0.5 }, { t: L.w('计算机') + 0.4, s: 'fireworks/largeblast1', v: 0.55 }, { t: L.w('计算机') + 0.9, s: 'fireworks/twinkle1', v: 0.5 });
      return cs;
    },
    draw(c, L) {
      const t = c.t, end = L.dur;
      c.P[0] = t - (L.w('计算机') + 0.4);
      const fade = 1 - ramp(t, end - 1.6, end - 0.2);
      c.P[1] = fade;
      const toy = 'bilibili.com/toy/ternary', gh = 'github.com/Bemly/ternary-complete';
      const n1 = Math.floor(ramp(t, 0.15, L.w('ternary') + 0.1) * toy.length);
      const n2 = Math.floor(ramp(t, L.w('或者'), L.w('complete') + 0.3) * gh.length);
      c.el(960, 190, '三进制完备', { cls: 'title', a: ramp(t, 0, 0.4) * fade, s: 0.62, world: false });
      const kq = ramp(t, L.w('ternary'), L.w('ternary') + 0.4);
      c.el(560, 430, `<div class="qrbox">${QR_SVG}<span>B站扫码直接玩</span></div>`, { a: kq * fade, s: 0.85 + 0.15 * back(kq), world: false });
      c.el(800, 380, `<span class="toytag">B站 Toy</span>`, { a: ramp(t, 0, 0.3) * fade, world: false, anchor: 'l' });
      c.el(800, 470, `<span class="url">${toy.slice(0, n1)}<b class="caret">${n1 < toy.length ? '▍' : ''}</b></span>`, { a: ramp(t, 0, 0.3) * fade, world: false, anchor: 'l' });
      const kg = ramp(t, L.w('或者') - 0.1, L.w('或者') + 0.2);
      c.el(800, 570, `<span class="gh">GitHub · ${gh.slice(0, n2)}</span>`, { a: kg * fade, world: false, anchor: 'l' });
      [-1, 0, 1].forEach((v, i) => {
        const k = ramp(t, L.w('三个') + i * 0.15, L.w('三个') + 0.3 + i * 0.15);
        c.el(800 + i * 160, 730, tsym(v), { cls: 'tri', a: k * fade, s: 0.5 + 0.5 * back(k), world: false, style: `color:${vcol(v)};border-color:${vcol(v)};box-shadow:0 0 30px ${vcol(v)}66` });
      });
      c.el(960, 860, '用三个数字，重新发明计算机', { cls: 'h2 center', a: ramp(t, L.w('重新'), L.w('重新') + 0.4) * fade, world: false });
    },
  },
};

// TRIT-3 累加程序的执行轨迹（与游戏 cpu.js 语义一致的精简版）
export function asmRun(n) {
  const P = [[1, 'INP', ['R0']], [2, 'LIT', ['R1', 1]], [3, 'LIT', ['R2', 0]], [5, 'SUB', ['R3', 'R1', 'R0']], [6, 'JPP', ['R3', 'DONE']], [7, 'ADD', ['R2', 'R2', 'R1']], [8, 'ADD', ['R1', 'R1', 1]], [9, 'JMP', [3]], [11, 'OUT', ['R2']], [12, 'HLT', []]];
  const R = [0, 0, 0, 0], ri = s => +s[1], val = x => (typeof x === 'number' ? x : R[ri(x)]);
  const trace = []; let ip = 0, out = null;
  for (let s = 0; s < 200; s++) {
    const [line, op, a] = P[ip];
    if (op === 'INP') R[ri(a[0])] = n; else if (op === 'LIT') R[ri(a[0])] = a[1];
    else if (op === 'SUB') R[ri(a[0])] = val(a[1]) - val(a[2]); else if (op === 'ADD') R[ri(a[0])] = val(a[1]) + val(a[2]);
    else if (op === 'OUT') out = R[ri(a[0])];
    trace.push({ ip, line, op, a, R: [...R] });
    if (op === 'HLT') break;
    if (op === 'JPP') ip = R[ri(a[0])] > 0 ? 8 : ip + 1; else if (op === 'JMP') ip = a[0]; else ip++;
  }
  return { trace, out };
}

// 时间轴辅助：L.w('词', n) 返回该词第 n 次出现的句内时间
export function lineHelper(line) {
  return {
    start: line.start, dur: line.end - line.start,
    w(word, nth = 0) {
      let k = 0;
      for (const x of line.words) if (x.w === word && k++ === nth) return x.t - line.start;
      throw new Error(`${line.id}: 找不到词「${word}」#${nth}`);
    },
  };
}

// 全部音效（绝对时间）
export function allCues(timeline) {
  const out = [];
  for (const line of timeline.lines) {
    const L = lineHelper(line);
    for (const c of SCENES[line.scene].cues(L)) out.push({ ...c, t: +(line.start + c.t).toFixed(3), scene: line.scene });
  }
  return out.sort((a, b) => a.t - b.t);
}
