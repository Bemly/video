import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Cell, Comet, Glass, Hi, Txt} from '../../components/kit';
import {Cue, Problem, probCues} from '../../components/Problem';
import {useF} from '../../components/Shot';
import {along, Arrow, Caption, Cam, GlowDefs, Pt} from '../../components/ui';
import {clamp01, COL, eBack, eInOut, eOut, FONT, lerp, prog, rgba} from '../../theme';

const C = COL.co;
const B = COL.ds;
const R = COL.red;
const G = COL.green;

/* ====================================================================== */
/* 11 数组遍历的 Cache 命中率                                              */
/* ====================================================================== */

const MAT = {
  card: 380,
  reveal: 1080,
  steps: [
    {at: 0, label: '按行遍历'},
    {at: 520, label: '按列遍历'},
    {at: 1000, label: '命中率'},
  ],
};

export const COMatrix: React.FC = () => (
  <Problem
    no={11}
    color={C}
    tag="组成原理 · Cache"
    title="数组遍历的命中率"
    q={[
      ['int 型数组 ', {t: 'a[256][256]', m: true}, ' 按行优先存放（int 占 4 B），起始地址与 Cache 块对齐；'],
      ['数据 Cache 容量 ', {t: '4 KB', c: B}, '、块大小 ', {t: '64 B', c: B}, '、', {t: '直接映射', c: B}, '，初始为空。'],
      ['分别', {t: '按行', c: C}, '和', {t: '按列', c: C}, '遍历整个数组，两种方式的 Cache 命中率约为？'],
    ]}
    options={['93.75%，93.75%', '93.75%，0', '0，93.75%', '50%，50%']}
    answer={1}
    brief="a[256][256] 按行 / 按列遍历：命中率分别是？"
    insight="一块装 16 个 int：按行 1 失 15 中；按列相邻访问相距 1 KB，每次都换块，块在复用前就被替换"
    {...MAT}
  >
    {(sf) => <MatrixStage sf={sf} />}
  </Problem>
);

