#!/usr/bin/env python3
"""Build mac/index.html from stage.html + build/manifest.json + build/scores.json.

Usage: python3 tools/build_site.py   (run inside mac/)
- Player: stage.html content wrapped in a responsive 16:9 scaler + rewritten
  chrome (top bar, chapter/replay/fullscreen controls, elapsed timer).
- Below the player: static ranking tables (4 cats + overall + fail lists)
  and a codex of all 88 entries (code lazy-fetched from build/ on click).
- stage.html is kept as the editable source; index.html is generated.
"""
import json, os, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAN = json.load(open(os.path.join(ROOT, 'build', 'manifest.json')))
SC = json.load(open(os.path.join(ROOT, 'build', 'scores.json')))
STAGE = open(os.path.join(ROOT, 'stage.html')).read()

CATS = [
    ('鹈鹕自行车', '鹈鹕骑自行车', 'SVG 2D 动画'),
    ('黑洞', '黑洞奇观', '单文件 WebGL'),
    ('自然景观', '体素自然景观', 'Three.js 3D'),
    ('中国古典建筑群场景', '体素古典建筑群', 'Three.js 3D'),
]
E = html.escape


def score(r):
    s = SC.get(r['id'], {})
    return s.get('s')


def is_fail(r):
    return (not r.get('page')) or bool(SC.get(r['id'], {}).get('fail'))


def fmt_t(s):
    if s is None:
        return '—'
    if s >= 60:
        return f"{int(s // 60)}m{int(round(s % 60))}s"
    return f"{round(s)}s"


def short(n):
    return n.replace('-mlx', '').replace('-gguf', '')


# ---------------- rankings ----------------
rank_html = []
for ci, (key, title, kind) in enumerate(CATS):
    rows = [r for r in MAN if r['cat'] == key]
    live = sorted([r for r in rows if not is_fail(r)],
                  key=lambda r: (-score(r), r['name']))
    dead = [r for r in rows if is_fail(r)]
    trs = []
    for i, r in enumerate(live):
        s = SC.get(r['id'], {})
        fx = [f for f in (r.get('fixes') or []) if 'charset' not in f]
        trs.append(
            f"<tr><td class=\"n\">{i + 1}</td><td class=\"m\">{E(short(r['name']))}</td>"
            f"<td class=\"c\">{E(r.get('model', ''))}</td>"
            f"<td class=\"c\">{r.get('tps') or '—'}</td>"
            f"<td class=\"c\">{r.get('tokens') or 0}</td>"
            f"<td class=\"c\">{fmt_t(r.get('total'))}</td>"
            f"<td class=\"c\">"+('轻修' if fx else '—')+"</td>"
            f"<td class=\"s\">{score(r):.1f}</td>"
            f"<td class=\"c2\">{E(s.get('c', ''))}</td></tr>")
    fails = ''.join(
        f"<li><b>{E(short(r['name']))}</b><span>{E(SC.get(r['id'], {}).get('fail') or '没有产出代码')}</span></li>"
        for r in dead)
    rank_html.append(
        f"<section class=\"rk\"><h3><span class=\"rn\">0{ci + 1}</span> {E(title)}"
        f"<small>{E(kind)} · {len(live)} 份有效 / {len(rows)} 份答卷</small></h3>"
        f"<table><thead><tr><th>#</th><th>模型配置</th><th>模型</th><th>tok/s</th>"
        f"<th>tokens</th><th>用时</th><th>修复</th><th>分数</th><th>点评</th></tr></thead>"
        f"<tbody>{''.join(trs)}</tbody></table>"
        + (f"<div class=\"fails\"><b>交白卷 {len(dead)}</b><ul>{fails}</ul></div>" if dead else '')
        + "</section>")

by = {}
for r in MAN:
    o = by.setdefault(r['name'], {'name': r['name'], 's': {}})
    o['s'][r['cat']] = max(o['s'].get(r['cat'], 0), score(r) or 0)
