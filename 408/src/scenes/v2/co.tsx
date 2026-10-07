import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Cell, Glass, Hi, Txt} from '../../components/kit';
import {Cue, Problem, probCues} from '../../components/Problem';
import {useF} from '../../components/Shot';
import {Arrow, Caption, Cam, GlowDefs, Pt} from '../../components/ui';
import {clamp01, COL, eBack, eInOut, eOut, FONT, lerp, mixHex, prog, rgba} from '../../theme';

export * from './co2';

const C = COL.co;
const B = COL.ds;
const R = COL.red;

/* ====================================================================== */
/* 补码环                                                                  */
/* ====================================================================== */

const bin4 = (k: number) => k.toString(2).padStart(4, '0');
const sval = (k: number) => (k < 8 ? k : k - 16);

export const CORing: React.FC = () => {
  const f = useF();
  const CX = 700;
  const CY = 490;
  const RR = 262;
  const ang = (k: number) => ((-90 + k * 22.5) * Math.PI) / 180;
  const P = (k: number, r = RR): Pt => [CX + Math.cos(ang(k)) * r, CY + Math.sin(ang(k)) * r];
  // pointer script: [frame, position]
  const keys: [number, number][] = [
    [0, 0],
    [110, 3],
    [150, 3],
    [210, 5],
    [260, 5],
    [330, 9],
    [470, 2],
    [520, 2],
    [640, 13],
  ];
  let pos = 0;
  for (let i = 0; i < keys.length - 1; i++) {
    const [f0, p0] = keys[i];
    const [f1, p1] = keys[i + 1];
    if (f >= f0) pos = f < f1 ? lerp(p0, p1, eInOut((f - f0) / (f1 - f0))) : p1;
  }
  const overflow = f >= 300 && f < 470;
  const phase = f < 260 ? 0 : f < 470 ? 1 : f < 700 ? 2 : 3;
  const panel = [
    <>
      <div style={{fontFamily: FONT.sans, color: C, fontSize: 26}}>加法 = 顺时针转动</div>
      <div>0011 + 0010 = 0101</div>
      <div style={{color: COL.sub}}>3 + 2 = 5 ✓</div>
    </>,
    <>
      <div style={{fontFamily: FONT.sans, color: R, fontSize: 26}}>越过 0111 → 1000 的边界</div>
      <div>0101 + 0100 = 1001</div>
      <div style={{color: COL.sub}}>
        5 + 4 = <Hi c={R}>−7</Hi>　正溢出！
      </div>
    </>,
    <>
      <div style={{fontFamily: FONT.sans, color: B, fontSize: 26}}>减法 = 加上补码</div>
      <div>2 − 5 = 2 + [−5]补</div>
      <div>[−5]补 = 0101 取反 + 1 = 1011</div>
      <div>0010 + 1011 = 1101 = −3 ✓</div>
    </>,
    <>
      <div style={{fontFamily: FONT.sans, color: C, fontSize: 26}}>n 位补码的表示范围</div>
      <div>
        −2<sup>n−1</sup> ~ 2<sup>n−1</sup> − 1
      </div>
      <div style={{color: COL.sub}}>4 位：−8 ~ +7（1000 就是 −8）</div>
      <div style={{color: COL.sub}}>[x]补 = 2ⁿ + x (mod 2ⁿ)</div>
    </>,
  ][phase];
  const pp = P(pos, RR - 70);
  return (
    <AbsoluteFill>
      <Cam to={1.04} ox={700}>
        <svg width={1920} height={1080}>
          <GlowDefs />
          <circle cx={CX} cy={CY} r={RR} fill="none" stroke={rgba(C, 0.12)} strokeWidth={90} opacity={prog(f, 0, 30)} />
          {/* halves */}
          <path d={`M${P(0, RR + 60)[0]},${P(0, RR + 60)[1]} A${RR + 60},${RR + 60} 0 0 1 ${P(8, RR + 60)[0]},${P(8, RR + 60)[1]}`} fill="none" stroke={B} strokeWidth={4} opacity={prog(f, 40, 30)} />
          <path d={`M${P(8, RR + 60)[0]},${P(8, RR + 60)[1]} A${RR + 60},${RR + 60} 0 0 1 ${P(16, RR + 60)[0]},${P(16, RR + 60)[1]}`} fill="none" stroke={C} strokeWidth={4} opacity={prog(f, 50, 30)} />
          <Txt x={CX + RR + 120} y={CY - 40} size={24} color={B} opacity={prog(f, 60, 30)} anchor="start">
            非负数
          </Txt>
          <Txt x={CX - RR - 120} y={CY - 40} size={24} color={C} opacity={prog(f, 60, 30)} anchor="end">
            负数
          </Txt>
          {/* overflow boundary */}
          <line x1={P(7.5, RR - 60)[0]} y1={P(7.5, RR - 60)[1]} x2={P(7.5, RR + 90)[0]} y2={P(7.5, RR + 90)[1]} stroke={R} strokeWidth={overflow ? 6 : 3} strokeDasharray="8 6" opacity={prog(f, 70, 20)} filter={overflow ? 'url(#g-m)' : undefined} />
          <Txt x={P(7.5, RR + 130)[0]} y={P(7.5, RR + 130)[1]} size={22} color={R} opacity={prog(f, 70, 20)}>
            溢出边界
          </Txt>
          {new Array(16).fill(0).map((_, k) => {
            const [x, y] = P(k);
            const a = eBack(clamp01((f - k * 3) / 18));
            const hit = Math.abs(pos - k) < 0.3;
            const neg = k >= 8;
            return (
              <g key={k} transform={`translate(${x},${y}) scale(${a})`}>
                <circle r={32} fill={hit ? rgba(neg ? C : B, 0.8) : 'rgba(10,10,20,0.9)'} stroke={neg ? C : B} strokeWidth={2.5} filter={hit ? 'url(#g-m)' : undefined} />
                <text y={1} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT.tech} fontWeight={700} fontSize={26} fill={hit ? '#101010' : '#fff'}>
                  {sval(k)}
                </text>
                <text x={Math.cos(ang(k)) * 76} y={Math.sin(ang(k)) * 76 + 1} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT.mono} fontSize={19} fill={COL.sub}>
                  {bin4(k)}
                </text>
              </g>
            );
          })}
          <Arrow pts={[[CX, CY], pp]} t={prog(f, 90, 20)} color={overflow ? R : '#fff'} w={5} head={18} />
          <circle cx={CX} cy={CY} r={12} fill="#fff" opacity={prog(f, 90, 20)} />
          {overflow && (
            <circle cx={P(9)[0]} cy={P(9)[1]} r={40 + 12 * Math.sin(f / 4)} fill="none" stroke={R} strokeWidth={4} opacity={0.8} />
          )}
          <Txt x={CX} y={CY + 60} size={22} color={COL.sub} opacity={prog(f, 90, 20)}>
            模 2⁴ = 16
          </Txt>
        </svg>
        <Glass x={1180} y={360} w={620} color={phase === 1 ? R : C} opacity={prog(f, 100, 30)} style={{fontSize: 30, lineHeight: '54px', padding: '22px 34px'}}>
          {panel}
        </Glass>
      </Cam>
      <Caption title="补码" en="TWO'S COMPLEMENT" desc="模 2ⁿ 的圆环：加法就是转动，减法就是加上补码" chip="−2ⁿ⁻¹ ~ 2ⁿ⁻¹−1" color={C} />
    </AbsoluteFill>
  );
};

