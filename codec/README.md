# 压缩三十年 —— 视频编码科普（15:57）

从 H.263、VP6、Theora 一路到 AVS3、H.266 和 AV2，主流视频编码格式科普（I/P/B · 率失真 · 档次与微调）。在线看：https://bili.bemly.moe/codec/

- 浏览器实时渲染（WebGL 着色器 + Canvas 2D，`requestAnimationFrame` 无声时钟驱动，无需构建；录屏占位框在成片合成时叠加，网页版仅显示示意框）。
- `index.html`：播放页（顶栏 + 16:9 舞台 + 播放/进度/时间/全屏；空格播放/暂停，←/→ 5 秒，R 重播，F 全屏；`?t=秒` 冻结单帧）；`render.html`：无头逐帧抓取用（`tools/render.mjs` + Playwright，见源目录用法注释）。
- `timeline.js` / `timeline.json`：36 段（含末尾参考文献卡）顺序 + 字幕 + 章节（`voice` 字段已改写为相对路径 `voice/sXX.wav`，配音文件未入库）。
- `scenes.js` / `shader.js`：全部场景与着色器；`script.json`：分镜脚本；`tools/`：时间线/合成/TTS/抓帧脚本。
- `台词稿.md`：全文台词与音效/录屏标注；`压缩三十年_视频编码科普.srt`：字幕。
- `cover.jpg`：首页卡片用（1920×1080，由 `预览截图.jpg` 顶部裁剪生成）。
- 未入库：`source/voice/` 配音 83MB（音效不上传）、`试听/` BGM 试听、`压缩三十年_视频编码科普.mp4` 成片 2.3GB（超 GitHub 单文件 100MB 限制）。

本地源目录：`/Volumes//影片/视频/codec-video/`。
