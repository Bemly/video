"""Assemble one runnable page per conversation into build/<cat>/<id>.html, with light generic fixes.
Per-conversation overrides live in tools/overrides.json: {id: {"html": path, "inline": {ref: path}, "note": str}}"""
import json, os, re, glob, shutil
WD = os.path.expanduser('~/.lmstudio/working-directories')
rows = json.load(open('raw/index.json'))
ov = json.load(open('tools/overrides.json')) if os.path.exists('tools/overrides.json') else {}
THREE = 'https://cdn.jsdelivr.net/npm/three@0.160.0'
IMPORTMAP = ('<script type="importmap">{"imports":{"three":"%s/build/three.module.js",'
             '"three/addons/":"%s/examples/jsm/","three/examples/jsm/":"%s/examples/jsm/",'
             '"three/examples/":"%s/examples/"}}</script>\n' % (THREE, THREE, THREE, THREE))
UMD = ('<script src="https://cdn.jsdelivr.net/npm/three@0.147.0/build/three.min.js"></script>\n'
       '<script src="https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/controls/OrbitControls.js"></script>\n')

def is_doc(s):
    return bool(re.search(r'<!doctype|<html|<body|<svg|<canvas|<script', s, re.I))

def fix_urls(html, fixes):
    h0 = html
    # examples/js & UMD builds were dropped after r148/r160 -> pin to 0.149.0
    html = re.sub(r'three@0\.(1[5-9]\d)[\d.]*/(build/three(\.min)?\.js|examples/js/)', r'three@0.147.0/\2', html)
    html = re.sub(r'(unpkg\.com|cdn\.jsdelivr\.net/npm)/three@0\.(\d+)\.\d+', lambda m: f'{m.group(1)}/three@0.{m.group(2)}.0', html)
    html = re.sub(r'three@0\.(1[6-9]\d)\.0/', 'three@0.160.0/', html)
    html = re.sub(r'https://cdnjs\.cloudflare\.com/ajax/libs/three\.js/r?(\d+)/(?:examples/js/controls/)?OrbitControls(\.min)?\.js',
                  r'https://cdn.jsdelivr.net/npm/three@0.\1.0/examples/js/controls/OrbitControls.js', html)
    html = re.sub(r'https://cdnjs\.cloudflare\.com/ajax/libs/three\.js/r?(1[5-9]\d)/three\.module(\.min)?\.js', THREE + '/build/three.module.js', html)
    html = re.sub(r'<script src="https://cdnjs\.cloudflare\.com/ajax/libs/three\.js/r?(\d+)/three(\.min)?\.js"></script>',
                  lambda m: f'<script src="https://cdn.jsdelivr.net/npm/three@0.{min(int(m.group(1)),147)}.0/build/three.min.js"></script>', html)
    html = re.sub(r'<script src="(https://[^"]*?)three@0\.(\d+)\.\d+/examples/jsm/controls/OrbitControls(\.min)?\.js"></script>',
                  lambda m: f'<script src="https://cdn.jsdelivr.net/npm/three@0.{min(int(m.group(2)),147)}.0/examples/js/controls/OrbitControls.js"></script>', html)
    if 'THREE.OrbitControls' in html and 'OrbitControls.js' not in html:
        m = re.search(r'three@0\.(\d+)\.\d+/build/three(\.min)?\.js"></script>', html)
        if m: html = html[:m.end()] + f'\n<script src="https://cdn.jsdelivr.net/npm/three@0.{min(int(m.group(1)),147)}.0/examples/js/controls/OrbitControls.js"></script>' + html[m.end():]
    if html != h0: fixes.append('修正失效 CDN 地址')
    return html

def inline_local(html, blocks, fixes):
    used = set()
    def find(name):
        b = os.path.basename(name)
        c = [k for k in blocks if k.endswith('_' + b)]
        if not c:
            ext = b.rsplit('.', 1)[-1]
            lang = {'js': ('js', 'javascript'), 'css': ('css',)}.get(ext, ())
            c = [k for k in blocks if k.split('_')[1] in lang and k not in used]
        if not c: return None
        k = max(c, key=lambda k: len(blocks[k])); used.add(k)
        return blocks[k]
    def js(m):
        src = m.group(2)
        if src.startswith('http') or src.startswith('//'): return m.group(0)
        code = find(src)
        if code is None: return ''
        fixes.append('内联 ' + os.path.basename(src))
        mod = 'module' if ('import ' in code or 'module' in m.group(1)) else 'text/javascript'
        return f'<script type="{mod}">\n{code}\n</script>'
    html = re.sub(r'<script([^>]*?)\ssrc=["\']([^"\']+)["\'][^>]*>\s*</script>', js, html)
    def css(m):
        href = m.group(1)
        if href.startswith('http'): return m.group(0)
        code = find(href)
        if code is None: return ''
        fixes.append('内联 ' + os.path.basename(href))
        return f'<style>\n{code}\n</style>'
    html = re.sub(r'<link[^>]*?href=["\']([^"\']+\.css)["\'][^>]*>', css, html)
    return html

