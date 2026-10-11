# WinterJS 宣传片（B 站）

> 本目录是 [Bemly/winterjs2 `promo-video` 分支](https://github.com/Bemly/winterjs2/tree/promo-video) 的拷贝，
> 在 [Bemly/video](https://github.com/Bemly/video) 仓库以 `winterjs/` 独立项目维护，
> 网页实时版线上地址：https://bili.bemly.moe/winterjs/
> 上游更新时用 `rsync` 同步（`.github/` 除外，见下）后再按需合入 `web/` 改动。

基于 [Remotion](https://www.remotion.dev/) 的代码化视频工程。主分支 `master` 是 WinterJS 本体；本分支 `promo-video` 是独立的孤儿分支，只放视频工程。

- 时长约 9 分钟，1920×1080 / 30fps，DeepSeek娘 × Claude娘 双人对话（立绘由作者指定；表情包为蓝色大肥鱼 CC0 作品 + 作者指定图），烧录字幕 + 外挂 SRT
- 10 个段落：开场 → 底层 SpiderMonkey×mozjs → 横向对比 Node/Deno/Bun → 纵向家谱 → Vue 实战 → 接管 yarn/pnpm/bun/deno 项目 → WinterCG → REPL → `WinterJS.*` 原生 API（多媒体）→ 总结

## 实时预览

```bash
npm install
pip install edge-tts mutagen   # 配音工具
npm run tts                    # 生成配音、时间轴、字幕（按句缓存，改哪句只重合成哪句）
npm run studio                 # 打开 http://localhost:3000 实时预览，改代码热更新
```

不跑 `npm run tts` 也能预览：此时按字数估算节奏，画面静音。

## 网页版部署（本仓库新增）

```bash
npm run web:dev       # 网页实时版（Remotion Player），浏览器打开看效果
npm run web:build     # 产物到 dist/，放到 gh-pages 分支的 winterjs/ 目录（线上 https://bili.bemly.moe/winterjs/）
```

- 网页入口 `index.html` + `web/`（Player 实时渲染，带章节跳转；无配音时为静音估算版）
- `vite.config.ts` 用 `publicDir: 'public'`，`public/` 下的 `cast/`、`casts/`、`memes/`、`shots/`、`sfx/` 会随构建进 `dist/`
 （`public/sfx/*.wav` 由 `tools/tts.py` 纯 Python 合成，已提交；`public/voice/` 配音默认不进仓库）
- 子路径部署关键：`web/main.tsx` 里设置 `(window).remotion_staticBase = '.'`，
  使 `staticFile()` 返回相对路径 `./xxx`，否则 Player 默认返回绝对路径 `/xxx`，在 `/winterjs/` 子路径下 404
- 本目录的 `.github/` 是上游 `promo-video` 分支的渲染工作流（推送即渲染成片），在本仓库不生效，仅作同步参照

## 出片

- **GitHub Actions**：推送到 `promo-video` 分支即自动渲染（`.github/workflows/render.yml`），
  在该次运行页面底部的 Artifacts 下载 `winterjs-promo`（含 `winterjs-promo.mp4`、`winterjs-promo.srt`、`cover.png`）。
- **本地**：`npm run tts && npm run render` → `out/winterjs-promo.mp4`。

## 改内容

| 要改什么 | 改哪里 |
|---|---|
| 台词 / 字幕 / 发音 / 表情包触发 | `src/script.json`（`text` 是字幕，`say` 是给 TTS 的读法，`meme` 是弹出的表情包） |
| 角色音色 | `src/script.json` 的 `cast`（edge-tts 音色名、音高、语速） |
| 各段画面 | `src/scenes/*.tsx`（画面元素按"第几句开始"对齐） |
| 表情包 | `public/memes/`（`manifest.json` 映射 key → 文件；`script.json` 里每句 `meme` 弹一张、`burst` 放表情包雨） |
| 角色立绘 | `public/cast/`（作者指定的 DeepSeek娘 与 Claude娘 立绘，抠图后裁半身） |

## 素材与授权

- 角色立绘与表情包：[蓝色大肥鱼](https://蓝色大肥鱼.com/)，只选用详情页标注为 CC0 的作品，逐张出处见 `public/memes/CREDITS.md`
- 配音：Microsoft Edge 在线 TTS（经 `edge-tts`）
- BGM 与音效：`tools/tts.py` 用纯 Python 现场合成，无第三方版权

## 事实依据（2026-09-28 核对）

- wasmerio/winterjs：GitHub 仓库 2026-03-17 归档，README 注明已弃用
- spiderfire：最近提交 2025-08-27（"Updated SpiderMonkey to 140"），此后一年多无更新
- GJS：GNOME 官方项目，最新 1.90.0（2026-09-14），定位 GNOME 桌面 JS 绑定
- WinterJS 能力：取自 `master` 分支的 README、`docs/plan3-journal.md`、`sample/` 与 `tests/`
