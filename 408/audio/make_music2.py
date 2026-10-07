"""20-minute procedural soundtrack for the 408 MV (v2).
Arrangement is driven by audio/timeline.json (exported from src/timeline.ts):
every shot is a whole number of bars (120 BPM, 1 bar = 2 s = 120 frames)."""
import json
from functools import lru_cache

import numpy as np
import soundfile as sf
from scipy import signal

SR = 48000
BEAT = 0.5
BAR = 2.0
TL = json.load(open('audio/timeline.json'))
TOTAL = TL['total'] / 60
N = int(SR * (TOTAL + 0.3))
NB = int(np.ceil(TOTAL / BAR))
rng = np.random.default_rng(408)
F32 = np.float32

buses = {k: np.zeros((N, 2), F32) for k in ['duck', 'lead', 'drums', 'fx']}
rev = np.zeros((N, 2), F32)
dly = np.zeros((N, 2), F32)
kick_times: list[tuple[float, float]] = []


def fr(frame):
    return frame / 60.0


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def T(n):
    return np.arange(int(n * SR)) / SR


def place(bus, t0, sig, gain=1.0, pan=0.0, rsend=0.0, dsend=0.0):
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
    s = (sig[:n] * gain).astype(F32)
    buses[bus][i0:i0 + n] += s
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


def sweep(x, f0, f1, width=1.5, chunks=64):
    out = np.zeros_like(x)
    idx = np.linspace(0, len(x), chunks + 1).astype(int)
    zi = None
    for i in range(chunks):
        fc = f0 * (f1 / f0) ** (i / max(1, chunks - 1))
        sos = sos_bp(fc / width, fc * width)
        if zi is None:
            zi = np.zeros((sos.shape[0], 2) + x.shape[1:])
        out[idx[i]:idx[i + 1]], zi = signal.sosfilt(sos, x[idx[i]:idx[i + 1]], axis=0, zi=zi)
    return out


# ------------------------------------------------------------------ instruments

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
    t = np.arange(n) / SR
    e = np.clip(t / max(a, 1e-4), 0, 1)
    if hold is not None:
        rel = np.clip((t - hold) / max(r, 1e-4), 0, 1)
        e *= (1 - rel) ** 2
    return e


@lru_cache(maxsize=4096)
def supersaw(m, dur, cutoff, a, r, voices=7, detune=0.16):
    f = mtof(m)
    t = T(dur + r)
    L = np.zeros(len(t))
    R = np.zeros(len(t))
    for v in range(voices):
        d = (v / (voices - 1) - 0.5) * 2 * detune
        s = polyblep_saw(f * 2 ** (d / 12), t, rng.random())
        pan = (v / (voices - 1) - 0.5) * 1.6
        L += s * (1 - pan) * 0.5
        R += s * (1 + pan) * 0.5
    x = filt(sos_lp(cutoff, 2), np.stack([L, R], 1) / voices)
    return (x * env(len(t), a, r, dur)[:, None]).astype(F32)


@lru_cache(maxsize=4096)
def pluck(m, dur=0.45, bright=1.0):
    f = mtof(m)
    t = T(dur)
    K = int(min(18, 9000 / f))
    s = np.zeros(len(t))
    for n in range(1, K + 1):
        s += (1.0 / n) * np.sin(2 * np.pi * n * f * t + n * 0.37) * np.exp(-t * (5 + n * 3.2 / bright))
    return (s * np.clip(t / 0.002, 0, 1) * 0.8).astype(F32)


@lru_cache(maxsize=1024)
def bell(m, dur=3.0, idx=3.0, ratio=3.5):
    f = mtof(m)
    t = T(dur)
    I = idx * np.exp(-t / 0.35)
    s = np.sin(2 * np.pi * f * t + I * np.sin(2 * np.pi * f * ratio * t))
    s += 0.35 * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-t / 0.6)
    s *= np.exp(-t / (dur * 0.35)) * np.clip(t / 0.003, 0, 1)
    return (s * 0.6).astype(F32)


@lru_cache(maxsize=16)
def kick(tight=1.0):
    t = T(0.7)
    fr_ = 44 + 120 * np.exp(-t / (0.032 * tight))
    s = np.sin(2 * np.pi * np.cumsum(fr_) / SR) * np.exp(-t / (0.32 * tight))
    click = filt(sos_hp(1500), rng.standard_normal(len(t))) * np.exp(-t / 0.004) * 0.35
    return np.tanh((s + click) * 1.6).astype(F32)


