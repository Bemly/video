# video

代码生成的视频作品。每个文件夹是一个独立项目，网页版部署在 GitHub Pages（gh-pages 分支）。

| 文件夹 | 作品 | 在线观看 |
|---|---|---|
| [`408/`](408/) | 408 考研 MV（Remotion） | https://bili.bemly.moe/408/ |
| [`openai-math/`](openai-math/) | 读懂 openai/math —— 讲解视频（13:46） | https://bili.bemly.moe/openai-math/ |
| [`math-execute-me/`](math-execute-me/) | math.execute (me) ; —— 非官方同人 MV | https://bili.bemly.moe/math-execute-me/ |

`openai-math/` 与 `math-execute-me/` 不需要构建：页面直接在浏览器里实时渲染每一帧（Canvas 2D + WebGL）。

首页导航：https://bili.bemly.moe/

> `408/` 的网页版需要构建（`cd 408 && npm i && npm run web:build`），产物放到 gh-pages 的 `408/` 下；另外两个直接复制网页文件即可。
