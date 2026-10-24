#!/usr/bin/env python3
"""Build /uefi online-rendered players from local 工程 sources.

Reads (local-only, not in repo):
  工程/web/{index.html,timeline.js}        -> uefi/intro/
  工程2/web/{index.html,timeline.js,shaders_v1.js} -> uefi/detail/
Changes vs sources:
- intro: drops the ?play(audio ../out/mix.m4a) driver (file doesn't exist),
  adds rAF-clock driver + player chrome. ?t= kept.
- detail: appends the same driver; loadFrame() becomes fail-safe so clip
  blocks degrade to background+subtitles+note when frames/ isn't uploaded.
Usage: python3 tools/build_site.py   (run inside uefi/)
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.environ.get('UEFILM_SRC', '/Volumes/\uf8ff/影片/uefi播放器')

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
#screen canvas{position:absolute;left:0;top:0}
#bar{display:flex;gap:10px;align-items:center;padding:10px 2px 0;flex-wrap:wrap}
#bar button{background:none;border:1px solid var(--line);color:var(--ink);border-radius:8px;padding:5px 14px;font:inherit;font-size:13px;cursor:pointer}
#bar button:hover{border-color:var(--teal)}
#track{flex:1;height:6px;background:#1a2740;border-radius:3px;cursor:pointer;position:relative;min-width:120px}
#fill{height:100%;width:0;background:var(--teal);border-radius:3px}
#clock{color:var(--grey);font-size:13px;font-variant-numeric:tabular-nums;min-width:130px;text-align:right}
#start{position:absolute;inset:0;display:grid;place-items:center;background:rgba(0,0,0,.55);cursor:pointer;z-index:5}
#start[hidden]{display:none}
#start div{text-align:center;color:#fff}
#start i{display:block;width:84px;height:84px;margin:0 auto 26px;border-radius:50%;background:#5CC7C0;position:relative}
#start i::after{content:"";position:absolute;left:34px;top:27px;border:15px solid transparent;border-left:24px solid #fff;border-right:0}
#start b{display:block;font:600 26px system-ui}
#start span{display:block;margin-top:10px;font-size:14px;color:#9fb3c8}
"""

DRIVER_TMPL = """<script>
'use strict';
(function(){
const TOTAL={total}, TITLE='{title}';
const wrap=document.getElementById('screenWrap'),scr=document.getElementById('screen');
function fit(){scr.style.transform='scale('+(wrap.clientWidth/1920)+')';}
addEventListener('resize',fit);fit();
document.addEventListener('fullscreenchange',()=>setTimeout(fit,60));
const btn=document.getElementById('play'),trk=document.getElementById('track'),
      fil=document.getElementById('fill'),clk=document.getElementById('clock'),
      ov=document.getElementById('start'),fsb=document.getElementById('fsbtn');
const qs=new URLSearchParams(location.search);
const fmt=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
const paint=t=>{fil.style.width=(100*t/TOTAL)+'%';clk.textContent=fmt(t)+' / '+fmt(TOTAL);};
let base=0,playing=false,raf=0,gen=0,ended=false,t0=0;
async function draw(t){try{await window.renderAt(Math.min(t,TOTAL-0.05));}catch(e){}paint(Math.min(t,TOTAL));}
function loop(now){
  if(!playing)return;
  const t=base+(now-t0)/1000;
  if(t>=TOTAL){stop();ended=true;btn.textContent='\\u21bb';ov.hidden=false;
    ov.querySelector('b').textContent='\\u64ad\\u653e\\u5b8c\\u6bd5';return;}
  const g=++gen;
  Promise.resolve(draw(t)).then(()=>{if(playing&&g===gen)raf=requestAnimationFrame(loop);});
}
function play(){if(ended){ended=false;base=0;ov.querySelector('b').textContent=TITLE;}
  playing=true;ov.hidden=true;btn.textContent='\\u23f8';t0=performance.now();raf=requestAnimationFrame(loop);}
function stop(){playing=false;cancelAnimationFrame(raf);btn.textContent='\\u25b6';}
function cur(){return playing?base+(performance.now()-t0)/1000:base;}
btn.onclick=()=>{if(playing){base=cur();stop();}else play();};
ov.onclick=btn.onclick;
trk.onclick=e=>{const r=trk.getBoundingClientRect();base=TOTAL*(e.clientX-r.left)/r.width;
  if(base>=TOTAL)base=TOTAL-0.05;ended=false;ov.querySelector('b').textContent=TITLE;
  if(playing)t0=performance.now();else draw(base);};
fsb.onclick=()=>{if(document.fullscreenElement)document.exitFullscreen();else wrap.requestFullscreen().catch(()=>{});};
addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT')return;
  if(e.code==='Space'){e.preventDefault();btn.onclick();}
  else if(e.key==='ArrowRight'){base=Math.min(TOTAL-0.05,cur()+5);if(playing)t0=performance.now();else draw(base);}
  else if(e.key==='ArrowLeft'){base=Math.max(0,cur()-5);if(playing)t0=performance.now();else draw(base);}
  else if(e.key==='f'||e.key==='F')fsb.onclick();
  else if(e.key==='r'||e.key==='R'){base=0;ended=false;ov.querySelector('b').textContent=TITLE;if(playing)t0=performance.now();else draw(0);}
});
if(qs.has('t')){base=Math.min(parseFloat(qs.get('t'))||0,TOTAL-0.05);ov.hidden=true;draw(base);}
else draw(0);
window.__uefi={seek:t=>{base=t;draw(t);}};
})();
</script>
"""

