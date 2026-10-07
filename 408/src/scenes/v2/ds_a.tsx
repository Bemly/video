import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import {Cell, Comet, Glass, Hi, popIn, stepAt, Txt} from '../../components/kit';
import {Cue, Problem, probCues} from '../../components/Problem';
import {useF} from '../../components/Shot';
import {Arrow, bez, Caption, Cam, GlowDefs, Pt} from '../../components/ui';
import {clamp01, COL, eBack, eIn, eInOut, eOut, FONT, lerp, prog, rgba} from '../../theme';

export * from './ds_a2';

const C = COL.ds;
const A2 = COL.co;
const V2 = COL.os;
const SUB = '₀₁₂₃₄₅₆₇₈₉';
const sub = (n: number) => String(n).split('').map((d) => SUB[+d]).join('');

/* ====================================================================== */
/* 01 链表重排                                                             */
/* ====================================================================== */

const RX = (i: number) => 150 + i * 215;
const NW = 130;
const NH = 72;
type P2 = {x: number; y: number};

const relinkPos = (i: number, sf: number): P2 => {
  let x = RX(i);
  let y = 420;
  const split = prog(sf, 380, 50, eInOut);
  if (i >= 4) {
    y = lerp(420, 640, split);
    const glide = prog(sf, 700, 90, eInOut);
    const s0 = i - 4;
    const s1 = 3 - (i - 4);
    x = RX(4 + lerp(s0, s1, glide));
  }
  const spread = prog(sf, 850, 50, eInOut);
  y = i < 4 ? lerp(y, 280, spread) : lerp(y, 790, spread);
  const j = i < 4 ? 2 * i : 2 * (7 - i) + 1;
  const k = i < 4 ? i : 7 - i;
  const m = prog(sf, 920 + k * 80 + (i < 4 ? 0 : 40), 46, (t) => t);
  if (m > 0) {
    x = lerp(x, RX(j), eInOut(m));
    y = lerp(y, 535, eOut(m));
  }
  return {x, y};
};
const ORDER = [0, 7, 1, 6, 2, 5, 3, 4];
const arriveAt = (i: number) => {
  const k = i < 4 ? i : 7 - i;
  return 920 + k * 80 + (i < 4 ? 0 : 40) + 46;
};

const linkPts = (a: P2, b: P2, forward: boolean): Pt[] => {
  if (forward) {
    const S: Pt = [a.x + 111, a.y + NH / 2];
    const E: Pt = [b.x - 3, b.y + NH / 2];
    const dx = Math.max(40, (E[0] - S[0]) * 0.5);
    return bez(S, [S[0] + dx, S[1]], [E[0] - dx, E[1]], E, 26);
  }
  const S: Pt = [a.x + 111, a.y + NH];
  const E: Pt = [b.x + 46, b.y + NH + 2];
  return bez(S, [S[0], S[1] + 80], [E[0], E[1] + 80], E, 26);
};

const Link: React.FC<{a: P2; b: P2; t: number; color: string; w?: number}> = ({a, b, t, color, w = 3}) => {
  if (t <= 0) return null;
  const fw = clamp01((b.x - a.x - 60) / 120);
  return (
    <>
      {fw > 0.01 && <Arrow pts={linkPts(a, b, true)} t={t} color={color} w={w} opacity={fw} />}
      {fw < 0.99 && <Arrow pts={linkPts(a, b, false)} t={t} color={color} w={w} opacity={1 - fw} />}
    </>
  );
};

const LNode: React.FC<{p: P2; label: string; color: string; hi?: number; alpha?: number}> = ({p, label, color, hi = 0, alpha = 1}) => (
  <g transform={`translate(${p.x},${p.y})`} opacity={alpha}>
    {hi > 0 && <rect x={-8} y={-8} width={NW + 16} height={NH + 16} rx={16} fill="none" stroke={color} strokeWidth={3} opacity={hi} filter="url(#g-m)" />}
    <rect width={NW} height={NH} rx={12} fill="rgba(6,14,24,0.92)" stroke={color} strokeWidth={2.5} filter="url(#g-s)" />
    <line x1={92} y1={8} x2={92} y2={NH - 8} stroke={rgba(color, 0.6)} strokeWidth={2} />
    <text x={46} y={NH / 2 + 2} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT.sans} fontWeight={700} fontSize={32} fill="#fff">
      {label}
    </text>
    <circle cx={111} cy={NH / 2} r={5.5} fill={color} />
  </g>
);

const RELINK = {
  card: 330,
  reveal: 1370,
  steps: [
    {at: 0, label: '快慢指针找中点'},
    {at: 440, label: '原地逆置后半段'},
    {at: 880, label: '前后交替合并'},
  ],
};

export const DSRelink: React.FC = () => (
  <Problem
    no={1}
    color={C}
    tag="数据结构 · 线性表"
    title="链表重排"
    q={[
      ['设线性表 ', {t: 'L = (a₁, a₂, a₃, …, aₙ₋₂, aₙ₋₁, aₙ)'}, ' 采用带头结点的单链表保存，'],
      ['设计一个 ', {t: '空间复杂度为 O(1)', c: A2}, ' 且时间上尽可能高效的算法，'],
      ['重新排列 L 中的各结点，得到 ', {t: 'L′ = (a₁, aₙ, a₂, aₙ₋₁, a₃, aₙ₋₂, …)'}, '。'],
    ]}
    brief="空间 O(1)，把 L 重排为 (a₁, aₙ, a₂, aₙ₋₁, …)"
    answerText="时间 O(n) · 空间 O(1)"
    insight="找中点 + 逆置后半段 + 交替合并，三趟线性扫描"
    {...RELINK}
  >
    {(sf) => <RelinkStage sf={sf} />}
  </Problem>
);

