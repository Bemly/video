# 事实核对表（视频《读懂 openai/math》）

视频中的每条事实性陈述及其出处。"仓库"指 `repo/`（https://github.com/openai/math，2026-10-07 克隆，初始提交 `adc7f1241`）。

## 发布与流程
| 陈述 | 出处 |
|---|---|
| 2026-10-06 发布博客 *Sharing AI progress in mathematics* 并公开仓库 | OpenAI 博客；`overview.tex` 页眉 "October 6, 2026" |
| 722 篇稿件、372 个结果族；结果族 = 主要结果 + 配套论证/推论/替代证明 | `README.md` |
| 17 个分支；理论计算机科学 40 个族最多（各分支计数） | `overview.tex` 中 `\cataloguesection` 下 `\resultentry` 计数 |
| preprints / lean / reasoning_traces（10 份）/ CONTENTS.md · overview.pdf | `README.md`、目录结构 |
| 已有评测饱和后改用开放研究问题；约 4000 个问题；按显著性筛选 | `README.md` "How the results were produced" |
| 平均每个结果 ≈ 3 小时 ChatGPT Pro 思考算力 | `README.md`；OpenAI 博客 |
| 例外：ζ 零点区域工作、CM 阿贝尔簇 Hodge 猜想；Re s > 11/12 文稿经人工编辑 | `README.md` |
| Navier–Stokes：光滑外力、从静止出发、有限时间奇点、附 Lean；约 1 万并发智能体；首批启动约 88 小时后得出；不申领奖金；不在本仓库 | OpenAI 博客 *On the Navier–Stokes Millennium Prize Problem* |

## Lean 与 Comparator
| 陈述 | 出处 |
|---|---|
| 五色定理的 Lean 陈述（ℂ → Fin 5，任意函数） | `lean/ComparatorChallenges/EuclideanFiveColor.lean` |
| 挑战文件只有陈述 + `sorry`；证明在 OAI 库；只允许 propext、Quot.sound、Classical.choice | `lean/ComparatorChallenges/*.json`（如 `QuasiRiemannHypothesis.json`） |
| 121,734 个 .lean 文件、约 2590 万行 | `find lean/OAI -name '*.lean' \| wc -l`；`cat … \| wc -l` = 25,910,542 |
| 405 个 Comparator 挑战 | `ls lean/ComparatorChallenges/*.json \| wc -l` |
| 235 / 372 个结果族附有形式化说明 | `CONTENTS.md` 中 `[Lean](lean/docs/…)` 链接计数；`lean/docs/` 共 235 份 |
| 未形式化结果可能有问题 | `README.md` 原句 |

## 平面染色（结果族 158）
| 陈述 | 出处 |
|---|---|
| 1950 Nelson 提出；4 ≤ χ ≤ 7；Moser 纺锤 7 点 11 边 | 论文 *The Euclidean plane is not five-colorable* §1 |
| 七色构造：外接圆半径 r = 2/5；直径 4/5 < 1；同色中心距 ≥ √21·r；(√21 − 2)r ≈ 1.033 > 1 | 同上 §1（数值经本地复核） |
| 2018 de Grey：1581 顶点，下界 5 | 同上 §1 |
| 两步：转移到弱可测染色；弱可测五染色不存在；用到代数旋转平均、谱定理、Furstenberg–Zimmer；最后一步再用 Moser 纺锤的两个重叠三角形约束 | 同上 定理 1.3、1.4 与 §1.1 |
| Lean 同时覆盖五色不够、七色足够；6 或 7 仍未定 | `lean/docs/158.md`；论文定理 1.1 |

## π 的无理性指数（结果族 017）
| 陈述 | 出处 |
|---|---|
| 无理性指数定义；Dirichlet 给出 ≥ 2 | 论文 *The irrationality exponent of pi is 2* §1 |
| 上界历史：Mahler 1953 = 42；Hata 8.016；Salikhov 7.606；Zeilberger–Zudilin 7.103 | 同上 §1.1 |
| 指数为 2 ≠ 部分商有界 | 同上 定理 1.1 后的说明 |
| Flint–Hills：Alekseyev（收敛 ⇒ μ ≤ 5/2）；Meiburg（μ < 5/2 ⇒ 收敛） | 同上 推论 1.2 前后 |
| n = 355 项 ≈ 24.6；部分和 ≈ 29.4；355/113 − π ≈ 2.67×10⁻⁷ | 本地 mpmath 计算（40 位精度） |
| Lean 不含 Flint–Hills 推论 | `lean/docs/017.md` |
| 推理摘要 42 页；先求 μ < 5/2；62/25 的界；第二部分以插值行列式为起点得到 2；引文 "This kills approach by dimension alone." | `reasoning_traces/irrationality-exponent-of-pi.pdf` |

## Mahler 猜想（结果族 087）
| 陈述 | 出处 |
|---|---|
| 极体定义；体积乘积线性不变；4ⁿ/n!；Hanner 多面体取等；非对称版 (n+1)ⁿ⁺¹/(n!)²、单纯形取等 | 论文 *The symmetric Mahler conjecture and its equality cases*、*The Mahler Conjecture for General Convex Bodies* |
| 二维（Mahler）、三维（Iriyeh–Shibata 2020）此前已证 | *Symplectic Balls in Symmetric Polar Products* §1 背景 |
| 容量 < 4 的球可辛嵌入 int K × int K°；vol B²ⁿ(c) = cⁿ/n!；由此推出不等式 | 同上 定理 1.1 及其后推导 |
| Lean 不含函数形式不等式 | `lean/docs/087.md` |
| 正方形 4·2 = 8；圆盘 π²；正六边形 9；立方体 8 × 4/3 = 64/6 | 初等计算 |

## 其他结果
| 陈述 | 出处 |
|---|---|
| 准黎曼猜想：所有 Dirichlet L 函数在 Re s > 7/8 无零点 | `CONTENTS.md` 结果族 003；`lean/ComparatorChallenges/QuasiRiemannHypothesis.lean` |
| Borsuk：9 维反例（ℝ⁴ 中直线的秩一正交投影，Frobenius 度量）；Kahn–Kalai 1993 年 1325 维；此前最低 64 维 | `CONTENTS.md` 结果族 156；历史为公认文献（Kahn–Kalai 1993；Jenrich–Brouwer 2014） |
| 矩阵乘法 ω ≤ 9/4（复数域）；Strassen 1969 ≈ 2.807；Coppersmith–Winograd 1990 ≈ 2.376；此前最好 ≈ 2.371 | `CONTENTS.md` 结果族 107；历史为公认文献 |
| Thompson 群 F 不顺从；生成元 x₀、x₁ 的分段线性图像 | `CONTENTS.md` 结果族 248；x₀、x₁ 为标准生成元 |
| Catalan 常数无理 | `CONTENTS.md` 结果族 005 |
| 以上均附 Lean 形式化说明 | `lean/docs/{003,156,107,248,005}.md` |

## 社区规范
| 陈述 | 出处 |
|---|---|
| IAS 数学与 AI 顾问小组 2026-09-29 建议：作者理解并负责；完善引用与写作；存入不受 AI 实验室控制的仓库；资助社区理解 | https://agmai.org/general-sep29/ |
| OpenAI：资助研讨会与会议；探索社区托管 | OpenAI 博客 |

## 示意图（非数据）
- Navier–Stokes 涡旋动画、de Grey 图标、"任意染色 / 弱可测染色"色块、经典零点区域曲线、辛球嵌入：都只是示意，画面上已标注"示意"。
