import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ActTitle} from '../components/ActTitle';
import {useF} from '../components/Shot';
import {along, Arrow, bez, Caption, Cam, GlowDefs, Pt} from '../components/ui';
import {clamp01, COL, eBack, eInOut, eOut, FONT, lerp, mixHex, prog, rgba} from '../theme';

const C = COL.os;

export const OSTitle: React.FC = () => (
  <ActTitle
    num="03"
    zh="操作系统"
    en="OPERATING SYSTEM"
    color={C}
    score={35}
    topics={['进程与线程', '处理机调度', '同步与互斥', '死锁', '内存管理', '文件管理', 'I/O 管理']}
    quote="控制和管理整个计算机系统的软硬件资源"
    by="操作系统的定义"
  />
);

const PC = [COL.ds, COL.co, COL.red, COL.cn];

/* ============================ Process states ============================ */

type SN = 'new' | 'ready' | 'run' | 'block' | 'exit';
const NODES: Record<SN, {x: number; y: number; zh: string; en: string}> = {
  new: {x: 260, y: 540, zh: '创建态', en: 'NEW'},
  ready: {x: 680, y: 540, zh: '就绪态', en: 'READY'},
  run: {x: 1160, y: 330, zh: '运行态', en: 'RUNNING'},
  block: {x: 1160, y: 760, zh: '阻塞态', en: 'BLOCKED'},
  exit: {x: 1640, y: 330, zh: '终止态', en: 'EXIT'},
};
const EDGES: {a: SN; b: SN; pts: Pt[]; label: string; lx: number; ly: number; anchor?: string}[] = [
  {a: 'new', b: 'ready', pts: [[380, 540], [558, 540]], label: '创建完成', lx: 470, ly: 520},
  {a: 'ready', b: 'run', pts: bez([720, 463], [720, 350], [900, 300], [1038, 300]), label: '进程调度', lx: 770, ly: 330},
  {a: 'run', b: 'ready', pts: bez([1090, 407], [1090, 520], [940, 565], [802, 565]), label: '时间片到', lx: 1010, ly: 500},
  {a: 'run', b: 'block', pts: [[1160, 407], [1160, 683]], label: '请求 I/O', lx: 1180, ly: 555, anchor: 'start'},
  {a: 'block', b: 'ready', pts: bez([1038, 770], [860, 770], [680, 740], [680, 617]), label: 'I/O 完成', lx: 850, ly: 808},
  {a: 'run', b: 'exit', pts: [[1282, 330], [1518, 330]], label: '运行结束', lx: 1400, ly: 310},
];

type Ev = [number, SN, SN | null];
const SCRIPT: Ev[][] = [
  [[30, 'new', null], [48, 'new', 'ready'], [90, 'ready', 'run'], [150, 'run', 'block'], [240, 'block', 'ready'], [330, 'ready', 'run']],
  [[42, 'new', null], [62, 'new', 'ready'], [150, 'ready', 'run'], [210, 'run', 'ready']],
  [[54, 'new', null], [76, 'new', 'ready'], [210, 'ready', 'run'], [270, 'run', 'exit']],
  [[66, 'new', null], [88, 'new', 'ready'], [270, 'ready', 'run'], [330, 'run', 'block']],
];
const TRAVEL = 22;

/** where each token is at frame f: either resting in a node or travelling along an edge */
const tokenState = (p: number, f: number) => {
  const evs = SCRIPT[p];
  if (f < evs[0][0]) return null;
  let node: SN = evs[0][1];
  let since = evs[0][0];
  for (let i = 1; i < evs.length; i++) {
    const [t, a, b] = evs[i];
    if (f < t) break;
    if (f < t + TRAVEL) return {travel: EDGES.findIndex((e) => e.a === a && e.b === b), t: (f - t) / TRAVEL, since: t};
    node = b as SN;
    since = t + TRAVEL;
  }
  return {node, since};
};

const tokenPos = (p: number, f: number): Pt | null => {
  const s = tokenState(p, f);
  if (!s) return null;
  if ('travel' in s && s.travel !== undefined) return along(EDGES[s.travel].pts, eInOut(s.t)).p;
  const node = (s as {node: SN}).node;
  const peers = [0, 1, 2, 3]
    .map((q) => ({q, st: tokenState(q, f)}))
    .filter((o) => o.st && (o.st as {node?: SN}).node === node)
    .sort((x, y) => x.st!.since - y.st!.since || x.q - y.q);
  const idx = peers.findIndex((o) => o.q === p);
  const n = peers.length;
  const N = NODES[node];
  return [N.x + (idx - (n - 1) / 2) * 72, N.y + 28];
};

