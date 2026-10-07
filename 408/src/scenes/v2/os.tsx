import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import {Cell, Comet, Glass, Hi, Txt} from '../../components/kit';
import {Cue, Problem, probCues} from '../../components/Problem';
import {useF} from '../../components/Shot';
import {Arrow, Caption, Cam, GlowDefs, Pt} from '../../components/ui';
import {clamp01, COL, eBack, eInOut, eOut, FONT, lerp, prog, rgba} from '../../theme';

export * from './os2';

const C = COL.os;
const B = COL.ds;
const A2 = COL.co;
const R = COL.red;
const G = COL.green;
const PCOL = [COL.ds, COL.co, COL.red, COL.cn];

/* ====================================================================== */
/* 系统调用：用户态 ↔ 内核态                                               */
/* ====================================================================== */

export const OSSyscall: React.FC = () => {
  const f = useF();
  const UY = 360;
  const KY = 720;
  const BOUND = 540;
  // token path keyframes [frame, x, y]
  const K: [number, number, number][] = [
    [60, 200, UY],
    [190, 620, UY],
    [240, 700, KY],
    [300, 900, KY],
    [360, 1120, KY],
    [410, 1200, KY],
    [460, 1280, UY],
    [520, 1480, UY],
    [560, 1520, KY],
    [640, 1620, KY],
    [690, 1700, UY],
    [760, 1800, UY],
  ];
  let tx = K[0][1];
  let ty = K[0][2];
  for (let i = 0; i < K.length - 1; i++) {
    const [f0, x0, y0] = K[i];
    const [f1, x1, y1] = K[i + 1];
    if (f >= f0) {
      const t = eInOut(clamp01((f - f0) / (f1 - f0)));
      tx = lerp(x0, x1, t);
      ty = lerp(y0, y1, t);
    }
  }
  const kernel = ty > BOUND;
  const trail: Pt[] = [];
  for (let g = 60; g <= Math.min(f, 760); g += 4) {
    let x = K[0][1];
    let y = K[0][2];
    for (let i = 0; i < K.length - 1; i++) {
      const [f0, x0, y0] = K[i];
      const [f1, x1, y1] = K[i + 1];
      if (g >= f0) {
        const t = eInOut(clamp01((g - f0) / (f1 - f0)));
        x = lerp(x0, x1, t);
        y = lerp(y0, y1, t);
      }
    }
    trail.push([x, y]);
  }
  const events = [
    {t: 190, x: 660, lbl: '陷入指令（访管）', c: A2, up: false},
    {t: 410, x: 1240, lbl: '中断返回', c: G, up: true},
    {t: 520, x: 1500, lbl: '时钟中断', c: R, up: false},
    {t: 640, x: 1660, lbl: '中断返回', c: G, up: true},
  ];
  return (
    <AbsoluteFill>
      <Cam to={1.03}>
        <svg width={1920} height={1080}>
          <GlowDefs />
          <rect x={120} y={UY - 120} width={1720} height={240} rx={24} fill={rgba(B, 0.06)} stroke={rgba(B, 0.35)} opacity={prog(f, 0, 30)} />
          <rect x={120} y={KY - 120} width={1720} height={240} rx={24} fill={rgba(C, 0.08)} stroke={rgba(C, 0.4)} opacity={prog(f, 10, 30)} />
          <Txt x={150} y={UY - 90} size={30} weight={800} anchor="start" color={B} opacity={prog(f, 0, 30)}>
            用户态 User Mode
          </Txt>
          <Txt x={150} y={KY + 90} size={30} weight={800} anchor="start" color={C} opacity={prog(f, 10, 30)}>
            内核态 Kernel Mode
          </Txt>
          <line x1={120} y1={BOUND} x2={1840} y2={BOUND} stroke="#fff" strokeWidth={2} strokeDasharray="10 10" opacity={prog(f, 20, 30) * 0.5} />
          <Txt x={1830} y={BOUND - 18} size={20} anchor="end" color={COL.sub} opacity={prog(f, 20, 30)}>
            特权级边界：特权指令只能在内核态执行
          </Txt>
          {/* code chip */}
          <g opacity={prog(f, 70, 20) * (1 - prog(f, 240, 20))}>
            <rect x={300} y={UY + 40} width={420} height={56} rx={10} fill="rgba(8,12,24,0.9)" stroke={rgba(B, 0.5)} />
            <Txt x={510} y={UY + 68} size={24} family={FONT.mono}>
              n = read(fd, buf, 100);
            </Txt>
          </g>
          {/* kernel work boxes */}
          {[
            {x: 820, t: '系统调用处理', at: 260},
            {x: 1060, t: '设备驱动 / I/O', at: 320},
            {x: 1600, t: '进程调度', at: 580},
          ].map((b, i) => (
            <g key={i} opacity={prog(f, b.at, 20)}>
              <rect x={b.x - 100} y={KY + 30} width={200} height={56} rx={12} fill={rgba(C, 0.2)} stroke={C} />
              <Txt x={b.x} y={KY + 58} size={22} weight={700}>
                {b.t}
              </Txt>
            </g>
          ))}
          {trail.length > 1 && <path d={`M${trail.map((p) => p.join(',')).join(' L')}`} fill="none" stroke={rgba('#fff', 0.5)} strokeWidth={3} strokeDasharray="4 6" />}
          {events.map((e, i) => (
            <g key={i} opacity={prog(f, e.t, 16)}>
              <Arrow pts={e.up ? [[e.x, KY - 40], [e.x + 40, UY + 40]] : [[e.x, UY + 40], [e.x + 40, KY - 40]]} t={prog(f, e.t, 30)} color={e.c} w={4} />
              <Txt x={e.x + 60} y={BOUND + (e.up ? 34 : -34)} size={22} weight={700} anchor="start" color={e.c}>
                {e.lbl}
              </Txt>
            </g>
          ))}
          {f >= 500 && f < 560 && (
            <path d={`M1760,${UY - 100} L1720,${UY - 20} L1750,${UY - 20} L1700,${UY + 70}`} fill="none" stroke={R} strokeWidth={5} filter="url(#g-m)" opacity={1 - clamp01((f - 540) / 20)} />
          )}
          {f >= 60 && (
            <g transform={`translate(${tx},${ty})`}>
              <circle r={26} fill={kernel ? C : B} filter="url(#g-l)" />
              <Txt x={0} y={1} size={20} weight={800} color="#04101a">
                P
              </Txt>
            </g>
          )}
        </svg>
        {/* PSW */}
        <div
          style={{
            position: 'absolute',
            right: 110,
            top: 150,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            fontFamily: FONT.mono,
            fontSize: 26,
            color: '#fff',
            opacity: prog(f, 30, 20),
          }}
        >
          PSW 模式位
          <span style={{padding: '4px 18px', borderRadius: 10, background: kernel ? C : B, color: '#04101a', fontWeight: 800}}>{kernel ? '1 · 核心态' : '0 · 用户态'}</span>
        </div>
        <Glass x={460} y={140} w={900} color={C} opacity={prog(f, 680, 30)} style={{fontFamily: FONT.sans, fontSize: 24, lineHeight: '40px', textAlign: 'center'}}>
          进入内核的三条路：<Hi c={R}>外中断</Hi>（时钟、I/O）· <Hi c={A2}>异常</Hi>（缺页、除零）· <Hi c={B}>陷入</Hi>（系统调用）
        </Glass>
      </Cam>
      <Caption title="系统调用" en="SYSTEM CALL" desc="用户程序通过陷入指令请求内核服务，中断返回后回到用户态" chip="特权指令" color={C} />
    </AbsoluteFill>
  );
};

