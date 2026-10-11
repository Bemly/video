# Ayu.Core — pure shell SNS bot framework（宣传短片 1:19）

在线看：https://bili.bemly.moe/bot/

- 浏览器实时渲染（Canvas 2D + WebGL 矩阵雨着色器），音频时钟驱动，无需构建。
- `index.html`：播放页（含站内统一控制条：顶栏 + 播放/进度/时间/全屏）；`?render` 走无头出片管线。
- `timeline.js`：`window.TIMELINE`（31 条中英双语 cue + 时长），由 `build_audio.py` 生成。
- `script.json`：台词源（`say` 送 macOS `say -v Samantha` 合成，`en`/`zh` 双语字幕）。
- `audio/mix.mp3`：成品混音；`audio/*.wav` 为分句源（仓库忽略，本地 `python3 build_audio.py` 重建，需 macOS）。
- `render.mjs`：Playwright 无头逐帧出片（`?render` + `window.renderFrame`）；`ayu-core-intro.mp4` 为该管线产物。
- `qa/`：抽帧质检图。
