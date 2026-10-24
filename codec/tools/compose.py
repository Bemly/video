"""Compose: recording clips overlay + voice + SFX + BGM -> final mp4, plus SRT."""
import json, os, subprocess, sys
W = sys.argv[1]; STEP = sys.argv[2] if len(sys.argv) > 2 else "all"
P = f"{W}/proj"; OUT = f"{P}/out"; os.makedirs(OUT, exist_ok=True)
TL = json.load(open(f"{P}/timeline.json"))
REC_SRC = "/Users/bemly/Desktop/录屏2026-10-23 16.28.38.mov"
SND = "/Volumes//Projects/default/mc-sounds/26.3-sounds-mp3"
FPS = 30
LAYOUT = {  # rect x,y,w,h ; crop of the 1886x1072 recording
  "full":  ((240, 118, 1440, 819), None),
  "side":  ((880, 150, 960, 800), (4, 36, 1160, 967)),
  "title": ((560, 470, 800, 455), None),
  "outro": ((1040, 300, 800, 455), None),
}
SCENE_LAYOUT = {"rec": "full", "codec": "side", "tune": "side", "title": "title", "outro": "outro"}
CUES = {
  "s01": [(3, "random/levelup", 0.5)],
  "s05": [(2, "block/amethyst/break1", 0.6)],
  "s06": [(2, "note/bell", 0.4)],
  "s10": [(1, "ui/loom/select_pattern2", 0.6)],
  "s20": [(i, "ui/loom/select_pattern3", 0.5) for i in (1, 2, 3, 4)],
  "s21": [(i, "ui/loom/select_pattern1", 0.45) for i in (1, 3, 4, 5)],
  "s27": [(1, "block/amethyst/shimmer", 0.6)],
  "s32": [(2, "random/orb", 0.5)],
  "s33": [(i, f"ui/cartography_table/drawmap{(i % 3) + 1}", 0.55) for i in (1, 2, 3, 4, 5)],
  "s34": [(i, "ui/toast/in", 0.6) for i in (1, 2, 3)],
}
def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: print(r.stderr[-3000:]); raise SystemExit(1)

def clips():
    jobs = []
    for s in TL["segments"]:
        lay = SCENE_LAYOUT.get(s["scene"])
        if not lay or not s.get("rec"): continue
        (x, y, w, h), crop = LAYOUT[lay]
        d = s["dur"] - (4.0 if s["scene"] == "outro" else 0.15); s["_d"] = d; ranges = s["rec"]; share = d / len(ranges)
        parts = []
        for i, (a, b) in enumerate(ranges):
            f = f"{OUT}/rec_{s['id']}_{i}.mp4"
            vf = (f"crop={crop[2]}:{crop[3]}:{crop[0]}:{crop[1]}," if crop else "") + f"scale={w}:{h}:flags=lanczos,fps={FPS},setsar=1"
            jobs.append(["ffmpeg", "-v", "error", "-y", "-ss", str(a), "-t", f"{share:.3f}", "-i", REC_SRC, "-an", "-vf", vf,
                         "-c:v", "libx264", "-crf", "14", "-preset", "fast", "-pix_fmt", "yuv444p", f])
            parts.append(f)
        s["_rec_parts"] = parts; s["_rec_rect"] = (x, y, w, h)
    from concurrent.futures import ThreadPoolExecutor
    with ThreadPoolExecutor(6) as ex: list(ex.map(run, jobs))
    for s in TL["segments"]:
        if "_rec_parts" not in s: continue
        lst = f"{OUT}/rec_{s['id']}.txt"; open(lst, "w").write("".join(f"file '{p}'\n" for p in s["_rec_parts"]))
        d = s["_d"]
        run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-vf",
             f"fade=in:st=0.1:d=0.5,fade=out:st={d-0.35:.3f}:d=0.35", "-c:v", "libx264", "-crf", "14", "-preset", "fast", "-pix_fmt", "yuv444p", f"{OUT}/rec_{s['id']}.mp4"])
    json.dump({s["id"]: s["_rec_rect"] for s in TL["segments"] if "_rec_rect" in s}, open(f"{OUT}/rec_rects.json", "w"))

def overlay():
    rects = json.load(open(f"{OUT}/rec_rects.json"))
    segs = {s["id"]: s for s in TL["segments"]}
    cmd = ["ffmpeg", "-v", "error", "-y", "-i", f"{OUT}/base.mp4"]
    fl, last = [], "0:v"
    for i, (sid, (x, y, w, h)) in enumerate(rects.items()):
        st = segs[sid]["start"]
        cmd += ["-i", f"{OUT}/rec_{sid}.mp4"]
        fl.append(f"[{i+1}:v]setpts=PTS-STARTPTS+{st:.3f}/TB[r{i}]")
        fl.append(f"[{last}][r{i}]overlay={x}:{y}:eof_action=pass:enable='between(t,{st:.3f},{st+segs[sid]['dur']-0.16:.3f})'[o{i}]")
        last = f"o{i}"
    cmd += ["-filter_complex", ";".join(fl), "-map", f"[{last}]", "-c:v", "libx264", "-preset", "medium", "-crf", "18",
            "-pix_fmt", "yuv420p", "-profile:v", "high", "-r", str(FPS), f"{OUT}/video.mp4"]
    run(cmd)

