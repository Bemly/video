import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import {Cell, GEdge, GNode, Glass, Hi, Txt} from '../../components/kit';
import {Cue, Problem, probCues} from '../../components/Problem';
import {useF} from '../../components/Shot';
import {Caption, Cam, GlowDefs, Pt} from '../../components/ui';
import {clamp01, COL, eBack, eIn, eInOut, eOut, FONT, lerp, mixHex, prog, rgba, rnd} from '../../theme';

const C = COL.ds;
const A2 = COL.co;

/* ====================================================================== */
/* 07 散列表 · 线性探测 · ASL                                              */
/* ====================================================================== */

const HKEYS = [7, 8, 30, 11, 18, 9, 14];
const hashRun = () => {
  const table: (number | null)[] = new Array(10).fill(null);
  const res: {key: number; h: number; probes: number[]; t: number}[] = [];
  HKEYS.forEach((key, k) => {
    const h = (key * 3) % 7;
    const probes: number[] = [];
    let s = h;
    for (;;) {
      probes.push(s);
      if (table[s] === null) break;
      s = (s + 1) % 10;
    }
    table[s] = key;
    res.push({key, h, probes, t: 180 + k * 100});
  });
  return {res, table};
};
const HR = hashRun();
const HX = (s: number) => 260 + s * 140;
const HY = 330;
const UNS = [3, 2, 1, 2, 1, 5, 4];

const HASH = {
  card: 380,
  reveal: 1500,
  steps: [
    {at: 0, label: '由装填因子定表长'},
    {at: 170, label: '线性探测插入'},
    {at: 920, label: 'ASL 成功'},
    {at: 1180, label: 'ASL 不成功'},
  ],
};

export const DSHash: React.FC = () => (
  <Problem
    no={7}
    color={C}
    tag="数据结构 · 散列表"
    title="散列表的平均查找长度"
    q={[
      ['将关键字序列 ', {t: '(7, 8, 30, 11, 18, 9, 14)', m: true}, ' 散列存储到散列表中，'],
      ['散列表的存储空间是一个下标从 0 开始的一维数组，散列函数为 ', {t: 'H(key) = (key × 3) MOD 7', m: true}, '，'],
      ['处理冲突采用', {t: '线性探测再散列法', c: A2}, '，要求', {t: '装填因子为 0.7', c: A2}, '。'],
      ['分别计算', {t: '查找成功', c: A2}, '和', {t: '查找不成功', c: A2}, '时的平均查找长度。'],
    ]}
    brief="H(key) = 3·key mod 7，线性探测，α = 0.7：ASL 成功 / 不成功？"
    answerText="ASL 成功 = 12/7 · 不成功 = 18/7"
    insight="不成功时：从 H(key) 起一直比较到第一个空单元（空单元也算一次）"
    {...HASH}
  >
    {(sf) => <HashStage sf={sf} />}
  </Problem>
);

