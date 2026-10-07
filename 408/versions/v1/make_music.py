"""Procedural soundtrack for the 408 MV. 120 BPM, A minor, synced to the video frame timeline (60 fps)."""
import numpy as np
import soundfile as sf
from scipy import signal

SR = 48000
BEAT = 0.5
BAR = 2.0
TOTAL = 156.0
N = int(SR * (TOTAL + 0.2))
rng = np.random.default_rng(408)

ACT_START = [8, 23, 38, 53]  # bars
LOGO = 72
MONTAGE = 68


def fr(frame):
    return frame / 60.0


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def T(n):
    return np.arange(int(n * SR)) / SR


tracks = {k: np.zeros((N, 2)) for k in ['kick', 'drums', 'bass', 'pad', 'arp', 'lead', 'bell', 'fx', 'sfx']}
rev = np.zeros((N, 2))
dly = np.zeros((N, 2))


def place(track, t0, sig, gain=1.0, pan=0.0, rsend=0.0, dsend=0.0):
    if t0 < 0:
        cut = int(-t0 * SR)
        sig = sig[cut:]
        t0 = 0
    i0 = int(round(t0 * SR))
    if i0 >= N or len(sig) == 0:
        return
    if sig.ndim == 1:
        a = (pan + 1) * np.pi / 4
        sig = np.stack([sig * np.cos(a), sig * np.sin(a)], axis=1) * np.sqrt(2)
    n = min(len(sig), N - i0)
    s = sig[:n] * gain
    tracks[track][i0:i0 + n] += s
    if rsend:
        rev[i0:i0 + n] += s * rsend
    if dsend:
        dly[i0:i0 + n] += s * dsend


def sos_lp(fc, order=2):
    return signal.butter(order, min(fc, SR * 0.45) / (SR / 2), 'low', output='sos')


def sos_hp(fc, order=2):
    return signal.butter(order, min(fc, SR * 0.45) / (SR / 2), 'high', output='sos')


def sos_bp(lo, hi, order=2):
    return signal.butter(order, [max(lo, 20) / (SR / 2), min(hi, SR * 0.45) / (SR / 2)], 'band', output='sos')


def filt(sos, x):
    return signal.sosfilt(sos, x, axis=0)


def sweep(x, f0, f1, width=1.5, chunks=96, kind='bp'):
    out = np.zeros_like(x)
    idx = np.linspace(0, len(x), chunks + 1).astype(int)
    zi = None
    for i in range(chunks):
        fc = f0 * (f1 / f0) ** (i / max(1, chunks - 1))
        sos = sos_bp(fc / width, fc * width) if kind == 'bp' else sos_lp(fc)
        if zi is None:
            zi = np.zeros((sos.shape[0], 2) + x.shape[1:])
        seg = x[idx[i]:idx[i + 1]]
        out[idx[i]:idx[i + 1]], zi = signal.sosfilt(sos, seg, axis=0, zi=zi)
    return out


# ---------------------------------------------------------------- oscillators

def polyblep_saw(f, t, ph=0.0):
    dt = f / SR
    p = (f * t + ph) % 1.0
    s = 2 * p - 1
    x1 = p / dt
    s -= np.where(p < dt, 2 * x1 - x1 * x1 - 1, 0)
    x2 = (p - 1) / dt
    s -= np.where(p > 1 - dt, x2 * x2 + 2 * x2 + 1, 0)
    return s


def env(n, a, r, hold=None):
    """linear attack, sustain until hold, then exponential-ish release"""
    t = np.arange(n) / SR
    e = np.clip(t / max(a, 1e-4), 0, 1)
    if hold is not None:
        rel = np.clip((t - hold) / max(r, 1e-4), 0, 1)
        e *= (1 - rel) ** 2
    return e


def supersaw(f, dur, voices=7, detune=0.16, cutoff=2000, a=0.3, r=0.8, stereo=True):
    t = T(dur + r)
    L = np.zeros(len(t))
    R = np.zeros(len(t))
    for v in range(voices):
        d = (v / (voices - 1) - 0.5) * 2 * detune if voices > 1 else 0
        s = polyblep_saw(f * 2 ** (d / 12), t, rng.random())
        pan = (v / (voices - 1) - 0.5) * 1.6 if voices > 1 else 0
        L += s * (1 - pan) * 0.5
        R += s * (1 + pan) * 0.5
    x = np.stack([L, R], 1) / voices
    x = filt(sos_lp(cutoff, 2), x)
    e = env(len(t), a, r, dur)
    return x * e[:, None]


