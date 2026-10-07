import asyncio, json, os, subprocess, edge_tts
from script import SCRIPT
VOICE, RATE = "zh-CN-YunyangNeural", "-3%"
os.makedirs("audio", exist_ok=True)
async def one(scene, key, text):
    out = f"audio/{scene}_{key}.mp3"
    meta = out.replace(".mp3", ".json")
    if os.path.exists(meta) and json.load(open(meta))["text"] == text:
        return
    c = edge_tts.Communicate(text, VOICE, rate=RATE)
    sents = []
    with open(out, "wb") as f:
        async for ch in c.stream():
            if ch["type"] == "audio": f.write(ch["data"])
            elif ch["type"] == "SentenceBoundary":
                sents.append([ch["offset"]/1e7, (ch["offset"]+ch["duration"])/1e7, ch["text"]])
    dur = float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",out]))
    json.dump({"text": text, "dur": dur, "sents": sents}, open(meta,"w"), ensure_ascii=False)
async def main():
    sem = asyncio.Semaphore(6)
    async def run(*a):
        async with sem:
            for i in range(4):
                try: return await one(*a)
                except Exception as e: print("retry", a[:2], e); await asyncio.sleep(2)
    await asyncio.gather(*[run(s,k,t) for s,beats in SCRIPT.items() for k,t in beats])
asyncio.run(main())
tot=0
for s,beats in SCRIPT.items():
    d=sum(json.load(open(f"audio/{s}_{k}.json"))["dur"] for k,_ in beats); tot+=d
    print(f"{s}: {d:6.1f}s")
print("total", tot/60, "min")
