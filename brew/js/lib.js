// Shared GLSL library + scene registry.
// Every scene is its own fragment program: LIB + scene source + MAIN.
// Each cut lands on a musical accent. Neighbouring scenes share a hand-off shape hsI/hsO(q,u) that keeps moving
// through the cut (u = beats from it), or a whole-frame flip / whip, so no cut ever rests on a still frame.
window.FILM = { SCENES: [] };

// text helpers ------------------------------------------------------------
// C(name, reason) -> caption pair, M -> monospace, T -> sans
const C = (name, sub) => [{ s: name, f: 'sans', w: 600 }, { s: sub, f: 'cn', w: 400, ch: 96 }];
const M = (s, w = 500) => ({ s, f: 'mono', w });
const T = (s, w = 600, f = 'sans') => ({ s, f, w });
const scene = def => window.FILM.SCENES.push(def);

window.FILM.LIB = /* glsl */`
#define PI 3.14159265
#define TAU 6.2831853
const vec3 K=vec3(.105,.105,.115), W=vec3(1.), G=vec3(.44), LG=vec3(.76);
vec2 p,pc; float t,D,px,k,kI,kO,da,hd; vec3 hc; vec4 acc; bool fh;

float sat(float x){return clamp(x,0.,1.);}
float lin(float a,float b){return sat((t-a)/(b-a));}
float io(float a,float b){float x=lin(a,b);return x<.5?4.*x*x*x:1.-pow(-2.*x+2.,3.)*.5;}
float eo(float a,float b){float x=1.-lin(a,b);return 1.-x*x*x*x;}
float ei(float a,float b){float x=lin(a,b);return x*x*x;}
float bk(float a,float b){float x=lin(a,b)-1.;return 1.+2.70158*x*x*x+1.70158*x*x;}
float sn(float a){return eo(a,a+1.);}                       // snap launched on beat a
float pk(float a){float x=t-a;return x<0.?0.:exp(-x*4.);}    // decaying punch after beat a
float h1(float n){return fract(sin(n*127.1+31.7)*43758.5453);}
// rotate a shape counter-clockwise by a
vec2 R(vec2 q,float a){float c=cos(a),s=sin(a);return vec2(c*q.x+s*q.y,-s*q.x+c*q.y);}

// signed distance fields ----------------------------------------------------
float ci(vec2 q,float r){return length(q)-r;}
float bx(vec2 q,vec2 b){vec2 d=abs(q)-b;return length(max(d,0.))+min(max(d.x,d.y),0.);}
float rb(vec2 q,vec2 b,float r){return bx(q,b-r)-r;}
float sg(vec2 q,vec2 a,vec2 b){vec2 pa=q-a,ba=b-a;return length(pa-ba*sat(dot(pa,ba)/max(dot(ba,ba),1e-6)));}
float smin(float a,float b,float kk){float h=sat(.5+.5*(b-a)/kk);return mix(b,a,h)-kk*h*(1.-h);}
float ell(vec2 q,vec2 r){float k0=length(q/r),k1=max(length(q/(r*r)),1e-4);return k0*(k0-1.)/k1;}
float tri(vec2 q,vec2 p0,vec2 p1,vec2 p2){
  vec2 e0=p1-p0,e1=p2-p1,e2=p0-p2,v0=q-p0,v1=q-p1,v2=q-p2;
  vec2 q0=v0-e0*sat(dot(v0,e0)/dot(e0,e0)),q1=v1-e1*sat(dot(v1,e1)/dot(e1,e1)),q2=v2-e2*sat(dot(v2,e2)/dot(e2,e2));
  float s=sign(e0.x*e2.y-e0.y*e2.x);
  vec2 d=min(min(vec2(dot(q0,q0),s*(v0.x*e0.y-v0.y*e0.x)),vec2(dot(q1,q1),s*(v1.x*e1.y-v1.y*e1.x))),vec2(dot(q2,q2),s*(v2.x*e2.y-v2.y*e2.x)));
  return -sqrt(d.x)*sign(d.y);
}
// pointy-top hexagon, r = inradius
float hx(vec2 q,float r){const vec3 h=vec3(-.866025404,.5,.577350269);q=abs(q.yx);q-=2.*min(dot(h.xy,q),0.)*h.xy;q-=vec2(clamp(q.x,-h.z*r,h.z*r),r);return length(q)*sign(q.y);}
// unsigned distance to the arc a0..a1 (radians, ccw) of radius r
float arc(vec2 q,float r,float a0,float a1){float am=.5*(a0+a1),hw=.5*(a1-a0);q=R(q,am-PI*.5);q.x=abs(q.x);vec2 sc=vec2(sin(hw),cos(hw));return (sc.y*q.x>sc.x*q.y)?length(q-sc*r):abs(length(q)-r);}
float star(vec2 q,float r,float n,float m){float an=PI/n,en=PI/m;vec2 acs=vec2(cos(an),sin(an)),ecs=vec2(cos(en),sin(en));float bn=mod(atan(q.x,q.y),2.*an)-an;q=length(q)*vec2(cos(bn),abs(sin(bn)));q-=r*acs;q+=ecs*clamp(-dot(q,ecs),0.,r*acs.y/ecs.y);return length(q)*sign(q.x);}
float trap(vec2 q,float r1,float r2,float he){vec2 k1=vec2(r2,he),k2=vec2(r2-r1,2.*he);q.x=abs(q.x);vec2 ca=vec2(q.x-min(q.x,(q.y<0.)?r1:r2),abs(q.y)-he);vec2 cb=q-k1+k2*sat(dot(k1-q,k2)/dot(k2,k2));float s=(cb.x<0.&&ca.y<0.)?-1.:1.;return s*sqrt(min(dot(ca,ca),dot(cb,cb)));}
float zs(vec2 q){return min(min(sg(q,vec2(-.15,.17),vec2(.15,.17)),sg(q,vec2(.15,.17),vec2(-.15,-.17))),sg(q,vec2(-.15,-.17),vec2(.15,-.17)))-.034;}
// the Homebrew bottle
float bottle(vec2 q){
  float d=smin(rb(q-vec2(0.,-.14),vec2(.16,.27),.06),rb(q-vec2(0.,.25),vec2(.055,.17),.03),.1);
  return min(d,rb(q-vec2(0.,.425),vec2(.07,.022),.012));
}

// painting (premultiplied "over") -------------------------------------------
void ink(vec3 c,float a){acc=acc*(1.-a)+vec4(c,1.)*a;}
void fillA(vec3 c,float d,float al){ink(c,sat(.5-d/px)*al);}
void fill(vec3 c,float d){fillA(c,d,1.);}
void strk(vec3 c,float d,float w,float al){fillA(c,abs(d)-w,al);}
void hair(vec3 c,float d,float al){fillA(c,abs(d)-px*.75,al);}
void cut(float d,float al){acc*=1.-sat(.5-d/px)*al;}
void pulse(float t0,float r0,float r1,vec3 c){float x=(t-t0)/1.6;if(x>0.&&x<1.){float e=1.-pow(1.-x,3.);hair(c,ci(p-vec2(0.,.05),mix(r0,min(r1,.66),e)),(1.-x)*(1.-x)*.6);}}
vec3 pal8(float i){return i<.5?vec3(.2,.2,.22):i<1.5?vec3(.89,.27,.25):i<2.5?vec3(.3,.72,.38):i<3.5?vec3(.97,.76,.2):i<4.5?vec3(.25,.52,.96):i<5.5?vec3(.74,.38,.84):i<6.5?vec3(.2,.76,.86):vec3(.97);}

// text (atlas cell i, centred at origin, cell height h) ------------------------
float tw(int i,float h){vec4 r=uTR[i];return h*r.z*uAT.x/(r.w*uAT.y);}
float tx(int i,vec2 q,float h){
  vec4 r=uTR[i];vec2 sz=vec2(h*r.z*uAT.x/(r.w*uAT.y),h);vec2 uv=q/sz+.5;vec2 g=r.zw/sz*px;
  float m=step(0.,uv.x)*step(uv.x,1.)*step(0.,uv.y)*step(uv.y,1.);
  return m*textureGrad(uTex,r.xy+vec2(uv.x,1.-uv.y)*r.zw,vec2(g.x,0.),vec2(0.,g.y)).r;
}
void text(int i,vec2 c,float h,vec3 col,float al){ink(col,tx(i,p-c,h)*al);}
// caption: name (cell i) + reason (cell i+1), visible between beats a..b
void cap(int i,float a,float b){
  float v=lin(a,a+.3)*(1.-lin(b-.3,b)),y=(1.-eo(a,a+.7))*-.02;
  ink(vec3(.11,.11,.12),tx(i,pc-vec2(0.,-.59+y),.1)*v);
  ink(vec3(.4,.4,.42),tx(i+1,pc-vec2(0.,-.705+y),.07)*v);
}
// caption whose name is typed: fr = fraction of the (monospace) name revealed
void capT(int i,float a,float b,float fr){
  float v=lin(a,a+.2)*(1.-lin(b-.3,b)),w=tw(i,.1),pf=8./(uTR[i].z*uAT.x);
  ink(vec3(.11,.11,.12),tx(i,pc-vec2(0.,-.59),.1)*v*step(pc.x,-w*.5+w*pf+w*(1.-2.*pf)*fr));
  ink(vec3(.4,.4,.42),tx(i+1,pc-vec2(0.,-.705),.07)*v*lin(a+1.,a+1.6));
}
`;

