# AFM 拼音 · 介绍视频（4:33）

macOS 液态玻璃风格中文输入法的介绍视频。在线看：https://bili.bemly.moe/ime/

- 浏览器实时渲染（Canvas 2D + WebGL，录屏片段作视频纹理），音频时钟驱动，无需构建。
- `index.html`：播放页（含站内统一控制条：顶栏 + 播放/进度/时间/全屏）；`?capture` 走无头出片管线。
- `timeline.json`：37 条台词起止（`tools/build_audio.py` 生成）。
- `script.json` + `台词.md`：台词源（Tingting 配音）。
- `assets/`：录屏片段（`d/e/f/g/h1/h2/h3/n.mp4`）与截图（`s01–s11.png`），播放页启动时预加载（约 220MB，请用宽带）。
- `audio/`：分句 `l*.wav` + `voice.wav`（仓库忽略，本地 `python3 tools/build_audio.py` 重建，需 macOS `say`；`tools/mix.sh` 可再混环境底噪）。
- `tools/render.mjs` + `cover.mjs`：无头逐帧出片 / 封面。
