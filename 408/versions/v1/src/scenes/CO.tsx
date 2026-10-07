import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ActTitle} from '../components/ActTitle';
import {useF} from '../components/Shot';
import {along, Arrow, Caption, Cam, GlowDefs, Pt} from '../components/ui';
import {clamp01, COL, eBack, eInOut, eOut, FONT, lerp, prog, rgba, rnd} from '../theme';

const C = COL.co;

export const COTitle: React.FC = () => (
  <ActTitle
    num="02"
    zh="计算机组成原理"
    en="COMPUTER ORGANIZATION"
    color={C}
    score={45}
    topics={['数据的表示与运算', '存储系统', '指令系统', '中央处理器', '总线', '输入/输出系统']}
    quote="存储程序，程序控制"
    by="John von Neumann"
  />
);

/* ============================ von Neumann ============================ */

const Box: React.FC<{x: number; y: number; w: number; h: number; zh: string; en: string; a: number; hi?: number; children?: React.ReactNode}> = ({
  x,
  y,
  w,
  h,
  zh,
  en,
  a,
  hi = 0,
  children,
}) => {
  const s = eBack(clamp01(a));
  return (
    <g transform={`translate(${x},${y}) scale(${lerp(0.6, 1, s)})`} opacity={clamp01(a * 2)}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={16} fill={rgba('#1a1204', 0.85)} stroke={C} strokeWidth={2.5 + hi * 2} filter="url(#g-m)" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={16} fill={rgba(C, 0.06 + hi * 0.18)} />
      {children ?? (
        <>
          <text y={4} textAnchor="middle" fontFamily={FONT.sans} fontWeight={800} fontSize={36} fill="#fff">
            {zh}
          </text>
          <text y={36} textAnchor="middle" fontFamily={FONT.tech} fontSize={20} letterSpacing={4} fill={rgba(C, 0.85)}>
            {en}
          </text>
        </>
      )}
    </g>
  );
};

const PROG = ['LOAD  R1, [0x8]', 'ADD   R1, R2', 'STORE R1, [0x9]', 'JMP   0x0'];

