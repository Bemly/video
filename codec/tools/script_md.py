import json, sys
W = sys.argv[1]
TL = json.load(open(f"{W}/proj/timeline.json"))
def mmss(x): return f"{int(x // 60):02d}:{x % 60:04.1f}"
out = [f"# {TL['title']}", "", f"> {TL['subtitle']}", "", f"总时长 {mmss(TL['duration'])} · 配音 manbo-tts · 画面 WebGL 着色器实时渲染 · 录屏素材 VideoAnalyzer-Qt · 音效 Minecraft 26.3 sounds", ""]
ch = None
for s in TL["segments"]:
    if s["ch"] != ch:
        ch = s["ch"]; out += [f"## {ch}", ""]
    if not s.get("text"): continue
    meta = [f"画面：`{s['scene']}`"]
    if s.get("rec"): meta.append("录屏：" + "、".join(f"{a}s–{b}s" for a, b in s["rec"]))
    if s.get("sfx"): meta.append("音效：" + "、".join(s["sfx"]))
    out += [f"**[{mmss(s['start'])}] {s['id']}** · " + " · ".join(meta), "", s["text"], ""]
open(sys.argv[2], "w").write("\n".join(out))
print("ok")
