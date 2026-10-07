import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {Cue} from '../../components/Problem';
import {useF} from '../../components/Shot';
import {GlowDefs} from '../../components/ui';
import {clamp01, COL, eIn, eInOut, eOut, FONT, lerp, prog, rgba, rnd} from '../../theme';

type Cluster = {name: string; en: string; c: string; x: number; y: number; score: number; topics: string[]; num: string};

const CL: Cluster[] = [
  {name: '数据结构', en: 'DATA STRUCTURE', c: COL.ds, x: -900, y: -400, score: 45, num: '01', topics: ['线性表', '栈', '队列', 'KMP', '二叉树', 'AVL', '哈夫曼', '图', '查找', '排序']},
  {name: '计算机组成原理', en: 'COMPUTER ORGANIZATION', c: COL.co, x: 900, y: -400, score: 45, num: '02', topics: ['补码', '浮点数', '加法器', 'Cache', '虚拟存储', '寻址', '数据通路', '流水线', '中断', 'DMA']},
  {name: '操作系统', en: 'OPERATING SYSTEM', c: COL.os, x: -900, y: 400, score: 35, num: '03', topics: ['系统调用', '进程', '调度', 'PV 操作', '死锁', '银行家', '分页', '页面置换', '文件', '磁盘']},
  {name: '计算机网络', en: 'COMPUTER NETWORK', c: COL.cn, x: 900, y: 400, score: 25, num: '04', topics: ['香农', 'CSMA/CD', '滑动窗口', '子网', 'IP 分片', '路由', 'TCP', '拥塞', 'DNS', 'HTTP']},
];

const starPos = (ci: number, k: number) => {
  const c = CL[ci];
  const a = (k / 10) * Math.PI * 2 + rnd(ci * 31 + k) * 0.5 - 0.25 + ci * 0.7;
  const r = 200 + (k % 3) * 70 + rnd(ci * 17 + k * 3) * 50;
  return [c.x + Math.cos(a) * r * 1.25, c.y + Math.sin(a) * r * 0.85] as [number, number];
};

const LINKS: [number, number, number, number][] = [
  [0, 1, 3, 2], // 栈 - 调度? (DS 栈 -> OS 调度)
  [0, 2, 2, 2], // 队列 - 调度
  [0, 7, 3, 5], // 图 - 路由
  [1, 4, 2, 6], // 虚拟存储 - 分页
  [1, 3, 2, 7], // Cache - 页面置换
  [1, 8, 2, 0], // 中断 - 系统调用
  [0, 9, 2, 9], // 排序 - 磁盘调度
  [3, 6, 2, 1], // TCP - 进程
  [1, 9, 3, 1], // DMA - 链路
];

const BG = new Array(420).fill(0).map((_, i) => ({x: (rnd(i * 1.3) - 0.5) * 5200, y: (rnd(i * 2.9) - 0.5) * 3200, s: 0.6 + rnd(i * 4.1) * 2, ph: rnd(i * 7.7) * 6.28}));

type Cam = [number, number, number, number]; // frame, x, y, zoom

const camAt = (f: number, keys: Cam[]) => {
  if (f <= keys[0][0]) return {x: keys[0][1], y: keys[0][2], z: keys[0][3]};
  for (let i = 0; i < keys.length - 1; i++) {
    const [f0, x0, y0, z0] = keys[i];
    const [f1, x1, y1, z1] = keys[i + 1];
    if (f <= f1) {
      const t = eInOut((f - f0) / (f1 - f0));
      const far = Math.hypot(x1 - x0, y1 - y0) > 400 ? Math.sin(Math.PI * t) * 0.45 : 0;
      return {x: lerp(x0, x1, t), y: lerp(y0, y1, t), z: lerp(z0, z1, t) * (1 - far)};
    }
  }
  const l = keys[keys.length - 1];
  return {x: l[1], y: l[2], z: l[3]};
};