def pluck(f, dur=0.4, bright=1.0):
    t = T(dur)
    K = int(min(18, 9000 / f))
    s = np.zeros(len(t))
    for n in range(1, K + 1):
        s += (1.0 / n) * np.sin(2 * np.pi * n * f * t + rng.random() * 0.3) * np.exp(-t * (5 + n * 3.2 / bright))
    s *= np.clip(t / 0.002, 0, 1)
    return s * 0.8


def bell(f, dur=3.0, idx=3.0, ratio=3.5):
    t = T(dur)
    I = idx * np.exp(-t / 0.35)
    s = np.sin(2 * np.pi * f * t + I * np.sin(2 * np.pi * f * ratio * t))
    s += 0.35 * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-t / 0.6)
    s *= np.exp(-t / (dur * 0.35)) * np.clip(t / 0.003, 0, 1)
    return s * 0.6


def kick(gain=1.0, tight=1.0):
    t = T(0.7)
    fr_ = 44 + 120 * np.exp(-t / (0.032 * tight))
    ph = 2 * np.pi * np.cumsum(fr_) / SR
    s = np.sin(ph) * np.exp(-t / (0.32 * tight))
    click = filt(sos_hp(1500), rng.standard_normal(len(t))) * np.exp(-t / 0.004) * 0.35
    s = np.tanh((s + click) * 1.6) * gain
    return s


def clap(gain=1.0):
    t = T(0.5)
    n = filt(sos_bp(900, 6000), rng.standard_normal(len(t)))
    e = np.zeros(len(t))
    for d in (0.0, 0.011, 0.022):
        e += np.where(t >= d, np.exp(-(t - d) / 0.005), 0)
    e += np.where(t >= 0.03, np.exp(-(t - 0.03) / 0.11), 0) * 0.6
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.04) * 0.5
    return (n * e * 0.9 + tone) * gain


def snare(gain=1.0):
    t = T(0.3)
    n = filt(sos_bp(1500, 8000), rng.standard_normal(len(t))) * np.exp(-t / 0.07)
    tone = np.sin(2 * np.pi * 210 * t) * np.exp(-t / 0.05)
    return (n * 0.8 + tone * 0.5) * gain


def hat(open_=False, gain=1.0):
    t = T(0.45 if open_ else 0.09)
    n = filt(sos_hp(7500, 4), rng.standard_normal(len(t)))
    return n * np.exp(-t / (0.16 if open_ else 0.018)) * gain


def crash(dur=3.0):
    t = T(dur)
    n = filt(sos_hp(3500, 2), rng.standard_normal((len(t), 2)))
    metal = sum(np.sin(2 * np.pi * f * t + rng.random() * 6) for f in (3120, 4470, 5830, 7210, 8650)) * 0.08
    return (n + metal[:, None]) * np.exp(-t / (dur * 0.33))[:, None] * 0.6


def boom(dur=3.0, f0=62, f1=30):
    t = T(dur)
    f_ = f1 + (f0 - f1) * np.exp(-t / 0.35)
    s = np.sin(2 * np.pi * np.cumsum(f_) / SR) * np.exp(-t / 0.9)
    n = filt(sos_lp(300), rng.standard_normal(len(t))) * np.exp(-t / 0.25) * 1.5
    return np.tanh((s + n) * 1.4)


def riser(dur, f0=250, f1=7000):
    t = T(dur)
    n = sweep(rng.standard_normal((len(t), 2)), f0, f1, 1.35, 80)
    e = (t / dur) ** 2.2
    tone_f = 180 * (8 ** (t / dur))
    tone = np.sin(2 * np.pi * np.cumsum(tone_f) / SR) * (t / dur) ** 3 * 0.25
    return n * e[:, None] * 2.2 + tone[:, None]


def whoosh(dur=0.7, f0=400, f1=3500):
    t = T(dur)
    n = sweep(rng.standard_normal(len(t)), f0, f1, 1.6, 48)
    e = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2
    s = n * e * 2.4
    pan = np.linspace(-0.8, 0.8, len(t))
    a = (pan + 1) * np.pi / 4
    return np.stack([s * np.cos(a), s * np.sin(a)], 1) * np.sqrt(2)


def blip(f, dur=0.22, dec=0.07):
    t = T(dur)
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.03)
    return s * np.exp(-t / dec) * np.clip(t / 0.002, 0, 1)


