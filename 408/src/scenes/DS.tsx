import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import {ActTitle} from '../components/ActTitle';
import {useF} from '../components/Shot';
import {Arrow, bez, Caption, Cam, GlowDefs, Pt, along} from '../components/ui';
import {clamp01, COL, eBack, eIn, eInOut, eOut, FONT, keyed, lerp, mixHex, prog, rgba, rnd} from '../theme';

const C = COL.ds;

export const DSTitle: React.FC = () => (
  <ActTitle
    num="01"
    zh="数据结构"
    en="DATA STRUCTURE"
    color={C}
    score={45}
    topics={['线性表', '栈与队列', '串', '树与二叉树', '图', '查找', '排序']}
    quote="程序 = 算法 + 数据结构"
    by="Niklaus Wirth"
  />
);

/* ============================ Linked list ============================ */

const VALS = [12, 25, 37, 48, 56, 73];

export const DSList: React.FC = () => {
  const f = useF();
  const m = prog(f, 66, 52, eInOut);
  const r = prog(f, 232, 52, eInOut);
  const Y = 380;
  const pos = VALS.map((_, i) => {
    const ax = 540 + i * 140;
    const lx = 185 + i * 260;
    const nx = 130 + (i < 3 ? i : i + 1) * 236;
    return {x: lerp(lerp(ax, lx, m), nx, r), y: Y};
  });
  const w = lerp(140, 170, m);
  const drop = eBack(clamp01((f - 128) / 26));
  const s = {
    x: lerp(900, 130 + 3 * 236, r),
    y: lerp(lerp(-160, 160, drop), Y, r),
  };
  const sVis = clamp01((f - 126) / 8);

  const box = (x: number, y: number, v: number, key: string, hi = 0, alpha = 1) => (
    <g key={key} opacity={alpha}>
      <rect
        x={x}
        y={y}
        width={w}
        height={100}
        rx={12}
        fill={rgba(hi ? C : '#0b1a24', hi ? 0.22 : 0.85)}
        stroke={C}
        strokeWidth={2.5}
        filter="url(#g-s)"
      />
      <line x1={x + 110} y1={y + 8} x2={x + 110} y2={y + 92} stroke={rgba(C, 0.7 * m)} strokeWidth={2} />
      <text x={x + (m > 0 ? lerp(70, 55, m) : 70)} y={y + 63} textAnchor="middle" fontFamily={FONT.tech} fontSize={44} fontWeight={700} fill="#fff">
        {v}
      </text>
      <circle cx={x + 140} cy={y + 50} r={6 * m} fill={C} />
    </g>
  );

  const straight = (a: {x: number; y: number}, b: {x: number; y: number}): Pt[] =>
    bez([a.x + 140, a.y + 50], [a.x + 170, a.y + 50], [b.x - 30, b.y + 50], [b.x - 2, b.y + 50], 12);

  // s -> node3 : from s's pointer to top of node 3, relaxing to a straight arrow
  const n3 = pos[3];
  const p1: Pt = [lerp(n3.x + 55, n3.x - 2, r), lerp(n3.y - 2, n3.y + 50, r)];
  const sTo3 = bez([s.x + 140, s.y + 50], [s.x + 200, s.y + 50], [lerp(p1[0], p1[0] - 40, r), lerp(p1[1] - 90, p1[1], r)], p1, 30);
  const n2 = pos[2];
  const twoToS = bez([n2.x + 140, n2.y + 50], [n2.x + 180, n2.y + 50], [s.x - 40, s.y + 50], [s.x - 2, s.y + 50], 30);

  const step1 = prog(f, 160, 22, eInOut);
  const cut = 1 - prog(f, 196, 12, eIn);
  const step2 = prog(f, 206, 22, eInOut);

  const line = (k: number) => (k === 1 ? f >= 156 && f < 198 : f >= 198 && f < 236);

  return (
    <AbsoluteFill>
      <Cam to={1.04}>
        <svg width={1920} height={1080}>
          <GlowDefs />
          {/* array labels */}
          <g opacity={1 - m}>
            <text x={960} y={318} textAnchor="middle" fontFamily={FONT.sans} fontSize={30} fill={COL.sub} letterSpacing={4}>
              顺序表 · 物理地址连续 · 随机存取
            </text>
            {VALS.map((_, i) => (
              <text key={i} x={540 + i * 140 + 70} y={Y + 140} textAnchor="middle" fontFamily={FONT.mono} fontSize={22} fill={rgba(C, 0.8)}>
                a[{i}]
              </text>
            ))}
          </g>
          {/* list labels */}
          <g opacity={m}>
            <text x={pos[0].x - 70} y={Y + 58} textAnchor="middle" fontFamily={FONT.tech} fontSize={36} fontWeight={700} fill={C}>
              L
            </text>
            <Arrow pts={[[pos[0].x - 48, Y + 50], [pos[0].x - 4, Y + 50]]} t={m} color={C} />
            <text x={pos[5].x + 140} y={Y + 62} textAnchor="middle" fontFamily={FONT.sans} fontSize={30} fill={COL.sub}>
              ∧
            </text>
          </g>
          {/* pointers between nodes */}
          {VALS.slice(0, 5).map((_, i) => {
            const base = prog(f, 92 + i * 6, 20, eInOut);
            const t = i === 2 ? base * cut : base;
            return <Arrow key={i} pts={straight(pos[i], pos[i + 1])} t={t} color={C} w={3} />;
          })}
          {/* rewiring */}
          <Arrow pts={sTo3} t={step1} color={COL.co} w={3.5} />
          <Arrow pts={twoToS} t={step2} color={COL.co} w={3.5} />
          {VALS.map((v, i) => box(pos[i].x, pos[i].y, v, 'n' + i, i === 2 && f > 140 && f < 240 ? 1 : 0))}
          {sVis > 0 && box(s.x, s.y, 42, 's', 1, sVis)}
          {/* p and s labels */}
          <g opacity={clamp01((f - 138) / 12) * (1 - r)}>
            <text x={n2.x + 55} y={Y - 34} textAnchor="middle" fontFamily={FONT.mono} fontSize={30} fontWeight={700} fill={COL.co}>
              p
            </text>
            <Arrow pts={[[n2.x + 55, Y - 26], [n2.x + 55, Y - 6]]} t={1} color={COL.co} head={9} />
            <text x={s.x - 30} y={s.y + 60} textAnchor="middle" fontFamily={FONT.mono} fontSize={30} fontWeight={700} fill={COL.co}>
              s
            </text>
          </g>
        </svg>
        {/* code panel */}
        <div
          style={{
            position: 'absolute',
            left: 1150,
            top: 640,
            width: 620,
            padding: '22px 30px',
            borderRadius: 16,
            background: COL.panel,
            border: `1px solid ${rgba(C, 0.35)}`,
            boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 30px ${rgba(C, 0.12)}`,
            opacity: prog(f, 132, 26),
            transform: `translateY(${(1 - prog(f, 132, 30)) * 30}px)`,
            fontFamily: FONT.mono,
            fontSize: 30,
            lineHeight: '50px',
          }}
        >
          <div style={{color: COL.dim, fontSize: 24}}>// 在 p 之后插入结点 s</div>
          {['s->next = p->next;', 'p->next = s;'].map((code, k) => (
            <div
              key={k}
              style={{
                color: line(k + 1) ? '#fff' : COL.sub,
                background: line(k + 1) ? rgba(COL.co, 0.18) : 'transparent',
                borderLeft: `4px solid ${line(k + 1) ? COL.co : 'transparent'}`,
                paddingLeft: 14,
                borderRadius: 4,
              }}
            >
              {code}
              <span style={{float: 'right', color: COL.co, fontFamily: FONT.sans, fontSize: 24}}>{k === 0 ? '① 先连' : '② 后断'}</span>
            </div>
          ))}
        </div>
      </Cam>
      <Caption title="线性表" en="LINEAR LIST" desc="顺序存储 → 链式存储 · 插入结点：先连后断" chip="O(1)" color={C} />
    </AbsoluteFill>
  );
};

/* ============================ BST ============================ */

const KEYS = [50, 30, 70, 20, 40, 60, 80, 10, 35, 45, 65, 75, 90];
type TN = {k: number; x: number; y: number; path: number[]; parent: number};

const buildTree = (): TN[] => {
  const nodes: TN[] = [];
  KEYS.forEach((k, idx) => {
    if (idx === 0) {
      nodes.push({k, x: 960, y: 170, path: [], parent: -1});
      return;
    }
    let cur = 0;
    let level = 1;
    const path: number[] = [];
    for (;;) {
      path.push(cur);
      const n = nodes[cur];
      const goLeft = k < n.k;
      const child = nodes.findIndex((c) => c.parent === cur && (goLeft ? c.k < n.k : c.k > n.k));
      if (child < 0) {
        const dx = 400 / Math.pow(2, level - 1);
        nodes.push({k, x: n.x + (goLeft ? -dx : dx), y: 170 + level * 135, path, parent: cur});
        return;
      }
      cur = child;
      level++;
    }
  });
  return nodes;
};

export const DSTree: React.FC = () => {
  const f = useF();
  const nodes = useMemo(buildTree, []);
  const sorted = [...nodes].map((n, i) => ({...n, i})).sort((a, b) => a.k - b.k);
  const T0 = (i: number) => 3 + i * 15;
  const visit = (rank: number) => 196 + rank * 7;
  const rankOf = (i: number) => sorted.findIndex((s) => s.i === i);

  const cursorRank = (f - 196) / 7;
  const cr = Math.max(0, Math.min(12, cursorRank));
  const ca = sorted[Math.floor(cr)];
  const cb = sorted[Math.min(12, Math.floor(cr) + 1)];
  const cfrac = eInOut(cr - Math.floor(cr));
  const curVis = clamp01((f - 190) / 10) * (1 - clamp01((f - 290) / 10));

  return (
    <AbsoluteFill>
      <Cam to={1.05} oy={420}>
        <svg width={1920} height={1080}>
          <GlowDefs />
          {nodes.map((n, i) => {
            if (n.parent < 0) return null;
            const p = nodes[n.parent];
            const t = prog(f, T0(i) + 10, 14, eInOut);
            return <Arrow key={'e' + i} pts={[[p.x, p.y + 34], [n.x, n.y - 34]]} t={t} color={rgba(C, 0.75)} w={3} head={0.01} glow={false} />;
          })}
          {nodes.map((n, i) => {
            const t0 = T0(i);
            if (f < t0) return null;
            const route: Pt[] = [...n.path.map((j) => [nodes[j].x, nodes[j].y] as Pt), [n.x, n.y]];
            const mv = clamp01((f - t0) / 12);
            const {p} = route.length > 1 ? along(route, eInOut(mv)) : {p: [n.x, n.y] as Pt};
            const arrived = f - t0 - 12;
            const sc = arrived < 0 ? 0.75 : lerp(1.35, 1, eOut(clamp01(arrived / 16)));
            const rk = rankOf(i);
            const vis = clamp01((f - visit(rk)) / 8);
            const flash = n.path.length === 0 ? 0 : 0;
            return (
              <g key={'n' + i} transform={`translate(${p[0]},${p[1]}) scale(${sc})`}>
                {arrived >= 0 && arrived < 24 && (
                  <circle r={34 + arrived * 2.4} fill="none" stroke={C} strokeWidth={2} opacity={1 - arrived / 24} />
                )}
                <circle r={34} fill={vis > 0 ? rgba(C, 0.25 + vis * 0.6) : '#071820'} stroke={C} strokeWidth={3} filter="url(#g-m)" opacity={1 - flash} />
                <text y={11} textAnchor="middle" fontFamily={FONT.tech} fontWeight={700} fontSize={32} fill={vis > 0.5 ? '#02121a' : '#fff'}>
                  {n.k}
                </text>
              </g>
            );
          })}
          {/* comparison flashes on the path */}
          {nodes.map((n, i) =>
            n.path.map((j, q) => {
              const at = T0(i) + (q / Math.max(1, n.path.length)) * 12;
              const a = 1 - clamp01((f - at) / 12);
              if (f < at || a <= 0) return null;
              return <circle key={`c${i}-${q}`} cx={nodes[j].x} cy={nodes[j].y} r={42} fill="none" stroke="#fff" strokeWidth={3} opacity={a * 0.9} />;
            }),
          )}
          {/* traversal cursor */}
          {curVis > 0 && ca && cb && (
            <circle
              cx={lerp(ca.x, cb.x, cfrac)}
              cy={lerp(ca.y, cb.y, cfrac)}
              r={46}
              fill="none"
              stroke={COL.co}
              strokeWidth={4}
              opacity={curVis}
              filter="url(#g-m)"
            />
          )}
          {/* sorted sequence */}
          <text x={960} y={712} textAnchor="middle" fontFamily={FONT.sans} fontSize={28} fill={COL.sub} letterSpacing={6} opacity={prog(f, 186, 20)}>
            中序遍历 · 左 → 根 → 右
          </text>
          {sorted.map((n, rk) => {
            const at = visit(rk);
            const t = eInOut(clamp01((f - at) / 18));
            if (f < at) return null;
            const tx = 960 + (rk - 6) * 104;
            const x = lerp(n.x, tx, t);
            const y = lerp(n.y, 780, t);
            return (
              <g key={'s' + rk} transform={`translate(${x},${y})`}>
                <rect x={-44} y={-34} width={88} height={60} rx={10} fill={rgba(C, 0.14)} stroke={rgba(C, 0.8)} strokeWidth={2} opacity={t} />
                <text y={10} textAnchor="middle" fontFamily={FONT.tech} fontWeight={700} fontSize={32} fill="#fff">
                  {n.k}
                </text>
              </g>
            );
          })}
        </svg>
      </Cam>
      <Caption title="二叉排序树" en="BINARY SEARCH TREE" desc="左子树 < 根 < 右子树 · 中序遍历得到有序序列" chip="O(log n)" color={C} />
    </AbsoluteFill>
  );
};

/* ============================ Quick sort ============================ */

type SortOp = {i: number; j: number; lo: number; hi: number; cmp: number};

const buildSort = () => {
  const n = 36;
  const a = Array.from({length: n}, (_, i) => i + 1);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rnd(i * 3.3 + 11) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  const init = [...a];
  const ops: SortOp[] = [];
  let cmp = 0;
  const qs = (lo: number, hi: number) => {
    if (lo >= hi) return;
    const pivot = a[hi];
    let i = lo;
    for (let j = lo; j < hi; j++) {
      cmp++;
      if (a[j] < pivot) {
        if (i !== j) {
          ops.push({i, j, lo, hi, cmp});
          [a[i], a[j]] = [a[j], a[i]];
        }
        i++;
      }
    }
    if (i !== hi) {
      ops.push({i, j: hi, lo, hi, cmp});
      [a[i], a[hi]] = [a[hi], a[i]];
    }
    qs(lo, i - 1);
    qs(i + 1, hi);
  };
  qs(0, n - 1);
  const states: number[][] = [init];
  const cur = [...init];
  for (const op of ops) {
    [cur[op.i], cur[op.j]] = [cur[op.j], cur[op.i]];
    states.push([...cur]);
  }
  return {ops, states, n, cmp};
};

const barColor = (v: number) => (v < 18 ? mixHex('#2563eb', C, v / 18) : mixHex(C, '#a7f3d0', (v - 18) / 18));

export const DSSort: React.FC = () => {
  const f = useF();
  const {ops, states, n, cmp} = useMemo(buildSort, []);
  const u = clamp01((f - 24) / 262) * ops.length;
  const k = Math.min(ops.length, Math.floor(u));
  const fr = eInOut(u - k);
  const st = states[k];
  const op = ops[Math.min(k, ops.length - 1)];
  const active = k < ops.length;
  const done = f > 288;
  const sweep = (f - 292) * 1.1;
  const xOf = (i: number) => 168 + i * 44;
  const BASE = 790;
  const cmpNow = active ? op.cmp : cmp;

  return (
    <AbsoluteFill>
      <Cam to={1.04} oy={600}>
        <svg width={1920} height={1080}>
          <GlowDefs />
          <defs>
            <linearGradient id="refl" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity={0.3} />
              <stop offset="1" stopColor="#fff" stopOpacity={0} />
            </linearGradient>
            <mask id="reflMask" maskUnits="userSpaceOnUse" x={0} y={0} width={1920} height={1080}>
              <rect x={0} y={BASE + 4} width={1920} height={170} fill="url(#refl)" />
            </mask>
          </defs>
          {active && (
            <rect
              x={xOf(op.lo) - 8}
              y={180}
              width={xOf(op.hi) - xOf(op.lo) + 50}
              height={BASE - 170}
              rx={10}
              fill={rgba(C, 0.06)}
              stroke={rgba(C, 0.35)}
              strokeDasharray="8 8"
            />
          )}
          {st.map((v, idx) => {
            let x = xOf(idx);
            if (active && (idx === op.i || idx === op.j)) {
              const other = idx === op.i ? op.j : op.i;
              x = lerp(xOf(idx), xOf(other), fr);
            }
            const h = 36 + v * 15;
            const inRange = active ? idx >= op.lo && idx <= op.hi : false;
            const isPivot = active && idx === op.hi && idx !== op.j;
            const moving = active && (idx === op.i || idx === op.j);
            const fin = done && idx < sweep;
            const pop = fin ? 1 + 0.08 * Math.max(0, 1 - (sweep - idx) / 6) : 1;
            const col = isPivot ? '#ffffff' : moving ? COL.co : barColor(v);
            const op_ = done ? (fin ? 1 : 0.55) : inRange || moving ? 1 : 0.35;
            const hh = h * pop;
            return (
              <g key={v} opacity={op_}>
                <rect x={x} y={BASE - hh} width={34} height={hh} rx={5} fill={col} filter={moving || fin ? 'url(#g-s)' : undefined} />
                <rect x={x} y={BASE + 6} width={34} height={hh * 0.3} rx={5} fill={col} mask="url(#reflMask)" />
              </g>
            );
          })}
          <line x1={150} y1={BASE + 3} x2={1770} y2={BASE + 3} stroke={rgba(C, 0.5)} strokeWidth={2} />
        </svg>
        {/* counters */}
        <div style={{position: 'absolute', right: 150, top: 132, display: 'flex', gap: 34, fontFamily: FONT.tech, fontSize: 30, color: COL.sub}}>
          <span>
            比较 <b style={{color: '#fff', fontFamily: FONT.display, fontSize: 34}}>{String(cmpNow).padStart(3, '0')}</b>
          </span>
          <span>
            交换 <b style={{color: COL.co, fontFamily: FONT.display, fontSize: 34}}>{String(k).padStart(3, '0')}</b>
          </span>
        </div>
        <div style={{position: 'absolute', left: 170, top: 136, display: 'flex', gap: 30, fontFamily: FONT.sans, fontSize: 24, color: COL.sub}}>
          <span>
            <span style={{display: 'inline-block', width: 16, height: 16, background: '#fff', marginRight: 10, borderRadius: 3}} />
            基准 pivot
          </span>
          <span>
            <span style={{display: 'inline-block', width: 16, height: 16, background: COL.co, marginRight: 10, borderRadius: 3}} />
            交换
          </span>
          <span>
            <span style={{display: 'inline-block', width: 16, height: 16, border: `2px dashed ${C}`, marginRight: 10, borderRadius: 3}} />
            当前划分区间
          </span>
        </div>
      </Cam>
      <Caption title="快速排序" en="QUICK SORT" desc="分治 · 每一趟划分都把基准放到最终位置" chip="O(n log n)" color={C} />
    </AbsoluteFill>
  );
};

/* ============================ Dijkstra ============================ */

const GN: Record<string, Pt> = {
  A: [220, 500],
  B: [460, 290],
  C: [450, 720],
  D: [700, 500],
  E: [760, 215],
  F: [740, 790],
  G: [985, 385],
  H: [960, 640],
  I: [1210, 235],
  J: [1215, 700],
};
const GE: [string, string, number][] = [
  ['A', 'B', 4],
  ['A', 'C', 2],
  ['B', 'C', 1],
  ['B', 'E', 7],
  ['B', 'D', 5],
  ['C', 'D', 8],
  ['C', 'F', 10],
  ['D', 'E', 2],
  ['D', 'G', 6],
  ['D', 'H', 3],
  ['E', 'I', 9],
  ['E', 'G', 4],
  ['F', 'H', 2],
  ['F', 'J', 6],
  ['G', 'I', 3],
  ['G', 'H', 5],
  ['H', 'J', 4],
];
const NAMES = Object.keys(GN);

type Step = {u: string; relax: {v: string; nd: number; better: boolean}[]};

const dijkstra = () => {
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  NAMES.forEach((n) => {
    dist[n] = Infinity;
    prev[n] = null;
  });
  dist.A = 0;
  const done = new Set<string>();
  const steps: Step[] = [];
  const snaps: {dist: Record<string, number>; prev: Record<string, string | null>}[] = [];
  for (let k = 0; k < NAMES.length; k++) {
    let u = '';
    NAMES.forEach((n) => {
      if (!done.has(n) && (u === '' || dist[n] < dist[u])) u = n;
    });
    done.add(u);
    const relax: Step['relax'] = [];
    GE.forEach(([a, b, w]) => {
      if (a !== u && b !== u) return;
      const v = a === u ? b : a;
      if (done.has(v)) return;
      const nd = dist[u] + w;
      const better = nd < dist[v];
      if (better) {
        dist[v] = nd;
        prev[v] = u;
      }
      relax.push({v, nd, better});
    });
    steps.push({u, relax});
    snaps.push({dist: {...dist}, prev: {...prev}});
  }
  return {steps, snaps};
};

export const DSGraph: React.FC<{zoom?: boolean}> = ({zoom: doZoom = true}) => {
  const f = useF();
  const {steps, snaps} = useMemo(dijkstra, []);
  const T = (k: number) => 90 + k * 30;
  const stepIdx = Math.floor((f - 90) / 30);
  const kDone = Math.min(steps.length - 1, stepIdx);
  const snapAt = (k: number) => (k < 0 ? null : snaps[Math.min(k, snaps.length - 1)]);
  // dist values become visible 18 frames after step start
  const visK = Math.min(steps.length - 1, Math.floor((f - 90 - 18) / 30));
  const snap = snapAt(visK);
  const distOf = (n: string) => (n === 'A' && f >= 90 ? 0 : snap ? snap.dist[n] : Infinity);
  const prevOf = (n: string) => (snap ? snap.prev[n] : null);
  const selectedAt = (n: string) => {
    const k = steps.findIndex((s) => s.u === n);
    return k < 0 ? Infinity : T(k);
  };
  const final = snaps[snaps.length - 1];
  const sptOn = prog(f, 392, 40);
  const pathNodes: string[] = [];
  {
    let cur: string | null = 'I';
    while (cur) {
      pathNodes.unshift(cur);
      cur = final.prev[cur];
    }
  }
  const pathPts = pathNodes.map((n) => GN[n]);
  const comet = prog(f, 430, 70, eInOut);
  const onPath = (a: string, b: string) => {
    const i = pathNodes.indexOf(a);
    const j = pathNodes.indexOf(b);
    return i >= 0 && j >= 0 && Math.abs(i - j) === 1;
  };
  const inSPT = (a: string, b: string) => final.prev[a] === b || final.prev[b] === a;

  const zoom = doZoom ? prog(f, 505, 95, eIn) : 0;
  const [Ix, Iy] = GN.I;
  const sc = lerp(1, 9, zoom);

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          transform: doZoom ? `translate(${(960 - Ix) * eInOut(prog(f, 500, 60, (t) => t))}px, ${(540 - Iy) * eInOut(prog(f, 500, 60, (t) => t))}px) scale(${sc})` : undefined,
          transformOrigin: `${Ix}px ${Iy}px`,
        }}
      >
        <Cam to={1.03}>
          <svg width={1920} height={1080}>
            <GlowDefs />
            {GE.map(([a, b, w], i) => {
              const t = prog(f, 12 + i * 3, 24, eInOut);
              const pa = GN[a];
              const pb = GN[b];
              const tree = inSPT(a, b);
              const path = onPath(a, b);
              const cand = prevOf(a) === b || prevOf(b) === a;
              let col = rgba('#8fb3c9', 0.35);
              let wd = 2.5;
              if (cand) {
                col = rgba(C, 0.8);
                wd = 4;
              }
              const dim = sptOn * (tree ? 0 : 0.85);
              if (tree && sptOn > 0) {
                col = C;
                wd = 4 + sptOn * 2;
              }
              const mx = (pa[0] + pb[0]) / 2;
              const my = (pa[1] + pb[1]) / 2;
              return (
                <g key={i} opacity={1 - dim}>
                  <Arrow pts={[pa, pb]} t={t} color={col} w={wd} head={0.01} glow={cand || tree} />
                  {path && comet > 0 && <Arrow pts={[pa, pb]} t={1} color={COL.co} w={6} head={0.01} opacity={comet > 0 ? 0.6 : 0} />}
                  <g opacity={prog(f, 30 + i * 2, 20)}>
                    <rect x={mx - 17} y={my - 16} width={34} height={30} rx={8} fill="#08121c" stroke={rgba('#8fb3c9', 0.35)} />
                    <text x={mx} y={my + 8} textAnchor="middle" fontFamily={FONT.mono} fontSize={20} fill={COL.sub}>
                      {w}
                    </text>
                  </g>
                </g>
              );
            })}
            {/* relaxation pulses */}
            {steps.map((s, k) =>
              s.relax.map((r, q) => {
                const t = clamp01((f - T(k) - 4) / 14);
                if (t <= 0 || t >= 1) return null;
                const {p} = along([GN[s.u], GN[r.v]], eInOut(t));
                return <circle key={`${k}-${q}`} cx={p[0]} cy={p[1]} r={9} fill={r.better ? COL.co : '#fff'} filter="url(#g-m)" />;
              }),
            )}
            {/* comet along final path */}
            {comet > 0 && comet < 1 && (() => {
              const {p} = along(pathPts, comet);
              return <circle cx={p[0]} cy={p[1]} r={14} fill="#fff" filter="url(#g-l)" />;
            })()}
            {NAMES.map((n, i) => {
              const [x, y] = GN[n];
              const a = eBack(clamp01((f - i * 4) / 20));
              const sel = f >= selectedAt(n);
              const selT = clamp01((f - selectedAt(n)) / 16);
              const d = distOf(n);
              const updated = snap && visK >= 0 && steps[visK].relax.some((r) => r.v === n && r.better);
              const flash = updated ? 1 - clamp01((f - (T(visK) + 18)) / 14) : 0;
              const isI = n === 'I';
              const zoomGlow = isI ? zoom : 0;
              return (
                <g key={n} transform={`translate(${x},${y}) scale(${a})`}>
                  {sel && selT < 1 && <circle r={36 + selT * 40} fill="none" stroke={C} strokeWidth={3} opacity={1 - selT} />}
                  {zoomGlow > 0 && <circle r={40 + zoomGlow * 30} fill={rgba(COL.co, 0.4 * zoomGlow)} filter="url(#g-l)" />}
                  <circle r={34} fill={sel ? rgba(C, 0.3 + 0.55 * selT) : '#071820'} stroke={isI && zoom > 0 ? COL.co : C} strokeWidth={3} filter="url(#g-m)" />
                  <text y={12} textAnchor="middle" fontFamily={FONT.tech} fontWeight={700} fontSize={34} fill={sel && selT > 0.5 ? '#02121a' : '#fff'}>
                    {n}
                  </text>
                  <g transform="translate(0,-54)" opacity={prog(f, 50, 20)}>
                    <rect x={-30} y={-22} width={60} height={30} rx={8} fill={flash > 0 ? rgba(COL.co, 0.35 * flash + 0.1) : 'rgba(6,14,24,0.85)'} />
                    <text y={1} textAnchor="middle" fontFamily={FONT.mono} fontSize={22} fontWeight={700} fill={flash > 0.2 ? COL.co : d === Infinity ? COL.dim : C}>
                      {d === Infinity ? '∞' : d}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
          {/* distance table */}
          <div
            style={{
              position: 'absolute',
              left: 1370,
              top: 170,
              width: 420,
              borderRadius: 16,
              background: COL.panel,
              border: `1px solid ${rgba(C, 0.3)}`,
              padding: '16px 22px',
              opacity: prog(f, 40, 30),
              transform: `translateX(${(1 - prog(f, 40, 36)) * 60}px)`,
              fontFamily: FONT.mono,
              fontSize: 24,
            }}
          >
            <div style={{display: 'flex', color: COL.sub, fontFamily: FONT.sans, fontSize: 22, paddingBottom: 8, borderBottom: `1px solid ${rgba(C, 0.25)}`}}>
              <span style={{width: 80}}>顶点</span>
              <span style={{width: 110}}>dist</span>
              <span style={{width: 110}}>path</span>
              <span>S</span>
            </div>
            {NAMES.map((n) => {
              const sel = f >= selectedAt(n);
              const cur = stepIdx >= 0 && stepIdx < steps.length && steps[stepIdx].u === n && f < 400;
              const d = distOf(n);
              return (
                <div
                  key={n}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    height: 50,
                    color: sel ? '#fff' : COL.sub,
                    background: cur ? rgba(C, 0.2) : 'transparent',
                    borderRadius: 8,
                  }}
                >
                  <span style={{width: 80, fontFamily: FONT.tech, fontWeight: 700, fontSize: 28, color: sel ? C : COL.sub}}>{n}</span>
                  <span style={{width: 110}}>{d === Infinity ? '∞' : d}</span>
                  <span style={{width: 110}}>{prevOf(n) ?? '-'}</span>
                  <span style={{color: C}}>{sel ? '✓' : ''}</span>
                </div>
              );
            })}
          </div>
        </Cam>
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, ${rgba('#fff5d6', 0.95)} 0%, ${rgba(COL.co, 0.55)} 35%, transparent 75%)`,
          opacity: doZoom ? prog(f, 540, 60, eIn) : 0,
        }}
      />
      <AbsoluteFill style={{opacity: doZoom ? 1 - prog(f, 490, 24) : 1}}>
        <Caption title="最短路径" en="DIJKSTRA" desc="贪心：每一轮确定一个顶点的最短距离" chip="O(|V|²)" color={C} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const _unused = keyed;