const HashStage: React.FC<{sf: number}> = ({sf}) => {
  const tableA = prog(sf, 90, 40);
  const occ = (s: number) => HR.res.find((r) => r.probes[r.probes.length - 1] === s && sf >= r.t + 30 + (r.probes.length - 1) * 24);
  const curK = HR.res.filter((r) => sf >= r.t - 10).pop();
  const succA = prog(sf, 940, 30);
  const unsA = prog(sf, 1180, 30);
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <GlowDefs />
        {/* table length */}
        <g opacity={prog(sf, 10, 30) * (1 - prog(sf, 150, 30))}>
          <Txt x={960} y={230} size={44} weight={700} family={FONT.tech}>
            α = n / m = 7 / m = 0.7　⇒　m = 10
          </Txt>
        </g>
        {/* key queue */}
        <g opacity={prog(sf, 150, 20)}>
          {HKEYS.map((k, i) => {
            const r = HR.res[i];
            const used = sf >= r.t;
            return <Cell key={i} x={560 + i * 90} y={196} w={76} h={56} text={k} color={C} dim={used} opacity={used ? 0.3 : 1} size={28} />;
          })}
        </g>
        {curK && sf < curK.t + 100 && sf < 900 && (
          <Txt x={1460} y={224} size={30} weight={700} color={A2} family={FONT.mono} opacity={prog(sf, curK.t - 10, 14)}>
            {`H(${curK.key}) = ${curK.key * 3} mod 7 = ${curK.h}`}
          </Txt>
        )}
        {/* table */}
        {new Array(10).fill(0).map((_, s) => {
          const o = occ(s);
          const bump = HR.res.some((r) => r.probes.slice(0, -1).includes(s) && sf >= r.t + 30 + r.probes.indexOf(s) * 24 && sf < r.t + 30 + r.probes.indexOf(s) * 24 + 14);
          return (
            <g key={s} opacity={tableA}>
              <Txt x={HX(s) + 60} y={HY - 22} size={20} color={COL.dim} family={FONT.mono}>
                {s}
              </Txt>
              <Cell x={HX(s)} y={HY} w={120} h={90} text={o ? o.key : ''} color={bump ? COL.red : C} fill={o ? 0.3 : bump ? 0.4 : 0} size={38} glow={bump} />
              {o && (
                <g opacity={prog(sf, o.t + 30 + (o.probes.length - 1) * 24, 16)}>
                  <circle cx={HX(s) + 60} cy={HY + 122} r={20} fill={o.probes.length > 1 ? A2 : rgba(C, 0.3)} />
                  <text x={HX(s) + 60} y={HY + 123} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT.mono} fontWeight={700} fontSize={20} fill={o.probes.length > 1 ? '#1a1000' : '#fff'}>
                    {o.probes.length}
                  </text>
                </g>
              )}
            </g>
          );
        })}
        <Txt x={HX(0) - 30} y={HY + 122} size={20} color={COL.sub} anchor="end" opacity={prog(sf, 200, 20)}>
          比较次数
        </Txt>
        {/* moving key token */}
        {HR.res.map((r, i) => {
          const t0 = r.t;
          if (sf < t0 || sf > t0 + 30 + (r.probes.length - 1) * 24 + 16) return null;
          const a = clamp01((sf - t0) / 30);
          let x = lerp(560 + i * 90 + 38, HX(r.probes[0]) + 60, eInOut(a));
          let y = lerp(224, HY - 70, eInOut(a));
          if (a >= 1) {
            const pk = Math.min(r.probes.length - 1, Math.floor((sf - t0 - 30) / 24));
            const loc = clamp01((sf - t0 - 30 - pk * 24) / 24);
            const from = r.probes[pk];
            const to = r.probes[Math.min(r.probes.length - 1, pk + 1)];
            if (pk < r.probes.length - 1) {
              x = lerp(HX(from) + 60, HX(to) + 60, eInOut(loc));
              y = HY - 70 - Math.sin(loc * Math.PI) * 50;
            } else {
              x = HX(from) + 60;
              y = lerp(HY - 70, HY + 45, eIn(clamp01((sf - t0 - 30 - pk * 24) / 16)));
            }
          }
          return (
            <g key={i} transform={`translate(${x},${y})`}>
              <circle r={34} fill={A2} filter="url(#g-m)" />
              <text y={1} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT.tech} fontWeight={700} fontSize={30} fill="#1a1000">
                {r.key}
              </text>
            </g>
          );
        })}
        {/* unsuccessful scans */}
        {unsA > 0 &&
          UNS.map((len, h) => {
            const y = 600 + h * 36;
            const t = prog(sf, 1200 + h * 26, 30, eOut);
            return (
              <g key={h}>
                <Txt x={HX(0) - 30} y={y} size={20} anchor="end" family={FONT.mono} color={COL.sub} opacity={unsA}>
                  {`H=${h}`}
                </Txt>
                <rect x={HX(h) + 10} y={y - 12} width={Math.max(0, (len * 140 - 20) * t)} height={24} rx={12} fill={rgba(mixHex(C, COL.os, h / 6), 0.55)} />
                <circle cx={HX(h) + 10 + (len * 140 - 20) * t} cy={y} r={7} fill="#fff" opacity={t > 0 ? 1 : 0} />
                <Txt x={HX(h) + len * 140 + 20} y={y} size={20} anchor="start" family={FONT.mono} color="#fff" opacity={t}>
                  {len}
                </Txt>
              </g>
            );
          })}
      </svg>
      <div style={{position: 'absolute', left: 260, top: 510, fontFamily: FONT.tech, fontWeight: 700, fontSize: 38, color: '#fff', opacity: succA * (1 - unsA * 0.5)}}>
        ASL<sub style={{fontSize: 22}}>成功</sub> = (1 + 1 + 1 + 1 + 3 + 3 + 2) / 7 = <span style={{color: A2}}>12/7</span>
      </div>
      <div style={{position: 'absolute', left: 260, top: 868, fontFamily: FONT.tech, fontWeight: 700, fontSize: 38, color: '#fff', opacity: prog(sf, 1400, 30)}}>
        ASL<sub style={{fontSize: 22}}>不成功</sub> = (3 + 2 + 1 + 2 + 1 + 5 + 4) / 7 = <span style={{color: A2}}>18/7</span>
      </div>
    </AbsoluteFill>
  );
};

export const DSHashCues: Cue[] = probCues(HASH, [
  ...HR.res.flatMap((r): Cue[] => [
    [r.t, 'whoosh'],
    ...r.probes.slice(0, -1).map((_, i): Cue => [r.t + 30 + i * 24, 'error']),
    [r.t + 30 + (r.probes.length - 1) * 24 + 16, 'blip', 72 + r.probes.length * 3],
  ]),
  [940, 'chime'],
  ...UNS.map((_, h): Cue => [1200 + h * 26, 'tick']),
  [1400, 'chime'],
]);

