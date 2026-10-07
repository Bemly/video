import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Cell, Comet, GEdge, GNode, Glass, Hi, Txt} from '../../components/kit';
import {Cue, Problem, probCues} from '../../components/Problem';
import {useF} from '../../components/Shot';
import {Caption, Cam, GlowDefs, Pt} from '../../components/ui';
import {clamp01, COL, eBack, eInOut, eOut, FONT, lerp, prog, rgba} from '../../theme';

export * from './ds_b2';

const C = COL.ds;
const A2 = COL.co;

/* ====================================================================== */
/* BFS vs DFS                                                              */
/* ====================================================================== */

const BG_N: Record<number, Pt> = {
  1: [400, 60],
  2: [190, 200],
  3: [400, 200],
  4: [610, 200],
  5: [100, 360],
  6: [290, 360],
  7: [510, 360],
  8: [700, 360],
  9: [400, 500],
};
const BG_E: [number, number][] = [
  [1, 2],
  [1, 3],
  [1, 4],
  [2, 5],
  [2, 6],
  [3, 6],
  [3, 7],
  [4, 8],
  [6, 9],
  [7, 9],
  [8, 9],
];
const BFS_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const BFS_LEVEL: Record<number, number> = {1: 0, 2: 1, 3: 1, 4: 1, 5: 2, 6: 2, 7: 2, 8: 2, 9: 3};
const BFS_PARENT: Record<number, number> = {2: 1, 3: 1, 4: 1, 5: 2, 6: 2, 7: 3, 8: 4, 9: 6};
const DFS_ORDER = [1, 2, 5, 6, 3, 7, 9, 8, 4];
const DFS_PARENT: Record<number, number> = {2: 1, 5: 2, 6: 2, 3: 6, 7: 3, 9: 7, 8: 9, 4: 8};
// DFS walk including backtracking (for the trail)
const DFS_WALK = [1, 2, 5, 2, 6, 3, 7, 9, 8, 4];
const BT0 = 40;
const BSTEP = 48;

