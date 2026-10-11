#!/usr/bin/env python3
"""配音 + 时间轴 + 字幕生成（单一来源：src/script.json）。

产物：
  public/voice/<hash>.mp3      每句配音（按 文本+音色 哈希缓存，改哪句只重合成哪句）
  public/voice/timeline.json   帧级时间轴（Remotion 读取，决定每句/每场长度）
  public/sfx/*.wav             音效与 BGM（纯 Python 合成，无版权问题）
  out/winterjs-promo.srt       外挂字幕（B站可直接上传 CC 字幕）

依赖：pip install edge-tts mutagen
"""
import asyncio
import hashlib
import json
import math
import os
import random
import struct
import sys
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "src" / "script.json"
VOICE_DIR = ROOT / "public" / "voice"
SFX_DIR = ROOT / "public" / "sfx"
OUT_DIR = ROOT / "out"

# 与 src/timeline.ts 的估算口径保持一致
FPS = 30
LINE_GAP = 0.28   # 句间停顿（秒）
SCENE_HEAD = 0.9  # 每场开头留给标题卡的时间
SCENE_TAIL = 0.6  # 每场结尾留白


def line_hash(cast, line):
    c = cast[line["who"]]
    key = "|".join([line.get("say", line["text"]), c["voice"], c["pitch"], c["rate"]])
    return hashlib.sha1(key.encode("utf-8")).hexdigest()[:16]


async def synth(text, voice, pitch, rate, path, retries=4):
    import edge_tts

    for attempt in range(retries):
        try:
            tts = edge_tts.Communicate(text, voice, pitch=pitch, rate=rate)
            tmp = path.with_suffix(".part")
            await tts.save(str(tmp))
            if tmp.stat().st_size < 1000:
                raise RuntimeError("empty audio")
            tmp.rename(path)
            return
        except Exception as e:  # 网络抖动重试
            if attempt == retries - 1:
                raise
            print(f"  retry {attempt + 1}: {e}", file=sys.stderr)
            await asyncio.sleep(2 ** attempt)


def duration(path):
    from mutagen.mp3 import MP3

    return MP3(str(path)).info.length


# ── 音效合成（16-bit mono 44.1kHz） ───────────────────────────────────────
SR = 44100


def write_wav(path, samples):
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(b"".join(struct.pack("<h", max(-32767, min(32767, int(s * 32767)))) for s in samples))


def sfx_pop():
    n = int(SR * 0.12)
    return [math.sin(2 * math.pi * (900 - 600 * i / n) * i / SR) * (1 - i / n) ** 2 * 0.8 for i in range(n)]


def sfx_ding():
    n = int(SR * 0.6)
    out = []
    for i in range(n):
        t = i / SR
        env = math.exp(-t * 6)
        out.append((math.sin(2 * math.pi * 1318.5 * t) * 0.5 + math.sin(2 * math.pi * 1975.5 * t) * 0.25) * env)
    return out


def sfx_whoosh():
    rnd = random.Random(7)
    n = int(SR * 0.35)
    out, prev = [], 0.0
    for i in range(n):
        x = i / n
        env = math.sin(math.pi * x) ** 2
        prev = prev * 0.85 + rnd.uniform(-1, 1) * 0.15  # 低通噪声
        out.append(prev * env * 1.6)
    return out


def sfx_type():
    rnd = random.Random(3)
    n = int(SR * 0.03)
    return [rnd.uniform(-1, 1) * (1 - i / n) ** 3 * 0.35 for i in range(n)]