/* ====================================================================== */
/* 08 B 树插入与分裂                                                       */
/* ====================================================================== */

type BNode = {keys: number[]; x: number; y: number; p?: number; red?: boolean};
const BSTATES: {t: number; nodes: BNode[]; note: string}[] = [
  {t: 20, nodes: [{keys: [10], x: 960, y: 300}], note: '插入 10'},
  {t: 80, nodes: [{keys: [10, 20], x: 960, y: 300}], note: '插入 20'},
  {t: 140, nodes: [{keys: [10, 20, 30], x: 960, y: 300, red: true}], note: '插入 30：结点有 3 个关键字 > m − 1 = 2，溢出！'},
  {
    t: 210,
    nodes: [
      {keys: [20], x: 960, y: 300},
      {keys: [10], x: 760, y: 480, p: 0},
      {keys: [30], x: 1160, y: 480, p: 0},
    ],
    note: '分裂：中间关键字 20 上升为新根',
  },
  {
    t: 290,
    nodes: [
      {keys: [20], x: 960, y: 300},
      {keys: [10], x: 760, y: 480, p: 0},
      {keys: [30, 40], x: 1160, y: 480, p: 0},
    ],
    note: '插入 40',
  },
  {
    t: 350,
    nodes: [
      {keys: [20], x: 960, y: 300},
      {keys: [10], x: 760, y: 480, p: 0},
      {keys: [30, 40, 50], x: 1160, y: 480, p: 0, red: true},
    ],
    note: '插入 50：叶结点溢出',
  },
  {
    t: 420,
    nodes: [
      {keys: [20, 40], x: 960, y: 300},
      {keys: [10], x: 640, y: 480, p: 0},
      {keys: [30], x: 960, y: 480, p: 0},
      {keys: [50], x: 1280, y: 480, p: 0},
    ],
    note: '40 上升到父结点，叶子一分为二',
  },
  {
    t: 500,
    nodes: [
      {keys: [20, 40], x: 960, y: 300},
      {keys: [10], x: 640, y: 480, p: 0},
      {keys: [30], x: 960, y: 480, p: 0},
      {keys: [50, 60], x: 1280, y: 480, p: 0},
    ],
    note: '插入 60',
  },
  {
    t: 560,
    nodes: [
      {keys: [20, 40], x: 960, y: 300},
      {keys: [10], x: 640, y: 480, p: 0},
      {keys: [30], x: 960, y: 480, p: 0},
      {keys: [50, 60, 70], x: 1280, y: 480, p: 0, red: true},
    ],
    note: '插入 70：叶结点溢出',
  },
  {
    t: 630,
    nodes: [
      {keys: [20, 40, 60], x: 960, y: 300, red: true},
      {keys: [10], x: 520, y: 480, p: 0},
      {keys: [30], x: 800, y: 480, p: 0},
      {keys: [50], x: 1120, y: 480, p: 0},
      {keys: [70], x: 1400, y: 480, p: 0},
    ],
    note: '60 上升 —— 根结点也溢出了！',
  },
  {
    t: 720,
    nodes: [
      {keys: [40], x: 960, y: 270},
      {keys: [20], x: 660, y: 440, p: 0},
      {keys: [60], x: 1260, y: 440, p: 0},
      {keys: [10], x: 510, y: 620, p: 1},
      {keys: [30], x: 810, y: 620, p: 1},
      {keys: [50], x: 1110, y: 620, p: 2},
      {keys: [70], x: 1410, y: 620, p: 2},
    ],
    note: '根分裂：40 成为新根，树长高一层',
  },
];
const KW = 70;
const keyPos = (st: {nodes: BNode[]}, key: number): Pt | null => {
  for (const n of st.nodes) {
    const i = n.keys.indexOf(key);
    if (i >= 0) return [n.x + (i - (n.keys.length - 1) / 2) * KW, n.y];
  }
  return null;
};
const BTREE = {
  card: 330,
  reveal: 830,
  steps: [
    {at: 0, label: '插入'},
    {at: 140, label: '溢出'},
    {at: 210, label: '分裂上升'},
    {at: 720, label: '长高'},
  ],
};

export const DSBtree: React.FC = () => (
  <Problem
    no={8}
    color={C}
    tag="数据结构 · B 树"
    title="B 树的插入与分裂"
    q={[
      ['在一棵初始为空的 ', {t: '3 阶 B 树', c: A2}, ' 中依次插入关键字 ', {t: '10, 20, 30, 40, 50, 60, 70', m: true}, '，'],
      ['插入完成后，B 树的', {t: '高度', c: A2}, '与', {t: '根结点中的关键字', c: A2}, '分别是？'],
    ]}
    options={['高度 2，根为 {20, 40}', '高度 3，根为 {40}', '高度 3，根为 {30}', '高度 2，根为 {40, 60}']}
    answer={1}
    brief="3 阶 B 树依次插入 10~70：高度与根结点？"
    insight="m 阶 B 树结点至多 m − 1 个关键字；溢出就把中间关键字上移，只有根分裂才会让树长高"
    {...BTREE}
  >
    {(sf) => <BtreeStage sf={sf} />}
  </Problem>
);