def audio():
    inputs, fl, labels = [], [], []
    def add(path, at, vol):
        k = inputs.count("-i"); inputs.extend(["-i", path])
        fl.append(f"[{k}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume={vol},adelay={int(at*1000)}|{int(at*1000)}[a{k}]")
        labels.append(f"[a{k}]")
    voice_labels = []
    for s in TL["segments"]:
        if s.get("voice"):
            add(s["voice"], s["start"] + 0.35, 1.0); voice_labels.append(labels.pop())
        for i, snd in enumerate(s.get("sfx", [])):
            add(f"{SND}/{snd}.mp3", s["start"] + 0.05 + i * 0.35, 0.45)
        for (si, snd, vol) in CUES.get(s["id"], []):
            if si < len(s.get("sents", [])):
                add(f"{SND}/{snd}.mp3", s["start"] + s["sents"][si]["t0"], vol)
    dur = TL["duration"]
    BGM = ["/Users/bemly/Music/网易云音乐/C418 - Minecraft.mp3", "/Users/bemly/Music/网易云音乐/C418 - Aria Math.mp3",
           "/Users/bemly/Music/网易云音乐/C418 - Strad.mp3",
           "/Volumes/音乐/Apple Music无损/歌手/Mili & 塞壬唱片-MSR/Mili & 塞壬唱片-MSR - Grown-Up's Paradise.m4a"]
    bl = []
    for i, b in enumerate(BGM):
        k = inputs.count("-i"); inputs += ["-i", b]
        fl.append(f"[{k}:a]aformat=sample_rates=48000:channel_layouts=stereo,loudnorm=I=-20:TP=-2,aresample=48000[m{i}]"); bl.append(f"m{i}")
    cur = bl[0]
    for i in range(1, len(bl)):
        fl.append(f"[{cur}][{bl[i]}]acrossfade=d=4:c1=tri:c2=tri[x{i}]"); cur = f"x{i}"
    fl.append(f"[{cur}]atrim=0:{dur:.3f},asetpts=PTS-STARTPTS,dynaudnorm=f=500:g=31:p=0.5:m=6:r=0.12,volume=0.55,afade=t=in:d=2,afade=t=out:st={dur-5:.3f}:d=5[bgm]")
    fl.append("".join(voice_labels) + f"amix=inputs={len(voice_labels)}:normalize=0,apad=whole_dur={dur:.3f},asplit=3[vo][sc][vstem]")
    fl.append("[bgm][sc]sidechaincompress=threshold=0.05:ratio=2.5:attack=80:release=900,asplit=2[bgmd][bgmstem]")
    fl.append("".join(labels) + f"[vo][bgmd]amix=inputs={len(labels)+2}:normalize=0,alimiter=limit=0.95,apad=whole_dur={dur:.3f}[mix]")
    run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(fl), "-map", "[mix]", "-t", f"{dur:.3f}", "-c:a", "pcm_s16le", f"{OUT}/mix.wav", "-map", "[vstem]", "-c:a", "pcm_s16le", f"{OUT}/voice_stem.wav", "-map", "[bgmstem]", "-c:a", "pcm_s16le", f"{OUT}/bgm_stem.wav"])
    run(["ffmpeg", "-v", "error", "-y", "-i", f"{OUT}/mix.wav", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "pcm_s16le", f"{OUT}/mix_norm.wav"])

def srt():
    def ts(x): h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60; return f"{h:02d}:{m:02d}:{int(s):02d},{int(round((s - int(s)) * 1000)) % 1000:03d}"
    n, lines = 1, []
    for s in TL["segments"]:
        for sub in s.get("subs", []):
            lines.append(f"{n}\n{ts(s['start']+sub['t0'])} --> {ts(s['start']+sub['t1'])}\n{sub['text']}\n"); n += 1
    open(f"{OUT}/subtitles.srt", "w").write("\n".join(lines))

def mux():
    run(["ffmpeg", "-v", "error", "-y", "-i", f"{OUT}/video.mp4", "-i", f"{OUT}/mix_norm.wav", "-map", "0:v", "-map", "1:a",
         "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", "-shortest", f"{OUT}/final.mp4"])

steps = {"clips": clips, "overlay": overlay, "audio": audio, "srt": srt, "mux": mux}
for k in (steps if STEP == "all" else STEP.split(",")):
    print("step", k, flush=True); steps[k]()