export const COVonNeumann: React.FC = () => {
  const f = useF();
  const dataT = (i: number) => prog(f, 70 + i * 12, 34, eInOut);
  const ctrlT = (i: number) => prog(f, 124 + i * 8, 30, eInOut);
  const data: Pt[][] = [
    [
      [460, 420],
      [600, 420],
      [600, 250],
      [748, 250],
    ],
    [
      [1172, 250],
      [1320, 250],
      [1320, 420],
      [1458, 420],
    ],
    [
      [835, 337],
      [835, 498],
    ],
    [
      [868, 498],
      [868, 337],
    ],
    [
      [1090, 337],
      [1090, 498],
    ],
  ];
  const ctrl: Pt[][] = [
    [
      [1130, 498],
      [1130, 337],
    ],
    [
      [1200, 622],
      [1200, 730],
      [330, 730],
      [330, 477],
    ],
    [
      [1342, 560],
      [1590, 560],
      [1590, 477],
    ],
    [
      [1058, 575],
      [902, 575],
    ],
  ];
  const pc = Math.floor(Math.max(0, f - 150) / 30) % PROG.length;
  const pcY = lerp(0, 1, eInOut(clamp01(((Math.max(0, f - 150) % 30) / 30) * 3)));
  const flowOn = f > 150;

  return (
    <AbsoluteFill>
      <Cam to={1.05} oy={460}>
        <svg width={1920} height={1080}>
          <GlowDefs />
          {/* CPU outline */}
          <g opacity={prog(f, 60, 30)}>
            <rect x={560} y={470} width={820} height={180} rx={24} fill={rgba(C, 0.03)} stroke={rgba(C, 0.55)} strokeWidth={2} strokeDasharray="10 10" strokeDashoffset={-f * 0.6} />
            <text x={586} y={500} fontFamily={FONT.display} fontSize={22} letterSpacing={6} fill={C}>
              CPU
            </text>
          </g>
          {data.map((pts, i) => (
            <Arrow key={'d' + i} pts={pts} t={dataT(i)} color={C} w={4} />
          ))}
          {ctrl.map((pts, i) => (
            <Arrow key={'c' + i} pts={pts} t={ctrlT(i)} color={rgba('#ffe7b0', 0.75)} w={2.5} dash="10 9" dashOffset={-f * 1.2} glow={false} />
          ))}
          {/* flowing data packets */}
          {flowOn &&
            data.map((pts, i) =>
              [0, 1].map((q) => {
                const t = ((f - 150) / 50 + q * 0.5 + i * 0.17) % 1;
                const {p} = along(pts, t);
                return (
                  <g key={`p${i}${q}`} transform={`translate(${p[0]},${p[1]})`} opacity={Math.sin(t * Math.PI)}>
                    <rect x={-13} y={-10} width={26} height={20} rx={4} fill={C} filter="url(#g-m)" />
                    <text y={5} textAnchor="middle" fontFamily={FONT.mono} fontSize={12} fontWeight={700} fill="#2a1a00">
                      {(i + q) % 2 ? '01' : '10'}
                    </text>
                  </g>
                );
              }),
            )}
          <text x={600} y={235} textAnchor="middle" fontFamily={FONT.sans} fontSize={20} fill={COL.sub} opacity={dataT(0)}>
            程序 · 数据
          </text>
          <text x={1106} y={425} fontFamily={FONT.sans} fontSize={20} fill={COL.sub} opacity={dataT(4)}>
            指令
          </text>
          <Box x={330} y={420} w={260} h={110} zh="输入设备" en="INPUT" a={prog(f, 34, 26, (t) => t)} />
          <Box x={1590} y={420} w={260} h={110} zh="输出设备" en="OUTPUT" a={prog(f, 46, 26, (t) => t)} />
          <Box x={760} y={560} w={280} h={120} zh="运算器" en="ALU" a={prog(f, 18, 26, (t) => t)} hi={flowOn ? 0.5 + 0.5 * Math.sin(f / 8) : 0} />
          <Box x={1200} y={560} w={280} h={120} zh="控制器" en="CONTROL UNIT" a={prog(f, 24, 26, (t) => t)} />
          <Box x={960} y={250} w={420} h={170} zh="" en="" a={prog(f, 6, 26, (t) => t)}>
            <text x={-190} y={-52} fontFamily={FONT.sans} fontWeight={800} fontSize={28} fill="#fff">
              存储器
            </text>
            <text x={190} y={-52} textAnchor="end" fontFamily={FONT.tech} fontSize={18} letterSpacing={4} fill={rgba(C, 0.85)}>
              MEMORY
            </text>
            {PROG.map((ins, k) => {
              const y = -18 + k * 30;
              const cur = k === pc && flowOn;
              return (
                <g key={k}>
                  {cur && <rect x={-196} y={y - 21} width={392} height={28} rx={6} fill={rgba(C, 0.25 * pcY + 0.05)} />}
                  <text x={-184} y={y} fontFamily={FONT.mono} fontSize={19} fill={cur ? C : COL.dim}>
                    {`0x${k}`}
                  </text>
                  <text x={-124} y={y} fontFamily={FONT.mono} fontSize={19} fill={cur ? '#fff' : COL.sub}>
                    {ins}
                  </text>
                  {cur && (
                    <text x={170} y={y} fontFamily={FONT.display} fontSize={16} fill={C}>
                      PC
                    </text>
                  )}
                </g>
              );
            })}
          </Box>
          {/* legend */}
          <g transform="translate(1440,820)" opacity={prog(f, 170, 30)}>
            <line x1={0} y1={0} x2={60} y2={0} stroke={C} strokeWidth={4} />
            <text x={76} y={8} fontFamily={FONT.sans} fontSize={22} fill={COL.sub}>
              数据流
            </text>
            <line x1={170} y1={0} x2={230} y2={0} stroke="#ffe7b0" strokeWidth={2.5} strokeDasharray="10 9" />
            <text x={246} y={8} fontFamily={FONT.sans} fontSize={22} fill={COL.sub}>
              控制流
            </text>
          </g>
        </svg>
      </Cam>
      <Caption title="冯·诺依曼结构" en="VON NEUMANN" desc="五大部件 · 以存储器为中心 · 指令和数据同等地位" chip="存储程序" color={C} />
    </AbsoluteFill>
  );
};

