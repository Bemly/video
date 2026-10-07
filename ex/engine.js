// math.execute (me) ; — 渲染引擎
// 每一帧都是 render(t) 的纯函数：同一个 t 永远画出同一张图（可并行、可跳帧渲染）。
'use strict';

const BPM = 130, P = 60 / BPM, T0 = 0.2177, BAR = 4 * P, FPS = 60, SONG_END = 211.91;
const beatT = n => T0 + n * P;
const tBeat = t => (t - T0) / P;

const C = { cream: '#F5EAD5', teal: '#03948D', ink: '#11100E', ink2: '#1D1C19', tealD: '#026B66', tealL: '#5CC7C0',
            red: '#E8505B', grey: '#8C877C' };
const RGB = { cream: [245, 234, 213], teal: [3, 148, 141], ink: [17, 16, 14], tealL: [92, 199, 192], red: [232, 80, 91] };
const FONT_MONO = '"Menlo", monospace', FONT_MATH = '"STIX Two Math", "STIXGeneral", serif', FONT_ZH = '"PingFang SC", sans-serif';

// ── 数学小工具 ────────────────────────────────────────────
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = t => { t = clamp(t); return t * t * (3 - 2 * t); };
const easeOut = t => 1 - Math.pow(1 - clamp(t), 3);
const easeIn = t => Math.pow(clamp(t), 3);
const easeInOut = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const backOut = t => { t = clamp(t); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const fract = x => x - Math.floor(x);
function hash(n) { n = Math.sin(n * 127.1 + 311.7) * 43758.5453123; return n - Math.floor(n); }
function hash2(a, b) { return hash(a * 12.9898 + b * 78.233); }
function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 1e9) / 1e9; }; }
function noise1(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u); }
function noise2(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  return lerp(lerp(hash2(ix, iy), hash2(ix + 1, iy), ux), lerp(hash2(ix, iy + 1), hash2(ix + 1, iy + 1), ux), uy);
}
const TAU = Math.PI * 2;

// ── 音频特征 ──────────────────────────────────────────────
let FEAT = null;
function feat(name, t) {
  if (!FEAT) return 0;
  const a = FEAT[name], i = t * FEAT.fps, i0 = Math.floor(i);
  if (i0 < 0) return a[0]; if (i0 >= a.length - 1) return a[a.length - 1];
  return lerp(a[i0], a[i0 + 1], i - i0);
}
// 节拍脉冲：拍点处为 1，之后指数衰减
function pulse(t, k = 7, sub = 1) { const b = tBeat(t) * sub; if (b < 0) return 0; return Math.exp(-fract(b) * k); }
function barPulse(t, k = 4) { const b = tBeat(t) / 4; if (b < 0) return 0; return Math.exp(-fract(b) * k); }

