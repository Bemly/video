#!/usr/bin/env python3
"""Fit Fish raw per-line wavs to narration/cues.csv slots, assemble full mix, mux with out/dieji.mp4.
Usage:
  python3 tools/fish_fit_mux.py --raw-dir out/tts/fish_raw --fit-dir out/tts/fish_fit
Compares each raw duration to slot duration_s:
  raw <= slot -> pad trailing silence to slot (keeps natural pace)
  raw > slot  -> atempo speed-up (rate=raw/slot, chained if >2.0), then pad/trim to exact samples
Then places each fitted line at its cue start, fills gaps with silence, writes:
  out/tts/fish_full_48k.wav, out/dieji_en.mp4
Verifies final durations equal csv/srt slots.
"""
import argparse, csv, subprocess, sys
from pathlib import Path

def tc(s):
    m = int(s.split(':')[0]); sec = float(s.split(':')[1]); return m*60+sec

def probe_dur(p):
    r = subprocess.run(['ffprobe','-v','error','-show_entries','format=duration',
                        '-of','default=nw=1:nk=1',str(p)],capture_output=True,text=True)
    return float(r.stdout.strip())

def atempo_chain(rate):
    # ffmpeg atempo supports 0.5-2.0 per filter; chain for larger rates
    fs=[]
    r=rate
    while r>2.0:
        fs.append('atempo=2.0'); r/=2.0
    while r<0.5:
        fs.append('atempo=0.5'); r/=0.5
    fs.append(f'atempo={r:.6f}')
    return ','.join(fs)

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--raw-dir',default='out/tts/fish_raw')
    ap.add_argument('--fit-dir',default='out/tts/fish_fit')
    ap.add_argument('--cues',default='narration/cues.csv')
    ap.add_argument('--video',default='out/dieji.mp4')
    ap.add_argument('--sr',type=int,default=48000)
    args=ap.parse_args()
    root=Path(__file__).resolve().parent.parent
    cues_p=root/args.cues; raw_d=root/args.raw_dir; fit_d=root/args.fit_dir; vid=root/args.video
    fit_d.mkdir(parents=True,exist_ok=True)
    rows=list(csv.DictReader(open(cues_p,encoding='utf-8-sig')))
    print(f'{len(rows)} cues, video={vid}')
    report=[]
    for r in rows:
        i=int(r['id']); slot=float(r['duration_s'])
        raw=raw_d/f'line_{i}.wav'
        fit=fit_d/f'line_{i}.wav'
        if not raw.exists():
            print(f'MISSING raw line_{i} (slot {slot}s): {r["english"][:50]}'); report.append((i,slot,None,None,'missing')); continue
        dur=probe_dur(raw)
        if dur<=slot+1e-6:
            # pad to exact slot
            cmd=['ffmpeg','-y','-v','error','-i',str(raw),'-af',
                 f'apad=whole_dur={slot:.3f}', '-ar',str(args.sr),'-ac','1','-c:a','pcm_s16le',str(fit)]
            subprocess.run(cmd,check=True)
            action=f'pad+{slot-dur:.2f}s'
            rate=1.0
        else:
            rate=dur/slot
            chain=atempo_chain(rate)
            # atempo then pad/trim to exact slot
            cmd=['ffmpeg','-y','-v','error','-i',str(raw),'-af',
                 f'{chain},apad=whole_dur={slot:.3f},atrim=0:{slot:.3f}',
                 '-ar',str(args.sr),'-ac','1','-c:a','pcm_s16le',str(fit)]
            subprocess.run(cmd,check=True)
            action=f'atempo{rate:.3f}'
        # verify
        fd=probe_dur(fit)
        ok=abs(fd-slot)<0.02
        report.append((i,slot,dur,fd,action+' OK' if ok else action+' MISMATCH'))
    for i,slot,dur,fd,act in report:
        print(f'#{i:3d} slot={slot:5.2f} raw={dur if dur is None else f"{dur:5.2f}"} fit={fd if fd is None else f"{fd:5.2f}"} {act}')
    missing=sum(1 for x in report if x[4]=='missing')
    sped=sum(1 for x in report if x[4].startswith('atempo'))
    print(f'done: {len(report)-missing}/{len(report)} fitted, {sped} sped-up, {missing} missing')
    if missing: sys.exit(2)
    # assemble full mix at cue starts
    import wave, struct
    sr=args.sr
    film_dur=probe_dur(vid)
    total=int(round(film_dur*sr))
    import array
    mix=array.array('h',[0])*total
    for r in rows:
        i=int(r['id']); st=tc(r['start']); slot=float(r['duration_s'])
        fit=fit_d/f'line_{i}.wav'
        w=wave.open(str(fit),'rb')
        assert w.getframerate()==sr and w.getnchannels()==1, (fit,w.getframerate(),w.getnchannels())
        n=w.getnframes(); data=array.array('h',w.readframes(n)); w.close()
        off=int(round(st*sr))
        # exact slot samples
        want=int(round(slot*sr))
        if len(data)<want: data.extend([0]*(want-len(data)))
        else: data=data[:want]
        for k,v in enumerate(data):
            if off+k<total: mix[off+k]=max(-32768,min(32767,mix[off+k]+v))
    full_wav=root/'out/tts/fish_full_48k.wav'
    w=wave.open(str(full_wav),'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(mix.tobytes()); w.close()
    print(f'wrote {full_wav} {film_dur:.2f}s')
    out_mp4=root/'out/dieji_en.mp4'
    cmd=['ffmpeg','-y','-v','error','-i',str(vid),'-i',str(full_wav),
         '-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k',
         '-shortest',str(out_mp4)]
    subprocess.run(cmd,check=True)
    print(f'wrote {out_mp4}')
    # final verify
    ad=probe_dur(out_mp4)
    print(f'final mp4 dur={ad:.3f} film={film_dur:.3f} diff={ad-film_dur:.3f}')
if __name__=='__main__':
    main()