export const OSProcess: React.FC = () => {
  const f = useF();
  const smooth = (p: number): Pt | null => {
    const samples = [0, 2, 4, 6, 8].map((d) => tokenPos(p, f - d)).filter(Boolean) as Pt[];
    if (!samples.length) return null;
    const cur = tokenPos(p, f);
    if (!cur) return null;
    const st = tokenState(p, f);
    if (st && 'travel' in st) return cur;
    return [samples.reduce((a, s) => a + s[0], 0) / samples.length, samples.reduce((a, s) => a + s[1], 0) / samples.length];
  };
  const activeEdge = (i: number) =>
    SCRIPT.some((evs) => evs.some(([t, a, b]) => b && f >= t && f < t + TRAVEL + 16 && EDGES[i].a === a && EDGES[i].b === b));
  const runBusy = [0, 1, 2, 3].some((p) => (tokenState(p, f) as {node?: SN})?.node === 'run');

  return (
    <AbsoluteFill>
      <Cam to={1.05}>
        <svg width={1920} height={1080}>
          <GlowDefs />
          {EDGES.map((e, i) => {
            const t = prog(f, 10 + i * 6, 30, eInOut);
            const act = activeEdge(i);
            return (
              <g key={i}>
                <Arrow pts={e.pts} t={t} color={act ? '#fff' : rgba(C, 0.7)} w={act ? 4 : 3} />
                <text
                  x={e.lx}
                  y={e.ly}
                  textAnchor={(e.anchor as 'start') ?? 'middle'}
                  fontFamily={FONT.sans}
                  fontSize={24}
                  fontWeight={act ? 700 : 400}
                  fill={act ? '#fff' : COL.sub}
                  opacity={t}
                >
                  {e.label}
                </text>
              </g>
            );
          })}
          {(Object.keys(NODES) as SN[]).map((k, i) => {
            const n = NODES[k];
            const a = eBack(clamp01((f - i * 5) / 22));
            const hot = k === 'run' && runBusy;
            return (
              <g key={k} transform={`translate(${n.x},${n.y}) scale(${lerp(0.6, 1, a)})`} opacity={clamp01(a * 2)}>
                <rect x={-120} y={-76} width={240} height={152} rx={22} fill="rgba(16,10,32,0.85)" stroke={hot ? '#fff' : C} strokeWidth={hot ? 3.5 : 2.5} filter="url(#g-m)" />
                {hot && <rect x={-120} y={-76} width={240} height={152} rx={22} fill={rgba(C, 0.18 + 0.1 * Math.sin(f / 5))} />}
                <text y={-26} textAnchor="middle" fontFamily={FONT.sans} fontWeight={800} fontSize={32} fill="#fff">
                  {n.zh}
                </text>
                <text x={0} y={-46 + 100} textAnchor="middle" fontFamily={FONT.tech} fontSize={16} letterSpacing={4} fill={rgba(C, 0.7)} opacity={0}>
                  {n.en}
                </text>
                {k === 'run' && (
                  <text x={96} y={-50} textAnchor="end" fontFamily={FONT.display} fontSize={14} fill={C}>
                    CPU
                  </text>
                )}
                {k === 'block' && (
                  <text x={96} y={-50} textAnchor="end" fontFamily={FONT.display} fontSize={14} fill={C}>
                    I/O
                  </text>
                )}
              </g>
            );
          })}
          {[0, 1, 2, 3].map((p) => {
            const pos = smooth(p);
            if (!pos) return null;
            const st = tokenState(p, f) as {node?: SN; since: number};
            const born = eBack(clamp01((f - SCRIPT[p][0][0]) / 18));
            const gone = st.node === 'exit' ? clamp01((f - st.since - 20) / 20) : 0;
            return (
              <g key={p} transform={`translate(${pos[0]},${pos[1]}) scale(${born * (1 + gone * 0.6)})`} opacity={1 - gone}>
                <rect x={-30} y={-17} width={60} height={34} rx={17} fill={PC[p]} filter="url(#g-m)" />
                <text y={8} textAnchor="middle" fontFamily={FONT.tech} fontWeight={700} fontSize={24} fill="#0a0a14">
                  P{p + 1}
                </text>
              </g>
            );
          })}
        </svg>
      </Cam>
      <Caption title="进程状态转换" en="PROCESS STATES" desc="创建 → 就绪 ⇄ 运行 → 阻塞 → 就绪 · 调度驱动进程流转" chip="PCB" color={C} />
    </AbsoluteFill>
  );
};

/* ============================ RR scheduling ============================ */

const PROCS = [
  {n: 'P1', arr: 0, svc: 5},
  {n: 'P2', arr: 1, svc: 3},
  {n: 'P3', arr: 2, svc: 4},
  {n: 'P4', arr: 3, svc: 2},
];
const SEGS: [number, number, number][] = [
  [0, 0, 2],
  [1, 2, 4],
  [2, 4, 6],
  [0, 6, 8],
  [3, 8, 10],
  [1, 10, 11],
  [2, 11, 13],
  [0, 13, 14],
];
const QUEUE: [number, number[]][] = [
  [0, []],
  [1, [1]],
  [2, [2, 0]],
  [3, [2, 0, 3]],
  [4, [0, 3, 1]],
  [6, [3, 1, 2]],
  [8, [1, 2, 0]],
  [10, [2, 0]],
  [11, [0]],
  [13, []],
];

