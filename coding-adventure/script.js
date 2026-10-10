// The film, shot by shot. Durations come from the subtitle text (see timeline.js).
import { seq } from './timeline.js';
import { mkEnt, addDefaultEnts } from './src/physics.js';
import * as D from './diagrams.js';
import { S } from './snippets.js';

const mix = (a, b, k) => a + (b - a) * Math.min(1, Math.max(0, k));
const play = (id, cfg, lines) => ({ id, kind: 'play', ...cfg, lines });
const dia = (id, draw, lines, x = {}) => ({ id, kind: 'dia', draw, lines, ...x });
const code = (id, snip, reveal, hl, lines, x = {}) => ({ id, kind: 'code', snip, reveal, hl, lines, ...x });
const from = (c, t0, parts, fb = {}) => (c.t < t0 ? {} : seq(c.t - t0, parts, fb));
const FWD = { mx: 1 }, DASH = { mx: 1, dash: true };
const PLAIN = { field: 0, glitch: 0 };

export const SHOTS = [
  // ------------------------------------------------------------------ intro
  { id: 'title', kind: 'title', big: 'Code Odyssey', small: '叠界：一个身体，两个世界', sub: 'two worlds, one body', lines: [
    ['今天，我想试着把两个世界塞进同一个空间', "Today I'd like to try cramming two worlds into the same space."],
  ] },
  play('hook1', {
    spawn: [10, 8, 31.5],
    input: (c) => (c.t < c.at(2) ? { mx: 0.38 } : FWD),
    phi: (c) => (c.in(1, 1.2, 4.4) ? 1 : 0),
    cam: (c) => ({ yaw: mix(2.0, 2.75, c.t / c.dur), pitch: 0.42, dist: 12, h: 0.4 }),
  }, [
    ['这是我最终做出来的效果', "Here's what I ended up with."],
    ['同一个地方，叠着两个世界：一个干涸，一个被淹没', 'One place, two overlapping worlds: one dried out, one drowned.'],
    ['而我在两个世界里各有一个身体', 'And I have one body in each of them.', { pad: 0.6 }],
  ]),
  play('hook2', {
    spawn: [20, 8, 33],
    input: (c) => (c.t < c.at(1) + 0.6
      ? from(c, 0.4, [[1.62, FWD], [0.2, DASH]], FWD)
      : from(c, c.at(1) + 0.6, [[0.5, { mx: -1 }], [0.3, FWD], [0.2, DASH]], FWD)),
    cam: () => ({ yaw: 2.0, pitch: 0.42, dist: 10.5 }), tail: 1,
  }, [
    ['两个世界的物理规则打架的时候……', 'When their rules of physics disagree…'],
    ['空间本身会被撕出一片「冲突场」', "…space itself tears into what I'm calling a conflict field."],
  ]),
  play('hook3', {
    spawn: [97, 8, 31.5],
    input: () => ({ mx: 0.3 }),
    phi: (c) => 0.5 - 0.5 * Math.cos(c.t * 0.7),
    eye: (c) => 0.12 + 0.8 * c.p(0, 4.5, 0.4),
    cam: (c) => ({ pos: [mix(85, 88, c.t / c.dur), 9.6, 37], target: [108, 19, 30], fov: 68 }), tail: 0.6,
  }, [
    ['还有一些不太友善的东西在看着', 'Also, something not entirely friendly is watching.'],
    ['不过这是后话，我们先从头开始', "But we'll get to that. Let's start from the beginning."],
  ]),

  // ------------------------------------------------------------------ 1 rules
  dia('layers', D.layers, [
    ['先说清楚规则', 'First, the rules.'],
    ['世界 A 和世界 B 占据同一块空间', 'World A and world B occupy the exact same space.'],
    ['它们互相看不见、碰不到，谁也干涉不了谁', "They can't see or touch each other. Neither can interfere with the other."],
    ['A 里的一堵墙，对 B 来说根本不存在', "A wall in A simply doesn't exist as far as B is concerned."],
    ['唯一的例外是玩家', 'The one exception is the player.', { pad: 0.5 }],
  ], { chapter: '01 · 规则' }),
  dia('twoBodies', D.twoBodies, [
    ['玩家同时存在于两个世界', 'The player exists in both worlds at once.'],
    ['所以我给了他两个身体，各自只和自己的世界碰撞', 'So I gave them two bodies, each colliding only with its own world.'],
    ['同一份输入，同时驱动两个身体', 'The same input drives both bodies.'],
    ['只要两个世界意见一致，两个身体就完全重合', 'As long as the worlds agree, the bodies overlap perfectly.'],
    ['可一旦 A 说「这里有墙」，B 说「这里没有」……', "But the moment A says 'there's a wall here' and B says 'no there isn't'…"],
    ['两个身体就会分开——这就是矛盾', "…the two bodies come apart. That's a contradiction."],
    ['这期视频的全部内容，就是想办法处理这个矛盾', 'This whole video is about figuring out what to do with it.'],
  ]),

  // ------------------------------------------------------------------ 2 rendering
  code('data', S.data, [2, 2, 6, 9, 13], [null, [1, 1], [4, 4], [7, 8], [10, 12]], [
    ['先得能看见东西。我打算用体素', "First we need to see something. I'm going with voxels."],
    ['整个场景是一张 128×40×64 的三维贴图', 'The whole scene is a single 128×40×64 3D texture.'],
    ['关键在于：每个格子存两个数', 'The key idea: every cell stores two numbers.'],
    ['一个是它在世界 A 里的材质，一个是在世界 B 里的', 'One is its material in world A, the other its material in world B.'],
    ['两个世界，共用一张贴图', 'Two worlds, one texture.', { pad: 0.6 }],
  ], { chapter: '02 · 一条光线，两个世界' }),
  dia('dda', D.dda, [
    ['渲染全部在一个片元着色器里完成', 'All the rendering happens in one fragment shader.'],
    ['每个像素发出一条光线，一格一格地穿过网格', 'Each pixel fires a ray that steps through the grid one cell at a time.'],
    ['这个算法叫 DDA：每一步都恰好走到下一个格子的边界', 'The algorithm is called DDA: each step lands exactly on the next cell boundary.'],
    ['因为每格有两个数，同一条光线能同时知道两个世界的情况', 'Because each cell holds two numbers, one ray learns about both worlds at once.', { pad: 1.2 }],
  ]),
  code('ddaCode', S.dda, [3, 13, 13], [null, [9, 11], [5, 6]], [
    ['写成代码大概是这样', 'In code it looks roughly like this.'],
    ['比较三个轴上到下一个边界的距离，走最近的那个', 'Compare the distance to the next boundary on each axis, and take the nearest.'],
    ['然后读出这一格的两个材质', 'Then read both materials for that cell.', { pad: 0.6 }],
  ]),
  play('grey', {
    spawn: [14, 8, 31.5], noPlayer: true, ents: false,
    opt: () => ({ look: 0, outline: 0, shadow: 0, ...PLAIN }),
    cam: (c) => ({ center: [34, 9, 31.5], yaw: mix(2.7, 3.0, c.t / c.dur), pitch: 0.55, dist: 26 }),
    hud: { tag: '第一次渲染' },
  }, [
    ['跑起来看看', "Let's run it."],
    ['呃，能看到方块了，这是好消息', "Well, we can see blocks. That's the good news."],
    ['坏消息是两个世界糊成了一坨，完全分不清谁是谁', "The bad news is both worlds are mashed into one blob. You can't tell which is which."],
  ]),
  play('styled', {
    spawn: [14, 8, 31.5], noPlayer: true, ents: false,
    opt: (c) => ({ look: c.t > 0.6 ? 1 : 0, shadow: c.t > 2.6 ? 1 : 0, outline: c.t > 4.6 ? 1 : 0, ...PLAIN }),
    cam: (c) => ({ center: [34, 9, 31.5], yaw: mix(3.0, 3.55, c.t / c.dur), pitch: 0.55, dist: 26 }),
    hud: { tag: '调色板 → 明暗 → 描边' },
  }, [
    ['加上各自的调色板、三段式的赛璐璐明暗，再描个边', 'Add a palette per world, three-band cel shading, and ink outlines.', { pad: 0.8 }],
    ['好看多了，但问题还在：到底哪面墙属于哪个世界？', "Much prettier, but the problem remains: which wall belongs to which world?"],
  ]),
  dia('outline', D.outline, [
    ['描边没有用后处理：光线打中一个面时，顺手查一下四周的格子', "The outlines aren't a post-process: when a ray hits a face, it checks the neighbouring cells."],
    ['旁边同样是实心，说明这里是平的，不画', "If the neighbour is solid too, the surface is flat. No line."],
    ['斜上方有东西，说明这是个折角', "If there's something diagonally above, it's a crease."],
    ['旁边是空的，说明到了轮廓的边缘', "If the neighbour is empty, we've reached the silhouette."],
  ]),
  dia('ghost', D.ghost, [
    ['至于分不清世界的问题：我让玩家「注视」其中一个世界', 'As for telling the worlds apart: I have the player "attend" to one of them.'],
    ['被注视的世界画成实心', 'The attended world is drawn solid.'],
    ['另一个世界只留下发光的轮廓和一点点雾', 'The other is left as glowing outlines and a little haze.'],
    ['光线碰到幽灵表面不会停下，而是带上一点颜色继续前进', "A ray hitting a ghost surface doesn't stop. It picks up a little colour and keeps going."],
    ['如果某个格子在两个世界里都是实心，那它就是真的实心', "And if a cell is solid in both worlds, then it's just… solid.", { pad: 0.6 }],
  ]),
  code('compositeCode', S.composite, [14, 14], [[10, 12], [0, 1]], [
    ['实现起来就是从前往后累加颜色', 'The implementation is plain front-to-back compositing.'],
    ['透明度取决于这个面属于哪个世界，以及我们正在注视谁', "Opacity depends on which world the surface belongs to, and which one we're attending to."],
  ]),
  play('dual', {
    spawn: [16, 8, 31.5], hud: { phi: true },
    setup(st, shot) {
      const T5 = shot.lines[5].start;
      addDefaultEnts(st.sim);
      st.sim.ents[0] = mkEnt(2, 0, [[33, 8, 26], [46, 8, 26], [33, 8, 26]], 1.6, 0.1, T5 - 2.0);
      st.sim.ents[2] = mkEnt(3, 1, [[24, 10.5, 37], [37, 10.5, 37], [24, 10.5, 37]], 1.5, 0.2, T5 - 3.0);
    },
    input: (c) => (c.t < 6 ? { mx: 0.22 } : {}),
    phi: (c) => (c.line === 2 ? 1 : c.line === 3 ? (c.lt > 2.6 ? 1 : 0) : c.line === 4 ? (c.lt > 2.4 ? 1 : 0) : c.line === 5 ? (c.lt > 2.9 ? 1 : 0) : 0),
    cam: (c) => (c.line < 5 ? { yaw: mix(2.2, 2.95, c.t / c.at(5)), pitch: 0.5, dist: 10.5 } : { pos: [35, 15.5, 42.5], target: [35, 9, 29], fov: 64 }),
  }, [
    ['这样就清楚多了', "That's a lot clearer."],
    ['暖色的是干涸的世界 A', 'Warm colours: the dried-out world A.'],
    ['按一下键，注视另一边：冷色的、被淹没的世界 B', 'Tap a key to attend to the other side: the cold, drowned world B.'],
    ['顺便，两个世界各有一个太阳，所以影子的方向也不一样', 'Incidentally, each world has its own sun, so the shadows point different ways.'],
    ['A 的东西在 B 里没有影子，反过来也一样', 'Things in A cast no shadow in B, and vice versa.'],
    ['还有这些居民：它们只属于一个世界，会直接穿过另一个世界的墙', "And these residents belong to one world only, so they drift straight through the other world's walls.", { pad: 1.2 }],
  ]),

  // ------------------------------------------------------------------ 3 two bodies
  code('bodiesCode', S.bodies, [1, 13], [null, [8, 10]], [
    ['接下来是物理', 'Now for the physics.'],
    ['两个身体，各走各的，各撞各的世界', 'Two bodies, each moving and colliding in its own world.', { pad: 1.5 }],
  ], { chapter: '03 · 两个身体' }),
  play('noCouple', {
    spawn: [22, 8, 31.5], flags: { coupling: false, tunnel: 'off' }, opt: () => PLAIN, hud: { phi: true, tag: '两个身体 · 没有任何联系' },
    input: (c) => (c.t < c.at(3)
      ? from(c, 0.8, [[c.at(2) + 1.5 - 0.8, { mx: 0.4 }]])
      : c.line === 3 ? from(c, c.at(3) + 0.3, [[1.5, { mz: 1 }], [1.5, { mz: -1 }]])
        : from(c, c.at(4) + 0.2, [[1.5, { mx: -1 }], [1.6, FWD]])),
    cam: () => ({ yaw: 2.15, pitch: 0.62, dist: 14 }), tail: 0.8,
  }, [
    ['先什么都不管，直接跑', "Let's just run it with nothing else."],
    ['走到 A 才有的这堵墙面前……', 'Walk up to a wall that only exists in A…'],
    ['A 的身体被挡住了，B 的身体继续往前走', "A's body is blocked. B's body just keeps going."],
    ['好的，我现在是两个人了', 'Great. I am now two people.'],
    ['而且永远合不回去', "And there's no way to put me back together."],
  ]),
  dia('spring', D.springDia, [
    ['所以需要有东西把两个身体拉在一起', 'So something has to pull the bodies back together.'],
    ['最简单的就是一根弹簧', 'The simplest thing is a spring.'],
    ['分得越远，拉力越大', 'The further apart, the harder it pulls.'],
    ['我让它越拉越硬，这样两个身体永远不会离得太远', 'I made it stiffen as it stretches, so the bodies can never drift too far.', { pad: 0.8 }],
  ]),
  code('springCode', S.spring, [5, 10], [[3, 4], [6, 7]], [
    ['代码只有几行', "It's only a few lines of code."],
    ['力作用在 A 身上，反方向的力作用在 B 身上', 'The force acts on A, and the opposite force acts on B.', { pad: 0.8 }],
  ]),
  play('noDamp', {
    spawn: [24, 8, 31.5], flags: { damping: false, tunnel: 'off' }, opt: () => PLAIN, hud: { phi: true, tag: '弹簧 · 没有阻尼' },
    input: (c) => (c.t > 0.5 ? FWD : {}),
    cam: () => ({ yaw: 1.95, pitch: 0.3, dist: 8.5 }),
  }, [
    ['再试一次', 'Try again.'],
    ['这次 B 确实被拉回来了，然后……又弹出去了', 'This time B does get pulled back, and then… bounces out again.'],
    ['两个世界在拿我当弹弓玩', 'The two worlds are using me as a slingshot.'],
  ]),
  dia('damping', D.damping, [
    ['这是两个身体之间的距离随时间的变化', "Here's the distance between the bodies over time."],
    ['弹簧只会把能量存起来，再原样还回去', 'A spring only stores energy and hands it straight back.'],
    ['加一个和相对速度成正比的阻尼，把能量耗掉', 'Add damping proportional to their relative velocity to burn that energy off.', { pad: 1 }],
  ]),
  play('damped', {
    spawn: [24, 8, 31.5], flags: { tunnel: 'off' }, opt: () => PLAIN, hud: { phi: true, tag: '弹簧 + 阻尼' },
    input: (c) => (c.t > 0.5 && c.t < c.at(4) + 0.6 ? FWD : {}),
    phi: (c) => ((c.line === 3 && c.lt > 0.6) || (c.line === 4 && c.lt < 1.4) ? 1 : 0),
    cam: (c) => ({ yaw: mix(1.95, 2.35, c.t / c.dur), pitch: 0.34, dist: 8.5 }), tail: 0.8,
  }, [
    ['现在好了', "That's better."],
    ['A 撞墙，B 往前探出去一点，然后被稳稳拉住', 'A hits the wall, B leans forward a little, and is held firmly.'],
    ['我继续往前推，B 也走不动了', "I keep pushing forward, and B can't move either."],
    ['墙所在的世界，正通过弹簧干涉另一个世界里的我', 'The world with the wall is reaching through the spring to restrain me in the other one.'],
    ['一松手，两个身体合二为一，回到稳定态', 'Let go, and the bodies merge again, back to a stable state.'],
  ]),

  // ------------------------------------------------------------------ 4 conflict field
  dia('field', D.field, [
    ['矛盾现在有了一个可以量化的数值：弹簧的张力', 'The contradiction now has a number: the tension in the spring.'],
    ['我想让它看得见', 'I want to make it visible.'],
    ['于是我又加了一张低分辨率的三维贴图，叫它冲突场', 'So I added another, lower-resolution 3D texture and called it the conflict field.'],
    ['每一帧，往两个身体之间、以及被顶住的那面墙上「泼」一点强度', "Each frame I splat some intensity between the bodies and onto whatever they're pushing against."],
    ['张力越大，泼得越多', 'The higher the tension, the more gets splatted.', { pad: 0.6 }],
  ], { chapter: '04 · 冲突场' }),
  code('fieldCode', S.field, [6, 9, 12, 12], [[2, 5], [8, 8], [9, 11], [9, 11]], [
    ['物理这边，每帧根据张力往场里泼两次', 'On the physics side, two splats per frame, scaled by tension.'],
    ['着色器里，光线每走一格就顺便采样一次冲突场', 'In the shader, every step of the ray also samples the conflict field.'],
    ['颜色我选了一对很刺眼的互补色，做成流动的干涉条纹', 'For colour I picked an obnoxious complementary pair, drawn as moving interference bands.'],
    ['毕竟这确实是两个世界在互相干涉', 'It is, after all, two worlds interfering.'],
  ]),
  play('noDecay', {
    spawn: [26, 8, 31.5], flags: { fieldDecay: false, tunnel: 'off' }, hud: { phi: true, sigma: true, tag: '冲突场 v1' },
    input: (c) => from(c, 0.3, [[2.7, FWD], [3.4, { mx: 1, mz: 1 }], [5, { mx: 1, mz: -1 }]], { mx: 1, mz: 1 }),
    cam: () => ({ yaw: 2.5, pitch: 0.62, dist: 14 }),
  }, [
    ['效果不错！', 'That looks pretty good!'],
    ['……就是好像停不下来', "…it just doesn't seem to stop."],
    ['我忘了让它衰减。走到哪，哪就永久变成了粉色', 'I forgot to make it decay. Everywhere I go turns permanently pink.', { pad: 1.5 }],
  ]),
  code('decayCode', S.decay, [7], [[1, 1]], [
    ['每帧乘上一个小于 1 的系数就行了', 'Multiplying by something less than one each frame fixes it.', { pad: 0.8 }],
  ], { insert: 1 }),
  play('decay', {
    spawn: [26, 8, 31.5], flags: { tunnel: 'off' }, hud: { phi: true, sigma: true, tag: '冲突场 v2' },
    input: (c) => (c.line === 0 ? (c.t > 0.3 && c.lt < 3.4 ? FWD : {}) : c.line === 1 ? (c.lt > 0.3 ? FWD : {}) : c.line === 2 ? { mx: 1, mz: c.lt < 3.5 ? 0.4 : 0 } : FWD),
    cam: (c) => (c.line < 3 ? { yaw: 2.4, pitch: mix(0.5, 0.4, c.t / c.at(3)), dist: mix(11, 8, c.p(2, 1.5)) } : { yaw: 2.05, pitch: 0.2, dist: mix(8, 5.2, c.p(3, 1.5)), h: -0.1 }), tail: 0.8,
  }, [
    ['现在冲突越强，场越亮；松手之后慢慢消散', 'Now the field glows with the conflict and fades once I let go.'],
    ['我还加了一点色差和画面撕裂，强度同样跟着张力走', 'I also added chromatic aberration and screen tearing, driven by the same tension.'],
    ['被冲突场碰到的墙会染上斜纹，一眼就能看出是谁在闹矛盾', "Walls touched by the field get hatched, so you can tell at a glance what's causing the argument."],
    ['两个身体之间那条闪电，就是弹簧本身', 'And that lightning between the bodies is the spring itself.'],
  ]),

  // ------------------------------------------------------------------ 5 tunnelling
  dia('tunnel', D.tunnel, [
    ['到这里，薄薄一堵墙就能把我永远挡住', 'As it stands, one thin wall can stop me forever.'],
    ['这有点无聊。如果我跑得足够快呢？', "That's a bit dull. What if I'm going fast enough?"],
    ['规则是这样的：当张力超过一个阈值', "Here's the rule: when the tension exceeds a threshold…"],
    ['而且两个身体还在高速分离', '…and the bodies are still separating at speed…'],
    ['被挡住的那个身体就会「脱相」：暂时离开自己的世界', "…the blocked body 'phases out': it temporarily leaves its own world."],
    ['它不再和自己的墙碰撞，被弹簧一把拽过去', 'It stops colliding with its own walls and gets yanked across by the spring.', { pad: 0.8 }],
  ], { chapter: '05 · 穿墙' }),
  code('naiveCode', S.naive, [10], [[1, 2]], [
    ['第一版非常直接：超过阈值，就把碰撞关掉 0.12 秒', 'Version one was blunt: over the threshold, switch collision off for 0.12 seconds.', { pad: 1 }],
  ]),
  play('naive', {
    spawn: [22.6, 8, 31.5], flags: { tunnel: 'naive', speedGate: false }, hud: { phi: true, sigma: true, tag: '穿墙 v1 · 计时器' },
    cuts: [{ line: 3, pos: [44, 8, 28] }],
    input: (c) => (c.line < 3 ? from(c, 1.6, [[1.1, FWD], [0.2, DASH], [0.6, FWD], [1.6, { mx: 0.3 }]])
      : c.line < 5 ? from(c, c.at(3) + 0.9, [[0.7, FWD], [0.2, DASH], [1.0, FWD]])
        : from(c, c.at(5) + 1.2, [[1, { mx: -1 }], [1, { mz: 1 }], [1, { mx: -1, mz: -1 }], [1.5, FWD], [1.5, { mx: -1 }]], { mz: -1 })),
    phi: (c) => (c.line >= 5 && c.in(5, 0.5) ? 1 : 0),
    cam: (c) => ({ yaw: mix(2.3, 1.9, c.p(5, 2)), pitch: mix(0.42, 0.3, c.p(5, 2)), dist: mix(10, 6.5, c.p(5, 2)) }), tail: 0.6,
  }, [
    ['给玩家加一个冲刺，试试薄墙', 'Give the player a dash and try the thin wall.'],
    ['穿过去了！', 'Straight through!'],
    ['两个身体在墙的另一边重新合上：这是一个新的稳定态', 'The bodies re-merge on the far side: a new stable state.'],
    ['那厚一点的墙呢？', 'What about a thicker wall?', { pad: 0.6 }],
    ['……啊', '…Ah.', { pad: 1.0 }],
    ['0.12 秒到了，碰撞恢复，而 A 的身体还在墙里面', "The 0.12 seconds ran out, collision came back, and A's body is still inside the wall."],
    ['它卡死在石头里，B 的身体被弹簧拴在外面', "It's entombed in stone, with B's body tethered outside."],
  ]),
  dia('states', D.states, [
    ['所以不能用计时器', "So a timer won't do."],
    ['脱相的身体应该一直保持脱相，直到它真的离开了实心区域', 'A phased body should stay phased until it has actually left solid matter.'],
    ['脱相期间，它改为服从另一个世界的几何——毕竟它正借住在那边', "While phased, it obeys the other world's geometry instead. It's a guest there, after all."],
    ['而墙会像摩擦力一样死死咬住它，只有足够大的拉力才拖得动', 'Meanwhile the wall grips it like friction; only a strong enough pull can drag it through.'],
    ['如果拉力不够了它还没出去，墙就把它原路吐回去', "If the pull fades before it's out, the wall spits it back the way it came."],
  ]),
  code('phaseCode', S.phase, [12], [[3, 7]], [
    ['写成代码，是一个很小的状态机', "In code, it's a very small state machine.", { pad: 1.5 }],
  ]),
  play('full', {
    spawn: [24, 8, 31.5], hud: { phi: true, sigma: true, tag: '穿墙 v2 · 状态机' },
    input: (c) => {
      const T1 = c.at(1) + 1.2, T2 = c.at(2) + 0.6, T3 = c.at(3) + 2.0;
      if (c.t < T1) return from(c, 0.4, [[0.72, FWD], [0.2, DASH], [0.9, FWD]], { mx: 0.3 });
      if (c.t < T2) return from(c, T1, [[0.3, FWD], [0.2, DASH], [0.9, FWD]]);
      if (c.t < T3) return from(c, T2, [[0.35, FWD], [0.2, DASH], [1.2, FWD]]);
      return from(c, T3, [[0.5, { mx: -1 }], [0.2, FWD], [0.2, DASH], [1.2, FWD]]);
    },
    phi: (c) => (c.line === 1 && c.lt > 0.2 ? 1 : 0),
    cam: () => ({ yaw: 2.05, pitch: 0.42, dist: 10.5 }), tail: 0.6,
  }, [
    ['薄墙：穿过', 'Thin wall: through.'],
    ['反过来也一样：这堵珊瑚墙只存在于 B', 'It works the other way too: this coral wall exists only in B.'],
    ['厚墙：冲进去一半，被吐了回来', 'Thick wall: halfway in, then spat back out.'],
    ['能穿多厚，完全取决于冲刺能把弹簧拉多长', 'How thick a wall you can pass depends entirely on how far the dash can stretch the spring.'],
    ['这不是我写死的规则，是从弹簧里自己长出来的', "I didn't hard-code that. It just falls out of the spring."],
  ]),
  play('door', {
    spawn: [45, 8, 31.5], hud: { phi: true, sigma: true },
    input: (c) => (c.line < 2 ? from(c, 0.4, [[1.4, { mz: 1 }]]) : from(c, c.at(2) + 0.8, [[0.8, FWD], [0.2, DASH], [1.5, FWD]])),
    phi: (c) => (c.line === 1 && c.lt > 3.4 ? 1 : 0),
    cam: (c) => ({ yaw: mix(2.25, 2.5, c.p(2, 1.5)), pitch: 0.5, dist: mix(4.6, 8, c.p(2, 1.5)), fov: 70 }), tail: 0.8,
  }, [
    ['于是可以做一点小谜题', 'Which means we can build little puzzles.'],
    ['A 的厚墙上有一扇门，可门洞在 B 里被珊瑚堵死了', "A's thick wall has a doorway, but in B the doorway is plugged with coral."],
    ['走 A 的门，同时撞穿 B 的珊瑚', "Walk through A's door while smashing through B's coral."],
  ]),
  play('stairBug', {
    spawn: [95.5, 8, 31.5], flags: { speedGate: false }, hud: { phi: true, sigma: true, tag: '只判断张力' },
    input: (c) => from(c, 0.5, [[4.4, { mx: 0.5 }], [4.4, { mx: -0.5 }], [4.4, { mx: 0.5 }], [4.4, { mx: -0.5 }], [4.4, { mx: 0.5 }]]),
    cam: () => ({ yaw: 2.2, pitch: 0.3, dist: 10 }),
  }, [
    ['还有一个我完全没料到的 bug', 'There was one more bug I really did not see coming.'],
    ['上台阶的时候，我会时不时抽搐一下，掉进台阶里', "Climbing stairs, I'd occasionally twitch and drop into the steps."],
    ['原因是迈上台阶那一瞬间，A 的身体抬高一格，弹簧被猛地拉长', "The cause: stepping up lifts A's body one cell in an instant, yanking the spring taut."],
    ['张力一下子超过阈值，A 就把自己脚下的地板当成墙「穿」了过去', 'Tension spikes past the threshold, and A "tunnels" through its own floor as if it were a wall.'],
  ]),
  play('stairFix', {
    spawn: [95.5, 8, 31.5], hud: { phi: true, sigma: true, tag: '张力 + 分离速度' },
    input: (c) => from(c, 0.5, [[4.4, { mx: 0.5 }], [4.4, { mx: -0.5 }], [4.4, { mx: 0.5 }]]),
    cam: () => ({ yaw: 2.2, pitch: 0.3, dist: 10 }),
  }, [
    ['所以才有了刚才的第二个条件：两个身体必须还在高速分离', "Hence that second condition from earlier: the bodies must still be separating at speed."],
    ['上台阶时 B 是在追上来，而不是在远离，就不会误触发了', "On stairs, B is catching up rather than pulling away, so it no longer misfires."],
  ]),

  // ------------------------------------------------------------------ 6 walk / swim
  dia('buoyancy', D.buoyancy, [
    ['到目前为止，两个世界只是墙的位置不同', 'So far the worlds only differ in where their walls are.'],
    ['更有意思的是让它们的物理规则也不同', "It's more interesting if their physics differ too."],
    ['比如这个下沉的庭院：在 A 里是干的，在 B 里灌满了水', 'Take this sunken court: dry in A, flooded in B.'],
    ['A 的身体受重力往下掉，B 的身体受浮力往上漂', "A's body is pulled down by gravity; B's body is pushed up by buoyancy."],
    ['弹簧夹在中间，被上下拉扯', 'The spring sits between them, pulled both ways.'],
    ['最后停在一个谁也不满意的位置', 'They settle somewhere neither of them is happy with.', { pad: 1 }],
  ], { chapter: '06 · 一个走路，一个游泳' }),
  code('waterCode', S.water, [12, 12], [[4, 10], null], [
    ['代码上，每个身体只按自己世界的规则受力', 'In code, each body only feels the forces of its own world.'],
    ['它们之间唯一的联系，还是那根弹簧', 'The only thing linking them is still that spring.'],
  ]),
  play('court', {
    spawn: [58, 8, 31.5], hud: { phi: true, sigma: true },
    input: (c, st) => {
      if (c.line === 0) return c.t > 0.3 ? { mx: 0.6 } : {};
      if (c.line === 1) return { mx: 0.25 };
      if (c.line === 4) return c.lt < 2.7 ? { mx: 0.7 } : {};
      if (c.line === 5) return { mx: 0.5 };
      if (c.line === 6) return from(c, c.at(6) + 1.5, [[1.4, { dive: true }], [2.6, { dive: true, mx: 0.6 }]], { mx: 0.2 });
      if (c.line === 7) return st.sim.mid[0] < 90.5 ? { mx: 0.7 } : {};
      return {};
    },
    phi: (c) => (c.line === 5 || c.line === 6 ? 1 : 0),
    cam: (c) => ({ yaw: mix(2.2, 2.6, c.t / c.dur), pitch: mix(0.5, 0.36, c.p(2, 3)), dist: mix(12, 10, c.p(2, 3)) }), tail: 1,
  }, [
    ['走进庭院', 'Walking into the court.'],
    ['在 A 里我明明走在干地上，身体却慢慢飘了起来', "In A I'm on dry ground, and yet my body slowly lifts off."],
    ['冲突场一直亮着，但很稳定：这是一个「接近平衡」的状态', "The conflict field stays lit but steady: a state that's 'close enough' to balance."],
    ['A 里有一道跳不过去的矮墙', "In A there's a low wall too high to jump."],
    ['但 B 的浮力可以把 A 的身体拎过去', "But B's buoyancy can carry A's body right over it."],
    ['接着 B 里有一片礁石顶棚，游不过去', "Next, B has a reef ceiling that can't be swum over."],
    ['这回轮到 A 的重量帮忙：按住下潜，把 B 的身体拽到水底', "Now A's weight helps out: hold dive, and it drags B's body to the bottom."],
    ['一个世界走路，一个世界游泳，互相拉扯着前进', 'Walking in one world, swimming in the other, each dragging the other along.'],
  ]),
  play('courtB', {
    spawn: [67, 6, 31.5], hud: { phi: true, sigma: true },
    input: (c) => ({ mx: 0.4 * Math.cos(c.t * 0.6), mz: 0.4 * Math.sin(c.t * 0.6) }),
    phi: () => 1,
    cam: (c) => ({ yaw: 1.9 + c.t * 0.07, pitch: 0.2, dist: 8.5, h: 0.5 }),
  }, [
    ['从 B 这边看是这样的', "Here's how it looks from B's side."],
    ['顺带一提，水面上这些圈也只是着色器里的几个 sin', 'The rings on the water, by the way, are just a few sines in the shader.', { pad: 1.5 }],
  ]),

  // ------------------------------------------------------------------ 7 reconciliation
  dia('reconcile', D.reconcile, [
    ['最后一个想法', 'One last idea.'],
    ['现在的矛盾是永久的：墙永远在 A 里、永远不在 B 里', 'Right now contradictions are permanent: the wall is forever in A and never in B.'],
    ['如果世界自己会修正呢？', 'What if the worlds corrected themselves?'],
    ['我给每个闹矛盾的体素记一个「应力」', "I track a 'stress' value for each voxel involved in a contradiction."],
    ['一直顶着墙不放，应力满了，这格体素就被写进另一个世界', 'Keep pushing on a wall until the stress fills up, and that voxel gets written into the other world.'],
    ['两边都有墙，矛盾消失', 'Both sides now have a wall. Contradiction gone.'],
    ['反过来，如果是脱相穿过去的，经过的体素就被直接抹掉', 'Conversely, if you phase through, the voxels you passed are erased outright.'],
    ['两边都没有墙，矛盾同样消失', 'Neither side has a wall. Contradiction also gone.', { pad: 0.6 }],
  ], { chapter: '07 · 世界自己会修正' }),
  code('reconcileCode', S.reconcile, [13], [[3, 7]], [
    ['不管哪种，世界都在朝「两边一致」的方向收敛', 'Either way, the worlds converge towards agreeing with each other.', { pad: 1.5 }],
  ]),
  play('imprint', {
    spawn: [89, 8, 28], flags: { reconcile: true }, hud: { phi: true, sigma: true, tag: '世界修正：开' },
    input: (c) => {
      if (c.t < c.at(3)) return c.t > 2.6 && c.t < c.at(2) + 2 ? FWD : {};
      if (c.t < c.at(4)) return from(c, c.at(3), [[1.0, { mz: 1 }], [0.5, { mx: -1 }]]);
      if (c.t < c.at(5)) return from(c, c.at(4) + 0.3, [[0.3, FWD], [0.2, DASH], [0.5, FWD]]);
      return from(c, c.at(5) + 0.3, [[1.5, { mx: -1 }], [1.5, FWD], [1.5, { mx: -1 }]]);
    },
    phi: (c) => (c.in(2, 2.4, 4.6) ? 0 : 1),
    cam: (c) => ({ yaw: mix(2.45, 2.75, c.t / c.dur), pitch: 0.45, dist: mix(8, 9.5, c.p(3, 1)) }), tail: 0.6,
  }, [
    ['顶住这层只存在于 B 的膜', 'Lean on this membrane that only exists in B.'],
    ['冲突场越来越亮……', 'The field gets brighter…'],
    ['然后它凝固了。这几格现在同时属于两个世界', '…and then it sets. These cells now belong to both worlds.'],
    ['换个地方，冲过去', 'Move over and dash through instead.'],
    ['这次留下了一个洞', 'This time it leaves a hole.'],
    ['只要我走得够多，两个世界迟早会被我磨成同一个', "Walk around enough and I'll eventually grind the two worlds into one."],
  ]),
  play('eye', {
    spawn: [96, 8, 31.5], flags: { reconcile: true }, hud: {},
    input: (c) => (c.t > 0.4 && c.t < 5.9 ? { mx: 0.4 } : {}),
    phi: (c) => 0.5 - 0.5 * Math.cos(c.t * 0.5),
    eye: (c, st) => Math.max(st.sim.eye, 0.1 + 0.85 * c.p(1, 7)),
    cam: (c) => {
      const z = c.p(4, 2.5), pos = [mix(94.5, 96.5, c.t / c.dur), 9.4, 37.5];
      const t0 = [111, 19, 30], t1 = [pos[0] + 15.6, pos[1] + 11.2, pos[2]];
      return { pos, target: t0.map((v, i) => mix(v, t1[i], z)), fov: mix(68, 40, z) };
    }, tail: 1.5,
  }, [
    ['不过有个小问题', 'There is one small problem, though.'],
    ['每一次冲突、每一次修正，天上那个东西就睁开一点', 'With every conflict and every correction, that thing in the sky opens a little wider.'],
    ['它不属于 A，也不属于 B', "It doesn't belong to A. It doesn't belong to B."],
    ['它住在两个世界的缝隙里，而我一直在帮它把缝撑大', "It lives in the gap between them, and I've been helpfully prying that gap open."],
    ['……我决定先不修这个 bug', "…I've decided not to fix that bug for now."],
  ]),

  // ------------------------------------------------------------------ outro
  play('outro', {
    spawn: [14, 8, 31.5], noPlayer: true, hud: {},
    phi: (c) => 0.5 - 0.5 * Math.cos(c.t * 0.42),
    eye: () => 0,
    cam: (c) => { const k = c.t / c.dur, x = mix(8, 104, k), z = 31.5 + 7 * Math.sin(k * 5); return { pos: [x, 18 - 3 * Math.sin(k * 3.14), z], target: [x + 14, 9, 31.5 - 3 * Math.sin(k * 5)], fov: 62 }; },
    fadeOut: 2, tail: 3,
  }, [
    ['这就是目前的全部了', "And that's everything so far."],
    ['还有很多可以做的：不同的重力方向、不同的时间流速……', "There's lots more to try: different gravity directions, different rates of time…"],
    ['或者第三个世界', 'Or a third world.'],
    ['demo 和源码都在项目文件夹里，可以自己进去走走', "The demo and source are in the project folder if you'd like to walk around yourself."],
    ['感谢观看', 'Thanks for watching.'],
  ]),
];
