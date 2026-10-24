#!/usr/bin/env python3
"""Build ternary/ online-rendered promo player from local 工程 sources.

Reads (local-only, not in repo):
  工程/index.html + root timeline.json + 工程/voice/*.mp3
Produces (in repo):
  index.html       player (style scoped, audio-clock driver)
  timeline.json    copy of root timeline.json
  audio/narration.m4a  TTS lines placed at line.start (built by build_narration.py)
Usage: python3 tools/build_site.py   (run inside ternary/)
"""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.environ.get('TERNARY_SRC', '/Volumes/\uf8ff/影片/三进制')

CHROME_CSS = """
:root{--bg:#11100E;--ink:#F5EAD5;--teal:#5CC7C0;--grey:#8C877C;--card:#1A1916;--line:#2a2824}
*{box-sizing:border-box}
html,body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 "PingFang SC","Hiragino Sans GB",system-ui,sans-serif}
.top{max-width:1180px;margin:0 auto;padding:20px 16px 0;display:flex;gap:12px;align-items:baseline;flex-wrap:wrap}
.top b{font-size:20px;letter-spacing:.04em}
.top span{color:var(--grey);font-size:13px}
.top nav{margin-left:auto;display:flex;gap:8px}
.top nav a{color:var(--teal);text-decoration:none;font-size:13px;border:1px solid var(--line);border-radius:8px;padding:4px 12px}
.top nav a:hover{border-color:var(--teal)}
.wrap{max-width:1180px;margin:0 auto;padding:12px 16px 40px}
#screenWrap{position:relative;width:100%;aspect-ratio:16/9;background:#000;border-radius:14px;overflow:hidden}
#screen{position:absolute;left:0;top:0;width:1920px;height:1080px;transform-origin:0 0}
#ui{padding:10px 2px 0}
#row{display:flex;align-items:center;gap:12px}
#row button{background:none;border:1px solid var(--line);color:var(--ink);border-radius:8px;padding:5px 14px;font:inherit;font-size:13px;cursor:pointer}
#row button:hover{border-color:var(--teal)}
#row button:disabled{opacity:.35;cursor:default}
#track{flex:1;height:6px;background:#1a2740;border-radius:3px;cursor:pointer;position:relative}
#fill{height:100%;width:0;background:var(--teal);border-radius:3px}
#time{font-variant-numeric:tabular-nums;color:var(--grey);min-width:130px;text-align:right;font-size:12px}
#start{position:absolute;inset:0;display:grid;place-items:center;background:rgba(0,0,0,.55);cursor:pointer;z-index:50}
#start[hidden]{display:none}
#start div{text-align:center;color:#fff}
#start i{display:block;width:84px;height:84px;margin:0 auto 26px;border-radius:50%;background:#5CC7C0;position:relative}
#start i::after{content:"";position:absolute;left:34px;top:27px;border:15px solid transparent;border-left:24px solid #fff;border-right:0}
#start b{display:block;font:600 26px system-ui;letter-spacing:.02em}
#start span{display:block;margin-top:10px;font-size:14px;color:#9fb3c8}
main{max-width:1180px;margin:0 auto;padding:8px 16px 60px;color:var(--grey);font-size:13.5px}
main a{color:var(--teal)}
"""


def scope_css(css):
    out, i, n = [], 0, len(css)
    while i < n:
        j = css.find('{', i)
        if j == -1:
            break
        sel = css[i:j].strip()
        depth, k = 0, j
        while k < n:
            if css[k] == '{':
                depth += 1
            elif css[k] == '}':
                depth -= 1
                if depth == 0:
                    break
            k += 1
        block = css[j:k + 1]
        if sel.startswith('@'):
            out.append(sel + block)
        else:
            fixed = []
            for p in [x.strip() for x in sel.split(',') if x.strip()]:
                if p == ':root':
                    fixed.append('#screen')
                elif p in ('html', 'body'):
                    fixed.append('#screen')
                elif p.startswith('html') or p.startswith('body'):
                    fixed.append('#screen' + p[4:])
                else:
                    fixed.append('#screen ' + p)
            out.append(', '.join(fixed) + block)
        i = k + 1
    return ''.join(out)