// ── 资源 ──────────────────────────────────────────────────
const ASSET = {};
async function loadAssets() {
  const img = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  const [girl, lp, ol, fe] = await Promise.all([img('girl.png'), fetch('lowpoly.json').then(r => r.json()),
    fetch('outline.json').then(r => r.json()), fetch('features.json').then(r => r.json())]);
  ASSET.girl = girl; ASSET.lp = lp; ASSET.outline = ol; FEAT = fe;
  // 剪影（纯色版本），用于发光与色彩分离
  for (const [k, col] of [['silCream', C.cream], ['silTeal', C.teal], ['silRed', C.red], ['silInk', C.ink]]) {
    const c = document.createElement('canvas'); c.width = girl.width; c.height = girl.height;
    const x = c.getContext('2d'); x.drawImage(girl, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col;
    x.fillRect(0, 0, c.width, c.height); ASSET[k] = c;
  }
  // 低多边形三角形：像素坐标 → 以图像中心为原点、高度归一到 1
  const H = lp.H, W = lp.W;
  ASSET.tris = lp.tris.map((t, i) => {
    const v = t.v.map(([x, y]) => [(x - W / 2) / H, (y - H / 2) / H]);
    const cx = (v[0][0] + v[1][0] + v[2][0]) / 3, cy = (v[0][1] + v[1][1] + v[2][1]) / 3;
    return { v, c: C[t.c], cx, cy, r: hash(i * 7.3), r2: hash(i * 3.1 + 9) };
  });
  ASSET.girlAspect = W / H;
  // 轮廓上的采样点（用于粒子化）
  const pts = [];
  const sc = document.createElement('canvas'); sc.width = 160; sc.height = Math.round(160 * H / W);
  const sx = sc.getContext('2d'); sx.drawImage(girl, 0, 0, sc.width, sc.height);
  const d = sx.getImageData(0, 0, sc.width, sc.height).data;
  for (let y = 0; y < sc.height; y++) for (let x = 0; x < sc.width; x++) {
    const k = (y * sc.width + x) * 4;
    if (d[k + 3] > 128) pts.push({ x: (x / sc.width - .5) * W / H, y: y / sc.height - .5, r: d[k], g: d[k + 1], b: d[k + 2], h: hash(x * 131 + y) });
  }
  ASSET.pts = pts;
  // 预计算：吸引子与 IFS 点集（与帧无关，确定性）
  ASSET.lorenz = (() => { const a = []; let x = .1, y = 0, z = 0; const dt = .005;
    for (let i = 0; i < 24000; i++) { const dx = 10 * (y - x), dy = x * (28 - z) - y, dz = x * y - 8 / 3 * z;
      x += dx * dt; y += dy * dt; z += dz * dt; if (i > 400) a.push([x, y, z]); } return a; })();
  ASSET.fern = (() => { const r = rng(7), a = []; let x = 0, y = 0;
    for (let i = 0; i < 60000; i++) { const p = r(); let nx, ny;
      if (p < .01) { nx = 0; ny = .16 * y; } else if (p < .86) { nx = .85 * x + .04 * y; ny = -.04 * x + .85 * y + 1.6; }
      else if (p < .93) { nx = .2 * x - .26 * y; ny = .23 * x + .22 * y + 1.6; } else { nx = -.15 * x + .28 * y; ny = .26 * x + .24 * y + .44; }
      x = nx; y = ny; a.push([x, y]); } return a; })();
  ASSET.clifford = [[-1.4, 1.6, 1.0, 0.7], [1.7, 1.7, 0.6, 1.2], [-1.7, 1.3, -0.1, -1.2], [-1.8, -2.0, -0.5, -0.9]].map(([a, b, c, d]) => {
    const pts = new Float32Array(2 * 70000); let x = .1, y = .1;
    for (let i = 0; i < 70000; i++) { const nx = Math.sin(a * y) + c * Math.cos(a * x), ny = Math.sin(b * x) + d * Math.cos(b * y); x = nx; y = ny;
      pts[2 * i] = x; pts[2 * i + 1] = y; } return pts; });
}

// ── 画布 ──────────────────────────────────────────────────
let W = 1920, H = 1080, S = 1;        // S：以 1080p 为基准的缩放
let cv2, ctx, glc, gl;
function setupCanvas(w, h) {
  W = w; H = h; S = h / 1080;
  cv2 = document.createElement('canvas'); cv2.width = W; cv2.height = H;
  ctx = cv2.getContext('2d', { willReadFrequently: false });
  glc = document.getElementById('out'); glc.width = W; glc.height = H;
  gl = glc.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false });
  initGL();
}

// 2D 绘制辅助：坐标系以画面中心为原点、单位 = 1080p 像素
function begin2D() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.setTransform(S, 0, 0, S, W / 2, H / 2);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
}
const VW = () => W / S, VH = () => H / S;     // 视口宽高（1080p 单位）
function fillBG(col) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function text(s, x, y, size, col, opt = {}) {
  ctx.save();
  ctx.font = `${opt.weight || ''} ${size}px ${opt.font || FONT_MONO}`;
  ctx.fillStyle = col; ctx.textAlign = opt.align || 'left'; ctx.textBaseline = opt.base || 'middle';
  if (opt.alpha !== undefined) ctx.globalAlpha *= opt.alpha;
  if (opt.glow) { ctx.shadowColor = opt.glowCol || col; ctx.shadowBlur = opt.glow; }
  if (opt.spacing) ctx.letterSpacing = opt.spacing + 'px';
  ctx.fillText(s, x, y);
  ctx.restore();
}
function textW(s, size, font = FONT_MONO) { ctx.save(); ctx.font = `${size}px ${font}`; const w = ctx.measureText(s).width; ctx.restore(); return w; }
// 简易数学排版：支持 ^{..} 与 _{..}
function mathText(s, x, y, size, col, opt = {}) {
  const parts = []; let i = 0;
  while (i < s.length) {
    if ((s[i] === '^' || s[i] === '_') && s[i + 1] === '{') {
      const kind = s[i]; let d = 1, j = i + 2; while (j < s.length && d) { if (s[j] === '{') d++; else if (s[j] === '}') d--; j++; }
      parts.push({ t: s.slice(i + 2, j - 1), k: kind }); i = j;
    } else { let j = i; while (j < s.length && !((s[j] === '^' || s[j] === '_') && s[j + 1] === '{')) j++; parts.push({ t: s.slice(i, j), k: '' }); i = j; }
  }
  const font = opt.font || FONT_MATH;
  let total = 0; for (const p of parts) total += textW(p.t, p.k ? size * .62 : size, font);
  let cx = opt.align === 'center' ? x - total / 2 : opt.align === 'right' ? x - total : x;
  for (const p of parts) {
    const sz = p.k ? size * .62 : size, dy = p.k === '^' ? -size * .38 : p.k === '_' ? size * .25 : 0;
    text(p.t, cx, y + dy, sz, col, { ...opt, font, align: 'left' });
    cx += textW(p.t, sz, font);
  }
  return total;
}
// 打字机效果
function typed(s, p) { const n = Math.floor(clamp(p) * s.length + 1e-6); return s.slice(0, n); }

