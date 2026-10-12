// Act 2 — apps: faces, keys, media, desktop, shells, toolchains.

// 8 · workbuddy → github-copilot-app → grok-bot — the strokes of the Z become a face; goggles on the next bar; a coin flip out
scene({ name: 'faces', d: 12, tout: 'flip',
  texts: [...C('workbuddy', '腾讯的 Electron 办公台，不在 core，走 cask'),
    ...C('github-copilot-app', 'core 给的是 arm64，这里镜像官方 x64 dmg'),
    ...C('grok-bot', 'Cursor 下载页里的 Intel 版，锚定追新')],
  glsl: `
float feat(vec2 q){return min(sg(vec2(abs(q.x),q.y),vec2(.1,.01),vec2(.1,.11))-.025,arc(q,.15,PI*1.22,PI*1.78)-.02);}
void scene(){
  vec3 blue=vec3(.33,.42,.98);
  float m1=sn(4.),m2=sn(8.);
  vec2 c=vec2(0.,.05),q=p-c;
  vec2 hs=mix(mix(vec2(.28),vec2(.38,.27),m1),vec2(.3),m2);float rr=mix(mix(.08,.13,m1),.3,m2);
  float sb=max(bk(0.,.8),.001)*(1.+.06*pk(4.)+.06*pk(8.));
  fill(mix(blue,K,m1),rb(q/sb,hs,rr)*sb);
  if(t<1.05)fill(mix(K,W,kI),mix(zs(q),feat(q),kI));
  else{
    // blinks on the thump, and three quick ones on the drum fill
    float bl=1.-.85*(exp(-pow((t-2.)*7.,2.))+exp(-pow((t-6.5)*8.,2.))+exp(-pow((t-7.)*8.,2.))+exp(-pow((t-7.5)*8.,2.)));
    vec2 ey=mix(vec2(.1,.06),vec2(.08,-.11),m1);float eh=mix(.05,.035,m1)*bl;
    for(int i=0;i<2;i++){float s=i==0?-1.:1.;
      fillA(W,sg(q,vec2(s*ey.x,ey.y-eh),vec2(s*ey.x,ey.y+eh))-.025,1.-m2);
      fillA(vec3(.3),ci(q-vec2(s*.16,.07),.105),m1*(1.-m2));
      strk(W,ci(q-vec2(s*.16,.07),.105),.016,m1*(1.-m2));}
    fillA(W,arc(q,.15,PI*1.22,PI*1.78)-.02,1.-lin(4.,4.2));
    float g=eo(8.2,8.8);
    strk(W,ci(q,.15),.026,m2);
    fillA(W,sg(q,vec2(-.19,-.21)*g,vec2(.19,.21)*g)-.026,m2*step(8.2,t));
  }
  pulse(0.,.3,.66,blue);pulse(4.,.3,.66,K);pulse(8.,.3,.66,K);
  cap(0,.3,3.9);cap(2,4.1,7.9);cap(4,8.1,11.6);
}` });

