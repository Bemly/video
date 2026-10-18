#!/usr/bin/env python3
"""gemini/index.html 生成器：主视频 + 素材画廊（img/*.avif + clips/*.mp4）。"""
import os, html, urllib.parse

ROOT = os.path.dirname(os.path.abspath(__file__))

def files(sub, ext):
    d = os.path.join(ROOT, sub)
    if not os.path.isdir(d):
        return []
    return sorted(f for f in os.listdir(d) if f.endswith(ext))

imgs = files('img', '.avif')
clips = files('clips', '.mp4')

def url(sub, name):
    return sub + '/' + urllib.parse.quote(name)

img_cards = '\n'.join(
    f'<figure><img loading="lazy" decoding="async" src="{url("img", n)}" alt="{html.escape(n)}">'
    f'<figcaption>{html.escape(os.path.splitext(n)[0])}</figcaption></figure>'
    for n in imgs)
clip_cards = '\n'.join(
    f'<figure><video preload="none" controls playsinline src="{url("clips", n)}"></video>'
    f'<figcaption>{html.escape(os.path.splitext(n)[0])}</figcaption></figure>'
    for n in clips)

page = f"""<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>杂鱼手书 · AI 娘版</title>
<style>
:root{{--bg:#11100E;--ink:#F5EAD5;--teal:#5CC7C0;--grey:#8C877C;--card:#1A1916}}
body{{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 "PingFang SC","Hiragino Sans GB",system-ui,sans-serif}}
header{{max-width:1080px;margin:0 auto;padding:24px 16px 0;display:flex;gap:12px;align-items:baseline;flex-wrap:wrap}}
header b{{font-size:20px;letter-spacing:.1em}}
header span{{color:var(--grey);font-size:13px}}
header a{{color:var(--teal);text-decoration:none;margin-left:auto;font-size:13px}}
main{{max-width:1080px;margin:0 auto;padding:16px}}
video.hero{{width:100%;aspect-ratio:16/9;background:#000;border-radius:14px;display:block}}
p.meta{{color:var(--grey);font-size:13px}}
p.meta a{{color:var(--teal)}}
h2{{font-size:18px;margin:36px 0 4px}}
p.sub{{color:var(--grey);font-size:13px;margin:0 0 16px}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px}}
.grid figure{{margin:0;background:var(--card);border:1px solid #2a2824;border-radius:10px;overflow:hidden}}
.grid img{{width:100%;aspect-ratio:9/12;object-fit:cover;display:block;background:#000}}
.grid video{{width:100%;aspect-ratio:9/16;display:block;background:#000}}
.grid figcaption{{padding:6px 10px;font-size:12px;color:var(--grey);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}}
</style>
</head>
<body>
<header><b>杂鱼手书 · AI 娘版</b><span>3:27 · 1920×1080 · AV1</span><a href="../">← 返回</a></header>
<main>
<video class="hero" controls preload="metadata" poster="cover.jpg" playsinline>
<source src="video.mp4" type="video/mp4">
</video>
<p class="meta">原版手书翻拍 · Grok Imagine 图生视频 + Python 离线渲染（<code>制作/render2.py</code>）。成片 80MB H.264 → AV1 高压缩约 70% 档（31MB）。源码见 <a href="https://github.com/Bemly/video/tree/main/gemini">github.com/Bemly/video/gemini</a> · <a href="video.mp4" download>下载 mp4</a></p>
<h2>素材 · 生成图（{len(imgs)}）</h2>
<p class="sub">原 JPG 107MB → AVIF preset 0 + CRF 32（60% 档），懒加载。</p>
<div class="grid">
{img_cards}
</div>
<h2>素材 · 图生视频（{len(clips)}）</h2>
<p class="sub">原 62MB → AV1 preset 2 + CRF 35（70% 档），点播加载。</p>
<div class="grid">
{clip_cards}
</div>
</main>
</body>
</html>
"""
open(os.path.join(ROOT, 'index.html'), 'w').write(page)
print(f'imgs={len(imgs)} clips={len(clips)} -> index.html')