const MatrixStage: React.FC<{sf: number}> = ({sf}) => {
  const ROWS = 8;
  const COLS = 32;
  const cw = 28;
  const ch = 38;
  const X0 = 190;
  const Y0 = 250;
  const rate = 0.62;
  const rowMode = sf < 520;
  const t0 = rowMode ? 30 : 540;
  const k = Math.floor(Math.max(0, sf - t0) * rate);
  const total = ROWS * COLS;
  const acc = (n: number): [number, number] => (rowMode ? [Math.floor(n / COLS), n % COLS] : [n % ROWS, Math.floor(n / ROWS)]);
  const cellState = new Map<string, 'hit' | 'miss'>();
  let hits = 0;
  const loaded = new Set<string>();
  const cacheLines: string[] = new Array(8).fill('');
  let lastLine = -1;
  for (let n = 0; n < Math.min(k, total); n++) {
    const [i, j] = acc(n);
    const blk = `${i}-${Math.floor(j / 16)}`;
    let hit = false;
    if (rowMode) hit = loaded.has(blk);
    if (hit) hits++;
    else {
      loaded.add(blk);
      lastLine = (i * 2 + Math.floor(j / 16)) % 8;
      cacheLines[lastLine] = `a[${i}][${Math.floor(j / 16) * 16}..${Math.floor(j / 16) * 16 + 15}]`;
    }
    cellState.set(`${i}-${j}`, hit ? 'hit' : 'miss');
  }
  const cur = k < total ? acc(k) : null;
  const done = Math.min(k, total);
  const rateTxt = done ? ((hits / done) * 100).toFixed(1) : '0.0';
  const gauges = prog(sf, 1000, 40);
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <GlowDefs />
        <Txt x={X0} y={220} size={24} anchor="start" color={COL.sub}>
          {rowMode ? '按行：for i { for j { sum += a[i][j] } }' : '按列：for j { for i { sum += a[i][j] } }'}
        </Txt>
        {new Array(ROWS).fill(0).map((_, i) =>
          new Array(COLS).fill(0).map((__, j) => {
            const s = cellState.get(`${i}-${j}`);
            const isCur = cur && cur[0] === i && cur[1] === j;
            const fill = isCur ? '#ffffff' : s === 'hit' ? rgba(G, 0.55) : s === 'miss' ? rgba(R, 0.75) : 'rgba(255,255,255,0.05)';
            return <rect key={`${i}-${j}`} x={X0 + j * (cw + 2) + (j >= 16 ? 8 : 0)} y={Y0 + i * (ch + 4)} width={cw} height={ch} rx={4} fill={fill} stroke={rgba(C, 0.25)} strokeWidth={1} />;
          }),
        )}
        {/* block outlines */}
        {new Array(ROWS).fill(0).map((_, i) =>
          [0, 1].map((b) => (
            <rect key={`${i}b${b}`} x={X0 + b * 16 * (cw + 2) + (b ? 8 : 0) - 2} y={Y0 + i * (ch + 4) - 2} width={16 * (cw + 2) + 2} height={ch + 4} rx={6} fill="none" stroke={rgba(C, 0.5)} strokeWidth={1.5} />
          )),
        )}
        <Txt x={X0} y={Y0 + ROWS * (ch + 4) + 26} size={20} anchor="start" color={COL.dim} family={FONT.mono}>
          （示意：前 8 行 × 32 列；每个框 = 一个 64 B 主存块 = 16 个 int）
        </Txt>
        {/* counters */}
        <Txt x={X0} y={Y0 + ROWS * (ch + 4) + 90} size={34} anchor="start" family={FONT.tech} weight={700}>
          {`访问 ${done}　命中 ${hits}　命中率 `}
          <tspan fill={rowMode ? G : R}>{rateTxt}%</tspan>
        </Txt>
      </svg>
      <Glass x={1260} y={240} w={540} color={C} opacity={prog(sf, 20, 30)} style={{fontSize: 22, lineHeight: '42px'}}>
        <div style={{fontFamily: FONT.sans, color: COL.sub}}>Cache 行（示意）</div>
        {cacheLines.map((l, i) => (
          <div key={i} style={{display: 'flex', gap: 16, background: i === lastLine && sf % 10 < 6 && k < total ? rgba(R, 0.25) : undefined, borderRadius: 6}}>
            <span style={{color: COL.dim}}>{i}</span>
            <span>{l || '—'}</span>
          </div>
        ))}
      </Glass>
      {gauges > 0 && (
        <AbsoluteFill style={{background: `rgba(2,4,10,${0.6 * gauges})`}}>
          <svg width={1920} height={1080}>
            {[
              {x: 660, v: 0.9375, l: '按行', c: G, txt: '93.75%'},
              {x: 1260, v: 0, l: '按列', c: R, txt: '0%'},
            ].map((g, i) => {
              const r = 150;
              const L = 2 * Math.PI * r;
              const t = prog(sf, 1010 + i * 20, 50, eInOut);
              return (
                <g key={i} opacity={gauges}>
                  <circle cx={g.x} cy={520} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={26} />
                  <circle cx={g.x} cy={520} r={r} fill="none" stroke={g.c} strokeWidth={26} strokeDasharray={`${L * g.v * t} ${L}`} transform={`rotate(-90 ${g.x} 520)`} strokeLinecap="round" filter="url(#g-m)" />
                  <Txt x={g.x} y={505} size={60} weight={800} family={FONT.tech} color="#fff">
                    {g.txt}
                  </Txt>
                  <Txt x={g.x} y={565} size={30} weight={700} color={g.c}>
                    {g.l}
                  </Txt>
                </g>
              );
            })}
          </svg>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

export const COMatrixCues: Cue[] = probCues(MAT, [[30, 'riser2'], [540, 'riser2'], [1010, 'chime']]);

/* ====================================================================== */
/* 一次访存的旅程：TLB / 页表 / Cache / 主存                              */
/* ====================================================================== */

const VN: Record<string, {x: number; y: number; w: number; t: string; s: string}> = {
  cpu: {x: 170, y: 540, w: 180, t: 'CPU', s: 'MMU'},
  tlb: {x: 700, y: 300, w: 230, t: '快表 TLB', s: '页号 → 页框号'},
  pt: {x: 700, y: 790, w: 230, t: '页表', s: '在主存中'},
  cache: {x: 1310, y: 300, w: 230, t: 'Cache', s: '按物理地址'},
  mem: {x: 1310, y: 790, w: 230, t: '主存', s: 'DRAM'},
};
const VM_P1: {a: string; b: string; t0: number; d: number; res?: 'miss' | 'hit' | 'ok'; label: string}[] = [
  {a: 'cpu', b: 'tlb', t0: 60, d: 50, res: 'miss', label: '查 TLB：缺失'},
  {a: 'tlb', b: 'pt', t0: 130, d: 60, res: 'ok', label: '访存①：读页表项'},
  {a: 'pt', b: 'tlb', t0: 210, d: 50, label: '回填 TLB'},
  {a: 'tlb', b: 'cache', t0: 280, d: 60, res: 'miss', label: '得到物理地址，查 Cache：缺失'},
  {a: 'cache', b: 'mem', t0: 370, d: 60, res: 'ok', label: '访存②：读主存块'},
  {a: 'mem', b: 'cache', t0: 450, d: 50, label: '调入 Cache'},
  {a: 'cache', b: 'cpu', t0: 520, d: 70, label: '数据返回 CPU'},
];
const VM_P2: {a: string; b: string; t0: number; d: number; res?: 'hit'; label: string}[] = [
  {a: 'cpu', b: 'tlb', t0: 700, d: 26, res: 'hit', label: 'TLB 命中'},
  {a: 'tlb', b: 'cache', t0: 730, d: 30, res: 'hit', label: 'Cache 命中'},
  {a: 'cache', b: 'cpu', t0: 764, d: 34, label: '直接返回'},
];

export const COVm: React.FC = () => {
  const f = useF();
  const pos = (k: string): Pt => [VN[k].x, VN[k].y];
  const route = (a: string, b: string): Pt[] => {
    const A = pos(a);
    const Bp = pos(b);
    if (a === 'cache' && b === 'cpu') return [A, [A[0], 540], [Bp[0] + 100, 540]];
    if (a === 'tlb' && b === 'cache') return [[A[0] + 115, A[1]], [Bp[0] - 115, Bp[1]]];
    return [A, Bp];
  };
  const all = [...VM_P1, ...VM_P2];
  const active = all.filter((h) => f >= h.t0 && f < h.t0 + h.d + 40).pop();
  const status = (k: string) => {
    let s: string | undefined;
    for (const h of all) if (f >= h.t0 + h.d && h.b === k && h.res) s = h.res;
    const lastHop = all.filter((h) => f >= h.t0 + h.d && h.b === k).pop();
    if (lastHop && f > lastHop.t0 + lastHop.d + 60) return undefined;
    return s;
  };
  const sum = prog(f, 880, 40);
  return (
    <AbsoluteFill>
      <Cam to={1.03}>
        <svg width={1920} height={1080}>
          <GlowDefs />
          {/* static links */}
          {[
            ['cpu', 'tlb'],
            ['tlb', 'pt'],
            ['tlb', 'cache'],
            ['cache', 'mem'],
          ].map(([a, b], i) => (
            <path key={i} d={`M${route(a, b).map((p) => p.join(',')).join(' L')}`} fill="none" stroke={rgba(C, 0.2)} strokeWidth={3} strokeDasharray="6 8" opacity={prog(f, 10 + i * 5, 20)} />
          ))}
          <path d={`M${route('cache', 'cpu').map((p) => p.join(',')).join(' L')}`} fill="none" stroke={rgba(B, 0.2)} strokeWidth={3} strokeDasharray="6 8" opacity={prog(f, 30, 20)} />
          {all.map((h, i) => {
            const t = clamp01((f - h.t0) / h.d);
            if (t <= 0) return null;
            const pts = route(h.a, h.b);
            const fade = 1 - clamp01((f - h.t0 - h.d - 30) / 40);
            const col = i >= VM_P1.length ? G : h.label.includes('返回') ? B : C;
            return (
              <g key={i} opacity={fade}>
                <Arrow pts={pts} t={eInOut(t)} color={col} w={5} />
                {t < 1 && <Comet pts={pts} t={eInOut(t)} color="#fff" r={12} />}
              </g>
            );
          })}
          {Object.keys(VN).map((k, i) => {
            const n = VN[k];
            const st = status(k);
            const col = st === 'miss' ? R : st === 'hit' ? G : C;
            return (
              <g key={k} transform={`translate(${n.x},${n.y}) scale(${eBack(clamp01((f - i * 5) / 20))})`}>
                <rect x={-n.w / 2} y={-55} width={n.w} height={110} rx={18} fill={st ? rgba(col, 0.25) : 'rgba(20,16,8,0.9)'} stroke={col} strokeWidth={st ? 4 : 2.5} filter="url(#g-m)" />
                <Txt x={0} y={-12} size={32} weight={800}>
                  {n.t}
                </Txt>
                <Txt x={0} y={26} size={20} color={COL.sub}>
                  {n.s}
                </Txt>
                {st && (
                  <Txt x={0} y={-80} size={26} weight={800} color={col}>
                    {st === 'miss' ? '缺失' : st === 'hit' ? '命中' : ''}
                  </Txt>
                )}
              </g>
            );
          })}
          {/* address boxes */}
          <g opacity={prog(f, 40, 20)}>
            <Txt x={170} y={420} size={20} color={COL.sub}>
              虚拟地址
            </Txt>
            <Txt x={170} y={450} size={26} family={FONT.mono} weight={700} color={C}>
              0x0040 32A8
            </Txt>
          </g>
          <g opacity={prog(f, 280, 20)}>
            <Txt x={1005} y={250} size={20} color={COL.sub}>
              物理地址
            </Txt>
            <Txt x={1005} y={220} size={24} family={FONT.mono} weight={700} color={B}>
              0x001F 22A8
            </Txt>
          </g>
          {active && (
            <Txt x={960} y={120 + 20} size={30} weight={700} color="#fff" opacity={1}>
              {active.label}
            </Txt>
          )}
          <Txt x={960} y={660} size={24} color={COL.sub} opacity={prog(f, 660, 20) * (1 - prog(f, 860, 20))}>
            第二次访问同一页、同一块：全程命中，一次主存都不用访问
          </Txt>
        </svg>
        <Glass x={560} y={590} w={800} color={C} opacity={sum} style={{fontSize: 26, lineHeight: '46px', fontFamily: FONT.sans}}>
          <div>
            <Hi c={R}>最坏</Hi>：TLB 缺失 + Cache 缺失 ⇒ 至少访问主存 <Hi c={R}>2</Hi> 次（缺页还要访问磁盘）
          </div>
          <div>
            <Hi c={G}>最好</Hi>：TLB 命中 + Cache 命中 ⇒ 访问主存 <Hi c={G}>0</Hi> 次
          </div>
        </Glass>
      </Cam>
      <Caption title="虚拟存储" en="VIRTUAL MEMORY" desc="虚拟地址 → TLB / 页表 → 物理地址 → Cache / 主存" chip="TLB · 页表 · Cache" color={C} />
    </AbsoluteFill>
  );
};

export const COVmCues: Cue[] = [
  ...VM_P1.map((h): Cue => [h.t0 + h.d, h.res === 'miss' ? 'error' : 'blip', 72]),
  ...VM_P2.map((h): Cue => [h.t0 + h.d, 'blip', 84]),
  [880, 'chime'],
];

/* ====================================================================== */
/* 寻址方式                                                                */
/* ====================================================================== */

type AMode = {t: string; f: string; ins: string; regs?: string; mem: [string, string][]; path: {from: 'ins' | 'reg' | number; to: number | 'ins'}[]; res: string};
const MODES: AMode[] = [
  {t: '立即寻址', f: '操作数 = A', ins: '#5', mem: [['20', '35'], ['35', '7'], ['40', '9']], path: [{from: 'ins', to: 'ins'}], res: '操作数 5'},
  {t: '直接寻址', f: 'EA = A', ins: '20', mem: [['20', '35'], ['35', '7'], ['40', '9']], path: [{from: 'ins', to: 0}], res: '操作数 35'},
  {t: '间接寻址', f: 'EA = (A)', ins: '20', mem: [['20', '35'], ['35', '7'], ['40', '9']], path: [{from: 'ins', to: 0}, {from: 0, to: 1}], res: '操作数 7'},
  {t: '寄存器间接', f: 'EA = (R)', ins: 'R1', regs: 'R1 = 40', mem: [['20', '35'], ['35', '7'], ['40', '9']], path: [{from: 'reg', to: 2}], res: '操作数 9'},
  {t: '相对寻址', f: 'EA = (PC) + A', ins: '+6', regs: 'PC = 100', mem: [['100', '…'], ['103', '…'], ['106', 'target']], path: [{from: 'reg', to: 2}], res: '跳转到 106'},
  {t: '变址寻址', f: 'EA = (IX) + A', ins: '20', regs: 'IX = 3', mem: [['20', 'a[0]'], ['23', 'a[3]=11'], ['26', 'a[6]']], path: [{from: 'reg', to: 1}], res: '操作数 11'},
];

export const COAddr: React.FC = () => {
  const f = useF();
  return (
    <AbsoluteFill>
      <Cam to={1.02}>
        <svg width={1920} height={1080}>
          <GlowDefs />
          {MODES.map((m, i) => {
            const col = i % 3;
            const row = Math.floor(i / 3);
            const ox = 110 + col * 580;
            const oy = 170 + row * 350;
            const T = 30 + i * 110;
            const a = prog(f, i * 8, 24);
            const insP: Pt = [ox + 150, oy + 110];
            const regP: Pt = [ox + 110, oy + 210];
            const memP = (k: number): Pt => [ox + 400, oy + 90 + k * 70];
            return (
              <g key={i} opacity={a}>
                <rect x={ox} y={oy} width={540} height={320} rx={18} fill="rgba(20,16,8,0.55)" stroke={f >= T ? C : rgba(C, 0.3)} strokeWidth={f >= T ? 2.5 : 1.5} />
                <Txt x={ox + 24} y={oy + 34} size={28} weight={800} anchor="start">
                  {m.t}
                </Txt>
                <Txt x={ox + 516} y={oy + 34} size={22} anchor="end" family={FONT.mono} color={C}>
                  {m.f}
                </Txt>
                {/* instruction */}
                <rect x={ox + 30} y={oy + 80} width={100} height={60} rx={8} fill="rgba(255,255,255,0.05)" stroke={rgba('#fff', 0.3)} />
                <Txt x={ox + 80} y={oy + 110} size={22} family={FONT.mono} color={COL.sub}>
                  OP
                </Txt>
                <Cell x={ox + 130} y={oy + 80} w={90} h={60} text={m.ins} color={C} fill={i === 0 && f >= T + 20 ? 0.7 : 0.2} size={26} family={FONT.mono} glow={i === 0 && f >= T + 20} />
                {m.regs && (
                  <g>
                    <rect x={ox + 30} y={oy + 185} width={190} height={50} rx={8} fill={rgba(B, 0.15)} stroke={B} />
                    <Txt x={ox + 125} y={oy + 210} size={22} family={FONT.mono} color="#fff">
                      {m.regs}
                    </Txt>
                  </g>
                )}
                {/* memory */}
                {m.mem.map(([ad, v], k) => {
                  const target = m.path.some((p) => p.to === k) && f >= T + 50 + m.path.findIndex((p) => p.to === k) * 30;
                  return (
                    <g key={k}>
                      <Txt x={ox + 330} y={oy + 90 + k * 70} size={20} anchor="end" family={FONT.mono} color={COL.dim}>
                        {ad}
                      </Txt>
                      <Cell x={ox + 340} y={oy + 62 + k * 70} w={170} h={56} text={v} color={target ? C : rgba('#fff', 0.5) as string} fill={target ? 0.45 : 0} size={22} family={FONT.mono} glow={target} />
                    </g>
                  );
                })}
                {m.path.map((p, k) => {
                  if (p.to === 'ins') return null;
                  const from: Pt = p.from === 'ins' ? [insP[0] + 70, insP[1]] : p.from === 'reg' ? [regP[0] + 110, regP[1]] : [memP(p.from as number)[0] + 110, memP(p.from as number)[1]];
                  const to: Pt = [memP(p.to as number)[0] - 60, memP(p.to as number)[1]];
                  const pts: Pt[] = typeof p.from === 'number' ? [from, [from[0] + 30, from[1]], [from[0] + 30, to[1]], [to[0] + 170 + 4, to[1]]] : [from, [(from[0] + to[0]) / 2, from[1]], [(from[0] + to[0]) / 2, to[1]], to];
                  return <Arrow key={k} pts={pts} t={prog(f, T + 20 + k * 30, 30, eInOut)} color={C} w={3.5} />;
                })}
                <Txt x={ox + 125} y={oy + 280} size={26} weight={800} color={C} opacity={prog(f, T + 80, 20)}>
                  {m.res}
                </Txt>
              </g>
            );
          })}
        </svg>
      </Cam>
      <Caption title="寻址方式" en="ADDRESSING MODES" desc="有效地址 EA 的形成方式，决定了操作数从哪里来" chip="EA" color={C} />
    </AbsoluteFill>
  );
};

export const COAddrCues: Cue[] = MODES.flatMap((_, i): Cue[] => [
  [30 + i * 110 + 20, 'tick'],
  [30 + i * 110 + 80, 'blip', 72 + i * 2],
]);

/* ====================================================================== */
/* 12 单总线数据通路                                                       */
/* ====================================================================== */

const BUSX = 900;
const DPN: Record<string, {x: number; y: number; w: number; side: 'L' | 'R'}> = {
  PC: {x: 660, y: 230, w: 190, side: 'L'},
  MAR: {x: 660, y: 350, w: 190, side: 'L'},
  MDR: {x: 660, y: 470, w: 190, side: 'L'},
  IR: {x: 660, y: 590, w: 190, side: 'L'},
  R0: {x: 1140, y: 230, w: 190, side: 'R'},
  R1: {x: 1140, y: 330, w: 190, side: 'R'},
  Y: {x: 1140, y: 450, w: 190, side: 'R'},
  Z: {x: 1140, y: 760, w: 190, side: 'R'},
};
const DSTEPS: {t: number; d: number; src: string; dst: string; txt: string; sig: string; fetch?: boolean; mem?: 'read'}[] = [
  {t: 20, d: 40, src: 'PC', dst: 'MAR', txt: '(PC) → MAR', sig: 'PCout, MARin', fetch: true},
  {t: 64, d: 40, src: 'MAR', dst: 'MDR', txt: 'M(MAR) → MDR，(PC)+1 → PC', sig: 'MemR', fetch: true, mem: 'read'},
  {t: 108, d: 40, src: 'MDR', dst: 'IR', txt: '(MDR) → IR', sig: 'MDRout, IRin', fetch: true},
  {t: 190, d: 100, src: 'R1', dst: 'MAR', txt: '(R1) → MAR', sig: 'R1out, MARin'},
  {t: 300, d: 100, src: 'MAR', dst: 'MDR', txt: 'M(MAR) → MDR', sig: 'MemR, MDRin', mem: 'read'},
  {t: 410, d: 100, src: 'MDR', dst: 'Y', txt: '(MDR) → Y', sig: 'MDRout, Yin'},
  {t: 520, d: 110, src: 'R0', dst: 'Z', txt: '(R0) + (Y) → Z', sig: 'R0out, ADD, Zin'},
  {t: 640, d: 100, src: 'Z', dst: 'R0', txt: '(Z) → R0', sig: 'Zout, R0in'},
];
const DP = {
  card: 330,
  reveal: 770,
  steps: [
    {at: 0, label: '取指'},
    {at: 190, label: '取操作数'},
    {at: 520, label: '运算'},
    {at: 640, label: '写回'},
  ],
};

export const CODatapath: React.FC = () => (
  <Problem
    no={12}
    color={C}
    tag="组成原理 · CPU"
    title="单总线数据通路"
    q={[
      ['某 CPU 采用', {t: '单总线结构', c: B}, '，包含 PC、IR、MAR、MDR、通用寄存器 R0~R3，'],
      ['以及 ALU 的暂存寄存器 Y 和结果寄存器 Z。写出指令 ', {t: 'ADD R0, (R1)', m: true}],
      ['（功能：', {t: '(R0) + ((R1)) → R0', m: true, c: C}, '）', {t: '执行阶段', c: C}, '的微操作序列。'],
    ]}
    brief="单总线 CPU 执行 ADD R0,(R1) 的微操作序列"
    answerText="5 条微操作"
    insight="(R1)→MAR ▸ M(MAR)→MDR ▸ (MDR)→Y ▸ (R0)+(Y)→Z ▸ (Z)→R0"
    {...DP}
  >
    {(sf) => <DatapathStage sf={sf} />}
  </Problem>
);

const DatapathStage: React.FC<{sf: number}> = ({sf}) => {
  const cur = DSTEPS.filter((s) => sf >= s.t).pop();
  const curT = cur ? clamp01((sf - cur.t) / cur.d) : 0;
  const edge = (k: string) => (DPN[k].side === 'L' ? DPN[k].x + DPN[k].w / 2 : DPN[k].x - DPN[k].w / 2);
  const pathOf = (s: (typeof DSTEPS)[0]): Pt[] => {
    if (s.mem) return [[DPN.MAR.x - 95, DPN.MAR.y], [360, DPN.MAR.y], [360, DPN.MDR.y], [DPN.MDR.x - 95, DPN.MDR.y]];
    if (s.src === 'R0' && s.dst === 'Z')
      return [[edge('R0'), DPN.R0.y], [BUSX, DPN.R0.y], [BUSX, 640], [1060, 640]];
    return [[edge(s.src), DPN[s.src].y], [BUSX, DPN[s.src].y], [BUSX, DPN[s.dst].y], [edge(s.dst), DPN[s.dst].y]];
  };
  const hot = (k: string) => cur && sf < cur.t + cur.d + 10 && (cur.src === k || cur.dst === k || (cur.mem && (k === 'MAR' || k === 'MDR')) || (cur.src === 'R0' && k === 'Y'));
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <GlowDefs />
        {/* bus */}
        <rect x={BUSX - 10} y={190} width={20} height={640} rx={10} fill={rgba(C, 0.22)} stroke={C} strokeWidth={2} />
        <Txt x={BUSX} y={860} size={22} color={C}>
          内部总线
        </Txt>
        {/* memory */}
        <rect x={180} y={300} width={170} height={230} rx={16} fill="rgba(20,16,8,0.9)" stroke={cur?.mem && sf < cur.t + cur.d + 10 ? '#fff' : C} strokeWidth={2.5} filter="url(#g-s)" />
        <Txt x={265} y={400} size={32} weight={800}>
          主存
        </Txt>
        <Txt x={265} y={440} size={24} family={FONT.mono} color={COL.sub}>
          M
        </Txt>
        <line x1={350} y1={DPN.MAR.y} x2={DPN.MAR.x - 95} y2={DPN.MAR.y} stroke={rgba(C, 0.4)} strokeWidth={3} />
        <line x1={350} y1={DPN.MDR.y} x2={DPN.MDR.x - 95} y2={DPN.MDR.y} stroke={rgba(C, 0.4)} strokeWidth={3} />
        {/* stubs to bus */}
        {Object.keys(DPN).map((k) => (
          <line key={k} x1={edge(k)} y1={DPN[k].y} x2={BUSX} y2={DPN[k].y} stroke={rgba(C, 0.35)} strokeWidth={3} />
        ))}
        {/* ALU */}
        <line x1={BUSX} y1={640} x2={1060} y2={640} stroke={rgba(C, 0.35)} strokeWidth={3} />
        <line x1={DPN.Y.x} y1={DPN.Y.y + 32} x2={DPN.Y.x} y2={600} stroke={rgba(C, 0.35)} strokeWidth={3} />
        <path d={`M1040,600 L1240,600 L1200,690 L1080,690 Z`} fill={cur && cur.src === 'R0' && sf < cur.t + cur.d + 10 ? rgba(C, 0.4) : 'rgba(20,16,8,0.9)'} stroke={C} strokeWidth={2.5} filter="url(#g-s)" />
        <Txt x={1140} y={645} size={30} weight={800}>
          ALU
        </Txt>
        <line x1={1140} y1={690} x2={1140} y2={DPN.Z.y - 32} stroke={rgba(C, 0.35)} strokeWidth={3} />
        {Object.keys(DPN).map((k, i) => {
          const n = DPN[k];
          const h = hot(k);
          return (
            <g key={k} transform={`translate(${n.x},${n.y}) scale(${eBack(clamp01((sf + 40 - i * 4) / 18))})`}>
              <rect x={-n.w / 2} y={-32} width={n.w} height={64} rx={12} fill={h ? rgba(C, 0.35) : 'rgba(20,16,8,0.9)'} stroke={h ? '#fff' : C} strokeWidth={h ? 3.5 : 2.5} filter="url(#g-s)" />
              <Txt x={0} y={1} size={30} weight={800} family={FONT.tech}>
                {k}
              </Txt>
            </g>
          );
        })}
        {cur && curT < 1 && (
          <>
            <Arrow pts={pathOf(cur)} t={eInOut(curT)} color={cur.fetch ? B : C} w={6} />
            <Comet pts={pathOf(cur)} t={eInOut(curT)} color="#fff" r={13} />
          </>
        )}
        {cur && (
          <g opacity={prog(sf, cur.t, 12)}>
            <Txt x={660} y={740} size={34} weight={800} color={cur.fetch ? B : C}>
              {cur.txt}
            </Txt>
            <Txt x={660} y={790} size={24} family={FONT.mono} color={COL.sub}>
              {`控制信号：${cur.sig}`}
            </Txt>
          </g>
        )}
      </svg>
      <Glass x={1360} y={200} w={450} color={C} opacity={prog(sf, 10, 20)} style={{fontSize: 23, lineHeight: '44px', padding: '14px 22px'}}>
        {DSTEPS.map((s, i) => {
          const on = sf >= s.t;
          const now = cur === s;
          return (
            <div key={i} style={{opacity: on ? 1 : 0.2, color: now ? '#fff' : s.fetch ? B : C, background: now ? rgba(s.fetch ? B : C, 0.2) : undefined, borderRadius: 6, padding: '0 8px'}}>
              {s.fetch ? '取指 ' : `T${i - 2} `}
              {s.txt}
            </div>
          );
        })}
      </Glass>
    </AbsoluteFill>
  );
};

export const CODatapathCues: Cue[] = probCues(DP, DSTEPS.map((s, i): Cue => [s.t, s.fetch ? 'tick' : 'blip', 70 + i * 2]));

/* ====================================================================== */
/* 13 流水线数据冒险与转发                                                 */
/* ====================================================================== */

type PC_ = {s: string; c: number};
const HZ_NO: PC_[][] = [
  [{s: 'IF', c: 1}, {s: 'ID', c: 2}, {s: 'EX', c: 3}, {s: 'MEM', c: 4}, {s: 'WB', c: 5}],
  [{s: 'IF', c: 2}, {s: '•', c: 3}, {s: '•', c: 4}, {s: 'ID', c: 5}, {s: 'EX', c: 6}, {s: 'MEM', c: 7}, {s: 'WB', c: 8}],
  [{s: '•', c: 3}, {s: '•', c: 4}, {s: 'IF', c: 5}, {s: 'ID', c: 6}, {s: 'EX', c: 7}, {s: 'MEM', c: 8}, {s: 'WB', c: 9}],
  [{s: 'IF', c: 6}, {s: 'ID', c: 7}, {s: 'EX', c: 8}, {s: 'MEM', c: 9}, {s: 'WB', c: 10}],
];
const HZ_FW: PC_[][] = [0, 1, 2, 3].map((i) => ['IF', 'ID', 'EX', 'MEM', 'WB'].map((s, k) => ({s, c: i + 1 + k})));
const SCOL: Record<string, string> = {IF: '#fbbf24', ID: '#fb923c', EX: '#f87171', MEM: '#c084fc', WB: '#38bdf8', '•': '#475569'};
const INS = ['ADD R1, R2, R3', 'SUB R4, R1, R5', 'AND R6, R1, R7', 'OR  R8, R2, R9'];
const HZ = {
  card: 400,
  reveal: 930,
  steps: [
    {at: 0, label: '找相关'},
    {at: 40, label: '无转发：插气泡'},
    {at: 420, label: '转发（旁路）'},
  ],
};

export const COHazard: React.FC = () => (
  <Problem
    no={13}
    color={C}
    tag="组成原理 · 流水线"
    title="数据冒险与转发"
    q={[
      ['五段流水线（IF ID EX MEM WB）执行下列指令，寄存器堆', {t: '前半周期写、后半周期读', c: B}, '：'],
      [{t: 'I1: ADD R1,R2,R3   I2: SUB R4,R1,R5   I3: AND R6,R1,R7   I4: OR R8,R2,R9', m: true, c: '#dde6f6'}],
      ['① ', {t: '不采用转发', c: C}, '时，共需多少个时钟周期？　② ', {t: '采用转发', c: C}, '后呢？'],
    ]}
    options={['8 周期，8 周期', '10 周期，8 周期', '10 周期，9 周期', '9 周期，8 周期']}
    answer={1}
    brief="I2、I3 依赖 I1 的 R1：无转发 / 有转发各需几个周期？"
    insight="I2 的 ID 必须等到 I1 的 WB（第 5 周期）⇒ 插 2 个气泡；转发把 EX 结果直接送给下一条的 EX"
    {...HZ}
  >
    {(sf) => <HazardStage sf={sf} />}
  </Problem>
);

const HazardStage: React.FC<{sf: number}> = ({sf}) => {
  const X0 = 480;
  const CW = 118;
  const grid = (rows: PC_[][], y0: number, t0: number, title: string, fw: boolean) => (
    <g>
      <Txt x={X0 - 40} y={y0 - 40} size={28} weight={800} anchor="start">
        {title}
      </Txt>
      {new Array(10).fill(0).map((_, c) => (
        <Txt key={c} x={X0 + c * CW + CW / 2} y={y0 - 10} size={18} family={FONT.mono} color={COL.dim}>
          {c + 1}
        </Txt>
      ))}
      {rows.map((r, i) => (
        <g key={i}>
          <Txt x={X0 - 20} y={y0 + 30 + i * 62} size={20} anchor="end" family={FONT.mono} color={i ? B : C}>
            {INS[i]}
          </Txt>
          {r.map((cell, k) => {
            const t = clamp01((sf - (t0 + (cell.c - 1) * 30)) / 12);
            if (t <= 0) return null;
            const bubble = cell.s === '•';
            return (
              <g key={k} transform={`translate(${X0 + (cell.c - 1) * CW + 4},${y0 + 6 + i * 62})`} opacity={t}>
                <rect width={(CW - 8) * eOut(t)} height={50} rx={9} fill={rgba(SCOL[cell.s], bubble ? 0.3 : 0.6)} stroke={SCOL[cell.s]} strokeDasharray={bubble ? '5 5' : undefined} />
                <text x={(CW - 8) / 2} y={27} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT.tech} fontWeight={700} fontSize={bubble ? 20 : 24} fill="#fff">
                  {bubble ? '气泡' : cell.s}
                </text>
              </g>
            );
          })}
        </g>
      ))}
      {!fw && (
        <g opacity={prog(sf, t0 + 150, 20)}>
          <Arrow pts={[[X0 + 4 * CW + CW / 2, y0 + 10], [X0 + 4 * CW + CW / 2, y0 + 62 + 6]]} t={prog(sf, t0 + 150, 20)} color={R} w={3.5} />
          <Txt x={X0 + 4 * CW + CW + 16} y={y0 + 40} size={20} anchor="start" color={R}>
            WB 写 R1 → 同周期 ID 读 R1
          </Txt>
        </g>
      )}
      {fw && (
        <g>
          {[
            {from: [X0 + 2 * CW + CW - 10, y0 + 30] as Pt, to: [X0 + 3 * CW + 12, y0 + 62 + 30] as Pt, at: t0 + 150},
            {from: [X0 + 3 * CW + CW - 10, y0 + 30] as Pt, to: [X0 + 4 * CW + 12, y0 + 124 + 30] as Pt, at: t0 + 180},
          ].map((a, k) => (
            <Arrow key={k} pts={[a.from, [a.from[0] + 20, (a.from[1] + a.to[1]) / 2], a.to]} t={prog(sf, a.at, 24, eInOut)} color={G} w={4} />
          ))}
          <Txt x={X0 + 5 * CW + 20} y={y0 + 100} size={20} anchor="start" color={G} opacity={prog(sf, t0 + 170, 20)}>
            EX/MEM → EX 旁路：不用等写回
          </Txt>
        </g>
      )}
      <Txt x={X0 + 10 * CW + 20} y={y0 + 130} size={34} weight={800} family={FONT.tech} anchor="start" color={fw ? G : R} opacity={prog(sf, t0 + 330, 20)}>
        {fw ? '8 周期' : '10 周期'}
      </Txt>
    </g>
  );
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <GlowDefs />
        {grid(HZ_NO, 250, 40, '不转发：插入 2 个气泡', false)}
        <g opacity={prog(sf, 420, 30)}>{grid(HZ_FW, 620, 430, '转发（旁路）：无需阻塞', true)}</g>
      </svg>
    </AbsoluteFill>
  );
};

