#!/bin/sh
# voice + ambient bed -> audio/mix.mp3
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 audio/voice.wav)
ffmpeg -y -loglevel error -i audio/voice.wav -filter_complex "
sine=f=55:d=$D,volume=0.10[a];sine=f=82.5:d=$D,volume=0.05[b];sine=f=110.3:d=$D,volume=0.03,tremolo=f=0.2:d=0.7[c];
anoisesrc=d=$D:c=brown:a=0.25,lowpass=f=420,tremolo=f=0.13:d=0.5[n];
[a][b][c][n]amix=inputs=4:normalize=0,afade=t=in:d=1.5,areverse,afade=t=in:d=2,areverse[bed];
[0:a]volume=1.5,aresample=48000[v];[v][bed]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.95,pan=stereo|c0=c0|c1=c0[o]" -map "[o]" -c:a libmp3lame -b:a 192k audio/mix.mp3
