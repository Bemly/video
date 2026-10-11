import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FONT } from "../theme";

/** 显式字幕（烧录）：底边颜色区分说话人 + 白字黑描边。 */
export const Subtitle: React.FC<{ color: string; text: string; frames: number }> = ({ color, text, frames }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 5, frames - 4, frames], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(f, [0, 6], [14, 0], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: 300,
        right: 300,
        bottom: 36,
        display: "flex",
        justifyContent: "center",
        opacity: o,
        transform: `translateY(${y}px)`,
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontSize: 46,
          lineHeight: 1.35,
          fontWeight: 800,
          color: "#fff",
          textAlign: "center",
          padding: "12px 30px",
          borderRadius: 18,
          background: "rgba(5,10,22,0.72)",
          borderBottom: `6px solid ${color}`,
          WebkitTextStroke: "6px #000",
          paintOrder: "stroke fill",
          textShadow: "0 3px 0 #000",
          maxWidth: 1320,
        }}
      >
        {text}
      </div>
    </div>
  );
};