export const CORingCues: Cue[] = [
  [110, 'tick'],
  [210, 'blip', 76],
  [330, 'error'],
  [470, 'whoosh'],
  [640, 'blip', 72],
  [700, 'chime'],
];

/* ====================================================================== */
/* 09 补码加法溢出                                                         */
/* ====================================================================== */

const XB = '01100100';
const YB = '00110010';
const SB = '10010110';
const CARRY = (() => {
  const c: number[] = new Array(9).fill(0); // c[i] carry into bit i (0 = LSB)
  for (let i = 0; i < 8; i++) {
    const a = +XB[7 - i];
    const b = +YB[7 - i];
    c[i + 1] = (a + b + c[i]) >> 1;
  }
  return c;
})();

const OVF = {
  card: 330,
  reveal: 1040,
  steps: [
    {at: 0, label: '逐位相加'},
    {at: 380, label: '解读结果'},
    {at: 640, label: '判断溢出'},
  ],
};

export const COOverflow: React.FC = () => (
  <Problem
    no={9}
    color={C}
    tag="组成原理 · 运算方法"
    title="补码加法与溢出判断"
    q={[
      ['某机器采用 ', {t: '8 位补码', c: B}, ' 表示整数，x = ', {t: '100', m: true}, '，y = ', {t: '50', m: true}, '，'],
      ['用 8 位加法器直接计算 ', {t: 'z = x + y', m: true}, '。'],
      ['① z 的真值是多少？　② 标志位 ', {t: 'OF（溢出）', c: R}, ' 与 ', {t: 'CF（进位）', c: B}, ' 分别为？'],
    ]}
    brief="8 位补码 100 + 50：结果真值？OF、CF？"
    answerText="z = −106 · OF = 1 · CF = 0"
    insight="OF = 最高位进位 ⊕ 次高位进位；两正数相加得负数 ⇒ 溢出"
    {...OVF}
  >
    {(sf) => <OverflowStage sf={sf} />}
  </Problem>
);

