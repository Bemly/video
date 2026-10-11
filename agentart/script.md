# 【双语】提示词美学：勿写提示词 / Prompt Aesthetic: Don't Write Prompts

- 配音：Fish Audio S2，英文。停顿用 `(break)` / `(long-break)`；情绪用 S2 的方括号标签（每句句首一个，转折处句中再加），作用到下一个标签或句末。
- 素材来源：Firefox 仓库 `AGENTS.md`(73 行)、`layout/`(31)、`js/`(80)、`gfx/wr/`(123)、`browser/extensions/newtab/`(85)、`.agents/skills/`(24 个 skill)、`review-context.toml`。
- 格式：`EN:` 为送入 fish 的台词，`ZH:` 为中文字幕。`script/fish/` 下是按章节拆好的纯文本。
- 为了读音稳定，台词里把 `AGENTS.md` 说成 "agents file"，`searchfox-cli` 说成 "command line search"，`.webidl` 说成 "web interface definition"；画面上显示原名。

## 01 hook — Don't write prompts

EN: [calm, confident] I'm going to say something that might be controversial. (break) [emphatic] Don't write prompts.
ZH: 我要说一个可能有争议的观点：别写提示词。

EN: [matter-of-fact] I don't mean stop talking to your agent. (break) I mean the big one. The giant instruction file at the root of your project, that tries to explain everything.
ZH: 我不是让你别和智能体说话。我说的是那个大家伙——放在项目根目录、试图解释一切的巨型指令文件。

EN: [curious] To see why, let's open one of the largest codebases on earth. (break) Firefox. (break) Tens of millions of lines of code. C++, Rust, JavaScript, Kotlin.
ZH: 想知道为什么，我们来打开地球上最大的代码库之一：Firefox。数千万行代码，C++、Rust、JavaScript、Kotlin。

EN: [thoughtful] You would expect its agent instructions to be enormous. (long-break) [surprised] The root file is seventy-three lines.
ZH: 你可能以为它给智能体的指令会长得吓人。根文件只有 73 行。

EN: [amused] And the very first rule in it? (break) Almost never add comments. (long-break) [dry humor] So, we're off to a good start.
ZH: 而它的第一条规则是什么？几乎不要写注释。嗯，开了个好头。

## 02 scope — Scope > Prompts

EN: [matter-of-fact] Here's a prompt most of us have written. One file. Build steps, test commands, style rules, architecture, and a warning about that one flaky test.
ZH: 这是我们大多数人都写过的提示词：一个文件，塞着构建步骤、测试命令、代码风格、架构说明，外加一条关于某个不稳定测试的警告。

EN: [dry humor] Every task pays for all of it. Fixing a typo in the docs? (break) [sarcastic] The agent still reads how the garbage collector works.
ZH: 每个任务都要为这一整份买单。只是改文档里的一个错别字？智能体照样得读一遍垃圾回收器的原理。

EN: [calm, confident] Firefox does something different. The root file holds only what is true everywhere. Then it lists five directories, and says: when you work in here, open the agents file that lives in here.
ZH: Firefox 的做法不一样。根文件只放放之四海而皆准的东西。然后它列出五个目录，并说：在这里干活时，打开这里面的那份 AGENTS.md。

EN: [warm] The JavaScript engine has one. Layout has one. WebRender has one. (break) Each is around a hundred lines or less, and each is only read when you step inside.
ZH: JavaScript 引擎有一份，排版有一份，WebRender 有一份。每份也就一百行上下，而且只有走进那个目录时才会被读到。

EN: [thoughtful] It's the same move as extracting a function. (break) The instruction didn't get shorter. [emphatic] It got a scope.
ZH: 这和提取函数是同一个动作。指令并没有变短，它只是有了作用域。

## 03 pointers — Pointers > Prose

EN: [curious] Now look inside the layout one. It's thirty-one lines, and most of them say the same thing. (break) [emphatic] Read this document first.
ZH: 再看排版模块那份。一共 31 行，而且大部分在说同一件事：先去读这份文档。