@lru_cache(maxsize=4)
def clap():
    t = T(0.5)
    n = filt(sos_bp(900, 6000), rng.standard_normal(len(t)))
    e = np.zeros(len(t))
    for d in (0.0, 0.011, 0.022):
        e += np.where(t >= d, np.exp(-(t - d) / 0.005), 0)
    e += np.where(t >= 0.03, np.exp(-(t - 0.03) / 0.11), 0) * 0.6
    return (n * e * 0.9 + np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.04) * 0.5).astype(F32)


@lru_cache(maxsize=4)
def snare():
    t = T(0.3)
    n = filt(sos_bp(1500, 8000), rng.standard_normal(len(t))) * np.exp(-t / 0.07)
    return (n * 0.8 + np.sin(2 * np.pi * 210 * t) * np.exp(-t / 0.05) * 0.5).astype(F32)


@lru_cache(maxsize=4)
def rim():
    t = T(0.12)
    s = np.sin(2 * np.pi * 820 * t) * np.exp(-t / 0.012) + filt(sos_bp(2000, 6000), rng.standard_normal(len(t))) * np.exp(-t / 0.006) * 0.6
    return s.astype(F32)


@lru_cache(maxsize=4)
def hat(open_=False):
    t = T(0.45 if open_ else 0.09)
    n = filt(sos_hp(7500, 4), rng.standard_normal(len(t)))
    return (n * np.exp(-t / (0.16 if open_ else 0.018))).astype(F32)


@lru_cache(maxsize=8)
def crash(dur=3.0):
    t = T(dur)
    n = filt(sos_hp(3500, 2), rng.standard_normal((len(t), 2)))
    metal = sum(np.sin(2 * np.pi * f * t + rng.random() * 6) for f in (3120, 4470, 5830, 7210, 8650)) * 0.08
    return ((n + metal[:, None]) * np.exp(-t / (dur * 0.33))[:, None] * 0.6).astype(F32)


@lru_cache(maxsize=16)
def boom(dur=3.0, f0=62, f1=30):
    t = T(dur)
    f_ = f1 + (f0 - f1) * np.exp(-t / 0.35)
    s = np.sin(2 * np.pi * np.cumsum(f_) / SR) * np.exp(-t / 0.9)
    n = filt(sos_lp(300), rng.standard_normal(len(t))) * np.exp(-t / 0.25) * 1.5
    return np.tanh((s + n) * 1.4).astype(F32)


@lru_cache(maxsize=16)
def riser(dur, f0=250.0, f1=7000.0):
    t = T(dur)
    n = sweep(rng.standard_normal((len(t), 2)), f0, f1, 1.35, 64)
    e = (t / dur) ** 2.2
    tone = np.sin(2 * np.pi * np.cumsum(180 * (8 ** (t / dur))) / SR) * (t / dur) ** 3 * 0.25
    return (n * e[:, None] * 2.2 + tone[:, None]).astype(F32)


@lru_cache(maxsize=16)
def whoosh(dur=0.7, f0=400.0, f1=3500.0):
    t = T(dur)
    n = sweep(rng.standard_normal(len(t)), f0, f1, 1.6, 40)
    s = n * np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2 * 2.4
    a = (np.linspace(-0.8, 0.8, len(t)) + 1) * np.pi / 4
    return (np.stack([s * np.cos(a), s * np.sin(a)], 1) * np.sqrt(2)).astype(F32)


@lru_cache(maxsize=512)
def blip(m, dur=0.22, dec=0.07):
    f = mtof(m)
    t = T(dur)
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.03)
    return (s * np.exp(-t / dec) * np.clip(t / 0.002, 0, 1)).astype(F32)


@lru_cache(maxsize=8)
def tick(f=2200, dec=0.008):
    t = T(0.05)
    s = np.sign(np.sin(2 * np.pi * f * t)) * 0.5 + filt(sos_hp(2000), rng.standard_normal(len(t)))
    return (s * np.exp(-t / dec) * 0.5).astype(F32)


@lru_cache(maxsize=2)
def keyclick():
    t = T(0.08)
    n = filt(sos_bp(1800, 7000), rng.standard_normal(len(t))) * np.exp(-t / 0.003)
    return (n + np.sin(2 * np.pi * 170 * t) * np.exp(-t / 0.012) * 0.6).astype(F32)


