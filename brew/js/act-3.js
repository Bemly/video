// Act 3 — things compiled on purpose, the HTTP/3 lab, and the finale.

// 17 · protobuf → graphviz → git-lfs — the five build targets stretch into buffers, shrink into nodes, line up as commits
scene({ name: 'graph', d: 12, hand: { d: 'ci(q-vec2(.4,.06),.17)', c: 'vec3(.95,.36,.2)' },
  texts: [T('LFS', 700), ...C('protobuf', '完整版现编：libprotobuf + protoc + 全套测试'),
    ...C('graphviz', '源码现编出瓶，枢纽依赖留给 core'),
    ...C('git-lfs', '上游 Intel 构建，带全套 man 页')],
  glsl: `
void scene(){
  float m1=sn(4.),m2=sn(8.),ko2=1.-sat(kO*2.5);
  vec2 c=vec2(0.,.06),q=p-c;
  vec2 nb[4]=vec2[4](vec2(0.,.27),vec2(-.32,.03),vec2(.32,.03),vec2(0.,-.22));
  vec3 cs[4]=vec3[4](vec3(.26,.52,.96),vec3(.92,.26,.21),vec3(.98,.74,.02),vec3(.2,.66,.33));
  // one edge per eighth note
  float ea=m1*(1.-m2);
  fillA(vec3(.35),sg(q,nb[0],mix(nb[0],nb[1],eo(4.5,4.9)))-.006,ea*step(4.5,t));
  fillA(vec3(.35),sg(q,nb[0],mix(nb[0],nb[2],eo(5.,5.4)))-.006,ea*step(5.,t));
  fillA(vec3(.35),sg(q,nb[1],mix(nb[1],nb[3],eo(5.5,5.9)))-.006,ea*step(5.5,t));
  fillA(vec3(.35),sg(q,nb[2],mix(nb[2],nb[3],eo(6.,6.4)))-.006,ea*step(6.,t));
  fillA(vec3(.35),sg(q,nb[1],mix(nb[1],nb[2],eo(6.5,6.9)))-.006,ea*step(6.5,t));
  fillA(K,sg(q,vec2(-.52,0.),vec2(.02,0.))-.01,m2*ko2);
  for(int i=0;i<4;i++)fillA(vec3(.5),ci(q-vec2(.085+.035*float(i),0.),.008),m2*ko2*step(8.5+.25*float(i),t));
  float dm=1e3;vec3 col=K;
  for(int i=0;i<4;i++){float fi=float(i);
    vec2 pa=vec2(.06*sin(t*PI*.5+fi*1.57),.17-.11*fi);
    vec2 pc_=i<3?vec2(-.52+.27*fi,0.):vec2(.4,0.);float rc=i<3?.055:.17;
    vec2 pos=mix(mix(pa,nb[i],m1),pc_,m2);
    vec2 hs=mix(mix(vec2(.3,.045),vec2(.075),m1),vec2(rc),m2);
    float di=rb(q-pos,hs,min(hs.x,hs.y));
    if(di<dm){dm=di;col=mix(cs[i],i<3?K:vec3(.95,.36,.2),m2);}}
  fill(mix(hc,col,k),mix(hd,dm,k));
  text(0,c+vec2(.4,0.),.13,W,lin(8.3,8.6)*ko2);
  pulse(0.,.3,.66,cs[0]);pulse(4.,.3,.66,K);pulse(8.,.2,.66,vec3(.95,.36,.2));
  cap(1,.3,3.9);cap(3,4.1,7.9);cap(5,8.1,11.6);
}` });

