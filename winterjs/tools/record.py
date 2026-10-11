#!/usr/bin/env python3
"""实机录屏：在伪终端里按剧本真实运行 winterjs，录成 asciicast v2。

用法：python3 tools/record.py casts/<name>.json   → public/casts/<name>.cast

剧本 JSON：
  { "cols": 96, "rows": 22, "cwd": "...", "shell": true,
    "env": { "K": "V" },
    "steps": [
      { "type": "winterjs --eval '40 + 2'\\r", "cps": 14 },   # 逐字键入（\\r = 回车）
      { "key": "\\t" },                                         # 单键（Tab 等）
      { "wait": 1.2 },                                          # 停顿（秒）
      { "until": "42", "timeout": 20 }                          # 等待输出出现某文本
    ] }
shell=true 时起一个干净的 bash（PS1 为 "$ "）；否则直接运行 "cmd"。
"""
import json
import os
import pty
import re
import select
import struct
import sys
import time
import fcntl
import termios
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def main(spec_path):
    spec = json.loads(Path(spec_path).read_text("utf-8"))
    cols, rows = spec.get("cols", 96), spec.get("rows", 22)
    env = dict(os.environ)
    env.update({"TERM": "xterm-256color", "COLUMNS": str(cols), "LINES": str(rows), "PS1": "$ ", "PROMPT_COMMAND": ""})
    env.update(spec.get("env", {}))
    cwd = os.path.expanduser(spec.get("cwd", str(ROOT)))
    argv = ["bash", "--norc", "--noprofile", "-i"] if spec.get("shell", True) else spec["cmd"]

    pid, fd = pty.fork()
    if pid == 0:
        os.chdir(cwd)
        os.execvpe(argv[0], argv, env)
    fcntl.ioctl(fd, termios.TIOCSWINSZ, struct.pack("HHHH", rows, cols, 0, 0))

    t0 = time.monotonic()
    events, buf = [], []

    def pump(dur):
        end = time.monotonic() + dur
        while True:
            left = end - time.monotonic()
            if left <= 0:
                return
            r, _, _ = select.select([fd], [], [], left)
            if not r:
                return
            try:
                data = os.read(fd, 65536)
            except OSError:
                return
            if not data:
                return
            s = data.decode("utf-8", "replace")
            events.append([round(time.monotonic() - t0, 3), "o", s])
            buf.append(s)

    def plain():
        return re.sub(r"\x1b\[[0-9;?]*[ -/]*[@-~]|\x1b\][^\x07]*\x07", "", "".join(buf))

    last_mark = [0]
    pump(0.8)
    # 不入镜的准备命令（如 alias），执行后清屏并丢弃此前录像
    if spec.get("setup"):
        for cmd in spec["setup"]:
            os.write(fd, (cmd + "\r").encode())
            pump(0.4)
        os.write(fd, b"clear\r")
        pump(0.6)
        events.clear()
        buf.clear()
        t0 = time.monotonic()
    for st in spec["steps"]:
        if "type" in st:
            cps = st.get("cps", 16)
            for ch in st["type"]:
                if ch == "\r":
                    last_mark[0] = len(plain())  # 回车前的位置：之后出现的才算命令输出
                os.write(fd, ch.encode())
                pump(1 / cps)
        elif "key" in st:
            os.write(fd, st["key"].encode())
            pump(st.get("after", 0.6))
        elif "wait" in st:
            pump(st["wait"])
        elif "until" in st:
            deadline = time.monotonic() + st.get("timeout", 30)
            mark = last_mark[0]
            while st["until"] not in plain()[mark:] and time.monotonic() < deadline:
                pump(0.2)
            if st["until"] not in plain()[mark:]:
                print(f"!! 超时未见: {st['until']!r}", file=sys.stderr)
            pump(st.get("after", 0.4))
    pump(0.5)
    try:
        os.kill(pid, 9)
    except ProcessLookupError:
        pass

    name = Path(spec_path).stem
    out = ROOT / "public" / "casts" / f"{name}.cast"
    out.parent.mkdir(parents=True, exist_ok=True)
    with open(out, "w", encoding="utf-8") as f:
        f.write(json.dumps({"version": 2, "width": cols, "height": rows, "title": name}) + "\n")
        for e in events:
            f.write(json.dumps(e, ensure_ascii=False) + "\n")
    print(f"{out.relative_to(ROOT)}: {len(events)} events, {events[-1][0] if events else 0:.1f}s")
    print(plain()[-1500:])


if __name__ == "__main__":
    for p in sys.argv[1:]:
        main(p)