@lru_cache(maxsize=2)
def buzz():
    t = T(0.35)
    return (filt(sos_lp(1200), polyblep_saw(110, t) + polyblep_saw(116, t)) * np.exp(-t / 0.15)).astype(F32)


@lru_cache(maxsize=2)
def stampsfx():
    t = T(0.5)
    slap = filt(sos_bp(300, 3000), rng.standard_normal(len(t))) * np.exp(-t / 0.03)
    return (boom(0.5, 110, 45)[: len(t)] * 0.8 + slap * 0.6).astype(F32)


@lru_cache(maxsize=4)
def gliss():
    t = T(0.9)
    return (np.sin(2 * np.pi * np.cumsum(400 * 4 ** (t / 0.9)) / SR) * np.sin(np.pi * t / 0.9) ** 2).astype(F32)


def lead_note(m, dur):
    f = mtof(m)
    t = T(dur + 0.25)
    vib = 1 + 0.004 * np.sin(2 * np.pi * 5.5 * t) * np.clip((t - 0.2) / 0.3, 0, 1)
    ph = np.cumsum(f * vib) / SR
    s = sum(polyblep_saw(1.0, ph * (1 + d), 0) for d in (-0.004, 0, 0.0045)) / 3
    sq = np.sign(np.sin(2 * np.pi * ph * 0.5)) * 0.15
    return (filt(sos_lp(4200), s + sq) * env(len(t), 0.012, 0.2, dur)).astype(F32)


# ------------------------------------------------------------------ harmony

REL = {  # relative to A minor
    'i': ([57, 60, 64, 69], 33),
    'iv': ([57, 62, 65, 69], 38),
    'VI': ([53, 57, 60, 65], 29),
    'III': ([55, 60, 64, 67], 36),
    'VII': ([55, 59, 62, 67], 31),
    'V': ([56, 59, 64, 68], 28),
    'I': ([57, 61, 64, 69], 33),
}
KEY = [0, 0, 5, -5, 2, 0]  # intro, ds, co, os, cn, fin


def chord(name, act):
    notes, root = REL[name]
    k = KEY[act]
    r = root + k
    while r > 40:
        r -= 12
    while r < 26:
        r += 12
    return [n + k for n in notes], r


SHOTS = TL['shots']


def shot_at_frame(fr_):
    for s in SHOTS:
        if s['start'] <= fr_ < s['end']:
            return s
    return SHOTS[-1]


def card_of(s):
    for c in s['cues']:
        if c[1] == 'whoosh':
            return c[0] + 6
    return 330


LEAD_SHOTS = {'ds_race', 'ds_merge', 'co_adder', 'co_vm', 'os_syscall', 'cn_fin', 'cn_globe'}
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
ARP_PATS = [
    [0, 2, 1, 3, 2, 1, 3, 2, 0, 2, 1, 3, 2, 3, 1, 0],
    [0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 1, 2, 3, 2, 1, 2],
    [3, 2, 0, 2, 1, 2, 0, 3, 2, 1, 0, 1, 3, 2, 1, 0],
    [0, 3, 1, 3, 2, 3, 1, 3, 0, 3, 1, 3, 2, 3, 2, 1],
    [0, 2, 3, 2, 1, 2, 3, 2, 0, 2, 3, 2, 1, 3, 2, 3],
    [0, 2, 1, 3, 2, 1, 3, 2, 0, 2, 1, 3, 2, 3, 1, 0],
]


def K(t, gain=1.0, tight=1.0, vol=0.45):
    place('drums', t, kick(tight) * gain, vol)
    kick_times.append((t, gain))


def arp_bar(t0, notes, act, vel=1.0, sixteenth=True, bright=None):
    arp = [n + 12 for n in notes]
    pat = ARP_PATS[max(0, act)]
    b = bright if bright is not None else {0: 0.55, 1: 0.65, 2: 0.9, 3: 1.05, 4: 1.3, 5: 1.4}[max(0, act)]
    for k in range(16):
        if not sixteenth and k % 2:
            continue
        m = arp[pat[k] % 4] + (12 if (act >= 4 and k in (6, 14)) else 0)
        v = (0.8 if k % 4 == 0 else 0.55) * vel
        place('duck', t0 + k * BEAT / 4, pluck(m, 0.45, round(b, 2)), v * 0.4, pan=0.35 * np.sin(k * 0.8), rsend=0.25, dsend=0.3)