// 18 · docker-buildx → docker-compose — the large file becomes the hull; containers land on the snare hits
scene({ name: 'docker', d: 4, hand: { d: 'rb(q-vec2(0.,-.23),vec2(.75,.008),.008)', c: 'vec3(.11,.56,.93)' },
  texts: [...C('docker-buildx', '官方 darwin-amd64 裸二进制，改名装进 bin'),
    ...C('docker-compose', '官方 darwin-x86_64 裸二进制')],
  glsl: `
void scene(){
  vec3 db=vec3(.11,.56,.93);
  float m=sn(2.),ko2=1.-sat(kO*2.5);
  vec2 q=p-vec2(0.,.07);
  float dH=rb(q-vec2(0.,mix(-.27,-.3,m)),mix(vec2(.42,.06),vec2(.75,.008),m),mix(.06,.008,m));
  for(int i=0;i<3;i++){float gx=(float(i)-1.)*.52;
    fillA(vec3(.4),sg(q,vec2(gx,-.17),vec2(gx,-.3))-.005,m*ko2);}
  fill(mix(hc,db,k),mix(hd,dH,k));
  for(int j=0;j<9;j++){float fj=float(j),a=j<3?(j==0?0.:(j==1?.27:.58)):.58+.14*(fj-2.);
    vec2 pa=j<5?vec2((fj-2.)*.14,-.13):(j<8?vec2((fj-6.)*.14,.01):vec2(0.,.15));
    float g=floor(fj/3.),kk=fj-3.*g;
    vec2 pb=vec2((g-1.)*.52,-.1)+(kk<.5?vec2(-.075,0.):(kk<1.5?vec2(.075,0.):vec2(0.,.15)));
    vec2 pos=mix(pa,pb,m);pos.y+=(1.-eo(a,a+.4))*.9;
    vec3 col=mix(db,g<.5?db:(g<1.5?vec3(.1,.72,.68):vec3(.36,.4,.92)),m);
    fillA(col,rb(q-pos,vec2(.06),.014),step(a,t)*ko2);}
  pulse(2.,.4,.66,db);
  cap(0,.2,1.95);cap(2,2.05,3.8);
}` });

// 19 · capstone · dtc · libslirp · vde → qemu — the network line curls into an orbit; four leaves, one per beat, then they fall in
scene({ name: 'qemu', d: 8,
  hand: { d: 'rb(q-vec2(0.,.07),vec2(.3)*(1.+30.*exp(-u*u*7.)),.075*(1.+30.*exp(-u*u*7.)))', c: 'vec3(.95,.42,.05)', ci: 'vec3(.03,.2,.33)' },
  texts: [M('capstone'), M('dtc'), M('libslirp'), M('vde'),
    ...C('capstone · dtc · libslirp · vde', '只有“卸得掉”的叶子依赖，才跟着自家出瓶'),
    ...C('qemu', 'core 没有 Intel 瓶，CI 代编译全部 68 个目标')],
  glsl: `
void scene(){
  vec3 org=vec3(.95,.42,.05);
  float cv=sn(4.),ko2=1.-sat(kO*2.5);
  vec2 c=vec2(0.,.12-.05*cv),q=p-c;
  float R0=.42*kI*(1.-cv);
  hair(vec3(.5),ci(q,max(R0,.001)),.45*(1.-cv));
  for(int i=0;i<4;i++){float fi=float(i);
    float a=fi*PI*.5+PI*.25-t*.35-cv*2.5;
    float s=max(bk(fi,fi+.6),.001)*(1.+.25*pk(fi))*(1.-cv*.85);
    vec2 o=R0*vec2(cos(a),sin(a)),e=(q-o)/s;float d;vec3 col;
    if(i==0){d=trap(e,.06,.11,.07);col=vec3(.36,.46,.62);}
    else if(i==1){d=min(min(ci(e-vec2(0.,.07),.036),min(ci(e-vec2(-.075,-.06),.036),ci(e-vec2(.075,-.06),.036))),min(sg(e,vec2(0.,.07),vec2(-.075,-.06)),sg(e,vec2(0.,.07),vec2(.075,-.06)))-.01);col=vec3(.24,.64,.4);}
    else if(i==2){d=max(abs(e.y-.04*sin(e.x*28.))*.7-.016,abs(e.x)-.11);col=vec3(.6,.4,.86);}
    else{d=min(abs(rb(e,vec2(.1),.03))-.012,ci(abs(e)-vec2(.04),.022));col=vec3(.1,.64,.7);}
    fillA(col,d*s,step(fi,t)*(1.-lin(4.5,4.9)));
    text(i,c+o+vec2(0.,-.15),.055,vec3(.42),step(fi+.3,t)*(1.-lin(3.7,4.)));}
  float d=mix(ci(q,.1),rb(q,vec2(.3),.075),cv);
  fill(mix(hc,org,k),mix(hd,d,k));
  float g=(sn(4.)+sn(5.5)+sn(6.)+sn(7.))*.25;                        // the guests click into place on the last accents
  for(int i=1;i<4;i++){float fi=float(i),s=pow(.66,fi);
    fillA(mod(fi,2.)>.5?vec3(.99):org,rb(R(q,fi*PI*.5*(1.-g)),vec2(.3*s),.075*s),cv*ko2);}
  pulse(4.,.3,.66,org);pulse(4.15,.3,.5,K);
  cap(4,.3,3.9);cap(6,4.1,7.5);
}` });

