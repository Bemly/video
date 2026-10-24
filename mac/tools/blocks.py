import json, os, re, glob, sys
SRC = os.path.expanduser('~/.lmstudio/conversations')
OUT = 'raw'
summary = {}
for f in sorted(glob.glob(SRC + '/*/*.conversation.json')):
    cat = f.split('/')[-2]; cid = os.path.basename(f).split('.')[0]
    text = open(f'{OUT}/{cat}/{cid}.txt').read()
    body = re.sub(r'<think>.*?(</think>|\Z)', '', text, flags=re.S)
    d = f'{OUT}/{cat}/{cid}'; os.makedirs(d, exist_ok=True)
    info = []
    for i, m in enumerate(re.finditer(r'```[ \t]*([\w+.-]*)[^\n]*\n(.*?)(?:```|\Z)', body, flags=re.S)):
        lang, code = m.group(1), m.group(2)
        pre = body[max(0, m.start() - 200):m.start()]
        hint = re.findall(r'([\w./-]+\.(?:html|js|jsx|ts|tsx|json|css|md))', pre)
        hint = hint[-1] if hint else ''
        fn = f'{i:02d}_{lang or "txt"}_{os.path.basename(hint) or "x"}'
        open(f'{d}/{fn}', 'w').write(code)
        info.append((fn, len(code)))
    summary[f'{cat}/{cid}'] = info
for k, v in summary.items():
    print(k, ' | '.join(f'{a}:{b}' for a, b in v))
