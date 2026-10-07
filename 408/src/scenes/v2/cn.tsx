import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Cell, Glass, Hi, Txt} from '../../components/kit';
import {Cue, Problem, probCues} from '../../components/Problem';
import {useF} from '../../components/Shot';
import {Arrow, Caption, Cam, GlowDefs, Pt} from '../../components/ui';
import {clamp01, COL, eBack, eInOut, eOut, FONT, lerp, prog, rgba, rnd} from '../../theme';

export * from './cn2';

const C = COL.cn;
const B = COL.ds;
const A2 = COL.co;
const R = COL.red;

/* ====================================================================== */
/* 21 奈氏准则 & 香农定理                                                  */
/* ====================================================================== */

const GRAY = ['00', '01', '11', '10'];
const SH = {
  card: 380,
  reveal: 980,
  steps: [
    {at: 0, label: '奈氏准则'},
    {at: 440, label: '香农定理'},
    {at: 860, label: '取较小值'},
  ],
};

export const CNShannon: React.FC = () => (
  <Problem
    no={21}
    color={C}
    tag="计算机网络 · 物理层"
    title="信道的极限数据率"
    q={[
      ['某信道带宽 ', {t: 'W = 3 kHz', c: B}, '，信噪比 ', {t: '30 dB', c: B}, '，采用 ', {t: '16 种码元状态', c: A2}, '（如 16-QAM）的调制方式。'],
      ['该信道实际能够达到的', {t: '最大数据率', c: A2}, '是？'],
    ]}
    options={['24 kb/s', '30 kb/s', '48 kb/s', '12 kb/s']}
    answer={0}
    brief="3 kHz · 30 dB · 16 种码元：最大数据率？"
    insight="奈氏准则限制码元速率（24 kb/s），香农定理限制信息速率（≈ 30 kb/s），取两者较小者"
    {...SH}
  >
    {(sf) => <ShannonStage sf={sf} />}
  </Problem>
);

