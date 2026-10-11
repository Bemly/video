window.TIMINGS = {
 "total": 307.39682700000003,
 "chapters": [
  {
   "id": "01",
   "offset": 1,
   "dur": 32.229297,
   "sents": [
    {
     "s": 0,
     "e": 4.221,
     "zh": "我要说一个可能有争议的观点：别写提示词。",
     "en": "I'm going to say something that might be controversial. Don't write prompts.",
     "map": [
      [
       0,
       55,
       0,
       2.232
      ],
      [
       56,
       76,
       3.184,
       4.221
      ]
     ]
    },
    {
     "s": 4.882,
     "e": 12.072,
     "zh": "我不是让你别和智能体说话。我说的是那个大家伙——放在项目根目录、试图解释一切的巨型指令文件。",
     "en": "I don't mean stop talking to your agent. I mean the big one. The giant instruction file at the root of your project, that tries to explain everything.",
     "map": [
      [
       0,
       40,
       4.882,
       6.558
      ],
      [
       41,
       60,
       7.056,
       7.838
      ],
      [
       61,
       116,
       7.838,
       10.352
      ],
      [
       117,
       150,
       10.582,
       12.072
      ]
     ]
    },
    {
     "s": 12.612,
     "e": 22.121,
     "zh": "想知道为什么，我们来打开地球上最大的代码库之一：Firefox。数千万行代码，C++、Rust、JavaScript、Kotlin。",
     "en": "To see why, let's open one of the largest codebases on earth. Firefox. Tens of millions of lines of code. C++, Rust, JavaScript, Kotlin.",
     "map": [
      [
       0,
       11,
       12.612,
       13.133
      ],
      [
       12,
       61,
       13.133,
       15.673
      ],
      [
       62,
       70,
       16.212,
       16.684
      ],
      [
       71,
       105,
       16.684,
       18.505
      ],
      [
       106,
       110,
       18.895,
       19.668
      ],
      [
       111,
       116,
       20.055,
       20.441
      ],
      [
       117,
       128,
       20.723,
       21.359
      ],
      [
       129,
       136,
       21.705,
       22.121
      ]
     ]
    },
    {
     "s": 22.501,
     "e": 27.071,
     "zh": "你可能以为它给智能体的指令会长得吓人。根文件只有 73 行。",
     "en": "You would expect its agent instructions to be enormous. The root file is seventy-three lines.",
     "map": [
      [
       0,
       55,
       22.501,
       25.267
      ],
      [
       56,
       93,
       25.267,
       27.071
      ]
     ]
    },
    {
     "s": 27.329,
     "e": 32.229,
     "zh": "而它的第一条规则是什么？几乎不要写注释。嗯，开了个好头。",
     "en": "And the very first rule in it? Almost never add comments. So, we're off to a good start.",
     "map": [
      [
       0,
       30,
       27.329,
       28.485
      ],
      [
       31,
       57,
       28.912,
       30.365
      ],
      [
       58,
       61,
       30.737,
       30.879
      ],
      [
       62,
       88,
       30.879,
       32.229
      ]
     ]
    }
   ]
  },
  {
   "id": "02",
   "offset": 34.129297,
   "dur": 41.517279,
   "sents": [
    {
     "s": 0,
     "e": 9.255,
     "zh": "这是我们大多数人都写过的提示词：一个文件，塞着构建步骤、测试命令、代码风格、架构说明，外加一条关于某个不稳定测试的警告。",
     "en": "Here's a prompt most of us have written. One file. Build steps, test commands, style rules, architecture, and a warning about that one flaky test.",
     "map": [
      [
       0,
       40,
       0,
       2.492
      ],
      [
       41,
       50,
       2.957,
       3.431
      ],
      [
       51,
       63,
       3.431,
       4.109
      ],
      [
       64,
       78,
       4.109,
       4.921
      ],
      [
       79,
       91,
       4.921,
       5.599
      ],
      [
       92,
       105,
       5.988,
       6.682
      ],
      [
       106,
       146,
       7.05,
       9.255
      ]
     ]
    },
    {
     "s": 9.255,
     "e": 15.905,
     "zh": "每个任务都要为这一整份买单。只是改文档里的一个错别字？智能体照样得读一遍垃圾回收器的原理。",
     "en": "Every task pays for all of it. Fixing a typo in the docs? The agent still reads how the garbage collector works.",
     "map": [
      [
       0,
       30,
       9.255,
       10.839
      ],
      [
       31,
       57,
       11.25,
       12.578
      ],
      [
       58,
       112,
       13.396,
       15.905
      ]
     ]
    },
    {
     "s": 16.118,
     "e": 26.247,
     "zh": "Firefox 的做法不一样。根文件只放放之四海而皆准的东西。然后它列出五个目录，并说：在这里干活时，打开这里面的那份 AGENTS.md。",
     "en": "Firefox does something different. The root file holds only what is true everywhere. Then it lists five directories, and says: when you work in here, open the agents file that lives in here.",
     "map": [
      [
       0,
       33,
       16.118,
       17.607
      ],
      [
       34,
       83,
       18.118,
       20.447
      ],
      [
       84,
       115,
       21.045,
       22.474
      ],
      [
       116,
       125,
       22.81,
       23.24
      ],
      [
       126,
       148,
       23.24,
       24.283
      ],
      [
       149,
       189,
       24.283,
       26.247
      ]
     ]
    },
    {
     "s": 26.793,
     "e": 35.313,
     "zh": "JavaScript 引擎有一份，排版有一份，WebRender 有一份。每份也就一百行上下，而且只有走进那个目录时才会被读到。",
     "en": "The JavaScript engine has one. Layout has one. WebRender has one. Each is around a hundred lines or less, and each is only read when you step inside.",
     "map": [
      [
       0,
       30,
       26.793,
       28.335
      ],
      [
       31,
       46,
       28.742,
       29.713
      ],
      [
       47,
       65,
       30.135,
       31.106
      ],
      [
       66,
       105,
       31.106,
       33.113
      ],
      [
       106,
       149,
       33.113,
       35.313
      ]
     ]
    },
    {
     "s": 36.047,
     "e": 41.517,
     "zh": "这和提取函数是同一个动作。指令并没有变短，它只是有了作用域。",
     "en": "It's the same move as extracting a function. The instruction didn't get shorter. It got a scope.",
     "map": [
      [
       0,
       44,
       36.047,
       38.082
      ],
      [
       45,
       80,
       38.813,
       40.332
      ],
      [
       81,
       96,
       40.81,
       41.517
      ]
     ]
    }
   ]
  },
  {
   "id": "03",
   "offset": 76.546576,
   "dur": 40.634921,
   "sents": [
    {
     "s": 0,
     "e": 6.706,
     "zh": "再看排版模块那份。一共 31 行，而且大部分在说同一件事：先去读这份文档。",
     "en": "Now look inside the layout one. It's thirty-one lines, and most of them say the same thing. Read this document first.",
     "map": [
      [
       0,
       31,
       0,
       1.5
      ],
      [
       32,
       54,
       1.899,
       2.963
      ],
      [
       55,
       91,
       2.963,
       4.716
      ],
      [
       92,
       117,
       5.177,
       6.706
      ]
     ]
    },
    {
     "s": 7.188,
     "e": 16.971,
     "zh": "它不解释帧树，它指向解释帧树的那个文件。因为那份文档由改代码的人维护，而提示词里的副本到周五就过期了。",
     "en": "It doesn't explain the frame tree. It points to the file that does. Because that document is maintained by the people who change the code, and a copy inside a prompt would be stale by Friday.",
     "map": [
      [
       0,
       34,
       7.188,
       8.729
      ],
      [
       35,
       67,
       9.033,
       10.566
      ],
      [
       68,
       138,
       10.783,
       14.048
      ],
      [
       139,
       191,
       14.308,
       16.971
      ]
     ]
    },
    {
     "s": 17.747,
     "e": 29.868,
     "zh": "JavaScript 引擎那份更进一步：它是一张地图。每个目录一行，按脚本流经引擎的顺序排列：解析器、解释器、编译器、垃圾回收器。",
     "en": "The JavaScript engine's file goes one step further. It is a map. One line per directory, in the order a script flows through the engine. Parser, interpreter, compilers, garbage collector.",
     "map": [
      [
       0,
       51,
       17.747,
       20.313
      ],
      [
       52,
       64,
       20.53,
       21.2
      ],
      [
       65,
       88,
       21.76,
       22.951
      ],
      [
       89,
       136,
       22.951,
       25.334
      ],
      [
       137,
       144,
       25.979,
       26.442
      ],
      [
       145,
       157,
       26.79,
       27.379
      ],
      [
       158,
       168,
       27.817,
       28.502
      ],
      [
       169,
       187,
       28.919,
       29.868
      ]
     ]
    },
    {
     "s": 29.868,
     "e": 33.412,
     "zh": "地图告诉你该往哪看，它不会试图成为疆域本身。",
     "en": "A map tells you where to look. It doesn't try to be the territory.",
     "map": [
      [
       0,
       30,
       29.868,
       31.233
      ],
      [
       31,
       66,
       31.799,
       33.412
      ]
     ]
    },
    {
     "s": 33.713,
     "e": 40.635,
     "zh": "那 Claude 专用的那个文件呢？只有一行：引入 AGENTS.md。所有工具，同一个事实来源。",
     "en": "And the Claude specific file? It is one line. It imports the agents file. One source of truth, for every tool.",
     "map": [
      [
       0,
       29,
       33.713,
       35.239
      ],
      [
       30,
       45,
       35.576,
       36.552
      ],
      [
       46,
       73,
       36.771,
       38.277
      ],
      [
       74,
       94,
       38.277,
       39.373
      ],
      [
       95,
       110,
       39.874,
       40.635
      ]
     ]
    }
   ]
  },
  {
   "id": "04",
   "offset": 118.081497,
   "dur": 35.062132,
   "sents": [
    {
     "s": 0,
     "e": 4.881,
     "zh": "下一个问题。你没法 grep Firefox。好吧，可以，但你得等。",
     "en": "Next problem. You can't grep Firefox. Well, you can, but you'll wait.",
     "map": [
      [
       0,
       13,
       0,
       0.715
      ],
      [
       14,
       37,
       1.159,
       2.434
      ],
      [
       38,
       43,
       2.434,
       2.717
      ],
      [
       44,
       52,
       3.136,
       3.718
      ],
      [
       53,
       69,
       3.718,
       4.881
      ]
     ]
    },
    {
     "s": 5.434,
     "e": 10.269,
     "zh": "你可以为此写上一段话：谨慎搜索，限定路径，保持耐心。",
     "en": "You could write a paragraph about that. Search carefully. Restrict your paths. Be patient.",
     "map": [
      [
       0,
       39,
       5.434,
       6.997
      ],
      [
       40,
       57,
       7.437,
       8.298
      ],
      [
       58,
       78,
       8.578,
       9.684
      ],
      [
       79,
       90,
       9.684,
       10.269
      ]
     ]
    },
    {
     "s": 11.041,
     "e": 19.237,
     "zh": "或者，你可以递给智能体一个工具。Firefox 自带一个理解代码的命令行搜索：问它某个定义，它就回答。",
     "en": "Or, you can hand the agent a tool. Firefox ships a command line search that understands the code. Ask it for a definition, and it answers.",
     "map": [
      [
       0,
       3,
       11.041,
       11.196
      ],
      [
       4,
       34,
       11.196,
       12.984
      ],
      [
       35,
       97,
       13.732,
       16.816
      ],
      [
       98,
       122,
       17.198,
       18.448
      ],
      [
       123,
       138,
       18.448,
       19.237
      ]
     ]
    },
    {
     "s": 19.237,
     "e": 22.129,
     "zh": "四条示例命令，替代了一整页的忠告。",
     "en": "Four example commands replace a whole page of advice.",
     "map": [
      [
       0,
       53,
       19.237,
       22.129
      ]
     ]
    },
    {
     "s": 22.806,
     "e": 29.788,
     "zh": "这就是提示词里的类型系统。一句话是在请求模型守规矩；一个工具让正确的事变成容易的事。",
     "en": "This is the type system of prompting. A sentence asks the model to behave. A tool makes the right thing the easy thing.",
     "map": [
      [
       0,
       37,
       22.806,
       24.59
      ],
      [
       38,
       74,
       25.334,
       27.352
      ],
      [
       75,
       119,
       27.352,
       29.788
      ]
     ]
    },
    {
     "s": 30.455,
     "e": 35.062,
     "zh": "紧接着下面还有一句很可爱的话：如果不能很快找到，问一下更好。",
     "en": "And there's a lovely line right below it. If you can't find something quickly, it is better to ask.",
     "map": [
      [
       0,
       41,
       30.455,
       32.279
      ],
      [
       42,
       78,
       32.683,
       34.251
      ],
      [
       79,
       99,
       34.251,
       35.062
      ]
     ]
    }
   ]
  },
  {
   "id": "05",
   "offset": 154.043629,
   "dur": 47.786667,
   "sents": [
    {
     "s": 0,
     "e": 7.412,
     "zh": "但有些知识确实很长：排查性能回退、迁移翻译字符串、为评审拆分提交。",
     "en": "But some knowledge really is long. Triaging a performance regression. Migrating translated strings. Splitting a commit for review.",
     "map": [
      [
       0,
       34,
       0,
       1.448
      ],
      [
       35,
       69,
       1.949,
       3.61
      ],
      [
       70,
       99,
       4.023,
       5.6
      ],
      [
       100,
       130,
       5.859,
       7.412
      ]
     ]
    },
    {
     "s": 7.623,
     "e": 15.145,
     "zh": "Firefox 有 24 个这样的东西，叫做 skill。每个都是一个文件夹，带着自己的说明、脚本和参考资料。",
     "en": "Firefox keeps twenty-four of these, and calls them skills. Each one is a folder, with its own instructions, scripts, and references.",
     "map": [
      [
       0,
       35,
       7.623,
       9.498
      ],
      [
       36,
       58,
       9.79,
       10.86
      ],
      [
       59,
       80,
       11.186,
       12.204
      ],
      [
       81,
       107,
       12.537,
       13.903
      ],
      [
       108,
       116,
       13.903,
       14.337
      ],
      [
       117,
       132,
       14.337,
       15.145
      ]
     ]
    },
    {
     "s": 15.794,
     "e": 24.125,
     "zh": "诀窍在这里：一开始只加载描述，就一段话。剩下的几百行躺在磁盘上，直到任务真正需要它们。",
     "en": "Here's the trick. Only the description is loaded up front. One paragraph. The other few hundred lines stay on disk, until the task actually needs them.",
     "map": [
      [
       0,
       17,
       15.794,
       16.475
      ],
      [
       18,
       58,
       16.677,
       18.555
      ],
      [
       59,
       73,
       18.939,
       19.659
      ],
      [
       74,
       115,
       20.193,
       22.214
      ],
      [
       116,
       151,
       22.481,
       24.125
      ]
     ]
    },
    {
     "s": 24.595,
     "e": 33.641,
     "zh": "而且团队对代价很坦诚。README 里写着：每条描述都带着常驻成本。如果一个 skill 不是对所有人都有用，它就不该放进代码树。",
     "en": "And the team is honest about the price. Their readme says every description carries an always-on cost. If a skill isn't useful to everyone, it doesn't belong in the tree.",
     "map": [
      [
       0,
       39,
       24.595,
       26.324
      ],
      [
       40,
       102,
       26.564,
       29.996
      ],
      [
       103,
       139,
       30.503,
       32.226
      ],
      [
       140,
       170,
       32.226,
       33.641
      ]
     ]
    },
    {
     "s": 34,
     "e": 42.012,
     "zh": "于是描述变成了接口。写得好的会说明什么时候用，以及什么时候不用：不是用来跑测试的，请用另一个 skill。",
     "en": "So the description becomes an interface. The good ones say when to use them, and when not to. Not for running tests. Use the other skill.",
     "map": [
      [
       0,
       40,
       34,
       35.817
      ],
      [
       41,
       76,
       36.088,
       37.774
      ],
      [
       77,
       93,
       38.136,
       38.99
      ],
      [
       94,
       116,
       39.326,
       40.4
      ],
      [
       117,
       137,
       40.971,
       42.012
      ]
     ]
    },
    {
     "s": 42.347,
     "e": 47.787,
     "zh": "有些甚至声明了自己被允许运行哪些命令。这已经不是提示词了，这是函数签名。",
     "en": "Some even declare which commands they are allowed to run. That's not a prompt anymore. That's a signature.",
     "map": [
      [
       0,
       57,
       42.347,
       45.062
      ],
      [
       58,
       86,
       45.062,
       46.332
      ],
      [
       87,
       106,
       46.808,
       47.787
      ]
     ]
    }
   ]
  },
  {
   "id": "06",
   "offset": 202.730296,
   "dur": 20.108481,
   "sents": [
    {
     "s": 0,
     "e": 4.798,
     "zh": "还有一层。代码评审时，不该靠谁去记住该用哪份指南。",
     "en": "One more layer. During code review, nobody should have to remember which guidance applies.",
     "map": [
      [
       0,
       15,
       0,
       0.863
      ],
      [
       16,
       35,
       1.399,
       2.276
      ],
      [
       36,
       90,
       2.276,
       4.798
      ]
     ]
    },
    {
     "s": 5.497,
     "e": 16.492,
     "zh": "所以有一个很小的规则配置文件。补丁同时碰了 WebIDL 和 C++ 文件，就加载 Web 标准实现指南；碰了前端代码但不是测试，就加载前端指南。",
     "en": "So there is a small config file of rules. If a patch touches a web interface definition and a C++ file, load the web standards guide. If it touches front end code, but not tests, load the front end guide.",
     "map": [
      [
       0,
       41,
       5.497,
       7.626
      ],
      [
       42,
       103,
       7.626,
       10.885
      ],
      [
       104,
       133,
       10.885,
       12.482
      ],
      [
       134,
       163,
       12.898,
       14.491
      ],
      [
       164,
       178,
       14.491,
       15.253
      ],
      [
       179,
       204,
       15.466,
       16.492
      ]
     ]
    },
    {
     "s": 16.492,
     "e": 20.108,
     "zh": "提示词由 diff 来选择，而不是靠某个人的记性。",
     "en": "The prompt is selected by the diff. Not by somebody's memory.",
     "map": [
      [
       0,
       35,
       16.492,
       17.929
      ],
      [
       36,
       61,
       18.806,
       20.108
      ]
     ]
    }
   ]
  },
  {
   "id": "07",
   "offset": 223.738777,
   "dur": 22.987755,
   "sents": [
    {
     "s": 0,
     "e": 3.453,
     "zh": "提示词和注释得的是同一种病：没有任何东西检查它们。",
     "en": "Prompts have the same disease as comments. Nothing checks them.",
     "map": [
      [
       0,
       42,
       0,
       1.87
      ],
      [
       43,
       63,
       2.677,
       3.453
      ]
     ]
    },
    {
     "s": 4.532,
     "e": 9.172,
     "zh": "指令过期时编译器不会警告你。智能体只会照做，而且信心十足。",
     "en": "The compiler won't warn you when an instruction goes out of date. The agent will just follow it. Confidently.",
     "map": [
      [
       0,
       65,
       4.532,
       7.009
      ],
      [
       66,
       96,
       7.44,
       8.627
      ],
      [
       97,
       109,
       8.627,
       9.172
      ]
     ]
    },
    {
     "s": 9.784,
     "e": 16.855,
     "zh": "Firefox 为此有一条规则，我很喜欢：引用名字，而不是位置。这段文字会比它描述的代码活得更久。",
     "en": "Firefox has a rule for this, and I love it. Reference a name, not a position. This text outlives the code it describes.",
     "map": [
      [
       0,
       28,
       9.784,
       11.106
      ],
      [
       29,
       43,
       11.436,
       11.912
      ],
      [
       44,
       61,
       12.362,
       13.169
      ],
      [
       62,
       77,
       13.527,
       14.277
      ],
      [
       78,
       119,
       14.814,
       16.855
      ]
     ]
    },
    {
     "s": 16.855,
     "e": 22.988,
     "zh": "所以，不写行号，不写“上面那个函数”。只写名字，以及固定到某个版本的链接。",
     "en": "So, no line numbers. No, the function above. Names, and links that are pinned to a revision.",
     "map": [
      [
       0,
       3,
       16.855,
       16.975
      ],
      [
       4,
       20,
       17.186,
       18.507
      ],
      [
       21,
       24,
       18.88,
       18.993
      ],
      [
       25,
       44,
       18.993,
       19.902
      ],
      [
       45,
       51,
       20.332,
       20.751
      ],
      [
       52,
       92,
       21.105,
       22.988
      ]
     ]
    }
   ]
  },
  {
   "id": "08",
   "offset": 247.626532,
   "dur": 22.476916,
   "sents": [
    {
     "s": 0,
     "e": 2.629,
     "zh": "那是不是永远都不该写提示词？当然不是。",
     "en": "So should you never write a prompt? Of course not.",
     "map": [
      [
       0,
       35,
       0,
       1.535
      ],
      [
       36,
       50,
       1.802,
       2.629
      ]
     ]
    },
    {
     "s": 3.283,
     "e": 6.459,
     "zh": "把代码没法告诉你的东西写下来：那些坑。",
     "en": "Write down what the code can't tell you. The traps.",
     "map": [
      [
       0,
       40,
       3.283,
       5.065
      ],
      [
       41,
       51,
       5.649,
       6.459
      ]
     ]
    },
    {
     "s": 7.376,
     "e": 13.985,
     "zh": "比如这条：默认截图显示的并不是真实的渲染器输出。所以永远不要凭一张截图就断定渲染 bug 修好了。",
     "en": "Like this one. A default screenshot does not show the real renderer output. So never conclude a rendering bug is fixed from a screenshot.",
     "map": [
      [
       0,
       14,
       7.376,
       8.015
      ],
      [
       15,
       75,
       8.015,
       10.92
      ],
      [
       76,
       137,
       11.171,
       13.985
      ]
     ]
    },
    {
     "s": 14.458,
     "e": 17.808,
     "zh": "或者这条：未经明确批准，绝不提交补丁。",
     "en": "Or this. Never submit a patch without explicit approval.",
     "map": [
      [
       0,
       8,
       14.458,
       15.1
      ],
      [
       9,
       56,
       15.684,
       17.808
      ]
     ]
    },
    {
     "s": 17.808,
     "e": 22.477,
     "zh": "读再多源码，智能体也学不到这些。提示词就是为此而存在的。",
     "en": "No amount of reading the source would teach an agent that. That is what prompts are for.",
     "map": [
      [
       0,
       58,
       17.808,
       20.304
      ],
      [
       59,
       88,
       20.75,
       22.477
      ]
     ]
    }
   ]
  },
  {
   "id": "09",
   "offset": 271.003448,
   "dur": 31.393379,
   "sents": [
    {
     "s": 0,
     "e": 6.794,
     "zh": "还有一点是我没想到的：这些文件是学习一个大型项目的最佳途径。对智能体如此，对人也一样。",
     "en": "And here is the part I didn't expect. These files are the best way to learn a large project. For agents, and for people.",
     "map": [
      [
       0,
       37,
       0,
       1.477
      ],
      [
       38,
       92,
       2.184,
       4.625
      ],
      [
       93,
       104,
       5.097,
       5.772
      ],
      [
       105,
       120,
       6.119,
       6.794
      ]
     ]
    },
    {
     "s": 7.013,
     "e": 16.278,
     "zh": "从根目录开始，了解哪些事处处成立。走进一个模块，读它的地图。再扫一遍 skill 的描述，看看这里实际在做哪些工作。",
     "en": "Start at the root, to learn what is true everywhere. Step into a module, and read its map. Then skim the skill descriptions, to see what work actually gets done here.",
     "map": [
      [
       0,
       18,
       7.013,
       7.867
      ],
      [
       19,
       52,
       7.867,
       9.513
      ],
      [
       53,
       72,
       9.948,
       11.001
      ],
      [
       73,
       90,
       11.259,
       11.996
      ],
      [
       91,
       124,
       12.619,
       14.298
      ],
      [
       125,
       166,
       14.298,
       16.278
      ]
     ]
    },
    {
     "s": 16.278,
     "e": 19.037,
     "zh": "几百行读下来，你就知道每样东西住在哪里。",
     "en": "A few hundred lines, and you know where everything lives.",
     "map": [
      [
       0,
       20,
       16.278,
       17.238
      ],
      [
       21,
       57,
       17.238,
       19.037
      ]
     ]
    },
    {
     "s": 20.012,
     "e": 28.479,
     "zh": "所以在给提示词再加一段之前，换个问题问自己：这东西该住在哪？作用域、指针、工具、skill，还是触发器。",
     "en": "So before you add another paragraph to your prompt, ask a different question. Where should this live? A scope, a pointer, a tool, a skill, or a trigger.",
     "map": [
      [
       0,
       51,
       20.012,
       22.19
      ],
      [
       52,
       77,
       22.48,
       23.665
      ],
      [
       78,
       101,
       23.665,
       24.737
      ],
      [
       102,
       110,
       25.305,
       25.816
      ],
      [
       111,
       121,
       26.076,
       26.739
      ],
      [
       122,
       129,
       26.739,
       27.153
      ],
      [
       130,
       138,
       27.153,
       27.651
      ],
      [
       139,
       152,
       27.651,
       28.479
      ]
     ]
    },
    {
     "s": 28.963,
     "e": 31.393,
     "zh": "别写提示词。去建造它们该在的地方。",
     "en": "Don't write prompts. Build the place they belong.",
     "map": [
      [
       0,
       20,
       28.963,
       29.96
      ],
      [
       21,
       49,
       29.96,
       31.393
      ]
     ]
    }
   ]
  }
 ]
};
