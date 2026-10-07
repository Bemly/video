import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {AbsoluteFill} from 'remotion';
import {useF} from '../components/Shot';
import {clamp01, COL, eBack, eInOut, eOut, FONT, keyed, lerp, prog, rgba, rnd} from '../theme';

const Z = 3200;
const FOV = 760;
const N_EXTRA = 900;
const BURST = 240;
const CONV = 730;

const speedAt = (g: number) =>
  keyed(
    g,
    [
      [BURST, 2],
      [420, 7],
      [560, 16],
      [690, 82],
      [735, 3],
      [960, 1.5],
    ],
    (t) => t,
  );

const ZC: number[] = (() => {
  const arr: number[] = new Array(1100).fill(0);
  for (let g = 1; g < 1100; g++) arr[g] = arr[g - 1] + (g > BURST ? speedAt(g) : 0);
  return arr;
})();

const PALETTE = ['#d6e4ff', '#d6e4ff', '#b8ccff', '#d6e4ff', '#9fb6ff', '#d6e4ff', COL.ds, COL.co, COL.os, COL.cn];

type Tgt = {pts: [number, number][]; baseline: number; size: number};
let TARGET_CACHE: Tgt | null = null;

const getTargets = (): Tgt | null => {
  if (TARGET_CACHE) return TARGET_CACHE;
  if (typeof document === 'undefined' || !document.fonts.check('900 300px Unbounded')) return null;
  const c = document.createElement('canvas');
  c.width = 1920;
  c.height = 1080;
  const ctx = c.getContext('2d')!;
  ctx.font = '900 300px Unbounded';
  const size = Math.round((300 * 1180) / ctx.measureText('408').width);
  ctx.font = `900 ${size}px Unbounded`;
  ctx.textAlign = 'center';
  const m = ctx.measureText('408');
  const baseline = 455 + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
  ctx.fillStyle = '#fff';
  ctx.fillText('408', 960, baseline);
  const data = ctx.getImageData(0, 0, 1920, 1080).data;
  const pts: [number, number][] = [];
  const step = 8;
  for (let y = 0; y < 1080; y += step)
    for (let x = 0; x < 1920; x += step) if (data[(y * 1920 + x) * 4 + 3] > 140) pts.push([x, y]);
  // deterministic shuffle
  for (let i = pts.length - 1; i > 0; i--) {
    const j = Math.floor(rnd(i * 1.7 + 3) * (i + 1));
    [pts[i], pts[j]] = [pts[j], pts[i]];
  }
  TARGET_CACHE = {pts, baseline, size};
  return TARGET_CACHE;
};

type P = {x: number; y: number; z: number; sx: number; sy: number; ch: string; col: string; st: number};

const makeParticles = (n: number): P[] =>
  new Array(n).fill(0).map((_, i) => ({
    x: (rnd(i * 1.13) - 0.5) * 3600,
    y: (rnd(i * 2.71) - 0.5) * 2000,
    z: rnd(i * 3.97) * Z,
    sx: 700 + rnd(i * 5.3) * 520,
    sy: 515 + rnd(i * 6.1) * 50,
    ch: rnd(i * 8.8) < 0.5 ? '0' : '1',
    col: PALETTE[Math.floor(rnd(i * 4.4) * PALETTE.length)],
    st: rnd(i * 9.9) * 55,
  }));

const project = (p: P, g: number) => {
  const d = ((((p.z - ZC[Math.max(0, Math.min(1099, Math.floor(g)))]) % Z) + Z) % Z) + 30;
  const s = FOV / d;
  const alpha = clamp01((Z - d) / 900) * clamp01((d - 30) / 160);
  return {x: 960 + p.x * s, y: 540 + p.y * s, s, d, alpha};
};