const RelinkStage: React.FC<{sf: number}> = ({sf}) => {
  const pos = new Array(8).fill(0).map((_, i) => relinkPos(i, sf));
  const col = (i: number) => (sf < 380 ? C : i < 4 ? C : A2);
  // pointers
  const it = Math.min(3, Math.max(0, Math.floor((sf - 60) / 70) + 1));
  const hop = clamp01(((sf - 60) % 70) / 22);
  const pIdx = (n: number) => Math.min(n, 3);
  const qIdx = (n: number) => Math.min(2 * n, 6);
  const curN = sf < 60 ? 0 : it;
  const prevN = Math.max(0, curN - 1);
  const inHop = sf >= 60 && sf < 60 + 3 * 70 && hop < 1;
  const tokX = (idx: (n: number) => number) => {
    const a = RX(idx(inHop ? prevN : curN)) + NW / 2;
    const b = RX(idx(curN)) + NW / 2;
    return inHop ? lerp(a, b, eInOut(hop)) : b;
  };
  const tokA = 1 - prog(sf, 370, 30);
  const phaseText =
    sf < 420
      ? '快指针 q 每次走 2 步，慢指针 p 每次走 1 步 —— q 到尾时，p 恰在中点'
      : sf < 870
        ? '后半段原地逆置：逐个翻转 next 指针'
        : sf < 1250
          ? '像拉链一样，前后两段交替合并'
          : '';
  const phaseA = sf < 420 ? prog(sf, 10, 30) * (1 - prog(sf, 400, 20)) : sf < 870 ? prog(sf, 430, 30) * (1 - prog(sf, 850, 20)) : prog(sf, 880, 30) * (1 - prog(sf, 1230, 20));

  return (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <GlowDefs />
        <Txt x={960} y={220} size={30} color={COL.sub} weight={500} opacity={phaseA}>
          {phaseText}
        </Txt>
        {/* original forward links */}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          let t = prog(sf, i * 5, 20);
          if (i === 3) t *= 1 - prog(sf, 360, 16, eIn);
          if (i < 3) t *= 1 - prog(sf, 900, 30);
          if (i >= 4) {
            const k = i - 4;
            t *= 1 - prog(sf, 460 + k * 70, 18, eIn);
          }
          return <Link key={'f' + i} a={pos[i]} b={pos[i + 1]} t={t} color={rgba(col(i), 0.85)} />;
        })}
        {/* reversed links */}
        {[0, 1, 2].map((k) => {
          const t = prog(sf, 478 + k * 70, 24, eInOut) * (1 - prog(sf, 900, 30));
          return <Link key={'r' + k} a={pos[5 + k]} b={pos[4 + k]} t={t} color={A2} w={3.5} />;
        })}
        {/* merged links */}
        {ORDER.slice(0, 7).map((a, j) => {
          const b = ORDER[j + 1];
          const t = prog(sf, Math.max(arriveAt(a), arriveAt(b)) - 4, 22, eInOut);
          return <Link key={'m' + j} a={pos[a]} b={pos[b]} t={t} color={'#ffffff'} w={3} />;
        })}
        {/* NULL marks */}
        <g opacity={prog(sf, 400, 20) * (1 - prog(sf, 900, 20))}>
          <text x={pos[3].x + 111} y={pos[3].y + NH / 2 + 2} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT.sans} fontSize={30} fill={COL.sub}>
            ∧
          </text>
        </g>
        {pos.map((p, i) => {
          const isMid = i === 3 && sf > 270 && sf < 440;
          return <LNode key={i} p={p} label={`a${sub(i + 1)}`} color={col(i)} hi={isMid ? 0.6 + 0.4 * Math.sin(sf / 6) : 0} alpha={prog(sf, i * 4, 16)} />;
        })}
        {/* p / q tokens */}
        {tokA > 0 && (
          <g opacity={tokA}>
            {[
              {l: 'p', idx: pIdx, c: C, y: pos[0].y - 40},
              {l: 'q', idx: qIdx, c: A2, y: pos[0].y - 92},
            ].map((tk) => {
              const x = tokX(tk.idx);
              const lift = inHop ? Math.sin(eInOut(hop) * Math.PI) * 26 : 0;
              return (
                <g key={tk.l} transform={`translate(${x},${tk.y - lift})`}>
                  <rect x={-26} y={-20} width={52} height={40} rx={20} fill={tk.c} filter="url(#g-m)" />
                  <text y={2} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT.mono} fontWeight={700} fontSize={26} fill="#04101a">
                    {tk.l}
                  </text>
                  <line x1={0} y1={20} x2={0} y2={tk.l === 'p' ? 32 : 84} stroke={tk.c} strokeWidth={2} strokeDasharray="4 4" />
                </g>
              );
            })}
          </g>
        )}
        {/* result */}
        <g opacity={prog(sf, 1250, 40)}>
          <Txt x={960} y={700} size={40} weight={700} family={FONT.sans} color="#fff" glow>
            L′ = (a₁, a₈, a₂, a₇, a₃, a₆, a₄, a₅)
          </Txt>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export const DSRelinkCues: Cue[] = probCues(RELINK, [
  [60, 'tick'],
  [130, 'tick'],
  [200, 'tick'],
  [380, 'whoosh'],
  [478, 'blip', 72],
  [548, 'blip', 76],
  [618, 'blip', 79],
  [700, 'whoosh'],
  ...[0, 1, 2, 3].flatMap((k): Cue[] => [
    [920 + k * 80 + 46, 'blip', 72 + k * 2],
    [960 + k * 80 + 46, 'blip', 79 + k * 2],
  ]),
  [1250, 'chime'],
]);