export const OSSched: React.FC = () => {
  const f = useF();
  const tAt = (g: number) => clamp01((g - 40) / 210) * 14;
  const t = tAt(f);
  const U = 92;
  const GX = 360;
  const GY = 560;
  const queueAt = (tt: number) => {
    let q: number[] = [];
    for (const [s, arr] of QUEUE) if (tt >= s) q = arr;
    return q;
  };
  const running = SEGS.find(([, s, e]) => t >= s && t < e);
  const qx = (i: number) => 830 + i * 100;
  // smoothed pill positions
  const pillX = (p: number) => {
    const xs: number[] = [];
    for (const d of [0, 2, 4, 6, 8, 10]) {
      const q = queueAt(tAt(f - d));
      const i = q.indexOf(p);
      if (i >= 0) xs.push(qx(i));
    }
    return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
  };
  const q = queueAt(t);
  const done = prog(f, 256, 30);

  return (
    <AbsoluteFill>
      <Cam to={1.04}>
        {/* process table */}
        <div
          style={{
            position: 'absolute',
            left: 150,
            top: 190,
            width: 400,
            padding: '14px 24px',
            borderRadius: 16,
            background: COL.panel,
            border: `1px solid ${rgba(C, 0.35)}`,
            fontFamily: FONT.mono,
            fontSize: 26,
            color: '#fff',
            opacity: prog(f, 0, 24),
          }}
        >
          <div style={{display: 'flex', color: COL.sub, fontFamily: FONT.sans, fontSize: 22, paddingBottom: 6}}>
            <span style={{width: 120}}>进程</span>
            <span style={{width: 120}}>到达</span>
            <span>服务</span>
          </div>
          {PROCS.map((p, i) => (
            <div key={i} style={{display: 'flex', alignItems: 'center', height: 50, opacity: prog(f, 6 + i * 5, 20)}}>
              <span style={{width: 120}}>
                <span style={{display: 'inline-block', padding: '0 12px', borderRadius: 12, background: PC[i], color: '#0a0a14', fontFamily: FONT.tech, fontWeight: 700}}>{p.n}</span>
              </span>
              <span style={{width: 120}}>{p.arr}</span>
              <span>{p.svc}</span>
            </div>
          ))}
        </div>
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          <GlowDefs />
          {/* ready queue */}
          <g opacity={prog(f, 20, 24)}>
            <text x={700} y={290} fontFamily={FONT.sans} fontSize={26} fill={COL.sub}>
              就绪队列
            </text>
            <rect x={810} y={250} width={420} height={60} rx={12} fill="none" stroke={rgba(C, 0.4)} strokeDasharray="8 6" />
            <Arrow pts={[[1240, 280], [1440, 280]]} t={1} color={rgba(C, 0.8)} w={3} />
          </g>
          {[0, 1, 2, 3].map((p) => {
            const x = pillX(p);
            const inQ = q.includes(p);
            if (x === null) return null;
            return (
              <g key={p} transform={`translate(${x + 40},280)`} opacity={inQ ? 1 : 0.4}>
                <rect x={-38} y={-20} width={76} height={40} rx={20} fill={PC[p]} filter="url(#g-s)" />
                <text y={9} textAnchor="middle" fontFamily={FONT.tech} fontWeight={700} fontSize={26} fill="#0a0a14">
                  P{p + 1}
                </text>
              </g>
            );
          })}
          {/* CPU */}
          <g transform="translate(1580,280)" opacity={prog(f, 26, 24)}>
            <rect x={-130} y={-80} width={260} height={160} rx={20} fill="rgba(16,10,32,0.85)" stroke={C} strokeWidth={3} filter="url(#g-m)" />
            <text y={-40} textAnchor="middle" fontFamily={FONT.display} fontSize={22} letterSpacing={6} fill={C}>
              CPU
            </text>
            {running && (
              <>
                <circle r={48} cy={22} fill="none" stroke={rgba('#fff', 0.12)} strokeWidth={6} />
                <circle
                  r={48}
                  cy={22}
                  fill="none"
                  stroke={PC[running[0]]}
                  strokeWidth={6}
                  strokeDasharray={`${2 * Math.PI * 48 * clamp01((t - running[1]) / 2)} 999`}
                  transform="rotate(-90 0 22)"
                />
                <text y={33} textAnchor="middle" fontFamily={FONT.tech} fontWeight={700} fontSize={34} fill={PC[running[0]]}>
                  P{running[0] + 1}
                </text>
              </>
            )}
            <text y={112} textAnchor="middle" fontFamily={FONT.mono} fontSize={22} fill={COL.sub}>
              q = 2
            </text>
          </g>
          {/* arrivals */}
          {PROCS.map((p, i) => (
            <g key={i} opacity={t >= p.arr ? 1 : 0.15}>
              <text x={GX + p.arr * U} y={GY - 36} textAnchor="middle" fontFamily={FONT.tech} fontWeight={700} fontSize={20} fill={PC[i]}>
                {p.n}↓
              </text>
            </g>
          ))}
          {/* gantt */}
          <rect x={GX} y={GY} width={14 * U} height={80} rx={8} fill="rgba(255,255,255,0.03)" stroke={rgba('#fff', 0.12)} opacity={prog(f, 10, 20)} />
          {SEGS.map(([p, s, e], i) => {
            const w = clamp01((t - s) / (e - s)) * (e - s) * U;
            if (w <= 0) return null;
            return (
              <g key={i}>
                <rect x={GX + s * U + 2} y={GY + 2} width={Math.max(0, w - 4)} height={76} rx={8} fill={rgba(PC[p], 0.75)} stroke={PC[p]} strokeWidth={2} filter={t < e ? 'url(#g-m)' : undefined} />
                {w > U * 0.6 && (
                  <text x={GX + s * U + ((e - s) * U) / 2} y={GY + 50} textAnchor="middle" fontFamily={FONT.tech} fontWeight={700} fontSize={32} fill="#0a0a14">
                    P{p + 1}
                  </text>
                )}
              </g>
            );
          })}
          {new Array(15).fill(0).map((_, k) => (
            <g key={k} opacity={prog(f, 10 + k * 2, 16)}>
              <line x1={GX + k * U} y1={GY + 80} x2={GX + k * U} y2={GY + 92} stroke={rgba('#fff', 0.4)} />
              <text x={GX + k * U} y={GY + 122} textAnchor="middle" fontFamily={FONT.mono} fontSize={22} fill={k <= t ? '#fff' : COL.dim}>
                {k}
              </text>
            </g>
          ))}
          {f > 40 && f < 262 && <line x1={GX + t * U} y1={GY - 16} x2={GX + t * U} y2={GY + 96} stroke="#fff" strokeWidth={3} filter="url(#g-m)" />}
        </svg>
        <div
          style={{
            position: 'absolute',
            right: 140,
            top: 790,
            padding: '16px 28px',
            borderRadius: 14,
            background: COL.panel,
            border: `1px solid ${rgba(C, 0.4)}`,
            fontFamily: FONT.mono,
            fontSize: 28,
            color: '#fff',
            opacity: done,
            transform: `translateY(${(1 - done) * 24}px)`,
          }}
        >
          平均周转时间 = (14 + 10 + 11 + 7) / 4 = <span style={{color: C, fontWeight: 700}}>10.5</span>
        </div>
      </Cam>
      <Caption title="时间片轮转" en="ROUND ROBIN" desc="按到达顺序排队 · 时间片用完即回到队尾" chip="q = 2" color={C} />
    </AbsoluteFill>
  );
};

