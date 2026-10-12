// Act 1 — the problem, the tap, and the first bottles.
// `d` = length in beats (144 BPM). Every scene starts on a bar accent; local beat t=0,4,8… are the hits, t=2,6… the low thumps.
// `hand` = the shape this scene leaves behind for the next one (q = position, u = beats from the cut).

// 0 · a zero, written on a white screen → an Intel Mac → the zero becomes a bottle → orbiting drops paint the first disc
scene({ name: 'open', d: 16.876, hand: { d: 'ci(q-vec2(0.,.05),.31)', c: 'K' },
  texts: [M('x86_64', 600), M('x86_64_tahoe:0', 600), T('Intel Mac + macOS 26：core 里一个瓶都没有', 400, 'cn'),
    { s: 'brew tap bemly/tahoe', f: 'mono', w: 600 }, { s: '取上游官方 amd64 包 · 打成瓶 · 由 GHCR 分发', f: 'cn', w: 400, ch: 96 }],
  glsl: `
float nb(float a,float b){return lin(a+.876,b+.876);}
void scene(){
  float n=t-.876;
  float z=1.-pow(1.-nb(4.,5.7),4.),lp=1.-pow(1.-nb(8.,9.1),4.);     // zoom-out on beat 4, the leap on beat 8
  float Z=mix(4.6,1.,z);
  vec2 sc=vec2(0.,.13),off=mix(sc,vec2(0.,-.07),z);
  float ms=max(1.-lp,.001),ma=1.-nb(8.,8.7),zz=Z*ms;
  vec2 q=(p/Z+off-sc)/ms+sc;
  fillA(vec3(.66),min(bx(q-vec2(0.,-.33),vec2(.09,.08)),rb(q-vec2(0.,-.415),vec2(.19,.014),.014))*zz,ma);
  fillA(vec3(.84),rb(q-vec2(0.,.06),vec2(.52,.34),.035)*zz,ma);
  fillA(K,rb(q-vec2(0.,.13),vec2(.5,.265),.022)*zz,ma);
  fillA(W,rb(q-sc,vec2(.458,.238),.008)*zz,ma);
  fillA(vec3(.62),ci(q-vec2(0.,-.21),.022)*zz,ma);
  // the zero, drawn in one stroke, then leaping out of the screen and becoming the bottle
  vec2 c0=mix((sc-off)*Z,vec2(0.,.03),lp);
  float s0=mix(Z*.25,1.,lp)*(1.-.999*pow(nb(14.2,15.7),3.));
  vec2 e=(p-c0)/s0;
  float db=bottle(e),d=mix(ell(e,vec2(.19,.3)),db,lp)*s0,w=mix(.03*s0,.007,lp);
  fillA(vec3(.985),d,lp);
  float f=1.-pow(1.-nb(10.,12.),3.);                                 // poured on beat 10
  float lvl=mix(-.46,.2,f)+.014*sin(e.x*16.+t*2.6)*f;
  fillA(vec3(.97,.64,.1),max(db+.024,e.y-lvl)*s0,lp*step(10.,n));
  fillA(vec3(1.,.95,.84),max(db+.024,abs(e.y-lvl-.014)-.016)*s0,lp*f);
  for(int i=0;i<6;i++){float fi=float(i);vec2 b=vec2((h1(fi)-.5)*.2,-.4+fract(h1(fi+7.)+t*.22)*.62);
    fillA(vec3(1.,.86,.5),max(ci(e-b,.008+.008*h1(fi+3.)),max(db+.035,b.y-lvl+.05))*s0,lp*f);}
  float la=lp*nb(12.,12.5);
  fillA(W,rb(e-vec2(0.,-.14),vec2(.115,.07),.012)*s0,la);text(0,c0+vec2(0.,-.11)*s0,.062*s0,K,la);
  float wr=nb(0.,2.8);wr=wr*wr*(3.-2.*wr);
  float on=step(0.,n),pen=on*(1.-step(2.79,n));
  fillA(K,abs(d)-w,on*max(step(fract(atan(e.x,e.y)/TAU),wr),step(2.79,n)));
  fillA(K,ci(e-vec2(.19*sin(wr*TAU),.3*cos(wr*TAU)),w/s0)*s0,pen);
  fillA(K,ci(e-vec2(0.,.3),w/s0)*s0,pen);
  // three drops in orbit; the one on the rim paints the disc of the first bottle (beats 12 → 16)
  vec2 g=p-vec2(0.,.05);
  float pr=nb(12.8,16.);pr*=pr;
  float oa=nb(12.,12.5)*(1.-nb(15.6,16.));
  hair(vec3(.5),ci(g,.44),oa*.5);hair(vec3(.5),ci(g,.2),oa*.35);
  float ab=2.2-TAU*(1.1*pr+.1*(n-12.));
  fillA(K,ci(g,.31),smoothstep(pr,pr-.3*(1.-pr)-.002,fract((atan(g.y,g.x)-ab)/TAU))*step(12.8,n));
  fillA(W,ci(g-.31*vec2(cos(ab),sin(ab)),.045),oa);
  float a2=1.-n*1.9,a3=4.+n*1.3;
  fillA(W,ci(g-.2*vec2(cos(a2),sin(a2)),.028),oa);
  fillA(vec3(.97,.64,.1),ci(g-.44*vec2(cos(a3),sin(a3)),.022),oa);
  // the caption is typed one character per note of the arpeggio
  float os[14]=float[14](4.28,4.5,5.,5.23,5.5,5.78,6.,6.23,6.56,6.81,7.,7.2,7.51,8.);
  float cnt=0.;for(int i=0;i<14;i++)cnt+=step(os[i],n);
  capT(1,5.1,8.8,cnt/14.);
  cap(3,9.2,16.2);
}` });