export const OSSyscallCues: Cue[] = [[190, 'whoosh'], [260, 'blip', 72], [320, 'blip', 76], [410, 'whoosh'], [520, 'error'], [580, 'blip', 79], [640, 'whoosh'], [680, 'chime']];

/* ====================================================================== */
/* 15 四种调度算法对比                                                     */
/* ====================================================================== */

const SP = [
  {arr: 0, svc: 7},
  {arr: 2, svc: 4},
  {arr: 4, svc: 1},
  {arr: 5, svc: 4},
];
const SCH: {name: string; segs: [number, number, number][]; avg: number}[] = [
  {name: 'FCFS', segs: [[0, 0, 7], [1, 7, 11], [2, 11, 12], [3, 12, 16]], avg: 8.75},
  {name: 'SJF', segs: [[0, 0, 7], [2, 7, 8], [1, 8, 12], [3, 12, 16]], avg: 8},
  {name: 'SRTF', segs: [[0, 0, 2], [1, 2, 4], [2, 4, 5], [1, 5, 7], [3, 7, 11], [0, 11, 16]], avg: 7},
  {name: 'RR q=2', segs: [[0, 0, 2], [1, 2, 4], [0, 4, 6], [2, 6, 7], [1, 7, 9], [3, 9, 11], [0, 11, 13], [3, 13, 15], [0, 15, 16]], avg: 9},
];
const SC = {
  card: 380,
  reveal: 1120,
  steps: [
    {at: 0, label: '同步画甘特图'},
    {at: 720, label: '算周转时间'},
    {at: 940, label: '比较'},
  ],
};