EN: [matter-of-fact] It doesn't explain the frame tree. It points to the file that does. (break) Because that document is maintained by the people who change the code, and a copy inside a prompt would be stale by Friday.
ZH: 它不解释帧树，它指向解释帧树的那个文件。因为那份文档由改代码的人维护，而提示词里的副本到周五就过期了。

EN: [impressed] The JavaScript engine's file goes one step further. It is a map. One line per directory, in the order a script flows through the engine. Parser, (break) interpreter, (break) compilers, (break) garbage collector.
ZH: JavaScript 引擎那份更进一步：它是一张地图。每个目录一行，按脚本流经引擎的顺序排列：解析器、解释器、编译器、垃圾回收器。

EN: [thoughtful] A map tells you where to look. (break) It doesn't try to be the territory.
ZH: 地图告诉你该往哪看，它不会试图成为疆域本身。

EN: [amused] And the Claude specific file? (break) It is one line. It imports the agents file. One source of truth, for every tool.
ZH: 那 Claude 专用的那个文件呢？只有一行：引入 AGENTS.md。所有工具，同一个事实来源。

## 04 tools — Tools > Prompts

EN: [matter-of-fact] Next problem. You can't grep Firefox. (break) [amused] Well, you can, but you'll wait.
ZH: 下一个问题。你没法 grep Firefox。好吧，可以，但你得等。

EN: [dry humor] You could write a paragraph about that. Search carefully. Restrict your paths. Be patient.
ZH: 你可以为此写上一段话：谨慎搜索，限定路径，保持耐心。

EN: [confident] Or, you can hand the agent a tool. (break) Firefox ships a command line search that understands the code. Ask it for a definition, and it answers.
ZH: 或者，你可以递给智能体一个工具。Firefox 自带一个理解代码的命令行搜索：问它某个定义，它就回答。

EN: [satisfied] Four example commands replace a whole page of advice.
ZH: 四条示例命令，替代了一整页的忠告。

EN: [emphatic] This is the type system of prompting. (break) A sentence asks the model to behave. A tool makes the right thing the easy thing.
ZH: 这就是提示词里的类型系统。一句话是在请求模型守规矩；一个工具让正确的事变成容易的事。

EN: [warm] And there's a lovely line right below it. If you can't find something quickly, (break) it is better to ask.
ZH: 紧接着下面还有一句很可爱的话：如果不能很快找到，问一下更好。

## 05 skills — Lazy > Always

EN: [thoughtful] But some knowledge really is long. Triaging a performance regression. Migrating translated strings. Splitting a commit for review.
ZH: 但有些知识确实很长：排查性能回退、迁移翻译字符串、为评审拆分提交。

EN: [matter-of-fact] Firefox keeps twenty-four of these, and calls them skills. Each one is a folder, with its own instructions, scripts, and references.
ZH: Firefox 有 24 个这样的东西，叫做 skill。每个都是一个文件夹，带着自己的说明、脚本和参考资料。

EN: [excited] Here's the trick. Only the description is loaded up front. One paragraph. The other few hundred lines stay on disk, until the task actually needs them.
ZH: 诀窍在这里：一开始只加载描述，就一段话。剩下的几百行躺在磁盘上，直到任务真正需要它们。

EN: [sincere] And the team is honest about the price. Their readme says every description carries an always-on cost. (break) If a skill isn't useful to everyone, it doesn't belong in the tree.
ZH: 而且团队对代价很坦诚。README 里写着：每条描述都带着常驻成本。如果一个 skill 不是对所有人都有用，它就不该放进代码树。

EN: [confident] So the description becomes an interface. The good ones say when to use them, (break) and when not to. Not for running tests. Use the other skill.
ZH: 于是描述变成了接口。写得好的会说明什么时候用，以及什么时候不用：不是用来跑测试的，请用另一个 skill。

