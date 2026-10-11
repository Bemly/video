import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { C, H, W } from "../theme";

const FLAKES = Array.from({ length: 70 }, (_, i) => ({
  x: random(`x${i}`) * W,
  y0: random(`y${i}`) * H,
  r: 1.5 + random(`r${i}`) * 3.5,
  v: 0.6 + random(`v${i}`) * 1.6,
  sway: 10 + random(`s${i}`) * 30,
  phase: random(`p${i}`) * Math.PI * 2,
  o: 0.25 + random(`o${i}`) * 0.55,
}));

/** 深蓝夜空 + 飘雪 + 网格，全片常驻。 */
export const Background: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 0%, ${C.bg1} 0%, ${C.bg0} 70%)` }}>
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(124,200,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(124,200,255,0.05) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          backgroundPosition: `0 ${(f * 0.4) % 64}px`,
        }}
      />
      <svg width={W} height={H} style={{ position: "absolute" }}>
        {FLAKES.map((k, i) => {
          const y = (k.y0 + f * k.v) % (H + 20) - 10;
          const x = k.x + Math.sin(f / 40 + k.phase) * k.sway;
          return <circle key={i} cx={x} cy={y} r={k.r} fill="#fff" opacity={k.o} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
