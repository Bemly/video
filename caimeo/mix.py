"""Mix voice + tactile foley (wood on felt, paper, graphite) + room tone.
usage: python3 mix.py events.json out.wav"""
import json, sys, os
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 44100
ev = json.load(open(sys.argv[1]))
voice, _ = sf.read(os.path.join(HERE, 'voice.wav'), dtype='float32')
if voice.ndim > 1:
    voice = voice.mean(1)
tl = json.load(open(os.path.join(HERE, 'timeline.json')))
N = int(tl['duration'] * SR)
voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
rng = np.random.default_rng(7)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype='band', fs=SR, output='sos'), x)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, btype='low', fs=SR, output='sos'), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, btype='high', fs=SR, output='sos'), x)


def noise(n):
    return rng.standard_normal(n).astype(np.float32)


def modal(freqs, decays, gains, dur, k=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.zeros(n)
    for f, d, g in zip(freqs, decays, gains):
        f *= k * (1 + rng.uniform(-0.03, 0.03))
        s += g * np.sin(2 * np.pi * f * t + rng.uniform(0, 6.28)) * np.exp(-t / d)
    return s


def strike(n, hard=0.5, f=3000):
    # felt-softened impulse: short filtered noise burst
    x = noise(n) * np.exp(-np.arange(n) / SR / (0.0015 + 0.002 * (1 - hard)))
    return lp(x, f)


def wood_tap(k=1.0, hard=0.5, dur=0.25):
    """small wooden piece set down on felt: inharmonic body modes, quickly damped"""
    n = int(dur * SR)
    body = modal([410, 1090, 1980, 3150], [0.035, 0.018, 0.009, 0.005], [1, .5, .25, .12], dur, k)
    s = body * 0.6 + strike(n, hard) * 1.4
    return lp(s, 4500).astype(np.float32)


def felt_thump(k=1.0, dur=0.35):
    n = int(dur * SR)
    s = modal([120, 260, 610], [0.06, 0.03, 0.012], [1, .5, .2], dur, k) + lp(strike(n, 0.2), 900) * 2
    return lp(s, 1500).astype(np.float32)


def paper_slide(dur=0.45, bright=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.5
    grain = noise(n) * (0.6 + 0.4 * np.abs(lp(noise(n), 30) * 8).clip(0, 1))
    return (bp(grain, 900 * bright, 6000 * bright) * env).astype(np.float32)


def page_turn(dur=0.7):
    n = int(dur * SR); t = np.arange(n) / SR
    env = np.exp(-((t - dur * 0.45) / (dur * 0.22)) ** 2)
    flutter = 0.6 + 0.4 * np.sin(2 * np.pi * (14 + 10 * t) * t)
    s = bp(noise(n), 500, 7000) * env * flutter
    s += bp(noise(n), 200, 900) * env * 0.5
    snap = np.zeros(n); a = int(dur * 0.7 * SR); m = int(0.04 * SR)
    snap[a:a + m] = bp(noise(m), 1500, 8000) * np.exp(-np.arange(m) / SR / 0.006)
    return (s + snap * 0.6).astype(np.float32)


def pencil_tick(dur=0.05):
    n = int(dur * SR)
    return hp(noise(n) * np.exp(-np.arange(n) / SR / 0.004), 2500).astype(np.float32)


def pencil_scratch(dur=0.18):
    n = int(dur * SR); t = np.arange(n) / SR
    env = np.minimum(1, t / 0.01) * np.exp(-t / 0.07)
    stick = (rng.random(n) < 0.03).astype(float) * rng.uniform(.5, 1, n)
    return (hp(noise(n) * 0.5 + stick * 3, 2000) * env).astype(np.float32)


def biscuit_snap(dur=0.25):
    n = int(dur * SR); s = np.zeros(n)
    for _ in range(int(rng.integers(5, 9))):
        a = int(rng.uniform(0, 0.08) * SR); m = int(0.012 * SR)
        s[a:a + m] += bp(noise(m), 1200, 6500) * np.exp(-np.arange(m) / SR / 0.003) * rng.uniform(.4, 1)
    return (s + lp(strike(n, 0.7), 1800) * 0.5).astype(np.float32)


sfx = np.zeros(N, np.float32)


def add(sig, t, g):
    a = int(t * SR)
    if a < 0 or a >= N: return
    b = min(N, a + len(sig)); sfx[a:b] += sig[:b - a] * g


for e in ev:
    t, k = e['t'], e['k']
    if k == 'Kayles':  # pin topples onto felt: knock, then a small settling clatter
        add(wood_tap(rng.uniform(.9, 1.15), .6), t + 0.12, 0.5)
        add(wood_tap(rng.uniform(1.2, 1.4), .3, 0.15), t + 0.45, 0.22)
        add(wood_tap(rng.uniform(1.3, 1.5), .2, 0.12), t + 0.56, 0.1)
        add(paper_slide(0.3, 1.2), t + 0.42, 0.05)
    elif k == 'Wythoff':  # queen glides on felt and stops
        add(paper_slide(0.5, 0.7), t, 0.12)
        add(felt_thump(rng.uniform(1.0, 1.2)), t + 0.48, 0.45)
    elif k == 'Hackenbush':  # graphite cut, the branch drops away
        add(pencil_scratch(), t, 0.22)
        add(paper_slide(0.6, 0.6), t + 0.15, 0.06)
    elif k == 'Domineering':  # domino laid down
        add(wood_tap(rng.uniform(.62, .72), .7, 0.3), t + 0.05, 0.5)
        add(felt_thump(0.9), t + 0.05, 0.25)
    elif k == 'Chomp':
        add(biscuit_snap(), t, 0.35)
    elif k == 'win':
        add(felt_thump(0.8, 0.5), t, 0.35)
        add(page_turn(0.8), t + 1.0, 0.12)
    elif k == 'zero':
        add(felt_thump(0.7, 0.5), t, 0.3)
        add(pencil_tick(), t + 0.02, 0.1)
    elif k == 'scan':
        add(pencil_tick(), t, 0.12)
    elif k == 'tick':
        add(pencil_tick(0.04), t, 0.14)
        add(paper_slide(0.12, 1.4), t, 0.03)

# page turn on every scene change
for sc in tl['scenes'][1:]:
    add(page_turn(0.75), sc['start'] - 0.45, 0.1)

# room tone: soft paper/air bed, no notes
t = np.arange(N) / SR
bed = lp(noise(N), 1800, 1) * 0.5 + lp(noise(N), 300, 1)
bed *= 0.75 + 0.25 * np.sin(2 * np.pi * 0.05 * t)
bed = bed / (np.max(np.abs(bed)) + 1e-9) * 0.012
fade = np.minimum(1, t / 1.5) * np.minimum(1, (tl['duration'] - t) / 2.0)
bed *= fade

# small felt-lined room: short, dark reverb
ir_n = int(0.6 * SR)
ir = lp(noise(ir_n), 3500) * np.exp(-np.arange(ir_n) / SR / 0.12)
ir /= np.sqrt(np.sum(ir ** 2))
sfx_w = sfx + fftconvolve(sfx, ir)[:N] * 0.18
v_w = voice + fftconvolve(voice, ir)[:N] * 0.10

venv = np.convolve(np.abs(voice), np.ones(4410) / 4410, mode='same')
duck = 1 - 0.35 * np.clip(venv / 0.05, 0, 1)
mix = v_w * 0.95 + (sfx_w * 0.9) * duck + bed
mix /= max(1.0, np.max(np.abs(mix)) / 0.95)
sf.write(sys.argv[2], np.stack([mix, mix], 1), SR)
print('mixed', len(ev), 'events')
