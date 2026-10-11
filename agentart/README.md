# 提示词美学 · Prompt Aesthetic: Don't Write Prompts

Fish Audio S2 英文配音（4:54），中英双语字幕；画面由网页逐帧渲染。在线看：https://bili.bemly.moe/agentart/

- 配音：Fish Audio S2，英文。停顿用 `(break)` / `(long-break)`；情绪用 S2 方括号标签（每句句首一个，转折处句中再加）。
- `script.md`：完整双语台词（`EN:` 送 fish，`ZH:` 中文字幕）。
- `fish/`：按章节拆好的纯英文台词（`01_hook.txt`…`09_outro.txt`）与合并版 `all.txt`。
- `prompt_aesthetic_en.mp3` / `.srt`：成品配音与合并双语字幕。
- `input.m4a`：声音克隆基准（作者原声）。
- `video/`：浏览器实时渲染的视频页（`index.html` + `engine.js` + `scenes.js` + `timings.js`，音频时钟驱动，无需构建）。
  `video/build-timings.mjs` 把 `../script/fish/out/chNN.{wav,srt}` 铺成时间轴（1s 片头、0.9s 章节间隔、5s 片尾）；
  `video/render.mjs` 用 Playwright 无头出静帧/封面/成片。

读音稳定：台词里 `AGENTS.md` 念 "agents file"，`searchfox-cli` 念 "command line search"，`.webidl` 念 "web interface definition"；画面上显示原名。