const BtreeStage: React.FC<{sf: number}> = ({sf}) => {
  const si = BSTATES.reduce((acc, s, i) => (sf >= s.t ? i : acc), 0);
  const st = BSTATES[si];
  const prev = BSTATES[Math.max(0, si - 1)];
  const tt = eInOut(clamp01((sf - st.t) / 40));
  const allKeys = st.nodes.flatMap((n) => n.keys);
  const final = sf >= 800;
  const boxes = (s: {nodes: BNode[]}, a: number, key: string) =>
    s.nodes.map((n, i) => {
      const w = n.keys.length * KW + 26;
      const parent = n.p !== undefined ? s.nodes[n.p] : null;
      return (
        <g key={key + i} opacity={a}>
          {parent && <GEdge a={[parent.x, parent.y + 34]} b={[n.x, n.y - 34]} ra={0} rb={0} color={rgba(C, 0.6)} />}
          <rect x={n.x - w / 2} y={n.y - 34} width={w} height={68} rx={14} fill={n.red ? rgba(COL.red, 0.2) : 'rgba(6,14,24,0.9)'} stroke={n.red ? COL.red : final && i === 0 ? A2 : C} strokeWidth={n.red || (final && i === 0) ? 3.5 : 2.5} filter="url(#g-s)" />
          {n.keys.slice(1).map((_, j) => (
            <line key={j} x1={n.x - w / 2 + 13 + (j + 1) * KW} y1={n.y - 26} x2={n.x - w / 2 + 13 + (j + 1) * KW} y2={n.y + 26} stroke={rgba(C, 0.35)} />
          ))}
        </g>
      );
    });
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <GlowDefs />
        {si > 0 && tt < 1 && boxes(prev, 1 - tt, 'p')}
        {boxes(st, si === 0 ? prog(sf, 20, 16) : tt, 'c')}
        {allKeys.map((k) => {
          const b = keyPos(st, k)!;
          const a = keyPos(prev, k);
          let p: Pt = b;
          let op = 1;
          if (!a || si === 0) {
            p = [b[0], lerp(b[1] - 160, b[1], eOut(clamp01((sf - st.t) / 26)))];
            op = clamp01((sf - st.t) / 10);
          } else {
            p = [lerp(a[0], b[0], tt), lerp(a[1], b[1], tt) - Math.sin(tt * Math.PI) * (a[1] !== b[1] ? 30 : 0)];
          }
          const up = a && b[1] < a[1] - 20 && tt < 1;
          return (
            <g key={k} transform={`translate(${p[0]},${p[1]})`} opacity={op}>
              {up && <circle r={36} fill={A2} opacity={0.35} filter="url(#g-m)" />}
              <text textAnchor="middle" dominantBaseline="middle" y={2} fontFamily={FONT.tech} fontWeight={700} fontSize={34} fill={up ? A2 : '#fff'}>
                {k}
              </text>
            </g>
          );
        })}
        <Txt x={960} y={820} size={32} weight={700} color={st.nodes.some((n) => n.red) ? COL.red : '#fff'} opacity={prog(sf, st.t, 16)}>
          {st.note}
        </Txt>
        {final && (
          <g opacity={prog(sf, 800, 30)}>
            <path d="M1560,270 L1590,270 L1590,620 L1560,620" fill="none" stroke={A2} strokeWidth={3} />
            <Txt x={1610} y={445} size={32} weight={800} color={A2} anchor="start">
              高度 3
            </Txt>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};

export const DSBtreeCues: Cue[] = probCues(BTREE, BSTATES.map((s): Cue => [s.t, s.nodes.some((n) => n.red) ? 'error' : s.note.startsWith('插入') ? 'blip' : 'whoosh', 72]));

/* ====================================================================== */
/* 排序大比拼                                                              */
/* ====================================================================== */

type SF = {arr: number[]; hi: number[]; sw: number[]};
const recordSorts = () => {
  const n = 20;
  const base = Array.from({length: n}, (_, i) => i + 1);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rnd(i * 7.1 + 3) * (i + 1));
    [base[i], base[j]] = [base[j], base[i]];
  }
  const run = (fn: (a: number[], cmp: (i: number, j: number) => void, sw: (i: number, j: number) => void, wr: (i: number, v: number) => void) => void) => {
    const a = [...base];
    const out: SF[] = [{arr: [...a], hi: [], sw: []}];
    const cmp = (i: number, j: number) => out.push({arr: [...a], hi: [i, j], sw: []});
    const sw = (i: number, j: number) => {
      [a[i], a[j]] = [a[j], a[i]];
      out.push({arr: [...a], hi: [], sw: [i, j]});
    };
    const wr = (i: number, v: number) => {
      a[i] = v;
      out.push({arr: [...a], hi: [], sw: [i]});
    };
    fn(a, cmp, sw, wr);
    out.push({arr: [...a], hi: [], sw: []});
    return out;
  };
  const insertion = run((a, cmp, sw) => {
    for (let i = 1; i < a.length; i++)
      for (let j = i; j > 0; j--) {
        cmp(j - 1, j);
        if (a[j - 1] > a[j]) sw(j - 1, j);
        else break;
      }
  });
  const shell = run((a, cmp, sw) => {
    for (let g = Math.floor(a.length / 2); g > 0; g = Math.floor(g / 2))
      for (let i = g; i < a.length; i++)
        for (let j = i; j >= g; j -= g) {
          cmp(j - g, j);
          if (a[j - g] > a[j]) sw(j - g, j);
          else break;
        }
  });
  const bubble = run((a, cmp, sw) => {
    for (let i = 0; i < a.length - 1; i++) {
      let any = false;
      for (let j = 0; j < a.length - 1 - i; j++) {
        cmp(j, j + 1);
        if (a[j] > a[j + 1]) {
          sw(j, j + 1);
          any = true;
        }
      }
      if (!any) break;
    }
  });
  const quick = run((a, cmp, sw) => {
    const qs = (lo: number, hi: number) => {
      if (lo >= hi) return;
      let i = lo;
      for (let j = lo; j < hi; j++) {
        cmp(j, hi);
        if (a[j] < a[hi]) {
          if (i !== j) sw(i, j);
          i++;
        }
      }
      if (i !== hi) sw(i, hi);
      qs(lo, i - 1);
      qs(i + 1, hi);
    };
    qs(0, a.length - 1);
  });
  const heap = run((a, cmp, sw) => {
    const sift = (i: number, n: number) => {
      for (;;) {
        let m = i;
        const l = 2 * i + 1;
        const r = l + 1;
        if (l < n) {
          cmp(l, m);
          if (a[l] > a[m]) m = l;
        }
        if (r < n) {
          cmp(r, m);
          if (a[r] > a[m]) m = r;
        }
        if (m === i) return;
        sw(i, m);
        i = m;
      }
    };
    for (let i = Math.floor(a.length / 2) - 1; i >= 0; i--) sift(i, a.length);
    for (let e = a.length - 1; e > 0; e--) {
      sw(0, e);
      sift(0, e);
    }
  });
  const merge = run((a, cmp, _sw, wr) => {
    const ms = (lo: number, hi: number) => {
      if (hi - lo < 1) return;
      const mid = Math.floor((lo + hi) / 2);
      ms(lo, mid);
      ms(mid + 1, hi);
      const tmp: number[] = [];
      let i = lo;
      let j = mid + 1;
      while (i <= mid && j <= hi) {
        cmp(i, j);
        tmp.push(a[i] <= a[j] ? a[i++] : a[j++]);
      }
      while (i <= mid) tmp.push(a[i++]);
      while (j <= hi) tmp.push(a[j++]);
      tmp.forEach((v, k) => wr(lo + k, v));
    };
    ms(0, a.length - 1);
  });
  return [
    {name: '直接插入', rec: insertion},
    {name: '希尔排序', rec: shell},
    {name: '冒泡排序', rec: bubble},
    {name: '快速排序', rec: quick},
    {name: '堆排序', rec: heap},
    {name: '归并排序', rec: merge},
  ];
};
const RACE_T0 = 40;
const RACE_RATE = 0.62;