const OverflowStage: React.FC<{sf: number}> = ({sf}) => {
  const bx = (i: number) => 620 + i * 96; // i = 0 (MSB) .. 7
  const colT = (i: number) => 40 + (7 - i) * 36; // LSB first
  const interp = prog(sf, 380, 30);
  const ovf = prog(sf, 640, 30);
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <GlowDefs />
        {[
          {lbl: 'x = 100', bits: XB, y: 320, c: B},
          {lbl: 'y = 50', bits: YB, y: 420, c: B},
        ].map((r, k) => (
          <g key={k} opacity={prog(sf, k * 10, 20)}>
            <Txt x={560} y={r.y + 38} size={30} anchor="end" family={FONT.mono} color={COL.sub}>
              {r.lbl}
            </Txt>
            {r.bits.split('').map((b, i) => (
              <Cell key={i} x={bx(i)} y={r.y} w={82} h={76} text={b} color={r.c} fill={b === '1' ? 0.3 : 0} size={36} family={FONT.mono} />
            ))}
          </g>
        ))}
        <Txt x={bx(0) - 50} y={420 + 38} size={40} weight={800} color="#fff">
          +
        </Txt>
        <line x1={bx(0) - 10} y1={515} x2={bx(7) + 92} y2={515} stroke="#fff" strokeWidth={3} opacity={prog(sf, 20, 20)} />
        {/* carries */}
        {new Array(8).fill(0).map((_, i) => {
          // carry into bit position (from LSB index) -> displayed above column
          const lsb = 7 - i;
          const c = CARRY[lsb];
          if (lsb === 0) return null;
          const t = sf - colT(i + 1) - 16;
          const on = t >= 0;
          return (
            <g key={i} opacity={on ? 1 : 0}>
              <Txt x={bx(i) + 41} y={278} size={26} family={FONT.mono} weight={700} color={c ? C : COL.dim}>
                {c}
              </Txt>
            </g>
          );
        })}
        <Txt x={560} y={278} size={22} anchor="end" color={COL.sub} opacity={prog(sf, 60, 20)}>
          进位
        </Txt>
        {/* carry out */}
        <g opacity={sf >= colT(0) + 16 ? 1 : 0}>
          <Txt x={bx(0) - 60} y={278} size={26} family={FONT.mono} weight={700} color={ovf > 0 ? B : COL.dim}>
            {CARRY[8]}
          </Txt>
        </g>
        {SB.split('').map((b, i) => {
          const t = clamp01((sf - colT(i)) / 18);
          return <Cell key={i} x={bx(i)} y={540} w={82} h={76} text={b} color={i === 0 && ovf > 0 ? R : C} fill={b === '1' ? 0.35 : 0.05} size={36} family={FONT.mono} scale={eBack(t)} opacity={t > 0 ? 1 : 0} glow={i === 0 && ovf > 0} />;
        })}
        {/* active column */}
        {sf >= 40 && sf < colT(0) + 36 && (
          <rect x={bx(Math.max(0, Math.min(7, 7 - Math.floor((sf - 40) / 36)))) - 6} y={300} width={94} height={330} rx={12} fill="none" stroke="#fff" strokeWidth={2} opacity={0.6} />
        )}
        {/* interpretation */}
        <g opacity={interp}>
          <Txt x={bx(0)} y={680} size={30} anchor="start" color="#fff">
            无符号：1001 0110 = 150
          </Txt>
          <Txt x={bx(0)} y={730} size={30} anchor="start" color="#fff">
            {'补码：符号位 1 ⇒ 负数，取反加一 0110 1010 = 106 ⇒ '}
            <tspan fill={C} fontWeight={800}>
              −106
            </tspan>
          </Txt>
        </g>
        <g opacity={ovf}>
          <rect x={bx(0) - 8} y={264 - 22} width={96} height={44} rx={10} fill="none" stroke={C} strokeWidth={2.5} />
          <rect x={bx(0) - 110} y={264 - 22} width={96} height={44} rx={10} fill="none" stroke={B} strokeWidth={2.5} />
          <Txt x={1480} y={330} size={28} anchor="start" color="#fff">
            C<tspan fontSize={18}>8</tspan> = 0（最高位进位）
          </Txt>
          <Txt x={1480} y={380} size={28} anchor="start" color="#fff">
            C<tspan fontSize={18}>7</tspan> = 1（次高位进位）
          </Txt>
          <Txt x={1480} y={450} size={34} anchor="start" weight={800} color={R}>
            OF = C₈ ⊕ C₇ = 1
          </Txt>
          <Txt x={1480} y={505} size={34} anchor="start" weight={800} color={B}>
            CF = C₈ = 0
          </Txt>
          <Txt x={1480} y={570} size={24} anchor="start" color={COL.sub}>
            双符号位：00 + 00 → 01 ⇒ 正溢出
          </Txt>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export const COOverflowCues: Cue[] = probCues(OVF, [...new Array(8).fill(0).map((_, k): Cue => [40 + k * 36, 'tick']), [380, 'chime'], [640, 'error']]);

/* ====================================================================== */
/* 浮点数在数轴上的分布                                                   */
/* ====================================================================== */

const MINI: {v: number; e: number}[] = (() => {
  const out: {v: number; e: number}[] = [];
  for (let m = 1; m < 4; m++) out.push({v: (m / 4) * 0.25, e: 0});
  for (let e = 1; e <= 6; e++) for (let m = 0; m < 4; m++) out.push({v: (1 + m / 4) * Math.pow(2, e - 3), e});
  return out;
})();
const ECOL = ['#94a3b8', '#60a5fa', COL.ds, COL.cn, COL.co, '#fb923c', COL.red];

export const COFloatLine: React.FC = () => {
  const f = useF();
  const X = (v: number) => 170 + v * 112;
  const Y = 470;
  const lens = prog(f, 520, 50, eInOut);
  return (
    <AbsoluteFill>
      <Cam to={1.03}>
        <svg width={1920} height={1080}>
          <GlowDefs />
          <Txt x={960} y={210} size={30} color={COL.sub} opacity={prog(f, 10, 30)}>
            6 位迷你浮点数：1 位符号 · 3 位阶码（偏置 3）· 2 位尾数 —— 所有正数
          </Txt>
          <line x1={X(0)} y1={Y} x2={X(14.6)} y2={Y} stroke="#fff" strokeWidth={2.5} opacity={prog(f, 0, 30)} />
          {[0, 1, 2, 4, 8, 14].map((v) => (
            <g key={v} opacity={prog(f, 20, 30)}>
              <line x1={X(v)} y1={Y + 10} x2={X(v)} y2={Y + 22} stroke={COL.sub} strokeWidth={2} />
              <Txt x={X(v)} y={Y + 44} size={22} color={COL.sub} family={FONT.mono}>
                {v}
              </Txt>
            </g>
          ))}
          {MINI.map((p, i) => {
            const at = 60 + p.e * 44 + (i % 4) * 6;
            const t = clamp01((f - at) / 22);
            if (t <= 0) return null;
            const y = lerp(Y - 180, Y, eOut(t));
            return (
              <g key={i}>
                <line x1={X(p.v)} y1={y - 26} x2={X(p.v)} y2={y} stroke={ECOL[p.e]} strokeWidth={4} opacity={t} filter="url(#g-s)" />
                <circle cx={X(p.v)} cy={y - 30} r={6} fill={ECOL[p.e]} opacity={t} />
              </g>
            );
          })}
          {/* exponent brackets */}
          {[1, 2, 3, 4, 5, 6].map((e) => {
            const a = Math.pow(2, e - 3);
            const b = Math.pow(2, e - 2);
            const t = prog(f, 60 + e * 44 + 30, 20);
            const step = a / 4;
            return (
              <g key={e} opacity={t}>
                <path d={`M${X(a)},${Y + 70} L${X(a)},${Y + 80} L${X(Math.min(b, 14.5))},${Y + 80} L${X(Math.min(b, 14.5))},${Y + 70}`} fill="none" stroke={ECOL[e]} strokeWidth={2} />
                {e >= 3 && (
                  <Txt x={(X(a) + X(Math.min(b, 14.5))) / 2} y={Y + 108} size={20} color={ECOL[e]} family={FONT.mono}>
                    {`间距 ${step}`}
                  </Txt>
                )}
              </g>
            );
          })}
          <Txt x={960} y={Y + 170} size={30} weight={700} color="#fff" opacity={prog(f, 360, 30)}>
            每个阶码区间内等距分布，区间每右移一段，间距就翻倍
          </Txt>
          {/* float32 lens */}
          <g opacity={lens}>
            <rect x={300} y={740} width={1320} height={140} rx={18} fill="rgba(8,12,24,0.85)" stroke={rgba(C, 0.5)} />
            <Txt x={330} y={778} size={24} anchor="start" color={C}>
              float 在 2²⁴ 附近：相邻两个可表示数相差 2
            </Txt>
            {[-3, -2, -1, 0, 1, 2, 3].map((k) => {
              const x = 960 + k * 180;
              return (
                <g key={k}>
                  <line x1={x} y1={816} x2={x} y2={846} stroke={C} strokeWidth={3} />
                  <Txt x={x} y={866} size={18} family={FONT.mono} color={COL.sub}>
                    {16777216 + k * 2}
                  </Txt>
                </g>
              );
            })}
            <g transform="translate(1050,826)">
              <circle r={10} fill="none" stroke={R} strokeWidth={3} />
              <Txt x={0} y={-26} size={20} color={R} family={FONT.mono}>
                16777217 ✗
              </Txt>
            </g>
          </g>
        </svg>
      </Cam>
      <Caption title="浮点数的分布" en="FLOATING POINT" desc="越靠近 0 越稠密：相对精度大致恒定，绝对间距随阶码翻倍" chip="精度 2⁻²³" color={C} />
    </AbsoluteFill>
  );
};

export const COFloatLineCues: Cue[] = [...[0, 1, 2, 3, 4, 5, 6].map((e): Cue => [60 + e * 44, 'blip', 60 + e * 5]), [520, 'whoosh'], [600, 'error']];

/* ====================================================================== */
/* 加法器：全加器 → 串行进位 vs 先行进位                                 */
/* ====================================================================== */

const GATE = {
  and: 'M0,0 H34 A30,30 0 0 1 34,60 H0 Z',
  or: 'M0,0 Q22,30 0,60 Q46,60 70,30 Q46,0 0,0 Z',
  xor: 'M8,0 Q30,30 8,60 Q54,60 78,30 Q54,0 8,0 Z M-4,0 Q18,30 -4,60',
};
const Gate: React.FC<{kind: 'and' | 'or' | 'xor'; x: number; y: number; on: boolean; label?: string}> = ({kind, x, y, on, label}) => (
  <g transform={`translate(${x},${y - 30})`}>
    <path d={GATE[kind]} fill={on ? rgba(C, 0.35) : 'rgba(20,16,8,0.9)'} stroke={C} strokeWidth={3} filter="url(#g-s)" />
    {label && (
      <text x={kind === 'and' ? 30 : 36} y={31} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT.mono} fontSize={16} fill={COL.sub}>
        {label}
      </text>
    )}
  </g>
);

