import json, re, subprocess, sys, os
W = sys.argv[1]
P = f"{W}/proj"
S = json.load(open(f"{P}/script.json"))
LEAD, VOFF, PAD = 0.6, 0.35, 0.85

def dur(f):
    return float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f],
                                capture_output=True, text=True).stdout.strip())

def weight(s):
    w = 0.0
    for ch in s:
        if ch in "，、：": w += 2.2
        elif ch in "。！？；": w += 3.5
        elif re.match(r"[A-Za-z0-9.\-+/·λ=]", ch): w += 0.55
        elif ch.strip(): w += 1.0
    return max(w, 0.5)

def split_sentences(t):
    parts = re.findall(r"[^。！？；]+[。！？；]?", t)
    return [p for p in parts if p.strip()]

def split_sub(s, maxlen=24):
    s = s.strip()
    if len(s) <= maxlen: return [s]
    pieces = re.findall(r"[^，：、]+[，：、]?", s)
    out, cur = [], ""
    for p in pieces:
        if cur and len(cur) + len(p) > maxlen:
            out.append(cur); cur = p
        else:
            cur += p
    if cur: out.append(cur)
    res = []
    for o in out:
        while len(o) > maxlen + 6:
            res.append(o[:maxlen]); o = o[maxlen:]
        res.append(o)
    return res

def aligner(vf, vd):
    wf = vf.rsplit(".", 1)[0] + ".words.json"
    if not os.path.exists(wf): return lambda x: x
    words = [w for w in json.load(open(wf)) if w[2].strip()]
    if not words: return lambda x: x
    starts = [w[0] for w in words]
    gaps = [words[i+1][0] for i in range(len(words)-1) if words[i+1][0] - words[i][1] > 0.12]
    def snap(t_rel):  # t relative to voice start
        cand = [g for g in gaps if abs(g - t_rel) < 0.9]
        if not cand: return t_rel
        return min(cand, key=lambda g: abs(g - t_rel)) - 0.04
    return snap

segs, t = [], LEAD
for s in S["segments"]:
    vf = f"{P}/voice/{s['id']}.wav"
    vd = dur(vf) if os.path.exists(vf) else len(s["text"])/4.6
    d = VOFF + vd + PAD
    snap = aligner(vf, vd)
    sents = split_sentences(s["text"])
    tw = sum(weight(x) for x in sents)
    acc, sl, subs = VOFF, [], []
    for x in sents:
        sd = vd * weight(x) / tw
        b0 = VOFF + snap(acc - VOFF) if acc > VOFF else acc
        b1 = VOFF + snap(acc + sd - VOFF) if x != sents[-1] else acc + sd
        sl.append({"t0": round(b0, 3), "t1": round(b1, 3), "text": x})
        pcs = split_sub(x)
        pw = sum(weight(p) for p in pcs)
        a2 = acc
        for p in pcs:
            pd = sd * weight(p) / pw
            s0 = VOFF + snap(a2 - VOFF) if a2 > VOFF else a2
            subs.append({"t0": round(s0, 3), "t1": round(a2 + pd, 3), "text": p.rstrip("，。；：、")})
            a2 += pd
        acc += sd
    for i in range(len(subs) - 1): subs[i]["t1"] = round(max(subs[i]["t0"] + 0.3, subs[i+1]["t0"] - 0.02), 3)
    for i in range(len(sl) - 1): sl[i]["t1"] = sl[i+1]["t0"]
    seg = dict(s); seg.update({"start": round(t, 3), "dur": round(d, 3), "voice": vf, "vdur": vd, "sents": sl, "subs": subs})
    segs.append(seg); t += d

# silent references card at the end
segs.append({"id": "s36", "ch": "参考文献", "scene": "refs", "text": "", "start": round(t, 3), "dur": 9.0,
             "sents": [], "subs": [], "sfx": ["item/book/close_put1"]})
t += 9.0
TL = {"title": S["title"], "subtitle": S["subtitle"], "duration": round(t, 3), "segments": segs}
json.dump(TL, open(f"{P}/timeline.json", "w"), ensure_ascii=False, indent=1)
open(f"{P}/timeline.js", "w").write("window.TL=" + json.dumps(TL, ensure_ascii=False) + ";")
print("duration", round(t, 1), "segments", len(segs))
