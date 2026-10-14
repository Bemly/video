# Sinytra —— 让火狐接管安卓系统 WebView（7:53）

Firefox（Gecko）接管 Android 系统 WebView 内核的技术讲解视频，日中双语字幕。在线看：https://bili.bemly.moe/sinytra/

- 浏览器实时渲染（DOM 图解 + WebGL 狐火着色器背景），音频时钟驱动，无需构建。
- `index.html`：播放页（单文件：样式 + 14 场景 + shader + 播放器；点击播放，空格暂停，←/→ 5 秒，F 全屏，R 重播，底部进度条可点）；`?t=秒` 冻结单帧（给出片 / 抽 still 用）。
- `timeline.json`：14 场景台词起止（`build.py` 生成，播放页启动时加载）。
- `script.json`：日中双语台词源（Fish 配音）。
- `audio/mix.mp3`：成品混音（人声 + 底垫，与成片一致，播放页做主时钟）。
- `build.py`：拉取 Fish 配音分句、切静音、铺时间轴，写 `timeline.json` + 本地 `build/voice.wav` / `build/mix.wav`（wav 已忽略，未入库）。
- `render.mjs`：Playwright 逐帧抓 `renderAt(t)` 进 ffmpeg（配 `build/mix.wav` 出成片，仓库根备 `python3 -m http.server 8765`）；`stills.mjs`：逐场景抽 still 做质检。
- `cover.jpg`：取自 `still_intro`。

成片 mp4（778MB）、`build/` 中间产物与 `crash/` 本地日志均未入库。