// 9 · doubao-ime → (two beats of silence: only the caret) → afm
scene({ name: 'ime', d: 10, hand: { d: 'rb(q-vec2(0.,-.05),vec2(.22),.07)', c: 'K' },
  texts: [T('豆', 600, 'cn'), T('A', 700), T('豆包', 500, 'cn'), T('逗    都    兜    斗', 400, 'cn'),
    T('拼音', 500, 'cn'), T('品    频    聘    贫', 400, 'cn'), M('arm64', 600),
    ...C('doubao-ime', '豆包输入法：免 sudo 装进用户级并自动启用'),
    ...C('afm', 'AFM 拼音：仅 Apple Silicon，本源唯一的破例')],
  glsl: `
void scene(){
  vec3 db=vec3(.2,.55,.98),og=vec3(.96,.5,.12);
  float dk=sn(4.),cr=dk*(1.-bk(6.,6.7)),ko3=1.-sat(kO*3.);     // the music stops on beat 4: everything collapses to a caret
  float pr=.03*(pk(1.)+pk(2.)+pk(3.)+pk(7.)+pk(8.));
  vec2 c=vec2(0.,-.05-pr*(1.-cr));
  float d=mix(rb(p-c,vec2(.22),.07),rb(p-vec2(0.,-.05),vec2(.012,.13),.012),cr);
  fillA(mix(vec3(.66),vec3(.32),dk),rb(p-vec2(0.,-.1),vec2(.22),.07),sat(1.-cr*3.)*ko3);
  if(fh)fill(mix(vec3(.99),K,dk),d);else fill(K,mix(hd,d,k));
  text(0,c,.29,db,1.-sat(dk*4.));text(1,c,.29,W,lin(6.3,6.6)*ko3);
  float s=max(t<5.?bk(2.,2.6)*(1.-dk):bk(7.,7.6)*ko3,.001),sh=step(2.,t),nx=step(5.,t);
  vec2 bc=vec2(0.,.34);
  fillA(W,rb((p-bc)/s,vec2(.45,.075),.075)*s,sh);
  float ta=sh*sat(s*2.-1.);
  text(2,bc+vec2(-.29,0.),.09,db,ta*(1.-nx));text(3,bc+vec2(.09,0.),.085,vec3(.35),ta*(1.-nx));
  text(4,bc+vec2(-.29,0.),.09,og,ta*nx);text(5,bc+vec2(.09,0.),.085,vec3(.35),ta*nx);
  float bs=max(bk(8.,8.5),.001)*(1.+.3*pk(8.));vec2 ac=vec2(.36,-.27);
  fillA(og,rb((p-ac)/bs,vec2(.125,.045),.045)*bs,step(8.,t)*ko3);
  text(6,ac,.07,W,lin(8.2,8.5)*ko3);
  pulse(6.,.2,.66,K);pulse(8.,.3,.66,og);
  cap(7,.3,4.);cap(9,6.1,9.7);
}` });

// 10 · ffmpeg · ffprobe · ffplay → ffserver — the key turns green; one tool per beat; the ghost flattens into a line
scene({ name: 'ffmpeg', d: 10, hand: { d: 'rb(q-vec2(0.,.07),vec2(.5,.005),.005)', c: 'vec3(.6)' },
  texts: [M('ffmpeg'), M('ffprobe'), M('ffplay'), M('3.4.2', 700),
    ...C('ffmpeg · ffprobe · ffplay', 'evermeet 静态构建，后两者 core 里根本没有'),
    ...C('ffserver', '上游 4.0 就已移除，2018 年的最后一版仍能跑')],
  glsl: `
void scene(){
  vec3 gr=vec3(.12,.52,.18);
  float gh=sn(6.),sp=sn(1.)*(1.-gh),dd=fh?sat(kI*2.-1.):1.-sat(kO*2.5);
  vec2 c0=vec2(-.62*sp,.07),c1=vec2(0.,.07),c2=vec2(.62*sp,.07);
  float s2=max(bk(2.,2.6),.001);vec2 q=(p-c2)/s2;float A=step(2.,t)*(1.-gh);
  fillA(gr,ci(q,.2)*s2,A);
  fillA(W,(tri(q,vec2(-.06,.1),vec2(-.06,-.1),vec2(.11,0.))-.012)*s2,A);
  float s1=max(bk(1.,1.6),.001);q=(p-c1)/s1;A=step(1.,t)*(1.-gh);
  fillA(W,rb(q,vec2(.2),.055)*s1,A);
  for(int i=0;i<5;i++){float fi=float(i),hh=.03+.1*abs(sin(t*PI*.5+fi*1.7));
    fillA(gr,rb(q-vec2(-.12+.06*fi,0.),vec2(.016,hh),.016)*s1,A);}
  q=p-c0;
  fill(mix(hc,mix(gr,vec3(.6),gh),k),mix(hd,rb(q,vec2(.2),.055),k));
  float sa=dd*(1.-gh);
  fillA(W,sg(q,vec2(-.1,.02),vec2(-.02,.1))-.022,sa*step(.25,t));
  fillA(W,sg(q,vec2(-.1,-.1),vec2(.1,.1))-.022,sa*step(.5,t));
  fillA(W,sg(q,vec2(.02,-.1),vec2(.1,-.02))-.022,sa*step(.75,t));
  float ta=sat(sp*2.-.6)*(1.-gh);
  text(0,c0+vec2(0.,-.3),.06,vec3(.42),ta);text(1,c1+vec2(0.,-.3),.06,vec3(.42),ta);text(2,c2+vec2(0.,-.3),.06,vec3(.42),ta*step(2.,t));
  float ga=gh*dd;
  text(3,c0,.1,W,ga);
  for(int i=0;i<3;i++){float fi=float(i);
    fillA(vec3(.6),arc(q-vec2(.17,.17),.1+.09*fi,PI*.06,PI*.44)-.014,ga*(.2+.8*(pk(7.+fi*.25)+pk(8.+fi*.25)+pk(9.+fi*.25)))*step(6.5,t));}
  pulse(0.,.25,.66,gr);pulse(6.,.25,.66,vec3(.5));
  cap(4,.3,5.9);cap(6,6.1,9.4);
}` });

