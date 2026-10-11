// Deterministic renderer: a 2D canvas holds the typography for time t, a
// fragment shader composites it over the animated background.
// ?w=1440 narrows the frame (4:3 cover); the video itself is always 1920 wide.
const W = +(new URLSearchParams(location.search).get('w') || 1920), H = 1080;
const TM = window.TIMINGS;
const TOTAL = TM.total;
const GAP_OUT = 0.5;

const COL = {
  fg: '#d9dce3', w: '#ffffff', d: '#8b909b', m: '#5f6672',
  p: '#c79bdc', r: '#e8697d', y: '#e6c37a', g: '#98c97c', b: '#6cb2ee', c: '#5fc0cc', o: '#dd9a6a',
};
const FONT = {
  sans: s => `400 ${s}px "Avenir Next", "PingFang SC", "Helvetica Neue", sans-serif`,
  mono: s => `400 ${s}px "SF Mono", Menlo, Monaco, "PingFang SC", monospace`,
  zh: s => `400 ${s}px "PingFang SC", "Avenir Next", sans-serif`,
};

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = x => 1 - Math.pow(1 - clamp(x), 3);
const io = x => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const fin = (t, a, d = 0.45) => ease((t - a) / d);
const vis = (t, a, b, din = 0.45, dout = 0.35) => fin(t, a, din) * (1 - clamp((t - b) / dout));
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---- timeline lookups -------------------------------------------------

function chapterEnd(n) {
  const next = TM.chapters[n];
  return next ? next.offset - GAP_OUT : TOTAL + 1;
}

// Time (chapter-local) at which the character at `idx` of the sentence is spoken,
// interpolated inside the phrase that build-timings.mjs aligned to the audio.
function charTime(s, idx) {
  let q = s.map[0];
  for (const m of s.map) if (m[0] <= idx) q = m;
  return q[2] + (q[3] - q[2]) * clamp((idx - q[0]) / Math.max(1, q[1] - q[0]));
}

// "3" chapter start · "3$" chapter end · "3.2" sentence start · "3.2$" sentence end
// "3.2@some words" when those words are spoken · optional "+0.4" / "-0.2" suffix.
const cueCache = new Map();
function at(cue) {
  if (typeof cue === 'number') return cue;
  if (cueCache.has(cue)) return cueCache.get(cue);
  const m = /^(\d+)(?:\.(\d+))?(\$)?(?:@(.*?))?([+-]\d*\.?\d+)?$/.exec(cue);
  if (!m) throw new Error('bad cue ' + cue);
  const ch = TM.chapters[+m[1] - 1];
  let t;
  if (!m[2]) t = m[3] ? ch.offset + ch.dur : ch.offset;
  else {
    const s = ch.sents[+m[2] - 1];
    if (!s) throw new Error('no sentence ' + cue);
    if (m[4]) {
      const idx = s.en.toLowerCase().indexOf(m[4].toLowerCase());
      if (idx < 0) throw new Error('phrase not found: ' + cue);
      t = ch.offset + charTime(s, idx);
    } else t = ch.offset + (m[3] ? s.e : s.s);
  }
  t += m[5] ? parseFloat(m[5]) : 0;
  cueCache.set(cue, t);
  return t;
}

// ---- subtitles --------------------------------------------------------

function splitKeep(text, re) {
  const out = []; let last = 0, m;
  while ((m = re.exec(text))) { out.push(text.slice(last, m.index + m[0].length).trim()); last = m.index + m[0].length; }
  if (last < text.length) out.push(text.slice(last).trim());
  return out.filter(Boolean);
}