export const DSRace: React.FC = () => {
  const f = useF();
  const sorts = useMemo(recordSorts, []);
  const ranks = [...sorts].map((s, i) => ({i, n: s.rec.length})).sort((a, b) => a.n - b.n);
  const table = prog(f, 760, 40);
  return (
    <AbsoluteFill>
      <Cam to={1.02}>
        <svg width={1920} height={1080} style={{filter: table > 0 ? `blur(${table * 3}px)` : undefined, opacity: 1 - table * 0.55}}>
          <GlowDefs />
          {sorts.map((s, si) => {
            const col = si % 3;
            const row = Math.floor(si / 3);
            const ox = 110 + col * 580;
            const oy = 200 + row * 350;
            const stepF = Math.max(0, (f - RACE_T0) * RACE_RATE);
            const k = Math.min(s.rec.length - 1, Math.floor(stepF));
            const fr = s.rec[k];
            const done = k >= s.rec.length - 1;
            const doneAt = RACE_T0 + (s.rec.length - 1) / RACE_RATE;
            const rank = ranks.findIndex((r) => r.i === si) + 1;
            return (
              <g key={si} opacity={prog(f, si * 5, 20)}>
                <rect x={ox - 14} y={oy - 58} width={548} height={320} rx={16} fill="rgba(6,12,24,0.6)" stroke={done ? A2 : rgba(C, 0.3)} strokeWidth={done ? 2.5 : 1.5} />
                <Txt x={ox} y={oy - 30} size={28} weight={800} anchor="start">
                  {s.name}
                </Txt>
                <Txt x={ox + 520} y={oy - 30} size={22} anchor="end" family={FONT.mono} color={COL.sub}>
                  {`${Math.min(k, s.rec.length - 1)} 步`}
                </Txt>
                {fr.arr.map((v, i) => {
                  const h = 12 + v * 11;
                  const isHi = !done && fr.hi.includes(i);
                  const isSw = !done && fr.sw.includes(i);
                  const color = isSw ? A2 : isHi ? '#ffffff' : done ? mixHex(C, '#a7f3d0', v / 20) : mixHex('#2563eb', C, v / 20);
                  return <rect key={i} x={ox + i * 26} y={oy + 240 - h} width={20} height={h} rx={4} fill={color} opacity={done || isHi || isSw ? 1 : 0.75} />;
                })}
                {done && (
                  <g transform={`translate(${ox + 470},${oy + 30}) scale(${eBack(clamp01((f - doneAt) / 16))})`}>
                    <circle r={30} fill={rank === 1 ? A2 : rgba(C, 0.3)} stroke={rank === 1 ? A2 : C} strokeWidth={2} />
                    <text y={2} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT.hero} fontWeight={800} fontSize={24} fill={rank === 1 ? '#1a1000' : '#fff'}>
                      #{rank}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
        {table > 0 && (
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
            <div
              style={{
                padding: '26px 44px',
                borderRadius: 22,
                background: 'rgba(8,13,26,0.92)',
                border: `1.5px solid ${rgba(C, 0.5)}`,
                boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 40px ${rgba(C, 0.2)}`,
                opacity: table,
                transform: `scale(${lerp(0.92, 1, table)})`,
                fontFamily: FONT.sans,
                fontSize: 28,
                color: '#fff',
              }}
            >
              {[
                ['算法', '平均时间', '最坏时间', '辅助空间', '稳定性'],
                ['直接插入', 'O(n²)', 'O(n²)', 'O(1)', '稳定'],
                ['希尔排序', '≈ O(n¹·³)', 'O(n²)', 'O(1)', '不稳定'],
                ['冒泡排序', 'O(n²)', 'O(n²)', 'O(1)', '稳定'],
                ['快速排序', 'O(n log n)', 'O(n²)', 'O(log n)', '不稳定'],
                ['堆排序', 'O(n log n)', 'O(n log n)', 'O(1)', '不稳定'],
                ['归并排序', 'O(n log n)', 'O(n log n)', 'O(n)', '稳定'],
              ].map((row, r) => (
                <div
                  key={r}
                  style={{
                    display: 'flex',
                    lineHeight: '58px',
                    color: r === 0 ? COL.sub : '#fff',
                    fontSize: r === 0 ? 22 : 28,
                    borderBottom: r === 0 ? `1px solid ${rgba(C, 0.3)}` : undefined,
                    opacity: prog(f, 780 + r * 12, 20),
                  }}
                >
                  {row.map((c, j) => (
                    <span
                      key={j}
                      style={{
                        width: j === 0 ? 200 : 210,
                        fontFamily: j === 0 || r === 0 || j === 4 ? FONT.sans : FONT.mono,
                        fontWeight: j === 0 ? 800 : 500,
                        color: j === 4 && c === '不稳定' ? COL.red : j === 4 && r > 0 ? COL.green : undefined,
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              ))}
              <div style={{marginTop: 16, fontSize: 26, color: COL.sub, opacity: prog(f, 900, 30)}}>
                口诀：不稳定的——<Hi c={A2}>快</Hi>（快速）<Hi c={A2}>些</Hi>（希尔）<Hi c={A2}>选</Hi>（简单选择）<Hi c={A2}>一堆</Hi>（堆）
              </div>
            </div>
          </AbsoluteFill>
        )}
      </Cam>
      <Caption title="排序大比拼" en="SORTING RACE" desc="同一组数据、六种算法同时开跑：谁更快？谁稳定？" chip="n = 20" color={C} />
    </AbsoluteFill>
  );
};

export const DSRaceCues: Cue[] = (() => {
  const sorts = recordSorts();
  return [[RACE_T0, 'riser2'] as Cue, ...sorts.map((s, i): Cue => [Math.round(RACE_T0 + (s.rec.length - 1) / RACE_RATE), 'blip', 72 + i * 3]), [760, 'whoosh'], [900, 'chime']];
})();

/* ====================================================================== */
/* 堆排序                                                                  */
/* ====================================================================== */

type HOp = {type: 'cmp' | 'swap' | 'fix'; i: number; j: number; phase: 0 | 1};
const HEAP0 = [53, 17, 78, 9, 45, 65, 87, 32];
const heapOps = () => {
  const a = [...HEAP0];
  const ops: HOp[] = [];
  const sift = (i: number, n: number, phase: 0 | 1) => {
    for (;;) {
      const l = 2 * i + 1;
      const r = l + 1;
      let m = i;
      if (l < n && a[l] > a[m]) m = l;
      if (r < n && a[r] > a[m]) m = r;
      if (l < n) ops.push({type: 'cmp', i, j: r < n ? r : l, phase});
      if (m === i) return;
      ops.push({type: 'swap', i, j: m, phase});
      [a[i], a[m]] = [a[m], a[i]];
      i = m;
    }
  };
  for (let i = Math.floor(a.length / 2) - 1; i >= 0; i--) sift(i, a.length, 0);
  for (let e = a.length - 1; e > 0; e--) {
    ops.push({type: 'swap', i: 0, j: e, phase: 1});
    [a[0], a[e]] = [a[e], a[0]];
    ops.push({type: 'fix', i: e, j: e, phase: 1});
    sift(0, e, 1);
  }
  ops.push({type: 'fix', i: 0, j: 0, phase: 1});
  const dur = (o: HOp) => (o.type === 'cmp' ? 12 : o.type === 'swap' ? 26 : 14);
  let t = 60;
  const timed = ops.map((o) => {
    const s = t;
    t += dur(o);
    return {...o, t: s, d: dur(o)};
  });
  return {ops: timed, end: t};
};
const HOPS = heapOps();
const hPos = (i: number): Pt => {
  const lv = Math.floor(Math.log2(i + 1));
  const idx = i + 1 - Math.pow(2, lv);
  const span = 1360 / Math.pow(2, lv);
  return [280 + span * (idx + 0.5), 230 + lv * 125];
};
const aPos = (i: number): Pt => [560 + i * 100 + 44, 800];

export const DSHeap: React.FC = () => {
  const f = useF();
  const arr = [...HEAP0];
  let fixed = new Set<number>();
  let cur: (HOp & {t: number; d: number}) | null = null;
  for (const o of HOPS.ops) {
    if (f < o.t) break;
    if (f < o.t + o.d) {
      cur = o;
      break;
    }
    if (o.type === 'swap') [arr[o.i], arr[o.j]] = [arr[o.j], arr[o.i]];
    if (o.type === 'fix') fixed = new Set([...fixed, o.i]);
  }
  const heapSize = 8 - fixed.size;
  const pt = cur && cur.type === 'swap' ? eInOut(clamp01((f - cur.t) / cur.d)) : 0;
  const posOfIndex = (i: number, which: 'tree' | 'arr') => (which === 'tree' ? hPos(i) : aPos(i));
  const phase = cur ? cur.phase : f < 60 ? 0 : 1;
  const done = f >= HOPS.end;
  return (
    <AbsoluteFill>
      <Cam to={1.03}>
        <svg width={1920} height={1080}>
          <GlowDefs />
          {HEAP0.map((_, i) => {
            if (i === 0) return null;
            const p = Math.floor((i - 1) / 2);
            const inHeap = i < heapSize;
            return <GEdge key={i} a={hPos(p)} b={hPos(i)} ra={36} rb={36} color={inHeap ? rgba(C, 0.6) : rgba('#fff', 0.08)} t={prog(f, i * 3, 20)} />;
          })}
          {arr.map((v, i) => {
            let j = i;
            let t = 0;
            if (cur && cur.type === 'swap' && (i === cur.i || i === cur.j)) {
              j = i === cur.i ? cur.j : cur.i;
              t = pt;
            }
            const tp: Pt = [lerp(hPos(i)[0], hPos(j)[0], t), lerp(hPos(i)[1], hPos(j)[1], t)];
            const ap: Pt = [lerp(aPos(i)[0], aPos(j)[0], t), lerp(aPos(i)[1], aPos(j)[1], t) - Math.sin(t * Math.PI) * 40];
            const isFixed = fixed.has(i);
            const cmpHi = cur && cur.type === 'cmp' && (i === cur.i || i === cur.j || i === 2 * cur.i + 1);
            const swHi = cur && cur.type === 'swap' && (i === cur.i || i === cur.j);
            const color = isFixed || done ? A2 : swHi ? A2 : cmpHi ? '#fff' : C;
            return (
              <g key={v}>
                <GNode x={tp[0]} y={tp[1]} r={38} label={v} color={color} fill={swHi ? 0.6 : 0} opacity={isFixed ? 0.25 : 1} scale={eBack(clamp01((f - i * 4) / 18))} size={30} />
                <Cell x={ap[0] - 44} y={ap[1] - 40} w={88} h={80} text={v} color={color} fill={isFixed || done ? 0.5 : swHi ? 0.4 : 0} size={34} glow={!!swHi} />
              </g>
            );
          })}
          {HEAP0.map((_, i) => (
            <Txt key={i} x={aPos(i)[0]} y={aPos(i)[1] + 62} size={18} color={COL.dim} family={FONT.mono}>
              {i + 1}
            </Txt>
          ))}
          <Txt x={960} y={700} size={28} weight={700} color={phase === 0 ? C : A2} opacity={prog(f, 40, 20)}>
            {done ? '有序序列：9 17 32 45 53 65 78 87' : phase === 0 ? '① 建大根堆：从最后一个非叶结点 ⌊n/2⌋ 开始，自下而上逐个"下沉"' : '② 堆顶（最大值）与末尾交换，堆规模减一，再对新堆顶下沉调整'}
          </Txt>
        </svg>
      </Cam>
      <Caption title="堆排序" en="HEAP SORT" desc="完全二叉树 ⇔ 数组：结点 i 的孩子是 2i 与 2i+1" chip="O(n log n)" color={C} />
    </AbsoluteFill>
  );
};

export const DSHeapCues: Cue[] = HOPS.ops.filter((o) => o.type !== 'cmp').map((o): Cue => [o.t, o.type === 'swap' ? 'tick' : 'blip', 84 - o.i * 2]);

/* ====================================================================== */
/* 归并排序                                                                */
/* ====================================================================== */

const MA = [38, 27, 43, 3, 9, 82, 10, 19];
const MROWS: {y: number; g: number; order: number[]; t: number; merge: boolean}[] = [
  {y: 200, g: 8, order: MA, t: 0, merge: false},
  {y: 300, g: 4, order: MA, t: 50, merge: false},
  {y: 400, g: 2, order: MA, t: 110, merge: false},
  {y: 500, g: 1, order: MA, t: 170, merge: false},
  {y: 600, g: 2, order: [27, 38, 3, 43, 9, 82, 10, 19], t: 260, merge: true},
  {y: 700, g: 4, order: [3, 27, 38, 43, 9, 10, 19, 82], t: 400, merge: true},
  {y: 800, g: 8, order: [3, 9, 10, 19, 27, 38, 43, 82], t: 540, merge: true},
];
const MX = (p: number, g: number) => {
  const gap = 46;
  const groups = 8 / g;
  const w = 8 * 90 + (groups - 1) * gap;
  return 960 - w / 2 + p * 90 + Math.floor(p / g) * gap;
};

export const DSMerge: React.FC = () => {
  const f = useF();
  const fin = prog(f, 700, 40);
  return (
    <AbsoluteFill>
      <Cam to={1.03}>
        <svg width={1920} height={1080}>
          <GlowDefs />
          {MROWS.map((row, r) => {
            if (r === 0) return null;
            const prev = MROWS[r - 1];
            return row.order.map((v, p) => {
              const pp = prev.order.indexOf(v);
              const stagger = row.merge ? (p % row.g) * 9 : 0;
              const t = eInOut(clamp01((f - row.t - stagger) / 40));
              if (t <= 0) return null;
              const x = lerp(MX(pp, prev.g), MX(p, row.g), t);
              const y = lerp(prev.y, row.y, t);
              const isFinal = r === MROWS.length - 1;
              const color = row.merge ? (isFinal ? A2 : mixHex(C, A2, (r - 3) / 3)) : C;
              return <Cell key={`${r}-${v}`} x={x} y={y} w={80} h={62} text={v} color={color} fill={isFinal ? 0.2 + fin * 0.5 : row.merge ? 0.25 : 0.08} size={30} glow={isFinal && fin > 0} />;
            });
          })}
          {MA.map((v, p) => (
            <Cell key={'r0' + v} x={MX(p, 8)} y={200} w={80} h={62} text={v} color={C} fill={0.1} size={30} opacity={prog(f, p * 3, 16)} />
          ))}
          <g opacity={prog(f, 40, 30)}>
            <path d="M200,230 L170,230 L170,530 L200,530" fill="none" stroke={C} strokeWidth={3} />
            <Txt x={130} y={380} size={34} weight={900} color={C} family={FONT.serif}>
              分
            </Txt>
          </g>
          <g opacity={prog(f, 260, 30)}>
            <path d="M200,560 L170,560 L170,830 L200,830" fill="none" stroke={A2} strokeWidth={3} />
            <Txt x={130} y={695} size={34} weight={900} color={A2} family={FONT.serif}>
              合
            </Txt>
          </g>
        </svg>
      </Cam>
      <Caption title="归并排序" en="MERGE SORT" desc="分而治之：拆到单个元素，再把有序段两两合并" chip="稳定 · O(n log n)" color={C} />
    </AbsoluteFill>
  );
};

export const DSMergeCues: Cue[] = [
  ...[50, 110, 170].map((t): Cue => [t, 'whoosh']),
  ...[260, 400, 540].flatMap((t, k): Cue[] => new Array(4).fill(0).map((_, i): Cue => [t + i * 9 * (k + 1) * 0.5, 'blip', 72 + k * 4 + i])),
  [700, 'chime'],
];

export const _u = [GNode, Glass, eOut];