window.FILM.MAIN = /* glsl */`
#define TI 1.
#define TO .8
void main(){
  float S=min(uRes.y,uRes.x*.5625)*.59;
  pc=(gl_FragCoord.xy-.5*uRes)/S;px=1./S;t=uBeat;D=uD;acc=vec4(0.);
  // the whole frame breathes on the bar accent (beats = 0 mod 4) and, lighter, on the low thump (2 mod 4)
  float bar=fract(uGB*.25)*4.,pump=1.+step(0.,uGB)*step(uGB,206.)*(.02*exp(-bar*3.5)+.008*exp(-fract(uGB*.25+.5)*14.));
  p=pc/pump;
  float xi=sat(t/TI),xo=sat((t-D+TO)/TO);
  kI=1.-pow(1.-xi,4.);kO=xo*xo*xo;                    // fastest exactly at the cut
  if(TIN==1)p.x/=max(kI,.012);else if(TIN==2)p.x-=3.2*(1.-kI);
  if(TOUT==1)p.x/=max(1.-kO,.012);else if(TOUT==2)p.x+=3.2*kO;
  k=(TIN==0?kI:1.)*(TOUT==0?1.-kO:1.);da=sat(k*2.-1.);
  fh=t<D*.5;hc=fh?HCI:HCO;hd=fh?hsI(p,t):hsO(p,t-D);
  scene();fragColor=acc;
}`;