const Sky: React.FC<{f: number; cam: {x: number; y: number; z: number}; lit: (ci: number, k: number) => number; linkT: number; active: number}> = ({f, cam, lit, linkT, active}) => {
  const tf = `translate(960,540) scale(${cam.z}) translate(${-cam.x},${-cam.y})`;
  const labelA = clamp01((cam.z - 0.85) / 0.4);
  return (
    <svg width={1920} height={1080} style={{position: 'absolute'}}>
      <GlowDefs />
      <defs>
        {CL.map((c, ci) => (
          <radialGradient key={ci} id={`neb${ci}`}>
            <stop offset="0" stopColor={c.c} stopOpacity="0.22" />
            <stop offset="0.5" stopColor={c.c} stopOpacity="0.07" />
            <stop offset="1" stopColor={c.c} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>
      {/* parallax background stars */}
      <g transform={`translate(960,540) scale(${0.5 + cam.z * 0.25}) translate(${-cam.x * 0.4},${-cam.y * 0.4})`}>
        {BG.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.s} fill={i % 7 === 0 ? '#9ec5ff' : '#e6eeff'} opacity={0.25 + 0.4 * (0.5 + 0.5 * Math.sin(f / 20 + s.ph))} />
        ))}
      </g>
      <g transform={tf}>
        {/* nebula glow per cluster */}
        {CL.map((c, ci) => (
          <ellipse key={ci} cx={c.x} cy={c.y} rx={760} ry={540} fill={`url(#neb${ci})`} opacity={active === ci ? 1 : 0.7} />
        ))}
        {/* cross-subject links */}
        {LINKS.map(([a, ka, b, kb], i) => {
          const t = clamp01(linkT * 1.6 - i * 0.07);
          if (t <= 0) return null;
          const p = starPos(a, ka);
          const q = starPos(b, kb);
          const mx = (p[0] + q[0]) / 2;
          const my = (p[1] + q[1]) / 2 - 160;
          const L = 2000;
          return (
            <path
              key={i}
              d={`M${p[0]},${p[1]} Q${mx},${my} ${q[0]},${q[1]}`}
              fill="none"
              stroke="#ffd98a"
              strokeWidth={2.5 / Math.max(0.5, cam.z)}
              strokeDasharray={`${L * t} ${L}`}
              opacity={0.7}
              filter="url(#g-s)"
            />
          );
        })}
        {CL.map((c, ci) => (
          <g key={ci}>
            {c.topics.map((_, k) => {
              const a = starPos(ci, k);
              const b = starPos(ci, (k + 1) % 10);
              const t = Math.min(lit(ci, k), lit(ci, (k + 1) % 10));
              return <line key={'l' + k} x1={a[0]} y1={a[1]} x2={lerp(a[0], b[0], t)} y2={lerp(a[1], b[1], t)} stroke={rgba(c.c, 0.45)} strokeWidth={2 / Math.max(0.6, cam.z)} />;
            })}
            {c.topics.map((_, k) => {
              if (k % 3) return null;
              const a = starPos(ci, k);
              const t = lit(ci, k);
              return <line key={'c' + k} x1={c.x} y1={c.y} x2={lerp(c.x, a[0], t)} y2={lerp(c.y, a[1], t)} stroke={rgba(c.c, 0.25)} strokeWidth={1.5 / Math.max(0.6, cam.z)} strokeDasharray="6 8" />;
            })}
            {c.topics.map((tp, k) => {
              const [x, y] = starPos(ci, k);
              const t = lit(ci, k);
              if (t <= 0) return null;
              const tw = 0.75 + 0.25 * Math.sin(f / 9 + k * 1.7 + ci);
              const hot = active === ci;
              return (
                <g key={'s' + k} transform={`translate(${x},${y})`} opacity={t}>
                  <circle r={22 * t * tw} fill={c.c} opacity={0.25} filter="url(#g-m)" />
                  <circle r={7 + (hot ? 2 : 0)} fill="#fff" />
                  <circle r={11} fill="none" stroke={c.c} strokeWidth={2} />
                  <text y={42} textAnchor="middle" fontFamily={FONT.sans} fontWeight={600} fontSize={26} fill="#fff" opacity={labelA * (hot ? 1 : 0.55)}>
                    {tp}
                  </text>
                </g>
              );
            })}
            {/* core */}
            <g transform={`translate(${c.x},${c.y})`} opacity={lit(ci, 0)}>
              <circle r={70} fill={c.c} opacity={0.18} filter="url(#g-l)" />
              <circle r={16} fill="#fff" filter="url(#g-m)" />
              <circle r={26 + 6 * Math.sin(f / 12 + ci)} fill="none" stroke={c.c} strokeWidth={2.5} />
              <text y={-58} textAnchor="middle" fontFamily={FONT.serif} fontWeight={900} fontSize={54} fill="#fff" style={{textShadow: 'none'}} filter="url(#g-s)">
                {c.name}
              </text>
              <text y={-18 - 58 - 20} textAnchor="middle" fontFamily={FONT.display} fontSize={22} letterSpacing={6} fill={c.c} opacity={0.9}>
                {c.num}
              </text>
            </g>
          </g>
        ))}
      </g>
    </svg>
  );
};

const HOLD: [number, number][] = [
  [230, 350],
  [410, 530],
  [590, 710],
  [770, 850],
];