board = sorted(by.values(),
               key=lambda o: -sum(o['s'].get(k, 0) for k, _, _ in CATS))
orows = []
for i, o in enumerate(board):
    t = sum(o['s'].get(k, 0) for k, _, _ in CATS)
    tds = ''.join(f"<td class=\"c\">" + ('—' if o['s'].get(k) is None else f"{o['s'][k]:.1f}") + "</td>"
                  for k, _, _ in CATS)
    orows.append(
        f"<tr><td class=\"n\">{i + 1}</td><td class=\"m\">{E(short(o['name']))}</td>{tds}"
        f"<td class=\"s\">{t:.1f}</td></tr>")
rank_html.append(
    "<section class=\"rk\"><h3><span class=\"rn\">05</span> 总排行"
    "<small>四题相加满分 40 · 同一配置取最高</small></h3>"
    "<table><thead><tr><th>#</th><th>模型配置</th>"
    + ''.join(f"<th>{E(t)}</th>" for _, t, _ in CATS)
    + "<th>总分</th></tr></thead><tbody>" + ''.join(orows) + "</tbody></table></section>")

# ---------------- codex ----------------
codex_html = []
for key, title, _ in CATS:
    rows = sorted([r for r in MAN if r['cat'] == key],
                  key=lambda r: (-(score(r) or -1), r['name']))
    cards = []
    for r in rows:
        s = SC.get(r['id'], {})
        fail = is_fail(r)
        head = (f"<span class=\"fs\">交白卷 · {E(s.get('fail') or '没有产出代码')}</span>"
                if fail else f"<span class=\"sc2\">{score(r):.1f}<small>/10</small></span>")
        meta = ' · '.join(x for x in [
            E(r.get('model', '')),
            f"{r.get('tps')} tok/s" if r.get('tps') else None,
            f"{r.get('tokens') or 0} tokens",
            ('轻修：' + '、'.join(E(f) for f in r.get('fixes', []))) if r.get('fixes') else None,
        ] if x)
        ops = ''
        if r.get('page'):
            ops = (f"<button data-act=\"code\" data-page=\"{E(r['page'])}\">查看代码</button>"
                   f"<a href=\"{E(r['page'])}\" target=\"_blank\" rel=\"noopener\">运行</a>"
                   f"<button data-act=\"copy\" hidden>复制</button>")
        cmt = f"<div class=\"cm\">{E(s.get('c', ''))}</div>" if s.get('c') else ''
        cards.append(
            f"<div class=\"ce\" data-cat=\"{E(key)}\"><div class=\"ch\">"
            f"<b>{E(short(r['name']))}</b>{head}</div>"
            f"<div class=\"meta2\">{meta}</div>{cmt}"
            f"<div class=\"ops\">{ops}</div><pre class=\"cd\" hidden></pre></div>")
    codex_html.append(
        f"<h3 class=\"cxh\" data-cat=\"{E(key)}\">{E(title)}<small> {len(rows)} 份</small></h3>"
        f"<div class=\"cx\" data-cat=\"{E(key)}\">{''.join(cards)}</div>")

# ---------------- split stage.html ----------------
def scope_css(css):
    """Prefix every stage rule with '#screen ' so generic class names
    (.fails/.grid/.cell/...) can't leak onto page chrome. Keeps @keyframes intact."""
    out = []
    i, n = 0, len(css)
    while i < n:
        j = css.find('{', i)
        if j == -1:
            break
        sel = css[i:j].strip()
        # find matching closing brace (handle nested, e.g. @keyframes)
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
            parts = [p.strip() for p in sel.split(',') if p.strip()]
            fixed = []
            for p in parts:
                if p == ':root':
                    # vars must live on #screen (not global) so film palette
                    # doesn't leak onto page chrome
                    fixed.append('#screen')
                elif p in ('html', 'body', 'html,body'):
                    fixed.append('#screen')
                elif p.startswith('html') or p.startswith('body'):
                    fixed.append('#screen' + p[4:])
                else:
                    fixed.append('#screen ' + p)
            out.append(', '.join(fixed) + block)
        i = k + 1
    return ''.join(out)


