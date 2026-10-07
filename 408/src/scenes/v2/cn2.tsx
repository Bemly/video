import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Comet, Glass, Hi, Txt} from '../../components/kit';
import {Cue, Problem, probCues} from '../../components/Problem';
import {useF} from '../../components/Shot';
import {along, Arrow, Caption, Cam, GlowDefs, Pt} from '../../components/ui';
import {clamp01, COL, eBack, eInOut, eOut, FONT, lerp, prog, rgba} from '../../theme';

const C = COL.cn;
const B = COL.ds;
const A2 = COL.co;
const R = COL.red;

/* ====================================================================== */
/* 25 IP 分片                                                              */
/* ====================================================================== */

const FR = {
  card: 380,
  reveal: 800,
  steps: [
    {at: 60, label: '每片数据 ≤ 1480'},
    {at: 120, label: '切分'},
    {at: 320, label: '各自加首部'},
    {at: 540, label: '填写字段'},
  ],
};

export const CNFrag: React.FC = () => (
  <Problem
    no={25}
    color={C}
    tag="计算机网络 · 网络层"
    title="IP 数据报分片"
    q={[
      ['一个 IP 数据报总长度 ', {t: '4000 B', c: B}, '（首部 20 B，无选项），要经过 ', {t: 'MTU = 1500 B', c: B}, ' 的链路。'],
      ['应划分为几个分片？各分片的', {t: '数据长度', c: A2}, '、', {t: 'MF 标志', c: A2}, '与', {t: '片偏移', c: A2}, '分别是多少？'],
    ]}
    brief="4000 B 数据报经过 MTU 1500：怎么分片？"
    answerText="3 片 · 偏移 0 / 185 / 370"
    insight="数据 1480 + 1480 + 1020；MF = 1, 1, 0；片偏移以 8 B 为单位"
    {...FR}
  >
    {(sf) => <FragStage sf={sf} />}
  </Problem>
);

const FragStage: React.FC<{sf: number}> = ({sf}) => {
  const X0 = 250;
  const k = 1400 / 3980;
  const hdrW = 70;
  const frags = [
    {a: 0, b: 1480, mf: 1, off: 0},
    {a: 1480, b: 2960, mf: 1, off: 185},
    {a: 2960, b: 3980, mf: 0, off: 370},
  ];
  const drop = (i: number) => eInOut(clamp01((sf - 320 - i * 40) / 60));
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <GlowDefs />
        <Txt x={960} y={214} size={26} color={COL.sub} opacity={prog(sf, 60, 20)}>
          MTU 1500 − 首部 20 = 1480，且 1480 ÷ 8 = 185 为整数 ⇒ 每片最多携带 1480 B 数据
        </Txt>
        {/* original */}
        <g opacity={1 - prog(sf, 320, 40) * 0.7}>
          <rect x={X0 - hdrW} y={260} width={hdrW - 4} height={80} rx={10} fill={rgba(A2, 0.6)} stroke={A2} />
          <Txt x={X0 - hdrW / 2} y={300} size={20} weight={800} family={FONT.mono}>
            20
          </Txt>
          <rect x={X0} y={260} width={1400} height={80} rx={10} fill={rgba(B, 0.3)} stroke={B} />
          <Txt x={X0 + 700} y={300} size={28} weight={800}>
            数据 3980 B
          </Txt>
        </g>
        {[1480, 2960].map((cut, i) => {
          const t = prog(sf, 130 + i * 60, 40, eInOut);
          const x = X0 + cut * k;
          return (
            <g key={i} opacity={t > 0 ? 1 : 0}>
              <line x1={x} y1={230} x2={x} y2={lerp(230, 370, t)} stroke="#fff" strokeWidth={4} filter="url(#g-m)" />
              <Txt x={x} y={390} size={20} family={FONT.mono} color={COL.sub} opacity={t}>
                {cut}
              </Txt>
            </g>
          );
        })}
        {frags.map((fr, i) => {
          const d = drop(i);
          if (d <= 0) return null;
          const y = lerp(260, 470 + i * 150, d);
          const xa = X0 + fr.a * k;
          const w = (fr.b - fr.a) * k;
          const fields = prog(sf, 540 + i * 50, 30);
          return (
            <g key={i}>
              <rect x={xa - hdrW} y={y} width={hdrW - 4} height={80} rx={10} fill={rgba(A2, 0.6)} stroke={A2} opacity={d} />
              <Txt x={xa - hdrW / 2} y={y + 40} size={20} weight={800} family={FONT.mono} opacity={d}>
                20
              </Txt>
              <rect x={xa} y={y} width={w - 6} height={80} rx={10} fill={rgba(C, 0.35)} stroke={C} strokeWidth={2.5} />
              <Txt x={xa + w / 2} y={y + 40} size={26} weight={800}>
                {`${fr.b - fr.a} B`}
              </Txt>
              <g opacity={fields}>
                <Txt x={xa + w / 2} y={y + 110} size={22} family={FONT.mono} color="#fff">
                  {`总长 ${fr.b - fr.a + 20} · MF=${fr.mf} · 偏移 ${fr.off}`}
                </Txt>
              </g>
            </g>
          );
        })}
        <Txt x={960} y={930} size={26} color={COL.sub} opacity={prog(sf, 700, 30)}>
          片偏移 = 该片数据在原数据中的字节位置 ÷ 8：0 ÷ 8 = 0，1480 ÷ 8 = 185，2960 ÷ 8 = 370
        </Txt>
      </svg>
    </AbsoluteFill>
  );
};