def tick(f=2200, dec=0.008):
    t = T(0.05)
    s = np.sign(np.sin(2 * np.pi * f * t)) * 0.5 + filt(sos_hp(2000), rng.standard_normal(len(t)))
    return s * np.exp(-t / dec) * 0.5


def keyclick():
    t = T(0.08)
    n = filt(sos_bp(1800, 7000), rng.standard_normal(len(t))) * np.exp(-t / 0.003)
    thock = np.sin(2 * np.pi * 170 * t) * np.exp(-t / 0.012) * 0.6
    return n + thock


# ---------------------------------------------------------------- harmony

CH = {
    'Am': ([57, 60, 64, 69], 33),
    'F': ([53, 57, 60, 65], 29),
    'C': ([55, 60, 64, 67], 36),
    'G': ([55, 59, 62, 67], 31),
    'E': ([56, 59, 64, 68], 28),
    'A': ([57, 61, 64, 69], 33),
}
INTRO = ['Am', 'Am', 'F', 'F', 'C', 'G', 'F', 'E']
LOOP = ['Am', 'F', 'C', 'G']
MONT = ['Am', 'F', 'G', 'E']
FIN = ['F', 'G', 'Am', 'F', 'G', 'A']


def section(b):
    if b < 8:
        return 'intro', -1, b
    if b >= LOGO:
        return 'logo', 4, b - LOGO
    if b >= MONTAGE:
        return 'montage', 4, b - MONTAGE
    for i in range(3, -1, -1):
        if b >= ACT_START[i]:
            lb = b - ACT_START[i]
            kind = 'title' if lb < 2 else ('break' if lb == 14 else 'groove')
            return kind, i, lb
    return 'intro', -1, b


def chord_of(b):
    kind, act, lb = section(b)
    if kind == 'intro':
        return INTRO[b]
    if kind == 'logo':
        return FIN[min(lb, 5)]
    if kind == 'montage':
        return MONT[lb]
    return 'E' if lb == 14 else LOOP[lb % 4]


NBARS = 78
kick_times = []

