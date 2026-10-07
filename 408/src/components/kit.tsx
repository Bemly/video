import React from 'react';
import {clamp01, COL, eBack, FONT, lerp, rgba} from '../theme';
import {Arrow, bez, Pt} from './ui';

/** index of the last start <= f (or -1) and local progress */
export const stepAt = (f: number, starts: number[]) => {
  let i = -1;
  for (let k = 0; k < starts.length; k++) if (f >= starts[k]) i = k;
  return i;
};

export const popIn = (f: number, at: number, dur = 20) => eBack(clamp01((f - at) / dur));

export const Txt: React.FC<{
  x: number;
  y: number;
  children: React.ReactNode;
  size?: number;
  color?: string;
  anchor?: 'start' | 'middle' | 'end';
  weight?: number;
  family?: string;
  opacity?: number;
  glow?: boolean;
  ls?: number;
}> = ({x, y, children, size = 26, color = '#fff', anchor = 'middle', weight = 600, family = FONT.sans, opacity = 1, glow, ls}) => (
  <text
    x={x}
    y={y}
    textAnchor={anchor}
    fontFamily={family}
    fontWeight={weight}
    fontSize={size}
    fill={color}
    opacity={opacity}
    filter={glow ? 'url(#g-s)' : undefined}
    letterSpacing={ls}
    dominantBaseline="middle"
  >
    {children}
  </text>
);