/* ============================ Producer / consumer ============================ */

const OPS = ['P', 'P', 'C', 'P', 'C', 'P', 'P', 'C', 'C'];
const OP0 = 40;
const OPL = 34;

type PVState = {empty: number; full: number; mutex: number; items: number[]; inP: number; outP: number};

const pvAt = (f: number) => {
  const st: PVState = {empty: 6, full: 2, mutex: 1, items: [0, 1], inP: 2, outP: 0};
  let cur: {kind: string; ph: number; local: number; slot: number} | null = null;
  for (let i = 0; i < OPS.length; i++) {
    const s = OP0 + i * OPL;
    if (f < s) break;
    const local = f - s;
    const kind = OPS[i];
    const complete = local >= OPL;
    const slot = kind === 'P' ? st.inP : st.outP;
    if (local >= 3) kind === 'P' ? st.empty-- : st.full--;
    if (local >= 8 && local < 26) st.mutex = 0;
    if (local >= 24) {
      if (kind === 'P') {
        st.items.push(slot);
        st.inP = (st.inP + 1) % 8;
      } else {
        st.items = st.items.filter((x) => x !== slot);
        st.outP = (st.outP + 1) % 8;
      }
    }
    if (local >= 31) kind === 'P' ? st.full++ : st.empty++;
    if (!complete) cur = {kind, ph: local < 6 ? 0 : local < 11 ? 1 : local < 24 ? 2 : local < 29 ? 3 : 4, local, slot};
  }
  return {st, cur};
};

