#!/usr/bin/env python3
"""从 timeline.json + rec/*.mp4 生成 rec_index.js，供播放页按段取录屏片段。"""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(os.path.join(ROOT, 'timeline.json')))
RECT = {"full": [240, 118, 1440, 819], "side": [880, 150, 960, 800],
        "title": [560, 470, 800, 455], "outro": [1040, 300, 800, 455]}
SCENE_LAYOUT = {"rec": "full", "codec": "side", "tune": "side",
                "title": "title", "outro": "outro"}

idx = {}
for s in TL['segments']:
    lay = SCENE_LAYOUT.get(s['scene'])
    if not lay or not s.get('rec'):
        continue
    d = s['dur'] - (4.0 if s['scene'] == 'outro' else 0.15)
    share = d / len(s['rec'])
    clips = []
    for i in range(len(s['rec'])):
        fn = f"{s['id']}_{i}.mp4"
        assert os.path.exists(os.path.join(ROOT, 'rec', fn)), fn
        clips.append({"file": fn, "start": round(i * share, 3),
                      "dur": round(share, 3)})
    idx[s['id']] = {"rect": RECT[lay], "clips": clips}

open(os.path.join(ROOT, 'rec_index.js'), 'w').write(
    'window.REC_IDX=' + json.dumps(idx, ensure_ascii=False) + ';')
print(f"segs={len(idx)} clips={sum(len(v['clips']) for v in idx.values())}"
      f" -> rec_index.js")