export const OSSchedCmp: React.FC = () => (
  <Problem
    no={15}
    color={C}
    tag="操作系统 · 处理机调度"
    title="调度算法大比拼"
    q={[
      ['进程 P1~P4 的到达时间与运行时间分别为 ', {t: '(0,7) (2,4) (4,1) (5,4)', m: true}, '。'],
      ['分别采用 ', {t: 'FCFS', c: B}, '、', {t: 'SJF（非抢占）', c: B}, '、', {t: 'SRTF（抢占式短作业优先）', c: B}, '、', {t: 'RR（q = 2）', c: B}, '，'],
      [{t: '平均周转时间最短', c: A2}, '的是哪一种？'],
    ]}
    options={['FCFS', 'SJF（非抢占）', 'SRTF（抢占式）', 'RR（q = 2）']}
    answer={2}
    brief="4 个进程 · FCFS / SJF / SRTF / RR：谁的平均周转时间最短？"
    insight="周转时间 = 完成时间 − 到达时间；SRTF 平均 7，是四者中最短"
    {...SC}
  >
    {(sf) => <SchedStage sf={sf} />}
  </Problem>
);

const SchedStage: React.FC<{sf: number}> = ({sf}) => {
  const X0 = 400;
  const U = 68;
  const t = clamp01((sf - 60) / 640) * 16;
  const rowY = (i: number) => 330 + i * 130;
  const cmp = prog(sf, 940, 40);
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <GlowDefs />
        {/* process chips */}
        {SP.map((p, i) => (
          <g key={i} opacity={prog(sf, i * 5, 20)}>
            <rect x={400 + i * 250} y={190} width={220} height={52} rx={26} fill={rgba(PCOL[i], 0.2)} stroke={PCOL[i]} />
            <Txt x={510 + i * 250} y={217} size={24} family={FONT.mono} weight={700}>
              {`P${i + 1}  到达${p.arr} 运行${p.svc}`}
            </Txt>
          </g>
        ))}
        {/* arrival markers */}
        {SP.map((p, i) => (
          <g key={'a' + i} opacity={t >= p.arr ? 1 : 0.2}>
            <Txt x={X0 + p.arr * U} y={285} size={18} family={FONT.tech} weight={700} color={PCOL[i]}>
              {`P${i + 1}↓`}
            </Txt>
          </g>
        ))}
        {SCH.map((s, r) => (
          <g key={r} opacity={prog(sf, r * 8, 20)}>
            <Txt x={X0 - 20} y={rowY(r) + 32} size={28} weight={800} anchor="end" family={FONT.tech}>
              {s.name}
            </Txt>
            <rect x={X0} y={rowY(r)} width={16 * U} height={64} rx={8} fill="rgba(255,255,255,0.03)" stroke={rgba('#fff', 0.12)} />
            {s.segs.map(([p, a, b], k) => {
              const w = clamp01((t - a) / (b - a)) * (b - a) * U;
              if (w <= 0) return null;
              return (
                <g key={k}>
                  <rect x={X0 + a * U + 2} y={rowY(r) + 2} width={Math.max(0, w - 4)} height={60} rx={7} fill={rgba(PCOL[p], 0.75)} stroke={PCOL[p]} />
                  {w > U * 0.7 && (
                    <Txt x={X0 + a * U + ((b - a) * U) / 2} y={rowY(r) + 33} size={22} weight={800} color="#0a0a14" family={FONT.tech}>
                      {`P${p + 1}`}
                    </Txt>
                  )}
                </g>
              );
            })}
            <Txt x={X0 + 16 * U + 30} y={rowY(r) + 32} size={30} weight={800} anchor="start" family={FONT.tech} color={s.name === 'SRTF' && cmp > 0 ? A2 : '#fff'} opacity={prog(sf, 720 + r * 40, 24)}>
              {`T̄ = ${s.avg}`}
            </Txt>
            {/* bar compare */}
            <rect x={X0 + 16 * U + 170} y={rowY(r) + 14} width={s.avg * 36 * cmp} height={36} rx={8} fill={s.name === 'SRTF' ? A2 : rgba(C, 0.6)} filter={s.name === 'SRTF' ? 'url(#g-s)' : undefined} />
          </g>
        ))}
        {new Array(17).fill(0).map((_, k) => (
          <Txt key={k} x={X0 + k * U} y={rowY(3) + 96} size={18} family={FONT.mono} color={k <= t ? '#fff' : COL.dim}>
            {k}
          </Txt>
        ))}
        {sf > 60 && sf < 720 && <line x1={X0 + t * U} y1={300} x2={X0 + t * U} y2={rowY(3) + 76} stroke="#fff" strokeWidth={3} filter="url(#g-m)" />}
      </svg>
    </AbsoluteFill>
  );
};