// 11 · amd — the flat line of the silence is plucked on the loudest note of the track
scene({ name: 'amd', d: 6, hand: { d: 'rb(R(q-vec2(0.,.06),1.571*smoothstep(-1.,1.,u)),vec2(.22),.06)', c: 'vec3(.98,.25,.38)' },
  texts: [...C('amd', '自家的歌词汉化下载器，本地构建后镜像')],
  glsl: `
void scene(){
  vec3 pnk=vec3(.98,.25,.38);
  float B=1.48,x=max(t-B,0.),on=step(B,t),bs=max(bk(B,B+.6),.001),ko2=1.-sat(kO*2.);
  float ly=.07+.09*sin(p.x*22.)*sin(x*40.)*exp(-x*4.)*on;
  fillA(vec3(.6),rb(vec2(p.x,p.y-ly),vec2(.5*(1.-eo(B+.3,B+1.2)),.005),.005),1.-step(B+1.2,t));
  vec2 c=vec2(-.5,.06),q=(p-c)/bs;
  float d=rb(q,vec2(.22),.06)*bs;
  if(fh)fillA(pnk,d,on);else fill(pnk,mix(hd,d,k));
  float n=min(min(ell(q-vec2(-.075,-.1),vec2(.05,.038)),ell(q-vec2(.065,-.07),vec2(.05,.038))),
    min(min(sg(q,vec2(-.037,-.1),vec2(-.037,.09)),sg(q,vec2(.103,-.07),vec2(.103,.12)))-.012,sg(q,vec2(-.037,.1),vec2(.103,.13))-.022));
  fillA(W,n*bs,on*ko2);
  for(int i=0;i<3;i++){float fi=float(i),y=.28-.16*fi;
    float g=eo(B+.1+fi*.26,B+.6+fi*.26)*ko2,g2=eo(B+.36+fi*.26,B+.86+fi*.26)*ko2;
    fillA(vec3(.72),sg(p,vec2(-.12,y),vec2(-.12+(.5+.2*h1(fi))*g,y))-.022,step(.01,g));
    fillA(pnk,sg(p,vec2(-.12,y-.062),vec2(-.12+(.4+.25*h1(fi+9.))*g2,y-.062))-.022,step(.01,g2));}
  pulse(B,.2,.66,pnk);pulse(B+.12,.2,.5,K);
  cap(0,B+.1,5.6);
}` });

