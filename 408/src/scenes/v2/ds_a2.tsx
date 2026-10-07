import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import {Cell, GEdge, GNode, Glass, Hi, Txt} from '../../components/kit';
import {Cue, Problem, probCues} from '../../components/Problem';
import {useF} from '../../components/Shot';
import {along, Arrow, Caption, Cam, GlowDefs, partial, Pt} from '../../components/ui';
import {clamp01, COL, eBack, eInOut, eOut, FONT, lerp, prog, rgba} from '../../theme';

const C = COL.ds;
const A2 = COL.co;
const V = COL.os;

/* ====================================================================== */
/* 二叉树遍历：沿轮廓走一圈                                                */
/* ====================================================================== */

type TN = {k: string; x: number; y: number; l?: string; r?: string};
const TREE: Record<string, TN> = {
  A: {k: 'A', x: 760, y: 270, l: 'B', r: 'C'},
  B: {k: 'B', x: 500, y: 420, l: 'D', r: 'E'},
  C: {k: 'C', x: 1020, y: 420, r: 'F'},
  D: {k: 'D', x: 360, y: 580},
  E: {k: 'E', x: 640, y: 580, l: 'G'},
  F: {k: 'F', x: 1160, y: 580, l: 'H'},
  G: {k: 'G', x: 560, y: 740},
  H: {k: 'H', x: 1080, y: 740},
};

type Ev = {kind: 0 | 1 | 2; n: string};
const eulerTour = () => {
  const pts: Pt[] = [];
  const evs: {idx: number; ev: Ev}[] = [];
  const d = 60;
  const tour = (id: string) => {
    const n = TREE[id];
    evs.push({idx: pts.length, ev: {kind: 0, n: id}});
    pts.push([n.x - d, n.y - 8]);
    if (n.l) tour(n.l);
    else pts.push([n.x - d * 0.6, n.y + d * 0.8]);
    evs.push({idx: pts.length, ev: {kind: 1, n: id}});
    pts.push([n.x, n.y + d]);
    if (n.r) tour(n.r);
    else pts.push([n.x + d * 0.6, n.y + d * 0.8]);
    evs.push({idx: pts.length, ev: {kind: 2, n: id}});
    pts.push([n.x + d, n.y - 8]);
  };
  tour('A');
  // catmull-rom smoothing
  const S = 12;
  const out: Pt[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let s = 0; s < S; s++) {
      const t = s / S;
      const t2 = t * t;
      const t3 = t2 * t;
      out.push([
        0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  }
  out.push(pts[pts.length - 1]);
  const L = [0];
  for (let i = 1; i < out.length; i++) L.push(L[i - 1] + Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]));
  const total = L[L.length - 1];
  const evFrac = evs.map((e) => ({...e, frac: L[e.idx * S] / total}));
  return {path: out, evs: evFrac};
};

const TRAV_T0 = 60;
const TRAV_LEN = 640;
const KC = [C, A2, V];