const Wire: React.FC<{pts: Pt[]; v: number; t: number}> = ({pts, v, t}) => (
  <Arrow pts={pts} t={t} color={v ? C : rgba('#fff', 0.25)} w={v ? 4 : 2.5} head={0.01} glow={!!v} />
);

export const COAdder: React.FC = () => {
  const f = useF();
  const p1 = 1 - prog(f, 480, 40);
  const wt = (at: number) => prog(f, at, 30, eInOut);
  // A=1 B=1 Cin=0 -> AxB=0, S=0, AB=1, (AxB)Cin=0, Cout=1
  const p2 = prog(f, 520, 40);
  const fa = (i: number) => 1440 - i * 300; // FA0 at right
  const rip = (i: number) => 600 + i * 90; // carry i+1 ready
  const claT = 640;
  return (
    <AbsoluteFill>
      <Cam to={1.03}>
        <svg width={1920} height={1080}>
          <GlowDefs />
          {/* -------- full adder -------- */}
          <g opacity={p1}>
            {[
              {l: 'A = 1', y: 330, v: 1},
              {l: 'B = 1', y: 430, v: 1},
              {l: 'Cᵢ = 0', y: 620, v: 0},
            ].map((w, i) => (
              <Txt key={i} x={380} y={w.y} size={28} anchor="end" family={FONT.mono} color={w.v ? C : COL.sub} weight={700}>
                {w.l}
              </Txt>
            ))}
            <Wire pts={[[400, 330], [700, 330], [700, 355], [742, 355]]} v={1} t={wt(20)} />
            <Wire pts={[[400, 430], [680, 430], [680, 405], [742, 405]]} v={1} t={wt(20)} />
            <Gate kind="xor" x={750} y={380} on={false} label="⊕" />
            {/* A,B to AND1 */}
            <Wire pts={[[560, 330], [560, 700], [742, 700]]} v={1} t={wt(40)} />
            <Wire pts={[[600, 430], [600, 750], [742, 750]]} v={1} t={wt(40)} />
            <Gate kind="and" x={750} y={725} on label="&" />
            {/* XOR1 -> XOR2 */}
            <Wire pts={[[830, 380], [1000, 380], [1000, 405], [1042, 405]]} v={0} t={wt(80)} />
            <Wire pts={[[400, 620], [940, 620], [940, 455], [1042, 455]]} v={0} t={wt(80)} />
            <Gate kind="xor" x={1050} y={430} on={false} label="⊕" />
            <Wire pts={[[1130, 430], [1400, 430]]} v={0} t={wt(120)} />
            <Txt x={1420} y={430} size={34} anchor="start" family={FONT.mono} weight={800} color="#fff" opacity={wt(140)}>
              S = 0
            </Txt>
            {/* AND2 (AxB)Cin */}
            <Wire pts={[[1000, 380], [1000, 580], [1042, 580]]} v={0} t={wt(100)} />
            <Wire pts={[[940, 620], [980, 620], [980, 630], [1042, 630]]} v={0} t={wt(100)} />
            <Gate kind="and" x={1050} y={605} on={false} label="&" />
            {/* OR */}
            <Wire pts={[[1112, 605], [1200, 605], [1200, 640], [1248, 640]]} v={0} t={wt(130)} />
            <Wire pts={[[812, 725], [1200, 725], [1200, 690], [1248, 690]]} v={1} t={wt(130)} />
            <Gate kind="or" x={1250} y={665} on label="≥1" />
            <Wire pts={[[1320, 665], [1400, 665]]} v={1} t={wt(160)} />
            <Txt x={1420} y={665} size={34} anchor="start" family={FONT.mono} weight={800} color={C} opacity={wt(180)}>
              Cᵢ₊₁ = 1
            </Txt>
            <Txt x={960} y={860} size={30} color="#fff" opacity={wt(220)} weight={600}>
              S = A ⊕ B ⊕ Cᵢ　　Cᵢ₊₁ = AB + (A ⊕ B)·Cᵢ
            </Txt>
          </g>
          {/* -------- ripple vs lookahead -------- */}
          <g opacity={p2}>
            <Txt x={220} y={250} size={30} anchor="start" weight={800}>
              串行进位（行波）
            </Txt>
            {[0, 1, 2, 3].map((i) => {
              const on = f >= rip(i - 1 < 0 ? -1 : i - 1) || i === 0;
              const done = f >= rip(i);
              return (
                <g key={i}>
                  <rect x={fa(i) - 70} y={290} width={140} height={100} rx={14} fill={done ? rgba(C, 0.3) : 'rgba(20,16,8,0.9)'} stroke={C} strokeWidth={2.5} filter="url(#g-s)" />
                  <Txt x={fa(i)} y={340} size={30} weight={800} family={FONT.tech}>
                    FA{i}
                  </Txt>
                  {i < 3 && <Arrow pts={[[fa(i) - 72, 340], [fa(i + 1) + 72, 340]]} t={done ? 1 : 0.001} color={done ? C : rgba('#fff', 0.2)} w={4} />}
                  {i < 3 && done && (
                    <Txt x={(fa(i) + fa(i + 1)) / 2} y={318} size={22} family={FONT.mono} color={C}>
                      C{i + 1}
                    </Txt>
                  )}
                  <Txt x={fa(i)} y={420} size={20} family={FONT.mono} color={on ? COL.sub : COL.dim}>
                    {done ? '✓' : on ? '等待进位…' : ''}
                  </Txt>
                </g>
              );
            })}
            <Txt x={220} y={560} size={30} anchor="start" weight={800}>
              先行进位（CLA）
            </Txt>
            <rect x={fa(3) - 70} y={600} width={fa(0) - fa(3) + 140} height={70} rx={14} fill={f >= claT ? rgba(B, 0.3) : 'rgba(8,14,24,0.9)'} stroke={B} strokeWidth={2.5} />
            <Txt x={(fa(0) + fa(3)) / 2} y={635} size={24} family={FONT.mono} color="#fff">
              Cᵢ₊₁ = Gᵢ + Pᵢ·Cᵢ 展开 ⇒ 所有进位同时产生
            </Txt>
            {[0, 1, 2, 3].map((i) => (
              <g key={i}>
                <rect x={fa(i) - 70} y={720} width={140} height={100} rx={14} fill={f >= claT + 30 ? rgba(B, 0.3) : 'rgba(8,14,24,0.9)'} stroke={B} strokeWidth={2.5} />
                <Txt x={fa(i)} y={770} size={30} weight={800} family={FONT.tech}>
                  FA{i}
                </Txt>
                <Arrow pts={[[fa(i), 670], [fa(i), 718]]} t={prog(f, claT, 20)} color={B} w={4} />
              </g>
            ))}
            <Glass x={1560} y={560} w={300} color={B} opacity={prog(f, 900, 30)} style={{fontSize: 22, lineHeight: '36px'}}>
              <div>Gᵢ = AᵢBᵢ（生成）</div>
              <div>Pᵢ = Aᵢ ⊕ Bᵢ（传递）</div>
              <div style={{color: COL.sub}}>C₂ = G₁ + P₁G₀ + P₁P₀C₀</div>
            </Glass>
            <Txt x={1560} y={300} size={24} anchor="start" color={COL.sub} opacity={prog(f, rip(3), 20)}>
              4 级进位逐级传递
            </Txt>
          </g>
        </svg>
      </Cam>
      <Caption title="加法器" en="ADDER" desc="全加器由门电路构成 · 串行进位逐位等待，先行进位并行产生" chip="CLA" color={C} />
    </AbsoluteFill>
  );
};