export const GNode: React.FC<{
  x: number;
  y: number;
  r?: number;
  label?: React.ReactNode;
  color: string;
  fill?: number;
  scale?: number;
  opacity?: number;
  size?: number;
  ring?: number;
  sub?: React.ReactNode;
  subColor?: string;
  dark?: boolean;
}> = ({x, y, r = 32, label, color, fill = 0, scale = 1, opacity = 1, size, ring = 0, sub, subColor, dark}) => {
  if (scale <= 0.001 || opacity <= 0.001) return null;
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`} opacity={opacity}>
      {ring > 0 && ring < 1 && <circle r={r + ring * 36} fill="none" stroke={color} strokeWidth={3} opacity={1 - ring} />}
      <circle r={r} fill={fill > 0 ? rgba(color, 0.2 + fill * 0.7) : dark ? '#050a14' : 'rgba(8,14,26,0.92)'} stroke={color} strokeWidth={3} filter="url(#g-m)" />
      {label !== undefined && (
        <text
          y={1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily={FONT.tech}
          fontWeight={700}
          fontSize={size ?? r * 0.95}
          fill={fill > 0.5 ? '#04101a' : '#fff'}
        >
          {label}
        </text>
      )}
      {sub !== undefined && (
        <text y={r + 24} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT.mono} fontSize={20} fill={subColor ?? COL.sub}>
          {sub}
        </text>
      )}
    </g>
  );
};

export const edgePts = (a: Pt, b: Pt, ra = 32, rb = 32, curve = 0): Pt[] => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const L = Math.hypot(dx, dy) || 1;
  const ux = dx / L;
  const uy = dy / L;
  if (!curve) return [[a[0] + ux * ra, a[1] + uy * ra], [b[0] - ux * rb, b[1] - uy * rb]];
  const nx = -uy;
  const ny = ux;
  const mx = (a[0] + b[0]) / 2 + nx * curve * L;
  const my = (a[1] + b[1]) / 2 + ny * curve * L;
  const s: Pt = [a[0] + ux * ra, a[1] + uy * ra];
  const e: Pt = [b[0] - ux * rb, b[1] - uy * rb];
  return bez(s, [lerp(s[0], mx, 0.66), lerp(s[1], my, 0.66)], [lerp(e[0], mx, 0.66), lerp(e[1], my, 0.66)], e, 24);
};

export const GEdge: React.FC<{
  a: Pt;
  b: Pt;
  t?: number;
  color: string;
  w?: number;
  dir?: boolean;
  ra?: number;
  rb?: number;
  curve?: number;
  label?: React.ReactNode;
  labelOpacity?: number;
  glow?: boolean;
  dash?: string;
  opacity?: number;
}> = ({a, b, t = 1, color, w = 3, dir = false, ra = 32, rb = 32, curve = 0, label, labelOpacity = 1, glow = false, dash, opacity = 1}) => {
  const pts = edgePts(a, b, ra, rb, curve);
  const mid = pts[Math.floor(pts.length / 2)];
  const m: Pt = pts.length === 2 ? [(pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2] : mid;
  return (
    <g opacity={opacity}>
      <Arrow pts={pts} t={t} color={color} w={w} head={dir ? 14 : 0.01} glow={glow} dash={dash} />
      {label !== undefined && t > 0.6 && (
        <g opacity={labelOpacity * clamp01((t - 0.6) / 0.4)}>
          <rect x={m[0] - 18} y={m[1] - 16} width={36} height={30} rx={8} fill="#08121c" stroke={rgba('#8fb3c9', 0.35)} />
          <text x={m[0]} y={m[1] + 1} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT.mono} fontSize={20} fill={COL.sub}>
            {label}
          </text>
        </g>
      )}
    </g>
  );
};

export const Cell: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  text?: React.ReactNode;
  color: string;
  fill?: number;
  size?: number;
  textColor?: string;
  opacity?: number;
  scale?: number;
  glow?: boolean;
  sub?: React.ReactNode;
  family?: string;
  dim?: boolean;
  rx?: number;
}> = ({x, y, w = 70, h = 70, text, color, fill = 0, size, textColor, opacity = 1, scale = 1, glow, sub, family = FONT.tech, dim, rx = 10}) => {
  if (opacity <= 0.001) return null;
  return (
    <g transform={`translate(${x + w / 2},${y + h / 2}) scale(${scale})`} opacity={opacity}>
      <rect
        x={-w / 2}
        y={-h / 2}
        width={w}
        height={h}
        rx={rx}
        fill={fill > 0 ? rgba(color, 0.15 + fill * 0.7) : 'rgba(8,14,26,0.88)'}
        stroke={dim ? rgba(color, 0.3) : color}
        strokeWidth={2}
        filter={glow ? 'url(#g-m)' : undefined}
      />
      {text !== undefined && (
        <text
          y={2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily={family}
          fontWeight={700}
          fontSize={size ?? Math.min(w, h) * 0.46}
          fill={textColor ?? (fill > 0.55 ? '#04101a' : dim ? COL.dim : '#fff')}
        >
          {text}
        </text>
      )}
      {sub !== undefined && (
        <text y={h / 2 + 22} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT.mono} fontSize={18} fill={COL.dim}>
          {sub}
        </text>
      )}
    </g>
  );
};

export const Glass: React.FC<{
  x: number;
  y: number;
  w?: number;
  color: string;
  children: React.ReactNode;
  opacity?: number;
  style?: React.CSSProperties;
}> = ({x, y, w, color, children, opacity = 1, style}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      padding: '16px 24px',
      borderRadius: 16,
      background: 'rgba(8,13,26,0.8)',
      border: `1px solid ${rgba(color, 0.38)}`,
      boxShadow: `0 20px 50px rgba(0,0,0,0.45), 0 0 26px ${rgba(color, 0.1)}`,
      opacity,
      fontFamily: FONT.mono,
      fontSize: 26,
      color: '#fff',
      lineHeight: '44px',
      ...style,
    }}
  >
    {children}
  </div>
);

export const Hi: React.FC<{c: string; children: React.ReactNode; b?: boolean}> = ({c, children, b = true}) => (
  <span style={{color: c, fontWeight: b ? 700 : undefined}}>{children}</span>
);

/** pulse travelling along a polyline */
export const Comet: React.FC<{pts: Pt[]; t: number; color?: string; r?: number}> = ({pts, t, color = '#fff', r = 11}) => {
  if (t <= 0 || t >= 1) return null;
  const L: number[] = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const d = t * L[L.length - 1];
  let i = 1;
  while (i < pts.length - 1 && L[i] < d) i++;
  const s = (d - L[i - 1]) / (L[i] - L[i - 1] || 1);
  const x = lerp(pts[i - 1][0], pts[i][0], s);
  const y = lerp(pts[i - 1][1], pts[i][1], s);
  return <circle cx={x} cy={y} r={r} fill={color} filter="url(#g-l)" />;
};