def pad_bar(t0, notes, cutoff, g, dur=BAR, a=0.35, r=1.2):
    for m in notes + [notes[0] - 12]:
        place('duck', t0, supersaw(m, dur, int(cutoff), a, r), g * 0.5, rsend=0.35)


def bass_sustain(t0, root, g=0.6, dur=BAR):
    f = mtof(root)
    t = T(dur + 0.5)
    s = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)
    place('duck', t0, np.tanh(s * env(len(t), 0.02, 0.5, dur - 0.1) * 1.3).astype(F32), g * 0.45)


def bass_8ths(t0, root, act, g=0.5, octave_jump=False, upto=8):
    fb = mtof(root)
    for k in range(upto):
        f_ = fb * (2 if (octave_jump and k % 2 == 1) else 1)
        t = T(0.26)
        s = np.sin(2 * np.pi * f_ * t) + 0.27 * polyblep_saw(f_, t)
        s = filt(sos_lp(700), s) * env(len(t), 0.004, 0.05, 0.2)
        place('duck', t0 + k * BEAT / 2, np.tanh(s * 1.8).astype(F32), g * 0.45)


# ------------------------------------------------------------------ arrangement
INTRO_CH = ['i', 'i', 'VI', 'VI', 'III', 'VII', 'VI', 'V']
GAL_CH = ['VI', 'VII', 'i', 'i', 'VI', 'VII', 'III', 'V']
CONCEPT_CH = ['i', 'VI', 'III', 'VII']
PROB_CH = ['i', 'iv', 'VI', 'V']
MONT_CH = ['i', 'VI', 'VII', 'V', 'i', 'VI', 'VII', 'V']
LOGO_CH = ['VI', 'VII', 'i', 'VI', 'VII', 'I']