css = scope_css(STAGE.split('<style>', 1)[1].split('</style>', 1)[0])
body = STAGE.split('</style>', 1)[1].split('<script>', 1)[0]
js = STAGE.split('<script>', 1)[1].rsplit('</script>', 1)[0]
# stage body = canvas#bg + #stage + canvas#fx (+ nothing else)
body_inner = body.replace('</head>', '').replace('<body>', '').replace('</body>', '').replace('</html>', '')
assert 'id="stage"' in body_inner

CHROME_CSS = """
:root{--bg:#11100E;--ink:#F5EAD5;--teal:#5CC7C0;--grey:#8C877C;--card:#1A1916;--line:#2a2824}
*{box-sizing:border-box}
html,body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 "PingFang SC","Hiragino Sans GB",system-ui,sans-serif}
.top{max-width:1180px;margin:0 auto;padding:20px 16px 0;display:flex;gap:12px;align-items:baseline;flex-wrap:wrap}
.top b{font-size:20px;letter-spacing:.06em}
.top span{color:var(--grey);font-size:13px}
.top nav{margin-left:auto;display:flex;gap:8px}
.top nav a{color:var(--teal);text-decoration:none;font-size:13px;border:1px solid var(--line);border-radius:8px;padding:4px 12px}
.wrap{max-width:1180px;margin:0 auto;padding:12px 16px 0}
#screenWrap{position:relative;width:100%;aspect-ratio:16/9;background:#000;border-radius:14px;overflow:hidden}
#screen{position:absolute;left:0;top:0;width:1920px;height:1080px;transform-origin:0 0}
#screen canvas.gl{position:absolute}
#ctrl{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:10px 0 0}
#ctrl button{background:none;border:1px solid var(--line);color:var(--ink);border-radius:8px;padding:5px 12px;font:inherit;font-size:13px;cursor:pointer}
#ctrl button.on{border-color:var(--teal);color:var(--teal)}
#ctrl button:hover{border-color:var(--teal)}
#clock{margin-left:auto;color:var(--grey);font-size:13px;font-variant-numeric:tabular-nums}
#doneTag{color:var(--teal);font-size:13px}
main{max-width:1180px;margin:0 auto;padding:8px 16px 60px}
main h2{font-size:22px;margin:40px 0 4px}
main h2 small{color:var(--grey);font-size:13px;font-weight:400;margin-left:10px}
.sub{color:var(--grey);font-size:13px;margin:0 0 16px}
.sub a{color:var(--teal)}
.rk{margin-bottom:28px}
.rk h3{font-size:18px;margin:24px 0 10px}
.rk h3 .rn{color:var(--teal);margin-right:8px}
.rk h3 small{color:var(--grey);font-size:12px;font-weight:400;margin-left:8px}
table{width:100%;border-collapse:collapse;font-size:13.5px}
th{color:var(--grey);font-weight:400;text-align:left;padding:6px 8px;border-bottom:1px solid var(--line);white-space:nowrap}
td{padding:7px 8px;border-bottom:1px solid var(--line);vertical-align:top}
td.n{color:var(--teal);white-space:nowrap}
td.m{font-weight:700;white-space:nowrap}
td.c{color:var(--grey);white-space:nowrap;font-size:12.5px}
td.s{font-weight:800;white-space:nowrap}
td.c2{color:var(--grey);font-size:12.5px}
.fails{margin-top:10px;font-size:13px}
.fails b{color:#ff9a5c}
.fails ul{list-style:none;margin:8px 0 0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:4px 24px}
.fails li b{color:var(--ink);margin-right:8px}
.fails li span{color:var(--grey)}
@media(max-width:800px){.fails ul{grid-template-columns:1fr}}
.cxh{font-size:18px;margin:26px 0 10px}
.cxh small{color:var(--grey);font-size:12px;font-weight:400}
.cx{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:10px}
.ce{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px 12px;min-width:0}
.ce .ch{display:flex;align-items:baseline;gap:8px}
.ce .ch b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sc2{margin-left:auto;color:var(--teal);font-weight:800;white-space:nowrap}
.sc2 small{color:var(--grey);font-weight:400}
.fs{margin-left:auto;color:#ff9a5c;font-size:12.5px}
.meta2{color:var(--grey);font-size:12px;margin-top:2px}
.cm{font-size:13px;margin-top:4px}
.ops{display:flex;gap:8px;margin-top:8px}
.ops button,.ops a{background:none;border:1px solid var(--line);color:var(--teal);border-radius:7px;padding:3px 12px;font:inherit;font-size:12.5px;cursor:pointer;text-decoration:none}
.cd{margin:8px 0 0;max-height:420px;overflow:auto;background:#0b0b0f;border:1px solid var(--line);border-radius:8px;padding:10px 12px;font:12.5px/1.6 ui-monospace,Menlo,monospace;white-space:pre-wrap;word-break:break-all}
#flt{width:100%;background:var(--card);border:1px solid var(--line);color:var(--ink);border-radius:8px;padding:8px 12px;font:inherit;font-size:14px;margin:0 0 12px}
.fbtns{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 4px}
.fbtns button{background:none;border:1px solid var(--line);color:var(--ink);border-radius:999px;padding:4px 14px;font:inherit;font-size:13px;cursor:pointer}
.fbtns button.on{border-color:var(--teal);color:var(--teal)}
footer{color:var(--grey);font-size:12.5px;margin-top:36px}
footer a{color:var(--teal)}
"""