export const OSSchedCmpCues: Cue[] = probCues(SC, [[60, 'riser2'], ...[0, 1, 2, 3].map((r): Cue => [720 + r * 40, 'tick']), [940, 'chime']]);

/* ====================================================================== */
/* 16 读者—写者                                                            */
/* ====================================================================== */

type RWEv = {t: number; who: string; act: 'arrive' | 'enter' | 'block' | 'leave'};
const RW_EVENTS: RWEv[] = [
  {t: 40, who: 'R1', act: 'arrive'},
  {t: 80, who: 'R1', act: 'enter'},
  {t: 200, who: 'W', act: 'arrive'},
  {t: 240, who: 'W', act: 'block'},
  {t: 340, who: 'R2', act: 'arrive'},
  {t: 380, who: 'R2', act: 'enter'},
  {t: 450, who: 'R3', act: 'arrive'},
  {t: 490, who: 'R3', act: 'enter'},
  {t: 580, who: 'R1', act: 'leave'},
  {t: 660, who: 'R2', act: 'leave'},
  {t: 740, who: 'R3', act: 'leave'},
  {t: 790, who: 'W', act: 'enter'},
  {t: 900, who: 'W', act: 'leave'},
];
const RWP = {
  card: 400,
  reveal: 540,
  steps: [
    {at: 0, label: '读者进入'},
    {at: 200, label: '写者到达'},
    {at: 340, label: '读者插队'},
    {at: 740, label: '写者才进入'},
  ],
};

export const OSRw: React.FC = () => (
  <Problem
    no={16}
    color={C}
    tag="操作系统 · 进程同步"
    title="读者—写者问题"
    q={[
      ['读者可以同时读，写者必须互斥访问。采用', {t: '读者优先', c: A2}, '算法：'],
      ['第一个读者进入时执行 ', {t: 'P(rw)', m: true}, '，最后一个读者离开时执行 ', {t: 'V(rw)', m: true}, '，count 由 mutex 保护。'],
      ['若读者 R1 正在读，此时写者 W 到达，随后读者 R2 到达，则？'],
    ]}
    options={['W 先写，R2 等待 W 写完', 'R2 立即开始读，W 继续等待', 'R2 与 W 都必须等待 R1 读完', 'R2 与 W 同时进入']}
    answer={1}
    brief="读者优先：R1 在读，W 来了，R2 又来了——谁先进？"
    insight="只要还有读者在读，后来的读者就能直接进入 ⇒ 写者可能「饿死」"
    {...RWP}
  >
    {(sf) => <RwStage sf={sf} />}
  </Problem>
);