const GraphPanel: React.FC<{
  f: number;
  ox: number;
  oy: number;
  title: string;
  sub: string;
  color: string;
  order: number[];
  parent: Record<number, number>;
  mode: 'bfs' | 'dfs';
}> = ({f, ox, oy, title, sub, color, order, parent, mode}) => {
  const visitT = (n: number) => BT0 + order.indexOf(n) * BSTEP;
  const P = (n: number): Pt => [ox + BG_N[n][0], oy + BG_N[n][1]];
  const trailT = clamp01((f - BT0) / (BSTEP * (DFS_WALK.length - 1)));
  const trailPts = DFS_WALK.map(P);
  return (
    <g>
      <Txt x={ox + 400} y={oy - 70} size={34} weight={800}>
        {title}
      </Txt>
      <Txt x={ox + 400} y={oy - 32} size={22} color={color} family={FONT.sans} weight={500}>
        {sub}
      </Txt>
      {mode === 'bfs' &&
        [0, 1, 2, 3].map((lv) => {
          const t = clamp01((f - (BT0 + [0, 1, 4, 8][lv] * BSTEP)) / 50);
          if (t <= 0 || t >= 1) return null;
          const [x, y] = P(1);
          return <circle key={lv} cx={x} cy={y} r={40 + lv * 150 * eOut(t) + 20} fill="none" stroke={color} strokeWidth={3} opacity={(1 - t) * 0.8} />;
        })}
      {BG_E.map(([a, b], i) => {
        const tree = parent[b] === a || parent[a] === b;
        const child = parent[b] === a ? b : a;
        const on = tree && f >= visitT(child);
        return <GEdge key={i} a={P(a)} b={P(b)} t={prog(f, i * 2, 20)} color={on ? color : rgba('#8fb3c9', 0.3)} w={on ? 4.5 : 2.5} ra={30} rb={30} glow={on} />;
      })}
      {mode === 'dfs' && f > BT0 && (
        <g>
          {trailPts.slice(0, -1).map((p, i) => {
            const segT = clamp01(trailT * (DFS_WALK.length - 1) - i);
            if (segT <= 0) return null;
            const q = trailPts[i + 1];
            const back = DFS_WALK[i + 1] === 2 && i === 2;
            return (
              <line key={i} x1={p[0]} y1={p[1]} x2={lerp(p[0], q[0], segT)} y2={lerp(p[1], q[1], segT)} stroke={back ? COL.red : '#fff'} strokeWidth={back ? 3 : 2} strokeDasharray={back ? '6 6' : undefined} opacity={0.6} />
            );
          })}
        </g>
      )}
      {Object.keys(BG_N).map(Number).map((n) => {
        const vt = visitT(n);
        const vis = f >= vt;
        const [x, y] = P(n);
        return (
          <g key={n}>
            <GNode x={x} y={y} r={30} label={n} color={color} fill={vis ? 0.8 : 0} ring={vis && f - vt < 24 ? (f - vt) / 24 : 0} scale={eBack(clamp01((f - n * 3) / 16))} size={28} />
            {vis && (
              <g transform={`translate(${x + 30},${y - 30})`} opacity={prog(f, vt, 14)}>
                <circle r={15} fill="#fff" />
                <text y={1} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT.mono} fontSize={16} fontWeight={700} fill="#04101a">
                  {order.indexOf(n) + 1}
                </text>
              </g>
            )}
          </g>
        );
      })}
      {mode === 'bfs' && (
        <g>
          {[0, 1, 2, 3].map((lv) => (
            <Txt key={lv} x={ox - 30} y={oy + [60, 200, 360, 500][lv]} size={18} color={COL.dim} family={FONT.mono} opacity={prog(f, BT0 + [0, 1, 4, 8][lv] * BSTEP, 20)}>
              L{lv}
            </Txt>
          ))}
        </g>
      )}
      {/* container */}
      <Txt x={ox + 20} y={oy + 600} size={22} anchor="start" color={COL.sub}>
        {mode === 'bfs' ? '队列' : '栈'}
      </Txt>
      {(() => {
        const cur = order.filter((n) => f >= visitT(n));
        let items: number[] = [];
        if (mode === 'bfs') {
          // queue: visited but not yet expanded (expanded when its children start)
          const exp = (n: number) => {
            const kids = order.filter((k) => BFS_PARENT[k] === n);
            return kids.length ? visitT(kids[kids.length - 1]) : visitT(n) + BSTEP;
          };
          items = cur.filter((n) => f < exp(n));
        } else {
          const path: number[] = [];
          const walked = DFS_WALK.slice(0, Math.floor(trailT * (DFS_WALK.length - 1) + 1e-6) + 1);
          for (const n of walked) {
            const i = path.indexOf(n);
            if (i >= 0) path.splice(i + 1);
            else path.push(n);
          }
          items = f >= BT0 ? path : [];
        }
        return items.map((n, i) => <Cell key={n} x={ox + 90 + i * 60} y={oy + 578} w={52} h={46} text={n} color={color} fill={0.35} size={24} />);
      })()}
    </g>
  );
};

export const DSBfsDfs: React.FC = () => {
  const f = useF();
  return (
    <AbsoluteFill>
      <Cam to={1.03}>
        <svg width={1920} height={1080}>
          <GlowDefs />
          <GraphPanel f={f} ox={130} oy={240} title="广度优先 BFS" sub="一层一层向外扩散" color={C} order={BFS_ORDER} parent={BFS_PARENT} mode="bfs" />
          <GraphPanel f={f} ox={1000} oy={240} title="深度优先 DFS" sub="一路走到底，再回溯" color={A2} order={DFS_ORDER} parent={DFS_PARENT} mode="dfs" />
          <line x1={960} y1={200} x2={960} y2={860} stroke={rgba('#fff', 0.1)} strokeWidth={2} />
        </svg>
      </Cam>
      <Caption title="图的遍历" en="BFS · DFS" desc="广度优先用队列逐层扩散 · 深度优先用栈一路到底再回溯" chip="O(|V|+|E|)" color={C} />
    </AbsoluteFill>
  );
};