export const COHazardCues: Cue[] = probCues(HZ, [...new Array(10).fill(0).map((_, c): Cue => [40 + c * 30, 'tick']), [190, 'error'], ...new Array(8).fill(0).map((_, c): Cue => [430 + c * 30, 'tick']), [580, 'blip', 84]]);

/* ====================================================================== */
/* 14 中断 vs DMA 的 CPU 占用率                                            */
/* ====================================================================== */

const IO = {
  card: 380,
  reveal: 1090,
  steps: [
    {at: 0, label: '中断方式'},
    {at: 520, label: 'DMA 方式'},
    {at: 980, label: '对比'},
  ],
};

export const COIo: React.FC = () => (
  <Problem
    no={14}
    color={C}
    tag="组成原理 · I/O"
    title="中断与 DMA 的 CPU 开销"
    q={[
      ['CPU 主频 ', {t: '500 MHz', c: B}, '，某外设数据传输率 ', {t: '2 MB/s', c: B}, '（1 M = 10⁶），按 32 位为单位传送。'],
      ['① 采用', {t: '中断方式', c: C}, '，每次中断服务需 500 个时钟周期，CPU 用于该设备的时间占比？'],
      ['② 采用 ', {t: 'DMA 方式', c: C}, '，每次传送 4 KB（1 K = 10³），DMA 预处理 + 后处理共 1000 个时钟周期，占比？'],
    ]}
    brief="500MHz CPU、2MB/s 外设：中断 vs DMA 的 CPU 时间占比"
    answerText="中断 50% · DMA 0.1%"
    insight="中断每个字都要 CPU 出手；DMA 只在一整块开始和结束时打扰 CPU"
    {...IO}
  >
    {(sf) => <IoStage sf={sf} />}
  </Problem>
);

