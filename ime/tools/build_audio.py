import json, subprocess, wave, os
R=44100
lines=json.load(open('script.json'))
out=wave.open('audio/voice.wav','wb'); out.setnchannels(1); out.setsampwidth(2); out.setframerate(R)
t=1.2; out.writeframes(b'\0\0'*int(t*R)); tl=[]; prev=None
for i,l in enumerate(lines):
    f=f'audio/l{i:02d}.wav'
    subprocess.run(['say','-v','Tingting','-o',f,'--file-format=WAVE','--data-format=LEI16@44100',l.get('say',l['sub'])],check=True)
    w=wave.open(f); n=w.getnframes(); d=w.readframes(n); w.close()
    gap=0 if prev is None else (1.3 if l['sec']!=prev else 0.4)
    out.writeframes(b'\0\0'*int(gap*R)); t+=gap
    tl.append({'i':i,'sec':l['sec'],'sub':l['sub'],'start':round(t,3),'end':round(t+n/R,3)})
    out.writeframes(d); t+=n/R; prev=l['sec']
out.writeframes(b'\0\0'*int(2.5*R)); t+=2.5; out.close()
json.dump({'duration':round(t,3),'lines':tl},open('timeline.json','w'),ensure_ascii=False,indent=1)
print('total',t)
for x in tl: print(x['i'],x['sec'],x['start'],round(x['end']-x['start'],2))