const RwStage: React.FC<{sf: number}> = ({sf}) => {
  const room = {x: 640, y: 260, w: 640, h: 420};
  const people = ['R1', 'R2', 'R3', 'W'];
  const state = (who: string) => {
    let s: RWEv['act'] | 'none' = 'none';
    let at = 0;
    for (const e of RW_EVENTS) if (e.who === who && sf >= e.t) {
      s = e.act;
      at = e.t;
    }
    return {s, at};
  };
  const inside = people.filter((p) => state(p).s === 'enter');
  const count = inside.filter((p) => p[0] === 'R').length;
  const rw = inside.length > 0 ? 0 : 1;
  const posOf = (who: string): Pt | null => {
    const {s, at} = state(who);
    if (s === 'none') return null;
    const isW = who === 'W';
    const slotIn = inside.indexOf(who);
    const inPos: Pt = isW ? [room.x + room.w / 2, room.y + room.h / 2] : [room.x + 160 + Math.max(0, slotIn) * 160, room.y + room.h / 2 + 60];
    const waitPos: Pt = [room.x - 170, room.y + (isW ? 150 : 300)];
    const startPos: Pt = [150, room.y + (isW ? 150 : 300)];
    const outPos: Pt = [room.x + room.w + 220, room.y + 200];
    const k = eInOut(clamp01((sf - at) / 36));
    if (s === 'arrive') return [lerp(startPos[0], waitPos[0], k), lerp(startPos[1], waitPos[1], k)];
    if (s === 'block') return waitPos;
    if (s === 'enter') return [lerp(waitPos[0], inPos[0], k), lerp(waitPos[1], inPos[1], k)];
    return [lerp(inPos[0], outPos[0], k), lerp(inPos[1], outPos[1], k)];
  };
  const wBlocked = state('W').s === 'block';
  const code = [
    {l: 'P(mutex);', r: true},
    {l: 'if (count == 0) P(rw);', r: true},
    {l: 'count++;  V(mutex);', r: true},
    {l: '读文件……', r: true},
    {l: 'P(mutex);  count--;', r: true},
    {l: 'if (count == 0) V(rw);', r: true},
    {l: 'V(mutex);', r: true},
  ];
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <GlowDefs />
        <rect x={room.x} y={room.y} width={room.w} height={room.h} rx={28} fill={rgba(C, 0.06)} stroke={C} strokeWidth={3} filter="url(#g-s)" />
        <rect x={room.x - 6} y={room.y + 110} width={12} height={240} rx={6} fill={rw ? G : R} filter="url(#g-m)" />
        <Txt x={room.x + room.w / 2} y={room.y + 40} size={28} weight={800}>
          共享文件
        </Txt>
        <g transform={`translate(${room.x + room.w / 2},${room.y + 120})`}>
          <rect x={-50} y={-40} width={100} height={80} rx={8} fill={rgba(A2, 0.2)} stroke={A2} />
          {[0, 1, 2, 3].map((k) => (
            <line key={k} x1={-32} y1={-22 + k * 15} x2={k === 3 ? 10 : 32} y2={-22 + k * 15} stroke={A2} strokeWidth={3} strokeLinecap="round" />
          ))}
        </g>
        {wBlocked && (
          <g opacity={0.6 + 0.4 * Math.sin(sf / 6)}>
            <Txt x={room.x - 170} y={room.y + 90} size={24} weight={800} color={R}>
              阻塞在 P(rw)
            </Txt>
          </g>
        )}
        {people.map((p) => {
          const pos = posOf(p);
          if (!pos) return null;
          const isW = p === 'W';
          const col = isW ? A2 : B;
          const {s, at} = state(p);
          const fade = s === 'leave' ? 1 - clamp01((sf - at - 20) / 20) : 1;
          return (
            <g key={p} transform={`translate(${pos[0]},${pos[1]})`} opacity={fade}>
              <circle r={44} fill={rgba(col, s === 'enter' ? 0.6 : 0.25)} stroke={col} strokeWidth={3} filter="url(#g-m)" />
              <Txt x={0} y={1} size={28} weight={800} family={FONT.tech}>
                {p}
              </Txt>
            </g>
          );
        })}
        {/* semaphores */}
        {[
          {n: 'rw', v: rw, c: rw ? G : R},
          {n: 'count', v: count, c: B},
        ].map((s, i) => (
          <g key={s.n} transform={`translate(${room.x + 160 + i * 320},${room.y + room.h + 80})`}>
            <rect x={-110} y={-36} width={220} height={72} rx={14} fill="rgba(8,12,24,0.9)" stroke={s.c} strokeWidth={2.5} />
            <Txt x={-40} y={0} size={24} family={FONT.mono} color={COL.sub}>
              {s.n}
            </Txt>
            <Txt x={50} y={0} size={40} family={FONT.tech} weight={800} color={s.c}>
              {s.v}
            </Txt>
          </g>
        ))}
        {sf > 780 && (
          <Txt x={room.x + room.w / 2} y={room.y + room.h + 170} size={28} weight={800} color={R} opacity={prog(sf, 780, 20)}>
            读者源源不断时，写者将被「饿死」
          </Txt>
        )}
      </svg>
      <Glass x={1360} y={220} w={450} color={C} opacity={prog(sf, 20, 30)} style={{fontSize: 22, lineHeight: '40px'}}>
        <div style={{fontFamily: FONT.sans, color: B, fontSize: 22}}>reader()</div>
        {code.map((c, i) => (
          <div key={i} style={{color: COL.sub}}>
            {c.l}
          </div>
        ))}
        <div style={{fontFamily: FONT.sans, color: A2, fontSize: 22, marginTop: 8}}>writer()</div>
        <div style={{color: COL.sub}}>P(rw); 写文件; V(rw);</div>
      </Glass>
    </AbsoluteFill>
  );
};

export const OSRwCues: Cue[] = probCues(RWP, RW_EVENTS.map((e): Cue => [e.t, e.act === 'block' ? 'error' : e.act === 'enter' ? 'blip' : 'tick', e.who === 'W' ? 67 : 76]));

