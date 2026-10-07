import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {clamp01, COL, eBack, eOut, FONT, keyed, lerp, prog, rgba} from '../theme';
import {useF, useShot} from './Shot';

/* ---------- SVG helpers ---------- */

export const GlowDefs: React.FC = () => (
  <defs>
    <filter id="g-s" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="g-m" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="7" result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="g-l" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="16" result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
);

export type Pt = [number, number];

export const bez = (p0: Pt, c1: Pt, c2: Pt, p1: Pt, n = 28): Pt[] => {
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    out.push([
      u * u * u * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p1[0],
      u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p1[1],
    ]);
  }
  return out;
};

const segLens = (pts: Pt[]) => {
  const L = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return L;
};

/** point + tangent angle at arc-length fraction t */
export const along = (pts: Pt[], t: number): {p: Pt; a: number} => {
  const L = segLens(pts);
  const total = L[L.length - 1] || 1;
  const d = clamp01(t) * total;
  for (let i = 1; i < pts.length; i++) {
    if (d <= L[i] || i === pts.length - 1) {
      const s = (d - L[i - 1]) / (L[i] - L[i - 1] || 1);
      const p: Pt = [lerp(pts[i - 1][0], pts[i][0], s), lerp(pts[i - 1][1], pts[i][1], s)];
      return {p, a: Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0])};
    }
  }
  return {p: pts[0], a: 0};
};

/** partial polyline path (from t0 to t1 along arc length) */
export const partial = (pts: Pt[], t1: number, t0 = 0) => {
  const L = segLens(pts);
  const total = L[L.length - 1] || 1;
  const d0 = clamp01(t0) * total;
  const d1 = clamp01(t1) * total;
  if (d1 <= d0) return '';
  const out: Pt[] = [along(pts, t0).p];
  for (let i = 1; i < pts.length - 1; i++) if (L[i] > d0 && L[i] < d1) out.push(pts[i]);
  out.push(along(pts, t1).p);
  return 'M' + out.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' L');
};

