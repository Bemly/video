#!/bin/zsh
# 用法: ./mux.sh out/prev out/preview.mp4
pre=$1; out=$2
ls ${pre}_*.mp4 | sort | sed "s|^|file '$(pwd)/|; s|$|'|" > ${pre}_list.txt
ffmpeg -v error -y -f concat -safe 0 -i ${pre}_list.txt -i song.m4a -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -shortest -movflags +faststart $out
ffprobe -v error -show_entries format=duration -of csv=p=0 $out