export const OSPV: React.FC = () => {
  const f = useF();
  const {st, cur} = pvAt(f);
  const prev = pvAt(f - 8).st;
  const CX = 960;
  const CY = 540;
  const R = 190;
  const slotPos = (k: number): Pt => {
    const a = ((-90 + k * 45) * Math.PI) / 180;
    return [CX + Math.cos(a) * R, CY + Math.sin(a) * R];
  };
  const PROD: Pt = [380, 430];
  const CONS: Pt = [1540, 430];
  const angOf = (k: number) => -90 + k * 45;
  const smoothAng = (a: number, b: number) => {
    let d = b - a;
    while (d > 180) d -= 360;
    while (d < -180) d += 360;
    return a + d * 0.6;
  };
  const inAng = smoothAng(angOf(prev.inP), angOf(st.inP));
  const outAng = smoothAng(angOf(prev.outP), angOf(st.outP));
  const moving = cur && cur.ph === 2 ? eInOut((cur.local - 11) / 13) : null;
  const pCode = ['P(empty);', 'P(mutex);', '放入产品;', 'V(mutex);', 'V(full);'];
  const cCode = ['P(full);', 'P(mutex);', '取出产品;', 'V(mutex);', 'V(empty);'];
  const locked = st.mutex === 0;

  const sem = (name: string, v: number, pv: number, x: number) => {
    const bump = v !== pv ? 1 : 0;
    return (
      <div
        key={name}
        style={{
          position: 'absolute',
          left: x,
          top: 140,
          width: 190,
          padding: '10px 0',
          textAlign: 'center',
          borderRadius: 14,
          background: COL.panel,
          border: `1.5px solid ${name === 'mutex' && v === 0 ? COL.red : rgba(C, 0.5)}`,
          boxShadow: bump ? `0 0 24px ${rgba(C, 0.6)}` : undefined,
          opacity: prog(f, 0, 20),
        }}
      >
        <div style={{fontFamily: FONT.mono, fontSize: 22, color: COL.sub}}>{name}</div>
        <div style={{fontFamily: FONT.tech, fontWeight: 700, fontSize: 52, color: name === 'mutex' && v === 0 ? COL.red : '#fff', lineHeight: '56px'}}>{v}</div>
      </div>
    );
  };

  const codePanel = (lines: string[], x: number, active: boolean, title: string, col: string) => (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: 560,
        width: 400,
        padding: '14px 24px',
        borderRadius: 16,
        background: COL.panel,
        border: `1px solid ${rgba(col, 0.4)}`,
        fontFamily: FONT.mono,
        fontSize: 26,
        lineHeight: '42px',
        opacity: prog(f, 16, 24),
      }}
    >
      <div style={{fontFamily: FONT.sans, fontSize: 22, color: col, marginBottom: 4}}>{title}</div>
      {lines.map((l, i) => {
        const on = active && cur && cur.ph === i;
        return (
          <div
            key={i}
            style={{
              color: on ? '#fff' : COL.sub,
              background: on ? rgba(col, 0.25) : 'transparent',
              borderLeft: `4px solid ${on ? col : 'transparent'}`,
              paddingLeft: 12,
              borderRadius: 4,
            }}
          >
            {l}
          </div>
        );
      })}
    </div>
  );

  return (
    <AbsoluteFill>
      <Cam to={1.04}>
        {sem('empty', st.empty, prev.empty, 640)}
        {sem('full', st.full, prev.full, 865)}
        {sem('mutex', st.mutex, prev.mutex, 1090)}
        {codePanel(pCode, 150, cur?.kind === 'P', '生产者 Producer', COL.cn)}
        {codePanel(cCode, 1370, cur?.kind === 'C', '消费者 Consumer', COL.red)}
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          <GlowDefs />
          {/* ring */}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke={rgba(C, 0.25)} strokeWidth={70} opacity={prog(f, 4, 24)} />
          <circle cx={CX} cy={CY} r={R + 35} fill="none" stroke={rgba(C, 0.5)} strokeWidth={1.5} strokeDasharray="4 8" transform={`rotate(${f * 0.3} ${CX} ${CY})`} />
          {new Array(8).fill(0).map((_, k) => {
            const [x, y] = slotPos(k);
            const has = st.items.includes(k);
            return (
              <g key={k} opacity={prog(f, 4 + k * 3, 20)}>
                <rect x={x - 28} y={y - 28} width={56} height={56} rx={10} fill="rgba(10,6,24,0.9)" stroke={rgba(C, 0.6)} strokeWidth={2} />
                {has && <rect x={x - 20} y={y - 20} width={40} height={40} rx={8} fill={COL.co} filter="url(#g-m)" />}
              </g>
            );
          })}
          {/* moving item */}
          {moving !== null && cur && (() => {
            const [sx, sy] = slotPos(cur.slot);
            const from: Pt = cur.kind === 'P' ? PROD : [sx, sy];
            const to: Pt = cur.kind === 'P' ? [sx, sy] : CONS;
            const x = lerp(from[0], to[0], moving);
            const y = lerp(from[1], to[1], moving) - Math.sin(moving * Math.PI) * 80;
            return <rect x={x - 20} y={y - 20} width={40} height={40} rx={8} fill={COL.co} filter="url(#g-l)" />;
          })()}
          {/* in/out pointers */}
          {[
            {a: inAng, c: COL.cn, l: 'in'},
            {a: outAng, c: COL.red, l: 'out'},
          ].map((p, i) => {
            const r = (p.a * Math.PI) / 180;
            const x2 = CX + Math.cos(r) * (R - 50);
            const y2 = CY + Math.sin(r) * (R - 50);
            return (
              <g key={i} opacity={prog(f, 20, 20)}>
                <Arrow pts={[[CX, CY], [x2, y2]]} t={1} color={p.c} w={4} />
                <text x={CX + Math.cos(r) * (R - 95)} y={CY + Math.sin(r) * (R - 95) + 8} textAnchor="middle" fontFamily={FONT.mono} fontSize={22} fontWeight={700} fill={p.c}>
                  {p.l}
                </text>
              </g>
            );
          })}
          <circle cx={CX} cy={CY} r={36} fill={locked ? rgba(COL.red, 0.3) : 'rgba(10,6,24,0.9)'} stroke={locked ? COL.red : C} strokeWidth={3} filter="url(#g-m)" />
          <text x={CX} y={CY + 9} textAnchor="middle" fontFamily={FONT.sans} fontSize={22} fontWeight={700} fill={locked ? COL.red : '#fff'}>
            {locked ? '临界' : '缓冲'}
          </text>
          {/* producer / consumer */}
          {[
            {p: PROD, zh: '生产者', c: COL.cn, on: cur?.kind === 'P'},
            {p: CONS, zh: '消费者', c: COL.red, on: cur?.kind === 'C'},
          ].map((o, i) => (
            <g key={i} transform={`translate(${o.p[0]},${o.p[1]})`} opacity={prog(f, 8, 20)}>
              <circle r={62} fill="rgba(10,6,24,0.9)" stroke={o.c} strokeWidth={o.on ? 4 : 2.5} filter="url(#g-m)" />
              {o.on && <circle r={62 + 10 * Math.sin((f / 34) * Math.PI)} fill="none" stroke={o.c} strokeWidth={2} opacity={0.5} />}
              <text y={10} textAnchor="middle" fontFamily={FONT.sans} fontWeight={800} fontSize={28} fill="#fff">
                {o.zh}
              </text>
            </g>
          ))}
        </svg>
      </Cam>
      <Caption title="生产者—消费者" en="SEMAPHORE" desc="P 申请 · V 释放 · mutex 保证对缓冲区的互斥访问" chip="P / V" color={C} />
    </AbsoluteFill>
  );
};

