# video

代码生成的视频作品。每个文件夹是一个独立项目，网页版部署在 GitHub Pages（gh-pages 分支）。

| 文件夹 | 作品 | 在线观看 |
|---|---|---|
| [`408/`](408/) | 408 考研 MV（Remotion） | https://bili.bemly.moe/408/ |
| [`openai-math/`](openai-math/) | 读懂 openai/math —— 讲解视频（13:46） | https://bili.bemly.moe/openai-math/ |
| [`math-execute-me/`](math-execute-me/) | math.execute (me) ; —— 非官方同人 MV | https://bili.bemly.moe/math-execute-me/ |
| [`odyssey/`](odyssey/) | 叠界 · Code Odyssey —— 可玩体素 demo（双世界 + 弹簧 + 冲突场） | https://bili.bemly.moe/odyssey/ |
| [`odyssey/`](odyssey/)（`film/`） | 叠界 · Code Odyssey —— 15:21 讲解视频，浏览器实时渲染，中英双语字幕 | https://bili.bemly.moe/coding-adventure/ |
| [`agentart/`](agentart/) | 提示词美学 · Prompt Aesthetic —— Fish S2 英文配音，浏览器实时渲染，中英双语字幕 | https://bili.bemly.moe/agentart/ |
| [`bot/`](bot/) | Ayu.Core —— 纯 shell SNS 机器人框架宣传短片（1:19），浏览器实时渲染 | https://bili.bemly.moe/bot/ |
| [`ime/`](ime/) | AFM 拼音 —— macOS 液态玻璃风格输入法介绍视频（4:33），浏览器实时渲染 | https://bili.bemly.moe/ime/ |
| [`winterjs/`](winterjs/) | WinterJS 宣传片 —— SpiderMonkey 运行时介绍（Remotion，浏览器实时渲染） | https://bili.bemly.moe/winterjs/ |
| [`brew/`](brew/) | 了不起的瓶子 —— brew tap bemly/tahoe（1:40），浏览器实时渲染 | https://bili.bemly.moe/brew/ |
| [`sinytra/`](sinytra/) | Sinytra —— 让火狐接管安卓系统 WebView（7:53），浏览器实时渲染，日中双语字幕 | https://bili.bemly.moe/sinytra/ |

`openai-math/` 与 `math-execute-me/` 不需要构建：页面直接在浏览器里实时渲染每一帧（Canvas 2D + WebGL）。
`odyssey/` 也不需要构建：`odyssey/demo`（对应线上 `/odyssey/`）与 `odyssey/film`（对应线上 `/coding-adventure/`）都是纯静态网页（Three.js 走 CDN），直接复制到 gh-pages 同名目录即可。
`bot/`、`ime/`、`agentart/video/`、`brew/` 与 `sinytra/` 也不需要构建：直接把网页文件（`index.html` + 脚本 + 音频 + `cover.jpg`）复制到 gh-pages 同名目录即可。

首页导航：https://bili.bemly.moe/

> `408/` 与 `winterjs/` 的网页版需要构建（`cd 408 && npm i && npm run web:build` / `cd winterjs && npm i --legacy-peer-deps && npm run web:build`），产物分别放到 gh-pages 的 `408/`、`winterjs/` 下；另外两个直接复制网页文件即可。
