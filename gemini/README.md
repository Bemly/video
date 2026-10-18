# 杂鱼手书 · AI 娘版（3:27）

原版手书翻拍，6 位 AI 娘出演。在线看：https://bili.bemly.moe/gemini/

- 离线渲染（`制作/render2.py`：原片模板逐帧对照 + Grok Imagine 图生视频，Python PIL 合成），无需构建，直接播 mp4。
- `index.html`：简单视频页（`<video controls poster="cover.jpg">` + 返回）。
- `video.mp4`：成片 1080p H.264 80MB → SVT-AV1 `preset 2 + CRF 35` 高压缩（31MB，约原片 39%，含 128k AAC，`faststart`）。
- `cover.jpg`：首页卡片用（1920×1080，由 `封面/封面_16x9.png` 转 JPG q85 生成）。
- 源素材（未入库）：`生成图_v2/` 107MB + `生成图_v2/视频/` 62MB + `制作/原片模板.json` + `原版音乐.mp3`，在线渲染要全量上云（~176MB）反而不划算，故直接放成片。

本地原片目录：`/Volumes//影片/杂鱼/`（`成片.mp4` / `成片_手机版.mp4` / `封面/` / `制作/`）。