const draw = (cv: HTMLCanvasElement, f: number, parts: P[]) => {
  const ctx = cv.getContext('2d')!;
  ctx.clearRect(0, 0, 1920, 1080);
  if (f < BURST) return;
  const tg = getTargets();
  const nT = tg ? tg.pts.length : 0;
  const burstT = clamp01((f - BURST) / 80);
  const speed = speedAt(f);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // solid 408 behind the glyphs
  if (tg && f > 850) {
    const a = prog(f, 850, 50);
    const sweep = lerp(-0.3, 1.3, clamp01((f - 875) / 60));
    const grad = ctx.createLinearGradient(420, 250, 1500, 680);
    const base = '#c9dcff';
    grad.addColorStop(0, base);
    grad.addColorStop(clamp01(sweep - 0.12), base);
    grad.addColorStop(clamp01(sweep), '#ffffff');
    grad.addColorStop(clamp01(sweep + 0.12), '#8fb0ff');
    grad.addColorStop(1, '#8fb0ff');
    ctx.save();
    ctx.globalAlpha = a;
    ctx.font = `900 ${tg.size}px Unbounded`;
    ctx.textBaseline = 'alphabetic';
    ctx.shadowColor = 'rgba(110,160,255,0.9)';
    ctx.shadowBlur = 60;
    ctx.fillStyle = grad;
    ctx.fillText('408', 960, tg.baseline);
    ctx.shadowBlur = 0;
    ctx.restore();
    ctx.textBaseline = 'middle';
  }

  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    const hasT = i < nT;
    const own = hasT ? Math.min(f, CONV + p.st) : f;
    const pr = project(p, own);
    let x = pr.x;
    let y = pr.y;
    let size = Math.max(2, Math.min(90, 24 * pr.s));
    let alpha = pr.alpha * 0.95;
    // initial burst from the terminal text
    if (burstT < 1) {
      const e = eOut(clamp01((f - BURST - p.st * 0.3) / 70));
      x = lerp(p.sx, x, e);
      y = lerp(p.sy, y, e);
      size = lerp(20, size, e);
      alpha = lerp(0.9, alpha, e);
    }
    let ch = p.ch;
    let col = p.col;
    if (f >= CONV) {
      if (hasT) {
        const t = eInOut(clamp01((f - CONV - p.st) / 88));
        const [tx, ty] = tg!.pts[i];
        x = lerp(x, tx, t);
        y = lerp(y, ty, t);
        size = lerp(size, 10.5, t);
        alpha = lerp(alpha, f > 860 ? lerp(0.95, 0.55, prog(f, 860, 60)) : 0.95, t);
        if (t >= 1) {
          x += Math.sin(f / 9 + i) * 0.6;
          if ((i * 7 + Math.floor(f / 5)) % 17 === 0) ch = ch === '0' ? '1' : '0';
        }
        col = t > 0.5 ? (i % 5 === 0 ? col : '#dbe7ff') : col;
      } else {
        alpha *= 1 - clamp01((f - CONV) / 70);
      }
    }
    if (alpha < 0.02) continue;
    ctx.globalAlpha = alpha;
    // warp streaks
    if (speed > 10 && (f < CONV || !hasT || f < CONV + p.st)) {
      const d2 = pr.d + speed * 3.2;
      const s2 = FOV / d2;
      const x2 = 960 + p.x * s2;
      const y2 = 540 + p.y * s2;
      ctx.strokeStyle = col;
      ctx.lineWidth = Math.max(1, size * 0.14);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.fillStyle = col;
    ctx.font = `600 ${size.toFixed(1)}px "JetBrains Mono"`;
    ctx.fillText(ch, x, y);
  }
  ctx.globalAlpha = 1;
};

