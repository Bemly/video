import json, subprocess, wave, struct, os
SR=48000; LEAD=1.0
cues=json.load(open('script.json'))
pcm=bytearray(b'\0\0'*int(SR*LEAD)); t=LEAD; out=[]
for c in cues:
    f=f"audio/{c['id']}.wav"
    subprocess.run(['say','-v','Samantha','-r','178','--data-format=LEI16@48000','-o',f,c['say']],check=True)
    w=wave.open(f); d=w.readframes(w.getnframes()); w.close()
    # trim trailing/leading near-silence
    s=struct.unpack('<%dh'%(len(d)//2),d)
    a=0
    while a<len(s) and abs(s[a])<200: a+=1
    b=len(s)
    while b>a and abs(s[b-1])<200: b-=1
    a=max(0,a-480); b=min(len(s),b+2400)
    d=d[a*2:b*2]; dur=(b-a)/SR
    out.append({**c,'t':round(t,3),'d':round(dur,3)})
    pcm+=d; t+=dur
    g=int(SR*c['gap']); pcm+=b'\0\0'*g; t+=c['gap']
w=wave.open('audio/voice.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(bytes(pcm)); w.close()
open('timeline.js','w').write('window.TIMELINE='+json.dumps({'duration':round(t,3),'cues':out},ensure_ascii=False,indent=1)+';\n')
print('duration',t)
for o in out: print(o['id'],o['t'],o['d'])