export const DSBfsDfsCues: Cue[] = [...BFS_ORDER.map((_, k): Cue => [BT0 + k * BSTEP, 'blip', 69 + k * 2]), ...[0, 1, 2, 3].map((lv): Cue => [BT0 + [0, 1, 4, 8][lv] * BSTEP, 'whoosh'])];

/* ====================================================================== */
/* Kruskal                                                                 */
/* ====================================================================== */

const KN: Pt[] = [
  [210, 540],
  [420, 320],
  [720, 320],
  [1020, 320],
  [1230, 540],
  [1020, 760],
  [720, 760],
  [420, 760],
  [570, 540],
];
const KE: [number, number, number][] = [
  [6, 7, 1],
  [2, 8, 2],
  [5, 6, 2],
  [0, 1, 4],
  [2, 5, 4],
  [6, 8, 6],
  [2, 3, 7],
  [7, 8, 7],
  [0, 7, 8],
  [1, 2, 8],
  [3, 4, 9],
  [4, 5, 10],
  [1, 7, 11],
  [3, 5, 14],
];
const kruskal = () => {
  const parent = KN.map((_, i) => i);
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  const res: {ok: boolean; comps: number[]}[] = [];
  let taken = 0;
  for (const [a, b] of KE) {
    if (taken === KN.length - 1) {
      res.push({ok: false, comps: KN.map((_, i) => find(i))});
      continue;
    }
    const ra = find(a);
    const rb = find(b);
    const ok = ra !== rb;
    if (ok) {
      parent[ra] = rb;
      taken++;
    }
    res.push({ok, comps: KN.map((_, i) => find(i))});
  }
  return res;
};
const KRES = kruskal();
const KT = (k: number) => 60 + k * 46;
const PAL = ['#22d3ee', '#fbbf24', '#a78bfa', '#34d399', '#fb7185', '#60a5fa', '#f472b6', '#facc15', '#2dd4bf'];

