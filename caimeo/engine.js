// SDF instanced-primitive renderer (WebGL2). Every mark on screen is a primitive
// evaluated as a signed distance field in the fragment shader.
'use strict';

const PAPER = [241 / 255, 238 / 255, 230 / 255];
const INK = [53 / 255, 56 / 255, 48 / 255];
const QUIET = [133 / 255, 135 / 255, 122 / 255];
const GOLD = [155 / 255, 134 / 255, 91 / 255];
const RULE = [53 / 255, 56 / 255, 48 / 255];

const VS_PRIM = `#version 300 es
layout(location=0) in vec2 q;
layout(location=1) in vec4 p0;
layout(location=2) in vec4 p1;
layout(location=3) in vec4 meta;
layout(location=4) in vec4 col;
layout(location=5) in vec4 bb;
uniform vec2 res;
out vec2 vp;
flat out vec4 vp0; flat out vec4 vp1; flat out vec4 vmeta; flat out vec4 vcol;
void main(){
  vec2 P = mix(bb.xy, bb.zw, q);
  vp = P; vp0 = p0; vp1 = p1; vmeta = meta; vcol = col;
  vec2 c = P / res * 2.0 - 1.0;
  gl_Position = vec4(c.x, -c.y, 0.0, 1.0);
}`;

const FS_PRIM = `#version 300 es
precision highp float;
in vec2 vp;
flat in vec4 vp0; flat in vec4 vp1; flat in vec4 vmeta; flat in vec4 vcol;
out vec4 o;
float sdSeg(vec2 p, vec2 a, vec2 b){
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
  return length(pa - ba * h);
}
float sdBox(vec2 p, vec2 b, float r){
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
float sdArc(vec2 p, float r, float a0, float sw){
  float a = atan(p.y, p.x);
  float rel = mod(a - a0, 6.28318530718);
  if (rel <= sw) return abs(length(p) - r);
  vec2 e0 = r * vec2(cos(a0), sin(a0));
  vec2 e1 = r * vec2(cos(a0 + sw), sin(a0 + sw));
  return min(length(p - e0), length(p - e1));
}
float sdHex(vec2 p, float r){
  const vec3 k = vec3(-0.866025404, 0.5, 0.577350269);
  p = abs(p);
  p -= 2.0 * min(dot(k.xy, p), 0.0) * k.xy;
  p -= vec2(clamp(p.x, -k.z * r, k.z * r), r);
  return length(p) * sign(p.y);
}
mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
void main(){
  int t = int(vmeta.x + 0.5);
  float mode = vmeta.y;
  float w = vp1.z, soft = vp1.w;
  vec2 p = vp;
  float d = 0.0;
  float a;
  if (t == 5) {
    vec2 qq = (p - vp0.xy) / vp0.zw;
    a = exp(-dot(qq, qq) * 2.5);
  } else {
    if (t == 0) d = length(p - vp0.xy) - vp0.z;
    else if (t == 1) d = sdSeg(p, vp0.xy, vp0.zw) - vp1.x;
    else if (t == 2) d = sdBox(rot(vp1.y) * (p - vp0.xy), vp0.zw, vp1.x);
    else if (t == 3) d = sdArc(p - vp0.xy, vp0.z, vp0.w, vp1.x);
    else if (t == 4) d = sdHex(rot(vp1.x) * (p - vp0.xy), vp0.z);
    float dist = mode < 0.5 ? d : abs(d) - w * 0.5;
    float aa = 0.75 + soft;
    a = 1.0 - smoothstep(-aa, aa, dist);
  }
  a *= vcol.a;
  o = vec4(vcol.rgb * a, a);
}`;

const VS_FULL = `#version 300 es
const vec2 v[3] = vec2[3](vec2(-1.0,-1.0), vec2(3.0,-1.0), vec2(-1.0,3.0));
void main(){ gl_Position = vec4(v[gl_VertexID], 0.0, 1.0); }`;

