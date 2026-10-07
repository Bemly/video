import React, {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill} from 'remotion';
import {ActTitle} from '../components/ActTitle';
import {useF} from '../components/Shot';
import {along, Arrow, Caption, Cam, GlowDefs, Pt} from '../components/ui';
import {clamp01, COL, eBack, eInOut, eOut, FONT, lerp, prog, rgba} from '../theme';
import DOTS from '../globe_dots.json';

const C = COL.cn;

export const CNTitle: React.FC = () => (
  <ActTitle
    num="04"
    zh="计算机网络"
    en="COMPUTER NETWORK"
    color={C}
    score={25}
    topics={['物理层', '数据链路层', '网络层', '传输层', '应用层']}
    quote="The Network is the Computer"
    by="John Gage"
  />
);

/* ============================ Encapsulation ============================ */

const LAYERS = [
  {zh: '应用层', p: 'HTTP · DNS', pdu: '报文 Message'},
  {zh: '传输层', p: 'TCP · UDP', pdu: '报文段 Segment'},
  {zh: '网络层', p: 'IP · ICMP', pdu: '数据报 Datagram'},
  {zh: '数据链路层', p: '以太网 · PPP', pdu: '帧 Frame'},
  {zh: '物理层', p: '比特流', pdu: '比特 Bits'},
];
const HDR = [
  {l: 'TCP', c: COL.ds, w: 84},
  {l: 'IP', c: COL.co, w: 84},
  {l: '帧头', c: COL.os, w: 84},
];

const layerY = (k: number) => 210 + k * 100;

const Pdu: React.FC<{x: number; y: number; level: number; strip?: number; alpha?: number}> = ({x, y, level, strip = 0, alpha = 1}) => {
  // level: number of headers present (0..3). strip: 0..1 animation of the outermost header leaving
  const parts: {l: string; c: string; w: number; kind: 'h' | 'd' | 't'; out: boolean}[] = [];
  for (let i = level - 1; i >= 0; i--) parts.push({...HDR[i], kind: 'h', out: i === level - 1 && strip > 0});
  parts.push({l: 'DATA', c: '#e6fff5', w: 150, kind: 'd', out: false});
  if (level >= 3) parts.push({l: 'FCS', c: COL.os, w: 60, kind: 't', out: strip > 0});
  const total = parts.reduce((a, p) => a + p.w, 0);
  let cx = x - total / 2;
  return (
    <g opacity={alpha}>
      {parts.map((p, i) => {
        const x0 = cx;
        cx += p.w;
        const off = p.out ? eInOut(strip) : 0;
        const dx = p.out ? (p.kind === 't' ? 1 : -1) * off * 160 : 0;
        return (
          <g key={i} transform={`translate(${dx},${-off * 60})`} opacity={1 - off}>
            <rect x={x0 + 2} y={y - 30} width={p.w - 4} height={60} rx={8} fill={rgba(p.c, p.kind === 'd' ? 0.9 : 0.75)} stroke={p.c} strokeWidth={2} filter="url(#g-s)" />
            <text x={x0 + p.w / 2} y={y + 9} textAnchor="middle" fontFamily={p.kind === 'd' ? FONT.tech : FONT.sans} fontWeight={700} fontSize={p.kind === 'd' ? 28 : 22} fill="#06140f">
              {p.l}
            </text>
          </g>
        );
      })}
    </g>
  );
};

