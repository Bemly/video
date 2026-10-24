#!/usr/bin/env python3
"""组装 duowan/index.html：复用 build2/web/index.html 渲染代码，仅替换数据源与播放驱动。"""
import re

SRC = '/Volumes/\uf8ff/影片/魔丸/build2/web/index.html'
DST = '/Volumes/\uf8ff/Projects/video/duowan/index.html'
src = open(SRC).read()

# 1) GL 初始化段（const W=... 到 ovTex 定义），原样保留
m = re.search(r'(const W=1600,H=1200,TL=window\.TL;.*?const vidTex=mkTex\(\),ovTex=mkTex\(\);\n)', src, re.S)
gl_setup = m.group(1)

# 2) 2D  helpers + 字幕 + cue（// ---------- MC 风格 到 const L=...行）
m = re.search(r'(// ---------- MC \u98ce\u683c 2D ----------.*?const L=id=>TL\.lines\.find\(x=>x\.id===id\);\n)', src, re.S)
helpers = m.group(1)

# 3) OVER / VERS / versions（const OVER= 到 for(const id of VLINES)...行）
m = re.search(r'(const OVER=\{.*?for\(const id of VLINES\)OVER\[id\]=\(t,l\)=>versions\(t\);\n)', src, re.S)
over = m.group(1)

# 4) renderAt 函数体中 overlay/shader 部分（从 ctx.setTransform... 到 return s.id;）
m = re.search(r'( ctx\.setTransform\(1,0,0,1,0,0\);.*? return s\.id;\n\})', src, re.S)
overlay = m.group(1)

head = '''<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>魔玩我的世界盒子 · 介绍</title>
<style>
  html,body{margin:0;height:100%;background:#000;overflow:hidden;color:#e8ecf3;font:14px "PingFang SC","Hiragino Sans GB",system-ui,sans-serif}
  #wrap{position:fixed;inset:0;display:flex;flex-direction:column}
  #top{display:flex;gap:12px;align-items:center;flex-wrap:wrap;padding:12px 16px 4px}
  #top b{letter-spacing:.1em}#status{color:#8a91a0}#top a{color:#5CC7C0;text-decoration:none}
  #note{color:#5a6272;font-size:12px}
  #stage{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;position:relative}
  #viewport{width:1600px;height:1200px;position:relative;flex:none;transform-origin:center center;background:#000;overflow:hidden}
  #gl{width:1600px;height:1200px;display:block}
  #ui{padding:10px 16px 14px;background:linear-gradient(transparent,rgba(0,0,0,.85));transition:opacity .4s}
  #ui.playing{opacity:0}#ui.playing:hover{opacity:1}
  #row{display:flex;align-items:center;gap:12px}
  button{background:none;border:1px solid #5CC7C0;color:#5CC7C0;border-radius:8px;padding:6px 12px;font:inherit;cursor:pointer}
  button:disabled{opacity:.35;cursor:default}
  #bar{flex:1;height:6px;background:#1a2740;border-radius:3px;cursor:pointer;position:relative}
  #fill{height:100%;width:0;background:#5CC7C0;border-radius:3px}
  #time{font-variant-numeric:tabular-nums;color:#7fa8ff;min-width:160px;text-align:right;font-size:12px}
  #start{position:absolute;inset:0;display:grid;place-items:center;background:rgba(0,0,0,.55);cursor:pointer;z-index:5}
  #start[hidden]{display:none}
  #start div{text-align:center;color:#fff}
  #start i{display:block;width:84px;height:84px;margin:0 auto 26px;border-radius:50%;background:#5CC7C0;position:relative}
  #start i::after{content:"";position:absolute;left:34px;top:27px;border:15px solid transparent;border-left:24px solid #fff;border-right:0}
  #start b{display:block;font:600 26px system-ui;letter-spacing:.02em}
  #start span{display:block;margin-top:10px;font-size:14px;color:#9fb3c8}
</style>
</head>
<body>
<div id="wrap">
<div id="top"><b>魔玩我的世界盒子</b><span id="status">插件介绍 · 加载中…</span><span id="note">空格播放/暂停，←/→ 5 秒，R 重播，F 全屏（无声版，音效未入库）</span><a href="../">← 返回</a></div>
<div id="stage"><div id="viewport"><canvas id="gl" width="1600" height="1200"></canvas><div id="start"><div><i></i><b>魔玩我的世界盒子 · 介绍</b><span>44 镜 · 8:49 · 浏览器实时渲染 · 点击播放（无声）</span></div></div></div></div>
<div id="ui"><div id="row"><button id="play" disabled>▶</button><div id="bar"><div id="fill"></div></div><span id="time">0:00 / 0:00</span><button id="fsbtn">⛶</button></div></div>
</div>
<script src="timeline.js"></script>
<script>
"use strict";
'''