def generic_fix(html, fixes):
    html = fix_urls(html, fixes)
    # inline scripts that use import must be modules
    def modfix(m):
        if 'type=' not in m.group(1) and re.search(r'^\s*import\s', m.group(2), re.M):
            fixes.append('script 改为 module'); return '<script type="module"' + m.group(1) + '>' + m.group(2) + '</script>'
        return m.group(0)
    html = re.sub(r'<script((?:(?!src=)[^>])*)>(.*?)</script>', modfix, html, flags=re.S)
    if (re.search(r"""from\s+['"]three(/[^'"]*)?['"]|import\(['"]three""", html) or re.search(r'type=["\']module', html) and 'three' in html.lower()) and 'importmap' not in html:
        html = re.sub(r'(<head[^>]*>)', r'\1\n' + IMPORTMAP, html, count=1, flags=re.I) if re.search('<head', html, re.I) else IMPORTMAP + html
        fixes.append('补 importmap')
    elif 'THREE.' in html and not re.search(r'three(\.min)?\.js|from\s+[\'"]three|three@|three/build|three\.module', html):
        html = re.sub(r'(<head[^>]*>)', r'\1\n' + UMD, html, count=1, flags=re.I) if re.search('<head', html, re.I) else UMD + html
        fixes.append('补 Three.js 引用')
    if not re.search(r'<meta charset', html, re.I):
        html = '<meta charset="utf-8">\n' + html
    return html

out = []
for r in rows:
    cat, cid = r['cat'], r['id']
    o = ov.get(cid, {})
    fixes = list(o.get('fixes', []))
    blocks = {os.path.basename(p): open(p).read() for p in sorted(glob.glob(f'raw/{cat}/{cid}/*'))}
    html = None
    if o.get('dir'):
        src = os.path.join(WD, o['dir'][3:])
        dst = f'build/{cat}/{cid}'
        shutil.rmtree(dst, ignore_errors=True); shutil.copytree(src, dst, ignore=shutil.ignore_patterns('node_modules'))
        for fn2, reps in o.get('filereplace', {}).items():
            t = open(f'{dst}/{fn2}').read()
            for a, b in reps: t = t.replace(a, b)
            open(f'{dst}/{fn2}', 'w').write(t)
        for a, b in o.get('rename', []): os.rename(f'{dst}/{a}', f'{dst}/{b}')
        entry = f"{dst}/{o.get('entry', 'index.html')}"
        h = open(entry).read().replace('src="/src/', 'src="./src/').replace("src='/src/", "src='./src/")
        for a, b in o.get('replace', []):
            h = h.replace(a, b)
        open(entry, 'w').write(generic_fix(h, fixes))
        out.append(dict(r, page=entry, fixes=fixes, status='ok', note=o.get('note', '')))
        continue
    if o.get('html'):
        p = o['html']
        p = os.path.join(WD, p[3:]) if p.startswith('wd:') else p
        html = open(p).read()
    elif o.get('none'):
        html = None
    else:
        cands = [(len(v), k) for k, v in blocks.items() if is_doc(v)]
        if cands:
            html = blocks[max(cands)[1]]
        elif r['file'] and is_doc(open('raw/' + r['file']).read()):
            html = open('raw/' + r['file']).read()
    for ref, p in o.get('inline', {}).items():
        p = os.path.join(WD, p[3:]) if p.startswith('wd:') else p
        js = open(p).read()
        pat = re.compile(r'<script([^>]*)src=["\']\.?/?%s["\']([^>]*)>\s*</script>' % re.escape(ref.lstrip('./')))
        html, n = pat.subn(lambda m: '<script type="module">\n' + js.replace('\\', '\\\\') + '\n</script>', html)
        if n == 0:
            html = html.replace('</body>', '<script type="module">\n' + js + '\n</script>\n</body>') if '</body>' in html else html + '\n<script type="module">\n' + js + '\n</script>'
    if html is not None and not o.get('raw'):
        html = inline_local(html, blocks, fixes)
    for a, b in o.get('replace', []):
        html = html.replace(a, b)
    status = 'none'
    fn = ''
    if html is not None:
        if o.get('raw'):
            pass
        else:
            html = generic_fix(html, fixes)
        os.makedirs(f'build/{cat}', exist_ok=True)
        fn = f'build/{cat}/{cid}.html'
        open(fn, 'w').write(html)
        status = 'ok'
    out.append(dict(r, page=fn, fixes=fixes, status=status, note=o.get('note', '')))
json.dump(out, open('build/manifest.json', 'w'), ensure_ascii=False, indent=1)
print(sum(1 for x in out if x['page']), 'pages /', len(out))