export const Arrow: React.FC<{
  pts: Pt[];
  t: number;
  color: string;
  w?: number;
  head?: number;
  dash?: string;
  dashOffset?: number;
  glow?: boolean;
  opacity?: number;
}> = ({pts, t, color, w = 3, head = 14, dash, dashOffset, glow = true, opacity = 1}) => {
  if (t <= 0.001) return null;
  const d = partial(pts, t);
  const {p, a} = along(pts, t);
  const hx = (ang: number) => [p[0] + Math.cos(ang) * head, p[1] + Math.sin(ang) * head];
  const l = hx(a + Math.PI - 0.45);
  const r = hx(a + Math.PI + 0.45);
  return (
    <g opacity={opacity} filter={glow ? 'url(#g-s)' : undefined}>
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeDasharray={dash} strokeDashoffset={dashOffset} />
      <path d={`M${l[0]},${l[1]} L${p[0]},${p[1]} L${r[0]},${r[1]}`} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

/* ---------- Caption (bottom-left lower third) ---------- */

export const Caption: React.FC<{
  title: string;
  en?: string;
  desc?: string;
  chip?: string;
  color: string;
  delay?: number;
}> = ({title, en, desc, chip, color, delay = 18}) => {
  const f = useF();
  const {mini} = useShot();
  if (mini) return null;
  const a = prog(f, delay, 30);
  const b = prog(f, delay + 8, 34);
  const c = prog(f, delay + 16, 34);
  return (
    <div style={{position: 'absolute', left: 104, bottom: 78, display: 'flex', alignItems: 'stretch', gap: 26}}>
      <div
        style={{
          width: 6,
          height: 128 * a,
          alignSelf: 'flex-end',
          background: color,
          boxShadow: `0 0 18px ${rgba(color, 0.9)}`,
          borderRadius: 3,
        }}
      />
      <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 6}}>
        <div style={{overflow: 'hidden', display: 'flex', alignItems: 'baseline', gap: 22}}>
          <span
            style={{
              fontFamily: FONT.sans,
              fontWeight: 800,
              fontSize: 54,
              color: COL.text,
              transform: `translateY(${(1 - b) * 70}px)`,
              display: 'inline-block',
              textShadow: `0 0 24px ${rgba(color, 0.55)}`,
            }}
          >
            {title}
          </span>
          {en && (
            <span
              style={{
                fontFamily: FONT.tech,
                fontWeight: 600,
                fontSize: 24,
                letterSpacing: '0.28em',
                color,
                opacity: b,
                transform: `translateY(${(1 - b) * 40}px)`,
                display: 'inline-block',
              }}
            >
              {en}
            </span>
          )}
          {chip && (
            <span
              style={{
                fontFamily: FONT.mono,
                fontSize: 22,
                color,
                border: `1.5px solid ${rgba(color, 0.7)}`,
                borderRadius: 8,
                padding: '2px 12px',
                opacity: c,
                background: rgba(color, 0.08),
              }}
            >
              {chip}
            </span>
          )}
        </div>
        {desc && (
          <div
            style={{
              fontFamily: FONT.sans,
              fontSize: 26,
              fontWeight: 400,
              color: COL.sub,
              opacity: c,
              transform: `translateX(${(1 - c) * -30}px)`,
              letterSpacing: '0.04em',
            }}
          >
            {desc}
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------- global act HUD ---------- */

export const ACTS = [
  {s: 960, e: 2760, num: '01', name: '数据结构', en: 'DATA STRUCTURE', c: COL.ds, score: 45},
  {s: 2760, e: 4560, num: '02', name: '计算机组成原理', en: 'COMPUTER ORGANIZATION', c: COL.co, score: 45},
  {s: 4560, e: 6360, num: '03', name: '操作系统', en: 'OPERATING SYSTEM', c: COL.os, score: 35},
  {s: 6360, e: 8160, num: '04', name: '计算机网络', en: 'COMPUTER NETWORK', c: COL.cn, score: 25},
];

export const ActHUD: React.FC = () => {
  const f = useCurrentFrame();
  const i = ACTS.findIndex((a) => f >= a.s && f < a.e + 30);
  if (i < 0) return null;
  const act = ACTS[i];
  const vis = keyed(f, [
    [act.s + 225, 0],
    [act.s + 260, 1],
    [act.e - 8, 1],
    [act.e + 10, 0],
  ]);
  if (vis <= 0) return null;
  const inner = (f - act.s) / (act.e - act.s);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity: vis}}>
      <div style={{position: 'absolute', left: 104, top: 58, display: 'flex', alignItems: 'center', gap: 18}}>
        <div
          style={{
            width: 14,
            height: 14,
            background: act.c,
            transform: `rotate(${45 + f * 0.8}deg)`,
            boxShadow: `0 0 14px ${act.c}`,
          }}
        />
        <span style={{fontFamily: FONT.display, fontSize: 18, letterSpacing: '0.35em', color: act.c}}>PART {act.num}</span>
        <span style={{width: 1.5, height: 22, background: rgba('#ffffff', 0.35)}} />
        <span style={{fontFamily: FONT.sans, fontSize: 24, fontWeight: 600, color: COL.text, letterSpacing: '0.12em'}}>{act.name}</span>
        <span style={{fontFamily: FONT.tech, fontSize: 18, letterSpacing: '0.3em', color: COL.sub}}>{act.en}</span>
      </div>
      <div style={{position: 'absolute', right: 104, top: 52, display: 'flex', alignItems: 'center', gap: 18}}>
        <div style={{display: 'flex', gap: 8}}>
          {ACTS.map((a, j) => (
            <div key={j} style={{width: 74, height: 5, borderRadius: 3, background: rgba('#ffffff', 0.12), overflow: 'hidden'}}>
              <div
                style={{
                  width: `${(j < i ? 1 : j === i ? clamp01(inner) : 0) * 100}%`,
                  height: '100%',
                  background: j === i ? a.c : rgba(a.c, 0.6),
                  boxShadow: j === i ? `0 0 10px ${a.c}` : undefined,
                }}
              />
            </div>
          ))}
        </div>
        <span style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 26, color: COL.text, letterSpacing: '0.1em'}}>408</span>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- misc ---------- */

export const Pop: React.FC<{f: number; at: number; dur?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  f,
  at,
  dur = 22,
  children,
  style,
}) => {
  const t = clamp01((f - at) / dur);
  const s = eBack(t);
  return (
    <div style={{...style, opacity: clamp01(t * 2), transform: `${style?.transform ?? ''} scale(${lerp(0.6, 1, s)})`}}>{children}</div>
  );
};

/** slow camera push used by most scenes */
export const Cam: React.FC<{children: React.ReactNode; from?: number; to?: number; ox?: number; oy?: number}> = ({
  children,
  from = 1,
  to = 1.05,
  ox = 960,
  oy = 540,
}) => {
  const f = useF();
  const {dur} = useShot();
  const t = clamp01(f / dur);
  const s = lerp(from, to, eOut(t) * 0.35 + t * 0.65);
  return <AbsoluteFill style={{transform: `scale(${s})`, transformOrigin: `${ox}px ${oy}px`}}>{children}</AbsoluteFill>;
};

export const Typed: React.FC<{text: string; f: number; at: number; cps?: number; cursor?: boolean; style?: React.CSSProperties}> = ({
  text,
  f,
  at,
  cps = 0.6,
  cursor = false,
  style,
}) => {
  const n = Math.max(0, Math.min(text.length, Math.floor((f - at) * cps)));
  const blink = Math.floor(f / 15) % 2 === 0;
  return (
    <span style={style}>
      {text.slice(0, n)}
      {cursor && <span style={{opacity: blink || n < text.length ? 1 : 0}}>▌</span>}
    </span>
  );
};

export {eOut};
