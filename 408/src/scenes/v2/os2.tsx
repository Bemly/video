import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Txt} from '../../components/kit';
import {Cue, Problem, probCues} from '../../components/Problem';
import {GlowDefs, Pt} from '../../components/ui';
import {clamp01, COL, eBack, eInOut, FONT, lerp, prog, rgba} from '../../theme';

const C = COL.os;
const B = COL.ds;
const A2 = COL.co;
const R = COL.red;

/* ====================================================================== */
/* 19 混合索引：单个文件最大长度                                           */
/* ====================================================================== */

const IN = {
  card: 380,
  reveal: 960,
  steps: [
    {at: 60, label: '10 个直接'},
    {at: 170, label: '一级间接'},
    {at: 320, label: '二级间接'},
    {at: 500, label: '三级间接'},
    {at: 740, label: '求和'},
  ],
};

export const OSInode: React.FC = () => (
  <Problem
    no={19}
    color={C}
    tag="操作系统 · 文件管理"
    title="混合索引与最大文件长度"
    q={[
      ['某文件系统的索引结点含 ', {t: '10 个直接地址项', c: B}, '、', {t: '一级、二级、三级间接地址项各 1 个', c: B}, '；'],
      ['磁盘块大小 ', {t: '1 KB', c: A2}, '，每个块号占 ', {t: '4 B', c: A2}, '。单个文件的最大长度约为？'],
    ]}
    options={['约 16 GB', '约 64 MB', '约 1 GB', '约 256 GB']}
    answer={0}
    brief="10 直接 + 一/二/三级间接，块 1KB、块号 4B：最大文件多大？"
    insight="每个索引块可存 1KB ÷ 4B = 256 个块号：(10 + 256 + 256² + 256³) × 1 KB ≈ 16 GB"
    {...IN}
  >
    {(sf) => <InodeStage sf={sf} />}
  </Problem>
);

const fanTargets = (x: number, y: number, n: number, spread: number): Pt[] => new Array(n).fill(0).map((_, i) => [x, y + (i - (n - 1) / 2) * (spread / Math.max(1, n - 1))]);

