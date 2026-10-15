# kelvora · 必胜之道（1:21）

用自制语言讲组合博弈：两个人轮流行动，无法行动的人输。凯尔斯、威佐夫、砍竹、多米诺、巧克力五个游戏各十二关，之后随机无穷关；每个局面都是一个数，数为零先手必败，机器找归零的一步。在线看：https://bili.bemly.moe/caimeo/

- 浏览器实时渲染（WebGL2 SDF + Canvas 文字层），音频时钟驱动，无需构建。
- `index.html`：播放页（顶栏 + 播放/进度/时间/全屏；点击播放，空格暂停，←/→ 3 秒，R 重播，底部进度条可点）；`?t=秒` 冻结单帧（给质检 / 抽 still 用）；`?cover=1` 封面静帧，`?cover=2` 标题字静帧；`?render` / `?headless` 走无头出片管线。
- `timeline.js`：12 场景 + 14 句台词起止（`build_timeline.py` 生成，播放页启动时加载）；`timeline.json` 同内容（给工具链用）。
- `script.json`：台词源（`zh` 中文、`math` Math 语、`say` 配音读法）。
- `audio/mix.mp3`：成品混音（81.9s，与成片一致，播放页做主时钟）。
- `caimeo.zh.srt`：中文字幕（`make_srt.py` 从 `timeline.json` 生成）。
- `cover.jpg`：由 `cover_16x9.png` 转制（1920×1080）。
- `main.js`：`window.renderFrame(f)` / `window.totalFrames` / `window.ready` / `window.getEvents()`（游戏是模拟的，seek 回退时自动从 0 重放；`record.mjs` 靠它逐帧抓图）。
- `engine.js` / `glyphs.js` / `games.js` / `scenes.js` / `fonts.js`：渲染器、字符形、五游戏逻辑、12 场景、Cormorant 字体（base64）。
- `build_timeline.py`：按 `choice.json` 选 TTS Take、铺时间轴，写 `timeline.js` + `timeline.json` + 本地 `voice.wav`（wav 已忽略，未入库）。
- `mix.py`：`voice.wav` + `events.json`（`record.mjs video` 产物）合成 Foley + 房间混响，写立体声 `out.wav`（再转 `audio/mix.mp3`）。
- `record.mjs`：Playwright 逐帧抓 `renderFrame` 进 ffmpeg（`node record.mjs stills out/ 0.5 10 …` 抽 still；`node record.mjs video out.mp4` 出无声片，再配混音 mux 成片；`QS="&cover=1" node record.mjs stills out/ 0.5` 出封面）。
- `choice.json`：14 句各自选用的 take（seed）；`select_takes.py` / `make_srt.py`：选 take / 生成 srt 的小工具。

成片 mp4、`voice.wav`、`lines3/` 分句源与 `out/` 中间产物均未入库（`*.wav` 已忽略）。
