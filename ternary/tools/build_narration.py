#!/usr/bin/env python3
"""Build ternary/audio/narration.m4a from local 工程 voice clips.

Reads (local-only, not in repo):
  ../../影片/三进制/timeline.json  (line starts)
  ../../影片/三进制/工程/voice/L*.mp3 (TTS per line)
Places each clip at its line start, pads to cover TL.total.
Usage: python3 tools/build_narration.py   (run inside ternary/)
Requires ffmpeg on PATH.
"""
import json, os, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.environ.get('TERNARY_SRC', '/Volumes/\uf8ff/影片/三进制')
OUT = os.path.join(ROOT, 'audio', 'narration.m4a')

tl = json.load(open(os.path.join(SRC, 'timeline.json')))
os.makedirs(os.path.join(ROOT, 'audio'), exist_ok=True)
cmd = ['ffmpeg', '-hide_banner', '-y', '-v', 'error']
fc = []
for i, l in enumerate(tl['lines']):
    ms = int(l['start'] * 1000)
    cmd += ['-i', os.path.join(SRC, '工程/voice', f"{l['id'].upper()}.mp3")]
    fc.append(f"[{i}:a]adelay={ms}|{ms},aresample=48000[a{i}]")
mix = ''.join(f'[a{i}]' for i in range(len(tl['lines'])))
fc.append(f"{mix}amix=inputs={len(tl['lines'])}:normalize=0:duration=longest,"
          f"apad=whole_dur={tl['total'] + 1}[a]")
cmd += ['-filter_complex', ';'.join(fc), '-map', '[a]',
        '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', OUT]
r = subprocess.run(cmd, capture_output=True, text=True)
print('rc:', r.returncode, r.stderr[-300:] if r.returncode else OUT)