// 20 · curl3 + libnghttp3 + libngtcp2 — we fall through qemu's innermost square into curl blue; it recedes into a tunnel
scene({ name: 'curl3', d: 4,
  hand: { d: 'rb(vec2(q.x,q.y-.07-.19*clamp(floor((q.y-.07)/.19+.5),-1.,1.)),vec2(.64,.07),.07)', c: 'vec3(.03,.2,.33)' },
  texts: [M('curl3', 700), M('curl3', 600), M('libnghttp3', 600), M('libngtcp2', 600),
    ...C('curl3', '独家开启 MASQUE 代理，改名后与系统 curl 共存'),
    ...C('curl3 · libnghttp3 · libngtcp2', 'HTTP/3 与 QUIC 两个叶子依赖，一起自家出瓶')],
  glsl: `
void scene(){
  vec3 cb=vec3(.03,.2,.33),tl=vec3(.1,.72,.75);
  float m=sn(2.);
  vec2 c=vec2(0.,.07),q=p-c;
  float row=clamp(floor(q.y/.19+.5),-1.,1.),yr=q.y-row*.19;
  float d=mix(rb(q,vec2(.64,.14),.14),rb(vec2(q.x,yr),vec2(.64,.07),.07),m);
  fill(cb,fh?mix(hd,d,kI):d);
  float A=lin(.7,1.)*(1.-sat(m*3.));
  text(0,c+vec2(-.36,0.),.17,W,A);
  strk(tl,rb(q-vec2(.25,0.),vec2(.32,.07),.07),.006,A);
  for(int i=0;i<5;i++){float x=fract(t*.5+float(i)*.2);
    fillA(W,ci(q-vec2(-.03+x*.56,0.),.028),A*smoothstep(0.,.1,x)*smoothstep(1.,.9,x));}
  float Bq=lin(2.2,2.5);
  text(1,c+vec2(-.36,.19),.075,W,Bq);text(2,c+vec2(-.36,0.),.075,W,Bq);text(3,c+vec2(-.36,-.19),.075,W,Bq);
  float u=fract(q.x/.14-t*(row>.5?.5:(row>-.5?.75:1.)));
  fillA(row>.5?W:(row>-.5?tl:vec3(.98,.74,.2)),max(length(vec2((u-.5)*.14,yr))-.022,max(-.01-q.x,q.x-.57)),Bq*(1.-sat(kO*3.)));
  cap(4,.5,1.95);cap(6,2.05,3.8);
}` });