/* ====================================================================== */
/* 栈与循环队列（概念）                                                    */
/* ====================================================================== */

const STACK_OPS: [number, 'push' | 'pop', string][] = [
  [30, 'push', 'a'],
  [70, 'push', 'b'],
  [110, 'push', 'c'],
  [150, 'pop', ''],
  [190, 'push', 'd'],
  [230, 'push', 'e'],
  [270, 'pop', ''],
  [310, 'pop', ''],
  [350, 'push', 'f'],
  [390, 'push', 'g'],
];
const QUEUE_OPS: [number, 'enq' | 'deq', string][] = [
  [40, 'enq', 'A'],
  [80, 'enq', 'B'],
  [120, 'enq', 'C'],
  [160, 'deq', ''],
  [200, 'enq', 'D'],
  [240, 'enq', 'E'],
  [280, 'enq', 'F'],
  [320, 'deq', ''],
  [360, 'enq', 'G'],
  [400, 'enq', 'H'],
  [440, 'enq', 'I'],
];

export const DSStackQueue: React.FC = () => {
  const f = useF();
  // ---- stack state
  type SE = {v: string; slot: number; t: number; out?: number; outIdx?: number};
  const items: SE[] = [];
  const st: SE[] = [];
  let popped = 0;
  for (const [t, op, v] of STACK_OPS) {
    if (op === 'push') {
      const e = {v, slot: st.length, t};
      st.push(e);
      items.push(e);
    } else {
      const e = st.pop()!;
      e.out = t;
      e.outIdx = popped++;
    }
  }
  const SX = 330;
  const SB = 800;
  const SH = 72;
  const stackTop = STACK_OPS.filter(([t]) => t <= f).reduce((n, [, op]) => n + (op === 'push' ? 1 : -1), 0);

  // ---- queue state
  const MAX = 8;
  type QE = {v: string; slot: number; t: number; out?: number};
  const qItems: QE[] = [];
  let front = 0;
  let rear = 0;
  const qFront: [number, number][] = [[0, 0]];
  const qRear: [number, number][] = [[0, 0]];
  const alive: QE[] = [];
  for (const [t, op, v] of QUEUE_OPS) {
    if (op === 'enq') {
      const e = {v, slot: rear, t};
      qItems.push(e);
      alive.push(e);
      rear = (rear + 1) % MAX;
      qRear.push([t, rear]);
    } else {
      const e = alive.shift()!;
      e.out = t;
      front = (front + 1) % MAX;
      qFront.push([t, front]);
    }
  }
  const valAt = (arr: [number, number][]) => {
    let v = arr[0][1];
    let prev = v;
    let at = 0;
    for (const [t, x] of arr)
      if (f >= t) {
        prev = v;
        v = x;
        at = t;
      }
    return lerp(prev, v, eInOut(clamp01((f - at) / 16)));
  };
  const QX = 1250;
  const QY = 470;
  const R = 185;
  const ang = (s: number) => ((-90 + s * (360 / MAX)) * Math.PI) / 180;
  const full = f >= 440 + 16;
  const fullPulse = full ? 0.5 + 0.5 * Math.sin(f / 5) : 0;

  return (
    <AbsoluteFill>
      <Cam to={1.04}>
        <svg width={1920} height={1080}>
          <GlowDefs />
          {/* ---------- stack ---------- */}
          <Txt x={SX + 80} y={214} size={34} weight={800}>
            栈 Stack
          </Txt>
          <Txt x={SX + 80} y={252} size={22} color={C} family={FONT.tech} ls={4}>
            LAST IN · FIRST OUT
          </Txt>
          <path d={`M${SX},${SB - 7 * SH - 10} L${SX},${SB} L${SX + 160},${SB} L${SX + 160},${SB - 7 * SH - 10}`} fill="none" stroke={C} strokeWidth={3} filter="url(#g-s)" opacity={prog(f, 0, 20)} />
          {items.map((e, i) => {
            const a = clamp01((f - e.t) / 18);
            if (a <= 0) return null;
            const yIn = lerp(SB - 7 * SH - 120, SB - (e.slot + 1) * SH, eOut(a));
            let x = SX + 8;
            let y = yIn;
            let op = clamp01(a * 3);
            if (e.out !== undefined && f >= e.out) {
              const o = clamp01((f - e.out) / 26);
              x = lerp(SX + 8, 560 + (e.outIdx ?? 0) * 90, eInOut(o));
              y = lerp(SB - (e.slot + 1) * SH, 330, eInOut(o)) - Math.sin(o * Math.PI) * 120;
            }
            return <Cell key={i} x={x} y={y + 4} w={144} h={SH - 8} text={e.v} color={e.out !== undefined && f >= e.out ? A2 : C} fill={0.2} size={34} opacity={op} />;
          })}
          {/* top pointer */}
          {(() => {
            const y = SB - Math.max(0.5, stackTop) * SH + SH / 2 - (stackTop === 0 ? SH / 2 : 0);
            return (
              <g opacity={prog(f, 20, 20)}>
                <Arrow pts={[[SX - 110, y], [SX - 14, y]]} t={1} color={A2} w={3} />
                <Txt x={SX - 150} y={y} size={24} color={A2} family={FONT.mono} weight={700}>
                  top
                </Txt>
              </g>
            );
          })()}
          <Txt x={640} y={290} size={22} color={COL.sub} opacity={prog(f, 150, 20)}>
            出栈顺序 →
          </Txt>
          {/* ---------- circular queue ---------- */}
          <Txt x={QX} y={214} size={34} weight={800}>
            循环队列 Circular Queue
          </Txt>
          <circle cx={QX} cy={QY} r={R} fill="none" stroke={rgba(C, 0.18)} strokeWidth={84} />
          {new Array(MAX).fill(0).map((_, s) => {
            const x = QX + Math.cos(ang(s)) * R;
            const y = QY + Math.sin(ang(s)) * R;
            const isEmptyGap = full && s === rear;
            return (
              <g key={s} opacity={prog(f, s * 3, 16)}>
                <rect x={x - 32} y={y - 32} width={64} height={64} rx={10} fill="rgba(6,14,24,0.9)" stroke={isEmptyGap ? COL.red : rgba(C, 0.6)} strokeWidth={isEmptyGap ? 3 : 2} />
                <text x={QX + Math.cos(ang(s)) * (R + 64)} y={QY + Math.sin(ang(s)) * (R + 64)} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT.mono} fontSize={18} fill={COL.dim}>
                  {s}
                </text>
              </g>
            );
          })}
          {qItems.map((e, i) => {
            const a = clamp01((f - e.t) / 20);
            if (a <= 0) return null;
            let x = QX + Math.cos(ang(e.slot)) * R;
            let y = QY + Math.sin(ang(e.slot)) * R;
            let op = 1;
            if (a < 1) {
              x = lerp(QX + 420, x, eOut(a));
              y = lerp(QY - 260, y, eOut(a));
            }
            if (e.out !== undefined && f >= e.out) {
              const o = clamp01((f - e.out) / 24);
              x = lerp(x, QX - 380, eIn(o));
              y = lerp(y, QY - 260, eIn(o));
              op = 1 - o;
            }
            return <Cell key={i} x={x - 26} y={y - 26} w={52} h={52} text={e.v} color={full ? A2 : C} fill={0.55} size={28} opacity={op} glow={full} />;
          })}
          {[
            {l: 'front', v: valAt(qFront), c: C, r: R - 70},
            {l: 'rear', v: valAt(qRear), c: A2, r: R - 70},
          ].map((p, i) => {
            const a = ang(p.v);
            const x2 = QX + Math.cos(a) * p.r;
            const y2 = QY + Math.sin(a) * p.r;
            return (
              <g key={i} opacity={prog(f, 20, 20)}>
                <Arrow pts={[[QX, QY], [x2, y2]]} t={1} color={p.c} w={4} />
                <Txt x={QX + Math.cos(a) * (p.r - 50) + (i ? 0 : 0)} y={QY + Math.sin(a) * (p.r - 50) + (i ? 18 : -18)} size={20} family={FONT.mono} color={p.c} weight={700}>
                  {p.l}
                </Txt>
              </g>
            );
          })}
          {full && (
            <g transform={`translate(${QX},${QY})`}>
              <circle r={R + 58} fill="none" stroke={A2} strokeWidth={3} opacity={fullPulse} />
              <g transform={`translate(${R + 150},-60) scale(${eBack(clamp01((f - 456) / 18))})`}>
                <rect x={-70} y={-34} width={140} height={68} rx={34} fill={rgba(A2, 0.25)} stroke={A2} strokeWidth={2.5} />
                <Txt x={0} y={2} size={34} weight={900} family={FONT.serif} color="#fff">
                  队满
                </Txt>
              </g>
              <Txt x={R + 150} y={10} size={20} color={COL.sub}>
                空出 1 个单元
              </Txt>
            </g>
          )}
        </svg>
        <Glass x={1000} y={745} w={800} color={C} opacity={prog(f, 90, 30)} style={{fontSize: 25, lineHeight: '40px'}}>
          <div>
            <Hi c={C}>队空</Hi>　Q.front == Q.rear
          </div>
          <div style={{background: full ? rgba(A2, 0.2) : undefined, borderRadius: 6}}>
            <Hi c={A2}>队满</Hi>　(Q.rear + 1) % MaxSize == Q.front
          </div>
          <div style={{color: COL.sub}}>
            <Hi c={C}>长度</Hi>　(rear − front + MaxSize) % MaxSize
          </div>
        </Glass>
      </Cam>
      <Caption title="栈与队列" en="STACK & QUEUE" desc="栈：后进先出 · 循环队列：牺牲一个单元来区分队空与队满" chip="O(1)" color={C} />
    </AbsoluteFill>
  );
};