/* ====================================================================== */
/* 17 银行家算法                                                           */
/* ====================================================================== */

const MAX = [
  [7, 5, 3],
  [3, 2, 2],
  [9, 0, 2],
  [2, 2, 2],
  [4, 3, 3],
];
const ALLOC = [
  [0, 1, 0],
  [2, 0, 0],
  [3, 0, 2],
  [2, 1, 1],
  [0, 0, 2],
];
const NEED = MAX.map((m, i) => m.map((v, j) => v - ALLOC[i][j]));
const CHECKS: {p: number; ok: boolean}[] = [
  {p: 0, ok: false},
  {p: 1, ok: true},
  {p: 2, ok: false},
  {p: 3, ok: true},
  {p: 4, ok: true},
  {p: 0, ok: true},
  {p: 2, ok: true},
];
const BK = {
  card: 400,
  reveal: 1130,
  steps: [
    {at: 0, label: 'Need = Max − Allocation'},
    {at: 240, label: '安全性检查'},
    {at: 1060, label: '安全序列'},
  ],
};
const CT = (k: number) => 260 + k * 112;

export const OSBanker: React.FC = () => (
  <Problem
    no={17}
    color={C}
    tag="操作系统 · 死锁避免"
    title="银行家算法"
    q={[
      ['系统有 A、B、C 三类资源，T₀ 时刻 5 个进程的资源情况如下，', {t: 'Available = (3, 3, 2)', m: true, c: A2}, '：'],
      [{t: 'Max：P0(7,5,3) P1(3,2,2) P2(9,0,2) P3(2,2,2) P4(4,3,3)', m: true, c: '#dde6f6'}],
      [{t: 'Allocation：P0(0,1,0) P1(2,0,0) P2(3,0,2) P3(2,1,1) P4(0,0,2)', m: true, c: '#dde6f6'}],
      ['此时系统是否安全？'],
    ]}
    options={['不安全', '安全，<P1, P3, P4, P0, P2>', '安全，<P0, P1, P2, P3, P4>', '安全，<P4, P1, P3, P0, P2>']}
    answer={1}
    brief="Available (3,3,2)：找得到安全序列吗？"
    insight="每一步只挑 Need ≤ Work 的进程，它跑完归还资源，Work 越滚越大"
    {...BK}
  >
    {(sf) => <BankerStage sf={sf} />}
  </Problem>
);