// 21 · nghttp2 → caddy → h2spec — three lanes thin into streams and merge into one pipe; the lock; the check
scene({ name: 'h2', d: 8, hand: { d: 'ci(q-vec2(0.,.06),.27)', c: 'vec3(.2,.72,.4)' },
  texts: [...C('nghttp2', 'H2 客户端三件套，--enable-app 现编'),
    ...C('caddy', '上游 Intel 静态构建，H2 / H3 的基线服务'),
    ...C('h2spec', 'H2 一致性测试器，逐条打勾')],
  glsl: `
void scene(){
  vec3 tl=vec3(.1,.72,.75),ck=vec3(.2,.72,.4);
  float m1=sn(4.),m2=sn(6.);
  vec2 c=vec2(0.,.06),q=p-c;
  float A=lin(.4,.8)*(1.-m1);
  for(int i=0;i<3;i++){float fi=float(i);
    float y=(1.-fi)*.17*(1.-smoothstep(-.4,0.,q.x));
    vec3 col=i==0?vec3(.25,.52,.96):(i==1?tl:vec3(.97,.6,.15));
    float dash=abs(fract(q.x*4.-t*2.+fi*.33)-.5)-.3;
    fillA(col,max(max(abs(q.y-y)-.013,abs(q.x+.3)-.33),dash*.1),A);}
  float dP=rb(q-vec2(.33,0.),vec2(.3,.06),.06);
  float dK=rb(q-vec2(0.,-.1),vec2(.2,.16),.045);
  float g=eo(4.3,5.);
  fillA(vec3(.14,.33,.58),arc(q-vec2(0.,.06),.115,PI*(1.-g),PI)-.03,m1*(1.-m2)*step(4.3,t));
  float d=mix(mix(dP,dK,m1),ci(q,.27),m2);
  vec3 col=mix(mix(tl,vec3(.1,.68,.47),m1),ck,m2);
  if(fh)fill(mix(hc,col,kI),mix(hd,d,kI));else fill(col,d);
  float fx=(q.x-t*.9)*7.,fm=abs(fract(fx)-.5)-.32,id=mod(floor(fx),3.);
  fillA(id<.5?vec3(.25,.52,.96):(id<1.5?W:vec3(.97,.6,.15)),max(max(dP+.02,fm*.1),.06-q.x),A);
  fillA(W,min(ci(q-vec2(0.,-.07),.042),bx(q-vec2(0.,-.14),vec2(.016,.05))),m1*(1.-m2));
  vec2 a=vec2(-.12,0.),b=vec2(-.03,-.09),e=vec2(.13,.09);
  float ka=1.-sat(kO*3.);
  fillA(W,sg(q,a,mix(a,b,eo(6.5,6.8)))-.028,step(6.5,t)*ka);
  fillA(W,sg(q,b,mix(b,e,eo(7.,7.4)))-.028,step(7.,t)*ka);
  pulse(4.,.3,.66,vec3(.1,.68,.47));pulse(6.,.27,.66,ck);pulse(7.,.27,.66,ck);
  cap(0,.3,3.9);cap(2,4.1,5.95);cap(4,6.05,7.7);
}` });

// 22 · hyperfine → iperf3 — the check splits into three racing bars; they wind up into a gauge
scene({ name: 'bench', d: 4, hand: { d: 'ci(q-vec2(0.,-.08),.05)', c: 'K' },
  texts: [...C('hyperfine', '命令行基准工具，反复跑分用'),
    ...C('iperf3', '静态构建，绕开整棵 openssl@4 依赖树')],
  glsl: `
void scene(){
  vec3 ck=vec3(.2,.72,.4),bl=vec3(.1,.55,.95);
  float m=sn(2.);
  vec2 c=vec2(0.,.06),q=p-c,g=q-vec2(0.,-.14);
  float row=clamp(floor(q.y/.17+.5),-1.,1.),y=row*.17;
  float L=(row>.5?.8:(row>-.5?.55:.32))*eo(.1,1.4);
  float dB=rb(vec2(q.x+.42-L*.5,q.y-y),vec2(L*.5+.05,.05),.05);
  vec3 bc=row>.5?ck:(row>-.5?vec3(.96,.72,.15):vec3(.92,.36,.3));
  float a=m*(1.-sat(kO*2.5));
  fillA(vec3(.78),arc(g,.36,0.,PI)-.032,a);
  float v=eo(2.1,3.)*(.74+.13*sin(t*PI*2.)),th=PI*(1.-v);
  fillA(bl,arc(g,.36,th,PI)-.032,a);
  fillA(K,sg(g,vec2(0.),.29*vec2(cos(th),sin(th)))-.012,a);
  float d=mix(dB,ci(g,.05),m);
  if(fh)fill(mix(hc,mix(bc,K,m),kI),mix(hd,d,kI));else fill(K,d);
  float xe=-.42+L+.03;
  float wk=min(sg(q,vec2(xe-.06,y),vec2(xe+.07,y)),min(sg(q,vec2(xe-.06,y-.028),vec2(xe-.06,y+.028)),sg(q,vec2(xe+.07,y-.028),vec2(xe+.07,y+.028))))-.005;
  fillA(K,wk,(1.-sat(m*4.))*lin(1.,1.3));
  pulse(2.,.36,.66,bl);
  cap(0,.2,1.95);cap(2,2.05,3.8);
}` });

