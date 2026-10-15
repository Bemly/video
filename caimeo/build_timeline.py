"""Build timeline.js + voice.wav from chosen TTS takes.
usage: python3 build_timeline.py <lines_dir> <choice.json>
choice.json: {"1": 11, "2": 23, ...} -> seed per line id
"""
import json, sys, os
import numpy as np, soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 44100
FPS = 30
lines_dir, choice_path = sys.argv[1], sys.argv[2]
script = json.load(open(os.path.join(HERE, 'script.json')))
choice = json.load(open(choice_path))


def load(path):
    x, sr = sf.read(path, dtype='float32')
    if x.ndim > 1:
        x = x.mean(1)
    if sr != SR:
        import librosa
        x = librosa.resample(x, orig_sr=sr, target_sr=SR)
    # trim leading/trailing quiet
    env = np.convolve(np.abs(x), np.ones(441) / 441, mode='same')
    idx = np.where(env > 0.012)[0]
    if len(idx):
        a, b = max(0, idx[0] - 1500), min(len(x), idx[-1] + 4000)
        x = x[a:b]
    fade = int(0.01 * SR)
    x[:fade] *= np.linspace(0, 1, fade)
    x[-fade * 3:] *= np.linspace(1, 0, fade * 3)
    return x


clips = {}
for ln in script['lines']:
    clips[ln['id']] = load(os.path.join(lines_dir, 'l%02d_s%d.wav' % (ln['id'], choice[str(ln['id'])])))

# scene grouping and minimum lengths
SCENE_DEF = {
    'title': dict(type='title', min=5.2, lead=1.7),
    'rule': dict(type='rule', min=7.0),
    'kayles': dict(type='game', min=6.4, params=dict(make='Kayles', title='koapil', seed=101, level=13)),
    'wythoff': dict(type='game', min=6.4, params=dict(make='Wythoff', title='koagora', seed=202, level=13, interval=0.9)),
    'hackenbush': dict(type='game', min=6.6, params=dict(make='Hackenbush', title='koagil', seed=303, level=13, interval=1.0)),
    'domineering': dict(type='game', min=6.4, params=dict(make='Domineering', title='koadom', seed=404, level=13, kind='domino', interval=0.7)),
    'chomp': dict(type='game', min=6.4, params=dict(make='Chomp', title='koatsim', seed=505, level=13, interval=0.85)),
    'infinite': dict(type='infinite', min=8.0),
    'grundy': dict(type='grundy', min=8.5),
    'machine': dict(type='machine', min=8.0),
    'montage': dict(type='montage', min=6.5),
    'outro': dict(type='outro', min=6.5),
}

groups = []
for ln in script['lines']:
    if groups and groups[-1]['name'] == ln['scene']:
        groups[-1]['lines'].append(ln)
    else:
        groups.append(dict(name=ln['scene'], lines=[ln]))

t = 0.0
scenes, tl_lines = [], []
voice_events = []
for g in groups:
    d = SCENE_DEF[g['name']]
    start = t
    lt = d.get('lead', 0.8)
    params = dict(d.get('params', {}))
    for i, ln in enumerate(g['lines']):
        dur = len(clips[ln['id']]) / SR
        ls = start + lt
        tl_lines.append(dict(id=ln['id'], start=round(ls, 3), end=round(ls + dur, 3), math=ln['math'], say=ln['say'], zh=ln['zh']))
        voice_events.append((ls, ln['id']))
        if g['name'] == 'rule' and i == 1:
            params['line3'] = ls
        if g['name'] == 'outro':
            params['l2'] = lt + dur * 0.55
        lt += dur + 0.55
    length = max(d['min'], lt + 0.5)
    if g['name'] == 'rule':
        length = max(length, params['line3'] - start + 3.3)
    scenes.append(dict(type=d['type'], name=g['name'], start=round(start, 3), end=round(start + length, 3), params=params))
    t = start + length

duration = round(t, 3)
tl = dict(fps=FPS, duration=duration, scenes=scenes, lines=tl_lines)
open(os.path.join(HERE, 'timeline.js'), 'w').write('window.TIMELINE = ' + json.dumps(tl, ensure_ascii=False, indent=1) + ';\n')
json.dump(tl, open(os.path.join(HERE, 'timeline.json'), 'w'), ensure_ascii=False, indent=1)

voice = np.zeros(int((duration + 1) * SR), dtype=np.float32)
for ts, lid in voice_events:
    c = clips[lid]
    a = int(ts * SR)
    voice[a:a + len(c)] += c
voice = voice[:int(duration * SR)]
peak = np.max(np.abs(voice)) + 1e-9
voice *= 0.89 / peak
sf.write(os.path.join(HERE, 'voice.wav'), voice, SR)
print('duration', duration)
for s in scenes:
    print(s['name'], s['start'], s['end'])