export const DSKruskal: React.FC = () => {
  const f = useF();
  const k = KE.reduce((acc, _, i) => (f >= KT(i) + 20 ? i : acc), -1);
  const comps = k >= 0 ? KRES[k].comps : KN.map((_, i) => i);
  const lastOk = KRES.reduce((acc, r, i) => (r.ok ? i : acc), 0);
  const done = f >= KT(lastOk) + 40;
  let total = 0;
  KE.forEach(([, , w], i) => {
    if (KRES[i].ok && f >= KT(i) + 20) total += w;
  });
  const colOf = (i: number) => (done ? C : PAL[comps[i] % PAL.length]);
  const allDone = f >= KT(10) + 60;

  return (
    <AbsoluteFill>
      <Cam to={1.03} ox={720}>
        <svg width={1920} height={1080}>
          <GlowDefs />
          {KE.map(([a, b, w], i) => {
            const act = f >= KT(i) && f < KT(i) + 46 && i <= 10;
            const res = f >= KT(i) + 20 ? KRES[i].ok : null;
            const color = res === true ? '#fff' : res === false && i <= 10 ? rgba(COL.red, 0.5) : act ? A2 : rgba('#8fb3c9', 0.3);
            return (
              <GEdge
                key={i}
                a={KN[a]}
                b={KN[b]}
                t={prog(f, i * 2, 20)}
                color={color}
                w={res ? 5 : act ? 5 : 2.5}
                ra={32}
                rb={32}
                label={w}
                glow={!!res || act}
                opacity={allDone && !res ? 0.35 : 1}
                dash={res === false && i <= 10 ? '8 8' : undefined}
              />
            );
          })}
          {KE.map(([a, b], i) => {
            if (KRES[i].ok || i > 10 || f < KT(i) + 20 || f > KT(i) + 60) return null;
            const m: Pt = [(KN[a][0] + KN[b][0]) / 2, (KN[a][1] + KN[b][1]) / 2];
            return (
              <g key={'x' + i} transform={`translate(${m[0]},${m[1] - 36}) scale(${eBack(clamp01((f - KT(i) - 20) / 14))})`}>
                <Txt x={0} y={0} size={26} weight={800} color={COL.red}>
                  成环 ✗
                </Txt>
              </g>
            );
          })}
          {KN.map((p, i) => (
            <GNode key={i} x={p[0]} y={p[1]} r={32} label={i} color={colOf(i)} fill={0.55} scale={eBack(clamp01((f - i * 3) / 18))} size={28} />
          ))}
        </svg>
        <Glass x={1400} y={170} w={400} color={C} opacity={prog(f, 20, 30)} style={{fontSize: 23, lineHeight: '42px', padding: '12px 22px'}}>
          <div style={{fontFamily: FONT.sans, color: COL.sub, fontSize: 21}}>边按权值升序</div>
          {KE.map(([a, b, w], i) => {
            const res = f >= KT(i) + 20 && i <= 10 ? KRES[i].ok : null;
            const act = f >= KT(i) && f < KT(i) + 46 && i <= 10;
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: res === true ? '#fff' : res === false ? COL.red : COL.sub,
                  background: act ? rgba(A2, 0.2) : undefined,
                  borderRadius: 6,
                  padding: '0 8px',
                  opacity: i > 10 && allDone ? 0.35 : 1,
                  lineHeight: '38px',
                }}
              >
                <span>
                  ({a},{b})
                </span>
                <span>{w}</span>
                <span style={{width: 24}}>{res === true ? '✓' : res === false ? '✗' : ''}</span>
              </div>
            );
          })}
        </Glass>
        <div
          style={{
            position: 'absolute',
            left: 1400,
            top: 850,
            fontFamily: FONT.tech,
            fontWeight: 700,
            fontSize: 44,
            color: '#fff',
            opacity: prog(f, 60, 20),
            textShadow: done ? `0 0 24px ${C}` : undefined,
          }}
        >
          总权值 = <span style={{color: done ? A2 : C}}>{total}</span>
        </div>
      </Cam>
      <Caption title="最小生成树" en="KRUSKAL" desc="边从小到大 · 不成环就选 · 并查集判断连通" chip="O(|E|log|E|)" color={C} />
    </AbsoluteFill>
  );
};

export const DSKruskalCues: Cue[] = [...KE.slice(0, 11).map((_, i): Cue => [KT(i) + 20, KRES[i].ok ? 'blip' : 'error', 72 + i]), [KT(10) + 60, 'chime']];

/* ====================================================================== */
/* 06 关键路径 AOE                                                         */
/* ====================================================================== */

const AV: Pt[] = [
  [170, 540],
  [480, 320],
  [480, 770],
  [800, 540],
  [830, 240],
  [1130, 540],
];
const AA: [number, number, number][] = [
  [0, 1, 3],
  [0, 2, 2],
  [1, 3, 2],
  [1, 4, 3],
  [2, 3, 4],
  [2, 5, 3],
  [3, 5, 2],
  [4, 5, 1],
];
const VE = [0, 3, 2, 6, 6, 8];
const VL = [0, 4, 2, 6, 7, 8];
const AOE = {
  card: 330,
  reveal: 1470,
  steps: [
    {at: 0, label: '正推 ve'},
    {at: 520, label: '逆推 vl'},
    {at: 1000, label: '求 l − e'},
    {at: 1360, label: '关键路径'},
  ],
};
const FT = (v: number) => 40 + v * 76;
const BT = (v: number) => 540 + (5 - v) * 76;
const ACT_T = (i: number) => 1020 + i * 40;