export const COAdderCues: Cue[] = [[20, 'tick'], [80, 'tick'], [130, 'tick'], [180, 'blip', 76], [520, 'whoosh'], ...[0, 1, 2, 3].map((i): Cue => [600 + i * 90, 'blip', 70 + i * 3]), [640, 'chime']];

/* ====================================================================== */
/* 10 Cache 地址结构与总容量                                              */
/* ====================================================================== */

const CB = {
  card: 380,
  reveal: 1120,
  steps: [
    {at: 0, label: '块内地址'},
    {at: 150, label: '组号'},
    {at: 300, label: 'Tag'},
    {at: 460, label: '每行多少位'},
    {at: 980, label: '总容量'},
  ],
};

export const COCacheBits: React.FC = () => (
  <Problem
    no={10}
    color={C}
    tag="组成原理 · 存储系统"
    title="Cache 地址结构与总容量"
    q={[
      ['主存地址 ', {t: '32 位', c: B}, '，按字节编址；Cache 数据区 ', {t: '16 KB', c: B}, '，主存块大小 ', {t: '64 B', c: B}, '；'],
      ['采用 ', {t: '4 路组相联', c: C}, '映射、', {t: '写回', c: C}, '策略、', {t: 'LRU', c: C}, ' 替换算法。'],
      ['① 主存地址中 Tag、组号、块内地址各占几位？'],
      ['② Cache 的总容量（含 Tag、有效位、脏位、LRU 位）为多少位？'],
    ]}
    brief="32 位地址 · 16KB · 64B 块 · 4 路组相联：地址划分与总容量？"
    answerText="20 | 6 | 6 · 137216 位"
    insight="每行 = 有效位 1 + 脏位 1 + LRU 2 + Tag 20 + 数据 512"
    {...CB}
  >
    {(sf) => <CacheBitsStage sf={sf} />}
  </Problem>
);