const IoStage: React.FC<{sf: number}> = ({sf}) => {
  const BAR = 1300;
  const bar = (y: number, frac: number, stripes: number, t: number, col: string, lbl: string) => (
    <g>
      <Txt x={300} y={y + 30} size={24} anchor="end" color={COL.sub}>
        {lbl}
      </Txt>
      <rect x={320} y={y} width={BAR} height={60} rx={10} fill="rgba(255,255,255,0.05)" stroke={rgba('#fff', 0.2)} />
      {new Array(stripes).fill(0).map((_, k) => {
        const w = stripes <= 2 ? 1.5 : (BAR / stripes) * frac;
        const x = 320 + (k * BAR) / stripes;
        return k / stripes < t ? <rect key={k} x={x} y={y + 4} width={Math.max(1.5, w)} height={52} rx={2} fill={col} opacity={0.85} /> : null;
      })}
    </g>
  );
  const p1 = prog(sf, 20, 30);
  const p2 = prog(sf, 520, 30);
  const cmpA = prog(sf, 980, 40);
  const words = (sf % 30) / 30;
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <GlowDefs />
        {/* interrupt diagram */}
        <g opacity={p1}>
          {[
            {x: 420, t: '外设'},
            {x: 820, t: 'CPU'},
            {x: 1220, t: '主存'},
          ].map((b, i) => (
            <g key={i}>
              <rect x={b.x - 90} y={200} width={180} height={80} rx={14} fill="rgba(20,16,8,0.9)" stroke={i === 1 ? R : C} strokeWidth={2.5} />
              <Txt x={b.x} y={240} size={28} weight={800}>
                {b.t}
              </Txt>
            </g>
          ))}
          <Arrow pts={[[512, 240], [728, 240]]} t={1} color={rgba(C, 0.6)} w={3} />
          <Arrow pts={[[912, 240], [1128, 240]]} t={1} color={rgba(C, 0.6)} w={3} />
          {sf < 520 && [0, 1, 2].map((k) => {
            const t = (words + k / 3) % 1;
            const x = lerp(520, 1120, t);
            return <rect key={k} x={x - 12} y={230} width={24} height={20} rx={4} fill={C} filter="url(#g-s)" />;
          })}
          <Txt x={1380} y={240} size={22} anchor="start" color={R}>
            每 4 B 都要 CPU 响应一次中断
          </Txt>
          {[
            '2 MB/s ÷ 4 B = 5 × 10⁵ 次中断 / 秒',
            '5 × 10⁵ × 500 = 2.5 × 10⁸ 个周期 / 秒',
            '2.5 × 10⁸ ÷ (5 × 10⁸) = 50%',
          ].map((l, i) => (
            <Txt key={i} x={320} y={340 + i * 46} size={30} anchor="start" family={FONT.tech} weight={700} color={i === 2 ? R : '#fff'} opacity={prog(sf, 80 + i * 70, 24)}>
              {l}
            </Txt>
          ))}
          {bar(500, 0.5, 60, prog(sf, 300, 160), R, '中断')}
        </g>
        {/* DMA */}
        <g opacity={p2}>
          {[
            '2 MB/s ÷ 4 KB = 500 次 DMA / 秒',
            '500 × 1000 = 5 × 10⁵ 个周期 / 秒',
            '5 × 10⁵ ÷ (5 × 10⁸) = 0.1%',
          ].map((l, i) => (
            <Txt key={i} x={320} y={640 + i * 46} size={30} anchor="start" family={FONT.tech} weight={700} color={i === 2 ? G : '#fff'} opacity={prog(sf, 560 + i * 70, 24)}>
              {l}
            </Txt>
          ))}
          {bar(800, 0.5, 2, prog(sf, 800, 160), G, 'DMA')}
          <Txt x={1380} y={680} size={22} anchor="start" color={G}>
            整块数据由 DMA 控制器直接送主存
          </Txt>
        </g>
        {cmpA > 0 && (
          <g opacity={cmpA}>
            <rect x={1650} y={480} width={200} height={420} rx={16} fill="rgba(8,12,24,0.9)" stroke={rgba(C, 0.5)} />
            <rect x={1690} y={880 - 360 * 0.5 * cmpA} width={50} height={360 * 0.5 * cmpA} rx={6} fill={R} />
            <rect x={1760} y={880 - Math.max(2, 360 * 0.001) * cmpA} width={50} height={Math.max(2, 360 * 0.001)} rx={2} fill={G} />
            <Txt x={1715} y={880 - 360 * 0.5 * cmpA - 20} size={22} weight={800} color={R}>
              50%
            </Txt>
            <Txt x={1785} y={850} size={20} weight={800} color={G}>
              0.1%
            </Txt>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};

export const COIoCues: Cue[] = probCues(IO, [[80, 'tick'], [150, 'tick'], [220, 'error'], [560, 'tick'], [630, 'tick'], [700, 'blip', 84], [980, 'whoosh']]);

export const _u = [Cell, along, lerp];