export const DSTraverse: React.FC = () => {
  const f = useF();
  const {path, evs} = useMemo(eulerTour, []);
  const u = clamp01((f - TRAV_T0) / TRAV_LEN);
  const passed = evs.filter((e) => u >= e.frac);
  const rows = [0, 1, 2].map((k) => passed.filter((e) => e.ev.kind === k));
  const evFrame = (e: {frac: number}) => TRAV_T0 + e.frac * TRAV_LEN;
  const head = along(path, u).p;
  const nodes = Object.values(TREE);

  return (
    <AbsoluteFill>
      <Cam to={1.04} ox={760}>
        <svg width={1920} height={1080}>
          <GlowDefs />
          {nodes.map((n) =>
            [n.l, n.r].map((c) => (c ? <GEdge key={n.k + c} a={[n.x, n.y]} b={[TREE[c].x, TREE[c].y]} t={prog(f, 6, 30)} color={rgba(C, 0.55)} ra={34} rb={34} /> : null)),
          )}
          <path d={partial(path, 1)} fill="none" stroke={rgba('#fff', 0.12)} strokeWidth={2} strokeDasharray="6 8" opacity={prog(f, 20, 30)} />
          {u > 0 && <path d={partial(path, u)} fill="none" stroke="#fff" strokeWidth={3.5} opacity={0.85} filter="url(#g-s)" />}
          {nodes.map((n, i) => {
            const flash = passed.filter((e) => e.ev.n === n.k).map((e) => ({k: e.ev.kind, t: f - evFrame(e)}));
            const last = flash[flash.length - 1];
            const ring = last && last.t < 24 ? last.t / 24 : 0;
            return (
              <g key={n.k}>
                <GNode x={n.x} y={n.y} r={34} label={n.k} color={last ? KC[last.k] : C} scale={eBack(clamp01((f - i * 4) / 20))} fill={last && last.t < 20 ? 1 - last.t / 20 : 0} ring={ring} />
                {[
                  [n.x - 60, n.y - 8],
                  [n.x, n.y + 60],
                  [n.x + 60, n.y - 8],
                ].map(([x, y], k) => {
                  const hit = flash.some((e) => e.k === k);
                  return <circle key={k} cx={x} cy={y} r={hit ? 7 : 5} fill={hit ? KC[k] : rgba(KC[k], 0.35)} opacity={prog(f, 30, 20)} filter={hit ? 'url(#g-s)' : undefined} />;
                })}
              </g>
            );
          })}
          {u > 0 && u < 1 && <circle cx={head[0]} cy={head[1]} r={12} fill="#fff" filter="url(#g-l)" />}
          {/* output rows */}
          {[
            {t: '先序', r: '根 → 左 → 右'},
            {t: '中序', r: '左 → 根 → 右'},
            {t: '后序', r: '左 → 右 → 根'},
          ].map((row, k) => {
            const y = 330 + k * 150;
            return (
              <g key={k} opacity={prog(f, 20 + k * 8, 24)}>
                <circle cx={1296} cy={y - 16} r={7} fill={KC[k]} />
                <Txt x={1314} y={y - 16} size={32} weight={800} anchor="start">
                  {row.t}
                </Txt>
                <Txt x={1314} y={y + 22} size={20} color={KC[k]} anchor="start" family={FONT.sans} weight={500}>
                  {row.r}
                </Txt>
                {rows[k].map((e, j) => {
                  const a = eBack(clamp01((f - evFrame(e)) / 16));
                  return <Cell key={j} x={1440 + j * 52} y={y - 30} w={46} h={52} text={e.ev.n} color={KC[k]} fill={0.35} size={28} scale={a} />;
                })}
              </g>
            );
          })}
        </svg>
      </Cam>
      <Caption title="二叉树遍历" en="TRAVERSAL" desc="沿轮廓绕树一周：经过左侧记先序，底部记中序，右侧记后序" chip="O(n)" color={C} />
    </AbsoluteFill>
  );
};

export const DSTraverseCues: Cue[] = (() => {
  const {evs} = eulerTour();
  return evs.map((e): Cue => [Math.round(TRAV_T0 + e.frac * TRAV_LEN), 'blip', [72, 76, 79][e.ev.kind] + (e.ev.n.charCodeAt(0) - 65)]);
})();

/* ====================================================================== */
/* 04 先序 + 中序 重建二叉树                                               */
/* ====================================================================== */