const ShannonStage: React.FC<{sf: number}> = ({sf}) => {
  const CX = 500;
  const CY = 540;
  const S = 105;
  const noise = prog(sf, 460, 120);
  const sym = Math.floor(Math.max(0, sf - 60) / 24) % 16;
  const symPos = (k: number): Pt => {
    const i = Math.floor(rnd(k * 3.7 + 1) * 4);
    const j = Math.floor(rnd(k * 5.3 + 2) * 4);
    return [CX + (i - 1.5) * S, CY + (j - 1.5) * S];
  };
  const cur = symPos(Math.floor(Math.max(0, sf - 60) / 24));
  const wavePts: string[] = [];
  for (let x = 0; x <= 760; x += 4) {
    const k = Math.floor((x + Math.max(0, sf - 60) * 4) / 96);
    const amp = 18 + Math.floor(rnd(k * 1.9) * 4) * 12;
    const ph = Math.floor(rnd(k * 2.3) * 4) * (Math.PI / 2);
    const n = (rnd(x * 0.37 + sf * 0.13) - 0.5) * 50 * noise;
    wavePts.push(`${1020 + x},${860 + Math.sin(x / 9 + ph) * amp + n}`);
  }
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <GlowDefs />
        {/* axes */}
        <line x1={CX - 260} y1={CY} x2={CX + 260} y2={CY} stroke={rgba('#fff', 0.3)} />
        <line x1={CX} y1={CY - 260} x2={CX} y2={CY + 260} stroke={rgba('#fff', 0.3)} />
        <Txt x={CX + 250} y={CY + 22} size={18} family={FONT.mono} color={COL.dim}>
          I
        </Txt>
        <Txt x={CX + 16} y={CY - 250} size={18} family={FONT.mono} color={COL.dim}>
          Q
        </Txt>
        <Txt x={CX} y={230} size={26} weight={800}>
          16-QAM 星座图：每个码元携带 4 bit
        </Txt>
        {new Array(16).fill(0).map((_, k) => {
          const i = k % 4;
          const j = Math.floor(k / 4);
          const x = CX + (i - 1.5) * S;
          const y = CY + (j - 1.5) * S;
          const a = eBack(clamp01((sf - k * 3) / 18));
          return (
            <g key={k} transform={`translate(${x},${y})`}>
              {noise > 0 &&
                new Array(18).fill(0).map((__, q) => (
                  <circle key={q} cx={(rnd(k * 50 + q * 1.3 + Math.floor(sf / 3)) - 0.5) * 70 * noise} cy={(rnd(k * 70 + q * 2.1 + Math.floor(sf / 3)) - 0.5) * 70 * noise} r={3} fill={C} opacity={0.4} />
                ))}
              <circle r={14 * a} fill={C} filter="url(#g-m)" />
              <Txt x={0} y={30} size={16} family={FONT.mono} color={COL.sub} opacity={a * (1 - noise)}>
                {GRAY[i] + GRAY[j]}
              </Txt>
            </g>
          );
        })}
        {sf > 60 && sf < 860 && <circle cx={cur[0]} cy={cur[1]} r={26} fill="none" stroke="#fff" strokeWidth={3} filter="url(#g-s)" />}
        {/* waveform */}
        <path d={`M${wavePts.join(' L')}`} fill="none" stroke={noise > 0.3 ? A2 : C} strokeWidth={2.5} opacity={prog(sf, 40, 20)} />
        <Txt x={1020} y={800} size={20} anchor="start" color={COL.sub} opacity={prog(sf, 40, 20)}>
          {noise > 0.3 ? '叠加噪声的信号' : '调制后的信号（幅度 + 相位变化）'}
        </Txt>
        <text x={sym} y={0} opacity={0}>
          .
        </text>
      </svg>
      <div style={{position: 'absolute', left: 1000, top: 240, width: 820, fontFamily: FONT.tech, fontWeight: 700, fontSize: 36, color: '#fff', lineHeight: '62px'}}>
        <div style={{opacity: prog(sf, 80, 30), fontFamily: FONT.sans, fontSize: 26, color: C}}>奈氏准则（无噪声，限制码元速率）</div>
        <div style={{opacity: prog(sf, 120, 30)}}>
          C = 2W·log₂V = 2 × 3k × log₂16 = <Hi c={A2}>24 kb/s</Hi>
        </div>
        <div style={{opacity: prog(sf, 460, 30), fontFamily: FONT.sans, fontSize: 26, color: C, marginTop: 20}}>香农定理（有噪声，信息速率上限）</div>
        <div style={{opacity: prog(sf, 520, 30)}}>30 dB ⇒ S/N = 10³ = 1000</div>
        <div style={{opacity: prog(sf, 600, 30)}}>
          C = W·log₂(1 + S/N) ≈ 3k × 9.97 ≈ <Hi c={A2}>30 kb/s</Hi>
        </div>
        <div style={{opacity: prog(sf, 860, 30), marginTop: 16, fontSize: 40}}>
          min(24, 30) = <Hi c={C}>24 kb/s</Hi>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const CNShannonCues: Cue[] = probCues(SH, [...new Array(16).fill(0).map((_, k): Cue => [k * 3, 'spark', 72 + k]), [120, 'chime'], [460, 'riser2'], [600, 'chime'], [860, 'blip', 84]]);

/* ====================================================================== */
/* 22 CSMA/CD 最短帧长                                                     */
/* ====================================================================== */

const CS = {
  card: 380,
  reveal: 880,
  steps: [
    {at: 60, label: 'A 开始发送'},
    {at: 300, label: '冲突'},
    {at: 540, label: '2τ 后 A 检测到'},
    {at: 600, label: '最短帧长'},
  ],
};

export const CNCsma: React.FC = () => (
  <Problem
    no={22}
    color={C}
    tag="计算机网络 · 数据链路层"
    title="CSMA/CD 的最短帧长"
    q={[
      ['某 CSMA/CD 总线网络，数据传输率 ', {t: '1 Gb/s', c: B}, '，相距最远的两站点间距离为 ', {t: '1 km', c: B}, '，'],
      ['信号传播速度 ', {t: '200 000 km/s', c: B}, '。为保证能检测到冲突，该网络的', {t: '最短帧长', c: A2}, '为？'],
    ]}
    options={['1250 B', '625 B', '2500 B', '10000 B']}
    answer={0}
    brief="1 Gb/s · 1 km · 2×10⁵ km/s：最短帧长？"
    insight="帧的发送时间必须 ≥ 争用期 2τ，否则发完了还没收到冲突信号"
    {...CS}
  >
    {(sf) => <CsmaStage sf={sf} />}
  </Problem>
);

const CsmaStage: React.FC<{sf: number}> = ({sf}) => {
  const XA = 260;
  const XB = 1660;
  const Y = 400;
  const tau = 240;
  const aFront = clamp01((sf - 60) / tau);
  const bStart = 60 + tau - 30;
  const bFront = clamp01((sf - bStart) / tau);
  const col = sf >= 60 + tau - 15;
  const collX = XA + (XB - XA) * (1 - 15 / tau / 2) - 60;
  const back = clamp01((sf - (60 + tau - 15)) / (tau - 15));
  const frameW = clamp01((sf - 60) / (2 * tau)) * 1400;
  const fA = prog(sf, 600, 40);
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <GlowDefs />
        <line x1={XA} y1={Y} x2={XB} y2={Y} stroke={rgba('#fff', 0.4)} strokeWidth={6} strokeLinecap="round" />
        {[
          {x: XA, l: 'A'},
          {x: XB, l: 'B'},
        ].map((s) => (
          <g key={s.l}>
            <line x1={s.x} y1={Y} x2={s.x} y2={Y - 70} stroke={rgba('#fff', 0.4)} strokeWidth={4} />
            <rect x={s.x - 70} y={Y - 150} width={140} height={80} rx={14} fill="rgba(4,18,14,0.9)" stroke={C} strokeWidth={2.5} />
            <Txt x={s.x} y={Y - 110} size={34} weight={800} family={FONT.tech}>
              {s.l}
            </Txt>
          </g>
        ))}
        <Txt x={(XA + XB) / 2} y={Y + 40} size={22} color={COL.sub}>
          1 km · 单程传播时延 τ = 5 μs
        </Txt>
        {/* A's signal */}
        {aFront > 0 && <rect x={XA} y={Y - 14} width={(XB - XA) * aFront} height={28} rx={14} fill={rgba(B, 0.5)} filter="url(#g-s)" />}
        {bFront > 0 && !col && <rect x={XB - (XB - XA) * bFront} y={Y - 14} width={(XB - XA) * bFront} height={28} rx={14} fill={rgba(A2, 0.5)} />}
        {col && (
          <>
            <circle cx={collX} cy={Y} r={30 + 30 * Math.sin(sf / 3)} fill={R} opacity={0.5 * (1 - back)} filter="url(#g-l)" />
            <rect x={collX - (collX - XA) * back} y={Y - 20} width={(collX - XA) * back} height={40} rx={20} fill={rgba(R, 0.6)} />
            <Txt x={collX} y={Y - 190} size={28} weight={800} color={R} opacity={prog(sf, 60 + tau - 15, 12)}>
              冲突！
            </Txt>
          </>
        )}
        {back >= 1 && (
          <g transform={`translate(${XA},${Y - 190}) scale(${eBack(clamp01((sf - 60 - 2 * tau + 30) / 18))})`}>
            <Txt x={0} y={0} size={26} weight={800} color={R}>
              A 检测到冲突
            </Txt>
          </g>
        )}
        {/* A's frame being transmitted */}
        <g opacity={prog(sf, 60, 20)}>
          <Txt x={XA} y={560} size={22} anchor="start" color={COL.sub}>
            A 正在发送的帧（发送时间必须覆盖整个 2τ）
          </Txt>
          <rect x={XA} y={590} width={1400} height={50} rx={10} fill="rgba(255,255,255,0.04)" stroke={rgba('#fff', 0.2)} />
          <rect x={XA} y={590} width={frameW} height={50} rx={10} fill={rgba(B, 0.6)} />
          <path d={`M${XA},660 L${XA},672 L${XA + 1400},672 L${XA + 1400},660`} fill="none" stroke={A2} strokeWidth={2.5} opacity={prog(sf, 540, 20)} />
          <Txt x={XA + 700} y={700} size={26} weight={800} color={A2} opacity={prog(sf, 540, 20)}>
            争用期 2τ = 10 μs
          </Txt>
        </g>
      </svg>
      <div style={{position: 'absolute', left: 260, top: 760, fontFamily: FONT.tech, fontWeight: 700, fontSize: 38, color: '#fff', lineHeight: '58px', opacity: fA}}>
        <div>τ = 1 km ÷ (2 × 10⁵ km/s) = 5 μs</div>
        <div>
          L<sub style={{fontSize: 22}}>min</sub> = 2τ × R = 10 μs × 1 Gb/s = 10⁴ bit = <Hi c={A2}>1250 B</Hi>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const CNCsmaCues: Cue[] = probCues(CS, [[60, 'whoosh'], [270, 'whoosh'], [285, 'error'], [540, 'error'], [600, 'chime']]);

/* ====================================================================== */
/* 23 GBN vs SR                                                            */
/* ====================================================================== */

const WIN = {
  card: 420,
  reveal: 1180,
  steps: [
    {at: 0, label: '连续发送 0~6'},
    {at: 110, label: '2 号帧丢失'},
    {at: 520, label: '超时重传'},
    {at: 940, label: '窗口上限'},
  ],
};

export const CNWindow: React.FC = () => (
  <Problem
    no={23}
    color={C}
    tag="计算机网络 · 数据链路层"
    title="GBN 与 SR 滑动窗口"
    q={[
      ['帧序号用 ', {t: '3 比特', c: B}, ' 表示。发送方连续发送 0~6 号帧，其中 ', {t: '2 号帧丢失', c: R}, '，其余正确到达。'],
      ['① 采用 ', {t: '后退 N 帧（GBN）', c: A2}, '，发送方需重传哪些帧？发送窗口最大为多少？'],
      ['② 采用 ', {t: '选择重传（SR）', c: A2}, '，需重传哪些帧？发送窗口最大为多少？'],
    ]}
    brief="3 bit 序号 · 2 号帧丢失：GBN / SR 各重传什么？窗口多大？"
    answerText="GBN 重传 2~6，W ≤ 7 · SR 只传 2，W ≤ 4"
    insight="GBN：W_T ≤ 2ⁿ − 1；SR：W_T + W_R ≤ 2ⁿ，通常 W_T = W_R = 2ⁿ⁻¹"
    {...WIN}
  >
    {(sf) => <WindowStage sf={sf} />}
  </Problem>
);

const WindowStage: React.FC<{sf: number}> = ({sf}) => {
  const lanes = [
    {n: 'GBN 后退 N 帧', xs: 200, xr: 640, retx: [2, 3, 4, 5, 6]},
    {n: 'SR 选择重传', xs: 900, xr: 1340, retx: [2]},
  ];
  const Y0 = 250;
  const sendT = (i: number) => 40 + i * 34;
  const FLY = 110;
  const yOf = (t: number) => Y0 + (t - 40) * 0.52;
  const TO = 520;
  const winA = prog(sf, 940, 40);
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <GlowDefs />
        {lanes.map((ln, li) => (
          <g key={li} opacity={prog(sf, li * 8, 20)}>
            <Txt x={(ln.xs + ln.xr) / 2} y={206} size={28} weight={800}>
              {ln.n}
            </Txt>
            <Txt x={ln.xs} y={234} size={18} color={COL.sub}>
              发送方
            </Txt>
            <Txt x={ln.xr} y={234} size={18} color={COL.sub}>
              接收方
            </Txt>
            <line x1={ln.xs} y1={Y0} x2={ln.xs} y2={880} stroke={rgba(C, 0.5)} strokeWidth={3} />
            <line x1={ln.xr} y1={Y0} x2={ln.xr} y2={880} stroke={rgba(C, 0.5)} strokeWidth={3} />
            {[0, 1, 2, 3, 4, 5, 6].map((i) => {
              const t0 = sendT(i);
              const t = clamp01((sf - t0) / FLY);
              if (t <= 0) return null;
              const lost = i === 2;
              const tt = lost ? Math.min(t, 0.45) : t;
              const a: Pt = [ln.xs, yOf(t0)];
              const b: Pt = [ln.xr, yOf(t0 + FLY)];
              const discard = li === 0 && i > 2;
              const buffered = li === 1 && i > 2;
              return (
                <g key={i}>
                  <Arrow pts={[a, [lerp(a[0], b[0], tt), lerp(a[1], b[1], tt)]]} t={1} color={lost ? R : B} w={3} head={t >= 1 && !lost ? 12 : 0.01} />
                  <Txt x={a[0] - 26} y={a[1]} size={20} family={FONT.mono} weight={700} color={B}>
                    {i}
                  </Txt>
                  {lost && t >= 0.45 && (
                    <Txt x={lerp(a[0], b[0], 0.45)} y={lerp(a[1], b[1], 0.45)} size={34} weight={900} color={R}>
                      ✗
                    </Txt>
                  )}
                  {t >= 1 && !lost && (
                    <Txt x={b[0] + 20} y={b[1]} size={18} anchor="start" color={discard ? COL.dim : buffered ? A2 : C} weight={700}>
                      {discard ? `${i} 丢弃` : buffered ? `${i} 缓存` : `${i} ✓ ACK`}
                    </Txt>
                  )}
                </g>
              );
            })}
            {/* timeout + retransmit */}
            {sf >= TO && (
              <g>
                <Txt x={ln.xs - 20} y={yOf(TO) - 6} size={20} anchor="end" color={R} weight={800}>
                  2 号超时
                </Txt>
                {ln.retx.map((i, k) => {
                  const t0 = TO + 20 + k * 34;
                  const t = clamp01((sf - t0) / FLY);
                  if (t <= 0) return null;
                  const a: Pt = [ln.xs, yOf(t0)];
                  const b: Pt = [ln.xr, yOf(t0 + FLY)];
                  return (
                    <g key={i}>
                      <Arrow pts={[a, [lerp(a[0], b[0], t), lerp(a[1], b[1], t)]]} t={1} color={A2} w={3.5} head={t >= 1 ? 12 : 0.01} />
                      <Txt x={a[0] - 26} y={a[1]} size={20} family={FONT.mono} weight={700} color={A2}>
                        {i}
                      </Txt>
                      {t >= 1 && (
                        <Txt x={b[0] + 20} y={b[1]} size={18} anchor="start" color={C} weight={700}>
                          {li === 1 ? '2 ✓ 交付 2~6' : `${i} ✓`}
                        </Txt>
                      )}
                    </g>
                  );
                })}
                <Txt x={(ln.xs + ln.xr) / 2} y={900} size={26} weight={800} color={A2} opacity={prog(sf, TO + 200, 20)}>
                  {`重传 ${ln.retx.length} 帧`}
                </Txt>
              </g>
            )}
          </g>
        ))}
        {/* window ring */}
        <g opacity={winA} transform="translate(1720,560)">
          {new Array(8).fill(0).map((_, k) => {
            const a = ((-90 + k * 45) * Math.PI) / 180;
            return (
              <g key={k}>
                <circle cx={Math.cos(a) * 110} cy={Math.sin(a) * 110} r={24} fill={k < 4 ? rgba(A2, 0.5) : k < 7 ? rgba(B, 0.35) : 'rgba(255,255,255,0.06)'} stroke={k < 4 ? A2 : B} />
                <Txt x={Math.cos(a) * 110} y={Math.sin(a) * 110} size={20} family={FONT.mono} weight={700}>
                  {k}
                </Txt>
              </g>
            );
          })}
          <Txt x={0} y={-8} size={20} color={B} weight={700}>
            GBN ≤ 7
          </Txt>
          <Txt x={0} y={22} size={20} color={A2} weight={700}>
            SR ≤ 4
          </Txt>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export const CNWindowCues: Cue[] = probCues(WIN, [...[0, 1, 2, 3, 4, 5, 6].map((i): Cue => [40 + i * 34, 'tick']), [90, 'error'], [520, 'error'], ...[0, 1, 2, 3, 4].map((k): Cue => [540 + k * 34, 'blip', 72 + k * 2]), [940, 'chime']]);

/* ====================================================================== */
/* 24 子网划分 & 最长前缀匹配                                              */
/* ====================================================================== */

const SN = {
  card: 440,
  reveal: 1180,
  steps: [
    {at: 0, label: '借 2 位划子网'},
    {at: 420, label: '第 3 个子网'},
    {at: 760, label: '最长前缀匹配'},
  ],
};

export const CNSubnet: React.FC = () => (
  <Problem
    no={24}
    color={C}
    tag="计算机网络 · 网络层"
    title="子网划分与最长前缀匹配"
    q={[
      ['某单位获得地址块 ', {t: '192.168.10.0/24', m: true, c: B}, '，需划分为 ', {t: '4 个等长子网', c: A2}, '。'],
      ['① 子网掩码是？　② 第 3 个子网的可分配地址范围？'],
      ['③ 路由表含 ', {t: '.0/24、.128/25、.192/26', m: true}, ' 三项，目的地址 ', {t: '192.168.10.200', m: true, c: A2}, ' 匹配哪一项？'],
    ]}
    brief="192.168.10.0/24 四等分：掩码？第 3 子网？.200 走哪条路由？"
    answerText="/26 · .129~.190 · 选 .192/26"
    insight="子网掩码 255.255.255.192；转发时在所有匹配项中选前缀最长的"
    {...SN}
  >
    {(sf) => <SubnetStage sf={sf} />}
  </Problem>
);

const SubnetStage: React.FC<{sf: number}> = ({sf}) => {
  const bw = 46;
  const bx = (i: number) => 224 + i * bw + Math.floor(i / 8) * 10;
  const borrow = prog(sf, 90, 30);
  const segs = [0, 64, 128, 192];
  const NX = (v: number) => 260 + v * 5.4;
  const third = prog(sf, 420, 30);
  const lpm = prog(sf, 760, 30);
  const dst = 200;
  const dbits = dst.toString(2).padStart(8, '0');
  const routes = [
    {p: '192.168.10.0/24', len: 24, host: 0},
    {p: '192.168.10.128/25', len: 25, host: 128},
    {p: '192.168.10.192/26', len: 26, host: 192},
  ];
  const win = sf >= 1000;
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <GlowDefs />
        {/* address bits */}
        {new Array(32).fill(0).map((_, i) => {
          const net = i < 24;
          const sub = i >= 24 && i < 26 && borrow > 0;
          const col = net ? B : sub ? A2 : COL.sub;
          const bit = net ? '' : sub ? '' : '';
          return (
            <g key={i} opacity={prog(sf, i * 0.8, 10)}>
              <rect x={bx(i)} y={220} width={bw - 6} height={50} rx={6} fill={rgba(col, net ? 0.35 : sub ? 0.55 : 0.12)} stroke={col} />
              <Txt x={bx(i) + (bw - 6) / 2} y={246} size={18} family={FONT.mono} color="#fff">
                {bit}
              </Txt>
            </g>
          );
        })}
        {['192', '168', '10', 'x'].map((o, k) => (
          <Txt key={k} x={bx(k * 8) + (8 * bw) / 2 - 3} y={300} size={24} family={FONT.mono} weight={700} color={k < 3 ? B : COL.sub}>
            {o}
          </Txt>
        ))}
        <g opacity={borrow}>
          <Txt x={bx(25) + 20} y={196} size={22} weight={800} color={A2}>
            借 2 位 → 4 个子网
          </Txt>
          <Txt x={1840} y={246} size={26} family={FONT.mono} weight={700} anchor="end" color={A2}>
            /26
          </Txt>
          <Txt x={960} y={350} size={28} family={FONT.mono} weight={700}>
            掩码 255.255.255.192（11000000）
          </Txt>
        </g>
        {/* number line of last octet */}
        <g opacity={prog(sf, 180, 30)}>
          <line x1={NX(0)} y1={470} x2={NX(256)} y2={470} stroke="#fff" strokeWidth={2} />
          {segs.map((s, k) => {
            const hot = k === 2 && third > 0;
            return (
              <g key={k} opacity={prog(sf, 200 + k * 30, 20)}>
                <rect x={NX(s) + 3} y={430} width={64 * 5.4 - 6} height={80} rx={12} fill={rgba([B, C, A2, COL.os][k], hot ? 0.55 : 0.22)} stroke={[B, C, A2, COL.os][k]} strokeWidth={hot ? 3.5 : 2} filter={hot ? 'url(#g-m)' : undefined} />
                <Txt x={NX(s) + 32 * 5.4} y={458} size={24} weight={800} family={FONT.mono}>
                  {`.${s}/26`}
                </Txt>
                <Txt x={NX(s) + 32 * 5.4} y={490} size={18} color={COL.sub} family={FONT.mono}>
                  {`子网 ${k + 1}`}
                </Txt>
                <Txt x={NX(s)} y={534} size={18} family={FONT.mono} color={COL.dim}>
                  {s}
                </Txt>
              </g>
            );
          })}
          <Txt x={NX(256)} y={534} size={18} family={FONT.mono} color={COL.dim}>
            255
          </Txt>
        </g>
        <g opacity={third * (1 - lpm * 0.6)}>
          <Txt x={NX(160)} y={590} size={26} weight={700} color="#fff">
            网络地址 .128 · 广播地址 .191 · 可分配 .129 ~ .190（62 个）
          </Txt>
        </g>
        {/* LPM */}
        <g opacity={lpm}>
          <Txt x={260} y={660} size={26} anchor="start" weight={800}>
            目的地址 .200 =
          </Txt>
          {dbits.split('').map((b, i) => (
            <Cell key={i} x={500 + i * 50} y={635} w={44} h={50} text={b} color={A2} fill={0.3} size={24} family={FONT.mono} />
          ))}
          {routes.map((r, k) => {
            const y = 720 + k * 64;
            const hb = r.host.toString(2).padStart(8, '0');
            const nbits = r.len - 24;
            const ok = sf >= 820 + k * 50;
            const isWin = win && k === 2;
            return (
              <g key={k} opacity={prog(sf, 800 + k * 50, 20)}>
                <rect x={250} y={y - 26} width={1100} height={52} rx={10} fill={isWin ? rgba(C, 0.25) : 'transparent'} stroke={isWin ? C : 'transparent'} strokeWidth={2.5} />
                <Txt x={270} y={y} size={24} anchor="start" family={FONT.mono} color={isWin ? C : '#fff'}>
                  {r.p}
                </Txt>
                {hb.split('').map((b, i) => (
                  <Cell key={i} x={500 + i * 50 + 3} y={y - 22} w={38} h={44} text={i < nbits ? b : '·'} color={i < nbits ? (ok ? COL.green : B) : COL.dim} fill={i < nbits && ok ? 0.35 : 0} size={20} family={FONT.mono} dim={i >= nbits} />
                ))}
                <Txt x={960} y={y} size={22} anchor="start" color={ok ? COL.green : COL.sub} weight={700}>
                  {ok ? `前 ${r.len} 位匹配 ✓` : ''}
                </Txt>
              </g>
            );
          })}
          {win && (
            <Txt x={1500} y={784} size={30} weight={800} color={C} anchor="start" glow>
              最长：/26 胜出
            </Txt>
          )}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export const CNSubnetCues: Cue[] = probCues(SN, [[90, 'whoosh'], ...[0, 1, 2, 3].map((k): Cue => [200 + k * 30, 'blip', 72 + k * 3]), [420, 'chime'], ...[0, 1, 2].map((k): Cue => [820 + k * 50, 'tick']), [1000, 'chime']]);

export const _u = [Cam, Caption, Glass, eInOut, eOut, useF];