EN: [impressed] Some even declare which commands they are allowed to run. (break) That's not a prompt anymore. (break) [emphatic] That's a signature.
ZH: 有些甚至声明了自己被允许运行哪些命令。这已经不是提示词了，这是函数签名。

## 06 triggers — Triggers > Memory

EN: [calm] One more layer. During code review, nobody should have to remember which guidance applies.
ZH: 还有一层。代码评审时，不该靠谁去记住该用哪份指南。

EN: [matter-of-fact] So there is a small config file of rules. If a patch touches a web interface definition and a C++ file, load the web standards guide. If it touches front end code, but not tests, load the front end guide.
ZH: 所以有一个很小的规则配置文件。补丁同时碰了 WebIDL 和 C++ 文件，就加载 Web 标准实现指南；碰了前端代码但不是测试，就加载前端指南。

EN: [emphatic] The prompt is selected by the diff. (break) [emphatic] Not by somebody's memory.
ZH: 提示词由 diff 来选择，而不是靠某个人的记性。

## 07 rot — Prompts rot

EN: [serious] Prompts have the same disease as comments. (break) Nothing checks them.
ZH: 提示词和注释得的是同一种病：没有任何东西检查它们。

EN: [dry humor] The compiler won't warn you when an instruction goes out of date. The agent will just follow it. (break) [dry humor] Confidently.
ZH: 指令过期时编译器不会警告你。智能体只会照做，而且信心十足。

EN: [warm] Firefox has a rule for this, and I love it. Reference a name, (break) not a position. This text outlives the code it describes.
ZH: Firefox 为此有一条规则，我很喜欢：引用名字，而不是位置。这段文字会比它描述的代码活得更久。

EN: [matter-of-fact] So, no line numbers. No, the function above. Names, and links that are pinned to a revision.
ZH: 所以，不写行号，不写“上面那个函数”。只写名字，以及固定到某个版本的链接。

## 08 exceptions — Exceptions for Prompts

EN: [curious] So should you never write a prompt? (break) [warm] Of course not.
ZH: 那是不是永远都不该写提示词？当然不是。

EN: [serious] Write down what the code can't tell you. (break) The traps.
ZH: 把代码没法告诉你的东西写下来：那些坑。

EN: [matter-of-fact] Like this one. A default screenshot does not show the real renderer output. So never conclude a rendering bug is fixed from a screenshot.
ZH: 比如这条：默认截图显示的并不是真实的渲染器输出。所以永远不要凭一张截图就断定渲染 bug 修好了。

EN: [serious] Or this. Never submit a patch without explicit approval.
ZH: 或者这条：未经明确批准，绝不提交补丁。

EN: [thoughtful] No amount of reading the source would teach an agent that. (break) [emphatic] That is what prompts are for.
ZH: 读再多源码，智能体也学不到这些。提示词就是为此而存在的。

## 09 outro — Structure > Prompts

EN: [surprised] And here is the part I didn't expect. These files are the best way to learn a large project. For agents, (break) and for people.
ZH: 还有一点是我没想到的：这些文件是学习一个大型项目的最佳途径。对智能体如此，对人也一样。

EN: [calm, confident] Start at the root, to learn what is true everywhere. Step into a module, and read its map. Then skim the skill descriptions, to see what work actually gets done here.
ZH: 从根目录开始，了解哪些事处处成立。走进一个模块，读它的地图。再扫一遍 skill 的描述，看看这里实际在做哪些工作。

EN: [satisfied] A few hundred lines, and you know where everything lives.
ZH: 几百行读下来，你就知道每样东西住在哪里。

EN: [thoughtful] So before you add another paragraph to your prompt, ask a different question. (break) [curious] Where should this live? (long-break) A scope, a pointer, a tool, a skill, or a trigger.
ZH: 所以在给提示词再加一段之前，换个问题问自己：这东西该住在哪？作用域、指针、工具、skill，还是触发器。

EN: [calm, confident] Don't write prompts. (long-break) [warm, emphatic] Build the place they belong.
ZH: 别写提示词。去建造它们该在的地方。