const FS_BG = `#version 300 es
precision highp float;
uniform vec2 res; uniform vec3 paper; uniform float vig;
out vec4 o;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ s += a * n(p); p *= 2.03; a *= 0.5; } return s; }
void main(){
  vec2 fc = vec2(gl_FragCoord.x, res.y - gl_FragCoord.y);
  vec2 uv = fc / res;
  vec3 c = paper;
  float cloud = fbm(fc * 0.0035);
  float fib = fbm(vec2(fc.x * 0.02, fc.y * 0.0025));
  c *= 1.0 - 0.025 * (cloud - 0.5) - 0.012 * (fib - 0.5);
  float r = length((uv - 0.5) * vec2(res.x / res.y, 1.0));
  c *= mix(1.0, 1.0 - vig, smoothstep(0.45, 1.2, r));
  o = vec4(c, 1.0);
}`;

const FS_TEX = `#version 300 es
precision highp float;
uniform vec2 res; uniform sampler2D tex;
out vec4 o;
void main(){ o = texture(tex, gl_FragCoord.xy / res); }`;

const FS_GRAIN = `#version 300 es
precision highp float;
uniform vec2 res; uniform float amt;
out vec4 o;
float h(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
void main(){
  float g = h(floor(gl_FragCoord.xy));
  o = vec4(vec3(g * 0.5), 1.0) * amt;
}`;

