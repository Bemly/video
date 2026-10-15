"""Pick the best take per line: ASR closeness to the Math语 text + fluency (no stray pauses).
usage: python3 select_takes.py asr.tsv lines_dir out_choice.json"""
import json, sys, os, re, difflib
import numpy as np, soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
script = {l['id']: l for l in json.load(open(os.path.join(HERE, 'script.json')))['lines']}
asr = {}
for row in open(sys.argv[1], encoding='utf-8'):
    parts = [p.strip() for p in row.split('\t')]
    if len(parts) >= 2 and parts[0].endswith('.wav'):
        asr[os.path.basename(parts[0])] = parts[1]

letters = lambda s: re.sub(r'[^a-z]', '', s.lower())


def pauses(path):
    x, sr = sf.read(path, dtype='float32')
    if x.ndim > 1: x = x.mean(1)
    hop = int(0.01 * sr)
    e = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2)) for i in range(0, len(x) - hop, hop)])
    on = e > max(0.01, 0.08 * e.max())
    idx = np.where(on)[0]
    if not len(idx): return 99, 0
    on = on[idx[0]:idx[-1] + 1]
    gaps, run = [], 0
    for v in on:
        if not v: run += 1
        else:
            if run: gaps.append(run)
            run = 0
    return sum(g >= 22 for g in gaps), (idx[-1] - idx[0]) / 100


choice, report = {}, []
for lid, ln in script.items():
    best = None
    tgt = letters(ln['say'])
    puncts = len(re.findall(r'[,:.]', ln['say'].rstrip('.')))
    for f in sorted(os.listdir(sys.argv[2])):
        m = re.match(r'l(\d+)_s(\d+)\.wav', f)
        if not m or int(m.group(1)) != lid: continue
        text = asr.get(f, '')
        sim = difflib.SequenceMatcher(None, letters(text), tgt).ratio()
        nonlatin = bool(re.search(r'[぀-ヿ一-鿿가-힯]', text))
        np_, dur = pauses(os.path.join(sys.argv[2], f))
        rate = dur / max(1, len(tgt))
        score = sim - 0.25 * nonlatin - 0.12 * max(0, np_ - puncts) - (0.3 if rate > 0.18 or rate < 0.045 else 0)
        report.append((lid, f, round(score, 3), round(sim, 2), np_, round(dur, 2), text))
        if best is None or score > best[0]: best = (score, int(m.group(2)))
    choice[str(lid)] = best[1]
for r in report: print(*r, sep='\t')
json.dump(choice, open(sys.argv[3], 'w'))
print(choice)