export const Galaxy: React.FC = () => {
  const f = useF();
  const keys: Cam[] = [
    [0, 0, 0, 0.5],
    [170, 0, 0, 0.6],
    [230, CL[0].x, CL[0].y, 1.45],
    [350, CL[0].x + 40, CL[0].y, 1.6],
    [410, CL[1].x, CL[1].y, 1.45],
    [530, CL[1].x + 40, CL[1].y, 1.6],
    [590, CL[2].x, CL[2].y, 1.45],
    [710, CL[2].x + 40, CL[2].y, 1.6],
    [770, CL[3].x, CL[3].y, 1.45],
    [850, CL[3].x + 40, CL[3].y, 1.6],
    [905, 0, 0, 0.62],
  ];
  let cam = camAt(f, keys);
  if (f > 905) {
    const t = eIn(clamp01((f - 905) / 55));
    cam = {x: lerp(0, CL[0].x, t), y: lerp(0, CL[0].y, t), z: lerp(0.62, 3.2, t)};
  }
  const lit = (ci: number, k: number) => prog(f, 12 + ci * 22 + k * 7, 26);
  const active = HOLD.findIndex(([a, b]) => f >= a - 30 && f < b + 20);
  return (
    <AbsoluteFill>
      <Sky f={f} cam={cam} lit={lit} linkT={0} active={active} />
      {/* wide-shot titles */}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', pointerEvents: 'none'}}>
        <div
          style={{
            fontFamily: FONT.serif,
            fontWeight: 900,
            fontSize: 84,
            color: '#fff',
            letterSpacing: `${lerp(0.6, 0.3, prog(f, 20, 120))}em`,
            opacity: prog(f, 30, 40) * (1 - prog(f, 170, 30)),
            textShadow: '0 0 40px rgba(140,180,255,0.8)',
          }}
        >
          408 知识星图
        </div>
        <div
          style={{
            fontFamily: FONT.sans,
            fontSize: 30,
            color: COL.sub,
            letterSpacing: '0.3em',
            marginTop: 20,
            opacity: prog(f, 60, 40) * (1 - prog(f, 170, 30)),
          }}
        >
          四门学科 · 四十个核心考点 · 二十六道经典难题
        </div>
      </AbsoluteFill>
      {/* per-cluster callout */}
      {HOLD.map(([a, b], ci) => {
        const vis = prog(f, a - 20, 30) * (1 - prog(f, b, 25));
        if (vis <= 0) return null;
        const c = CL[ci];
        return (
          <div key={ci} style={{position: 'absolute', left: 110, bottom: 96, opacity: vis, transform: `translateX(${(1 - vis) * -40}px)`}}>
            <div style={{fontFamily: FONT.display, fontSize: 24, letterSpacing: '0.4em', color: c.c}}>PART {c.num}</div>
            <div style={{fontFamily: FONT.serif, fontWeight: 900, fontSize: 76, color: '#fff', textShadow: `0 0 30px ${c.c}`}}>{c.name}</div>
            <div style={{fontFamily: FONT.sans, fontSize: 28, color: COL.sub, marginTop: 6}}>
              分值 <b style={{color: c.c, fontFamily: FONT.display}}>{c.score}</b> / 150 · {c.topics.slice(0, 5).join(' · ')} …
            </div>
          </div>
        );
      })}
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, ${rgba(COL.ds, 0.8)}, transparent 60%)`, opacity: prog(f, 925, 35, eIn) * 0.8}} />
    </AbsoluteFill>
  );
};

export const GalaxyCues: Cue[] = [
  ...CL.flatMap((_, ci) => [0, 3, 6, 9].map((k): Cue => [12 + ci * 22 + k * 7, 'spark', 76 + ci * 3 + k])),
  [170, 'whoosh'],
  [350, 'whoosh'],
  [530, 'whoosh'],
  [710, 'whoosh'],
  [850, 'whoosh'],
  [900, 'riser2'],
];

export const GalaxyEnd: React.FC = () => {
  const f = useF();
  const cam = {x: 0, y: 0, z: lerp(0.95, 0.58, eOut(clamp01(f / 300)))};
  const lit = () => 1;
  const linkT = prog(f, 60, 200, eInOut);
  return (
    <AbsoluteFill>
      <Sky f={f + 1000} cam={cam} lit={lit} linkT={linkT} active={-1} />
      <div
        style={{
          position: 'absolute',
          width: 1920,
          bottom: 110,
          textAlign: 'center',
          fontFamily: FONT.serif,
          fontWeight: 800,
          fontSize: 50,
          color: '#fff',
          letterSpacing: '0.16em',
          opacity: prog(f, 120, 50) * (1 - prog(f, 430, 40)),
          textShadow: '0 0 30px rgba(255,217,138,0.7)',
        }}
      >
        每一个考点，都在这张网里彼此相连
      </div>
      <div
        style={{
          position: 'absolute',
          width: 1920,
          bottom: 60,
          textAlign: 'center',
          fontFamily: FONT.sans,
          fontSize: 26,
          color: COL.sub,
          letterSpacing: '0.3em',
          opacity: prog(f, 170, 50) * (1 - prog(f, 430, 40)),
        }}
      >
        队列 → 调度 · 图 → 路由 · Cache → 页面置换 · 中断 → 系统调用
      </div>
    </AbsoluteFill>
  );
};

export const GalaxyEndCues: Cue[] = [
  [60, 'riser2'],
  [120, 'bell', 81],
];