export const CNFragCues: Cue[] = probCues(FR, [[130, 'whoosh'], [190, 'whoosh'], ...[0, 1, 2].map((i): Cue => [380 + i * 40, 'blip', 72 + i * 4]), ...[0, 1, 2].map((i): Cue => [540 + i * 50, 'tick'])]);

/* ====================================================================== */
/* 四次挥手                                                                */
/* ====================================================================== */

export const CNFin: React.FC = () => {
  const f = useF();
  const XC = 560;
  const XS = 1360;
  const msgs = [
    {a: [XC, 300] as Pt, b: [XS, 400] as Pt, l: 'FIN = 1, seq = u', at: 40},
    {a: [XS, 430] as Pt, b: [XC, 530] as Pt, l: 'ACK = 1, ack = u + 1', at: 130},
    {a: [XS, 580] as Pt, b: [XC, 680] as Pt, l: 'FIN = 1, ACK = 1, seq = w, ack = u + 1', at: 340},
    {a: [XC, 700] as Pt, b: [XS, 800] as Pt, l: 'ACK = 1, ack = w + 1', at: 440},
  ];
  const cState = f < 40 ? 'ESTABLISHED' : f < 200 ? 'FIN-WAIT-1' : f < 410 ? 'FIN-WAIT-2' : f < 820 ? 'TIME-WAIT' : 'CLOSED';
  const sState = f < 110 ? 'ESTABLISHED' : f < 340 ? 'CLOSE-WAIT' : f < 510 ? 'LAST-ACK' : 'CLOSED';
  const tw = clamp01((f - 520) / 300);
  return (
    <AbsoluteFill>
      <Cam to={1.04}>
        <svg width={1920} height={1080}>
          <GlowDefs />
          {[
            {x: XC, t: '客户端'},
            {x: XS, t: '服务器'},
          ].map((h, i) => (
            <g key={i} opacity={prog(f, i * 6, 20)}>
              <rect x={h.x - 110} y={176} width={220} height={64} rx={14} fill="rgba(4,18,14,0.9)" stroke={C} strokeWidth={2.5} filter="url(#g-m)" />
              <Txt x={h.x} y={208} size={28} weight={800}>
                {h.t}
              </Txt>
              <line x1={h.x} y1={240} x2={h.x} y2={880} stroke={rgba(C, 0.5)} strokeWidth={3} strokeDasharray="4 10" />
            </g>
          ))}
          {msgs.map((m, i) => {
            const t = prog(f, m.at, 60, eInOut);
            if (t <= 0) return null;
            const ang = (Math.atan2(m.b[1] - m.a[1], m.b[0] - m.a[0]) * 180) / Math.PI;
            const up = ang > 90 || ang < -90 ? ang + 180 : ang;
            const mx = (m.a[0] + m.b[0]) / 2;
            const my = (m.a[1] + m.b[1]) / 2;
            return (
              <g key={i}>
                <Arrow pts={[m.a, m.b]} t={t} color={i % 2 ? A2 : C} w={4} head={16} />
                <g transform={`translate(${mx},${my}) rotate(${up}) translate(0,-20)`} opacity={prog(f, m.at + 10, 20)}>
                  <text textAnchor="middle" fontFamily={FONT.mono} fontWeight={700} fontSize={23} fill="#fff">
                    {m.l}
                  </text>
                </g>
                {t < 1 && <Comet pts={[m.a, m.b]} t={t} color="#fff" r={12} />}
              </g>
            );
          })}
          {/* half close data */}
          {f > 220 && f < 340 &&
            [0, 1, 2].map((k) => {
              const t = ((f - 220) / 40 + k / 3) % 1;
              return <rect key={k} x={lerp(XS, XC, t) - 14} y={lerp(470, 560, t) - 6} width={28} height={12} rx={6} fill="#fff" opacity={Math.sin(t * Math.PI)} />;
            })}
          <Txt x={960} y={505} size={22} color={COL.sub} opacity={prog(f, 220, 20) * (1 - prog(f, 330, 20))}>
            半关闭：服务器仍可继续发送数据
          </Txt>
          {/* states */}
          <Txt x={XC - 70} y={f < 200 ? 300 : f < 410 ? 540 : f < 820 ? 700 : 845} size={22} anchor="end" family={FONT.display} color={cState === 'TIME-WAIT' ? A2 : C}>
            {cState}
          </Txt>
          <Txt x={XS + 70} y={f < 340 ? 430 : f < 510 ? 580 : 800} size={22} anchor="start" family={FONT.display} color={C}>
            {sState}
          </Txt>
          {/* TIME-WAIT timer */}
          {f >= 500 && (
            <g>
              <rect x={XC - 16} y={700} width={32} height={140} rx={8} fill="rgba(255,255,255,0.06)" stroke={rgba(A2, 0.5)} />
              <rect x={XC - 16} y={700} width={32} height={140 * tw} rx={8} fill={rgba(A2, 0.7)} />
              <Txt x={XC + 40} y={785} size={26} weight={800} anchor="start" color={A2}>
                {tw < 1 ? `等待 2MSL（${Math.round(tw * 100)}%）` : '2MSL 到 → CLOSED'}
              </Txt>
            </g>
          )}
        </svg>
        <Glass x={1300} y={880} w={520} color={C} opacity={prog(f, 840, 30)} style={{fontFamily: FONT.sans, fontSize: 22, lineHeight: '36px', padding: '12px 22px'}}>
          等 <Hi c={A2}>2MSL</Hi>：保证最后的 ACK 能到达；让本连接的旧报文在网络中消失
        </Glass>
      </Cam>
      <Caption title="四次挥手" en="TCP TEARDOWN" desc="FIN → ACK → FIN → ACK · 主动关闭方要在 TIME-WAIT 停留 2MSL" chip="2MSL" color={C} />
    </AbsoluteFill>
  );
};

