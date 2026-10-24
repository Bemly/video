# 三进制完备 —— 平衡三进制计算机宣传片（2:22）

用 −1、0、+1 三个数字，从一个门搭到一台 CPU，25 关 B 站可玩。在线看：https://bili.bemly.moe/ternary/

- 浏览器实时渲染（WebGL + DOM 字幕，配音音频做主时钟），无需构建。
- `index.html`：播放器（16:9 自适应 + 播放/暂停/进度/时间/全屏；空格播放暂停，←/→ 5 秒，R 重播，F 全屏，`?t=秒` 定格）。由 `tools/build_site.py` 从 `工程/index.html` 生成（CSS 作用域隔离 + 音频时钟驱动替换）。
- `scenes.js` / `qr.js` / `phone.png`：原 `工程/` 的场景代码、二维码与手机框素材（结尾二维码页用）。
- `timeline.json`：19 句台词 + 时间轴（原根目录文件）。
- `audio/narration.m4a`：19 段 TTS 按台词起点拼合（`tools/build_narration.py` 生成，1.7MB，BGM/SFX 无源故仅配音）。
- `cover.jpg`：首页卡片用（官方 `toy发布/video_cover_16x9_1920x1080.jpg`）。
- 玩游戏本体不在此仓库：B 站 Toy https://www.bilibili.com/toy/ternary（页面底部有链）。

成片 mp4（308MB / v1 296MB）、`toy发布/ternary-complete.zip`、工程源文件与台词稿均未入库。

本地原目录：`/Volumes//影片/三进制/`（`工程/` = 宣传片，`ternary-complete/` = 游戏本体，`toy发布/` = 发布物料）。
