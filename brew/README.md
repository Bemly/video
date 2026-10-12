# 了不起的瓶子 · brew tap bemly/tahoe（1:40）

Intel Mac × macOS 26 上 `brew tap bemly/tahoe` 的介绍视频。在线看：https://bili.bemly.moe/brew/

- 浏览器实时渲染（WebGL2，每场景独立 fragment 程序 + Canvas 文字图集），音频时钟驱动，无需构建。
- `index.html`：播放页（沉浸式全屏，点击播放；空格暂停，←/→ 跳转，F 全屏）；`?render` 走无头出片管线。
- `js/`：`lib.js`（GLSL 公共库 + 场景注册）`act-1/2/3.js`（三幕场景）`engine.js`（播放器 / 离线渲染器）。
- `soundtrack.m4a`：配乐（100s，播放页做主时钟）。
- `tools/render.mjs`：无头逐帧出片（`?render` + POST raw 帧进 ffmpeg）；`tools/cover.mjs`：`cover.html` 出封面。
- `cover.html` / `cover.jpg`：封面（首页卡片用 `cover.jpg`）。

当前为 v2（`bemly-tahoe-v2.mp4` 为该管线产物，未入库）；v1 已被取代，仅留本地。