// 立绘
function drawGirl(x, y, h, opt = {}) {
  const g = ASSET.girl, w = h * ASSET.girlAspect;
  ctx.save(); ctx.translate(x, y);
  if (opt.rot) ctx.rotate(opt.rot);
  if (opt.flip) ctx.scale(-1, 1);
  ctx.globalAlpha *= (opt.alpha === undefined ? 1 : opt.alpha);
  if (opt.glow) { ctx.shadowColor = opt.glowCol || C.teal; ctx.shadowBlur = opt.glow; }
  const src = opt.sil ? ASSET[opt.sil] : g;
  if (opt.clipY !== undefined) { ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, h * opt.clipY); ctx.clip(); }
  ctx.drawImage(src, -w / 2, -h / 2, w, h);
  ctx.restore();
}
// 低多边形：变换函数 f(tri, i) → {dx, dy, rot, s, a}
function drawTris(x, y, h, f, opt = {}) {
  const T = ASSET.tris;
  ctx.save(); ctx.translate(x, y);
  for (let i = 0; i < T.length; i++) {
    const t = T[i]; const m = f ? f(t, i) : null;
    if (m && m.a !== undefined && m.a <= 0.003) continue;
    ctx.save();
    const cx = t.cx * h, cy = t.cy * h;
    ctx.translate(cx + (m ? m.dx || 0 : 0), cy + (m ? m.dy || 0 : 0));
    if (m && m.rot) ctx.rotate(m.rot);
    const s = m && m.s !== undefined ? m.s : 1;
    ctx.beginPath();
    for (let k = 0; k < 3; k++) { const px = (t.v[k][0] * h - cx) * s, py = (t.v[k][1] * h - cy) * s; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.closePath();
    ctx.globalAlpha = m && m.a !== undefined ? m.a : 1;
    const col = (m && m.col) || (opt.mono ? opt.mono : t.c);
    ctx.fillStyle = col; ctx.fill();
    if (opt.stroke) { ctx.strokeStyle = col; ctx.lineWidth = 0.8; ctx.stroke(); }
    if (m && m.edge) { ctx.strokeStyle = m.edge; ctx.lineWidth = 1; ctx.globalAlpha = m.edgeA || 1; ctx.stroke(); }
    ctx.restore();
  }
  ctx.restore();
}
// 3D 投影
function proj(p, cam) {
  let [x, y, z] = p;
  const cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw), cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
  let x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
  let y1 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
  if (cam.roll) { const cr = Math.cos(cam.roll), sr = Math.sin(cam.roll); const t = x1 * cr - y1 * sr; y1 = x1 * sr + y1 * cr; x1 = t; }
  const d = cam.dist || 6, f = (cam.fov || 900) / (d + z2);
  return [x1 * f, -y1 * f, z2, f];
}
function polyline(pts, close = false) { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); if (close) ctx.closePath(); }