// 12 · blender-5x — the square spins into the logo; on the next accent it becomes the default cube, which turns on the beat
scene({ name: 'blender', d: 6, hand: { d: 'hx(q-vec2(0.,.06),.25)', c: 'vec3(.74)' },
  texts: [...C('blender-5x', 'Blender 5.x 的 Intel 优化社区构建，仅 x86_64')],
  glsl: `
void scene(){
  vec3 org=vec3(.93,.47,.05),bl=vec3(.15,.4,.72);
  float cb=sn(2.),A=sat(kI*2.-1.)*(1.-cb);
  vec2 c=vec2(.08*(1.-cb)*kI,.06),q=p-c;
  for(int i=0;i<3;i++){float fi=float(i),g=eo(.3+fi*.2,.8+fi*.2);
    float len=i==0?.36:(i==1?.2:.28),y=.14-.14*fi;
    fillA(org,sg(q,vec2(-.1,y),vec2(-.1-len*g,y))-.036,A*step(.3+fi*.2,t));}
  float an=mod(atan(q.y,q.x)+2.094*(sn(4.)+sn(5.))+PI,TAU)-PI;
  vec3 fc=(an>PI/6.&&an<PI*5./6.)?vec3(.95):((an>=PI*5./6.||an<-PI*.5)?vec3(.74):vec3(.52));
  fc=mix(fc,vec3(.74),kO);
  if(fh)fill(mix(hc,mix(org,fc,cb),kI),mix(hd,mix(ci(q,.24),hx(q,.25),cb),kI));else fill(fc,hx(q,.25));
  fillA(W,ci(q,.14),A);fillA(bl,ci(q,.085),A);
  pulse(0.,.25,.66,org);pulse(2.,.28,.66,vec3(.5));pulse(4.,.28,.66,vec3(.5));
  cap(0,.3,5.6);
}` });

// 13 · winstart → macos-tskmgr → brewui → heliport — cube faces fall flat into tiles; Wi-Fi pings on the chimes
scene({ name: 'desktop', d: 16, hand: { d: 'ci(q-vec2(0.,-.14),.05)', c: 'vec3(0.,.48,1.)' },
  texts: [...C('winstart', 'Metro 风启动器，无公开上游，镜像到本仓 Release'),
    ...C('macos-tskmgr', '任务管理器，按架构分包，锁定版本'),
    ...C('brewui', 'Homebrew 的图形界面，universal 单包'),
    ...C('heliport', 'Intel 无线网卡的 Wi-Fi 客户端')],
  glsl: `
void scene(){
  vec3 blue=vec3(0.,.47,.84),wf=vec3(0.,.48,1.),grn=vec3(.2,.72,.4),amb=vec3(.97,.64,.1);
  float m1=sn(4.),m2=sn(8.),m3=sn(12.);
  vec2 c=vec2(0.,.06),q=p-c,wc=vec2(0.,-.2);
  float d4=rb(abs(q)-vec2(.135+.014*kI+.03*pk(0.)+.03*pk(2.)),vec2(.118),.012);
  float dW=rb(q,vec2(.54,.34),.04);
  float d=mix(mix(d4,dW,m1),ci(q-wc,.05),m3);
  vec2 qq=t<2.?q:vec2(-q.y,q.x);                                   // the tiles trade colours on the thump
  vec3 tc=qq.x<0.?(qq.y>0.?blue:vec3(.38,.7,.2)):(qq.y>0.?vec3(.95,.55,.1):vec3(.55,.3,.75));
  fill(mix(hc,mix(mix(tc,vec3(.985),m1),wf,m3),k),mix(hd,d,k));
  float wa=m1*(1.-m3);
  for(int i=0;i<3;i++)fillA(i==0?vec3(.96,.36,.33):(i==1?vec3(.98,.75,.2):vec3(.3,.8,.35)),ci(q-vec2(-.47+.05*float(i),.28),.015),wa);
  float b=wa*(1.-m2);
  float gv=-.06+.1*sin(q.x*5.+t*1.6)+.05*sin(q.x*13.-t*2.3)+.03*sin(q.x*29.+t*3.1);
  float msk=max(abs(q.x)-.46,q.x-mix(-.46,.46,eo(4.2,6.)));
  for(int i=0;i<4;i++)fillA(vec3(.6),max(abs(q.y+.26-.14*float(i))-.0015,abs(q.x)-.46),b*.35);
  fillA(grn,max(max(q.y-gv,-.26-q.y),msk),b*.2);
  fillA(grn,max(abs(q.y-gv)*.75-.008,msk),b);
  float cc=wa*m2,ms=max(bk(8.,8.7),.001);
  vec2 mq=(q-vec2(-.22,-.04))/ms;
  fillA(amb,(abs(ci(mq-vec2(.13,-.01),.07))-.022)*ms,cc);
  fillA(amb,rb(mq,vec2(.11,.14),.03)*ms,cc);
  fillA(W,min(min(ci(mq-vec2(-.07,.14),.05),ci(mq-vec2(0.,.16),.06)),ci(mq-vec2(.07,.14),.05))*ms,cc);
  for(int i=0;i<3;i++){float fi=float(i),g=eo(9.+fi,9.5+fi),y=.1-.13*fi;
    fillA(amb,ci(q-vec2(.08,y),.022),cc*step(9.+fi,t));
    fillA(vec3(.8),sg(q,vec2(.15,y),vec2(.15+(.2+.1*h1(fi))*g,y))-.02,cc*step(9.+fi,t));}
  for(int i=0;i<3;i++){float fi=float(i),a=12.+.5*fi;
    fillA(wf,arc(q-wc,.15+.13*fi,PI*.25,PI*.75)-.034,m3*(1.-sat(kO*2.))*step(a,t)*(.55+.45*(pk(a)+pk(14.+.25*fi))));}
  pulse(0.,.3,.66,blue);pulse(4.,.5,.66,grn);pulse(8.,.5,.66,amb);
  cap(0,.3,3.9);cap(2,4.1,7.9);cap(4,8.1,11.9);cap(6,12.1,15.6);
}` });