const PRE = 'ABDEGCFH';
const IN = 'DBGEACHF';
const RB_POS: Record<string, Pt> = {
  A: [1450, 290],
  B: [1250, 420],
  C: [1650, 420],
  D: [1140, 560],
  E: [1360, 560],
  F: [1760, 560],
  G: [1280, 690],
  H: [1690, 690],
};
type RStep = {root: string; pa: number; pb: number; ia: number; ib: number; k: number; parent?: string};
const rebuildSteps = () => {
  const out: RStep[] = [];
  const rec = (pa: number, pb: number, ia: number, ib: number, parent?: string) => {
    if (pa > pb) return;
    const root = PRE[pa];
    const k = IN.indexOf(root);
    out.push({root, pa, pb, ia, ib, k, parent});
    const L = k - ia;
    rec(pa + 1, pa + L, ia, k - 1, root);
    rec(pa + L + 1, pb, k + 1, ib, root);
  };
  rec(0, 7, 0, 7);
  return out;
};
const POST = 'DGEBHFCA';

const REB = {
  card: 330,
  reveal: 1110,
  steps: [
    {at: 0, label: '先序定根'},
    {at: 40, label: '中序分左右'},
    {at: 860, label: '读出后序'},
  ],
};

export const DSRebuild: React.FC = () => (
  <Problem
    no={4}
    color={C}
    tag="数据结构 · 二叉树"
    title="由遍历序列构造二叉树"
    q={[
      ['已知一棵二叉树的先序序列为 ', {t: 'A B D E G C F H', m: true}, '，'],
      ['中序序列为 ', {t: 'D B G E A C H F', m: true}, '，则该二叉树的', {t: '后序序列', c: A2}, '为？'],
    ]}
    options={['D G E B H F C A', 'D E G B H F C A', 'G D E B F H C A', 'D G B E H F C A']}
    answer={0}
    brief="先序 ABDEGCFH + 中序 DBGEACHF ⇒ 后序？"
    insight="先序（或后序）定根，中序划分左右子树，递归即可唯一确定"
    {...REB}
  >
    {(sf) => <RebuildStage sf={sf} />}
  </Problem>
);

