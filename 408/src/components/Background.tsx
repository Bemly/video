import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {clamp01, COL, keyed, mixHex, rgba, rnd} from '../theme';

const STOPS: [number, string][] = [
  [0, COL.intro],
  [960, COL.ds],
  [2760, COL.co],
  [4560, COL.os],
  [6360, COL.cn],
  [8160, '#8ab4ff'],
];

export const accentAt = (f: number, stops: [number, string][] = STOPS) => {
  let c = stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    const [s, col] = stops[i];
    const t = clamp01((f - s + 4) / 44);
    if (t > 0) c = mixHex(c, col, t);
  }
  return c;
};

const DUST = new Array(90).fill(0).map((_, i) => ({
  x: rnd(i * 3.1) * 1920,
  y: rnd(i * 7.7) * 1080,
  s: 0.8 + rnd(i * 1.3) * 2.2,
  v: 0.15 + rnd(i * 5.9) * 0.5,
  ph: rnd(i * 9.2) * Math.PI * 2,
}));

export const Background: React.FC<{stops?: [number, string][]; total?: number}> = ({stops = STOPS, total = 9360}) => {
  const f = useCurrentFrame();
  const acc = accentAt(f, stops);
  const finStart = stops[stops.length - 1][0];
  const on = keyed(f, [
    [0, 0],
    [230, 0],
    [560, 1],
  ]);
  const fin = keyed(f, [
    [finStart - 20, 0],
    [finStart + 40, 1],
  ]);
  const end = keyed(f, [
    [total - 110, 1],
    [total, 0],
  ]);
  const k = on * end;
  const t = f / 60;
  const b1x = 560 + Math.sin(t * 0.21) * 220;
  const b1y = 420 + Math.cos(t * 0.17) * 140;
  const b2x = 1380 + Math.cos(t * 0.19) * 240;
  const b2y = 640 + Math.sin(t * 0.23) * 160;
  const second = mixHex(acc, '#3b5bff', 0.55);

  return (
    <AbsoluteFill style={{background: COL.bg, overflow: 'hidden'}}>
      <AbsoluteFill style={{opacity: k}}>
        <div
          style={{
            position: 'absolute',
            left: b1x - 900,
            top: b1y - 900,
            width: 1800,
            height: 1800,
            background: `radial-gradient(circle, ${rgba(acc, 0.2)} 0%, ${rgba(acc, 0.06)} 35%, transparent 62%)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: b2x - 1000,
            top: b2y - 1000,
            width: 2000,
            height: 2000,
            background: `radial-gradient(circle, ${rgba(second, 0.16)} 0%, ${rgba(second, 0.05)} 38%, transparent 64%)`,
          }}
        />
        {fin > 0 &&
          [COL.ds, COL.co, COL.os, COL.cn].map((c, i) => {
            const a = (i / 4) * Math.PI * 2 + t * 0.25;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: 960 + Math.cos(a) * 620 - 700,
                  top: 540 + Math.sin(a) * 300 - 700,
                  width: 1400,
                  height: 1400,
                  opacity: fin,
                  background: `radial-gradient(circle, ${rgba(c, 0.16)} 0%, transparent 58%)`,
                }}
              />
            );
          })}
        {/* dot grid */}
        <AbsoluteFill
          style={{
            backgroundImage: `radial-gradient(circle, ${rgba(acc, 0.28)} 1.2px, transparent 1.8px)`,
            backgroundSize: '48px 48px',
            backgroundPosition: `${(f * 0.12) % 48}px ${(f * 0.2) % 48}px`,
            WebkitMaskImage: 'radial-gradient(ellipse at 50% 45%, black 10%, transparent 72%)',
            opacity: 0.55,
          }}
        />
        {/* perspective floor */}
        <div
          style={{
            position: 'absolute',
            left: -1200,
            width: 4320,
            top: 700,
            height: 900,
            transform: 'perspective(600px) rotateX(74deg)',
            transformOrigin: '50% 0%',
            backgroundImage: `linear-gradient(${rgba(acc, 0.35)} 1.5px, transparent 1.5px), linear-gradient(90deg, ${rgba(acc, 0.35)} 1.5px, transparent 1.5px)`,
            backgroundSize: '90px 90px',
            backgroundPosition: `0px ${(f * 1.4) % 90}px`,
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 55%, transparent 100%)',
            opacity: 0.22,
          }}
        />
        {/* dust */}
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          {DUST.map((d, i) => {
            const y = (((d.y - f * d.v) % 1080) + 1080) % 1080;
            const x = d.x + Math.sin(f / 90 + d.ph) * 18;
            const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(f / 25 + d.ph));
            return <circle key={i} cx={x} cy={y} r={d.s} fill={i % 3 === 0 ? acc : '#dbe6ff'} opacity={tw * 0.55} />;
          })}
        </svg>
      </AbsoluteFill>
      {/* vignette */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(0,0,0,0.55) 85%, rgba(0,0,0,0.85) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};
