import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT } from "../theme";

/** 在第 at 帧弹入的容器。 */
export const PopIn: React.FC<{ at: number; style?: React.CSSProperties; children: React.ReactNode; from?: "up" | "down" | "left" | "right" | "zoom" }> = ({ at, style, children, from = "up" }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - at, fps, config: { damping: 13, stiffness: 160 } });
  if (f < at) return null;
  const d = (1 - s) * 60;
  const t =
    from === "zoom" ? `scale(${0.4 + 0.6 * s})`
      : from === "up" ? `translateY(${d}px)`
      : from === "down" ? `translateY(${-d}px)`
      : from === "left" ? `translateX(${-d}px)` : `translateX(${d}px)`;
  return <div style={{ position: "absolute", ...style, opacity: Math.min(1, s * 1.4), transform: t }}>{children}</div>;
};

export const Card: React.FC<{ children: React.ReactNode; accent?: string; style?: React.CSSProperties; glow?: boolean }> = ({ children, accent = C.ice, style, glow }) => (
  <div
    style={{
      fontFamily: FONT, color: C.text, background: C.panel, borderRadius: 22,
      border: `3px solid ${accent}`, padding: "20px 28px",
      boxShadow: glow ? `0 0 40px ${accent}88, 0 20px 50px rgba(0,0,0,0.45)` : "0 20px 50px rgba(0,0,0,0.45)",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Chip: React.FC<{ children: React.ReactNode; color?: string; size?: number }> = ({ children, color = C.ice, size = 28 }) => (
  <span
    style={{
      display: "inline-block", fontFamily: FONT, fontWeight: 800, fontSize: size, color: "#0b1426",
      background: color, borderRadius: 999, padding: "6px 20px", margin: 6, border: "3px solid #0b1426",
    }}
  >
    {children}
  </span>
);

/** 大号描边标题字（综艺花字风）。 */
export const BigText: React.FC<{ children: React.ReactNode; size?: number; color?: string; stroke?: string; style?: React.CSSProperties }> = ({ children, size = 96, color = "#fff", stroke = "#0b1426", style }) => (
  <div
    style={{
      fontFamily: FONT, fontWeight: 900, fontSize: size, color, lineHeight: 1.15,
      WebkitTextStroke: `${Math.max(3, size / 22)}px ${stroke}`, paintOrder: "stroke fill",
      textShadow: `0 ${size / 14}px 0 ${stroke}`, ...style,
    }}
  >
    {children}
  </div>
);

/** 场景开头的标题卡（左上角常驻小标签 + 开头大横幅）。 */
export const SceneTitle: React.FC<{ title: string; index: number; total: number }> = ({ title, index, total }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 15 } });
  const banner = interpolate(f, [0, 8, 26, 34], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <div
        style={{
          position: "absolute", left: 40, top: 30, fontFamily: FONT, fontWeight: 800, fontSize: 28,
          color: "#0b1426", background: C.ice, padding: "8px 22px", borderRadius: 12,
          transform: `translateX(${(1 - s) * -400}px)`, border: "3px solid #0b1426",
        }}
      >
        {String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")} · {title}
      </div>
      <div
        style={{
          position: "absolute", left: 0, right: 0, top: 440, display: "flex", justifyContent: "center",
          opacity: banner, transform: `scale(${0.8 + 0.2 * banner})`, pointerEvents: "none",
        }}
      >
        <BigText size={92} color={C.gold}>{title}</BigText>
      </div>
    </>
  );
};

export const Logo: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <div style={{ position: "absolute", right: 40, top: 30, fontFamily: FONT, fontWeight: 900, fontSize: size, color: "#fff", display: "flex", alignItems: "center", gap: 10 }}>
    <span style={{ fontSize: size * 1.1 }}>❄️</span>
    <span>Winter<span style={{ color: C.ice }}>JS</span></span>
  </div>
);