const CacheBitsStage: React.FC<{sf: number}> = ({sf}) => {
  const bw = 46;
  const bx = (i: number) => 224 + i * bw; // bit 31 at i=0
  const offA = prog(sf, 20, 30);
  const idxA = prog(sf, 170, 30);
  const tagA = prog(sf, 320, 30);
  const segCol = (i: number) => (i >= 26 && offA > 0 ? COL.sub : i >= 20 && idxA > 0 ? B : i < 20 && tagA > 0 ? C : '#334155');
  const lineA = prog(sf, 470, 40);
  const tot = prog(sf, 990, 40);
  const lineParts = [
    {l: 'V', b: 1, c: COL.green, at: 520},
    {l: 'D', b: 1, c: COL.red, at: 580},
    {l: 'LRU', b: 2, c: COL.os, at: 640},
    {l: 'Tag', b: 20, c: C, at: 720},
    {l: '数据 64B', b: 512, c: B, at: 800},
  ];
  const widthOf = (b: number) => (b === 512 ? 620 : b === 20 ? 300 : 80 + b * 20);
  let cx = 190;
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <GlowDefs />
        <Txt x={224} y={222} size={22} anchor="start" color={COL.sub} opacity={prog(sf, 0, 20)}>
          31
        </Txt>
        <Txt x={bx(31) + bw} y={222} size={22} anchor="end" color={COL.sub} opacity={prog(sf, 0, 20)}>
          0
        </Txt>
        {new Array(32).fill(0).map((_, i) => (
          <rect key={i} x={bx(i)} y={240} width={bw - 4} height={60} rx={6} fill={rgba(segCol(i), segCol(i) === '#334155' ? 0.4 : 0.45)} stroke={segCol(i)} strokeWidth={1.5} opacity={prog(sf, i * 0.8, 10)} />
        ))}
        {[
          {a: 0, b: 19, t: 'Tag', v: '32 − 6 − 6 = 20 位', c: C, al: tagA},
          {a: 20, b: 25, t: '组号', v: '256 行 ÷ 4 路 = 64 组 = 2⁶', c: B, al: idxA},
          {a: 26, b: 31, t: '块内地址', v: '64 B = 2⁶', c: COL.sub, al: offA},
        ].map((s, k) => (
          <g key={k} opacity={s.al}>
            <path d={`M${bx(s.a)},${316} L${bx(s.a)},${326} L${bx(s.b) + bw - 4},${326} L${bx(s.b) + bw - 4},${316}`} fill="none" stroke={s.c} strokeWidth={2.5} />
            <Txt x={(bx(s.a) + bx(s.b) + bw) / 2} y={356} size={30} weight={800} color={s.c}>
              {`${s.t} ${s.b - s.a + 1} 位`}
            </Txt>
            <Txt x={(bx(s.a) + bx(s.b) + bw) / 2} y={394} size={22} color={COL.sub} family={FONT.mono}>
              {s.v}
            </Txt>
          </g>
        ))}
        {/* one cache line */}
        <g opacity={lineA}>
          <Txt x={190} y={480} size={26} anchor="start" color="#fff" weight={700}>
            Cache 的一行（共 16 KB ÷ 64 B = 256 行）
          </Txt>
          {lineParts.map((p) => {
            const w = widthOf(p.b);
            const x = cx;
            cx += w + 10;
            const a = eBack(clamp01((sf - p.at) / 22));
            return (
              <g key={p.l} transform={`translate(${x + w / 2},${560}) scale(${a})`} opacity={clamp01(a * 2)}>
                <rect x={-w / 2} y={-40} width={w} height={80} rx={10} fill={rgba(p.c, 0.25)} stroke={p.c} strokeWidth={2.5} />
                <Txt x={0} y={-6} size={26} weight={800}>
                  {p.l}
                </Txt>
                <Txt x={0} y={24} size={20} family={FONT.mono} color={p.c}>
                  {`${p.b} 位`}
                </Txt>
              </g>
            );
          })}
          <Txt x={190} y={660} size={22} anchor="start" color={COL.sub} opacity={prog(sf, 560, 20)}>
            写回法需要脏位（修改位）；4 路 LRU 需要 log₂4 = 2 位计数
          </Txt>
        </g>
        {/* sets grid */}
        <g opacity={prog(sf, 880, 30)}>
          {new Array(8).fill(0).map((_, r) =>
            new Array(4).fill(0).map((__, c) => <rect key={`${r}-${c}`} x={1300 + c * 110} y={700 + r * 22} width={100} height={16} rx={3} fill={rgba(B, 0.25 + ((r + c) % 3) * 0.12)} />),
          )}
          <Txt x={1520} y={890} size={20} color={COL.sub}>
            64 组 × 4 路 = 256 行
          </Txt>
        </g>
      </svg>
      <div style={{position: 'absolute', left: 190, top: 720, fontFamily: FONT.tech, fontWeight: 700, fontSize: 44, color: '#fff', opacity: tot}}>
        256 × (1 + 1 + 2 + 20 + 512) = 256 × 536 = <span style={{color: C}}>137216 位</span>
      </div>
    </AbsoluteFill>
  );
};

export const COCacheBitsCues: Cue[] = probCues(CB, [...[520, 580, 640, 720, 800].map((t, i): Cue => [t, 'blip', 70 + i * 3]), [990, 'chime']]);

export const _u = [mixHex, Hi];