class Renderer {
  constructor(canvas) {
    this.cv = canvas;
    const gl = canvas.getContext('webgl2', { antialias: false, premultipliedAlpha: true, preserveDrawingBuffer: true, alpha: false });
    this.gl = gl;
    this.W = canvas.width; this.H = canvas.height;
    this.progPrim = this.prog(VS_PRIM, FS_PRIM);
    this.progBg = this.prog(VS_FULL, FS_BG);
    this.progGrain = this.prog(VS_FULL, FS_GRAIN);
    this.progTex = this.prog(VS_FULL, FS_TEX);
    // text layer: Cormorant (the site's typeface) rasterised to a texture each frame
    this.tc = document.createElement('canvas'); this.tc.width = this.W; this.tc.height = this.H;
    this.tctx = this.tc.getContext('2d');
    this.texts = [];
    this.tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    this.MAX = 40000;
    this.STRIDE = 20;
    this.data = new Float32Array(this.MAX * this.STRIDE);
    this.n = 0;
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    const qb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, qb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    this.ib = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.ib);
    gl.bufferData(gl.ARRAY_BUFFER, this.data.byteLength, gl.DYNAMIC_DRAW);
    for (let i = 0; i < 5; i++) {
      gl.enableVertexAttribArray(1 + i);
      gl.vertexAttribPointer(1 + i, 4, gl.FLOAT, false, this.STRIDE * 4, i * 16);
      gl.vertexAttribDivisor(1 + i, 1);
    }
    gl.bindVertexArray(null);
    this.emptyVao = gl.createVertexArray();
    // transform stack for sub-views (montage)
    this.tx = 0; this.ty = 0; this.s = 1; this.alpha = 1;
    this.stack = [];
  }
  prog(vs, fs) {
    const gl = this.gl;
    const mk = (type, src) => {
      const sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
      return sh;
    };
    const p = gl.createProgram();
    gl.attachShader(p, mk(gl.VERTEX_SHADER, vs)); gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    return p;
  }
  push() { this.stack.push([this.tx, this.ty, this.s, this.alpha]); }
  pop() { [this.tx, this.ty, this.s, this.alpha] = this.stack.pop(); }
  translate(x, y) { this.tx += x * this.s; this.ty += y * this.s; }
  scale(k) { this.s *= k; }
  fade(a) { this.alpha *= a; }
  X(x) { return this.tx + x * this.s; }
  Y(y) { return this.ty + y * this.s; }
  emit(type, mode, p0, p1, col, alpha, bb) {
    const a = (col[3] === undefined ? 1 : col[3]) * alpha * this.alpha;
    if (a <= 0.002 || this.n >= this.MAX) return;
    const o = this.n++ * this.STRIDE, D = this.data;
    D[o] = p0[0]; D[o + 1] = p0[1]; D[o + 2] = p0[2]; D[o + 3] = p0[3];
    D[o + 4] = p1[0]; D[o + 5] = p1[1]; D[o + 6] = p1[2]; D[o + 7] = p1[3];
    D[o + 8] = type; D[o + 9] = mode; D[o + 10] = 0; D[o + 11] = 0;
    D[o + 12] = col[0]; D[o + 13] = col[1]; D[o + 14] = col[2]; D[o + 15] = a;
    D[o + 16] = bb[0]; D[o + 17] = bb[1]; D[o + 18] = bb[2]; D[o + 19] = bb[3];
  }
  // --- primitives (coordinates in current transform space) ---
  disc(x, y, r, col, alpha = 1, soft = 0) {
    const X = this.X(x), Y = this.Y(y), R = r * this.s, p = 2 + soft * 2;
    this.emit(0, 0, [X, Y, R, 0], [0, 0, 0, soft], col, alpha, [X - R - p, Y - R - p, X + R + p, Y + R + p]);
  }
  ring(x, y, r, w, col, alpha = 1) {
    const X = this.X(x), Y = this.Y(y), R = r * this.s, W = Math.max(w * this.s, 0.6), p = W + 2;
    this.emit(0, 1, [X, Y, R, 0], [0, 0, W, 0], col, alpha, [X - R - p, Y - R - p, X + R + p, Y + R + p]);
  }
  line(x1, y1, x2, y2, w, col, alpha = 1) {
    const a = this.X(x1), b = this.Y(y1), c = this.X(x2), d = this.Y(y2), r = Math.max(w * this.s, 0.6) / 2, p = r + 2;
    this.emit(1, 0, [a, b, c, d], [r, 0, 0, 0], col, alpha, [Math.min(a, c) - p, Math.min(b, d) - p, Math.max(a, c) + p, Math.max(b, d) + p]);
  }
  capsule(x1, y1, x2, y2, r, w, col, alpha = 1, fill = false) {
    const a = this.X(x1), b = this.Y(y1), c = this.X(x2), d = this.Y(y2), R = r * this.s, W = Math.max(w * this.s, 0.6), p = R + W + 2;
    this.emit(1, fill ? 0 : 1, [a, b, c, d], [R, 0, W, 0], col, alpha, [Math.min(a, c) - p, Math.min(b, d) - p, Math.max(a, c) + p, Math.max(b, d) + p]);
  }
  box(x, y, hw, hh, rad, col, alpha = 1, opt = {}) {
    const X = this.X(x), Y = this.Y(y), HW = hw * this.s, HH = hh * this.s, W = Math.max((opt.w || 0) * this.s, 0.6);
    const rot = opt.rot || 0, ext = (rot ? Math.hypot(HW, HH) : Math.max(HW, HH)) + W + 2;
    const ex = rot ? ext : HW + W + 2, ey = rot ? ext : HH + W + 2;
    this.emit(2, opt.w ? 1 : 0, [X, Y, HW, HH], [rad * this.s, rot, W, opt.soft || 0], col, alpha, [X - ex, Y - ey, X + ex, Y + ey]);
  }
  arc(x, y, r, a0, sw, w, col, alpha = 1) {
    const X = this.X(x), Y = this.Y(y), R = r * this.s, W = Math.max(w * this.s, 0.6), p = R + W + 2;
    this.emit(3, 1, [X, Y, R, ((a0 % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)], [sw, 0, W, 0], col, alpha, [X - p, Y - p, X + p, Y + p]);
  }
  hex(x, y, r, col, alpha = 1, opt = {}) {
    const X = this.X(x), Y = this.Y(y), R = r * this.s, W = Math.max((opt.w || 0) * this.s, 0.6), p = R * 1.2 + W + 2;
    this.emit(4, opt.w ? 1 : 0, [X, Y, R, 0], [opt.rot || 0, 0, W, 0], col, alpha, [X - p, Y - p, X + p, Y + p]);
  }
  shadow(x, y, rx, ry, col, alpha = 1) {
    const X = this.X(x), Y = this.Y(y), RX = rx * this.s, RY = ry * this.s;
    this.emit(5, 0, [X, Y, RX, RY], [0, 0, 0, 0], col, alpha, [X - RX * 1.6, Y - RY * 1.6, X + RX * 1.6, Y + RY * 1.6]);
  }
  diamond(x, y, r, w, col, alpha = 1, fill = false) {
    const h = r / Math.SQRT2;
    this.box(x, y, h, h, 0.5, col, alpha, { rot: Math.PI / 4, w: fill ? 0 : w });
  }
  font(size, italic) { return `${italic ? 'italic ' : ''}400 ${size}px Cormorant`; }
  measure(str, size, o = {}) {
    const c = this.tctx; c.font = this.font(size, o.italic); c.letterSpacing = `${(o.ls || 0) * size}px`;
    return c.measureText(str).width;
  }
  // str at (x,y) = baseline-centre (align centre) or baseline-left; reveal uncovers characters left to right
  text(str, x, y, size, o = {}) {
    const a = (o.alpha ?? 1) * this.alpha;
    if (a <= 0.002 || !str) return;
    this.texts.push({ str, x: this.X(x), y: this.Y(y), size: size * this.s, col: o.col || INK, a, italic: !!o.italic, align: o.align || 'center', ls: o.ls || 0, reveal: o.reveal ?? 1, rise: o.rise ?? 0.15 });
  }
  flushText() {
    const c = this.tctx;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, this.W, this.H);
    c.textBaseline = 'alphabetic';
    for (const t of this.texts) {
      c.font = this.font(t.size, t.italic);
      c.letterSpacing = `${t.ls * t.size}px`;
      const rgb = `rgb(${t.col.map((v) => Math.round(v * 255)).join(',')})`;
      const total = c.measureText(t.str).width;
      let x0 = t.align === 'center' ? t.x - total / 2 : t.align === 'right' ? t.x - total : t.x;
      const chars = [...t.str], n = chars.length;
      if (t.reveal >= 1) { c.globalAlpha = t.a; c.fillStyle = rgb; c.textAlign = 'left'; c.fillText(t.str, x0, t.y); continue; }
      for (let i = 0; i < n; i++) {
        const k = Math.max(0, Math.min(1, t.reveal * (n + 4) - i));
        if (k <= 0) break;
        const e = k * k * (3 - 2 * k);
        const off = c.measureText(chars.slice(0, i).join('')).width;
        c.globalAlpha = t.a * e; c.fillStyle = rgb; c.textAlign = 'left';
        c.fillText(chars[i], x0 + off, t.y + (1 - e) * t.size * t.rise);
      }
    }
    c.globalAlpha = 1;
    this.texts = [];
  }
  // --- frame ---
  begin() { this.texts = []; this.n = 0; this.tx = 0; this.ty = 0; this.s = 1; this.alpha = 1; this.stack = []; }
  end(opt = {}) {
    const gl = this.gl;
    gl.viewport(0, 0, this.W, this.H);
    gl.disable(gl.BLEND);
    gl.useProgram(this.progBg);
    gl.uniform2f(gl.getUniformLocation(this.progBg, 'res'), this.W, this.H);
    gl.uniform3fv(gl.getUniformLocation(this.progBg, 'paper'), opt.paper || PAPER);
    gl.uniform1f(gl.getUniformLocation(this.progBg, 'vig'), opt.vig ?? 0.06);
    gl.bindVertexArray(this.emptyVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(this.progPrim);
    gl.uniform2f(gl.getUniformLocation(this.progPrim, 'res'), this.W, this.H);
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.ib);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.data, 0, this.n * this.STRIDE);
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, this.n);
    // text layer
    this.flushText();
    gl.useProgram(this.progTex);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.tc);
    gl.uniform2f(gl.getUniformLocation(this.progTex, 'res'), this.W, this.H);
    gl.uniform1i(gl.getUniformLocation(this.progTex, 'tex'), 0);
    gl.bindVertexArray(this.emptyVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // paper grain over everything (like the site's feTurbulence overlay)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(this.progGrain);
    gl.uniform2f(gl.getUniformLocation(this.progGrain, 'res'), this.W, this.H);
    gl.uniform1f(gl.getUniformLocation(this.progGrain, 'amt'), 0.045);
    gl.bindVertexArray(this.emptyVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}

// ---------- helpers ----------
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => { t = clamp01(t); return t * t * (3 - 2 * t); };
const easeOut = (t) => { t = clamp01(t); return 1 - Math.pow(1 - t, 3); };
const easeIn = (t) => { t = clamp01(t); return t * t * t; };
const mixc = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const win = (t, a, b) => clamp01((t - a) / (b - a));