// 1 · gh — the first bottle; the cat pops out of the painted disc
scene({ name: 'gh', d: 4, hand: { d: 'ci(q-vec2(0.,.05),.31)', c: 'K' },
  texts: [...C('gh', '第一个瓶：官方 gh_macOS_amd64.zip 直接取用')],
  glsl: `
void scene(){
  vec2 c=vec2(0.,.05);
  hair(vec3(.5),ci(p-c,.44),bk(0.,.8)*(1.-kO)*.5);
  fillA(K,ci(p-c-.44*vec2(cos(-t*1.2+1.),sin(-t*1.2+1.)),.02),lin(0.,.3)*(1.-kO));
  fill(K,hd);
  float s=max(bk(0.,.9)*(1.-kO),.001)*(1.+.1*pk(2.));
  vec2 q=(p-c)/s;
  float head=ell(q-vec2(0.,.045),vec2(.165,.14));
  float ear=tri(R(vec2(abs(q.x),q.y)-vec2(.1,.1),-.35*pk(2.))+vec2(.1,.1),vec2(.045,.15),vec2(.16,.235),vec2(.155,.06));
  float body=rb(q-vec2(0.,-.2),vec2(.06,.14),.02);
  float tail=min(sg(q,vec2(-.06,-.19),vec2(-.13,-.15)),sg(q,vec2(-.13,-.15),vec2(-.2,-.2)))-.016;
  fill(W,max(min(min(head,ear),min(body,tail))*s,ci(p-c,.298)));
  pulse(0.,.31,.66,K);pulse(2.,.31,.66,K);
  cap(0,.2,3.8);
}` });