export const Intro: React.FC = () => {
  const f = useF();
  const ref = useRef<HTMLCanvasElement>(null);
  const parts = useMemo(() => makeParticles(3000 + N_EXTRA), []);
  useLayoutEffect(() => {
    if (ref.current) draw(ref.current, f, parts);
  }, [f, parts]);

  const typed = '> hello, 408';
  const n = Math.max(0, Math.min(typed.length, Math.floor((f - 60) / 10)));
  const blink = Math.floor(f / 18) % 2 === 0;
  const termA = f < BURST ? 1 : 1 - clamp01((f - BURST) / 12);
  const flash = keyed(f, [
    [222, 0],
    [236, 1],
    [256, 0],
  ]);

  const words: [string, string, string][] = [
    ['算法', 'ALGORITHM', COL.ds],
    ['机器', 'MACHINE', COL.co],
    ['系统', 'SYSTEM', COL.os],
    ['网络', 'NETWORK', COL.cn],
  ];
  const wordsOut = 1 - prog(f, 640, 40);
  const tagIn = (i: number) => clamp01((f - 900 - i * 9) / 22);

  return (
    <AbsoluteFill>
      <canvas ref={ref} width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}} />
      {/* terminal line */}
      {termA > 0 && (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: termA}}>
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 72,
              fontWeight: 500,
              color: lerp(0, 1, flash) > 0.5 ? '#ffffff' : '#cfe0ff',
              textShadow: `0 0 ${20 + flash * 60}px rgba(120,170,255,${0.6 + flash * 0.4})`,
              whiteSpace: 'pre',
              transform: `scale(${1 + flash * 0.06})`,
            }}
          >
            {typed.slice(0, n)}
            <span style={{opacity: blink ? 1 : 0, color: '#7aa2ff'}}>▌</span>
          </div>
        </AbsoluteFill>
      )}
      {/* caption 1 */}
      {f > 280 && f < 470 && (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
          <div
            style={{
              fontFamily: FONT.serif,
              fontWeight: 700,
              fontSize: 76,
              color: '#fff',
              letterSpacing: `${lerp(0.8, 0.32, prog(f, 290, 150))}em`,
              opacity: prog(f, 290, 40) * (1 - prog(f, 420, 40)),
              filter: `blur(${(1 - prog(f, 290, 40)) * 12 + prog(f, 420, 40) * 12}px)`,
              textShadow: '0 0 40px rgba(120,170,255,0.8)',
            }}
          >
            从一个比特开始
          </div>
        </AbsoluteFill>
      )}
      {/* caption 2 */}
      {f > 470 && f < 700 && (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: wordsOut, transform: `scale(${1 + prog(f, 640, 50) * 0.4})`}}>
          <div style={{display: 'flex', gap: 70}}>
            {words.map(([zh, en, c], i) => {
              const a = clamp01((f - 480 - i * 30) / 22);
              const s = eBack(a);
              return (
                <div key={i} style={{textAlign: 'center', opacity: clamp01(a * 2), transform: `translateY(${(1 - s) * 50}px) scale(${lerp(1.5, 1, s)})`}}>
                  <div style={{fontFamily: FONT.serif, fontWeight: 900, fontSize: 96, color: '#fff', textShadow: `0 0 30px ${c}, 0 0 70px ${rgba(c, 0.6)}`}}>
                    {zh}
                  </div>
                  <div style={{fontFamily: FONT.display, fontSize: 20, letterSpacing: '0.4em', color: c, marginTop: 6}}>{en}</div>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      )}
      {/* subtitle under 408 */}
      {f > 880 && (
        <AbsoluteFill>
          <div
            style={{
              position: 'absolute',
              top: 668,
              width: 1920,
              textAlign: 'center',
              fontFamily: FONT.sans,
              fontSize: 26,
              letterSpacing: '0.6em',
              color: COL.sub,
              opacity: prog(f, 880, 30),
            }}
          >
            全国硕士研究生招生考试
          </div>
          <div
            style={{
              position: 'absolute',
              top: 712,
              width: 1920,
              textAlign: 'center',
              fontFamily: FONT.serif,
              fontWeight: 800,
              fontSize: 60,
              letterSpacing: `${lerp(0.7, 0.3, prog(f, 886, 50))}em`,
              color: '#fff',
              opacity: prog(f, 886, 30),
              textShadow: '0 0 30px rgba(120,170,255,0.7)',
            }}
          >
            计算机学科专业基础
          </div>
          <div style={{position: 'absolute', top: 840, width: 1920, display: 'flex', justifyContent: 'center', gap: 22}}>
            {[
              ['数据结构', COL.ds],
              ['计算机组成原理', COL.co],
              ['操作系统', COL.os],
              ['计算机网络', COL.cn],
            ].map(([t, c], i) => (
              <span
                key={i}
                style={{
                  fontFamily: FONT.sans,
                  fontSize: 28,
                  fontWeight: 600,
                  color: '#fff',
                  padding: '8px 24px',
                  borderRadius: 999,
                  border: `1.5px solid ${c}`,
                  background: rgba(c as string, 0.14),
                  boxShadow: `0 0 20px ${rgba(c as string, 0.45)}`,
                  opacity: tagIn(i),
                  transform: `translateY(${(1 - eBack(tagIn(i))) * 30}px)`,
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