/* ============================ IEEE 754 ============================ */

const BITS = '1' + '10000001' + '10110000000000000000000';

export const COIEEE: React.FC = () => {
  const f = useF();
  const states = ['−6.75', '−110.11₍₂₎', '−1.1011 × 2²'];
  const sIdx = f < 60 ? 0 : f < 110 ? 1 : 2;
  const sStart = [0, 60, 110][sIdx];
  const sa = prog(f, sStart, 22);
  const up = prog(f, 130, 40, eInOut);
  const cellW = 46;
  const xOf = (k: number) => 142 + k * 50 + (k >= 1 ? 20 : 0) + (k >= 9 ? 20 : 0);
  const Y = 520;
  const groupCol = (k: number) => (k === 0 ? COL.red : k < 9 ? C : COL.ds);
  const settle = (k: number) => 150 + k * 3;
  const hexIn = prog(f, 250, 20);
  const hex = 'C0D80000';

  return (
    <AbsoluteFill>
      <Cam to={1.04}>
        {/* number morph */}
        <div
          style={{
            position: 'absolute',
            width: 1920,
            top: lerp(230, 150, up),
            textAlign: 'center',
            fontFamily: FONT.tech,
            fontWeight: 700,
            fontSize: lerp(150, 96, up),
            color: '#fff',
            opacity: sa,
            filter: `blur(${(1 - sa) * 14}px)`,
            transform: `scale(${lerp(1.15, 1, sa)})`,
            textShadow: `0 0 40px ${rgba(C, 0.7)}`,
            letterSpacing: '0.04em',
          }}
        >
          {states[sIdx]}
        </div>
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          <GlowDefs />
          {/* group labels */}
          {[
            {a: 0, b: 0, t: 'S 符号', c: COL.red, at: 150},
            {a: 1, b: 8, t: '阶码 E = 2 + 127 = 129', c: C, at: 158},
            {a: 9, b: 31, t: '尾数 M（隐藏最高位 1）', c: COL.ds, at: 180},
          ].map((g, i) => {
            const x0 = xOf(g.a);
            const x1 = xOf(g.b) + cellW;
            const t = prog(f, g.at, 26);
            return (
              <g key={i} opacity={t}>
                <path d={`M${x0},${Y - 22} L${x0},${Y - 34} L${x1},${Y - 34} L${x1},${Y - 22}`} fill="none" stroke={g.c} strokeWidth={2} />
                <text x={(x0 + x1) / 2} y={Y - 50} textAnchor="middle" fontFamily={FONT.sans} fontSize={g.a === 0 ? 22 : 26} fontWeight={600} fill={g.c}>
                  {g.t}
                </text>
              </g>
            );
          })}
          {BITS.split('').map((b, k) => {
            const st = settle(k);
            const appear = prog(f, st - 20, 10);
            if (appear <= 0) return null;
            const settled = f >= st;
            const shown = settled ? b : rnd(k * 13 + Math.floor(f / 2)) > 0.5 ? '1' : '0';
            const pop = settled ? eBack(clamp01((f - st) / 14)) : 0.8;
            const col = groupCol(k);
            const one = settled && b === '1';
            return (
              <g key={k} transform={`translate(${xOf(k) + cellW / 2},${Y + 35}) scale(${lerp(0.7, 1, pop)})`} opacity={appear}>
                <rect x={-cellW / 2} y={-35} width={cellW} height={70} rx={8} fill={one ? rgba(col, 0.35) : 'rgba(14,14,20,0.85)'} stroke={rgba(col, settled ? 0.95 : 0.4)} strokeWidth={2} filter={one ? 'url(#g-s)' : undefined} />
                <text y={13} textAnchor="middle" fontFamily={FONT.mono} fontWeight={700} fontSize={34} fill={settled ? '#fff' : COL.dim}>
                  {shown}
                </text>
              </g>
            );
          })}
          {/* nibble -> hex */}
          {hex.split('').map((h, n) => {
            const x0 = xOf(n * 4);
            const x1 = xOf(n * 4 + 3) + cellW;
            const t = clamp01((hexIn * 8 - n) / 1.5);
            return (
              <g key={n} opacity={t}>
                <path d={`M${x0 + 4},${Y + 84} Q${(x0 + x1) / 2},${Y + 112} ${x1 - 4},${Y + 84}`} fill="none" stroke={rgba('#fff', 0.35)} strokeWidth={2} />
                <text x={(x0 + x1) / 2} y={Y + 150} textAnchor="middle" fontFamily={FONT.tech} fontWeight={700} fontSize={44} fill="#fff" filter="url(#g-s)">
                  {h}
                </text>
              </g>
            );
          })}
        </svg>
        <div
          style={{
            position: 'absolute',
            right: 140,
            top: 760,
            fontFamily: FONT.tech,
            fontWeight: 700,
            fontSize: 60,
            color: C,
            letterSpacing: '0.08em',
            opacity: prog(f, 262, 24),
            transform: `translateX(${(1 - prog(f, 262, 30)) * 40}px)`,
            textShadow: `0 0 30px ${rgba(C, 0.7)}`,
          }}
        >
          = C0D8 0000 H
        </div>
      </Cam>
      <Caption title="浮点数表示" en="IEEE 754" desc="单精度：1 位符号 + 8 位阶码（偏置 127）+ 23 位尾数" chip="32 bit" color={C} />
    </AbsoluteFill>
  );
};