export const DSAoe: React.FC = () => (
  <Problem
    no={6}
    color={C}
    tag="数据结构 · 图"
    title="AOE 网的关键路径"
    q={[
      ['某工程的 AOE 网含事件 ', {t: 'v₁ ~ v₆', m: true}, ' 和活动 ', {t: 'a₁ ~ a₈', m: true}, '，边上权值为活动持续时间：'],
      [{t: 'a₁=<v₁,v₂>,3  a₂=<v₁,v₃>,2  a₃=<v₂,v₄>,2  a₄=<v₂,v₅>,3', m: true, c: '#dde6f6'}],
      [{t: 'a₅=<v₃,v₄>,4  a₆=<v₃,v₆>,3  a₇=<v₄,v₆>,2  a₈=<v₅,v₆>,1', m: true, c: '#dde6f6'}],
      ['该工程的', {t: '关键路径', c: A2}, '及最短完成时间是？'],
    ]}
    options={['v₁→v₂→v₄→v₆，长度 7', 'v₁→v₃→v₄→v₆，长度 8', 'v₁→v₂→v₅→v₆，长度 7', 'v₁→v₃→v₆，长度 5']}
    answer={1}
    brief="求 AOE 网的关键路径与工程最短完成时间"
    insight="关键活动 l(i) − e(i) = 0：a₂、a₅、a₇ —— 它们拖延一天，工期就拖延一天"
    card={360}
    reveal={AOE.reveal}
    steps={AOE.steps}
  >
    {(sf) => <AoeStage sf={sf} />}
  </Problem>
);

const AoeStage: React.FC<{sf: number}> = ({sf}) => {
  const crit = (i: number) => {
    const [a, b, w] = AA[i];
    return VL[b] - w - VE[a] === 0;
  };
  const critOn = prog(sf, 1360, 40);
  const path = [0, 2, 3, 5].map((v) => AV[v]);
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <GlowDefs />
        {AA.map(([a, b, w], i) => {
          const isC = crit(i) && sf >= ACT_T(i) + 20;
          const fw = sf >= FT(b) - 30 && sf < FT(b) + 20;
          const bw = sf >= BT(a) - 30 && sf < BT(a) + 20;
          return (
            <g key={i}>
              <GEdge a={AV[a]} b={AV[b]} t={prog(sf, i * 3, 24)} color={isC ? A2 : fw ? C : bw ? '#f0abfc' : rgba('#8fb3c9', 0.45)} w={isC ? 5 + critOn * 2 : 3} ra={36} rb={36} dir glow={isC || fw || bw} />
              {(() => {
                const m: Pt = [(AV[a][0] + AV[b][0]) / 2, (AV[a][1] + AV[b][1]) / 2];
                return (
                  <g opacity={prog(sf, 20 + i * 3, 20)}>
                    <rect x={m[0] - 44} y={m[1] - 17} width={88} height={32} rx={9} fill="#08121c" stroke={isC ? A2 : rgba('#8fb3c9', 0.35)} />
                    <text x={m[0]} y={m[1]} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT.mono} fontSize={19} fill={isC ? A2 : COL.sub}>
                      {`a${'₁₂₃₄₅₆₇₈'[i]}=${w}`}
                    </text>
                  </g>
                );
              })()}
            </g>
          );
        })}
        {AV.map((p, v) => {
          const fOn = sf >= FT(v);
          const bOn = sf >= BT(v);
          const onPath = [0, 2, 3, 5].includes(v) && critOn > 0;
          return (
            <g key={v}>
              <GNode x={p[0]} y={p[1]} r={36} label={`v${'₁₂₃₄₅₆'[v]}`} color={onPath ? A2 : C} scale={eBack(clamp01((sf - v * 4) / 18))} fill={fOn && sf - FT(v) < 20 ? 1 - (sf - FT(v)) / 20 : onPath ? 0.3 : 0} size={26} />
              <g transform={`translate(${p[0]},${p[1] - 64})`} opacity={prog(sf, FT(v), 16)}>
                <rect x={-46} y={-17} width={92} height={32} rx={9} fill={rgba(C, 0.18)} stroke={C} />
                <text textAnchor="middle" dominantBaseline="middle" y={1} fontFamily={FONT.mono} fontSize={19} fill="#fff">
                  ve={VE[v]}
                </text>
              </g>
              <g transform={`translate(${p[0]},${p[1] + 64})`} opacity={prog(sf, BT(v), 16)}>
                <rect x={-46} y={-17} width={92} height={32} rx={9} fill={rgba('#f0abfc', 0.18)} stroke="#f0abfc" />
                <text textAnchor="middle" dominantBaseline="middle" y={1} fontFamily={FONT.mono} fontSize={19} fill="#fff">
                  vl={VL[v]}
                </text>
              </g>
              {bOn && !fOn ? null : null}
            </g>
          );
        })}
        {critOn > 0 && <Comet pts={path} t={prog(sf, 1380, 70, eInOut)} color="#fff" r={13} />}
        <Txt x={650} y={900} size={26} color={COL.sub} opacity={prog(sf, 20, 30) * (1 - prog(sf, 1000, 30))}>
          {sf < 520 ? 've(k) = max{ ve(j) + w(j,k) } ：从源点正推，取最大' : 'vl(j) = min{ vl(k) − w(j,k) } ：从汇点逆推，取最小'}
        </Txt>
      </svg>
      <Glass x={1300} y={200} w={500} color={C} opacity={prog(sf, 1000, 30)} style={{fontSize: 24, lineHeight: '46px', padding: '12px 22px'}}>
        <div style={{display: 'flex', color: COL.sub, fontFamily: FONT.sans, fontSize: 21}}>
          <span style={{width: 90}}>活动</span>
          <span style={{width: 110}}>e = ve(j)</span>
          <span style={{width: 150}}>l = vl(k)−w</span>
          <span>l − e</span>
        </div>
        {AA.map(([a, b, w], i) => {
          const on = sf >= ACT_T(i);
          const e = VE[a];
          const l = VL[b] - w;
          const cz = l - e === 0;
          return (
            <div key={i} style={{display: 'flex', opacity: on ? 1 : 0.15, color: cz && on ? A2 : '#fff', background: cz && on ? rgba(A2, 0.14) : undefined, borderRadius: 6}}>
              <span style={{width: 90}}>a{'₁₂₃₄₅₆₇₈'[i]}</span>
              <span style={{width: 110}}>{e}</span>
              <span style={{width: 150}}>{l}</span>
              <span style={{fontWeight: 700}}>{l - e}</span>
            </div>
          );
        })}
      </Glass>
    </AbsoluteFill>
  );
};