// 14 · fish → konsole — the Wi-Fi dot drops into the water; the fish swims into a terminal, then whips off-screen
scene({ name: 'shell', d: 8, tout: 'whip',
  texts: [...C('fish', '取官方 .app 里的 unix 树，universal 的 Intel 切片'),
    ...C('konsole', 'KDE 每日构建，直链只留一天，必须镜像')],
  glsl: `
void scene(){
  vec3 fc=vec3(.97,.52,.22),kb=vec3(.11,.6,.93);
  float m=sn(4.),dd=sat(kI*2.-1.);
  vec2 c=vec2(0.,.06);
  for(int i=0;i<3;i++){float fi=float(i);
    float dw=p.y+.2+.07*fi-.012*sin(p.x*13.+t*3.+fi*2.);
    fillA(vec3(.5),max(abs(dw)-px*.75,abs(p.x)-(.6-.12*fi)*kI),dd*(1.-m)*.6);}
  vec2 q=R(p-c,sin(t*PI)*.08*(1.-m));
  float tl=sin(t*PI+1.)*.06*(1.-m);
  float dF=min(ell(q-vec2(.06,0.),vec2(.27,.15)),tri(q,vec2(-.17,0.),vec2(-.4,.15+tl),vec2(-.4,-.15+tl))-.01);
  float dW=rb(p-c,vec2(.6,.35),.04);
  fill(mix(hc,mix(fc,vec3(.13,.14,.16),m),kI),mix(hd,mix(dF,dW,m),kI));
  float A=dd*(1.-m);
  fillA(W,ci(q-vec2(.2,.04),.034),A);fillA(K,ci(q-vec2(.21,.04),.015),A);
  fillA(vec3(.85,.4,.15),arc(q-vec2(.02,0.),.1,-PI*.3,PI*.3)-.008,A);
  vec2 w=p-c;
  fillA(vec3(.2,.21,.24),max(dW,.25-w.y),m);
  fillA(kb,rb(w-vec2(-.38,.3),vec2(.16,.032),.012),m);
  fillA(vec3(.3,.31,.35),rb(w-vec2(-.03,.3),vec2(.16,.032),.012),m);
  for(int i=0;i<4;i++){float fi=float(i),a=4.5+fi*.5,g=eo(a,a+.4),y=.13-.11*fi;      // a line per eighth note
    fillA(kb,sg(w,vec2(-.5,y),vec2(-.45,y))-.016,m*step(a,t));
    fillA(vec3(.7),sg(w,vec2(-.36,y),vec2(-.36+(.25+.45*h1(fi+2.))*g,y))-.016,m*step(a,t));}
  pulse(0.,.1,.66,vec3(0.,.48,1.));pulse(.3,.1,.5,vec3(0.,.48,1.));pulse(4.,.5,.66,kb);
  cap(0,.3,3.9);cap(2,4.1,7.5);
}` });