for b in range(NB):
    t0 = b * BAR
    s = shot_at_frame(b * 120)
    mood = s['mood']
    act = s['act']
    lb = (b * 120 - s['start']) // 120
    nb = (s['end'] - s['start']) // 120
    sid = s['id']

    if mood == 'intro':
        name = INTRO_CH[b]
        notes, root = chord(name, 0)
        cut = [350, 450, 700, 900, 1200, 1500, 900, 1600][b]
        g = [0.35, 0.6, 0.8, 0.85, 0.9, 1.0, 0.75, 0.9][b]
        pad_bar(t0, notes, cut, g)
        if 2 <= b <= 5:
            bass_sustain(t0, root, 0.55 * (b - 1) / 4)
        if b in (4, 5):
            arp_bar(t0, notes, 0, 0.5, sixteenth=False)
        if b <= 3:
            K(t0, 0.45)
            K(t0 + 0.6 * BEAT, 0.3)
        elif b in (4, 5):
            for q in range(4):
                K(t0 + q * BEAT, 0.5 + 0.1 * q + (b - 4) * 0.15)
                place('drums', t0 + (q + 0.5) * BEAT, hat(), 0.25, pan=0.3)
        elif b == 7:
            K(t0 + BEAT, 1.0)
            hits = list(np.arange(2, 3, 0.25)) + list(np.arange(3, 3.5, 0.125)) + list(np.arange(3.5, 4, 0.0625))
            for i, h in enumerate(hits):
                place('drums', t0 + h * BEAT, snare(), 0.15 + 0.6 * i / len(hits), pan=0.1, rsend=0.2)
        continue

    if mood == 'galaxy':
        if act == 0:
            name = GAL_CH[lb % 8]
            notes, root = chord(name, 1)
            pad_bar(t0, notes, 2600, 1.0)
            arp_bar(t0, notes, 1, 0.55, bright=1.4)
            bass_sustain(t0, root, 0.5)
            if lb >= 2:
                K(t0, 0.9)
                K(t0 + 2 * BEAT, 0.7)
                for q in (0.5, 1.5, 2.5, 3.5):
                    place('drums', t0 + q * BEAT, hat(), 0.22, pan=0.3)
            if lb == 7:
                hits = list(np.arange(2, 3, 0.25)) + list(np.arange(3, 4, 0.125))
                for i, h in enumerate(hits):
                    place('drums', t0 + h * BEAT, snare(), 0.2 + 0.6 * i / len(hits), rsend=0.2)
        else:
            name = ['VI', 'VII', 'VI', 'V'][lb % 4]
            notes, root = chord(name, 0)
            pad_bar(t0, notes, 3000, 1.0)
            arp_bar(t0, notes, 5, 0.45, bright=1.5)
            bass_sustain(t0, root, 0.5)
        continue

    if mood == 'title':
        name = ['i', 'VI'][lb % 2]
        notes, root = chord(name, act)
        pad_bar(t0, notes, 2600, 1.0)
        bass_sustain(t0, root, 0.6)
        K(t0, 1.1)
        K(t0 + 2 * BEAT, 0.9)
        if lb == 1:
            arp_bar(t0, notes, act, 0.8)
            K(t0 + 3 * BEAT, 0.7)
            K(t0 + 3.5 * BEAT, 0.8)
        continue

    if mood == 'montage':
        name = MONT_CH[lb % 8]
        notes, root = chord(name, 0)
        pad_bar(t0, notes, 4200, 0.85)
        arp_bar(t0, notes, 5, 1.0)
        bass_8ths(t0, root, 5, 0.5, True, upto=8 if lb != 7 else 4)
        last = lb == nb - 1
        for q in range(4):
            if last and q >= 2:
                continue
            K(t0 + q * BEAT, 1.0)
        for q in (1, 3):
            if not (last and q == 3):
                place('drums', t0 + q * BEAT, clap(), 0.9, pan=-0.05, rsend=0.18)
        for k in range(16):
            if last and k >= 8:
                continue
            place('drums', t0 + k * BEAT / 4, hat(), 0.32 if k % 4 == 2 else 0.14, pan=0.35)
        if last:
            hits = list(np.arange(2, 3, 0.25)) + list(np.arange(3, 4, 0.125))
            for i, h in enumerate(hits):
                place('drums', t0 + h * BEAT, snare(), 0.2 + 0.7 * i / len(hits), rsend=0.2)
        continue

    if mood == 'logo':
        name = LOGO_CH[min(lb, 5)]
        notes, root = chord(name, 0)
        dur = BAR if lb < 5 else 4.0
        pad_bar(t0, notes, [3800, 3800, 3600, 3400, 3200, 3000][min(lb, 5)], 1.0, dur=dur, a=0.08, r=1.2 if lb < 5 else 2.5)
        bass_sustain(t0, root, 0.6 if lb < 5 else 0.5, dur=dur)
        if lb == 0:
            K(t0, 1.2)
        if 1 <= lb <= 4:
            place('drums', t0, kick(1.6), 0.4)
            kick_times.append((t0, 0.5))
            place('drums', t0 + 2.5 * BEAT, kick(1.6), 0.6 * 0.4)
        continue

    # ---------------- concept / problem
    if mood == 'problem':
        card_bars = max(2, int(np.ceil(card_of(s) / 120)))
        name = PROB_CH[lb % 4]
        notes, root = chord(name, act)
        if lb < card_bars:  # reading the question: calm
            pad_bar(t0, notes, 900, 0.8)
            bass_sustain(t0, root, 0.4)
            for k in range(8):
                place('drums', t0 + k * BEAT / 2, tick(3200, 0.004), 0.05 + (0.04 if k % 2 == 0 else 0), pan=0.4)
        else:  # solving: light groove that builds
            prog_ = (lb - card_bars) / max(1, nb - card_bars)
            pad_bar(t0, notes, 1200 + 900 * prog_, 0.75)
            arp_bar(t0, notes, act, 0.55 + 0.25 * prog_, sixteenth=prog_ > 0.35)
            bass_8ths(t0, root, act, 0.38)
            K(t0, 0.75)
            K(t0 + 2 * BEAT, 0.65)
            if prog_ > 0.5:
                K(t0 + 2.75 * BEAT, 0.4)
            place('drums', t0 + 3 * BEAT, rim(), 0.35, pan=-0.2, rsend=0.15)
            place('drums', t0 + 1 * BEAT, rim(), 0.2, pan=0.2, rsend=0.15)
            for q in (0.5, 1.5, 2.5, 3.5):
                place('drums', t0 + q * BEAT, hat(), 0.18, pan=0.3)
        continue

    # concept
    name = CONCEPT_CH[lb % 4]
    notes, root = chord(name, act)
    energy = {1: 2, 2: 3, 3: 3, 4: 4}.get(act, 2)
    pad_bar(t0, notes, 1500 + energy * 380, 0.8)
    arp_bar(t0, notes, act, 1.0)
    bass_8ths(t0, root, act, 0.5, octave_jump=energy >= 3)
    for q in range(4):
        K(t0 + q * BEAT, 1.0)
    if energy >= 4 and lb % 4 == 3:
        K(t0 + 3.5 * BEAT, 0.6)
    for q in (1, 3):
        place('drums', t0 + q * BEAT, clap(), 0.8 if energy >= 3 else 0.6, pan=-0.05, rsend=0.18)
    sub = 4 if energy >= 3 else 2
    for k in range(4 * sub):
        if sub == 2 and k % 2 == 0:
            continue
        place('drums', t0 + (k / sub) * BEAT, hat(), 0.3 if k % sub == sub // 2 else 0.14, pan=0.35)
    if energy >= 3:
        for q in (0.5, 1.5, 2.5, 3.5):
            place('drums', t0 + q * BEAT, hat(True), 0.1, pan=-0.3)
    if sid in LEAD_SHOTS and 1 <= lb < nb:
        ph = (PHRASE_A + PHRASE_B)[(lb - 1) % 8]
        for bt, d, m in ph:
            place('lead', t0 + bt * BEAT, lead_note(m + KEY[act] - (12 if KEY[act] > 3 else 0), d * BEAT), 0.26, rsend=0.3, dsend=0.3)

# logo bells melody + final shimmer (from v1)
logo = next(x for x in SHOTS if x['mood'] == 'logo')
L0 = logo['start'] / 60
FIN_MEL = [
    [(0, 2, 81), (2, 2, 84)],
    [(0, 2, 83), (2, 2, 86)],
    [(0, 2, 84), (2, 2, 88)],
    [(0, 2, 89), (2, 1, 88), (3, 1, 84)],
    [(0, 3, 86), (3, 1, 83)],
    [(0, 4, 85)],
]
for i, ph in enumerate(FIN_MEL):
    for bt, d, m in ph:
        place('lead', L0 + i * BAR + bt * BEAT, bell(m, 3.5 if i < 5 else 6.0, 2.2, 3.0), 0.5, pan=0.2 * np.sin(i + bt), rsend=0.5, dsend=0.2)
        place('lead', L0 + i * BAR + bt * BEAT, lead_note(m - 12, d * BEAT), 0.16, rsend=0.4)
for m in (69, 73, 76, 81, 85, 88):
    place('lead', L0 + 5 * BAR + 0.02 * (m - 69), bell(m, 6.0, 1.2, 2.0), 0.18, pan=(m - 78) / 20, rsend=0.6)

# intro bells (bars 2-5) + intro SFX (identical to v1)
for b, bt, m in [(2, 0, 76), (2, 1.5, 72), (2, 3, 69), (3, 0, 77), (3, 2, 72), (4, 0, 79), (4, 1.5, 76), (4, 3, 72), (5, 0, 74), (5, 2, 71)]:
    place('lead', b * BAR + bt * BEAT, bell(m, 3.0, 2.0), 0.32, pan=0.3 * np.sin(b * 3 + bt), rsend=0.55, dsend=0.3)
PENTA = [69, 72, 74, 76, 79, 81, 84, 86, 88, 91, 93, 96, 98]
for k in range(12):
    place('fx', fr(60 + 10 * k), keyclick(), 0.45, pan=float(rng.uniform(-0.2, 0.2)))
place('fx', fr(236), blip(89, 0.3, 0.1), 0.25, rsend=0.4)
place('fx', fr(240), boom(2.0, 90, 40), 0.45, rsend=0.5)
place('fx', fr(240), whoosh(1.2, 3000.0, 300.0), 0.5, rsend=0.3)
for i, m in enumerate([72, 76, 79, 84]):
    place('lead', fr(480 + 30 * i), bell(m, 2.5, 2.5), 0.4, pan=-0.45 + 0.3 * i, rsend=0.5, dsend=0.25)
place('fx', fr(560), riser(round(fr(735) - fr(560), 3), 200.0, 9000.0), 0.42, rsend=0.2)
place('fx', fr(735), whoosh(1.4, 6000.0, 150.0), 0.7, rsend=0.4)
place('fx', fr(735), boom(2.5, 70, 32), 0.55, rsend=0.5)
for k in range(70):
    place('fx', fr(740) + k * 0.021, blip(int(rng.choice(PENTA)) + 12, 0.12, 0.03), 0.05 + 0.08 * k / 70, pan=float(rng.uniform(-0.8, 0.8)), rsend=0.5)
place('fx', fr(870), crash(3.0), 0.3, rsend=0.5)
for i in range(4):
    place('fx', fr(900 + 9 * i), blip([81, 84, 88, 93][i], 0.25, 0.07), 0.18, pan=-0.4 + 0.27 * i, rsend=0.3)

# ------------------------------------------------------------------ transitions
for i, s in enumerate(SHOTS):
    t = s['start'] / 60
    if i == 0:
        continue
    big = s['mood'] in ('title', 'galaxy', 'montage', 'logo') and (s['mood'] != 'galaxy' or s['act'] == 0)
    if big:
        scale = 1.3 if s['mood'] in ('logo',) or s['id'] == 'galaxy' else 1.0
        place('fx', t, boom(3.5), 0.9 * scale, rsend=0.4)
        place('fx', t, crash(3.5 if s['mood'] != 'logo' else 5.0), 0.5 * scale, rsend=0.4)
        rv = crash(1.6)[::-1]
        place('fx', t - len(rv) / SR, rv, 0.42, rsend=0.2)
        rd = 3.2 if s['id'] == 'galaxy' else 2.0
        place('fx', t - rd, riser(rd), 0.28, rsend=0.2)
        kick_times.append((t, 1.4))
    else:
        place('fx', t - 0.35, whoosh(0.7, 350.0, 3200.0 if i % 2 else 2400.0), 0.42, rsend=0.15)

# ------------------------------------------------------------------ cues
STAB_I = 0
for s in SHOTS:
    base = s['start'] / 60
    key = KEY[s['act']]
    for c in s['cues']:
        t = base + c[0] / 60
        typ = c[1]
        p = c[2] if len(c) > 2 and c[2] is not None else None
        if typ == 'blip':
            place('fx', t, blip(int(p or 76) + key, 0.22, 0.07), 0.2, pan=float(rng.uniform(-0.4, 0.4)), rsend=0.25)
        elif typ == 'tick':
            place('fx', t, tick(), 0.16, pan=float(rng.uniform(-0.5, 0.5)))
        elif typ == 'spark':
            place('fx', t, blip(int(p or 84) + key + 12, 0.12, 0.03), 0.09, pan=float(rng.uniform(-0.7, 0.7)), rsend=0.5)
        elif typ == 'error':
            place('fx', t, buzz(), 0.26)
        elif typ == 'chime':
            place('fx', t, bell(88 + key, 2.0, 2.0), 0.2, rsend=0.45)
        elif typ == 'bell':
            place('fx', t, bell(int(p or 84) + key, 2.0, 2.0), 0.2, rsend=0.45)
        elif typ == 'whoosh':
            place('fx', t - 0.1, whoosh(0.5, 600.0, 4000.0), 0.28, rsend=0.2)
        elif typ == 'riser2':
            place('fx', t, riser(1.5, 300.0, 6000.0), 0.2, rsend=0.2)
        elif typ == 'gliss':
            place('fx', t, gliss(), 0.13, rsend=0.4)
        elif typ == 'stamp':
            place('fx', t, stampsfx(), 0.5, rsend=0.2)
        elif typ == 'step':
            place('fx', t, bell(84 + key, 1.2, 1.5), 0.12, rsend=0.3)
        elif typ == 'reveal':
            place('fx', t - 1.5, riser(1.5, 400.0, 8000.0), 0.24, rsend=0.2)
            place('fx', t, boom(2.5, 70, 35), 0.55, rsend=0.4)
            place('fx', t, crash(2.5), 0.25, rsend=0.4)
            notes, root = chord('i', s['act'])
            for m in notes:
                place('fx', t, supersaw(m + 12, 0.5, 5000, 0.004, 0.9), 0.12, rsend=0.4)
            place('fx', t, bell(notes[-1] + 12, 3.0, 2.0), 0.22, rsend=0.5)
            kick_times.append((t, 1.1))
        elif typ == 'stab':
            b = int(t // BAR)
            sh = shot_at_frame(b * 120)
            lbb = (b * 120 - sh['start']) // 120
            notes, root = chord(MONT_CH[lbb % 8], 0)
            for m in notes + [notes[0] + 12]:
                place('fx', t, supersaw(m + 12, 0.12, 6000, 0.003, 0.18, 5), 0.11, rsend=0.25)
            place('fx', t, pluck(notes[int(p or 0) % 4] + 24, 0.3, 1.6), 0.22, pan=0.5 * np.sin(int(p or 0)), dsend=0.2)

print('events placed')

# ------------------------------------------------------------------ sidechain
duck = np.ones(N, F32)
for tk, g in kick_times:
    i0 = int(tk * SR)
    n = min(int(0.4 * SR), N - i0)
    if n <= 0:
        continue
    tt = np.arange(n) / SR
    duck[i0:i0 + n] = np.minimum(duck[i0:i0 + n], (1 - min(0.65, 0.55 * g) * np.exp(-tt / 0.12)).astype(F32))
buses['duck'] *= duck[:, None]
buses['lead'] *= (1 - 0.4 * (1 - duck))[:, None]
del duck

# ------------------------------------------------------------------ reverb (chunked) + delay
irn = int(3.2 * SR)
ti = np.arange(irn) / SR
ir = rng.standard_normal((irn, 2)) * np.exp(-ti / 0.5)[:, None]
ir = filt(sos_lp(5500), ir)
ir[: int(0.02 * SR)] = 0
ir /= np.sqrt((ir ** 2).sum(0))
wet = np.zeros((N, 2), F32)
CH = SR * 30
for c0 in range(0, N, CH):
    x = rev[c0:c0 + CH].astype(np.float64)
    for ch in range(2):
        y = signal.fftconvolve(x[:, ch], ir[:, ch])
        n = min(len(y), N - c0)
        wet[c0:c0 + n, ch] += y[:n].astype(F32)
del rev
wet = filt(sos_hp(180), wet).astype(F32)

d = int(0.375 * SR)
dsrc = filt(sos_lp(3500), filt(sos_hp(300), dly)).astype(F32)
del dly
echo = np.zeros((N, 2), F32)
for k in range(1, 7):
    sh = d * k
    g = 0.42 ** (k - 1)
    ch = (k - 1) % 2
    echo[sh:, ch] += dsrc[: N - sh, 0 if ch == 0 else 1] * g * 0.8
    echo[sh:, 1 - ch] += dsrc[: N - sh, 1 if ch == 0 else 0] * g * 0.25
del dsrc

# ------------------------------------------------------------------ mix
GAIN = {'duck': 1.0, 'lead': 0.6, 'drums': 0.9, 'fx': 0.6}
for k in buses:
    r = np.sqrt(np.mean(buses[k][:: 16] ** 2)) * GAIN[k]
    print(f'{k:6s} rms {20 * np.log10(r + 1e-9):6.1f} dB')
mix = buses['duck']
mix *= GAIN['duck']
for k in ('lead', 'drums', 'fx'):
    mix += buses[k] * GAIN[k]
    buses[k] = None
mix += wet * 0.55
del wet
mix += echo * 0.35
del echo
mix[:] = filt(sos_hp(28), mix)

mono = (mix ** 2).mean(1)
rms = np.sqrt(np.clip(signal.sosfilt(sos_lp(8), mono), 1e-9, None)).astype(F32)
del mono
thr = np.percentile(rms[:: 100], 70)
gain = np.where(rms > thr, (thr / rms) ** 0.4, 1.0).astype(F32)
mix *= gain[:, None]
mix /= np.abs(mix).max()
mix[:] = np.tanh(mix * 1.6) / np.tanh(1.6)
fi = int(0.05 * SR)
mix[:fi] *= np.linspace(0, 1, fi, dtype=F32)[:, None]
fo = int((TOTAL - 2.8) * SR)
mix[fo:] *= (np.linspace(1, 0, N - fo, dtype=F32) ** 1.5)[:, None]
mix *= 10 ** (-0.8 / 20) / np.abs(mix).max()
out = mix[: int(TOTAL * SR)]
sf.write('public/music2.wav', out, SR, subtype='PCM_24')
per_sec = np.sqrt(np.mean(out[: int(len(out) // SR) * SR].reshape(-1, SR, 2) ** 2, axis=(1, 2)))
np.save('audio/mix2_rms.npy', per_sec)
print('written', len(out) / SR, 's')
