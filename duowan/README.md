# 魔玩我的世界盒子 · 介绍（8:49）

MC PE 0.10 插件「魔玩我的世界盒子」介绍，浏览器实时渲染。在线看：https://bili.bemly.moe/duowan/

- 浏览器实时渲染（1600×1200 Canvas 2D 叠加 + WebGL，`requestAnimationFrame` 无声时钟驱动，无需构建；字幕按配音逐字点亮逻辑保留，音频未入库故无声播放）。
- `index.html`：播放页（顶栏 + 4:3 舞台 + 播放/进度/时间/全屏；点击播放，空格暂停，←/→ 5 秒，R 重播，F 全屏；`?t=秒` 冻结单帧）；`timeline.js`：44 镜 + 台词 + 字幕时轴（由 `build2/build_tl.py` 生成，已去掉本地路径）。
- `clips/`：39 段视频素材按镜头裁剪（`timeline.json` 的 `in`/`start`/`end`），源 1.2G H.264 → AV1 `preset 2 + CRF 45 + fps15` 无声 60% 档（对标 `codec/rec/` 同款配方）。
- `stills/`：5 张静帧，PNG/WebP → AVIF `preset 0 + CRF 32` 60% 档（`timeline.js` 里 `src: img:{n}`）。
- `cover.jpg`：首页卡片用（1920×1080由 `封面_16x9.png` 转 JPG q85 生成）。
- 未入库：`vo/` 配音 + `mix.wav` 97MB + `sfx` 音效（音效不上传）、`web/frames/` 7.4G JPEG 序列（被 `clips/` AV1 替代）、成片 846MB（超 GitHub 单文件 100MB 限制）。
- `build_page.py`：由本地 `build2/web/index.html` 组装本页（复用渲染代码，仅替换数据源与播放驱动）。

本地源目录：`/Volumes//影片/魔丸/build2/`（`web/` 在线渲染源、`timeline.json`/`edl*.json`、源素材见 `build_tl.py` 的 `SRC`）。