// 2 · fastfetch · mufetch · neofetch — the disc slides aside and becomes the logo; it flips like a coin on each bar
scene({ name: 'fetch', d: 12, hand: { d: 'hx(R(q-vec2(0.,.06),1.047*smoothstep(-1.,1.,u)),.22)-.04', c: 'vec3(.58)' },
  texts: [T('f', 700), T('μ', 700), T('n', 700),
    ...C('fastfetch', '官方 macos-amd64 包，开箱即用'),
    ...C('mufetch', 'release 里的 darwin_x86_64，直链成瓶'),
    ...C('neofetch', '上游已归档，替它留住最后一版')],
  glsl: `
void scene(){
  float gy=sn(8.),mv=kI*(1.-kO),ko2=1.-sat(kO*3.);
  vec2 q=p-vec2(-.5*mv,.05+.01*kO);
  q.x/=max(abs(cos(PI*sn(4.)))*abs(cos(PI*sn(8.))),.02);
  float dl=ci(q,mix(.31,.21,mv));
  vec3 lcol=mix(K,vec3(.58),gy);
  if(fh)fill(lcol,dl);else fill(mix(hc,lcol,k),mix(hd,dl,k));
  float ga=lin(.3,.6)*ko2;
  ink(W,tx(0,q,.27)*ga*(1.-step(4.16,t)));
  ink(W,tx(1,q,.27)*ga*step(4.16,t)*(1.-step(8.16,t)));
  ink(W,tx(2,q,.27)*ga*step(8.16,t));
  float ph=t<4.?0.:(t<8.?1.:2.);
  float ps=ph<.5?.3:(ph<1.5?4.:8.),pe=ph<.5?3.95:(ph<1.5?7.95:D-.8);
  vec3 acn=ph<.5?vec3(.2,.52,.96):(ph<1.5?vec3(.93,.3,.55):vec3(.5));
  for(int i=0;i<5;i++){float fi=float(i);
    float g=eo(ps+fi*.07,ps+.6+fi*.07)*(1.-lin(pe-.25,pe));
    float y=.3-.085*fi,w=(.25+.4*h1(fi+ph*7.))*g,al=step(.004,g);
    fillA(vec3(.74),sg(p,vec2(-.02,y),vec2(-.02+w,y))-.02,al);
    fillA(acn,sg(p,vec2(-.16,y),vec2(-.16+.08*g,y))-.02,al);}
  for(int i=0;i<8;i++){float fi=float(i),s=bk(.5+fi*.25,.9+fi*.25);       // one swatch per eighth note
    vec3 c=pal8(fi);c=mix(c,vec3(dot(c,vec3(.333))*.8+.12),gy);
    fillA(c,rb(p-vec2(-.145+fi*.092,-.18),vec2(.034)*max(s,.001)*(1.+.5*pk(4.)+.5*pk(8.)),.008),step(.5+fi*.25,t)*ko2);}
  cap(3,.3,3.95);cap(5,4.05,7.95);cap(7,8.05,11.6);
}` });

// 3 · node · node@24 · node@22 — the hexagon keeps spinning through the cut; the LTS lines burst out when the band comes in
scene({ name: 'node', d: 4, hand: { d: 'hx(R(q-vec2(0.,.06),1.047*smoothstep(-1.,1.,u)),.22)-.04', c: 'vec3(.37,.63,.29)' },
  texts: [T('26', 700), T('24', 700), T('22', 700), M('node@24'), M('node@22'),
    ...C('node · node@24 · node@22', '官方 darwin-x64 包，三条版本线一起出瓶')],
  glsl: `
void scene(){
  vec3 g0=vec3(.37,.63,.29),g1=vec3(.25,.5,.23),g2=vec3(.17,.39,.19);
  float sp=bk(2.,2.8)*(1.-sat(kO*1.4));
  vec2 c=vec2(0.,.06);
  for(int i=0;i<2;i++){float s=i==0?-1.:1.;vec2 cc=c+vec2(s*.68*sp,-.02*sp);
    fillA(i==0?g1:g2,hx(R(p-cc,PI/3.*sn(2.)*s),.17)-.035,step(2.,t));
    text(1+i,cc,.19,W,sat(sp)*step(2.,t));
    text(3+i,cc+vec2(0.,-.3),.06,vec3(.42),sat(sp)*step(2.,t));}
  fill(mix(hc,g0,fh?kI:1.),hd);
  text(0,c,.24,W,lin(.2,.5)*(1.-sat(kO*3.)));
  pulse(0.,.25,.66,g0);pulse(2.,.25,.66,g0);
  cap(5,.25,3.8);
}` });