// 23 · socat → wireshark → frida-server — the hub splits into two sockets; a fin; a needle; then a coin flip
scene({ name: 'wire', d: 8, tout: 'flip',
  texts: [...C('socat', '双向中继，源码现编出瓶'),
    ...C('wireshark', 'Intel 构建停在 4.4 系，镜像官方 dmg'),
    ...C('frida-server', '官方裸二进制，上游只发 Intel 版')],
  glsl: `
void scene(){
  vec3 wsb=vec3(.1,.38,.85),red=vec3(.94,.25,.2);
  float sp=kI,m1=sn(2.),m2=sn(5.);
  vec2 c=vec2(0.,.06),q=p-c;
  vec2 c1=vec2(-.45*sp*(1.-m1)+.16*sin(t*.8)*m1*(1.-m2),0.),c2=vec2(.45*sp*(1.-m1),0.);
  float A=(1.-m1)*sat(sp*2.-1.);
  for(int i=0;i<2;i++){float y=i==0?.05:-.05,dir=i==0?1.:-1.;
    fillA(vec3(.45),sg(q,vec2(-.3,y),vec2(.3,y))-.004,A);
    for(int j=0;j<3;j++){float u=fract(t+float(j)/3.);
      fillA(i==0?vec3(.2,.6,.95):vec3(.95,.55,.2),ci(q-vec2(dir*mix(-.3,.3,u),y),.022),A);}}
  float Bq=m1*(1.-m2);
  fillA(vec3(.45,.65,.95),max(abs(q.y+.15-.02*sin(q.x*12.-t*3.))-.008,abs(q.x)-.7*eo(2.,3.)),Bq);
  for(int i=0;i<6;i++){float fi=float(i),x=mod(fi*.37-t*.4,1.4)-.7;
    fillA(vec3(.62),rb(q-vec2(x,-.26-.06*h1(fi)),vec2(.03,.016),.008),Bq*smoothstep(.7,.5,abs(x)));}
  vec2 f=q-c1;
  float dF=tri(f,vec2(-.2,-.13),vec2(.2,-.13),vec2(.12,.26))-.012;
  float d1=mix(mix(rb(f,vec2(.13),.035),dF,m1),rb(q,vec2(.24),.05),m2);
  float d2=rb(q-c2,vec2(.13),.035);
  fillA(K,fh?mix(hd,d2,kI):d2,1.-sat(m1*2.5));
  fill(mix(mix(K,wsb,m1),vec3(.985),m2),fh?mix(hd,d1,kI):d1);
  fillA(W,min(ci(f-vec2(-.04,0.),.022),ci(f-vec2(.04,0.),.022)),A);
  fillA(W,min(ci(q-c2-vec2(-.04,0.),.022),ci(q-c2-vec2(.04,0.),.022)),A);
  strk(K,rb(q,vec2(.24),.05),.008,m2);
  float hit=step(6.,t);                                             // the needle lands on beat 6
  fillA(mix(vec3(.72),red,hit),ci(q,.07*(1.+.5*pk(6.)+.3*pk(7.))),m2);
  fillA(red,sg(q,vec2(-.6,.56),mix(vec2(-.56,.52),vec2(-.06,.055),ei(5.3,6.)))-.012,m2*step(5.3,t));
  pulse(2.,.3,.66,wsb);pulse(6.,.1,.66,red);pulse(6.12,.1,.5,red);
  cap(0,.2,1.95);cap(2,2.05,4.95);cap(4,5.05,7.6);
}` });

