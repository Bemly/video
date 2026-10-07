# 由 script.py 与 audio/*.json 生成 timeline.json（配音时间轴）
import json
from script import SCRIPT, ORDER
GAP_BEAT, GAP_SCENE, LEAD = 0.45, 1.6, 1.0
t = LEAD; scenes = []
for s in ORDER:
    sc = {"key": s, "start": t, "beats": {}}
    for k, text in SCRIPT[s]:
        m = json.load(open(f"audio/{s}_{k}.json"))
        sc["beats"][k] = {"t0": round(t, 3), "t1": round(t + m["dur"], 3), "audio": f"audio/{s}_{k}.mp3",
                          "sents": [[round(t + a, 3), round(t + b, 3), x] for a, b, x in m["sents"]]}
        t += m["dur"] + GAP_BEAT
    t += GAP_SCENE - GAP_BEAT
    sc["end"] = round(t, 3); scenes.append(sc)
json.dump({"total": round(t + 2.5, 3), "scenes": scenes}, open("timeline.json", "w"), ensure_ascii=False)
