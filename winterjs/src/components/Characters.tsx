import React from "react";
import { Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { Who } from "../timeline";

type Props = { who: Who; speaking: boolean };

/** 角色立绘（作者指定图，抠图后裁半身）：说话的一方提亮、弹跳、微晃；另一方压暗。 */
export const Portrait: React.FC<Props> = ({ who, speaking }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: f, fps, config: { damping: 14 } });
  const bounce = speaking ? Math.abs(Math.sin(f / 4.5)) * 12 : Math.sin(f / 35) * 3;
  const wobble = speaking ? Math.sin(f / 7) * 1.5 : 0;
  const left = who === "whale";
  const h = 460;
  return (
    <div
      style={{
        position: "absolute",
        bottom: -8 - bounce,
        [left ? "left" : "right"]: -20,
        height: h,
        transform: `translateX(${(1 - enter) * (left ? -300 : 300)}px) rotate(${wobble}deg) scale(${speaking ? 1.04 : 0.97})`,
        transformOrigin: "50% 100%",
        filter: `brightness(${speaking ? 1 : 0.55}) drop-shadow(0 0 ${speaking ? 18 : 0}px ${left ? "rgba(124,200,255,0.8)" : "rgba(255,179,71,0.8)"})`,
      }}
    >
      <Img src={staticFile(`cast/${who}.webp`)} style={{ height: h }} />
    </div>
  );
};