// 4 · cmd · deepseek-harness → dsh-gui — hexagon → npm package → two prompts → one of them opens into a window
scene({ name: 'npm', d: 8, hand: { d: 'rb(q-vec2(0.,.06),vec2(.62,.37),.04)', c: 'vec3(.985)' },
  texts: [T('npm', 800), M('> cmd', 600), M('> dsh', 600),
    ...C('cmd · deepseek-harness', 'npm 包直引，跑在本 tap 自己的 node 瓶上'),
    ...C('dsh-gui', '上游只有一条浮动直链，按日期镜像存档')],
  glsl: `
void scene(){
  vec3 red=vec3(.8,.2,.2),blue=vec3(.3,.42,1.);
  float sp=sn(2.),gui=sn(4.),A=1.-gui;
  vec2 cl=vec2(-.42*sp*A,.06),cr=vec2(.42*sp*A,.06);
  vec2 hs=mix(vec2(.2),vec2(.35,.12),sp);float rr=mix(.055,.12,sp);
  fillA(mix(hc,mix(red,K,sp),kI),mix(hd,rb(p-cl,hs,rr),kI),(1.-lin(4.,4.5))*float(fh));
  float dR=rb(p-cr,mix(hs,vec2(.62,.37),gui),mix(rr,.04,gui));
  fill(mix(hc,mix(mix(red,blue,sp),vec3(.985),gui),fh?kI:1.),fh?mix(hd,dR,kI):dR);
  text(0,vec2(0.,.06),.2,W,lin(.2,.5)*(1.-lin(1.9,2.1)));
  float ta=lin(2.2,2.6)*(1.-lin(3.9,4.1));
  text(1,cl,.12,W,ta);text(2,cr,.12,W,ta);
  float ga=lin(4.3,4.8)*(1.-sat(kO*2.));vec2 q=p-cr;
  fillA(blue,max(dR,.28-q.y),ga);
  for(int i=0;i<3;i++)fillA(W,ci(q-vec2(-.55+.055*float(i),.325),.016),ga*.9);
  fillA(vec3(.93),max(dR,max(q.x+.34,q.y-.28)),ga);
  for(int i=0;i<4;i++)fillA(vec3(.82),rb(q-vec2(-.48,.19-.1*float(i)),vec2(.1,.022),.022),ga);
  float b1=max(bk(5.,5.6),.001),b2=max(bk(6.,6.6),.001),b3=max(bk(7.,7.6),.001);    // a message on each beat
  fillA(blue,rb((q-vec2(.3,.14))/b1,vec2(.22,.05),.05)*b1,ga*step(5.,t));
  fillA(vec3(.88),rb((q-vec2(0.,-.01))/b2,vec2(.28,.05),.05)*b2,ga*step(6.,t));
  fillA(vec3(.88),rb((q-vec2(-.08,-.14))/b3,vec2(.2,.05),.05)*b3,ga*step(7.,t));
  pulse(0.,.25,.66,red);pulse(4.,.5,.66,blue);
  cap(3,.3,3.9);cap(5,4.1,7.7);
}` });

// 5 · opencode + ripgrep — on the loudest accent so far the lights go out across the very same window
scene({ name: 'opencode', d: 8, hand: { d: 'rb(q-vec2(0.,.06),vec2(.62,.37),.04)', c: 'K' },
  texts: [M('opencode', 700), M('$ rg "x86_64_tahoe"'),
    ...C('opencode', '与 core 的 npm 版同名：Intel 走瓶，ARM 走直链'),
    ...C('ripgrep', 'opencode 的依赖，同名依赖也得自家出瓶')],
  glsl: `
void scene(){
  vec2 c=vec2(0.,.06),q=p-c;
  float dW=rb(q,vec2(.62,.37),.04);
  fill(vec3(.985),dW);
  fill(K,max(dW,q.x-mix(-.66,.66,eo(0.,.7))));
  float A=lin(.6,.9)*(1.-lin(3.8,4.)),w=tw(0,.22);
  ink(mix(vec3(.55),W,step(0.,q.x)),tx(0,q,.22)*A);
  fillA(W,bx(q-vec2(w*.5+.035,0.),vec2(.028,.06)),A*step(fract(t*.5),.5));
  float Bq=lin(4.,4.3)*(1.-sat(kO*2.5)),sx=mix(-.7,.7,lin(4.5,7.));
  text(1,c+vec2(-.54+tw(1,.085)*.5,.27),.085,vec3(.62),Bq);
  for(int i=0;i<5;i++)for(int j=0;j<4;j++){float n=float(i*4+j);
    float x=-.52+float(j)*.28+.04*h1(n+9.),y=.15-.1*float(i),ww=.09+.13*h1(n);
    float m=step(.66,h1(n+50.))*step(x+ww*.5,sx);
    fillA(mix(vec3(.36),vec3(.96,.32,.27),m),sg(q,vec2(x,y),vec2(x+ww,y))-.018,Bq);}
  fillA(W,max(abs(q.x-sx)-.003,abs(q.y+.05)-.26),Bq*.7*step(4.5,t)*(1.-lin(6.9,7.)));
  pulse(0.,.5,.66,K);
  cap(2,.3,3.9);cap(4,4.1,7.7);
}` });

