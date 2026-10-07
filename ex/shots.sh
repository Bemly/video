#!/bin/zsh
# 用法: ./shots.sh out.png S00_Hook S01_Release ...   —— 每句取 30% 与 85% 两个时间点
out=$1; shift
T=($(python3 -c "
import json,sys; tl=json.load(open('timeline.json'))
ks=sys.argv[1:]; r=[]
for s in tl['scenes']:
  if s['key'] in ks:
    for k,b in s['beats'].items(): r+= [b['t0']+(b['t1']-b['t0'])*f for f in (.3,.85)]
print(' '.join(f'{x:.2f}' for x in r))" "$@"))
node still.mjs $out $T && sips -Z 1900 $out --out ${out%.png}s.png >/dev/null