# detail fail-safe additions (same inline <script> scope as loadFrame)
MISSING_JS = """
const MISSING={};
async function loadFrameSafe(path){
  if(MISSING[path])throw new Error('missing-frame');
  try{await _loadFrameRaw(path);}catch(e){MISSING[path]=true;throw e;}
}
function missingNote(b){
  X.save();X.textBaseline='middle';X.textAlign='center';
  X.fillStyle='rgba(0,0,0,0.55)';X.fillRect(360,470,1200,140);
  X.fillStyle='#7fe7ff';X.font='700 44px "PingFang SC",system-ui,sans-serif';
  X.fillText('\\u5b9e\\u673a\\u5f55\\u50cf\\u7d20\\u6750\\u672a\\u6536\\u5f55',960,520);
  X.font='400 28px "PingFang SC",system-ui,sans-serif';X.fillStyle='#8a8a90';
  X.fillText('(frames/ \\u672a\\u4e0a\\u4f20)',960,572);
  X.restore();
}
"""


def page_shell(title, sub, stage_inner, total, chrome_title):
    driver = DRIVER_TMPL.replace('{total}', repr(total)).replace('{title}', chrome_title)
    mm, ss = int(total // 60), int(round(total % 60))
    bar = ('<div id="bar"><button id="play">\u25b6</button>'
           '<div id="track"><div id="fill"></div></div>'
           '<span id="clock">0:00 / %d:%02d</span>'
           '<button id="fsbtn">\u26f6</button></div></div>\n') % (mm, ss)
    return (
        '<!doctype html>\n<html lang="zh-CN">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width,initial-scale=1">\n'
        '<link rel="icon" href="data:,">\n<title>' + title + '</title>\n'
        '<style>' + CHROME_CSS + '</style>\n</head>\n<body>\n'
        '<header class="top"><b>' + chrome_title + '</b><span>' + sub + '</span>'
        '<nav><a href="../">\u2190 \u8fd4\u56de</a></nav></header>\n'
        '<div class="wrap"><div id="screenWrap"><div id="screen">'
        + stage_inner +
        '</div><div id="start"><div><i></i><b>' + chrome_title + '</b>'
        '<span>\u70b9\u51fb\u64ad\u653e\uff08\u65e0\u58f0\u5728\u7ebf\u6e32\u67d3\uff09</span>'
        '</div></div></div>\n' + bar +
        '</body>\n' + driver + '\n</html>\n')


def build_intro():
    d = os.path.join(ROOT, 'intro')
    os.makedirs(d, exist_ok=True)
    src = open(os.path.join(SRC, '工程/web/index.html')).read()
    open(os.path.join(d, 'timeline.js'), 'w').write(
        open(os.path.join(SRC, '工程/web/timeline.js')).read())
    idx = src.find('// \u9884\u89c8')
    assert idx > 0, 'intro driver marker not found'
    inner = src.split('<body>', 1)[1][:src.split('<body>', 1)[1].find('// \u9884\u89c8')]
    # inner = canvas + script-src + open inline script + render code (no closing tag)
    page = page_shell('UEFI Player \u00b7 \u4ecb\u7ecd',
                      '1:46 \u00b7 WebGL \u5728\u7ebf\u6e32\u67d3',
                      inner + '</script>\n', 106.102, 'UEFI Player \u00b7 \u4ecb\u7ecd')
    open(os.path.join(d, 'index.html'), 'w').write(page)
    print('intro', len(page))


def build_detail():
    d = os.path.join(ROOT, 'detail')
    os.makedirs(d, exist_ok=True)
    src = open(os.path.join(SRC, '工程2/web/index.html')).read()
    open(os.path.join(d, 'timeline.js'), 'w').write(
        open(os.path.join(SRC, '工程2/web/timeline.js')).read())
    open(os.path.join(d, 'shaders_v1.js'), 'w').write(
        open(os.path.join(SRC, '工程2/web/shaders_v1.js')).read())
    inner = src.split('<body>', 1)[1].rsplit('</script>', 1)[0]
    old = ("    const idx = clamp(Math.floor((L - part.off) * TLD.fps) + 1, 1, part.n);\n"
           "    await loadFrame(`frames/${part.dir}/${String(idx).padStart(5, '0')}.jpg`);\n"
           "    FR = clipLayout(part); fon = 1;\n"
           "    clipOverlay(b, t, 1);")
    assert old in inner, 'detail clip branch not found'
    inner = inner.replace(old,
        "    try{\n"
        "      const idx = clamp(Math.floor((L - part.off) * TLD.fps) + 1, 1, part.n);\n"
        "      await loadFrameSafe(`frames/${part.dir}/${String(idx).padStart(5, '0')}.jpg`);\n"
        "      FR = clipLayout(part); fon = 1;\n"
        "      clipOverlay(b, t, 1);\n"
        "    }catch(err){fon = 0;missingNote(b);}")
    assert 'async function loadFrame(path) {' in inner
    inner = inner.replace('async function loadFrame(path) {',
                          'async function _loadFrameRaw(path) {', 1)
    inner = inner + MISSING_JS + '</script>\n'
    page = page_shell('UEFI Player \u00b7 \u8be6\u89e3',
                      '12:00 \u00b7 WebGL+\u5b9e\u5f55 \u5728\u7ebf\u6e32\u67d3',
                      inner, 719.778, 'UEFI Player \u00b7 \u8be6\u89e3')
    open(os.path.join(d, 'index.html'), 'w').write(page)
    print('detail', len(page))


if __name__ == '__main__':
    build_intro()
    build_detail()