CHROME_JS = """
(function(){
const wrap=document.getElementById('screenWrap'),scr=document.getElementById('screen');
function fit(){const w=wrap.clientWidth;scr.style.transform='scale('+(w/1920)+')';}
addEventListener('resize',fit);fit();
document.addEventListener('fullscreenchange',()=>setTimeout(fit,60));
// chapters
const q=new URLSearchParams(location.search);
const cur=q.get('cat')||'all';
document.querySelectorAll('#ctrl [data-cat]').forEach(b=>{
  if(b.dataset.cat===cur)b.classList.add('on');
  b.onclick=()=>{
    const u=new URL(location.href);
    if(b.dataset.cat==='all'){u.search='';}else{u.searchParams.set('skip','1');u.searchParams.set('cat',b.dataset.cat);}
    location.href=u.toString();
  };
});
document.getElementById('replay').onclick=()=>location.reload();
document.getElementById('fsbtn').onclick=()=>{
  if(document.fullscreenElement)document.exitFullscreen();
  else wrap.requestFullscreen().catch(()=>{});
};
addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT')return;
  if(e.key==='f'||e.key==='F')document.getElementById('fsbtn').click();
  else if(e.key==='r'||e.key==='R')location.reload();
  else if(['1','2','3','4'].includes(e.key))document.querySelector('#ctrl [data-cat="'+e.key+'"]').click();
});
// elapsed clock
const t0=Date.now(),el=document.getElementById('clock');
const tag=document.getElementById('doneTag');
const fmt=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
setInterval(()=>{
  if(window.__done){tag.textContent=' · 播放完毕';}
  else el.textContent='▶ '+fmt((Date.now()-t0)/1000);
},500);
// codex: filter + lazy code + copy
let F='all';
const fbtns=[...document.querySelectorAll('.fbtns button')];
const cards=[...document.querySelectorAll('.ce')];
const heads=[...document.querySelectorAll('.cxh')];
const grids=[...document.querySelectorAll('.cx')];
const flt=document.getElementById('flt');
function apply(){
  const k=flt.value.trim().toLowerCase();
  cards.forEach(c=>{
    const ok=(F==='all'||c.dataset.cat===F)&&(!k||c.textContent.toLowerCase().includes(k));
    c.style.display=ok?'':'none';
  });
  heads.forEach((h,i)=>{
    const vis=[...grids[i].children].some(c=>c.style.display!=='none');
    h.style.display=vis?'':'none';grids[i].style.display=vis?'':'none';
  });
}
fbtns.forEach(b=>b.onclick=()=>{fbtns.forEach(x=>x.classList.remove('on'));b.classList.add('on');F=b.dataset.f;apply();});
flt.oninput=apply;
document.querySelector('main').addEventListener('click',async e=>{
  const b=e.target.closest('button');if(!b)return;
  const card=b.closest('.ce');if(!card)return;
  const pre=card.querySelector('.cd');
  if(b.dataset.act==='code'){
    if(pre.hidden&&!pre.textContent){
      pre.textContent='加载中…';pre.hidden=false;
      try{const r=await fetch(b.dataset.page);pre.textContent=await r.text();}
      catch(err){pre.textContent='加载失败：'+err;}
      card.querySelector('[data-act="copy"]').hidden=false;
    }else{pre.hidden=!pre.hidden;}
    b.textContent=pre.hidden?'查看代码':'收起代码';
  }else if(b.dataset.act==='copy'){
    try{await navigator.clipboard.writeText(pre.textContent);b.textContent='已复制';setTimeout(()=>b.textContent='复制',1500);}
    catch(err){b.textContent='复制失败';}
  }
});
})();
"""

