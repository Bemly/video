# 配音按时间轴放置 + 配乐闪避，输出 mix.wav
import json, subprocess, sys
tl = json.load(open("timeline.json")); T = tl["total"]
subprocess.run([sys.executable, "music.py", str(T + 1), "music.wav"], check=True)
inp, fc = [], []
beats = [b for s in tl["scenes"] for b in s["beats"].values()]
for i, b in enumerate(beats):
    inp += ["-i", b["audio"]]; ms = int(round(b["t0"] * 1000))
    fc.append(f"[{i}:a]aresample=48000,adelay={ms}|{ms}[a{i}]")
n = len(beats)
fc.append("".join(f"[a{i}]" for i in range(n)) + f"amix=inputs={n}:normalize=0:duration=longest,apad=whole_dur={T}[voice]")
fc.append("[voice]asplit=2[vm][vk]")
fc.append(f"[{n}:a]aresample=48000,volume=0.075[mus]")
fc.append("[mus][vk]sidechaincompress=threshold=0.02:ratio=4:attack=80:release=900[duck]")
fc.append("[vm][duck]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-16:TP=-1.5:LRA=11[out]")
subprocess.run(["ffmpeg", "-y", "-v", "error", *inp, "-i", "music.wav", "-filter_complex", ";".join(fc), "-map", "[out]", "-t", str(T), "-ar", "48000", "mix.wav"], check=True)
print("ok", T)