/* ============================ Paging ============================ */

const MAP = [5, 9, 3, 7, 0, 11, 2, 8];

export const OSPaging: React.FC = () => {
  const f = useF();
  const py = (p: number) => 250 + p * 70;
  const fy = (k: number) => 230 + k * 50;
  const pc = (p: number) => mixHex(C, COL.ds, p / 7);
  const ex = prog(f, 176, 70, eInOut);
  const exPath: Pt[] = [
    [372, py(2)],
    [760, py(2)],
    ...bez([1040, py(2)], [1240, py(2)], [1260, fy(3) + 22], [1438, fy(3) + 22], 20),
  ];
  const hiPage = f > 176 && f < 300;
  const hiPT = f > 200;
  const hiFrame = f > 236;

  return (
    <AbsoluteFill>
      <Cam to={1.04}>
        <svg width={1920} height={1080}>
          <GlowDefs />
          <text x={270} y={214} textAnchor="middle" fontFamily={FONT.sans} fontSize={24} fill={COL.sub} opacity={prog(f, 0, 20)}>
            逻辑地址空间
          </text>
          <text x={900} y={214} textAnchor="middle" fontFamily={FONT.sans} fontSize={24} fill={COL.sub} opacity={prog(f, 10, 20)}>
            页表（页号 → 块号）
          </text>
          <text x={1560} y={200} textAnchor="middle" fontFamily={FONT.sans} fontSize={24} fill={COL.sub} opacity={prog(f, 20, 20)}>
            物理内存
          </text>
          {/* mapping lines */}
          {MAP.map((fr, p) => {
            const t = prog(f, 60 + p * 12, 30, eInOut);
            const pts: Pt[] = [[372, py(p)], [758, py(p)]];
            const pts2 = bez([1042, py(p)], [1240, py(p)], [1260, fy(fr) + 22], [1438, fy(fr) + 22], 24);
            const dim = hiPage && p !== 2 ? 0.35 : 1;
            return (
              <g key={p} opacity={dim}>
                <Arrow pts={pts} t={t} color={rgba(pc(p), 0.8)} w={2.5} head={10} />
                <Arrow pts={pts2} t={prog(f, 76 + p * 12, 30, eInOut)} color={rgba(pc(p), 0.8)} w={2.5} head={10} />
              </g>
            );
          })}
          {/* pages */}
          {MAP.map((_, p) => {
            const a = prog(f, p * 4, 20);
            const hi = hiPage && p === 2;
            return (
              <g key={p} opacity={a} transform={`translate(${(1 - a) * -40},0)`}>
                <rect x={170} y={py(p) - 28} width={200} height={56} rx={10} fill={hi ? rgba(pc(p), 0.4) : 'rgba(14,8,30,0.85)'} stroke={pc(p)} strokeWidth={hi ? 3 : 2} filter={hi ? 'url(#g-m)' : undefined} />
                <text x={270} y={py(p) + 9} textAnchor="middle" fontFamily={FONT.sans} fontSize={24} fontWeight={600} fill="#fff">
                  第 {p} 页
                </text>
              </g>
            );
          })}
          {/* page table */}
          {MAP.map((fr, p) => {
            const a = prog(f, 12 + p * 4, 20);
            const hi = hiPT && p === 2;
            return (
              <g key={p} opacity={a}>
                <rect x={760} y={py(p) - 28} width={280} height={56} rx={8} fill={hi ? rgba(C, 0.4) : 'rgba(14,8,30,0.85)'} stroke={hi ? '#fff' : rgba(C, 0.5)} strokeWidth={hi ? 3 : 1.5} filter={hi ? 'url(#g-m)' : undefined} />
                <line x1={900} y1={py(p) - 22} x2={900} y2={py(p) + 22} stroke={rgba(C, 0.4)} />
                <text x={830} y={py(p) + 9} textAnchor="middle" fontFamily={FONT.mono} fontSize={26} fill={COL.sub}>
                  {p}
                </text>
                <text x={970} y={py(p) + 9} textAnchor="middle" fontFamily={FONT.mono} fontSize={26} fontWeight={700} fill={hi ? '#fff' : pc(p)}>
                  {fr}
                </text>
              </g>
            );
          })}
          {/* frames */}
          {new Array(12).fill(0).map((_, k) => {
            const p = MAP.indexOf(k);
            const a = prog(f, 20 + k * 3, 20);
            const filled = p >= 0 && f > 90 + p * 12;
            const hi = hiFrame && k === 3;
            return (
              <g key={k} opacity={a}>
                <rect
                  x={1440}
                  y={fy(k)}
                  width={240}
                  height={44}
                  rx={6}
                  fill={hi ? rgba(C, 0.5) : filled ? rgba(pc(p), 0.25) : 'rgba(255,255,255,0.03)'}
                  stroke={hi ? '#fff' : filled ? pc(p) : rgba('#fff', 0.12)}
                  strokeWidth={hi ? 3 : 1.5}
                  filter={hi ? 'url(#g-m)' : undefined}
                />
                <text x={1456} y={fy(k) + 30} fontFamily={FONT.mono} fontSize={20} fill={COL.dim}>
                  {k}
                </text>
                {filled && (
                  <text x={1600} y={fy(k) + 30} textAnchor="middle" fontFamily={FONT.sans} fontSize={20} fill="#fff">
                    页 {p}
                  </text>
                )}
              </g>
            );
          })}
          {/* translation pulse */}
          {ex > 0 && ex < 1 && (() => {
            const {p} = along(exPath, ex);
            return <circle cx={p[0]} cy={p[1]} r={13} fill="#fff" filter="url(#g-l)" />;
          })()}
        </svg>
        <div
          style={{
            position: 'absolute',
            right: 120,
            top: 846,
            padding: '14px 26px',
            borderRadius: 14,
            background: COL.panel,
            border: `1px solid ${rgba(C, 0.4)}`,
            fontFamily: FONT.mono,
            fontSize: 25,
            lineHeight: '40px',
            color: COL.sub,
            opacity: prog(f, 170, 24),
          }}
        >
          <div>
            逻辑地址 <b style={{color: '#fff'}}>0x21A4</b> → 页号 P = <b style={{color: C}}>2</b>，页内偏移 W = <b style={{color: '#fff'}}>0x1A4</b>
          </div>
          <div style={{opacity: prog(f, 206, 20)}}>
            查页表 P = 2 → 块号 b = <b style={{color: C}}>3</b> ⇒ 物理地址 <b style={{color: '#fff'}}>0x31A4</b>
          </div>
        </div>
      </Cam>
      <Caption title="分页存储" en="PAGING" desc="页表把逻辑页映射到物理块 · 快表 TLB 加速地址变换" chip="4 KB / 页" color={C} />
    </AbsoluteFill>
  );
};