/* ============================ Pipeline ============================ */

const STAGES = [
  {n: 'IF', c: '#fbbf24'},
  {n: 'ID', c: '#fb923c'},
  {n: 'EX', c: '#f87171'},
  {n: 'MEM', c: '#c084fc'},
  {n: 'WB', c: '#38bdf8'},
];

export const COPipeline: React.FC = () => {
  const f = useF();
  const X0 = 400;
  const Y0 = 250;
  const CW = 146;
  const RH = 84;
  const T = (k: number) => 30 + k * 30;
  const cyc = (f - 30) / 30;
  const cur = Math.floor(cyc);
  const grid = prog(f, 0, 30);
  const clockLen = clamp01((cyc + 1) / 9);
  let wave = `M${X0},190`;
  for (let k = 0; k < 9; k++) {
    const x = X0 + k * CW;
    wave += ` L${x},190 L${x},150 L${x + CW / 2},150 L${x + CW / 2},190`;
  }
  wave += ` L${X0 + 9 * CW},190`;
  const full = prog(f, 300, 30);

  return (
    <AbsoluteFill>
      <Cam to={1.05} oy={440}>
        <svg width={1920} height={1080}>
          <GlowDefs />
          <defs>
            <clipPath id="clk">
              <rect x={X0} y={130} width={9 * CW * clockLen} height={80} />
            </clipPath>
          </defs>
          <path d={wave} fill="none" stroke={C} strokeWidth={3} clipPath="url(#clk)" filter="url(#g-s)" />
          <text x={X0 - 70} y={180} textAnchor="middle" fontFamily={FONT.display} fontSize={18} fill={C} opacity={grid}>
            CLK
          </text>
          <g opacity={grid}>
            {new Array(9).fill(0).map((_, k) => (
              <g key={k}>
                <text x={X0 + k * CW + CW / 2} y={Y0 - 18} textAnchor="middle" fontFamily={FONT.tech} fontSize={26} fontWeight={700} fill={k === cur ? C : COL.sub}>
                  t{k + 1}
                </text>
                <line x1={X0 + k * CW} y1={Y0} x2={X0 + k * CW} y2={Y0 + 5 * RH} stroke={rgba('#fff', 0.08)} />
              </g>
            ))}
            {new Array(5).fill(0).map((_, i) => (
              <g key={i}>
                <text x={X0 - 60} y={Y0 + i * RH + RH / 2 + 10} textAnchor="middle" fontFamily={FONT.tech} fontSize={30} fontWeight={700} fill="#fff">
                  I{i + 1}
                </text>
                <line x1={X0} y1={Y0 + i * RH} x2={X0 + 9 * CW} y2={Y0 + i * RH} stroke={rgba('#fff', 0.08)} />
              </g>
            ))}
            <rect x={X0} y={Y0} width={9 * CW} height={5 * RH} fill="none" stroke={rgba('#fff', 0.14)} />
          </g>
          {cur >= 0 && cur < 9 && (
            <rect x={X0 + cur * CW} y={Y0 - 4} width={CW} height={5 * RH + 8} fill={rgba(C, 0.08)} stroke={rgba(C, 0.4)} strokeWidth={1.5} />
          )}
          {new Array(5).fill(0).map((_, i) =>
            STAGES.map((s, si) => {
              const col = i + si;
              const t = clamp01((f - T(col)) / 12);
              if (t <= 0) return null;
              const e = eOut(t);
              const x = X0 + col * CW + 5;
              const y = Y0 + i * RH + 6;
              const active = col === cur;
              return (
                <g key={`${i}-${si}`}>
                  <rect
                    x={x}
                    y={y}
                    width={(CW - 10) * e}
                    height={RH - 12}
                    rx={10}
                    fill={rgba(s.c, active ? 0.9 : 0.55)}
                    stroke={s.c}
                    strokeWidth={2}
                    filter={active ? 'url(#g-m)' : undefined}
                  />
                  <text x={x + (CW - 10) / 2} y={y + RH / 2 + 4} textAnchor="middle" fontFamily={FONT.tech} fontWeight={700} fontSize={30} fill={active ? '#1a0e00' : '#fff'} opacity={t}>
                    {s.n}
                  </text>
                </g>
              );
            }),
          )}
          <g opacity={full}>
            <rect x={X0 + 4 * CW - 4} y={Y0 - 8} width={CW + 8} height={5 * RH + 16} rx={12} fill="none" stroke="#fff" strokeWidth={3} filter="url(#g-m)" />
            <text x={X0 + 4 * CW + CW / 2} y={Y0 + 5 * RH + 46} textAnchor="middle" fontFamily={FONT.sans} fontSize={24} fontWeight={600} fill="#fff">
              满载：5 条指令并行
            </text>
          </g>
          <text x={X0 + 9 * CW + 24} y={Y0 - 12} fontFamily={FONT.sans} fontSize={22} fill={COL.sub} opacity={grid}>
            时钟周期 →
          </text>
        </svg>
        <div
          style={{
            position: 'absolute',
            right: 150,
            top: 770,
            padding: '18px 30px',
            borderRadius: 14,
            background: COL.panel,
            border: `1px solid ${rgba(C, 0.4)}`,
            fontFamily: FONT.mono,
            fontSize: 28,
            color: '#fff',
            lineHeight: '46px',
            opacity: prog(f, 322, 26),
            transform: `translateY(${(1 - prog(f, 322, 30)) * 24}px)`,
          }}
        >
          <div>
            T = (k + n − 1)·Δt = <span style={{color: C}}>9Δt</span>
          </div>
          <div style={{color: COL.sub}}>
            吞吐率 TP = n / T · 加速比 S → <span style={{color: C}}>k</span>
          </div>
        </div>
      </Cam>
      <Caption title="指令流水线" en="PIPELINE" desc="IF 取指 · ID 译码 · EX 执行 · MEM 访存 · WB 写回" chip="CPI ≈ 1" color={C} />
    </AbsoluteFill>
  );
};