export const DSStackQueueCues: Cue[] = [
  ...STACK_OPS.map(([t, op]): Cue => [t, op === 'push' ? 'blip' : 'tick', op === 'push' ? 69 : 0]),
  ...QUEUE_OPS.map(([t, op]): Cue => [t, op === 'enq' ? 'blip' : 'tick', op === 'enq' ? 76 : 0]),
  [456, 'chime'],
];

/* ====================================================================== */
/* 02 出栈序列 & 卡特兰数                                                  */
/* ====================================================================== */

const dyck = (n: number) => {
  const out: string[] = [];
  const rec = (s: string, o: number, c: number) => {
    if (s.length === 2 * n) {
      out.push(s);
      return;
    }
    if (o < n) rec(s + 'R', o + 1, c);
    if (c < o) rec(s + 'U', o, c + 1);
  };
  rec('', 0, 0);
  return out;
};

const CAT = {
  card: 330,
  reveal: 1360,
  steps: [
    {at: 0, label: '模拟进栈出栈'},
    {at: 600, label: '映射为格路径'},
    {at: 1060, label: '卡特兰数'},
  ],
};

export const DSCatalan: React.FC = () => (
  <Problem
    no={2}
    color={C}
    tag="数据结构 · 栈"
    title="出栈序列"
    q={[
      ['元素 ', {t: '1, 2, 3, 4, 5'}, ' 依次进栈，进栈过程中可以随时出栈。'],
      ['① 出栈序列 ', {t: '4, 5, 3, 1, 2', c: A2}, ' 是否可能？'],
      ['② 所有可能的出栈序列，', {t: '一共有多少种？', c: A2}],
    ]}
    brief="1~5 依次进栈：4,5,3,1,2 可能吗？合法序列共几种？"
    answerText="不可能 · 共 42 种"
    insight="n 个元素的出栈序列数 = 第 n 个卡特兰数 C(2n,n)/(n+1)"
    {...CAT}
  >
    {(sf) => <CatalanStage sf={sf} />}
  </Problem>
);