// 15 · go → rustup — whips in at speed; the gear ticks one tooth per beat
scene({ name: 'go', d: 8, hand: { d: 'ci(q-vec2(0.,.06),.26)', c: 'K' },
  texts: [{ s: 'GO', f: 'sans', w: 800, i: 1 }, T('R', 800),
    ...C('go', '官方 darwin-amd64 工具链，自包含零依赖'),
    ...C('rustup', '与 core 同名，卸掉 core 版后完整接管')],
  glsl: `
void scene(){
  vec3 cy=vec3(0.,.68,.85);
  float m=sn(4.),ko2=1.-sat(kO*2.5);
  vec2 c=vec2(.07*(1.-m),.06),q=p-c;
  float fb=fract(t),tick=floor(t)+1.-pow(1.-min(fb*2.,1.),3.);
  float an=atan(q.y,q.x)-tick*PI/6.;
  float dR=length(q)-(.245+.032*(1.-kO)*smoothstep(-.4,.4,sin(an*12.)));
  float d=mix(rb(q,vec2(.33,.19),.19),dR,m);
  if(fh)fill(mix(cy,K,m),d);else fill(K,mix(hd,d,k));
  text(0,c,.3,W,1.-sat(m*3.));
  for(int i=0;i<3;i++){float fi=float(i),y=.09-.09*fi,x=-.4-.03*fi;
    float l=(.2+.12*sin(t*PI*2.+fi*2.))*(1.+1.2*(1.-kI));
    fillA(cy,sg(q,vec2(x,y),vec2(x-l,y))-.017,1.-sat(m*3.));}
  strk(W,ci(q,.15),.022,m*ko2);text(1,c,.21,W,lin(4.2,4.5)*ko2);
  pulse(4.,.3,.66,K);
  cap(2,.3,3.9);cap(4,4.1,7.6);
}` });

// 16 · cmake → ninja → make — gear → triangle; the shuriken turns a quarter per beat; make builds one target per eighth
scene({ name: 'build', d: 12, hand: { d: 'rb(vec2(q.x-.18*clamp(floor(q.x/.18+.5),-2.,2.),q.y-.06),vec2(.07),.018)', c: 'K' },
  texts: [M('$ gmake -j8'), ...C('cmake', 'core 无 Intel 瓶，官方 universal 包秒装'),
    ...C('ninja', '官方 ninja-mac.zip，取 Intel 切片'),
    ...C('make', '装成 gmake，core 有瓶也照样镜像')],
  glsl: `
void scene(){
  vec3 blue=vec3(.02,.33,.66);
  float m1=sn(4.),m2=sn(8.),dd=fh?sat(kI*2.-1.):1.;
  vec2 c=vec2(0.,.06),q=p-c;
  float dT=tri(R(q,(1.-kI)*2.094),vec2(0.,.3),vec2(-.31,-.22),vec2(.31,-.22))-.014;
  float fb=fract(t),tick=floor(t)+1.-pow(1.-min(fb*1.6,1.),3.);
  float dN=star(R(q,-(tick-4.)*1.571*(1.-m2)),.34,4.,2.45);
  float ix=clamp(floor(q.x/.18+.5),-2.,2.);
  float dS=rb(vec2(q.x-ix*.18,q.y),vec2(.07),.018);
  float an=atan(q.y+.045,q.x);
  vec3 tc=(an>PI*.5||an<-PI*5./6.)?blue:(an>-PI/6.?vec3(.25,.68,.2):vec3(.86,.2,.18));
  float bt=step(ix+2.5,(t-8.)*2.+.5);
  float d=mix(mix(dT,dN,m1),dS,m2);
  vec3 col=mix(mix(tc,K,m1),mix(vec3(.72),K,bt),m2);
  if(fh)fill(mix(hc,col,kI),mix(hd,d,kI));else fill(col,d);
  fillA(vec3(.92),tri(q,vec2(0.,.07),vec2(-.1,-.1),vec2(.1,-.1)),dd*(1.-m1));
  cut(ci(q,.05),m1*(1.-m2));
  text(0,c+vec2(0.,.22),.085,vec3(.4),lin(8.2,8.5)*(1.-sat(kO*3.)));
  pulse(0.,.3,.66,blue);pulse(4.,.3,.66,K);pulse(8.,.3,.66,K);
  cap(1,.3,3.9);cap(3,4.1,7.9);cap(5,8.1,11.6);
}` });
