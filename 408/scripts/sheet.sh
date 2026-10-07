#!/bin/bash
# usage: scripts/sheet.sh name frame1 frame2 ... (renders stills and tiles 4 per row)
name=$1; shift
[ -z "$NORENDER" ] && node scripts/stills.mjs "$@" 2>&1 | grep -iv "^frame" | tail -3
inputs=""; n=0
for fr in "$@"; do inputs="$inputs -i out/stills/f$(printf %05d $fr).jpg"; n=$((n+1)); done
cols=4; rows=$(( (n + cols - 1) / cols )); pad=$(( rows*cols - n ))
filter=""; idx=0
for ((r=0; r<rows; r++)); do
  row=""
  for ((c=0; c<cols; c++)); do
    if (( idx < n )); then row="$row[$idx]"; else row="$row[b$idx]"; filter="${filter}color=black:s=960x540:d=1[b$idx];"; fi
    idx=$((idx+1))
  done
  filter="${filter}${row}hstack=$cols[r$r];"
done
rs=""; for ((r=0; r<rows; r++)); do rs="$rs[r$r]"; done
if (( rows > 1 )); then filter="${filter}${rs}vstack=$rows"; else filter="${filter%;}"; filter="${filter%\[r0\]}"; fi
ffmpeg -loglevel error -y $inputs -filter_complex "$filter" -frames:v 1 out/$name.jpg