// 24 · checkra1n → palera1n — the process box flips over and is a phone; the lock snaps open; then rain
scene({ name: 'ra1n', d: 4, hand: { d: 'rb(q-vec2(0.,.07),vec2(.2,.37),.055)', c: 'K' },
  texts: [...C('checkra1n', 'core 的同名 cask 已被 disable，这里还能装'),
    ...C('palera1n', 'universal 单包覆盖双架构，锁定版本')],
  glsl: `
void scene(){
  vec2 c=vec2(0.,.07),q=p-c;
  float ko2=1.-sat(kO*2.5),ra=lin(2.,2.3)*ko2;
  float ix=clamp(floor(p.x/.26+.5),-4.,4.);
  vec2 g=vec2(p.x-ix*.26,mod(p.y+t*.9*(1.+.3*h1(ix))+h1(ix+3.)*.9,.9)-.45);
  float drop=min(ci(g-vec2(0.,-.012),.034),tri(g,vec2(-.03,.005),vec2(.03,.005),vec2(0.,.085)));
  fillA(vec3(.35,.62,.96),drop,ra*smoothstep(.8,.55,p.y)*smoothstep(-.47,-.3,p.y)*step(.5,abs(ix)));
  fill(K,rb(q,vec2(.2,.37),.055));
  fillA(vec3(.2,.2,.22),rb(q,vec2(.175,.335),.035),ko2);
  float op=eo(1.,1.4);
  vec2 l=q-vec2(0.,-.01),s=R(l-vec2(.05,.03),-op*.7)+vec2(.05,0.);
  float sh=min(arc(s,.05,0.,PI),min(sg(s,vec2(-.05,0.),vec2(-.05,-.04)),sg(s,vec2(.05,0.),vec2(.05,-.04))))-.013;
  fillA(W,sh,ko2);
  fillA(W,rb(l-vec2(0.,-.035),vec2(.078,.058)*(1.+.15*pk(1.)),.016),ko2);
  fillA(K,ci(l-vec2(0.,-.03),.016),ko2);
  pulse(1.,.2,.66,K);pulse(2.,.3,.66,vec3(.35,.62,.96));
  cap(0,.2,1.95);cap(2,2.05,3.8);
}` });

// 25 · finale — every bottle at once, the two lines on the two quiet downbeats, the mark on the last chord
scene({ name: 'outro', d: 35.124,
  texts: [T('给 Intel Mac 了不起的瓶子', 500, 'cn'), T('它就能继续做了不起的事', 500, 'cn'), M('brew tap bemly/tahoe', 500)],
  glsl: `
void scene(){
  float r0=.17*eo(0.,.8),ln=.36*eo(0.,1.2)*(1.-io(2.2,3.6));
  float dz=io(2.2,3.6),fd=1.-lin(17.,19.5);
  for(int i=0;i<60;i++){float fi=float(i);
    float a=fi/60.*TAU+.6*eo(0.,4.)+.012*t*(h1(fi+2.)-.3);
    float rd=mix(r0,.22+1.5*h1(fi+5.),eo(2.2,8.))+.004*t;
    float ri=mix(r0,rd,dz),ro=ri+ln*(.55+.45*h1(fi));
    float w=mix(.012,.006+.011*h1(fi+1.),dz);
    vec3 col=mix(.5+.45*cos(TAU*(fi/60.+vec3(0.,.33,.67))),pal8(mod(fi,8.)),.45);
    vec2 dir=vec2(cos(a),sin(a));
    fillA(col,sg(p,dir*ri,dir*ro)-w,fd*mix(1.-lin(3.4,7.5),1.,step(.78,h1(fi+11.))));}
  float s=max(1.-eo(0.,.6),.001);
  fillA(K,rb((p-vec2(0.,.07))/s,vec2(.2,.37),.055)*s,step(t,.6));
  text(0,vec2(0.),.13,vec3(.07),lin(4.,5.)*(1.-lin(11.4,12.)));
  text(1,vec2(0.),.13,vec3(.07),lin(12.,13.)*(1.-lin(19.,19.6)));
  float la=bk(19.6,20.4);
  fillA(K,bottle((p-vec2(0.,.06))/(.5*max(la,.001)))*.5*max(la,.001),step(19.6,t));
  text(2,vec2(0.,-.3),.062,vec3(.3),lin(21.,22.5));
  fillA(W,-1.,lin(D-2.8,D-1.4));
}` });
