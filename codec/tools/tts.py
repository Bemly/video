import json, re, os, sys, time, subprocess, urllib.request, urllib.parse
W = sys.argv[1]
S = json.load(open(f"{W}/proj/script.json"))
D = f"{W}/proj/voice"; os.makedirs(D, exist_ok=True)
CN = "零一二三四五六七八九"
def spoken(t):
    t = re.sub(r"H\.26(\d)", lambda m: "H二六"+CN[int(m.group(1))], t)
    t = re.sub(r"(AVS|AV|VP)(\d)(?!\d)", lambda m: m.group(1)+CN[int(m.group(2))], t)
    t = t.replace("VP三.2","VP三点二").replace("MPEG-2","MPEG二")
    t = t.replace("4:2:0","四二零").replace("4:2:2","四二二").replace("4:4:4","四四四")
    t = t.replace("VideoAnalyzer-Qt","Video Analyzer Qt").replace("x264","x二六四").replace("x265","x二六五")
    t = t.replace("VP6-E","VP六 E").replace("VP6-S","VP六 S").replace("SVT-AV1","SVT AV一")
    t = t.replace("High10","High十").replace("High422","High四二二").replace("High444","High四四四").replace("Main10","Main十")
    return t
order = S["segments"]
mode = sys.argv[2] if len(sys.argv) > 2 else "fwd"
if mode == "rev": order = order[::-1]
if mode == "mid": order = order[len(order)//2:] + order[:len(order)//2]
for s in order:
    out = f"{D}/{s['id']}.wav"
    if os.path.exists(out): continue
    try: os.close(os.open(out + ".lock", os.O_CREAT | os.O_EXCL))
    except FileExistsError: continue
    txt = spoken(s.get("say", s["text"]))
    s2 = spoken(s["text"]) if "say" not in s else txt
    for attempt in range(3):
        try:
            q = urllib.parse.urlencode({"text": txt, "format": "wav", "speed": "0"})
            r = json.loads(urllib.request.urlopen("https://api.milorapart.top/apis/mbAIsc?"+q, timeout=300).read())
            if r.get("code") != 200: raise Exception(r)
            urllib.request.urlretrieve(r["url"], out + ".part"); os.rename(out + ".part", out); break
        except Exception as e:
            print("retry", s["id"], e, flush=True); time.sleep(5)
    d = subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",out],capture_output=True,text=True).stdout.strip()
    print(s["id"], d, flush=True)