const InodeStage: React.FC<{sf: number}> = ({sf}) => {
  const slotY = (i: number) => 250 + i * 42;
  const LX = [520, 800, 1080, 1360];
  const rows = [
    {y: 395, spreads: [150], lbl: '256 × 1 KB = 256 KB', at: 170, slot: 10},
    {y: 575, spreads: [150, 20], lbl: '256² × 1 KB = 64 MB', at: 320, slot: 11},
    {y: 790, spreads: [170, 24, 3.6], lbl: '256³ × 1 KB = 16 GB', at: 500, slot: 12},
  ];
  const lines: React.ReactNode[] = [];
  rows.forEach((row, ri) => {
    const lvT = (lv: number) => prog(sf, row.at + 20 + lv * 50, 50, eInOut);
    // slot -> first index block
    lines.push(<line key={`s${ri}`} x1={340} y1={slotY(row.slot)} x2={lerp(340, LX[0], lvT(-0.4))} y2={lerp(slotY(row.slot), row.y, lvT(-0.4))} stroke={C} strokeWidth={2.5} />);
    let level: Pt[] = [[LX[0], row.y]];
    row.spreads.forEach((sp, lv) => {
      const next: Pt[] = [];
      const t = lvT(lv);
      level.forEach((p, pi) => {
        const tg = fanTargets(LX[lv + 1], p[1], 8, sp);
        tg.forEach((q, qi) => {
          next.push(q);
          if (t > 0) lines.push(<line key={`${ri}-${lv}-${pi}-${qi}`} x1={p[0]} y1={p[1]} x2={lerp(p[0], q[0], t)} y2={lerp(p[1], q[1], t)} stroke={rgba(lv === row.spreads.length - 1 ? A2 : C, lv >= 2 ? 0.35 : 0.6)} strokeWidth={lv >= 2 ? 1 : 1.8} />);
        });
      });
      level = next;
    });
    // markers for blocks
    level.forEach((p, i) => {
      const t = lvT(row.spreads.length - 1);
      if (t >= 1 && (row.spreads.length < 3 || i % 2 === 0)) lines.push(<rect key={`d${ri}-${i}`} x={p[0] - 3} y={p[1] - 3} width={row.spreads.length >= 3 ? 4 : 10} height={row.spreads.length >= 3 ? 4 : 10} fill={A2} />);
    });
  });
  const sum = prog(sf, 740, 40) * (1 - prog(sf, 945, 20));
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <GlowDefs />
        {/* inode */}
        <rect x={140} y={220} width={200} height={13 * 42 + 20} rx={14} fill="rgba(16,10,32,0.9)" stroke={C} strokeWidth={2.5} opacity={prog(sf, 0, 20)} />
        <Txt x={240} y={196} size={26} weight={800} opacity={prog(sf, 0, 20)}>
          索引结点
        </Txt>
        {new Array(13).fill(0).map((_, i) => (
          <g key={i} opacity={prog(sf, i * 3, 14)}>
            <rect x={156} y={slotY(i) - 17} width={168} height={34} rx={6} fill={i < 10 ? rgba(B, 0.18) : rgba(C, 0.3)} stroke={i < 10 ? rgba(B, 0.5) : C} />
            <Txt x={240} y={slotY(i)} size={17} family={FONT.sans} color="#fff">
              {i < 10 ? `直接 ${i}` : ['一级间接', '二级间接', '三级间接'][i - 10]}
            </Txt>
          </g>
        ))}
        {/* direct blocks */}
        {new Array(10).fill(0).map((_, i) => {
          const t = prog(sf, 60 + i * 6, 30, eInOut);
          const tx = 520 + i * 46;
          return (
            <g key={i}>
              <line x1={324} y1={slotY(i)} x2={lerp(324, tx + 16, t)} y2={lerp(slotY(i), 232, t)} stroke={rgba(B, 0.5)} strokeWidth={1.8} />
              <rect x={tx} y={216} width={32} height={32} rx={5} fill={A2} opacity={t >= 1 ? 1 : 0} />
            </g>
          );
        })}
        {lines}
        {rows.map((row, ri) =>
          row.spreads.map((_, lv) => (
            <g key={`${ri}-${lv}`} opacity={prog(sf, row.at + 20 + lv * 50, 20)}>
              <rect x={LX[lv] - 12} y={row.y - 22 - (lv === 0 ? 0 : 0)} width={24} height={44} rx={5} fill={rgba(C, 0.5)} stroke={C} opacity={lv === 0 ? 1 : 0} />
            </g>
          )),
        )}
        {/* size labels */}
        {[
          {y: 232, l: '10 × 1 KB = 10 KB', at: 120, w: 0.14},
          {y: rows[0].y, l: rows[0].lbl, at: 260, w: 0.3},
          {y: rows[1].y, l: rows[1].lbl, at: 440, w: 0.62},
          {y: rows[2].y, l: rows[2].lbl, at: 700, w: 1},
        ].map((s, i) => (
          <g key={i} opacity={prog(sf, s.at, 24)}>
            <Txt x={1440} y={s.y - 20} size={26} weight={800} anchor="start" family={FONT.tech} color={i === 3 ? A2 : '#fff'}>
              {s.l}
            </Txt>
            <rect x={1440} y={s.y + 4} width={380 * s.w * prog(sf, s.at, 40)} height={16} rx={8} fill={i === 3 ? A2 : rgba(C, 0.7)} />
          </g>
        ))}
        <g opacity={sum}>
          <rect x={540} y={880} width={1280} height={80} rx={16} fill="rgba(8,12,24,0.9)" stroke={A2} />
          <Txt x={1180} y={920} size={34} weight={800} family={FONT.tech}>
            (10 + 256 + 256² + 256³) × 1 KB ≈ 16 GB + 64 MB + 256 KB + 10 KB ≈ 16 GB
          </Txt>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export const OSInodeCues: Cue[] = probCues(IN, [[60, 'tick'], [190, 'whoosh'], [340, 'whoosh'], [390, 'whoosh'], [520, 'riser2'], [700, 'blip', 84], [740, 'chime']]);

/* ====================================================================== */
/* 20 磁盘调度                                                             */
/* ====================================================================== */

const DK: {n: string; seq: number[]}[] = [
  {n: 'FCFS 先来先服务', seq: [53, 98, 183, 37, 122, 14, 124, 65, 67]},
  {n: 'SSTF 最短寻道', seq: [53, 65, 67, 37, 14, 98, 122, 124, 183]},
  {n: 'SCAN 电梯（↑）', seq: [53, 65, 67, 98, 122, 124, 183, 199, 37, 14]},
];
const dist = (s: number[]) => s.slice(1).reduce((a, v, i) => a + Math.abs(v - s[i]), 0);
const DSK = {
  card: 380,
  reveal: 860,
  steps: [
    {at: 0, label: '模拟磁头移动'},
    {at: 680, label: '累计寻道距离'},
  ],
};
const MOVE = 60;

export const OSDisk: React.FC = () => (
  <Problem
    no={20}
    color={C}
    tag="操作系统 · I/O 管理"
    title="磁盘调度算法"
    q={[
      ['磁盘柱面 0~199，请求队列：', {t: '98, 183, 37, 122, 14, 124, 65, 67', m: true}, '；'],
      ['磁头当前位于 ', {t: '53 号柱面', c: A2}, '，正向', {t: '柱面号增大', c: A2}, '的方向移动。'],
      ['分别采用 FCFS、SSTF、SCAN 算法，磁头移动的总距离依次为？'],
    ]}
    options={['640, 236, 331', '640, 208, 331', '640, 236, 299', '560, 236, 331']}
    answer={0}
    brief="53 号柱面起步：FCFS / SSTF / SCAN 各走多远？"
    insight="SCAN 会一直走到磁盘端点 199 才折返；若到最远请求即折返则是 LOOK"
    {...DSK}
  >
    {(sf) => <DiskStage sf={sf} />}
  </Problem>
);

const DiskStage: React.FC<{sf: number}> = ({sf}) => {
  const W = 500;
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <GlowDefs />
        {DK.map((d, i) => {
          const ox = 160 + i * 570;
          const X = (c: number) => ox + (c / 199) * W;
          const Y = (k: number) => 290 + k * 52;
          const steps = d.seq.length - 1;
          const u = clamp01((sf - 40) / (steps * MOVE)) * steps;
          const k = Math.floor(u);
          const fr = eInOut(u - k);
          const pts: Pt[] = d.seq.slice(0, k + 1).map((c, j) => [X(c), Y(j)]);
          if (k < steps) pts.push([lerp(X(d.seq[k]), X(d.seq[k + 1]), fr), lerp(Y(k), Y(k + 1), fr)]);
          const head = pts[pts.length - 1];
          const partial = d.seq.slice(0, k + 1).reduce((a, v, j, arr) => (j ? a + Math.abs(v - arr[j - 1]) : 0), 0) + (k < steps ? Math.abs(d.seq[k + 1] - d.seq[k]) * fr : 0);
          const col = [R, B, A2][i];
          return (
            <g key={i} opacity={prog(sf, i * 8, 20)}>
              <Txt x={ox + W / 2} y={200} size={30} weight={800}>
                {d.n}
              </Txt>
              <line x1={ox} y1={250} x2={ox + W} y2={250} stroke="#fff" strokeWidth={2} />
              {[0, 50, 100, 150, 199].map((c) => (
                <g key={c}>
                  <line x1={X(c)} y1={244} x2={X(c)} y2={256} stroke={COL.sub} />
                  <Txt x={X(c)} y={234} size={16} family={FONT.mono} color={COL.dim}>
                    {c}
                  </Txt>
                </g>
              ))}
              {[98, 183, 37, 122, 14, 124, 65, 67].map((c) => (
                <circle key={c} cx={X(c)} cy={250} r={5} fill={d.seq.indexOf(c) <= k ? col : '#fff'} />
              ))}
              {d.seq.map((c, j) => (
                <line key={'g' + j} x1={X(c)} y1={Y(j)} x2={X(c)} y2={250} stroke={rgba(col, 0.1)} strokeDasharray="3 5" opacity={j <= k ? 1 : 0} />
              ))}
              {pts.length > 1 && <path d={`M${pts.map((p) => p.join(',')).join(' L')}`} fill="none" stroke={col} strokeWidth={4} strokeLinejoin="round" filter="url(#g-s)" />}
              {pts.slice(0, k + 1).map((p, j) => (
                <g key={'p' + j}>
                  <circle cx={p[0]} cy={p[1]} r={6} fill="#fff" />
                  <Txt x={p[0] + (j % 2 ? -26 : 26)} y={p[1]} size={17} family={FONT.mono} color={COL.sub}>
                    {d.seq[j]}
                  </Txt>
                </g>
              ))}
              {sf > 40 && <circle cx={head[0]} cy={head[1]} r={12} fill="#fff" filter="url(#g-l)" />}
              <Txt x={ox + W / 2} y={832} size={44} weight={800} family={FONT.tech} color={col}>
                {Math.round(partial)}
              </Txt>
              <Txt x={ox + W / 2} y={872} size={20} color={COL.sub} opacity={prog(sf, 680, 20)}>
                {`移动距离 = ${dist(d.seq)}`}
              </Txt>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

export const OSDiskCues: Cue[] = probCues(DSK, [...new Array(9).fill(0).map((_, k): Cue => [40 + k * MOVE, 'tick']), [680, 'chime']]);

export const _u = eBack;
