import json, os, re, glob, sys
SRC = os.path.expanduser('~/.lmstudio/conversations')
OUT = sys.argv[1]
rows = []
for f in sorted(glob.glob(SRC + '/*/*.conversation.json')):
    cat = f.split('/')[-2]; cid = os.path.basename(f).split('.')[0]
    d = json.load(open(f))
    prompt = ''; text = ''; stats = {}; model = ''
    for m in d['messages']:
        v = m['versions'][m.get('currentlySelected', 0)]
        if v['role'] == 'user':
            prompt = ''.join(c.get('text', '') for c in v['content'])
        else:
            for s in v.get('steps', []):
                if s.get('genInfo'):
                    gi = s['genInfo']; stats = gi.get('stats') or stats; model = gi.get('indexedModelIdentifier') or model
                if s.get('type') != 'contentBlock' or s.get('style', {}).get('type') == 'thinking':
                    continue
                for c in s.get('content', []):
                    if c.get('type') == 'text':
                        text += c['text']
            if v.get('genInfo'):
                gi = v['genInfo']; stats = gi.get('stats', stats); model = gi.get('indexedModelIdentifier', model)
    model = model or d.get('lastUsedModel', {}).get('indexedModelIdentifier', d['name'])
    body = re.sub(r'<think>.*?(</think>|\Z)', '', text, flags=re.S)
    blocks = re.findall(r'```[ \t]*([\w+-]*)[^\n]*\n(.*?)(?:```|\Z)', body, flags=re.S)
    code = ''; lang = ''
    for l, b in blocks:
        if len(b) > len(code): code, lang = b, l
    if not code or '<' not in code:
        mm = re.search(r'(<!DOCTYPE html.*?(?:</html>|\Z)|<html.*?(?:</html>|\Z)|<svg.*?(?:</svg>|\Z))', body, flags=re.S | re.I)
        if mm: code = mm.group(1); lang = 'html'
    truncated = bool(code) and not re.search(r'</html>|</svg>', code, re.I)
    os.makedirs(os.path.join(OUT, cat), exist_ok=True)
    fn = ''
    if code:
        ext = 'svg' if code.lstrip().lower().startswith('<svg') else 'html'
        fn = f'{cat}/{cid}.{ext}'
        open(os.path.join(OUT, fn), 'w').write(code)
    open(os.path.join(OUT, cat, cid + '.txt'), 'w').write(text)
    rows.append(dict(cat=cat, id=cid, name=d['name'] or (d.get('lastUsedModel') or {}).get('identifier') or '', model=model, file=fn, lang=lang, codelen=len(code), textlen=len(text),
                     truncated=truncated, stop=stats.get('stopReason'), tps=round(stats.get('tokensPerSecond') or 0, 1),
                     ttft=stats.get('timeToFirstTokenSec'), tokens=stats.get('predictedTokensCount'), total=stats.get('totalTimeSec'),
                     prompt=prompt))
json.dump(rows, open(os.path.join(OUT, 'index.json'), 'w'), ensure_ascii=False, indent=1)
for r in rows: print(r['cat'], r['id'], r['name'][:28].ljust(28), (r['model'] or '')[-40:].ljust(40), r['codelen'], 'TRUNC' if r['truncated'] else '', r['stop'], r['tps'], r['tokens'])
