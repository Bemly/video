# Pull Fish voice lines, trim silence, lay them on a timeline, write timeline.json + build/voice.wav + build/mix.wav
import json, wave, subprocess, os, sys
import numpy as np
SR = 44100
os.makedirs("build/lines", exist_ok=True)
if "--pull" in sys.argv:
    subprocess.run("rsync -a --include='*_[0-9][0-9].wav' --include='*.txt' --include='report.json' --exclude='*' bemly@192.168.1.53:sinytra-tts/out/ build/lines/", shell=True, check=True)
sc = json.load(open("script.json"))
def load(p):
    with wave.open(p) as w:
        assert w.getframerate() == SR and w.getnchannels() == 1
        a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    env = np.convolve(np.abs(a), np.ones(441) / 441, "same")
    idx = np.where(env > 10 ** (-42 / 20))[0]
    s, e = max(0, idx[0] - int(.05 * SR)), min(len(a), idx[-1] + int(.12 * SR))
    return a[s:e]
t = 0.0; scenes = []; clips = []
LEAD, GAP, TAIL = .7, .32, 1.0
for si, s in enumerate(sc["scenes"]):
    start = t; t += 1.2 if si == 0 else LEAD
    lines = []
    for i, l in enumerate(s["lines"]):
        p = f"build/lines/{s['id']}_{i:02d}.wav"
        a = load(p) if os.path.exists(p) else np.zeros(int(len(l.get("tts", l["ja"])) / 7.5 * SR), np.float32)
        d = len(a) / SR
        lines.append({"start": round(t, 3), "end": round(t + d, 3), "ja": l["ja"], "zh": l["zh"]})
        clips.append((t, a)); t += d + GAP
    t += TAIL - GAP
    if s["id"] == "outro": t += 1.5
    scenes.append({"id": s["id"], "no": si, "title_ja": s["title_ja"], "title_zh": s["title_zh"], "doc": s.get("doc", ""), "start": round(start, 3), "end": round(t, 3), "lines": lines})
total = round(t, 3)
json.dump({"total": total, "scenes": scenes}, open("timeline.json", "w"), ensure_ascii=False, indent=1)
v = np.zeros(int(total * SR) + SR, np.float32)
for st, a in clips:
    i = int(st * SR); v[i:i + len(a)] += a
v = v[:int(total * SR)]
v *= .89 / max(1e-6, np.abs(v).max())
# soft synth pad underneath: slow Am–F–C–G, very quiet, ducked under speech
tt = np.arange(len(v)) / SR
chords = [[220, 261.63, 329.63], [174.61, 220, 261.63], [261.63, 329.63, 392], [196, 246.94, 293.66]]
pad = np.zeros_like(v); seg = 8.0
for ci in range(int(total // seg) + 1):
    m = (tt >= ci * seg) & (tt < (ci + 1) * seg + 2)
    x = tt[m] - ci * seg
    envl = np.clip(x / 2, 0, 1) * np.clip((seg + 2 - x) / 2, 0, 1)
    for f in chords[ci % 4]:
        pad[m] += envl * (np.sin(2 * np.pi * f * tt[m]) + .3 * np.sin(2 * np.pi * f * 2.003 * tt[m])) / 3
speech = np.convolve(np.abs(v), np.ones(SR // 5) / (SR // 5), "same")
duck = 1 - .6 * np.clip(speech / .05, 0, 1)
fade = np.clip(tt / 3, 0, 1) * np.clip((total - tt) / 3, 0, 1)
mix = v + pad * duck * fade * .035
mix *= .95 / np.abs(mix).max()
def save(p, a):
    with wave.open(p, "w") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((a * 32767).astype(np.int16).tobytes())
save("build/voice.wav", v); save("build/mix.wav", mix)
print(f"total {total:.1f}s, {len(clips)} lines")
