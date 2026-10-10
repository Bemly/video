# 叠界 · Two Worlds, One Body / Code Odyssey

同一个空间里叠着两个体素世界（干涸的 A、被淹没的 B）。玩家在两个世界各有一个身体，用弹簧相连；
两个世界的物理一旦矛盾，弹簧张力就会变成可见的「冲突场」。

在线体验：https://bili.bemly.moe/odyssey/（可玩 demo）·
https://bili.bemly.moe/coding-adventure/（讲解视频 15:21，浏览器实时渲染，中英双语字幕）

## 目录

- `demo/` 可玩的网页 demo（Three.js + 一个片元着色器）
- `film/` 15 分钟讲解视频的全部内容：分镜脚本、字幕、示意图、代码片段（浏览器实时渲染，无需构建）
- `src/` demo 和视频共用的世界生成、物理、着色器
- `tools/` 无头 Chromium 录制/出片/分镜模拟脚本
- `narration/` 台词 cue 表（`cues.csv` / `cues.md` / `cues.srt`，时间为视频内位置）
- `cover.jpg` / `cover-film.jpg` 站点卡片封面

## 玩 demo

```bash
node tools/serve.mjs
```

打开 <http://localhost:8123/>。

| 按键 | 作用 |
| --- | --- |
| WASD | 移动 |
| 空格 | 跳 / 上浮 |
| C | 下潜 |
| Shift | 冲刺（离墙 2 格以内冲，可以穿过 2 格厚以内的墙） |
| Q | 切换注视的世界 |
| F | 冲突场显示开关 |
| G | 世界修正开关（顶墙会把墙写进另一个世界，穿墙会留洞） |
| R | 重置 |

## 看视频（本地实时渲染版）

```bash
node tools/serve.mjs
```

打开 <http://localhost:8123/film/index.html>（←/→ 逐秒，空格播放）；
`?shot=<id>&lt=<秒>` 直达某镜，`?t=<秒>` 直达某时刻。

## 重新出片

```bash
node tools/render.mjs --jobs 4
```

用无头 Chromium 分 4 段并行逐帧录制，再拼成 `out/dieji.mp4`（1080p30）。
预览单帧：先 `node tools/record.mjs`，再打开
<http://localhost:8124/film/index.html?shot=court&lt=10>。

## 改内容

- 字幕和镜头：`film/script.js`。每个镜头的时长由字幕字数自动算出（`film/timeline.js` 里的 `BASE` / `PER_CHAR`），
  以后配音只需要把每句的时长换成音频长度。
- 实机镜头的输入是脚本化的，改完用 `node tools/shotsim.mjs <镜头 id>` 无头模拟，检查每句字幕开始时两个身体的位置和物理事件。
- `node tools/shotsim.mjs` 不带参数会打印整条时间线。
- 台词表：`node tools/cuesheet.mjs` → `narration/cues.{md,csv,srt}`。
- 物理参数：`src/physics.js` 顶部的 `P`；`flags` 里的开关用来复现视频里的各个 bug 版本。