def bgm_loop():
    """轻快的 8-bit 风循环（C–G–Am–F，120BPM，16 小节 ≈ 32 秒）。"""
    bpm, beats = 120, 64
    spb = 60 / bpm
    n = int(SR * spb * beats)
    chords = [(60, 64, 67), (55, 59, 62), (57, 60, 64), (53, 57, 60)]
    melody = [72, 74, 76, 79, 76, 74, 72, 67, 69, 72, 74, 76, 74, 72, 69, 67]
    hz = lambda m: 440 * 2 ** ((m - 69) / 12)
    out = [0.0] * n
    eighth = spb / 2
    for k in range(int(beats * 2)):
        start = int(k * eighth * SR)
        bar = (k // 8) % 4
        ch = chords[bar]
        note = ch[k % 3] - 12 if k % 2 == 0 else ch[(k // 2) % 3]
        f = hz(note)
        length = int(eighth * SR * 0.9)
        for i in range(length):
            if start + i >= n:
                break
            t = i / SR
            sq = 1.0 if math.sin(2 * math.pi * f * t) > 0 else -1.0
            out[start + i] += sq * 0.09 * math.exp(-t * 7)
        # 旋律每拍一个音
        if k % 2 == 0:
            m = melody[(k // 2) % len(melody)]
            fm = hz(m)
            ml = int(spb * SR * 0.8)
            for i in range(ml):
                if start + i >= n:
                    break
                t = i / SR
                tri = 2 * abs(2 * ((fm * t) % 1) - 1) - 1
                out[start + i] += tri * 0.12 * math.exp(-t * 3)
        # 底鼓：每拍
        if k % 2 == 0:
            for i in range(int(SR * 0.12)):
                if start + i >= n:
                    break
                t = i / SR
                out[start + i] += math.sin(2 * math.pi * (120 - 400 * t) * t) * math.exp(-t * 30) * 0.35
    peak = max(abs(s) for s in out) or 1
    return [s / peak * 0.8 for s in out]


def make_sfx():
    SFX_DIR.mkdir(parents=True, exist_ok=True)
    for name, fn in [("pop", sfx_pop), ("ding", sfx_ding), ("whoosh", sfx_whoosh), ("type", sfx_type), ("bgm", bgm_loop)]:
        p = SFX_DIR / f"{name}.wav"
        if not p.exists():
            write_wav(p, fn())
            print(f"sfx  {p.relative_to(ROOT)}")


def srt_time(sec):
    ms = int(round(sec * 1000))
    h, ms = divmod(ms, 3600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"


async def main():
    data = json.loads(SCRIPT.read_text("utf-8"))
    cast = data["cast"]
    VOICE_DIR.mkdir(parents=True, exist_ok=True)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    make_sfx()

    # 1) 合成（并发 4，缓存命中跳过）
    sem = asyncio.Semaphore(4)
    jobs = []
    for scene in data["scenes"]:
        for line in scene["lines"]:
            h = line_hash(cast, line)
            path = VOICE_DIR / f"{h}.mp3"
            if path.exists():
                continue
            c = cast[line["who"]]

            async def job(line=line, c=c, path=path):
                async with sem:
                    await synth(line.get("say", line["text"]), c["voice"], c["pitch"], c["rate"], path)
                    print(f"tts  {path.name}  {line['text'][:24]}")

            jobs.append(job())
    await asyncio.gather(*jobs)

    # 2) 时间轴（帧）
    t = 0
    scenes_out, srt = [], []
    idx = 1
    for scene in data["scenes"]:
        s_start = t
        cur = t + round(SCENE_HEAD * FPS)
        lines_out = []
        for line in scene["lines"]:
            h = line_hash(cast, line)
            d = duration(VOICE_DIR / f"{h}.mp3")
            frames = math.ceil(d * FPS)
            lines_out.append({"file": f"voice/{h}.mp3", "from": cur - s_start, "frames": frames})
            srt.append(f"{idx}\n{srt_time(cur / FPS)} --> {srt_time((cur + frames) / FPS)}\n"
                       f"{line['text']}\n")
            idx += 1
            cur += frames + round(LINE_GAP * FPS)
        cur += round(SCENE_TAIL * FPS)
        scenes_out.append({"id": scene["id"], "from": s_start, "frames": cur - s_start, "lines": lines_out})
        t = cur

    timeline = {"fps": FPS, "total": t, "scenes": scenes_out}
    (VOICE_DIR / "timeline.json").write_text(json.dumps(timeline, ensure_ascii=False, indent=1), "utf-8")
    (OUT_DIR / "winterjs-promo.srt").write_text("\n".join(srt), "utf-8")
    print(f"timeline: {t} frames = {t / FPS:.1f}s, {idx - 1} lines")


if __name__ == "__main__":
    asyncio.run(main())