// 6 · sst → torpedo — the window turns into the stack; on the crash the torpedo fires
scene({ name: 'sst', d: 8, hand: { d: 'rb(q-vec2(0.,.05),vec2(.38,.085),.085)', c: 'K' },
  texts: [...C('sst', '取 anomalyco tap 公式里的 Intel 段'), ...C('torpedo', '同出一源，直达 VPC 里的数据库')],
  glsl: `
void scene(){
  vec3 org=vec3(.91,.44,.2);
  float tp=sn(4.),x6=max(t-6.,0.),go=step(6.,t),fd=1.-sat(kO*2.);
  vec2 c=vec2(1.3*x6*exp(-x6*1.9)*(1.-kO),.05),q=p-c;
  float d=rb(R(q,(1.-kI)*1.571),mix(vec2(.25),vec2(.38,.085),tp),mix(.07,.085,tp));
  for(int i=0;i<9;i++){float fi=float(i);
    float y=(h1(fi)-.5)*.6+.05,x=1.4-mod(t*(1.2+2.6*go)+h1(fi+4.)*3.,3.),l=(.1+.2*h1(fi+8.))*(1.+1.5*go);
    fillA(vec3(.5),sg(p,vec2(x,y),vec2(x+l,y))-.004,tp*(.25+.75*go)*(1.-kO)*smoothstep(1.5,.7,abs(x)));}
  float fin=min(tri(q,vec2(-.3,.07),vec2(-.43,.17),vec2(-.4,.05)),tri(q,vec2(-.3,-.07),vec2(-.4,-.05),vec2(-.43,-.17)));
  fillA(K,fin,tp*fd);
  fill(mix(hc,mix(org,K,tp),k),mix(hd,d,k));
  fillA(org,max(d,.2-q.x),tp*fd);
  fillA(vec3(.32),bx(q-vec2(-.1,0.),vec2(.004,.085)),tp*fd);
  for(int i=0;i<3;i++){float fi=float(i),s=max(bk(.5+fi*.5,.9+fi*.5),.001);
    fillA(W,rb((q-vec2(i==1?.035:-.035,.11-.11*fi))/s,vec2(.12,.03),.03)*s,(1.-tp)*step(.5+fi*.5,t));}
  pulse(0.,.3,.66,org);pulse(4.,.3,.66,K);pulse(6.,.2,.66,org);pulse(6.15,.2,.5,K);
  cap(0,.3,3.9);cap(2,4.1,7.7);
}` });

// 7 · zcode — the torpedo tilts and becomes the diagonal of the Z
scene({ name: 'zcode', d: 4, hand: { d: 'zs(q-vec2(0.,.05))', c: 'K' },
  texts: [...C('zcode', '智谱 z.ai 开发环境，x64 / arm64 双架构镜像')],
  glsl: `
void scene(){
  vec2 q=p-vec2(0.,.05),a=mix(vec2(.295,0.),vec2(.15,.17),kI),b=mix(vec2(-.295,0.),vec2(-.15,-.17),kI);
  float w=mix(.085,.034,kI);
  fill(K,sg(q,a,b)-w);
  fillA(K,sg(q,a,mix(a,vec2(-.15,.17),eo(.5,1.)))-w,step(.5,t));
  fillA(K,sg(q,b,mix(b,vec2(.15,-.17),eo(1.,1.5)))-w,step(1.,t));
  hair(vec3(.5),rb(q,vec2(.3)*(1.+.06*pk(2.)),.08),bk(2.,2.6)*(1.-kO)*.6);
  pulse(2.,.3,.66,K);
  cap(0,.3,3.8);
}` });