// ── WebGL：背景着色器 + 合成后期 ─────────────────────────
let progBG, progPost, progBlur, texScene, fbA, fbB, texA, texB, fbBG, texBG, quad;
const VS = `#version 300 es
in vec2 p; out vec2 uv; void main(){ uv = p*.5+.5; gl_Position = vec4(p,0,1); }`;
const BG_FS = `#version 300 es
precision highp float; in vec2 uv; out vec4 o;
uniform int mode; uniform float t; uniform vec2 res; uniform vec4 a; uniform vec4 b; uniform vec4 c2; uniform float beat;
uniform vec2 seeds[24];
vec3 CREAM=vec3(.961,.918,.835), TEAL=vec3(.012,.580,.553), INK=vec3(.067,.063,.055), TEALL=vec3(.36,.78,.75);
vec3 pal(float x){ x=fract(x); vec3 c=mix(INK,TEAL,smoothstep(0.,.45,x)); c=mix(c,CREAM,smoothstep(.55,.85,x)); return mix(c,INK,smoothstep(.9,1.,x)); }
vec2 cmul(vec2 a,vec2 b){return vec2(a.x*b.x-a.y*b.y,a.x*b.y+a.y*b.x);}
vec2 cdiv(vec2 a,vec2 b){float d=dot(b,b);return vec2(a.x*b.x+a.y*b.y,a.y*b.x-a.x*b.y)/d;}
float mengerDE(vec3 p){
  vec3 q=abs(p)-vec3(1.); float d=max(q.x,max(q.y,q.z)); float s=1.;
  for(int i=0;i<4;i++){ vec3 a2=mod(p*s,2.)-1.; s*=3.; vec3 r=abs(1.-3.*abs(a2));
    float da=max(r.x,r.y),db=max(r.y,r.z),dc=max(r.z,r.x); float cc=(min(da,min(db,dc))-1.)/s; d=max(d,cc); }
  return d; }
float gyroidDE(vec3 p){ float sc=a.w; p*=sc; return abs(dot(sin(p),cos(p.yzx)))/sc*.55-.02; }
mat3 rotY(float x){float c=cos(x),s=sin(x);return mat3(c,0,s,0,1,0,-s,0,c);}
mat3 rotX(float x){float c=cos(x),s=sin(x);return mat3(1,0,0,0,c,-s,0,s,c);}
float hsh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(hsh(i),hsh(i+vec2(1,0)),u.x),mix(hsh(i+vec2(0,1)),hsh(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,s=.5;for(int i=0;i<5;i++){v+=s*vn(p);p*=2.03;s*=.5;}return v;}
void main(){
  vec2 fc = uv*res; vec2 q = (fc - .5*res)/res.y;
  vec3 col = INK;
  if(mode==1){ // Julia
    vec2 z = q*a.z + a.xy; vec2 cc = b.xy; float n=0.; float m=0.;
    for(int i=0;i<260;i++){ z=cmul(z,z)+cc; if(dot(z,z)>64.){ m=1.; break;} n+=1.; }
    float sn = n - log2(log2(dot(z,z)))+4.;
    col = m>0. ? pal(sn*b.z + b.w) : INK;
  } else if(mode==2){ // Mandelbrot
    vec2 cc = q*a.z + a.xy; vec2 z=vec2(0); float n=0.; float m=0.;
    for(int i=0;i<520;i++){ z=cmul(z,z)+cc; if(dot(z,z)>64.){m=1.;break;} n+=1.; }
    float sn = n - log2(log2(dot(z,z)))+4.;
    col = m>0. ? pal(log(sn+1.)*b.z + b.w) : INK;
  } else if(mode==3 || mode==4){ // 光线步进：门格海绵 / 螺旋二十四面体
    vec3 ro=vec3(0,0,a.z); vec3 rd=normalize(vec3(q,-1.6));
    mat3 R=rotY(a.x)*rotX(a.y); ro=R*ro; rd=R*rd;
    float tt=0., d=0.; int it=0;
    for(int i=0;i<110;i++){ vec3 p=ro+rd*tt; d = mode==3 ? mengerDE(p) : max(gyroidDE(p), length(p)-b.w); if(d<.0012*tt||tt>20.)break; tt+=d; it=i; }
    if(tt<20.){ vec3 p=ro+rd*tt; vec2 e=vec2(.002,0);
      vec3 nrm = mode==3 ? normalize(vec3(mengerDE(p+e.xyy)-mengerDE(p-e.xyy),mengerDE(p+e.yxy)-mengerDE(p-e.yxy),mengerDE(p+e.yyx)-mengerDE(p-e.yyx)))
                         : normalize(vec3(gyroidDE(p+e.xyy)-gyroidDE(p-e.xyy),gyroidDE(p+e.yxy)-gyroidDE(p-e.yxy),gyroidDE(p+e.yyx)-gyroidDE(p-e.yyx)));
      float dif=clamp(dot(nrm,normalize(vec3(.6,.8,.5))),0.,1.); float ao=1.-float(it)/110.;
      vec3 base = mix(TEAL, CREAM, smoothstep(.3,.9,dif));
      col = mix(INK, base, ao*(.35+.75*dif)); col += TEALL*pow(1.-abs(dot(nrm,-rd)),3.)*.6*(1.+beat);
      col = mix(col, INK, smoothstep(4.,14.,tt));
    } else col = INK + TEAL*.08*(1.-length(q));
  } else if(mode==5){ // 牛顿分形 z^3-1
    vec2 z=q*a.z+a.xy; float n=0.; float ang=t*.0; vec2 r1=vec2(1,0),r2=vec2(-.5,.866),r3=vec2(-.5,-.866);
    float th=b.x; mat2 Rm=mat2(cos(th),-sin(th),sin(th),cos(th)); r1=Rm*r1; r2=Rm*r2; r3=Rm*r3;
    for(int i=0;i<60;i++){ vec2 f=cmul(cmul(z-r1,z-r2),z-r3); vec2 d1=cmul(z-r2,z-r3)+cmul(z-r1,z-r3)+cmul(z-r1,z-r2); vec2 dz=cdiv(f,d1); z-=dz; if(dot(dz,dz)<1e-7)break; n+=1.; }
    float d1=length(z-r1),d2=length(z-r2),d3=length(z-r3); vec3 base = d1<d2&&d1<d3?TEAL: d2<d3?CREAM:vec3(.13,.12,.11);
    col = base*(1.-n/48.)*1.15;
  } else if(mode==6){ // 沃罗诺伊
    float d1=9.,d2=9.; int id=0;
    for(int i=0;i<24;i++){ if(float(i)>=a.x) break; float d=length(q-seeds[i]); if(d<d1){d2=d1;d1=d;id=i;} else if(d<d2) d2=d; }
    float e=d2-d1; float h=fract(float(id)*.618);
    vec3 base = h<.33?TEAL:h<.66?vec3(.15,.14,.12):CREAM*.9;
    col = mix(CREAM, base, smoothstep(.0,.012,e)); col *= .55+.45*smoothstep(.0,.4,d1*-1.+.4);
  } else if(mode==7){ // 域扭曲噪声（氛围背景）
    vec2 p=q*a.x; float f=fbm(p+fbm(p+t*.05+vec2(1.7,9.2))*1.6 + t*.03);
    col = mix(INK, mix(INK,TEAL,.55), smoothstep(.35,.9,f))*a.y + INK*(1.-a.y);
  } else if(mode==8){ // 双曲平面 {7,3} 类似：Poincaré 圆盘反演迭代
    vec2 z=q*a.z; float r=length(z); if(r<1.){
      float n=0.; for(int i=0;i<40;i++){ bool f=false;
        for(int k=0;k<7;k++){ float an=6.2831853*float(k)/7.+b.x; vec2 cdir=vec2(cos(an),sin(an)); float R=.48, dc=sqrt(1.+R*R);
          vec2 cc=cdir*dc; vec2 dv=z-cc; float l=dot(dv,dv); if(l<R*R){ z=cc+dv*R*R/l; n+=1.; f=true; } }
        if(!f) break; }
      col = mod(n,2.)<1. ? TEAL : CREAM; col*= .65+.35*(1.-r*r); col = mix(col, INK, smoothstep(.97,1.,r));
    } else col=INK;
  }
  o = vec4(col,1);
}`;
const POST_FS = `#version 300 es
precision highp float; in vec2 uv; out vec4 o;
uniform sampler2D scene; uniform sampler2D bg; uniform sampler2D bloom; uniform vec2 res; uniform float t;
uniform float useBG, ca, glitch, grain, vign, scan, flash, invert, kal, kalRot, droste, zoom, rot, bloomAmt, barrel, tintAmt, shake, pixel;
uniform vec3 flashCol, tint; uniform vec2 shakeV;
float hsh(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
vec2 xform(vec2 u){
  vec2 c=u-.5; c.x*=res.x/res.y;
  c = c/zoom; float cr=cos(rot), sr=sin(rot); c=mat2(cr,-sr,sr,cr)*c;
  float r2=dot(c,c); c*=1.+barrel*r2;
  if(kal>0.5){ float an=atan(c.y,c.x)+kalRot, r=length(c); float seg=6.2831853/kal; an=mod(an,seg); an=min(an,seg-an); c=vec2(cos(an),sin(an))*r; }
  if(droste>0.){ float r=length(c), an=atan(c.y,c.x); float L=log(r+1e-5); float per=log(2.6);
    L = mod(L - t*.0 - droste, per) - per + log(.52); r=exp(L); c=vec2(cos(an),sin(an))*r; }
  c += shakeV;
  c.x/=res.x/res.y; return c+.5;
}
vec4 samp(vec2 u){
  vec4 s=texture(scene,u); vec3 b=texture(bg,u).rgb;
  vec3 col = mix(b*useBG + vec3(.067,.063,.055)*(1.-useBG), s.rgb, s.a);
  return vec4(col,1);
}
void main(){
  vec2 u=uv;
  if(pixel>1.){ u=floor(u*res/pixel)*pixel/res; }
  // 故障：横向块位移
  if(glitch>0.){ float row=floor(u.y*res.y/(18.+hsh(vec2(floor(t*20.)))*60.)); float r=hsh(vec2(row,floor(t*24.)));
    if(r<glitch*.6) u.x+= (hsh(vec2(row,t))-.5)*glitch*.25; }
  vec2 uu=xform(u);
  vec2 d=(uu-.5)*ca*.012;
  vec3 col; col.r=samp(uu+d).r; col.g=samp(uu).g; col.b=samp(uu-d).b;
  if(any(lessThan(uu,vec2(0)))||any(greaterThan(uu,vec2(1)))) col=vec3(.067,.063,.055);
  col += texture(bloom,uv).rgb*bloomAmt;
  col = mix(col, col*tint*1.6, tintAmt);
  if(invert>0.) col=mix(col,1.-col,invert);
  float sl = .5+.5*sin(uv.y*res.y*3.14159*.5); col*= 1.-scan*.18*sl;
  vec2 vc=uv-.5; col*= 1.-vign*dot(vc,vc)*1.4;
  col += (hsh(uv*res+fract(t*61.7)*100.)-.5)*grain;
  col = mix(col, flashCol, flash);
  o=vec4(clamp(col,0.,1.),1);
}`;
const BLUR_FS = `#version 300 es
precision highp float; in vec2 uv; out vec4 o; uniform sampler2D src; uniform vec2 dir; uniform float thr;
void main(){ vec3 s=vec3(0); float w[5]=float[](.227,.194,.121,.054,.016);
  for(int i=-4;i<=4;i++){ vec3 c=texture(src,uv+dir*float(i)).rgb; if(thr>0.) c=max(c-thr,0.)*1.6; s+=c*w[abs(i)]; } o=vec4(s,1); }`;