frames = '''// ---------- 素材帧（在线渲染：AV1 片段 + AVIF 静帧，音频未入库） ----------
// clips/{id}.mp4 = 该镜头所需段落（SVT-AV1 preset2 + CRF45 + fps15 无声 60% 档）
// stills/{n}.avif = 静帧（AVIF preset0 + CRF32 60% 档），timeline.js shots 里 src 为 img:{n}.ext
function shotAt(t){let s=TL.shots[0];for(const x of TL.shots)if(t>=x.start)s=x;return s;}
function lineAt(t){let s=null;for(const x of TL.lines)if(t>=x.start)s=x;return s;}
const stillCache={};
const clipV=document.createElement('video');
clipV.muted=true;clipV.playsInline=true;clipV.preload='auto';
let clipId=null;
function stillFor(s){
  const name=s.src.slice(4).split('.')[0]+'.avif';
  if(!stillCache[name])stillCache[name]=fetch('stills/'+name).then(r=>{if(!r.ok)throw new Error('no still '+name);return r.blob();}).then(b=>createImageBitmap(b));
  return stillCache[name];
}
function waitEv(el,ev,ms){return new Promise(res=>{const h=()=>{el.removeEventListener(ev,h);res();};el.addEventListener(ev,h);setTimeout(()=>{el.removeEventListener(ev,h);res();},ms);});}
async function frameFor(s,t){
  if(s.still)return stillCache[s.src.slice(4).split('.')[0]+'.avif']||stillFor(s);
  const off=Math.max(0,t-s.start);
  if(clipId!==s.id){clipId=s.id;clipV.src=`clips/${s.id}.mp4`;}
  if(clipV.readyState<1)await waitEv(clipV,'loadedmetadata',5000);
  if(playing){
    if(clipV.paused&&clipV.readyState>=1)clipV.play().catch(()=>{});
    if(clipV.readyState>=1&&Math.abs(clipV.currentTime-off)>0.4){try{clipV.currentTime=off;}catch(_){}}
  }else if(clipV.readyState>=1&&Math.abs(clipV.currentTime-off)>1/30){
    const p=waitEv(clipV,'seeked',1500);try{clipV.currentTime=off;}catch(_){}
    await p;
  }
  return clipV.readyState>=2?clipV:null;
}

'''

render = '''// ---------- 渲染 ----------
const PIXCUTS=TL.pixcuts||[];
async function renderAt(t){
 const s=shotAt(t),l=lineAt(t);
 const img=await frameFor(s,t);
 if(img){
  gl.bindTexture(gl.TEXTURE_2D,vidTex);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
  if(img.close)img.close();
 }
''' + overlay + '''

// ---------- 播放驱动（无声时钟） ----------
const qs=new URLSearchParams(location.search);
const T=TL.total,NS=TL.shots.length;
const status=document.getElementById('status');
const playBtn=document.getElementById('play');
const bar=document.getElementById('bar'),fill=document.getElementById('fill'),timeEl=document.getElementById('time');
const viewport=document.getElementById('viewport');
const startOv=document.getElementById('start');
const glc=document.getElementById('gl');
const fmt=s=>`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
let tCur=0,playing=false,lastTs=0,seq=0;
async function paint(){
  const my=++seq;
  const s=shotAt(tCur),l=lineAt(tCur);
  const id=await renderAt(tCur);
  if(my!==seq)return;
  status.textContent=`${id+1}/${NS} · ${l?l.id:''} · ${fmt(tCur)} / ${fmt(T)}`;
  fill.style.width=(100*tCur/Math.max(T,1e-6))+'%';
  timeEl.textContent=`${fmt(tCur)} / ${fmt(T)}`;
  window.__duowanReady=true;
}
function tick(ts){
  if(!playing)return;
  const dt=Math.min(0.25,(ts-lastTs)/1000);lastTs=ts;
  tCur+=dt;
  if(tCur>=T){tCur=T;setPlaying(false);startOv.hidden=false;paint();return;}
  paint();
  requestAnimationFrame(tick);
}
function setPlaying(p){
  playing=p;
  playBtn.textContent=p?'⏸':'▶';
  document.getElementById('ui').classList.toggle('playing',p);
  if(clipV){if(p){if(clipV.readyState>=1)clipV.play().catch(()=>{});}else if(!clipV.paused)clipV.pause();}
  if(p){lastTs=performance.now();requestAnimationFrame(tick);startOv.hidden=true;}
}
function toggle(){if(tCur>=T){tCur=0;}setPlaying(!playing);if(playing)paint();}
playBtn.onclick=e=>{e.stopPropagation();toggle();};
startOv.onclick=()=>toggle();
glc.onclick=()=>{if(playing)setPlaying(false);};
bar.onclick=e=>{const r=bar.getBoundingClientRect();tCur=Math.min(T,Math.max(0,(e.clientX-r.left)/r.width*T));paint();};
document.getElementById('fsbtn').onclick=e=>{e.stopPropagation();if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen().catch(()=>{});};
addEventListener('keydown',e=>{
  if(e.code==='Space'){e.preventDefault();toggle();}
  else if(e.key==='ArrowRight'){tCur=Math.min(T,tCur+5);paint();}
  else if(e.key==='ArrowLeft'){tCur=Math.max(0,tCur-5);paint();}
  else if(e.key==='r'||e.key==='R'){tCur=0;setPlaying(true);paint();}
  else if(e.key==='f'||e.key==='F'){if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen().catch(()=>{});}
});
function fit(){
  const r=document.getElementById('stage').getBoundingClientRect();
  const s=Math.min(r.width/1600,r.height/1200);
  viewport.style.transform=`scale(${s})`;
}
addEventListener('resize',fit);fit();
window.ready=(async()=>{await document.fonts.load('48px FP');return true;})();
window.ready.then(async()=>{
  playBtn.disabled=false;fit();
  if(qs.has('t')){
    tCur=Math.min(Math.max(parseFloat(qs.get('t')),0),T-0.001);
    await paint();setPlaying(false);startOv.hidden=true;
  }else{await paint();}
});
window.__duowan={seek:t=>{tCur=t;return paint();},render:renderAt,T:()=>T};
</script></body></html>
'''

out = head + gl_setup.replace("getElementById('c')", "getElementById('gl')") + frames + helpers + over + render
open(DST, 'w').write(out)
print('wrote', DST, len(out))