/* ============================ Memory hierarchy + cache ============================ */

const LAYERS = [
  {zh: '寄存器', en: 'REGISTER', t: '≈ 0.3 ns', cap: 'B'},
  {zh: 'Cache', en: 'SRAM', t: '≈ 1 ~ 10 ns', cap: 'KB ~ MB'},
  {zh: '主存', en: 'DRAM', t: '≈ 80 ns', cap: 'GB'},
  {zh: '辅存', en: 'SSD / HDD', t: '≈ 0.1 ~ 10 ms', cap: 'TB'},
];

const CACHE0 = ['0x3C1', '0x0B2', '0x0A7', '—', '0x1C0', '0x1F3', '0x2E5', '—'];

export const COMemory: React.FC = () => {
  const f = useF();
  const shrink = prog(f, 262, 60, eInOut);
  const top = 170;
  const LH = 138;
  const GAP = 16;
  const half = (y: number) => 70 + (y - top) * 0.72;

  const addr2 = f >= 440;
  const fields = addr2 ? ['0x2A0', '010', '0x08'] : ['0x1F3', '101', '0x2C'];
  const row = addr2 ? 2 : 5;
  const addrIn = prog(f, 336, 24);
  const flip = addr2 ? prog(f, 440, 14) : 1;
  const lineT = addr2 ? prog(f, 452, 20, eInOut) : prog(f, 366, 20, eInOut);
  const cmpAt = addr2 ? 478 : 392;
  const cmp = f >= cmpAt ? 1 - clamp01((f - cmpAt) / 20) : 0;
  const hit = !addr2 && f >= 406;
  const miss = addr2 && f >= 488;
  const fetch = prog(f, 500, 26, eInOut);
  const tags = [...CACHE0];
  if (f >= 526) tags[2] = '0x2A0';
  const hit2 = f >= 530;
  const cacheIn = prog(f, 300, 30);
  const rowY = (i: number) => 360 + i * 50;

  return (
    <AbsoluteFill>
      <Cam to={1.03}>
        <AbsoluteFill style={{transform: `translate(${-590 * shrink}px, ${40 * shrink}px) scale(${lerp(1, 0.62, shrink)})`, transformOrigin: '960px 470px'}}>
          <svg width={1920} height={1080}>
            <GlowDefs />
            {f > 110 &&
              f < 270 &&
              [0, 1, 2, 3].map((q) => {
                const t = ((f - 110) / 70 + q * 0.25) % 1;
                const y = lerp(top + 3 * (LH + GAP) + 60, top + 40, eInOut(t));
                return <rect key={q} x={960 - 14 + (q - 1.5) * 40} y={y} width={28} height={20} rx={4} fill="#fff" opacity={Math.sin(t * Math.PI) * 0.7} filter="url(#g-m)" />;
              })}
            {LAYERS.map((L, k) => {
              const y0 = top + k * (LH + GAP);
              const y1 = y0 + LH;
              const a = eBack(clamp01((f - 16 - k * 16) / 24));
              const dy = (1 - a) * -60;
              const h0 = half(y0);
              const h1 = half(y1);
              const pts = `${960 - h0},${y0} ${960 + h0},${y0} ${960 + h1},${y1} ${960 - h1},${y1}`;
              const pulse = f > 120 && f < 262 ? 0.5 + 0.5 * Math.sin(f / 10 - k * 1.2) : 0;
              return (
                <g key={k} transform={`translate(0,${dy})`} opacity={clamp01(a * 2)}>
                  <polygon points={pts} fill={rgba(C, 0.1 + (3 - k) * 0.05 + pulse * 0.08)} stroke={C} strokeWidth={2.5} filter="url(#g-s)" />
                  <text x={960} y={(y0 + y1) / 2 + (k === 0 ? 20 : 8)} textAnchor="middle" fontFamily={FONT.sans} fontWeight={800} fontSize={k === 0 ? 30 : 42} fill="#fff">
                    {L.zh}
                  </text>
                  {k > 0 && (
                    <text x={960} y={(y0 + y1) / 2 + 40} textAnchor="middle" fontFamily={FONT.tech} fontSize={20} letterSpacing={4} fill={rgba(C, 0.9)}>
                      {L.en}
                    </text>
                  )}
                  <g opacity={1 - shrink}>
                    <text x={960 + h1 + 40} y={(y0 + y1) / 2 + 10} fontFamily={FONT.mono} fontSize={28} fill={C}>
                      {L.t}
                    </text>
                    <text x={960 - h1 - 40} y={(y0 + y1) / 2 + 10} textAnchor="end" fontFamily={FONT.tech} fontWeight={700} fontSize={32} fill={COL.sub}>
                      {L.cap}
                    </text>
                  </g>
                </g>
              );
            })}
            <g opacity={prog(f, 90, 30) * (1 - shrink)}>
              <Arrow
                pts={[
                  [1650, 760],
                  [1650, 200],
                ]}
                t={1}
                color={C}
                w={3}
              />
              <text x={1680} y={260} fontFamily={FONT.sans} fontSize={26} fill="#fff">
                更快 · 更贵
              </text>
              <text x={1680} y={740} fontFamily={FONT.sans} fontSize={26} fill={COL.sub}>
                更大 · 更便宜
              </text>
            </g>
          </svg>
        </AbsoluteFill>

        {cacheIn > 0 && (
          <AbsoluteFill style={{opacity: cacheIn}}>
            <svg width={1920} height={1080}>
              <GlowDefs />
              <g opacity={addrIn} transform={`translate(${(1 - addrIn) * 60},0)`}>
                <text x={800} y={140} fontFamily={FONT.sans} fontSize={24} fill={COL.sub}>
                  主存地址
                </text>
                {[
                  {x: 800, w: 460, l: '标记 Tag', c: C},
                  {x: 1270, w: 240, l: '行号 Index', c: COL.ds},
                  {x: 1520, w: 250, l: '块内地址', c: COL.sub},
                ].map((fd, i) => (
                  <g key={i}>
                    <rect x={fd.x} y={158} width={fd.w} height={72} rx={10} fill={rgba(fd.c, i === 1 && lineT > 0 && lineT < 1 ? 0.35 : 0.12)} stroke={fd.c} strokeWidth={2} />
                    <text x={fd.x + fd.w / 2} y={206} textAnchor="middle" fontFamily={FONT.mono} fontWeight={700} fontSize={34} fill="#fff" opacity={flip}>
                      {fields[i]}
                    </text>
                    <text x={fd.x + fd.w} y={140} textAnchor="end" fontFamily={FONT.sans} fontSize={20} fill={fd.c}>
                      {fd.l}
                    </text>
                  </g>
                ))}
              </g>
              <Arrow
                pts={[
                  [1390, 232],
                  [1390, 290],
                  [1440, 290],
                  [1440, rowY(row) - 12],
                  [1406, rowY(row) - 12],
                ]}
                t={lineT}
                color={COL.ds}
                w={3}
              />
              <g>
                {[
                  [800, '行'],
                  [866, 'V'],
                  [930, 'Tag'],
                  [1110, '数据块 Cache Line'],
                ].map(([x, t], i) => (
                  <text key={i} x={x as number} y={326} fontFamily={FONT.sans} fontSize={22} fill={COL.sub}>
                    {t}
                  </text>
                ))}
                {tags.map((tg, i) => {
                  const y = rowY(i);
                  const isRow = i === row && lineT >= 1;
                  const good = (hit && i === 5) || (hit2 && i === 2);
                  const bad = miss && !hit2 && i === 2;
                  const rc = good ? COL.green : bad ? COL.red : isRow ? COL.ds : null;
                  const upd = i === 2 && f >= 526 ? 1 - clamp01((f - 526) / 20) : 0;
                  return (
                    <g key={i}>
                      <rect x={790} y={y - 34} width={610} height={44} rx={8} fill={rc ? rgba(rc, 0.18 + upd * 0.3) : 'rgba(20,16,8,0.7)'} stroke={rc ?? rgba('#fff', 0.1)} strokeWidth={rc ? 2 : 1} />
                      <text x={806} y={y - 4} fontFamily={FONT.mono} fontSize={22} fill={COL.sub}>
                        {i.toString(2).padStart(3, '0')}
                      </text>
                      <text x={870} y={y - 4} fontFamily={FONT.mono} fontSize={22} fill={tg === '—' ? COL.dim : C}>
                        {tg === '—' ? 0 : 1}
                      </text>
                      <text x={930} y={y - 4} fontFamily={FONT.mono} fontSize={22} fontWeight={700} fill={tg === '—' ? COL.dim : '#fff'} filter={isRow && cmp > 0 ? 'url(#g-m)' : undefined}>
                        {tg}
                      </text>
                      {[0, 1, 2, 3, 4, 5, 6, 7].map((b) => (
                        <rect key={b} x={1110 + b * 34} y={y - 26} width={28} height={28} rx={4} fill={tg === '—' ? rgba('#fff', 0.05) : rgba(C, 0.18 + ((b * 7 + i * 3) % 5) * 0.08)} />
                      ))}
                    </g>
                  );
                })}
              </g>
              {(hit || miss) &&
                (() => {
                  const good = !miss || hit2;
                  const at = hit2 ? 530 : miss ? 488 : 406;
                  const s = eBack(clamp01((f - at) / 18));
                  const y = rowY(addr2 ? 2 : 5) - 12;
                  const col = good ? COL.green : COL.red;
                  return (
                    <g transform={`translate(690,${y}) scale(${s})`}>
                      <rect x={-84} y={-26} width={168} height={52} rx={26} fill={rgba(col, 0.2)} stroke={col} strokeWidth={2.5} filter="url(#g-m)" />
                      <text y={10} textAnchor="middle" fontFamily={FONT.sans} fontWeight={800} fontSize={26} fill={col}>
                        {good ? 'HIT 命中' : 'MISS 缺失'}
                      </text>
                    </g>
                  );
                })()}
              <g opacity={prog(f, 320, 30)}>
                <text x={1560} y={326} fontFamily={FONT.sans} fontSize={22} fill={COL.sub}>
                  主存块
                </text>
                {new Array(8).fill(0).map((_, i) => {
                  const y = rowY(i);
                  const target = i === 5;
                  const glow = target && miss ? 1 : 0;
                  return (
                    <g key={i}>
                      <rect x={1560} y={y - 34} width={210} height={44} rx={8} fill={glow ? rgba(C, 0.35) : 'rgba(20,16,8,0.7)'} stroke={glow ? C : rgba('#fff', 0.1)} />
                      <text x={1576} y={y - 4} fontFamily={FONT.mono} fontSize={20} fill={glow ? '#fff' : COL.dim}>
                        {target ? '0x2A0 | 010' : `0x${(0x100 + i * 0x37).toString(16).toUpperCase()} | ${((i * 3) % 8).toString(2).padStart(3, '0')}`}
                      </text>
                    </g>
                  );
                })}
              </g>
              {fetch > 0 && fetch < 1 && (
                <rect
                  x={lerp(1560, 1110, fetch)}
                  y={lerp(rowY(5) - 32, rowY(2) - 32, fetch)}
                  width={lerp(210, 270, fetch)}
                  height={40}
                  rx={8}
                  fill={C}
                  opacity={0.85}
                  filter="url(#g-m)"
                />
              )}
            </svg>
            <div
              style={{
                position: 'absolute',
                right: 150,
                top: 800,
                fontFamily: FONT.mono,
                fontSize: 30,
                color: '#fff',
                padding: '14px 26px',
                borderRadius: 14,
                background: COL.panel,
                border: `1px solid ${rgba(C, 0.4)}`,
                opacity: prog(f, 420, 30),
              }}
            >
              T<sub>avg</sub> = h·t<sub>c</sub> + (1 − h)·t<sub>m</sub>
            </div>
          </AbsoluteFill>
        )}
      </Cam>
      <AbsoluteFill style={{opacity: 1 - prog(f, 250, 30)}}>
        <Caption title="存储层次" en="MEMORY HIERARCHY" desc="寄存器 → Cache → 主存 → 辅存 · 程序访问的局部性原理" chip="局部性" color={C} />
      </AbsoluteFill>
      {f > 290 && <Caption title="Cache 映射" en="DIRECT MAPPED" desc="主存地址 = 标记 Tag | 行号 Index | 块内地址 Offset" chip="命中率 h" color={C} delay={306} />}
    </AbsoluteFill>
  );
};