function compile(fs) {
  const mk = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  const p = gl.createProgram(); gl.attachShader(p, mk(gl.VERTEX_SHADER, VS)); gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs));
  gl.bindAttribLocation(p, 0, 'p'); gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); return p;
}
function mkTex(w, h) { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); return t; }
function mkFB(tex) { const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0); return f; }
let BW, BH;
function initGL() {
  progBG = compile(BG_FS); progPost = compile(POST_FS); progBlur = compile(BLUR_FS);
  quad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  texScene = mkTex(W, H);
  texBG = mkTex(W, H); fbBG = mkFB(texBG);
  BW = Math.round(W / 4); BH = Math.round(H / 4);
  texA = mkTex(BW, BH); fbA = mkFB(texA); texB = mkTex(BW, BH); fbB = mkFB(texB);
}
function U(p, n) { return gl.getUniformLocation(p, n); }
function drawQuad() { gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); }

function composite(t, fx, bgp) {
  // 1. 背景着色器
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbBG); gl.viewport(0, 0, W, H);
  gl.useProgram(progBG);
  gl.uniform1i(U(progBG, 'mode'), bgp ? bgp.mode : 0);
  gl.uniform1f(U(progBG, 't'), t); gl.uniform2f(U(progBG, 'res'), W, H);
  const a = (bgp && bgp.a) || [0, 0, 1, 0], b = (bgp && bgp.b) || [0, 0, 0, 0];
  gl.uniform4f(U(progBG, 'a'), ...a); gl.uniform4f(U(progBG, 'b'), ...b);
  gl.uniform1f(U(progBG, 'beat'), pulse(t));
  if (bgp && bgp.seeds) gl.uniform2fv(U(progBG, 'seeds[0]'), new Float32Array(bgp.seeds));
  if (bgp && bgp.mode) drawQuad();
  // 2. 场景纹理（2D 画布上传）
  gl.bindTexture(gl.TEXTURE_2D, texScene);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, cv2);
  // 3. 泛光：场景（含背景）阈值后两次模糊 —— 用合成前的场景近似
  gl.useProgram(progBlur); gl.viewport(0, 0, BW, BH);
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbA); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texScene);
  gl.uniform1i(U(progBlur, 'src'), 0); gl.uniform2f(U(progBlur, 'dir'), 2.2 / BW, 0); gl.uniform1f(U(progBlur, 'thr'), fx.bloomThr ?? .68); drawQuad();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbB); gl.bindTexture(gl.TEXTURE_2D, texA); gl.uniform2f(U(progBlur, 'dir'), 0, 2.2 / BH); gl.uniform1f(U(progBlur, 'thr'), 0); drawQuad();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbA); gl.bindTexture(gl.TEXTURE_2D, texB); gl.uniform2f(U(progBlur, 'dir'), 4.4 / BW, 0); drawQuad();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbB); gl.bindTexture(gl.TEXTURE_2D, texA); gl.uniform2f(U(progBlur, 'dir'), 0, 4.4 / BH); drawQuad();
  // 4. 合成 + 后期
  gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, W, H);
  gl.useProgram(progPost);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texScene); gl.uniform1i(U(progPost, 'scene'), 0);
  gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, texBG); gl.uniform1i(U(progPost, 'bg'), 1);
  gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, texB); gl.uniform1i(U(progPost, 'bloom'), 2);
  gl.activeTexture(gl.TEXTURE0);
  const f = (k, d) => (fx[k] === undefined ? d : fx[k]);
  gl.uniform2f(U(progPost, 'res'), W, H); gl.uniform1f(U(progPost, 't'), t);
  gl.uniform1f(U(progPost, 'useBG'), bgp && bgp.mode ? 1 : 0);
  for (const [k, d] of [['ca', 0], ['glitch', 0], ['grain', .035], ['vign', .55], ['scan', 0], ['flash', 0], ['invert', 0], ['kal', 0],
    ['kalRot', 0], ['droste', 0], ['zoom', 1], ['rot', 0], ['bloomAmt', .4], ['barrel', 0], ['tintAmt', 0], ['pixel', 0]])
    gl.uniform1f(U(progPost, k), f(k, d));
  gl.uniform3f(U(progPost, 'flashCol'), ...(fx.flashCol || [.961, .918, .835]));
  gl.uniform3f(U(progPost, 'tint'), ...(fx.tint || [.012, .58, .553]));
  gl.uniform2f(U(progPost, 'shakeV'), ...(fx.shakeV || [0, 0]));
  drawQuad();
}