# ---------------------------------------------------------------- pad + bass + arp + drums
for b in range(NBARS):
    t0 = b * BAR
    kind, act, lb = section(b)
    name = chord_of(b)
    notes, root = CH[name]

    # ---- pad
    if kind == 'intro':
        cut = [350, 450, 700, 900, 1200, 1500, 900, 1600][b]
        g = [0.35, 0.6, 0.8, 0.85, 0.9, 1.0, 0.75, 0.9][b]
    elif kind == 'title':
        cut, g = 2600, 1.0
    elif kind == 'groove':
        cut, g = 1500 + act * 450, 0.8
    elif kind == 'break':
        cut, g = 3000, 0.9
    elif kind == 'montage':
        cut, g = 4200, 0.85
    else:
        cut, g = [3800, 3800, 3600, 3400, 3200, 3000][lb], 1.0
    dur = BAR if not (kind == 'logo' and lb == 5) else 4.0
    for m in notes + [notes[0] - 12]:
        place('pad', t0, supersaw(mtof(m), dur, cutoff=cut, a=0.35 if kind != 'logo' else 0.08, r=1.2 if lb != 5 else 2.5), g * 0.16, rsend=0.35)

    # ---- bass
    fb = mtof(root)
    if kind == 'intro':
        if 2 <= b <= 5:
            t = T(BAR)
            s = np.sin(2 * np.pi * fb * t) * env(len(t), 0.4, 0.3, BAR - 0.3)
            place('bass', t0, s, 0.55 * (b - 1) / 4)
    elif kind in ('title', 'logo'):
        t = T(BAR + 0.5)
        s = np.sin(2 * np.pi * fb * t) + 0.3 * np.sin(2 * np.pi * 2 * fb * t)
        s *= env(len(t), 0.02, 0.5, BAR - 0.1)
        place('bass', t0, np.tanh(s * 1.3), 0.6 if kind == 'title' else (0.6 if lb < 5 else 0.5))
    else:
        steps = 8
        for k in range(steps):
            if kind == 'break' and k >= 4:
                break
            tt = t0 + k * BEAT / 2
            f_ = fb * (2 if (act >= 2 and k % 2 == 1) else 1)
            t = T(0.26)
            s = np.sin(2 * np.pi * f_ * t) + 0.45 * polyblep_saw(f_, t) * 0.6
            s = filt(sos_lp(700), s)
            s *= env(len(t), 0.004, 0.05, 0.2)
            place('bass', tt, np.tanh(s * 1.8), 0.5)

    # ---- arp
    if kind in ('groove', 'break', 'montage') or (kind == 'intro' and b in (4, 5)) or (kind == 'title' and lb == 1):
        arp = [n + 12 for n in notes]
        pat = [0, 2, 1, 3, 2, 1, 3, 2, 0, 2, 1, 3, 2, 3, 1, 0]
        bright = {-1: 0.5, 0: 0.6, 1: 0.85, 2: 1.05, 3: 1.3, 4: 1.4}[act]
        for k in range(16):
            if kind == 'break' and k >= 12:
                break
            if kind == 'intro' and k % 2:
                continue
            m = arp[pat[k] % 4] + (12 if (act >= 3 and k in (6, 14)) else 0)
            vel = 0.8 if k % 4 == 0 else 0.55
            place('arp', t0 + k * BEAT / 4, pluck(mtof(m), 0.45, bright), vel * (0.5 if kind == 'intro' else 1.0),
                  pan=0.35 * np.sin(k * 0.8), rsend=0.25, dsend=0.35)

    # ---- drums
    def K(beat, gain=1.0):
        tt = t0 + beat * BEAT
        place('kick', tt, kick(gain), 0.95)
        kick_times.append((tt, gain))

    if kind == 'intro':
        if b <= 3:
            K(0, 0.45)
            K(0.6, 0.3)
        elif b in (4, 5):
            for q in range(4):
                K(q, 0.5 + 0.1 * q + (b - 4) * 0.15)
            for q in range(4):
                place('drums', t0 + (q + 0.5) * BEAT, hat(gain=0.25), 1, pan=0.3)
        elif b == 7:
            K(1, 1.0)  # 408 formed (14.5 s)
            # snare roll into the drop
            hits = list(np.arange(2, 3, 0.25)) + list(np.arange(3, 3.5, 0.125)) + list(np.arange(3.5, 4, 0.0625))
            for i, h in enumerate(hits):
                place('drums', t0 + h * BEAT, snare(0.15 + 0.6 * i / len(hits)), 1, pan=0.1, rsend=0.2)
    elif kind == 'title':
        K(0, 1.1)
        K(2, 0.9)
        if lb == 1:
            K(3, 0.7)
            K(3.5, 0.8)
    elif kind in ('groove', 'montage'):
        last_montage = kind == 'montage' and lb == 3
        for q in range(4):
            if last_montage and q >= 2:
                continue
            K(q, 1.0)
        if act >= 3 and lb % 4 == 3 and not last_montage:
            K(3.5, 0.6)
        for q in (1, 3):
            if last_montage and q == 3:
                continue
            place('drums', t0 + q * BEAT, clap(0.9), 1, pan=-0.05, rsend=0.18)
        sub = 4 if act >= 1 else 2
        for k in range(4 * sub):
            pos = k / sub
            if last_montage and pos >= 2:
                continue
            off = (k % sub) != 0
            if sub == 2 and not off:
                continue
            g = 0.32 if (k % sub == sub // 2) else 0.16
            place('drums', t0 + pos * BEAT, hat(gain=g), 1, pan=0.35)
        if act >= 2:
            for q in (0.5, 1.5, 2.5, 3.5):
                if last_montage and q > 2:
                    continue
                place('drums', t0 + q * BEAT, hat(True, 0.12), 1, pan=-0.3)
        if last_montage:
            hits = list(np.arange(2, 3, 0.25)) + list(np.arange(3, 4, 0.125))
            for i, h in enumerate(hits):
                place('drums', t0 + h * BEAT, snare(0.2 + 0.7 * i / len(hits)), 1, rsend=0.2)
    elif kind == 'break':
        K(0, 1.0)
        K(1, 1.0)
        place('drums', t0 + 1 * BEAT, clap(0.9), 1, rsend=0.2)
        hits = list(np.arange(2, 3, 0.25)) + list(np.arange(3, 4, 0.125))
        for i, h in enumerate(hits):
            place('drums', t0 + h * BEAT, snare(0.2 + 0.6 * i / len(hits)), 1, rsend=0.2)
    elif kind == 'logo':
        if lb == 0:
            K(0, 1.2)
        if 1 <= lb <= 4:
            place('kick', t0, kick(0.9, 1.6), 0.9)
            kick_times.append((t0, 0.5))
            place('kick', t0 + 2.5 * BEAT, kick(0.6, 1.6), 0.8)

# ---------------------------------------------------------------- lead (act IV) + finale bells
PHRASE_A = [
    [(0, 1, 76), (1, 1, 81), (2, 1.5, 79), (3.5, 0.5, 76)],
    [(0, 1.5, 77), (1.5, 0.5, 76), (2, 1, 72), (3, 1, 77)],
    [(0, 1, 79), (1, 1, 76), (2, 1.5, 72), (3.5, 0.5, 74)],
    [(0, 2, 74), (2, 1, 71), (3, 1, 74)],
]
PHRASE_B = [
    [(0, 1, 76), (1, 1, 81), (2, 1, 83), (3, 1, 84)],
    [(0, 2, 84), (2, 1, 81), (3, 1, 77)],
    [(0, 1, 79), (1, 1, 84), (2, 1, 83), (3, 1, 79)],
    [(0, 3, 79), (3, 1, 83)],
]


def lead_note(m, dur):
    f = mtof(m)
    t = T(dur + 0.25)
    vib = 1 + 0.004 * np.sin(2 * np.pi * 5.5 * t) * np.clip((t - 0.2) / 0.3, 0, 1)
    ph = np.cumsum(f * vib) / SR
    s = sum(polyblep_saw(1.0, ph * 1.0 * (1 + d), 0) for d in (-0.004, 0, 0.0045)) / 3
    sq = np.sign(np.sin(2 * np.pi * ph * 0.5)) * 0.15
    x = filt(sos_lp(4200), s + sq)
    return x * env(len(t), 0.012, 0.2, dur)


a4 = ACT_START[3]
for i, ph in enumerate(PHRASE_A + PHRASE_B):
    b = a4 + 4 + i
    for (bt, d, m) in ph:
        place('lead', b * BAR + bt * BEAT, lead_note(m, d * BEAT), 0.28, rsend=0.3, dsend=0.3)
for b, m in ((a4 + 12, 76), (a4 + 13, 77)):
    place('lead', b * BAR, lead_note(m, 3.5 * BEAT), 0.26, rsend=0.35, dsend=0.3)
place('lead', (a4 + 14) * BAR, lead_note(80, 2 * BEAT), 0.26, rsend=0.4, dsend=0.3)

FIN_MEL = [
    [(0, 2, 81), (2, 2, 84)],
    [(0, 2, 83), (2, 2, 86)],
    [(0, 2, 84), (2, 2, 88)],
    [(0, 2, 89), (2, 1, 88), (3, 1, 84)],
    [(0, 3, 86), (3, 1, 83)],
    [(0, 4, 85)],
]
for i, ph in enumerate(FIN_MEL):
    b = LOGO + i
    for (bt, d, m) in ph:
        place('bell', b * BAR + bt * BEAT, bell(mtof(m), 3.5 if i < 5 else 6.0, 2.2, 3.0), 0.5, pan=0.2 * np.sin(i + bt), rsend=0.5, dsend=0.2)
        place('lead', b * BAR + bt * BEAT, lead_note(m - 12, d * BEAT), 0.16, rsend=0.4)
# final A-major shimmer
for m in (69, 73, 76, 81, 85, 88):
    place('bell', (LOGO + 5) * BAR + 0.02 * (m - 69), bell(mtof(m), 6.0, 1.2, 2.0), 0.18, pan=(m - 78) / 20, rsend=0.6)

# intro motif bells (bars 2-5)
INTRO_BELL = [(2, 0, 76), (2, 1.5, 72), (2, 3, 69), (3, 0, 77), (3, 2, 72), (4, 0, 79), (4, 1.5, 76), (4, 3, 72), (5, 0, 74), (5, 2, 71)]
for b, bt, m in INTRO_BELL:
    place('bell', b * BAR + bt * BEAT, bell(mtof(m), 3.0, 2.0), 0.32, pan=0.3 * np.sin(b * 3 + bt), rsend=0.55, dsend=0.3)

# ---------------------------------------------------------------- FX: risers, impacts, whooshes

IMPACTS = [fr(960), fr(2760), fr(4560), fr(6360), fr(8160), fr(8640)]
for i, t in enumerate(IMPACTS):
    big = 1.3 if i in (0, 5) else 1.0
    place('fx', t, boom(3.5), 0.9 * big, rsend=0.4)
    place('fx', t, crash(3.5 if i < 5 else 5.0), 0.55 * big, rsend=0.4)
    rv = crash(1.6)[::-1]
    place('fx', t - len(rv) / SR, rv, 0.45, rsend=0.2)
    rd = 2.0 if i not in (0,) else 3.2
    place('fx', t - rd, riser(rd), 0.3, rsend=0.2)
    kick_times.append((t, 1.4))

# shot cuts (intra-act) -> whooshes
CUTS = [1200, 1500, 1800, 2160, 3000, 3300, 3600, 4020, 4800, 5160, 5460, 5820, 6120, 6600, 7020, 7380, 7740]
for i, c in enumerate(CUTS):
    place('sfx', fr(c) - 0.35, whoosh(0.7, 350, 3200 if i % 2 else 2400), 0.5, rsend=0.15)

# ---------------------------------------------------------------- SFX synced to visuals
PENTA = [69, 72, 74, 76, 79, 81, 84, 86, 88, 91, 93, 96, 98]

# intro typing + burst + warp
for k in range(12):
    place('sfx', fr(60 + 10 * k), keyclick(), 0.45, pan=rng.uniform(-0.2, 0.2))
place('sfx', fr(236), blip(1760, 0.3, 0.1), 0.25, rsend=0.4)
place('fx', fr(240), boom(2.0, 90, 40), 0.45, rsend=0.5)
place('sfx', fr(240), whoosh(1.2, 3000, 300), 0.5, rsend=0.3)
for i, m in enumerate([72, 76, 79, 84]):  # words 算法/机器/系统/网络 over C chord
    place('bell', fr(480 + 30 * i), bell(mtof(m), 2.5, 2.5), 0.4, pan=-0.45 + 0.3 * i, rsend=0.5, dsend=0.25)
place('fx', fr(560), riser(fr(735) - fr(560), 200, 9000), 0.42, rsend=0.2)
place('fx', fr(735), whoosh(1.4, 6000, 150), 0.7, rsend=0.4)
place('fx', fr(735), boom(2.5, 70, 32), 0.55, rsend=0.5)
for k in range(70):  # converge sparkle
    t = fr(740) + k * 0.021 + rng.uniform(0, 0.01)
    place('sfx', t, blip(mtof(rng.choice(PENTA) + 12), 0.12, 0.03), 0.05 + 0.08 * k / 70, pan=rng.uniform(-0.8, 0.8), rsend=0.5)
place('fx', fr(870), crash(3.0), 0.3, rsend=0.5)
for i in range(4):
    place('sfx', fr(900 + 9 * i), blip(mtof([81, 84, 88, 93][i]), 0.25, 0.07), 0.18, pan=-0.4 + 0.27 * i, rsend=0.3)

# DS list
place('sfx', fr(1200 + 128), blip(mtof(64), 0.3, 0.1), 0.3, rsend=0.2)
place('sfx', fr(1200 + 160), whoosh(0.35, 800, 3000), 0.25)
place('sfx', fr(1200 + 196), tick(1500, 0.01), 0.3)
place('sfx', fr(1200 + 206), whoosh(0.35, 800, 3000), 0.25)
# DS tree
for i in range(13):
    place('sfx', fr(1500 + 15 + 15 * i), blip(mtof(PENTA[i]), 0.25, 0.08), 0.22, pan=-0.6 + 0.1 * i, rsend=0.25)
for r in range(13):
    place('sfx', fr(1500 + 196 + 7 * r), tick(3000 + 150 * r, 0.006), 0.18, pan=-0.6 + 0.1 * r)
# DS sort sweep
t = T(0.9)
gl = np.sin(2 * np.pi * np.cumsum(400 * 4 ** (t / 0.9)) / SR) * np.sin(np.pi * t / 0.9) ** 2
place('sfx', fr(1800 + 290), gl, 0.12, rsend=0.4)
# DS graph steps
for k in range(10):
    place('sfx', fr(2160 + 90 + 30 * k), blip(mtof(PENTA[k] + 12), 0.2, 0.06), 0.18, pan=-0.4 + 0.09 * k, rsend=0.25)
place('sfx', fr(2160 + 430), whoosh(1.2, 500, 5000), 0.4, rsend=0.3)

# CO
for k in range(5):
    place('sfx', fr(3000 + 6 + 12 * k), blip(mtof(57 + [0, 3, 7, 10, 12][k]), 0.25, 0.06), 0.18, rsend=0.2)
for k in range(32):
    bit = '1' + '10000001' + '10110000000000000000000'
    place('sfx', fr(3300 + 150 + 3 * k), tick(2600 if bit[k] == '1' else 1300, 0.012), 0.16, pan=-0.8 + 0.05 * k)
place('sfx', fr(3300 + 262), bell(mtof(88), 2.0, 2.0), 0.18, rsend=0.4)
for k in range(9):
    place('sfx', fr(3600 + 30 + 30 * k), tick(4200, 0.02), 0.2, pan=-0.6 + 0.15 * k, rsend=0.15)
place('sfx', fr(3600 + 300), bell(mtof(81), 2.0, 2.5), 0.2, rsend=0.4)
for k in range(4):
    place('sfx', fr(4020 + 16 + 16 * k), boom(0.6, 120, 60), 0.18)
place('sfx', fr(4020 + 406), bell(mtof(84), 1.5, 1.5), 0.25, rsend=0.3)
t = T(0.35)
buzz = filt(sos_lp(1200), polyblep_saw(110, t) + polyblep_saw(116, t)) * np.exp(-t / 0.15)
place('sfx', fr(4020 + 488), buzz, 0.3)
place('sfx', fr(4020 + 500), whoosh(0.45, 600, 4000), 0.3)
place('sfx', fr(4020 + 530), bell(mtof(88), 1.5, 1.5), 0.25, rsend=0.3)

# OS
PROC_EV = [48, 90, 150, 240, 330, 62, 150, 210, 76, 210, 270, 88, 270, 330]
for i, e in enumerate(sorted(set(PROC_EV))):
    place('sfx', fr(4800 + e), blip(mtof(PENTA[i % 8] + 5), 0.2, 0.05), 0.15, rsend=0.2)
place('sfx', fr(5160 + 256), bell(mtof(84), 1.8, 1.8), 0.2, rsend=0.35)
for i in range(9):
    s0 = 5460 + 40 + 34 * i
    place('sfx', fr(s0 + 8), tick(900, 0.01), 0.18)
    place('sfx', fr(s0 + 24), blip(mtof(76 if i % 2 else 79), 0.18, 0.05), 0.16, rsend=0.2)
t = T(0.9)
zap = np.sin(2 * np.pi * np.cumsum(2400 * 0.25 ** (t / 0.9)) / SR) * np.exp(-t / 0.35)
place('sfx', fr(5820 + 176), zap, 0.12, rsend=0.35)
t = T(2.5)
stab = sum(polyblep_saw(mtof(m), t) for m in (45, 51, 57, 63)) / 4
stab = filt(sos_lp(2500), stab) * np.exp(-t / 0.7)
place('fx', fr(6120 + 158), np.tanh(stab * 2), 0.35, rsend=0.5)
for i in range(4):
    place('sfx', fr(6120 + 180 + 7 * i), tick(1800, 0.015), 0.2, pan=[-0.6, 0.6, -0.6, 0.6][i])

# CN
for k in range(1, 4):
    place('sfx', fr(6600 + 40 + 36 * k + 8), blip(mtof(72 + 3 * k), 0.2, 0.05), 0.2, rsend=0.2)
for k in range(16):
    place('sfx', fr(6800) + k * 0.06, tick(2000 + (k % 3) * 700, 0.01), 0.14, pan=-0.7 + 0.09 * k)
for j in range(4):
    place('sfx', fr(6600 + 262 + 34 * j), blip(mtof(84 - 3 * j), 0.2, 0.05), 0.2, rsend=0.2)
place('sfx', fr(7000), bell(mtof(88), 1.8, 1.8), 0.22, rsend=0.4)


def ping(f):
    t = T(1.2)
    return np.sin(2 * np.pi * f * t) * np.exp(-t / 0.25) * np.clip(t / 0.003, 0, 1)


for i, at in enumerate((40, 120, 200)):
    place('sfx', fr(7020 + at + 56), ping(mtof([81, 84, 88][i])), 0.22, pan=[0.6, -0.6, 0.6][i], rsend=0.45, dsend=0.2)
place('sfx', fr(7020 + 272), bell(mtof(81), 2.5, 2.0), 0.22, rsend=0.5)
place('sfx', fr(7380 + 34 + 150), buzz, 0.3)
place('sfx', fr(7380 + 34 + 150), boom(1.0, 150, 60), 0.2)
place('sfx', fr(7380 + 34 + 261), blip(mtof(88), 0.3, 0.08), 0.2, rsend=0.3)
for i in range(8):
    place('sfx', fr(7740 + 40 + 18 * i), whoosh(0.5, 1200, 5000), 0.12, rsend=0.3)

# montage word stabs (16 x 8th notes)
for k in range(16):
    t0 = fr(8160 + 15 * k)
    b = int(t0 // BAR)
    notes, root = CH[chord_of(b)]
    for m in notes + [notes[0] + 12]:
        place('fx', t0, supersaw(mtof(m + 12), 0.12, voices=5, cutoff=6000, a=0.003, r=0.18), 0.12, rsend=0.25)
    place('fx', t0, pluck(mtof(notes[k % 4] + 24), 0.3, 1.6), 0.25, pan=0.5 * np.sin(k), dsend=0.2)
for i in range(4):
    place('sfx', fr(8400 + 7 * i) - 0.1, whoosh(0.6, 500, 4000), 0.28)

# ---------------------------------------------------------------- sidechain
t_all = np.arange(N) / SR
duck = np.ones(N)
for (tk, g) in kick_times:
    i0 = int(tk * SR)
    n = min(int(0.4 * SR), N - i0)
    if n <= 0:
        continue
    tt = np.arange(n) / SR
    duck[i0:i0 + n] = np.minimum(duck[i0:i0 + n], 1 - min(0.65, 0.55 * g) * np.exp(-tt / 0.12))
for k in ('pad', 'arp', 'bass', 'lead'):
    depth = {'pad': 1.0, 'arp': 0.7, 'bass': 0.8, 'lead': 0.4}[k]
    tracks[k] *= (1 - depth * (1 - duck))[:, None]

# ---------------------------------------------------------------- reverb + delay
irn = int(3.2 * SR)
ti = np.arange(irn) / SR
ir = rng.standard_normal((irn, 2)) * np.exp(-ti / 0.5)[:, None]
ir = filt(sos_lp(5500), ir)
ir[:int(0.02 * SR)] = 0
ir /= np.sqrt((ir ** 2).sum(0))
wet = np.stack([signal.oaconvolve(rev[:, c], ir[:, c])[:N] for c in range(2)], 1)
wet = filt(sos_hp(180), wet)

d = int(0.375 * SR)
dsrc = filt(sos_lp(3500), filt(sos_hp(300), dly))
echo = np.zeros_like(dly)
fb = 0.42
for k in range(1, 7):
    sh = d * k
    if sh >= N:
        break
    g = fb ** (k - 1)
    ch = (k - 1) % 2
    echo[sh:, ch] += dsrc[:N - sh, 0 if ch == 0 else 1] * g * 0.8
    echo[sh:, 1 - ch] += dsrc[:N - sh, 1 if ch == 0 else 0] * g * 0.25

# ---------------------------------------------------------------- mix
GAIN = {'kick': 0.42, 'drums': 0.9, 'bass': 0.45, 'pad': 3.2, 'arp': 0.4, 'lead': 1.4, 'bell': 0.7, 'fx': 0.55, 'sfx': 0.6}
mix = sum(tracks[k] * GAIN[k] for k in tracks)
mix += wet * 0.55 + echo * 0.35
mix = filt(sos_hp(28), mix)

for k in tracks:
    r = np.sqrt(np.mean(tracks[k] ** 2)) * GAIN[k]
    print(f'{k:6s} rms {20 * np.log10(r + 1e-9):6.1f} dB  peak {np.abs(tracks[k]).max() * GAIN[k]:.2f}')

# gentle bus compression (RMS follower) then soft clip
rms = np.sqrt(filt(sos_lp(8), (mix ** 2).mean(1)).clip(1e-9))
thr = 0.18
gain = np.where(rms > thr, (thr / rms) ** 0.35, 1.0)
mix *= gain[:, None]
mix /= np.abs(mix).max()
mix = np.tanh(mix * 1.6) / np.tanh(1.6)
# fade in/out
fi = int(0.05 * SR)
mix[:fi] *= np.linspace(0, 1, fi)[:, None]
fo_start = int(153.2 * SR)
mix[fo_start:] *= np.linspace(1, 0, N - fo_start)[:, None] ** 1.5
mix *= 10 ** (-0.8 / 20) / np.abs(mix).max()
np.save('audio/stems_rms.npy', np.array([[np.sqrt(np.mean((tracks[k][int(i*SR):int((i+1)*SR)]*GAIN[k])**2)) for i in range(156)] for k in tracks]))
sf.write('public/music.wav', mix[: int(TOTAL * SR)].astype(np.float32), SR, subtype='PCM_24')
print('written', mix.shape[0] / SR, 's  lufs-ish rms', 20 * np.log10(np.sqrt(np.mean(mix ** 2))))