export const CNStack: React.FC = () => {
  const f = useF();
  const E = (k: number) => 40 + k * 36;
  const D = (j: number) => 262 + j * 34;
  const XE = 720;
  const XD = 1200;
  // encapsulation phase: which layer & vertical position
  let encLevel = 0;
  let encY = layerY(0);
  let encLayer = 0;
  for (let k = 1; k <= 4; k++) {
    if (f >= E(k)) {
      encLayer = k;
      encY = lerp(layerY(k - 1), layerY(k), eInOut(clamp01((f - E(k)) / 18))) + 42;
    }
  }
  if (encLayer === 0) encY = layerY(0) + 42;
  encLevel = Math.min(3, encLayer);
  const encAlpha = f < 40 ? prog(f, 20, 20) : 1 - prog(f, 196, 14);
  const hdrIn = encLayer >= 1 && encLayer <= 3 ? eBack(clamp01((f - E(encLayer) - 8) / 16)) : 1;
  // bits along cable
  const cable: Pt[] = [
    [XE, layerY(4) + 42],
    [XE, 820],
    [XD, 820],
    [XD, layerY(4) + 42],
  ];
  const bitsT = clamp01((f - 200) / 62);
  // decapsulation
  let decLayer = 4;
  let decY = layerY(4) + 42;
  let strip = 0;
  let decLevel = 3;
  for (let j = 0; j < 4; j++) {
    if (f >= D(j)) {
      decLayer = 3 - j;
      decY = lerp(layerY(4 - j), layerY(3 - j), eInOut(clamp01((f - D(j)) / 18))) + 42;
      decLevel = 3 - j;
      strip = clamp01((f - D(j)) / 22);
    }
  }
  const decAlpha = prog(f, 258, 10);
  const levelShown = f >= D(0) ? decLevel + (strip < 1 ? 1 : 0) : 3;
  const done = prog(f, 400, 16);
  const activeL = f < 262 ? encLayer : decLayer;

  const stack = (x: number, side: 'L' | 'R', title: string) => (
    <g>
      <text x={x + 150} y={176} textAnchor="middle" fontFamily={FONT.sans} fontSize={26} fontWeight={700} fill="#fff" opacity={prog(f, 0, 20)}>
        {title}
      </text>
      {LAYERS.map((L, k) => {
        const a = eBack(clamp01((f - k * 5 - (side === 'R' ? 8 : 0)) / 20));
        const on = (side === 'L' && f < 210 && encLayer === k) || (side === 'R' && f >= 258 && activeL === k);
        return (
          <g key={k} opacity={clamp01(a * 2)} transform={`translate(${x + 150},${layerY(k) + 42}) scale(${lerp(0.7, 1, a)})`}>
            <rect x={-150} y={-42} width={300} height={84} rx={12} fill={on ? rgba(C, 0.28) : 'rgba(6,20,16,0.85)'} stroke={on ? '#fff' : C} strokeWidth={on ? 3 : 2} filter="url(#g-s)" />
            <text x={-126} y={-2} fontFamily={FONT.sans} fontWeight={800} fontSize={28} fill="#fff">
              {L.zh}
            </text>
            <text x={-126} y={28} fontFamily={FONT.sans} fontSize={18} fill={rgba(C, 0.85)}>
              {L.p}
            </text>
          </g>
        );
      })}
    </g>
  );

  const bitStr = '0110100111010010';
  return (
    <AbsoluteFill>
      <Cam to={1.04}>
        <svg width={1920} height={1080}>
          <GlowDefs />
          {stack(100, 'L', '发送方 Host A')}
          {stack(1520, 'R', '接收方 Host B')}
          {/* cable */}
          <path d={`M${cable.map((p) => p.join(',')).join(' L')}`} fill="none" stroke={rgba(C, 0.25)} strokeWidth={6} strokeLinejoin="round" opacity={prog(f, 30, 30)} />
          <text x={960} y={860} textAnchor="middle" fontFamily={FONT.sans} fontSize={22} fill={COL.sub} opacity={prog(f, 30, 30)}>
            传输介质
          </text>
          {/* connectors */}
          {f < 210 && <line x1={400} y1={layerY(encLayer) + 42} x2={XE - 200} y2={encY} stroke={rgba(C, 0.6)} strokeWidth={2} strokeDasharray="6 6" />}
          {f >= 258 && <line x1={1520} y1={layerY(decLayer) + 42} x2={XD + 200} y2={decY} stroke={rgba(C, 0.6)} strokeWidth={2} strokeDasharray="6 6" />}
          {/* encapsulating PDU */}
          {f < 212 && (
            <g transform={`translate(0,0)`}>
              <g transform={`translate(${encLayer >= 1 && encLayer <= 3 ? 0 : 0},0)`}>
                <Pdu x={XE} y={encY} level={encLevel} alpha={encAlpha} />
              </g>
              {encLayer >= 1 && encLayer <= 3 && hdrIn < 1 && (
                <circle cx={XE - 120} cy={encY} r={60 * (1 - hdrIn) + 10} fill="none" stroke={HDR[encLayer - 1].c} strokeWidth={3} opacity={1 - hdrIn} />
              )}
              <text x={XE} y={encY + 58} textAnchor="middle" fontFamily={FONT.sans} fontSize={22} fill={C} opacity={encAlpha}>
                {LAYERS[Math.min(4, encLayer)].pdu}
              </text>
            </g>
          )}
          {/* bits on the wire */}
          {f >= 190 && f < 272 &&
            bitStr.split('').map((b, i) => {
              const t = bitsT - i * 0.018;
              if (t <= 0 || t >= 1) return null;
              const {p} = along(cable, eInOut(clamp01(t)));
              return (
                <text key={i} x={p[0]} y={p[1] + 9} textAnchor="middle" fontFamily={FONT.mono} fontWeight={700} fontSize={28} fill={i % 3 ? C : '#fff'} filter="url(#g-s)">
                  {b}
                </text>
              );
            })}
          {/* decapsulating PDU */}
          {f >= 258 && (
            <g>
              <Pdu x={XD} y={decY} level={Math.min(3, levelShown)} strip={f >= D(0) && strip < 1 ? strip : 0} alpha={decAlpha} />
              <text x={XD} y={decY + 58} textAnchor="middle" fontFamily={FONT.sans} fontSize={22} fill={C}>
                {LAYERS[decLayer].pdu}
              </text>
            </g>
          )}
          {done > 0 && (
            <g transform={`translate(${XD},${layerY(0) + 42})`} opacity={done}>
              <circle r={60 + done * 30} fill="none" stroke={C} strokeWidth={3} opacity={1 - done} />
              <text x={110} y={10} fontFamily={FONT.sans} fontWeight={800} fontSize={30} fill={C}>
                ✓ 交付
              </text>
            </g>
          )}
          <text x={960} y={140} textAnchor="middle" fontFamily={FONT.sans} fontSize={24} fill={COL.sub} letterSpacing={6} opacity={prog(f, 20, 30)}>
            {f < 230 ? '封装：逐层加上首部 ↓' : '解封装：逐层剥去首部 ↑'}
          </text>
        </svg>
      </Cam>
      <Caption title="分层与封装" en="ENCAPSULATION" desc="五层模型 · 每一层只和对等层“对话”" chip="PDU" color={C} />
    </AbsoluteFill>
  );
};

