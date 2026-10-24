# 16G Mac Mini测试 —— 本地模型前端横评

30 个模型配置 × 4 道前端题，88 份答卷，每份都在视频里实际跑了一遍。在线看：https://bili.bemly.moe/mac/

- 浏览器实时渲染（WebGL 半调底 + DOM 卡片 + 每题 4 宫格 iframe，音频时钟无，全靠时间线），无需构建。
- `index.html`：播放器（16:9 自适应缩放 + 章节/重播/全屏/计时；R 重播，F 全屏，1–4 跳题）+ 下方排名与全部参赛代码。由 `tools/build_site.py` 从 `stage.html` 生成。
- `stage.html`：播放器源码（可直接本地打开调试；`?cat=1..4` 只播一题，`?skip=1` 跳过片头，`?grid=毫秒` 改每组停留）。
- `build/`：70 个可运行答卷页（`manifest.json` 清单 + `scores.json` 评分 + 4 题目录；18 份交白卷无页面）。
- `cover.jpg`：首页卡片用（1920×1080，由 `封面_16x9.png` 转 JPG q85 生成）。
- `tools/`：`assemble.py`（拼答卷页）、`film.mjs`（按秒截图）、`record.mjs`（录屏）、`shoot.mjs`（抽查截图）、`cover.mjs`（渲染封面）、`build_site.py`（生成 `index.html`）。

成片 mp4（305MB）、`shots/`（307MB 截图 + 无声录屏）、`raw/`（2.7MB 原始对话）、`cover/` 页面源文件与 `封面_*.png` 均未入库（见本地原目录）。无音频文件，故无音效入库。

本地原目录：`/Volumes//影片/杂鱼mac/`。