const BankerStage: React.FC<{sf: number}> = ({sf}) => {
  const k = CHECKS.reduce((acc, _, i) => (sf >= CT(i) ? i : acc), -1);
  const work = [3, 3, 2];
  const seq: number[] = [];
  CHECKS.forEach((c, i) => {
    if (c.ok && sf >= CT(i) + 70) {
      work[0] += ALLOC[c.p][0];
      work[1] += ALLOC[c.p][1];
      work[2] += ALLOC[c.p][2];
      seq.push(c.p);
    }
  });
  const cur = k >= 0 && sf < CT(k) + 112 ? CHECKS[k] : null;
  const colX = [220, 340, 700, 1060];
  const rowY = (i: number) => 300 + i * 70;
  const headers = ['进程', 'Max', 'Allocation', 'Need'];
  const needA = (i: number) => prog(sf, 20 + i * 36, 20);
  const done = sf >= CT(6) + 80;
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <GlowDefs />
        {headers.map((h, j) => (
          <Txt key={h} x={j === 0 ? colX[0] : colX[j] + 150} y={236} size={24} color={j === 3 ? A2 : COL.sub} weight={700}>
            {h}
          </Txt>
        ))}
        {['A', 'B', 'C'].map((r, j) =>
          [1, 2, 3].map((c) => (
            <Txt key={r + c} x={colX[c] + 50 + j * 100} y={266} size={18} family={FONT.mono} color={COL.dim}>
              {r}
            </Txt>
          )),
        )}
        {MAX.map((_, i) => {
          const isCur = cur && cur.p === i;
          const fin = seq.includes(i);
          return (
            <g key={i}>
              <rect x={160} y={rowY(i) - 28} width={1240} height={56} rx={10} fill={isCur ? rgba(cur!.ok ? G : R, 0.14) : fin ? rgba(C, 0.08) : 'transparent'} stroke={isCur ? (cur!.ok ? G : R) : 'transparent'} />
              <Txt x={colX[0]} y={rowY(i)} size={28} weight={800} family={FONT.tech} color={fin ? C : '#fff'}>
                {`P${i}${fin ? ' ✓' : ''}`}
              </Txt>
              {[MAX[i], ALLOC[i]].map((vec, c) =>
                vec.map((v, j) => (
                  <Txt key={`${c}-${j}`} x={colX[c + 1] + 50 + j * 100} y={rowY(i)} size={28} family={FONT.mono} color={fin ? COL.dim : '#fff'}>
                    {v}
                  </Txt>
                )),
              )}
              {NEED[i].map((v, j) => {
                const cmpOk = v <= (cur ? work[j] : 99);
                return (
                  <Txt key={'n' + j} x={colX[3] + 50 + j * 100} y={rowY(i)} size={28} family={FONT.mono} weight={800} color={isCur ? (cmpOk ? G : R) : fin ? COL.dim : A2} opacity={needA(i)}>
                    {v}
                  </Txt>
                );
              })}
            </g>
          );
        })}
        {/* work vector */}
        <g opacity={prog(sf, 240, 30)}>
          <Txt x={1560} y={236} size={26} weight={800} color={A2}>
            Work（可用）
          </Txt>
          {['A', 'B', 'C'].map((r, j) => {
            const h = work[j] * 34;
            return (
              <g key={r}>
                <rect x={1470 + j * 90} y={720 - h} width={60} height={h} rx={8} fill={rgba(A2, 0.6)} stroke={A2} filter="url(#g-s)" />
                <Txt x={1500 + j * 90} y={700 - h} size={28} weight={800} family={FONT.tech}>
                  {work[j]}
                </Txt>
                <Txt x={1500 + j * 90} y={745} size={22} color={COL.sub} family={FONT.mono}>
                  {r}
                </Txt>
              </g>
            );
          })}
        </g>
        {cur && (
          <Txt x={780} y={680} size={28} weight={700} color={cur.ok ? G : R} opacity={prog(sf, CT(k), 14)}>
            {cur.ok
              ? `Need(P${cur.p}) = (${NEED[cur.p].join(',')}) ≤ Work ⇒ P${cur.p} 可完成，归还 (${ALLOC[cur.p].join(',')})`
              : `Need(P${cur.p}) = (${NEED[cur.p].join(',')}) > Work ⇒ 暂时跳过`}
          </Txt>
        )}
        {/* sequence */}
        <g opacity={prog(sf, 300, 20)}>
          <Txt x={220} y={790} size={26} color={COL.sub} anchor="start">
            安全序列
          </Txt>
          {seq.map((p, i) => (
            <g key={i} transform={`translate(${400 + i * 150},790) scale(${eBack(clamp01((sf - CT(CHECKS.findIndex((c, ci) => c.ok && c.p === p && ci >= 0)) - 70) / 18))})`}>
              <rect x={-55} y={-30} width={110} height={60} rx={30} fill={done ? A2 : rgba(C, 0.3)} stroke={done ? A2 : C} strokeWidth={2} />
              <Txt x={0} y={1} size={28} weight={800} family={FONT.tech} color={done ? '#1a1000' : '#fff'}>
                {`P${p}`}
              </Txt>
            </g>
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export const OSBankerCues: Cue[] = probCues(BK, [...[0, 1, 2, 3, 4].map((i): Cue => [20 + i * 36, 'tick']), ...CHECKS.map((c, i): Cue => [CT(i), c.ok ? 'blip' : 'error', 72 + i * 2]), [CT(6) + 80, 'chime']]);

/* ====================================================================== */
/* 18 页面置换 FIFO / LRU / OPT                                            */
/* ====================================================================== */

const REFS = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1];
const simulate = (kind: 'FIFO' | 'LRU' | 'OPT') => {
  const frames: (number | null)[] = [null, null, null];
  const load: number[] = [0, 0, 0];
  const used: number[] = [0, 0, 0];
  const cols: {fr: (number | null)[]; fault: boolean; slot: number}[] = [];
  REFS.forEach((p, t) => {
    const hit = frames.indexOf(p);
    if (hit >= 0) {
      used[hit] = t;
      cols.push({fr: [...frames], fault: false, slot: hit});
      return;
    }
    let slot = frames.indexOf(null);
    if (slot < 0) {
      if (kind === 'FIFO') slot = load.indexOf(Math.min(...load));
      else if (kind === 'LRU') slot = used.indexOf(Math.min(...used));
      else {
        const nextUse = frames.map((q) => {
          const n = REFS.indexOf(q!, t + 1);
          return n < 0 ? Infinity : n;
        });
        slot = nextUse.indexOf(Math.max(...nextUse));
      }
    }
    frames[slot] = p;
    load[slot] = t;
    used[slot] = t;
    cols.push({fr: [...frames], fault: true, slot});
  });
  return cols;
};
const RP = {
  card: 400,
  reveal: 1070,
  steps: [
    {at: 0, label: '逐次访问'},
    {at: 800, label: '统计缺页'},
  ],
};

export const OSReplace: React.FC = () => (
  <Problem
    no={18}
    color={C}
    tag="操作系统 · 虚拟内存"
    title="页面置换算法"
    q={[
      ['页面引用串：', {t: '7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1', m: true}],
      ['为进程分配 ', {t: '3 个物理块', c: A2}, '（初始为空），分别采用 ', {t: 'FIFO', c: B}, '、', {t: 'LRU', c: B}, '、', {t: 'OPT', c: B}, ' 置换算法，'],
      ['缺页次数分别是？'],
    ]}
    options={['15, 12, 9', '15, 12, 8', '12, 15, 9', '14, 12, 9']}
    answer={0}
    brief="引用串 20 次 · 3 个物理块：FIFO / LRU / OPT 各缺页几次？"
    insight="OPT 淘汰「最久以后才用」的页，是理论最优；LRU 用「最近最久未用」逼近它"
    {...RP}
  >
    {(sf) => <ReplaceStage sf={sf} />}
  </Problem>
);

const ReplaceStage: React.FC<{sf: number}> = ({sf}) => {
  const sims = useMemo(() => (['FIFO', 'LRU', 'OPT'] as const).map((k) => ({k, cols: simulate(k)})), []);
  const X0 = 330;
  const CWd = 72;
  const n = Math.min(20, Math.max(0, Math.floor((sf - 40) / 36) + 1));
  const sum = prog(sf, 800, 40);
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <GlowDefs />
        {REFS.map((p, t) => (
          <g key={t}>
            <Cell x={X0 + t * CWd + 4} y={200} w={CWd - 8} h={46} text={p} color={A2} fill={t === n - 1 ? 0.7 : t < n ? 0.15 : 0} dim={t >= n} size={24} />
          </g>
        ))}
        {sims.map((s, r) => {
          const y0 = 290 + r * 205;
          const faults = s.cols.slice(0, n).filter((c) => c.fault).length;
          return (
            <g key={s.k} opacity={prog(sf, r * 8, 20)}>
              <Txt x={X0 - 24} y={y0 + 70} size={30} weight={800} anchor="end" family={FONT.tech}>
                {s.k}
              </Txt>
              {s.cols.slice(0, n).map((c, t) => (
                <g key={t}>
                  {c.fr.map((v, j) => {
                    const isNew = c.fault && j === c.slot;
                    const isHit = !c.fault && j === c.slot;
                    return (
                      <rect key={j} x={X0 + t * CWd + 4} y={y0 + j * 46} width={CWd - 8} height={40} rx={6} fill={isNew ? rgba(R, 0.55) : isHit ? rgba(G, 0.45) : v === null ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)'} stroke={isNew ? R : isHit ? G : rgba('#fff', 0.12)} />
                    );
                  })}
                  {c.fr.map((v, j) =>
                    v === null ? null : (
                      <text key={'t' + j} x={X0 + t * CWd + CWd / 2} y={y0 + j * 46 + 21} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT.tech} fontWeight={700} fontSize={22} fill="#fff">
                        {v}
                      </text>
                    ),
                  )}
                  {c.fault && (
                    <Txt x={X0 + t * CWd + CWd / 2} y={y0 + 158} size={20} color={R} weight={800}>
                      ✗
                    </Txt>
                  )}
                </g>
              ))}
              <Txt x={X0 + 20 * CWd + 30} y={y0 + 60} size={40} weight={800} anchor="start" family={FONT.tech} color={R}>
                {faults}
              </Txt>
              <Txt x={X0 + 20 * CWd + 30} y={y0 + 100} size={20} anchor="start" color={COL.sub}>
                次缺页
              </Txt>
              <rect x={X0 + 20 * CWd + 100} y={y0 + 44} width={faults * 9 * sum} height={30} rx={6} fill={s.k === 'OPT' ? A2 : rgba(C, 0.6)} />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

export const OSReplaceCues: Cue[] = (() => {
  const f = simulate('LRU');
  return probCues(RP, [...REFS.map((_, t): Cue => [40 + t * 36, f[t].fault ? 'tick' : 'blip', 84]), [800, 'chime']]);
})();

export const _u = [Comet, eOut];