export const DSAoeCues: Cue[] = probCues({card: 360, reveal: AOE.reveal, steps: AOE.steps}, [
  ...[0, 1, 2, 3, 4, 5].map((v): Cue => [FT(v), 'blip', 67 + v * 2]),
  ...[0, 1, 2, 3, 4, 5].map((v): Cue => [BT(v), 'blip', 79 - v * 2]),
  ...AA.map((_, i): Cue => [ACT_T(i), 'tick']),
  [1380, 'riser2'],
]);

/* ====================================================================== */
/* 折半查找 + 判定树                                                       */
/* ====================================================================== */

const BS = [7, 10, 13, 16, 19, 29, 32, 33, 37, 41, 43];
const BS_TREE: {i: number; d: number; p?: number}[] = [
  {i: 6, d: 0},
  {i: 3, d: 1, p: 6},
  {i: 9, d: 1, p: 6},
  {i: 1, d: 2, p: 3},
  {i: 4, d: 2, p: 3},
  {i: 7, d: 2, p: 9},
  {i: 10, d: 2, p: 9},
  {i: 2, d: 3, p: 1},
  {i: 5, d: 3, p: 4},
  {i: 8, d: 3, p: 7},
  {i: 11, d: 3, p: 10},
];

export const DSBsearch: React.FC = () => {
  const f = useF();
  const cx = (i: number) => 300 + (i - 1) * 120;
  // search 37: (1,11) mid 6 -> 29 < 37 -> low 7; (7,11) mid 9 -> 37 found
  const steps = [
    {lo: 1, hi: 11, mid: 6, t: 40},
    {lo: 7, hi: 11, mid: 9, t: 140},
  ];
  const s = steps.filter((x) => f >= x.t).pop();
  const found = f >= 200;
  const treeT = (d: number) => 300 + d * 70;
  const aslA = prog(f, 600, 40);
  return (
    <AbsoluteFill>
      <Cam to={1.03}>
        <svg width={1920} height={1080}>
          <GlowDefs />
          <Txt x={cx(6) + 50} y={180} size={26} color={COL.sub} opacity={prog(f, 10, 20) * (1 - prog(f, 280, 30))}>
            查找 key = 37
          </Txt>
          {BS.map((v, k) => {
            const i = k + 1;
            const inR = s ? i >= s.lo && i <= s.hi : true;
            const isMid = s && s.mid === i;
            const isFound = found && i === 9 && f < 300;
            return (
              <g key={i}>
                <Cell x={cx(i)} y={220} w={100} h={80} text={v} color={isFound ? COL.green : isMid ? A2 : C} fill={isFound ? 0.7 : isMid ? 0.5 : 0} dim={!inR && f < 300} size={34} glow={!!isMid || isFound} />
                <Txt x={cx(i) + 50} y={322} size={18} color={COL.dim} family={FONT.mono}>
                  {i}
                </Txt>
              </g>
            );
          })}
          {s && f < 300 && (
            <g>
              {[
                {l: 'low', i: s.lo, c: C},
                {l: 'mid', i: s.mid, c: A2},
                {l: 'high', i: s.hi, c: C},
              ].map((p) => (
                <Txt key={p.l} x={cx(p.i) + 50} y={p.l === 'mid' ? 352 : 352} size={22} family={FONT.mono} color={p.c} weight={700}>
                  {p.l}
                </Txt>
              ))}
            </g>
          )}
          {/* decision tree: each node sits right below its array cell */}
          {BS_TREE.map((n) => {
            if (n.p === undefined) return null;
            const p = BS_TREE.find((x) => x.i === n.p)!;
            return <GEdge key={'e' + n.i} a={[cx(p.i) + 50, 430 + p.d * 120]} b={[cx(n.i) + 50, 430 + n.d * 120]} t={prog(f, treeT(n.d), 30)} color={rgba(C, 0.6)} ra={30} rb={30} />;
          })}
          {BS_TREE.map((n) => (
            <g key={n.i}>
              <line x1={cx(n.i) + 50} y1={302} x2={cx(n.i) + 50} y2={430 + n.d * 120 - 30} stroke={rgba(C, 0.12)} strokeDasharray="3 6" opacity={prog(f, treeT(n.d), 20)} />
              <GNode x={cx(n.i) + 50} y={430 + n.d * 120} r={30} label={BS[n.i - 1]} color={[C, '#60a5fa', COL.os, A2][n.d]} scale={eBack(clamp01((f - treeT(n.d) - 10) / 20))} size={24} />
            </g>
          ))}
          {[0, 1, 2, 3].map((d) => (
            <Txt key={d} x={1630} y={430 + d * 120} size={22} anchor="start" color={[C, '#60a5fa', COL.os, A2][d]} family={FONT.mono} opacity={prog(f, treeT(d) + 20, 20)}>
              {`第${d + 1}层 · ${[1, 2, 4, 4][d]} 个 × ${d + 1} 次`}
            </Txt>
          ))}
        </svg>
        <div
          style={{
            position: 'absolute',
            right: 120,
            top: 880,
            fontFamily: FONT.tech,
            fontWeight: 700,
            fontSize: 40,
            color: '#fff',
            opacity: aslA,
            transform: `translateY(${(1 - aslA) * 20}px)`,
          }}
        >
          ASL<sub style={{fontSize: 24}}>成功</sub> = (1×1 + 2×2 + 3×4 + 4×4) / 11 = <span style={{color: A2}}>3</span>
        </div>
      </Cam>
      <Caption title="折半查找" en="BINARY SEARCH" desc="判定树的中序序列就是有序表 · 每层比较次数 = 层数" chip="O(log n)" color={C} />
    </AbsoluteFill>
  );
};

export const DSBsearchCues: Cue[] = [[40, 'blip', 72], [140, 'blip', 76], [200, 'chime'], ...[0, 1, 2, 3].map((d): Cue => [310 + d * 70, 'blip', 64 + d * 5]), [600, 'bell', 84]];

export const _u = [Hi, lerp];