// ── 时间线 ────────────────────────────────────────────────
const SHOTS = [];
function shot(a, b, draw) { SHOTS.push({ a, b, draw }); }
function renderAt(t) {
  const bt = tBeat(t);
  let sh = SHOTS.find(s => bt >= s.a && bt < s.b) || SHOTS[SHOTS.length - 1];
  begin2D();
  const st = {
    t, bt, lb: bt - sh.a, len: sh.b - sh.a, p: (bt - sh.a) / (sh.b - sh.a), lt: t - beatT(sh.a),
    beat: pulse(t), beat2: pulse(t, 7, 2), bar: barPulse(t), low: feat('low', t), mid: feat('mid', t), high: feat('high', t),
    rms: feat('rms', t), on: feat('onset', t), fx: {}, bg: null,
  };
  sh.draw(st);
  // 全局：镜头切换处的冲击（前 0.12 拍闪一下）
  const cut = st.lb;
  if (sh.cutFlash !== false && cut < 0.35 && sh.a > 0) st.fx.flash = Math.max(st.fx.flash || 0, (1 - cut / 0.35) * (st.fx.cutAmt ?? .35));
  composite(t, st.fx, st.bg);
}
window.renderFrame = i => renderAt(i / FPS);
window.renderTime = t => renderAt(t);
