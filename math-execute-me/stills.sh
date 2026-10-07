#!/bin/zsh
# 用法: ./stills.sh out.png beat1 beat2 ...
out=$1; shift; T=(); for b in "$@"; do T+=($(python3 -c "print(round(0.2177+$b*60/130,3))")); done
node still.mjs $out $T && sips -Z 1900 $out --out ${out%.png}s.png >/dev/null
