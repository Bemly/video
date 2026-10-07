import {Easing} from 'remotion';

export const FPS = 60;
export const W = 1920;
export const H = 1080;
export const BEAT = 30;
export const BAR = 120;

export const COL = {
  bg: '#02040a',
  ds: '#22d3ee',
  co: '#fbbf24',
  os: '#a78bfa',
  cn: '#34d399',
  intro: '#5b8cff',
  text: '#eef3ff',
  sub: '#9aa7c2',
  dim: '#4b5872',
  red: '#fb7185',
  green: '#4ade80',
  panel: 'rgba(10,16,30,0.72)',
};

export const FONT = {
  sans: '"Noto Sans SC", "PingFang SC", sans-serif',
  serif: '"Noto Serif SC", "Songti SC", serif',
  mono: '"JetBrains Mono", Menlo, monospace',
  display: 'Orbitron, "Noto Sans SC", sans-serif',
  tech: 'Rajdhani, "Noto Sans SC", sans-serif',
  hero: 'Unbounded, Orbitron, sans-serif',
};

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const eOut = Easing.bezier(0.16, 1, 0.3, 1);
export const eInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const eIn = Easing.bezier(0.7, 0, 0.84, 0);
export const eBack = Easing.bezier(0.34, 1.56, 0.64, 1);
export const eSoft = Easing.bezier(0.33, 1, 0.68, 1);

export const prog = (f: number, start: number, dur: number, e: (t: number) => number = eOut) =>
  e(clamp01((f - start) / dur));

export const rnd = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
};

export const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

export const mixHex = (a: string, b: string, t: number) => {
  const na = parseInt(a.replace('#', ''), 16);
  const nb = parseInt(b.replace('#', ''), 16);
  const c = (s: number) => Math.round(lerp((na >> s) & 255, (nb >> s) & 255, t));
  return `#${((1 << 24) | (c(16) << 16) | (c(8) << 8) | c(0)).toString(16).slice(1)}`;
};

// piecewise-linear lookup over sorted keyframes
export const keyed = (f: number, keys: [number, number][], e: (t: number) => number = eInOut) => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [f0, v0] = keys[i];
    const [f1, v1] = keys[i + 1];
    if (f <= f1) return lerp(v0, v1, e((f - f0) / (f1 - f0)));
  }
  return keys[keys.length - 1][1];
};