function buildSubs() {
  const subs = [];
  TM.chapters.forEach(ch => ch.sents.forEach((s, si) => {
    const en = splitKeep(s.en, /[.?!:](?=\s|$)/g);
    const zh = splitKeep(s.zh, /[。？！：；]/g);
    const next = ch.sents[si + 1];
    const end = ch.offset + (next ? Math.min(next.s, s.e + 0.6) : s.e + 0.5);
    let pos = 0;
    const enAt = en.map(p => { const i = s.en.indexOf(p, pos); pos = i + p.length; return i; });
    // Each Chinese clause starts with the English clause at the nearest relative position.
    const pairs = [];
    if (zh.length === en.length) en.forEach((p, i) => pairs.push({ zh: zh[i], en: [p], i }));
    else {
      let zpos = 0, prev = -1;
      zh.forEach(z => {
        const f = zpos / s.zh.length; zpos += z.length;
        let best = Math.max(prev, 0);
        for (let i = best; i < en.length; i++) if (Math.abs(enAt[i] / s.en.length - f) < Math.abs(enAt[best] / s.en.length - f)) best = i;
        if (best === prev) pairs[pairs.length - 1].zh += z;
        else pairs.push({ zh: z, en: [], i: best });
        prev = best;
      });
      pairs[0].i = 0;
      pairs.forEach((p, k) => { p.en = en.slice(p.i, pairs[k + 1] ? pairs[k + 1].i : en.length); });
    }
    const res = [];
    for (const p of pairs) {
      const text = p.en.join(' '), last = res[res.length - 1];
      if (last && (last.zh + p.zh).length <= 24 && (last.en + text).length <= 76) { last.zh += p.zh; last.en += ' ' + text; }
      else res.push({ zh: p.zh, en: text, s: ch.offset + charTime(s, enAt[p.i]) });
    }
    res.forEach((r, i) => { r.e = res[i + 1] ? res[i + 1].s : end; subs.push(r); });
  }));
  return subs;
}

// ---- 2D drawing -------------------------------------------------------

const cv = document.createElement('canvas');
cv.width = W; cv.height = H;
const ctx = cv.getContext('2d');

function segs(str) {
  const out = []; let last = 0, m; const re = /\{(\w):([^}]*)\}/g;
  while ((m = re.exec(str))) {
    if (m.index > last) out.push([null, str.slice(last, m.index)]);
    out.push([m[1], m[2]]); last = m.index + m[0].length;
  }
  if (last < str.length) out.push([null, str.slice(last)]);
  return out;
}
const plain = str => str.replace(/\{\w:([^}]*)\}/g, '$1');

function measure(str, size, font = 'sans') {
  ctx.font = FONT[font](size);
  return ctx.measureText(plain(str)).width;
}

// Draws marked-up text; `chars` limits how many characters are shown (typewriter).
function rich(str, x, y, { size = 40, font = 'sans', alpha = 1, color = 'fg', align = 'left', chars = Infinity } = {}) {
  if (alpha <= 0.003) return 0;
  ctx.font = FONT[font](size);
  ctx.textBaseline = 'alphabetic';
  const w = ctx.measureText(plain(str)).width;
  let cx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  ctx.globalAlpha = alpha;
  let left = chars;
  for (const [k, text] of segs(str)) {
    if (left <= 0) break;
    const shown = text.slice(0, left); left -= text.length;
    ctx.fillStyle = COL[k || color];
    ctx.fillText(shown, cx, y);
    cx += ctx.measureText(text.slice(0, shown.length)).width;
  }
  ctx.globalAlpha = 1;
  return w;
}

function rrect(x, y, w, h, r) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
}