/* ============================ Deadlock ============================ */

export const OSDeadlock: React.FC = () => {
  const f = useF();
  const CX = 960;
  const CY = 500;
  const RP = 280;
  const th = (i: number) => ((-90 + i * 72) * Math.PI) / 180;
  const pick = (i: number) => prog(f, 44 + i * 14, 20, eInOut);
  const waitT = (i: number) => prog(f, 124 + i * 6, 22, eInOut);
  const dead = prog(f, 158, 30);
  const jitter = dead > 0 && f < 200 ? Math.sin(f * 2.3) * 4 * (1 - dead) : 0;
  // chopstick i lies between philosopher i and i+1; philosopher i grabs chopstick i first, then waits for chopstick i-1
  const stick = (i: number) => {
    const baseA = th(i) + (36 * Math.PI) / 180;
    const heldA = th(i) + (16 * Math.PI) / 180;
    const t = pick(i);
    const a = lerp(baseA, heldA, t);
    const r = lerp(165, 205, t);
    return {x: CX + Math.cos(a) * r, y: CY + Math.sin(a) * r, a};
  };
  const conds = [
    {t: '互斥', x: 420, y: 300},
    {t: '请求并保持', x: 1500, y: 300},
    {t: '不可剥夺', x: 420, y: 720},
    {t: '循环等待', x: 1500, y: 720},
  ];

  return (
    <AbsoluteFill>
      <Cam to={1.06} oy={500}>
        <svg width={1920} height={1080}>
          <GlowDefs />
          <circle cx={CX} cy={CY} r={135} fill="rgba(16,10,32,0.85)" stroke={rgba(dead > 0 ? COL.red : C, 0.6)} strokeWidth={2.5} opacity={prog(f, 0, 20)} />
          {/* cycle ring */}
          <circle
            cx={CX}
            cy={CY}
            r={RP}
            fill="none"
            stroke={COL.red}
            strokeWidth={4}
            strokeDasharray="18 14"
            transform={`rotate(${f * 1.2} ${CX} ${CY})`}
            opacity={dead}
            filter="url(#g-m)"
          />
          {/* wait-for arrows: philosopher i -> chopstick (i-1) held by philosopher i-1 */}
          {[0, 1, 2, 3, 4].map((i) => {
            const a0 = th(i) - (14 * Math.PI) / 180;
            const a1 = th(i) - (58 * Math.PI) / 180;
            const pts: Pt[] = [];
            for (let k = 0; k <= 16; k++) {
              const a = lerp(a0, a1, k / 16);
              const r = RP + 70 + Math.sin((k / 16) * Math.PI) * 30;
              pts.push([CX + Math.cos(a) * r, CY + Math.sin(a) * r]);
            }
            return <Arrow key={i} pts={pts} t={waitT(i)} color={COL.red} w={3} dash="8 7" dashOffset={-f} />;
          })}
          {[0, 1, 2, 3, 4].map((i) => {
            const s = stick(i);
            const dx = Math.cos(s.a) * 55;
            const dy = Math.sin(s.a) * 55;
            return (
              <line
                key={i}
                x1={s.x - dx}
                y1={s.y - dy}
                x2={s.x + dx}
                y2={s.y + dy}
                stroke={pick(i) > 0.5 ? COL.co : '#d9c7ff'}
                strokeWidth={8}
                strokeLinecap="round"
                opacity={prog(f, 8 + i * 3, 20)}
                filter="url(#g-s)"
              />
            );
          })}
          {[0, 1, 2, 3, 4].map((i) => {
            const x = CX + Math.cos(th(i)) * RP;
            const y = CY + Math.sin(th(i)) * RP;
            const a = eBack(clamp01((f - i * 5) / 20));
            const state = waitT(i) > 0.3 ? '等待' : pick(i) > 0.5 ? '拿到左筷' : '思考';
            const col = waitT(i) > 0.3 ? COL.red : C;
            return (
              <g key={i} transform={`translate(${x},${y}) scale(${a})`}>
                <circle r={56} fill="rgba(16,10,32,0.92)" stroke={col} strokeWidth={3} filter="url(#g-m)" />
                <text y={2} textAnchor="middle" fontFamily={FONT.tech} fontWeight={700} fontSize={34} fill="#fff">
                  P{i}
                </text>
                <text y={30} textAnchor="middle" fontFamily={FONT.sans} fontSize={18} fill={col}>
                  {state}
                </text>
              </g>
            );
          })}
          <g transform={`translate(${CX + jitter},${CY})`} opacity={dead}>
            <text y={4} textAnchor="middle" fontFamily={FONT.serif} fontWeight={900} fontSize={76} fill="#fff" filter="url(#g-m)" style={{textShadow: 'none'}}>
              死锁
            </text>
            <text y={46} textAnchor="middle" fontFamily={FONT.display} fontSize={20} letterSpacing={8} fill={COL.red}>
              DEADLOCK
            </text>
          </g>
        </svg>
        {conds.map((c, i) => {
          const a = eBack(clamp01((f - 180 - i * 7) / 20));
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: c.x - 130,
                top: c.y - 34,
                width: 260,
                textAlign: 'center',
                fontFamily: FONT.sans,
                fontWeight: 700,
                fontSize: 32,
                color: '#fff',
                padding: '10px 0',
                borderRadius: 14,
                background: rgba(COL.red, 0.14),
                border: `1.5px solid ${rgba(COL.red, 0.7)}`,
                opacity: clamp01(a * 2),
                transform: `scale(${lerp(0.6, 1, a)})`,
              }}
            >
              {c.t}
            </div>
          );
        })}
      </Cam>
      <Caption title="死锁" en="DEADLOCK" desc="哲学家进餐问题 · 四个必要条件同时成立" chip="银行家算法" color={C} />
    </AbsoluteFill>
  );
};

export const _u = eOut;
