// WebGL2 shader core: background, procedural "video" panels, full-screen effects, UI composite.
window.SHADER_SRC = {
vert: `#version 300 es
in vec2 a; void main(){ gl_Position = vec4(a,0.,1.); }`,
frag: `#version 300 es
precision highp float;
out vec4 o;
uniform vec2 uRes;
uniform float uT;        // global time
uniform float uL;        // local (segment) time
uniform float uD;        // segment duration
uniform int uFx;         // full-screen effect
uniform vec4 uFxP;       // effect params
uniform int uN;          // panel count
uniform vec4 uPR[12];     // panel rect px (x,y,w,h), top-left origin
uniform vec4 uPP[12];     // (videoTime, mode, alpha, param)
uniform vec4 uPQ[12];     // extra (sub-rect uv for magnify / misc)
uniform sampler2D uUI;
uniform float uTrans;    // 0..1 transition reveal progress
uniform vec3 uAccent;
uniform float uSeed;

float h21(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
float h11(float x){ return fract(sin(x*127.1)*43758.5453); }
float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float s=0., a=.5; for(int i=0;i<4;i++){ s+=a*vnoise(p); p*=2.03; a*=.5; } return s; }
float sdBox(vec2 p, vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }

// ---------- procedural "video": sunset valley with a red car ----------
float carX(float tt){ return fract(0.05+tt*0.07)*1.5-0.25; }
vec3 vid(vec2 uv, float tt){
  vec3 c = mix(vec3(1.0,0.62,0.38), vec3(0.16,0.28,0.62), smoothstep(0.25,1.0,uv.y));
  vec2 sp = (uv-vec2(0.72,0.66))*vec2(1.78,1.0);
  float d = length(sp);
  c += vec3(1.0,0.75,0.45)*smoothstep(0.085,0.075,d) + vec3(1.,.55,.3)*0.35*exp(-d*7.);
  float cl = fbm(vec2(uv.x*3.0+tt*0.04, uv.y*7.0));
  c = mix(c, vec3(1.0,0.86,0.82), smoothstep(0.55,0.85,cl)*smoothstep(0.5,0.8,uv.y)*0.75);
  float h1 = 0.44+0.06*sin(uv.x*7.+1.)+0.025*sin(uv.x*19.)+0.01*fbm(uv*30.);
  c = mix(c, mix(vec3(0.33,0.30,0.52),vec3(0.42,0.36,0.55),uv.y*2.), step(uv.y,h1));
  float h2 = 0.31+0.05*sin(uv.x*5.+3.)+0.02*sin(uv.x*23.);
  vec3 grass = mix(vec3(0.10,0.32,0.22), vec3(0.18,0.45,0.25), fbm(uv*40.));
  c = mix(c, grass, step(uv.y,h2));
  // trees
  for(int i=0;i<6;i++){ float fx = 0.08+float(i)*0.17+0.03*sin(float(i)*4.);
    vec2 tp = (uv-vec2(fx, h2-0.01))*vec2(1.78,1.);
    float tri = max(abs(tp.x)*2.2+tp.y-0.11, -tp.y);
    c = mix(c, vec3(0.05,0.2,0.14), step(tri,0.0)); }
  if(uv.y<0.19){ c = vec3(0.20,0.20,0.23)+0.03*vnoise(uv*200.);
    if(abs(uv.y-0.095)<0.005 && fract(uv.x*7.)<0.5) c=vec3(0.92,0.85,0.5); }
  float cx = carX(tt);
  vec2 q = (uv-vec2(cx,0.13))*vec2(1.78,1.);
  float body = sdBox(q, vec2(0.11,0.025));
  float cab = sdBox(q-vec2(0.0,0.045), vec2(0.06,0.025));
  float car = min(body,cab);
  vec3 cc = vec3(0.86,0.12,0.16);
  if(cab<0. && body>0.) cc = mix(vec3(0.55,0.75,0.95), cc, step(0.012,-cab)*0.0+0.15);
  c = mix(c, cc, smoothstep(0.003,0.0,car));
  for(int k=0;k<2;k++){ vec2 wq = q-vec2(k==0?-0.065:0.065, -0.03); c = mix(c, vec3(0.05), smoothstep(0.026,0.022,length(wq))); }
  return c;
}
vec3 grain(vec2 px, float tt, float s){ float g = h21(px+fract(tt*7.13)*vec2(91.,37.)+s)-0.5; return vec3(g); }

// 8x8 DCT basis value
float dctB(float u, float v, vec2 xy){ return cos((2.*xy.x+1.)*u*3.14159/16.)*cos((2.*xy.y+1.)*v*3.14159/16.); }

// QT-MTT style partition depth lines
float partLines(vec2 uv, float tt, float ctu, vec2 res, float detail){
  vec2 px = uv*res; vec2 cell = floor(px/ctu); vec2 f = fract(px/ctu);
  float line = 0.;
  vec2 lo = vec2(0.), hi = vec2(1.);
  float w = 1.5/ctu;
  line = max(line, step(f.x,w)+step(f.y,w));
  for(int d=0; d<3; d++){
    vec2 c = (lo+hi)*0.5;
    float r = h21(cell*7.31+lo*13.7+float(d)*3.1+floor(tt*0.0));
    // activity near car / clouds drives deeper splits
    vec2 cuv = (cell*ctu + c*ctu)/res; float act = smoothstep(0.25,0.0,abs(cuv.x-carX(tt)))*step(cuv.y,0.3) + 0.5*step(0.45,cuv.y)*step(cuv.y,0.6);
    if(r > 0.35+0.5*(1.-detail) - act*0.35 + float(d)*0.12) break;
    float wl = w;
    int mode = int(h21(cell*3.7+lo*5.1+float(d))*4.);
    if(mode==0){ // quad
      line = max(line, (step(abs(f.x-c.x),wl)+step(abs(f.y-c.y),wl))*step(lo.x,f.x)*step(f.x,hi.x)*step(lo.y,f.y)*step(f.y,hi.y));
      if(f.x<c.x) hi.x=c.x; else lo.x=c.x; if(f.y<c.y) hi.y=c.y; else lo.y=c.y;
    } else if(mode==1){ // binary vertical
      line = max(line, step(abs(f.x-c.x),wl)*step(lo.y,f.y)*step(f.y,hi.y));
      if(f.x<c.x) hi.x=c.x; else lo.x=c.x;
    } else if(mode==2){ // ternary horizontal 1:2:1
      float a = mix(lo.y,hi.y,0.25), b = mix(lo.y,hi.y,0.75);
      line = max(line, (step(abs(f.y-a),wl)+step(abs(f.y-b),wl))*step(lo.x,f.x)*step(f.x,hi.x));
      if(f.y<a) hi.y=a; else if(f.y<b){ lo.y=a; hi.y=b; } else lo.y=b;
    } else { // binary horizontal
      line = max(line, step(abs(f.y-c.y),wl)*step(lo.x,f.x)*step(f.x,hi.x));
      if(f.y<c.y) hi.y=c.y; else lo.y=c.y;
    }
  }
  return clamp(line,0.,1.);
}

vec3 panel(int mode, vec2 u, vec4 pp, vec4 pq, vec2 pres, vec2 P){
  float vt = pp.x, prm = pp.w;
  vec2 vuv = vec2(u.x, 1.-u.y);
  if(mode==0 || mode==11) { vec3 c = vid(vuv, vt); return mode==11 ? c*0.35 : c; }
  if(mode==1){ vec3 a = vid(vuv, vt), b = vid(vuv, vt-0.25); return vec3(length(a-b))*2.2*vec3(1.0,0.9,0.7); }
  if(mode==2){ // left: original; right: chroma subsampled (exaggerated 1/8)
    vec3 c = vid(vuv, vt);
    if(u.x>0.5){ vec2 bs = vec2(8.)/pres; vec2 cuv = (floor(vuv/bs)+0.5)*bs; vec3 cc = vid(cuv, vt);
      float Y = dot(c, vec3(0.299,0.587,0.114)); float Yc = dot(cc, vec3(0.299,0.587,0.114));
      c = clamp(cc - Yc + Y, 0., 1.); }
    if(prm>0.5){ float Y = dot(c, vec3(0.299,0.587,0.114)); if(u.x>0.5 && u.y>0.5) c = vec3(Y); }
    return c; }
  if(mode==3){ // magnified pixel cells from sub-rect
    float n = prm; vec2 cell = floor(u*n); vec2 suv = pq.xy + (cell+0.5)/n*pq.zw;
    vec3 c = vid(vec2(suv.x,1.-suv.y), vt); vec2 f = fract(u*n);
    c *= 0.85+0.15*step(0.06,min(f.x,f.y)); return c; }
  if(mode==4){ // DCT basis grid
    vec2 g = u*8.; vec2 uvc = floor(g); vec2 f = fract(g);
    vec2 xy = floor(f*8.); float b = dctB(uvc.x, uvc.y, xy);
    float gap = step(0.04,f.x)*step(0.04,f.y);
    float hl = prm; // highlight cutoff (u+v)
    vec3 c = vec3(0.5+0.5*b);
    if(uvc.x+uvc.y > hl) c = mix(c, vec3(0.05,0.06,0.09), 0.8);
    return c*gap + vec3(0.03)*(1.-gap); }
  if(mode==5){ // coefficient heatmap + quantization
    vec2 g = u*8.; vec2 uvc = floor(g); vec2 f = fract(g);
    float m = exp(-(uvc.x+uvc.y)*0.55)*(0.55+0.45*h21(uvc+3.));
    if(uvc.x+uvc.y<0.5) m = 1.0;
    float q = step(uvc.x+uvc.y, prm);
    vec3 hot = mix(vec3(0.06,0.10,0.25), vec3(1.0,0.75,0.25), pow(m,0.6));
    vec3 c = mix(vec3(0.07,0.08,0.11), hot, q);
    float gap = step(0.05,f.x)*step(0.05,f.y);
    return c*gap + vec3(0.02)*(1.-gap); }
  if(mode>=6 && mode<=8){
    vec3 c = vid(vuv, vt);
    if(mode==7){ vec3 s = vec3(0.); for(int i=-1;i<=1;i++) for(int j=-1;j<=1;j++) s += vid(vuv+vec2(i,j)*1.5/pres, vt); c = s/9.; }
    if(mode==6) c += grain(floor(P/1.5), vt, 1.)*0.38;
    if(mode==8) c += grain(floor(P/1.5), vt, 7.)*0.38;
    return clamp(c,0.,1.); }
  if(mode==9){ vec3 c = vid(vuv, vt)*0.8; float l = partLines(vuv, vt, prm, pres, pq.x);
    vec3 lc = mix(vec3(0.3,0.8,1.0), vec3(1.0,0.5,0.2), pq.y);
    return mix(c, lc, l*0.9); }
  if(mode==10){ vec3 c = vid(vuv, vt)*0.75; vec2 px = u*pres;
    // pq: sizes shown 16,64,128,256 weights
    float l=0.;
    vec4 s = vec4(16.,64.,128.,256.)*prm;
    vec3 cols[4] = vec3[4](vec3(0.6,0.6,0.6), vec3(0.3,0.8,1.0), vec3(0.3,1.0,0.5), vec3(1.0,0.6,0.2));
    for(int i=0;i<4;i++){ vec2 f = fract(px/s[i]); float w = (1.+float(i)*0.8)/s[i];
      float li = (step(f.x,w)+step(f.y,w))*pq[i]; c = mix(c, cols[i], clamp(li,0.,1.)*0.85); }
    return c; }
  return vec3(1.,0.,1.);
}

vec3 background(vec2 P){
  vec2 uv = P/uRes;
  vec3 c = mix(vec3(0.020,0.030,0.060), vec3(0.045,0.060,0.110), 1.-uv.y);
  c += uAccent*0.07*exp(-length((uv-vec2(0.15,0.1))*vec2(1.6,1.))*2.5);
  c += vec3(0.25,0.15,0.5)*0.05*exp(-length((uv-vec2(0.9,0.95))*vec2(1.6,1.))*2.);
  // drifting macroblock grid
  vec2 g = (P+vec2(uT*6.,uT*2.))/64.; vec2 f = fract(g);
  float line = (step(f.x,0.012)+step(f.y,0.012));
  float pulse = vnoise(floor(g)*0.37+uT*0.15);
  c += vec3(0.12,0.18,0.30)*line*0.25*pulse;
  vec2 g2 = (P+vec2(uT*6.,uT*2.))/16.; vec2 f2 = fract(g2);
  c += vec3(0.08,0.12,0.2)*(step(f2.x,0.04)+step(f2.y,0.04))*0.06*smoothstep(0.6,0.9,pulse);
  return c;
}

vec3 fx(vec3 c, vec2 P){
  vec2 uv = P/uRes;
  float p = uFxP.x;
  if(uFx==1){ // hook: raw pixel deluge over the video
    vec3 v = vid(vec2(uv.x,1.-uv.y), uT);
    float rain = uFxP.y;
    float col = floor(P.x/12.); float sp = 400.+600.*h11(col);
    float y = P.y + uT*sp + h11(col+3.)*1000.;
    float cell = floor(y/12.);
    float on = step(0.45, h21(vec2(col,cell)));
    vec3 rc = vec3(h21(vec2(col,cell)+1.), h21(vec2(col,cell)+2.), h21(vec2(col,cell)+3.));
    rc = mix(rc, v, 0.4);
    vec2 cf = fract(vec2(P.x,y)/12.); float sq = step(0.12,cf.x)*step(0.12,cf.y);
    c = mix(v*uFxP.z, rc*sq, on*rain*0.85);
    return c;
  }
  if(uFx==2){ // flowing DCT basis tiles
    vec2 g = P/96.; vec2 cell = floor(g); vec2 f = fract(g);
    float u0 = floor(h21(cell)*8.), v0 = floor(h21(cell+9.)*8.);
    float ph = uT*0.3 + h21(cell+4.)*6.28;
    float b = cos((f.x*8.+0.5)*u0*3.14159/8.+ph)*cos((f.y*8.+0.5)*v0*3.14159/8.);
    float m = smoothstep(0.3,0.9,vnoise(cell*0.3+uT*0.1));
    c += uAccent*0.10*(0.5+0.5*b)*m*step(0.03,f.x)*step(0.03,f.y);
    return c;
  }
  if(uFx==3){ // starfield / flowing streams for timeline
    for(int i=0;i<3;i++){ float fi=float(i);
      float y0 = 0.32+0.18*fi; float wv = y0 + 0.012*sin(uv.x*9.+uT*0.8+fi*2.);
      vec3 lc = i==0? vec3(0.3,0.6,1.0) : i==1? vec3(1.0,0.45,0.35) : vec3(0.9,0.75,0.3);
      c += lc*0.5*exp(-abs(uv.y-wv)*uRes.y/3.)*0.6;
      float dots = step(0.97, h21(vec2(floor(uv.x*120.-uT*6.), fi)));
      c += lc*dots*exp(-abs(uv.y-wv)*uRes.y/6.); }
    float st = step(0.9965, h21(floor(P/3.)))*(0.5+0.5*sin(uT*3.+h21(floor(P/3.))*30.));
    c += vec3(st)*0.6;
    return c;
  }
  if(uFx==4){ // outro: blocks dissolving
    float bs = 48.; vec2 cell = floor(P/bs);
    float k = h21(cell);
    float a = smoothstep(k-0.1, k+0.1, uFxP.x);
    c = mix(c, c*0.2, a);
    return c;
  }
  return c;
}

void main(){
  vec2 P = vec2(gl_FragCoord.x, uRes.y-gl_FragCoord.y);
  vec3 c = background(P);
  c = fx(c, P);
  for(int i=0;i<12;i++){
    if(i>=uN) break;
    vec4 r = uPR[i];
    vec2 u = (P-r.xy)/r.zw;
    if(u.x>=0. && u.y>=0. && u.x<=1. && u.y<=1.){
      vec3 pc = panel(int(uPP[i].y+0.5), u, uPP[i], uPQ[i], r.zw, P);
      c = mix(c, pc, uPP[i].z);
    }
  }
  vec4 ui = texture(uUI, vec2(gl_FragCoord.x/uRes.x, 1.-gl_FragCoord.y/uRes.y));
  c = c*(1.-ui.a) + ui.rgb;
  // macroblock reveal transition
  if(uTrans<1.){
    float bs = 40.; vec2 cell = floor(P/bs); vec2 f = fract(P/bs);
    float k = h21(cell+uSeed);
    float on = step(k, uTrans*1.25-0.1);
    float edge = step(abs(k-(uTrans*1.25-0.1)), 0.06);
    vec3 dark = background(P)*0.6;
    c = mix(dark, c, on) + uAccent*edge*0.5*(step(f.x,0.06)+step(f.y,0.06)+0.2);
  }
  // vignette + film grain
  vec2 uv = P/uRes; float vig = smoothstep(1.25, 0.35, length((uv-0.5)*vec2(1.3,1.0)));
  c *= mix(0.72, 1.0, vig);
  c += (h21(P+fract(uT*13.)*100.)-0.5)*0.025;
  o = vec4(clamp(c,0.,1.),1.);
}`
};