const RebuildStage: React.FC<{sf: number}> = ({sf}) => {
  const steps = useMemo(rebuildSteps, []);
  const T = (s: number) => 40 + s * 100;
  const si = steps.reduce((acc, _, s) => (sf >= T(s) ? s : acc), -1);
  const cur = si >= 0 && sf < 860 ? steps[si] : null;
  const cx = (k: number) => 300 + k * 96;
  const postT = (k: number) => 880 + k * 24;

  return (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <GlowDefs />
        {[
          {lbl: '先序', s: PRE, y: 290},
          {lbl: '中序', s: IN, y: 420},
        ].map((row, r) => (
          <g key={r} opacity={prog(sf, r * 8, 20)}>
            <Txt x={250} y={row.y + 40} size={30} weight={800} anchor="end">
              {row.lbl}
            </Txt>
            {row.s.split('').map((ch, k) => {
              let color = C;
              let fill = 0;
              let dim = false;
              if (cur) {
                const inRange = r === 0 ? k >= cur.pa && k <= cur.pb : k >= cur.ia && k <= cur.ib;
                dim = !inRange;
                if (ch === cur.root) {
                  color = '#ffffff';
                  fill = 0.8;
                } else if (r === 1 && inRange) {
                  color = k < cur.k ? C : A2;
                  fill = 0.35;
                } else if (r === 0 && inRange) {
                  const L = cur.k - cur.ia;
                  color = k <= cur.pa + L ? C : A2;
                  fill = 0.2;
                }
              }
              return <Cell key={k} x={cx(k)} y={row.y} w={84} h={80} text={ch} color={color} fill={fill} dim={dim} size={40} glow={cur?.root === ch} />;
            })}
          </g>
        ))}
        {cur && (
          <g opacity={prog(sf, T(si), 16)}>
            <Txt x={650} y={570} size={30} color="#fff" weight={600}>
              {`根 = ${cur.root}　左子树 {${IN.slice(cur.ia, cur.k).split('').join(' ') || '空'}}　右子树 {${IN.slice(cur.k + 1, cur.ib + 1).split('').join(' ') || '空'}}`}
            </Txt>
          </g>
        )}
        {/* tree */}
        {steps.map((s, i) => {
          const a = eBack(clamp01((sf - T(i) - 30) / 20));
          if (a <= 0) return null;
          const [x, y] = RB_POS[s.root];
          return s.parent ? <GEdge key={'e' + i} a={RB_POS[s.parent]} b={[x, y]} t={prog(sf, T(i) + 30, 20)} color={rgba(C, 0.7)} ra={32} rb={32} /> : null;
        })}
        {steps.map((s, i) => {
          const a = eBack(clamp01((sf - T(i) - 30) / 20));
          const [x, y] = RB_POS[s.root];
          const pk = POST.indexOf(s.root);
          const pf = sf - postT(pk);
          return <GNode key={s.root} x={x} y={y} r={32} label={s.root} color={pf >= 0 ? A2 : C} scale={a} fill={pf >= 0 && pf < 20 ? 1 - pf / 20 : 0} ring={pf >= 0 && pf < 24 ? pf / 24 : 0} />;
        })}
        {/* postorder */}
        <g opacity={prog(sf, 860, 20)}>
          <Txt x={250} y={740} size={30} weight={800} anchor="end" color={A2}>
            后序
          </Txt>
          {POST.split('').map((ch, k) => (
            <Cell key={k} x={cx(k)} y={700} w={84} h={80} text={ch} color={A2} fill={0.4} size={40} scale={eBack(clamp01((sf - postT(k)) / 16))} />
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export const DSRebuildCues: Cue[] = probCues(REB, [
  ...new Array(8).fill(0).map((_, s): Cue => [40 + s * 100 + 30, 'blip', 70 + s * 2]),
  ...new Array(8).fill(0).map((_, k): Cue => [880 + k * 24, 'tick', 0]),
]);

/* ====================================================================== */
/* 05 AVL 旋转                                                             */
/* ====================================================================== */

type AState = Record<number, {p?: number; side?: 'L' | 'R'}>;
const AV_STATES: AState[] = [
  {50: {}},
  {50: {}, 30: {p: 50, side: 'L'}},
  {50: {}, 30: {p: 50, side: 'L'}, 70: {p: 50, side: 'R'}},
  {50: {}, 30: {p: 50, side: 'L'}, 70: {p: 50, side: 'R'}, 20: {p: 30, side: 'L'}},
  {50: {}, 30: {p: 50, side: 'L'}, 70: {p: 50, side: 'R'}, 20: {p: 30, side: 'L'}, 40: {p: 30, side: 'R'}},
  {50: {}, 30: {p: 50, side: 'L'}, 70: {p: 50, side: 'R'}, 20: {p: 30, side: 'L'}, 40: {p: 30, side: 'R'}, 35: {p: 40, side: 'L'}},
  {50: {}, 40: {p: 50, side: 'L'}, 70: {p: 50, side: 'R'}, 30: {p: 40, side: 'L'}, 20: {p: 30, side: 'L'}, 35: {p: 30, side: 'R'}},
  {40: {}, 30: {p: 40, side: 'L'}, 50: {p: 40, side: 'R'}, 20: {p: 30, side: 'L'}, 35: {p: 30, side: 'R'}, 70: {p: 50, side: 'R'}},
];
const RANK = [20, 30, 35, 40, 50, 70];
const depthOf = (s: AState, k: number): number => (s[k].p === undefined ? 0 : 1 + depthOf(s, s[k].p!));
const heightOf = (s: AState, k: number): number => {
  const ch = Object.keys(s)
    .map(Number)
    .filter((c) => s[c].p === k);
  return ch.length ? 1 + Math.max(...ch.map((c) => heightOf(s, c))) : 0;
};
const bfOf = (s: AState, k: number) => {
  const l = Object.keys(s)
    .map(Number)
    .find((c) => s[c].p === k && s[c].side === 'L');
  const r = Object.keys(s)
    .map(Number)
    .find((c) => s[c].p === k && s[c].side === 'R');
  return (l !== undefined ? heightOf(s, l) + 1 : 0) - (r !== undefined ? heightOf(s, r) + 1 : 0);
};
const avX = (k: number) => 480 + RANK.indexOf(k) * 192;
const avY = (s: AState, k: number) => 290 + depthOf(s, k) * 165;

const AVL = {
  card: 330,
  reveal: 880,
  steps: [
    {at: 0, label: '依次插入'},
    {at: 370, label: '发现失衡'},
    {at: 500, label: '左旋'},
    {at: 680, label: '右旋'},
  ],
};

export const DSAvl: React.FC = () => (
  <Problem
    no={5}
    color={C}
    tag="数据结构 · 平衡二叉树"
    title="AVL 平衡旋转"
    q={[
      ['依次插入关键字 ', {t: '50, 30, 70, 20, 40, 35', m: true}, ' 构造平衡二叉树（AVL）。'],
      ['插入 ', {t: '35', c: A2}, ' 后树失去平衡，应进行何种调整？调整后的', {t: '根结点', c: A2}, '是？'],
    ]}
    options={['LL 型右旋，根为 30', 'RR 型左旋，根为 70', 'LR 型双旋，根为 40', 'RL 型双旋，根为 35']}
    answer={2}
    brief="插入 50,30,70,20,40,35 后如何调整？新根是谁？"
    insight="最小不平衡子树根为 50，插入路径 L → R，先左旋后右旋"
    {...AVL}
  >
    {(sf) => <AvlStage sf={sf} />}
  </Problem>
);

const AvlStage: React.FC<{sf: number}> = ({sf}) => {
  const ins = [50, 30, 70, 20, 40, 35];
  const insT = (i: number) => 30 + i * 58;
  const nIns = ins.filter((_, i) => sf >= insT(i)).length;
  const r1 = prog(sf, 500, 110, eInOut);
  const r2 = prog(sf, 680, 110, eInOut);
  const base = AV_STATES[Math.max(0, nIns - 1)];
  const stA = r2 > 0 ? AV_STATES[6] : r1 > 0 ? AV_STATES[5] : base;
  const stB = r2 > 0 ? AV_STATES[7] : r1 > 0 ? AV_STATES[6] : base;
  const tt = r2 > 0 ? r2 : r1 > 0 ? r1 : 0;
  const keys = Object.keys(stB).map(Number);
  const pos = (k: number): Pt => [avX(k), lerp(avY(stA, k), avY(stB, k), tt)];
  const unb = sf >= 370 && sf < 500;
  const final = sf >= 800;
  const bfState = tt > 0.5 ? stB : stA;
  const label = sf < 370 ? '' : sf < 500 ? '失衡：bf(50) = 2，插入路径 50 →L→ 30 →R→ 40 ⇒ LR 型' : sf < 680 ? '① 以 40 为中心，对 30 做左旋' : sf < 800 ? '② 以 40 为中心，对 50 做右旋' : '恢复平衡：所有结点 |bf| ≤ 1';

  return (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <GlowDefs />
        {/* edges: crossfade between states */}
        {[
          {s: stA, a: 1 - tt},
          {s: stB, a: tt},
        ].map(({s, a}, si) =>
          a <= 0.01
            ? null
            : Object.keys(s)
                .map(Number)
                .filter((k) => s[k].p !== undefined && keys.includes(k))
                .map((k) => {
                  const p = s[k].p!;
                  const ins0 = ins.indexOf(k);
                  const t = prog(sf, insT(ins0) + 12, 16);
                  return <GEdge key={`${si}-${k}`} a={pos(p)} b={pos(k)} t={t} color={rgba(C, 0.7)} ra={34} rb={34} opacity={a} />;
                }),
        )}
        {/* LR path hint */}
        {unb && (
          <g opacity={prog(sf, 380, 20)}>
            <GEdge a={pos(50)} b={pos(30)} color={A2} w={5} ra={40} rb={40} t={prog(sf, 390, 20)} dir glow />
            <GEdge a={pos(30)} b={pos(40)} color={A2} w={5} ra={40} rb={40} t={prog(sf, 420, 20)} dir glow />
            <Txt x={(avX(50) + avX(30)) / 2 - 40} y={(avY(stA, 50) + avY(stA, 30)) / 2 - 20} size={34} weight={900} color={A2} family={FONT.hero}>
              L
            </Txt>
            <Txt x={(avX(30) + avX(40)) / 2 + 40} y={(avY(stA, 30) + avY(stA, 40)) / 2 - 20} size={34} weight={900} color={A2} family={FONT.hero}>
              R
            </Txt>
          </g>
        )}
        {keys.map((k) => {
          const i = ins.indexOf(k);
          const a = clamp01((sf - insT(i)) / 20);
          if (a <= 0) return null;
          const [x, y] = pos(k);
          const yy = lerp(150, y, eOut(a));
          const bf = bfOf(bfState, k);
          const bad = Math.abs(bf) > 1;
          const hot = k === 50 && unb;
          return (
            <g key={k}>
              <GNode x={x} y={yy} r={36} label={k} color={hot || bad ? COL.red : final ? COL.green : C} scale={eBack(a)} fill={hot ? 0.3 + 0.3 * Math.sin(sf / 5) : 0} ring={a < 1 ? a : 0} size={30} />
              <g transform={`translate(${x + 46},${yy - 44})`} opacity={a}>
                <rect x={-24} y={-17} width={48} height={32} rx={10} fill={bad ? COL.red : 'rgba(8,14,26,0.9)'} stroke={bad ? COL.red : final ? COL.green : rgba(C, 0.6)} />
                <text y={1} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT.mono} fontSize={20} fontWeight={700} fill={bad ? '#fff' : final ? COL.green : COL.sub}>
                  {bf > 0 ? `+${bf}` : bf}
                </text>
              </g>
            </g>
          );
        })}
        <Txt x={960} y={860} size={32} weight={700} color={unb ? COL.red : '#fff'} opacity={label ? prog(sf, 370, 20) : 0}>
          {label}
        </Txt>
        <Txt x={1780} y={230} size={20} anchor="end" color={COL.sub} opacity={prog(sf, 20, 20)}>
          角标 = 平衡因子 bf（左高 − 右高）
        </Txt>
      </svg>
    </AbsoluteFill>
  );
};

export const DSAvlCues: Cue[] = probCues(AVL, [
  ...[0, 1, 2, 3, 4, 5].map((i): Cue => [30 + i * 58 + 18, 'blip', 69 + i * 2]),
  [380, 'error'],
  [500, 'whoosh'],
  [680, 'whoosh'],
  [800, 'chime'],
]);

/* ====================================================================== */
/* 哈夫曼树（概念 + WPL）                                                  */
/* ====================================================================== */

type HN = {id: string; w: number; ch?: string; l?: string; r?: string};
const HNODES: Record<string, HN> = {
  a: {id: 'a', w: 45, ch: 'a'},
  b: {id: 'b', w: 13, ch: 'b'},
  c: {id: 'c', w: 12, ch: 'c'},
  d: {id: 'd', w: 16, ch: 'd'},
  e: {id: 'e', w: 9, ch: 'e'},
  f: {id: 'f', w: 5, ch: 'f'},
  n1: {id: 'n1', w: 14, l: 'f', r: 'e'},
  n2: {id: 'n2', w: 25, l: 'c', r: 'b'},
  n3: {id: 'n3', w: 30, l: 'n1', r: 'd'},
  n4: {id: 'n4', w: 55, l: 'n2', r: 'n3'},
  n5: {id: 'n5', w: 100, l: 'a', r: 'n4'},
};
const FORESTS = [
  ['f', 'e', 'c', 'b', 'd', 'a'],
  ['c', 'b', 'n1', 'd', 'a'],
  ['n1', 'd', 'n2', 'a'],
  ['n2', 'n3', 'a'],
  ['a', 'n4'],
  ['n5'],
];
const MERGED = ['n1', 'n2', 'n3', 'n4', 'n5'];
const CODES: Record<string, string> = {a: '0', c: '100', b: '101', f: '1100', e: '1101', d: '111'};

const hHeight = (id: string): number => {
  const n = HNODES[id];
  return n.l ? 1 + Math.max(hHeight(n.l), hHeight(n.r!)) : 0;
};
const layoutForest = (roots: string[]) => {
  const pos: Record<string, Pt> = {};
  let cursor = 0;
  const LS = 150;
  const place = (id: string): number => {
    const n = HNODES[id];
    if (!n.l) {
      const x = cursor;
      cursor += LS;
      pos[id] = [x, 0];
      return x;
    }
    const xl = place(n.l);
    const xr = place(n.r!);
    const x = (xl + xr) / 2;
    pos[id] = [x, 0];
    return x;
  };
  roots.forEach((r, i) => {
    place(r);
    if (i < roots.length - 1) cursor += 50;
  });
  const xs = Object.values(pos).map((p) => p[0]);
  const shift = 820 - (Math.min(...xs) + Math.max(...xs)) / 2;
  for (const id of Object.keys(pos)) pos[id] = [pos[id][0] + shift, 780 - hHeight(id) * 118];
  return pos;
};

const HUF_T = (k: number) => 70 + k * 120;

export const DSHuffman: React.FC = () => {
  const f = useF();
  const layouts = useMemo(() => FORESTS.map(layoutForest), []);
  const k = Math.min(4, Math.max(-1, Math.floor((f - HUF_T(0)) / 120)));
  const local = k >= 0 ? f - HUF_T(k) : 0;
  const move = k >= 0 ? eInOut(clamp01((local - 30) / 70)) : 0;
  const from = layouts[Math.max(0, k)];
  const to = layouts[Math.min(5, k + 1)];
  const doneAll = f >= HUF_T(4) + 100;
  const cur = doneAll ? layouts[5] : null;
  const posOf = (id: string): Pt | null => {
    if (cur) return cur[id];
    if (k < 0) return layouts[0][id] ?? null;
    const a = from[id];
    const b = to[id];
    if (a && b) return [lerp(a[0], b[0], move), lerp(a[1], b[1], move)];
    if (b && !a) {
      // new parent: grows out of the middle of its children
      const n = HNODES[id];
      const pl = from[n.l!];
      const pr = from[n.r!];
      const mid: Pt = [(pl[0] + pr[0]) / 2, Math.min(pl[1], pr[1]) - 118];
      return [lerp(mid[0], b[0], move), lerp(mid[1], b[1], move)];
    }
    return a ?? null;
  };
  const exists = (id: string) => {
    const mi = MERGED.indexOf(id);
    return mi < 0 || f >= HUF_T(mi) + 30;
  };
  const allIds = Object.keys(HNODES).filter(exists);
  const codeA = prog(f, 720, 30);
  const wplA = prog(f, 880, 30);
  const picking = k >= 0 && !doneAll && local < 34 ? FORESTS[k].slice(0, 2) : [];

  return (
    <AbsoluteFill>
      <Cam to={1.03}>
        <svg width={1920} height={1080}>
          <GlowDefs />
          {allIds.map((id) => {
            const n = HNODES[id];
            if (!n.l) return null;
            const p = posOf(id);
            const mi = MERGED.indexOf(id);
            const t = prog(f, HUF_T(mi) + 30, 30);
            return (
              <g key={'e' + id}>
                {[n.l, n.r!].map((c, j) => {
                  const q = posOf(c);
                  if (!p || !q) return null;
                  const mx = (p[0] + q[0]) / 2;
                  const my = (p[1] + q[1]) / 2;
                  return (
                    <g key={c}>
                      <GEdge a={p} b={q} t={t} color={rgba(C, 0.7)} ra={34} rb={34} />
                      <Txt x={mx + (j ? 18 : -18)} y={my - 12} size={24} weight={800} color={j ? A2 : C} family={FONT.mono} opacity={codeA}>
                        {j}
                      </Txt>
                    </g>
                  );
                })}
              </g>
            );
          })}
          {allIds.map((id) => {
            const n = HNODES[id];
            const p = posOf(id);
            if (!p) return null;
            const mi = MERGED.indexOf(id);
            const a = mi < 0 ? eBack(clamp01((f - Object.keys(CODES).indexOf(id) * 5) / 20)) : eBack(clamp01((f - HUF_T(mi) - 30) / 22));
            const pick = picking.includes(id);
            const leaf = !!n.ch;
            return (
              <g key={id}>
                <GNode
                  x={p[0]}
                  y={p[1] - (pick ? Math.sin((local / 34) * Math.PI) * 26 : 0)}
                  r={leaf ? 36 : 32}
                  label={n.w}
                  color={leaf ? C : A2}
                  scale={a}
                  fill={pick ? 0.6 : 0}
                  size={leaf ? 28 : 26}
                  ring={pick ? (local % 34) / 34 : 0}
                />
                {leaf && (
                  <>
                    <Txt x={p[0]} y={p[1] + 62} size={30} weight={800} family={FONT.mono} opacity={a}>
                      {n.ch}
                    </Txt>
                    <Txt x={p[0]} y={p[1] + 98} size={24} weight={700} family={FONT.mono} color={A2} opacity={prog(f, 760 + 'acbfed'.indexOf(n.ch!) * 14, 20)}>
                      {CODES[n.ch!]}
                    </Txt>
                  </>
                )}
              </g>
            );
          })}
        </svg>
        <Glass x={1330} y={260} w={480} color={C} opacity={prog(f, 40, 30)} style={{fontSize: 24, lineHeight: '42px'}}>
          <div style={{fontFamily: FONT.sans, color: COL.sub, fontSize: 22}}>字符频率（权值）</div>
          <div>a:45 b:13 c:12 d:16 e:9 f:5</div>
          <div style={{fontFamily: FONT.sans, color: COL.sub, fontSize: 22, marginTop: 8}}>每次取出权值最小的两棵树合并</div>
          {MERGED.map((id, i) => {
            const n = HNODES[id];
            return (
              <div key={id} style={{opacity: prog(f, HUF_T(i) + 30, 20), color: i === k && !doneAll ? A2 : '#fff'}}>
                {HNODES[n.l!].w} + {HNODES[n.r!].w} = {n.w}
              </div>
            );
          })}
        </Glass>
        <Glass x={1330} y={690} w={480} color={A2} opacity={wplA} style={{fontSize: 23, lineHeight: '38px'}}>
          <div style={{fontFamily: FONT.sans, fontWeight: 800, fontSize: 26}}>
            WPL = Σ wᵢ·lᵢ
          </div>
          <div style={{color: COL.sub}}>45×1 + 12×3 + 13×3 + 16×3</div>
          <div style={{color: COL.sub}}>+ 5×4 + 9×4</div>
          <div>
            = <Hi c={A2}>224</Hi>（最小）
          </div>
        </Glass>
      </Cam>
      <Caption title="哈夫曼树" en="HUFFMAN TREE" desc="贪心合并最小权值 · 带权路径长度 WPL 最小 · 得到前缀编码" chip="WPL = 224" color={C} />
    </AbsoluteFill>
  );
};

export const DSHuffmanCues: Cue[] = [
  ...[0, 1, 2, 3, 4].flatMap((k): Cue[] => [
    [HUF_T(k), 'tick'],
    [HUF_T(k) + 30, 'blip', 67 + k * 3],
  ]),
  [720, 'whoosh'],
  [880, 'chime'],
];

export const _u = [Arrow, eOut];
