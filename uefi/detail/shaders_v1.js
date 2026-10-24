// 复用自第一版的着色器
const HEAD = `#version 300 es
precision highp float;
uniform vec2 R; uniform float T, L; uniform float K[16];
out vec4 o;
#define PI 3.14159265
float h21(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
vec2 h22(vec2 p){ float n = h21(p); return vec2(n, h21(p+n*17.13)); }
float n2(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+1.),f.x), f.y); }
float fbm(vec2 p){ float s=0., a=.5; for(int i=0;i<5;i++){ s+=a*n2(p); p=mat2(1.6,1.2,-1.2,1.6)*p; a*=.5; } return s; }
mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }
vec3 hue(float h){ return .5+.5*cos(6.2832*(h+vec3(0.,.33,.67))); }
vec2 UV(){ return (gl_FragCoord.xy-.5*R)/R.y; }
vec2 PX(){ return vec2(gl_FragCoord.x, R.y-gl_FragCoord.y)*(1080./R.y); }   // 左上原点像素坐标
float boxd(vec2 p, vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }
`;
const FS = {};
FS.boot = `
void main(){
  vec2 uv = UV(); float pw = K[0], tA = K[1];
  vec3 col = mix(vec3(.01,.008,.03), vec3(.10,.02,.16), smoothstep(-.1,.6,uv.y)) * pw;
  float hz = -.08;
  // 太阳
  float sr = .26*smoothstep(0.,1.,K[2]);
  vec2 sp = uv - vec2(0., .14);
  float sd = length(sp) - sr;
  float stripes = step(.5, fract((sp.y+.3)*22.)) + step(.12, sp.y);
  float sun = smoothstep(.004, -.004, sd) * clamp(stripes,0.,1.);
  vec3 sunc = mix(vec3(1.,.25,.55), vec3(1.,.85,.3), smoothstep(-.2,.25,sp.y));
  col += sun*sunc*1.1 + exp(-max(sd,0.)*9.)*sunc*.35*smoothstep(0.,1.,K[2]);
  if (uv.y < hz) {
    float d = hz - uv.y; float z = .35/d;
    vec2 g = vec2(uv.x*z, z + L*1.4);
    vec2 gw = fwidth(g);
    vec2 gg = abs(fract(g-.5)-.5)/gw;
    float line = 1. - min(min(gg.x, gg.y), 1.);
    vec3 gc = mix(vec3(0.,.9,1.), vec3(1.,.2,.8), smoothstep(-.6,.6,uv.x));
    col = mix(col, vec3(.0,.0,.02), .85);
    col += gc*line*exp(-z*.12)*pw*1.2;
  }
  col += vec3(.6,.2,1.)*exp(-abs(uv.y-hz)*60.)*pw*.6;
  // 冲击波
  if (tA > 0.) {
    float r = tA*1.4;
    float ring = exp(-abs(length(uv*vec2(1.,1.3))-r)*28.)*exp(-tA*1.3);
    col += ring*vec3(.5,.8,1.)*1.5;
    col += exp(-length(uv)*6.)*exp(-tA*3.)*vec3(1.,.9,1.)*1.5;
  }
  // 星点
  vec2 sg = floor(uv*90.); float st = step(.996, h21(sg)) * smoothstep(hz, .2, uv.y);
  col += st*(.5+.5*sin(T*3.+h21(sg+3.)*40.))*pw*.7;
  o = vec4(col, 1.);
}`;
FS.firmware = `
void main(){
  vec2 uv = UV(); vec2 p = uv*9. + vec2(0., -L*.15);
  vec2 id = floor(p); vec2 f = fract(p)-.5;
  float r = h21(id);
  if (r > .5) f.x = -f.x;
  vec2 c = (f.x+f.y > 0.) ? vec2(.5) : vec2(-.5);
  float d = abs(length(f-c)-.5);
  float tr = smoothstep(.07, .02, d);
  float ang = atan(f.y-c.y, f.x-c.x);
  float flow = pow(fract(ang/1.5708 + r*7. - L*.9), 8.);
  vec3 col = vec3(.005,.02,.03);
  col += tr*vec3(.0,.18,.2);
  col += tr*flow*vec3(.2,1.,.9)*.8*(.4+.6*step(.75, h21(id+5.)));
  float vias = smoothstep(.09,.06, length(fract(p)-.5)) * step(.85, h21(id+9.));
  col += vias*vec3(.2,.6,.6);
  // UEFI 层高亮
  float band = exp(-abs(uv.y-K[1])*14.)*K[0];
  col = mix(col*.6, col*1.6 + vec3(.0,.35,.45)*band, band);
  col *= .55 + .45*smoothstep(1.1, .2, length(uv));
  o = vec4(col, 1.);
}`;
FS.tools = `
void main(){
  vec2 uv = UV(); vec3 col = vec3(.02,.025,.05);
  for (int i=0;i<6;i++){
    float fi = float(i);
    vec2 c = vec2(sin(L*.3 + fi*1.7)*.75, cos(L*.25 + fi*2.3)*.38);
    vec3 cc = hue(fi/6. + .55);
    col += cc*exp(-dot(uv-c, uv-c)*5.)*.33;
  }
  col += K[0]*exp(-dot(uv-vec2(.45,0.), uv-vec2(.45,0.))*4.)*vec3(.1,.8,.4)*.35;
  float g = h21(gl_FragCoord.xy + T); col += (g-.5)*.015;
  o = vec4(col, 1.);
}`;
FS.outro = `
void main(){
  vec2 uv = UV();
  vec3 col = mix(vec3(.0,.0,.02), vec3(.05,.02,.12), smoothstep(-.6,.6,uv.y));
  col += exp(-length(uv*vec2(.6,1.2) - vec2(0.,.05))*2.5)*vec3(.25,.15,.6)*K[8];
  for (int b=0;b<6;b++){
    float a = K[b]; if (a <= 0. || a > 3.2) continue;
    float fb = float(b);
    vec2 c = vec2((h21(vec2(fb,1.))-.5)*1.4, .05 + h21(vec2(fb,2.))*.3);
    vec3 bc = hue(h21(vec2(fb,4.)));
    float ex = 1. - exp(-a*2.8);
    float fade = smoothstep(3.2, 1.2, a);
    for (int i=0;i<70;i++){
      float fi = float(i);
      float ang = fi/70.*6.2832 + h21(vec2(fi,fb))*.2;
      float sp = .22 + .12*h21(vec2(fi, fb+9.));
      vec2 pp = c + vec2(cos(ang), sin(ang))*sp*ex - vec2(0., .06*a*a);
      float d = length(uv - pp);
      float tw = .6 + .4*sin(a*25. + fi);
      col += bc*.00006/(d*d + .00002)*fade*tw;
    }
  }
  o = vec4(col, 1.);
}`;