/* ============================ TCP handshake ============================ */

export const CNTcp: React.FC = () => {
  const f = useF();
  const XC = 560;
  const XS = 1360;
  const msgs = [
    {a: [XC, 320] as Pt, b: [XS, 440] as Pt, l: 'SYN = 1,  seq = x', at: 40},
    {a: [XS, 470] as Pt, b: [XC, 590] as Pt, l: 'SYN = 1,  ACK = 1,  seq = y,  ack = x + 1', at: 120},
    {a: [XC, 620] as Pt, b: [XS, 740] as Pt, l: 'ACK = 1,  seq = x + 1,  ack = y + 1', at: 200},
  ];
  const est = prog(f, 272, 24);
  const clientState = f < 40 ? 'CLOSED' : f < 190 ? 'SYN-SENT' : 'ESTABLISHED';
  const serverState = f < 110 ? 'LISTEN' : f < 270 ? 'SYN-RCVD' : 'ESTABLISHED';
  const stY = (s: string, side: 'c' | 's') =>
    side === 'c' ? (s === 'CLOSED' ? 300 : s === 'SYN-SENT' ? 330 : 600) : s === 'LISTEN' ? 300 : s === 'SYN-RCVD' ? 450 : 730;

  return (
    <AbsoluteFill>
      <Cam to={1.05}>
        <svg width={1920} height={1080}>
          <GlowDefs />
          {[
            {x: XC, t: '客户端', e: 'CLIENT'},
            {x: XS, t: '服务器', e: 'SERVER'},
          ].map((h, i) => (
            <g key={i} opacity={prog(f, i * 6, 24)}>
              <rect x={h.x - 120} y={170} width={240} height={70} rx={14} fill="rgba(6,20,16,0.9)" stroke={C} strokeWidth={2.5} filter="url(#g-m)" />
              <text x={h.x} y={206} textAnchor="middle" fontFamily={FONT.sans} fontWeight={800} fontSize={30} fill="#fff">
                {h.t}
              </text>
              <text x={h.x} y={230} textAnchor="middle" fontFamily={FONT.tech} fontSize={16} letterSpacing={5} fill={C}>
                {h.e}
              </text>
              <line x1={h.x} y1={240} x2={h.x} y2={240 + 640 * prog(f, 10 + i * 6, 40, eInOut)} stroke={rgba(C, 0.5)} strokeWidth={3} strokeDasharray="4 10" />
            </g>
          ))}
          {msgs.map((m, i) => {
            const t = prog(f, m.at, 56, eInOut);
            if (t <= 0) return null;
            const ang = (Math.atan2(m.b[1] - m.a[1], m.b[0] - m.a[0]) * 180) / Math.PI;
            const mx = (m.a[0] + m.b[0]) / 2;
            const my = (m.a[1] + m.b[1]) / 2;
            const {p} = along([m.a, m.b], t);
            const upright = ang > 90 || ang < -90 ? ang + 180 : ang;
            return (
              <g key={i}>
                <Arrow pts={[m.a, m.b]} t={t} color={C} w={4} head={18} />
                <g transform={`translate(${mx},${my}) rotate(${upright}) translate(0,-22)`} opacity={prog(f, m.at + 10, 20)}>
                  <text textAnchor="middle" fontFamily={FONT.mono} fontWeight={700} fontSize={26} fill="#fff">
                    {m.l}
                  </text>
                </g>
                {t < 1 && (
                  <g transform={`translate(${p[0]},${p[1]})`}>
                    <circle r={16} fill="#fff" filter="url(#g-l)" />
                  </g>
                )}
                <g transform={`translate(${m.a[0] + (m.a[0] < 960 ? -34 : 34)},${m.a[1]})`}>
                  <circle r={18} fill={C} />
                  <text y={8} textAnchor="middle" fontFamily={FONT.tech} fontWeight={700} fontSize={22} fill="#04120d">
                    {i + 1}
                  </text>
                </g>
              </g>
            );
          })}
          {/* states */}
          {[
            {s: clientState, side: 'c' as const, x: XC - 70, anchor: 'end'},
            {s: serverState, side: 's' as const, x: XS + 70, anchor: 'start'},
          ].map((o, i) => {
            const isEst = o.s === 'ESTABLISHED';
            return (
              <text
                key={i}
                x={o.x}
                y={stY(o.s, o.side)}
                textAnchor={o.anchor as 'end'}
                fontFamily={FONT.display}
                fontSize={24}
                letterSpacing={3}
                fill={isEst ? C : COL.sub}
                filter={isEst ? 'url(#g-s)' : undefined}
                opacity={prog(f, 20, 20)}
              >
                {o.s}
              </text>
            );
          })}
          {/* data exchange after established */}
          {est > 0 &&
            [0, 1, 2, 3, 4, 5].map((k) => {
              const dir = k % 2 === 0 ? 1 : -1;
              const t = ((f - 280) / 40 + k * 0.33) % 1;
              if (f < 280) return null;
              const y = 790 + (k % 3) * 26;
              const x = dir > 0 ? lerp(XC, XS, t) : lerp(XS, XC, t);
              return <rect key={k} x={x - 16} y={y - 7} width={32} height={14} rx={7} fill={dir > 0 ? C : '#fff'} opacity={Math.sin(t * Math.PI) * est} filter="url(#g-s)" />;
            })}
        </svg>
        <div
          style={{
            position: 'absolute',
            width: 1920,
            top: 868,
            textAlign: 'center',
            fontFamily: FONT.sans,
            fontWeight: 700,
            fontSize: 34,
            color: '#fff',
            letterSpacing: '0.2em',
            opacity: est,
            textShadow: `0 0 24px ${rgba(C, 0.8)}`,
          }}
        >
          连接建立 · 开始可靠传输
        </div>
      </Cam>
      <Caption title="三次握手" en="TCP HANDSHAKE" desc="SYN → SYN+ACK → ACK · 双方确认彼此的收发能力" chip="可靠传输" color={C} />
    </AbsoluteFill>
  );
};