const KIND = {
  text(it, t, a) {
    const slide = (1 - fin(t, it.t0, 0.55)) * (it.slide ?? 18);
    rich(it.t, it.x, it.y + slide, { size: it.size, font: it.font, alpha: a * (it.alpha ?? 1), color: it.color, align: it.align });
  },
  title(it, t, a) {
    const slide = (1 - fin(t, it.t0, 0.6)) * 14;
    rich(it.t, it.x ?? 110, (it.y ?? 158) + slide, { size: it.size ?? 80, alpha: a });
  },
  code(it, t, a) {
    const size = it.size ?? 26, lh = it.lh ?? Math.round(size * 1.55), font = it.font ?? 'mono';
    const fade = it.fade ? 1 - (1 - it.fade[1]) * fin(t, at(it.fade[0]), 0.5) : 1;
    it.lines.forEach((ln, i) => {
      if (ln.s === '') return;
      const y = it.y + i * lh;
      let la = a * fade * vis(t, ln.t0, ln.t1 ?? Infinity, 0.4);
      if (ln.dim) la *= 1 - 0.72 * fin(t, at(ln.dim), 0.5);
      if (la <= 0.003) return;
      const w = measure(ln.s, size, font);
      if (ln.hl) {
        const h = vis(t, at(ln.hl[0]), ln.hl[1] ? at(ln.hl[1]) : Infinity, 0.4);
        if (h > 0) {
          const c = COL[ln.hlc || 'y'];
          ctx.globalAlpha = la * h * 0.13; ctx.fillStyle = c;
          rrect(it.x - 14, y - size * 1.02, (w + 28) * ease(h), lh * 0.96, 6); ctx.fill();
          ctx.globalAlpha = la * h * 0.9; ctx.fillRect(it.x - 14, y - size * 1.02, 3, lh * 0.96);
          ctx.globalAlpha = 1;
        }
      }
      const slide = ln.type ? 0 : (1 - fin(t, ln.t0, 0.45)) * 10;
      let chars = Infinity;
      if (ln.type) {
        const n = plain(ln.s).length, dur = ln.typeDur ?? Math.min(1.4, n * 0.035);
        chars = Math.floor(clamp((t - ln.t0) / dur) * n);
        if (chars < n || (t - ln.t0 < dur + 0.8 && Math.floor(t * 2.5) % 2 === 0)) {
          ctx.font = FONT[font](size);
          const cx = it.x + ctx.measureText(plain(ln.s).slice(0, chars)).width;
          ctx.globalAlpha = la; ctx.fillStyle = COL.fg; ctx.fillRect(cx + 2, y - size * 0.86, size * 0.52, size * 1.08); ctx.globalAlpha = 1;
        }
      }
      rich(ln.s, it.x, y + slide, { size, font, alpha: la, chars, color: ln.color });
      if (ln.strike) {
        const k = fin(t, at(ln.strike), 0.4);
        if (k > 0) {
          ctx.globalAlpha = la * 0.9; ctx.strokeStyle = COL.r; ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.moveTo(it.x - 4, y - size * 0.3); ctx.lineTo(it.x - 4 + (w + 8) * k, y - size * 0.3); ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    });
  },
  box(it, t, a) {
    ctx.globalAlpha = a * 0.55; ctx.strokeStyle = COL[it.c || 'm']; ctx.lineWidth = 1.5;
    rrect(it.x, it.y, it.w, it.h, 10); ctx.stroke();
    ctx.globalAlpha = a * 0.05; ctx.fillStyle = COL[it.c || 'd']; ctx.fill();
    ctx.globalAlpha = 1;
  },
  arrow(it, t, a) {
    const k = fin(t, it.t0, 0.6), x2 = it.x1 + (it.x2 - it.x1) * k, y2 = it.y1 + (it.y2 - it.y1) * k;
    const ang = Math.atan2(it.y2 - it.y1, it.x2 - it.x1);
    ctx.globalAlpha = a; ctx.strokeStyle = ctx.fillStyle = COL[it.c || 'p']; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(it.x1, it.y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2 + 12 * Math.cos(ang), y2 + 12 * Math.sin(ang));
    ctx.lineTo(x2 + 9 * Math.cos(ang + 2.4), y2 + 9 * Math.sin(ang + 2.4));
    ctx.lineTo(x2 + 9 * Math.cos(ang - 2.4), y2 + 9 * Math.sin(ang - 2.4)); ctx.fill();
    ctx.globalAlpha = 1;
  },
  fn(it, t, a) { it.draw(t, a, it); },
};

// Grey bars standing in for unread prose.
function skeleton(x, y, w, rows, lh, alpha, seed = 1, shown = Infinity) {
  ctx.fillStyle = COL.m;
  for (let i = 0; i < Math.min(rows, shown); i++) {
    const r = hash(seed * 31 + i);
    if (r < 0.1) continue;
    ctx.globalAlpha = alpha * (r > 0.92 ? 0.9 : 0.5);
    const ww = r > 0.92 ? w * 0.28 : w * (0.45 + 0.55 * hash(seed * 7 + i * 3));
    rrect(x, y + i * lh, ww, lh * 0.42, 3); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

let ITEMS = [], SUBS = [], FX = { field: [], confetti: [] };

function scene(ch, items) {
  for (const it of items) {
    it.ch = ch;
    it.t0 = at(it.in ?? String(ch));
    it.t1 = it.out ? at(it.out) : chapterEnd(ch);
    if (it.k === 'code') {
      it.lines = it.lines.map((ln, i) => {
        ln = typeof ln === 'string' ? { s: ln } : ln;
        ln.t0 = ln.in ? at(ln.in) : it.t0 + i * (it.stagger ?? 0.05);
        if (ln.out) ln.t1 = at(ln.out);
        return ln;
      });
    }
    ITEMS.push(it);
  }
}

function drawSubs(t) {
  for (const s of SUBS) {
    const a = vis(t, s.s - 0.05, s.e - 0.12, 0.14, 0.12);
    if (a <= 0) continue;
    if (s.zh) {
      let size = 42; const w = measure(s.zh, size, 'zh');
      if (w > 1720) size *= 1720 / w;
      rich(s.zh, W / 2, 972, { size, font: 'zh', alpha: a, align: 'center', color: 'w' });
    }
    if (s.en) {
      let size = 26; const w = measure(s.en, size, 'sans');
      if (w > 1720) size *= 1720 / w;
      rich(s.en, W / 2, 1018, { size, alpha: a * 0.9, align: 'center', color: 'd' });
    }
  }
}

function draw2d(t) {
  ctx.clearRect(0, 0, W, H);
  for (const it of ITEMS) {
    if (t < it.t0 - 0.01 || t > it.t1 + 0.5) continue;
    const a = vis(t, it.t0, it.t1, it.din ?? 0.5, it.dout ?? 0.4);
    if (a > 0.003) KIND[it.k](it, t, a);
  }
  drawSubs(t);
}

// ---- WebGL ------------------------------------------------------------

const FRAG = `#version 300 es
precision highp float;
uniform sampler2D u_tex;
uniform vec2 u_res;
uniform float u_time, u_pulse, u_field, u_fieldT, u_conf;
uniform vec2 u_confO;
out vec4 o;

float h11(float p){ p = fract(p * .1031); p *= p + 33.33; p *= p + p; return fract(p); }
float h21(vec2 p){ vec3 q = fract(vec3(p.xyx) * .1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p){ float a = .5, s = 0.; for (int i = 0; i < 5; i++) { s += a * noise(p); p = p * 2.03 + 17.; a *= .5; } return s; }

vec3 palette(float h){
  return h < .2 ? vec3(.78, .61, .86) : h < .4 ? vec3(.91, .41, .49) : h < .6 ? vec3(.90, .76, .48)
       : h < .8 ? vec3(.60, .79, .49) : vec3(.42, .70, .93);
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = (gl_FragCoord.xy - .5 * u_res) / u_res.y;

  // Slow domain-warped haze over the flat editor grey.
  float warp = fbm(p * 2. + u_time * .03);
  float n = fbm(p * 1.3 + vec2(u_time * .02, -u_time * .015) + warp);
  vec3 col = vec3(.112, .122, .139) + (n - .5) * vec3(.034, .030, .050);
  col += vec3(.55, .40, .75) * .040 * smoothstep(.95, 0., length(p - vec2(-.60, .36)));
  col *= 1. - .40 * pow(length(p * vec2(.72, 1.)), 2.2);

  // A band of light crosses the frame on chapter changes.
  float band = exp(-pow((p.x * .6 + p.y * .3 - (u_pulse * 2.6 - 1.3)) * 4.5, 2.));
  col += vec3(.60, .45, .80) * .07 * band * sin(u_pulse * 3.14159);

  // Mosaic of files, coloured by language.
  if (u_field > 0.) {
    vec2 g = vec2(120., 54.);
    vec2 c = floor(uv * g), f = fract(uv * g);
    float lang = h21(vec2(floor(c.x / 3.), c.y) * 1.7 + 3.);
    vec3 lc = lang < .42 ? vec3(.42, .70, .93) : lang < .62 ? vec3(.87, .60, .42) : lang < .86 ? vec3(.90, .76, .48) : vec3(.78, .61, .86);
    float on = step(.30, h21(c + 11.));
    float d = length((uv - vec2(.5, .52)) * vec2(1.78, 1.));
    float reveal = smoothstep(d - .08, d + .12, u_fieldT * .9);
    float tw = .55 + .45 * sin(u_time * 1.7 + h21(c) * 6.283);
    float m = smoothstep(.10, .22, f.x) * smoothstep(.90, .78, f.x) * smoothstep(.28, .40, f.y) * smoothstep(.72, .60, f.y);
    float area = smoothstep(.20, .30, uv.y) * smoothstep(.80, .70, uv.y);
    col += lc * m * on * reveal * tw * area * .30 * u_field;
  }

  // Typography with a soft halo taken from the texture's mip chain.
  vec4 t = texture(u_tex, uv);
  vec4 g1 = textureLod(u_tex, uv, 3.2);
  vec4 g2 = textureLod(u_tex, uv, 5.4);
  col *= 1. - .55 * g2.a - .25 * g1.a * u_field;
  col = col * (1. - t.a) + t.rgb;
  col += g1.rgb * .13 + g2.rgb * .11;

  if (u_conf >= 0. && u_conf < 4.6) {
    float tc = u_conf, fade = smoothstep(4.5, 2.8, tc);
    for (int i = 0; i < 150; i++) {
      float fi = float(i);
      float a = h11(fi * 1.31) * 6.2831;
      vec2 v = vec2(cos(a) * 1.25, sin(a) * .85 + .55) * (.35 + 1.25 * h11(fi * 2.7 + 1.));
      vec2 pos = u_confO + v * (1. - exp(-1.9 * tc)) / 1.9 + vec2(.018 * sin(tc * 5. + fi), -.16 * tc * tc);
      float s = .006 + .007 * h11(fi * 5.1);
      float ang = tc * (2. + 5. * h11(fi * 9.3)) + fi;
      vec2 q = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * (p - pos);
      float dd = max(abs(q.x) - s, abs(q.y) - s * (.25 + .75 * abs(cos(tc * 4. + fi * 2.))));
      col = mix(col, palette(h11(fi * 7.7)), smoothstep(.0015, 0., dd) * fade * .95);
    }
  }

  col += (h21(gl_FragCoord.xy + fract(u_time) * vec2(311., 173.)) - .5) * (2.4 / 255.);
  o = vec4(col, 1.);
}`;

let gl, U = {};
function initGL() {
  const el = document.getElementById('gl');
  el.width = W; el.style.width = W + 'px';
  gl = el.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false, alpha: false });
  const mk = (type, src) => {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, mk(gl.VERTEX_SHADER, '#version 300 es\nin vec2 a;void main(){gl_Position=vec4(a,0.,1.);}'));
  gl.attachShader(prog, mk(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  for (const n of ['u_tex', 'u_res', 'u_time', 'u_pulse', 'u_field', 'u_fieldT', 'u_conf', 'u_confO']) U[n] = gl.getUniformLocation(prog, n);
  gl.uniform2f(U.u_res, W, H);
  gl.viewport(0, 0, W, H);
}

// `custom` replaces the timeline drawing (used for the cover still).
function renderFrame(t, custom) {
  if (custom) { ctx.clearRect(0, 0, W, H); custom(); } else draw2d(t);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cv);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.uniform1f(U.u_time, t);

  let pulse = 0;
  for (const c of TM.chapters.slice(1)) { const k = (t - (c.offset - 0.75)) / 1.3; if (k > 0 && k < 1) pulse = k; }
  gl.uniform1f(U.u_pulse, pulse);

  let field = 0, fieldT = 0;
  for (const [a, b] of FX.field) { const v = vis(t, a, b, 0.8, 0.6); if (v > 0) { field = v; fieldT = t - a; } }
  if (custom) { field = 0.8; fieldT = 6; }
  gl.uniform1f(U.u_field, field); gl.uniform1f(U.u_fieldT, fieldT);

  let conf = -1, o = [0, 0];
  for (const c of FX.confetti) if (t >= c.t && t - c.t < 4.6) { conf = t - c.t; o = c.o; }
  gl.uniform1f(U.u_conf, conf); gl.uniform2f(U.u_confO, o[0], o[1]);

  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

async function boot() {
  await Promise.all(['400 40px "Avenir Next"', '400 40px "PingFang SC"', '400 40px Menlo', '400 40px "SF Mono"'].map(f => document.fonts.load(f, 'Aa中文').catch(() => {})));
  initGL();
  SUBS = buildSubs();
  buildScenes();
  window.READY = true;
}