const CAT_OPS: [number, 'push' | 'pop', number][] = [
  [40, 'push', 1],
  [80, 'push', 2],
  [120, 'push', 3],
  [160, 'push', 4],
  [200, 'pop', 4],
  [240, 'push', 5],
  [280, 'pop', 5],
  [320, 'pop', 3],
];

const CatalanStage: React.FC<{sf: number}> = ({sf}) => {
  const paths = useMemo(() => dyck(5), []);
  const simA = 1 - prog(sf, 1020, 40);
  // stack simulation
  const SX = 360;
  const SB = 800;
  const SH = 70;
  type E = {v: number; slot: number; t: number; out?: number; oi?: number};
  const els: E[] = [];
  const st: E[] = [];
  let oi = 0;
  for (const [t, op, v] of CAT_OPS) {
    if (op === 'push') {
      const e: E = {v, slot: st.length, t};
      st.push(e);
      els.push(e);
    } else {
      const e = st.pop()!;
      e.out = t;
      e.oi = oi++;
    }
  }
  const fail = sf >= 380;
  const failPulse = fail ? 0.5 + 0.5 * Math.sin(sf / 5) : 0;
  const target = [4, 5, 3, 1, 2];
  const outX = (k: number) => 620 + k * 92;
  // lattice
  const GX = 1130;
  const GY = 830;
  const CS = 108;
  const pt = (a: number, b: number): Pt => [GX + a * CS, GY - b * CS];
  const pathPts = (s: string): Pt[] => {
    let a = 0;
    let b = 0;
    const out: Pt[] = [pt(0, 0)];
    for (const ch of s) {
      if (ch === 'R') a++;
      else b++;
      out.push(pt(a, b));
    }
    return out;
  };
  const gridA = prog(sf, 600, 40);
  const ex = 'RRRUUURRUU';
  const bad = 'RUUR';
  const exT = prog(sf, 660, 80, eInOut);
  const badT = prog(sf, 780, 60, eInOut) * (1 - prog(sf, 900, 30));
  const allStart = 900;
  const nDrawn = Math.max(0, Math.min(42, Math.floor((sf - allStart) / 7)));
  const fA = prog(sf, 1060, 40);

  return (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <GlowDefs />
        {/* ---------- simulation ---------- */}
        <g opacity={simA}>
          <Txt x={150} y={262} size={24} color={COL.sub} anchor="start">
            进栈次序
          </Txt>
          {[1, 2, 3, 4, 5].map((v, k) => {
            const pushed = CAT_OPS.find(([, op, x]) => op === 'push' && x === v);
            const gone = pushed && sf >= pushed[0];
            return <Cell key={v} x={300 + k * 80} y={228} w={66} h={66} text={v} color={C} dim={!!gone} opacity={gone ? 0.25 : 1} size={32} />;
          })}
          <path d={`M${SX},${SB - 5 * SH - 20} L${SX},${SB} L${SX + 130},${SB} L${SX + 130},${SB - 5 * SH - 20}`} fill="none" stroke={C} strokeWidth={3} filter="url(#g-s)" />
          <Txt x={SX + 65} y={SB + 34} size={22} color={COL.sub}>
            栈
          </Txt>
          <Txt x={outX(0) - 20} y={440} size={24} color={COL.sub} anchor="start">
            目标出栈序列
          </Txt>
          {target.map((v, k) => {
            const done = els.find((e) => e.oi === k && e.out !== undefined && sf >= e.out + 26);
            const isFail = fail && k === 3;
            return (
              <Cell
                key={k}
                x={outX(k)}
                y={470}
                w={76}
                h={76}
                text={v}
                color={isFail ? COL.red : done ? COL.green : C}
                fill={done ? 0.4 : isFail ? failPulse * 0.6 : 0}
                dim={!done && !isFail}
                size={36}
                glow={isFail}
              />
            );
          })}
          {els.map((e, i) => {
            const a = clamp01((sf - e.t) / 20);
            if (a <= 0) return null;
            let x = lerp(300 + (e.v - 1) * 80, SX + 8, eInOut(a));
            let y = lerp(228, SB - (e.slot + 1) * SH + 4, eInOut(a));
            if (e.out !== undefined && sf >= e.out) {
              const o = clamp01((sf - e.out) / 26);
              x = lerp(SX + 8, outX(e.oi!) - 30, eInOut(o));
              y = lerp(SB - (e.slot + 1) * SH + 4, 470, eInOut(o)) - Math.sin(o * Math.PI) * 60;
              if (o >= 1) return null;
            }
            const isTopFail = fail && e.v === 2;
            return <Cell key={i} x={x} y={y} w={114} h={SH - 8} text={e.v} color={isTopFail ? COL.red : C} fill={isTopFail ? 0.3 + failPulse * 0.4 : 0.2} size={32} glow={isTopFail} />;
          })}
          {fail && (
            <g opacity={prog(sf, 380, 20)}>
              <Txt x={outX(2)} y={620} size={30} weight={800} color={COL.red} glow>
                栈顶是 2，1 被压在下面 —— 不可能！
              </Txt>
            </g>
          )}
        </g>
        {/* ---------- lattice ---------- */}
        <g opacity={gridA}>
          <path d={`M${pt(0, 0)[0]},${pt(0, 0)[1]} L${pt(5, 5)[0]},${pt(5, 5)[1]} L${pt(0, 5)[0]},${pt(0, 5)[1]} Z`} fill={rgba(COL.red, 0.08)} />
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <g key={k}>
              <line x1={pt(k, 0)[0]} y1={pt(k, 0)[1]} x2={pt(k, 5)[0]} y2={pt(k, 5)[1]} stroke={rgba('#fff', 0.1)} />
              <line x1={pt(0, k)[0]} y1={pt(0, k)[1]} x2={pt(5, k)[0]} y2={pt(5, k)[1]} stroke={rgba('#fff', 0.1)} />
            </g>
          ))}
          <line x1={pt(0, 0)[0]} y1={pt(0, 0)[1]} x2={pt(5, 5)[0]} y2={pt(5, 5)[1]} stroke={COL.red} strokeWidth={2} strokeDasharray="8 8" />
          <Txt x={pt(2.2, 3.4)[0]} y={pt(2.2, 3.4)[1]} size={22} color={COL.red} opacity={0.9}>
            出栈多于进栈（非法）
          </Txt>
          <Txt x={pt(2.5, 0)[0]} y={GY + 40} size={22} color={COL.sub}>
            进栈 → 向右
          </Txt>
          <Txt x={GX - 60} y={pt(0, 2.5)[1]} size={22} color={COL.sub}>
            出栈 ↑
          </Txt>
          {/* all paths */}
          {paths.slice(0, nDrawn).map((s, i) => {
            const t = clamp01((sf - allStart - i * 7) / 18);
            const o = (i - 20.5) * 1.7;
            const pts = pathPts(s).map(([x, y]): Pt => [x + o, y + o]);
            const col = i % 3 === 0 ? V2 : i % 3 === 1 ? C : '#7dd3fc';
            return <Arrow key={i} pts={pts} t={t} color={rgba(col, 0.55)} w={2.2} head={0.01} glow={false} />;
          })}
          {/* example */}
          <Arrow pts={pathPts(ex)} t={exT} color={A2} w={5} head={14} opacity={1 - prog(sf, 900, 30) * 0.7} />
          <Arrow pts={pathPts(bad)} t={badT} color={COL.red} w={5} head={14} />
          {sf > 660 && sf < 930 && (
            <Txt x={pt(2.5, 5)[0]} y={GY - 5 * CS - 34} size={24} color={A2} opacity={prog(sf, 670, 20) * (1 - prog(sf, 900, 20))}>
              出栈序列 3 2 1 5 4 ⇔ 进进进出出出进进出出
            </Txt>
          )}
          {sf > 900 && (
            <Txt x={pt(2.5, 5)[0]} y={GY - 5 * CS - 34} size={30} weight={800} color="#fff" glow>
              合法路径：{nDrawn} 条
            </Txt>
          )}
        </g>
        {/* ---------- formula ---------- */}
      </svg>
      <div style={{position: 'absolute', left: 150, top: 330, opacity: fA, transform: `translateY(${(1 - fA) * 30}px)`}}>
        <div style={{fontFamily: FONT.sans, fontSize: 28, color: COL.sub, letterSpacing: '0.2em'}}>卡特兰数 CATALAN</div>
        <div style={{fontFamily: FONT.serif, fontWeight: 800, fontSize: 64, color: '#fff', marginTop: 16, textShadow: `0 0 30px ${rgba(C, 0.6)}`}}>
          Cₙ = <span style={{color: C}}>C(2n, n)</span> / (n + 1)
        </div>
        <div style={{fontFamily: FONT.tech, fontWeight: 700, fontSize: 56, color: '#fff', marginTop: 18, opacity: prog(sf, 1120, 30)}}>
          C₅ = 252 / 6 = <span style={{color: A2, fontSize: 80}}>42</span>
        </div>
        <div style={{fontFamily: FONT.mono, fontSize: 30, color: COL.sub, marginTop: 26, opacity: prog(sf, 1180, 30), letterSpacing: '0.1em'}}>
          1, 1, 2, 5, 14, <span style={{color: A2}}>42</span>, 132, 429, …
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const DSCatalanCues: Cue[] = probCues(CAT, [
  ...CAT_OPS.map(([t, op]): Cue => [t, op === 'push' ? 'blip' : 'tick', 69]),
  [380, 'error'],
  [660, 'whoosh'],
  [780, 'error'],
  ...new Array(42).fill(0).map((_, i): Cue => [900 + i * 7, 'spark', 72 + (i % 12)]),
  [1120, 'chime'],
]);