page = ("<!doctype html>\n<html lang=\"zh-CN\">\n<head>\n<meta charset=\"utf-8\">\n"
        "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n"
        "<link rel=\"icon\" href=\"data:,\">\n"
        "<title>16G Mac Mini测试 · 本地模型前端横评</title>\n"
        "<style>" + CHROME_CSS + "</style>\n<style>" + css + "</style>\n</head>\n<body>\n"
        "<header class=\"top\"><b>16G Mac Mini测试</b>"
        "<span>30 模型配置 × 4 道前端题 · 88 份答卷 · 浏览器实时渲染</span>"
        "<nav><a href=\"../\">← 返回</a></nav></header>\n"
        "<div class=\"wrap\"><div id=\"screenWrap\"><div id=\"screen\">"
        + body_inner
        + "</div></div>\n"
        "<div id=\"ctrl\">"
        "<button data-cat=\"all\">全部</button>"
        "<button data-cat=\"1\">01 鹈鹕骑车</button>"
        "<button data-cat=\"2\">02 黑洞</button>"
        "<button data-cat=\"3\">03 自然景观</button>"
        "<button data-cat=\"4\">04 古建筑群</button>"
        "<button id=\"replay\">↻ 重播</button>"
        "<button id=\"fsbtn\">⛶ 全屏</button>"
        "<span id=\"clock\">▶ 0:00</span><span id=\"doneTag\"></span>"
        "</div></div>\n"
        "<main>\n<h2>排名<small>分数 0–10：完成度 / 视觉 / 动效 / 贴题</small></h2>\n"
        + "\n".join(rank_html)
        + "\n<h2>全部参赛代码<small>88 份答卷 · 点「查看代码」在线加载源码，「运行」打开可运行页面</small></h2>\n"
        "<div class=\"fbtns\"><button data-f=\"all\" class=\"on\">全部</button>"
        + "".join(f"<button data-f=\"{E(k)}\">{E(t)}</button>" for k, t, _ in CATS)
        + "</div>\n<input id=\"flt\" placeholder=\"筛选模型名，如 gemma / qwen / 27b…\">\n"
        + "\n".join(codex_html)
        + "\n<footer>源码：<a href=\"https://github.com/Bemly/video/tree/main/mac\">"
        "github.com/Bemly/video/mac</a> · 答卷页内联了模型原始产出并做了最小可运行修复（橙色「轻修」标签注明）</footer>\n</main>\n"
        "<script>" + js + "</script>\n<script>" + CHROME_JS + "</script>\n</body>\n</html>\n")

open(os.path.join(ROOT, 'index.html'), 'w').write(page)
print('wrote index.html', len(page), 'bytes')
