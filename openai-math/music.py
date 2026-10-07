# -*- coding: utf-8 -*-
"""程序化生成的环境氛围配乐（无版权问题）：柔和和弦铺底 + 稀疏的五声音阶钟音。
用法: python music.py <秒数> <输出.wav>"""
import sys
import numpy as np
from scipy.signal import fftconvolve, butter, sosfilt
from scipy.io import wavfile

SR = 44100
dur = float(sys.argv[1])
out = sys.argv[2]
N = int(SR * dur)
t = np.arange(N) / SR
rng = np.random.default_rng(2026)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# A 小调：Am9 – Fmaj7 – Cmaj7 – G6，每个和弦 9 秒，3 秒交叉淡化
chords = [[45, 52, 60, 64, 71], [41, 48, 57, 64, 69], [48, 55, 59, 64, 71], [43, 50, 59, 62, 64]]
seg, xf = 9.0, 3.0
pad = np.zeros(N)
k = 0
start = 0.0
while start < dur:
    ch = chords[k % len(chords)]
    s0, s1 = int(start * SR), min(N, int((start + seg + xf) * SR))
    tt = t[s0:s1] - start
    L = tt[-1] if len(tt) else 0
    env = np.minimum(1, tt / xf) * np.minimum(1, np.maximum(0, (seg + xf - tt) / xf))
    env = np.sin(env * np.pi / 2) ** 2
    sig = np.zeros_like(tt)
    for j, m in enumerate(ch):
        f = hz(m)
        det = 1 + 0.0015 * (j - 2)
        ph = rng.uniform(0, 2 * np.pi)
        trem = 1 + 0.12 * np.sin(2 * np.pi * (0.07 + 0.02 * j) * tt + ph)
        v = (np.sin(2 * np.pi * f * det * tt + ph) + 0.25 * np.sin(4 * np.pi * f * tt + ph * 1.3)
             + 0.6 * np.sin(2 * np.pi * f / det * tt))
        sig += v * trem * (0.9 if m < 50 else 0.55)
    pad[s0:s1] += sig * env
    start += seg
    k += 1

# 轻微低通，柔化
sos = butter(2, 1800, "low", fs=SR, output="sos")
pad = sosfilt(sos, pad)

# 钟音：A 小调五声音阶高音区，稀疏随机
bells = np.zeros(N)
penta = [69, 72, 74, 76, 79, 81, 84, 86, 88]
tb = 2.0
while tb < dur - 4:
    m = rng.choice(penta)
    f = hz(m)
    s0 = int(tb * SR)
    L = int(4.0 * SR)
    tt = np.arange(min(L, N - s0)) / SR
    e = np.exp(-tt * 1.4) * np.minimum(1, tt / 0.01)
    bells[s0:s0 + len(tt)] += (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2.76 * f * tt) * np.exp(-tt * 3)) * e * 0.35
    tb += rng.uniform(2.5, 6.0)

dry = pad / np.max(np.abs(pad)) * 0.6 + bells / max(1e-9, np.max(np.abs(bells))) * 0.22

# 简单混响：指数衰减噪声脉冲响应
irL = int(3.0 * SR)
ir_t = np.arange(irL) / SR
irs = []
for ch_ in range(2):
    ir = rng.normal(size=irL) * np.exp(-ir_t * 2.2)
    ir = sosfilt(butter(1, 3500, "low", fs=SR, output="sos"), ir)
    ir /= np.sqrt(np.sum(ir ** 2))
    irs.append(ir)
wet = np.stack([fftconvolve(dry, ir)[:N] for ir in irs], axis=1)
stereo = np.stack([dry, dry], axis=1) * 0.55 + wet * 0.75

# 整体淡入淡出
fade = np.ones(N)
fi, fo = int(4 * SR), int(6 * SR)
fade[:fi] = np.linspace(0, 1, fi) ** 2
fade[-fo:] = np.linspace(1, 0, fo) ** 2
stereo *= fade[:, None]
stereo /= np.max(np.abs(stereo)) * 1.05
wavfile.write(out, SR, (stereo * 32767).astype(np.int16))
print("wrote", out, dur)