export const CNFinCues: Cue[] = [[100, 'blip', 76], [190, 'blip', 72], [400, 'blip', 79], [500, 'blip', 84], [820, 'chime']];

/* ====================================================================== */
/* 26 综合：输入网址之后                                                   */
/* ====================================================================== */

const WN: Record<string, {x: number; y: number; t: string; s: string; c: string}> = {
  H: {x: 220, y: 640, t: '主机 H', s: '浏览器', c: B},
  L: {x: 560, y: 420, t: '本地 DNS', s: 'Local', c: C},
  root: {x: 900, y: 240, t: '根域名服务器', s: '.', c: C},
  tld: {x: 1220, y: 240, t: '顶级域', s: '.cn', c: C},
  auth: {x: 1540, y: 240, t: '权限域名服务器', s: '408.edu.cn', c: C},
  R: {x: 620, y: 830, t: '网关路由器', s: '192.168.1.1', c: A2},
  S: {x: 1580, y: 760, t: 'Web 服务器', s: '202.112.x.x', c: A2},
};
type Hop = {a: string; b: string; t0: number; d: number; l: string; c: string; bend?: number};
const HOPS: Hop[] = [
  {a: 'H', b: 'L', t0: 190, d: 50, l: '① 递归查询 www.408.edu.cn', c: C},
  {a: 'L', b: 'root', t0: 250, d: 50, l: '② 迭代查询：根', c: C},
  {a: 'root', b: 'L', t0: 310, d: 44, l: '去问 .cn', c: COL.sub, bend: 0.2},
  {a: 'L', b: 'tld', t0: 370, d: 54, l: '③ 顶级域 .cn', c: C},
  {a: 'tld', b: 'L', t0: 434, d: 44, l: '去问 408.edu.cn', c: COL.sub, bend: 0.2},
  {a: 'L', b: 'auth', t0: 490, d: 60, l: '④ 权限服务器', c: C},
  {a: 'auth', b: 'L', t0: 560, d: 50, l: 'IP = 202.112.x.x', c: A2, bend: 0.2},
  {a: 'L', b: 'H', t0: 620, d: 50, l: '⑤ 返回 IP', c: A2},
  {a: 'H', b: 'S', t0: 720, d: 60, l: 'SYN', c: B, bend: -0.12},
  {a: 'S', b: 'H', t0: 790, d: 60, l: 'SYN + ACK', c: B, bend: -0.12},
  {a: 'H', b: 'S', t0: 860, d: 60, l: 'ACK', c: B, bend: -0.12},
  {a: 'H', b: 'S', t0: 950, d: 70, l: 'GET / HTTP/1.1', c: A2, bend: 0.12},
  {a: 'S', b: 'H', t0: 1030, d: 80, l: 'HTTP/1.1 200 OK + HTML', c: A2, bend: 0.12},
];
const STAGES = [
  {t: 20, l: 'ARP', d: '查网关 MAC（链路层辅助）', c: A2},
  {t: 190, l: 'DNS', d: '域名 → IP（应用层 · UDP）', c: C},
  {t: 720, l: 'TCP', d: '三次握手（传输层）', c: B},
  {t: 950, l: 'HTTP', d: '请求 / 响应（应用层）', c: A2},
];
const WEB = {
  card: 400,
  reveal: 1240,
  steps: STAGES.map((s) => ({at: s.t, label: s.l})),
};

