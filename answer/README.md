# 文笔坐标 · 逐题鉴赏（107 题）

中文创意写作盲评的逐题详情页：107 道题，每题含题面、评分要点、本题排名（剔除自评）、10 个模型按得分从低到高的作答摘录（点评引文高亮）与十维 + 专项 + 总分热力表、6 位裁判一句话点评、全文展开。在线看：https://bili.bemly.moe/answer/

- 浏览器在线渲染，无音频，无需构建：`index.html` 启动时取 `data/index.json`（107 题列表），点选后按需取 `data/T-*.json`（单题详情），JS 直接渲染 DOM。
- `index.html`：单文件应用（内联 CSS/JS，无外部依赖）；`#/T-A01` 哈希路由（也支持 `?q=T-A01`）；搜索框 + 模块筛选；`←/→` 切换上一题/下一题；全文 `<details>` 懒渲染（引文 `<mark>` 高亮）。
- `data/index.json`：`total/models/names/judges/jnames/dims/mods/questions[]`（无全文，首页用）。
- `data/T-*.json`：`prompt_blocks/focus/level/points/order_low_high/ranking/models{avg/rank/hanzi/excerpt_html/quotes/scores{自评标记}/full}`。
- `build.py`：数据构建脚本，**只读**源目录（`../影片/文笔/汇总` 的明细与排名、`../Projects/llmtest` 的题面/要点/盲评包/映射表），源文件一个都不改；输出 `data/`。用法：`cd answer && python3 build.py`。
- `cover.jpg`：首页卡片封面（1920×1080）。

均值算法与总榜一致：单题总分取裁判记录的「总分」，先剔除自评再对裁判取均值；名次来自 `逐题排名_去自评.csv`。缺失维度记 `—`，自评标记 `*`（不计入均值）。
