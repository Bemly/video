# UEFI Player —— 固件里的视频播放器

开机那一瞬间直接在 UEFI 固件里播视频。在线看：https://bili.bemly.moe/uefi/

- 上面 `intro/`（介绍 1:46）下面 `detail/`（详解 12:00），hub 页两个 iframe 上下排布，各自独立播放。
- 两个都是浏览器实时渲染（WebGL + 2D 字幕，rAF 时钟驱动，无声版），无需构建。
- `index.html`：hub 页（双 iframe + 标题简介）。
- `intro/index.html + timeline.js`：介绍播放器（播放/暂停、进度、时间、全屏；空格、←/→ 5 秒、F 全屏、R 重播；`?t=秒` 定格）。源自 `工程/web/`，仅把 `?play`（需 `../out/mix.m4a`，不存在）换成 rAF 时钟驱动。
- `detail/index.html + timeline.js + shaders_v1.js`：详解播放器（同上操作）。源自 `工程2/web/`；`frames/` 实录帧（2GB）未上传，clip 段降级为背景 + 字幕 + “实录素材未收录”提示，不断线。
- `cover.jpg`：首页卡片用（官方 `封面_16x9.jpg` 原样入库）。
- `tools/build_site.py`：从本地原目录生成 `intro/`/`detail/`（`UEFILM_SRC` 可改源路径）。

成片 mp4（463MB / 1.5GB / 分享版）、`frames/`、`mix.wav`/`mix.m4a`、TTS、`raw/`、台词稿均未入库。目录内无音频文件。

本地原目录：`/Volumes//影片/uefi播放器/`（`工程/` = 介绍，`工程2/` = 详解）。