DRIVER = """
<script>
'use strict';
(async function(){
  const TL = await (await fetch('timeline.json')).json();
  const qs = new URLSearchParams(location.search);
  const N = TL.lines.length;
  const au = document.getElementById('au');
  const playBtn = document.getElementById('play');
  const trk = document.getElementById('track'), fill = document.getElementById('fill'), timeEl = document.getElementById('time');
  const wrap = document.getElementById('screenWrap'), scr = document.getElementById('screen');
  const startOv = document.getElementById('start');
  const T = TL.total;
  const fmt = s => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
  function fit(){scr.style.transform=`scale(${wrap.clientWidth/1920})`;}
  addEventListener('resize',fit);fit();
  document.addEventListener('fullscreenchange',()=>setTimeout(fit,60));
  let ticking=false;
  async function render(t){
    for(let i=0;i<200&&typeof window.renderAt!=='function';i++)await new Promise(r=>setTimeout(r,50));
    if(typeof window.renderAt!=='function'){console.warn('renderAt missing');return;}
    window.renderAt(Math.min(Math.max(t,0),T-0.05));
    fill.style.width=(100*Math.min(t,T)/T)+'%';
    timeEl.textContent=`${fmt(Math.min(t,T))} / ${fmt(T)}`;
    window.__ternaryReady=true;
  }
  render.seq=0;
  async function toggle(){
    if(au.paused){try{await au.play();}catch(e){}}else au.pause();
  }
  function setPlaying(p){
    playBtn.textContent=p?'\\u23f8':'\\u25b6';
    document.getElementById('ui').classList.toggle('playing',p);
    startOv.hidden=p;
  }
  playBtn.onclick=e=>{e.stopPropagation();toggle();};
  startOv.onclick=()=>toggle();
  au.onplay=()=>setPlaying(true);au.onpause=()=>setPlaying(false);
  au.onloadedmetadata=()=>{render(au.currentTime||0);playBtn.disabled=false;fit();
    if(qs.has('t')){const t=Math.min(parseFloat(qs.get('t'))||0,T-0.05);au.currentTime=t;render(t);setPlaying(false);startOv.hidden=true;}};
  au.ontimeupdate=()=>{if(!ticking){ticking=true;requestAnimationFrame(()=>{ticking=false;render(au.currentTime);});}};
  au.onended=()=>{setPlaying(false);startOv.hidden=false;};
  trk.onclick=e=>{const r=trk.getBoundingClientRect();au.currentTime=T*(e.clientX-r.left)/r.width;render(au.currentTime);};
  document.getElementById('fsbtn').onclick=e=>{e.stopPropagation();if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen().catch(()=>{});};
  addEventListener('keydown',e=>{
    if(e.code==='Space'){e.preventDefault();toggle();}
    else if(e.key==='ArrowRight'){au.currentTime=Math.min(T-0.1,au.currentTime+5);render(au.currentTime);}
    else if(e.key==='ArrowLeft'){au.currentTime=Math.max(0,au.currentTime-5);render(au.currentTime);}
    else if(e.key==='r'||e.key==='R'){au.currentTime=0;au.play();}
    else if(e.key==='f'||e.key==='F'){if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen().catch(()=>{});}
  });
  await window.READY||true;
  render(0);playBtn.disabled=false;fit();
  if(qs.has('t')){const t=Math.min(parseFloat(qs.get('t'))||0,T-0.05);
    au.addEventListener('loadedmetadata',()=>{au.currentTime=t;},{once:true});
    render(t);startOv.hidden=true;}
  window.__ternary={render,seek:async t=>{await render(t);},au,T:()=>T};
})();
</script>
"""


def build():
    src = open(os.path.join(SRC, '工程/index.html')).read()
    css = scope_css(src.split('<style>', 1)[1].split('</style>', 1)[0])
    body = src.split('</style>', 1)[1]
    # body: </head><body>...<script>...</script></body></html>
    inner = body.split('<body>', 1)[1]
    inner = inner[:inner.rfind('</script>')]  # keep everything incl. driver; drop closing tag (added later)
    # strip original ?t/?play auto-run tail; keep renderAt/READY defs
    tail_markers = ["const q = new URLSearchParams(location.search);",
                    "const qs = new URLSearchParams(location.search);"]
    for m in tail_markers:
        if m in inner:
            inner = inner[:inner.find(m)]
            break
    page = ('<!doctype html>\n<html lang="zh-CN">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width,initial-scale=1">\n'
            '<link rel="icon" href="data:,">\n<title>\u4e09\u8fdb\u5236\u5b8c\u5907 \u00b7 \u5ba3\u4f20\u7247</title>\n'
            '<style>' + CHROME_CSS + '</style>\n<style>' + css + '</style>\n</head>\n<body>\n'
            '<header class="top"><b>\u4e09\u8fdb\u5236\u5b8c\u5907</b>'
            '<span>\u5e73\u8861\u4e09\u8fdb\u5236\u8ba1\u7b97\u673a\u5ba3\u4f20\u7247 \u00b7 2:22 \u00b7 '
            '\u6d4f\u89c8\u5668\u5b9e\u65f6\u6e32\u67d3\uff08\u914d\u97f3\u7248\uff09</span>'
            '<nav><a href="../">\u2190 \u8fd4\u56de</a></nav></header>\n'
            '<div class="wrap"><div id="screenWrap"><div id="screen">'
            + inner + '</script>\n'
            + '</div>'
            + '<div id="start"><div><i></i><b>\u4e09\u8fdb\u5236\u5b8c\u5907</b>'
            '<span>\u70b9\u51fb\u64ad\u653e\uff08\u6709\u58f0\uff09</span></div></div>\n'
            + '</div>'
            '<div id="ui"><div id="row"><button id="play" disabled>\u25b6</button>'
            '<div id="track"><div id="fill"></div></div>'
            '<span id="time">0:00 / 2:22</span>'
            '<button id="fsbtn">\u26f6</button></div></div>\n'
            '</div>\n'
            '<audio id="au" src="audio/narration.m4a" preload="auto"></audio>\n'
            '<main style="max-width:1180px;margin:0 auto;padding:8px 16px 60px;color:#8C877C;font-size:13.5px">'
            '\u6e90\u7801\uff1a<a href="https://github.com/Bemly/video/tree/main/ternary">'
            'github.com/Bemly/video/ternary</a>'
            ' \u00b7 \u73a9\u6e38\u620f\u672c\u4f53\uff1a<a href="https://www.bilibili.com/toy/ternary">'
            'bilibili.com/toy/ternary</a></main>\n'
            '</body>\n' + DRIVER + '\n</html>\n')
    open(os.path.join(ROOT, 'index.html'), 'w').write(page)
    print('index.html', len(page))


if __name__ == '__main__':
    build()