export const CNWeb: React.FC = () => (
  <Problem
    no={26}
    color={C}
    tag="计算机网络 · 综合"
    title="输入网址之后发生了什么"
    q={[
      ['主机 H 刚接入局域网（ARP 缓存、DNS 缓存均为空），在浏览器中输入 ', {t: 'http://www.408.edu.cn', m: true, c: B}, ' 并回车。'],
      ['从回车到页面显示，H 依次使用的协议顺序是？'],
    ]}
    options={['ARP → DNS → TCP → HTTP', 'DNS → ARP → HTTP → TCP', 'TCP → DNS → ARP → HTTP', 'DNS → TCP → ARP → HTTP']}
    answer={0}
    brief="从输入 URL 到页面显示：ARP、DNS、TCP、HTTP 的先后顺序？"
    insight="先 ARP 找到网关才能把 DNS 查询发出去；拿到 IP 后三次握手，最后才是 HTTP"
    {...WEB}
  >
    {(sf) => <WebStage sf={sf} />}
  </Problem>
);

const WebStage: React.FC<{sf: number}> = ({sf}) => {
  const P = (k: string): Pt => [WN[k].x, WN[k].y];
  const pathOf = (h: Hop): Pt[] => {
    const a = P(h.a);
    const b = P(h.b);
    if (!h.bend) return [a, b];
    const mx = (a[0] + b[0]) / 2;
    const my = (a[1] + b[1]) / 2;
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const out: Pt[] = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const cx = mx - dy * h.bend;
      const cy = my + dx * h.bend;
      out.push([(1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * cx + t * t * b[0], (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * cy + t * t * b[1]]);
    }
    return out;
  };
  const act = HOPS.filter((h) => sf >= h.t0 && sf < h.t0 + h.d + 30).pop();
  const stg = STAGES.reduce((acc, s, i) => (sf >= s.t ? i : acc), -1);
  const arp = clamp01((sf - 20) / 120);
  const page = prog(sf, 1110, 40);
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <GlowDefs />
        {/* LAN */}
        <line x1={140} y1={740} x2={760} y2={740} stroke={rgba(A2, 0.4)} strokeWidth={4} opacity={prog(sf, 0, 20)} />
        <Txt x={160} y={770} size={18} anchor="start" color={COL.dim}>
          局域网
        </Txt>
        {arp > 0 && arp < 1 && [0, 1, 2].map((k) => {
          const t = clamp01(arp * 1.4 - k * 0.2);
          return <circle key={k} cx={WN.H.x} cy={WN.H.y} r={40 + t * 460} fill="none" stroke={A2} strokeWidth={3} opacity={(1 - t) * 0.7} />;
        })}
        {sf > 20 && sf < 190 && (
          <Txt x={WN.H.x + 20} y={WN.H.y - 110} size={24} weight={700} anchor="start" color={A2} opacity={prog(sf, 20, 16) * (1 - prog(sf, 170, 20))}>
            {sf < 110 ? 'ARP 广播：谁是 192.168.1.1？' : '网关：我是，MAC = 00:1A:…'}
          </Txt>
        )}
        {HOPS.map((h, i) => {
          const t = clamp01((sf - h.t0) / h.d);
          if (t <= 0) return null;
          const pts = pathOf(h);
          const fade = sf > 1130 ? 0.35 : 1;
          return (
            <g key={i} opacity={fade}>
              <Arrow pts={pts} t={eInOut(t)} color={h.c} w={i >= 8 ? 4 : 3} head={14} />
              {t < 1 && <Comet pts={pts} t={eInOut(t)} color="#fff" r={11} />}
            </g>
          );
        })}
        {Object.keys(WN).map((k, i) => {
          const n = WN[k];
          const hot = act && (act.a === k || act.b === k);
          return (
            <g key={k} transform={`translate(${n.x},${n.y}) scale(${eBack(clamp01((sf + 30 - i * 4) / 18))})`}>
              <rect x={-110} y={-44} width={220} height={88} rx={16} fill={hot ? rgba(n.c, 0.3) : 'rgba(4,18,14,0.9)'} stroke={hot ? '#fff' : n.c} strokeWidth={hot ? 3.5 : 2.5} filter="url(#g-m)" />
              <Txt x={0} y={-10} size={24} weight={800}>
                {n.t}
              </Txt>
              <Txt x={0} y={20} size={18} family={FONT.mono} color={COL.sub}>
                {n.s}
              </Txt>
            </g>
          );
        })}
        {act && (
          <Txt x={960} y={120 + 30} size={30} weight={800} color={act.c === COL.sub ? '#fff' : act.c}>
            {act.l}
          </Txt>
        )}
        {/* browser window */}
        {page > 0 && (
          <g transform={`translate(${WN.H.x + 40},${WN.H.y - 330}) scale(${eBack(page)})`} opacity={page}>
            <rect x={-150} y={-10} width={300} height={200} rx={14} fill="rgba(10,14,24,0.95)" stroke={B} strokeWidth={2.5} filter="url(#g-m)" />
            <rect x={-150} y={-10} width={300} height={34} rx={14} fill={rgba(B, 0.25)} />
            {[0, 1, 2].map((k) => (
              <circle key={k} cx={-128 + k * 18} cy={7} r={5} fill={['#f87171', '#fbbf24', '#34d399'][k]} />
            ))}
            <Txt x={0} y={100} size={64} weight={900} family={FONT.hero} color="#fff" glow>
              408
            </Txt>
          </g>
        )}
      </svg>
      <Glass x={1300} y={390} w={520} color={C} opacity={prog(sf, 10, 20)} style={{fontFamily: FONT.sans, fontSize: 24, lineHeight: '50px'}}>
        {STAGES.map((s, i) => (
          <div key={i} style={{display: 'flex', gap: 14, opacity: i <= stg ? 1 : 0.25, background: i === stg && sf < 1240 ? rgba(s.c, 0.18) : undefined, borderRadius: 8, padding: '0 10px'}}>
            <b style={{color: s.c, width: 70, fontFamily: FONT.tech}}>{s.l}</b>
            <span>{s.d}</span>
          </div>
        ))}
      </Glass>
    </AbsoluteFill>
  );
};

export const CNWebCues: Cue[] = probCues(WEB, [[20, 'whoosh'], ...HOPS.map((h, i): Cue => [h.t0 + h.d, 'blip', 67 + i * 2]), [1110, 'chime']]);

export const _u = [Cam, Caption, along, eOut];