/* ====================================================================== */
/* 03 KMP                                                                  */
/* ====================================================================== */

const P = 'abaabc';
const S = 'abaabaabcabaabc';
const NEXT = [0, 1, 1, 2, 2, 3];

type KStep = {i: number; j: number; ok: boolean; t: number; shiftFrom?: number};

const kmpSteps = () => {
  const steps: KStep[] = [];
  let i = 1;
  let j = 1;
  let t = 780;
  let off = 0; // pattern offset (cells) = i - j
  const offs: [number, number][] = [[0, 0]];
  while (i <= S.length && j <= P.length) {
    const ok = S[i - 1] === P[j - 1];
    steps.push({i, j, ok, t});
    if (ok) {
      i++;
      j++;
      t += 36;
    } else {
      const nj = NEXT[j - 1];
      t += 60;
      off = i - nj;
      offs.push([t, off]);
      t += 60;
      if (nj === 0) {
        i++;
        j = 1;
      } else j = nj;
    }
  }
  return {steps, offs, end: t};
};

const KMP = {
  card: 360,
  reveal: 1300,
  steps: [
    {at: 0, label: '求 next 数组'},
    {at: 700, label: 'KMP 匹配'},
    {at: 1240, label: '得出位置'},
  ],
};

export const DSKmp: React.FC = () => (
  <Problem
    no={3}
    color={C}
    tag="数据结构 · 串"
    title="KMP 模式匹配"
    q={[
      ['模式串 ', {t: 'P = "abaabc"', m: true}, '，主串 ', {t: 'S = "abaabaabcabaabc"', m: true}, '。'],
      ['① 求模式串的 ', {t: 'next 数组', c: A2}, '（下标从 1 开始）；'],
      ['② 用 KMP 算法进行匹配，', {t: '第一次匹配成功时', c: A2}, '，P 在 S 中的起始位置是？'],
    ]}
    brief='P = "abaabc" 的 next 数组？在 S 中首次匹配的位置？'
    answerText="next = 0 1 1 2 2 3 · 位置 4"
    insight="主串指针 i 永不回溯，时间复杂度 O(n + m)"
    {...KMP}
  >
    {(sf) => <KmpStage sf={sf} />}
  </Problem>
);