/* ============================ Congestion control ============================ */

const CW = [1, 2, 4, 8, 16, 17, 18, 19, 20, 21, 22, 23, 24, 1, 2, 4, 8, 12, 13, 14, 15, 16, 8, 9, 10, 11];

export const CNCwnd: React.FC = () => {
  const f = useF();
  const X0 = 260;
  const X1 = 1700;
  const YB = 790;
  const YT = 200;
  const xs = (i: number) => X0 + (i / (CW.length - 1)) * (X1 - X0);
  const ys = (v: number) => YB - (v / 28) * (YB - YT);
  const u = clamp01((f - 34) / 290) * (CW.length - 1);
  const k = Math.floor(u);
  const fr = u - k;
  const pts: Pt[] = CW.slice(0, k + 1).map((v, i) => [xs(i), ys(v)]);
  if (k < CW.length - 1) pts.push([lerp(xs(k), xs(k + 1), fr), lerp(ys(CW[k]), ys(CW[k + 1]), fr)]);
  const d = 'M' + pts.map((p) => p.join(',')).join(' L');
  const area = d + ` L${pts[pts.length - 1][0]},${YB} L${X0},${YB} Z`;
  const head = pts[pts.length - 1];
  const axis = prog(f, 0, 30);
  const lbl = (at: number) => prog(f, 34 + (at / (CW.length - 1)) * 290, 20);
  const thr = [
    {v: 16, a: 0, b: 12, at: 0},
    {v: 12, a: 12, b: 21, at: 13},
    {v: 8, a: 21, b: 25, at: 22},
  ];

  return (
    <AbsoluteFill>
      <Cam to={1.05} ox={1300} oy={500}>
        <svg width={1920} height={1080}>
          <GlowDefs />
          <defs>
            <linearGradient id="cwArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={C} stopOpacity={0.35} />
              <stop offset="1" stopColor={C} stopOpacity={0} />
            </linearGradient>
          </defs>
          <g opacity={axis}>
            <line x1={X0} y1={YB} x2={X1 + 40} y2={YB} stroke={rgba('#fff', 0.5)} strokeWidth={2} />
            <line x1={X0} y1={YB} x2={X0} y2={YT - 40} stroke={rgba('#fff', 0.5)} strokeWidth={2} />
            {[0, 4, 8, 12, 16, 20, 24, 28].map((v) => (
              <g key={v}>
                <line x1={X0} y1={ys(v)} x2={X1} y2={ys(v)} stroke={rgba('#fff', 0.06)} />
                <text x={X0 - 18} y={ys(v) + 8} textAnchor="end" fontFamily={FONT.mono} fontSize={20} fill={COL.dim}>
                  {v}
                </text>
              </g>
            ))}
            {CW.map((_, i) =>
              i % 2 === 0 ? (
                <text key={i} x={xs(i)} y={YB + 32} textAnchor="middle" fontFamily={FONT.mono} fontSize={18} fill={COL.dim}>
                  {i + 1}
                </text>
              ) : null,
            )}
            <text x={X0} y={YT - 56} fontFamily={FONT.mono} fontSize={24} fill={C}>
              cwnd
            </text>
            <text x={X1 + 40} y={YB + 66} textAnchor="end" fontFamily={FONT.sans} fontSize={22} fill={COL.sub}>
              传输轮次（RTT）
            </text>
          </g>
          {thr.map((t, i) => {
            const a = lbl(t.at);
            if (a <= 0) return null;
            return (
              <g key={i} opacity={a}>
                <line x1={xs(t.a)} y1={ys(t.v)} x2={xs(t.a) + (xs(t.b) - xs(t.a)) * a} y2={ys(t.v)} stroke={COL.co} strokeWidth={2} strokeDasharray="10 8" />
                <text x={xs(t.b) - 6} y={ys(t.v) - 10} textAnchor="end" fontFamily={FONT.mono} fontSize={20} fill={COL.co}>
                  ssthresh = {t.v}
                </text>
              </g>
            );
          })}
          <path d={area} fill="url(#cwArea)" />
          <path d={d} fill="none" stroke={C} strokeWidth={5} strokeLinejoin="round" filter="url(#g-m)" />
          {pts.slice(0, k + 1).map((p, i) => (
            <circle key={i} cx={p[0]} cy={p[1]} r={5} fill="#fff" />
          ))}
          <circle cx={head[0]} cy={head[1]} r={12} fill="#fff" filter="url(#g-l)" />
          {/* phase labels */}
          <g opacity={lbl(3)}>
            <text x={xs(1.2)} y={ys(12)} fontFamily={FONT.sans} fontWeight={800} fontSize={30} fill="#fff">
              慢开始
            </text>
            <text x={xs(1.2)} y={ys(12) + 32} fontFamily={FONT.mono} fontSize={22} fill={C}>
              cwnd × 2
            </text>
          </g>
          <g opacity={lbl(8)}>
            <text x={xs(6)} y={ys(25)} fontFamily={FONT.sans} fontWeight={800} fontSize={30} fill="#fff">
              拥塞避免
            </text>
            <text x={xs(6)} y={ys(25) + 32} fontFamily={FONT.mono} fontSize={22} fill={C}>
              cwnd + 1
            </text>
          </g>
          {[
            {i: 12, t: '超时', s: 'cwnd → 1', c: COL.red},
            {i: 21, t: '3 个重复 ACK', s: '快重传 · 快恢复', c: COL.co},
          ].map((m, j) => {
            const a = eBack(lbl(m.i + 1));
            if (a <= 0) return null;
            return (
              <g key={j} transform={`translate(${xs(m.i)},${ys(CW[m.i])})`}>
                <circle r={16 * a} fill="none" stroke={m.c} strokeWidth={3} filter="url(#g-s)" />
                <g opacity={clamp01(a)} transform={`translate(${j === 0 ? 24 : 20},${j === 0 ? -20 : -44}) scale(${a})`}>
                  <text fontFamily={FONT.sans} fontWeight={800} fontSize={28} fill={m.c}>
                    {m.t}
                  </text>
                  <text y={30} fontFamily={FONT.sans} fontSize={22} fill="#fff">
                    {m.s}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </Cam>
      <Caption title="拥塞控制" en="CONGESTION CONTROL" desc="慢开始 · 拥塞避免 · 快重传 · 快恢复" chip="TCP Reno" color={C} />
    </AbsoluteFill>
  );
};

/* ============================ Globe ============================ */

const CITIES: {n: string; lon: number; lat: number}[] = [
  {n: '北京', lon: 116.4, lat: 39.9},
  {n: '上海', lon: 121.5, lat: 31.2},
  {n: '东京', lon: 139.7, lat: 35.7},
  {n: '新加坡', lon: 103.8, lat: 1.35},
  {n: '悉尼', lon: 151.2, lat: -33.9},
  {n: '旧金山', lon: -122.4, lat: 37.8},
  {n: '莫斯科', lon: 37.6, lat: 55.7},
  {n: '孟买', lon: 72.9, lat: 19.1},
  {n: '伦敦', lon: -0.13, lat: 51.5},
];
const ROUTES: [number, number][] = [
  [0, 2],
  [0, 3],
  [1, 5],
  [0, 6],
  [3, 4],
  [0, 7],
  [6, 8],
  [1, 4],
];

const D2R = Math.PI / 180;
const vec = (lon: number, lat: number): [number, number, number] => [Math.cos(lat * D2R) * Math.cos(lon * D2R), Math.cos(lat * D2R) * Math.sin(lon * D2R), Math.sin(lat * D2R)];

const drawGlobe = (cv: HTMLCanvasElement, f: number) => {
  const ctx = cv.getContext('2d')!;
  ctx.clearRect(0, 0, 1920, 1080);
  const CX = 1130;
  const CY = 540;
  const R = 385;
  const lon0 = lerp(88, 128, f / 420) * D2R;
  const lat0 = 24 * D2R;
  const cl = Math.cos(lon0);
  const sl = Math.sin(lon0);
  const ct = Math.cos(lat0);
  const st = Math.sin(lat0);
  const proj = (v: [number, number, number]) => {
    // rotate around z by -lon0
    const x1 = v[0] * cl + v[1] * sl;
    const y1 = -v[0] * sl + v[1] * cl;
    const z1 = v[2];
    // tilt around y by lat0
    const x2 = x1 * ct + z1 * st;
    const z2 = -x1 * st + z1 * ct;
    return {x: CX + R * y1, y: CY - R * z2, d: x2, r: Math.hypot(y1, z2)};
  };
  const intro = eOut(clamp01(f / 50));

  // atmosphere + ocean
  const atm = ctx.createRadialGradient(CX, CY, R * 0.9, CX, CY, R * 1.35);
  atm.addColorStop(0, 'rgba(52,211,153,0.35)');
  atm.addColorStop(1, 'rgba(52,211,153,0)');
  ctx.globalAlpha = intro;
  ctx.fillStyle = atm;
  ctx.beginPath();
  ctx.arc(CX, CY, R * 1.35, 0, Math.PI * 2);
  ctx.fill();
  const ocean = ctx.createRadialGradient(CX - R * 0.3, CY - R * 0.35, R * 0.1, CX, CY, R);
  ocean.addColorStop(0, '#0b3b2e');
  ocean.addColorStop(1, '#03110d');
  ctx.fillStyle = ocean;
  ctx.beginPath();
  ctx.arc(CX, CY, R, 0, Math.PI * 2);
  ctx.fill();

  // graticule
  ctx.strokeStyle = 'rgba(110,231,183,0.10)';
  ctx.lineWidth = 1;
  for (let lat = -60; lat <= 60; lat += 30) {
    ctx.beginPath();
    let pen = false;
    for (let lon = -180; lon <= 180; lon += 4) {
      const p = proj(vec(lon, lat));
      if (p.d > 0) {
        if (pen) ctx.lineTo(p.x, p.y);
        else ctx.moveTo(p.x, p.y);
        pen = true;
      } else pen = false;
    }
    ctx.stroke();
  }
  for (let lon = -180; lon < 180; lon += 30) {
    ctx.beginPath();
    let pen = false;
    for (let lat = -88; lat <= 88; lat += 4) {
      const p = proj(vec(lon, lat));
      if (p.d > 0) {
        if (pen) ctx.lineTo(p.x, p.y);
        else ctx.moveTo(p.x, p.y);
        pen = true;
      } else pen = false;
    }
    ctx.stroke();
  }

  // land dots
  const dots = DOTS as number[];
  for (let i = 0; i < dots.length; i += 2) {
    const p = proj(vec(dots[i], dots[i + 1]));
    if (p.d <= 0) continue;
    ctx.globalAlpha = intro * (0.25 + 0.75 * p.d);
    ctx.fillStyle = '#6ee7b7';
    const s = 1.6 + p.d * 1.6;
    ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
  }
  ctx.globalAlpha = 1;

  // arcs
  ROUTES.forEach(([a, b], ri) => {
    const va = vec(CITIES[a].lon, CITIES[a].lat);
    const vb = vec(CITIES[b].lon, CITIES[b].lat);
    const dot = va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2];
    const om = Math.acos(Math.max(-1, Math.min(1, dot)));
    const h = 0.06 + om * 0.16;
    const N = 60;
    const P: {x: number; y: number; vis: boolean}[] = [];
    for (let k = 0; k <= N; k++) {
      const t = k / N;
      const s1 = Math.sin((1 - t) * om) / Math.sin(om);
      const s2 = Math.sin(t * om) / Math.sin(om);
      const lift = 1 + h * Math.sin(Math.PI * t);
      const v: [number, number, number] = [(va[0] * s1 + vb[0] * s2) * lift, (va[1] * s1 + vb[1] * s2) * lift, (va[2] * s1 + vb[2] * s2) * lift];
      const p = proj(v);
      P.push({x: p.x, y: p.y, vis: p.d > 0 || p.r > 1});
    }
    const start = 40 + ri * 18;
    const grow = eInOut(clamp01((f - start) / 50));
    if (grow <= 0) return;
    const nDraw = Math.floor(grow * N);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(52,211,153,0.85)';
    ctx.shadowColor = 'rgba(52,211,153,0.9)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    let pen = false;
    for (let k = 0; k <= nDraw; k++) {
      if (!P[k].vis) {
        pen = false;
        continue;
      }
      if (pen) ctx.lineTo(P[k].x, P[k].y);
      else ctx.moveTo(P[k].x, P[k].y);
      pen = true;
    }
    ctx.stroke();
    // packets
    if (grow >= 1) {
      for (let q = 0; q < 2; q++) {
        const t = ((f - start - 50) / 70 + q * 0.5 + ri * 0.13) % 1;
        const idx = Math.floor(t * N);
        const p = P[idx];
        if (!p.vis) continue;
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#a7f3d0';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.shadowBlur = 0;
  });

  // cities
  ctx.textAlign = 'left';
  ctx.font = '600 22px "Noto Sans SC"';
  CITIES.forEach((c, i) => {
    const p = proj(vec(c.lon, c.lat));
    if (p.d <= 0.05) return;
    const a = Math.min(1, p.d * 3) * intro;
    const pulse = ((f + i * 13) % 60) / 60;
    ctx.globalAlpha = a * (1 - pulse);
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 6 + pulse * 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = a;
    ctx.fillStyle = i === 0 ? '#fbbf24' : '#ffffff';
    ctx.beginPath();
    ctx.arc(p.x, p.y, i === 0 ? 7 : 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e6fff5';
    ctx.fillText(c.n, p.x + 12, p.y - 10);
  });
  ctx.globalAlpha = 1;
};

const TRACE = [
  '$ traceroute 408.edu.cn',
  ' 1  192.168.1.1      0.9 ms',
  ' 2  10.12.0.1        2.3 ms',
  ' 3  202.112.36.1     5.8 ms',
  ' 4  101.4.117.33     9.6 ms',
  ' 5  408.edu.cn      12.4 ms',
];

export const CNGlobe: React.FC = () => {
  const f = useF();
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    if (ref.current) drawGlobe(ref.current, f);
  }, [f]);
  return (
    <AbsoluteFill>
      <Cam to={1.06} ox={1130}>
        <canvas ref={ref} width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}} />
        <div
          style={{
            position: 'absolute',
            left: 110,
            top: 210,
            width: 520,
            padding: '18px 24px',
            borderRadius: 16,
            background: 'rgba(4,16,12,0.8)',
            border: `1px solid ${rgba(C, 0.4)}`,
            fontFamily: FONT.mono,
            fontSize: 23,
            lineHeight: '40px',
            color: '#c9f5e3',
            whiteSpace: 'pre',
            opacity: prog(f, 10, 24),
            transform: `translateX(${(1 - prog(f, 10, 30)) * -40}px)`,
          }}
        >
          <div style={{display: 'flex', gap: 8, marginBottom: 8}}>
            {['#f87171', '#fbbf24', '#34d399'].map((c) => (
              <span key={c} style={{width: 12, height: 12, borderRadius: 6, background: c}} />
            ))}
          </div>
          {TRACE.map((l, i) => {
            const at = 24 + i * 22;
            const n = Math.max(0, Math.min(l.length, Math.floor((f - at) * 1.6)));
            return (
              <div key={i} style={{color: i === 0 ? C : i === TRACE.length - 1 ? '#fff' : undefined, minHeight: 40}}>
                {l.slice(0, n)}
                {n > 0 && n < l.length ? '▌' : ''}
              </div>
            );
          })}
        </div>
        <div style={{position: 'absolute', left: 110, top: 590, display: 'flex', flexWrap: 'wrap', gap: 12, width: 560}}>
          {['IPv4 · 192.168.1.0/24', '路由选择 · OSPF / BGP', 'DNS · HTTP'].map((t, i) => {
            const a = eBack(clamp01((f - 170 - i * 10) / 20));
            return (
              <span
                key={i}
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 22,
                  color: '#fff',
                  padding: '6px 16px',
                  borderRadius: 999,
                  border: `1.5px solid ${rgba(C, 0.6)}`,
                  background: rgba(C, 0.12),
                  opacity: clamp01(a * 2),
                  transform: `scale(${lerp(0.6, 1, a)})`,
                }}
              >
                {t}
              </span>
            );
          })}
        </div>
      </Cam>
      <Caption title="互联网" en="INTERNET" desc="分组交换 · 路由转发 · 把整个世界连在一起" chip="IP / TCP" color={C} />
    </AbsoluteFill>
  );
};

export const _u = [eOut, GlowDefs];