const KmpStage: React.FC<{sf: number}> = ({sf}) => {
  const {steps, offs} = useMemo(kmpSteps, []);
  // ----- phase 1: next array
  const shrink = prog(sf, 640, 60, eInOut);
  const px = (k: number) => 600 + k * 120;
  const jStep = (j: number) => 40 + (j - 2) * 110; // j = 2..6
  const curJ = [2, 3, 4, 5, 6].reduce((acc, j) => (sf >= jStep(j) ? j : acc), 0);
  const ks = curJ ? NEXT[curJ - 1] - 1 : 0; // length of longest prefix=suffix
  const local = curJ ? sf - jStep(curJ) : 0;
  // ----- phase 2
  const sx = (k: number) => 190 + k * 102; // S cell k (0-based)
  const offAt = () => {
    let o = 0;
    let prev = 0;
    let at = -999;
    for (const [t, v] of offs)
      if (sf >= t) {
        prev = o;
        o = v;
        at = t;
      }
    return lerp(prev, o, eInOut(clamp01((sf - at) / 50)));
  };
  const off = offAt();
  const cur = steps.filter((s) => sf >= s.t).pop();
  const done = cur && cur.j === 6 && cur.ok && sf >= cur.t + 36;
  const mA = prog(sf, 700, 40);
  const mis = steps.find((s) => !s.ok);
  const misVis = mis && sf >= mis.t && sf < mis.t + 220;

  return (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <GlowDefs />
        {/* ---------- next array ---------- */}
        <g transform={`translate(${lerp(0, 650, shrink)},${lerp(0, -95, shrink)}) scale(${lerp(1, 0.55, shrink)})`} style={{transformOrigin: '600px 260px'}}>
          <Txt x={470} y={300} size={26} color={COL.sub} anchor="end">
            j
          </Txt>
          <Txt x={470} y={370} size={30} color="#fff" anchor="end" weight={700}>
            P
          </Txt>
          <Txt x={470} y={470} size={26} color={A2} anchor="end" weight={700}>
            next[j]
          </Txt>
          {P.split('').map((ch, k) => {
            const j = k + 1;
            const inPre = curJ && j <= curJ - 1 && shrink < 0.5;
            const isPrefix = curJ && j <= ks && local > 30 && shrink < 0.5;
            const isSuffix = curJ && j >= curJ - ks && j <= curJ - 1 && local > 30 && shrink < 0.5;
            const nv = sf >= (j === 1 ? 20 : jStep(j) + 60);
            return (
              <g key={k}>
                <Txt x={px(k) + 45} y={300} size={24} color={COL.dim} family={FONT.mono}>
                  {j}
                </Txt>
                <Cell
                  x={px(k)}
                  y={326}
                  w={90}
                  h={90}
                  text={ch}
                  family={FONT.mono}
                  color={isPrefix && isSuffix ? '#fff' : isPrefix ? C : isSuffix ? A2 : C}
                  fill={isPrefix || isSuffix ? 0.45 : inPre ? 0.12 : 0}
                  dim={!!curJ && !inPre && shrink < 0.5}
                  size={44}
                />
                <Cell x={px(k) + 10} y={440} w={70} h={62} text={nv ? NEXT[k] : ''} color={A2} fill={nv ? 0.25 : 0} size={34} scale={nv ? eBack(clamp01((sf - (j === 1 ? 20 : jStep(j) + 60)) / 16)) : 1} />
              </g>
            );
          })}
          {curJ > 0 && shrink < 0.5 && ks > 0 && local > 30 && (
            <g opacity={prog(local, 30, 20) * (1 - shrink * 2)}>
              <path d={`M${px(0) + 4},${430 - 4} L${px(0) + 4},${436} L${px(ks - 1) + 86},${436} L${px(ks - 1) + 86},${426}`} fill="none" stroke={C} strokeWidth={3} />
              <path d={`M${px(curJ - 1 - ks) + 4},${322} L${px(curJ - 1 - ks) + 4},${312} L${px(curJ - 2) + 86},${312} L${px(curJ - 2) + 86},${322}`} fill="none" stroke={A2} strokeWidth={3} />
            </g>
          )}
        </g>
        {curJ > 0 && shrink < 0.3 && (
          <Txt x={960} y={620} size={30} color="#fff" opacity={prog(local, 10, 20) * (1 - shrink * 3)}>
            {`P[1..${curJ - 1}] = "${P.slice(0, curJ - 1)}"  最长相等前后缀 ${ks ? `"${P.slice(0, ks)}"（长 ${ks}）` : '无'}  ⇒  next[${curJ}] = ${ks + 1}`}
          </Txt>
        )}
        {/* ---------- matching ---------- */}
        {mA > 0 && (
          <g opacity={mA}>
            <Txt x={150} y={505} size={30} weight={700} anchor="end">
              S
            </Txt>
            <Txt x={150} y={635} size={30} weight={700} anchor="end" color={C}>
              P
            </Txt>
            {S.split('').map((ch, k) => {
              const inMatch = done && k >= 3 && k <= 8;
              const isCur = cur && cur.i === k + 1 && sf < cur.t + 40 && !done;
              return (
                <g key={k}>
                  <Txt x={sx(k) + 44} y={450} size={20} color={COL.dim} family={FONT.mono}>
                    {k + 1}
                  </Txt>
                  <Cell
                    x={sx(k)}
                    y={470}
                    w={88}
                    h={70}
                    text={ch}
                    family={FONT.mono}
                    color={inMatch ? A2 : isCur ? (cur!.ok ? COL.green : COL.red) : C}
                    fill={inMatch ? 0.55 : isCur ? 0.35 : 0}
                    size={38}
                    glow={!!inMatch}
                  />
                </g>
              );
            })}
            {P.split('').map((ch, k) => {
              const x = sx(off + k);
              const j = k + 1;
              const isCur = cur && cur.j === j && sf < cur.t + 40 && !done;
              const matched = cur && ((cur.ok && j <= cur.j) || (!cur.ok && j < cur.j)) && !done;
              return <Cell key={k} x={x} y={600} w={88} h={70} text={ch} family={FONT.mono} color={isCur ? (cur!.ok ? COL.green : COL.red) : C} fill={isCur ? 0.4 : matched ? 0.18 : 0} size={38} glow={!!isCur} />;
            })}
            {cur && !done && (
              <>
                <g transform={`translate(${sx(cur.i - 1) + 44},${400})`}>
                  <Txt x={0} y={0} size={26} family={FONT.mono} color={COL.green} weight={700}>
                    i↓
                  </Txt>
                </g>
                <g transform={`translate(${sx(off + cur.j - 1) + 44},${705})`}>
                  <Txt x={0} y={0} size={26} family={FONT.mono} color={A2} weight={700}>
                    j↑
                  </Txt>
                </g>
              </>
            )}
            {misVis && (
              <g opacity={prog(sf, mis!.t + 10, 20) * (1 - prog(sf, mis!.t + 190, 30))}>
                <Txt x={960} y={800} size={30} weight={700} color="#fff">
                  S[6] ≠ P[6]：主串 i 不回退，j = next[6] = 3，模式串直接右滑 3 位
                </Txt>
              </g>
            )}
            {done && (
              <Txt x={sx(3) + 300} y={800} size={36} weight={800} color={A2} glow>
                匹配成功 · 起始位置 4
              </Txt>
            )}
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};

export const DSKmpCues: Cue[] = (() => {
  const {steps} = kmpSteps();
  return probCues(KMP, [
    ...[2, 3, 4, 5, 6].map((j): Cue => [40 + (j - 2) * 110 + 60, 'blip', 72 + j * 2]),
    ...steps.map((s): Cue => [s.t, s.ok ? 'tick' : 'error', 0]),
    [steps[steps.length - 1].t + 36, 'chime'],
  ]);
})();

export const _u = [Comet, popIn, stepAt];
